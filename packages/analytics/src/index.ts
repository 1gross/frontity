import Root from "./components";
import Analytics, { Packages } from "../types";

const analytics: Analytics<Packages> = {
  roots: {
    analytics: Root,
  },
  state: {
    analytics: {
      pageviews: {},
      events: {},
    },
  },
  actions: {
    /**
     * Get the functions for every analytics package
     * and run `pageview` for each one.
     */
    analytics: {
      pageview: ({ state, actions }) => (pageview) => {
        Object.entries(state.analytics.pageviews).forEach(
          ([namespace, shouldSend]) => {
            if (shouldSend) actions[namespace].pageview(pageview);
          }
        );
      },

      /**
       * Get the functions for every analytics package
       * and run `event` for each one.
       */
      event: ({ state, actions }) => (event) => {
        Object.entries(state.analytics.events).forEach(
          ([namespace, shouldSend]) => {
            if (shouldSend) actions[namespace].event(event);
          }
        );
      },
    },
  },
};

export default analytics;
