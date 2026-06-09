import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";

interface BotListResponse {
  success: boolean;
  list?: any[];
  investigators?: any[];
  error?: string;
}

interface BotCreateResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, error: "Não autorizado." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");

  if (!guildId) {
    return NextResponse.json(
      { success: false, error: "Guild ID não fornecido." },
      { status: 400 }
    );
  }

  try {
    const data = await new Promise<BotListResponse>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Timeout ao buscar inquéritos.")), 10000);

      socket.emit(
        "investigation:list",
        { guildId, authorId: session.user.id },
        (res: BotListResponse) => {
          clearTimeout(timeout);
          resolve(res);
        }
      );
    });

    if (!data.success) {
      return NextResponse.json(
        { success: false, error: data.error || "Erro no bot." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      list: data.list,
      investigators: data.investigators
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, error: "Não autorizado." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { guildId, title, description, suspects, evidence, notes, investigators } = body;

    if (!guildId || !title || !description) {
      return NextResponse.json(
        { success: false, error: "Guild ID, título e descrição são obrigatórios." },
        { status: 400 }
      );
    }

    const data = await new Promise<BotCreateResponse>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Timeout ao criar inquérito.")), 10000);

      socket.emit(
        "investigation:create",
        {
          guildId,
          title,
          description,
          suspects,
          evidence,
          notes,
          investigators,
          authorId: session.user.id
        },
        (res: BotCreateResponse) => {
          clearTimeout(timeout);
          resolve(res);
        }
      );
    });

    if (!data.success) {
      return NextResponse.json(
        { success: false, error: data.error || "Erro ao criar inquérito no bot." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: data.data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
