import Link from "next/link";
import data from "@/data/entertainment.json";

type EntItem = {
  id?: string;
  title: string;
  url: string;      // original article (preferred)
  reddit?: string;  // reddit thread
  isoDate?: string | null;
  author?: string | null;
  subreddit?: string | null;
  image?: string | null;
  source?: string | null;
  summary?: string | null;
};

function hostFrom(url?: string | null) {
  if (!url) return null;
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return null; }
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

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Goatland</h1>
        <p className="text-gray-600">MVP homepage</p>
      </header>

      {/* Entertainment — one featured only */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Entertainment</h2>
          <Link href="/entertainment" className="text-sm text-blue-600 hover:underline">More Entertainment →</Link>
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
                >Reddit</a>
              ) : null}
            </div>
            {featured.summary ? (
              <p className="text-sm md:text-base text-gray-800 leading-7 mt-3">{featured.summary}</p>
            ) : null}
          </article>
        )}
      </section>

      {/* Sports placeholders */}
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Sports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4"><h3 className="font-medium">MLB</h3><p className="text-sm text-gray-600">Placeholder</p></div>
          <div className="rounded-lg border p-4"><h3 className="font-medium">NFL</h3><p className="text-sm text-gray-600">Placeholder</p></div>
          <div className="rounded-lg border p-4"><h3 className="font-medium">F1</h3><p className="text-sm text-gray-600">Placeholder</p></div>
        </div>
      </section>

      {/* Today in History */}
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Today in History</h2>
        <p className="text-gray-700">Placeholder fact for now.</p>
      </section>

      {/* Recipes */}
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Recipes</h2>
        <p className="text-gray-700">Placeholder ideas.</p>
      </section>
    </main>
  );
}
