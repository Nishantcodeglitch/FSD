/* smoke.js — renders every view of the reader inside a tiny DOM stub and
 * checks the output for structural problems. No browser needed.
 * Usage: node tools/smoke.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const siteRoot = path.join(__dirname, "..");
const lessonsDir = path.join(siteRoot, "content", "lessons");

const problems = [];
function problem(m) { problems.push(m); }

/* ----------------------------------------------------------- DOM stub */
function makeClassList(el) {
  const set = new Set(el._cls || []);
  return {
    add: (...c) => c.forEach((x) => set.add(x)),
    remove: (...c) => c.forEach((x) => set.delete(x)),
    toggle: (c, force) => {
      const on = force === undefined ? !set.has(c) : !!force;
      if (on) set.add(c); else set.delete(c);
      return on;
    },
    contains: (c) => set.has(c),
    _set: set
  };
}

function makeEl(name) {
  const el = {
    tagName: (name || "div").toUpperCase(),
    id: "",
    className: "",
    style: {},
    dataset: {},
    value: "",
    textContent: "",
    innerHTML: "",
    hidden: false,
    disabled: false,
    offsetTop: 0,
    offsetHeight: 10,
    clientHeight: 100,
    scrollTop: 0,
    children: [],
    _listeners: {},
    classList: null,
    setAttribute(k, v) { this[k] = v; },
    getAttribute(k) { return this[k] == null ? null : this[k]; },
    addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); },
    appendChild(c) { this.children.push(c); return c; },
    removeChild(c) { return c; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    closest() { return null; },
    focus() {},
    select() {}
  };
  el.classList = makeClassList(el);
  return el;
}

