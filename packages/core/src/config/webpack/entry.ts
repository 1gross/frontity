import { resolve } from "path";
import { Configuration } from "webpack";
import { Target, Mode } from "../../types";

export default ({
  target,
  mode
}: {
  target: Target;
  mode: Mode;
}): Configuration["entry"] => {
  // Use /client for both es5 and modules and /server for node.
  const name: "server" | "client" = target === "server" ? "server" : "client";
  const config: Configuration["entry"] = [
    resolve(__dirname, `../../../src/${name}`)
  ];
  // This is needed for HMR in the client but only when we are in development.
  if (target !== "server" && mode === "development") {
    config.unshift("webpack-hot-middleware/client");
  }
  return config;
};
