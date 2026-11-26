// Reads everything in content/, checks it against the field list in CONTENT.md,
// and hands the site design plain objects. Any mistake (an unknown or misspelt
// field, a missing required one, an image without alt text, a file that isn't
// there) stops the build with a message saying exactly where.
//
// This file belongs to the site design: a new site design may replace it, but
// must keep the same checks (see REDESIGN.md).
import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";
import disciplines from "../_data/disciplineList.js";
import { sections as SECTIONS, presets as PRESETS } from "../_data/layouts.js";

export const CONTENT = "content";
const showDrafts = () => process.env.ELEVENTY_RUN_MODE === "serve" || process.env.SHOW_DRAFTS === "1";

// ---- field rules -------------------------------------------------------------
// type: "text" (non-empty string), "bool", "int", "list", "map", or a nested shape.
// `req: true` = required. Anything not listed is an error.
const text = { type: "text" }, reqText = { type: "text", req: true };
const imageRef = { type: "file", req: true };
const SHAPES = {
  project: {
    title: reqText, layout: { type: "enum", req: true, values: Object.keys(PRESETS) }, year: { type: "year", req: true }, order: { type: "int", req: true }, draft: { type: "bool" },
    disciplines: { type: "list", req: true, of: { type: "discipline" } },
    role: reqText, featureText: text, outcome: reqText, outcomeLong: text, intro: reqText, description: text,
    cardImage: imageRef,
    showcase: { type: "shape", shape: "showcase" },
    facts: { type: "shape", shape: "facts", req: true },
    links: { type: "list", of: { type: "shape", shape: "link" } },
    ownTool: { type: "bool" }, ownToolNote: text,
    ownToolLinks: { type: "list", of: { type: "shape", shape: "ownToolLink" } },
    blocks: { type: "list", of: { type: "block" } },
  },
  showcase: { image: { type: "file" }, video: { type: "file" }, webm: { type: "file" }, poster: { type: "file" }, alt: text },
  facts: { role: reqText, tools: reqText, outcome: reqText },
  link: { label: reqText, url: reqText, youtube: { type: "bool" } },
  ownToolLink: { label: reqText, project: { type: "project", req: true } },
  video: { type: reqText, section: { type: "enum", req: true, values: Object.keys(SECTIONS) }, heading: text, youtube: reqText, poster: imageRef, label: reqText, caption: text },
  gallery: { type: reqText, section: { type: "enum", req: true, values: Object.keys(SECTIONS) }, heading: text, images: { type: "list", req: true, of: { type: "shape", shape: "image" } } },
  image: { src: imageRef, video: { type: "file" }, webm: { type: "file" }, alt: { type: "text", req: true, allowEmpty: false }, caption: text, emphasis: { type: "enum", values: ["key", "reference"] }, group: text },
  profile: {
    name: reqText, location: reqText, positioning: reqText, description: reqText,
    status: { type: "shape", shape: "status", req: true },
    roles: { type: "list", req: true, of: reqText },
    social: { type: "map", req: true, of: reqText },
  },
  status: { text: reqText, open: { type: "bool", req: true } },
  about: {
    facts: { type: "list", req: true, of: { type: "shape", shape: "aboutFact" } },
    skills: { type: "map", req: true, of: { type: "list", of: reqText } },
    timeline: { type: "list", req: true, of: { type: "shape", shape: "timelineEntry" } },
  },
  aboutFact: { value: reqText, label: reqText },
  timelineEntry: { year: reqText, title: reqText, note: text },
  cv: {
    sections: { type: "list", req: true, of: reqText },
    skills: { type: "list", req: true, of: { type: "shape", shape: "cvSkill" } },
    experience: { type: "list", req: true, of: { type: "shape", shape: "cvJob" } },
    projects: { type: "list", req: true, of: { type: "shape", shape: "cvProject" } },
    education: { type: "list", req: true, of: { type: "shape", shape: "cvEducation" } },
    certifications: { type: "list", of: reqText },
    awards: { type: "list", of: reqText },
    interests: text,
  },
  cvSkill: { group: reqText, text: reqText },
  cvJob: { title: reqText, years: reqText, points: { type: "list", req: true, of: reqText } },
  cvProject: { title: reqText, project: { type: "project" }, sub: text, years: reqText, tools: text, points: { type: "list", req: true, of: reqText } },
  cvEducation: { qual: reqText, place: reqText, years: { type: "text", allowEmpty: true }, note: text },
  artwork: { title: reqText, medium: reqText, year: { type: "year", req: true }, image: imageRef, alt: reqText, sold: { type: "bool" } },
};

