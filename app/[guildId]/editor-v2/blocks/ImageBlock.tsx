import React, { useMemo, useState } from 'react';
import { Trash2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { BlockProps, ImageBlockType } from '@/types/editor';
import { BlockWrapper } from '../managers/BlockWrapper';
import { ModalImageUploader } from '@/app/components/ModalImage';

export const ImageBlock = ({ block, onUpdate, onRemove, parentId }: BlockProps) => {
  const imageBlock = block as ImageBlockType;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const actions = useMemo(() => [
    {
      icon: <Trash2 size={14} />,
      onClick: () => onRemove(block.id, parentId),
      tooltip: "Deletar",
      variant: 'danger'
    }
  ], [block.id, onRemove, parentId]);

  return (
    <>
      <BlockWrapper className="p-2 mb-2 bg-[#2B2D31] hover:bg-[#2B2D31]" actions={actions}>
        {imageBlock.url ? (
          <div className="relative w-full h-48 rounded-md overflow-hidden group/image cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <Image 
              src={imageBlock.url} 
              alt="Block Image" 
              fill 
              className="object-cover transition-opacity group-hover/image:opacity-80"
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/30">
              <span className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-md backdrop-blur-sm">
                Trocar Imagem
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full h-32 border-2 border-dashed border-zinc-600 rounded-md flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-200 hover:border-zinc-400 hover:bg-zinc-800/50 transition-all cursor-pointer"
          >
            <ImageIcon size={24} className="mb-2" />
            <span className="text-sm font-medium">Adicionar Imagem</span>
          </button>
        )}
      </BlockWrapper>

      <ModalImageUploader
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onChange={(url) => {
          onUpdate(block.id, { url }, parentId);
        }}
      />
    </>
  );
};