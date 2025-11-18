import { FileUploadInput } from "@/components/file-upload-input";
import ReportCard from "@/components/report-card";
import { Button } from "@/components/ui/button";
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

// Sample data
const REPORT_STEPS = [
  {
    name: "build-application",
    title: "Build Application",
    status: "success",
    progress: 100,
    logs: `$ npm run build
> @relevance/frontend@0.0.1 build
> tsc -b && vite build

vite v7.2.2 building for production...
✓ 156 modules transformed.
dist/index.html                   0.42 kB │ gzip:  0.24 kB
dist/assets/index-BpF3R5Jw.js   156.34 kB │ gzip: 48.32 kB
dist/assets/index-DzYrVkJO.css   12.45 kB │ gzip:  2.87 kB
✓ built in 4.23s`,
  },
  {
    name: "run-tests",
    title: "Run Tests",
    status: "running",
    progress: 60,
    logs: `$ npm test
PASS  src/app.controller.spec.ts
PASS  src/app.service.spec.ts
PASS  src/components/button.spec.ts
⏳ Running: src/utils/validation.spec.ts
⏳ Running: src/hooks/useForm.spec.ts`,
  },
  {
    name: "deploy-to-production",
    title: "Deploy to Production",
    status: "warning",
    progress: 75,
    logs: `$ npm run deploy
Deploying to production...
✓ Building artifacts
✓ Uploading files (234 MB)
⚠ Warning: Deployment took longer than expected
✓ Successfully deployed to production`,
  },
  {
    name: "security-scan",
    title: "Security Scan",
    status: "canceled",
    progress: 0,
    logs: `$ npm audit
Skipped: Deployment failed in previous step
Security scan canceled`,
  },
];

function RouteComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ReportCard steps={REPORT_STEPS} title="Report Card" />
      {/* <Card className="mx-auto max-w-3xl w-full">
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
      </Card> */}
    </div>
  );
}
