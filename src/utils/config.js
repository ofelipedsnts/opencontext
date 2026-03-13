import Conf from "conf";

import { getConfigDir } from "./paths.js";

const DEFAULTS = {
  version: "1.0",
  mode: "personal",
  sync: {
    enabled: false,
    remote: null,
    branch: "main"
  },
  chub: {
    enabled: true,
    cache: true,
    cacheTTL: 3600
  },
  defaults: {
    lang: null,
    source: "cascade"
  }
};

let conf;

const getConf = () => {
  if (!conf) {
    conf = new Conf({
      configName: "config",
      cwd: getConfigDir(),
      defaults: DEFAULTS
    });
  }

  return conf;
};

const getConfig = () => getConf().store;

const setConfig = (key, value) => {
  const store = getConf();
  store.set(key, value);
  return store.get(key);
};

export { getConfig, setConfig };
