import * as localStore from "./store/localStore.js";
import * as repoStore from "./store/repoStore.js";
import * as chubBridge from "./chub/chubBridge.js";

const stripPrefix = (id, prefix) => id.slice(prefix.length);

const resolveFromSource = async (source, id, options) => {
  if (source === "local") {
    return localStore.get(id, options);
  }

  if (source === "team") {
    return repoStore.get(id, options);
  }

  if (source === "chub") {
    return chubBridge.get(id, {
      lang: options?.lang,
      version: options?.version,
      noCache: options?.noCache
    });
  }

  throw new Error(`Unknown source: ${source}`);
};

const resolve = async (id, options = {}) => {
  if (options.source && options.source !== "cascade") {
    return resolveFromSource(options.source, id, options);
  }

  if (id.startsWith("local/")) {
    return resolveFromSource("local", stripPrefix(id, "local/"), options);
  }

  if (id.startsWith("team/")) {
    return resolveFromSource("team", stripPrefix(id, "team/"), options);
  }

  if (await localStore.exists(id)) {
    return resolveFromSource("local", id, options);
  }

  if (await repoStore.exists(id)) {
    return resolveFromSource("team", id, options);
  }

  return resolveFromSource("chub", id, options);
};

const resolveSearch = async (query, options = {}) => {
  const source = options.source ?? "cascade";

  if (source === "local") {
    return {
      local: await localStore.search(query),
      team: [],
      chub: []
    };
  }

  if (source === "team") {
    return {
      local: [],
      team: await repoStore.search(query),
      chub: []
    };
  }

  if (source === "chub") {
    return {
      local: [],
      team: [],
      chub: await chubBridge.search(query)
    };
  }

  const [local, team, chub] = await Promise.all([
    localStore.search(query),
    repoStore.search(query),
    chubBridge.search(query)
  ]);

  return { local, team, chub };
};

const resolveList = async (options = {}) => {
  const source = options.source ?? "cascade";

  if (source === "local") {
    return { local: await localStore.list(), team: [], chub: [] };
  }

  if (source === "team") {
    return { local: [], team: await repoStore.list(), chub: [] };
  }

  if (source === "chub") {
    return { local: [], team: [], chub: [] };
  }

  const [local, team] = await Promise.all([localStore.list(), repoStore.list()]);
  return { local, team, chub: [] };
};

export { resolve, resolveSearch, resolveList };
