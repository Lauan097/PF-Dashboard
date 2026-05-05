"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button, ButtonGroup, Spinner, Separator, Skeleton } from "@heroui/react";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { CircleAlert, ChevronLeft, Plus, X, Save } from "lucide-react";
import type { MemberRecord, MemberStatus } from "@/types/user";
import { toast } from "sonner";

const STATUS_OPTIONS: { value: MemberStatus; label: string }[] = [
  { value: "Active", label: "Ativo" },
  { value: "Inactive", label: "Inativo" },
  { value: "InAcademy", label: "Em Academia" },
  { value: "PendingForm", label: "Ficha Pendente" },
  { value: "Suspended", label: "Suspenso" },
  { value: "Exonerated", label: "Exonerado" },
];

function EditField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs text-black uppercase tracking-wider">
        {label}
      </span>
      {children}
    </div>
  );
}

function ListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState("");

  function addItem() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setInputValue("");
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-black uppercase tracking-wider">
        {label}
      </span>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-2 bg-zinc-200 border border-zinc-400 px-2 py-1 text-sm text-zinc-800"
          >
            <span className="flex-1">{item}</span>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-zinc-500 hover:text-red-600 transition-colors"
            >
              <X size={13} />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), addItem())
          }
          placeholder="Adicionar item..."
          className="flex-1 border-b border-zinc-600 bg-transparent text-sm text-zinc-800 outline-none px-1 py-0.5 placeholder:text-zinc-500"
        />
        <button
          type="button"
          onClick={addItem}
          className="text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

function toDateInput(value: string | null): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

type FormState = {
  // In-Game
  gameName: string;
  gameId: string;
  phone: string;
  photoUrl: string;
  level: string;
  gender: string;
  bloodType: string;
  maritalStatus: string;
  backgrounds: boolean;
  signature: string;

  // Institucional
  internalId: string;
  registration: string;
  rank: string;
  department: string;
  unit: string;
  admissionDate: string;
  status: MemberStatus;
  supervisorId: string;
  accessLevel: string;
  weaponPermit: boolean;

  // Qualificações
  specializations: string[];
  awards: string[];
  internalNotes: string;

  // Discord / Pessoal
  userTag: string;
  realName: string;
  birthDate: string;
  realPhone: string;
  email: string;
  cityAndState: string;
  workStatus: string;
  availableShifts: string[];
};

function buildFormState(m: MemberRecord): FormState {
  return {
    gameName: m.gameName ?? "",
    gameId: m.gameId ?? "",
    phone: m.phone ?? "",
    photoUrl: m.photoUrl ?? "",
    level: m.level != null ? String(m.level) : "",
    gender: m.gender ?? "",
    bloodType: m.bloodType ?? "",
    maritalStatus: m.maritalStatus ?? "",
    backgrounds: m.backgrounds ?? false,
    signature: m.signature ?? "",
    internalId: m.internalId ?? "",
    registration: m.registration ?? "",
    rank: m.rank ?? "",
    department: m.department ?? "",
    unit: m.unit ?? "",
    admissionDate: toDateInput(m.admissionDate),
    status: m.status,
    supervisorId: m.supervisorId ?? "",
    accessLevel: m.accessLevel != null ? String(m.accessLevel) : "",
    weaponPermit: m.weaponPermit ?? false,
    specializations: Array.isArray(m.specializations)
      ? (m.specializations as unknown[]).map(String)
      : typeof m.specializations === "string" && m.specializations
        ? [m.specializations as string]
        : [],
    awards: Array.isArray(m.awards)
      ? (m.awards as unknown[]).map(String)
      : typeof m.awards === "string" && m.awards
        ? [m.awards as string]
        : [],
    internalNotes: m.internalNotes ?? "",
    userTag: m.userTag ?? "",
    realName: m.realName ?? "",
    birthDate: toDateInput(m.birthDate),
    realPhone: m.realPhone ?? "",
    email: m.email ?? "",
    cityAndState: m.cityAndState ?? "",
    workStatus: m.workStatus ?? "",
    availableShifts: m.availableShifts
      ? m.availableShifts
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  };
}

