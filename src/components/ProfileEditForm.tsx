"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProfileEditForm({
  name,
  bio,
}: {
  name: string;
  bio: string | null;
}) {
  const router = useRouter();
  const [n, setN] = useState(name);
  const [b, setB] = useState(bio || "");
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: n, bio: b || null }),
    });
    if (res.ok) {
      setMsg("Saved");
      setOpen(false);
      router.refresh();
    } else {
      setMsg("Failed to save");
    }
  }

  if (!open) {
    return (
      <button type="button" className="btn-secondary !text-xs" onClick={() => setOpen(true)}>
        Edit profile
      </button>
    );
  }

  return (
    <form onSubmit={save} className="mt-2 space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
      <input className="input-field" value={n} onChange={(e) => setN(e.target.value)} placeholder="Name" />
      <textarea
        className="input-field min-h-[80px]"
        value={b}
        onChange={(e) => setB(e.target.value)}
        placeholder="Bio"
        maxLength={280}
      />
      <div className="flex gap-2">
        <button type="submit" className="btn-primary !text-xs">
          Save
        </button>
        <button type="button" className="btn-secondary !text-xs" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
      {msg && <p className="text-xs text-brand-300">{msg}</p>}
    </form>
  );
}
