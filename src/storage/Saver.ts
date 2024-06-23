import { Config, KeyValueStore, STORAGE_VERSION_KEY } from "../config";
import { Log } from "../utils";

let currentVersion: number | undefined;

export const saveState = (
  before: KeyValueStore,
  after: KeyValueStore,
  config: Config
) => {
  if (config.version !== currentVersion) {
    writeData(STORAGE_VERSION_KEY, { value: config.version }, config);
    currentVersion = config.version;
  }

  for (const [key, oldValue] of Object.entries(before || {})) {
    const newValue = after[key as keyof KeyValueStore];
    if (oldValue !== newValue) {
      if (config._filter.isAllowed(key)) {
        Log.v?.("Key change detected", { key, oldValue, newValue });
        writeData(key, newValue, config);
      } else {
        Log.v?.("Key change blacklisted", { key, oldValue, newValue });
      }
    }
  }
};

let coolDownCache: KeyValueStore = {};
let coolDown = false;

const writeData = (
  key: string,
  newValue: object | undefined,
  config: Config
): boolean => {
  if (coolDown) {
    // Cooldown in progress: just cache the data
    coolDownCache[key] = newValue;
    return false;
  }

  // Write data immediately
  writeKey(key, newValue, config);

  // Start cooldown
  if (config.coolDownTime > 0) {
    coolDown = true;
    setTimeout(() => {
      // Cooldown expired: flush
      for (const [key, value] of Object.entries(coolDownCache)) {
        writeKey(key, value, config);
      }
      coolDownCache = {};
      coolDown = false;
    }, config.coolDownTime);
  }

  return true;
};

const writeKey = (
  key: string,
  newValue: object | undefined,
  config: Config
) => {
  if (newValue === undefined) {
    Log.v?.("Key removed", { key });
    config.storage.removeItem(key);
  } else {
    Log.v?.("Key saved", { key, newValue });
    config.storage.setItem(key, config.serializer.serialize(newValue));
  }
};
