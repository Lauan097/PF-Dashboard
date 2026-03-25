'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { DiscordIcon } from '@/app/components/DiscordIcons';
import { normalizeText } from '@/utils/textUtils';

type SuggestionType = 'user' | 'role' | 'channel' | 'emoji' | 'date';
interface Suggestion {
  id: string;
  name: string;
  type: SuggestionType;
  avatar?: string;
  color?: string;
  subType?: number;
  animated?: boolean;
}

interface MentionInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onEnter?: () => void;
  serverData: {
    roles: Array<{ id: string; name: string; color: string }>;
    channels: Array<{ id: string; name: string; type: number }>;
    emojis: Array<{ id: string; name: string; url: string; animated?: boolean }>;
    members: Array<{ id: string; username: string; nickname: string; avatar: string }>;
  } | null;
  maxLength?: number;
}

const SuggestionIcon = ({ item }: { item: Suggestion }) => {
  if (item.type === 'user') {
    return item.avatar ? (
      <Image src={item.avatar} alt="" className="w-6 h-6 rounded-full" width={24} height={24} unoptimized />
    ) : (
      <div className="w-6 h-6 rounded-full bg-[#5865F2] flex items-center justify-center text-white">
         <DiscordIcon name="members" className="w-4 h-4" />
      </div>
    );
  }
  if (item.type === 'role') {
    return <div style={{ color: item.color }}><DiscordIcon name="roles" className="w-5 h-5" /></div>;
  }
  if (item.type === 'emoji') {
    return <Image src={`https://cdn.discordapp.com/emojis/${item.id}.${item.animated ? 'gif' : 'png'}`} alt="" className="w-6 h-6 object-contain" width={24} height={24} unoptimized />;
  }
  if (item.type === 'date') {
    return <DiscordIcon name="clock" className="w-5 h-5 text-gray-400" />;
  }
  
  const channelIconMap: Record<number, "text" | "voice" | "category" | "announcements" | "stageVoice"> = {
    0: "text", 2: "voice", 4: "category", 5: "announcements", 13: "stageVoice"
  };

  return (
    <div className="text-gray-400">
      <DiscordIcon name={channelIconMap[item.subType || 0] || "text"} className="w-5 h-5" />
    </div>
  );
};

