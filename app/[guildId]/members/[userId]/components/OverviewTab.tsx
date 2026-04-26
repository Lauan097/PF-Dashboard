"use client";

import {
  Activity,
  Clock,
  ShieldAlert,
  CalendarDays,
  Users,
  BarChart3,
  CircleAlert,
} from "lucide-react";
import { FaCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { MemberOverview } from "@/types/user";
import { Skeleton } from "@/components/skeleton";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
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
            className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3"
          >
            <Skeleton className="h-3.5 w-36 bg-zinc-800" />
            {[0, 1, 2].map((j) => (
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
          }, 800);
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
          <p className="text-xs text-zinc-500 max-w-[280px] mt-1">
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
    activeDaysData,
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

  const doughnutChartData = {
    labels: activeDaysData.map((d) => d.name),
    datasets: [
      {
        data: activeDaysData.map((d) => d.value),
        backgroundColor: activeDaysData.map((d) => d.color),
        borderColor: "#1a1a1a",
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutChartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: { display: false },
      tooltip: {
        ...sharedTooltip,
        callbacks: { label: (ctx) => ` ${ctx.parsed}%` },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3">
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
                {t.horas}h
              </span>
            </div>
          ))}
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3">
          <span className="text-zinc-400 text-xs font-semibold flex items-center gap-2 pb-2 border-b border-white/5">
            <ShieldAlert size={14} className="text-indigo-500" /> Histórico de
            Conduta
          </span>
          {conductHistory.length === 0 ? (
            <EmptyState message="Nenhum registro de conduta encontrado." />
          ) : (
            conductHistory.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-[#222] p-2.5 rounded-xl border border-white/5"
              >
                <span className="text-zinc-300 text-xs font-medium flex items-center gap-2">
                  <FaCircle
                    size={10}
                    className={
                      r.type === "warning"
                        ? "text-yellow-500"
                        : r.type === "praise"
                          ? "text-green-500"
                          : "text-blue-400"
                    }
                  />
                  {r.title}
                </span>
                <span className="text-zinc-500 text-xs">{fmtDate(r.date)}</span>
              </div>
            ))
          )}
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3">
          <span className="text-zinc-400 text-xs font-semibold flex items-center gap-2 pb-2 border-b border-white/5">
            <CalendarDays size={14} className="text-purple-500" /> Turnos Mais
            Ativos
          </span>
          <div className="h-36 w-full mt-1">
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>
          <div className="flex flex-col gap-1.5 mt-1">
            {activeDaysData.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs text-zinc-400"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                {d.name}
                <span className="ml-auto text-zinc-300 font-medium">
                  {d.value}%
                </span>
              </div>
            ))}
          </div>
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
            <Users size={14} className="text-emerald-500" /> Parceiros
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
