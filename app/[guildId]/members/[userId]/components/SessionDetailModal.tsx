"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Skeleton,
  Chip,
  Separator,
} from "@heroui/react";
import {
  Clock,
  Users,
  FileText,
  Pause,
  ExternalLink,
  CircleAlert,
  Timer,
  Activity,
  Hash,
  CalendarDays,
  Crown,
  Shield,
} from "lucide-react";

interface Participant {
  id: string;
  userId: string;
  role: "Leader" | "Member";
  joinedAt: string;
  member: {
    gameName: string | null;
    nicknameDc: string | null;
    userTag: string | null;
    rank: string | null;
  };
}

interface PauseEntry {
  id: string;
  reason: string;
  estimatedTime: number | null;
  startedAt: string;
  finishedAt: string | null;
  createdByTag: string;
}

interface SessionDetail {
  id: string;
  startDate: string;
  finishedDate: string | null;
  totalSeconds: number | null;
  status: string;
  ownerRole: "Leader" | "Member";
  activity: string | null;
  voiceChannelId: string | null;
  initialNote: string | null;
  finalSummary: string | null;
  messageOpenLink: string | null;
  messageCloseLink: string | null;
  member: {
    gameName: string | null;
    nicknameDc: string | null;
    userTag: string | null;
    rank: string | null;
  };
  participants: Participant[];
  pauses: PauseEntry[];
}

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
  sessionIndex: number | null;
  guildId: string;
  userId: string;
}

const STATUS_LABELS: Record<string, { label: string; color: "success" | "warning" | "danger" | "default" }> = {
  Finished: { label: "Finalizada", color: "success" },
  Active: { label: "Ativa", color: "warning" },
  Paused: { label: "Pausada", color: "warning" },
  Cancelled: { label: "Cancelada", color: "danger" },
};

