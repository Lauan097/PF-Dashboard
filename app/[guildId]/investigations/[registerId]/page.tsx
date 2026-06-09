"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { motion } from "framer-motion";
import { Button, Modal } from "@heroui/react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { ShieldCheck, X } from "lucide-react";

import { variants } from "@/types/animate";
import LoadingScreen from "@/app/components/LoadingScreen";
import ErrorPage from "@/app/components/ErrorPage";

import DetailsHeader from "./components/DetailsHeader";
import Timeline from "./components/Timeline";
import AuditLogs from "./components/AuditLogs";
import Suspects from "./components/Suspects";
import Evidence from "./components/Evidence";
import Notes from "./components/Notes";

// Carrega o Excalidraw dinamicamente no cliente para evitar erros de SSR (Server-Side Rendering)
const ExcalidrawComponent = dynamic(
  () => import("../components/Excalidraw"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#09090b] text-sm text-gray-400 font-medium">
        Carregando Quadro de Evidências Colaborativo...
      </div>
    )
  }
);

interface InvestigationDetails {
  id: string;
  hash: number;
  guildId: string;
  title: string;
  description: string;
  status: "Open" | "Closed" | "Suspended";
  suspects: any[] | null;
  evidence: any[] | null;
  notes: string | null;
  canvasData: string | null;
  investigators: string[];
  createdAt: string;
  closedAt: string | null;
  timeline: any[];
  auditLogs: any[];
}

// Helper para mesclar arquivos binários (imagens) do canvas e não perder histórico
const mergeCanvasFiles = (currentCanvas: string | null, incomingCanvas: string | null): string | null => {
  if (!incomingCanvas) return currentCanvas;
  if (!currentCanvas) return incomingCanvas;
  try {
    const parsedCurrent = JSON.parse(currentCanvas);
    const parsedIncoming = JSON.parse(incomingCanvas);
    const mergedFiles = {
      ...(parsedCurrent.files || {}),
      ...(parsedIncoming.files || {})
    };
    return JSON.stringify({
      elements: parsedIncoming.elements || [],
      appState: parsedIncoming.appState || {},
      files: mergedFiles
    });
  } catch (err) {
    console.error("Erro ao mesclar canvas files:", err);
    return incomingCanvas;
  }
};