// ---- checking ----------------------------------------------------------------
class ContentError extends Error {}
const fail = (where, msg) => { throw new ContentError(`Content error in ${where}: ${msg}\nSee CONTENT.md for the field list.`); };

function check(value, rule, where, ctx) {
  if (value === undefined || value === null) { if (rule.req) fail(where, "missing (required)"); return; }
  switch (rule.type) {
    case "text":
      if (typeof value !== "string") fail(where, `should be text, got ${JSON.stringify(value)}`);
      if (!rule.allowEmpty && !value.trim()) fail(where, "is empty");
      break;
    case "year": if (!(typeof value === "string" && value.trim()) && !Number.isInteger(value)) fail(where, "should be a year, e.g. 2024 or 2018–2025"); break;
    case "bool": if (typeof value !== "boolean") fail(where, "should be true or false"); break;
    case "int": if (!Number.isInteger(value)) fail(where, "should be a whole number"); break;
    case "enum": if (!rule.values.includes(value)) fail(where, `should be one of: ${rule.values.join(", ")}`); break;
    case "discipline":
      if (!disciplines.some((d) => d.slug === value)) fail(where, `unknown discipline "${value}" (one of: ${disciplines.map((d) => d.slug).join(", ")})`);
      break;
    case "project": ctx.projectRefs.push([value, where]); break;
    case "file": {
      if (typeof value !== "string") fail(where, "should be a file name");
      if (!fs.existsSync(path.join(ctx.dir, value))) fail(where, `file "${value}" not found in ${ctx.dir}/`);
      break;
    }
    case "list":
      if (!Array.isArray(value)) fail(where, "should be a list");
      value.forEach((v, i) => check(v, rule.of, `${where}[${i + 1}]`, ctx));
      break;
    case "map":
      if (typeof value !== "object" || Array.isArray(value)) fail(where, "should be a set of name: value lines");
      for (const [k, v] of Object.entries(value)) check(v, rule.of, `${where}.${k}`, ctx);
      break;
    case "block": {
      const shape = { video: "video", gallery: "gallery" }[value?.type];
      if (!shape) fail(where, `block type should be "gallery" or "video", got ${JSON.stringify(value?.type)}`);
      checkShape(value, shape, where, ctx);
      break;
    }
    case "shape": checkShape(value, rule.shape, where, ctx); break;
    default: throw new Error(`unknown rule ${rule.type}`);
  }
}
function checkShape(obj, name, where, ctx) {
  if (typeof obj !== "object" || Array.isArray(obj)) fail(where, "should be a set of fields");
  const shape = SHAPES[name];
  for (const k of Object.keys(obj)) {
    if (!(k in shape)) {
      const near = Object.keys(shape).find((s) => s.toLowerCase() === k.toLowerCase() || lev(s, k) <= 2);
      fail(where, `unknown field "${k}"${near ? ` (did you mean "${near}"?)` : ""}`);
    }
  }
  for (const [k, rule] of Object.entries(shape)) check(obj[k], rule, `${where} → ${k}`, ctx);
}
const lev = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};

// ---- reading -----------------------------------------------------------------
const readYaml = (f) => yaml.load(fs.readFileSync(f, "utf8"));
function readFrontMatter(f) {
  const raw = fs.readFileSync(f, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) fail(f, "should start with --- front matter ---");
  return { data: yaml.load(m[1]) ?? {}, body: m[2].trim() };
}

