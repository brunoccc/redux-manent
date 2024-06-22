import { Reducer } from "redux";
import { Config, STORAGE_VERSION_KEY, sanitizeConfig } from "../../config";
import { loadState } from "../Loader";
import { readyAction } from "../../state";
import { Storage } from "../Storage";

let mockStorage: Storage;

describe("Loader", () => {
  beforeEach(() => {
    mockStorage = {
      getItem: (key: string) => {
        if (key === STORAGE_VERSION_KEY) {
          // Simulate reading the version
          return `{"value": "42"}`;
        }
        // Simulate reading a key/value pair
        return `{"value": "VALUE_FOR_KEY:${key}"}`;
      },
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
  });

  it("should load the persisted state", async () => {
    const config: Config = sanitizeConfig({
      reducer: {
        item1: {} as Reducer,
        item2: {} as Reducer,
        item3: {} as Reducer,
      },
      storage: mockStorage,
      version: 42,
    });

    const mockDispatch = jest.fn();

    await loadState(mockDispatch, config);

    expect(mockDispatch).toHaveBeenCalledWith(
      readyAction(
        {
          item1: { value: "VALUE_FOR_KEY:item1" },
          item2: { value: "VALUE_FOR_KEY:item2" },
          item3: { value: "VALUE_FOR_KEY:item3" },
        },
        42
      )
    );
  });

  it("should properly migrate the persisted version", async () => {
    const mockMigratedState = {
      item_a: { text: "Hello" },
      item_b: { text: "World" },
    };
    const mockMigrate = jest.fn().mockReturnValue(mockMigratedState);
    const config: Config = sanitizeConfig({
      reducer: {
        item1: {} as Reducer,
        item2: {} as Reducer,
        item3: {} as Reducer,
      },
      storage: mockStorage,
      migrateState: mockMigrate,
      version: 43,
    });
    const mockDispatch = jest.fn();

    await loadState(mockDispatch, config);

    expect(mockMigrate).toHaveBeenCalledWith(
      {
        item1: { value: "VALUE_FOR_KEY:item1" },
        item2: { value: "VALUE_FOR_KEY:item2" },
        item3: { value: "VALUE_FOR_KEY:item3" },
      },
      42,
      43
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      readyAction(mockMigratedState, 43)
    );
  });

  it("should not load a blacklisted reducer", async () => {
    const config: Config = sanitizeConfig({
      reducer: {
        item1: {} as Reducer,
        item2: {} as Reducer,
        item3: {} as Reducer,
      },
      storage: mockStorage,
      version: 42,
      blacklist: ["item2"],
    });

    const mockDispatch = jest.fn();

    await loadState(mockDispatch, config);

    expect(mockDispatch).toHaveBeenCalledWith(
      readyAction(
        {
          item1: { value: "VALUE_FOR_KEY:item1" },
          item3: { value: "VALUE_FOR_KEY:item3" },
        },
        42
      )
    );
  });
});
