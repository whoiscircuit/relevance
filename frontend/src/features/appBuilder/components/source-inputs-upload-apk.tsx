import { Button } from "@/ui/button";
import { Field, FieldLabel } from "@/ui/field";
import { FileUploadInput } from "@/ui/file-upload-input";
import { useSourceSelector } from "../contexts/source-selector.context";
import useComputeHashAndRedirect from "../hooks/usePreUpload";

export default function SourceInputsUploadApk() {
  const [context, actions] = useSourceSelector();
  const { handlePreUpload, isLoading, error } = useComputeHashAndRedirect();
  return (
    <>
      <Field>
        <FieldLabel>Upload Your APK File</FieldLabel>
        <FileUploadInput
          accepts=".apk,.xapk,.apks"
          defaultItemIcon={<img src="/icons/android.svg" alt="android icon" />}
          value={context.file ? [context.file] : []}
          onChange={(file) => actions.setFile(file[0])}
        />
      </Field>
      <Button
        className="w-full mt-10"
        onClick={handleCompute}
        disabled={isLoading}
      >
        Upload
      </Button>
    </>
  );
}
