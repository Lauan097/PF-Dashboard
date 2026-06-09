"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import LoadingScreen from "@/app/components/LoadingScreen";
import ErrorPage from "@/app/components/ErrorPage";
import { 
  Download, 
  Printer, 
  ExternalLink, 
  ShieldCheck, 
  X, 
  LogIn
} from "lucide-react";

function TranscriptViewer() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { status } = useSession();

  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string>("Ocorreu um erro");
  const [errorDesc, setErrorDesc] = useState<string>("Não foi possível carregar a página.");

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      setTimeout(() => {
        setError("unauthenticated");
        setErrorTitle("Acesso Negado");
        setErrorDesc("Você precisa estar autenticado para visualizar este transcript de denúncia.");
        setLoading(false);
      }, 0);
      return;
    }

    if (!id) {
      setTimeout(() => {
        setError("missing_id");
        setErrorTitle("Parâmetro Ausente");
        setErrorDesc("O ID da denúncia não foi fornecido na URL da página.");
        setLoading(false);
      }, 0);
      return;
    }

    setTimeout(() => {
      setLoading(true);
      setError(null);
    }, 0);

    fetch(`/api/data/guild/transcripts?id=${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Erro ao carregar transcript.");
        }
        setHtml(data.html);
      })
      .catch((err: Error) => {
        const msg = err.message || "";
        setError(msg);
        
        if (msg.includes("permissão") || msg.includes("autorizado")) {
          setErrorTitle("Acesso Não Autorizado");
          setErrorDesc("Sua conta do Discord não tem permissão para visualizar o transcript desta denúncia.");
        } else if (msg.includes("encontrada") || msg.includes("não existe")) {
          setErrorTitle("Denúncia Não Encontrada");
          setErrorDesc("A denúncia correspondente ao ID informado não existe no banco de dados.");
        } else {
          setErrorTitle("Falha na Requisição");
          setErrorDesc(msg || "Não foi possível buscar as informações do servidor.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, status]);

  useEffect(() => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  const handleDownload = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.focus();
      iframeRef.current.contentWindow?.print();
    }
  };

  const handleOpenNewTab = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  if (status === "loading" || loading) {
    return <LoadingScreen isLoading={true} />;
  }
  if (error === "unauthenticated") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] px-4">
        <div className="relative overflow-hidden rounded-2xl border border-[#27272a] bg-[#121214] p-8 max-w-md w-full shadow-2xl text-center">
          <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="mx-auto h-12 w-12 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center mb-6">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mb-2">
            Autenticação Necessária
          </h1>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            {errorDesc}
          </p>
          <button
            onClick={() => signIn("discord")}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black hover:bg-neutral-200 py-3 text-sm font-semibold transition cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            Entrar com Discord
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorPage
        title={errorTitle}
        description={errorDesc}
        error={error}
        showDetails={error !== "missing_id"}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#09090b]">
      <header className="h-14 shrink-0 flex items-center justify-between px-4 sm:px-6 bg-[#0f0f11] border-b border-[#242427] z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-semibold text-white tracking-tight leading-none mb-1">
              Visualizador de Transcripts
            </h1>
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium">
              Polícia Federal — Corregedoria
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            title="Baixar arquivo HTML"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-[#27272a]/80 hover:bg-[#27272a] text-xs font-semibold text-gray-200 transition border border-[#3f3f46]/50 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Baixar HTML</span>
          </button>
          
          <button
            onClick={handlePrint}
            title="Imprimir transcript"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-[#27272a]/80 hover:bg-[#27272a] text-xs font-semibold text-gray-200 transition border border-[#3f3f46]/50 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Imprimir</span>
          </button>

          <button
            onClick={handleOpenNewTab}
            title="Abrir em nova guia do navegador"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-[#27272a]/80 hover:bg-[#27272a] text-xs font-semibold text-gray-200 transition border border-[#3f3f46]/50 cursor-pointer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Abrir em Nova Guia</span>
          </button>

          <div className="h-5 w-px bg-[#242427] mx-1 hidden sm:block" />

          <button
            onClick={() => window.close()}
            title="Fechar página"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-xs font-semibold text-red-400 transition border border-red-900/30 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Fechar</span>
          </button>
        </div>
      </header>

      <main className="grow w-full relative bg-[#121214]">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-none bg-white"
          title="Conteúdo do Transcript"
          sandbox="allow-popups allow-scripts allow-same-origin allow-modals"
        />
      </main>
    </div>
  );
}

export default function ViewTranscriptsPage() {
  return (
    <Suspense fallback={<LoadingScreen isLoading={true} />}>
      <TranscriptViewer />
    </Suspense>
  );
}
