'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  Type, Image as ImageIcon, SeparatorHorizontal, Box
} from 'lucide-react';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, 
  useSensor, useSensors, DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useParams } from 'next/navigation';
import { motion } from "framer-motion";

import ToolButton from './components/ToolButton';
import ErrorPage from '@/app/components/ErrorPage';
import { ModalToSend } from './components/ModalToSend';

import { EditorBlock, BlockType } from '@/types/editor';
import { SortableBlockItem } from './managers/SortableBlockItem';
import { Skeleton } from '@/components/skeleton';
import { VariantsPageTransition } from "@/utils/variants";

const createDefaultBlocks = (): EditorBlock[] => ([
  { id: '1', type: 'text', content: ['Bem-vindo ao Editor V2.'], thumbnail: null }
]);

export default function DiscordV2Editor() {
  const [serverData, setServerData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [hasLoadedBlocks, setHasLoadedBlocks] = useState(false);
  const [validation, setValidation] = useState({ componentCount: 0, totalChars: 0, errors: [] as string[] });
  
  const params = useParams();
  const guildId = params.guildId as string;
  const storageKey = `editor-v2-blocks:${guildId}`;

  const [blocks, setBlocks] = useState<EditorBlock[]>(() => createDefaultBlocks());

  const sensors = useSensors(
    useSensor(PointerSensor), 
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/data/guild?guildId=${guildId}&type=all`).then(r => r.json());

        if (res.success) setTimeout(() => setServerData(res.data), 800);
      } catch (e) { 
        console.error(e); 
        setError("Ocorreu um erro ao carregar dados do servidor."); 
      } finally { 
        setLoading(false); 
      }
    };
    if (guildId) fetchData();
  }, [guildId]);

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!guildId) return;
    setLoading(true);
    setHasLoadedBlocks(false);
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      setBlocks(createDefaultBlocks());
      setHasLoadedBlocks(true);
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      setBlocks(Array.isArray(parsed) ? parsed as EditorBlock[] : createDefaultBlocks());
    } catch {
      setBlocks(createDefaultBlocks());
    }
    setHasLoadedBlocks(true);
    setLoading(false);
  }, [guildId, storageKey]);

  useEffect(() => {
    if (!guildId || !hasLoadedBlocks) return;
    localStorage.setItem(storageKey, JSON.stringify(blocks));
  }, [blocks, guildId, storageKey, hasLoadedBlocks]);

  const addBlock = useCallback((type: BlockType, parentId?: string) => {
    const newBlock: any = { id: Math.random().toString(36).substr(2, 9), type };
    if (type === 'text') { newBlock.content = ['']; newBlock.thumbnail = null; }
    else if (type === 'image') { newBlock.url = ''; }
    else if (type === 'separator') { newBlock.spacing = 'small'; newBlock.hasDivider = true; }
    else { newBlock.children = []; newBlock.accentColor = '#5865F2'; }

    setBlocks(prev => {
      if (!parentId) return [...prev, newBlock];
      return prev.map(b => b.id === parentId && b.type === 'container' ? { ...b, children: [...b.children, newBlock] } : b);
    });
  }, []);

  const updateBlock = useCallback((id: string, data: Partial<EditorBlock>, parentId?: string) => {
    setBlocks(prev => {
      if (!parentId) return prev.map(b => b.id === id ? { ...b, ...data } : b) as EditorBlock[];
      return prev.map(b => b.id === parentId && b.type === 'container' ? 
        { ...b, children: b.children.map(c => c.id === id ? { ...c, ...data } : c) as any } : b);
    });
  }, []);

  const removeBlock = useCallback((id: string, parentId?: string) => {
    setBlocks(prev => {
      if (!parentId) return prev.filter(b => b.id !== id);
      return prev.map(b => b.id === parentId && b.type === 'container' ? 
        { ...b, children: b.children.filter(c => c.id !== id) } : b);
    });
  }, []);

  const validateBlocks = useCallback((blocks: EditorBlock[]) => {
    let count = 0;
    let chars = 0;
    const errors: string[] = [];

    const countBlock = (block: EditorBlock): void => {
      if (block.type === 'text') {
        if (block.thumbnail) {
          count += block.content.length + 1;
          block.content.forEach((text, idx) => {
            chars += text.length;
            if (!text.trim()) errors.push(`Campo de texto vazio (ID: ${block.id}, campo ${idx + 1})`);
          });
        } else {
          count++;
          const totalText = block.content.join('');
          chars += totalText.length;
          if (!totalText.trim()) errors.push(`Campo de texto vazio (ID: ${block.id})`);
        }
      } else if (block.type === 'image') {
        count++;
        if (!block.url) errors.push(`Imagem sem URL (ID: ${block.id})`);
      } else if (block.type === 'separator') {
        count++;
      } else if (block.type === 'container') {
        count++;
        if (block.children.length === 0) errors.push(`Container vazio (ID: ${block.id})`);
        block.children.forEach(countBlock);
      }
    };

    blocks.forEach(countBlock);

    if (count > 40) errors.push(`Limite de componentes excedido: ${count}/40`);
    if (chars > 4000) errors.push(`Limite de caracteres excedido: ${chars}/4000`);

    setValidation({ componentCount: count, totalChars: chars, errors });
  }, []);

  useEffect(() => {
    validateBlocks(blocks);
  }, [blocks, validateBlocks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBlocks(items => {
      const findLoc = (id: string, list: EditorBlock[]) => {
        const rootIdx = list.findIndex(x => x.id === id);
        if (rootIdx !== -1) return { list, idx: rootIdx, parent: null };
        for (const b of list) {
          if (b.type === 'container') {
            const childIdx = b.children.findIndex(c => c.id === id);
            if (childIdx !== -1) return { list: b.children, idx: childIdx, parent: b.id };
          }
        }
        return null;
      };

      const activeLoc = findLoc(active.id as string, items);
      const overLoc = findLoc(over.id as string, items);

      if (!activeLoc || !overLoc || activeLoc.parent !== overLoc.parent) return items;
      if (!activeLoc.parent) return arrayMove(items, activeLoc.idx, overLoc.idx);
      
      return items.map(b => b.id === activeLoc.parent && b.type === 'container'
        ? { ...b, children: arrayMove(b.children, activeLoc.idx, overLoc.idx) }
        : b
      );
    });
  }, []);



  if (error) {
    return (
      <ErrorPage error={error} showDetails />
    );
  }

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <motion.div
      key={guildId}
      variants={VariantsPageTransition}
      initial="hidden"
      animate="show"
      exit="exit" 
      className="min-h-screen text-gray-100 font-sans flex overflow-hidden bg-[#313338] rounded-lg"
    >
      <div className="flex-1 sm:p-8 flex justify-center overflow-hidden">
        <div className="w-full max-w-4xl flex flex-col min-h-full">
          <div className="flex-1 overflow-y-auto mt-10 pr-2">
            <div className="flex items-start mb-2 select-none opacity-90 pl-4">
              {!isMobile && (
                serverData?.botAvatar ? (
                  <Image src={serverData.botAvatar} alt="Avatar do Bot" width={80} height={80} className="w-10 h-10 rounded-full mr-4" />
                ) : (
                  <Skeleton className="w-10 h-10 rounded-full mr-4" />
                )
              )}
              <div className="w-full">
                <div className="flex items-center">
                  {isMobile && (
                    serverData?.botAvatar ? (
                      <div className="w-8 h-8 flex items-center justify-center mr-2 text-sm font-bold shrink-0">
                        <Image src={serverData?.botAvatar || '/logo.png'} alt="Logo do Bot" width={80} height={80} className="rounded-full" />
                      </div>
                    ) : (
                      <Skeleton className="w-8 h-8 rounded-full mr-2" />
                    )
                  )}
                  <span className="font-medium text-white mr-1 hover:underline cursor-pointer">
                    {serverData?.botName ? (
                      serverData?.botName
                    ) : (
                      <Skeleton className="w-48 h-4 rounded" />
                    )}
                  </span>
                  <span className="bg-[#5865F2] text-[10px] h-4 flex items-center text-white px-1 font-bold rounded-sm mr-2">APP</span>
                  <span className="text-xs text-gray-400">Hoje às {currentTime || '--:--'}</span>
                </div>
                <div className="mt-1 space-y-1">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                      {blocks.map(block => (
                        <SortableBlockItem 
                          key={block.id} 
                          block={block} 
                          onUpdate={updateBlock} 
                          onRemove={removeBlock} 
                          onAddChild={addBlock} 
                          serverData={serverData} 
                          sensors={sensors} 
                          handleDragEnd={handleDragEnd} 
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-6 pb-3 select-none flex items-center justify-center gap-4 opacity-70">
            <span className="text-xs text-zinc-400 whitespace-nowrap font-sans">Tecnologia & Inovação</span>
            <hr className="h-4 rounded-t-3xl border-l border-r border-t border-gray-400/20" />
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Logo Polícia Federal" width={18} height={18} className="rounded-full opacity-90" />
              <span className="text-xs font-medium text-zinc-300 tracking-wide">Federal</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-16 bg-[#2B2D31] border-l border-[#1F2023] flex flex-col items-center py-6 gap-4 z-20 shadow-xl">
        <ModalToSend
          blocks={blocks}
          serverData={serverData}
          guildId={guildId}
          validation={validation}
          currentTime={currentTime}
        />

        <div className="w-8 h-px bg-zinc-700 my-2"></div>
        <ToolButton icon={Type} label="Texto" onClick={() => addBlock('text')} />
        <ToolButton icon={ImageIcon} label="Imagem" onClick={() => addBlock('image')} />
        <ToolButton icon={SeparatorHorizontal} label="Separador" onClick={() => addBlock('separator')} />
        <div className="w-8 h-px bg-zinc-700 my-2"></div>
        <ToolButton icon={Box} label="Container" onClick={() => addBlock('container')} active />
        
        <div className="mt-auto pt-4 px-2 text-[10px] text-center space-y-1">
          <div className={`${validation.componentCount > 40 ? 'text-red-400' : 'text-zinc-500'}`}>
            {validation.componentCount}/40
          </div>
          <div className={`${validation.totalChars > 4000 ? 'text-red-400' : 'text-zinc-500'}`}>
            {validation.totalChars}/4000
          </div>
        </div>
      </div>
    </motion.div>
  );
}