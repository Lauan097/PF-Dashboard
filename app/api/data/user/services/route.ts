import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");
  const userId = searchParams.get("userId");

  if (!guildId || !userId) {
    return NextResponse.json(
      { error: "guildId e userId são obrigatórios." },
      { status: 400 },
    );
  }

  try {
    const response = await new Promise<{ success: boolean; data?: unknown; error?: string }>(
      (resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Timeout ao buscar serviços")),
          10000,
        );
        socket.emit(
          "member:getServices",
          { userId, guildId, authorId: session.user.id },
          (res: { success: boolean; data?: unknown; error?: string }) => {
            clearTimeout(timeout);
            if (res.success) resolve(res);
            else reject(new Error(res.error ?? "Erro no bot"));
          },
        );
      },
    );

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { guildId, userId, weeklyGoal, weeklyGoalDiscount } = body;

  if (!guildId || !userId) {
    return NextResponse.json(
      { error: "guildId e userId são obrigatórios." },
      { status: 400 },
    );
  }

  if (weeklyGoal === undefined || weeklyGoalDiscount === undefined) {
    return NextResponse.json(
      { error: "weeklyGoal e weeklyGoalDiscount são obrigatórios." },
      { status: 400 },
    );
  }

  try {
    const response = await new Promise<{ success: boolean; data?: unknown; error?: string }>(
      (resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Timeout ao atualizar serviços")),
          10000,
        );
        socket.emit(
          "member:updateServices",
          {
            userId,
            guildId,
            authorId: session.user.id,
            weeklyGoal,
            weeklyGoalDiscount,
          },
          (res: { success: boolean; data?: unknown; error?: string }) => {
            clearTimeout(timeout);
            if (res.success) resolve(res);
            else reject(new Error(res.error ?? "Erro no bot"));
          },
        );
      },
    );

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
