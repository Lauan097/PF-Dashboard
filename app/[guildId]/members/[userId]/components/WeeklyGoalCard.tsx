"use client";

import {
  CheckCircle2,
  TrendingUp,
  Trophy,
  Zap,
  CalendarDays,
  Flame,
  Timer,
  Gauge,
  Hash,
  Calendar1,
} from "lucide-react";
import type { WeeklyGoalData } from "@/types/user";
import { formatDate, formatTime } from "@/utils/timeFormat";

interface WeeklyGoalCardProps {
  data: WeeklyGoalData;
}

function StatBox({
  icon: Icon,
  label,
  value,
  color = "text-zinc-200",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-[#222] p-2.5 rounded-xl border border-white/5">
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
        <Icon size={9} />
        {label}
      </p>
      <p className={`text-sm font-semibold mt-0.5 ${color}`}>{value}</p>
    </div>
  );
}

export default function WeeklyGoalCard({ data }: WeeklyGoalCardProps) {
  const {
    status,
    goalSeconds,
    currentWeekSeconds,
    progressPercent,
    sessionsThisWeek,
    goalMetAt,
    goalMetDay,
    isRecord,
    bestWeekSeconds,
  } = data;

  const remainingSeconds = Math.max(0, goalSeconds - currentWeekSeconds);
  const avgSecsPerSession =
    sessionsThisWeek > 0 ? Math.round(currentWeekSeconds / sessionsThisWeek) : 0;
  const todayDow = new Date().getDay();
  const daysLeft = 6 - todayDow;
  const requiredDailySeconds =
    daysLeft > 0 ? Math.round(remainingSeconds / daysLeft) : remainingSeconds;

  if (status === "no_goal") {
    return (
      <div className="flex flex-col flex-1 gap-3">
        <div className="flex flex-col items-center justify-center flex-1 text-center gap-3 py-4 bg-zinc-900/30 rounded-xl border border-white/5">
          <Calendar1 className="text-zinc-700 w-8 h-8" />
          <p className="text-zinc-400 text-sm font-medium">Sem meta definida</p>
          <p className="text-zinc-600 text-xs max-w-48">
            Configure uma meta semanal na edição da ficha.
          </p>
        </div>
        {bestWeekSeconds > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <StatBox icon={Flame} label="Melhor Semana" value={formatTime(bestWeekSeconds)} />
            <StatBox icon={Hash} label="Sessões (total)" value={`${sessionsThisWeek}`} />
          </div>
        )}
      </div>
    );
  }

  if (status === "not_started") {
    return (
      <div className="flex flex-col flex-1 gap-3">
        <div className="flex flex-col items-center justify-center flex-1 text-center gap-2 py-4 bg-zinc-900/30 rounded-xl border border-white/5">
          <Zap className="text-zinc-600 w-7 h-7" />
          <p className="text-zinc-400 text-sm font-medium">Semana não iniciada</p>
          <p className="text-zinc-500 text-xs">
            Meta:{" "}
            <span className="text-zinc-300 font-semibold">{formatTime(goalSeconds)}</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatBox icon={Calendar1} label="Meta Semanal" value={formatTime(goalSeconds)} color="text-purple-300" />
          <StatBox
            icon={Flame}
            label="Melhor Semana"
            value={bestWeekSeconds > 0 ? formatTime(bestWeekSeconds) : "—"}
          />
          <StatBox icon={Timer} label="Dias Restantes" value={`${daysLeft}`} />
          <StatBox
            icon={Gauge}
            label="Ritmo Necessário"
            value={daysLeft > 0 ? `${formatTime(Math.round(goalSeconds / daysLeft))}/dia` : "—"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 flex-1">
      {status === "completed" ? (
        <div className="flex items-start gap-2.5 bg-green-950/30 border border-green-800/30 p-3 rounded-xl">
          <CheckCircle2 className="text-green-400 w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-green-400 text-xs font-bold uppercase tracking-wider">
              Meta Cumprida!
            </p>
            {goalMetAt && (
              <p className="text-zinc-400 text-[11px] mt-0.5 truncate">
                {goalMetDay} · {formatDate(goalMetAt, false)}
              </p>
            )}
          </div>
          {isRecord && (
            <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold bg-amber-950/40 border border-amber-700/30 px-2 py-1 rounded-lg shrink-0">
              <Trophy size={10} />
              Recorde!
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-blue-950/20 border border-blue-800/20 p-3 rounded-xl">
          <TrendingUp className="text-blue-400 w-4 h-4 shrink-0" />
          <p className="text-blue-300 text-xs font-semibold">
            Em Progresso — {progressPercent}%
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-zinc-500">
          <span>{formatTime(currentWeekSeconds)} concluídas</span>
          <span>Meta: {formatTime(goalSeconds)}</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              status === "completed" ? "bg-green-500" : "bg-blue-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatBox icon={CalendarDays} label="Sessões" value={String(sessionsThisWeek)} />
        <StatBox
          icon={Flame}
          label="Melhor Semana"
          value={bestWeekSeconds > 0 ? formatTime(bestWeekSeconds) : "Não achei..."}
        />
        <StatBox
          icon={Timer}
          label={status === "completed" ? "Total Atingido" : "Restante"}
          value={status === "completed" ? formatTime(currentWeekSeconds) : formatTime(remainingSeconds)}
          color={status === "completed" ? "text-green-400" : "text-zinc-200"}
        />
        <StatBox
          icon={Gauge}
          label={status === "completed" ? "Média/Sessão" : "Ritmo Necessário"}
          value={
            status === "completed"
              ? avgSecsPerSession > 0 ? formatTime(avgSecsPerSession) : "—"
              : daysLeft > 0 ? `${formatTime(requiredDailySeconds)}/dia` : "—"
          }
        />
      </div>

      {status === "completed" && isRecord && (
        <div className="flex items-center gap-2 bg-amber-950/20 border border-amber-800/20 p-2.5 rounded-xl text-xs text-amber-300">
          <Trophy size={12} className="shrink-0" />
          <span>Esta é a melhor semana registrada!</span>
        </div>
      )}
    </div>
  );
}