export default function MentionInput({ className, value, onChange, onKeyDown, onEnter, serverData, maxLength, ...props }: MentionInputProps) {
  const [state, setState] = useState({ query: '', trigger: null as string | null, index: 0, show: false, baseTimestamp: 0 });
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: 'bottom', inputHeight: 0, inputWidth: 0 });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentLength = String(value || '').length;
  const isOverLimit = maxLength ? currentLength > maxLength : false;

  const autoResize = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    
    // Salva as posições de scroll para evitar o "pulo" da tela
    const scrollParents: { element: HTMLElement; scrollTop: number }[] = [];
    let current = el.parentElement;
    while (current) {
      scrollParents.push({ element: current, scrollTop: current.scrollTop });
      current = current.parentElement;
    }
    const winScroll = window.scrollY;

    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;

    // Restaura as posições de scroll
    scrollParents.forEach(({ element, scrollTop }) => {
      if (element.scrollTop !== scrollTop) {
        element.scrollTop = scrollTop;
      }
    });
    if (window.scrollY !== winScroll) {
      window.scrollTo(window.scrollX, winScroll);
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  const updateCoords = () => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const div = document.createElement('div');
    const style = window.getComputedStyle(input);
    Array.from(style).forEach(p => div.style.setProperty(p, style.getPropertyValue(p)));
    Object.assign(div.style, { position: 'absolute', visibility: 'hidden', whiteSpace: 'pre-wrap', top: '-9999px', left: '-9999px' });
    div.textContent = input.value.substring(0, input.selectionStart);
    const span = document.createElement('span');
    span.textContent = '|';
    div.appendChild(span);
    document.body.appendChild(div);
    const rect = input.getBoundingClientRect();
    const relativeTop = span.offsetTop - input.scrollTop;
    const placement = (window.innerHeight - (rect.top + relativeTop)) < 350 ? 'top' : 'bottom';
    setCoords({ left: span.offsetLeft - input.scrollLeft, top: relativeTop, placement, inputHeight: input.clientHeight, inputWidth: input.clientWidth });
    document.body.removeChild(div);
  };

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!serverData || !state.trigger) return [];
    const q = normalizeText(state.query);

    const filters: Record<string, () => Suggestion[]> = {
      '@': () => [
        ...serverData.members.filter(m => normalizeText(m.nickname || m.username).includes(q)).map(m => ({ id: m.id, name: m.nickname || m.username, type: 'user' as const, avatar: m.avatar })),
        ...serverData.roles.filter(r => normalizeText(r.name).includes(q)).map(r => ({ id: r.id, name: r.name, type: 'role' as const, color: r.color || '#96a6a8' }))
      ],
      '#': () => serverData.channels.filter(c => normalizeText(c.name).includes(q) && c.type !== 4).map(c => ({ id: c.id, name: c.name, type: 'channel' as const, subType: c.type })),
      ';': () => serverData.emojis.filter(e => normalizeText(e.name).includes(q)).map(e => ({ id: e.id, name: e.name, type: 'emoji' as const, avatar: e.url, animated: e.animated })),
      '\\': () => {
        const date = new Date(state.baseTimestamp * 1000);
        const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('pt-BR', options).format(date);

        const styles = [
          { id: 't', name: format({ hour: '2-digit', minute: '2-digit' }) },
          { id: 'T', name: format({ hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
          { id: 'd', name: format({ day: '2-digit', month: '2-digit', year: 'numeric' }) },
          { id: 'D', name: format({ day: 'numeric', month: 'long', year: 'numeric' }) },
          { id: 'f', name: format({ day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
          { id: 'F', name: format({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
          { id: 'R', name: 'Tempo Relativo' }
        ];
        return styles.map(s => ({ id: s.id, name: s.name, type: 'date' as const }));
      }
    };

    return (filters[state.trigger]?.() || []).slice(0, 10);
  }, [serverData, state.trigger, state.query, state.baseTimestamp]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const sel = e.target.selectionStart;
    const match = val.slice(0, sel).match(/([@#;\\][\w\-\u00C0-\u017F]*)$/);

    if (match) {
      const trigger = match[0][0];
      setState(s => ({ 
        ...s, trigger, query: match[0].slice(1), index: 0, show: true,
        baseTimestamp: trigger === '\\' ? Math.floor(Date.now() / 1000) : s.baseTimestamp 
      }));
      updateCoords();
    } else {
      setState(s => ({ ...s, show: false, trigger: null }));
    }
    onChange?.(e);
    requestAnimationFrame(autoResize);
  };

  const selectItem = (item: Suggestion) => {
    if (!inputRef.current || !state.trigger) return;
    const val = String(value || '');
    const cursor = inputRef.current.selectionStart;
    const before = val.slice(0, cursor);
    const triggerIdx = before.lastIndexOf(state.trigger);

    const insert = item.type === 'date' ? `<t:${state.baseTimestamp}:${item.id}> ` : formatMention(item);
    const newVal = before.slice(0, triggerIdx) + insert + val.slice(cursor);
    
    onChange?.({ target: { value: newVal }, currentTarget: { value: newVal } } as React.ChangeEvent<HTMLTextAreaElement>);
    requestAnimationFrame(autoResize);
    setState(s => ({ ...s, show: false, trigger: null }));
    
    setTimeout(() => {
      const pos = triggerIdx + insert.length;
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (state.show && suggestions.length) {
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        setState(s => ({ ...s, index: (s.index + (e.key === 'ArrowDown' ? 1 : -1) + suggestions.length) % suggestions.length }));
        return;
      }
      if (['Enter', 'Tab'].includes(e.key)) {
        e.preventDefault();
        selectItem(suggestions[state.index]);
        return;
      }
      if (e.key === 'Escape') return setState(s => ({ ...s, show: false }));
    }
    if (e.key === 'Enter' && !e.shiftKey && onEnter && !state.show) {
      e.preventDefault();
      onEnter();
    }
    onKeyDown?.(e);
  };

  return (
    <div className="relative w-full">
      <AnimatePresence>
        {state.show && suggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: coords.placement === 'top' ? 10 : -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.1 }}
            style={{ 
              top: coords.placement === 'bottom' ? coords.top + 24 : 'auto', 
              bottom: coords.placement === 'top' ? (coords.inputHeight || 0) - coords.top : 'auto', 
              left: Math.min(coords.left, (coords.inputWidth || 500) - 320) 
            }}
            className="absolute w-80 bg-[#2b2d31] rounded-md shadow-lg border border-[#1e1f22] overflow-hidden z-50 flex flex-col"
          >
            <div className="bg-[#1e1f22] px-3 py-2 text-xs font-bold text-gray-400 uppercase">
              {state.trigger === '@' ? 'Membros & Cargos' : state.trigger === '#' ? 'Canais' : state.trigger === ';' ? 'Emoji' : 'Menção de Data'}
            </div>
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {suggestions.map((item, idx) => (
                <div key={item.id} onClick={() => selectItem(item)} onMouseEnter={() => setState(s => ({ ...s, index: idx }))}
                  className={`flex items-center px-3 py-2 cursor-pointer ${idx === state.index ? 'bg-[#404249] text-white' : 'text-gray-300 hover:bg-[#35373c]'}`}>
                  <div className="mr-3 shrink-0 flex items-center justify-center w-6 h-6"><SuggestionIcon item={item} /></div>
                  <span className="font-medium truncate" style={{ color: item.type === 'role' ? item.color : 'inherit' }}>
                     {item.type === 'role' && '@'}{item.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <textarea ref={inputRef} value={value} onChange={handleInput} onKeyDown={handleKeyDown}
        className={`w-full bg-[#383a40] text-gray-100 placeholder-gray-400 p-3 rounded-md focus:outline-none resize-none wrap-break-word z-40 ${className}`}
        // className="overflow-y-auto scroll-hidden"
        // style={{ maxHeight: '300px' }}
        {...props}
      />
      {maxLength && (
        <div className={`absolute bottom-1 right-2 text-[10px] pointer-events-none ${isOverLimit ? 'text-red-400' : 'text-zinc-600'}`}>
          {currentLength}/{maxLength}
        </div>
      )}
    </div>
  );
}

function formatMention(item: any) {
  switch (item.type) {
    case "user": return `<@${item.id}> `;
    case "role": return `<@&${item.id}> `;
    case "channel": return `<#${item.id}> `;
    case "emoji": return `<${item.animated ? "a" : ""}:${item.name}:${item.id}> `;
    default: return "";
  }
}