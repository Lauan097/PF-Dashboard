import React, { useMemo, useState } from "react";
import { Trash2, Image as ImageIcon, X } from "lucide-react";
import { BlockProps, TextBlockType } from "@/types/editor";
import { BlockWrapper } from "../managers/BlockWrapper";
import MentionInput from "../components/MentionPopUp";
import { ModalImageUploader } from "@/app/components/ModalImage";
import Image from "next/image";

export const TextBlock = ({
  block,
  onUpdate,
  onRemove,
  parentId,
  serverData,
}: BlockProps) => {
  const textBlock = block as TextBlockType;
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const actions = useMemo(
    () => [
      ...(!textBlock.thumbnail
        ? [
            {
              icon: <ImageIcon size={14} />,
              onClick: () => setIsImageModalOpen(true),
              tooltip: "Adicionar Thumbnail",
            },
          ]
        : []),
      {
        icon: <Trash2 size={14} />,
        onClick: () => onRemove(block.id, parentId),
        tooltip: "Deletar",
        variant: "danger",
      },
    ],
    [block.id, onRemove, parentId, textBlock.thumbnail],
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(block.id, { content: [e.target.value] }, parentId);
  };

  return (
    <>
      <BlockWrapper
        className="p-2 mb-2 bg-[#2B2D31] hover:bg-[#2B2D31]"
        actions={actions}
      >
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            <MentionInput
              value={textBlock.content.join("\n")}
              onChange={handleContentChange}
              serverData={serverData}
            />
          </div>
          {textBlock.thumbnail && (
            <div
              onClick={() => setIsImageModalOpen(true)}
              className="relative w-22 h-22 rounded-md overflow-hidden shrink-0 group/thumb border border-zinc-700"
            >
              <Image
                src={textBlock.thumbnail}
                alt="Thumbnail"
                fill
                className="object-cover"
                unoptimized
              />
              <button
                onClick={() =>
                  onUpdate(block.id, { thumbnail: null }, parentId)
                }
                className="absolute top-1 left-1 bg-black/60 p-1 rounded-full text-zinc-300 hover:text-red-400 opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      </BlockWrapper>

      <ModalImageUploader
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onChange={(url) => {
          onUpdate(block.id, { thumbnail: url }, parentId);
        }}
      />
    </>
  );
};
