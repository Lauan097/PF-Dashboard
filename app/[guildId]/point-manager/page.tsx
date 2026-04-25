"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  CheckCircle2,
  XCircle,
  Target,
  Clock,
  Trophy,
  MessageSquare,
  Mic,
  Pencil,
  Save,
  X,
  Users,
  Percent,
  RefreshCw,
  CalendarRange,
  MinusCircle,
} from "lucide-react";
import { toast } from "sonner";
import ErrorPage from "@/app/components/ErrorPage";
import { Skeleton } from "@/components/skeleton";
import { variants } from "@/types/animate";
import { PointManagerData, PointManagerMember } from "@/types/globalData";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function formatTime(seconds: number): string {
  if (seconds <= 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function secondsToHoursMinutes(seconds: number): {
  hours: number;
  minutes: number;
} {
  return {
    hours: Math.floor(seconds / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
  };
}

function hoursMinutesToSeconds(hours: number, minutes: number): number {
  return hours * 3600 + minutes * 60;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

// Remove prefixo de tag e ID numérico do nome para exibição no eixo do gráfico
// Ex: "[PP1] · Harry「12834」" → "Harry"
function shortLabel(name: string): string {
  return (
    name
      .replace(/^\[.*?\]\s*·\s*/, "")
      .replace(/「.*?」/, "")
      .trim() || name
  );
}

const CHART_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#818cf8",
  "#4f46e5",
  "#7c3aed",
  "#9333ea",
  "#a855f7",
  "#c4b5fd",
  "#ddd6fe",
];

const BAR_OPTIONS = {
  indexAxis: "y" as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#18181b",
      borderColor: "#27272a",
      borderWidth: 1,
      titleColor: "#e4e4e7",
      bodyColor: "#a1a1aa",
      padding: 8,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(255,255,255,0.05)" },
      ticks: { color: "#71717a", font: { size: 11 } },
      border: { display: false },
    },
    y: {
      grid: { display: false },
      ticks: { color: "#a1a1aa", font: { size: 12 } },
      border: { display: false },
    },
  },
};

// ── Sub-componentes ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500">
      {children}
    </h2>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 rounded-2xl bg-white/5 border border-white/8 px-5 py-4 backdrop-blur-sm"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-zinc-400">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-6 w-16 rounded-md" />
        ) : (
          <p className="text-2xl font-bold text-white">{value}</p>
        )}
      </div>
    </motion.div>
  );
}

