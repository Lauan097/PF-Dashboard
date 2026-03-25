import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";

interface DiscordRole { id: string; name: string; color: string; position: number; }
interface DiscordChannel { id: string; name: string; type: number; position: number; }
interface DiscordEmoji { id: string; name: string; url: string; }
interface ServerConfig { id: string; }

interface DiscordMemberMin { 
    id: string; 
    username: string; 
    nickname: string; 
    avatar: string; 
    status: string; 
    activity: string; 
    joinedAt: string; 
}

interface GuildData {
    id: string;
    name: string;
    botName: string;
    botAvatar: string;
    icon: string | null;
    serverConfig: ServerConfig[];
    roles: DiscordRole[];
    channels: DiscordChannel[];
    emojis: DiscordEmoji[];
    members: DiscordMemberMin[];
    [key: string]: unknown;
}

interface BotResponse {
    success: boolean;
    data?: GuildData;
    error?: string;
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get('guildId');
    const type = searchParams.get('type') || 'all'; 
    const userId = session?.user.id;

    if (!guildId) {
        return NextResponse.json({ error: "ID do servidor não fornecido" }, { status: 400 });
    }

    try {
        const botData = await new Promise<BotResponse>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Timeout")), 5000);

            socket.emit("guild:getData", { userId, guildId }, (response: BotResponse) => {
                clearTimeout(timeout);
                if (response.success === false) {
                    reject(new Error(response.error || "Erro no Bot"));
                } else {
                    resolve(response);
                }
            });
        });

        if (type !== 'all' && botData.data) {

            const content = botData.data[type];
            
            return NextResponse.json({
                success: true,
                data: { [type]: content }
            });
        }

        return NextResponse.json(botData);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}