const inputClass =
  "h-7 rounded-none border-0 border-b border-zinc-600 bg-transparent px-0 py-0.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:border-zinc-900";

const selectClass =
  "w-full h-7 border-b border-zinc-600 bg-transparent text-sm text-zinc-800 outline-none appearance-none cursor-pointer";

export default function EditRecordPage() {
  const params = useParams();
  const router = useRouter();
  const guildId = params.guildId as string;
  const userId = params.userId as string;

  const [member, setMember] = useState<MemberRecord | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchRecord() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/data/user/get-record?guildId=${guildId}&userId=${userId}`,
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          setMember(data.data);
          setForm(buildFormState(data.data));
        } else {
          setError(data.error || "Erro ao carregar ficha.");
        }
      } catch {
        if (!cancelled) setError("Erro ao carregar ficha.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchRecord();
    return () => {
      cancelled = true;
    };
  }, [userId, guildId]);

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    },
    [],
  );

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch("/api/data/user/edit-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId,
          userId,
          data: {
            ...form,
            level: form.level !== "" ? Number(form.level) : null,
            accessLevel:
              form.accessLevel !== "" ? Number(form.accessLevel) : null,
            admissionDate: form.admissionDate || null,
            birthDate: form.birthDate || null,
            specializations: form.specializations,
            awards: form.awards,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Ficha salva com sucesso!");
        router.push(`/${guildId}/members/${userId}`);
      } else {
        toast.error(json.error || "Erro ao salvar ficha.");
      }
    } catch {
      toast.error("Erro de conexão ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 pt-6 px-12 py-12 bg-[#171717] rounded-2xl">
        <div className="flex flex-col sm:flex-row print:hidden mx-auto max-w-5xl border-b h-20 border-zinc-700 mb-6 gap-6">
          <h1 className="flex items-center text-lg font-bold tracking-wide text-zinc-300 gap-2">
            <Skeleton className="h-7 w-82 bg-zinc-800 rounded-3xl" />
          </h1>
          <div className="sm:ml-auto space-x-2 pt-4 sm:pt-0 items-center flex">
            <Skeleton className="h-7 w-48 bg-zinc-800 rounded-3xl" />
          </div>
        </div>
        <Skeleton className="h-lvh w-5xl mx-auto bg-zinc-800" />
      </div>
    );
  }

  if (error || !member || !form) {
    return (
      <div className="text-red-400 text-sm py-12 text-center flex items-center justify-center h-screen gap-2">
        <CircleAlert size={24} />
        {error || "Ficha não encontrada."}
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 pt-6 px-12 py-12 bg-[#171717] rounded-2xl">
      <div className="flex flex-col sm:flex-row print:hidden mx-auto max-w-5xl border-b h-20 border-zinc-700 mb-6 gap-6">
        <div className="flex items-center gap-2">
          <Button
            variant="tertiary"
            onClick={() => router.push(`/${guildId}/members/${userId}`)}
          >
            <ChevronLeft size={15} /> Voltar
          </Button>
          <h1 className="text-lg font-bold tracking-wide text-zinc-300 sm:ml-2">
            Editar Ficha de Registro
          </h1>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <ButtonGroup size="sm" variant="secondary">
            <Button
              onClick={() => router.push(`/${guildId}/members/${userId}`)}
              isDisabled={saving}
              variant="danger"
            >
              <X />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              isDisabled={saving}
              className="text-black bg-white hover:bg-white/90"
            >
              {saving ? <Spinner color="current" className="size-4" /> : <Save size={14} />}
              Confirmar
            </Button>
          </ButtonGroup>
        </div>
      </div>

      <div className="bg-zinc-300 border border-zinc-800 px-2 py-8 md:p-8 shadow-2xl relative max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between border-b-2 border-zinc-700 pb-6 mb-8 gap-6">
          <div className="flex items-center gap-4 text-zinc-900">
            <Image
              src="/logoTP.png"
              alt="Logo PF"
              width={800}
              height={800}
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-widest uppercase">
                Polícia Federal
              </h1>
              <h2 className="text-xs text-zinc-700 tracking-widest uppercase">
                Departamento de Gestão Administrativa
              </h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-800 uppercase">Matrícula</p>
            <p className="text-zinc-800 text-xl">{form.registration}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mb-10">
          <div className="flex flex-col items-center gap-2 shrink-0 mx-auto md:mx-0">
            <div className="w-32 h-40 border-2 border-zinc-700 p-1 relative">
              <Image
                src={
                  form.photoUrl ||
                  "https://cdn.discordapp.com/embed/avatars/0.png"
                }
                alt="Foto Oficial"
                fill
                className="object-cover"
                priority
              />
            </div>
            <Input
              value={form.photoUrl}
              onChange={(e) => set("photoUrl", e.target.value)}
              className={`${inputClass} w-32 text-xs`}
              placeholder="URL da foto"
            />
          </div>
          <div className="flex-1 space-y-4 flex flex-col justify-end">
            <EditField label="Nome do Agente" className="w-full">
              <Input
                value={form.gameName}
                onChange={(e) => set("gameName", e.target.value)}
                className={inputClass}
                placeholder="—"
              />
            </EditField>
            <div className="flex flex-col sm:flex-row gap-4">
              <EditField label="Cargo/Patente" className="flex-1">
                <Input
                  value={form.rank}
                  onChange={(e) => set("rank", e.target.value)}
                  className={inputClass}
                  placeholder="—"
                />
              </EditField>
              <EditField label="ID Interno" className="w-full sm:w-1/3">
                <Input
                  value={form.internalId}
                  onChange={(e) => set("internalId", e.target.value)}
                  className={inputClass}
                  placeholder="—"
                />
              </EditField>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <EditField label="Unidade" className="w-full sm:w-2/3">
                <Input
                  value={form.unit}
                  onChange={(e) => set("unit", e.target.value)}
                  className={inputClass}
                  placeholder="—"
                />
              </EditField>
              <EditField label="Departamento" className="w-full sm:w-1/1">
                <Input
                  value={form.department}
                  onChange={(e) => set("department", e.target.value)}
                  className={inputClass}
                  placeholder="—"
                />
              </EditField>
            </div>
          </div>
        </div>

        <div className="mb-8 space-y-4 border border-zinc-800 px-2 py-8">
          <h3 className="text-sm font-bold text-zinc-600 uppercase tracking-widest mb-8">
            1. Identidade Civil (In-Game)
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <EditField label="Passaporte (ID)" className="w-full sm:w-1/3">
              <Input
                value={form.gameId}
                onChange={(e) => set("gameId", e.target.value)}
                className={inputClass}
                placeholder="—"
              />
            </EditField>
            <EditField label="Telefone" className="w-full sm:w-1/3">
              <Input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={inputClass}
                placeholder="—"
              />
            </EditField>
            <EditField label="Estado Civil" className="w-full sm:w-1/3">
              <Input
                value={form.maritalStatus}
                onChange={(e) => set("maritalStatus", e.target.value)}
                className={inputClass}
                placeholder="—"
              />
            </EditField>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <EditField label="Gênero" className="w-full sm:w-1/3">
              <Input
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                className={inputClass}
                placeholder="—"
              />
            </EditField>
            <EditField label="Tipo Sanguíneo" className="w-full sm:w-1/3">
              <Input
                value={form.bloodType}
                onChange={(e) => set("bloodType", e.target.value)}
                className={inputClass}
                placeholder="—"
              />
            </EditField>
            <EditField label="Nível/Level" className="w-full sm:w-1/3">
              <Input
                type="number"
                value={form.level}
                onChange={(e) => set("level", e.target.value)}
                className={inputClass}
                placeholder="—"
              />
            </EditField>
            <div className="w-full sm:w-1/3 flex flex-col gap-3 pb-1">
              <span className="text-xs text-black uppercase tracking-wider shrink-0">
                Possui Antecedentes?
              </span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1 text-sm text-zinc-800 cursor-pointer">
                  <div
                    onClick={() => set("backgrounds", true)}
                    className={`w-4 h-4 border border-zinc-500 flex items-center justify-center cursor-pointer ${form.backgrounds ? "bg-zinc-400" : ""}`}
                  >
                    {form.backgrounds && (
                      <span className="text-[10px] text-black">X</span>
                    )}
                  </div>
                  Sim
                </label>
                <label className="flex items-center gap-1 text-sm text-zinc-800 cursor-pointer">
                  <div
                    onClick={() => set("backgrounds", false)}
                    className={`w-4 h-4 border border-zinc-500 flex items-center justify-center cursor-pointer ${!form.backgrounds ? "bg-zinc-400" : ""}`}
                  >
                    {!form.backgrounds && (
                      <span className="text-[10px] text-black">X</span>
                    )}
                  </div>
                  Não
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 space-y-4 border border-zinc-800 px-2 py-8">
          <h3 className="text-sm font-bold text-zinc-600 uppercase tracking-widest mb-8">
            2. Dados Institucionais
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <EditField label="Data de Admissão" className="w-full sm:w-1/3">
              <Input
                type="date"
                value={form.admissionDate}
                onChange={(e) => set("admissionDate", e.target.value)}
                className={inputClass}
              />
            </EditField>
            <EditField label="Nível de Acesso" className="w-full sm:w-1/3">
              <Input
                type="number"
                value={form.accessLevel}
                onChange={(e) => set("accessLevel", e.target.value)}
                className={inputClass}
                placeholder="—"
              />
            </EditField>
            <div className="w-full sm:w-1/3 flex flex-col gap-3 pb-1">
              <span className="text-xs text-black uppercase tracking-wider shrink-0">
                Porte de Arma:
              </span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1 text-sm text-zinc-800 cursor-pointer">
                  <div
                    onClick={() => set("weaponPermit", true)}
                    className={`w-4 h-4 border border-zinc-500 flex items-center justify-center cursor-pointer ${form.weaponPermit ? "bg-zinc-400" : ""}`}
                  >
                    {form.weaponPermit && (
                      <span className="text-[10px] text-black">X</span>
                    )}
                  </div>
                  Sim
                </label>
                <label className="flex items-center gap-1 text-sm text-zinc-800 cursor-pointer">
                  <div
                    onClick={() => set("weaponPermit", false)}
                    className={`w-4 h-4 border border-zinc-500 flex items-center justify-center cursor-pointer ${!form.weaponPermit ? "bg-zinc-400" : ""}`}
                  >
                    {!form.weaponPermit && (
                      <span className="text-[10px] text-black">X</span>
                    )}
                  </div>
                  Não
                </label>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <EditField label="Status Operacional" className="w-full sm:w-1/2">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as MemberStatus)}
                className={selectClass}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </EditField>
            <EditField label="ID do Supervisor" className="w-full sm:w-1/2">
              <Input
                value={form.supervisorId}
                onChange={(e) => set("supervisorId", e.target.value)}
                className={inputClass}
                placeholder="—"
              />
            </EditField>
          </div>
        </div>

        <div className="mb-10 space-y-6 border border-zinc-800 px-2 py-8">
          <h3 className="text-sm font-bold text-zinc-600 uppercase tracking-widest mb-8">
            3. Qualificações e Observações Internas
          </h3>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <ListEditor
                label="Especializações"
                items={form.specializations}
                onChange={(items) => set("specializations", items)}
              />
            </div>
            <div className="flex-1">
              <ListEditor
                label="Condecorações"
                items={form.awards}
                onChange={(items) => set("awards", items)}
              />
            </div>
          </div>
          <EditField label="Anotações Internas" className="w-full">
            <Textarea
              value={form.internalNotes}
              onChange={(e) => set("internalNotes", e.target.value)}
              placeholder="Anotações sobre o membro..."
              className="border border-zinc-600 bg-zinc-200 rounded-none text-sm text-zinc-800 placeholder:text-zinc-400 focus-visible:ring-0 resize-none min-h-20 p-2"
            />
          </EditField>
        </div>

        <div className="mb-12 space-y-4 opacity-70 border border-zinc-800 px-2 py-8 relative">
          <div className="absolute top-0 right-0 bg-red-800/25 text-red-900 text-[10px] font-bold px-2 py-1 uppercase border-b border-l border-red-500/20 rounded-bl-lg">
            Dados sensíveis - OOC
          </div>
          <h3 className="text-sm font-bold text-zinc-600 uppercase tracking-widest mb-8">
            4. Dados Pessoais (Discord)
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <EditField label="Discord Tag" className="w-full sm:w-1/2">
              <Input
                value={form.userTag}
                onChange={(e) => set("userTag", e.target.value)}
                className={inputClass}
                placeholder="—"
              />
            </EditField>
            <div className="flex flex-col gap-1 w-full sm:w-1/2">
              <span className="text-xs text-black uppercase tracking-wider">
                Discord ID
              </span>
              <div className="text-sm text-zinc-700 border-b border-zinc-500 pb-0.5 font-mono">
                {member.userId}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <EditField label="Nome Real" className="w-full sm:w-1/2">
              <Input
                value={form.realName}
                onChange={(e) => set("realName", e.target.value)}
                className={inputClass}
                placeholder="—"
              />
            </EditField>
            <EditField label="Nascimento" className="w-full sm:w-1/4">
              <Input
                type="date"
                value={form.birthDate}
                onChange={(e) => set("birthDate", e.target.value)}
                className={inputClass}
              />
            </EditField>
            <EditField label="Telefone" className="w-full sm:w-1/3">
              <Input
                value={form.realPhone}
                onChange={(e) => set("realPhone", e.target.value)}
                className={inputClass}
                placeholder="—"
              />
            </EditField>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <EditField label="Cidade e Estado" className="w-full sm:w-1/2">
              <Input
                value={form.cityAndState}
                onChange={(e) => set("cityAndState", e.target.value)}
                className={inputClass}
                placeholder="—"
              />
            </EditField>
            <EditField label="Status de Trabalho" className="w-full sm:w-1/2">
              <Input
                value={form.workStatus}
                onChange={(e) => set("workStatus", e.target.value)}
                className={inputClass}
                placeholder="—"
              />
            </EditField>
          </div>
          <div className="flex-1">
            <ListEditor
              label="Turnos Disponíveis"
              items={form.availableShifts}
              onChange={(items) => set("availableShifts", items)}
            />
          </div>
          <EditField label="Email" className="w-full">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
              placeholder="—"
            />
          </EditField>
        </div>

        <div className="pt-8 flex flex-row items-end justify-around gap-8">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="h-16 flex flex-col items-center justify-end gap-1 w-full">
              {form.signature ? (
                <Image
                  src={form.signature}
                  alt="Assinatura"
                  width={300}
                  height={120}
                  className="max-h-12 max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-zinc-500 italic">
                  Sem assinatura
                </span>
              )}
            </div>
            <div className="w-full border-b border-zinc-600" />
            <p className="text-[11px] text-zinc-800 uppercase tracking-widest">
              Assinatura do Membro
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="h-16 flex items-end justify-center">
              <span className="text-xs italic"></span>
            </div>
            <div className="w-full border-b border-zinc-600" />
            <p className="text-[11px] text-zinc-800 uppercase tracking-widest">
              Assinatura do Diretor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
