"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@heroui/react";
import { toast } from "sonner";

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  authorName: string;
  createdAt: string;
}

interface TimelineProps {
  investigationId: string;
  timeline: TimelineItem[];
  socket: any;
}

export default function Timeline({ investigationId, timeline, socket }: TimelineProps) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!title || !description) {
      toast.error("Preencha o título e a descrição do marco.");
      return;
    }

    if (!socket) {
      toast.error("Socket offline. Tente novamente em instantes.");
      return;
    }

    setSubmitting(true);
    socket.emit(
      "investigation:addTimeline",
      { id: investigationId, title, description },
      (res: any) => {
        setSubmitting(false);
        if (!res.success) {
          toast.error(res.error || "Erro ao adicionar marco.");
        } else {
          toast.success("Marco adicionado com sucesso!");
          setTitle("");
          setDescription("");
          setAdding(false);
        }
      }
    );
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#121214] p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">
            Cronologia dos Fatos (Linha do Tempo)
          </h2>
        </div>

        <Button
          size="sm"
          onClick={() => setAdding(!adding)}
          className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
        >
          {adding ? "Cancelar" : "Registrar Fato"}
        </Button>
      </div>

      {adding && (
        <div className="p-3 border border-[#27272a] bg-black/10 rounded-xl space-y-3 animation-fade-in">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-zinc-500 font-semibold">Título do Fato/Marco *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Apreensão de Celulares na Operação"
              className="bg-black/20 border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-zinc-500 font-semibold">Descrição / Detalhes dos Fatos *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as provas encontradas, depoimentos obtidos ou avanço operacional..."
              rows={2}
              className="bg-black/20 border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>
          <Button
            size="sm"
            onClick={handleSubmit}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg text-xs py-1.5 cursor-pointer"
            isDisabled={submitting}
          >
            {submitting ? "Registrando..." : "Registrar Marco"}
          </Button>
        </div>
      )}

      {timeline.length === 0 ? (
        <p className="text-xs text-gray-500 italic py-6 text-center">
          Nenhum marco cronológico registrado para esta investigação.
        </p>
      ) : (
        <div className="relative border-l border-zinc-800 ml-3.5 pl-6 space-y-6 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
          {timeline.map((item) => (
            <div key={item.id} className="relative">
              <span className="absolute left-[-24px] top-1 h-3.5 w-3.5 rounded-full border-2 border-emerald-400 bg-[#121214] ring-4 ring-emerald-500/10 flex items-center justify-center shrink-0" />
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs font-bold text-white leading-none">
                    {item.title}
                  </h3>
                  <span className="text-[9px] text-gray-500 font-medium">
                    {formatDateTime(item.createdAt)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {item.description}
                </p>
                <p className="text-[9px] text-emerald-400/80 font-semibold uppercase tracking-wider">
                  Escrivão: {item.authorName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
