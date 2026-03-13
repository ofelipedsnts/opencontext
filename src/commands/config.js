import { getConfig, setConfig } from "../utils/config.js";
import { isJsonMode, outputJson } from "../utils/jsonOutput.js";
import { warn, success } from "../utils/logger.js";

const register = (program) => {
  program
    .command("config")
    .description("Get or set configuration values")
    .argument("[key]", "Config key")
    .argument("[value]", "Config value")
    .option("--json", "Output JSON")
    .action((key, value) => {
      try {
        if (key && value !== undefined) {
          const updated = setConfig(key, value);
          success(`Set ${key}`);
          if (isJsonMode()) {
            outputJson({ key, value: updated });
          }
          return;
        }

        const config = getConfig();
        if (isJsonMode()) {
          outputJson(config);
          return;
        }
        process.stdout.write(`${JSON.stringify(config, null, 2)}\n`);
      } catch (error) {
        warn(error?.message ?? String(error));
        process.exitCode = 1;
      }
    });
};

export { register };
