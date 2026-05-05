"use client";

import {
  Activity,
  Clock,
  ShieldAlert,
  CalendarDays,
  Users,
  BarChart3,
  CircleAlert,
  Rocket,
  Target,
  TriangleAlert,
  Plus,
  Minus,
  History
} from "lucide-react";
import { FaCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { MemberOverview } from "@/types/user";
import { ScrollShadow, Skeleton, Accordion } from "@heroui/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { DiscordIcon } from "@/app/components/DiscordIcons";
import WeeklyGoalCard from "./WeeklyGoalCard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Filler,
);

const sharedTooltip = {
  backgroundColor: "#202020",
  borderColor: "#ffffff10",
  borderWidth: 1,
  titleColor: "#a1a1aa",
  bodyColor: "#fff",
  bodyFont: { weight: "bold" as const },
  cornerRadius: 10,
  padding: 10,
} as const;

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3 h-105"
          >
            <Skeleton className="h-3.5 w-36 bg-zinc-800" />
            {[0, 1, 2, 3, 4, 5].map((j) => (
              <Skeleton key={j} className="h-9 w-full rounded-xl bg-zinc-800" />
            ))}
          </div>
        ))}
      </div>
      <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5">
        <Skeleton className="h-3.5 w-52 mb-6 bg-zinc-800" />
        <Skeleton className="h-52 w-full rounded-xl bg-zinc-800" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3"
          >
            <Skeleton className="h-3.5 w-36 bg-zinc-800" />
            {[0, 1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-9 w-full rounded-xl bg-zinc-800" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-4 text-zinc-600 text-xs text-center italic">
      {message}
    </div>
  );
}

interface OverviewTabProps {
  userId: string;
  guildId: string;
}

