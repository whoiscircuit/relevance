import React from "react";
import useUploadApk from "@/features/appBuilder/hooks/useUploadApk";

export default function FileUploader({ connectionId }: { connectionId: string }) {
  const {upload, isUploading, error} = useUploadApk();
  React.useEffect(()=>{
    upload(connectionId);
    return ()=>{};
  },[])
  return <></>;
}