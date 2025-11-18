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
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Minus,
  Loader,
} from "lucide-react";

interface ReportStep {
  name: string;
  title: string;
  status: "success" | "warning" | "error" | "canceled" | "running";
  progress?: number;
  logs?: string;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "success":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "warning":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "error":
      return <XCircle className="h-5 w-5 text-red-500" />;
    case "canceled":
      return <Minus className="h-5 w-5 text-gray-400" />;
    case "running":
      return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
    default:
      return null;
  }
}

function getProgressBarColor(status: string): string {
  switch (status) {
    case "success":
      return "bg-green-500";
    case "warning":
      return "bg-yellow-500";
    case "error":
      return "bg-red-500";
    case "canceled":
      return "bg-gray-400";
    case "running":
      return "bg-blue-500";
    default:
      return "bg-blue-500";
  }
}

function ReportStep({ step }: { step: ReportStep }) {
  const [currentProgress, setCurrentProgress] = useState(step.progress ?? 0);

  // Simulate progress updates for running steps
  useEffect(() => {
    if (step.status !== "running") {
      setCurrentProgress(step.progress ?? 0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentProgress((prev) => {
        const increment = Math.random() * 15;
        const newProgress = Math.min(prev + increment, 95);
        return newProgress;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [step.status, step.progress]);

  const statusLabel =
    step.status === "running"
      ? "Running"
      : `${Math.round(currentProgress)}% complete`;

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
            {step.progress !== undefined && (
              <div className="mt-2">
                <Progress
                  value={currentProgress}
                  className="h-1"
                  indicatorClassName={getProgressBarColor(step.status)}
                />
              </div>
            )}

            {step.progress !== undefined && (
              <p className="text-xs text-muted-foreground mt-1 animate-in fade-in duration-500 delay-100">
                {statusLabel}
              </p>
            )}
          </div>
        </div>
      </AccordionTrigger>

      {/* Accordion Body */}
      {step.logs && (
        <AccordionContent className="px-6 pb-4 bg-secondary/50">
          <div className="bg-background rounded-lg border border-secondary p-3">
            <pre className="text-xs text-foreground font-mono overflow-x-auto whitespace-pre-wrap wrap-break-words">
              {step.logs}
            </pre>
          </div>
        </AccordionContent>
      )}
    </AccordionItem>
  );
}

interface ReportCardProps {
  title: string;
  steps: ReportStep[];
  description?: string;
}

export default function ReportCard({
  title,
  steps,
  description,
}: ReportCardProps) {
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue={steps.find((step) => step.status === "running")?.name}
        >
          {steps.map((step) => (
            <ReportStep key={step.name} step={step} />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
