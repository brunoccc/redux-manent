import { Config, KeyValueStore, STORAGE_VERSION_KEY } from "../config";
import { Dispatch } from "redux";
import { Log } from "../utils";
import { readyAction } from "../state";

export const loadState = async (dispatch: Dispatch, config: Config) => {
  Log.d?.("Loading started...");
  const loadedState: KeyValueStore = {};
  const loaders: Promise<any>[] = [];
  const loadedVersion =
    (await readKey(STORAGE_VERSION_KEY, config))?.value || 0;
  Object.keys(config.reducer).forEach((key) => {
    if (config._filter.isAllowed(key)) {
      loaders.push(
        new Promise(async (resolve, _reject) => {
          const value = await readKey(key, config);
          if (value !== null) {
            loadedState[key] = value;
          }
          resolve(true);
        })
      );
    }
  });
  await Promise.all(loaders);

  Log.d?.(`Migrating from version ${loadedVersion} to ${config.version} ...`);
  const migratedState = await config.migrateState(
    loadedState,
    loadedVersion,
    config.version
  );

  Log.d?.("Done!");
  dispatch(readyAction(migratedState, config.version));
};

const readKey = async (key: string, config: Config): Promise<any> => {
  const value = await config.storage.getItem(key);
  if (value !== null) {
    Log.v?.("Key loaded:", key, value);
    return config.serializer.deserialize(value);
  }
  Log.v?.("Key not found:", key);
  return undefined;
};
