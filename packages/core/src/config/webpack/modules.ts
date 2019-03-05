import hash from "hash-it";
import { Configuration } from "webpack";
import * as babelCore from "@babel/core/package.json";
import * as babelLoader from "babel-loader/package.json";
import { Target, Mode, BabelConfigs } from "../../types";

export default ({
  target,
  mode,
  babel
}: {
  target: Target;
  mode: Mode;
  babel: BabelConfigs;
}): Configuration["module"] => {
  const config: Configuration["module"] = {
    rules: [
      {
        // Support for js, jsx, ts and tsx files.
        test: /\.(j|t)sx?$/,
        use: {
          loader: "babel-loader",
          options: {
            // Don't use the babelrc file of the root.
            babelrc: false,
            // This is a feature of `babel-loader` for webpack (not Babel itself).
            // It enables caching results in ./node_modules/.cache/babel-loader/
            // directory for faster rebuilds.
            cacheDirectory: true,
            // A unique hash using @babel/core's version, the babel-loader's version,
            // and the contents of babel.
            cacheIdentifier: hash({
              babelCoreVersion: babelCore.version,
              babelLoaderVersion: babelLoader.version,
              babel: babel
            }),
            // Instead, use the babel options directly from our babel object.
            ...babel[target]
          }
        }
      }
    ]
  };
  return config;
};
