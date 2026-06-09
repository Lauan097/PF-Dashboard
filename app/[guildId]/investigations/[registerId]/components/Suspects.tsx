"use client";

import { useState } from "react";
import { Users, Trash2 } from "lucide-react";
import { Button } from "@heroui/react";
import { toast } from "sonner";

interface Suspect {
  name: string;
  rg: string;
  description: string;
  avatar: string;
  type: "Suspect" | "Accomplice";
}

interface SuspectsProps {
  suspects: Suspect[];
  onUpdateSuspects: (updatedList: Suspect[]) => void;
}

export default function Suspects({ suspects, onUpdateSuspects }: SuspectsProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [rg, setRg] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"Suspect" | "Accomplice">("Suspect");

  const handleAdd = () => {
    if (!name) {
      toast.error("Nome do suspeito é obrigatório.");
      return;
    }

    const newSuspect: Suspect = {
      name,
      rg: rg || "Não informado",
      description: description || "Nenhuma anotação vinculada",
      avatar: "",
      type
    };

    onUpdateSuspects([...suspects, newSuspect]);
    setName("");
    setRg("");
    setDescription("");
    setAdding(false);
    toast.success("Membro vinculado sob investigação.");
  };

  const handleRemove = (index: number) => {
    onUpdateSuspects(suspects.filter((_, i) => i !== index));
    toast.success("Membro removido da investigação.");
  };

  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#121214] p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">
            Mapeamento de Suspeitos & Cúmplices
          </h2>
        </div>

        <Button
          size="sm"
          onClick={() => setAdding(!adding)}
          className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
        >
          {adding ? "Cancelar" : "Qualificar Membro"}
        </Button>
      </div>

      {adding && (
        <div className="p-3 border border-[#27272a] bg-black/10 rounded-xl space-y-3 animation-fade-in">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-zinc-500 font-semibold">Nome Completo (IC) *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Pablo Escobar"
                className="bg-black/20 border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-zinc-500 font-semibold">Passaporte / RG</label>
              <input
                type="text"
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                placeholder="Ex: 5082"
                className="bg-black/20 border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 items-end">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-[10px] text-zinc-500 font-semibold">Envolvimento / Provas</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Suspeita de gerenciar desvios..."
                className="bg-black/20 border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-zinc-500 font-semibold">Categoria</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="bg-black/20 border border-[#27272a] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="Suspect" className="bg-[#121214]">Suspeito</option>
                <option value="Accomplice" className="bg-[#121214]">Cúmplice</option>
              </select>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleAdd}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg text-xs py-1.5 cursor-pointer"
          >
            Adicionar à Investigação
          </Button>
        </div>
      )}

      {suspects.length === 0 ? (
        <p className="text-xs text-gray-500 italic py-6 text-center">
          Nenhum suspeito ou cúmplice fichado neste inquérito.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
          {suspects.map((sus, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between gap-3 relative hover:bg-white/8 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-bold text-white truncate">
                      {sus.name}
                    </p>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                      sus.type === "Suspect" 
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {sus.type === "Suspect" ? "Suspeito" : "Cúmplice"}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                    RG: {sus.rg}
                  </p>
                </div>

                <button
                  onClick={() => handleRemove(idx)}
                  className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition cursor-pointer"
                  title="Desvincular do caso"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="p-2 border border-zinc-800 bg-black/10 rounded-lg">
                <p className="text-[10px] text-zinc-400 leading-snug font-medium">
                  {sus.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
