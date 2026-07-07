"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ReservationFormProps = {
  liveId: string;
  liveTitle: string;
  onClose: () => void;
};

export default function ReservationForm({
  liveId,
  liveTitle,
  onClose,
}: ReservationFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    people_count: "1",
    is_student: false,
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("reservations").insert([
      {
        live_id: liveId,
        name: form.name,
        people_count: Number(form.people_count),
        is_student: form.is_student,
        note: form.note,
      },
    ]);

    if (error) {
      console.error(error);
      alert("予約に失敗しました。もう一度お試しください。");
      return;
    }

    router.push("/reserve-complete");
  };

  return (
    <div className="reservation-modal">
      <div className="reservation-modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <form className="reservation-form" onSubmit={handleSubmit}>
          <h2>RESERVATION</h2>

          <p className="selected-live">{liveTitle}</p>

          <label>
            お名前
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          </label>

          <label>
            人数
            <input
              type="number"
              min="1"
              value={form.people_count}
              onChange={(e) =>
                setForm({ ...form, people_count: e.target.value })
              }
              required
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.is_student}
              onChange={(e) =>
                setForm({ ...form, is_student: e.target.checked })
              }
            />
            高校生以下を含む
          </label>

          <label>
            備考
            <textarea
              value={form.note}
              onChange={(e) =>
                setForm({ ...form, note: e.target.value })
              }
              placeholder="任意"
            />
          </label>

          <button type="submit">予約する</button>
        </form>
      </div>
    </div>
  );
}