# CONTENT SPEC — how every lesson file is written

Each lesson is **one file**: `fsd-course-site/content/lessons/<NNN>-<short-id>.js`
(`NNN` = the 3-digit number from `OUTLINE.md`).

The file must be valid JavaScript that can be loaded by a plain `<script>` tag (no imports, no
`export`, works from `file://`). Every file does exactly one thing:

```js
window.COURSE_LESSONS.push({ /* lesson object */ });
```

`window.COURSE_LESSONS` is initialised in `content/structure.js`, which loads first.

---

## 1. Lesson object — full schema

```js
window.COURSE_LESSONS.push({
  id: "w01-what-is-node",          // EXACT id from OUTLINE.md (unique, kebab-case)
  file: "005",                     // 3-digit file number as a string
  unit: 1,                         // 0 = preface, 1..4 = Units I..IV  (from OUTLINE.md)
  week: 1,                         // 0 = preface, 1..15               (from OUTLINE.md)
  title: "What is Node.js and why it exists",   // EXACT title from OUTLINE.md
  kicker: "Unit I · Week 1 · Lesson 1 of 6",    // build from the table below
  minutes: 14,                     // realistic reading + typing time (10–22)
  objectives: [                    // 2–4 short "By the end you can…" bullets
    "Explain what problem Node.js solves",
    "Name the three pillars of the Node runtime"
  ],
  intro: `
    <p>2–3 sentences that connect to the PREVIOUS lesson and open this one.</p>
  `,
  theory: [
    `
      <h3>Heading</h3>
      <p>Prose paragraphs. Use <code>inline code</code> freely. Explain jargon the first time it
      appears — the reader is a beginner starting <strong>from scratch</strong>.</p>
      <ul><li>bullet</li><li>bullet</li></ul>
    `,
    `
      <h3>Second block</h3>
      <p>…</p>
      <pre class="diagram">   optional ASCII diagram
   client ──HTTP──▶ server</pre>
    `
  ],
  examples: [ /* SEE SECTION 2 — AT LEAST 5, non-negotiable */ ],
  keyPoints: [                     // 3–6 one-line takeaways
    "Node.js runs JavaScript outside the browser"
  ],
  practice: `
    <p>A short hands-on task the reader can do in 5–10 minutes with the journal files.</p>
  `,
  quiz: [                          // EXACTLY 2 questions (or 3 for big lessons)
    {
      q: "Which command prints the installed Node version?",
      options: ["node -v", "npm node", "node --version-all", "nodejs -list"],
      answer: 0,                   // 0-based index of the correct option
      why: "node -v (or node --version) prints the version. npm is the package manager."
    }
  ],
  sources: [                       // optional; theory URLs (react.dev, MDN, nodejs.org docs…)
    "https://nodejs.org/api/"
  ]
});
```

`kicker` format: `"Unit I · Week 1 · Lesson 3 of 6"` / for the preface
`"Preface · Lesson 2 of 4"`. Roman numerals for units (I, II, III, IV), word "Preface" for unit 0.

---

## 2. Examples — the hard requirement

**At least 5 examples per lesson.** Each example:

```js
{
  title: "A tiny HTTP server in 10 lines",
  from: "journal",                 // "journal" = real file from this repo | "new" = written for the book
  file: "sorted_files/01_Week-01_Node-Intro/01_server.js",   // REQUIRED when from:"journal"
  lang: "javascript",              // javascript | jsx | json | sql | bash | html | css | text
  code: `
const http = require("http");
...
`,
  explain: [
    "Plain-text bullet explaining what line 1 does.",
    "Another bullet. May contain <code>tags</code>."
  ],
  run: "node 01_server.js",        // how to run it (omit for pseudo/SQL snippets)
  output: "Server running at http://localhost:8080"   // expected console output (optional)
}
```

Rules:
1. **Verify `file` exists** before you write it (`sorted_files/…` paths — read the actual file and
   use its real code, trimmed to the interesting part if it is long). Never invent a path.
