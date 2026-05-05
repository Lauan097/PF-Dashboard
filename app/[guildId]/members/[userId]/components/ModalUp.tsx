"use client";

import { useState, useEffect } from "react";
import { Modal, Button, TextArea, Label } from "@heroui/react";
import { Rocket } from "lucide-react";
import { TextChannelSelect } from "@/app/components/TextChannelSelect";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
  color: string;
  position: number;
}

interface ModalUpProps {
  isOpen: boolean;
  onClose: () => void;
  guildId: string;
  userId: string;
}

export default function ModalUp({ isOpen, onClose, guildId, userId }: ModalUpProps) {
  const [selectedRole, setSelectedRole] = useState("");
  const [reason, setReason] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !guildId) return;
    setLoadingRoles(true);
    fetch(`/api/data/guild?guildId=${guildId}&type=roles`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const mapped = (
            data.data.roles as {
              id: string;
              name: string;
              color: string;
              position: number;
            }[]
          ).map((r) => ({
            id: r.id,
            name: r.name,
            color: r.color,
            position: r.position,
          }));
          setRoles(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRoles(false));
  }, [isOpen, guildId]);

  function handleClose() {
    setSelectedRole("");
    setReason("");
    onClose();
  }

  return (
    <Modal>
      <Modal.Backdrop
        variant="blur"
        isOpen={isOpen}
        onOpenChange={(open) => !open && handleClose()}
      >
        <Modal.Container className="w-full">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-emerald-500/15 text-emerald-400">
                <Rocket size={18} />
              </Modal.Icon>
              <Modal.Heading>Promover Membro</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-4 py-4 px-2 bg-neutral-800 rounded-2xl">
              <TextChannelSelect
                channels={roles}
                value={selectedRole}
                onChange={setSelectedRole}
                label="Cargo de promoção"
                placeholder="Selecione o cargo..."
                type="roles"
                disabled={loadingRoles}
              />
              <div className="space-y-0.5 text-white/90">
                <p>Motivo</p>
                <TextArea
                  placeholder="Descreva o motivo da promoção..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  fullWidth
                  className="resize-none h-28 [scrollbar-width:none] pt-2"
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                isDisabled={!selectedRole || reason.trim() === "" || submitting}
                onClick={async () => {
                  if (submitting) return;
                  setSubmitting(true);
                  try {
                    const res = await fetch(`/api/data/user/manage?action=up`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        guildId,
                        targetUserId: userId,
                        roleId: selectedRole,
                        reason,
                      }),
                    });
                    const data = await res.json();
                    if (!data.success) throw new Error(data.error ?? "Erro ao promover.");
                    toast.success("Membro promovido com sucesso.");
                    handleClose();
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : "Erro desconhecido";
                    toast.error(msg);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                Confirmar promoção
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}