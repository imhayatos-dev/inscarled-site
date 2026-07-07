"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Reservation = {
  id: string;
  created_at: string;
  name: string;
  people_count: number;
  is_student: boolean;
  note: string;

  lives: {
    date: string;
    title: string;
    venue: string;
  };
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      const { data, error } = await supabase
  .from("reservations")
  .select(`
    *,
    lives (
      date,
      title,
      venue
    )
  `)
  .order("created_at", { ascending: false });

      if (error) {
        console.error("予約取得エラー:", error);
        setLoading(false);
        return;
      }

      setReservations(data || []);
      setLoading(false);
    };

    fetchReservations();
  }, []);

  return (
    <main className="admin-page">
      <h1>Reservations</h1>

      <section className="admin-section">
        <h2>予約一覧</h2>

        {loading && <p>Loading...</p>}

        {!loading && reservations.length === 0 && (
          <p>まだ予約はありません。</p>
        )}

        <div className="reservation-list">
          {reservations.map((reservation) => (
            <div className="reservation-card" key={reservation.id}>
              <p>
                <strong>名前：</strong>
                {reservation.name}
              </p>

              <p>
                <strong>人数：</strong>
                {reservation.people_count}名
              </p>

              <p>
                <strong>高校生以下：</strong>
                {reservation.is_student ? "含む" : "含まない"}
              </p>

              <p>
                <strong>備考：</strong>
                {reservation.note || "なし"}
              </p>

              <p>
                <strong>予約日時：</strong>
                {new Date(reservation.created_at).toLocaleString("ja-JP")}
              </p>

              <p>
  <strong>ライブ：</strong>
  {reservation.lives.date}　{reservation.lives.title}
</p>

<p>
  <strong>会場：</strong>
  {reservation.lives.venue}
</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}