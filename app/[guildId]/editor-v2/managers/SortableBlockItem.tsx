import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { BlockProps } from '@/types/editor';

import { TextBlock } from '../blocks/TextBlock';
import { ImageBlock } from '../blocks/ImageBlock';
import { SeparatorBlock } from '../blocks/SeparatorBlock';
import { ContainerBlock } from '../blocks/ContainerBlock';

const BLOCK_COMPONENTS: Record<string, React.FC<any>> = {
  text: TextBlock,
  image: ImageBlock,
  separator: SeparatorBlock,
  container: ContainerBlock,
};

export const SortableBlockItem = (props: BlockProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.block.id });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    opacity: isDragging ? 0.5 : 1, 
    zIndex: isDragging ? 999 : 'auto' 
  };
  
  const Component = BLOCK_COMPONENTS[props.block.type];

  if (!Component) return null;

  return (
    <div ref={setNodeRef} style={style} className="relative group/drag">
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute -left-5 top-1.5 cursor-grab text-zinc-600 hover:text-zinc-300 opacity-0 group-hover/drag:opacity-100 p-1"
      >
        <GripVertical size={16} />
      </div>
      <Component {...props} />
    </div>
  );
};