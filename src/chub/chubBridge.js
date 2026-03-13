import { access, mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

import { execa } from "execa";

import { getConfig } from "../utils/config.js";
import { getCacheDir } from "../utils/paths.js";

const getCachePath = (id) => join(getCacheDir(), `${id.replaceAll("/", "__")}.md`);

const isEnabled = () => {
  const config = getConfig();
  return Boolean(config?.chub?.enabled);
};

const isChubAvailable = async () => {
  try {
    await execa("chub", ["--help"]);
    return true;
  } catch {
    return false;
  }
};

const isCacheValid = async (filePath, ttlSeconds) => {
  try {
    const info = await stat(filePath);
    const ageMs = Date.now() - info.mtimeMs;
    return ageMs <= ttlSeconds * 1000;
  } catch {
    return false;
  }
};

const readCache = async (id, ttlSeconds) => {
  const cachePath = getCachePath(id);
  if (!(await isCacheValid(cachePath, ttlSeconds))) {
    return null;
  }

  return readFile(cachePath, "utf8");
};

const writeCache = async (id, content) => {
  const cacheDir = getCacheDir();
  await mkdir(cacheDir, { recursive: true });
  await writeFile(getCachePath(id), content, "utf8");
};

const get = async (id, flags = {}) => {
  if (!isEnabled()) {
    throw new Error("chub integration is disabled");
  }

  const { chub } = getConfig();
  const useCache = chub.cache && !flags.noCache;

  if (useCache) {
    const cached = await readCache(id, chub.cacheTTL);
    if (cached) {
      return cached;
    }
  }

  const args = ["get", id];
  if (flags.lang) {
    args.push("--lang", flags.lang);
  }

  const { stdout } = await execa("chub", args);

  if (useCache) {
    await writeCache(id, stdout);
  }

  return stdout;
};

const search = async (query) => {
  if (!isEnabled()) {
    throw new Error("chub integration is disabled");
  }

  const { stdout } = await execa("chub", ["search", query]);
  return stdout;
};

export { isChubAvailable, isEnabled, get, search };
