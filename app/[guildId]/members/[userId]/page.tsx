"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Shield,
  Star,
  Clock,
  Activity,
  ChevronLeft,
  ShieldAlert,
  Ban,
} from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/tabs";
import { Button } from "@/components/button";
import { toast } from "sonner";
import OverviewTab from "./components/OverviewTab";
import RecordTab from "./components/RecordTab";

type TabId = "overview" | "record";

const TABS = [
  { id: "overview" as TabId, label: "Visão Geral", icon: LayoutDashboard },
  { id: "record" as TabId, label: "Ficha", icon: FileText },
];

interface HeaderInfo {
  rank: string | null;
  registration: string | null;
  internalId: string | null;
  level: number | null;
  monthlyHours: number;
}

interface MemberBasic {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  status: string;
  activity: string | null;
}

function getStatusColor(status: string) {
  switch (status) {
    case "online":
      return "bg-emerald-500";
    case "idle":
      return "bg-yellow-500";
    case "dnd":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const guildId = params.guildId as string;
  const userId = params.userId as string;

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [member, setMember] = useState<MemberBasic | null>(null);
  const [headerInfo, setHeaderInfo] = useState<HeaderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guildId || !userId) return;
    let cancelled = false;

    async function fetchHeader() {
      setLoading(true);
      try {
        const [membersRes, infoRes] = await Promise.all([
          fetch(`/api/data/guild?guildId=${guildId}&type=members`),
          fetch(`/api/data/user?guildId=${guildId}&userId=${userId}`),
        ]);
        const membersData = await membersRes.json();
        const infoData = await infoRes.json();
        if (cancelled) return;

        if (membersData.success) {
          const found = membersData.data.members.find(
            (m: MemberBasic) => m.id === userId,
          );
          if (found) setMember(found);
        }
        if (infoData.success) setHeaderInfo(infoData.data);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHeader();
    return () => {
      cancelled = true;
    };
  }, [guildId, userId]);

  return (
    <div className="space-y-4">
      <div className="bg-[#0e0e0e] border border-white/8 rounded-2xl overflow-hidden print:hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
          <button
            onClick={() => router.push(`/${guildId}/members`)}
            className="cursor-pointer shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/8 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          {loading ? (
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-11 h-11 rounded-full bg-zinc-800 shrink-0" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32 bg-zinc-800" />
                <Skeleton className="h-3 w-20 bg-zinc-800" />
              </div>
            </div>
          ) : (
            <>
              <div className="relative shrink-0">
                <Image
                  src={
                    member?.avatar ||
                    "https://cdn.discordapp.com/embed/avatars/0.png"
                  }
                  alt={member?.username || ""}
                  width={44}
                  height={44}
                  className="rounded-full w-11 h-11 object-cover border border-white/10"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://cdn.discordapp.com/embed/avatars/0.png";
                  }}
                  unoptimized
                  priority
                />
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0e0e0e] ${getStatusColor(member?.status || "")}`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm truncate">
                    {member?.nickname || member?.username}
                  </p>
                  {headerInfo?.rank && (
                    <span className="bg-blue-500/15 text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1 shrink-0">
                      <Shield size={10} /> {headerInfo.rank}
                    </span>
                  )}
                </div>
                <div className="text-zinc-500 text-xs mt-0.5">
                  @{member?.username}
                  {headerInfo?.internalId ? ` · ${headerInfo.internalId}` : ""}
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4 mr-2">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Clock size={12} className="text-blue-400" />
                  <span className="text-zinc-200 font-medium">
                    {headerInfo?.monthlyHours ?? 0}h
                  </span>
                  este mês
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Star size={12} className="text-yellow-400" />
                  <span className="text-zinc-200 font-medium">
                    {headerInfo?.level != null
                      ? `Nível ${headerInfo.level}`
                      : "Sem nível"}
                  </span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Activity size={12} className="text-emerald-400" />
                  <span
                    className={
                      member?.activity
                        ? "text-emerald-400 font-medium truncate max-w-32"
                        : "text-zinc-500"
                    }
                  >
                    {member?.activity || "Sem atividade"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6 py-2.5 flex items-center justify-between">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabId)}
            className=""
          >
            <TabsList>
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 h-auto rounded-lg text-xs font-medium text-zinc-500 data-[state=active]:bg-white/8 data-[state=active]:text-white! data-[state=active]:border data-[state=active]:border-white/10 after:hidden"
                  >
                    <Icon size={13} />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
          <div className="gap-1 flex">
            <Button
              variant="destructive"
              size="icon"
              onClick={() =>
                toast.info("Funcionalidade disponível em breve...")
              }
            >
              <Ban />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() =>
                toast.info("Funcionalidade disponível em breve...")
              }
            >
              <ShieldAlert />
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden mt-12 print:mt-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 40 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: { duration: 0.3, ease: [0.165, 0.84, 0.44, 1.0] },
            }}
            exit={{
              opacity: 0,
              x: -40,
              transition: { duration: 0.2, ease: [0.36, 0.66, 0.04, 1] },
            }}
          >
            {activeTab === "overview" ? (
              <OverviewTab userId={userId} guildId={guildId} />
            ) : (
              <RecordTab userId={userId} guildId={guildId} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
