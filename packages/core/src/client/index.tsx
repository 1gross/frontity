import React from "react";
import { hydrate } from "react-dom";
import { loadableReady } from "@loadable/component";
import App from "../app";

export default ({ packages }) => {
  const render = (Component: React.FunctionComponent): void => {
    hydrate(<Component />, window.document.getElementById("root"));
  };

  if (process.env.NODE_ENV === "development" && module["hot"]) {
    module["hot"].accept("../app", () => {
      const App = require("../app").default;
      render(App);
    });
  }

  loadableReady(() => render(App));
};
