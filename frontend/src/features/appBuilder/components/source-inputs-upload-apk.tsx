import { Button } from "@/ui/button";
import { Field, FieldLabel } from "@/ui/field";
import { FileUploadInput } from "@/ui/file-upload-input";
import { useSourceSelector } from "../contexts/source-selector.context";
import usePreUpload from "../hooks/usePreUpload";
import { Alert, AlertTitle } from "@/ui/alert";
import { AlertCircleIcon } from "lucide-react";

export default function SourceInputsUploadApk() {
  const [context, actions] = useSourceSelector();
  const { handlePreUpload, isLoading, error } = usePreUpload();
  return (
    <>
      <Field>
        {error && (
          <Alert variant="destructive" className="my-5">
            <AlertTitle><AlertCircleIcon />Something went wrong!</AlertTitle>
            {error}
          </Alert>
        )}
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
        onClick={handlePreUpload}
        disabled={isLoading || !context.file}
      >
        Upload
      </Button>
    </>
  );
}
