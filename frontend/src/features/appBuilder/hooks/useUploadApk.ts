import { useCallback, useState } from "react";
import { get, clear } from "idb-keyval";

const CHUNK_SIZE = 4 * 1024 * 1024; // 4 MiB

type UploadResult = {
  uploadedBytes: number;
  complete: boolean;
};

export default function useUploadApk() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (connectionId: string) => {
    setIsUploading(true);
    setError(null);
    try {
      const hash = (await get<string>("current-file-hash")) || null;
      if (!hash) throw new Error("No current file hash in IndexedDB");
      const stored = (await get<{ file: File; hash: string }>(`file:${hash}`)) || null;
      if (!stored || !stored.file) throw new Error("No stored file for hash");
      const file = stored.file;

      // Get server offset
      const statusRes = await fetch(`/api/app-builder/upload/status?connectionId=${encodeURIComponent(connectionId)}&hash=${encodeURIComponent(hash)}`);
      if (!statusRes.ok) throw new Error(`Status check failed: ${statusRes.statusText}`);
      const status = (await statusRes.json()) as { uploadedBytes: number; expectedBytes?: number | null };
      let offset = status.uploadedBytes || 0;

      while (offset < file.size) {
        const end = Math.min(offset + CHUNK_SIZE, file.size);
        const chunk = file.slice(offset, end);
        const contentRange = `bytes ${offset}-${end - 1}/${file.size}`;
        const res = await fetch(`/api/app-builder/upload?connectionId=${encodeURIComponent(connectionId)}&hash=${encodeURIComponent(hash)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Range": contentRange,
          },
          body: chunk,
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Upload failed: ${res.status} ${text}`);
        }
        const data = (await res.json()) as UploadResult;
        offset = data.uploadedBytes;
        if (data.complete) break;
      }

      // Wipe IndexedDB after successful upload
      await clear();
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { upload, isUploading, error };
}