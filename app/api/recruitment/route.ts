import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";
import {
  RecruitmentPageData,
  Recruitment,
  CreateRecruitmentPayload,
} from "@/types/recruitment";

interface WsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function emitWithTimeout<T>(
  event: string,
  payload: object,
  timeoutMs = 8000
): Promise<WsResponse<T>> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Timeout na resposta do bot.")),
      timeoutMs
    );
    socket.emit(event, payload, (response: WsResponse<T>) => {
      clearTimeout(timeout);
      resolve(response);
    });
  });
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Não autenticado." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");

    if (!guildId) {
      return NextResponse.json(
        { success: false, error: "Parâmetro guildId ausente." },
        { status: 400 }
      );
    }

    const response = await emitWithTimeout<RecruitmentPageData>(
      "recruitment:load",
      { userId: session.user.id, guildId }
    );

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || "Erro no bot." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro interno.";
    console.error("[API] GET /api/recruitment:", error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Não autenticado." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Body inválido ou ausente." },
        { status: 400 }
      );
    }

    const { guildId, payload } = body as {
      guildId: string;
      payload: CreateRecruitmentPayload;
    };

    if (!guildId) {
      return NextResponse.json(
        { success: false, error: "guildId ausente." },
        { status: 400 }
      );
    }

    if (
      !payload?.edition ||
      !payload?.oppeningDate ||
      !payload?.closingDate ||
      !payload?.requirements ||
      !payload?.location
    ) {
      return NextResponse.json(
        { success: false, error: "Campos obrigatórios ausentes no payload." },
        { status: 400 }
      );
    }

    const response = await emitWithTimeout<Recruitment>(
      "recruitment:create",
      { userId: session.user.id, guildId, payload }
    );

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || "Erro ao criar." },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: true, data: response.data },
      { status: 201 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro interno.";
    console.error("[API] POST /api/recruitment:", error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Não autenticado." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Body inválido ou ausente." },
        { status: 400 }
      );
    }

    const { guildId, recruitmentId, newStatus } = body as {
      guildId: string;
      recruitmentId: string;
      newStatus: string;
    };

    if (!guildId || !recruitmentId || !newStatus) {
      return NextResponse.json(
        {
          success: false,
          error: "guildId, recruitmentId e newStatus são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const allowed = ["Upcoming", "Open", "InProgress", "Closed"];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: "Status inválido." },
        { status: 400 }
      );
    }

    const response = await emitWithTimeout<Recruitment>(
      "recruitment:updateStatus",
      { userId: session.user.id, guildId, recruitmentId, newStatus }
    );

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || "Erro ao atualizar." },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro interno.";
    console.error("[API] PATCH /api/recruitment:", error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}