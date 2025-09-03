#!/usr/bin/env node
/**
 * Fetch up to N stories from one or more Reddit subreddits' RSS feeds
 * and write them to data/entertainment.json for the homepage.
 *
 * Now captures BOTH the original article URL (if present) and the Reddit thread URL.
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
    // Try enclosure (media:thumbnail)
    if (item.enclosure && item.enclosure.url) return item.enclosure.url;
    // Try <img src> inside content
    if (item.content) {
        const m = item.content.match(/<img[^>]+src="([^"]+)"/i);
        if (m) return m[1];
    }
    // Fallback: any image URL in snippet
    if (item.contentSnippet) {
        const m2 = item.contentSnippet.match(/https?:\/\/\S+\.(?:jpg|jpeg|png|gif)/i);
        if (m2) return m2[0];
    }
    return null;
}

function extractOriginalUrl(item) {
    // Prefer a non-Reddit URL from HTML content
    const fromHtml = firstExternalUrlFromHtml(item.content);
    if (fromHtml) return fromHtml;
    // Then try plaintext snippet
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
            items.push({
                id: it.guid || it.id || redditUrl,
                title: it.title || "",
                url: origUrl || redditUrl, // prefer original
                reddit: redditUrl || null, // keep the Reddit thread too
                isoDate: it.isoDate ? new Date(it.isoDate).toISOString() : null,
                author: it.author || null,
                subreddit: sub,
                source: "reddit",
                image: extractImage(it),
            });
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
