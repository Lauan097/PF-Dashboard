import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get('guildId');
  const userId = searchParams.get('userId');

  if (!guildId) {
    return NextResponse.json({ error: "ID do servidor não fornecido" }, { status: 400 });
  };

  if (userId === undefined) return;

  try {

    const response = await new Promise((resolve, reject) => {
      socket.emit("user:info", { userId, requestId: session.user.id, guildId }, (response: { success: boolean; data?: any; error?: string }) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || "Erro no Bot"));
        }
      });
    });

    return NextResponse.json({ success: true, data: (response as any).data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}