import { Reducer } from 'redux';
import {
  DefaultSerializer,
  NullStorage,
  Serializer,
  Storage,
} from '../storage';
import { KeyValueStore } from './Constants';

export type ReduxManentConfig = {
  reducer: { [id: string]: Reducer };
  storage: Storage;
  coolDownTime?: number;
  serializer?: Serializer;
  version?: number;
  migrateState?: (
    state: KeyValueStore,
    from: number,
    to: number,
  ) => Promise<KeyValueStore>;
  verbose?: boolean;
  whitelist?: string[];
  blacklist?: string[];
};

export type Config = Required<ReduxManentConfig>;

export const sanitizeConfig = (config: ReduxManentConfig): Config => {
  const defaultConfig: Config = {
    reducer: config.reducer,
    storage: config.storage,
    coolDownTime: config.coolDownTime ?? 100,
    serializer: config.serializer ?? DefaultSerializer,
    version: config.version ?? 0,
    migrateState:
      config.migrateState ?? (async (state: KeyValueStore) => state),
    verbose: config.verbose ?? false,
    whitelist: config.whitelist ?? [],
    blacklist: config.blacklist ?? [],
  };

  return defaultConfig;
};
