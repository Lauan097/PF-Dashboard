import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";
import { BotResponse, GuildData } from '@/types/verify';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || "checkSession";

  if (!userId) {
    return NextResponse.json({ error: "ID do usuário não fornecido" }, { status: 400 });
  }

  try {
      
    if (type === "checkSession") {
      const botData = await new Promise<BotResponse>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Timeout")), 5000);

        socket.emit("user:checkSession", userId, (response: BotResponse) => {
          clearTimeout(timeout);
          resolve(response);
        });

      });

      if (botData.success === false) {
        return NextResponse.json({ success: false, error: botData.error }, { status: 403 });
      }

      const { isAdmin, guilds } = botData as { isAdmin: boolean; guilds: GuildData[] };
      return NextResponse.json({ success: true, isAdmin, guilds });
    }

    if (type === "checkIsAdmin") {
      const result = await new Promise<{ success: boolean; isAdmin?: boolean; error?: string }>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Timeout")), 5000);

        socket.emit("user:checkIsAdmin", userId, (response: { success: boolean; isAdmin?: boolean; error?: string }) => {
          clearTimeout(timeout);
          resolve(response);
        });

      });

      if (result.success === false) {
        return NextResponse.json({ success: false, error: result.error }, { status: 403 });
      }

      return NextResponse.json({ success: true, isAdmin: result.isAdmin ?? false });
    }

    return NextResponse.json({ error: "Tipo de verificação inválido" }, { status: 400 });

  } catch (error: unknown) {
    console.error("[verify] Erro interno:", error);
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}