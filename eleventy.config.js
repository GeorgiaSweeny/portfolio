import path from "node:path";
import Image from "@11ty/eleventy-img";
import disciplines from "./src/_data/disciplineList.js";

// Drafts (projects still missing images or copy) appear in `npm start` and
// `SHOW_DRAFTS=1 npm run build`, never in the normal production build.
const showDrafts = () => process.env.ELEVENTY_RUN_MODE === "serve" || process.env.SHOW_DRAFTS === "1";

const IMG_SRC = "src/images";
const imgOpts = (extra = {}) => ({
  widths: [400, 800, 1200, 1600, 2400],
  formats: ["webp", "jpeg"], // AVIF left out: too slow to encode on every Cloudflare build
  outputDir: "_site/img/",
  urlPath: "/img/",
  sharpWebpOptions: { quality: 72 },
  sharpJpegOptions: { quality: 76, mozjpeg: true },
  // The hash changes when the master changes, so year-long browser caching stays safe.
  filenameFormat: (id, src, width, format) => `${path.parse(src).name}-${id.slice(0, 6)}-${width}.${format}`,
  ...extra,
});

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addWatchTarget("src/css/");

  // ---- images -------------------------------------------------------------
  // {% image "sun-medina.jpg", "Alt text", "(min-width: 1100px) 33vw, 100vw", "class", "eager" %}
  eleventyConfig.addAsyncShortcode("image", async (src, alt, sizes = "100vw", cls = "", loading = "lazy") => {
    if (alt === undefined) throw new Error(`Missing alt for ${src}`);
    const meta = await Image(path.join(IMG_SRC, src), imgOpts());
    return Image.generateHTML(meta, {
      alt, sizes, loading, decoding: "async",
      ...(cls ? { class: cls } : {}),
      ...(loading === "eager" ? { fetchpriority: "high" } : {}),
    });
  });
  // Width/height ratio, for justified gallery rows.
  eleventyConfig.addAsyncShortcode("imageRatio", async (src) => {
    const meta = await Image(path.join(IMG_SRC, src), imgOpts());
    const j = meta.jpeg[0];
    return (j.width / j.height).toFixed(4);
  });
  // Largest jpeg URL, for the lightbox.
  eleventyConfig.addAsyncShortcode("imageFull", async (src) => {
    const meta = await Image(path.join(IMG_SRC, src), imgOpts());
    return meta.jpeg[meta.jpeg.length - 1].url;
  });
  // 1200×630 social preview (og:image), cropped from the card image.
  eleventyConfig.addAsyncShortcode("ogImage", async (src) => {
    const meta = await Image(path.join(IMG_SRC, src), imgOpts({
      widths: [1200], formats: ["jpeg"],
      filenameFormat: (id, s) => `og-${path.parse(s).name}-${id.slice(0, 6)}.jpeg`,
      transform: (sharp) => sharp.resize(1200, 630, { fit: "cover", withoutEnlargement: false }),
    }));
    return meta.jpeg[0].url;
  });

  // ---- projects -----------------------------------------------------------
  const live = (api) => api.getFilteredByGlob("./src/projects/*.md")
    .filter((p) => showDrafts() || !p.data.draft)
    .sort((a, b) => a.data.order - b.data.order);
  eleventyConfig.addCollection("projects", live);
  eleventyConfig.addCollection("featured", (api) =>
    live(api).filter((p) => p.data.featured).sort((a, b) => a.data.featured - b.data.featured));

  eleventyConfig.addFilter("inDiscipline", (projects, slug) =>
    slug ? projects.filter((p) => p.data.disciplines.includes(slug)) : projects);
  eleventyConfig.addFilter("disciplineLabels", (slugs) =>
    slugs.map((s) => disciplines.find((d) => d.slug === s)?.label ?? s).join(" · "));
  eleventyConfig.addFilter("projectBySlug", (projects, slug) => projects.find((p) => p.fileSlug === slug));
  eleventyConfig.addFilter("neighbours", (projects, url) => {
    const i = projects.findIndex((p) => p.url === url);
    const n = projects.length;
    return { prev: projects[(i - 1 + n) % n], next: projects[(i + 1) % n] };
  });
  eleventyConfig.addFilter("absolute", (url, base) => new URL(url, base).href);


  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
