import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";
import { BotResponse } from "@/types/verify";
import {
  EditorBlock,
  ContainerBlockType,
  TextBlockType,
  ImageBlockType,
  SeparatorBlockType,
} from "@/types/editor";

type DiscordFormattedComponent =
  | {
      type: "container";
      accent_color: number | null;
      components: DiscordFormattedComponent[];
    }
  | { type: "separator"; spacing: "small" | "large"; has_divider: boolean }
  | { type: "media_gallery"; images: { url: string }[] }
  | {
      type: "section";
      thumbnail: { url: string };
      content: { type: "text_display"; content: string }[];
    }
  | { type: "text_display"; content: string };

const formatarBloco = (
  bloco: EditorBlock,
): DiscordFormattedComponent | null => {
  if (bloco.type === "container") {
    const container = bloco as ContainerBlockType;
    return {
      type: "container",
      accent_color: container.accentColor
        ? parseInt(container.accentColor.replace("#", ""), 16)
        : null,
      components: container.children
        ? container.children
            .map((child) => formatarBloco(child as EditorBlock))
            .filter((c): c is DiscordFormattedComponent => c !== null)
        : [],
    };
  }

  if (bloco.type === "separator") {
    const separator = bloco as SeparatorBlockType;
    return {
      type: "separator",
      spacing: separator.spacing || "small",
      has_divider: !!separator.hasDivider,
    };
  }

  if (bloco.type === "image") {
    const image = bloco as ImageBlockType;
    return {
      type: "media_gallery",
      images: image.url ? [{ url: image.url }] : [],
    };
  }

  if (bloco.type === "text") {
    const text = bloco as TextBlockType;

    if (text.thumbnail) {
      return {
        type: "section",
        thumbnail: { url: text.thumbnail },
        content: text.content.map((linha: string) => ({
          type: "text_display",
          content: linha,
        })),
      };
    }

    return {
      type: "text_display",
      content: Array.isArray(text.content)
        ? text.content.join("\n")
        : text.content,
    };
  }

  return null;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  try {
    const {
      guildId,
      channelId,
      blocks,
      editLastMessage,
      renewMention
    }: { 
      guildId: string; 
      channelId: string; 
      blocks: EditorBlock[]; 
      editLastMessage: boolean; 
      renewMention: boolean 
    } = await req.json();

    if (!guildId || !channelId || !blocks) {
      return NextResponse.json(
        { success: false, error: "Dados insuficientes" },
        { status: 400 },
      );
    }

    const componentesFormatados = blocks
      .map(formatarBloco)
      .filter((c) => c !== null);

    return new Promise<NextResponse>((resolve) => {
      socket.emit(
        "message:sendV2",
        {
          userId,
          guildId,
          channelId,
          components: componentesFormatados,
          isV2: true,
          editLastMessage,
          renewMention
        },
        (resposta: BotResponse) => {
          resolve(NextResponse.json(resposta));
        },
      );
    });
  } catch (error: unknown) {
    console.log("Erro ao enviar mensagem", (error as Error).message);
    return NextResponse.json(
      { success: false, error: "Erro no processamento" },
      { status: 500 },
    );
  }
}
