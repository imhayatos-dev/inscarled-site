
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Preview = {
  title: string;
  url: string;
  path?: string;
};

type MusicItem = {
  id: string;
  title: string;
  tracks: string | null;
  previews: Preview[] | null;
  created_at: string;
};

export default function AdminMusicForm() {
  // 新規MUSIC登録
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Demo");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [tracks, setTracks] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  // 試聴音源管理
  const [musicList, setMusicList] = useState<MusicItem[]>([]);
  const [selectedMusicId, setSelectedMusicId] = useState("");
  const [previewFiles, setPreviewFiles] = useState<
    Record<number, File | null>
  >({});
  const [uploadingIndex, setUploadingIndex] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchMusic = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("music")
      .select("id, title, tracks, previews, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("MUSIC取得エラー:", error);
      setMessage("MUSIC一覧の取得に失敗しました。");
      setLoading(false);
      return;
    }

    const items = (data || []) as MusicItem[];

    setMusicList(items);

    setSelectedMusicId((current) => {
      if (items.some((item) => item.id === current)) {
        return current;
      }

      return items[0]?.id || "";
    });

    setLoading(false);
  };

  useEffect(() => {
    void fetchMusic();
  }, []);

  const selectedMusic = musicList.find(
    (item) => item.id === selectedMusicId
  );

  const trackList = (selectedMusic?.tracks || "")
    .split("\n")
    .map((track) => track.trim())
    .filter(Boolean);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (creating) return;

    setCreating(true);
    setMessage("");

    try {
      let imageUrl = "";

      if (image) {
        const fileName =
          `${Date.now()}-${crypto.randomUUID()}-${image.name}`;

        const { error: uploadError } =
          await supabase.storage
            .from("music-images")
            .upload(fileName, image);

        if (uploadError) {
          throw new Error(uploadError.message);
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
          previews: [],
        });

      if (error) {
        throw new Error(error.message);
      }

      setTitle("");
      setType("Demo");
      setPrice("");
      setDescription("");
      setTracks("");
      setImage(null);
      setIsPublic(true);

      // ファイル入力もリセット
      const fileInput = document.getElementById(
        "music-cover-input"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      setMessage("MUSICを追加しました。");
      await fetchMusic();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "MUSICの追加に失敗しました。"
      );
    } finally {
      setCreating(false);
    }
  };

  const handlePreviewUpload = async (
    trackIndex: number
  ) => {
    if (!selectedMusic) return;

    const file = previewFiles[trackIndex];

    if (!file) {
      setMessage("MP3ファイルを選択してください。");
      return;
    }

    if (
      file.type !== "audio/mpeg" &&
      !file.name.toLowerCase().endsWith(".mp3")
    ) {
      setMessage("MP3形式のファイルを選択してください。");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("MP3ファイルは10MB以下にしてください。");
      return;
    }

    setUploadingIndex(trackIndex);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("musicId", selectedMusic.id);
      formData.append("trackIndex", String(trackIndex));
      formData.append("file", file);

      // 同一オリジンの管理APIへ送信
      const response = await fetch(
        "/api/admin/music-previews",
        {
          method: "POST",
          body: formData,
          credentials: "same-origin",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
          "アップロードに失敗しました。"
        );
      }

      setPreviewFiles((current) => ({
        ...current,
        [trackIndex]: null,
      }));

      const input = document.getElementById(
        `preview-file-${trackIndex}`
      ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }

      setMessage(
        `${trackList[trackIndex]} の試聴音源を登録しました。`
      );

      await fetchMusic();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "アップロードに失敗しました。"
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="admin-music-manager">
      {/* 新規登録 */}
      <form
        className="admin-form"
        onSubmit={handleSubmit}
      >
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
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <textarea
          placeholder={
            "フラッシュバック\n" +
            "オートファジー\n" +
            "EDEN\n" +
            "アンフェイデッドブルー"
          }
          value={tracks}
          onChange={(e) => setTracks(e.target.value)}
        />

        <label>
          ジャケット画像
          <input
            id="music-cover-input"
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files?.[0] || null)
            }
          />
        </label>

        <label className="admin-checkbox-label">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) =>
              setIsPublic(e.target.checked)
            }
          />
          公開する
        </label>

        <button
          type="submit"
          disabled={creating}
        >
          {creating ? "登録中..." : "MUSIC追加"}
        </button>
      </form>

      {/* 試聴音源管理 */}
      <div
        className="admin-form"
        style={{ marginTop: "48px" }}
      >
        <h2>試聴音源管理</h2>

        <p>
          登録済みのリリースを選択して、
          各曲の試聴用MP3をアップロードできます。
        </p>

        {loading ? (
          <p>読み込み中...</p>
        ) : (
          <>
            <label>
              リリースを選択
              <select
                value={selectedMusicId}
                onChange={(e) => {
                  setSelectedMusicId(e.target.value);
                  setPreviewFiles({});
                  setMessage("");
                }}
              >
                {musicList.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.title}
                  </option>
                ))}
              </select>
            </label>

            {selectedMusic &&
              trackList.length === 0 && (
                <p>
                  このリリースには曲目が登録されていません。
                </p>
              )}

            {selectedMusic &&
              trackList.map((track, index) => {
                const preview =
                  selectedMusic.previews?.[index];

                const hasPreview =
                  Boolean(preview?.url);

                return (
                  <div
                    key={`${selectedMusic.id}-${index}`}
                    style={{
                      padding: "20px 0",
                      borderBottom:
                        "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    <h3>
                      {String(index + 1).padStart(2, "0")}
                      {" "}
                      {track}
                    </h3>

                    <p>
                      {hasPreview
                        ? "登録済み"
                        : "未登録"}
                    </p>

                    {hasPreview && (
                      <audio
                        controls
                        preload="none"
                        src={preview?.url}
                        style={{
                          width: "100%",
                          marginBottom: "12px",
                        }}
                      />
                    )}

                    <input
                      id={`preview-file-${index}`}
                      type="file"
                      accept=".mp3,audio/mpeg"
                      onChange={(e) => {
                        const file =
                          e.target.files?.[0] || null;

                        setPreviewFiles((current) => ({
                          ...current,
                          [index]: file,
                        }));
                      }}
                    />

                    <button
                      type="button"
                      disabled={
                        uploadingIndex !== null ||
                        !previewFiles[index]
                      }
                      onClick={() =>
                        handlePreviewUpload(index)
                      }
                      style={{
                        marginTop: "12px",
                      }}
                    >
                      {uploadingIndex === index
                        ? "アップロード中..."
                        : hasPreview
                        ? "試聴音源を差し替える"
                        : "試聴音源を登録"}
                    </button>
                  </div>
                );
              })}
          </>
        )}
      </div>

      {message && (
        <p
          role="status"
          style={{
            marginTop: "20px",
            padding: "12px",
            border:
              "1px solid rgba(255,255,255,0.3)",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
