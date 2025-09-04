'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import data from "@/data/entertainment.json";

type EntItem = {
  id?: string;
  title: string;
  url: string; // original article (preferred)
  reddit?: string; // reddit thread
  isoDate?: string | null;
  author?: string | null;
  subreddit?: string | null;
  image?: string | null;
  source?: string | null;
  summary?: string | null;
};

type HistoryItem = {
  year: number;
  text: string;
  link?: string | null;
};

type HistoryPayload = {
  date: string; // MM-DD
  items: HistoryItem[];
};

function hostFrom(url?: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function formatDate(iso?: string | null) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));
  } catch {
    return null;
  }
}

export default function Home() {
  const items = ((data as any)?.items ?? []) as EntItem[];
  const featured = items[0];

  const [history, setHistory] = useState<HistoryPayload | null>(null);
  const [histError, setHistError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/history", { cache: "no-store" });
        if (!res.ok) throw new Error(`history ${res.status}`);
        const json = (await res.json()) as HistoryPayload;
        if (!cancelled) setHistory(json);
      } catch (e: any) {
        if (!cancelled) setHistError(String(e?.message || e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hist = history?.items?.[0];

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-10">
      {/* Hero (no stretch: keep intrinsic size, centered) */}
      <section aria-label="Hero" className="flex justify-center">
        <Image
          src="/images/welcome-hero.png"
          alt="Welcome to Goatland"
          width={1200}
          height={400}
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          style={{ width: "auto", height: "auto" }}
          className="rounded-xl border max-w-full h-auto"
        />
      </section>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Goatland</h1>
        <p className="text-gray-600">Headlines and happenings.</p>
      </header>

      {/* Entertainment — one featured only */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Entertainment</h2>
          <Link href="/entertainment" className="text-sm text-blue-600 hover:underline">
            More Entertainment →
          </Link>
        </div>

        {!featured ? (
          <p className="text-gray-700">No stories yet. Check back soon.</p>
        ) : (
          <article className="rounded-xl border p-5 md:p-6 hover:bg-gray-50">
            <a
              href={featured.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg md:text-xl font-semibold underline decoration-dotted underline-offset-4"
            >
              {featured.title}
            </a>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              {hostFrom(featured.url) ? <span>{hostFrom(featured.url)}</span> : null}
              {formatDate(featured.isoDate) ? <span>• {formatDate(featured.isoDate)}</span> : null}
              {featured.reddit ? (
                <a
                  href={featured.reddit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                  aria-label="View Reddit discussion"
                >
                  Reddit
                </a>
              ) : null}
            </div>
            {featured.summary ? (
              <p className="text-sm md:text-base text-gray-800 leading-7 mt-3">{featured.summary}</p>
            ) : null}
          </article>
        )}
      </section>

      {/* Today in History */}
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Today in History</h2>
        {!history && !histError ? (
          <p className="text-gray-600 text-sm">Loading…</p>
        ) : hist ? (
          <p className="text-gray-800 leading-7">
            <span className="font-medium">{hist.year}</span> — {hist.text}{" "}
            {hist.link ? (
              <a
                className="text-blue-600 hover:underline"
                href={hist.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                (Wikipedia)
              </a>
            ) : null}
          </p>
        ) : (
          <p className="text-gray-700">No event available.</p>
        )}
      </section>

      {/* Sports placeholders */}
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Sports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">MLB</h3>
            <p className="text-sm text-gray-600">Placeholder</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">NFL</h3>
            <p className="text-sm text-gray-600">Placeholder</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">F1</h3>
            <p className="text-sm text-gray-600">Placeholder</p>
          </div>
        </div>
      </section>

      {/* Recipes */}
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Recipes</h2>
        <p className="text-gray-700">Placeholder ideas.</p>
      </section>
    </main>
  );
}

