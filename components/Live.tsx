"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ReservationForm from "@/components/ReservationForm";

type Live = {
  id: string;
  date: string;
  title: string;
  venue: string;
  open_time: string;
  start_time: string;
  adv_price: string;
  door_price: string;
  drink: string;
  artists: string;
  image: string;
  ticket: string;
};

// "2026.8.30" "2026/8/30" "2026-08-30"
// などを確実にDateへ変換
function parseLiveDate(dateString: string) {
  const match = dateString.match(
    /(\d{4})[.\-/年]\s*(\d{1,2})[.\-/月]\s*(\d{1,2})/
  );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return new Date(year, month - 1, day);
}

export default function Live() {
  const [lives, setLives] = useState<Live[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLive, setSelectedLive] = useState<Live | null>(null);

  useEffect(() => {
    const fetchLives = async () => {
      const { data, error } = await supabase
        .from("lives")
        .select("*");

      if (error) {
        console.error("LIVE取得エラー:", error);
        setLoading(false);
        return;
      }

      const today = new Date();

      // 今日の0:00
      today.setHours(0, 0, 0, 0);

      const upcomingLives = (data || [])
        .filter((live) => {
          const liveDate = parseLiveDate(live.date);

          if (!liveDate) {
            console.warn("日付を解析できません:", live.date);
            return false;
          }

          // 今日を含む未来のライブ
          return liveDate >= today;
        })
        .sort((a, b) => {
          const dateA = parseLiveDate(a.date)?.getTime() ?? 0;
          const dateB = parseLiveDate(b.date)?.getTime() ?? 0;

          return dateA - dateB;
        });

      setLives(upcomingLives);
      setLoading(false);
    };

    fetchLives();
  }, []);

  return (
    <section id="live" className="content-section">
      <h2>LIVE</h2>

      {loading && (
        <p className="coming-soon">Loading...</p>
      )}

      {!loading && lives.length === 0 && (
        <p className="coming-soon">Coming Soon</p>
      )}

      <div className="live-list">
        {lives.map((live) => (
          <div className="live-card" key={live.id}>
            {live.image && (
              <img
                src={live.image}
                alt={live.title}
                className="live-image"
              />
            )}

            <div className="live-info">
              <p className="live-date">
                {live.date}
              </p>

              <h3>{live.title}</h3>

              <p>{live.venue}</p>

              <p>
                open {live.open_time} / start {live.start_time}
              </p>

              <p>
                adv {live.adv_price} / door {live.door_price}
              </p>

              {live.drink && (
                <p>{live.drink}</p>
              )}

              {live.artists && (
                <p className="live-artists">
                  {live.artists}
                </p>
              )}

              <button
                className="ticket-button"
                onClick={() => setSelectedLive(live)}
              >
                予約する
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="live-archive-link">
        <Link href="/live/archive">
          VIEW ARCHIVE →
        </Link>
      </div>

      {selectedLive && (
        <ReservationForm
          liveId={selectedLive.id}
          liveTitle={`${selectedLive.date} ${selectedLive.title}｜${selectedLive.venue}`}
          onClose={() => setSelectedLive(null)}
        />
      )}
    </section>
  );
}