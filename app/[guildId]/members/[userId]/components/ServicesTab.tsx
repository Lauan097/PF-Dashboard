"use client";

import { useEffect, useState } from "react";
import { Target, Save, CircleAlert, Settings } from "lucide-react";
import { Button, Skeleton, Spinner, NumberField, Label, Description } from "@heroui/react";
import { toast } from "sonner";
import WeeklyHistory, { type WeekHistoryItem } from "./WeeklyHistory";
import SessionsTable from "./SessionsTable";

interface ServicesTabProps {
  userId: string;
  guildId: string;
}

interface ServicesData {
  weeklyGoal: number;         // segundos
  weeklyGoalDiscount: number; // percentual 0-100
  weeklyHistory: WeekHistoryItem[];
}

function secondsToHours(seconds: number) {
  return Math.round((seconds / 3600) * 10) / 10;
}

function hoursToSeconds(hours: number) {
  return Math.round(hours * 3600);
}

export default function ServicesTab({ userId, guildId }: ServicesTabProps) {
  const [data, setData] = useState<ServicesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NumberField usa valores numéricos diretos
  const [goalHours, setGoalHours] = useState<number>(0);
  // Desconto em escala 0-1 para o NumberField com format percent (0.5 = 50%)
  const [discountFraction, setDiscountFraction] = useState<number>(0);

  useEffect(() => {
    if (!guildId || !userId) return;
    let cancelled = false;

    async function fetchServices() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/data/user/services?guildId=${guildId}&userId=${userId}`,
        );
        const json = await res.json();
        if (cancelled) return;

        if (json.success) {
          setData(json.data);
          setGoalHours(secondsToHours(json.data.weeklyGoal ?? 0));
          setDiscountFraction((json.data.weeklyGoalDiscount ?? 0) / 100);
        } else {
          setError(json.error ?? "Erro ao carregar configurações.");
        }
      } catch {
        if (!cancelled) setError("Erro ao carregar configurações.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchServices();
    return () => { cancelled = true; };
  }, [guildId, userId]);

  async function handleSave() {
    const discountPercent = Math.round(discountFraction * 100);

    if (goalHours < 0) {
      toast.error("Meta semanal inválida.");
      return;
    }
    if (discountPercent < 0 || discountPercent > 100) {
      toast.error("Desconto inválido. Deve ser entre 0% e 100%.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/data/user/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId,
          userId,
          weeklyGoal: hoursToSeconds(goalHours),
          weeklyGoalDiscount: discountPercent,
        }),
      });
      const json = await res.json();

      if (json.success) {
        // Atualiza apenas os campos de configuração; mantém histórico atual
        setData((prev) =>
          prev
            ? { ...prev, weeklyGoal: json.data.weeklyGoal, weeklyGoalDiscount: json.data.weeklyGoalDiscount }
            : prev,
        );
        toast.success("Configurações salvas com sucesso!");
      } else {
        toast.error(json.error ?? "Erro ao salvar configurações.");
      }
    } catch {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  }

  const effectiveGoalHours = data
    ? Math.max(0, secondsToHours(data.weeklyGoal ?? 0) * (1 - (data.weeklyGoalDiscount ?? 0) / 100))
    : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 space-y-4">
          <Skeleton className="h-4 w-40 bg-zinc-800" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full rounded-xl bg-zinc-800" />
            <Skeleton className="h-24 w-full rounded-xl bg-zinc-800" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl bg-zinc-800 ml-auto" />
        </div>
        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 space-y-3">
          <Skeleton className="h-4 w-48 bg-zinc-800" />
          <div className="grid grid-cols-5 gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl bg-zinc-800" />
            ))}
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 space-y-4">
          <Skeleton className="h-4 w-36 bg-zinc-800" />
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-3 pb-2 border-b border-white/5">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-3 w-3/4 bg-zinc-800" />
              ))}
            </div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="grid grid-cols-4 gap-3 py-2">
                {[0, 1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-3 bg-zinc-800 rounded" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
        <CircleAlert size={32} className="text-red-400" />
        <p className="text-zinc-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card de Configuração */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Settings size={15} className="text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-200">
            Configuração da Meta Semanal
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meta semanal em horas */}
          <NumberField
            value={goalHours}
            onChange={(v) => setGoalHours(v ?? 0)}
            minValue={0}
            step={0.5}
            fullWidth
          >
            <Label>Meta Semanal (horas)</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input />
              <NumberField.IncrementButton />
            </NumberField.Group>
            <Description>Horas semanais que o membro precisa cumprir.</Description>
          </NumberField>

          {/* Desconto em percentagem */}
          <NumberField
            value={discountFraction}
            onChange={(v) => setDiscountFraction(v ?? 0)}
            minValue={0}
            maxValue={1}
            step={0.01}
            formatOptions={{ style: "percent", maximumFractionDigits: 0 }}
            fullWidth
          >
            <Label>Desconto</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input />
              <NumberField.IncrementButton />
            </NumberField.Group>
            <Description>Percentual de desconto aplicado sobre a meta (ex.: abonos).</Description>
          </NumberField>
        </div>

        {/* Resumo da meta efetiva */}
        {data && (
          <div className="flex items-center gap-2 bg-[#222] border border-white/5 rounded-xl px-4 py-3">
            <Target size={13} className="text-emerald-400 shrink-0" />
            <p className="text-xs text-zinc-400">
              Meta efetiva:{" "}
              <span className="text-emerald-400 font-semibold">
                {Math.round(effectiveGoalHours * 10) / 10}h
              </span>{" "}
              ({secondsToHours(data.weeklyGoal ?? 0)}h com {data.weeklyGoalDiscount ?? 0}% de desconto)
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            size="sm"
            variant="primary"
            className="gap-2"
            isPending={saving}
          >
            {({ isPending }) => (
              <>
                {isPending ? <Spinner color="current" size="sm" /> : <Save size={14} />}
                {isPending ? "Salvando..." : "Salvar"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Histórico de metas semanais */}
      {data?.weeklyHistory && data.weeklyHistory.length > 0 && (
        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
          <WeeklyHistory weeks={data.weeklyHistory} />
        </div>
      )}

      {/* Histórico de sessões */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
        <SessionsTable userId={userId} guildId={guildId} />
      </div>
    </div>
  );
}
