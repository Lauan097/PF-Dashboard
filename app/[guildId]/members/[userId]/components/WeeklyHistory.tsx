"use client";

import { CheckCircle2, XCircle, Clock, Minus, History } from "lucide-react";

export interface WeekHistoryItem {
  weekStart: string;
  weekEnd: string;
  totalSeconds: number;
  effectiveGoalSeconds: number;
  isCurrent: boolean;
  status: "completed" | "failed" | "in_progress" | "no_goal";
}

interface WeeklyHistoryProps {
  weeks: WeekHistoryItem[];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function fmtHours(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

const STATUS_CONFIG = {
  completed: {
    icon: CheckCircle2,
    iconClass: "text-emerald-400",
    label: "Concluída",
    barClass: "bg-emerald-500",
    borderClass: "border-emerald-500/20",
    bgClass: "",
  },
  failed: {
    icon: XCircle,
    iconClass: "text-red-400",
    label: "Não atingida",
    barClass: "bg-red-500",
    borderClass: "border-red-500/20",
    bgClass: "",
  },
  in_progress: {
    icon: Clock,
    iconClass: "text-blue-400",
    label: "Em andamento",
    barClass: "bg-blue-500",
    borderClass: "border-blue-500/30",
    bgClass: "bg-blue-500/5",
  },
  no_goal: {
    icon: Minus,
    iconClass: "text-zinc-600",
    label: "Sem meta",
    barClass: "bg-zinc-700",
    borderClass: "border-white/5",
    bgClass: "",
  },
};

function WeekCard({ week }: { week: WeekHistoryItem }) {
  const config = STATUS_CONFIG[week.status];
  const Icon = config.icon;
  const progressPercent =
    week.effectiveGoalSeconds > 0
      ? Math.min(100, Math.round((week.totalSeconds / week.effectiveGoalSeconds) * 100))
      : 0;

  return (
    <div
      className={`flex flex-col gap-2.5 p-4 rounded-xl border ${config.borderClass} ${config.bgClass} ${week.isCurrent ? "ring-1 ring-blue-500/30" : ""} bg-[#222] relative`}
    >
      {week.isCurrent && (
        <span className="absolute top-2 right-2 text-[9px] uppercase tracking-widest text-blue-400 font-semibold bg-blue-500/10 px-1.5 py-0.5 rounded-full">
          Atual
        </span>
      )}

      <div className="flex items-center gap-1.5">
        <Icon size={13} className={config.iconClass} />
        <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
          {config.label}
        </span>
      </div>

      <p className="text-[10px] text-zinc-600">
        {fmtDate(week.weekStart)} — {fmtDate(week.weekEnd)}
      </p>

      <div className="flex items-end justify-between">
        <span className="text-lg font-bold text-zinc-100 leading-none">
          {fmtHours(week.totalSeconds)}
        </span>
        {week.effectiveGoalSeconds > 0 && (
          <span className="text-[10px] text-zinc-500">
            / {fmtHours(week.effectiveGoalSeconds)}
          </span>
        )}
      </div>

      {week.effectiveGoalSeconds > 0 && (
        <div className="space-y-1">
          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${config.barClass}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-600 text-right">{progressPercent}%</p>
        </div>
      )}
    </div>
  );
}

export default function WeeklyHistory({ weeks }: WeeklyHistoryProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <History size={15} className="text-zinc-400" />
        <h2 className="text-sm font-semibold text-zinc-200">
          Histórico de Metas Semanais
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {weeks.map((week) => (
          <WeekCard key={week.weekStart} week={week} />
        ))}
      </div>
    </div>
  );
}
