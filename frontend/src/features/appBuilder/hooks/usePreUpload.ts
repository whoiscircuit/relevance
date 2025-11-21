import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAppBuilderControllerPreUpload } from "@/api/endpoints/app-builder/app-builder";
import { set } from "idb-keyval";
import { useSourceSelector } from "../contexts/source-selector.context";
import type { AppBuilderFileType } from "@relevance/shared";

async function computeFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function preUpload(hash: string, filetype: AppBuilderFileType) {
  const response = await fetch("/app-builder/pre-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ hash, filetype }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.statusText}`);
  }

  return (await response.json()) as { connectionId: string };
}

export default function usePreUpload() {
  const [context] = useSourceSelector();
  const navigate = useNavigate();

  const mutation = useAppBuilderControllerPreUpload({
    mutation: {
      mutationKey: ["pre-upload"],
    },
  });

  const handlePreUpload = useCallback(async () => {
    try {
      if (!context.file) {
        throw new Error("No file selected");
      }

      // Compute hash
      const hash = await computeFileHash(context.file);

      // Determine filetype from extension
      const fileName = context.file.name.toLowerCase();
      const ext = fileName.split(".").pop() as string;
      const filetype = (ext === "apk" || ext === "xapk" || ext === "apks"
        ? ext
        : "apk") as AppBuilderFileType;

      // Save file locally for later upload/reference
      await set(`file:${hash}`, {
        file: context.file,
        hash,
        name: context.file.name,
        uploadedAt: new Date().toISOString(),
      });

      // Send to server
      const res = await mutation.mutateAsync({ data: { hash, filetype } });
      const { connectionId } = res.data;

      // Route to report page
      await navigate({ to: `/add/${connectionId}` });
    } catch (error) {
      console.error("Upload error:", error);
    }
  }, [context.file, navigate, mutation]);

  return {
    handlePreUpload,
    isLoading: mutation.isPending,
    error: (mutation.error as Error | undefined)?.message || null,
  };
}
