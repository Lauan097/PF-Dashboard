'use client';

import { Popover, PopoverContent, PopoverTrigger, Separator } from "@heroui/react";
import { ChevronsUpDown, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

interface ServerSelectProps { 
  id: string;
  name: string;
  icon: string | null;
}

interface ServerProps {
  servers: ServerSelectProps[];
  value: string;
  mode?: 0 | 1;
}

export function ServerSelect({
  servers,
  value,
  mode = 0
}: ServerProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const selectServer = servers.find((s) => s.id === value) || {
    id: value,
    name: "Selecionar Servidor",
    icon: null
  };

  return (
    <Popover isOpen={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger>
        <div className={`flex items-center ${mode === 0 ? 'w-60 bg-white/3' : ''} p-1.5 space-x-3 rounded-full transition-colors cursor-pointer overflow-hidden ${popoverOpen ? 'bg-white/8' : 'hover:bg-white/8'}`}>
          <div className="h-9 w-9 min-w-9 shrink-0">
            <Image
              src={selectServer.icon ?? "https://cdn.discordapp.com/embed/avatars/0.png"}
              alt="Logo do Servidor"
              width={512}
              height={512}
              className="h-9 w-9 rounded-full bg-blue-500/60"
            />
          </div>
          
          <AnimatePresence initial={false}>
            {mode === 0 && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap"
              >
                <div className="flex flex-col items-start min-w-0 pr-2">
                  <span className="truncate text-sm w-full">{selectServer.name}</span>
                  <span className="text-[10px] text-gray-500">{selectServer.id}</span>
                </div>
                <ChevronsUpDown className="shrink-0 h-5 w-5 text-gray-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-60" placement="right">
        <div className="p-2 w-full">
          <div className="text-xs text-gray-400 px-2 mb-2">Servidores</div>
          {servers.map((server) => (
            <div 
              key={server.id} 
              onClick={() => { 
                setPopoverOpen(false);
                localStorage.setItem("lastGuildId", server.id);
                const segments = pathname.split("/");
                segments[1] = server.id;
                router.push(segments.join("/") || `/${server.id}`);
              }}
              className={`flex items-center space-x-2 p-2 ${server.id === value ? "bg-white/10" : "hover:bg-white/5"} rounded-full cursor-pointer`}
            >
              <Image
                src={server.icon ?? "https://cdn.discordapp.com/embed/avatars/0.png"}
                alt="Logo do Servidor"
                width={512}
                height={512}
                className="h-6 w-6 rounded-full bg-blue-500/60"
              />
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm truncate w-full">{server.name}</span>
              </div>
            </div>
          ))}
        </div>
        <Separator className="my-0" />
        <div className="p-2 w-full">
          <div 
            onClick={() => {
              setPopoverOpen(false);
              toast.warning('Ops! Você não tem permissão pra isso.');
            }} 
            className="flex items-center hover:bg-neutral-800 rounded-full cursor-pointer p-2 space-x-2 w-full"
          >
            <div className="bg-neutral-800 p-1.5 w-fit rounded-full">
              <Plus size={14} />
            </div>
            <span className="text-sm">Add Servidor</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}