// Makes web-ready copies of a project's originals (see ADDING-CONTENT.md).
//
//   npm run images -- <project-id>                 list the originals and the suggested names
//   npm run images -- <project-id> --write         make the copies with those names
//   npm run images -- <project-id> --write "IMG_0412.jpg=storyboard-market" "scan 3.tif=cover"
//                                                  choose names for some files, and only make those
//
// Reads ../originals/<id>/ (next to site/; --from <folder> for somewhere else) and writes
// content/projects/<id>/: JPEG quality 82, sRGB, longest edge 2400px, metadata stripped,
// turned the right way up. PNG only for images with real transparency.
// Existing files are never overwritten unless you add --force.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const flag = (f) => { const i = args.indexOf(f); if (i < 0) return false; args.splice(i, 1); return true; };
const opt = (f) => { const i = args.indexOf(f); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const write = flag("--write"), force = flag("--force"), from = opt("--from");
const [id, ...picks] = args;
if (!id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
  console.error("Usage: npm run images -- <project-id> [--write] [\"original=new-name\" …] [--from <folder>] [--force]");
  process.exit(2);
}
const src = from ?? path.join("..", "originals", id);
const dest = path.join("content", "projects", id);
if (!fs.existsSync(src)) { console.error(`No originals folder at ${src}`); process.exit(2); }

const EXT = /\.(jpe?g|png|tiff?|webp|heic|heif|gif|avif)$/i;
const names = new Map(picks.map((p) => { const i = p.lastIndexOf("="); return [p.slice(0, i), p.slice(i + 1)]; }));
const files = fs.readdirSync(src).filter((f) => EXT.test(f) && !f.startsWith("."))
  .filter((f) => !names.size || names.has(f)).sort();
for (const f of names.keys()) if (!files.includes(f)) { console.error(`Not in ${src}: ${f}`); process.exit(2); }

// Suggested name: lowercase, hyphenated, without the project's name or camera numbering.
const words = id.split("-").filter((w) => w.length > 3);
const suggest = (f) => {
  let n = path.parse(f).name.toLowerCase()
    .replace(/[_\s.]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
  for (const w of words) n = n.replace(new RegExp(`(^|-)${w}(?=-|$)`, "g"), "");
  n = n.replace(/^(img|dsc|dscf|scan|screenshot|export|final|copy)(-|$)/, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return /^\d*$/.test(n) ? `image${n ? `-${n}` : ""}` : n;
};

const plan = [];
const taken = new Set(fs.existsSync(dest) ? fs.readdirSync(dest) : []);
for (const f of files) {
  const meta = await sharp(path.join(src, f)).metadata();
  const stats = meta.hasAlpha ? await sharp(path.join(src, f)).stats() : null;
  const png = Boolean(stats && !stats.isOpaque);
  let base = (names.get(f) ?? suggest(f)).replace(/\.(jpe?g|png)$/i, ""), out = `${base}.${png ? "png" : "jpg"}`;
  for (let i = 2; plan.some((p) => p.out === out) || (!force && taken.has(out) && !names.has(f)); i++) out = `${base}-${i}.${png ? "png" : "jpg"}`;
  plan.push({ f, out, meta, png });
}

const w = Math.max(...plan.map((p) => p.f.length), 8);
console.log(`${src}  →  ${dest}\n`);
for (const p of plan) console.log(`  ${p.f.padEnd(w)}  →  ${p.out}${p.png ? "  (transparent: PNG)" : ""}  ${p.meta.width}×${p.meta.height}`);
if (!write) {
  console.log(`\nNothing written. Check the names, then run again with --write (and "original=new-name" to change any).`);
  process.exit(0);
}
fs.mkdirSync(dest, { recursive: true });
for (const p of plan) {
  const to = path.join(dest, p.out);
  if (fs.existsSync(to) && !force) { console.log(`  skipped ${p.out}: already there (--force to replace)`); continue; }
  let img = sharp(path.join(src, p.f)).rotate()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .toColourspace("srgb");
  img = p.png ? img.png({ compressionLevel: 9 }) : img.flatten({ background: "#ffffff" }).jpeg({ quality: 82, mozjpeg: true });
  await img.toFile(to); // sharp drops EXIF, GPS and other metadata unless asked to keep it
  console.log(`  wrote ${to}`);
}
console.log(`\nNext: add the images to content/projects/${id}/index.md, each with alt text, then npm run check.`);
