'use client';

import React from 'react';
import Image from 'next/image';

type ServerDataForRenderer = {
  roles?: Array<{ id: string; name: string; color: string }>;
  channels?: Array<{ id: string; name: string; type: number }>;
  members?: Array<{ id: string; username: string; nickname: string; avatar: string }>;
  emojis?: Array<{ id: string; name: string; url: string; animated?: boolean }>;
} | null;

interface DiscordTextProps {
  text: string;
  serverData: ServerDataForRenderer;
  className?: string;
}

/** Stateful key generator scoped per-render to avoid React key conflicts */
class KeyGen {
  private n = 0;
  next() { return `dtk-${this.n++}`; }
}

function formatTimestamp(ts: number, fmt: string): string {
  const date = new Date(ts * 1000);
  const opts: Record<string, Intl.DateTimeFormatOptions> = {
    t: { hour: '2-digit', minute: '2-digit' },
    T: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
    d: { day: '2-digit', month: '2-digit', year: 'numeric' },
    D: { day: 'numeric', month: 'long', year: 'numeric' },
    f: { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' },
    F: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  };
  if (fmt === 'R') {
    const diff = (date.getTime() - Date.now()) / 1000;
    const abs = Math.abs(diff);
    const future = diff > 0;
    if (abs < 60) return `${future ? 'em' : 'há'} ${Math.round(abs)} segundo${Math.round(abs) !== 1 ? 's' : ''}`;
    if (abs < 3600) return `${future ? 'em' : 'há'} ${Math.floor(abs / 60)} minuto${Math.floor(abs / 60) !== 1 ? 's' : ''}`;
    if (abs < 86400) return `${future ? 'em' : 'há'} ${Math.floor(abs / 3600)} hora${Math.floor(abs / 3600) !== 1 ? 's' : ''}`;
    return `${future ? 'em' : 'há'} ${Math.floor(abs / 86400)} dia${Math.floor(abs / 86400) !== 1 ? 's' : ''}`;
  }
  return new Intl.DateTimeFormat('pt-BR', opts[fmt] ?? opts['f']).format(date);
}

/** Renders inline Discord markdown on a plain-text segment (no mentions/code inside) */
function renderMarkdown(text: string, kg: KeyGen): React.ReactNode[] {
  if (!text) return [];

  type Pattern = [RegExp, (inner: string) => React.ReactNode];
  const patterns: Pattern[] = [
    [/\|\|(.+?)\|\|/, (s) => <span key={kg.next()} className="bg-zinc-700 text-zinc-700 hover:text-zinc-200 hover:bg-zinc-600 rounded-sm px-0.5 cursor-pointer select-none transition-colors duration-150">{renderMarkdown(s, kg)}</span>],
    [/\*\*\*(.+?)\*\*\*/, (s) => <strong key={kg.next()} className="font-bold"><em>{renderMarkdown(s, kg)}</em></strong>],
    [/\*\*(.+?)\*\*/, (s) => <strong key={kg.next()} className="font-bold">{renderMarkdown(s, kg)}</strong>],
    [/__(.+?)__/, (s) => <u key={kg.next()}>{renderMarkdown(s, kg)}</u>],
    [/\*(.+?)\*/, (s) => <em key={kg.next()}>{renderMarkdown(s, kg)}</em>],
    [/~~(.+?)~~/, (s) => <s key={kg.next()}>{renderMarkdown(s, kg)}</s>],
    [/_([^_\s][^_]*[^_\s]?)_/, (s) => <em key={kg.next()}>{renderMarkdown(s, kg)}</em>],
    
  ];

  // Find the earliest-matching pattern
  let best: { idx: number; end: number; node: React.ReactNode } | null = null;
  for (const [re, render] of patterns) {
    const m = new RegExp(re.source, 's').exec(text);
    if (m && (best === null || m.index < best.idx)) {
      best = { idx: m.index, end: m.index + m[0].length, node: render(m[1]) };
    }
  }

  if (!best) return [text];

  const result: React.ReactNode[] = [];
  if (best.idx > 0) result.push(text.slice(0, best.idx));
  result.push(best.node);
  result.push(...renderMarkdown(text.slice(best.end), kg));
  return result;
}

// Regex patterns (compiled once, reset lastIndex when reused)
const INLINE_PATTERN = /`([^`\n]+?)`|<@!?(\d+)>|<@&(\d+)>|<#(\d+)>|<(a)?:([^:>\s]+):(\d+)>|<t:(\d+)(?::([tTdDfFR]))?>|\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
const CODE_BLOCK_PATTERN = /```(?:[\w-]+\n)?([\s\S]*?)```/g;

/** Renders a single line with inline code, mentions, emojis, timestamps, and markdown */
function renderInline(text: string, serverData: ServerDataForRenderer, kg: KeyGen): React.ReactNode[] {
  if (!text) return [];

  const result: React.ReactNode[] = [];
  let lastIdx = 0;
  const re = new RegExp(INLINE_PATTERN.source, 'g');
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) {
      result.push(...renderMarkdown(text.slice(lastIdx, m.index), kg));
    }

    if (m[1] !== undefined) {
      // Inline code
      result.push(
        <code key={kg.next()} className="bg-[#111214] text-[#d4d4d4] px-1 py-0.5 rounded text-[0.875em] font-mono">
          {m[1]}
        </code>
      );
    } else if (m[2] !== undefined) {
      // User mention <@id>
      const user = serverData?.members?.find(u => u.id === m![2]);
      result.push(
        <span key={kg.next()} className="bg-[#5865F2]/20 text-[#c9cdfb] rounded px-0.5 hover:bg-[#5865F2]/40 cursor-pointer transition-colors duration-100">
          @{user ? (user.nickname || user.username) : 'Usuário'}
        </span>
      );
    } else if (m[3] !== undefined) {
      // Role mention <@&id>
      const role = serverData?.roles?.find(r => r.id === m![3]);
      const color = role?.color && role.color !== '#000000' ? role.color : '#9ca3af';
      result.push(
        <span key={kg.next()} style={{ color, backgroundColor: color + '30' }} className="rounded px-0.5 cursor-pointer transition-colors duration-100">
          @{role?.name || 'Cargo'}
        </span>
      );
    } else if (m[4] !== undefined) {
      // Channel mention <#id>
      const ch = serverData?.channels?.find(c => c.id === m![4]);
      result.push(
        <span key={kg.next()} className="bg-[#5865F2]/20 text-[#c9cdfb] rounded px-0.5 hover:bg-[#5865F2]/40 cursor-pointer transition-colors duration-100">
          #{ch?.name || 'canal'}
        </span>
      );
    } else if (m[7] !== undefined) {
      // Custom emoji <:name:id> or <a:name:id>
      const animated = !!m[5];
      const name = m[6];
      const id = m[7];
      result.push(
        <Image
          key={kg.next()}
          src={`https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'webp'}?size=32`}
          alt={`:${name}:`}
          width={20}
          height={20}
          className="inline-block w-[1.375em] h-[1.375em] object-contain align-middle mx-0.5"
          unoptimized
        />
      );
    } else if (m[8] !== undefined) {
      // Timestamp <t:unix:format>
      result.push(
        <span key={kg.next()} className="bg-zinc-700/60 text-zinc-300 rounded px-1 text-[0.9em] whitespace-nowrap">
          {formatTimestamp(parseInt(m[8]), m[9] || 'f')}
        </span>
      );
    } else if (m[10] !== undefined && m[11] !== undefined) {
      // Markdown link [text](url)
      result.push(
        <a
          key={kg.next()}
          href={m[11]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#296aa0] hover:underline cursor-pointer"
        >
          {m[10]}
        </a>
      );
    }

    lastIdx = re.lastIndex;
  }

  if (lastIdx < text.length) {
    result.push(...renderMarkdown(text.slice(lastIdx), kg));
  }

  return result;
}

function isListLine(line: string) {
  return line.startsWith('- ') || line.startsWith('* ');
}

/** Splits text into lines and handles blockquotes and lists */
function renderLines(text: string, serverData: ServerDataForRenderer, kg: KeyGen): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  const lines = text.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (isListLine(line)) {
      // Collect consecutive list items into a <ul>
      const items: string[] = [];
      while (i < lines.length && isListLine(lines[i])) {
        items.push(lines[i].slice(2));
        i++;
      }
      const listKey = kg.next();
      result.push(
        <ul key={listKey} className="list-disc pl-5 my-0.5 space-y-0.5">
          {items.map(item => (
            <li key={kg.next()} className="text-[#dbdee1] marker:text-zinc-400">
              {renderInline(item, serverData, kg)}
            </li>
          ))}
        </ul>
      );
    } else if (line.startsWith('> ') || line === '>') {
      const content = line.startsWith('> ') ? line.slice(2) : '';
      result.push(
        <div key={kg.next()} className="border-l-4 border-zinc-500 pl-3 my-0.5 text-zinc-300">
          {renderInline(content, serverData, kg)}
        </div>
      );
      i++;
    } else if (line.startsWith('### ')) {
      result.push(
        <div key={kg.next()} className="text-base font-bold text-[#f2f3f5] mt-1">
          {renderInline(line.slice(4), serverData, kg)}
        </div>
      );
      i++;
    } else if (line.startsWith('## ')) {
      result.push(
        <div key={kg.next()} className="text-xl font-bold text-[#f2f3f5] mt-1">
          {renderInline(line.slice(3), serverData, kg)}
        </div>
      );
      i++;
    } else if (line.startsWith('# ')) {
      result.push(
        <div key={kg.next()} className="text-2xl font-bold text-[#f2f3f5] mt-1">
          {renderInline(line.slice(2), serverData, kg)}
        </div>
      );
      i++;
    } else if (line.startsWith('-# ')) {
      result.push(
        <div key={kg.next()} className="text-[9px] text-gray-400">
          {renderInline(line.slice(3), serverData, kg)}
        </div>
      );
      i++;
    } else if (line === '') {
      result.push(<div key={kg.next()} className="h-2" />);
      i++;
    } else {
      result.push(<div key={kg.next()}>{renderInline(line, serverData, kg)}</div>);
      i++;
    }
  }

  return result;
}

/** Main component: renders Discord-formatted text with markdown, mentions, emojis, and timestamps */
export function DiscordTextRenderer({ text, serverData, className }: DiscordTextProps) {
  const kg = new KeyGen();
  const nodes: React.ReactNode[] = [];

  const re = new RegExp(CODE_BLOCK_PATTERN.source, 'g');
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) {
      nodes.push(...renderLines(text.slice(lastIdx, m.index), serverData, kg));
    }
    nodes.push(
      <pre key={kg.next()} className="bg-[#1e1f22] rounded-md p-3 my-1 text-sm font-mono text-[#d4d4d4] overflow-x-auto whitespace-pre-wrap border border-zinc-700/30">
        <code>{m[1]}</code>
      </pre>
    );
    lastIdx = re.lastIndex;
  }

  if (lastIdx < text.length) {
    nodes.push(...renderLines(text.slice(lastIdx), serverData, kg));
  }

  return (
    <span className={`leading-snug wrap-break-word ${className ?? ''}`}>
      {nodes}
    </span>
  );
}
