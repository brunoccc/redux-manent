import { Config } from "./Config";
import { Log } from "../utils";

type Cache = Record<string, boolean>;

let allowedCache: Cache | undefined = undefined;

export const isAllowed = (key: string, config: Config): boolean => {
  if (allowedCache === undefined) {
    allowedCache = buildCache(config);
  }
  return allowedCache[key];
};

const buildCache = (config: Config): { [key: string]: boolean } => {
  let cache: Cache = {};

  // If there is no whitelist, the default behaviour is "allow", otherwise it is "block"
  const defaultFilter = config.whitelist.length === 0;
  Object.keys(config.reducer).forEach((key) => {
    cache[key] = defaultFilter;
  });

  // Enable whitelisted
  config.whitelist.forEach((key) => {
    cache[key] = true;
  });

  // Disable blacklisted
  config.blacklist.forEach((key) => {
    cache[key] = false;
  });

  cache["reduxManentState"] = false;

  Log.v?.("Filter cache built", { cache });
  return cache;
};
