import { useEffect, useMemo, useRef, useState } from "react";
import ReportCard from "@/ui/report-card";
import type { AppBuilderConnectionState, AppBuilderStep } from "@relevance/shared";
import { io, Socket } from "socket.io-client";

export default function ReportCardWrapper({ connectionId }: { connectionId: string }) {
  const [state, setState] = useState<AppBuilderConnectionState | null>(null);
  const seqRef = useRef<number>(0);

  useEffect(() => {
    const socket = io(`/app-builder`, {
      query: { connectionId },
      path: "/socket.io",
    });
    console.log(socket)

    socket.on("connected", () => {
      socket.emit("get_state");
      console.log("get_state")
    });

    socket.on("state", (payload: { state: AppBuilderConnectionState; seq: number }) => {
      console.log("state +>",payload.state)
      seqRef.current = payload.seq;
      setState(payload.state);
    });

    socket.on(
      "step_patch",
      (payload: { name: string; changes: Partial<Omit<AppBuilderStep, "name">>; seq: number }) => {
        if (payload.seq !== seqRef.current + 1) {
          socket.emit("get_state");
          return;
        }
        seqRef.current = payload.seq;
        setState((prev) => {
          if (!prev) return prev;
          const idx = prev.steps.findIndex((s) => s.name === payload.name);
          if (idx < 0) return prev;
          const updated = { ...prev.steps[idx], ...payload.changes } as AppBuilderStep;
          const next: AppBuilderConnectionState = {
            ...prev,
            steps: [...prev.steps.slice(0, idx), updated, ...prev.steps.slice(idx + 1)],
          };
          return next;
        });
      },
    );

    socket.on("log_update", (payload: { mode: "append" | "set"; delta: string; seq: number }) => {
      if (payload.seq !== seqRef.current + 1) {
        socket.emit("get_state");
        return;
      }
      seqRef.current = payload.seq;
      setState((prev) => {
        if (!prev) return prev;
        const nextLog = payload.mode === "set" ? payload.delta : (prev.log ?? "") + payload.delta;
        return { ...prev, log: nextLog };
      });
    });

    return () => {
      socket.off("connected");
      socket.off("state");
      socket.off("step_patch");
      socket.off("log_update");
      socket.disconnect();
    };
  }, [connectionId]);

  if (!state) {
    return <div className="text-sm text-muted-foreground">Loading state…</div>;
  }

  return <ReportCard state={state} />;
}