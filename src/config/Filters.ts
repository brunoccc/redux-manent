import { Log } from "../utils";
import { Reducer } from "redux";

export type Filter = {
  isAllowed: (key: string) => boolean;
};

type Cache = Record<string, boolean>;

export const buildFilter = (
  reducer: { [id: string]: Reducer },
  whitelist?: string[],
  blacklist?: string[]
): Filter => {
  let cache: Cache = {};

  // If there is no whitelist, the default behaviour is "allow", otherwise it is "block"
  const defaultFilter = whitelist === undefined || whitelist.length === 0;
  Object.keys(reducer).forEach((key) => {
    cache[key] = defaultFilter;
  });

  // Enable whitelisted
  whitelist?.forEach((key) => {
    cache[key] = true;
  });

  // Disable blacklisted
  blacklist?.forEach((key) => {
    cache[key] = false;
  });

  // Disable internal state persistence
  cache["reduxManentState"] = false;

  Log.v?.("Filter cache built", { cache });

  return {
    isAllowed: (key: string): boolean => {
      return cache[key];
    },
  };
};
