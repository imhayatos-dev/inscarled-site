
"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Preview = {
  title: string;
  url: string;
  path?: string;
};

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
  previews: Preview[] | null;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function Music() {
  const [musicList, setMusicList] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTrack, setActiveTrack] = useState<string | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // MUSIC情報をSupabaseから取得
  useEffect(() => {
    let cancelled = false;

    const fetchMusic = async () => {
      const { data, error } = await supabase
        .from("music")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("MUSIC取得エラー:", error);
        setLoading(false);
        return;
      }

      setMusicList((data || []) as MusicItem[]);
      setLoading(false);
    };

    void fetchMusic();

    return () => {
      cancelled = true;
    };
  }, []);

  // コンポーネント終了時に音声を停止
  useEffect(() => {
    return () => {
      const audio = audioRef.current;

      if (audio) {
        audio.pause();
      }
    };
  }, []);

  // 再生・一時停止
  const handlePlay = async (
    trackKey: string,
    url: string
  ) => {
    const audio = audioRef.current;

    if (!audio || !url) return;

    // 同じ曲を押した場合
    if (activeTrack === trackKey) {
      if (!audio.paused) {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      try {
        await audio.play();
      } catch (error) {
        console.error("音声再生エラー:", error);
        setIsPlaying(false);
      }

      return;
    }

    // 別の曲に切り替える
    audio.pause();
    audio.src = url;
    audio.load();

    setActiveTrack(trackKey);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    try {
      await audio.play();
    } catch (error) {
      // 連続クリックで再生が中断された場合もある
      if (audio.src === url) {
        console.error("音声再生エラー:", error);
        setIsPlaying(false);
      }
    }
  };

  // シークバー操作
  const handleSeek = (time: number) => {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(duration) || duration <= 0) {
      return;
    }

    const nextTime = Math.max(0, Math.min(time, duration));

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <section id="music" className="content-section">
      <h2>MUSIC</h2>

      {/* 全曲共通の非表示オーディオ */}
      <audio
        ref={audioRef}
        preload="none"
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
        }}
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration;

          setDuration(Number.isFinite(value) ? value : 0);
        }}
        onDurationChange={(event) => {
          const value = event.currentTarget.duration;

          setDuration(Number.isFinite(value) ? value : 0);
        }}
        onPlay={() => {
          setIsPlaying(true);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);

          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
        }}
        onError={() => {
          setIsPlaying(false);
        }}
      />

      {loading && (
        <p className="coming-soon">Loading...</p>
      )}

      {!loading && musicList.length === 0 && (
        <p className="coming-soon">Coming Soon</p>
      )}

      <div className="music-list">
        {musicList.map((item) => {
          const trackList = (item.tracks || "")
            .split("\n")
            .map((track) => track.trim())
            .filter(Boolean);

          return (
            <article
              className="music-item"
              key={item.id}
            >
              {/* ジャケット画像 */}
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

              {/* リリース情報 */}
              <div className="music-info">
                {item.type && (
                  <p className="music-type">
                    {item.type}
                  </p>
                )}

                <h3>{item.title}</h3>

                {item.price && (
                  <p className="music-price">
                    {item.price}
                  </p>
                )}

                {item.description && (
                  <p className="music-description">
                    {item.description}
                  </p>
                )}

                {/* 曲目一覧 */}
                {trackList.length > 0 && (
                  <div className="music-tracks">
                    <h4>TRACK LIST</h4>

                    <ol>
                      {trackList.map((track, index) => {
                        const preview =
                          item.previews?.[index];

                        const hasPreview =
                          Boolean(preview?.url);

                        const trackKey =
                          `${item.id}-${index}`;

                        const isActive =
                          activeTrack === trackKey;

                        const safeDuration =
                          isActive &&
                          Number.isFinite(duration) &&
                          duration > 0
                            ? duration
                            : 0;

                        const safeCurrentTime =
                          isActive
                            ? Math.min(
                                currentTime,
                                safeDuration
                              )
                            : 0;

                        return (
                          <li
                            className="music-track-item"
                            key={trackKey}
                          >
                            {/* 上段：曲番号・曲名 */}
                            <div className="music-track-heading">
                              <span className="track-number">
                                {String(index + 1).padStart(
                                  2,
                                  "0"
                                )}
                              </span>

                              <span className="music-track-title">
                                {track}
                              </span>
                            </div>

                            {/* 下段：試聴プレイヤー */}
                            {hasPreview && (
                              <div className="music-track-player">
                                <button
                                  type="button"
                                  className={
                                    "music-play-button" +
                                    (isActive && isPlaying
                                      ? " is-playing"
                                      : "")
                                  }
                                  onClick={() =>
                                    void handlePlay(
                                      trackKey,
                                      preview!.url
                                    )
                                  }
                                  aria-label={
                                    isActive && isPlaying
                                      ? `${track}を一時停止`
                                      : `${track}を再生`
                                  }
                                  aria-pressed={
                                    isActive && isPlaying
                                  }
                                >
                                  {isActive && isPlaying
                                    ? "Ⅱ"
                                    : "▶"}
                                </button>

                                <div className="music-player-details">
                                  <span className="music-preview-label">
                                    PREVIEW
                                  </span>

                                  <div className="music-preview-controls">
                                    <span className="music-preview-time">
                                      {formatTime(
                                        safeCurrentTime
                                      )}
                                    </span>

                                    <input
                                      type="range"
                                      min={0}
                                      max={safeDuration}
                                      step={0.1}
                                      value={safeCurrentTime}
                                      disabled={
                                        !isActive ||
                                        safeDuration <= 0
                                      }
                                      onChange={(event) =>
                                        handleSeek(
                                          Number(
                                            event.target.value
                                          )
                                        )
                                      }
                                      aria-label={
                                        `${track}の再生位置`
                                      }
                                      className="music-preview-seek"
                                    />

                                    <span className="music-preview-time">
                                      {safeDuration > 0
                                        ? formatTime(
                                            safeDuration
                                          )
                                        : "--:--"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </li>
                        );
                      })}
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
