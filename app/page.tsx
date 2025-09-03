import data from "@/data/entertainment.json";

type EntItem = {
  id?: string;
  title: string;
  url: string;
  isoDate?: string | null;
  author?: string | null;
  subreddit?: string | null;
  image?: string | null;
  source?: string | null;
};

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

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Goatland</h1>
        <p className="text-gray-600">MVP homepage</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Entertainment (Live)</h2>
        {items.length === 0 ? (
          <p className="text-gray-700">No stories yet. Check back soon.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.url} className="rounded-lg border p-4 hover:bg-gray-50">
                <a
                  href={i.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline decoration-dotted underline-offset-4"
                >
                  {i.title}
                </a>
                <div className="text-xs text-gray-500 mt-1">
                  {(i.subreddit ? `r/${i.subreddit}` : i.source ?? "reddit")}
                  {formatDate(i.isoDate) ? ` • ${formatDate(i.isoDate)}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Sports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4"><h3 className="font-medium">MLB</h3><p className="text-sm text-gray-600">Placeholder</p></div>
          <div className="rounded-lg border p-4"><h3 className="font-medium">NFL</h3><p className="text-sm text-gray-600">Placeholder</p></div>
          <div className="rounded-lg border p-4"><h3 className="font-medium">F1</h3><p className="text-sm text-gray-600">Placeholder</p></div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Today in History</h2>
        <p className="text-gray-700">Placeholder fact for now.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Recipes</h2>
        <p className="text-gray-700">Placeholder ideas.</p>
      </section>
    </main>
  );
}
