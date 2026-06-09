"use client";

import { useState } from "react";
import { FolderHeart, Trash2, Link, FileText } from "lucide-react";
import { Button } from "@heroui/react";
import { toast } from "sonner";

interface EvidenceItem {
  id: string;
  name: string;
  url: string;
  description: string;
  category: "Física" | "Digital";
}

interface EvidenceProps {
  evidence: EvidenceItem[];
  onUpdateEvidence: (updatedList: EvidenceItem[]) => void;
}

export default function Evidence({ evidence, onUpdateEvidence }: EvidenceProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"Física" | "Digital">("Digital");

  const handleAdd = () => {
    if (!name || !url) {
      toast.error("Nome da prova e Link/URL da evidência são obrigatórios.");
      return;
    }

    const newItem: EvidenceItem = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      url,
      description: description || "Sem observações adicionais",
      category
    };

    onUpdateEvidence([...evidence, newItem]);
    setName("");
    setUrl("");
    setDescription("");
    setAdding(false);
    toast.success("Evidência anexada ao inquérito.");
  };

  const handleRemove = (id: string) => {
    onUpdateEvidence(evidence.filter(item => item.id !== id));
    toast.success("Evidência desvinculada do caso.");
  };

  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#121214] p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
        <div className="flex items-center gap-2">
          <FolderHeart className="h-5 w-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">
            Acervo e Custódia de Provas
          </h2>
        </div>

        <Button
          size="sm"
          onClick={() => setAdding(!adding)}
          className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
        >
          {adding ? "Cancelar" : "Anexar Prova"}
        </Button>
      </div>

      {adding && (
        <div className="p-3 border border-[#27272a] bg-black/10 rounded-xl space-y-3 animation-fade-in">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-zinc-500 font-semibold">Nome/Item de Prova *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Foto da placa do veículo"
                className="bg-black/20 border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-zinc-500 font-semibold">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="bg-black/20 border border-[#27272a] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="Digital" className="bg-[#121214]">Digital (URL/Imagem/Vídeo)</option>
                <option value="Física" className="bg-[#121214]">Física (Arma/Documento apreendido)</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-zinc-500 font-semibold">Link da Prova (Imagem/Vídeo/Documento) *</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Ex: https://imgur.com/..."
              className="bg-black/20 border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-zinc-500 font-semibold">Observações / Detalhes de Apreensão</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Apreendido no cofre do quarto principal durante busca e apreensão..."
              rows={2}
              className="bg-black/20 border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>
          <Button
            size="sm"
            onClick={handleAdd}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg text-xs py-1.5 cursor-pointer"
          >
            Anexar Prova
          </Button>
        </div>
      )}

      {evidence.length === 0 ? (
        <p className="text-xs text-gray-500 italic py-6 text-center">
          Nenhuma prova anexada a este inquérito policial.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
          {evidence.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between gap-2.5 hover:bg-white/8 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-bold text-white truncate">
                      {item.name}
                    </p>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.category === "Digital" 
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    }`}>
                      {item.category}
                    </span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] text-emerald-400 hover:underline flex items-center gap-1 mt-1 truncate"
                  >
                    <Link size={10} className="shrink-0" />
                    {item.url}
                  </a>
                </div>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition cursor-pointer"
                  title="Excluir prova"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="p-2 border border-zinc-800 bg-black/10 rounded-lg flex gap-2 items-start">
                <FileText size={14} className="text-zinc-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-zinc-400 leading-snug font-medium">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
