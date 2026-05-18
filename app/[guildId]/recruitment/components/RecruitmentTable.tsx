"use client";

import { Skeleton } from "@heroui/react";
import { Calendar, MapPin, Users } from "lucide-react";
import { Recruitment } from "@/types/recruitment";
import { formatDate } from "@/utils/timeFormat";
import RecruitmentStatusBadge from "./RecruitmentStatusBadge";

interface Props {
  recruitments: Recruitment[];
  loading: boolean;
  onRowClick: (recruitment: Recruitment) => void;
}

export default function RecruitmentTable({
  recruitments,
  loading,
  onRowClick,
}: Props) {
  if (loading) {
    return (
      <div className="bg-[#1c1c1f] border border-white/8 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/8">
          <Skeleton className="w-40 h-5 rounded-lg" />
        </div>
        <div className="divide-y divide-white/5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="w-24 h-4 rounded-lg" />
              <Skeleton className="w-16 h-6 rounded-full ml-2" />
              <Skeleton className="w-32 h-4 rounded-lg ml-auto" />
              <Skeleton className="w-24 h-4 rounded-lg" />
              <Skeleton className="w-24 h-4 rounded-lg" />
              <Skeleton className="w-12 h-4 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recruitments.length === 0) {
    return (
      <div className="bg-[#1c1c1f] border border-white/8 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3 h-140">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <Calendar size={28} className="text-white/20" />
        </div>
        <p className="text-white/40 text-sm">
          Nenhuma edição de recrutamento encontrada.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1c1c1f] border border-white/8 rounded-2xl overflow-hidden">
      <table className="w-full border-collapse">
        <thead className="bg-white/3 border-b border-white/8">
          <tr>
            <th className="px-5 py-3 text-left text-[10px] text-white/40 uppercase tracking-wider font-semibold">
              Edição
            </th>

            <th className="px-5 py-3 text-left text-[10px] text-white/40 uppercase tracking-wider font-semibold">
              Status
            </th>

            <th className="px-5 py-3 text-left text-[10px] text-white/40 uppercase tracking-wider font-semibold">
              <div className="flex items-center gap-1.5">
                <MapPin size={10} />
                Localização
              </div>
            </th>

            <th className="px-5 py-3 text-left text-[10px] text-white/40 uppercase tracking-wider font-semibold">
              <div className="flex items-center gap-1.5">
                <Calendar size={10} />
                Abertura / Fechamento
              </div>
            </th>

            <th className="px-5 py-3 text-right text-[10px] text-white/40 uppercase tracking-wider font-semibold">
              <div className="flex items-center justify-end gap-1.5">
                <Users size={10} />
                Part.
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {recruitments.map((r) => (
            <tr
              key={r.id}
              onClick={() => onRowClick(r)}
              className="border-b border-white/5 hover:bg-white/4 transition-colors duration-150 cursor-pointer group"
            >
              <td className="px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white/90 truncate group-hover:text-white transition-colors">
                    Edição Nº {r.edition}
                  </p>

                  <p className="text-[11px] text-white/30 truncate">
                    Criado por {r.openedByTag}
                  </p>
                </div>
              </td>

              <td className="px-5 py-4">
                <RecruitmentStatusBadge status={r.status} size="sm" />
              </td>

              <td className="px-5 py-4">
                <p className="text-sm text-white/60 truncate">
                  {r.location}
                </p>
              </td>

              <td className="px-5 py-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-white/60">
                    <span className="text-emerald-400/70 mr-1">↑</span>
                    {formatDate(r.oppeningDate)}
                  </p>

                  <p className="text-xs text-white/40">
                    <span className="text-rose-400/70 mr-1">↓</span>
                    {formatDate(r.closingDate)}
                  </p>
                </div>
              </td>

              <td className="px-5 py-4 text-right">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-white/60">
                  <Users size={13} className="text-white/30" />
                  {r.participants.length}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
