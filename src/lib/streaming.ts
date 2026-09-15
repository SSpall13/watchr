export const STREAMING_SERVICES = [
  "Netflix",
  "Max",
  "Disney+",
  "Hulu",
  "Prime Video",
  "Apple TV+",
  "Peacock",
  "Paramount+",
  "Theatrical",
] as const;

export type StreamingService = (typeof STREAMING_SERVICES)[number];

const SERVICE_COLORS: Record<string, string> = {
  Netflix: "bg-red-600/90 text-white",
  Max: "bg-indigo-500/90 text-white",
  "Disney+": "bg-blue-600/90 text-white",
  Hulu: "bg-emerald-500/90 text-black",
  "Prime Video": "bg-sky-500/90 text-white",
  "Apple TV+": "bg-zinc-200/90 text-black",
  Peacock: "bg-yellow-400/90 text-black",
  "Paramount+": "bg-blue-400/90 text-white",
  Theatrical: "bg-amber-600/90 text-white",
};

export function serviceBadgeClass(service?: string | null) {
  if (!service) return "bg-white/15 text-violet-100";
  return SERVICE_COLORS[service] || "bg-white/15 text-violet-100";
}
