"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminNewsForm() {
  const [form, setForm] = useState({
    date: "",
    title: "",
    body: "",
    link_url: "",
    link_label: "",
    is_public: true,
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;

      setForm((currentForm) => ({
        ...currentForm,
        [name]: checkbox.checked,
      }));

      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!form.date || !form.title || !form.body) {
      setMessage("日付・タイトル・本文を入力してください。");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const { error } = await supabase.from("news").insert([
      {
        date: form.date,
        title: form.title,
        body: form.body,
        link_url: form.link_url || null,
        link_label: form.link_label || null,
        is_public: form.is_public,
      },
    ]);

    if (error) {
      console.error("NEWS保存エラー:", error);
      setMessage(`保存に失敗しました：${error.message}`);
      setIsSubmitting(false);
      return;
    }

    setMessage("NEWSを保存しました。");

    setForm({
      date: "",
      title: "",
      body: "",
      link_url: "",
      link_label: "",
      is_public: true,
    });

    setIsSubmitting(false);
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2>NEWS追加</h2>

      <label>
        表示日付
        <input
          type="text"
          name="date"
          value={form.date}
          onChange={handleChange}
          placeholder="例：2026.07.30"
          required
        />
      </label>

      <label>
        タイトル
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="例：inScarled 1st Demo 発売決定"
          required
        />
      </label>

      <label>
        本文
        <textarea
          name="body"
          value={form.body}
          onChange={handleChange}
          placeholder={`ライブ会場限定で「inScarled 1st Demo」の販売が決定しました。

4曲入り / ¥1,000

収録曲
1. フラッシュバック
2. オートファジー
3. EDEN
4. アンフェイデッドブルー（inScarled ver）

ぜひライブ会場で手に取っていただけたら嬉しいです。`}
          required
        />
      </label>

      <label>
        関連リンク
        <input
          type="text"
          name="link_url"
          value={form.link_url}
          onChange={handleChange}
          placeholder="例：#music"
        />
      </label>

      <label>
        リンクの文字
        <input
          type="text"
          name="link_label"
          value={form.link_label}
          onChange={handleChange}
          placeholder="例：リリース詳細を見る →"
        />
      </label>

      <label className="admin-checkbox-label">
        <input
          type="checkbox"
          name="is_public"
          checked={form.is_public}
          onChange={handleChange}
        />
        公開する
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "保存中..." : "＋ NEWS追加"}
      </button>

      {message && (
        <p className="admin-message">{message}</p>
      )}
    </form>
  );
}