2. Aim for a *mix*: for most lessons examples 1–N should be the journal's own files (`from:
   "journal"`), and you may add `from: "new"` examples to reach 5+ or to teach something the journal
   lacks. At least **3 journal examples per lesson** is the target whenever the week folder has them;
   weeks with missing material (12.6/12.7, Week 13, Week 14) may be mostly `new` — then say so in
   `sources` and in the `intro`.
3. Examples must be **complete enough to run**: include the `require`/`import` lines, do not leave
   `// ...rest of code`. Keep each example mostly ≤ 25 lines (longer only when the journal file
   genuinely is, e.g. `otaku/server/server.js` — then it is fine to show the key excerpt plus a note).
4. Show **real output** in `output` when the example prints something — beginners learn a lot from
   expected console output.
5. `explain` bullets: 2–5 per example, concrete ("`require('http')` returns the built-in http
   module — no npm install needed").

`lang` per example must match the file type: `.js`/`.mjs` → `javascript`, `.jsx` → `jsx`,
`.json` → `json`, `.sql` → `sql`, terminal commands → `bash`, `.html` → `html`, `.css` → `css`,
plain notes → `text`.

---

## 3. Writing style (this is a *book*, not a doc dump)

- **Teach from scratch.** Assume the reader has never seen the topic. Define every term on first
  use (e.g. "ORM — a tool that lets you write JavaScript instead of SQL").
- Build on the previous lesson: the `intro` must explicitly link back ("In the last chapter you
  built a server that…") and forward.
- Short paragraphs (3–5 sentences), one idea per paragraph. Use `<h3>` headings inside `theory`
  blocks so the chapter has structure. Never wall-of-text.
- Every abstract claim gets a concrete code example. Theory blocks without code nearby = rewrite.
- Honest attribution: where the journal is missing/buggy or the lab came from a classmate's backup,
  say so plainly in `intro`, `theory` or `sources` — see `OUTLINE.md` notes for Weeks 9.3, 12.6,
  12.7, 13, 14.
- Known journal bugs must be called out and fixed in an example (e.g. `useReducer.js` calling
  `dispatchEvent` instead of `dispatch`, the `sequalize.Define` stub, the `emial` column typo) —
  "spot the bug" is excellent teaching material: show the broken code, explain it, show the fix.
- Theory facts you are unsure about (versions, current APIs) — check with a quick web search
  (react.dev, nodejs.org, sequelize.org, developer.mozilla.org) and put the URL in `sources`.

## 4. HTML allowed in strings

Only these tags: `p, h3, h4, ul, ol, li, strong, em, code, pre, blockquote, table, thead, tbody,
tr, th, td, a, span, br, div.callout, div.note, div.warn`. Class names allowed: `callout`,
`note`, `warn`, `diagram`, `kbd`.
`<a>` links must include `target="_blank" rel="noopener"`.

## 5. String-escaping rules (IMPORTANT — the file must parse)

- Use **template literals** (backticks) for `intro`, `theory`, `practice`, `code`.
- If the content itself contains a backtick, escape it as `` \` ``; if it contains `${`, escape it
  as `\${`. (Example: showing `` `hello ${name}` `` in prose → write `` \`hello \${name}\` ``.)
- Use normal double-quoted strings for `title`, `file`, `run`, `output`, `kicker` — but if such a
  string needs a newline or a backslash, use a template literal instead.
- HTML attribute values inside your HTML strings use **single quotes** (`<a href='...'>`) so they
  never collide with quoting.
- Every example's `code` must be **exactly runnable code** — no smart quotes, no `…`, no ellipsis
  placeholders.

## 6. Before you finish — self-check

1. `node --check <your file>` passes for every file you wrote.
2. Every lesson: ≥ 5 examples, exactly 2–3 quiz questions, correct `answer` index (0-based),
   `keyPoints` 3–6, `objectives` 2–4.
3. `id`, `title`, `unit`, `week`, `file` match `OUTLINE.md` exactly.
4. Every `from:"journal"` path exists on disk.
5. Titles of your lessons are unique and the chapter reads in a logical order with its neighbours.
