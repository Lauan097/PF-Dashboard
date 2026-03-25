import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";

interface ServerData {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  splashURL: string | null;
  description: string | null;
  membersCount: number;
  rolesCount: number | null;
  textChannelsCount: number;
  voiceChannelsCount: number | null;
  emojisCount: number;
  ownerName: string;
  createdAt: string;
}

interface BotResponse {
    success: boolean;
    data?: ServerData;
    error?: string;
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    
    if (!session || !session?.user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get('guildId');
    const userId = session.user.id;

    if (!guildId) {
        return NextResponse.json({ error: "ID do servidor não fornecido" }, { status: 400 });
    }

    try {
        
        const botData = await new Promise<BotResponse>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Timeout")), 5000);

            socket.emit("server:info", { userId, guildId }, (response: BotResponse) => {
                clearTimeout(timeout);
                if (response.success === false) {
                    reject(new Error(response.error || "Erro no Bot"));
                } else {
                    resolve(response);
                }
            });
        });

        return NextResponse.json(botData);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}