import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";
import type { ServerConfigGetResponse, ServerConfigSaveResponse, ServerConfigPayload } from "@/types/serverConfig";

async function emitWithAck<T>(event: string, data: unknown): Promise<T> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve({ success: false, error: "Timeout" } as T), 15000);
    socket.emit(event, data, (res: T) => {
      clearTimeout(t);
      resolve(res);
    });
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
  }

  const guildId = searchParams.get("guildId");

  const response = await emitWithAck<ServerConfigGetResponse>("server:getServerConfig", { guildId, userId: session?.user.id });
  return NextResponse.json(response);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");
  const payload: ServerConfigPayload = await req.json();

  const response = await emitWithAck<ServerConfigSaveResponse>("server:saveServerConfig", {
    userId: session?.user.id,
    guildId,
    payload,
  });

  return NextResponse.json(response);
}
