'use client';

import { useCallback, useEffect, useState } from 'react';
import { Modal } from '@heroui/react';
import { toast } from 'sonner';
import { Send, Eye, Megaphone, SendHorizontal, MessageSquareText, AlertCircle, CheckCircle2 } from 'lucide-react';

import { TooltipButton } from '@/app/components/TooltipButton';
import { TextChannelSelect } from '@/app/components/TextChannelSelect';
import { DiscordPreviewMessage } from './DiscordPreviewMessage';
import { EditorBlock } from '@/types/editor';

import { motion } from 'framer-motion';

interface ModalToSendProps {
  blocks: EditorBlock[];
  serverData: any;
  guildId: string;
  validation: { componentCount: number; totalChars: number; errors: string[] };
  currentTime: string;
}

export function ModalToSend({ blocks, serverData, guildId, validation, currentTime }: ModalToSendProps) {
  const [channelSend, setChannelSend] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = useCallback(async (channelId?: string) => {
    const target = channelId || channelSend;
    if (!target || !guildId || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/data/guild/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId, channelId: target, blocks }),
      });

      if (!res.ok) throw new Error('Resposta inválida do servidor');
      toast.success('Mensagem enviada com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar mensagem.');
    } finally {
      setIsSending(false);
    }
  }, [channelSend, guildId, isSending, blocks]);

  // Keyboard shortcuts — always active since this component is always mounted
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      if (e.key === '2' && validation.errors.length === 0 && serverData?.serverConfig?.announcementsCh) {
        e.preventDefault();
        handleSendMessage(serverData.serverConfig.announcementsCh);
      } else if (e.key === '1' && validation.errors.length === 0 && serverData?.serverConfig?.announcementsPreviewCh) {
        e.preventDefault();
        handleSendMessage(serverData.serverConfig.announcementsPreviewCh);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [validation.errors, serverData, handleSendMessage]);

  const hasErrors = validation.errors.length > 0;
  const channels = (serverData?.channels || []).map((c: any) => ({ id: c.id, name: c.name, type: c.type ?? 0 }));

  return (
    <motion.div>
      <Modal>
        <Modal.Trigger>
          <div>
            <TooltipButton
              className="bg-neutral-900/40 hover:bg-white/5 cursor-pointer p-2 w-10"
              icon={<Send />}
              tooltipText="Enviar"
              tooltipSide="left"
            />
          </div>
        </Modal.Trigger>

        <Modal.Backdrop>
          <Modal.Container size="cover">
            <Modal.Dialog className="flex flex-col h-full bg-[#313338] text-gray-100 outline-none">

              <Modal.Header className="flex items-center justify-between px-6 py-4 border-b border-zinc-700/40 shrink-0">
                <div className="flex items-center gap-2 font-semibold text-base">
                  <MessageSquareText size={18} className="text-[#5865F2]" />
                  <span>Enviar Mensagem</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md ${hasErrors ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {hasErrors ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                    <span>{validation.componentCount}/40 · {validation.totalChars}/4000</span>
                  </div>
                  <Modal.CloseTrigger className="text-zinc-400 hover:text-white transition-colors" />
                </div>
              </Modal.Header>

              <div className="flex flex-1 overflow-hidden">

                <div className="flex-1 overflow-y-auto bg-[#313338] py-6">
                  <div className="max-w-3xl mx-auto w-full">
                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-4 mb-4 select-none">
                      Prévia da Mensagem
                    </p>

                    {/* Fake Discord channel header 
                    <div className="px-4 mb-2 flex items-center gap-2 select-none">
                      <div className="w-4 h-4 text-zinc-400">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                          <path d="M5.88 2.25a.75.75 0 0 1 .75.75v.5h11.25v-.5a.75.75 0 0 1 1.5 0v.5H20a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h.63v-.5a.75.75 0 0 1 .75-.75Z"/>
                        </svg>
                      </div>
                      <span className="text-zinc-400 text-sm font-medium">anúncios-preview</span>
                    </div>
                    */}

                    <div className="px-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-zinc-700/50" />
                        <span className="text-[11px] text-zinc-500 select-none whitespace-nowrap">Hoje</span>
                        <div className="flex-1 h-px bg-zinc-700/50" />
                      </div>
                    </div>

                    {/* The actual message preview */}
                    <DiscordPreviewMessage
                      blocks={blocks}
                      serverData={serverData}
                      currentTime={currentTime}
                    />
                  </div>
                </div>

                {/* Right — Send controls */}
                <div className="w-72 shrink-0 bg-[#2B2D31] border-l rounded-3xl border-zinc-700/30 flex flex-col overflow-y-auto">
                  <div className="p-5 space-y-5">

                    {/* Quick send */}
                    <div>
                      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3 select-none">
                        Envio Rápido
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <TooltipButton
                          disabled={hasErrors || !serverData?.serverConfig?.announcementsPreviewCh}
                          className="bg-zinc-700/50 hover:bg-zinc-600 cursor-pointer text-xs w-full"
                          onClick={() => handleSendMessage(serverData?.serverConfig?.announcementsPreviewCh)}
                          tooltipText="Atalho"
                          kdbText="Alt + 1"
                          icon={<Eye size={16} />}
                          text="Prévia"
                        />
                        <TooltipButton
                          disabled={hasErrors || !serverData?.serverConfig?.announcementsCh}
                          className="bg-zinc-700/50 hover:bg-zinc-600 cursor-pointer text-xs w-full"
                          onClick={() => handleSendMessage(serverData?.serverConfig?.announcementsCh)}
                          tooltipText="Atalho"
                          kdbText="Alt + 2"
                          icon={<Megaphone size={16} />}
                          text="Oficial"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-zinc-700/40" />
                      <span className="text-[10px] text-zinc-600 select-none">ou</span>
                      <div className="flex-1 h-px bg-zinc-700/40" />
                    </div>

                    {/* Custom channel */}
                    <div>
                      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3 select-none">
                        Canal Personalizado
                      </p>
                      <div className="space-y-2">
                        <TextChannelSelect
                          channels={channels}
                          value={channelSend}
                          onChange={(v: any) => setChannelSend(v)}
                          placeholder="Selecione um canal..."
                          className="w-full"
                        />
                        <button
                          disabled={hasErrors || !channelSend || isSending}
                          onClick={() => handleSendMessage()}
                          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-colors duration-150
                            bg-[#5865F2] hover:bg-[#4752C4] text-white
                            disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-zinc-700"
                        >
                          <SendHorizontal size={14} />
                          {isSending ? 'Enviando…' : 'Enviar'}
                        </button>
                      </div>
                    </div>

                    {/* Validation errors */}
                    {hasErrors && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 space-y-1">
                        <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-2">Erros</p>
                        {validation.errors.map((err, i) => (
                          <p key={i} className="text-xs text-red-400 flex items-start gap-1.5">
                            <AlertCircle size={11} className="mt-0.5 shrink-0" />
                            {err}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Component count details */}
                    <div className="bg-zinc-800/40 rounded-md p-3 space-y-1.5">
                      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2 select-none">Estatísticas</p>
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>Componentes</span>
                        <span className={validation.componentCount > 40 ? 'text-red-400 font-bold' : 'text-zinc-300'}>
                          {validation.componentCount} / 40
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>Caracteres</span>
                        <span className={validation.totalChars > 4000 ? 'text-red-400 font-bold' : 'text-zinc-300'}>
                          {validation.totalChars} / 4000
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </motion.div>
  );
}
