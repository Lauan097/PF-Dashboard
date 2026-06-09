"use client";

import { 
  Folder, 
  Activity, 
  AlertTriangle, 
  CheckCircle2 
} from "lucide-react";

interface StatsSummaryProps {
  list: any[];
}

export default function StatsSummary({ list }: StatsSummaryProps) {
  const total = list.length;
  const open = list.filter(item => item.status === "Open").length;
  const suspended = list.filter(item => item.status === "Suspended").length;
  const closed = list.filter(item => item.status === "Closed").length;

  const stats = [
    {
      title: "Total de Inquéritos",
      value: total,
      icon: Folder,
      color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400"
    },
    {
      title: "Em Andamento",
      value: open,
      icon: Activity,
      color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400"
    },
    {
      title: "Suspensos",
      value: suspended,
      icon: AlertTriangle,
      color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400"
    },
    {
      title: "Concluídos",
      value: closed,
      icon: CheckCircle2,
      color: "from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl border bg-[#121214] bg-linear-to-br ${stat.color} p-5 shadow-lg flex items-center justify-between transition-transform hover:-translate-y-1`}
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {stat.title}
              </span>
              <span className="text-3xl font-black text-white">
                {stat.value}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
              <Icon className="h-6 w-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
