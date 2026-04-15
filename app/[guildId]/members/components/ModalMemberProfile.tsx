'use client';

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { LayoutDashboard, FileText, X, Shield, Star, Clock, Activity } from "lucide-react";
import { Skeleton } from "@/components/skeleton";

import OverviewPage from "../modalPages/OverviewPage";
import MemberRecordPage from "../modalPages/RecordPage";


interface DiscordMember {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  status: string;
  activity: string;
  joinedAt: string;
}

interface ModalMemberProfileProps {
  member: DiscordMember | null;
  isOpen: boolean;
  onClose: () => void;
  guildId: string;
}


function getStatusColor(status: string) {
  switch (status) {
    case "online": return "bg-emerald-500";
    case "idle":   return "bg-yellow-500";
    case "dnd":    return "bg-red-500";
    default:       return "bg-gray-500";
  }
}

interface HeaderInfo {
  rank: string | null;
  registration: string | null;
  internalId: string | null;
  level: number | null;
  monthlyHours: number;
}

const TABS = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { id: "record",   label: "Ficha",       icon: FileText },
];

export default function ModalMemberProfile({ member, isOpen, onClose, guildId }: ModalMemberProfileProps) {
  const [activeTab, setActiveTab]     = useState("overview");
  const [headerInfo, setHeaderInfo]   = useState<HeaderInfo | null>(null);
  const [headerLoading, setHeaderLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !member) return;
    let cancelled = false;

    async function fetchHeader() {
      setHeaderInfo(null);
      setHeaderLoading(true);
      try {
        const r    = await fetch(`/api/data/user?guildId=${guildId}&userId=${member!.id}`);
        const data = await r.json();
        if (cancelled) return;
        if (data.success) setHeaderInfo(data.data);
      } catch {
        // Ignore
      } finally {
        if (!cancelled) setHeaderLoading(false);
      }
    }

    fetchHeader();
    return () => { cancelled = true; };
  }, [isOpen, member?.id, guildId, member]);

  if (!isOpen || !member) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-5xl max-h-[92vh] bg-[#111111] border border-white/8 rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 shrink-0 bg-[#0e0e0e]">
                <div className="relative shrink-0">
                  <Image
                    src={member.avatar}
                    alt={member.username}
                    width={44}
                    height={44}
                    className="rounded-full w-11 h-11 object-cover border border-white/10"
                    onError={(e) => { e.currentTarget.src = "https://cdn.discordapp.com/embed/avatars/0.png"; }}
                    unoptimized
                    priority
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0e0e0e] ${getStatusColor(member.status)}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm truncate">{member.nickname || member.username}</p>
                    {headerLoading
                      ? <Skeleton className="h-5 w-28 rounded-full bg-zinc-800" />
                      : headerInfo?.rank && (
                          <span className="bg-blue-500/15 text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1 shrink-0">
                            <Shield size={10} /> {headerInfo.rank}
                          </span>
                        )
                    }
                  </div>
                  <div className="text-zinc-500 text-xs mt-0.5 flex items-center gap-1">
                    <span>@{member.username}</span>
                    {headerLoading
                      ? <Skeleton className="h-3 w-24 rounded bg-zinc-800" />
                      : headerInfo?.internalId ? <span>· {headerInfo.internalId}</span> : null
                    }
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-4 mr-4">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Clock size={12} className="text-blue-400" />
                    {headerLoading
                      ? <Skeleton className="h-3 w-8 rounded bg-zinc-800" />
                      : <span className="text-zinc-200 font-medium">{headerInfo?.monthlyHours ?? 0}h</span>
                    }
                    este mês
                  </div>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Star size={12} className="text-yellow-400" />
                    {headerLoading
                      ? <Skeleton className="h-3 w-14 rounded bg-zinc-800" />
                      : <span className="text-zinc-200 font-medium">
                          {headerInfo?.level != null ? `Nível ${headerInfo.level}` : 'Sem nível'}
                        </span>
                    }
                  </div>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Activity size={12} className="text-emerald-400" />
                    <span className={member.activity ? "text-emerald-400 font-medium truncate max-w-32" : "text-zinc-500"}>
                      {member.activity || "Sem atividade"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="cursor-pointer shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-white/8 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex items-center gap-1 px-6 py-2.5 border-b border-white/5 shrink-0 bg-[#0e0e0e]">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                        active
                          ? "bg-white/8 text-white border border-white/10"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/4"
                      }`}
                    >
                      <Icon size={13} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    {activeTab === "overview" && <OverviewPage userId={member.id} guildId={guildId} />}
                    {activeTab === "record"   && <MemberRecordPage userId={member.id} guildId={guildId} />}
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

