"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddFriendButton({ friendId }: { friendId: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function request() {
    setBusy(true);
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "request", friendId }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) setMsg(data.error || "Failed");
    else {
      setMsg("Request sent");
      router.refresh();
    }
  }

  return (
    <div>
      <button type="button" className="btn-primary !text-xs" disabled={busy} onClick={request}>
        Add friend
      </button>
      {msg && <p className="mt-1 text-xs text-violet-200/70">{msg}</p>}
    </div>
  );
}
