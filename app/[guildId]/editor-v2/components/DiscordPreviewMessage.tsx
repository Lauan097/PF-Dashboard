"use client";

import Image from "next/image";

import {
  EditorBlock,
  TextBlockType,
  ImageBlockType,
  SeparatorBlockType,
  ContainerBlockType,
} from "@/types/editor";
import { GuildData } from "@/types/globalData";
import { DiscordTextRenderer } from "./DiscordTextRenderer";

interface PreviewProps {
  blocks: EditorBlock[];
  serverData: GuildData | null;
  currentTime: string;
}

function PreviewTextBlock({
  block,
  serverData,
}: {
  block: TextBlockType;
  serverData: GuildData | null;
}) {
  const text = block.content.join("\n");
  return (
    <div className="flex gap-3 text-[13px] text-[#dbdee1] leading-snug w-full">
      <div className="flex-1 min-w-0 wrap-break-word">
        <DiscordTextRenderer text={text} serverData={serverData} />
      </div>
      {block.thumbnail && (
        <div className="relative w-20 h-20 shrink-0">
          <Image
            src={block.thumbnail}
            alt="Thumbnail"
            fill
            className="rounded-md object-cover"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}

function getImageRows(images: { id: string; url: string }[]): { id: string; url: string }[][] {
  const n = images.length;
  if (n <= 4) return [images];
  if (n === 5) return [images.slice(0, 2), images.slice(2)];
  if (n === 6) return [images.slice(0, 3), images.slice(3)];
  const rows: { id: string; url: string }[][] = [];
  let i = 0;
  while (i + 3 < n) {
    rows.push(images.slice(i, i + 3));
    i += 3;
  }
  rows.push(images.slice(i));
  return rows;
}

function PreviewImageBlock({ block }: { block: ImageBlockType }) {
  const images = block.images ?? [];

  if (images.length === 0) {
    return (
      <div className="h-32 rounded-md bg-[#1e1f22] border border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 text-sm">
        Sem imagem
      </div>
    );
  }

  const GalleryItem = ({ img, className }: { img: { id: string; url: string }; className?: string }) => (
    <div className={`relative overflow-hidden rounded-md ${className ?? ''}`}>
      {img.url ? (
        <Image src={img.url} alt="Gallery" fill className="object-cover" unoptimized />
      ) : (
        <div className="absolute inset-0 bg-[#1e1f22] flex items-center justify-center text-zinc-600 text-xs">
          Sem URL
        </div>
      )}
    </div>
  );

  const count = images.length;

  if (count === 1) {
    return (
      <div className="rounded-lg overflow-hidden max-w-full w-full">
        <Image
          src={images[0].url}
          alt="Block image"
          width={0}
          height={0}
          sizes="100vw"
          className="w-auto h-auto max-w-full max-h-80 rounded-lg object-contain"
          unoptimized
        />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5 h-44 rounded-lg overflow-hidden">
        {images.map((img) => <GalleryItem key={img.id} img={img} className="h-full" />)}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="flex gap-0.5 h-44 rounded-lg overflow-hidden">
        <GalleryItem img={images[0]} className="flex-2" />
        <div className="flex-1 flex flex-col gap-0.5">
          <GalleryItem img={images[1]} className="flex-1" />
          <GalleryItem img={images[2]} className="flex-1" />
        </div>
      </div>
    );
  }

  if (count === 4) {
    return (
      <div className="grid grid-cols-2 gap-0.5 rounded-lg overflow-hidden">
        {images.map((img) => (
          <div key={img.id} className="h-20">
            <GalleryItem img={img} className="h-full w-full" />
          </div>
        ))}
      </div>
    );
  }

  const rows = getImageRows(images);
  return (
    <div className="flex flex-col gap-0.5 rounded-lg overflow-hidden">
      {rows.map((row, rowIdx) => {
        if (row.length === 1) {
          return (
            <div key={rowIdx} className="h-24">
              <GalleryItem img={row[0]} className="h-full w-full" />
            </div>
          );
        }
        return (
          <div
            key={rowIdx}
            className="grid gap-0.5 h-20"
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
}

function PreviewSeparatorBlock({ block }: { block: SeparatorBlockType }) {
  return (
    <div
      className={`w-full flex items-center ${block.spacing === "large" ? "py-4" : "py-1"}`}
    >
      {block.hasDivider && <div className="w-full h-px bg-zinc-600/50" />}
    </div>
  );
}

function PreviewContainerBlock({
  block,
  serverData,
}: {
  block: ContainerBlockType;
  serverData: GuildData | null;
}) {
  return (
    <div
      className="rounded-md overflow-hidden border-l-4 bg-[#2b2d31] w-full max-w-142.5"
      style={{ borderLeftColor: block.accentColor || "#00000000" }}
    >
      <div className="p-3 space-y-2">
        {block.children.map((child) => (
          <PreviewBlock
            key={child.id}
            block={child as EditorBlock}
            serverData={serverData}
          />
        ))}
        {block.children.length === 0 && (
          <div className="text-zinc-500 text-xs text-center py-2">
            Container vazio
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewBlock({
  block,
  serverData,
}: {
  block: EditorBlock;
  serverData: GuildData | null;
}) {
  if (block.type === "text")
    return (
      <PreviewTextBlock
        block={block as TextBlockType}
        serverData={serverData}
      />
    );
  if (block.type === "image")
    return <PreviewImageBlock block={block as ImageBlockType} />;
  if (block.type === "separator")
    return <PreviewSeparatorBlock block={block as SeparatorBlockType} />;
  if (block.type === "container")
    return (
      <PreviewContainerBlock
        block={block as ContainerBlockType}
        serverData={serverData}
      />
    );
  return null;
}

export function DiscordPreviewMessage({
  blocks,
  serverData,
  currentTime,
}: PreviewProps) {
  return (
    <div className="flex items-start gap-4 group/msg px-4 py-1.5 rounded-sm transition-colors duration-100">
      <div className="shrink-0 mt-1">
        {serverData?.botAvatar ? (
          <Image
            src={serverData.botAvatar}
            alt="Bot Avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full"
            unoptimized
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-zinc-700 animate-pulse" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-1 flex-wrap">
          <span className="font-medium text-white text-sm hover:underline cursor-pointer mr-1">
            {serverData?.botName ?? (
              <span className="inline-block w-24 h-4 rounded bg-zinc-700 animate-pulse" />
            )}
          </span>
          <span className="bg-[#5865F2] text-[10px] font-extrabold h-3.75 mr-2 flex items-center text-white px-1 rounded-xs leading-none select-none">
            APP
          </span>
          <span className="text-xs text-zinc-400">
            Hoje às {currentTime || "--:--"}
          </span>
        </div>

        <div className="space-y-1 w-fit max-w-full">
          {blocks.map((block) => (
            <PreviewBlock
              key={block.id}
              block={block}
              serverData={serverData}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
