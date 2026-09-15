import Link from "next/link";
import { serviceBadgeClass } from "@/lib/streaming";

type ShowLike = {
  id: string;
  title: string;
  year?: number | null;
  posterUrl?: string | null;
  mediaType?: string | null;
  genre?: string | null;
  overview?: string | null;
  streamingService?: string | null;
};

function ServiceBadge({ service }: { service?: string | null }) {
  if (!service) return null;
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${serviceBadgeClass(service)}`}
    >
      {service}
    </span>
  );
}

export function ShowCard({
  show,
  subtitle,
  actions,
  compact,
}: {
  show: ShowLike;
  subtitle?: string;
  actions?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`glass flex gap-3 p-3 ${compact ? "" : "sm:p-4"}`}>
      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-white/10 sm:h-28 sm:w-20">
        {show.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={show.posterUrl}
            alt={show.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">📺</div>
        )}
        {show.streamingService && (
          <div className="absolute bottom-1 left-1 right-1">
            <ServiceBadge service={show.streamingService} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-semibold text-white">{show.title}</h3>
          <ServiceBadge service={show.streamingService} />
        </div>
        <p className="mt-0.5 text-xs text-violet-200/60">
          {[show.year, show.mediaType, show.genre].filter(Boolean).join(" · ")}
        </p>
        {subtitle && <p className="mt-1 text-sm text-violet-100/80">{subtitle}</p>}
        {!compact && show.overview && (
          <p className="mt-1 line-clamp-2 text-xs text-violet-200/50">{show.overview}</p>
        )}
        {actions && <div className="mt-2 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function ShowPosterLink({
  show,
  href,
}: {
  show: ShowLike;
  href?: string;
}) {
  const inner = (
    <div className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-brand-400/40">
      <div className="relative aspect-[2/3] bg-white/10">
        {show.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={show.posterUrl}
            alt={show.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">📺</div>
        )}
        {show.streamingService && (
          <div className="absolute bottom-2 left-2">
            <ServiceBadge service={show.streamingService} />
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-xs font-medium text-white">{show.title}</p>
        {show.year && <p className="text-[10px] text-violet-200/50">{show.year}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
