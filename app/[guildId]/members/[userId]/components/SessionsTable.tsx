"use client";

import { useEffect, useState } from "react";
import { Table, Skeleton, Chip, EmptyState } from "@heroui/react";
import { Clock, CircleAlert } from "lucide-react";
import SessionDetailModal from "./SessionDetailModal";

interface Session {
  id: string;
  startDate: string;
  finishedDate: string | null;
  totalSeconds: number | null;
  status: string;
  ownerRole: "Leader" | "Member";
  activity: string | null;
}

interface SessionsTableProps {
  userId: string;
  guildId: string;
}

const STATUS_COLORS: Record<string, "success" | "warning" | "danger" | "default"> = {
  Finished: "success",
  Active: "warning",
  Paused: "warning",
  Cancelled: "danger",
};

const STATUS_LABELS: Record<string, string> = {
  Finished: "Finalizada",
  Active: "Ativa",
  Paused: "Pausada",
  Cancelled: "Cancelada",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtSeconds(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export default function SessionsTable({ userId, guildId }: SessionsTableProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!guildId || !userId) return;
    let cancelled = false;

    async function fetchSessions() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/data/user/sessions?guildId=${guildId}&userId=${userId}`,
        );
        const json = await res.json();
        if (cancelled) return;
        if (json.success) setSessions(json.data);
        else setError(json.error ?? "Erro ao carregar sessões.");
      } catch {
        if (!cancelled) setError("Erro ao carregar sessões.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSessions();
    return () => { cancelled = true; };
  }, [guildId, userId]);

  function openSession(id: string, index: number) {
    setSelectedSessionId(id);
    setSelectedSessionIndex(index);
    setModalOpen(true);
  }

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 space-y-3">
        <Skeleton className="h-4 w-40 bg-zinc-800" />
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl bg-zinc-800" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
        <CircleAlert size={28} className="text-red-400" />
        <p className="text-zinc-400 text-sm">{error}</p>
      </div>
    );
  }

  const total = sessions.length;

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-200">
            Histórico de Sessões
          </h2>
          {total > 0 && (
            <span className="text-[11px] text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">
              {total} {total === 1 ? "sessão" : "sessões"}
            </span>
          )}
        </div>

        <Table variant="secondary">
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Histórico de sessões de ponto"
              selectionMode="single"
              onSelectionChange={(keys) => {
                const key = keys === "all" ? null : [...keys][0];
                if (!key) return;
                const id = String(key);
                const idx = sessions.findIndex((s) => s.id === id);
                if (idx !== -1) openSession(id, total - idx);
              }}
            >
              <Table.Header>
                <Table.Column isRowHeader className="w-16">#</Table.Column>
                <Table.Column>Data</Table.Column>
                <Table.Column>Atividade</Table.Column>
                <Table.Column>Duração</Table.Column>
                <Table.Column>Cargo</Table.Column>
                <Table.Column>Status</Table.Column>
              </Table.Header>
              <Table.Body
                items={sessions}
                renderEmptyState={() => (
                  <EmptyState
                    title="Nenhuma sessão encontrada"
                  />
                )}
              >
                {(session) => {
                  const idx = sessions.indexOf(session);
                  const num = total - idx;
                  return (
                    <Table.Row
                      id={session.id}
                      key={session.id}
                      className="cursor-pointer"
                    >
                      <Table.Cell>
                        <span className="text-xs font-mono text-zinc-500">
                          #{num}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-xs text-zinc-300">
                          {fmtDate(session.startDate)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-xs text-zinc-400 max-w-36 truncate block">
                          {session.activity || "—"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-xs text-zinc-300">
                          {session.totalSeconds ? fmtSeconds(session.totalSeconds) : "—"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <Chip
                          color={session.ownerRole === "Leader" ? "warning" : "default"}
                          size="sm"
                          variant="secondary"
                        >
                          {session.ownerRole === "Leader" ? "Líder" : "Membro"}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell>
                        <Chip
                          color={STATUS_COLORS[session.status] ?? "default"}
                          size="sm"
                          variant="secondary"
                        >
                          {STATUS_LABELS[session.status] ?? session.status}
                        </Chip>
                      </Table.Cell>
                    </Table.Row>
                  );
                }}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>

      <SessionDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        sessionId={selectedSessionId}
        sessionIndex={selectedSessionIndex}
        guildId={guildId}
        userId={userId}
      />
    </>
  );
}
