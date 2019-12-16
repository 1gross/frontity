import { URL } from "frontity";
import {
  HeadTags,
  HeadTag,
  State,
  PostTypeWithHeadTags,
  TaxonomyWithHeadTags
} from "../../types";

// Attributes that could contain links.
const possibleLink = ["href", "content"];

const deepTransform = (obj: object, func: Function, ...args: object[]) => {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = func(obj[key], ...args);
    } else if (typeof obj[key] === "object") {
      deepTransform(obj[key], func, ...args);
    }
  }
};

const getWpUrl = (api: string, isWpCom: boolean): URL => {
  const apiUrl = new URL(api);
  if (isWpCom) {
    const { pathname } = apiUrl;
    return new URL(pathname.replace(/^\/wp\/v2\/sites\//, "https://"));
  }
  // Get API subdirectory.
  const apiSubdir = apiUrl.pathname.replace(/\/wp-json\/?$/, "/");
  return new URL(apiSubdir, apiUrl);
};

const isWpPageLink = (value: string, wpUrl: URL) => {
  return (
    value.startsWith(wpUrl.toString()) &&
    !new RegExp(
      `^${
        wpUrl.pathname
      }(wp-(json|admin|content|includes))|feed|comments|xmlrpc`
    ).test(new URL(value).pathname)
  );
};

const getFrontityUrl = (value: string, wpUrl: URL, frontityUrl: string) => {
  const { pathname, search, hash } = new URL(value);
  const finalPathname = pathname
    .replace(new RegExp(`^${wpUrl.pathname}`), "/")
    .replace(/^\/$/, "");
  return `${frontityUrl.replace(/\/?$/, "")}${finalPathname}${search}${hash}`;
};

export const useFrontityLinks = ({
  state,
  headTags
}: {
  state: State;
  headTags: HeadTags;
}) => {
  // The site URL.
  const frontityUrl = state.frontity.url;

  // The WP URL.
  const { api, isWpCom } = state.source;
  const wpUrl = getWpUrl(api, isWpCom);

  // For each head tag...
  return headTags.map(({ tag, attributes, content }) => {
    // Init processed head tag.
    const processed: HeadTag = { tag };

    if (content) {
      // Transform URLs inside JSON content.
      if (
        attributes &&
        attributes.type &&
        attributes.type.endsWith("ld+json")
      ) {
        const json = JSON.parse(content);
        // iterate over json props.
        deepTransform(json, (value: string) => {
          if (isWpPageLink(value, wpUrl))
            return getFrontityUrl(value, wpUrl, frontityUrl);
          return value;
        });
        // Stringify json again.
        processed.content = JSON.stringify(json);
      } else {
        // Do not change content.
        processed.content = content;
      }
    }

    // Process Attributes.
    if (attributes) {
      processed.attributes = Object.entries(attributes)
        .map(([key, value]) => {
          // Change value if it's a WP blog link.
          if (possibleLink.includes(key) && isWpPageLink(value, wpUrl)) {
            value = getFrontityUrl(value, wpUrl, frontityUrl);
          }
          // Return the entry.
          return [key, value];
        })
        .reduce((result, [key, value]) => {
          result[key] = value;
          return result;
        }, {});
    }

    // Return processed head tag.
    return processed;
  });
};

// Get the entity related to the current link.
export const getCurrentEntity = ({
  state,
  link
}: {
  state: State;
  link: string;
}) => {
  const data = state.source.get(link);

  if (data.isPostType) {
    const { type, id } = data;
    return state.source[type][id] as PostTypeWithHeadTags;
  }

  if (data.isTaxonomy) {
    const { taxonomy, id } = data;
    return state.source[taxonomy][id] as TaxonomyWithHeadTags;
  }

  if (data.isAuthor) {
    const { id } = data;
    return state.source.author[id];
  }

  if (data.isPostTypeArchive) {
    const { type } = data;
    return state.source.type[type];
  }

  return null;
};

/**
 * Get the head tags stored in the current entity,
 * or an empty array if there is no entity or head tags.
 */
export const getCurrentHeadTags = ({
  state,
  link
}: {
  state: State;
  link: string;
}) => {
  const entity = getCurrentEntity({ state, link });
  const headTags = entity && entity.head_tags;

  // Changes those links that points to WordPress blog pages to Frontity links
  return headTags ? useFrontityLinks({ state, headTags }) : [];
};
