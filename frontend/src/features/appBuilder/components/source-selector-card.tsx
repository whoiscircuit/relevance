import { Card, CardContent, CardHeader } from "@/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Button } from "@/ui/button";
import { FileUploadInput } from "@/ui/file-upload-input";
import { DownloadIcon, PackagePlus } from "lucide-react";

export default function SourceSelectorCard() {
  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <h1>
          <PackagePlus />
          Add New APK
        </h1>
      </CardHeader>
      <CardContent>
        <FieldGroup className="mb-10">
          <Field>
            <FieldLabel>
              <DownloadIcon />
              APK Source
            </FieldLabel>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a Source for your APK" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="upload-apk">Upload APK</SelectItem>
                  <SelectItem value="apkpure" disabled>
                    APKPure
                  </SelectItem>
                  <SelectItem value="download-from-url" disabled>
                    Donwload from URL
                  </SelectItem>
                  <SelectItem value="google-play" disabled>
                    Google Play Store
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Upload Your APK File</FieldLabel>
            <FileUploadInput
              accepts=".apk,.xapk,.apks"
              defaultItemIcon={
                <img src="/icons/android.svg" alt="android icon" />
              }
            />
          </Field>
        </FieldGroup>
        <Button className="w-full">Upload</Button>
      </CardContent>
    </Card>
  );
}
