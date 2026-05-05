"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Dropdown, Separator } from "@heroui/react";
import {
  CircleCheck,
  CircleMinus,
  CloudOff,
  Filter,
  Moon,
  RefreshCw,
  Search,
  Trash2,
  UsersRound,
} from "lucide-react";
import { TooltipButton } from "@/app/components/TooltipButton";

import MemberTable from "./components/MemberTable";
import ErrorPage from "@/app/components/ErrorPage";
import { Skeleton, InputGroup, Kbd } from "@heroui/react";
import { PointManagerMember, PointManagerResponse } from "@/types/globalData";

interface DiscordMember {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  status: string;
  activity: string;
  joinedAt: string;
}

interface MembersResponse {
  success: boolean;
  data: {
    members: DiscordMember[];
  };
}

export default function MembersPage() {
  const [members, setMembers] = useState<DiscordMember[]>([]);
  const [pointManagerMembers, setPointManagerMembers] = useState<
    PointManagerMember[]
  >([]);
  const [Animloading, setAnimLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNavigatingToMember, setIsNavigatingToMember] = useState(false);

  const pageVariants = {
    initial: { opacity: 0, y: 30, x: 0 },
    animate: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.2, ease: "easeOut" as const },
    },
    exit: isNavigatingToMember
      ? {
          opacity: 0,
          x: -50,
          transition: { duration: 0.2, ease: "easeOut" as const },
        }
      : {
          opacity: 0,
          y: -30,
          transition: { duration: 0.2, ease: "easeOut" as const },
        },
  };

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [goalFilter, setGoalFilter] = useState<"met" | "notMet" | null>(null);
  const [dateSort, setDateSort] = useState<"asc" | "desc">("desc");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const params = useParams();
  const guildId = params.guildId as string;

  const fetchMembers = useCallback(
    async (isManualRefresh = false) => {
      if (!isManualRefresh) {
        setLoading(true);
      }

      setAnimLoading(true);
      try {
        const [membersRes, pointManagerRes] = await Promise.all([
          fetch(`/api/data/guild?guildId=${guildId}&type=members`),
          fetch(`/api/data/point--manager?guildId=${guildId}`),
        ]);

        const membersResult: MembersResponse = await membersRes.json();
        const pointManagerResult: PointManagerResponse =
          await pointManagerRes.json();

        if (membersResult.success) setMembers(membersResult.data.members);
        if (pointManagerResult.success)
          setPointManagerMembers(pointManagerResult.data.members);
      } catch (e) {
        console.log("Erro ao carregar membros", e);
        setError("Ocorreu um erro ao carregar os membros do servidor.");
      } finally {
        setTimeout(() => {
          setAnimLoading(false);
          setTimeout(() => setLoading(false), 400);
        }, 200);
      }
    },
    [guildId],
  );

  useEffect(() => {
    if (!guildId) return;
    fetchMembers();
  }, [guildId, fetchMembers]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredMembers = useMemo(() => {
    let result = [...members];

    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.username.toLowerCase().includes(lowerSearch) ||
          (m.nickname && m.nickname.toLowerCase().includes(lowerSearch)),
      );
    }

    if (statusFilter) {
      result = result.filter((m) => m.status === statusFilter);
    }

    if (goalFilter !== null) {
      result = result.filter((m) => {
        const pmMember = pointManagerMembers.find((pm) => pm.userId === m.id);
        if (!pmMember) return false;
        return goalFilter === "met" ? pmMember.metGoal : !pmMember.metGoal;
      });
    }

    result.sort((a, b) => {
      const dateA = new Date(a.joinedAt).getTime();
      const dateB = new Date(b.joinedAt).getTime();

      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return dateSort === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [
    members,
    search,
    statusFilter,
    goalFilter,
    dateSort,
    pointManagerMembers,
  ]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter(null);
    setGoalFilter(null);
    setDateSort("desc");
  };

  if (error) {
    return <ErrorPage error={error} showDetails />;
  }

  return (
    <motion.div
      key="members-page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-[#242424] rounded-xl"
    >
      <div className="min-h-[80vh] p-2 flex flex-col shadow-xl">
        <div className="bg-[#3d3d3d] p-2 rounded-md flex items-center border border-white/5 mb-4">
          {loading ? (
            <Skeleton className="w-14 h-8 mx-2" />
          ) : (
            <h1 
              className="text-md font-rajdhani font-semibold flex items-center gap-2 text-neutral-400 select-none 
              ml-2 bg-[#19191C] px-2 py-1.5 rounded-xl"
            >
              <UsersRound size={18} className="text-zinc-400" />
              {filteredMembers.length}
            </h1>
          )}

          <hr className="border-r border-neutral-600 mx-4 h-8" />

          <div className="max-w-80 w-full">
            <InputGroup>
              <InputGroup.Prefix>
                <Search size={18} className="text-gray-400" />
              </InputGroup.Prefix>
              <InputGroup.Input
                ref={searchInputRef}
                placeholder="Buscar membro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <InputGroup.Suffix>
                <Kbd>Alt + P</Kbd>
              </InputGroup.Suffix>
            </InputGroup>
          </div>

          <div className="ml-auto space-x-2 flex items-center">
            <Dropdown>
              <div>
                <TooltipButton
                  isIconOnly
                  icon={<Filter />}
                  tooltipText="Filtrar"
                  buttonClassName={`bg-[#18181B] border cursor-pointer transition-colors ${statusFilter || goalFilter ? "border-blue-500/50 text-blue-400" : "border-[#3d3d3d] hover:bg-neutral-800/60 text-white/50 hover:text-white"}`}
                />
              </div>
              <Dropdown.Popover
                className="shadow-2xl min-w-38 border border-white/10"
                placement="left top"
              >
                <Dropdown.Menu>
                  <Dropdown.SubmenuTrigger>
                    <Dropdown.Item className="">
                      Filtrar Data
                      <Dropdown.SubmenuIndicator />
                    </Dropdown.Item>
                    <Dropdown.Popover className="min-w-38">
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => setDateSort("desc")}
                          className={
                            dateSort === "desc"
                              ? "bg-white/10"
                              : ""
                          }
                        >
                          Mais Recentes
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => setDateSort("asc")}
                          className={
                            dateSort === "asc"
                              ? "bg-white/10"
                              : ""
                          }
                        >
                          Mais Antigos
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown.Popover>
                  </Dropdown.SubmenuTrigger>

                  <Dropdown.SubmenuTrigger>
                    <Dropdown.Item className="">
                      Filtrar Status
                      <Dropdown.SubmenuIndicator />
                    </Dropdown.Item>
                    <Dropdown.Popover className="min-w-38">
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => setStatusFilter("online")}
                          className={
                            statusFilter === "online"
                              ? "bg-white/10"
                              : ""
                          }
                        >
                          Disponível
                          <CircleCheck
                            size={16}
                            className="text-emerald-500 ml-auto"
                          />
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => setStatusFilter("idle")}
                          className={
                            statusFilter === "idle"
                              ? "bg-white/10"
                              : ""
                          }
                        >
                          Ausente
                          <Moon size={16} className="text-yellow-500 ml-auto" />
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => setStatusFilter("dnd")}
                          className={
                            statusFilter === "dnd"
                              ? "bg-white/10"
                              : ""
                          }
                        >
                          Não Perturbe
                          <CircleMinus
                            size={16}
                            className="text-red-500 ml-auto"
                          />
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => setStatusFilter("offline")}
                          className={
                            statusFilter === "offline"
                              ? "bg-white/10"
                              : ""
                          }
                        >
                          Offline
                          <CloudOff
                            size={16}
                            className="text-gray-500 ml-auto"
                          />
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown.Popover>
                  </Dropdown.SubmenuTrigger>

                  <Dropdown.SubmenuTrigger>
                    <Dropdown.Item className="">
                      Filtrar por Meta
                      <Dropdown.SubmenuIndicator />
                    </Dropdown.Item>
                    <Dropdown.Popover className="min-w-38">
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => setGoalFilter("met")}
                          className={
                            goalFilter === "met"
                              ? "bg-white/10"
                              : ""
                          }
                        >
                          Meta Concluída
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => setGoalFilter("notMet")}
                          className={
                            goalFilter === "notMet"
                              ? "bg-white/10"
                              : ""
                          }
                        >
                          Meta Não Concluída
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown.Popover>
                  </Dropdown.SubmenuTrigger>

                  <Separator className="bg-white/10" />

                  <Dropdown.Item
                    onClick={resetFilters}
                    className="hover:bg-red-400/15 text-red-400"
                  >
                    Limpar Filtros
                    <Trash2 className="text-red-400 ml-auto" size={16} />
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>

            <TooltipButton
              onClick={() => fetchMembers(true)}
              isIconOnly
              icon={
                <RefreshCw
                  className={Animloading ? "animate-spin text-blue-400" : ""}
                />
              }
              tooltipText="Atualizar"
              buttonClassName="bg-[#18181B] hover:bg-neutral-800/60 border border-[#3d3d3d] cursor-pointer text-white/50 hover:text-white"
            />
          </div>
        </div>

        <MemberTable
          members={filteredMembers}
          loading={loading}
          onRowClick={() => setIsNavigatingToMember(true)}
        />
      </div>
    </motion.div>
  );
}
