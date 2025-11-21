import Container from "@/ui/container";
import ReportCardWrapper from "@/features/appBuilder/components/report-card-wrapper";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/add/$connectionId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { connectionId } = Route.useParams();
  return (
    <Container>
      <ReportCardWrapper connectionId={connectionId} />
    </Container>
  );
}