#!/usr/bin/env node
/**
 * Fetch up to N stories from one or more Reddit subreddits' RSS feeds
 * and write them to data/entertainment.json for the homepage.
 *
 * Now also captures a short `summary` for each item:
 *   1) Prefer RSS `contentSnippet` if present
 *   2) Otherwise try the page's <meta name="description"> / og:description
 *
 * Env vars (optional):
 *   SUBREDDITS  Comma-separated list, e.g. "entertainment, movies" (default: "entertainment")
 *   LIMIT       Max number of stories to keep (default: 5)
 */

const fs = require("fs/promises");
const path = require("path");
const Parser = require("rss-parser");

const SUBREDDITS = (process.env.SUBREDDITS || "entertainment")
    .split(",")
    .map((s) => s.trim().replace(/^r\//, ""))
    .filter(Boolean);

const LIMIT = parseInt(process.env.LIMIT || "5", 10);

const parser = new Parser({ timeout: 20000 });

function isRedditHost(u) {
    try {
        const h = new URL(u).hostname.replace(/^www\./, "");
        return [
            "reddit.com",
            "old.reddit.com",
            "np.reddit.com",
            "redd.it",
            "i.redd.it",
            "v.redd.it",
        ].some((d) => h === d || h.endsWith("." + d));
    } catch {
        return true;
    }
}

function firstExternalUrlFromHtml(html) {
    if (!html) return null;
    const re = /<a\s+[^>]*href="([^"]+)"/gi;
    let m;
    while ((m = re.exec(html))) {
        const href = m[1];
        if (href && /^https?:\/\//i.test(href) && !isRedditHost(href)) return href;
    }
    return null;
}

function firstExternalUrlFromText(text) {
    if (!text) return null;
    const m = text.match(/https?:\/\/\S+/g);
    if (!m) return null;
    for (const u of m) {
        if (!isRedditHost(u)) return u.replace(/[).,]+$/, "");
    }
    return null;
}

function extractImage(item) {
    if (item.enclosure && item.enclosure.url) return item.enclosure.url;
    if (item.content) {
        const m = item.content.match(/<img[^>]+src="([^"]+)"/i);
        if (m) return m[1];
    }
    if (item.contentSnippet) {
        const m2 = item.contentSnippet.match(/https?:\/\/\S+\.(?:jpg|jpeg|png|gif)/i);
        if (m2) return m2[0];
    }
    return null;
}

function truncate(s, n = 240) {
    if (!s) return null;
    const t = s.replace(/\s+/g, " ").trim();
    return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

async function fetchMetaDescription(u) {
    if (!u) return null;
    try {
        const res = await fetch(u, {
            redirect: "follow",
            headers: {
                "user-agent": "GoatlandBot/1.0 (+https://goatland.net)",
                accept: "text/html,application/xhtml+xml",
            },
        });
        const html = await res.text();
        const og = html.match(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
        const md = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
        const desc = (og && og[1]) || (md && md[1]);
        return desc ? desc.trim() : null;
    } catch {
        return null;
    }
}

function extractOriginalUrl(item) {
    const fromHtml = firstExternalUrlFromHtml(item.content);
    if (fromHtml) return fromHtml;
    const fromText = firstExternalUrlFromText(item.contentSnippet);
    if (fromText) return fromText;
    return null;
}

(async () => {
    const items = [];

    for (const sub of SUBREDDITS) {
        const redditFeedUrl = `https://www.reddit.com/r/${sub}.rss`;
        const feed = await parser.parseURL(redditFeedUrl);
        for (const it of feed.items || []) {
            const redditUrl = it.link;
            const origUrl = extractOriginalUrl(it);

            // Build the base record
            const rec = {
                id: it.guid || it.id || redditUrl,
                title: it.title || "",
                url: origUrl || redditUrl, // prefer original when available
                reddit: redditUrl || null, // keep the Reddit thread too
                isoDate: it.isoDate ? new Date(it.isoDate).toISOString() : null,
                author: it.author || null,
                subreddit: sub,
                source: "reddit",
                image: extractImage(it),
                summary: null,
            };

            // 1) Try the RSS snippet first
            let summary = truncate(it.contentSnippet || "");

            // 2) If missing/short and we have a non-Reddit URL, try meta description
            if ((!summary || summary.length < 60) && rec.url && !isRedditHost(rec.url)) {
                const meta = await fetchMetaDescription(rec.url);
                if (meta) summary = truncate(meta);
            }

            rec.summary = summary || null;
            items.push(rec);
        }
    }

    // Dedupe by final URL
    const seen = new Set();
    const unique = items.filter((i) => {
        const key = i.url || i.reddit;
        if (!key) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Sort newest first, keep up to LIMIT
    unique.sort((a, b) => (b.isoDate || "").localeCompare(a.isoDate || ""));
    const out = unique.slice(0, LIMIT);

    // Write to data/entertainment.json
    const outDir = path.join(process.cwd(), "data");
    await fs.mkdir(outDir, { recursive: true });
    const outFile = path.join(outDir, "entertainment.json");
    await fs.writeFile(
        outFile,
        JSON.stringify(
            { generatedAt: new Date().toISOString(), count: out.length, items: out },
            null,
            2
        )
    );

    console.log(`Wrote ${out.length} items to ${outFile}`);
})().catch((err) => {
    console.error("ERROR:", err?.stack || err);
    process.exit(1);
});
