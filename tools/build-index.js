/* build-index.js — regenerates the <script> lesson tags in index.html.
 * Usage: node tools/build-index.js
 */
const fs = require("fs");
const path = require("path");

const siteRoot = path.join(__dirname, "..");
const lessonsDir = path.join(siteRoot, "content", "lessons");
const indexPath = path.join(siteRoot, "index.html");

if (!fs.existsSync(lessonsDir)) {
  console.error("No content/lessons directory found.");
  process.exit(1);
}

const files = fs
  .readdirSync(lessonsDir)
  .filter((f) => f.endsWith(".js"))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const tags = files.map((f) => `  <script src="content/lessons/${f}"></script>`).join("\n");

const html = fs.readFileSync(indexPath, "utf8");
const re = /([ \t]*<!-- LESSONS:BEGIN[^\n]*\n)([\s\S]*?)([ \t]*<!-- LESSONS:END -->)/;
if (!re.test(html)) {
  console.error("Could not find LESSONS:BEGIN / LESSONS:END markers in index.html");
  process.exit(1);
}
const out = html.replace(re, `$1${tags}\n$3`);
fs.writeFileSync(indexPath, out, "utf8");
console.log(`index.html updated with ${files.length} lesson scripts.`);
