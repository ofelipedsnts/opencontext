import { mkdir, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";

import { getConfig, setConfig } from "../utils/config.js";
import { getConfigDir, getPrivateDir, getCacheDir } from "../utils/paths.js";
import { info, success, warn } from "../utils/logger.js";

const fileExists = async (path) => {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const runInit = async () => {
  const configDir = getConfigDir();
  const privateDir = getPrivateDir();
  const cacheDir = getCacheDir();
  const annotationsDir = `${configDir}/annotations`;
  const annotationsFile = `${annotationsDir}/annotations.json`;

  await mkdir(configDir, { recursive: true });
  await mkdir(privateDir, { recursive: true });
  await mkdir(cacheDir, { recursive: true });
  await mkdir(annotationsDir, { recursive: true });

  if (!(await fileExists(annotationsFile))) {
    await writeFile(annotationsFile, "{}", "utf8");
  }

  const config = getConfig();
  setConfig("version", config.version);

  success("OpenContext initialized.");
  info(`Config directory: ${configDir}`);
};

const register = (program) => {
  program
    .command("init")
    .description("Create local config and directories")
    .action(async () => {
      try {
        await runInit();
      } catch (error) {
        warn(error?.message ?? String(error));
        process.exitCode = 1;
      }
    });
};

export { register };
