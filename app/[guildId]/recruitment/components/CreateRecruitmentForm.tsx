"use client";

import { useState } from "react";
import {
  Modal,
  Button,
  TextArea,
  Label,
  DatePicker,
  DateField,
  Calendar,
  Input,
  NumberField,
} from "@heroui/react";
import type { DateValue } from "@internationalized/date";
import { CalendarDate } from "@internationalized/date";
import { PlusCircle, Info } from "lucide-react";
import { CreateRecruitmentPayload } from "@/types/recruitment";

interface Props {
  guildId: string;
  onCreated: () => void;
}

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({ label, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-zinc-400 font-medium">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

function calendarDateToIso(date: DateValue | null): string {
  if (!date) return "";
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

function isoToCalendarDate(iso: string): CalendarDate | null {
  if (!iso) return null;
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new CalendarDate(year, month, day);
}

function RecruitmentDatePicker({
  value,
  onChange,
  label,
  required,
}: {
  value: string;
  onChange: (iso: string) => void;
  label: string;
  required?: boolean;
}) {
  const calendarValue = isoToCalendarDate(value);

  return (
    <FormField label={label} required={required}>
      <DatePicker
        value={calendarValue}
        onChange={(v) => onChange(calendarDateToIso(v))}
        className="w-full"
      >
        <DateField.Group
          fullWidth
          variant="primary"
        >
          <DateField.Input>
            {(segment) => (
              <DateField.Segment
                segment={segment}
              />
            )}
          </DateField.Input>
          <DateField.Suffix>
            <DatePicker.Trigger>
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>

        <DatePicker.Popover className="p-2 bg-zinc-900 border border-white/10 shadow-2xl shadow-black/50 max-w-[300px]">
          <Calendar aria-label={`Escolher ${label}`}>
            <Calendar.Header className="flex items-center justify-between px-2 pb-2">
              <Calendar.YearPickerTrigger className="flex items-center gap-1 text-sm font-semibold text-white/80 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/8">
                <Calendar.YearPickerTriggerHeading />
                <Calendar.YearPickerTriggerIndicator />
              </Calendar.YearPickerTrigger>
              <div className="flex items-center gap-1">
                <Calendar.NavButton
                  slot="previous"
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-colors"
                />
                <Calendar.NavButton
                  slot="next"
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-colors"
                />
              </div>
            </Calendar.Header>

            <Calendar.Grid className="w-full">
              <Calendar.GridHeader className="text-[10px] text-white/40 uppercase tracking-wider">
                {(day) => (
                  <Calendar.HeaderCell className="py-1 text-center font-medium">
                    {day}
                  </Calendar.HeaderCell>
                )}
              </Calendar.GridHeader>
              <Calendar.GridBody className="text-sm">
                {(date) => (
                  <Calendar.Cell
                    date={date}
                  />
                )}
              </Calendar.GridBody>
            </Calendar.Grid>
          </Calendar>
        </DatePicker.Popover>
      </DatePicker>
    </FormField>
  );
}

export default function CreateRecruitmentForm({ guildId, onCreated }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateRecruitmentPayload>({
    edition: "",
    oppeningDate: "",
    closingDate: "",
    requirements: "",
    location: "",
    additionalInfo: "",
  });

  const handleChange = (
    field: keyof CreateRecruitmentPayload,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    setForm({
      edition: "",
      oppeningDate: "",
      closingDate: "",
      requirements: "",
      location: "",
      additionalInfo: "",
    });
  };

  const handleSubmit = async () => {
    if (
      !form.edition.trim() ||
      !form.oppeningDate ||
      !form.closingDate ||
      !form.requirements.trim() ||
      !form.location.trim()
    ) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId, payload: form }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Erro ao criar recrutamento.");
        return;
      }

      handleClose();
      onCreated();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all duration-200 cursor-pointer"
      >
        <PlusCircle size={16} />
        Novo Recrutamento
      </button>

      <Modal>
        <Modal.Backdrop
          variant="blur"
          isOpen={isOpen}
          onOpenChange={(open) => !open && handleClose()}
        >
          <Modal.Container className="w-full" size="lg">
            <Modal.Dialog>
              <Modal.CloseTrigger />

              <Modal.Header>
                <Modal.Icon className="bg-blue-500/15 text-blue-400">
                  <PlusCircle size={18} />
                </Modal.Icon>
                <div>
                  <Modal.Heading>Novo Recrutamento</Modal.Heading>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Será criado com status{" "}
                    <span className="text-amber-400 font-semibold">Em breve</span>
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="space-y-4 py-4 px-2 bg-neutral-800 rounded-2xl">
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    <Info size={14} />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Edição" required>
                    <NumberField
                      defaultValue={0}
                      onChange={(value) => handleChange("edition", value.toString())}
                    >
                      <NumberField.Group>
                        <NumberField.DecrementButton />
                        <NumberField.Input />
                        <NumberField.IncrementButton />
                      </NumberField.Group>
                    </NumberField>
                  </FormField>

                  <FormField label="Localização" required>
                    <Input
                      placeholder="Ex: Delegacia Central"
                      value={form.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      fullWidth
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <RecruitmentDatePicker
                    label="Data de Abertura"
                    required
                    value={form.oppeningDate}
                    onChange={(v) => handleChange("oppeningDate", v)}
                  />
                  <RecruitmentDatePicker
                    label="Data de Fechamento"
                    required
                    value={form.closingDate}
                    onChange={(v) => handleChange("closingDate", v)}
                  />
                </div>

                <FormField label="Requisitos" required>
                  <TextArea
                    placeholder="Liste os requisitos para participação..."
                    value={form.requirements}
                    onChange={(e) =>
                      handleChange("requirements", e.target.value)
                    }
                    fullWidth
                    className="resize-none h-24 [scrollbar-width:none]"
                  />
                </FormField>

                <FormField label="Informações Adicionais">
                  <TextArea
                    placeholder="Informações extras para os participantes (opcional)..."
                    value={form.additionalInfo}
                    onChange={(e) =>
                      handleChange("additionalInfo", e.target.value)
                    }
                    fullWidth
                    className="resize-none h-24 [scrollbar-width:none]"
                  />
                </FormField>
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
                  {loading ? "Criando..." : "Criar Recrutamento"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
