"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { STREAMING_SERVICES } from "@/lib/streaming";

export function ServiceFilter({
  initialService,
  initialQ,
}: {
  initialService?: string;
  initialQ?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current =
    initialService || searchParams.get("service") || "";

  function select(service: string) {
    const params = new URLSearchParams(searchParams.toString());
    const q = initialQ ?? params.get("q") ?? "";
    if (q) params.set("q", q);
    else params.delete("q");
    if (service) params.set("service", service);
    else params.delete("service");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => select("")}
        className={`rounded-full border px-3 py-1 text-xs transition ${
          !current
            ? "border-brand-400/60 bg-brand-500/20 text-brand-100"
            : "border-white/10 bg-white/5 text-violet-200/70 hover:border-white/25"
        }`}
      >
        All services
      </button>
      {STREAMING_SERVICES.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => select(s)}
          className={`rounded-full border px-3 py-1 text-xs transition ${
            current === s
              ? "border-brand-400/60 bg-brand-500/20 text-brand-100"
              : "border-white/10 bg-white/5 text-violet-200/70 hover:border-white/25"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
