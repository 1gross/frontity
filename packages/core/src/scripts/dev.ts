import Argv from "minimist";
import { ensureDir, emptyDir } from "fs-extra";
import express from "express";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import { getAllSites } from "@frontity/file-settings";
import createServer from "./utils/create-server";
import HotServer from "./utils/hot-server";
import {
  generateServerEntryPoint,
  generateClientEntryPoints,
  checkForPackages
} from "./utils/entry-points";
import getConfig from "../config";
import { Mode } from "../types";

const argv = Argv(process.argv.slice(2), {
  boolean: ["p", "h", "es5", "https"],
  string: ["outDir", "mode", "port"]
});

// Create an express app ready to be used with webpack-dev-middleware.
const createApp = async ({
  mode,
  port,
  isHttps,
  es5
}: {
  mode: Mode;
  port: number;
  isHttps: boolean;
  es5: boolean;
}): Promise<{
  app: express.Express;
  done: (compiler: webpack.MultiCompiler) => void;
}> => {
  // Create the app.
  const app = express();
  // Use the http or https modules to create the server.
  const server = await createServer({ app, isHttps });
  // Start listening once webpack has finished.
  let clientFinished = false;
  let serverFinished = false;
  const start = () => {
    if (clientFinished && serverFinished) {
      server.listen(port, () => {
        console.log(
          `\n\nSERVER STARTED -- Listening @ ${
            isHttps ? "https" : "http"
          }://localhost:${port}\n  - mode: ${mode}\n  - client: ${
            es5 ? "es5" : "esModules"
          }`
        );
      });
    }
  };
  // Check if webpack has finished (both the client and server bundles).
  const done = (compiler: webpack.MultiCompiler) => {
    compiler.compilers[0].hooks.done.tapAsync(
      "frontity-dev-server",
      (_, cb) => {
        clientFinished = true;
        start();
        cb();
      }
    );
    compiler.compilers[1].hooks.done.tapAsync(
      "frontity-dev-server",
      (_, cb) => {
        serverFinished = true;
        start();
        cb();
      }
    );
  };
  return { app, done };
};

// Start Frontity development environment.
const dev = async ({
  isHttps,
  mode,
  port,
  es5,
  outDir
}: {
  port: number;
  isHttps: boolean;
  mode: Mode;
  es5: boolean;
  outDir: string;
}): Promise<void> => {
  // Create the directories if they don't exist.
  await ensureDir(outDir);
  await emptyDir(outDir);
  await ensureDir(`${outDir}/bundling/entry-points`);

  // Get all packages.
  const sites = await getAllSites();

  // Check if all the packages are installed.
  await checkForPackages({ sites });

  // Generate the bundles. One for the server.
  const serverEntryPoints = await generateServerEntryPoint({ sites, outDir });
  const clientEntryPoints = await generateClientEntryPoints({ sites, outDir });
  const entryPoints = [...clientEntryPoints, serverEntryPoints];

  // Start dev using webpack dev server with express.
  const { app, done } = await createApp({ mode, port, isHttps, es5 });

  // Get FrontityConfig for webpack.
  const frontityConfig = getConfig({ mode, outDir, entryPoints });

  // Build and wait until webpack finished the client first.
  // We need to do this because the server bundle needs to import
  // the client loadable-stats, which are created by the client webpack.
  const clientWebpack = es5
    ? frontityConfig.webpack.es5
    : frontityConfig.webpack.module;
  const clientCompiler = webpack(clientWebpack);
  await new Promise(resolve => clientCompiler.run(resolve));

  // Start a custom webpack-dev-server.
  const compiler = webpack([clientWebpack, frontityConfig.webpack.server]);
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: "/static",
      writeToDisk: true,
      stats: {
        all: false,
        hash: false,
        assets: true,
        colors: true,
        errors: true,
        warnings: true,
        errorDetails: true
      }
    })
  );
  app.use(webpackHotMiddleware(compiler.compilers[0]));
  app.use(HotServer(compiler));

  // Start listening once webpack finishes.
  done(compiler);
};

(process as NodeJS.EventEmitter).on("unhandledRejection", (error: Error) => {
  console.error(error);
  process.exit(1);
});

dev({
  mode: !!argv.p || argv.production ? "production" : "development",
  port: argv.port || 3000,
  isHttps: !!argv.h || !!argv.https,
  es5: !!argv.es5,
  outDir: argv.outDir || "build"
});

export default dev;
