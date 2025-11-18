import { makeContext } from "@/lib/makeContext";

export const [SourceSelectorProvider, useSourceSelector] = makeContext({
  state: {
    test: 1,
  },
  actions: {
    setTest: (state, increment: number) => ({
      test: state.test + increment,
    }),
  },
  selectors: {
    doubleTest: (state) => state.test * 2,
  },
});
