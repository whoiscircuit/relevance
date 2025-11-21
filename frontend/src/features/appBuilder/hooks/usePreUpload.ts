import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { set } from "idb-keyval";
import { useSourceSelector } from "../contexts/source-selector.context";

async function computeFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function preUpload(name: string, hash: string) {
  const response = await fetch("/api/pre-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, hash }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.statusText}`);
  }

  return (await response.json()) as { exists: boolean };
}

export default function useComputeHashAndRedirect() {
  const [context] = useSourceSelector();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!context.file) {
        throw new Error("No file selected");
      }

      // Compute hash
      const hash = await computeFileHash(context.file);

      // Send to server
      const data = await preUpload(context.file.name, hash);

      if (data.exists) {
        // File already exists, redirect to view it
        await navigate({ to: "/add", search: { hash } });
      } else {
        // File doesn't exist, save to IndexedDB and redirect to upload
        await set(`apk:${hash}`, {
          file: context.file,
          hash,
          name: context.file.name,
          uploadedAt: new Date().toISOString(),
        });
        await navigate({ to: "/add", search: { uploadId: hash } });
      }
    },
    onError: (error) => {
      console.error("Upload error:", error);
    },
  });

  const handleCompute = useCallback(() => {
    mutation.mutate();
  }, [mutation]);

  return {
    handleCompute,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
  };
}
