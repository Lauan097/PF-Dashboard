import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";
import { BotResponse } from '@/types/verify';

const formatarBloco = (bloco: any): any => {
  if (bloco.type === 'container') {
    return {
      type: 'container',
      accent_color: bloco.accentColor ? parseInt(bloco.accentColor.replace('#', ''), 16) : null,
      components: bloco.children ? bloco.children.map(formatarBloco) : []
    };
  }

  if (bloco.type === 'separator') {
    return {
      type: 'separator',
      spacing: bloco.spacing || 'small',
      has_divider: bloco.hasDivider
    };
  }

  if (bloco.type === 'image') {
    return {
      type: 'media_gallery',
      images: bloco.url ? [{ url: bloco.url }] : []
    };
  }

  if (bloco.type === 'text') {
    
    if (bloco.thumbnail) {
      return {
        type: 'section',
        thumbnail: { url: bloco.thumbnail },
        content: bloco.content.map((linha: string) => ({ type: 'text_display', content: linha }))
      };
    }

    return {
      type: 'text_display',
      content: Array.isArray(bloco.content) ? bloco.content.join('\n') : bloco.content
    };
  }

  return null;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;

  try {
    const { guildId, channelId, blocks } = await req.json();

    if (!guildId || !channelId || !blocks) {
      return NextResponse.json({ success: false, error: 'Dados insuficientes' }, { status: 400 });
    }

    const componentesFormatados = blocks.map(formatarBloco).filter((c: any) => c !== null);

    return new Promise<NextResponse>((resolve) => {
      socket.emit("message:sendV2", {
        userId,
        guildId,
        channelId,
        components: componentesFormatados,
        isV2: true
      }, (resposta: BotResponse) => {
        resolve(NextResponse.json(resposta));
      });
    });

  } catch (error: unknown) {
    console.log('Erro ao enviar mensagem', (error as Error).message);
    return NextResponse.json({ success: false, error: 'Erro no processamento' }, { status: 500 });
  }
}