import React, { useMemo } from 'react';
import { Expand, Shrink, Eye, EyeOff, Trash2 } from 'lucide-react';
import { BlockProps, SeparatorBlockType } from '@/types/editor';
import { BlockWrapper } from '../managers/BlockWrapper';

export const SeparatorBlock = ({ block, onUpdate, onRemove, parentId }: BlockProps) => {
  const separatorBlock = block as SeparatorBlockType;

  const actions = useMemo(() => [
    { 
      icon: separatorBlock.spacing === 'small' ? <Expand size={14} /> : <Shrink size={14} />, 
      onClick: () => onUpdate(block.id, { spacing: separatorBlock.spacing === 'small' ? 'large' : 'small' }, parentId), 
      tooltip: "Alternar Tamanho" 
    },
    { 
      icon: separatorBlock.hasDivider ? <Eye size={14} /> : <EyeOff size={14} />, 
      onClick: () => onUpdate(block.id, { hasDivider: !separatorBlock.hasDivider }, parentId), 
      tooltip: "Alternar Visibilidade" 
    },
    { 
      icon: <Trash2 size={14} />, 
      onClick: () => onRemove(block.id, parentId), 
      tooltip: "Deletar", 
      variant: 'danger' 
    }
  ], [separatorBlock, block.id, onUpdate, onRemove, parentId]);

  return (
    <BlockWrapper className="py-2 px-2 flex items-center justify-between gap-4 hover:bg-[#2B2D31]" actions={actions}>
      <div className={`w-full flex items-center ${separatorBlock.spacing === 'large' ? 'h-8' : 'h-4'}`}>
        {separatorBlock.hasDivider ? (
          <div className="w-full h-px bg-neutral-600/60" />
        ) : (
          <div className="w-full h-px border-t border-dashed border-zinc-800 opacity-30" />
        )}
      </div>
    </BlockWrapper>
  );
};