const registry = Object.create(null);
function bySelector(sel) {
  if (!registry[sel]) registry[sel] = makeEl(sel.replace(/^#/, ""));
  return registry[sel];
}

const listeners = {};
const documentStub = {
  readyState: "complete",
  title: "",
  documentElement: makeEl("html"),
  body: makeEl("body"),
  addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
  removeEventListener() {},
  querySelector: (s) => bySelector(s),
  querySelectorAll: () => [],
  createElement: (n) => makeEl(n),
  execCommand: () => true
};

const locationStub = { hash: "" };
const store = {};
const windowStub = {
  document: documentStub,
  location: locationStub,
  navigator: { clipboard: null },
  localStorage: {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  },
  matchMedia: () => ({ matches: false }),
  scrollTo: () => {},
  addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
  removeEventListener() {},
  setTimeout: (fn) => 0,
  clearTimeout: () => {},
  confirm: () => true,
  console
};

/* --------------------------------------------------- load content + app */
function runFile(file, sandbox) {
  const src = fs.readFileSync(file, "utf8");
  vm.runInNewContext(src, sandbox, { filename: path.basename(file), timeout: 5000 });
}

const contentSandbox = { window: windowStub, console };
runFile(path.join(siteRoot, "content", "structure.js"), contentSandbox);
const files = fs.existsSync(lessonsDir)
  ? fs.readdirSync(lessonsDir).filter((f) => f.endsWith(".js")).sort()
  : [];
files.forEach((f) => runFile(path.join(lessonsDir, f), contentSandbox));

if (!files.length) {
  console.log("No lesson files yet — nothing to smoke-test.");
  process.exit(0);
}

const appSandbox = Object.assign(Object.create(null), windowStub, {
  window: windowStub,
  document: documentStub,
  location: locationStub,
  navigator: windowStub.navigator,
  localStorage: windowStub.localStorage,
  matchMedia: windowStub.matchMedia,
  setTimeout: windowStub.setTimeout,
  clearTimeout: windowStub.clearTimeout,
  confirm: windowStub.confirm,
  console,
  Date,
  JSON,
  Math,
  parseInt,
  isNaN,
  decodeURIComponent,
  encodeURIComponent,
  Array,
  Object,
  String,
  Number,
  RegExp,
  Set,
  Promise
});
appSandbox.window.scrollTo = windowStub.scrollTo;
appSandbox.window.addEventListener = windowStub.addEventListener;

runFile(path.join(siteRoot, "assets", "app.js"), appSandbox);

const Book = windowStub.FSDBook || appSandbox.FSDBook;
if (!Book || !Book.lessons) {
  console.error("SMOKE: app.js did not expose FSDBook — boot failed?");
  process.exit(1);
}

/* ------------------------------------------------------------- helpers */
function render(hash) {
  locationStub.hash = hash;
  const main = bySelector("#main");
  main.innerHTML = "";
  try {
    (listeners.hashchange || []).forEach((fn) => fn());
    if (!main.innerHTML) windowStub.FSDBook.route();
  } catch (e) {
    problem("render " + hash + " threw: " + e.message);
    return "";
  }
  return main.innerHTML;
}

function withoutCode(html) {
  return html
    .replace(/<pre class="code">[\s\S]*?<\/pre>/g, "")
    .replace(/<code[^>]*>[\s\S]*?<\/code>/g, "")
    .replace(/<div class="ex-run">[\s\S]*?<\/div>/g, "")
    .replace(/<ul class="ex-explain">[\s\S]*?<\/ul>/g, "");
}

/* ------------------------------------------------------------- checks */
console.log("Smoke-testing " + Book.lessons.length + " lessons…");

const cover = render("#/");
["The FSD Book", "Course index", "unit-card"].forEach((t) => {
  if (cover.indexOf(t) < 0) problem("cover view missing '" + t + "'");
});

const course = render("#/course");
["Course index", "progress-panel", "howto", "lesson-row"].forEach((t) => {
  if (course.indexOf(t) < 0) problem("course view missing '" + t + "'");
});

const about = render("#/about");
if (about.indexOf("About this book") < 0) problem("about view missing heading");

const syllabus = render("#/syllabus");
if (syllabus.indexOf("Syllabus") < 0) problem("syllabus view missing heading");
const sylMissing = (syllabus.match(/syl-ch missing">([^<]+)/g) || []).map((s) => s.split(">")[1]);
if (sylMissing.length) {
  // ids that are not in OUTLINE.md at all are hard errors; ids for chapters that
  // simply have not been written yet are expected while the book is in progress
  const outlineIds = new Set(
    [...fs.readFileSync(path.join(siteRoot, "OUTLINE.md"), "utf8").matchAll(/^\|\s*\d{3}-[a-z0-9-]+\.js\s*\|\s*([a-z0-9-]+)\s*\|/gim)]
      .map((x) => x[1])
  );
  const bogus = sylMissing.filter((id) => !outlineIds.has(id));
  if (bogus.length) problem("syllabus map points at ids that are not in OUTLINE.md: " + bogus.join(", "));
  const waiting = sylMissing.filter((id) => outlineIds.has(id));
  if (waiting.length) console.log("  note: syllabus links to chapters not written yet: " + waiting.join(", "));
}
if ((syllabus.match(/class="syl-topic"/g) || []).length < 40)
  problem("syllabus view rendered too few topics: " + (syllabus.match(/class="syl-topic"/g) || []).length);

Book.lessons.forEach((L) => {
  const html = render("#/lesson/" + L.id);
  const label = L.id + " (" + L.file + ")";
  if (html.indexOf("<h1>" + escText(L.title) + "</h1>") < 0 && html.indexOf(L.title) < 0)
    problem(label + ": title not rendered");
  if (html.indexOf("Worked examples") < 0) problem(label + ": examples section missing");
  if (html.indexOf("chap-nav") < 0) problem(label + ": navigation missing");
  if (html.indexOf('class="quiz"') < 0) problem(label + ": quiz missing");
  if (html.indexOf("By the end of this chapter") < 0) problem(label + ": objectives missing");
  const exCount = (html.match(/class="ex"/g) || []).length;
  if (exCount < 5) problem(label + ": rendered only " + exCount + " example cards");
  const stripped = withoutCode(html);
  if (stripped.indexOf("[object Object]") >= 0) problem(label + ": output contains '[object Object]'");

  // renderer-generated chrome must never contain placeholder values
  const chrome = [];
  const push = (re) => { const m = html.match(re); if (m) chrome.push(m[0]); };
  push(/<div class="chap-kicker">[\s\S]*?<\/div>/);
  push(/<h1>[\s\S]*?<\/h1>/);
  push(/<div class="chap-meta">[\s\S]*?<\/div>/);
  push(/<nav class="chap-nav">[\s\S]*?<\/nav>/);
  const chromeHtml = chrome.join("\n");
  ["undefined", "NaN", "[object Object]", "null</span>"].forEach((bad) => {
    if (chromeHtml.indexOf(bad) >= 0) problem(label + ": chrome contains '" + bad + "' -> " + chromeHtml.slice(0, 220));
  });
  if ((html.match(/<h1>/g) || []).length !== 1) problem(label + ": expected exactly one <h1>");
});

function escText(s) { return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }

/* highlight escaping check */
const sample = '<script>alert("x")</script> & `template` ${bad}';
const hi = Book.highlight(sample, "javascript");
if (hi.indexOf("<script>") >= 0) problem("highlight() does not escape HTML: " + hi);
if (hi.indexOf("&lt;script&gt;") < 0) problem("highlight() lost the escaped markup: " + hi);
const hiHtml = Book.highlight('<div class="a">x</div>', "html");
if (hiHtml.indexOf("<div") >= 0) problem("highlight(html) leaked raw tags: " + hiHtml);

/* progress round-trip */
try {
  Book.state.completed[Book.lessons[0].id] = Date.now();
  const c2 = render("#/course");
  if (c2.indexOf("lesson-row done") < 0) problem("course view does not reflect completed lessons");
} catch (e) {
  problem("progress check threw: " + e.message);
}

/* ------------------------------------------------- HTML structure audit */
const VOID_TAGS = new Set(["br", "hr", "img", "input", "meta", "link", "area", "base", "col",
  "embed", "source", "track", "wbr", "!doctype"]);
function checkBalanced(html, label) {
  const stack = [];
  const re = /<(\/?)([a-zA-Z][\w:-]*)\b([^>]*?)(\/?)>/g;
  let m2;
  while ((m2 = re.exec(html)) !== null) {
    const closing = m2[1] === "/";
    const tag = m2[2].toLowerCase();
    const selfClose = m2[4] === "/";
    if (VOID_TAGS.has(tag) || selfClose) continue;
    if (!closing) stack.push(tag);
    else {
      if (!stack.length) { problem(label + ": stray </" + tag + ">"); return; }
      const top = stack.pop();
      if (top !== tag) {
        problem(label + ": tag mismatch — expected </" + top + "> but found </" + tag + ">" +
          "\n      … " + html.slice(Math.max(0, m2.index - 180), m2.index + 60).replace(/\s+/g, " ") + " …");
        return;
      }
    }
  }
  if (stack.length) problem(label + ": unclosed <" + stack.slice(-4).join(">, <") + ">" +
    (m2 ? "\n      … last seen: … " + html.slice(Math.max(0, m2.index - 160), m2.index + 60).replace(/\s+/g, " ") + " …" : ""));
}

/* ---------------------------------------------------- CSS cross-checks */
let cssText = "";
try { cssText = fs.readFileSync(path.join(siteRoot, "assets", "styles.css"), "utf8"); }
catch (e) { problem("cannot read styles.css: " + e.message); }

if (cssText) {
  const opens = (cssText.match(/\{/g) || []).length;
  const closes = (cssText.match(/\}/g) || []).length;
  if (opens !== closes) problem("styles.css has unbalanced braces: " + opens + " { vs " + closes + " }");

  const definedVars = new Set([...cssText.matchAll(/(--[\w-]+)\s*:/g)].map((x) => x[1]));
  const usedVars = new Set([...cssText.matchAll(/var\((--[\w-]+)/g)].map((x) => x[1]));
  usedVars.forEach((v) => { if (!definedVars.has(v)) problem("styles.css uses undefined " + v); });

  const cssClasses = new Set([...cssText.matchAll(/\.([A-Za-z][\w-]*)/g)].map((x) => x[1]));
  const htmlParts = [cover, course, about, syllabus];
  Book.lessons.forEach((L) => htmlParts.push(render("#/lesson/" + L.id)));
  const allHtml = htmlParts.join("\n") + "\n" + Object.keys(registry).map((k) => registry[k].innerHTML).join("\n");

  checkBalanced(cover, "cover");
  checkBalanced(course, "course");
  checkBalanced(about, "about");
  checkBalanced(syllabus, "syllabus");
  Book.lessons.forEach((L) => checkBalanced(render("#/lesson/" + L.id), L.id));

  const usedClasses = new Set();
  const classRe = /class="([^"]+)"/g;
  let cm;
  while ((cm = classRe.exec(allHtml)) !== null) {
    cm[1].split(/\s+/).forEach((c) => { if (c && c.indexOf("$") < 0) usedClasses.add(c); });
  }
  [...cssText.matchAll(/classList\.(?:add|toggle)\("([\w-]+)"/g)].forEach((x) => usedClasses.add(x[1]));
  const unstyled = [...usedClasses].filter((c) => !cssClasses.has(c)).sort();
  if (unstyled.length) console.log("  note: classes with no CSS rule (may be intentional): " + unstyled.join(", "));
}

if (problems.length) {
  console.log("\nSMOKE FAILURES (" + problems.length + "):");
  problems.forEach((p) => console.log("  ✗ " + p));
  process.exit(1);
}
console.log("Smoke test passed: cover, course, syllabus map, about and " + Book.lessons.length + " lessons render cleanly.");
