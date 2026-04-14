'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, Dropdown, Separator } from "@heroui/react";
import { 
  House, Braces, Settings, PanelLeftClose, LogOut, ChevronsUpDown, CreditCard, 
  Users, Clock 
} from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { TooltipButton } from "@/app/components/TooltipButton";
import { ServerSelect } from "@/app/components/ServerSelect";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { GuildData, SessionCheckResponse } from "@/types/verify";
import { toast } from "sonner";

export default function SidebarDashboard() {
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [guilds, setGuilds] = useState<GuildData[]>([]);
  
  const params = useParams();
  const router = useRouter();
  const guildId = params.guildId as string;
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/verify?type=checkSession")
      .then((res) => res.json())
      .then((data: SessionCheckResponse) => {
        if (data.success && data.guilds) setGuilds(data.guilds);
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { label: 'Início', icon: House, path: `/${guildId}` },
    { label: 'Configurações', icon: Settings, path: `/${guildId}/server-config` },
    { label: 'Editor V2', icon: Braces, path: `/${guildId}/editor-v2` },
    { label: 'Membros', icon: Users, path: `/${guildId}/members` },
    { label: 'Bate Ponto', icon: Clock, path: `/${guildId}/point-manager`, disabled: true },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isMobile) {
      if (info.offset.x < -50) setIsMobileOpen(false);
    }
  };

  const sidebarAnimation = isMobile  ? { x: isMobileOpen ? 0 : "-100%", width: 280 } : { width: isCollapsed ? 72 : 266, x: 0 };

  if (pathname?.startsWith("/login")) return null;
  
  return (
    <>
      {isMobile && !isMobileOpen && (
        <motion.div 
          className="fixed top-0 left-0 bottom-0 w-8 z-50 bg-transparent"
          onPanEnd={(e, info) => {
            if (info.offset.x > 50) setIsMobileOpen(true);
          }}
        />
      )}

      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={sidebarAnimation}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onPanEnd={handleDragEnd}
        className={`h-screen bg-[#171717] border-transparent flex flex-col px-2 py-2 z-40 overflow-hidden ${isMobile ? "fixed top-0 left-0 shadow-2xl" : "sticky top-0"}`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute inset-y-0 right-0 z-20 w-4 cursor-e-resize transition-all bg-[linear-gradient(to_right,#171717_0%,#171717_50%,#0a0a0a_50%,#0a0a0a_100%)]
            after:absolute after:inset-y-0 after:left-1/2 after:-translate-x-1/2 after:w-0.5 after:bg-zinc-800 after:transition-colors hover:after:bg-zinc-600
            focus:outline-none outline-none
          "
        />

        <AnimatePresence initial={false}>
          <div className="flex items-center mb-4">
            <ServerSelect 
              servers={guilds} 
              value={guildId} 
              mode={isCollapsed ? 1 : 0} 
            />

            {isMobile && (
               <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => setIsMobileOpen(false)}
               className="text-gray-400 hover:bg-white/5 hover:text-white ml-auto"
             >
               <PanelLeftClose />
             </Button>
            )}
          </div>
        </AnimatePresence>

        <nav className="flex-1 flex flex-col gap-2 border-t border-white/5 pt-4">
          <div className="max-w-60 space-y-1">
            {navItems.map((item) => (
              <TooltipButton
                key={item.path}
                activeTool={isCollapsed ? true : false}
                icon={<item.icon className="h-5 w-5 min-w-5 shrink-0" />}
                text={
                  <AnimatePresence>
                    {(!isCollapsed || isMobile) && (
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="overflow-hidden whitespace-nowrap block"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                }
                tooltipText={isCollapsed ? item.label : ""}
                tooltipSide="right"
                variant="ghost"
                size="md"
                onClick={() => {
                  router.push(item.path);
                  if (isMobile) setIsMobileOpen(false);
                }}
                className={cn(`flex items-center justify-start rounded-md overflow-hidden hover:bg-white/5 ${isCollapsed ? "" : "w-full"} gap-3 cursor-pointer`,
                  `${pathname === item.path ? 'bg-white/5' : '' }`
                )}
                disabled={item.disabled}
              />
            ))}
          </div>
        </nav>

        <div className="mt-auto pt-4 border-t border-white/5">
          <Dropdown isOpen={open} onOpenChange={setOpen}>
            <Dropdown.Trigger
              className={cn(
                `flex items-center h-12 px-2 py-2 space-x-3 rounded-md transition-colors overflow-hidden`,
                isCollapsed ? 'hover:bg-white/5 w-fit' : 'min-w-60 bg-white/3 hover:bg-white/5',
                open ? 'bg-white/5' : ''
              )}
            >
              <div className="shrink-0">
                <Image
                  src={session?.user?.image || 'https://cdn.discordapp.com/embed/avatars/1.png'} 
                  alt="Avatar do Usuário"
                  width={512}
                  height={512}
                  className="w-8 h-8 rounded-full bg-blue-500/60"
                />
              </div>

              <AnimatePresence>
                {(!isCollapsed || isMobile) && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap"
                  >
                    <div className="flex flex-col items-start min-w-0 pr-2">
                      <span className="truncate text-sm w-full">{session?.user?.name || "Usuário"}</span>
                    </div>
                    <ChevronsUpDown className="shrink-0 h-5 w-5 text-gray-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Dropdown.Trigger>

            <Dropdown.Popover 
              placement={isCollapsed ? "top start" : "top"}
              className="rounded-md"
            >
              <div className="flex items-center space-x-2 select-none px-3 py-2 border-b border-white/5">
                <Image
                  src={session?.user?.image || 'https://cdn.discordapp.com/embed/avatars/1.png'}
                  alt="Avatar do Usuário"
                  width={512}
                  height={512}
                  className="h-8 w-8 rounded-full bg-blue-500/60 shrink-0"
                />
                <div className="flex flex-col items-start min-w-0">
                  <span className="truncate text-sm w-full">{session?.user?.name || "Usuário"}</span>
                  <span className="truncate text-xs text-gray-400 w-full">{session?.user?.email || "Email"}</span>
                </div>
              </div>
              <Dropdown.Menu aria-label="User menu">
                <Dropdown.Item
                  id="plan"
                  onPress={() => router.push(`/${guildId}/plan`)}
                  isDisabled
                  className="rounded-md"
                >
                  <CreditCard className="h-4 w-4" />
                  Assinatura
                </Dropdown.Item>
                <Dropdown.Item
                  id="settings"
                  onPress={() => toast.info('Disponível em breve!')}
                  className="rounded-md"
                >
                  <Settings className="h-4 w-4" />
                  Configurações
                </Dropdown.Item>
                <Separator className="my-0.5 mx-auto w-full bg-white/5" />
                <Dropdown.Item
                  id="logout"
                  onPress={() => { window.location.href = "https://pflegacy.xyz"; }}
                  className="hover:bg-red-600/10 text-red-400 hover:text-red-400 rounded-md"
                >
                  <LogOut className="h-4 w-4" />
                  Sair do Dashboard
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </motion.aside>
    </>
  );
}