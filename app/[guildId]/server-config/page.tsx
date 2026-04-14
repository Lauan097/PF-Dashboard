'use client';

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Hash, ShieldAlert, Bell, Mic2, Users, RefreshCw,
} from "lucide-react";
import { TextChannelSelect } from "@/app/components/TextChannelSelect";
import { SaveBar } from "@/app/components/SaveBar";
import { Skeleton } from "@/components/skeleton";
import ErrorPage from "@/app/components/ErrorPage";
import type {
  ServerConfigData,
  ServerConfigGetResponse,
  ServerConfigPayload,
} from "@/types/serverConfig";

const empty = (): ServerConfigPayload => ({
  channels: {
    welcome: null,
    goodbye: null,
    announcements: null,
    announcementsPreview: null,
    pointPanel: null,
    pointOpen: null,
    pointClose: null,
    absenceLog: null,
    warningLog: null,
    banLog: null,
  },
  roles: {
    warningRole1: null,
    warningRole2: null,
    warningRole3: null,
  },
});

function configToPayload(data: ServerConfigData): ServerConfigPayload {
  const c = data.config;
  const r = data.roleConfig;
  return {
    channels: {
      welcome: c?.welcomeCh ?? null,
      goodbye: c?.goodbyeCh ?? null,
      announcements: c?.announcementsCh ?? null,
      announcementsPreview: c?.announcementsPreviewCh ?? null,
      pointPanel: c?.pointPanelCh ?? null,
      pointOpen: c?.pointOpenCh ?? null,
      pointClose: c?.pointCloseCh ?? null,
      absenceLog: c?.absenceLogCh ?? null,
      warningLog: c?.WarningLogCh ?? null,
      banLog: c?.BanLogCh ?? null,
    },
    roles: {
      warningRole1: r?.WarningRole1 ?? null,
      warningRole2: r?.WarningRole2 ?? null,
      warningRole3: r?.WarningRole3 ?? null,
    },
  };
}

function payloadsEqual(a: ServerConfigPayload, b: ServerConfigPayload) {
  return JSON.stringify(a) === JSON.stringify(b);
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

function Section({ icon, title, description, children }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-white/5 bg-white/3 p-6"
    >
      <div className="flex items-start gap-3 mb-6">
        <div className="mt-0.5 rounded-lg bg-white/5 p-2 text-zinc-400">{icon}</div>
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </motion.div>
  );
}

