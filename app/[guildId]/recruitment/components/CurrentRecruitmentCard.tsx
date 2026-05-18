"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Skeleton, Button, Chip, Dropdown, Label, ScrollShadow } from "@heroui/react";
import {
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
  StopCircle,
  EllipsisVertical,
  Hash,
  UserPen,
  Trash2,
  LogIn,
  LogOut,
} from "lucide-react";
import { Recruitment, RecruitmentStatus, AcademyParticipant } from "@/types/recruitment";
import { formatDateTime, formatDate } from "@/utils/timeFormat";
import RecruitmentStatusBadge from "./RecruitmentStatusBadge";
import ModalEditRegister from "./ModalEditRegister";
import Image from "next/image";

interface Props {
  recruitment: Recruitment | null;
  loading: boolean;
  guildId: string;
  onStatusUpdated: (updated: Recruitment) => void;
}

const resultConfig = {
  Approved: {
    label: "Aprovado",
    icon: <CheckCircle2 size={12} />,
    classes: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  Failed: {
    label: "Reprovado",
    icon: <XCircle size={12} />,
    classes: "bg-red-500/15 text-red-400 border border-red-500/30",
  },
  Withdrawn: {
    label: "Desistiu",
    icon: <Clock size={12} />,
    classes: "bg-neutral-500/15 text-neutral-400 border border-neutral-500/30",
  },
};

export default function CurrentRecruitmentCard({
  recruitment,
  loading,
  guildId,
  onStatusUpdated,
}: Props) {
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingParticipant, setEditingParticipant] = useState<AcademyParticipant | null>(null);
  const [localParticipants, setLocalParticipants] = useState<AcademyParticipant[]>([]);

  const participants = recruitment
    ? (localParticipants.length > 0 && localParticipants[0]?.recruitmentId === recruitment.id
      ? localParticipants
      : recruitment.participants)
    : [];

  const handleStatusUpdate = async (newStatus: RecruitmentStatus) => {
    if (!recruitment) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/recruitment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId,
          recruitmentId: recruitment.id,
          newStatus,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        onStatusUpdated(data.data);
        setLocalParticipants([]);
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (participantId: string) => {
    setDeletingId(participantId);
    try {
      const res = await fetch(
        `/api/recruitment/participant?guildId=${guildId}&participantId=${participantId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        const current = localParticipants.length > 0
          ? localParticipants
          : (recruitment?.participants ?? []);
        setLocalParticipants(current.filter((p) => p.id !== participantId));
        toast.success("Participante deletado com sucesso!");
      } else {
        toast.error("Erro ao deletar participante.");
      }
    } catch (err) {
      console.error("Erro ao deletar participante:", err);
      toast.error("Erro ao deletar participante.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleParticipantUpdated = (updated: AcademyParticipant) => {
    const current = localParticipants.length > 0
      ? localParticipants
      : (recruitment?.participants ?? []);
    setLocalParticipants(current.map((p) => (p.id === updated.id ? updated : p)));
  };

  if (loading) {
    return (
      <div className="bg-[#1c1c1f] border border-white/8 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="w-32 h-4 rounded-lg" />
            <Skeleton className="w-48 h-6 rounded-lg" />
          </div>
          <Skeleton className="w-24 h-8 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-px w-full rounded-full" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!recruitment) {
    return (
      <div className="bg-[#1c1c1f] border border-white/8 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3 h-140">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <Users size={32} className="text-white/20" />
        </div>
        <p className="text-white/40 text-sm">
          Nenhum recrutamento encontrado. Crie a primeira edição!
        </p>
      </div>
    );
  }

  const isClosed = recruitment.status === "Closed";

  return (
    <>
    <div
      className={`relative overflow-hidden bg-[#1c1c1f] border rounded-2xl p-6 transition-all duration-300 ${
        recruitment.status === "Open"
          ? "border-emerald-500/25 shadow-lg shadow-emerald-500/5"
          : recruitment.status === "InProgress"
          ? "border-yellow-500/25 shadow-lg shadow-yellow-500/5"
          : recruitment.status === "Upcoming"
          ? "border-amber-500/25 shadow-lg shadow-amber-500/5"
          : "border-white/8"
      }`}
    >

      <div className="relative flex items-start justify-between mb-5 border border-zinc-800 rounded-xl p-5">
        <div>
          <h2 className="text-xl font-bold text-white">
            {recruitment.edition}º Academia de Polícia Federal
          </h2>
          <p className="text-[11px] text-white/40 mt-1 flex items-center gap-1">
            <span className="text-white/60 font-medium">{formatDate(recruitment.createdAt)}</span>
             — 
            <span className="text-white/60 font-medium">{recruitment.closedAt ? formatDate(recruitment.closedAt) : "Em andamento"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RecruitmentStatusBadge status={recruitment.status} size="lg" />

          {!isClosed && (
            <hr className="h-6 border-l border-white/6" />
          )}

          {recruitment.status === "Upcoming" && (
            <Button
              size="sm"
              isDisabled={updating}
              onClick={() => handleStatusUpdate("Open")}
              variant="primary"
              className="font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {updating ? "Aguarde..." : (
                <span className="flex items-center gap-1.5">
                  <PlayCircle size={14} />
                  Abrir Recrutamento
                </span>
              )}
            </Button>
          )}
          {recruitment.status === "Open" && (
            <Button
              size="sm"
              isDisabled={updating}
              onClick={() => handleStatusUpdate("InProgress")}
              variant="danger-soft"
              className="font-semibold text-xs bg-yellow-600 hover:bg-yellow-500 text-white"
            >
              {updating ? "Aguarde..." : (
                <span className="flex items-center gap-1.5">
                  <StopCircle size={14} />
                  Fechar Inscrições
                </span>
              )}
            </Button>
          )}
          {recruitment.status === "InProgress" && (
            <Button
              size="sm"
              isDisabled={updating}
              onClick={() => handleStatusUpdate("Closed")}
              variant="danger-soft"
              className="font-semibold text-xs"
            >
              {updating ? "Aguarde..." : (
                <span className="flex items-center gap-1.5">
                  <StopCircle size={14} />
                  Encerrar Academia
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-white/4 rounded-xl p-3.5 border border-white/6 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/15">
            <MapPin size={20} className="text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-white/40 font-medium">
              Localização
            </p>
            <p className="text-sm text-white/80 font-medium mt-0.5">
              {recruitment.location}
            </p>
          </div>
        </div>

        <div className="bg-white/4 rounded-xl p-3.5 border border-white/6 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-green-500/15">
            <LogIn size={20} className="text-green-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-white/40 font-medium">
              Abertura
            </p>
            <p className="text-sm text-white/80 font-medium mt-0.5">
              {formatDate(recruitment.oppeningDate)}
            </p>
          </div>
        </div>

        <div className="bg-white/4 rounded-xl p-3.5 border border-white/6 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-500/15">
            <LogOut size={20} className="text-red-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-white/40 font-medium">
              Fechamento
            </p>
            <p className="text-sm text-white/80 font-medium mt-0.5">
              {formatDate(recruitment.closingDate)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="relative bg-white/4 rounded-xl p-4 border border-white/6 mb-5">
          <p className="text-[11px] text-white/40 font-medium mb-1.5">
            Requisitos
          </p>
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
            {recruitment.requirements}
          </p>
        </div>
        <div className="relative bg-white/4 rounded-xl p-4 border border-white/6 mb-5">
          <p className="text-[11px] text-white/40 font-medium mb-1.5">
            Notas adicionais
          </p>
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
            {recruitment.additionalInfo ? recruitment.additionalInfo : "Sem notas adicionais..."}
          </p>
        </div>
      </div>

      <hr className="border-white/6 my-5" />

      <div className="relative">  
        <div className="flex items-center gap-2 mb-3">
          <Users size={15} className="text-white/40" />
          <p className="text-sm font-semibold text-white/70">Participantes</p>
          <Chip size="sm" className="bg-white/8 text-white/50 text-[10px] h-4 min-w-0 px-1.5">
            {recruitment.participants.length}
          </Chip>
        </div>

        {recruitment.participants.length === 0 ? (
          <div className="py-6 text-center text-white/30 text-sm bg-white/3 rounded-xl border border-white/6">
            Nenhum participante inscrito ainda.
          </div>
        ) : (
          <ScrollShadow className="max-h-[350px] scrollbar-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {participants.map((p) => {
                const res = p.result ? resultConfig[p.result] : null;
                return (
                  <div
                    key={p.id}
                    className="border border-white/6 rounded-xl p-3 flex flex-col gap-2 hover:border-white/12 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-2">
                        <Image src={p.discord?.avatar ?? "/public/logo.png"} alt={p.discord?.username ?? ""} width={28} height={28} className="rounded-full" />
                        <div>
                          <p className="text-sm font-semibold text-white/90 truncate">
                            {p.gameName || p.userTag} ({p.gameId})
                          </p>
                          <p className="text-[11px] text-white/40 flex items-center gap-1 truncate">
                            @{p.userTag}
                          </p>
                        </div>
                      </div>
                      {res && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full text-[10px] px-2 py-0.5 font-medium ${res.classes} shrink-0`}
                        >
                          {res.icon}
                          {res.label}
                        </span>
                      )}
                      <div className="flex items-center gap-2 ml-auto">
                        <p className="text-sm text-white/40 flex items-center gap-1 px-2 py-1 border border-white/6 rounded-full">
                          <Hash size={14} />
                          {p.academyNumber}
                        </p>
                        <Dropdown>
                          <Button isIconOnly variant="outline" size="sm" isDisabled={deletingId === p.id || isClosed}>
                            {deletingId === p.id
                              ? <Clock size={14} className="animate-spin" />
                              : <EllipsisVertical size={14} />}
                          </Button>
                          <Dropdown.Popover placement="bottom" className="min-w-[140px]">
                            <Dropdown.Menu>
                              <Dropdown.Item onPress={() => setEditingParticipant(p)}>
                                <UserPen size={16} className="text-muted" />
                                <Label>Alterar</Label>
                              </Dropdown.Item>
                              <Dropdown.Item variant="danger" onPress={() => handleDelete(p.id)}>
                                <Trash2 size={16} className="text-danger" />
                                <Label>Deletar</Label>
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown.Popover>
                        </Dropdown>
                      </div>
                    </div>  

                    <div className="grid grid-cols-2 gap-2 border-t border-b border-white/10 mt-1.5 py-2.5">
                      <div>
                        <p className="text-white/40 text-[10px] font-medium">Contato</p>
                        <p className="text-white/90 font-semibold">{p.gamePhone}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-[10px] font-medium">Antecedentes</p>
                        <p className="text-white/90 font-semibold">{p.antecedents}</p>
                      </div>
                    </div>

                    {!isClosed && (
                      <div className="flex items-center gap-1 text-xs text-white/30 mt-2">
                        <p className="text-white/40 font-medium">Data de Registro:</p>
                        <p className="text-white/90 font-semibold">{formatDateTime(p.startDate)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollShadow>
        )}
      </div>
    </div>

    <ModalEditRegister
      participant={editingParticipant}
      guildId={guildId}
      isOpen={!!editingParticipant}
      onClose={() => setEditingParticipant(null)}
      onUpdated={handleParticipantUpdated}
    />
  </>);
}
