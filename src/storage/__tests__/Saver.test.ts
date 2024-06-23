import { Reducer } from "redux";
import {
  KeyValueStore,
  STORAGE_VERSION_KEY,
  sanitizeConfig,
} from "../../config";
import { saveState } from "../Saver";

const ITEM1 = { value: 1 };
const ITEM2 = { value: 2 };
const ITEM2_NEW = { value: 3 };
const ITEM3 = { value: "Hello" };
const ITEM3_NEW = { value: "Ciao" };

const STATE_T0: KeyValueStore = { item1: ITEM1, item2: ITEM2, item3: ITEM3 };
const STATE_T1: KeyValueStore = {
  item1: ITEM1,
  item2: ITEM2_NEW,
  item3: ITEM3_NEW,
};

describe("Saver", () => {
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

    saveState(STATE_T0, STATE_T1, config, false);

    expect(mockStorage.setItem.mock.calls[0]).toEqual([
      "item2",
      JSON.stringify(ITEM2_NEW),
    ]);
    expect(mockStorage.setItem.mock.calls[1]).toEqual([
      "item3",
      JSON.stringify(ITEM3_NEW),
    ]);
    expect(mockStorage.setItem.mock.calls[2]).toBeUndefined();
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

    saveState(STATE_T0, STATE_T1, config, false);

    expect(mockStorage.setItem.mock.calls[0]).toEqual([
      "item3",
      JSON.stringify(ITEM3_NEW),
    ]);
    expect(mockStorage.setItem.mock.calls[1]).toBeUndefined();
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

    saveState(STATE_T0, STATE_T1, config, false);

    expect(mockStorage.setItem.mock.calls[0]).toEqual([
      "item2",
      JSON.stringify(ITEM2_NEW),
    ]);
    expect(mockStorage.setItem.mock.calls[1]).toBeUndefined();
  });

  it("should save the version when requested", async () => {
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

    saveState(STATE_T0, STATE_T1, config, true);

    // First persist the version
    expect(mockStorage.setItem.mock.calls[0]).toEqual([
      STORAGE_VERSION_KEY,
      JSON.stringify({ value: 42 }),
    ]);
    // Then the data
    expect(mockStorage.setItem.mock.calls[1]).toEqual([
      "item2",
      JSON.stringify(ITEM2_NEW),
    ]);
    expect(mockStorage.setItem.mock.calls[2]).toEqual([
      "item3",
      JSON.stringify(ITEM3_NEW),
    ]);
    expect(mockStorage.setItem.mock.calls[3]).toBeUndefined();
  });
});
