import { KeyValueStore } from '../config';
import { ReduxManentState } from './Reducers';

export const isReadySelector = (state: KeyValueStore) =>
  (state.reduxManentState as ReduxManentState).ready;

export const isLoadingSelector = (state: KeyValueStore) =>
  (state.reduxManentState as ReduxManentState).loading;
