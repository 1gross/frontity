import React, { useEffect } from "react";
import { connect, css, useConnect } from "frontity";
import useInfiniteScroll from "./use-infinite-scroll";
import WpSource from "@frontity/wp-source/types";
import TinyRouter from "@frontity/tiny-router/types";

const Wrapper = connect(({ link, children }) => {
  const { state } = useConnect<WpSource & TinyRouter>();

  // Values from browser state.
  const links: string[] = state.router.state.links || [link];
  const limit: number = state.router.state.limit;
  const pages: string[] = state.router.state.pages || [];

  // Shortcuts to needed state.
  const current = state.source.get(link);
  const first = links[0];
  const items = pages.reduce((final, current, index) => {
    const data = state.source.get(current);
    if (data.isArchive && data.isReady) {
      const items =
        index !== 0
          ? data.items.filter(({ link }) => link !== first)
          : data.items;
      final = final.concat(items);
    }
    return final;
  }, []);
  const currentIndex = items.findIndex(({ link }) => link === current.link);
  const nextItem = items[currentIndex + 1];
  const last = state.source.get(links[links.length - 1]);
  const lastIndex = items.findIndex(({ link }) => link === last.link);
  const lastPage = state.source.get(pages[pages.length - 1]);

  // TODO:
  // Scenarios that need to be supported:
  // - the current element is not in the context array.
  // - the current element is in the context array.
  // - the current element is the last element in the context array.

  const hasReachedLimit = !!limit && links.length >= limit;
  const thereIsNext = lastIndex < items.length - 1 || !!lastPage.next;
  const isLimit = hasReachedLimit && thereIsNext;

  const { supported, fetchRef, routeRef } = useInfiniteScroll({
    currentLink: link,
    nextLink: nextItem?.link,
  });

  if (!current.isReady) return null;
  if (!supported) return children;

  const container = css`
    position: relative;
  `;

  const fetcher = css`
    position: absolute;
    width: 100%;
    bottom: 0;
  `;

  return (
    <div css={container} ref={routeRef}>
      {children}
      {!isLimit && <div css={fetcher} ref={fetchRef} />}
    </div>
  );
});

export interface Options {
  limit?: number;
  context?: string;
}

export default (options: Options = {}) => {
  const { state, actions } = useConnect<WpSource & TinyRouter>();

  // Values from/for browser state.
  const links: string[] = state.router.state.links || [state.router.link];
  const context: string = state.router.state.context || options.context;
  const pages: string[] = state.router.state.pages || [options.context];
  const limit = state.router.state.limit || options.limit;

  // Shortcuts to needed state.
  const current = state.source.get(state.router.link);
  const first = links[0];
  const last = state.source.get(links[links.length - 1]);
  const lastPage = state.source.get(pages[pages.length - 1]);
  const nextPage = lastPage.next && state.source.get(lastPage.next);
  const items = pages.reduce((final, current, index) => {
    const data = state.source.get(current);
    if (data.isArchive && data.isReady) {
      const items =
        index !== 0
          ? data.items.filter(({ link }) => link !== first)
          : data.items;
      final = final.concat(items);
    }
    return final;
  }, []);
  const lastIndex = items.findIndex(({ link }) => link === last.link);

  // Infinite scroll booleans.
  const isFetching = last.isFetching || lastPage.isFetching;
  const hasReachedLimit = !!limit && links.length >= limit;
  const thereIsNext = lastIndex < items.length - 1 || !!lastPage.next;
  const isLimit = hasReachedLimit && thereIsNext && !isFetching;

  // Initialize/update browser state.
  useEffect(() => {
    actions.router.set(current.link, {
      method: "replace",
      state: {
        links,
        context,
        pages,
        limit,
        ...state.router.state,
      },
    });
  }, []);

  // Request context if not present.
  useEffect(() => {
    const data = context ? state.source.get(context) : null;
    if (data && !data.isReady && !data.isFetching) {
      console.log("fetching context", context.link);
      actions.source.fetch(data.link);
    }
  }, []);

  // Request next context on last item.
  useEffect(() => {
    if (
      nextPage &&
      !hasReachedLimit &&
      items[items.length - 1]?.link === current.link
    ) {
      console.info("fetching page", nextPage.link);

      if (!nextPage?.isReady && !nextPage?.isFetching)
        actions.source.fetch(nextPage.link);

      if (pages.includes(nextPage.link)) return;

      pages.push(nextPage.link);

      actions.router.set(current.link, {
        method: "replace",
        state: {
          ...state.router.state,
          pages,
        },
      });
    }
  }, [current.link, items.length, hasReachedLimit]);

  // Increases the limit so more pages can be loaded.
  const increaseLimit = () => {
    actions.router.set(current.link, {
      method: "replace",
      state: {
        ...state.router.state,
        limit: state.router.state.limit ? state.router.state.limit + 1 : 1,
      },
    });
  };

  // Map every link to its DIY object.
  const posts = links.map((link) => ({
    key: link,
    link: link,
    isLastPost:
      link === last.link || (link === links[links.length - 2] && !last.isReady),
    Wrapper,
  }));

  // const isLimit = (() => {
  //   const limit = state.router.state.limit || options.limit;
  //   const { items, contexts } = pages.reduce(
  //     (final, current) => {
  //       const data = state.source.get(current);
  //       final.contexts.push(data);
  //       if (data.isArchive && data.isReady) {
  //         final.items = final.items.concat(data.items);
  //       }
  //       return final;
  //     },
  //     { items: [], contexts: [] }
  //   );
  //   console.log("items:", items);
  //   const currentIndex = items.findIndex(({ link }) => link === current.link);
  //   const nextItem = items[currentIndex + 1];
  //   const lastItem = items[items.length - 1];
  //   const lastContext = contexts[contexts.length - 1];

  //   const hasReachedLimit = !!limit && links.length >= limit;
  //   const isLastItem = !!lastItem && lastItem.link === last.link;

  //   return (
  //     hasReachedLimit &&
  //     ((!isLastItem && !nextItem.isFetching) ||
  //       (isLastItem && !lastContext.isFetching))
  //   );
  // })();

  return {
    posts,
    isLimit,
    isFetching,
    increaseLimit,
  };
};
