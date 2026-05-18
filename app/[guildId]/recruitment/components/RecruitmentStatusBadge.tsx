"use client";

import { RecruitmentStatus } from "@/types/recruitment";
import { Clock, CheckCircle2, XCircle, LoaderCircle } from "lucide-react";

const config: Record<
  RecruitmentStatus,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  Upcoming: {
    label: "Em breve",
    icon: <Clock size={13} />,
    classes:
      "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  },
  Open: {
    label: "Aberto",
    icon: <CheckCircle2 size={13} />,
    classes:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  InProgress: {
    label: "Em Progresso",
    icon: <LoaderCircle className="animate-spin" size={13} />,
    classes:
      "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  },
  Closed: {
    label: "Encerrado",
    icon: <XCircle size={13} />,
    classes: "bg-neutral-500/15 text-neutral-400 border border-neutral-500/30",
  },
};

interface Props {
  status: RecruitmentStatus;
  size?: "sm" | "md" | "lg";
}

export default function RecruitmentStatusBadge({ status, size = "md" }: Props) {
  const { label, icon, classes } = config[status] ?? config.Closed;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium select-none text-xs font-semibold ${classes} ${
        size === "sm"
          ? "px-2 py-0.5 text-[11px]"
          : size === "lg"
          ? "px-3.5 py-1.25 text-sm"
          : "px-3 py-1 text-xs"
      }`}
    >
      {icon}
      {label}
    </span>
  );
}
