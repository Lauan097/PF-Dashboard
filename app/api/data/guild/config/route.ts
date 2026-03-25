import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";

async function emitWithAck(event: string, data: any): Promise<any> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve({ success: false, error: "Timeout" }), 15000);
    socket.emit(event, data, (res: any) => {
      clearTimeout(t);
      resolve(res);
    });
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");
  const response = await emitWithAck("server:getServerConfig", { guildId });
  return NextResponse.json(response);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");
  const payload = await req.json();

  const response = await emitWithAck("server:SaveServerConfig", {
    userId: session?.user.id,
    guildId,
    payload
  });

  return NextResponse.json(response);
}