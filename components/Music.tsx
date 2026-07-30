"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type MusicItem = {
  id: string;
  created_at: string;
  title: string;
  type: string | null;
  price: string | null;
  description: string | null;
  tracks: string | null;
  image_url: string | null;
  is_public: boolean;
};

export default function Music() {
  const [musicList, setMusicList] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMusic = async () => {
      const { data, error } = await supabase
        .from("music")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("MUSIC取得エラー:", error);
        setLoading(false);
        return;
      }

      setMusicList(data || []);
      setLoading(false);
    };

    fetchMusic();
  }, []);

  return (
    <section id="music" className="content-section">
      <h2>MUSIC</h2>

      {loading && <p className="coming-soon">Loading...</p>}

      {!loading && musicList.length === 0 && (
        <p className="coming-soon">Coming Soon</p>
      )}

      <div className="music-list">
        {musicList.map((item) => {
          const trackList =
            item.tracks
              ?.split("\n")
              .map((track) => track.trim())
              .filter(Boolean) || [];

          return (
            <article className="music-item" key={item.id}>
              <div className="music-image-wrapper">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={`${item.title} ジャケット`}
                    className="music-image"
                  />
                ) : (
                  <div className="music-image-placeholder">
                    NO IMAGE
                  </div>
                )}
              </div>

              <div className="music-info">
                {item.type && (
                  <p className="music-type">{item.type}</p>
                )}

                <h3>{item.title}</h3>

                {item.price && (
                  <p className="music-price">{item.price}</p>
                )}

                {item.description && (
                  <p className="music-description">
                    {item.description}
                  </p>
                )}

                {trackList.length > 0 && (
                  <div className="music-tracks">
                    <h4>TRACK LIST</h4>

                    <ol>
                      {trackList.map((track, index) => (
                        <li key={`${item.id}-${index}`}>
                          <span className="track-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span>{track}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}