"use client";

import { useState, useEffect, startTransition } from "react";
import { Modal, Button, Input, TextArea, Label } from "@heroui/react";
import { UserPen } from "lucide-react";
import { toast } from "sonner";
import { AcademyParticipant } from "@/types/recruitment";

interface Props {
  participant: AcademyParticipant | null;
  guildId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updated: AcademyParticipant) => void;
}

interface FormState {
  gameName: string;
  gameId: string;
  gamePhone: string;
  antecedents: string;
}

export default function ModalEditRegister({
  participant,
  guildId,
  isOpen,
  onClose,
  onUpdated,
}: Props) {
  const [form, setForm] = useState<FormState>({
    gameName: "",
    gameId: "",
    gamePhone: "",
    antecedents: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(() => {
      if (participant) {
        setForm({
          gameName: participant.gameName ?? "",
          gameId: participant.gameId ?? "",
          gamePhone: participant.gamePhone ?? "",
          antecedents: participant.antecedents ?? "",
        });
        setError(null);
      }
    })
  }, [participant]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!participant) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/recruitment/participant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId,
          participantId: participant.id,
          gameName: form.gameName.trim() || null,
          gameId: form.gameId.trim() || null,
          gamePhone: form.gamePhone.trim() || null,
          antecedents: form.antecedents.trim() || null,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Erro ao salvar alterações.");
        return;
      }

      onUpdated(data.data as AcademyParticipant);
      handleClose();
      toast.success("Participante atualizado com sucesso!");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!participant) return null;

  return (
    <Modal>
      <Modal.Backdrop
        variant="blur"
        isOpen={isOpen}
        onOpenChange={(open) => !open && handleClose()}
      >
        <Modal.Container className="w-full max-w-xl">
          <Modal.Dialog>
            <Modal.CloseTrigger />

            <Modal.Header>
              <Modal.Icon className="bg-blue-500/15 text-blue-400">
                <UserPen size={18} />
              </Modal.Icon>
              <div>
                <Modal.Heading>Editar Participante</Modal.Heading>
                <p className="text-xs text-zinc-500 mt-0.5">
                  @{participant.userTag}
                </p>
              </div>
            </Modal.Header>

            <Modal.Body className="space-y-3 py-4 px-2 bg-neutral-800 rounded-2xl">
              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400 font-medium">
                  Nome no Jogo
                </Label>
                <Input
                  placeholder="Nome do personagem..."
                  value={form.gameName}
                  onChange={(e) => handleChange("gameName", e.target.value)}
                  fullWidth
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400 font-medium">
                  ID no Jogo
                </Label>
                <Input
                  placeholder="ID do personagem..."
                  value={form.gameId}
                  onChange={(e) => handleChange("gameId", e.target.value)}
                  fullWidth
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400 font-medium">
                  Telefone
                </Label>
                <Input
                  placeholder="Número de contato..."
                  value={form.gamePhone}
                  onChange={(e) => handleChange("gamePhone", e.target.value)}
                  fullWidth
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400 font-medium">
                  Antecedentes
                </Label>
                <TextArea
                  placeholder="Histórico de antecedentes..."
                  value={form.antecedents}
                  onChange={(e) => handleChange("antecedents", e.target.value)}
                  fullWidth
                  className="resize-none h-20 [scrollbar-width:none]"
                />
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="tertiary" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                isDisabled={loading}
                onClick={handleSubmit}
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}