function FieldSkeleton() {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-4 w-28 rounded" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

export default function ServerConfigPage() {
  const params = useParams();
  const guildId = params.guildId as string;

  const [serverData, setServerData] = useState<ServerConfigData | null>(null);
  const [form, setForm] = useState<ServerConfigPayload>(empty());
  const [saved, setSaved] = useState<ServerConfigPayload>(empty());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = !payloadsEqual(form, saved);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/data/guild/config?guildId=${guildId}`);
      const json: ServerConfigGetResponse = await res.json();
      if (!json.success || !json.data) throw new Error(json.error ?? "Erro desconhecido");
      setServerData(json.data);
      const payload = configToPayload(json.data);
      setForm(payload);
      setSaved(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    if (guildId) fetchConfig();
  }, [guildId, fetchConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/data/guild/config?guildId=${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Erro ao salvar");
      setSaved(form);
      toast.success("Configurações salvas com sucesso!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => setForm(saved);

  const setChannel = (key: keyof ServerConfigPayload["channels"]) => (value: string) =>
    setForm(prev => ({ ...prev, channels: { ...prev.channels, [key]: value || null } }));

  const setRole = (key: keyof ServerConfigPayload["roles"]) => (value: string) =>
    setForm(prev => ({ ...prev, roles: { ...prev.roles, [key]: value || null } }));

  // ---- render ----
  if (error) return <ErrorPage error={error} />;

  const channels = serverData?.channels ?? [];
  const roles = serverData?.roles ?? [];

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  return (
    <div className="container mx-auto py-12 max-w-5xl px-4">
      <div className="min-h-screen pb-28">

        {/* Header */}
        <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Configurações Gerais</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Configure canais de log, anúncios, avisos e cargos do servidor.
            </p>
          </div>
          <button
            onClick={fetchConfig}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <RefreshCw size={14} />
            Recarregar
          </button>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Canais de Membros */}
          <Section
            icon={<Users size={18} />}
            title="Membros"
            description="Canais para entrada e saída de membros do servidor."
          >
            {loading ? (
              <><FieldSkeleton /><FieldSkeleton /></>
            ) : (
              <>
                <TextChannelSelect
                  label="Boas-vindas"
                  channels={channels}
                  value={form.channels.welcome ?? ""}
                  onChange={setChannel("welcome")}
                  placeholder="Selecione o canal..."
                />
                <TextChannelSelect
                  label="Despedida"
                  channels={channels}
                  value={form.channels.goodbye ?? ""}
                  onChange={setChannel("goodbye")}
                  placeholder="Selecione o canal..."
                />
              </>
            )}
          </Section>

          {/* Canais de Anúncios */}
          <Section
            icon={<Bell size={18} />}
            title="Anúncios"
            description="Canais para publicação de comunicados e pré-visualizações."
          >
            {loading ? (
              <><FieldSkeleton /><FieldSkeleton /></>
            ) : (
              <>
                <TextChannelSelect
                  label="Canal de anúncios"
                  channels={channels}
                  value={form.channels.announcements ?? ""}
                  onChange={setChannel("announcements")}
                  placeholder="Selecione o canal..."
                />
                <TextChannelSelect
                  label="Pré-visualização de anúncios"
                  channels={channels}
                  value={form.channels.announcementsPreview ?? ""}
                  onChange={setChannel("announcementsPreview")}
                  placeholder="Selecione o canal..."
                />
              </>
            )}
          </Section>

          {/* Ponto */}
          <Section
            icon={<Mic2 size={18} />}
            title="Bate Ponto"
            description="Canais utilizados na abertura e fechamento de sessões de ponto."
          >
            {loading ? (
              <><FieldSkeleton /><FieldSkeleton /><FieldSkeleton /></>
            ) : (
              <>
                <TextChannelSelect
                  label="Painel de ponto"
                  channels={channels}
                  value={form.channels.pointPanel ?? ""}
                  onChange={setChannel("pointPanel")}
                  placeholder="Selecione o canal..."
                />
                <TextChannelSelect
                  label="Abertura de ponto"
                  channels={channels}
                  value={form.channels.pointOpen ?? ""}
                  onChange={setChannel("pointOpen")}
                  placeholder="Selecione o canal..."
                />
                <TextChannelSelect
                  label="Fechamento de ponto"
                  channels={channels}
                  value={form.channels.pointClose ?? ""}
                  onChange={setChannel("pointClose")}
                  placeholder="Selecione o canal..."
                />
              </>
            )}
          </Section>

          {/* Logs */}
          <Section
            icon={<Hash size={18} />}
            title="Logs"
            description="Canais de registro para ausências, advertências e banimentos."
          >
            {loading ? (
              <><FieldSkeleton /><FieldSkeleton /><FieldSkeleton /></>
            ) : (
              <>
                <TextChannelSelect
                  label="Log de ausências"
                  channels={channels}
                  value={form.channels.absenceLog ?? ""}
                  onChange={setChannel("absenceLog")}
                  placeholder="Selecione o canal..."
                />
                <TextChannelSelect
                  label="Log de advertências"
                  channels={channels}
                  value={form.channels.warningLog ?? ""}
                  onChange={setChannel("warningLog")}
                  placeholder="Selecione o canal..."
                />
                <TextChannelSelect
                  label="Log de banimentos"
                  channels={channels}
                  value={form.channels.banLog ?? ""}
                  onChange={setChannel("banLog")}
                  placeholder="Selecione o canal..."
                />
              </>
            )}
          </Section>

          {/* Cargos de Advertência */}
          <Section
            icon={<ShieldAlert size={18} />}
            title="Cargos de Advertência"
            description="Cargos atribuídos progressivamente conforme as advertências acumuladas."
          >
            {loading ? (
              <><FieldSkeleton /><FieldSkeleton /><FieldSkeleton /></>
            ) : (
              <>
                <TextChannelSelect
                  label="1ª Advertência"
                  channels={roles}
                  value={form.roles.warningRole1 ?? ""}
                  onChange={setRole("warningRole1")}
                  placeholder="Selecione o cargo..."
                  type="roles"
                />
                <TextChannelSelect
                  label="2ª Advertência"
                  channels={roles}
                  value={form.roles.warningRole2 ?? ""}
                  onChange={setRole("warningRole2")}
                  placeholder="Selecione o cargo..."
                  type="roles"
                />
                <TextChannelSelect
                  label="3ª Advertência"
                  channels={roles}
                  value={form.roles.warningRole3 ?? ""}
                  onChange={setRole("warningRole3")}
                  placeholder="Selecione o cargo..."
                  type="roles"
                />
              </>
            )}
          </Section>
        </motion.div>
      </div>

      <SaveBar
        isVisible={isDirty}
        isSaving={saving}
        onSave={handleSave}
        onReset={handleReset}
      />
    </div>
  );
}
