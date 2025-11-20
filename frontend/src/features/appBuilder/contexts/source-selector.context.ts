import { makeContext } from "@/lib/makeContext";
import type { ApkSourceNames } from "@relevance/shared/index";

interface SourceSelectorState {
  selectedSource?: ApkSourceNames;
  file?: File;
}

export const [SourceSelectorProvider, useSourceSelector] = makeContext({
  state: {
    selectedSource: undefined,
    file: undefined,
  } as SourceSelectorState,
  actions: {
    setSelectedSource(state, payload: ApkSourceNames) {
      return { ...state, selectedSource: payload };
    },
    setFile(state, payload: File) {
      return { ...state, file: payload };
    },
  },
  debug: true,
});
