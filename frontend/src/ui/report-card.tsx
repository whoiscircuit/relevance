"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Progress } from "@/ui/progress";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/ui/accordion";
import { CheckCircle2, AlertCircle, XCircle, Minus, Loader, CircleXIcon } from "lucide-react";
import type { AppBuilderStep, AppBuilderConnectionState, StepStatus } from "@relevance/shared";

function getStatusIcon(status: StepStatus) {
  switch (status) {
    case "success":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "warning":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "error":
      return <XCircle className="h-5 w-5 text-red-500" />;
    case "cancelled":
      return <CircleXIcon className="h-5 w-5 text-gray-400"/>
    case "running":
      return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
    case "waiting":
      return <Minus className="h-5 w-5 text-gray-400" />;
    default:
      return null;
  }
}

function getProgressBarColor(status: StepStatus): string {
  switch (status) {
    case "success":
      return "bg-green-500";
    case "warning":
      return "bg-yellow-500";
    case "error":
      return "bg-red-500";
    case "cancelled":
      return "bg-gray-400";
    case "waiting":
      return "bg-blue-500";
    default:
      return "bg-blue-500";
  }
}

function ReportStep({ step }: { step: AppBuilderStep }) {
  const [currentProgress, setCurrentProgress] = useState(step.progress);

  useEffect(() => {
    setCurrentProgress(step.progress);
  }, [step.progress]);

  const statusLabel = step.status === "waiting" ? "Waiting" : `${Math.round(currentProgress)}% complete`;

  return (
    <AccordionItem
      value={`step-${step.name}`}
      className="border-b last:border-b-0"
    >
      <AccordionTrigger className="cursor-pointer px-6 py-4 hover:bg-accent transition-colors data-[state=open]:bg-accent">
        <div className="flex items-start gap-3 w-full">
          {/* Status Icon */}
          <div className="shrink-0 pt-0.5">{getStatusIcon(step.status)}</div>

          {/* Content */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium text-sm text-foreground">
                {step.title}
              </h3>
            </div>

            {/* Progress Bar */}
            {typeof step.progress === "number" && (
              <div className="mt-2">
                <Progress
                  value={currentProgress}
                  className="h-1"
                  indicatorClassName={getProgressBarColor(step.status)}
                />
              </div>
            )}

            {typeof step.progress === "number" && (
              <p className="text-xs text-muted-foreground mt-1 animate-in fade-in duration-500 delay-100">
                {statusLabel}
              </p>
            )}
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-6 pb-4 bg-secondary/50">
        <div className="text-xs text-muted-foreground">{step.description}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function ReportCard({ state }: { state: AppBuilderConnectionState }) {
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>{state.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue={state.steps.find((step) => step.status === "waiting")?.name}
        >
          {state.steps.map((step) => (
            <ReportStep key={step.name} step={step} />
          ))}
        </Accordion>
        {state.log && (
          <div className="px-6 pb-4">
            <div className="bg-background rounded-lg border border-secondary p-3">
              <pre className="text-xs text-foreground font-mono overflow-x-auto whitespace-pre-wrap wrap-break-words">
                {state.log}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
