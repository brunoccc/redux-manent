import { Config, KeyValueStore } from "../config";
import { Dispatch } from "redux";
import { Log } from "../utils";
import { readyAction } from "../state";
import { saveState } from "./Saver";

export const migrateState = async (
  dispatch: Dispatch,
  config: Config,
  loadedState: KeyValueStore,
  loadedVersion: number | undefined
) => {
  Log.d?.(`Migrating from version ${loadedVersion} to ${config.version} ...`);
  const migratedState = await config.migrateState(
    loadedState,
    loadedVersion,
    config.version
  );

  // Save the newly updated state and its version
  Log.d?.("Saving migrated state...");
  saveState(loadedState, migratedState, config, true);

  Log.d?.("Migration complete.");
  dispatch(readyAction(migratedState, config.version));
};
