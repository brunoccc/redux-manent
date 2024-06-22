# Redux-Manent

> _"Verba volant, scripta manent."_  
> (Spoken words fly away, written ones remain.)

`redux-manent` is a simple-to-use Redux persistence library that allows you to easily persist your Redux state to local storage and reload it when your application initializes. This ensures that your app's state doesn't _"fly away"_ and it's preserved across sessions.

## Installation

You can install `redux-manent` using npm or yarn:

```bash
npm install redux-manent
```

or

```bash
yarn add redux-manent
```

## Usage

To use `redux-manent`, follow these simple steps:

### Step 1: Configure the Store

In a typical scenario with [Redux Toolkit](https://redux-toolkit.js.org/), you have a Redux store configuration that looks like this:

```javascript
import { configureStore } from "@reduxjs/toolkit";
import todosReducer from "../features/todos/todosSlice";
import filtersReducer from "../features/filters/filtersSlice";

export const store = configureStore({
  reducer: {
    todos: todosReducer,
    filters: filtersReducer,
  },
});
```

Integrating `redux-manent` is very simple, as shown below:

```javascript
import { configureStore } from '@reduxjs/toolkit'
import todosReducer from '../features/todos/todosSlice'
import filtersReducer from '../features/filters/filtersSlice'
import { persistReducer, wakeUp } from 'redux-manent';

const myStorage = ... // 1. Initialise your favourite storage engine

export const store = configureStore({
  reducer: persistReducer({ // 2. Wrap your reducers into `persistReducer`...
    reducer: {
      todos: todosReducer,
      filters: filtersReducer,
    }
    storage: myStorage  // 3. ...together with any other desired options
    ...
  }),
});

wakeUp(store.dispatch); // 4. Wake up the library
```

The two parameters `reducer` and `storage` are the only ones required by `persistReducer`. However, there are several optional parameters
that allow to handle migration, white/black lists, fine tune the performances and so on. Please refer to the [API documentation](#api)
below for more information.

### Step 2 (Optional): Check when you're ready

In many situations you might want to delay showing your app UI until the state have been completely loaded, processed,
and it's ready in Redux. Rather than having a sort of "persist-gate" like other similar products, `redux-manent` offers a simpler approach
based on the usage of a selector:

```javascript
import { isReadySelector } from 'redux-manent';

...

const isReady = useSelector(isReadySelector);

...
```

This approach can be easily used to achieve the same results of a persist-gate and, at the same time, it is extremely flexible.
A selector can be quickly integrated in a custom hook, or connected to your favourite splash-screen library, or used in sagas or
other side effect libraries that are not directly connected to the UI but nevertheless require to know exactly when to start.
See the [Examples](#examples) section for more information.

## API

### `persistReducer(config)`

Creates the persisted reducer that can be passed to `configureStore`. Configure it with an object matching the `ReduxManentConfig` data type:

- `reducer`: An object containing your Redux reducers that will be combined by `redux-manent` using `combineReducers`. This is a required parameter.
- `storage`: The storage engine to use for persisting the state. This is a required parameter and can be any storage mechanism that implements the Web Storage API (`localStorage`, `sessionStorage`, or a custom storage object).
- `coolDownTime`: An optional parameter that specifies the minimum interval between state saves to the storage. By caching frequent changes to the state, and only writing them at lower frequency, `redux-manent` helps to reduce the number of storage writes and can improve overall application performance.
- `serializer`: An optional parameter to specify a custom serializer for the state. By default, JSON serialization is used.
- `version`: An optional parameter to specify the version of the persisted state. This can be useful for state migrations.
- `migrateState`: An optional function to handle state migration when the version changes. This function receives the current state, the previous version, and the new version as arguments, and should return the migrated state.

  ```typescript
  migrateState?: (
    state: KeyValueStore,
    from: number,
    to: number,
  ) => Promise<KeyValueStore>
  ```

  Note that this function is asynchronous and can take as much time as you like. Also note that this function will be always called, even if the version has not changed. This gives you a chance to enrich/alter the state if needed (e.g. if you require to create computed parts of your state that are not persisted).

- `verbose`: An optional boolean parameter to enable verbose logging for debugging purposes. By default, logging is not verbose, and it's automatically disabled on production builds.
- `whitelist`: An optional array of reducer keys that should be persisted. Only the specified reducers will be persisted if this parameter is provided. If this parameter is not provided, **all** the reducers will be persisted.

  ```typescript
  whitelist?: string[]
  ```

- `blacklist`: An optional array of reducer keys that should not be persisted. All reducers except the specified ones will be persisted if this parameter is provided.

  ```typescript
  blacklist?: string[]
  ```

### `wakeUp(dispatch)`

Start-up the library by initiating the load operations.

- `dispatch`: The Redux dispatcher function.

### `isReadySelector`

A selector that can be used to understand when the persisted state has been completely loaded, converted, and set in memory.

## Examples

### Storing TODOs with MMKV

```Typescript
import { configureStore } from '@reduxjs/toolkit'
import todosReducer from '../features/todos/todosSlice'
import filtersReducer from '../features/filters/filtersSlice'
import { MMKVLoader } from 'react-native-mmkv-storage';
import { persistReducer, wakeUp } from 'redux-manent';

const storage = new MMKVLoader().initialize();

export const store = configureStore({
  reducer: persistReducer({
    reducer: {
      todos: todosReducer,
      filters: filtersReducer,
    }
    storage: storage,
    whitelist: ['todos'], // Only saves todos, not their filters
  }),
});

wakeUp(store.dispatch);
```

### Delaying the UI display until the state has been loaded

```Typescript
import React from 'react';
import { useSelector } from 'react-redux';
import { isReadySelector } from 'redux-manent`;
...

const App: React.FC = () => {
  const isReady = useSelector(isReadySelector);

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>My App</h1>
      {/* Your actual app components go here */}
    </div>
  );
};
```

(More examples coming soon...)

## License

`redux-manent` is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Acknowledgements

`redux-manent` is inspired by and built upon the ideas of existing Redux persistence libraries, although its code has been written from scratch using TypeScript and other modern tools.
