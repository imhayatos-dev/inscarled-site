
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

const BUCKET = "music-previews";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type Preview = {
  title: string;
  url: string;
  path?: string;
};

function secureCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  return (
    aBuffer.length === bBuffer.length &&
    timingSafeEqual(aBuffer, bBuffer)
  );
}

function isAuthorized(request: NextRequest): boolean {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) return false;

  const header = request.headers.get("authorization");

  if (!header?.startsWith("Basic ")) return false;

  try {
    const decoded = Buffer.from(
      header.slice(6),
      "base64"
    ).toString("utf8");

    const separator = decoded.indexOf(":");

    if (separator === -1) return false;

    const user = decoded.slice(0, separator);
    const pass = decoded.slice(separator + 1);

    return (
      secureCompare(user, username) &&
      secureCompare(pass, password)
    );
  } catch {
    return false;
  }
}

function unauthorizedResponse() {
  return NextResponse.json(
    { error: "管理者認証が必要です。" },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  // middlewareとは別にAPI側でも認証を確認
  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Supabaseのサーバー設定が不足しています。" },
      { status: 500 }
    );
  }

  const supabase = createClient(
    supabaseUrl,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const formData = await request.formData();

    const musicId = formData.get("musicId");
    const trackIndexValue = formData.get("trackIndex");
    const file = formData.get("file");

    if (
      typeof musicId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(musicId)
    ) {
      return NextResponse.json(
        { error: "音源IDが不正です。" },
        { status: 400 }
      );
    }

    if (
      typeof trackIndexValue !== "string" ||
      !/^\d+$/.test(trackIndexValue)
    ) {
      return NextResponse.json(
        { error: "曲番号が不正です。" },
        { status: 400 }
      );
    }

    const trackIndex = Number(trackIndexValue);

    if (!Number.isSafeInteger(trackIndex)) {
      return NextResponse.json(
        { error: "曲番号が不正です。" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "MP3ファイルを選択してください。" },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "ファイルは10MB以下にしてください。" },
        { status: 400 }
      );
    }

    if (file.type !== "audio/mpeg") {
      return NextResponse.json(
        { error: "MP3形式のファイルのみアップロードできます。" },
        { status: 400 }
      );
    }

    // MP3の先頭データを簡易検証
    const signature = new Uint8Array(
      await file.slice(0, 10).arrayBuffer()
    );

    const hasID3 =
      signature.length >= 3 &&
      signature[0] === 0x49 &&
      signature[1] === 0x44 &&
      signature[2] === 0x33;

    const hasMpegFrame =
      signature.length >= 2 &&
      signature[0] === 0xff &&
      (signature[1] & 0xe0) === 0xe0;

    if (!hasID3 && !hasMpegFrame) {
      return NextResponse.json(
        { error: "有効なMP3ファイルを選択してください。" },
        { status: 400 }
      );
    }

    // 既存のMUSIC情報を取得
    const { data: music, error: musicError } =
      await supabase
        .from("music")
        .select("id, tracks, previews")
        .eq("id", musicId)
        .single();

    if (musicError || !music) {
      return NextResponse.json(
        { error: "対象のリリースが見つかりません。" },
        { status: 404 }
      );
    }

    const trackList = (music.tracks || "")
      .split("\n")
      .map((track: string) => track.trim())
      .filter(Boolean);

    if (
      trackIndex < 0 ||
      trackIndex >= trackList.length
    ) {
      return NextResponse.json(
        { error: "指定された曲が存在しません。" },
        { status: 400 }
      );
    }

    const existingPreviews: Preview[] =
      Array.isArray(music.previews)
        ? music.previews.filter(
            (item: unknown): item is Preview =>
              typeof item === "object" &&
              item !== null &&
              "title" in item &&
              "url" in item &&
              typeof (item as Preview).title === "string" &&
              typeof (item as Preview).url === "string"
          )
        : [];

    // 既存の曲順に対応させる
    const previews: Preview[] = trackList.map(
      (title: string, index: number) => {
        const existing = existingPreviews[index];

        return {
          title,
          url: existing?.url || "",
          ...(existing?.path
            ? { path: existing.path }
            : {}),
        };
      }
    );

    const oldPath = previews[trackIndex]?.path;

    // UUIDでファイル名の衝突を防止
    const filePath =
      `${musicId}/${trackIndex + 1}-${randomUUID()}.mp3`;

    const fileBuffer = Buffer.from(
      await file.arrayBuffer()
    );

    const { error: uploadError } =
      await supabase.storage
        .from(BUCKET)
        .upload(filePath, fileBuffer, {
          contentType: "audio/mpeg",
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      console.error("MP3 upload error:", uploadError);

      return NextResponse.json(
        { error: "MP3のアップロードに失敗しました。" },
        { status: 500 }
      );
    }

    const { data: publicUrlData } =
      supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);

    previews[trackIndex] = {
      title: trackList[trackIndex],
      url: publicUrlData.publicUrl,
      path: filePath,
    };

    // previewsのみ更新。既存のリリース情報は維持
    const { error: updateError } =
      await supabase
        .from("music")
        .update({ previews })
        .eq("id", musicId);

    if (updateError) {
      // DB更新失敗時は今回のアップロードを取り消す
      await supabase.storage
        .from(BUCKET)
        .remove([filePath]);

      console.error("Preview update error:", updateError);

      return NextResponse.json(
        { error: "試聴情報の保存に失敗しました。" },
        { status: 500 }
      );
    }

    // 差し替え成功後、以前のファイルを削除
    if (
      oldPath &&
      oldPath !== filePath &&
      oldPath.startsWith(`${musicId}/`)
    ) {
      const { error: removeError } =
        await supabase.storage
          .from(BUCKET)
          .remove([oldPath]);

      if (removeError) {
        console.warn(
          "Old preview cleanup failed:",
          removeError
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "試聴音源を登録しました。",
      preview: previews[trackIndex],
    });
  } catch (error) {
    console.error("Music preview API error:", error);

    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
