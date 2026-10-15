/* validate.js — checks every lesson file against CONTENT_SPEC + OUTLINE.
 * Usage: node tools/validate.js
 * Exit code 0 = all good.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const siteRoot = path.join(__dirname, "..");
const repoRoot = path.join(siteRoot, "..");
const lessonsDir = path.join(siteRoot, "content", "lessons");
const outlinePath = path.join(siteRoot, "OUTLINE.md");

const errors = [];
const warns = [];
function err(f, m) { errors.push(f + ": " + m); }
function warn(f, m) { warns.push(f + ": " + m); }

/* ---------- expected lessons from OUTLINE.md ---------- */
const outline = fs.readFileSync(outlinePath, "utf8");
const expected = [];
const rowRe = /^\|\s*(\d{3}-[a-z0-9-]+\.js)\s*\|\s*([a-z0-9-]+)\s*\|/gim;
let m;
while ((m = rowRe.exec(outline)) !== null) {
  expected.push({ file: m[1], id: m[2] });
}
// unit/week from the section headers above each table
function contextFor(file) {
  const idx = outline.indexOf("| " + file + " |");
  const head = outline.slice(0, idx);
  const unitM = [...head.matchAll(/## UNIT (\d|[IVX]+)/g)].pop();
  const weekM = [...head.matchAll(/### Week (\d+)/g)].pop();
  let unit = unitM ? (/^\d+$/.test(unitM[1]) ? parseInt(unitM[1], 10) : ({ I: 1, II: 2, III: 3, IV: 4 }[unitM[1]] || 0)) : 0;
  if (/## UNIT 0/.test(head.slice(head.lastIndexOf("## UNIT")))) unit = 0;
  const lastUnitHeader = head.lastIndexOf("## UNIT");
  const unitSlice = head.slice(lastUnitHeader);
  if (/UNIT 0/.test(unitSlice)) unit = 0;
  let week = weekM ? parseInt(weekM[1], 10) : 0;
  if (!weekM) {
    // fall back to "(unit 4, week 15)" / "weeks 7–10" written in the UNIT header
    const wm = unitSlice.match(/\bweeks?\s+(\d+)/i);
    if (wm) week = parseInt(wm[1], 10);
  }
  return { unit, week };
}

/* ---------- load lesson files ---------- */
const files = fs.existsSync(lessonsDir)
  ? fs.readdirSync(lessonsDir).filter((f) => f.endsWith(".js")).sort()
  : [];

const lessons = [];
files.forEach((f) => {
  const p = path.join(lessonsDir, f);
  const src = fs.readFileSync(p, "utf8");
  const sandbox = { window: { COURSE_LESSONS: [] }, console };
  try {
    vm.runInNewContext(src, sandbox, { filename: f, timeout: 5000 });
  } catch (e) {
    err(f, "does not execute: " + e.message);
    return;
  }
  const arr = sandbox.window.COURSE_LESSONS;
  if (!Array.isArray(arr) || arr.length !== 1) {
    err(f, "must push exactly 1 lesson, got " + (Array.isArray(arr) ? arr.length : typeof arr));
    return;
  }
  const L = arr[0];
  lessons.push({ f, L });
});

const seenIds = new Set();
const outlineById = Object.create(null);
expected.forEach((e) => (outlineById[e.file] = e));

files.forEach((f) => {
  const hit = lessons.find((x) => x.f === f);
  if (!hit) return;
  const L = hit.L;
  const base = f;

  // --- outline match
  const exp = outlineById[f];
  if (!exp) err(base, "file is not listed in OUTLINE.md");
  else {
    if (L.id !== exp.id) err(base, "id '" + L.id + "' !== OUTLINE id '" + exp.id + "'");
    const ctx = contextFor(f);
    if (num(L.unit) !== ctx.unit) err(base, "unit " + L.unit + " !== expected " + ctx.unit);
    if (num(L.week) !== ctx.week) err(base, "week " + L.week + " !== expected " + ctx.week);
  }
  const fnId = f.replace(/^\d+-/, "").replace(/\.js$/, "");
  if (L.id && !String(L.id).endsWith(fnId)) warn(base, "id '" + L.id + "' does not match filename stem '" + fnId + "'");

  if (seenIds.has(L.id)) err(base, "duplicate id " + L.id);
  seenIds.add(L.id);

  // --- required fields
  ["title", "kicker", "intro"].forEach((k) => { if (!L[k]) err(base, "missing " + k); });
  if (!Array.isArray(L.theory) || !L.theory.length) err(base, "theory must be a non-empty array");
  if (!Array.isArray(L.objectives) || L.objectives.length < 2 || L.objectives.length > 4)
    err(base, "objectives must have 2–4 items");
  if (!Array.isArray(L.keyPoints) || L.keyPoints.length < 3 || L.keyPoints.length > 6)
    err(base, "keyPoints must have 3–6 items");
  if (!L.practice) warn(base, "no practice task");
  const mins = num(L.minutes, 0);
  if (mins < 8 || mins > 25) warn(base, "minutes=" + L.minutes + " outside 8–25");

  // --- examples
  const ex = Array.isArray(L.examples) ? L.examples : [];
  if (ex.length < 5) err(base, "only " + ex.length + " examples (need >= 5)");
  ex.forEach((e, i) => {
    const tag = base + " example " + (i + 1);
    if (!e.title) err(tag, "missing title");
    if (!e.code || !String(e.code).trim()) err(tag, "missing code");
    if (["journal", "new"].indexOf(e.from) < 0) err(tag, "from must be 'journal' or 'new'");
    if (e.from === "journal") {
      if (!e.file) err(tag, "journal example needs file path");
      else if (!fs.existsSync(path.join(repoRoot, e.file))) err(tag, "file does not exist: " + e.file);
    }
    const lang = e.lang || "javascript";
    if (["javascript", "jsx", "json", "sql", "bash", "html", "css", "text"].indexOf(lang) < 0)
      err(tag, "unknown lang " + lang);
    if (!Array.isArray(e.explain) || e.explain.length < 1) err(tag, "explain must be a non-empty array");
    const code = String(e.code || "");
    if (/[…]/.test(code)) err(tag, "code contains an ellipsis (… ) — must be complete");
    if (code.split("\n").length > 60) warn(tag, "very long example (" + code.split("\n").length + " lines)");
  });
  const journalCount = ex.filter((e) => e.from === "journal").length;
  if (journalCount === 0 && L.week !== 0) warn(base, "no journal examples at all");

  // --- quiz
  const q = Array.isArray(L.quiz) ? L.quiz : [];
  if (q.length < 2 || q.length > 3) err(base, "quiz must have 2–3 questions, got " + q.length);
  q.forEach((item, i) => {
    const tag = base + " quiz " + (i + 1);
    if (!item.q) err(tag, "missing q");
    if (!Array.isArray(item.options) || item.options.length < 2) err(tag, "needs >= 2 options");
    else if (item.options.length > 5) err(tag, "too many options");
    const a = num(item.answer, -99);
    if (a < 0 || a >= (item.options || []).length) err(tag, "answer index out of range");
    if (!item.why) err(tag, "missing why");
  });

  // --- string hygiene
  const raw = fs.readFileSync(path.join(lessonsDir, f), "utf8");
  if (/\bTODO\b|\bFIXME\b/.test(raw)) warn(base, "contains TODO/FIXME");
  if (/"use strict"/.test(raw)) warn(base, "unnecessary 'use strict'");
});

function num(v, d) { const n = parseInt(v, 10); return isNaN(n) ? d : n; }

/* ---------- summary ---------- */
const missing = expected.filter((e) => !files.includes(e.file));
missing.forEach((e) => err(e.file, "MISSING — not written yet"));

console.log("Lessons on disk : " + files.length + " / " + expected.length + " expected");
const totalExamples = lessons.reduce((a, x) => a + (x.L.examples ? x.L.examples.length : 0), 0);
const totalQuiz = lessons.reduce((a, x) => a + (Array.isArray(x.L.quiz) ? x.L.quiz.length : 0), 0);
const journalEx = lessons.reduce((a, x) => a + (x.L.examples || []).filter((e) => e.from === "journal").length, 0);
console.log("Examples        : " + totalExamples + " (" + journalEx + " from journal)");
console.log("Quiz questions  : " + totalQuiz);

if (warns.length) {
  console.log("\n--- WARNINGS (" + warns.length + ") ---");
  warns.forEach((w) => console.log("  ! " + w));
}
if (errors.length) {
  console.log("\n--- ERRORS (" + errors.length + ") ---");
  errors.forEach((e) => console.log("  ✗ " + e));
  process.exit(1);
}
console.log("\nAll checks passed.");
