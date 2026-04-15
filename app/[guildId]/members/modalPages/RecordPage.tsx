'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/button";
import { TooltipButton } from "@/app/components/TooltipButton";
import { CircleAlert, Download, UserRoundPen } from "lucide-react";
import type { MemberRecord } from "@/types/user";

interface MemberRecordPageProps {
  userId: string;
  guildId: string;
}

const STATUS_LABELS: Record<string, string> = {
  Active: 'Ativo',
  Inactive: 'Inativo',
  InAcademy: 'Em Academia',
  PendingForm: 'Ficha Pendente',
  Suspended: 'Suspenso',
  Exonerated: 'Exonerado',
};

export default function MemberRecordPage({ userId, guildId }: MemberRecordPageProps) {
  const [member, setMember] = useState<MemberRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRecord() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/data/user/get-record?guildId=${guildId}&userId=${userId}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success) setMember(data.data);
        else setError(data.error || 'Erro ao carregar ficha.');
      } catch {
        if (!cancelled) setError('Erro ao carregar ficha.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRecord();
    return () => { cancelled = true; };
  }, [userId, guildId]);

  if (loading) {
    return <div className="text-zinc-500 text-sm py-12 text-center min-h-screen flex items-center justify-center">Carregando ficha...</div>;
  }

  if (error || !member) {
    return <div className="text-red-400 text-sm py-12 text-center min-h-screen flex items-center justify-center">
      <CircleAlert size={24} className="inline-block mr-2" />
      {error || 'Ficha não encontrada.'}
    </div>;
  }

  const fmtDate = (v: string | null) => v ? new Date(v).toLocaleDateString('pt-BR') : 'N/A';
  const fmtJson = (v: unknown) => {
    if (!v) return 'N/A';
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) return v.join(', ');
    return JSON.stringify(v);
  };

  return (
    <div
      className="container mx-auto max-w-5xl space-y-6 pt-6"
    >
      <div className="flex flex-col sm:flex-row bg-[#171717] border border-zinc-800 px-2 py-8 md:p-4">
        <h1 className="text-lg font-bold tracking-wide text-zinc-300">Ficha de Registro Operacional</h1>
        <div className="sm:ml-auto space-x-2 pt-4 sm:pt-0 items-center flex">
          <Button disabled><UserRoundPen size={14} /> Editar</Button>
          <TooltipButton disabled text="Baixar" tooltipText="Arquivo PDF" icon={<Download size={14} />} />
        </div>
      </div>
      <div className="bg-[#171717] border border-zinc-800 px-2 py-8 md:p-8 shadow-2xl relative">

        <div className="flex flex-col md:flex-row items-center md:items-start justify-between border-b-2 border-zinc-700 pb-6 mb-8 gap-6">
          <div className="flex items-center gap-4 text-zinc-100">
            <Image src="/logoTP.png" alt="Logo PF" width={800} height={800} className="w-12 h-12" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-widest uppercase">Polícia Federal</h1>
              <h2 className="text-xs text-zinc-400 tracking-widest uppercase">Departamento de Gestão Administrativa</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-500 uppercase">Matrícula</p>
            <p className="text-xl font-mono text-zinc-300">{member.registration ?? 'N/A'}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mb-10">
          <div className="w-32 h-40 shrink-0 border-2 border-zinc-700 p-1 relative mx-auto md:mx-0">
            <Image
              src={member?.photoUrl || "https://cdn.discordapp.com/embed/avatars/0.png"} 
              alt="Foto Oficial" 
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <div className="flex-1 space-y-4 flex flex-col justify-end">
            <FormField label="Nome do Agente" value={member.gameName ?? 'N/A'} className="w-full" />
            <div className="flex flex-col sm:flex-row gap-4">
              <FormField label="Cargo/Patente" value={member.rank ?? 'N/A'} className="flex-1" />
              <FormField label="ID Interno" value={member.internalId ?? 'N/A'} className="w-full sm:w-1/3" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <FormField label="Unidade" value={member.unit ?? 'N/A'} className="w-full sm:w-2/3" />
              <FormField label="Departamento" value={member.department ?? 'N/A'} className="w-full sm:w-1/1" />
            </div>
          </div>
        </div>

        <div className="mb-8 space-y-4 border border-zinc-800 px-2 py-8">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-8">1. Identidade Civil (In-Game)</h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <FormField label="Passaporte (ID)" value={member.gameId ?? 'N/A'} className="w-full sm:w-1/3" />
            <FormField label="Telefone" value={member.phone ?? 'N/A'} className="w-full sm:w-1/3" />
            <FormField label="Estado Civil" value={member.maritalStatus ?? 'N/A'} className="w-full sm:w-1/3" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <FormField label="Gênero" value={member.gender ?? 'N/A'} className="w-full sm:w-1/3" />
            <FormField label="Tipo Sanguíneo" value={member.bloodType ?? 'N/A'} className="w-full sm:w-1/3" />
            <FormField label="Nível/Level" value={member.level != null ? String(member.level) : 'N/A'} className="w-full sm:w-1/3" />
          </div>
        </div>

        <div className="mb-8 space-y-4 border border-zinc-800 px-2 py-8">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-8">2. Dados Institucionais</h3>
          
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <FormField label="Data de Admissão" value={fmtDate(member.admissionDate)} className="w-full sm:w-1/3" />
            <FormField label="Nível de Acesso" value={member.accessLevel != null ? `Nível ${member.accessLevel}` : 'N/A'} className="w-full sm:w-1/3" />
            
            <div className="w-full sm:w-1/3 flex items-end gap-3 pb-1 border-b border-zinc-700/0">
              <span className="text-xs text-zinc-400 uppercase tracking-wider">Porte de Arma:</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1 text-sm text-zinc-300">
                  <div className={`w-4 h-4 border border-zinc-500 flex items-center justify-center ${member.weaponPermit ? 'bg-zinc-700' : ''}`}>
                    {member.weaponPermit === true && <span className="text-[10px]">X</span>}
                  </div>
                  Sim
                </label>
                <label className="flex items-center gap-1 text-sm text-zinc-300">
                  <div className={`w-4 h-4 border border-zinc-500 flex items-center justify-center ${!member.weaponPermit ? 'bg-zinc-700' : ''}`}>
                    {member.weaponPermit !== true && <span className="text-[10px]">X</span>}
                  </div>
                  Não
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <FormField label="Status Operacional" value={STATUS_LABELS[member.status] ?? member.status} className="w-full sm:w-1/2" />
            <FormField label="ID do Supervisor" value={member.supervisorId ?? 'N/A'} className="w-full sm:w-1/2" />
          </div>
        </div>

        <div className="mb-10 space-y-4 border border-zinc-800 px-2 py-8">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-8">3. Qualificações e Observações Internas</h3>
          
          <FormField label="Especializações" value={fmtJson(member.specializations)} className="w-full" />
          <FormField label="Condecorações" value={fmtJson(member.awards)} className="w-full" />
          <FormField label="Anotações" value={member.internalNotes ?? 'N/A'} className="w-full" />
        </div>

        <div className="mb-12 space-y-4 opacity-70 border border-zinc-800 px-2 py-8 relative">
          <div className="absolute top-0 right-0 bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-1 uppercase border-b border-l border-red-500/20 rounded-bl-lg">
            Dados sensíveis - OOC
          </div>
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-8">4. Dados Pessoais (Discord)</h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <FormField label="Discord Tag" value={member.userTag ?? 'N/A'} className="w-full sm:w-1/2" />
            <FormField label="Discord ID" value={member.userId} className="w-full sm:w-1/2" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <FormField label="Nome Real" value={member.realName ?? 'N/A'} className="w-full sm:w-1/2" />
            <FormField label="Nascimento" value={fmtDate(member.birthDate)} className="w-full sm:w-1/4" />
            <FormField label="Telefone" value={member.realPhone ?? 'N/A'} className="w-full sm:w-1/3" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <FormField label="Email" value={member.email ?? 'N/A'} className="w-full" />
          </div>
        </div>

        {/* Área de Assinatura */}
        <div className="pt-8 flex flex-row items-end justify-around gap-8">

          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="h-16 flex items-end justify-center!">
              {member.signature ? (
                
                <Image
                  src={member.signature}
                  alt="Assinatura do Membro"
                  width={300}
                  height={120}
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-zinc-600 italic">Sem assinatura</span>
              )}
            </div>
            <div className="w-full border-b border-zinc-600" />
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Assinatura do Membro</p>
          </div>

          {/* Assinatura do Diretor */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="h-16 flex items-end justify-center">
              <span className="text-xs italic"></span>
            </div>
            <div className="w-full border-b border-zinc-600" />
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Assinatura do Diretor</p>
          </div>

        </div>

      </div>
    </div>
  );
}

function FormField({ label, value, className = "" }: { label: string, value: string, className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs text-zinc-400 uppercase tracking-wider shrink-0">{label}:</span>
      <div className="text-sm font-medium text-zinc-300 border-b border-zinc-700 pb-0.5 w-full truncate flex-1 min-w-12.5 text-start">
        {value}
      </div>
    </div>
  );
}