export default function InvestigationDetailsPage() {
  const params = useParams();
  const registerId = params.registerId as string;
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [investigation, setInvestigation] = useState<InvestigationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [canvasOpen, setCanvasOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !userId) {
      setTimeout(() => {
        setError("Não autenticado. Por favor, faça login.");
        setLoading(false);
      }, 0);
      return;
    }

    if (!registerId) {
      return;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? "http://localhost:5500"
        : "https://ap-ipflegacy.discloud.app");

    const socket = io(socketUrl, {
      transports: ["polling", "websocket"],
      auth: { userId }
    });

    setTimeout(() => {
      setSocketInstance(socket);
    }, 0);

    // Trata erro de conexão para evitar loading infinito
    socket.on("connect_error", (err) => {
      console.error("Erro de conexão do socket:", err);
      setError("Não foi possível conectar ao servidor de tempo real (WebSocket). Verifique se o bot está online.");
      setLoading(false);
    });

    // Entra na sala da investigação e garante re-adesão em reconexões
    const joinRoom = () => {
      socket.emit("investigation:join", { id: registerId });
    };

    if (socket.connected) {
      joinRoom();
    }
    socket.on("connect", joinRoom);

    // Busca detalhes do inquérito
    socket.emit("investigation:get", { id: registerId, authorId: userId }, (res: any) => {
      if (!res.success) {
        setError(res.error || "Erro ao carregar detalhes do inquérito.");
        setLoading(false);
      } else {
        setInvestigation(res.data);
        setLoading(false);
      }
    });

    // Escuta atualizações no inquérito
    socket.on("investigation:updated", (updatedCase: InvestigationDetails) => {
      setInvestigation(updatedCase);
    });

    // Escuta atualizações de canvas em tempo real (mesmo com modal fechada)
    socket.on("investigation:canvasUpdated", ({ canvasData }: { canvasData: string }) => {
      setInvestigation((prev) => {
        if (!prev) return prev;
        return { ...prev, canvasData: mergeCanvasFiles(prev.canvasData, canvasData) };
      });
    });

    // Escuta auditorias novas adicionadas pelo quadro ou outras ações
    socket.on("investigation:auditLogAdded", (auditLog: any) => {
      setInvestigation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          auditLogs: [auditLog, ...(prev.auditLogs || [])]
        };
      });
    });

    // Escuta novos eventos de timeline/audit adicionados
    socket.on("investigation:timelineAdded", ({ timelineItem, auditLog }: any) => {
      setInvestigation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          timeline: [timelineItem, ...(prev.timeline || [])],
          auditLogs: [auditLog, ...(prev.auditLogs || [])]
        };
      });
    });

    return () => {
      socket.emit("investigation:leave", { id: registerId });
      socket.disconnect();
    };
  }, [registerId, userId, status]);

  // Callbacks de Atualização emitidos via WS
  const handleUpdateStatus = (newStatus: "Open" | "Closed" | "Suspended") => {
    if (!socketInstance || !investigation) return;
    socketInstance.emit(
      "investigation:update",
      { id: registerId, status: newStatus },
      (res: any) => {
        if (!res.success) {
          toast.error(res.error || "Erro ao atualizar status.");
        } else {
          toast.success(`Inquérito marcado como ${newStatus === "Open" ? "Ativo" : newStatus === "Suspended" ? "Suspenso" : "Concluído"}`);
        }
      }
    );
  };

  const handleUpdateSuspects = (updatedList: any[]) => {
    if (!socketInstance || !investigation) return;
    socketInstance.emit(
      "investigation:update",
      { id: registerId, suspects: updatedList },
      (res: any) => {
        if (!res.success) toast.error(res.error || "Erro ao atualizar suspeitos.");
      }
    );
  };

  const handleUpdateEvidence = (updatedList: any[]) => {
    if (!socketInstance || !investigation) return;
    socketInstance.emit(
      "investigation:update",
      { id: registerId, evidence: updatedList },
      (res: any) => {
        if (!res.success) toast.error(res.error || "Erro ao atualizar provas.");
      }
    );
  };

  const handleSaveNotes = (newNotes: string) => {
    if (!socketInstance || !investigation) return;
    socketInstance.emit(
      "investigation:update",
      { id: registerId, notes: newNotes },
      (res: any) => {
        if (!res.success) {
          toast.error(res.error || "Erro ao salvar anotações.");
        } else {
          toast.success("Diário de inquérito atualizado com sucesso!");
        }
      }
    );
  };

  if (status === "loading" || loading) {
    return <LoadingScreen isLoading={true} />;
  }

  if (error) {
    return (
      <ErrorPage
        title="Acesso Negado ou Falha"
        description={error}
        error={error}
        showDetails={true}
      />
    );
  }

  if (!investigation) {
    return (
      <ErrorPage
        title="Não Encontrado"
        description="A investigação solicitada não pôde ser localizada."
        showDetails={false}
      />
    );
  }

  return (
    <motion.div
      className="p-6 min-h-screen bg-[#09090b] text-white"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={variants.transition}
    >
      <div className="max-w-7xl mx-auto pt-10 space-y-8">
        
        {/* Header */}
        <DetailsHeader
          title={investigation.title}
          hash={investigation.hash}
          status={investigation.status}
          createdAt={investigation.createdAt}
          closedAt={investigation.closedAt}
          onUpdateStatus={handleUpdateStatus}
          onOpenCanvas={() => {
            setCanvasOpen(true);
            if (socketInstance) {
              socketInstance.emit("investigation:logBoardAccess", { id: registerId });
            }
          }}
        />

        {/* Descrição Inicial */}
        <div className="rounded-2xl border border-[#27272a]/60 bg-[#121214] p-5 shadow-lg space-y-2.5">
          <div className="flex items-center gap-2 text-zinc-400 border-b border-[#27272a] pb-2">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider">Descrição dos Fatos Investigados</h2>
          </div>
          <p className="text-sm text-zinc-300 whitespace-pre-wrap">
            {investigation.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <Suspects
            suspects={investigation.suspects || []}
            onUpdateSuspects={handleUpdateSuspects}
          />

          <Evidence
            evidence={investigation.evidence || []}
            onUpdateEvidence={handleUpdateEvidence}
          />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2">
            <Timeline
              investigationId={registerId}
              timeline={investigation.timeline || []}
              socket={socketInstance}
            />
          </div>

          <div className="lg:col-span-1">
            <AuditLogs logs={investigation.auditLogs || []} />
          </div>

        </div>

        <Notes
          initialNotes={investigation.notes}
          onSaveNotes={handleSaveNotes}
        />

      </div>

      <Modal>
        <Modal.Backdrop 
          variant="blur" 
          isOpen={canvasOpen} 
          onOpenChange={(open) => !open && setCanvasOpen(false)}
        >
          <Modal.Container size="full">
            <Modal.Dialog className="h-screen w-screen flex flex-col bg-[#09090b] border-none p-0 overflow-hidden rounded-none m-0 max-w-none max-h-none">
              <div className="absolute top-14 right-3 z-50">
                <Button 
                  slot="close"
                  className="px-2 rounded-md bg-zinc-800 text-xs"
                >
                  <X className="ml-0.5" /> Fechar QD
                </Button>
              </div>
              <Modal.Body className="p-0 flex-1 overflow-hidden relative">
                {userId && (
                  <ExcalidrawComponent
                    investigationId={registerId}
                    userId={userId}
                    initialCanvasData={investigation.canvasData}
                    onCanvasChange={(newCanvasData) => {
                      setInvestigation((prev) => {
                        if (!prev) return prev;
                        return { ...prev, canvasData: mergeCanvasFiles(prev.canvasData, newCanvasData) };
                      });
                    }}
                  />
                )}
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

    </motion.div>
  );
}
