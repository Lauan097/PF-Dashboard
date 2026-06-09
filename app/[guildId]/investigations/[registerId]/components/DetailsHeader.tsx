"use client";

import { 
  FolderOpen, 
  Clock, 
  ArrowLeft,
  Edit3
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@heroui/react";

interface DetailsHeaderProps {
  title: string;
  hash: number;
  status: "Open" | "Closed" | "Suspended";
  createdAt: string;
  closedAt: string | null;
  onUpdateStatus: (newStatus: "Open" | "Closed" | "Suspended") => void;
  onOpenCanvas: () => void;
}

export default function DetailsHeader({
  title,
  hash,
  status,
  createdAt,
  closedAt,
  onUpdateStatus,
  onOpenCanvas
}: DetailsHeaderProps) {
  const params = useParams();
  const guildId = params.guildId as string;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a]/40 pb-6">
      
      {/* Informações */}
      <div className="space-y-3">
        <Link
          href={`/[guildId]/investigations`.replace("[guildId]", guildId)}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft size={14} /> Voltar para Inquéritos
        </Link>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 shrink-0 text-emerald-400">
            <FolderOpen size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {title}
              </h1>
              <span className="font-mono text-zinc-500 text-sm">
                (IPL #{hash})
              </span>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
              <Clock size={12} /> Instaurado em {formatDate(createdAt)}
              {closedAt && (
                <>
                  <span className="text-zinc-700">•</span>
                  <span className="text-purple-400 font-medium">Relatório Final em {formatDate(closedAt)}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-3 self-end md:self-center">
        
        {/* Seletor de Status */}
        <div className="flex items-center bg-black/20 border border-[#27272a] rounded-xl p-1 shrink-0">
          {[
            { value: "Open", label: "Ativo", color: "hover:text-emerald-400" },
            { value: "Suspended", label: "Suspenso", color: "hover:text-amber-400" },
            { value: "Closed", label: "Concluir", color: "hover:text-purple-400" }
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdateStatus(opt.value as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition select-none cursor-pointer ${
                status === opt.value
                  ? "bg-white/10 text-white border border-white/5 shadow-md"
                  : `text-zinc-400 ${opt.color}`
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Botão do Quadro Excalidraw */}
        <Button
          onClick={onOpenCanvas}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-black transition cursor-pointer"
        >
          <Edit3 size={15} /> Abrir Quadro de Evidências
        </Button>
      </div>

    </div>
  );
}
