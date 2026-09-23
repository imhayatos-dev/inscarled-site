"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
};

export default function LiveArchivePage() {
  const [lives, setLives] = useState<Live[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLives = async () => {
      const { data, error } = await supabase
        .from("lives")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("ARCHIVE取得エラー:", error);
        setLoading(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 今日より前のライブだけ
      const archivedLives = (data || []).filter((live) => {
        const liveDate = new Date(`${live.date}T00:00:00`);
        return liveDate < today;
      });

      setLives(archivedLives);
      setLoading(false);
    };

    fetchLives();
  }, []);

  return (
    <main className="archive-page">
      <div className="archive-container">
        <Link href="/#live" className="archive-back">
          ← BACK
        </Link>

        <h1>LIVE ARCHIVE</h1>

        {loading && (
          <p className="coming-soon">Loading...</p>
        )}

        {!loading && lives.length === 0 && (
          <p className="coming-soon">
            No archived lives yet.
          </p>
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

                {live.drink && <p>{live.drink}</p>}

                {live.artists && (
                  <p className="live-artists">
                    {live.artists}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}