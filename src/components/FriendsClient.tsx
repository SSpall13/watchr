"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type UserLite = {
  id: string;
  name: string;
  email: string;
  currentlyWatching: { title: string } | null;
};

type Row = { friendshipId: string; user: UserLite };

export function FriendsClient({
  friends,
  incoming,
  outgoing,
  suggestions,
}: {
  friends: Row[];
  incoming: Row[];
  outgoing: Row[];
  suggestions: UserLite[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function api(body: Record<string, unknown>) {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) setMsg(data.error || "Failed");
    else {
      setMsg("Done");
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <section className="glass p-4">
        <h2 className="font-semibold text-white">Add by email</h2>
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            api({ action: "request", email });
          }}
        >
          <input
            className="input-field max-w-sm"
            type="email"
            placeholder="friend@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={busy}>
            Send request
          </button>
        </form>
        {msg && <p className="mt-2 text-xs text-brand-300">{msg}</p>}
      </section>

      {incoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">
            Requests ({incoming.length})
          </h2>
          <div className="space-y-2">
            {incoming.map((r) => (
              <div key={r.friendshipId} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link href={`/users/${r.user.id}`} className="font-medium text-brand-200 hover:underline">
                    {r.user.name}
                  </Link>
                  <p className="text-xs text-violet-200/50">{r.user.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-primary !text-xs"
                    disabled={busy}
                    onClick={() => api({ action: "accept", friendshipId: r.friendshipId })}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="btn-secondary !text-xs"
                    disabled={busy}
                    onClick={() => api({ action: "decline", friendshipId: r.friendshipId })}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Your friends</h2>
        {friends.length === 0 ? (
          <p className="text-sm text-violet-200/50">No friends yet</p>
        ) : (
          <div className="space-y-2">
            {friends.map((r) => (
              <div key={r.friendshipId} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link href={`/users/${r.user.id}`} className="font-medium text-brand-200 hover:underline">
                    {r.user.name}
                  </Link>
                  <p className="text-xs text-violet-200/50">
                    {r.user.currentlyWatching
                      ? `Watching ${r.user.currentlyWatching.title}`
                      : "Not watching anything"}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-danger !text-xs"
                  disabled={busy}
                  onClick={() => api({ action: "remove", friendshipId: r.friendshipId })}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {outgoing.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Outgoing</h2>
          <div className="space-y-2">
            {outgoing.map((r) => (
              <div key={r.friendshipId} className="glass flex items-center justify-between p-4">
                <span className="text-sm text-violet-100">{r.user.name} — pending</span>
                <button
                  type="button"
                  className="btn-secondary !text-xs"
                  disabled={busy}
                  onClick={() => api({ action: "remove", friendshipId: r.friendshipId })}
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {suggestions.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Suggestions</h2>
          <div className="space-y-2">
            {suggestions.map((u) => (
              <div key={u.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link href={`/users/${u.id}`} className="font-medium text-brand-200 hover:underline">
                    {u.name}
                  </Link>
                  <p className="text-xs text-violet-200/50">{u.email}</p>
                </div>
                <button
                  type="button"
                  className="btn-primary !text-xs"
                  disabled={busy}
                  onClick={() => api({ action: "request", friendId: u.id })}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
