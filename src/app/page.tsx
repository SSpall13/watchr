import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MarketingPage() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="badge border-brand-400/30 bg-brand-500/15 text-brand-200">
        Social media for shows & movies
      </p>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
        Watch<span className="text-brand-400">r</span>
      </h1>
      <p className="mt-4 max-w-lg text-lg text-violet-200/70">
        Share what you&apos;re watching, discover recommendations from friends with
        overlapping tastes, and earn awards when you finish a series.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link href="/register" className="btn-primary">
          Get started
        </Link>
        <Link href="/login" className="btn-secondary">
          Log in
        </Link>
      </div>
      <div className="mt-16 grid w-full gap-4 text-left sm:grid-cols-3">
        {[
          { t: "Currently watching", d: "Show friends what you're into right now." },
          { t: "Smart-ish recs", d: "Popular among people with similar tastes." },
          { t: "Awards", d: "Finish a series → unlock Series Finisher badges." },
        ].map((f) => (
          <div key={f.t} className="glass p-4">
            <h3 className="font-semibold text-white">{f.t}</h3>
            <p className="mt-1 text-sm text-violet-200/60">{f.d}</p>
          </div>
        ))}
      </div>
      <p className="mt-12 text-xs text-violet-200/40">
        Demo: demo@watchr.app / demo1234
      </p>
    </main>
  );
}
