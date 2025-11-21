export const apkSources = [
  {
    value: "upload-apk",
    label: "Upload APK",
    disabled: false,
  },
  {
    value: "apkpure",
    label: "APKPure",
    disabled: true,
  },
  {
    value: "download-from-url",
    label: "Download from URL",
    disabled: true,
  },
  {
    value: "google-play",
    label: "Google Play Store",
    disabled: true,
  }
] as const;

export type ApkSourceNames = typeof apkSources[number]["value"];

export type AppBuilderFileType = "apk" | "xapk" | "apks";

export type StepStatus =
  | "success"
  | "error"
  | "warning"
  | "cancelled"
  | "running"
  | "waiting";

export type AppBuilderStep = {
  progress: number;
  status: StepStatus;
  title: string;
  name: string;
  description: string;
  error?: string;
};

export type AppBuilderConnectionState = {
  title: string;
  steps: AppBuilderStep[];
  log?: string;
};
