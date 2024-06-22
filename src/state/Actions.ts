import { KeyValueStore } from "../config";

export type ReduxManentAction =
  | ReturnType<typeof startAction>
  | ReturnType<typeof readyAction>;

export const ACTION_START = "redux-manent/start" as const;
export const startAction = () => {
  return {
    type: ACTION_START,
  };
};

export const ACTION_READY = "redux-manent/ready" as const;
export const readyAction = (state: KeyValueStore, loadedVersion: number) => {
  return {
    type: ACTION_READY,
    payload: {
      state,
      loadedVersion,
    },
  };
};
