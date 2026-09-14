"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ShowActions({
  showId,
  compact,
}: {
  showId: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function act(
    status: "watching" | "finished" | "dropped" | "want",
    extras?: { setFavorite?: boolean }
  ) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId,
          status,
          setCurrentlyWatching: status === "watching",
          ...extras,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Failed");
      } else {
        if (data.awards?.length) {
          setMsg(`Unlocked: ${data.awards.map((a: { award: { name: string } }) => a.award.name).join(", ")}`);
        } else {
          setMsg(status === "finished" ? "Marked finished!" : "Updated");
        }
        router.refresh();
      }
    } catch {
      setMsg("Network error");
    }
    setBusy(false);
  }

  async function setFavorite() {
    setBusy(true);
    await fetch("/api/watch", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setFavorite", showId }),
    });
    setMsg("Set as favorite");
    setBusy(false);
    router.refresh();
  }

  const btn = compact
    ? "rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium text-violet-100 hover:bg-white/10 disabled:opacity-50"
    : "rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-violet-100 hover:bg-white/10 disabled:opacity-50";

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className={btn} disabled={busy} onClick={() => act("watching")}>
          Watching
        </button>
        <button type="button" className={btn} disabled={busy} onClick={() => act("finished")}>
          Finished
        </button>
        <button type="button" className={btn} disabled={busy} onClick={() => act("want")}>
          Want
        </button>
        <button type="button" className={btn} disabled={busy} onClick={setFavorite}>
          ★ Favorite
        </button>
      </div>
      {msg && <p className="mt-1 text-[11px] text-brand-300">{msg}</p>}
    </div>
  );
}
