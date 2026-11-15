// Coverage check: lists every piece of content that appears nowhere in the built site.
//   npm run build && npm run check:coverage
// A site design may leave things out only by listing them in src/not-shown.yaml
// (see REDESIGN.md). Exits with an error if anything else is missing.
import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";
import * as cheerio from "cheerio";
import { loadContent } from "../src/_lib/content.js";

const SITE = process.argv[2] || "_site";
if (!fs.existsSync(SITE)) { console.error(`No ${SITE}/ folder: run npm run build first.`); process.exit(2); }

// ---- everything the visitor can see or follow in the built site ----------
const texts = [], refs = new Set();
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".html") ? [path.join(d, e.name)] : []);
for (const file of walk(SITE)) {
  const $ = cheerio.load(fs.readFileSync(file, "utf8"));
  $("script, style").remove();
  texts.push($("body").text(), $("title").text());
  $("*").each((_, el) => {
    for (const [k, v] of Object.entries(el.attribs || {})) {
      if (["alt", "aria-label", "title", "content", "data-title"].includes(k)) texts.push(v);
      if (["href", "src", "poster", "data-youtube"].includes(k)) refs.add(v);
      if (k === "srcset") v.split(",").forEach((s) => refs.add(s.trim().split(" ")[0]));
    }
  });
}
const squash = (s) => String(s).replace(/\s+/g, " ").trim();
const haystack = squash(texts.join("\n"));
const refList = [...refs];

// ---- everything in content/ ----------------------------------------------
const c = loadContent();
const items = []; // [key, kind, value]
const addText = (key, v) => { if (v !== undefined && v !== null && v !== "") items.push([key, "text", v]); };
const addImage = (key, p) => { if (p) items.push([key, "image", p]); };
const addRef = (key, v) => { if (v) items.push([key, "ref", v]); };
const addAll = (key, v) => {
  if (Array.isArray(v)) v.forEach((x, i) => addAll(`${key}[${i + 1}]`, x));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) addAll(`${key}.${k}`, x);
  else if (typeof v === "string") addText(key, v);
};

for (const p of c.projects) {
  const k = `projects.${p.id}`;
  for (const f of ["title", "year", "role", "featureText", "outcome", "outcomeLong", "intro", "description", "ownToolNote"]) addText(`${k}.${f}`, p[f]);
  addAll(`${k}.facts`, p.facts);
  (p.links ?? []).forEach((l, i) => { addText(`${k}.links[${i + 1}].label`, l.label); addRef(`${k}.links[${i + 1}].url`, l.url); });
  (p.ownToolLinks ?? []).forEach((l, i) => addText(`${k}.ownToolLinks[${i + 1}].label`, l.label));
  addImage(`${k}.cardImage`, p.cardImage);
  if (p.showcase) {
    addImage(`${k}.showcase.image`, p.showcase.image);
    addImage(`${k}.showcase.poster`, p.showcase.poster);
    if (p.showcase.video) addRef(`${k}.showcase.video`, mediaUrl(p.showcase.video));
    if (p.showcase.webm) addRef(`${k}.showcase.webm`, mediaUrl(p.showcase.webm));
    addText(`${k}.showcase.alt`, p.showcase.alt);
  }
  p.blocks.forEach((b, i) => {
    const bk = `${k}.blocks[${i + 1}]`;
    addText(`${bk}.heading`, b.heading);
    if (b.type === "video") {
      addRef(`${bk}.youtube`, b.youtube); addImage(`${bk}.poster`, b.poster);
      addText(`${bk}.label`, b.label); addText(`${bk}.caption`, b.caption);
    } else b.images.forEach((im, j) => {
      const ik = `${bk}.images[${j + 1}]`;
      addImage(`${ik}.src`, im.src); addText(`${ik}.alt`, im.alt); addText(`${ik}.caption`, im.caption);
    });
  });
}
addAll("profile", { ...c.profile, social: undefined, status: { text: c.profile.status.text } });
for (const [n, url] of Object.entries(c.profile.social)) addRef(`profile.social.${n}`, url);
addAll("about.facts", c.about.facts);
for (const [g, list] of Object.entries(c.about.skills)) { addText(`about.skills.${g}`, g); list.forEach((s, i) => addText(`about.skills.${g}[${i + 1}]`, s)); }
addAll("about.timeline", c.about.timeline);
c.about.bio.forEach((t, i) => addText(`about.bio[${i + 1}]`, t));
addAll("cv", { ...c.cv, projects: c.cv.projects.map((p) => ({ ...p, project: undefined })) });
c.artworks.forEach((a, i) => { addAll(`artworks[${i + 1}]`, { title: a.title, medium: a.medium, year: a.year, alt: a.alt }); addImage(`artworks[${i + 1}].image`, a.image); });

function mediaUrl(p) { const m = p.split(path.sep).join("/").match(/^content\/projects\/([^/]+)\/([^/]+)$/); return `/media/${m[1]}/${m[2]}`; }
function imageStem(p) {
  const s = p.split(path.sep).join("/"), m = s.match(/^content\/projects\/([^/]+)\//);
  return `/img/${m ? `${m[1]}-` : ""}${path.parse(s).name}-`;
}

// ---- compare -------------------------------------------------------------
const notShownFile = "src/not-shown.yaml";
const notShown = (fs.existsSync(notShownFile) ? yaml.load(fs.readFileSync(notShownFile, "utf8")) : []) ?? [];
const patterns = notShown.map((e) => {
  const key = typeof e === "string" ? e : e.key;
  return new RegExp("^" + key.replace(/[.[\]]/g, (ch) => "\\" + ch).replace(/\*/g, "[^.]+") + "(\\.|\\[|$)");
});
const missing = [], excused = [];
for (const [key, kind, v] of items) {
  const found = kind === "text" ? haystack.includes(squash(v))
    : kind === "image" ? refList.some((r) => r.includes(imageStem(v)))
    : refList.some((r) => r === v || r.includes(v));
  if (found) continue;
  (patterns.some((re) => re.test(key)) ? excused : missing).push([key, kind, v]);
}
const used = new Set(excused.map(([k]) => k));
console.log(`Coverage: ${items.length} pieces of content, ${items.length - missing.length - excused.length} shown, ${excused.length} deliberately not shown.`);
if (missing.length) {
  console.log(`\nNot shown anywhere on the site (${missing.length}):`);
  for (const [k, kind, v] of missing) console.log(`  ${k}  [${kind}]  ${String(v).slice(0, 90)}`);
  console.log(`\nShow them, or add their keys to ${notShownFile} with a reason.`);
  process.exit(1);
}
const stale = notShown.filter((e, i) => ![...used].some((k) => patterns[i].test(k)));
if (stale.length) console.log(`\nIn ${notShownFile} but now shown (can be removed): ${stale.map((e) => (typeof e === "string" ? e : e.key)).join(", ")}`);
