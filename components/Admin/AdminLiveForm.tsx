"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminLiveForm() {
  const [form, setForm] = useState({
    date: "",
    title: "",
    venue: "",
    open_time: "",
    start_time: "",
    adv_price: "",
    door_price: "",
    drink: "",
    artists: "",
    ticket: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = "";

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("live-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error(uploadError);
        setMessage("画像アップロードに失敗しました");
        return;
      }

      const { data } = supabase.storage
        .from("live-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("lives").insert([
      {
        ...form,
        image: imageUrl,
      },
    ]);

    if (error) {
      console.error(error);
      setMessage("保存に失敗しました");
      return;
    }

    setMessage("ライブ情報を保存しました");

    setForm({
      date: "",
      title: "",
      venue: "",
      open_time: "",
      start_time: "",
      adv_price: "",
      door_price: "",
      drink: "",
      artists: "",
      ticket: "",
    });

    setImageFile(null);
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2>LIVE追加</h2>

      <input name="date" value={form.date} onChange={handleChange} placeholder="日付 例：2026.08.01 SAT" />
      <input name="title" value={form.title} onChange={handleChange} placeholder="タイトル 例：safari" />
      <input name="venue" value={form.venue} onChange={handleChange} placeholder="会場 例：札幌 SOUND CRUE" />
      <input name="open_time" value={form.open_time} onChange={handleChange} placeholder="OPEN 例：18:00" />
      <input name="start_time" value={form.start_time} onChange={handleChange} placeholder="START 例：18:30" />
      <input name="adv_price" value={form.adv_price} onChange={handleChange} placeholder="前売り 例：¥2,000" />
      <input name="door_price" value={form.door_price} onChange={handleChange} placeholder="当日 例：¥2,500" />
      <input name="drink" value={form.drink} onChange={handleChange} placeholder="ドリンク 例：+1drink ¥600" />

      <textarea
        name="artists"
        value={form.artists}
        onChange={handleChange}
        placeholder="出演者"
      />

      <label className="file-label">
        フライヤー画像
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setImageFile(e.target.files?.[0] || null);
          }}
        />
      </label>

      <input name="ticket" value={form.ticket} onChange={handleChange} placeholder="チケットURL" />

      <button type="submit">＋ ライブ追加</button>

      {message && <p className="admin-message">{message}</p>}
    </form>
  );
}