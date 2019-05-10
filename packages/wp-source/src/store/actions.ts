import { Action } from "../types";
import { normalizePath } from "./helpers";

export const fetch: Action<{
  path: string;
  page?: number;
  isPopulating?: boolean;
}> = async (ctx, { path, page, isPopulating }) => {
  const state = ctx.state.source;
  const effects = ctx.effects.source;

  // transform links to paths
  path = normalizePath(path)
  
  const data = state.data(path);

  // return if the data that it's about to be fetched already exists
  if (data && !page) return;
  if (data && page && data.isArchive && data.pages[page]) return;

  // init data if needed
  if (!data) state.dataMap[path] = {};

  try {
    // get and execute the corresponding handler based on path
    const { handler, params } = effects.resolver.match(ctx, path);
    await handler(ctx, { path, params, page, isPopulating });
    state.dataMap[path].isReady = true;
  } catch (e) {
    console.warn(`An error ocurred fetching '${path}:'\n`, e);
    state.dataMap[path].is404 = true;
  }

  // end fetching
  state.dataMap[path].isFetching = false;
};
