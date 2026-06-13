"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Skeleton, Button } from "@heroui/react";
import { 
  RefreshCw, 
  FileText, 
  AlertTriangle, 
  Plus, 
  FolderOpen,
  ArrowRight,
  Clock
} from "lucide-react";

import { variants } from "@/types/animate";
import StatsSummary from "./components/StatsSummary";
import InvestigatorsList from "./components/InvestigatorsList";
import CreateInvestigationModal from "./components/CreateInvestigationModal";
import Link from "next/link";

interface Investigation {
  id: string;
  hash: number;
  title: string;
  description: string;
  status: "Open" | "Closed" | "Suspended";
  createdAt: string;
  investigators: string[];
}

interface Investigator {
  userId: string;
  userTag: string;
  gameName: string;
  rank: string;
  photoUrl: string | null;
}

export default function InvestigationsPage() {
  const params = useParams();
  const router = useRouter();
  const guildId = params.guildId as string;

  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [investigators, setInvestigators] = useState<Investigator[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchInvestigations = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/data/guild/investigations?guildId=${guildId}`);
        const data = await res.json();

        if (!data.success) {
          setError(data.error || "Erro ao carregar investigações.");
          return;
        }

        setInvestigations(data.list || []);
        setInvestigators(data.investigators || []);
      } catch {
        setError("Erro de conexão. Verifique se o bot está online.");
      } finally {
        setTimeout(() => {
          setLoading(false);
          setRefreshing(false);
        }, 500);
      }
    },
    [guildId]
  );

  useEffect(() => {
    if (!guildId) return;
    startTransition(() => {
      fetchInvestigations();
    });
  }, [guildId, fetchInvestigations]);

  const getStatusBadge = (status: "Open" | "Closed" | "Suspended") => {
    switch (status) {
      case "Open":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1 font-semibold">
            Em Andamento
          </span>
        );
      case "Suspended":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-2.5 py-1 font-semibold">
            Suspenso
          </span>
        );
      case "Closed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#3f3f46]/50 border border-[#3f3f46]/80 text-gray-400 text-xs px-2.5 py-1 font-semibold">
            Concluído
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <motion.div
      className="p-6 min-h-screen bg-[#09090b]"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={variants.transition}
    >
      <div className="max-w-7xl mx-auto pt-10 space-y-8 min-h-screen">
        
        <div className="flex items-start justify-between border-b border-[#27272a]/40 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-linear-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/20">
              <FolderOpen size={22} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Inquéritos Policiais
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Investigações em andamento e arquivos de inteligência da Polícia Federal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-black transition cursor-pointer"
            >
              <Plus size={16} /> Instaurar Inquérito
            </Button>

            <div title="Atualizar dados">
              <Button
                onClick={() => fetchInvestigations(true)}
                className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#18181b] border border-[#27272a] text-gray-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin text-emerald-400" : ""} />
              </Button>
            </div>
          </div>
        </div>

        {error && !loading && (
          <div className="px-5 py-4 rounded-xl bg-red-500/8 border border-red-500/20 flex items-center gap-3 text-red-400">
            <AlertTriangle size={18} className="shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Falha ao carregar inquéritos</p>
              <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => fetchInvestigations()}
              className="text-xs text-red-400 border border-red-500/30 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl bg-[#121214]/60" />
                ))}
              </div>
            ) : (
              <StatsSummary list={investigations} />
            )}

            <div className="rounded-2xl border border-[#27272a] bg-[#121214] overflow-hidden shadow-lg">
              <div className="px-5 py-4 border-b border-[#27272a] flex items-center gap-2 bg-black/10">
                <FileText size={16} className="text-gray-400" />
                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Listagem de Portarias de Inquérito
                </h2>
              </div>

              {loading ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl bg-[#18181b]/50" />
                  ))}
                </div>
              ) : investigations.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500 bg-[#121214] flex flex-col items-center justify-center gap-2">
                  <FolderOpen size={32} className="text-zinc-600" />
                  <p>Nenhuma investigação instaurada até o momento.</p>
                  <p className="text-xs text-zinc-600">
                    {"Clique em 'Instaurar Inquérito' para registrar o primeiro caso."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#27272a] text-zinc-600 text-xs font-semibold bg-black/5">
                        <th className="py-3.5 px-5 w-16">Nº</th>
                        <th className="py-3.5 px-4">Título do Caso</th>
                        <th className="py-3.5 px-4 w-36">Status</th>
                        <th className="py-3.5 px-4 w-32">Instauração</th>
                        <th className="py-3.5 px-4 w-28 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272a]/30">
                      {investigations.map((caseItem) => (
                        <tr 
                          key={caseItem.id}
                          className="hover:bg-white/2 transition-colors cursor-pointer"
                          onClick={() => router.push(`/[guildId]/investigations/${caseItem.id}`.replace("[guildId]", guildId))}
                        >
                          <td className="py-4 px-5 font-mono text-zinc-400 font-bold">
                            #{caseItem.hash}
                          </td>
                          <td className="py-4 px-4">
                            <div className="min-w-0">
                              <p className="font-bold text-white text-sm truncate leading-snug">
                                {caseItem.title}
                              </p>
                              <p className="text-gray-400 text-[11px] truncate mt-0.5 leading-snug max-w-80">
                                {caseItem.description}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(caseItem.status)}
                          </td>
                          <td className="py-4 px-4 text-gray-400 font-medium">
                            {formatDate(caseItem.createdAt)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Link
                              href={`/[guildId]/investigations/${caseItem.id}`.replace("[guildId]", guildId)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-emerald-200 
                              transition-colors px-4 py-2 bg-emerald-900 rounded-xl"
                            >
                              <ArrowRight size={13} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          <div className="space-y-6">
            {loading ? (
              <Skeleton className="h-[380px] rounded-2xl bg-[#121214]/60" />
            ) : (
              <InvestigatorsList investigators={investigators} />
            )}

            <div className="rounded-2xl border border-zinc-800/60 bg-[#121214] p-4 text-[11px] text-gray-400 leading-relaxed space-y-2.5">
              <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
                <Clock size={13} className="text-emerald-400" />
                <span>DIRETRIZES DA PF</span>
              </div>
              <p>
                De acordo com o Regimento Interno da Polícia Federal, inquéritos policiais (IPL) devem conter sigilo de dados em conformidade com as operações ativas.
              </p>
              <p>
                A alteração do quadro investigativo (Excalidraw) e inclusão de provas devem ser registradas sob auditoria e rastreadas pelo agente designado.
              </p>
            </div>
          </div>

        </div>

      </div>

      <CreateInvestigationModal
        guildId={guildId}
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        investigators={investigators}
        onCreated={() => fetchInvestigations(true)}
      />
    </motion.div>
  );
}