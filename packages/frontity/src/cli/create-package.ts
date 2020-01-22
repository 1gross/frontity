import ora from "ora";
import chalk from "chalk";
import { normalize } from "path";
import { prompt, Question } from "inquirer";
import createPackage from "../commands/create-package";
import {
  errorLogger,
  isFrontityProjectRoot,
  isThemeNameValid,
  log
} from "../utils";
import { Options } from "../steps/create-package";

//  Command:
//    create-package [name]
//
//  Steps:
//    1. validate project location
//    2. ask for the package name if it wasn't passed as argument and validate
//    3. ask for the package namespace if it wasn't passed as argument
//    4. create package

export default async ({
  name,
  namespace
}: {
  name: string;
  namespace?: string;
}) => {
  // Init options
  const options: Options = {};

  // 1. validate project location
  options.projectPath = process.cwd();
  if (!(await isFrontityProjectRoot(options.projectPath))) {
    errorLogger(
      new Error(
        "You must execute this command in the root folder of a Frontity project."
      )
    );
  }

  // 2. ask for the package name if it wasn't passed as argument and validate
  if (!name) {
    const questions: Question[] = [
      {
        name: "name",
        type: "input",
        message: "Enter a name for the package:",
        default: "my-frontity-package"
      }
    ];

    const answers = await prompt(questions);
    options.name = answers.name;
    log();
  } else {
    options.name = name;
  }

  if (!isThemeNameValid(options.name)) {
    errorLogger(
      new Error("The name of the package is not a valid npm package name.")
    );
  }

  // 2.1 set the package path
  options.packagePath = normalize(
    `packages/${options.name.replace(/(?:@.+\/)/i, "")}`
  );

  // 3. ask for the package namespace if it wasn't passed as argument
  if (!namespace) {
    const questions: Question[] = [
      {
        name: "namespace",
        type: "input",
        message: "Enter the namespace of the package:",
        default: "theme"
      }
    ];

    const answers = await prompt(questions);
    options.namespace = answers.namespace;
    log();
  } else {
    options.namespace = namespace;
  }

  // 4. get the emitter for `create-package`
  const emitter = createPackage(options);

  emitter.on("error", errorLogger);
  emitter.on("message", (message, action) => {
    if (action) ora.promise(action, message);
    else log(message);
  });

  // 5. Actually create the package
  await emitter;

  log(chalk.bold(`\nNew package "${options.name}" created.\n`));
};
