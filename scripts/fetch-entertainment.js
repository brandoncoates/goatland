#!/usr/bin/env node
/**
 * Fetch up to N stories from one or more Reddit subreddits' RSS feeds
 * and write them to data/entertainment.json for the homepage.
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

(async () => {
    const items = [];

    for (const sub of SUBREDDITS) {
        const url = `https://www.reddit.com/r/${sub}.rss`;
        const feed = await parser.parseURL(url);
        for (const it of feed.items || []) {
            items.push({
                id: it.guid || it.id || it.link,
                title: it.title || "",
                url: it.link,
                isoDate: it.isoDate ? new Date(it.isoDate).toISOString() : null,
                author: it.author || null,
                subreddit: sub,
                source: "reddit",
                image: extractImage(it),
            });
        }
    }

    // Dedupe by URL
    const seen = new Set();
    const unique = items.filter((i) => {
        if (!i?.url) return false;
        if (seen.has(i.url)) return false;
        seen.add(i.url);
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
