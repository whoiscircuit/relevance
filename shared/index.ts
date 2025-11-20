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
