"use client";

import { useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";

export default function AccessDenied() {
  const router = useRouter();

  return (
    <main className="min-h-screen text-white">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.12),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.12),transparent_35%)]" />

        <div className="relative z-10 w-full max-w-lg">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
           
            <div className="relative px-8 pt-10 pb-8 text-center">
              <div className="absolute inset-x-0 bottom-0 h-20" />

              <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                <ShieldX className="h-10 w-10 text-red-400" />
              </div>

              <h1 className="relative text-3xl font-bold tracking-tight text-white">
                Acesso Negado
              </h1>

              <p className="relative mt-3 text-sm leading-6 text-zinc-400">
                Sua conta foi autenticada, mas você não possui permissão para acessar esta área do sistema.
              </p>
            </div>

            <div className="px-8 pb-8">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
                <p className="text-sm leading-6 text-zinc-400 text-center">
                  É necessário ser{" "}
                  <span className="font-semibold text-white">administrador</span>{" "}
                  em pelo menos um servidor onde o bot esteja presente.
                </p>
              </div>

              <button
                onClick={() => router.replace("https://pflegacy.xyz")}
                className="mt-6 w-full rounded-xl cursor-pointer bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Voltar para o site principal
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}