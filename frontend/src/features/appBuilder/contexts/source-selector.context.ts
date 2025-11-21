import { makeContext } from "@/lib/makeContext";
import type { ApkSourceNames } from "@relevance/shared/index";

interface SourceSelectorState {
  selectedSource?: ApkSourceNames;
  file?: File;
  hasAcceptedResigning: boolean;
  showResigningWarningDialog: boolean;
}

export const [SourceSelectorProvider, useSourceSelector] = makeContext({
  state: {
    selectedSource: undefined,
    file: undefined,
    hasAcceptedResigning: false,
    showResigningWarningDialog: false,
  } as SourceSelectorState,
  actions: {
    setSelectedSource(state, sourceName: ApkSourceNames) {
      return { ...state, selectedSource: sourceName };
    },
    setFile(state, file: File) {
      if (!file) return { ...state, file: undefined };
      const fileName = file.name.toLowerCase();
      const ext = fileName.split(".").pop();
      const isApksOrXapk = ext === "apks" || ext === "xapk";
      if (isApksOrXapk && !state.hasAcceptedResigning) {
        return { ...state, file, showResigningWarningDialog: true };
      } else {
        return { ...state, file, showResigningWarningDialog: false };
      }
    },
    acceptResigning(state) {
      return {
        ...state,
        hasAcceptedResigning: true,
        showResigningWarningDialog: false,
      };
    },
    rejectResigning(state) {
      return {
        ...state,
        file: undefined,
        hasAcceptedResigning: false,
        showResigningWarningDialog: false,
      };
    },
  },
  debug: true,
});
