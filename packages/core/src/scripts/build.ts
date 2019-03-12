import Argv from "minimist";
import { ensureDir, emptyDir } from "fs-extra";
import webpack from "webpack";
import getConfig from "../config";
import { Mode } from "../types";

const buildDir = "build";
const analyzeDir = "analyze";
const argv = Argv(process.argv.slice(2));

const webpackAsync = (config: webpack.Configuration): Promise<void> =>
  new Promise((resolve, reject) => {
    webpack(config).run(err => {
      if (err) reject(err);
      else resolve();
    });
  });

const build = async ({ mode }: { mode: Mode }): Promise<void> => {
  console.log(`mode: ${mode}\n`);

  // Create the directories if they don't exist.
  await ensureDir(buildDir);
  await ensureDir(analyzeDir);

  // Remove all the files inside the directories.
  await emptyDir(buildDir);
  await emptyDir(analyzeDir);

  // Get FrontityConfig for webpack.
  const frontityConfig = getConfig({ mode });

  // Build and wait until webpack finished the clients first.
  // We need to do this because the server bundle needs to import
  // the client loadable-stats, which are created by the clients.
  console.log("Building es5 bundle");
  await webpackAsync(frontityConfig.webpack.es5);
  console.log("Building module bundle");
  await webpackAsync(frontityConfig.webpack.module);
  console.log("Building server bundle");
  await webpackAsync(frontityConfig.webpack.server);
  console.log();
};

(process as NodeJS.EventEmitter).on("unhandledRejection", (error: Error) => {
  console.error(error);
  process.exit(1);
});

build({
  mode: !!argv.p || argv.production ? "production" : "development"
});

export default build;
