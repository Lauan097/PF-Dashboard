'use client';

import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Users, UserCheck, Clock, CalendarOff, TrendingUp, ShieldAlert,
  MessageSquare, Mic, Zap,
} from "lucide-react";
import ErrorPage from "../components/ErrorPage";
import { Skeleton } from "@/components/skeleton";
import { InitialPageData, UserStatEntry } from "@/types/globalData";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#818cf8", "#4f46e5", "#7c3aed", "#9333ea", "#a855f7"];

const FEATURE_LABELS: Record<string, string> = {
  batePonto: "Bate Ponto",
  artigos: "Artigos",
  ausencia: "Ausência",
  advertencia: "Advertência",
  ban: "Ban",
  promocao: "Promoção",
  rebaixamento: "Rebaixamento",
  reportarProblema: "Reportar Problema",
  ping: "Ping",
};

function formatVoice(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function StatCard({ icon: Icon, label, value, color, loading }: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 rounded-2xl bg-white/5 border border-white/8 px-5 py-4 backdrop-blur-sm"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-zinc-400">{label}</p>
        {loading
          ? <Skeleton className="mt-1 h-6 w-14 rounded-md" />
          : <p className="text-2xl font-bold text-white">{value.toLocaleString("pt-BR")}</p>
        }
      </div>
    </motion.div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500">
      {children}
    </h2>
  );
}

