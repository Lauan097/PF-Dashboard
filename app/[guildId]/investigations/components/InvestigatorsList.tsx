"use client";

import { Shield } from "lucide-react";
import Image from "next/image";

interface Investigator {
  userId: string;
  userTag: string;
  gameName: string;
  rank: string;
  photoUrl: string | null;
}

interface InvestigatorsListProps {
  investigators: Investigator[];
}

export default function InvestigatorsList({ investigators }: InvestigatorsListProps) {
  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#121214] p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">
            Investigadores Autorizados
          </h2>
        </div>
        <span className="inline-flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full">
          {investigators.length}
        </span>
      </div>

      {investigators.length === 0 ? (
        <p className="text-xs text-gray-500 italic py-4 text-center">
          Nenhum investigador cadastrado no sistema.
        </p>
      ) : (
        <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-3 scrollbar-thin">
          {investigators.map((inv) => (
            <div 
              key={inv.userId}
              className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition"
            >
              <div className="relative h-9 w-9 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800 shrink-0">
                {inv.photoUrl ? (
                  <Image 
                    src={inv.photoUrl} 
                    alt={inv.gameName} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs font-bold text-gray-400 bg-neutral-800">
                    {inv.gameName.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {inv.gameName}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {inv.rank}
                </p>
              </div>

              <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 shrink-0" title="Ativo" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
