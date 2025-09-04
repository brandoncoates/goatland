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

export const metadata = {
    title: "Entertainment — Goatland",
    description: "Entertainment stories aggregated for Goatland",
};

export default function EntertainmentPage() {
    const items = ((data as any)?.items ?? []) as EntItem[];

    return (
        <main className="mx-auto max-w-5xl p-6 space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold">Entertainment</h1>
                <p className="text-gray-600">Latest stories with short synopses.</p>
            </header>

            {items.length === 0 ? (
                <p className="text-gray-700">No stories yet. Check back soon.</p>
            ) : (
                <ul className="space-y-4">
                    {items.map((i) => (
                        <li key={i.url} className="rounded-xl border p-5 hover:bg-gray-50">
                            <div className="space-y-2">
                                <a
                                    href={i.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-lg font-semibold underline decoration-dotted underline-offset-4"
                                >
                                    {i.title}
                                </a>
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                    {hostFrom(i.url) ? <span>{hostFrom(i.url)}</span> : null}
                                    {formatDate(i.isoDate) ? <span>• {formatDate(i.isoDate)}</span> : null}
                                    {i.reddit ? (
                                        <a
                                            href={i.reddit}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                            aria-label="View Reddit discussion"
                                        >Reddit</a>
                                    ) : null}
                                </div>
                                {i.summary ? (
                                    <p className="text-sm text-gray-800 leading-6">{i.summary}</p>
                                ) : null}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
