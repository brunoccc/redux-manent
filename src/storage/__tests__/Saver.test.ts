import { Reducer } from "redux";
import {
  KeyValueStore,
  STORAGE_VERSION_KEY,
  sanitizeConfig,
} from "../../config";
import { saveState } from "../Saver";

describe("Saver", () => {
  beforeEach(() => {});
  it("should detect the differences", async () => {
    const mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    const config = sanitizeConfig({
      reducer: {
        item1: {} as Reducer,
        item2: {} as Reducer,
        item3: {} as Reducer,
      },
      storage: mockStorage,
      version: 42,
      coolDownTime: 0,
    });
    const item1 = { value: 1 };
    const item2 = { value: 2 };
    const item2New = { value: 3 };
    const item3 = { value: "Hello" };
    const item3New = { value: "Ciao" };
    const stateT0: KeyValueStore = { item1, item2, item3 };
    const stateT1: KeyValueStore = { item1, item2: item2New, item3: item3New };

    saveState(stateT0, stateT1, config);

    // First persist the version
    expect(mockStorage.setItem.mock.calls[0]).toEqual([
      STORAGE_VERSION_KEY,
      JSON.stringify({ value: 42 }),
    ]);
    // Then the data
    expect(mockStorage.setItem.mock.calls[1]).toEqual([
      "item2",
      JSON.stringify(item2New),
    ]);
    expect(mockStorage.setItem.mock.calls[2]).toEqual([
      "item3",
      JSON.stringify(item3New),
    ]);
    expect(mockStorage.setItem.mock.calls[3]).toBeUndefined();
  });

  it("should only consider whitelisted", async () => {
    const mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    const config = sanitizeConfig({
      reducer: {
        item1: {} as Reducer,
        item2: {} as Reducer,
        item3: {} as Reducer,
      },
      storage: mockStorage,
      version: 42,
      coolDownTime: 0,
      whitelist: ["item3"],
    });
    const item1 = { value: 1 };
    const item2 = { value: 2 };
    const item2New = { value: 3 };
    const item3 = { value: "Hello" };
    const item3New = { value: "Ciao" };
    const stateT0: KeyValueStore = { item1, item2, item3 };
    const stateT1: KeyValueStore = { item1, item2: item2New, item3: item3New };

    saveState(stateT0, stateT1, config);

    // First persist the version
    expect(mockStorage.setItem.mock.calls[0]).toEqual([
      STORAGE_VERSION_KEY,
      JSON.stringify({ value: 42 }),
    ]);
    // Then the data
    expect(mockStorage.setItem.mock.calls[1]).toEqual([
      "item3",
      JSON.stringify(item3New),
    ]);
    expect(mockStorage.setItem.mock.calls[2]).toBeUndefined();
  });

  it("should ignore blacklisted", async () => {
    const mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    const config = sanitizeConfig({
      reducer: {
        item1: {} as Reducer,
        item2: {} as Reducer,
        item3: {} as Reducer,
      },
      storage: mockStorage,
      version: 42,
      coolDownTime: 0,
      blacklist: ["item3"],
    });
    const item1 = { value: 1 };
    const item2 = { value: 2 };
    const item2New = { value: 3 };
    const item3 = { value: "Hello" };
    const item3New = { value: "Ciao" };
    const stateT0: KeyValueStore = { item1, item2, item3 };
    const stateT1: KeyValueStore = { item1, item2: item2New, item3: item3New };

    saveState(stateT0, stateT1, config);

    // First persist the version
    expect(mockStorage.setItem.mock.calls[0]).toEqual([
      STORAGE_VERSION_KEY,
      JSON.stringify({ value: 42 }),
    ]);
    // Then the data
    expect(mockStorage.setItem.mock.calls[1]).toEqual([
      "item2",
      JSON.stringify(item2New),
    ]);
    expect(mockStorage.setItem.mock.calls[2]).toBeUndefined();
  });
});
