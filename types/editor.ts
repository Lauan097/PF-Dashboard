import { DragEndEvent } from '@dnd-kit/core';
import React from 'react';
import type { GuildData } from './globalData';

export type BlockType = 'text' | 'image' | 'separator' | 'container';

export interface BaseBlock { 
  id: string; 
  type: BlockType; 
}

export interface TextBlockType extends BaseBlock { 
  type: 'text'; 
  content: string[]; 
  thumbnail?: string | null; 
}

export interface ImageGalleryItem {
  id: string;
  url: string;
}

export interface ImageBlockType extends BaseBlock { 
  type: 'image'; 
  images: ImageGalleryItem[];
}

export interface SeparatorBlockType extends BaseBlock { 
  type: 'separator'; 
  spacing: 'small' | 'large'; 
  hasDivider: boolean; 
}

export interface ContainerBlockType extends BaseBlock { 
  type: 'container'; 
  accentColor?: string; 
  children: (TextBlockType | ImageBlockType | SeparatorBlockType)[]; 
}

export type EditorBlock = TextBlockType | ImageBlockType | SeparatorBlockType | ContainerBlockType;

export type BlockAction = {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip: string;
  variant?: string;
  noButton?: boolean;
  'data-color-button'?: boolean;
};

export interface BlockProps {
  block: EditorBlock;
  onUpdate: (id: string, data: Partial<EditorBlock>, parentId?: string) => void;
  onRemove: (id: string, parentId?: string) => void;
  parentId?: string;
  onAddChild?: (type: BlockType, parentId: string) => void;
  sensors?: ReturnType<typeof import('@dnd-kit/core').useSensors>;
  handleDragEnd?: (e: DragEndEvent) => void;
  serverData: GuildData | null;
}