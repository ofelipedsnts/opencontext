import { homedir } from "node:os";
import { join, resolve } from "node:path";

const getBaseDir = () =>
  process.env.OPENCONTEXT_CONFIG_DIR ??
  process.env.OPENCTX_CONFIG_DIR ??
  join(homedir(), ".config", "opencontext");

const getConfigDir = () => getBaseDir();

const getPrivateDir = () => join(getConfigDir(), "private");

const getAnnotationsFile = () =>
  join(getConfigDir(), "annotations", "annotations.json");

const getCacheDir = () => join(getConfigDir(), "cache");

const getContentDir = () => resolve(process.cwd(), "content");

export {
  getConfigDir,
  getPrivateDir,
  getAnnotationsFile,
  getCacheDir,
  getContentDir
};
