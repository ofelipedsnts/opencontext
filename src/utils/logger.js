import chalk from "chalk";

const isJsonMode = () => process.argv.includes("--json");

const write = (stream, prefix, message) => {
  if (isJsonMode()) {
    stream.write(`${message}\n`);
    return;
  }

  stream.write(`${prefix} ${message}\n`);
};

const info = (message) => write(process.stdout, chalk.blue("info"), message);
const success = (message) => write(process.stdout, chalk.green("success"), message);
const warn = (message) => write(process.stdout, chalk.yellow("warn"), message);
const error = (message) => write(process.stderr, chalk.red("error"), message);

export { info, success, warn, error };
