import { Card, CardContent, CardHeader } from "@/ui/card";
import SourceSelector from "./source-selector";
import { PackagePlus } from "lucide-react";
import { useSourceSelector } from "../contexts/source-selector.context";
import SourceInputsUploadApk from "./source-inputs-upload-apk";

export default function SourceInputsCard() {
  const [context, actions] = useSourceSelector();
  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <h1>
          <PackagePlus />
          Add New APK
        </h1>
      </CardHeader>
      <CardContent>
        <SourceSelector />
        {context.selectedSource === "upload-apk" && <SourceInputsUploadApk />}
      </CardContent>
    </Card>
  );
}
