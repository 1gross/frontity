import { css, decode } from "frontity";
import { parse as himalaya } from "himalaya";
import { Element, Node, Parse, Attributes, AdaptNode } from "../../../types";
import htmlAttributes from "./attributes/html.json";
import svgAttributes from "./attributes/svg.json";

// Map of lowercased HTML and SVG attributes to get their camelCase version.
const attributesMap: Attributes = htmlAttributes
  .concat(svgAttributes)
  .reduce((map, value) => {
    map[value.toLowerCase()] = value;
    return map;
  }, {});

// Adapts the Himalaya AST Specification v1 to our format.
const adaptNode: AdaptNode = (himalayaNode, parent) => {
  let node: Node;

  if (himalayaNode.type === "element") {
    node = {
      type: himalayaNode.type,
      component: himalayaNode.tagName,
      props: himalayaNode.attributes.reduce(
        (props: Element["props"], { key, value }) => {
          if (key === "class") {
            props.className = value;
          } else if (key === "style") {
            // Add inline styles to the component with `emotion`.
            props.css = css(value);
          } else if (key === "href") {
            props.href = decode(value);
          } else if (key === "for") {
            props.for = value;
          } else if (!/^on/.test(key)) {
            const camelCaseKey = attributesMap[key.toLowerCase()];
            // Map keys with no value to `true` booleans.
            props[camelCaseKey || key] = value === null ? true : value;
          }

          return props;
        },
        {}
      )
    };

    node.children = himalayaNode.children.reduce(
      (tree: Node[], child): Node[] => {
        const childAdapted = adaptNode(child, node as Element);
        if (childAdapted) tree.push(childAdapted);
        return tree;
      },
      []
    );
  }

  if (himalayaNode.type === "text") {
    const content = decode(himalayaNode.content);

    if (content.trim().length) {
      node = {
        type: himalayaNode.type,
        content: content
      };
    } else return null;
  }

  if (himalayaNode.type === "comment") {
    const content = decode(himalayaNode.content);

    if (content.trim().length) {
      node = {
        type: himalayaNode.type,
        content: content
      };
    } else return null;
  }

  if (parent) node.parent = parent;

  return node;
};

const parse: Parse = html =>
  himalaya(html).reduce((tree: Node[], element) => {
    const adapted = adaptNode(element);
    if (adapted) tree.push(adapted);
    return tree;
  }, []);

export default parse;