function LeaderboardCard({ title, icon: Icon, users, valueKey, formatter, loading }: {
  title: string;
  icon: React.ElementType;
  users: UserStatEntry[];
  valueKey: "voiceTime" | "messages";
  formatter: (v: number) => string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/8 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={16} className="text-indigo-400" />
        <span className="text-sm font-semibold text-zinc-200">{title}</span>
      </div>
      <div className="space-y-3">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-xl" />)
          : users.map((u, i) => {
              const val = u[valueKey];
              const max = users[0]?.[valueKey] || 1;
              const pct = Math.round((val / max) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 shrink-0 text-center text-xs font-bold text-zinc-500">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-300 truncate max-w-35">{u.displayName}</span>
                      <span className="text-xs font-mono text-indigo-400">{formatter(val)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10">
                      <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

export default function HomeDashboard() {
  const [data, setData] = useState<InitialPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const guildId = params.guildId as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/data/server-info?guildId=${guildId}`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || "Ocorreu um erro ao carregar dados do servidor.");
        }
      } catch {
        setError("Falha na comunicação com a API");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [guildId]);

  if (error) return (
    <ErrorPage title="Ops, algo deu errado" description={error} showDetails={false} />
  );

  const overview = data?.overview;
  const flow = data?.memberFlow.last30Days;
  const featureStats = data?.featureStats ?? [];
  const activePct = overview
    ? Math.round((overview.activeMembers / Math.max(overview.totalMembers, 1)) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-6 py-8 max-w-7xl mx-auto space-y-10"
    >
      <div className="flex flex-col items-center border-b border-white/10 pb-8">
        <h1 className="text-4xl font-bold text-white">Visão Geral</h1>
        <p className="text-sm text-zinc-500 mt-1">Resumo do sistema e estatísticas do servidor</p>
      </div>

      <section>
        <SectionTitle>Resumo</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <StatCard icon={Users}       label="Total de Fichas"    value={overview?.totalMembers ?? 0}       color="bg-indigo-600"  loading={loading} />
          <StatCard icon={UserCheck}   label="Membros Ativos"     value={overview?.activeMembers ?? 0}      color="bg-emerald-600" loading={loading} />
          <StatCard icon={Clock}       label="Sessões BP" value={overview?.totalPointSessions ?? 0} color="bg-violet-600"  loading={loading} />
          <StatCard icon={CalendarOff} label="Ausências Ativas"   value={overview?.activeAbsences ?? 0}     color="bg-amber-600"   loading={loading} />
          <StatCard icon={TrendingUp}  label="Promoções"          value={overview?.totalPromotions ?? 0}    color="bg-sky-600"     loading={loading} />
          <StatCard icon={ShieldAlert} label="Advertências"       value={overview?.totalWarnings ?? 0}      color="bg-red-600"     loading={loading} />
        </div>
      </section>

      <section>
        <SectionTitle>Análise</SectionTitle>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          <div className="rounded-2xl bg-white/5 border border-white/8 p-5">
            <p className="mb-4 text-sm font-semibold text-zinc-200">Fluxo de Membros (30 dias)</p>
            {loading ? <Skeleton className="h-48 w-full rounded-xl" /> : (
              <div style={{ height: 180 }}>
                <Bar
                  data={{
                    labels: ['Entradas', 'Saídas'],
                    datasets: [{
                      data: [flow?.joins ?? 0, flow?.leaves ?? 0],
                      backgroundColor: ['#6366f1', '#ef4444'],
                      borderRadius: 6,
                      barThickness: 48,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderWidth: 1,
                        titleColor: '#e4e4e7',
                        bodyColor: '#a1a1aa',
                        padding: 8,
                        cornerRadius: 8,
                      },
                    },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { color: '#71717a', font: { size: 12 } },
                        border: { display: false },
                      },
                      y: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#71717a', font: { size: 11 } },
                        border: { display: false },
                      },
                    },
                  }}
                />
              </div>
            )}
            {!loading && (
              <div className="mt-3 flex justify-around text-xs text-zinc-400">
                <span><span className="text-indigo-400 font-bold">+{flow?.joins ?? 0}</span> entradas</span>
                <span><span className="text-red-400 font-bold">-{flow?.leaves ?? 0}</span> saídas</span>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/8 p-5 flex flex-col">
            <p className="mb-4 text-sm font-semibold text-zinc-200">Taxa de Membros Ativos</p>
            {loading ? <Skeleton className="h-48 w-full rounded-xl" /> : (
              <div className="relative flex-1" style={{ minHeight: 160 }}>
                <Doughnut
                  data={{
                    datasets: [{
                      data: [activePct, 100 - activePct],
                      backgroundColor: ['#6366f1', 'rgba(255,255,255,0.06)'],
                      borderWidth: 0,
                      hoverOffset: 0,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: false },
                    },
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-3xl font-bold text-white">{activePct}%</p>
                  <p className="text-xs text-zinc-400">{overview?.activeMembers} / {overview?.totalMembers}</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/8 p-5">
            <p className="mb-4 text-sm font-semibold text-zinc-200">Distribuição de Eventos</p>
            {loading ? <Skeleton className="h-48 w-full rounded-xl" /> : (
              <>
                <div style={{ height: 160 }}>
                  <Doughnut
                    data={{
                      labels: ['Pontos', 'Promoções', 'Advertências'],
                      datasets: [{
                        data: [
                          overview?.totalPointSessions ?? 0,
                          overview?.totalPromotions ?? 0,
                          overview?.totalWarnings ?? 0,
                        ],
                        backgroundColor: ['#6366f1', '#10b981', '#ef4444'],
                        borderWidth: 0,
                        hoverOffset: 4,
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '62%',
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#18181b',
                          borderColor: '#27272a',
                          borderWidth: 1,
                          titleColor: '#e4e4e7',
                          bodyColor: '#a1a1aa',
                          padding: 8,
                          cornerRadius: 8,
                        },
                      },
                    }}
                  />
                </div>
                <div className="mt-3 flex justify-around text-xs text-zinc-400">
                  <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />Pontos</span>
                  <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />Promoções</span>
                  <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-500" />Advertências</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section>
        <SectionTitle>Funcionalidades Mais Utilizadas</SectionTitle>
        <div className="rounded-2xl bg-white/5 border border-white/8 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-indigo-400" />
            <span className="text-sm font-semibold text-zinc-200">Top 10 Features</span>
          </div>
          {loading ? (
            <Skeleton className="h-52 w-full rounded-xl" />
          ) : featureStats.length === 0 ? (
            <p className="text-xs text-zinc-500 py-8 text-center">Nenhum dado disponível ainda.</p>
          ) : (
            <div style={{ height: 260 }}>
              <Bar
                data={{
                  labels: featureStats.map(f => FEATURE_LABELS[f.featureName] ?? f.featureName),
                  datasets: [{
                    data: featureStats.map(f => f.usageCount),
                    backgroundColor: featureStats.map((_, i) => COLORS[i % COLORS.length]),
                    borderRadius: 5,
                    barThickness: 20,
                  }],
                }}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderWidth: 1,
                      titleColor: '#e4e4e7',
                      bodyColor: '#a1a1aa',
                      padding: 8,
                      cornerRadius: 8,
                      callbacks: {
                        label: (ctx) => ` ${ctx.parsed.x} usos`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: { color: 'rgba(255,255,255,0.05)' },
                      ticks: { color: '#71717a', font: { size: 11 } },
                      border: { display: false },
                    },
                    y: {
                      grid: { display: false },
                      ticks: { color: '#a1a1aa', font: { size: 12 } },
                      border: { display: false },
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionTitle>Leaderboard de Membros</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <LeaderboardCard
            title="Mais Tempo em Voz"
            icon={Mic}
            users={data?.topVoiceUsers ?? []}
            valueKey="voiceTime"
            formatter={formatVoice}
            loading={loading}
          />
          <LeaderboardCard
            title="Mais Mensagens"
            icon={MessageSquare}
            users={data?.topMessageUsers ?? []}
            valueKey="messages"
            formatter={(v) => v.toLocaleString("pt-BR")}
            loading={loading}
          />
        </div>
      </section>
    </motion.div>
  );
}
