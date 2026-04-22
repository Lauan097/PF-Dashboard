'use client';

import Image from "next/image";
import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { FaDiscord } from "react-icons/fa6";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.12),transparent_35%)] -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.12),transparent_35%)] -z-10" />
        
        <div className="grid min-h-150 md:grid-cols-2">
          
          <div className="hidden md:block relative">

            <Image
              src="/banner.png"
              alt="Imagem de login"
              className="h-full w-full object-cover brightness-85"
              fill
            />

            <div className="absolute inset-x-0 bottom-0 h-160 bg-linear-to-t from-black/95 via-black/40 to-transparent" />

            <div className="absolute bottom-8 left-8 z-10 max-w-md text-white">
              <h1 className="text-3xl font-black">Polícia Federal</h1>
              <p className="mt-3 text-sm text-zinc-200">
                A maior corporação policial investigativa de Legacy City.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center p-8 md:p-12">
            <div className="w-full max-w-sm">
              <Image src="/logoTP.png" alt="Logo Polícia Federal" width={60} height={60} className="mx-auto mb-4" />
              <h2 className="text-xl font-black text-white text-center">Dashboard — Polícia Federal</h2>
              <p className="mt-2 text-sm text-zinc-400 text-center">
                Faça login para continuar:
              </p>

              <div className="mt-8 space-y-4">
                <input 
                  type="text"
                  placeholder="Insira seu nome de usuário..."
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
                />
                <input 
                  type="password"
                  placeholder="Insira sua senha..."
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
                />
                <button 
                  className="w-full rounded-md bg-zinc-600 px-4 py-2 font-semibold text-white hover:bg-zinc-700 cursor-pointer transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  disabled
                >
                  Continuar <ArrowRight className="inline-block ml-1" />
                </button>

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-sm text-zinc-400">Ou</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <button 
                  onClick={() => signIn("discord", { callbackUrl: "/" })}
                  className="w-full rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 cursor-pointer transition-colors"
                >
                  <FaDiscord className="inline-block mr-2" size={22} />
                  Continuar com o Discord
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}