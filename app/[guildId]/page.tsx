'use client';

import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { motion } from "framer-motion";;
import { ServerOverviewCard } from "@/app/components/ServerOverviewCard";
import { Book, ArrowRight } from "lucide-react";
import { FaUserSecret } from "react-icons/fa";
import { MdOutlineAutorenew } from "react-icons/md";
import Link from "next/link";
import Image from "next/image";
import { VariantsPageTransition } from "@/utils/variants";
import LoadingBar from "../components/LoadingBar";
import ErrorPage from "../components/ErrorPage";

interface ServerData {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  splashURL: string | null;
  description: string | null;
  membersCount: number;
  rolesCount: number;
  textChannelsCount: number;
  voiceChannelsCount: number;
  emojisCount: number;
  ownerName: string;
  createdAt: string;
}

const quickLinks = [
  {
    title: "Comece por aqui",
    description: "Entenda funções básicas de configuração.",
    icon: <Book size={24} className="text-white" />,
    href: "/docs?page=about",
    color: "bg-blue-600"
  },
  {
    title: "Perfil do Bot",
    description: "Aprenda a configurar o perfil do seu bot corretamente no seu servidor.",
    icon: <FaUserSecret size={24} className="text-black" />,
    href: "/docs?page=recruitment",
    color: "bg-gray-200"
  },
  {
    title: "Editor V2",
    description: "Aprenda a montar mensagens únicas com os novos Components V2 do Discord!",
    icon: <MdOutlineAutorenew size={24} className="text-white" />,
    href: "/docs?page=re-recruitment",
    color: "bg-neutral-600"
  }
];

export default function HomeDashboard() {
  const [serverData, setServerData] = useState<ServerData | null>(null);
  const [Animloading, setAnimLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const guildId = params.guildId as string;

  useEffect(() => {
    const fetchGuildData = async () => {
      try {
        const response = await fetch(`/api/data/server-info?guildId=${guildId}`);
        const result = await response.json();

        if (result.success) {
          setTimeout(() => {
            setServerData(result.data);
          }, 500);
        } else {
          console.log(result.error || "Erro ao carregar dados");
          setError(result.error || "Ocorreu um erro ao carregar dados do servidor.");
        }
      } catch (err) {
        console.log("Falha na comunicação com a API", err);
        setError("Falha na comunicação com a API | Code: 500");
      } finally {
        setAnimLoading(false);
      }
    };

    fetchGuildData();
  }, [guildId]);

  if (error) return (
    <ErrorPage 
      title="Ops, algo deu errado"
      description={error}
      showDetails={false}
    />
  );

  return (
      <motion.div className="container mx-auto min-h-screen py-12 max-w-7xl"
      >
        <div className="min-h-screen">
 
          <div>
            <div>
              <div>
                {serverData ? (
                  <ServerOverviewCard data={serverData} />
                ) : (
                  <ServerOverviewSkeleton />
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">

            <hr className="border-0 my-16" />

            <div className="mb-20 mt-16">
              <h2 className={"text-3xl text-center font-bold text-gray-300 mb-2"}>
                Aprenda a usar o Dashboard
              </h2>
              <p className="text-center mb-10 font-semibold text-gray-400">Acesse nossa documentação pra aprender como funciona cada página!</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickLinks.map((link, idx) => (
                  <Link
                    key={idx} 
                    href='#'
                    className="group relative flex flex-col justify-between p-6 rounded-2xl bg-[#1a1a1a] border border-transparent hover:border-white/10 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-lg ${link.color}`}>
                        {link.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {link.description}
                      </p>
                    </div>
                    
                    <div className="mt-6 flex items-center text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0">
                      Acessar <ArrowRight size={16} className="ml-2" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-14 pb-3 select-none flex items-center justify-center gap-4 opacity-70">
              <span className="text-xs text-zinc-400 whitespace-nowrap">Tecnologia & Inovação</span>
              <hr className="h-4 rounded-t-3xl border-l border-r border-t border-gray-400/20" />
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Sentra" width={18} height={18} className="rounded-full opacity-90" />
                <span className="text-xs font-medium text-zinc-300 tracking-wide">Federal</span>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
  );
}

function ServerOverviewSkeleton() {
  return (
    <div className="w-full max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-[#1f1f1f] animate-pulse">
      
      <div className="h-40 bg-white/10" />

      <div className="px-6">
        <div className="-mt-12 flex items-end gap-4">
          <div className="h-24 w-24 rounded-full bg-[#3d3d3d] border-4 border-[#0f0f14]" />
          <div className="space-y-2 pb-2">
            <div className="h-5 w-48 bg-white/10 rounded" />
            <div className="h-4 w-32 bg-white/10 rounded" />
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-3/4 bg-white/10 rounded" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-white/10"
            />
          ))}
        </div>
      </div>
    </div>
  );
}