function MemberRow({
  member,
  index,
  metGoal,
}: {
  member: PointManagerMember;
  index: number;
  metGoal: boolean;
}) {
  const pct =
    member.effectiveGoal > 0
      ? Math.min(
          Math.round((member.weeklySeconds / member.effectiveGoal) * 100),
          100,
        )
      : 0;

  return (
    <tr className="border-b border-white/5 hover:bg-white/3 transition-colors">
      <td className="py-3 px-4 text-xs font-bold text-zinc-500 w-8">
        {index + 1}
      </td>
      <td className="py-3 px-4">
        <div>
          <p className="text-sm text-zinc-200 font-medium truncate max-w-40">
            {member.displayName}
          </p>
          {member.rank && (
            <p className="text-xs text-zinc-500 truncate max-w-40">
              {member.rank}
            </p>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-xs text-zinc-300 text-center">
        {formatTime(member.effectiveGoal)}
        {member.weeklyGoalDiscount > 0 && (
          <span className="ml-1 text-amber-400 text-[10px]">
            (-{member.weeklyGoalDiscount}%)
          </span>
        )}
      </td>
      <td className="py-3 px-4 text-xs text-zinc-300 text-center">
        {member.sessionCount}
      </td>
      <td className="py-3 px-4 min-w-36">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-white/10">
            <div
              className={`h-1.5 rounded-full transition-all ${metGoal ? "bg-emerald-500" : "bg-indigo-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span
            className={`text-xs font-mono w-10 text-right ${metGoal ? "text-emerald-400" : "text-zinc-400"}`}
          >
            {formatTime(member.weeklySeconds)}
          </span>
        </div>
      </td>
    </tr>
  );
}

function MembersTable({
  title,
  icon: Icon,
  iconColor,
  members,
  metGoal,
  loading,
  emptyMsg,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  members: PointManagerMember[];
  metGoal: boolean;
  loading: boolean;
  emptyMsg: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/8 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/8">
        <Icon size={16} className={iconColor} />
        <span className="text-sm font-semibold text-zinc-200">{title}</span>
        {!loading && (
          <span className="ml-auto text-xs text-zinc-500">
            {members.length} membros
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="text-xs text-zinc-500 py-10 text-center">{emptyMsg}</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/8">
                <th className="py-2 px-4 text-[10px] uppercase tracking-wider text-zinc-600 w-8">
                  #
                </th>
                <th className="py-2 px-4 text-[10px] uppercase tracking-wider text-zinc-600">
                  Membro
                </th>
                <th className="py-2 px-4 text-[10px] uppercase tracking-wider text-zinc-600 text-center">
                  Meta Efetiva
                </th>
                <th className="py-2 px-4 text-[10px] uppercase tracking-wider text-zinc-600 text-center">
                  Sessões
                </th>
                <th className="py-2 px-4 text-[10px] uppercase tracking-wider text-zinc-600">
                  Progresso
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <MemberRow key={m.id} member={m} index={i} metGoal={metGoal} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  icon: Icon,
  loading,
  children,
  height = 220,
}: {
  title: string;
  icon: React.ElementType;
  loading: boolean;
  children: React.ReactNode;
  height?: number;
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/8 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={15} className="text-indigo-400" />
        <span className="text-sm font-semibold text-zinc-200">{title}</span>
      </div>
      {loading ? (
        <Skeleton className={`w-full rounded-xl`} style={{ height }} />
      ) : (
        <div style={{ height }}>{children}</div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function PointManagerPage() {
  const [data, setData] = useState<PointManagerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Estado do editor de meta
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalHours, setGoalHours] = useState("");
  const [goalMinutes, setGoalMinutes] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);

  const params = useParams();
  const guildId = params.guildId as string;

  const fetchData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const res = await fetch(`/api/data/point--manager?guildId=${guildId}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error ?? "Erro ao carregar dados.");
        }
      } catch {
        setError("Falha na comunicação com a API.");
      } finally {
        setTimeout(() => {
          setLoading(false);
          setRefreshing(false);
        }, 800); // Pequeno delay para melhor UX
      }
    },
    [guildId],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pré-preencher formulário ao abrir
  function openEditGoal() {
    const { hours, minutes } = secondsToHoursMinutes(
      data?.currentWeeklyGoal ?? 0,
    );
    setGoalHours(hours > 0 ? String(hours) : "");
    setGoalMinutes(minutes > 0 ? String(minutes) : "");
    setEditingGoal(true);
  }

  async function saveGoal() {
    const h = parseInt(goalHours || "0", 10);
    const m = parseInt(goalMinutes || "0", 10);
    if (isNaN(h) || isNaN(m) || h < 0 || m < 0 || m > 59) {
      toast.error("Valores inválidos. Minutos devem ser entre 0 e 59.");
      return;
    }
    const seconds = hoursMinutesToSeconds(h, m);
    setSavingGoal(true);
    try {
      const res = await fetch(`/api/data/point--manager`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId, weeklyGoal: seconds }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Meta semanal atualizada com sucesso!");
        setEditingGoal(false);
        fetchData(true);
      } else {
        toast.error(result.error ?? "Erro ao salvar meta.");
      }
    } catch {
      toast.error("Falha ao comunicar com a API.");
    } finally {
      setSavingGoal(false);
    }
  }

  // Separar membros com meta definida
  const { metGoal, notMetGoal, noGoal } = useMemo(() => {
    if (!data) return { metGoal: [], notMetGoal: [], noGoal: [] };
    const withGoal = data.members.filter((m) => m.weeklyGoal > 0);
    const withoutGoal = data.members.filter((m) => m.weeklyGoal <= 0);
    return {
      metGoal: withGoal
        .filter((m) => m.metGoal)
        .sort((a, b) => b.weeklySeconds - a.weeklySeconds),
      notMetGoal: withGoal
        .filter((m) => !m.metGoal)
        .sort((a, b) => b.weeklySeconds - a.weeklySeconds),
      noGoal: withoutGoal,
    };
  }, [data]);

  const completionRate = useMemo(() => {
    const total = metGoal.length + notMetGoal.length;
    if (total === 0) return 0;
    return Math.round((metGoal.length / total) * 100);
  }, [metGoal, notMetGoal]);

  if (error)
    return (
      <ErrorPage
        title="Ops, algo deu errado"
        description={error}
        showDetails={false}
      />
    );

  const currentGoalDisplay = data ? formatTime(data.currentWeeklyGoal) : "—";

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={variants.transition}
      className="min-h-screen px-6 py-8 max-w-7xl mx-auto space-y-10"
    >
      {/* ── Cabeçalho ── */}
      <div className="flex flex-col items-center border-b border-white/10 pb-8 gap-3">
        <h1 className="text-4xl font-bold text-white">Bate Ponto</h1>
        <p className="text-sm text-zinc-500">
          Metas semanais, estatísticas e desempenho
        </p>

        {/* Meta atual + botão de editar */}
        <div className="mt-2 flex items-center gap-3">
          <AnimatePresence mode="wait">
            {editingGoal ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-1 rounded-xl bg-white/8 border border-white/12 px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={goalHours}
                    onChange={(e) => setGoalHours(e.target.value)}
                    className="w-14 bg-transparent text-center text-white text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span className="text-zinc-400 text-sm">h</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    placeholder="0"
                    value={goalMinutes}
                    onChange={(e) => setGoalMinutes(e.target.value)}
                    className="w-14 bg-transparent text-center text-white text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span className="text-zinc-400 text-sm">m</span>
                </div>
                <button
                  onClick={saveGoal}
                  disabled={savingGoal}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-3 py-2 text-xs font-semibold text-white transition-colors"
                >
                  <Save size={13} />
                  {savingGoal ? "Salvando..." : "Salvar"}
                </button>
                <button
                  onClick={() => setEditingGoal(false)}
                  className="flex items-center justify-center rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 p-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2">
                  <Target size={14} className="text-indigo-400" />
                  <span className="text-sm text-zinc-300">Meta da semana:</span>
                  {loading ? (
                    <Skeleton className="h-4 w-10 rounded" />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {data?.currentWeeklyGoal
                        ? currentGoalDisplay
                        : "Não definida"}
                    </span>
                  )}
                </div>
                <button
                  onClick={openEditGoal}
                  className="flex items-center gap-1.5 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:text-white transition-colors"
                >
                  <Pencil size={13} />
                  Definir meta
                </button>
                <button
                  onClick={() => fetchData(true)}
                  disabled={refreshing}
                  className="flex items-center justify-center rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={refreshing ? "animate-spin" : ""}
                  />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Intervalo da semana */}
        {data && !loading && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <CalendarRange size={12} />
            <span>
              Semana: {formatDate(data.weekStart)} — {formatDate(data.weekEnd)}
            </span>
          </div>
        )}
      </div>

      {/* ── Cards de resumo ── */}
      <section>
        <SectionTitle>Resumo da Semana</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Registrados"
            value={data?.members.length ?? 0}
            color="bg-indigo-600"
            loading={loading}
          />
          <StatCard
            icon={CheckCircle2}
            label="Cumpriram a Meta"
            value={metGoal.length}
            color="bg-emerald-600"
            loading={loading}
          />
          <StatCard
            icon={XCircle}
            label="Não Cumpriram"
            value={notMetGoal.length}
            color="bg-red-600"
            loading={loading}
          />
          <StatCard
            icon={Percent}
            label="Taxa de Conclusão"
            value={`${completionRate}%`}
            color="bg-violet-600"
            loading={loading}
          />
        </div>
      </section>

      {/* ── Tabelas de meta ── */}
      <section>
        <SectionTitle>Status das Metas</SectionTitle>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <MembersTable
            title="Cumpriram a Meta"
            icon={CheckCircle2}
            iconColor="text-emerald-400"
            members={metGoal}
            metGoal
            loading={loading}
            emptyMsg="Nenhum membro cumpriu a meta ainda."
          />
          <MembersTable
            title="Não Cumpriram a Meta"
            icon={XCircle}
            iconColor="text-red-400"
            members={notMetGoal}
            metGoal={false}
            loading={loading}
            emptyMsg="Todos os membros com meta definiram cumpriram. Parabéns!"
          />
        </div>

        {/* Membros sem meta */}
        {!loading && noGoal.length > 0 && (
          <div className="mt-4 rounded-2xl bg-white/5 border border-white/8 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MinusCircle size={15} className="text-zinc-500" />
              <span className="text-sm font-semibold text-zinc-400">
                Sem meta definida
              </span>
              <span className="ml-auto text-xs text-zinc-600">
                {noGoal.length} membros
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {noGoal.map((m) => (
                <span
                  key={m.id}
                  className="rounded-lg bg-white/5 border border-white/8 px-3 py-1 text-xs text-zinc-400"
                >
                  {m.displayName}
                  {m.rank && (
                    <span className="text-zinc-600 ml-1">· {m.rank}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Gráficos ── */}
      <section>
        <SectionTitle>Estatísticas</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Top tempo na semana */}
          <ChartCard
            title="Top Tempo esta Semana"
            icon={Clock}
            loading={loading}
            height={230}
          >
            {!data || data.stats.topByWeeklyTime.length === 0 ? (
              <p className="text-xs text-zinc-500 h-full flex items-center justify-center">
                Nenhum dado disponível.
              </p>
            ) : (
              <Bar
                data={{
                  labels: data!.stats.topByWeeklyTime.map((x) =>
                    shortLabel(x.name),
                  ),
                  datasets: [
                    {
                      data: data!.stats.topByWeeklyTime.map(
                        (x) => Math.round((x.seconds / 3600) * 10) / 10,
                      ),
                      backgroundColor: CHART_COLORS,
                      borderRadius: 4,
                      barThickness: 16,
                    },
                  ],
                }}
                options={{
                  ...BAR_OPTIONS,
                  plugins: {
                    ...BAR_OPTIONS.plugins,
                    tooltip: {
                      ...BAR_OPTIONS.plugins.tooltip,
                      callbacks: { label: (ctx) => ` ${ctx.parsed.x}h` },
                    },
                  },
                  scales: {
                    ...BAR_OPTIONS.scales,
                    x: {
                      ...BAR_OPTIONS.scales.x,
                      ticks: {
                        ...BAR_OPTIONS.scales.x.ticks,
                        callback: (v) => `${v}h`,
                      },
                    },
                  },
                }}
              />
            )}
          </ChartCard>

          {/* Top sessões na semana */}
          <ChartCard
            title="Top Sessões esta Semana"
            icon={Trophy}
            loading={loading}
            height={230}
          >
            {!data || data.stats.topBySessions.length === 0 ? (
              <p className="text-xs text-zinc-500 h-full flex items-center justify-center">
                Nenhum dado disponível.
              </p>
            ) : (
              <Bar
                data={{
                  labels: data!.stats.topBySessions.map((x) =>
                    shortLabel(x.name),
                  ),
                  datasets: [
                    {
                      data: data!.stats.topBySessions.map((x) => x.count),
                      backgroundColor: CHART_COLORS,
                      borderRadius: 4,
                      barThickness: 16,
                    },
                  ],
                }}
                options={{
                  ...BAR_OPTIONS,
                  plugins: {
                    ...BAR_OPTIONS.plugins,
                    tooltip: {
                      ...BAR_OPTIONS.plugins.tooltip,
                      callbacks: { label: (ctx) => ` ${ctx.parsed.x} sessões` },
                    },
                  },
                }}
              />
            )}
          </ChartCard>

          {/* Top tempo em voz (geral) */}
          <ChartCard
            title="Mais Tempo em Voz (Geral)"
            icon={Mic}
            loading={loading}
            height={230}
          >
            {!data || data.stats.topByVoice.length === 0 ? (
              <p className="text-xs text-zinc-500 h-full flex items-center justify-center">
                Nenhum dado disponível.
              </p>
            ) : (
              <Bar
                data={{
                  labels: data!.stats.topByVoice.map((x) => shortLabel(x.name)),
                  datasets: [
                    {
                      data: data!.stats.topByVoice.map(
                        (x) => Math.round((x.seconds / 3600) * 10) / 10,
                      ),
                      backgroundColor: CHART_COLORS,
                      borderRadius: 4,
                      barThickness: 16,
                    },
                  ],
                }}
                options={{
                  ...BAR_OPTIONS,
                  plugins: {
                    ...BAR_OPTIONS.plugins,
                    tooltip: {
                      ...BAR_OPTIONS.plugins.tooltip,
                      callbacks: { label: (ctx) => ` ${ctx.parsed.x}h` },
                    },
                  },
                  scales: {
                    ...BAR_OPTIONS.scales,
                    x: {
                      ...BAR_OPTIONS.scales.x,
                      ticks: {
                        ...BAR_OPTIONS.scales.x.ticks,
                        callback: (v) => `${v}h`,
                      },
                    },
                  },
                }}
              />
            )}
          </ChartCard>

          {/* Top mensagens (geral) */}
          <ChartCard
            title="Mais Mensagens (Geral)"
            icon={MessageSquare}
            loading={loading}
            height={230}
          >
            {!data || data.stats.topByMessages.length === 0 ? (
              <p className="text-xs text-zinc-500 h-full flex items-center justify-center">
                Nenhum dado disponível.
              </p>
            ) : (
              <Bar
                data={{
                  labels: data!.stats.topByMessages.map((x) =>
                    shortLabel(x.name),
                  ),
                  datasets: [
                    {
                      data: data!.stats.topByMessages.map((x) => x.count),
                      backgroundColor: CHART_COLORS,
                      borderRadius: 4,
                      barThickness: 16,
                    },
                  ],
                }}
                options={{
                  ...BAR_OPTIONS,
                  plugins: {
                    ...BAR_OPTIONS.plugins,
                    tooltip: {
                      ...BAR_OPTIONS.plugins.tooltip,
                      callbacks: {
                        label: (ctx) =>
                          ` ${(ctx.parsed.x ?? 0).toLocaleString("pt-BR")} msgs`,
                      },
                    },
                  },
                }}
              />
            )}
          </ChartCard>
        </div>
      </section>
    </motion.div>
  );
}
