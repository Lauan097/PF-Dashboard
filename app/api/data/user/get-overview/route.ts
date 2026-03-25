import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";
import type { MemberOverview, MemberOverviewResult } from "@/types/user";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get('guildId');
  const userId  = searchParams.get('userId');

  if (!guildId) {
    return NextResponse.json({ error: "ID do servidor não fornecido" }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ error: "ID do usuário não fornecido" }, { status: 400 });
  }

  try {
    const data = await new Promise<MemberOverview>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Timeout ao buscar visão geral")), 8000);

      socket.emit("member:getOverview", { userId, guildId, authorId: session.user.id }, (res: MemberOverviewResult) => {
        clearTimeout(timeout);
        if (!res.success) {
          reject(new Error(res.error || "Erro no Bot"));
        } else {
          resolve(res.data);
        }
      });
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
