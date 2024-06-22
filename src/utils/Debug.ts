const createLogger = () => {
  let verbose = false;
  if (process.env.NODE_ENV !== "production") {
    return {
      d: (...optionalParameters: any[]) => {
        console.log("[redux-manent] D", ...optionalParameters);
      },
      v: (...optionalParameters: any[]) => {
        if (verbose) {
          console.log("[redux-manent] V", ...optionalParameters);
        }
      },
      e: (...optionalParameters: any[]) => {
        console.log("[redux-manent] E", ...optionalParameters);
      },
      setVerbose: (enabled: boolean) => {
        verbose = enabled;
      },
    };
  }
  return {};
};

export const Log = createLogger();
