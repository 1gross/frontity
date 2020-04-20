import React from "react";
import { Head, connect, URL } from "frontity";
import { Connect } from "frontity/types";
import Analytics from "../types";

const Homepage = () => (
  <>
    <Head>
      <title>Homepage Title</title>
    </Head>
    <h1>Homepage</h1>
    <p>This is the homepage.</p>
  </>
);

const SomePost = () => (
  <>
    <Head>
      <title>Some Post Title</title>
    </Head>
    <h1>Some post</h1>
    <p>This is some post</p>
  </>
);

const Theme: React.FC<Connect<Analytics>> = ({ state, actions }) => {
  // Get only the pathname (link has query).
  const { pathname } = new URL(state.router.link, "http://localhost:3001");

  const changeLink = () => actions.router.set("/some-post/");
  const sendEvent = () =>
    actions.analytics.sendEvent({
      event: "some event",
      payload: { content: "some content" },
    });

  return (
    <>
      {/* Render homepage or post */}
      {pathname === "/" && <Homepage />}
      {pathname === "/some-post/" && <SomePost />}
      {/* Buttons */}
      <button id="change-link" onClick={changeLink}>
        Some Post
      </button>
      <button id="send-event" onClick={sendEvent}>
        Send event
      </button>
    </>
  );
};

const analytics: Analytics = {
  name: "e2e-analytics",
  roots: {
    theme: connect(Theme),
  },
  state: {
    source: {
      data: {},
      get: ({ state }) => (link) => state.source.data[link],
    },
  },
  actions: {
    source: {
      fetch: ({ state }) => async (link) => {
        const { data } = state.source;
        if (!data[link]) {
          data[link] = {
            link,
            isFetching: true,
            isReady: false,
          };

          await Promise.resolve();

          data[link] = {
            ...data[link],
            isFetching: false,
            isReady: true,
          };
        }
      },
    },
  },
};

export default analytics;
