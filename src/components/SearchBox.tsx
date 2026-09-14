"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox({ initial }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial || "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        className="input-field"
        placeholder="Search by title or genre…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button type="submit" className="btn-primary shrink-0">
        Search
      </button>
    </form>
  );
}