export default function OverviewTab({ userId, guildId }: OverviewTabProps) {
  const [overview, setOverview] = useState<MemberOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOverview() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/data/user/get-overview?guildId=${guildId}&userId=${userId}`,
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          setTimeout(() => {
            if (!cancelled) {
              setOverview(data.data);
              setLoading(false);
            }
          }, 400);
        } else {
          setError(data.error || "Erro ao carregar visão geral.");
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Erro ao carregar visão geral.");
          setLoading(false);
        }
      }
    }

    fetchOverview();
    return () => {
      cancelled = true;
    };
  }, [userId, guildId]);

  if (loading) return <OverviewSkeleton />;

  if (error || !overview) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",  
        }}
      > 
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-zinc-900/80 rounded-2xl flex items-center justify-center mb-3 border border-white/5">
            <CircleAlert className="text-yellow-400 w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-white">
            Nenhum dado disponível
          </p>
          <p className="text-xs text-zinc-500 max-w-70 mt-1">
            {error || "Este usuário não possui registros ou permissão para visualização."}
          </p>
        </div>  
      </div>
    );
  }

  const {
    timeCards,
    weeklyActivity,
    monthlyActivity,
    weeklyGoal,
    conductHistory,
    topPartners,
  } = overview;

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const weeklyChartData = {
    labels: weeklyActivity.map((w) => w.name),
    datasets: [
      {
        data: weeklyActivity.map((w) => w.horas),
        borderColor: "#3b82f6",
        borderWidth: 2.5,
        backgroundColor: "rgba(59,130,246,0.18)",
        fill: true,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#171717",
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
      },
    ],
  };

  const weeklyChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...sharedTooltip,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y}h de patrulha`,
          title: (items) => items[0].label,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#71717a", font: { size: 11 } },
      },
      y: {
        grid: { color: "#ffffff05" },
        border: { display: false },
        ticks: { color: "#71717a", font: { size: 11 } },
      },
    },
  };

  const monthlyChartData = {
    labels: monthlyActivity.map((m) => m.month),
    datasets: [
      {
        data: monthlyActivity.map((m) => m.horas),
        backgroundColor: "#f43f5e",
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 24,
      },
    ],
  };

  const monthlyChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...sharedTooltip,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y}h de patrulha`,
          title: (items) => items[0].label,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#71717a", font: { size: 11 } },
      },
      y: {
        grid: { color: "#ffffff05" },
        border: { display: false },
        ticks: { color: "#71717a", font: { size: 11 } },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3 h-100">
          <span className="text-zinc-400 text-xs font-semibold flex items-center gap-2 pb-2 border-b border-white/5">
            <Clock size={14} className="text-blue-500" /> Tempo em Serviço
          </span>
          {timeCards.map((t, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-[#222] p-2.5 rounded-xl border border-white/5"
            >
              <span className="text-zinc-300 text-xs flex items-center gap-2">
                <CalendarDays size={13} className="text-blue-400" />
                {t.name}
              </span>
              <span className="text-blue-400 font-semibold text-sm">
                {t.value}{t.suffix === "h" ? "h" : ` ${t.suffix}`}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 p-4 rounded-2xl flex flex-col gap-3 h-100">
          <span className="text-zinc-400 text-xs font-semibold flex items-center gap-2 pb-2 border-b border-white/5">
            <ShieldAlert size={14} className="text-indigo-500" /> Histórico de
            Conduta
          </span>
          <ScrollShadow className="space-y-2 [scrollbar-width:none] flex-1 overflow-y-auto">
            {conductHistory.length === 0 ? (
              <div className="flex flex-col flex-1 gap-3 h-full">
                <div className="flex flex-col items-center justify-center flex-1 text-center gap-3 py-4 bg-zinc-900/30 rounded-xl border border-white/5">
                  <History className="text-zinc-700 w-8 h-8" />
                  <p className="text-zinc-400 text-sm font-medium">Sem histórico de conduta</p>
                  <p className="text-zinc-600 text-xs max-w-48">
                    Nenhuma advertência, elogio ou mudança de cargo registrada para este usuário.
                  </p>
                </div>
              </div>
            ) : (
              <Accordion variant="surface">
                {conductHistory.map((r) => (
                  <Accordion.Item key={r.id}>
                    <Accordion.Heading>
                      <Accordion.Trigger className="gap-2">
                        {r.type === "praise" ? (
                          <Rocket className="text-green-400" size={16} />
                        ) : r.type === "warning" ? (
                          <TriangleAlert className="text-yellow-500" size={16} />
                        ) : (
                          <FaCircle className="text-blue-400" size={16} />
                        )}
                        {r.title} <p className="text-zinc-400 text-[9px]">{fmtDate(r.date)}</p>
                        <Accordion.Indicator />
                      </Accordion.Trigger>
                    </Accordion.Heading>
                    <Accordion.Panel>
                      <Accordion.Body className="p-4">
                        {r.description && 
                          <p>{r.description}</p>
                        }
                        {r.oldRole && r.newRole && (
                          <div className="text-sm space-y-2">
                            <p className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center gap-2">
                              <DiscordIcon name="roles" className="w-4 h-4" />
                              {r.newRole || "Desconhecido"}
                              <Plus className="ml-auto" />
                            </p>
                            <p className="p-2 bg-red-500/10 text-red-400 rounded-xl flex items-center gap-2">
                              <DiscordIcon name="roles" className="w-4 h-4" />
                              {r.oldRole || "Desconhecido"}
                              <Minus className="ml-auto" />
                            </p>
                          </div>
                        )}
                      </Accordion.Body>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </ScrollShadow>
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3 h-100">
          <span className="text-zinc-400 text-xs font-semibold flex items-center gap-2 pb-2 border-b border-white/5">
            <Target size={14} className="text-purple-500" /> Meta Semanal
          </span>
          <WeeklyGoalCard data={weeklyGoal} />
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5">
        <span className="text-zinc-400 text-xs font-semibold flex items-center gap-2 pb-3 border-b border-white/5 mb-4">
          <Activity size={14} className="text-blue-500" /> Atividade Semanal de
          Patrulhamento
        </span>
        <div className="h-52 w-full">
          <Line data={weeklyChartData} options={weeklyChartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3">
          <span className="text-zinc-400 text-xs font-semibold flex items-center gap-2 pb-2 border-b border-white/5">
            <Users size={14} className="text-emerald-500 border-[#d8bd24]" /> Parceiros
            Frequentes
          </span>
          {topPartners.length === 0 ? (
            <EmptyState message="Nenhum parceiro registrado neste período." />
          ) : (
            topPartners.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-[#222] p-2.5 rounded-xl border border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-400 border border-zinc-700">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-200 text-xs font-medium leading-none">
                      {p.name}
                    </span>
                    <span className="text-zinc-500 text-[11px] mt-0.5">
                      {p.tag}
                    </span>
                  </div>
                </div>
                <span className="text-emerald-400 font-semibold text-xs">
                  {p.patrols} patrulhas
                </span>
              </div>
            ))
          )}
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3">
          <span className="text-zinc-400 text-xs font-semibold flex items-center gap-2 pb-2 border-b border-white/5">
            <BarChart3 size={14} className="text-rose-500" /> Meses Mais Ativos
          </span>
          <div className="h-48 w-full mt-1">
            <Bar data={monthlyChartData} options={monthlyChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
