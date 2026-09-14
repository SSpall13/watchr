"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/feed", label: "Feed" },
  { href: "/search", label: "Search" },
  { href: "/friends", label: "Friends" },
  { href: "/profile", label: "Profile" },
];

export function Navbar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0612]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/feed" className="text-lg font-bold tracking-tight text-white">
          Watch<span className="text-brand-400">r</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-500/20 text-brand-200"
                    : "text-violet-200/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {userName && (
            <span className="hidden text-xs text-violet-200/60 md:inline">{userName}</span>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="btn-secondary !min-h-9 !px-3 !py-1.5 !text-xs"
          >
            Sign out
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/10 bg-[#0a0612]/95 backdrop-blur-xl sm:hidden">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-1 flex-col items-center py-2.5 text-xs font-medium ${
                active ? "text-brand-300" : "text-violet-200/50"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