let cache;
export function loadContent() {
  if (cache) return cache;
  const ctx = { projectRefs: [] };

  // Projects: one folder each.
  const pdir = path.join(CONTENT, "projects");
  const ids = fs.readdirSync(pdir).filter((d) => fs.statSync(path.join(pdir, d)).isDirectory()).sort();
  const all = ids.map((id) => {
    const dir = path.join(pdir, id), file = path.join(dir, "index.md");
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) fail(dir, "project folder names are lowercase words joined by hyphens");
    if (!fs.existsSync(file)) fail(dir, "has no index.md");
    const { data, body } = readFrontMatter(file);
    if (body) fail(file, "write-up text below the front matter isn't used yet; put it in intro or a caption");
    checkShape(data, "project", file, { ...ctx, dir });
    const s = data.showcase;
    if (s && !s.image && !s.video) fail(`${file} → showcase`, "needs an image or a video");
    if (s?.video && (!s.poster || !s.alt)) fail(`${file} → showcase`, "a video needs a poster image and alt text");
    // Resolve every file name to its path from the repo root, for the image tools.
    const at = (f) => (f ? path.join(dir, f) : f);
    return {
      ...data, id, dir, url: `/projects/${id}/`, year: String(data.year),
      cardImage: at(data.cardImage),
      showcase: s && { ...s, image: at(s.image), video: at(s.video), webm: at(s.webm), poster: at(s.poster) },
      blocks: (data.blocks ?? []).map((b) => b.type === "video"
        ? { ...b, poster: at(b.poster) }
        : { ...b, images: b.images.map((im) => ({ ...im, src: at(im.src), video: at(im.video), webm: at(im.webm) })) }),
    };
  });
  for (const [ref, where] of ctx.projectRefs) if (!ids.includes(ref)) fail(where, `no project folder called "${ref}"`);
  const orders = new Map();
  for (const p of all) { if (orders.has(p.order)) fail(`content/projects/${p.id}`, `order ${p.order} is also used by ${orders.get(p.order)}`); orders.set(p.order, p.id); }
  const projects = all.filter((p) => showDrafts() || !p.draft).sort((a, b) => a.order - b.order);

  // Featured: exactly three project ids, in order.
  const featuredIds = readYaml(path.join(CONTENT, "featured.yaml"));
  if (!Array.isArray(featuredIds) || featuredIds.length !== 3) fail("content/featured.yaml", "should list exactly three project ids");
  const featured = featuredIds.map((id, i) => {
    const p = all.find((x) => x.id === id);
    if (!p) fail(`content/featured.yaml[${i + 1}]`, `no project folder called "${id}"`);
    if (!p.showcase) fail(`content/projects/${id}/index.md`, "a featured project needs showcase media");
    return p;
  }).filter((p) => showDrafts() || !p.draft);

  // Profile, About, CV, artworks.
  const profile = readYaml(path.join(CONTENT, "profile.yaml"));
  checkShape(profile, "profile", "content/profile.yaml", { ...ctx, dir: CONTENT });

  const { data: aboutData, body: aboutBody } = readFrontMatter(path.join(CONTENT, "about.md"));
  checkShape(aboutData, "about", "content/about.md", { ...ctx, dir: CONTENT });
  const bio = aboutBody.split(/\r?\n\s*\r?\n/).map((t) => t.replace(/\s+/g, " ").trim()).filter(Boolean);
  if (!bio.length) fail("content/about.md", "needs the bio below the front matter");
  const about = { ...aboutData, bio };

  const cv = readYaml(path.join(CONTENT, "cv.yaml"));
  const cvCtx = { ...ctx, dir: CONTENT, projectRefs: [] };
  checkShape(cv, "cv", "content/cv.yaml", cvCtx);
  for (const [ref, where] of cvCtx.projectRefs) if (!ids.includes(ref)) fail(where, `no project folder called "${ref}"`);
  const cvPdf = fs.existsSync(path.join(CONTENT, "cv.pdf")) ? path.join(CONTENT, "cv.pdf") : null;

  const adir = path.join(CONTENT, "artworks");
  const artworks = (readYaml(path.join(adir, "artworks.yaml")) ?? []).map((a, i) => {
    checkShape(a, "artwork", `content/artworks/artworks.yaml[${i + 1}]`, { ...ctx, dir: adir });
    return { ...a, year: String(a.year), image: path.join(adir, a.image) };
  });

  cache = { projects, allProjects: all, featured, profile, about, cv, cvPdf, artworks };
  return cache;
}
export function resetContent() { cache = undefined; }
