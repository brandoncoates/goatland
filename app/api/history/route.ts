import { NextResponse } from "next/server";

// Always compute fresh (avoid static build-time data)
export const dynamic = "force-dynamic";

function denverMonthDay() {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Denver",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());
    const mm = parts.find((p) => p.type === "month")?.value || "01";
    const dd = parts.find((p) => p.type === "day")?.value || "01";
    return { mm, dd };
}

export async function GET() {
    const { mm, dd } = denverMonthDay();
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`;

    try {
        const res = await fetch(url, {
            headers: {
                "user-agent": "Goatland/1.0 (+https://goatland.net)",
                accept: "application/json",
            },
            // Cache for 1 hour at the edge
            next: { revalidate: 3600 },
        });
        if (!res.ok) {
            return NextResponse.json({ error: "fetch_failed", status: res.status }, { status: 502 });
        }
        const data: any = await res.json();
        const events: any[] = Array.isArray(data?.events) ? data.events : [];

        // Take three items, prefer ones that have linked pages
        const sorted = events
            .slice()
            .sort((a, b) => (b?.pages?.length || 0) - (a?.pages?.length || 0));

        const items = sorted.slice(0, 3).map((e) => {
            const page = e.pages?.[0];
            const link =
                page?.content_urls?.desktop?.page ||
                page?.content_urls?.mobile?.page ||
                (page?.title ? `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}` : null);
            return {
                year: e.year,
                text: e.text,
                link,
            };
        });

        return NextResponse.json({ date: `${mm}-${dd}`, items });
    } catch (err: any) {
        return NextResponse.json({ error: "exception", message: String(err?.message || err) }, { status: 500 });
    }
}
