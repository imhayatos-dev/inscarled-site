
import "server-only";

import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const SITE_URL = "https://inscarled-site.vercel.app";
const TO_EMAIL =
  process.env.RESERVATION_NOTIFICATION_EMAIL ||
  "imhayatos@gmail.com";

type Live = {
  id: string;
  date: string;
  title: string;
  venue: string;
  open_time: string | null;
  start_time: string | null;
};

type Reservation = {
  id: string;
  name: string;
  people_count: number;
  is_student: boolean;
  note: string | null;
  created_at: string;
};

function getTodayJST() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function normalizeDate(value: string): string | null {
  const match = value.match(
    /(\d{4})[./-](\d{1,2})[./-](\d{1,2})/
  );

  if (!match) return null;

  const [, year, month, day] = match;

  const result = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

  const date = new Date(`${result}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== result
  ) {
    return null;
  }

  return result;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] || character
  );
}

function buildEmail(live: Live, reservations: Reservation[]) {
  const totalPeople = reservations.reduce(
    (sum, reservation) =>
      sum + (reservation.people_count || 0),
    0
  );

  const rows = reservations
    .map(
      (reservation) => `
        <tr>
          <td>${escapeHtml(reservation.name)}</td>
          <td>${reservation.people_count}名</td>
          <td>${reservation.is_student ? "含む" : "含まない"}</td>
          <td>${escapeHtml(reservation.note || "なし")}</td>
        </tr>
      `
    )
    .join("");

  const reservationTable =
    reservations.length > 0
      ? `
        <table cellpadding="10" cellspacing="0"
          style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#eeeeee">
              <th align="left">予約者</th>
              <th align="left">人数</th>
              <th align="left">高校生以下</th>
              <th align="left">備考</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `
      : "<p>現時点で予約はありません。</p>";

  return `
    <div style="font-family:Arial,sans-serif;color:#222;max-width:700px;margin:auto">
      <h1 style="font-size:22px">inScarled ライブ予約状況</h1>

      <p>公演日：${escapeHtml(live.date)}</p>
      <p>公演名：${escapeHtml(live.title)}</p>
      <p>会場：${escapeHtml(live.venue)}</p>
      <p>
        OPEN ${escapeHtml(live.open_time || "未設定")}
        / START ${escapeHtml(live.start_time || "未設定")}
      </p>

      <hr />

      <h2>予約状況</h2>
      <p style="font-size:18px">
        <strong>${reservations.length}組 / ${totalPeople}名</strong>
      </p>

      ${reservationTable}

      <p style="margin-top:30px">
        <a href="${SITE_URL}/admin/reservations"
          style="display:inline-block;padding:14px 20px;background:#171717;color:white;text-decoration:none;border-radius:6px">
          最新の予約状況を確認
        </a>
      </p>

      <p style="font-size:12px;color:#777">
        このメールは送信時点の予約状況です。
        送信後の追加予約は上記ボタンから確認してください。
        予約者情報の取り扱いにご注意ください。
      </p>
    </div>
  `;
}

export async function sendLiveReservationEmails() {
  const today = getTodayJST();

  const { data: lives, error: livesError } =
    await supabaseAdmin
      .from("lives")
      .select("id,date,title,venue,open_time,start_time");

  if (livesError) throw livesError;

  const todayLives = ((lives || []) as Live[]).filter(
    (live) => normalizeDate(live.date) === today
  );

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!resendKey || !fromEmail) {
    throw new Error("Resend configuration is missing");
  }

  const resend = new Resend(resendKey);

  const results = [];

  for (const live of todayLives) {
    // PRIMARY KEYにより同じ公演の重複送信を抑止
    const { error: claimError } = await supabaseAdmin
      .from("live_email_notifications")
      .insert({
        live_id: live.id,
        status: "sending",
      });

    if (claimError) {
      if (claimError.code === "23505") {
        results.push({
          liveId: live.id,
          status: "already_processed",
        });
        continue;
      }

      throw claimError;
    }

    let emailAccepted = false;

    try {
      const { data: reservations, error: reservationsError } =
        await supabaseAdmin
          .from("reservations")
          .select(
            "id,name,people_count,is_student,note,created_at"
          )
          .eq("live_id", live.id)
          .order("created_at", { ascending: true });

      if (reservationsError) throw reservationsError;

      const { data, error: emailError } =
        await resend.emails.send({
          from: fromEmail,
          to: [TO_EMAIL],
          subject: `【inScarled】本日の予約一覧｜${live.title}`,
          html: buildEmail(
            live,
            (reservations || []) as Reservation[]
          ),
        });

      if (emailError || !data?.id) {
        throw new Error(
          emailError?.message || "Email send failed"
        );
      }

      emailAccepted = true;

      const { error: updateError } = await supabaseAdmin
        .from("live_email_notifications")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("live_id", live.id);

      if (updateError) throw updateError;

      results.push({
        liveId: live.id,
        status: "sent",
      });
    } catch (error) {
      // 送信前の失敗なら、再試行できるよう履歴を削除
      // 送信受付後の失敗なら、重複送信防止のため残す
      if (!emailAccepted) {
        await supabaseAdmin
          .from("live_email_notifications")
          .delete()
          .eq("live_id", live.id)
          .eq("status", "sending");
      }

      results.push({
        liveId: live.id,
        status: "failed",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  }

  return {
    date: today,
    checkedLives: todayLives.length,
    results,
  };
}
