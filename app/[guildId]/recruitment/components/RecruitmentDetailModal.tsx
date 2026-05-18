"use client";

import { Modal, Button, ScrollShadow } from "@heroui/react";
import {
  MapPin,
  FileText,
  Info,
  Users,
  Hash,
  Clock,
  CheckCircle2,
  XCircle,
  Clipboard,
  LogIn,
  LogOut,
} from "lucide-react";
import { Recruitment } from "@/types/recruitment";
import { formatDateTime, formatDate } from "@/utils/timeFormat";
import RecruitmentStatusBadge from "./RecruitmentStatusBadge";

interface Props {
  recruitment: Recruitment | null;
  isOpen: boolean;
  onClose: () => void;
}

const resultConfig = {
  Approved: {
    label: "Aprovado",
    icon: <CheckCircle2 size={11} />,
    classes:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  Failed: {
    label: "Reprovado",
    icon: <XCircle size={11} />,
    classes: "bg-red-500/15 text-red-400 border border-red-500/30",
  },
  Withdrawn: {
    label: "Desistiu",
    icon: <Clock size={11} />,
    classes:
      "bg-neutral-500/15 text-neutral-400 border border-neutral-500/30",
  },
};

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="p-1.5 rounded-lg bg-white/6 mt-0.5 shrink-0 text-zinc-400">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-zinc-500 font-medium">
          {label}
        </p>
        <p className="text-sm text-zinc-200 mt-0.5 leading-relaxed whitespace-pre-line">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function RecruitmentDetailModal({
  recruitment,
  isOpen,
  onClose,
}: Props) {
  if (!recruitment) return null;

  const stats = {
    approved: recruitment.participants.filter((p) => p.result === "Approved")
      .length,
    failed: recruitment.participants.filter((p) => p.result === "Failed")
      .length,
    withdrawn: recruitment.participants.filter((p) => p.result === "Withdrawn")
      .length,
    pending: recruitment.participants.filter((p) => !p.result).length,
  };

  return (
    <Modal>
      <Modal.Backdrop
        variant="blur"
        isOpen={isOpen}
        onOpenChange={(open) => !open && onClose()}
      >
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />

            <Modal.Header>
              <Modal.Icon className="bg-white/8 text-zinc-400">
                <Clipboard size={18} />
              </Modal.Icon>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Modal.Heading className="text-base">
                    {recruitment.edition}º Academia de Polícia Federal
                  </Modal.Heading>
                  <div className="ml-auto">
                    <RecruitmentStatusBadge status={recruitment.status} size="sm" />
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                  <span className="text-zinc-500 font-medium">
                    @{recruitment.openedByTag}
                  </span>
                  <span className="text-zinc-700 mx-1">•</span>
                  {formatDate(recruitment.createdAt)}
                </p>
              </div>
            </Modal.Header>

            <Modal.Body className="space-y-4 py-4 max-h-[65vh] overflow-y-auto">
              <div className="flex items-start gap-2.5 bg-zinc-900/60 border border-white/5 rounded-xl p-2">
                <div className="p-1.5 rounded-lg bg-white/6 mt-0.5 shrink-0 text-zinc-400">
                  <MapPin size={20} className="text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-zinc-500 font-medium">
                    Localização
                  </p>
                  <p className="text-sm text-zinc-200 mt-0.5 leading-relaxed whitespace-pre-line">
                    {recruitment.location}
                  </p>
                </div>
              </div>
              <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  icon={<LogIn size={20} className="text-emerald-400" />}
                  label="Data de Abertura"
                  value={formatDate(recruitment.oppeningDate)}
                />
                <InfoRow
                  icon={<LogOut size={20} className="text-rose-400" />}
                  label="Data de Fechamento"
                  value={formatDate(recruitment.closingDate)}
                />
              </div>

              <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-2">
                <div className="flex items-center gap-2 pb-2 mb-2 border-b ">
                  <div className="p-1.5 rounded-lg bg-white/6 mt-0.5 shrink-0 text-zinc-400">
                    <FileText size={20} className="text-blue-400" />
                  </div>
                  <p className="text-sm text-zinc-500 font-medium">
                    Requisitos
                  </p>
                </div>
                <p className="text-sm text-zinc-200 mt-0.5 leading-relaxed whitespace-pre-line">
                  {recruitment.requirements}
                </p>
              </div>

              {recruitment.additionalInfo && (
                <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-2">
                  <div className="flex items-center gap-2 pb-2 mb-2 border-b ">
                    <div className="p-1.5 rounded-lg bg-white/6 mt-0.5 shrink-0 text-zinc-400">
                      <Info size={20} className="text-zinc-400" />
                    </div>
                    <p className="text-sm text-zinc-500 font-medium">
                      Informações Adicionais
                    </p>
                  </div>
                  <p className="text-sm text-zinc-200 mt-0.5 leading-relaxed whitespace-pre-line">
                    {recruitment.additionalInfo}
                  </p>
                </div>
              )}

              <div className="border border-white/5 rounded-xl p-2">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white/6 shrink-0 text-zinc-400">
                        <Users size={20} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-zinc-500 font-medium">
                        {recruitment.participants.length} Participante{recruitment.participants.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {recruitment.participants.length > 0 && (
                    <div className="flex items-center gap-4 p-2 ml-auto flex-wrap border rounded-full">
                      {stats.approved > 0 && (
                        <span className="inline-flex items-center gap-1 text-sm font-medium">
                          <CheckCircle2 size={14} className="text-green-400" />
                          {stats.approved}
                        </span>
                      )}
                      {stats.failed > 0 && (
                        <span className="inline-flex items-center gap-1 text-sm font-medium">
                          <XCircle size={14} className="text-red-400" />
                          {stats.failed}
                        </span>
                      )}
                      {stats.withdrawn > 0 && (
                        <span className="inline-flex items-center gap-1 text-sm font-medium">
                          <LogOut size={14} className="text-neutral-400" />
                          {stats.withdrawn}
                        </span>
                      )}
                      {stats.pending > 0 && (
                        <span className="inline-flex items-center gap-1 text-sm font-medium">
                          <Clock size={14} className="text-yellow-400" />
                          {stats.pending}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {recruitment.participants.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 text-sm bg-zinc-900/40 rounded-xl border border-white/5">
                    Nenhum participante inscrito nesta edição.
                  </div>
                ) : (
                  <ScrollShadow className="h-44 scrollbar-none">
                    <div className="flex flex-col gap-2.5">
                      {recruitment.participants.map((p) => {
                        const res = p.result ? resultConfig[p.result] : null;
                        return (
                          <div
                            key={p.id}
                            className="bg-zinc-900/60 border border-white/5 rounded-xl p-2 flex flex-col gap-2.5 hover:border-white/10 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-zinc-100 truncate">
                                  {p.gameName || p.userTag} ({p.gameId})
                                </p>
                                <p className="text-[11px] text-zinc-500 truncate">
                                  @{p.userTag}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-auto">
                                <p className="text-xs text-white/40 flex items-center gap-1 px-2 py-1 border border-white/15 bg-white/10 rounded-full">
                                  <Hash size={14} />
                                  {p.academyNumber}
                                </p>
                                {res ? (
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full text-xs px-2 py-1 font-medium ${res.classes} shrink-0`}
                                  >
                                    {res.icon}
                                    {res.label}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full text-xs px-2 py-1 font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
                                    <Clock size={10} />
                                    Em Academia
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 border-t border-white/10 mt-1.5 py-2.5">
                              <div>
                                <p className="text-white/40 text-[10px] font-medium">Contato</p>
                                <p className="text-white/90 font-semibold">{p.gamePhone}</p>
                              </div>
                              <div>
                                <p className="text-white/40 text-[10px] font-medium">Antecedentes</p>
                                <p className="text-white/90 font-semibold">{p.antecedents}</p>
                              </div>
                              <div>
                                <p className="text-white/40 text-[10px] font-medium">Data de Entrada</p>
                                <p className="text-white/90 font-semibold">{formatDateTime(p.startDate)}</p>
                              </div>
                              <div>
                                <p className="text-white/40 text-[10px] font-medium">Data de Saída</p>
                                <p className="text-white/90 font-semibold">
                                  {p.endDate ? formatDateTime(p.endDate) : "Em andamento"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollShadow>
                )}
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" size="sm" onClick={onClose}>
                Fechar
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
