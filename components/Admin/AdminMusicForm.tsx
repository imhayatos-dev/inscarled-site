"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminMusicForm() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Demo");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [tracks, setTracks] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = "";

    if (image) {
      const fileName = `${Date.now()}-${image.name}`;

      const { error: uploadError } = await supabase.storage
        .from("music-images")
        .upload(fileName, image);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("music-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("music")
      .insert({
        title,
        type,
        price,
        description,
        tracks,
        image_url: imageUrl,
        is_public: isPublic,
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("追加しました！");

    setTitle("");
    setType("Demo");
    setPrice("");
    setDescription("");
    setTracks("");
    setImage(null);
    setIsPublic(true);
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2>MUSIC追加</h2>

      <input
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option>Demo</option>
        <option>Single</option>
        <option>EP</option>
        <option>Album</option>
      </select>

      <input
        placeholder="価格"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <textarea
        placeholder="説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <textarea
        placeholder={`フラッシュバック
オートファジー
EDEN
アンフェイデッドブルー`}
        value={tracks}
        onChange={(e) => setTracks(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setImage(e.target.files?.[0] || null)
        }
      />

      <label className="admin-checkbox-label">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        公開する
      </label>

      <button type="submit">
        MUSIC追加
      </button>
    </form>
  );
}