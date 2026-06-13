"use client";

import { useState } from "react";
import { Modal, Button } from "@heroui/react";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  FileBadge 
} from "lucide-react";
import { toast } from "sonner";

interface Investigator {
  userId: string;
  gameName: string;
  rank: string;
}

interface CreateInvestigationModalProps {
  guildId: string;
  isOpen: boolean;
  onClose: () => void;
  investigators: Investigator[];
  onCreated: () => void;
}

interface SuspectInput {
  name: string;
  rg: string;
  description: string;
  avatar: string;
  type: "Suspect" | "Accomplice";
}

export default function CreateInvestigationModal({
  guildId,
  isOpen,
  onClose,
  investigators,
  onCreated
}: CreateInvestigationModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedInvestigators, setSelectedInvestigators] = useState<string[]>([]);
  const [suspects, setSuspects] = useState<SuspectInput[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [tempSuspectName, setTempSuspectName] = useState("");
  const [tempSuspectRg, setTempSuspectRg] = useState("");
  const [tempSuspectDesc, setTempSuspectDesc] = useState("");
  const [tempSuspectType, setTempSuspectType] = useState<"Suspect" | "Accomplice">("Suspect");

  const handleAddSuspect = () => {
    if (!tempSuspectName) {
      toast.error("Nome do suspeito é obrigatório.");
      return;
    }
    setSuspects([
      ...suspects,
      {
        name: tempSuspectName,
        rg: tempSuspectRg || "Não informado",
        description: tempSuspectDesc || "Sem detalhes adicionais",
        avatar: "",
        type: tempSuspectType
      }
    ]);
    setTempSuspectName("");
    setTempSuspectRg("");
    setTempSuspectDesc("");
  };

  const handleRemoveSuspect = (index: number) => {
    setSuspects(suspects.filter((_, i) => i !== index));
  };

  const handleToggleInvestigator = (userId: string) => {
    if (selectedInvestigators.includes(userId)) {
      setSelectedInvestigators(selectedInvestigators.filter(id => id !== userId));
    } else {
      setSelectedInvestigators([...selectedInvestigators, userId]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      toast.error("Título e Descrição do caso são obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/data/guild/investigations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId,
          title,
          description,
          notes,
          suspects,
          evidence: [],
          investigators: selectedInvestigators
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao criar inquérito.");
      }

      toast.success("Inquérito instaurado com sucesso!");
      onCreated();
      setTitle("");
      setDescription("");
      setNotes("");
      setSelectedInvestigators([]);
      setSuspects([]);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro de conexão.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal>
      <Modal.Backdrop
        variant="blur"
        isOpen={isOpen}
        onOpenChange={(open) => !open && onClose()}
      >
        <Modal.Container size="lg">
          <Modal.Dialog className="max-h-[90vh] flex flex-col bg-[#121214] border border-[#27272a] rounded-2xl shadow-2xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-white/8 text-zinc-400">
                <FileBadge size={18} className="text-emerald-400" />
              </Modal.Icon>
              <div>
                <Modal.Heading className="text-base font-bold text-white">
                  Instaurar Inquérito Policial
                </Modal.Heading>
                <p className="text-xs text-gray-500">
                  Preencha as informações iniciais para a investigação da Polícia Federal.
                </p>
              </div>
            </Modal.Header>

            <Modal.Body className="space-y-4 py-4 overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Informações Gerais
                </h3>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-zinc-500">Título do Inquérito *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Operação Lavagem de Dinheiro - Facção Norte"
                    className="w-full bg-black/20 border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-zinc-500">Descrição / Fatos Iniciais *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva detalhadamente o evento delituoso, locais e indícios iniciais..."
                    rows={3}
                    className="w-full bg-black/20 border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition resize-none"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={14} /> Designar Investigadores
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto border border-[#27272a] bg-black/10 rounded-xl p-3 scrollbar-thin">
                  {investigators ? investigators.map((inv) => (
                    <label 
                      key={inv.userId} 
                      className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition select-none ${
                        selectedInvestigators.includes(inv.userId) 
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-white" 
                          : "bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedInvestigators.includes(inv.userId)}
                        onChange={() => handleToggleInvestigator(inv.userId)}
                        className="hidden"
                      />
                      <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                        selectedInvestigators.includes(inv.userId) 
                          ? "bg-emerald-500 border-emerald-400" 
                          : "border-neutral-600 bg-neutral-800"
                      }`}>
                        {selectedInvestigators.includes(inv.userId) && (
                          <div className="h-1.5 w-1.5 rounded-full bg-black" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate leading-none mb-0.5">{inv.gameName}</p>
                        <p className="text-[9px] text-gray-500 truncate leading-none">{inv.rank}</p>
                      </div>
                    </label>
                  )) : (
                    <div className="bg-gray-300 p-4">
                      Nenhum Investigador
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus size={14} /> Suspeitos & Cúmplices Iniciais
                </h3>
                
                <div className="p-3 border border-[#27272a] bg-black/10 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-500 font-semibold">Nome (IC)</label>
                      <input
                        type="text"
                        value={tempSuspectName}
                        onChange={(e) => setTempSuspectName(e.target.value)}
                        placeholder="Ex: John Doe"
                        className="bg-black/20 border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition resize-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-500 font-semibold">Passaporte / RG</label>
                      <input
                        type="text"
                        value={tempSuspectRg}
                        onChange={(e) => setTempSuspectRg(e.target.value)}
                        placeholder="Ex: 4819"
                        className="bg-black/20 border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition resize-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 items-end">
                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-500 font-semibold">Função / Suspeita</label>
                      <input
                        type="text"
                        value={tempSuspectDesc}
                        onChange={(e) => setTempSuspectDesc(e.target.value)}
                        placeholder="Ex: Gerente financeiro do grupo"
                        className="bg-black/20 border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition resize-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-500 font-semibold">Envolvimento</label>
                      <select
                        value={tempSuspectType}
                        onChange={(e) => setTempSuspectType(e.target.value as any)}
                        className="bg-black/20 border border-[#27272a] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                      >
                        <option value="Suspect" className="bg-[#121214]">Suspeito</option>
                        <option value="Accomplice" className="bg-[#121214]">Cúmplice</option>
                      </select>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="primary" 
                    size="sm"
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg mt-2 text-xs py-1.5 cursor-pointer"
                    onClick={handleAddSuspect}
                  >
                    Adicionar Suspeito
                  </Button>
                </div>

                {suspects.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto border border-[#27272a] rounded-xl p-2.5 scrollbar-thin">
                    {suspects.map((sus, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/5 px-3 py-2 rounded-lg gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                            {sus.name} 
                            <span className="text-[9px] text-gray-500 font-normal">RG: {sus.rg}</span>
                            <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${
                              sus.type === "Suspect" 
                                ? "bg-red-500/15 text-red-400 border border-red-500/30" 
                                : "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                            }`}>
                              {sus.type === "Suspect" ? "Suspeito" : "Cúmplice"}
                            </span>
                          </p>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">{sus.description}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveSuspect(idx)}
                          className="p-1 rounded-md text-red-400 hover:bg-red-500/10 transition shrink-0 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1 pt-2">
                <label className="text-[11px] font-semibold text-zinc-500">Notas Adicionais</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instruções internas ou pontos cruciais a serem seguidos..."
                  rows={2}
                  className="w-full bg-black/20 border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition resize-none"
                />
              </div>
            </Modal.Body>

            <Modal.Footer className="border-t border-[#27272a] pt-3">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onClose}
                className="cursor-pointer"
                isDisabled={submitting}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleSubmit}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold cursor-pointer"
                isDisabled={submitting}
              >
                {submitting ? "Instaurando..." : "Instaurar Inquérito"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
