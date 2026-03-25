'use client';

import { useState, useEffect, useMemo } from "react";
import { useParams } from 'next/navigation';
import { motion } from "framer-motion";
import { TextArea, toast } from "@heroui/react";
import { 
  CheckCircle2, ClipboardList, Clock, FileText, ImageIcon, 
  Megaphone, Settings, Trash2, Upload, UserMinus, UserPlus, 
  LucideIcon,
  AlertTriangle,
  Eye
} from "lucide-react";
import Image from "next/image";
import { SaveBar } from "@/app/components/SaveBar";
import { TooltipButton } from "@/app/components/TooltipButton";
import BotProfilePreview from "@/app/[guildId]/server-config/components/BotProfilePreview";
import { ModalImageUploader } from "@/app/components/ModalImage";
import LoadingBar from "@/app/components/LoadingBar";
import ErrorPage from "@/app/components/ErrorPage";
import { TextChannelSelect } from "@/app/components/TextChannelSelect";

import { Input } from "@heroui/react";

interface ChannelsConfig {
  welcome: string | null;
  goodbye: string | null;
  announcements: string | null;
  announcementsPreview: string | null;
  rules: string | null;
  pointPanel: string | null;
  pointOpen: string | null;
  pointClose: string | null;
}

const defaultChannels: ChannelsConfig = {
  welcome: null,
  goodbye: null,
  announcements: null,
  announcementsPreview: null,
  rules: null,
  pointPanel: null,
  pointOpen: null,
  pointClose: null,
};

interface BotProfileConfig {
  botName: string;
  botBio: string;
  botAvatar: string;
  botBanner: string;
}

interface GlobalConfig {
  channels: ChannelsConfig;
  profile: BotProfileConfig;
}

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
}

