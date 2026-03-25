import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";
import { socket } from "@/lib/socket";
import sharp from "sharp";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const MAX_GIF_SIZE = 4 * 1024 * 1024;
const BUCKET_NAME = "images";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Request timeout"));
      }, 10000);

      socket.emit("latestUpImages:get", { userId: session.user.id }, (response: { success: boolean; message?: string; error?: string }) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || "Error checking registration"));
        }
      });
    });

    return NextResponse.json({ success: true, imagesUrl: (response as any).imagesUrl });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const isGif = file.type === "image/gif";

    if (isGif && file.size > MAX_GIF_SIZE) {
      return NextResponse.json({ error: "O GIF não pode ultrapassar 4MB" }, { status: 400 });
    }

    if (!isGif && file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande (Máximo 5MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes) as Buffer;
    let contentType = file.type;
    let fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';

    if (!isGif) {
      buffer = await sharp(buffer)
        .webp({ quality: 80 })
        .toBuffer();
      
      contentType = "image/webp";
      fileExt = "webp";
    }

    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: contentType,
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ error: "Erro no upload para o storage" }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)
    ;

    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Request timeout"));
      }, 10000);

      socket.emit("latestUpImages:add", { userId: session.user.id, imageUrl: publicUrl }, (response: { success: boolean; message?: string; error?: string }) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || "Error checking registration"));
        }
      });
    });

    if (!(response as any).success) {
      return NextResponse.json({ error: "Erro ao adicionar imagem recente" }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: publicUrl });


  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}