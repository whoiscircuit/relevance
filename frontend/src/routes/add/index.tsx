import { FileUploadInput } from "@/components/file-upload-input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { createFileRoute } from "@tanstack/react-router";
import {
  CloudUploadIcon,
  DownloadIcon,
  PackageIcon,
  PackagePlus,
} from "lucide-react";

export const Route = createFileRoute("/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card>
      <CardHeader>
        <h1>
          <PackagePlus />
          Add New APK
        </h1>
      </CardHeader>
      <CardContent>
        <FieldGroup>
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
            <FileUploadInput />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
