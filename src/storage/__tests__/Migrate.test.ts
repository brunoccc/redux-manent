import { Reducer } from "redux";
import { Config, sanitizeConfig } from "../../config";
import { readyAction } from "../../state";
import { NullStorage } from "../Storage";
import { migrateState } from "../Migration";
import * as SaverModule from "../../storage/Saver";

jest.mock("../../storage/Saver");

describe("Migrate", () => {
  it("should properly migrate the loaded version", async () => {
    const mockLoadedState = {
      item1: { value: 1 },
      item2: { value: 2 },
    };
    const mockMigratedState = {
      item_a: { text: "Hello" },
      item_b: { text: "World" },
    };
    const mockMigrate = jest.fn().mockReturnValue(mockMigratedState);
    const mockSaveState = jest.spyOn(SaverModule, "saveState");
    const config: Config = sanitizeConfig({
      reducer: {
        item1: {} as Reducer,
        item2: {} as Reducer,
        item3: {} as Reducer,
      },
      storage: NullStorage,
      migrateState: mockMigrate,
      version: 43,
    });
    const mockDispatch = jest.fn();

    await migrateState(mockDispatch, config, mockLoadedState, 42);

    // Should have migrated the state...
    expect(mockMigrate).toHaveBeenCalledWith(mockLoadedState, 42, 43);
    // ...saved it...
    expect(mockSaveState).toHaveBeenCalledWith(
      mockLoadedState,
      mockMigratedState,
      config,
      true
    );
    // ...and moved on
    expect(mockDispatch).toHaveBeenCalledWith(
      readyAction(mockMigratedState, 43)
    );
  });
});