function fmtSeconds(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoRow({
  icon: Icon,
  label,
  value,
  iconClass = "text-zinc-500",
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  iconClass?: string;
}) {
  return (
    <div className="flex items-start gap-2 py-2 px-2">
      <Icon size={13} className={`mt-0.5 shrink-0 ${iconClass}`} />
      <span className="text-xs text-zinc-500 shrink-0 w-24">{label}</span>
      <span className="text-xs text-zinc-200 flex-1 text-right">{value}</span>
    </div>
  );
}

function memberName(m: { gameName: string | null; nicknameDc: string | null; userTag: string | null }) {
  return m.gameName || m.nicknameDc || m.userTag || "Membro";
}

export default function SessionDetailModal({
  isOpen,
  onClose,
  sessionId,
  sessionIndex,
  guildId,
  userId,
}: SessionDetailModalProps) {
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !sessionId) return;
    let cancelled = false;

    async function fetchDetail() {
      setLoading(true);
      setError(null);
      setDetail(null);
      try {
        const res = await fetch(
          `/api/data/user/sessions?guildId=${guildId}&userId=${userId}&sessionId=${sessionId}`,
        );
        const json = await res.json();
        if (cancelled) return;
        if (json.success) setDetail(json.data);
        else setError(json.error ?? "Erro ao carregar sessão.");
      } catch {
        if (!cancelled) setError("Erro ao carregar sessão.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDetail();
    return () => { cancelled = true; };
  }, [isOpen, sessionId, guildId, userId]);

  function handleClose() {
    setDetail(null);
    setError(null);
    onClose();
  }

  const status = detail ? (STATUS_LABELS[detail.status] ?? { label: detail.status, color: "default" as const }) : null;

  const pauseTotal =
    detail?.pauses.reduce((acc, p) => {
      if (p.startedAt && p.finishedAt) {
        return acc + (new Date(p.finishedAt).getTime() - new Date(p.startedAt).getTime()) / 1000;
      }
      return acc;
    }, 0) ?? 0;

  return (
    <Modal>
      <Modal.Backdrop
        variant="blur"
        isOpen={isOpen}
        onOpenChange={(open) => !open && handleClose()}
      >
        <Modal.Container className="w-full max-w-2xl">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-blue-500/15 text-blue-400">
                <Clock size={18} />
              </Modal.Icon>
              <div>
                <Modal.Heading>
                  Sessão{sessionIndex != null ? ` #${sessionIndex}` : ""}
                </Modal.Heading>
                {detail && (
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {fmtDateTime(detail.startDate)}
                  </p>
                )}
              </div>
            </Modal.Header>

            <Modal.Body className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              {loading && (
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-8 w-full rounded-xl bg-zinc-800" />
                  ))}
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <CircleAlert size={28} className="text-red-400" />
                  <p className="text-sm text-zinc-400">{error}</p>
                </div>
              )}

              {detail && !loading && (
                <>
                  {/* Status + Cargo */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Chip color={status?.color ?? "default"} size="sm" variant="secondary">
                      {status?.label}
                    </Chip>
                    <Chip
                      color={detail.ownerRole === "Leader" ? "warning" : "default"}
                      size="sm"
                      variant="secondary"
                    >
                      {detail.ownerRole === "Leader" ? "Líder" : "Membro"}
                    </Chip>
                  </div>

                  {/* Informações gerais */}
                  <div className="bg-zinc-900/60 border border-white/5 rounded-xl divide-y divide-white/5">
                    <InfoRow icon={CalendarDays} label="Início" value={fmtDateTime(detail.startDate)} iconClass="text-blue-400" />
                    {detail.finishedDate && (
                      <InfoRow icon={CalendarDays} label="Fim" value={fmtDateTime(detail.finishedDate)} iconClass="text-emerald-400" />
                    )}
                    <InfoRow
                      icon={Timer}
                      label="Duração total"
                      value={detail.totalSeconds ? fmtSeconds(detail.totalSeconds) : "—"}
                      iconClass="text-purple-400"
                    />
                    {pauseTotal > 0 && (
                      <InfoRow
                        icon={Pause}
                        label="Tempo pausado"
                        value={fmtSeconds(pauseTotal)}
                        iconClass="text-yellow-400"
                      />
                    )}
                    {detail.activity && (
                      <InfoRow icon={Activity} label="Atividade" value={detail.activity} iconClass="text-pink-400" />
                    )}
                    {detail.voiceChannelId && (
                      <InfoRow icon={Hash} label="Canal de voz" value={detail.voiceChannelId} iconClass="text-indigo-400" />
                    )}
                  </div>

                  {/* Relatório inicial */}
                  {detail.initialNote && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                        <FileText size={12} />
                        Relatório inicial
                      </div>
                      <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {detail.initialNote}
                      </div>
                    </div>
                  )}

                  {/* Relatório final */}
                  {detail.finalSummary && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                        <FileText size={12} className="text-emerald-400" />
                        Relatório final
                      </div>
                      <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {detail.finalSummary}
                      </div>
                    </div>
                  )}

                  {/* Participantes */}
                  {detail.participants.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                        <Users size={12} />
                        Participantes ({detail.participants.length})
                      </div>
                      <div className="bg-zinc-900/60 border border-white/5 rounded-xl divide-y divide-white/5">
                        {detail.participants.map((p) => (
                          <div key={p.id} className="flex items-center justify-between px-3 py-2">
                            <div className="flex items-center gap-2">
                              {p.role === "Leader" ? (
                                <Crown size={11} className="text-yellow-400 shrink-0" />
                              ) : (
                                <Shield size={11} className="text-zinc-500 shrink-0" />
                              )}
                              <span className="text-xs text-zinc-200">
                                {memberName(p.member)}
                              </span>
                              {p.member.rank && (
                                <span className="text-[10px] text-zinc-600">{p.member.rank}</span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500">
                              {new Date(p.joinedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pausas */}
                  {detail.pauses.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                        <Pause size={12} className="text-yellow-400" />
                        Pausas ({detail.pauses.length})
                      </div>
                      <div className="bg-zinc-900/60 border border-white/5 rounded-xl divide-y divide-white/5">
                        {detail.pauses.map((pause) => (
                          <div key={pause.id} className="px-3 py-2.5 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-zinc-200">{pause.reason}</span>
                              {pause.finishedAt && (
                                <span className="text-[10px] text-zinc-500">
                                  {fmtSeconds(
                                    (new Date(pause.finishedAt).getTime() - new Date(pause.startedAt).getTime()) / 1000,
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-600 flex items-center gap-2">
                              <span>{fmtDateTime(pause.startedAt)}</span>
                              {pause.finishedAt && <span>→ {fmtDateTime(pause.finishedAt)}</span>}
                              {!pause.finishedAt && <span className="text-yellow-500">Em andamento</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  {(detail.messageOpenLink || detail.messageCloseLink) && (
                    <div className="space-y-1.5">
                      <Separator />
                      <div className="flex items-center gap-3 flex-wrap pt-1">
                        {detail.messageOpenLink && (
                          <a
                            href={detail.messageOpenLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <ExternalLink size={11} />
                            Mensagem de abertura
                          </a>
                        )}
                        {detail.messageCloseLink && (
                          <a
                            href={detail.messageCloseLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            <ExternalLink size={11} />
                            Mensagem de encerramento
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" size="sm" onClick={handleClose}>
                Fechar
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
