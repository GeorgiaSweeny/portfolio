import path from "node:path";
import Image from "@11ty/eleventy-img";
import fs from "node:fs";
import disciplines from "./src/_data/disciplineList.js";
import { CONTENT, resetContent } from "./src/_lib/content.js";

// Content lives in content/ (see CONTENT.md); everything else here is the site design.
// Image paths given to the shortcodes are from the repo root, e.g.
// content/projects/witness/crow.jpg (src/_lib/content.js resolves them).
// Output names keep the project id: /img/witness-crow-<hash>-800.jpeg
const outName = (src) => {
  const m = src.split(path.sep).join("/").match(/^content\/projects\/([^/]+)\//);
  return (m ? `${m[1]}-` : "") + path.parse(src).name;
};
// Clips in a project folder are published at /media/<project id>/<file>.
const mediaUrl = (src) => {
  const m = src.split(path.sep).join("/").match(/^content\/projects\/([^/]+)\/([^/]+)$/);
  if (!m) throw new Error(`Clips must sit in a project folder: ${src}`);
  return `/media/${m[1]}/${m[2]}`;
};
const imgOpts = (extra = {}) => ({
  widths: [400, 800, 1200, 1600, 2400],
  formats: ["webp", "jpeg"], // AVIF left out: too slow to encode on every Cloudflare build
  outputDir: "_site/img/",
  urlPath: "/img/",
  sharpWebpOptions: { quality: 72 },
  sharpJpegOptions: { quality: 76, mozjpeg: true },
  // The hash changes when the master changes, so year-long browser caching stays safe.
  filenameFormat: (id, src, width, format) => `${outName(src)}-${id.slice(0, 6)}-${width}.${format}`,
  ...extra,
});

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/assets");
  for (const id of fs.readdirSync(`${CONTENT}/projects`)) {
    eleventyConfig.addPassthroughCopy({ [`${CONTENT}/projects/${id}/*.{mp4,webm}`]: `media/${id}` });
  }
  if (fs.existsSync(`${CONTENT}/cv.pdf`)) eleventyConfig.addPassthroughCopy({ [`${CONTENT}/cv.pdf`]: "cv/georgia-sweeny-cv.pdf" });
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget(`${CONTENT}/`);
  eleventyConfig.on("eleventy.before", resetContent);
  eleventyConfig.addFilter("mediaUrl", mediaUrl);

  // ---- images -------------------------------------------------------------
  // {% image "content/projects/capturing-the-sun/medina.jpg", "Alt text", "(min-width: 1100px) 33vw, 100vw", "class", "eager" %}
  eleventyConfig.addAsyncShortcode("image", async (src, alt, sizes = "100vw", cls = "", loading = "lazy") => {
    if (alt === undefined) throw new Error(`Missing alt for ${src}`);
    const meta = await Image(src, imgOpts());
    return Image.generateHTML(meta, {
      alt, sizes, loading, decoding: "async",
      ...(cls ? { class: cls } : {}),
      ...(loading === "eager" ? { fetchpriority: "high" } : {}),
    });
  });
  // Width/height ratio, for justified gallery rows.
  eleventyConfig.addAsyncShortcode("imageRatio", async (src) => {
    const meta = await Image(src, imgOpts());
    const j = meta.jpeg[0];
    return (j.width / j.height).toFixed(4);
  });
  // Largest jpeg URL, for the lightbox.
  eleventyConfig.addAsyncShortcode("imageFull", async (src) => {
    const meta = await Image(src, imgOpts());
    return meta.jpeg[meta.jpeg.length - 1].url;
  });
  // 1200×630 social preview (og:image), cropped from the card image.
  eleventyConfig.addAsyncShortcode("ogImage", async (src) => {
    const meta = await Image(src, imgOpts({
      widths: [1200], formats: ["jpeg"],
      filenameFormat: (id, s) => `og-${outName(s)}-${id.slice(0, 6)}.jpeg`,
      transform: (sharp) => sharp.resize(1200, 630, { fit: "cover", withoutEnlargement: false }),
    }));
    return meta.jpeg[0].url;
  });

  // ---- projects -----------------------------------------------------------
  // Projects come from content/ as plain objects (src/_data/projects.js), not Eleventy collections.
  eleventyConfig.addFilter("inDiscipline", (projects, slug) =>
    slug ? projects.filter((p) => p.disciplines.includes(slug)) : projects);
  eleventyConfig.addFilter("disciplineLabels", (slugs) =>
    slugs.map((s) => disciplines.find((d) => d.slug === s)?.label ?? s).join(" · "));
  eleventyConfig.addFilter("projectBySlug", (projects, slug) => projects.find((p) => p.id === slug));
  eleventyConfig.addFilter("neighbours", (projects, url) => {
    const i = projects.findIndex((p) => p.url === url);
    const n = projects.length;
    return { prev: projects[(i - 1 + n) % n], next: projects[(i + 1) % n] };
  });
  // Index of the block that opens a project page as its video: the first full-size YouTube video
  // anywhere in its blocks (small videos never open a page), or -1.
  eleventyConfig.addFilter("openingVideoIndex", (blocks, small = []) =>
    blocks.findIndex((b) => b.type === "video" && !small.includes(b.youtube)));
  // Paragraphs of a text field (separated by line breaks).
  eleventyConfig.addFilter("paras", (s = "") => String(s).split(/\n+/).map((t) => t.trim()).filter(Boolean));
  eleventyConfig.addFilter("absolute", (url, base) => new URL(url, base).href);


  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
