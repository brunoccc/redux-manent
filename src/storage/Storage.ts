export interface Storage {
  getItem: (key: string) => any;
  setItem: (key: string, value: any) => void;
  removeItem: (key: string) => void;
}

export const NullStorage: Storage = {
  getItem: (_key: string) => undefined,
  setItem: (_key: string, value: any) => {},
  removeItem: (_key: string) => {},
};
