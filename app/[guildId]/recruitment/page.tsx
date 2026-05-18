"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Skeleton } from "@heroui/react";
import {
  RefreshCw,
  ClipboardList,
  History,
  AlertTriangle,
} from "lucide-react";

import { variants } from "@/types/animate";
import { Recruitment, RecruitmentResponse } from "@/types/recruitment";
import { TooltipButton } from "@/app/components/TooltipButton";

import RecruitmentStatusBadge from "./components/RecruitmentStatusBadge";
import CurrentRecruitmentCard from "./components/CurrentRecruitmentCard";
import CreateRecruitmentForm from "./components/CreateRecruitmentForm";
import RecruitmentTable from "./components/RecruitmentTable";
import RecruitmentDetailModal from "./components/RecruitmentDetailModal";

export default function RecruitmentPage() {
  const params = useParams();
  const guildId = params.guildId as string;

  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedRecruitment, setSelectedRecruitment] =
    useState<Recruitment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const currentRecruitment = recruitments[0] ?? null;

  const hasActiveRecruitment = recruitments.some(
    (r) =>
      r.status === "Upcoming" || r.status === "Open" || r.status === "InProgress"
  );

  const historyRecruitments = recruitments.slice(1);
  
  const fetchRecruitments = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/recruitment?guildId=${guildId}`);
        const data: RecruitmentResponse = await res.json();

        if (!data.success) {
          setError(data.error || "Erro ao carregar recrutamentos.");
          return;
        }

        setRecruitments(data.data.recruitments);
      } catch {
        setError("Erro de conexão. Verifique se o bot está online.");
      } finally {
        setTimeout(() => {
          setLoading(false);
          setRefreshing(false);
        }, 600);
      }
    },
    [guildId]
  );

  useEffect(() => {
    if (!guildId) return;
    startTransition(() => {
      fetchRecruitments();
    });
  }, [guildId, fetchRecruitments]);

  const handleStatusUpdated = (updated: Recruitment) => {
    setRecruitments((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  };

  const handleCreated = () => {
    fetchRecruitments(true);
  };

  const handleRowClick = (r: Recruitment) => {
    setSelectedRecruitment(r);
    setModalOpen(true);
  };

  return (
    <motion.div
      className="p-6 min-h-screen"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={variants.transition}
    >
      <div className="max-w-7xl mx-auto pt-10">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20">
              <ClipboardList size={22} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Recrutamento
              </h1>
              <p className="text-sm text-white/40 mt-0.5">
                Gerencie as edições do processo seletivo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!loading && !hasActiveRecruitment && (
              <CreateRecruitmentForm
                guildId={guildId}
                onCreated={handleCreated}
              />
            )}

            <TooltipButton
              IconOnly
              icon={
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin text-blue-400" : ""}
                />
              }
              tooltipText="Atualizar"
              onPress={() => fetchRecruitments(true)}
              disabled={refreshing}
              buttonClassName="bg-[#18181B] hover:bg-neutral-800/60 border border-[#3d3d3d] cursor-pointer text-white/50 hover:text-white"
            />
          </div>
        </div>

        {error && !loading && (
          <div className="mb-6 px-5 py-4 rounded-xl bg-red-500/8 border border-red-500/20 flex items-center gap-3 text-red-400">
            <AlertTriangle size={18} className="shrink-0" />
            <div>
              <p className="text-sm font-semibold">Erro ao carregar dados</p>
              <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => fetchRecruitments()}
              className="ml-auto text-xs text-red-400 border border-red-500/30 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && recruitments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              {
                label: "Total de Edições",
                value: recruitments.length,
                color: "text-white/80",
              },
              {
                label: "Em Andamento",
                value: recruitments.filter(
                  (r) => r.status === "Open" || r.status === "Upcoming" || r.status === "InProgress"
                ).length,
                color: "text-emerald-400",
              },
              {
                label: "Encerrados",
                value: recruitments.filter((r) => r.status === "Closed").length,
                color: "text-white/50",
              },
              {
                label: "Total de Participantes",
                value: recruitments.reduce(
                  (acc, r) => acc + r.participants.length,
                  0
                ),
                color: "text-blue-400",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#1c1c1f] border border-white/8 rounded-xl p-4"
              >
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        )}

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
              Edição Atual
            </h2>
            {!loading && currentRecruitment && (
              <RecruitmentStatusBadge
                status={currentRecruitment.status}
                size="sm"
              />
            )}
            {loading && <Skeleton className="w-20 h-5 rounded-full" />}
          </div>

          <CurrentRecruitmentCard
            recruitment={currentRecruitment}
            loading={loading}
            guildId={guildId}
            onStatusUpdated={handleStatusUpdated}
          />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/20 to-white/5" />
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
              Histórico de Edições
            </h2>
            {!loading && (
              <span className="text-[10px] text-white/30 font-medium bg-white/6 px-2 py-0.5 rounded-full border border-white/8">
                {historyRecruitments.length}{" "}
                {historyRecruitments.length === 1 ? "edição" : "edições"}
              </span>
            )}
            {loading && <Skeleton className="w-14 h-5 rounded-full" />}

            <div className="ml-auto">
              <History size={14} className="text-white/20" />
            </div>
          </div>

          <RecruitmentTable
            recruitments={historyRecruitments}
            loading={loading}
            onRowClick={handleRowClick}
          />
        </section>
      </div>

      <RecruitmentDetailModal
        recruitment={selectedRecruitment}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedRecruitment(null);
        }}
      />
    </motion.div>
  );
}