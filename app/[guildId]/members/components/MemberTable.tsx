import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Activity, Calendar1, ChevronRight, User2 } from "lucide-react";
import { Pagination } from "@heroui/react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DiscordStatusIcon from "@/app/components/DiscordStatusIcon";

interface DiscordMember {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  status: string;
  activity: string;
  joinedAt: string;
}

interface MemberTableProps {
  members: DiscordMember[];
  loading?: boolean;
  onRowClick?: () => void;
}

const variants = {
  initial: { opacity: 0, y: 5 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -5, transition: { duration: 0.15 } },
};

export default function MemberTable({
  members,
  loading = true,
  onRowClick,
}: MemberTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const totalPages = Math.ceil(members.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = members.slice(startIndex, endIndex);

  const params = useParams();
  const router = useRouter();
  const guildId = params.guildId as string;

  const getStatusColor = (status: string) => {
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
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "Data desconhecida";
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
        .format(date)
        .replace(",", " às");
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full mt-2 flex flex-col bg-[#3d3d3d] rounded-xl flex-1 border border-white/5 min-h-185 overflow-hidden">
      <div className="w-full overflow-x-auto md:overflow-y-hidden flex-1">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs uppercase bg-[#18181B] text-gray-500 rounded-lg">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 rounded-tl-lg font-semibold tracking-wider"
              >
                <span className="flex items-center gap-1.5">
                  <User2 className="w-4 h-3" /> Membro
                </span>
              </th>
              <th
                scope="col"
                className="px-6 py-4 font-semibold tracking-wider"
              >
                <span className="flex items-center gap-1.5">
                  <Calendar1 className="w-4 h-3" /> Data de Entrada
                </span>
              </th>
              <th
                scope="col"
                className="px-6 py-4 font-semibold tracking-wider"
              >
                <span className="flex items-center gap-1.5">
                  <Activity className="w-4 h-3" /> Atividade
                </span>
              </th>
              <th scope="col" className="px-6 py-4 rounded-tr-lg"></th>
            </tr>
          </thead>

          <AnimatePresence mode="wait" initial={false}>
            <motion.tbody
              key={
                loading
                  ? "skeleton"
                  : `page-${currentPage}-count-${currentMembers.length}`
              }
              initial="initial"
              animate="animate"
              exit="exit"
              variants={variants}
            >
              {loading
                ? Array.from({ length: 20 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse shrink-0" />
                          <div className="flex flex-col gap-1.5">
                            <div className="h-3.5 w-28 bg-white/10 animate-pulse rounded" />
                            <div className="h-2.5 w-20 bg-white/5 animate-pulse rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3.5 w-36 bg-white/10 animate-pulse rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3.5 w-44 bg-white/10 animate-pulse rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse ml-auto" />
                      </td>
                    </tr>
                  ))
                : currentMembers.map((member) => (
                    <tr
                      key={member.id}
                      onClick={() => {
                        onRowClick?.();
                        router.push(`/${guildId}/members/${member.id}`);
                      }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <Image
                              src={member.avatar}
                              alt={member.username}
                              width={40}
                              height={40}
                              className="rounded-full w-10 h-10 object-cover border border-[#3d3d3d]"
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
                          <div>
                            <div className="text-white font-medium">
                              {member.nickname || member.username}
                            </div>
                            <div className="text-xs text-gray-500">
                              @{member.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300 font-medium whitespace-nowrap">
                        {formatDate(member.joinedAt)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap truncate max-w-60">
                        {member.activity ? (
                          <span className="text-green-400">
                            {member.activity}
                          </span>
                        ) : (
                          "Nenhuma Atividade"
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ml-auto border border-white/5 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                        </div>
                      </td>
                    </tr>
                  ))}

              {!loading && members.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Nenhum membro encontrado.
                  </td>
                </tr>
              )}
            </motion.tbody>
          </AnimatePresence>
        </table>
      </div>

      <div className="bg-[#18181B] border-t border-white/5 p-4 mt-auto">
        <div className="flex items-center justify-center">
          <Pagination>
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                >
                  Anterior
                </Pagination.Previous>
              </Pagination.Item>

              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;

                return (
                  <Pagination.Item key={page}>
                    <Pagination.Link
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </Pagination.Link>
                  </Pagination.Item>
                );
              })}

              <Pagination.Item>
                <Pagination.Next
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages || totalPages === 0
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                >
                  Próximo
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
