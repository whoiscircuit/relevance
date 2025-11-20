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
import { useSourceSelector } from "../contexts/source-selector.context";
import { apkSources } from "@relevance/shared";

export default function SourceSelector() {
  const [context, actions] = useSourceSelector();
  return (
    <FieldGroup className="mb-10">
      <Field>
        <FieldLabel>
          <DownloadIcon />
          APK Source
        </FieldLabel>
        <Select
          value={context.selectedSource ?? ""}
          onValueChange={actions.setSelectedSource}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Source for your APK" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {apkSources.map((source) => (
                <SelectItem
                  key={source.value}
                  value={source.value}
                  disabled={source.disabled}
                >
                  {source.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  );
}
