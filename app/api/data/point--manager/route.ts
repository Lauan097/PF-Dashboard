import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";
import { PointManagerResponse, SetGoalResponse } from "@/types/globalData";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");
  const userId = session.user.id;

  if (!guildId) {
    return NextResponse.json(
      { error: "ID do servidor não fornecido" },
      { status: 400 },
    );
  }

  try {
    const data = await new Promise<PointManagerResponse>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Timeout")), 8000);
      socket.emit(
        "pointManager:getData",
        { userId, guildId },
        (response: PointManagerResponse) => {
          clearTimeout(timeout);
          if (!response.success) reject(new Error(response.error));
          else resolve(response);
        },
      );
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { guildId, weeklyGoal } = body;
  const userId = session.user.id;

  if (!guildId || typeof weeklyGoal !== "number" || weeklyGoal < 0) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  try {
    const data = await new Promise<SetGoalResponse>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Timeout")), 8000);
      socket.emit(
        "pointManager:setWeeklyGoal",
        { userId, guildId, weeklyGoal },
        (response: SetGoalResponse) => {
          clearTimeout(timeout);
          if (!response.success) reject(new Error(response.error));
          else resolve(response);
        },
      );
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
