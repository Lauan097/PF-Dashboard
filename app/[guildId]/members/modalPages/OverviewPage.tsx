'use client';

import { Activity, Clock, ShieldAlert, CalendarDays, Users, BarChart3, CircleAlert } from "lucide-react";
import { Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { FaCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { MemberOverview } from "@/types/user";
import { Skeleton } from "@/components/skeleton";

interface OverviewPageProps {
  userId: string;
  guildId: string;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3">
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
          <div key={i} className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3">
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

export default function OverviewPage({ userId, guildId }: OverviewPageProps) {
  const [overview, setOverview] = useState<MemberOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOverview() {
      setLoading(true);
      setError(null);
      try {
        const res  = await fetch(`/api/data/user/get-overview?guildId=${guildId}&userId=${userId}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success) setOverview(data.data);
        else setError(data.error || 'Erro ao carregar visão geral.');
      } catch {
        if (!cancelled) setError('Erro ao carregar visão geral.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOverview();
    return () => { cancelled = true; };
  }, [userId, guildId]);

  if (loading) return <OverviewSkeleton />;

  if (error || !overview) {
    return <div className="text-red-400 text-sm py-12 text-center min-h-screen flex items-center justify-center">
      <CircleAlert size={24} className="inline-block mr-2" />
      {error || 'Ficha não encontrada.'}
    </div>;
  }

  const { timeCards, weeklyActivity, monthlyActivity, activeDaysData, conductHistory, topPartners } = overview;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3">
          <span className="text-zinc-400 text-xs font-semibold flex items-center gap-2 pb-2 border-b border-white/5">
            <Clock size={14} className="text-blue-500" /> Tempo em Serviço
          </span>
          {timeCards.map((t, i) => (
            <div key={i} className="flex items-center justify-between bg-[#222] p-2.5 rounded-xl border border-white/5">
              <span className="text-zinc-300 text-xs flex items-center gap-2">
                <CalendarDays size={13} className="text-blue-400" />{t.name}
              </span>
              <span className="text-blue-400 font-semibold text-sm">{t.horas}h</span>
            </div>
          ))}
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3">
          <span className="text-zinc-400 text-xs font-semibold flex items-center gap-2 pb-2 border-b border-white/5">
            <ShieldAlert size={14} className="text-indigo-500" /> Histórico de Conduta
          </span>
          {conductHistory.length === 0
            ? <EmptyState message="Nenhum registro de conduta encontrado." />
            : conductHistory.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-[#222] p-2.5 rounded-xl border border-white/5">
                <span className="text-zinc-300 text-xs font-medium flex items-center gap-2">
                  <FaCircle size={10} className={
                    r.type === 'warning' ? 'text-yellow-500' :
                    r.type === 'praise'  ? 'text-green-500'  :
                    'text-blue-400'
                  } />
                  {r.title}
                </span>
                <span className="text-zinc-500 text-xs">{fmtDate(r.date)}</span>
              </div>
            ))
          }
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3">
          <span className="text-zinc-400 text-xs font-semibold flex items-center gap-2 pb-2 border-b border-white/5">
            <CalendarDays size={14} className="text-purple-500" /> Turnos Mais Ativos
          </span>
          <div className="h-36 w-full mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={activeDaysData} innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value" stroke="none">
                  {activeDaysData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#202020", borderColor: "#ffffff10", borderRadius: "10px", color: "#fff", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5 mt-1">
            {activeDaysData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                {d.name} <span className="ml-auto text-zinc-300 font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5">
        <span className="text-zinc-400 text-xs font-semibold flex items-center gap-2 pb-3 border-b border-white/5 mb-4">
          <Activity size={14} className="text-blue-500" /> Atividade Semanal de Patrulhamento
        </span>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyActivity} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="mpColorHoras" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="name" stroke="#52525b" tick={{ fill: "#71717a", fontSize: 11 }} tickLine={false} axisLine={false} dy={8} />
              <YAxis stroke="#52525b" tick={{ fill: "#71717a", fontSize: 11 }} tickLine={false} axisLine={false} dx={-8} />
              <Tooltip
                contentStyle={{ backgroundColor: "#202020", borderColor: "#ffffff10", borderRadius: "10px", color: "#fff" }}
                itemStyle={{ color: "#3b82f6", fontWeight: 600 }}
                formatter={(v) => [`${v}h`, "Patrulha"]}
                labelStyle={{ color: "#a1a1aa" }}
              />
              <Area type="monotone" dataKey="horas" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#mpColorHoras)" activeDot={{ r: 5, fill: "#3b82f6", stroke: "#171717", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3">
          <span className="text-zinc-400 text-xs font-semibold flex items-center gap-2 pb-2 border-b border-white/5">
            <Users size={14} className="text-emerald-500" /> Parceiros Frequentes
          </span>
          {topPartners.length === 0
            ? <EmptyState message="Nenhum parceiro registrado neste período." />
            : topPartners.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-[#222] p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-400 border border-zinc-700">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-200 text-xs font-medium leading-none">{p.name}</span>
                    <span className="text-zinc-500 text-[11px] mt-0.5">{p.tag}</span>
                  </div>
                </div>
                <span className="text-emerald-400 font-semibold text-xs">{p.patrols} patrulhas</span>
              </div>
            ))
          }
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl flex flex-col gap-3">
          <span className="text-zinc-400 text-xs font-semibold flex items-center gap-2 pb-2 border-b border-white/5">
            <BarChart3 size={14} className="text-rose-500" /> Meses Mais Ativos
          </span>
          <div className="h-48 w-full mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyActivity} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="month" stroke="#52525b" tick={{ fill: "#71717a", fontSize: 11 }} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#52525b" tick={{ fill: "#71717a", fontSize: 11 }} tickLine={false} axisLine={false} dx={-8} />
                <Tooltip
                  cursor={{ fill: "#ffffff05" }}
                  contentStyle={{ backgroundColor: "#202020", borderColor: "#ffffff10", borderRadius: "10px", color: "#fff" }}
                  itemStyle={{ color: "#f43f5e", fontWeight: 600 }}
                  formatter={(v) => [`${v}h`, "Patrulha"]}
                  labelStyle={{ color: "#a1a1aa" }}
                />
                <Bar dataKey="horas" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}