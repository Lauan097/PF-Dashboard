'use client';

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RefreshCw, Copy, ChevronDown, CheckCircle } from "lucide-react";
import { useMemo, useState } from "react";

const variants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

interface ErrorPageProps {
  error?: string;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

export default function ErrorPage({
  error,
  title = "Ocorreu um erro",
  description = "Não foi possível carregar esta página do dashboard. Tente novamente em instantes.",
  showDetails = true,
}: ErrorPageProps) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const safeError = useMemo(() => (error ?? "").trim(), [error]);

  async function handleCopy() {
    if (!safeError) return;
    try {
      await navigator.clipboard.writeText(safeError);
      setHover(true);
      setTimeout(() => setHover(false), 2500);
    } catch {
      
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="error"
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="container mx-auto min-h-screen px-4 max-w-7xl"
      >
        <section className="w-full min-h-screen p-6 flex items-center justify-center">
          <div className="w-full max-w-xl">
            
            <div className="relative overflow-hidden rounded-2xl border border-[#333] bg-[#1a1a1a] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              
              <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />

              <div className="p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 shrink-0 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>

                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      {title}
                    </h1>
                    <p className="mt-1 text-sm sm:text-[15px] text-gray-400 leading-relaxed">
                      {description}
                    </p>

                    <div className="mt-5 flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-[#333] px-4 py-2 text-sm font-semibold text-white transition"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Tentar novamente
                      </button>

                      {safeError && (
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-transparent hover:bg-white/5 border border-[#333] px-4 py-2 text-sm font-semibold text-gray-200 transition"
                        >
                          {hover ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          {hover ? "Copiado!" : "Copiar erro"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detalhes */}
                {showDetails && safeError && (
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setOpen((v) => !v)}
                      className="w-full flex items-center justify-between rounded-xl border border-[#333] bg-black/20 hover:bg-black/30 px-4 py-3 transition"
                    >
                      <span className="text-sm font-semibold text-gray-200">
                        Detalhes do erro
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <pre className="mt-3 rounded-xl border border-[#333] bg-black/30 p-4 text-[12px] text-gray-300 whitespace-pre-wrap wrap-break-words">
                            {safeError}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Rodapé discreto */}
                <div className="mt-6 pt-4 border-t border-[#242424] text-xs text-gray-500">
                  Se o problema continuar, tente limpar o cache ou entre em contato com o suporte via Discord.
                </div>
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </AnimatePresence>
  );
}