interface ChannelCardDef {
  key: keyof ChannelsConfig;
  title: string;
  desc: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

const CHANNEL_CARDS: ChannelCardDef[] = [
  { key: 'welcome', title: 'Boas-vindas', desc: 'Mensagens automáticas de novos membros.', icon: UserPlus, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500' },
  { key: 'goodbye', title: 'Saídas', desc: 'Notifique quando alguém deixar o servidor.', icon: UserMinus, colorClass: 'text-red-500', bgClass: 'bg-red-500' },
  { key: 'announcements', title: 'Anúncios', desc: 'Canal oficial para publicação de anúncios.', icon: Megaphone, colorClass: 'text-blue-500', bgClass: 'bg-blue-500' },
  { key: 'pointPanel', title: 'Painel de Ponto', desc: 'Onde o painel interativo será fixado.', icon: ClipboardList, colorClass: 'text-neutral-500', bgClass: 'bg-neutral-500' },
  { key: 'pointOpen', title: 'Log de Abertura', desc: 'Registro de início de turno.', icon: Clock, colorClass: 'text-neutral-500', bgClass: 'bg-neutral-500' },
  { key: 'pointClose', title: 'Log de Fechamento', desc: 'Registro de finalização de turno.', icon: CheckCircle2, colorClass: 'text-neutral-500', bgClass: 'bg-neutral-500' },
];

const CHANNEL_TEST: any = [
  { key: 'rules', title: 'Regras', desc: 'Canal oficial para publicação de regras.', icon: FileText, colorClass: 'text-blue-500', bgClass: 'bg-blue-500' },
  { key: 'announcementsPreview', title: 'Prévia de Anúncios', desc: 'Canal para publicação de prévias de mensagens.', icon: Eye, colorClass: 'text-blue-500', bgClass: 'bg-blue-500' },
];

const ChannelCard = ({ 
  def, 
  value, 
  options, 
  onChange
}: { 
  def: ChannelCardDef; 
  value: string | null; 
  options: DiscordChannel[]; 
  onChange: (val: string | null) => void
}) => (
  <div className="bg-[#1c1c1c] p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
    <div className="mb-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-opacity-10 ${def.bgClass}`}>
        <def.icon className={`w-5 h-5 ${def.colorClass.replace('text-', 'bg-').replace('500', '500')}`} />
      </div>
      <h4 className="text-lg font-bold text-white mb-1">{def.title}</h4>
      <p className="text-xs text-gray-400 leading-relaxed min-h-10">{def.desc}</p>
    </div>
    <div className="flex gap-2 items-end">
      <div className="w-full">
        <TextChannelSelect channels={options} value={value || ''}
          onChange={(v) => { 
            const selected = Array.isArray(v) ? v[0] : v;
            onChange(selected || null);
          }} 
        />
      </div>
      <TooltipButton 
        isIconOnly
        icon={<Trash2 />}
        className="shrink-0 text-gray-500 hover:text-red-400 hover:bg-red-400/10 border border-white/5" 
        onClick={() => onChange(null)} 
        disabled={!value}
        tooltipText="Deletar Configuração"
      />
    </div>
  </div>
);

export default function ConfigGeneralPage() {
  const { guildId } = useParams() as { guildId: string };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [initialData, setInitialData] = useState<GlobalConfig | null>(null);
  const [formData, setFormData] = useState<GlobalConfig>({
    channels: { ...defaultChannels },
    profile: { botName: '', botBio: '', botAvatar: '', botBanner: '' }
  });

  const [guildChannels, setGuildChannels] = useState<DiscordChannel[]>([]);
  const [serverIcon, setServerIcon] = useState<string | null>(null);

  const [modalType, setModalType] = useState<'avatar' | 'banner' | null>(null);

  const hasChanges = useMemo(() => {
    if (!initialData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  useEffect(() => {
    async function loadData() {
      const res = await fetch(`/api/data/guild/config?guildId=${guildId}`);
      const result = await res.json();
      
      try {
        if (result.success) {
          const { avatar, banner, config, channels, serverIcon } = result.data;
          
          const fullConfig = {
            channels: {
              welcome: config?.welcomeCh || null,
              goodbye: config?.goodbyeCh || null,
              announcements: config?.announcementsCh || null,
              announcementsPreview: config?.announcementsPreviewCh || null,
              rules: config?.rulesCh || null,
              pointPanel: config?.pointPanelCh || null,
              pointOpen: config?.pointOpenCh || null,
              pointClose: config?.pointCloseCh || null,
            },
            profile: {
              botName: config?.botNickname || '',
              botBio: config?.botBio || '',
              botAvatar: avatar ?? config?.botAvatarUrl ?? '',
              botBanner: banner ?? config?.botBannerUrl ?? '',
            }
          };

          setFormData(fullConfig);
          setInitialData(JSON.parse(JSON.stringify(fullConfig)));
          setGuildChannels(channels || []);
          setServerIcon(serverIcon);
        }
      } catch (e) { 
        console.error('Ocorreu um erro ao carregar dados do servidor', e); 
        setError("Ocorreu um erro ao carregar dados do servidor."); 
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [guildId]);

  const updateChannel = (key: keyof ChannelsConfig, val: string | null) => {
    const finalVal = val === "" ? null : val;
    setFormData(prev => ({ ...prev, channels: { ...prev.channels, [key]: finalVal } }));
  };

  const updateProfile = (key: keyof BotProfileConfig, val: string) => {
    setFormData(prev => ({ ...prev, profile: { ...prev.profile, [key]: val } }));
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/data/guild/config?guildId=${guildId}`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Configurações salvas com sucesso!");
        setInitialData(formData);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.danger(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (initialData) setFormData(initialData);
  };

  if (loading) return (
    <LoadingBar text="Carregando configurações..." />
  );

  if (error) {
    return (
      <ErrorPage error={error} showDetails />
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <motion.div  className="container mx-auto py-12 max-w-7xl" >
        <div>
          
          <div className="flex items-center justify-center gap-4 mb-16 border-b border-white/5 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center justify-center">
                <Settings className="w-8 h-8 text-indigo-400 mr-2" />
                Configurações Gerais
              </h1>
              <p className="text-gray-400 text-sm">
                Configure o perfil do bot, canais, cargos e outras configurações.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {CHANNEL_CARDS.map((card) => (
              <ChannelCard 
                key={card.key}
                def={card}
                options={guildChannels}
                value={formData.channels[card.key]}
                onChange={(val) => updateChannel(card.key, val)}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {CHANNEL_TEST.map((card) => (
              <ChannelCard 
                key={card.key}
                def={card}
                options={guildChannels}
                value={formData.channels[card.key]}
                onChange={(val) => updateChannel(card.key, val)}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
            <div className="relative">

              <hr className="border-[#242424] border-[1.5px] mb-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs de Texto */}
                <div className="space-y-6">
                  <div className="bg-[#1a1a1a] p-4 rounded-md">
                    <Label title="Apelido" icon={FileText} />
                    <Input
                      onChange={(e) => updateProfile('botName', e.target.value)}
                      placeholder="Ex: Polícia Federal"
                      maxLength={25}
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-[#1a1a1a] p-4 rounded-md">
                    <Label title="Biografia" icon={FileText} />
                    <TextArea
                      onChange={(e) => updateProfile('botBio', e.target.value)}
                      placeholder="Descrição do bot..."
                      maxLength={190}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Inputs de Imagem */}
                <div className="space-y-6">
                  <div className="bg-[#1a1a1a] p-4 rounded-md">
                    <Label title="Avatar (URL)" icon={ImageIcon} />
                    <div className="flex gap-2 mt-2">
                      <Input
                        onChange={(e) => updateProfile('botAvatar', e.target.value)}
                        placeholder="https://..."
                      />
                      <UploadBtn onClick={() => setModalType('avatar')} />
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] p-4 rounded-md">
                    <Label title="Banner (URL)" icon={ImageIcon} />
                    <div className="flex gap-2 mt-2">
                      <Input
                        onChange={(e) => updateProfile('botBanner', e.target.value)}
                        placeholder="https://..."
                      />
                      <UploadBtn onClick={() => setModalType('banner')} />
                    </div>
                  </div>

                  <div className="w-full flex items-start gap-2 rounded-md border border-yellow-400/30
                    bg-yellow-400/5 p-3 text-sm text-yellow-200"
                  >
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <p>
                      O perfil do bot só pode ser atualizado a cada 2 minutos!
                    </p>
                  </div>

                </div>
              </div>

            </div>
                    

            
            <div className="flex justify-end font-sans">
              <BotProfilePreview
                name={formData.profile.botName || "Sentra"}
                tag="Polícia Federal#4559"
                mutualText="1 servidor mútuo"
                bio={formData.profile.botBio || "Powered by Sentra"}
                bannerUrl={isValidImageUrl(formData.profile.botBanner) ? formData.profile.botBanner : "https://i.imgur.com/UG7BLiF.png"}
                avatarUrl={isValidImageUrl(formData.profile.botAvatar) ? formData.profile.botAvatar : "https://i.imgur.com/EPVWoyx.png"}
                serverAvatarUrl={serverIcon || "https://i.imgur.com/UG7BLiF.png"}
                roles={[{ name: formData.profile.botName || "Bot", color: "#8a8f98" }]}
              />
            </div>
          </div>

          <div className="pt-10 pb-3 flex justify-center opacity-70 gap-4 select-none font-sans">
            <span className="text-xs text-zinc-400">Tecnologia & Inovação</span>
            <hr className="h-4 border-l border-gray-400/20" />
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Sentra" width={18} height={18} className="rounded-full opacity-90" />
              <span className="text-xs font-medium text-zinc-300 tracking-wide">Federal</span>
            </div>
          </div>

        </div>
      </motion.div>

      <SaveBar 
        isVisible={hasChanges}
        isSaving={saving}
        onSave={handleSave}
        onReset={handleReset}
      />

      <ModalImageUploader 
        isOpen={!!modalType} 
        onClose={() => setModalType(null)} 
        onChange={(url) => {
          if (modalType === 'avatar') updateProfile('botAvatar', url);
          if (modalType === 'banner') updateProfile('botBanner', url);
        }} 
      />
    </div>
  );
}

const Label = ({ title, icon: Icon }: { title: string, icon: LucideIcon }) => (
  <div className="flex justify-between items-center mb-1">
    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
      <Icon size={14}/> {title}
    </h3>
  </div>
);

const UploadBtn = ({ onClick }: { onClick: () => void }) => (
  <TooltipButton 
    icon={<Upload size={18} />} 
    tooltipText="Enviar Imagem" 
    onClick={onClick} 
    className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 h-10 px-3"
  />
);

function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    return /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(new URL(url).pathname);
  } catch { return false; }
}