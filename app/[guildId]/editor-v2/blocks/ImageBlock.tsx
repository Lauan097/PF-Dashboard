import React, { useMemo, useState } from 'react';
import { Trash2, Image as ImageIcon, ImagePlus, X, Pencil } from 'lucide-react';
import Image from 'next/image';
import { BlockAction, BlockProps, ImageBlockType, ImageGalleryItem } from '@/types/editor';
import { BlockWrapper } from '../managers/BlockWrapper';
import { ModalImageUploader } from '@/app/components/ModalImage';

function getImageRows(images: ImageGalleryItem[]): ImageGalleryItem[][] {
  const n = images.length;
  if (n <= 4) return [images];
  if (n === 5) return [images.slice(0, 2), images.slice(2)];
  if (n === 6) return [images.slice(0, 3), images.slice(3)];
  const rows: ImageGalleryItem[][] = [];
  let i = 0;
  while (i + 3 < n) {
    rows.push(images.slice(i, i + 3));
    i += 3;
  }
  rows.push(images.slice(i));
  return rows;
}

export const ImageBlock = ({ block, onUpdate, onRemove, parentId }: BlockProps) => {
  const imageBlock = block as ImageBlockType;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const images = imageBlock.images ?? [];

  const handleAddImage = (url: string) => {
    const newItem: ImageGalleryItem = { id: Math.random().toString(36).substr(2, 9), url };
    onUpdate(block.id, { images: [...images, newItem] } as Partial<ImageBlockType>, parentId);
  };

  const handleEditImage = (url: string) => {
    if (!editingImageId) return;
    onUpdate(
      block.id,
      { images: images.map((img) => img.id === editingImageId ? { ...img, url } : img) } as Partial<ImageBlockType>,
      parentId,
    );
    setEditingImageId(null);
  };

  const handleRemoveImage = (imgId: string) => {
    onUpdate(block.id, { images: images.filter((img) => img.id !== imgId) } as Partial<ImageBlockType>, parentId);
  };

  const openEdit = (imgId: string) => {
    setEditingImageId(imgId);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditingImageId(null);
    setIsModalOpen(true);
  };

  const actions = useMemo(() => {
    const acts: BlockAction[] = [];
    if (images.length < 10) {
      acts.push({
        icon: <ImagePlus size={14} />,
        onClick: openAdd,
        tooltip: 'Nova Imagem',
        variant: 'primary',
      });
    }
    acts.push({
      icon: <Trash2 size={14} />,
      onClick: () => onRemove(block.id, parentId),
      tooltip: 'Deletar',
      variant: 'danger',
    });
    return acts;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length, block.id, onRemove, parentId]);

  const GalleryItem = ({ img, className }: { img: ImageGalleryItem; className?: string }) => (
    <div
      className={`relative overflow-hidden rounded-md group/img cursor-pointer ${className ?? ''}`}
      onClick={() => openEdit(img.id)}
    >
      {img.url ? (
        <Image src={img.url} alt="Gallery image" fill className="object-cover" unoptimized priority />
      ) : (
        <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
          <ImageIcon size={20} className="text-zinc-600" />
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover/img:opacity-100">
        <Pencil size={14} className="text-white drop-shadow" />
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); handleRemoveImage(img.id); }}
        className="absolute top-1 left-1 w-5 h-5 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all z-10"
        title="Remover imagem"
      >
        <X size={10} />
      </button>
    </div>
  );

  const renderGallery = () => {
    const count = images.length;

    if (count === 0) {
      return (
        <button
          onClick={openAdd}
          className="w-full h-32 border-2 border-dashed border-zinc-600 rounded-md flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-200 hover:border-zinc-400 hover:bg-zinc-800/50 transition-all cursor-pointer"
        >
          <ImageIcon size={24} className="mb-2" />
          <span className="text-sm font-medium">Adicionar Imagem</span>
        </button>
      );
    }

    if (count === 1) {
      return (
        <div className="h-48">
          <GalleryItem img={images[0]} className="h-full w-full" />
        </div>
      );
    }

    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-1 h-48">
          {images.map((img) => <GalleryItem key={img.id} img={img} className="h-full" />)}
        </div>
      );
    }

    if (count === 3) {
      return (
        <div className="flex gap-1 h-48">
          <GalleryItem img={images[0]} className="flex-2" />
          <div className="flex-1 flex flex-col gap-1">
            <GalleryItem img={images[1]} className="flex-1" />
            <GalleryItem img={images[2]} className="flex-1" />
          </div>
        </div>
      );
    }

    if (count === 4) {
      return (
        <div className="grid grid-cols-2 gap-1">
          {images.map((img) => (
            <div key={img.id} className="h-24">
              <GalleryItem img={img} className="h-full w-full" />
            </div>
          ))}
        </div>
      );
    }

    const rows = getImageRows(images);
    return (
      <div className="flex flex-col gap-1">
        {rows.map((row, rowIdx) => {
          const isSingleItem = row.length === 1;
          if (isSingleItem) {
            return (
              <div key={rowIdx} className="h-28">
                <GalleryItem img={row[0]} className="h-full w-full" />
              </div>
            );
          }
          return (
            <div
              key={rowIdx}
              className="grid gap-1 h-24"
              style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}
            >
              {row.map((img) => (
                <GalleryItem key={img.id} img={img} className="h-full" />
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <BlockWrapper className="p-2 mb-2 bg-[#2B2D31] hover:bg-[#2B2D31]" actions={actions}>
        {renderGallery()}
        {images.length > 0 && images.length < 10 && (
          <p className="text-zinc-500 text-xs mt-1.5 text-right">
            {images.length}/10 imagens
          </p>
        )}
        {images.length >= 10 && (
          <p className="text-amber-500/80 text-xs mt-1.5 text-right">
            Limite máximo de 10 imagens atingido
          </p>
        )}
      </BlockWrapper>

      <ModalImageUploader
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingImageId(null); }}
        onChange={(url) => {
          if (editingImageId) {
            handleEditImage(url);
          } else {
            handleAddImage(url);
          }
        }}
      />
    </>
  );
};

