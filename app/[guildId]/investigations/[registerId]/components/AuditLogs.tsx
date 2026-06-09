"use client";

import { useState } from "react";
import { ClipboardList, User, Calendar, SlidersHorizontal } from "lucide-react";
import { Button } from "@heroui/react";

interface AuditItem {
  id: string;
  action: string;
  details: string;
  userName: string;
  createdAt: string;
}

interface AuditLogsProps {
  logs: AuditItem[];
}

export default function AuditLogs({ logs }: AuditLogsProps) {
  const [activeTab, setActiveTab] = useState<"general" | "board">("general");
  const [dateFilter, setDateFilter] = useState<string>("");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "ADD_TIMELINE": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "UPDATE": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "ACCESS_BOARD": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "EDIT_BOARD": return "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20";
      default: return "text-zinc-400 bg-white/5 border-white/5";
    }
  };

  const filteredLogs = logs.filter((log) => {
    const isBoardAction = log.action === "ACCESS_BOARD" || log.action === "EDIT_BOARD";
    
    if (activeTab === "general" && isBoardAction) return false;
    if (activeTab === "board" && !isBoardAction) return false;

    if (dateFilter) {
      const logDate = new Date(log.createdAt).toISOString().split("T")[0];
      if (logDate !== dateFilter) return false;
    }

    return true;
  });

  const generalCount = logs.filter(log => log.action !== "ACCESS_BOARD" && log.action !== "EDIT_BOARD").length;
  const boardCount = logs.filter(log => log.action === "ACCESS_BOARD" || log.action === "EDIT_BOARD").length;

  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#121214] p-5 shadow-lg flex flex-col gap-4">
      
      <div className="flex items-center justify-between border-b border-[#27272a] pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-zinc-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">
            Auditoria e Segurança
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 bg-black/20 border border-[#27272a] rounded-xl p-1 shrink-0">
        <button
          onClick={() => setActiveTab("general")}
          className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 select-none cursor-pointer ${
            activeTab === "general"
              ? "bg-white/10 text-white border border-white/5 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <span>Sistema</span>
          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
            activeTab === "general" ? "bg-zinc-800 text-zinc-300" : "bg-zinc-900/60 text-zinc-600"
          }`}>
            {generalCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("board")}
          className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 select-none cursor-pointer ${
            activeTab === "board"
              ? "bg-white/10 text-white border border-white/5 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <span>Quadro</span>
          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
            activeTab === "board" ? "bg-[#8b5cf6]/20 text-[#c084fc]" : "bg-zinc-900/60 text-zinc-600"
          }`}>
            {boardCount}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2 bg-black/10 border border-[#27272a]/40 rounded-xl p-2">
        <SlidersHorizontal size={13} className="text-zinc-500 shrink-0" />
        <input 
          type="date" 
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-transparent border-none text-xs text-zinc-300 focus:outline-none w-full cursor-pointer scheme-dark"
        />
        {dateFilter && (
          <Button
            size="sm"
            onClick={() => setDateFilter("")}
            className="p-1 min-w-0 h-5 text-[9px] bg-zinc-800 text-zinc-400 hover:text-white rounded cursor-pointer"
          >
            Limpar
          </Button>
        )}
      </div>

      {filteredLogs.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center gap-1">
          <Calendar className="h-6 w-6 text-zinc-600" />
          <p className="text-xs text-gray-500 italic">
            Nenhum registro encontrado {dateFilter ? "para esta data" : "nesta aba"}.
          </p>
        </div>
      ) : (
        <div className="max-h-[280px] overflow-y-auto pr-1 flex flex-col gap-2.5 scrollbar-thin">
          {filteredLogs.map((log) => (
            <div 
              key={log.id}
              className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5 hover:bg-white/[0.07] transition"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${getActionColor(log.action)}`}>
                  {log.action}
                </span>
                <span className="text-[9px] text-gray-500 font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(log.createdAt)}
                </span>
              </div>
              <p className="text-[11px] text-gray-300 leading-snug">
                {log.details}
              </p>
              <div className="flex items-center gap-1 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                <User className="h-3 w-3 text-gray-600" />
                <span>Operador: {log.userName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
