import { FileUploadInput } from "@/ui/file-upload-input";
import ReportCard from "@/ui/report-card";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/ui/field";
import {
  Select,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/ui/select";
import { createFileRoute } from "@tanstack/react-router";
import {
  CloudUploadIcon,
  DownloadIcon,
  PackageIcon,
  PackagePlus,
} from "lucide-react";
import Container from "@/ui/container";
import SourceSelectorCard from "@/features/appBuilder/components/source-selector-card";
import { SourceSelectorProvider } from "@/features/appBuilder/contexts/source-selector.context";

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
    <Container>
      <SourceSelectorProvider>
        <SourceSelectorCard />
      </SourceSelectorProvider>
    </Container>
  );
}
