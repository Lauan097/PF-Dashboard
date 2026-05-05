"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  Star,
  Clock,
  Activity,
  ChevronLeft,
  Ban,
  Rocket,
  TriangleAlert,
  House
} from "lucide-react";
import { Tabs, Button, ButtonGroup, Separator, Skeleton } from "@heroui/react";
import OverviewTab from "./components/OverviewTab";
import RecordTab from "./components/RecordTab";
import ServicesTab from "./components/ServicesTab";
import DiscordStatusIcon from "@/app/components/DiscordStatusIcon";
import ModalUp from "./components/ModalUp";
import ModalWarningBan from "./components/ModalWarningBan";

type TabId = "overview" | "record" | "services";

const TABS = [
  { id: "overview" as TabId, label: "Início", icon: House },
  { id: "record" as TabId, label: "Ficha", icon: FileText },
  { id: "services" as TabId, label: "Serviços", icon: Clock },
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

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const guildId = params.guildId as string;
  const userId = params.userId as string;

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [modalUpOpen, setModalUpOpen] = useState(false);
  const [modalBanOpen, setModalBanOpen] = useState(false);
  const [modalWarningOpen, setModalWarningOpen] = useState(false);
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
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="space-y-4"
    >
      <div className="bg-[#0e0e0e] border border-white/8 rounded-2xl overflow-hidden print:hidden">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
          <Button
            onClick={() => router.push(`/${guildId}/members`)}
            isIconOnly
            variant="tertiary"
          >
            <ChevronLeft size={16} />
          </Button>

          <Separator orientation="vertical" className="bg-white/5" />

          {loading ? (
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-11 h-11 rounded-full shrink-0" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ) : (
            <>
              <div className="relative shrink-0 select-none">
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
                  className="absolute bottom-0 right-0"
                >
                  <DiscordStatusIcon name={member?.status || "offline"} size={14} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm truncate">
                    {member?.nickname || member?.username}
                  </p>
                </div>
                <div className="text-zinc-500 text-xs mt-0.5">
                  @{member?.username}
                  {headerInfo?.internalId ? ` · ${headerInfo.internalId}` : ""}
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4 p-2 rounded-full bg-[#262727]">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Clock size={14} className="text-blue-400" />
                  <span className="text-zinc-200 font-medium">
                    {headerInfo?.monthlyHours ?? 0}h
                  </span>
                  este mês
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Star size={14} className="text-yellow-400" />
                  <span className="text-zinc-200 font-medium">
                    {headerInfo?.level != null
                      ? `Nível ${headerInfo.level}`
                      : "Sem nível"}
                  </span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Activity size={14} className="text-emerald-400" />
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

        <div className="px-6 py-2.5 flex items-center justify-between">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(v) => setActiveTab(v as TabId)}
            className="w-full max-w-xs"
          >
            <Tabs.ListContainer>
              <Tabs.List aria-label="Abas do membro">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Tabs.Tab
                      key={tab.id}
                      id={tab.id}
                      className="gap-2"
                    >
                      <Icon size={13} />
                      {tab.label}
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  );
                })}
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
          <div>
            <ButtonGroup size="md" variant="secondary">
              <Button onClick={() => setModalBanOpen(true)}>
                <Ban className="text-red-400" />
              </Button>
              <Button onClick={() => setModalWarningOpen(true)}>
                <ButtonGroup.Separator />
                <TriangleAlert className="text-yellow-400" />
              </Button>
              <Button
                onClick={() => setModalUpOpen(true)}
              >
                <ButtonGroup.Separator />
                <Rocket className="text-emerald-400" />
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </div>

      <ModalWarningBan
        type="ban"
        isOpen={modalBanOpen}
        onClose={() => setModalBanOpen(false)}
        guildId={guildId}
        userId={userId}
      />
      <ModalWarningBan
        type="warning"
        isOpen={modalWarningOpen}
        onClose={() => setModalWarningOpen(false)}
        guildId={guildId}
        userId={userId}
      />
      <ModalUp
        isOpen={modalUpOpen}
        onClose={() => setModalUpOpen(false)}
        guildId={guildId}
        userId={userId}
      />

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
            ) : activeTab === "services" ? (
              <ServicesTab userId={userId} guildId={guildId} />
            ) : (
              <RecordTab userId={userId} guildId={guildId} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
