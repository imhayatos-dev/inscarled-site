import { NextRequest, NextResponse } from "next/server";
import { sendLiveReservationEmails } from "@/lib/sendLiveReservationEmails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (
    !secret ||
    request.headers.get("authorization") !== `Bearer ${secret}`
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const result = await sendLiveReservationEmails();

    if (result.results.some((item) => item.status === "failed")) {
      console.error("Reservation email failures:", result.results);

      return NextResponse.json(
        { error: "Some emails failed", result },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Reservation email cron error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}