/**
 * Build-time SEO for the single-page app.
 *
 * After `vite build`, this writes one static HTML file per public page (home, guide, every topic)
 * with its own <title>, description, canonical URL and social tags, plus the page's real text inside
 * #root. Crawlers that don't run JavaScript see content; in the browser, React's createRoot replaces
 * it on load. It also writes sitemap.xml. Spring Boot serves each file for its route (SpaController).
 *
 * Output (relative to the build output directory):
 *   index.html                  home
 *   _pages/guide.html           execution plan
 *   _pages/topic/<slug>.html    one per topic
 *   _pages/spa.html             empty shell for private pages (review, verify-email, reset-password)
 *   sitemap.xml
 * Files live under _pages/ so no controller mapping matches the forward target.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Plugin, ResolvedConfig } from "vite";
import { DIFFICULTY_LABEL, PHASES, TOPICS, TOTAL_PROBLEMS } from "../src/data";

const SITE_NAME = "DSA Master";
const DEFAULT_TITLE = "DSA Master – 180 Problem Roadmap";
const DEFAULT_DESCRIPTION =
  "A concept-first roadmap of 180 curated LeetCode problems for mid-level interviews. Learn each pattern, solve the problems, and track your progress in your browser.";

interface Page {
  path: string; // "/", "/guide", "/topic/arrays-hashing"
  title: string;
  description: string;
  body: string; // HTML placed inside #root
  jsonLd?: object;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const list = (items: readonly string[]) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

/** Trim to a search-snippet-sized description without cutting a word in half. */
function snippet(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, clean.lastIndexOf(" ", max - 1)).replace(/[,;:.]$/, "") + "…";
}

function pages(): Page[] {
  const home: Page = {
    path: "/",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    body: `<main class="prerender">
<h1>DSA Master: ${TOTAL_PROBLEMS} problems, organised by pattern</h1>
<p>${esc(DEFAULT_DESCRIPTION)}</p>
${PHASES.map(
  (phase) => `<section><h2>${esc(phase.name)}</h2><p>${esc(phase.blurb)}</p><ul>${TOPICS.filter(
    (t) => t.phase === phase.id,
  )
    .map(
      (t) =>
        `<li><a href="/topic/${t.slug}">${esc(t.name)}</a> (${t.problems.length} problems): ${esc(
          t.concepts.join(", "),
        )}</li>`,
    )
    .join("")}</ul></section>`,
).join("\n")}
<p><a href="/guide">How to use this roadmap</a></p>
</main>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
    },
  };

  const guide: Page = {
    path: "/guide",
    title: `Execution plan · ${SITE_NAME}`,
    description: `How to work through the ${TOTAL_PROBLEMS}-problem DSA roadmap: a daily routine, rules for every problem, and spaced revision after 2, 7 and 14 days.`,
    body: `<main class="prerender">
<h1>Execution plan</h1>
<p>How to work through the ${TOTAL_PROBLEMS} problems: learn or revise one pattern a day, solve two new problems,
revisit the ones you failed, and write down the complexity of every solution. Revisit each problem after
2, 7 and 14 days.</p>
<ul>${TOPICS.map((t) => `<li><a href="/topic/${t.slug}">${esc(t.name)}</a></li>`).join("")}</ul>
</main>`,
  };

  const topics: Page[] = TOPICS.map((t) => ({
    path: `/topic/${t.slug}`,
    title: `${t.name}: patterns and ${t.problems.length} LeetCode problems · ${SITE_NAME}`,
    description: snippet(`${t.name}: ${t.overview}`),
    body: `<main class="prerender">
<p><a href="/">DSA Master</a> › Topic ${t.index}</p>
<h1>${esc(t.name)}</h1>
<p>${esc(t.overview)}</p>
<h2>Concepts</h2>${list(t.concepts)}
<h2>How to recognise it</h2>${list(t.recognize)}
<h2>Common pitfalls</h2>${list(t.pitfalls)}
<h2>Problems</h2>
<ol>${t.problems
      .map(
        (p) =>
          `<li><a href="https://leetcode.com/problems/${p.slug}/" rel="nofollow">${esc(p.title)}</a> (${
            DIFFICULTY_LABEL[p.difficulty]
          }${p.premium ? ", Premium" : ""})</li>`,
      )
      .join("")}</ol>
</main>`,
  }));

  return [home, guide, ...topics];
}

function render(template: string, page: Page, siteUrl: string): string {
  const url = siteUrl + (page.path === "/" ? "/" : page.path);
  const head = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta name="twitter:card" content="summary" />`,
    page.jsonLd
      ? `<script type="application/ld+json">${JSON.stringify({ ...page.jsonLd, url }).replace(/</g, "\\u003c")}</script>`
      : "",
  ]
    .filter(Boolean)
    .join("\n    ");

  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, "<!--seo-->")
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, "")
    .replace("<!--seo-->", head)
    .replace('<div id="root"></div>', `<div id="root">${page.body}</div>`);
  if (!html.includes('class="prerender"')) throw new Error(`prerender: #root not found for ${page.path}`);
  return html;
}

export function seoPrerender(options: { siteUrl: string }): Plugin {
  const siteUrl = options.siteUrl.replace(/\/$/, "");
  let config: ResolvedConfig;
  return {
    name: "dsa-master-seo-prerender",
    apply: "build",
    configResolved(c) {
      config = c;
    },
    closeBundle() {
      const outDir = config.build.outDir;
      const template = readFileSync(join(outDir, "index.html"), "utf8");
      // Private pages keep the untouched shell (no content, not indexed).
      mkdirSync(join(outDir, "_pages", "topic"), { recursive: true });
      writeFileSync(
        join(outDir, "_pages", "spa.html"),
        template.replace("<head>", '<head>\n    <meta name="robots" content="noindex" />'),
      );

      const all = pages();
      for (const page of all) {
        const file = page.path === "/" ? "index.html" : join("_pages", `${page.path.slice(1)}.html`);
        writeFileSync(join(outDir, file), render(template, page, siteUrl));
      }

      const today = new Date().toISOString().slice(0, 10);
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map((p) => `  <url><loc>${siteUrl}${p.path === "/" ? "/" : p.path}</loc><lastmod>${today}</lastmod></url>`)
  .join("\n")}
</urlset>
`;
      writeFileSync(join(outDir, "sitemap.xml"), sitemap);
      config.logger.info(`seo: pre-rendered ${all.length} pages and sitemap.xml for ${siteUrl}`);
    },
  };
}
