import Container from "@/ui/container";
import ReportCardWrapper from "@/features/appBuilder/components/report-card-wrapper";
import { createFileRoute } from "@tanstack/react-router";
import FileUploader from "@/features/appBuilder/components/file-uploader";

export const Route = createFileRoute("/add/upload/$connectionId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { connectionId } = Route.useParams();
  
  return (
    <Container>
      <FileUploader connectionId={connectionId} />
      <ReportCardWrapper connectionId={connectionId} />
    </Container>
  );
}