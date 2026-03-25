import React, { useState, useEffect, useMemo } from 'react';
import { Type, SeparatorHorizontal, Image as ImageIcon, Trash2 } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';
import { BlockProps, ContainerBlockType, EditorBlock } from '@/types/editor';
import { BlockWrapper } from '../managers/BlockWrapper';
import ColorPicker from '../components/ColorPicker';
import { SortableBlockItem } from '../managers/SortableBlockItem';

export const ContainerBlock = ({ block, onUpdate, onRemove, onAddChild, parentId, sensors, handleDragEnd, serverData }: BlockProps) => {
  const containerBlock = block as ContainerBlockType;
  const [showColorPicker, setShowColorPicker] = useState(false);
  const isEmpty = containerBlock.children.length === 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showColorPicker && !target.closest('.color-picker-container') && !target.closest('[data-color-button]')) {
        setShowColorPicker(false);
      }
    };
    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorPicker]);

  const actions = useMemo(() => [
    { 
      icon: <div className="w-3 h-3 rounded border border-gray-400" style={{ backgroundColor: containerBlock.accentColor }} />, 
      onClick: () => setShowColorPicker(!showColorPicker), 
      tooltip: "Cor", 
      'data-color-button': true 
    },
    { icon: <Type size={12} />, onClick: () => onAddChild!('text', block.id), tooltip: "Add Texto" },
    { icon: <SeparatorHorizontal size={12} />, onClick: () => onAddChild!('separator', block.id), tooltip: "Add Separador" },
    { icon: <ImageIcon size={12} />, onClick: () => onAddChild!('image', block.id), tooltip: "Add Imagem" },
    { icon: <Trash2 size={12} />, onClick: () => onRemove(block.id, parentId), tooltip: "Deletar", variant: 'danger' }
  ], [containerBlock.accentColor, block.id, showColorPicker, onAddChild, onRemove, parentId]);

  return (
    <BlockWrapper 
      className={`p-3 my-2 bg-[#2B2D31] hover:bg-[#2B2D31] rounded-lg border-l-4 ${isEmpty ? 'border-2 border-l-red-500!' : ''}`} 
      style={{ borderLeftColor: isEmpty ? undefined : containerBlock.accentColor }} 
      actions={actions}
    >
      <div className="flex justify-between items-center mb-2.5"></div>
      <div className="space-y-1 min-h-10 rounded p-1">
        {isEmpty && <div className="text-center text-red-400 text-xs py-2">Container Vazio - Adicione componentes</div>}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd!}>
          <SortableContext items={containerBlock.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {containerBlock.children.map((child) => (
              <SortableBlockItem 
                key={child.id} 
                block={child as EditorBlock} 
                onUpdate={onUpdate} 
                onRemove={onRemove} 
                parentId={block.id} 
                serverData={serverData} 
                sensors={sensors} 
                handleDragEnd={handleDragEnd}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <AnimatePresence>
        {showColorPicker && (
          <div className="absolute -top-3 right-0 mt-8 z-50 color-picker-container">
            <ColorPicker value={containerBlock.accentColor} onChange={(color) => onUpdate(block.id, { accentColor: color }, parentId)} />
          </div>
        )}
      </AnimatePresence>
    </BlockWrapper>
  );
};