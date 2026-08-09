#!/usr/bin/env node
// Apply the vault's site-copy.md to index.html.
//
//   node tools/apply-copy.mjs [path/to/site-copy.md] [--check]
//
// site-copy.md format: "## <key>" headings from tools/copy-map.json, each
// followed by that key's text. Unknown keys are reported and skipped; keys
// absent from the file leave the page untouched. --check parses and diffs
// without writing.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const mapPath = join(here, "copy-map.json");
const htmlPath = join(here, "..", "index.html");

const args = process.argv.slice(2).filter(a => a !== "--check");
const check = process.argv.includes("--check");
const mdPath = args[0] || join(process.env.HOME, "Hearth", "business", "website", "site-copy.md");

const map = JSON.parse(readFileSync(mapPath, "utf8"));
const md = readFileSync(mdPath, "utf8");
let html = readFileSync(htmlPath, "utf8");

// -- parse site-copy.md -------------------------------------------------
const copy = {};
const parts = md.split(/^## +(.+?) *$/m);
for (let i = 1; i < parts.length; i += 2) {
  copy[parts[i].trim()] = parts[i + 1].trim();
}

const unknown = Object.keys(copy).filter(k => !map.keys.includes(k));
if (unknown.length) console.warn("skipping unknown keys:", unknown.join(", "));

// -- render + inject ----------------------------------------------------
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function render(key, text) {
  let out = esc(text).replace(/\n{2,}/g, "<br><br>").replace(/\n/g, " ");
  const wrap = map.wrap && map.wrap[key];
  if (wrap && out.includes(wrap.word)) {
    out = out.replace(wrap.word, `<span class="${wrap.class}">${wrap.word}</span>`);
  }
  return out;
}

let changed = 0;
for (const key of map.keys) {
  if (!(key in copy)) continue;
  const value = render(key, copy[key]);
  const re = new RegExp(
    `(<([a-z0-9]+)\\b[^>]*data-copy="${key}"[^>]*>)([\\s\\S]*?)(</\\2>)`, "g");
  let hits = 0;
  html = html.replace(re, (m, open, _tag, inner, close) => {
    hits++;
    if (inner !== value) changed++;
    return open + value + close;
  });
  if (!hits) console.warn(`no element carries data-copy="${key}"`);
}

if (check) {
  console.log(changed ? `${changed} region(s) would change` : "page already matches the vault copy");
  process.exit(0);
}
if (!changed) { console.log("page already matches the vault copy -- nothing to do"); process.exit(0); }
writeFileSync(htmlPath, html);
console.log(`applied -- ${changed} region(s) updated in index.html`);
