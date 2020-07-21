export default {
  name: "post-type",
  priority: 13,
  pattern: "/post-type",
  func: async ({ link, params, state, libraries }) => {
    const handler = libraries.source.handlers.find(
      (handler) => handler.name === "post type"
    );
    handler.func({ link, params, state, libraries });
  },
};
