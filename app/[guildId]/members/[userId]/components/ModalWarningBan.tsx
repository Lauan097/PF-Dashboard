"use client";

import { useState } from "react";
import { Modal, Button, TextArea, Label, Select, ListBox } from "@heroui/react";
import type { Key } from "@heroui/react";
import { Ban, TriangleAlert, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// IDs dos cargos de advertência por nível
const WARNING_ROLES = {
  1: "ROLE_ID_LEVEL_1",
  2: "ROLE_ID_LEVEL_2",
  3: "ROLE_ID_LEVEL_3",
} as const;

const WARNING_LEVELS = [
  { label: "Nível 1", value: 1 },
  { label: "Nível 2", value: 2 },
  { label: "Nível 3", value: 3 },
];

const DURATIONS = [
  { label: "1 hora", value: 3600 },
  { label: "2 horas", value: 7200 },
  { label: "6 horas", value: 21600 },
  { label: "12 horas", value: 43200 },
  { label: "1 dia", value: 86400 },
  { label: "3 dias", value: 259200 },
  { label: "7 dias", value: 604800 },
  { label: "30 dias", value: 2592000 },
  { label: "Permanente", value: 0 },
];

interface ModalWarningBanProps {
  type: "warning" | "ban";
  isOpen: boolean;
  onClose: () => void;
  guildId: string;
  userId: string;
}

export default function ModalWarningBan({
  type,
  isOpen,
  onClose,
  guildId,
  userId,
}: ModalWarningBanProps) {
  const [reason, setReason] = useState("");
  const [warningLevel, setWarningLevel] = useState<string>("1");
  const [duration, setDuration] = useState<string>("3600");
  const [submitting, setSubmitting] = useState(false);

  const isBan = type === "ban";

  function handleClose() {
    setReason("");
    setWarningLevel("1");
    setDuration("3600");
    onClose();
  }

  async function handleConfirm() {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (isBan) {
        const res = await fetch(
          `/api/data/user/manage?action=ban`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guildId, targetUserId: userId, reason }),
          },
        );
        const data = await res.json();
        if (!data.success) throw new Error(data.error ?? "Erro ao exonerar.");
        toast.success("Membro exonerado com sucesso.");
      } else {
        const level = Number(warningLevel) as 1 | 2 | 3;
        const res = await fetch(
          `/api/data/user/manage?action=warning`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              guildId,
              targetUserId: userId,
              reason,
              level,
              durationSeconds: Number(duration),
            }),
          },
        );
        const data = await res.json();
        if (!data.success) throw new Error(data.error ?? "Erro ao advertir.");
        toast.success("Advertência aplicada com sucesso.");
      }
      handleClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const canConfirm = reason.trim() !== "";

  return (
    <Modal>
      <Modal.Backdrop
        variant="blur"
        isOpen={isOpen}
        onOpenChange={(open) => !open && handleClose()}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />

            <Modal.Header>
              <Modal.Icon
                className={
                  isBan
                    ? "bg-red-500/15 text-red-400"
                    : "bg-yellow-500/15 text-yellow-400"
                }
              >
                {isBan ? <Ban size={18} /> : <TriangleAlert size={18} />}
              </Modal.Icon>
              <Modal.Heading>
                {isBan ? "Exonerar Membro" : "Advertir Membro"}
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body className="space-y-4 py-4 px-2 bg-neutral-800 rounded-2xl">

              {isBan && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <AlertTriangle
                    size={16}
                    className="mt-0.5 shrink-0 text-red-400"
                  />
                  <p className="text-xs leading-relaxed text-red-300">
                    Esta ação é <span className="font-semibold">permanente</span> e{" "}
                    <span className="font-semibold">não pode ser desfeita</span>. O
                    membro será exonerado do servidor imediatamente.
                  </p>
                </div>
              )}

              {!isBan && (
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    value={warningLevel}
                    onChange={(val: Key | null) =>
                      val && setWarningLevel(val as string)
                    }
                    fullWidth
                  >
                    <Label className="text-xs text-zinc-400">
                      Nível de advertência
                    </Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {WARNING_LEVELS.map((l) => (
                          <ListBox.Item
                            key={String(l.value)}
                            id={String(l.value)}
                            textValue={l.label}
                          >
                            {l.label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>

                  <Select
                    value={duration}
                    onChange={(val: Key | null) =>
                      val && setDuration(val as string)
                    }
                    fullWidth
                  >
                    <Label className="text-xs text-zinc-400">Duração</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {DURATIONS.map((d) => (
                          <ListBox.Item
                            key={String(d.value)}
                            id={String(d.value)}
                            textValue={d.label}
                          >
                            {d.label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Motivo</Label>
                <TextArea
                  placeholder={
                    isBan
                      ? "Descreva o motivo da exoneração..."
                      : "Descreva o motivo da advertência..."
                  }
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  fullWidth
                  className="resize-none h-28 [scrollbar-width:none]"
                />
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="tertiary" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                variant={isBan ? "danger" : "primary"}
                isDisabled={!canConfirm || submitting}
                onClick={handleConfirm}
              >
                {isBan ? "Confirmar exoneração" : "Confirmar advertência"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
