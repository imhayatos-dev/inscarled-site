"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type NewsItem = {
  id: string;
  date: string;
  title: string;
  body: string;
  link_url: string | null;
  link_label: string | null;
};

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("NEWS取得エラー:", error);
        setLoading(false);
        return;
      }

      setNews(data || []);
      setLoading(false);
    };

    fetchNews();
  }, []);

  return (
    <section id="news" className="content-section">
      <h2>NEWS</h2>

      {loading && <p className="coming-soon">Loading...</p>}

      {!loading && news.length === 0 && (
        <p className="coming-soon">Coming Soon</p>
      )}

      <div className="news-list">
        {news.map((item) => (
          <a
            key={item.id}
            href={item.link_url || "#"}
            className="news-list-item"
          >
            <time className="news-date">{item.date}</time>

            <h3>{item.title}</h3>

            <span className="news-arrow">→</span>
          </a>
        ))}
      </div>
    </section>
  );
}