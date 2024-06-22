export interface Serializer {
  serialize: (o: object) => string;
  deserialize: (s: string) => object;
}

export const DefaultSerializer: Serializer = {
  serialize: (o) => {
    return JSON.stringify(o);
  },
  deserialize: (s) => {
    return JSON.parse(s);
  },
};
