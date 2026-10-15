# The FSD Book

A **book-style course website** that teaches everything covered in this repository's FSD journal
(CSA 301 — Full Stack Development) **from scratch**, chapter by chapter:

- **Unit 0 — Preface:** setup, JavaScript essentials, how to run the journal code
- **Unit I — Node.js** (Weeks 1–6): servers, modules, the event loop, promises, streams, cron, webpack
- **Unit II — Sequelize & MySQL** (Weeks 7–10): databases, models, migrations, queries, associations
- **Unit III — React** (Weeks 11–14): components, props, state, hooks, routing, Redux
- **Unit IV — Integration** (Week 15): the Otaku Travel Map full-stack app, end to end

**85 chapters · 425+ runnable code examples (at least 5 per concept) · a quiz in every chapter ·
progress tracking · a final course index.**

---

## How to open it

**Double-click `index.html`.** That's it — no build step, no server, no internet required.
(It is a plain HTML/CSS/JS site; all content is loaded through `<script>` tags so `file://` works.)

Works in any modern browser (Chrome, Edge, Firefox, Safari).
Your reading progress and quiz results are saved in that browser's local storage.

### Optional: serve it instead

```powershell
cd fsd-course-site
python -m http.server 8080     # then open http://localhost:8080
```

---

## How the site is organised

```
fsd-course-site/
├── index.html                 # the shell (sidebar + reader); lesson <script> tags are generated
├── OUTLINE.md                 # canonical chapter list (ids, titles, units, weeks) — source of truth
├── CONTENT_SPEC.md            # the schema/style rules every lesson file follows
├── assets/
│   ├── styles.css             # the bookish theme (paper / sepia / night)
│   └── app.js                 # router, table of contents, reader, quizzes, progress, highlighting
├── content/
│   ├── structure.js           # units + weeks metadata + the official syllabus map (COURSE_SYLLABUS)
│   └── lessons/001…085-*.js   # one file per chapter (theory + examples + quiz)
└── tools/
    ├── build-index.js         # regenerates the lesson <script> tags in index.html
    ├── validate.js            # schema + spec checks (>=5 examples, quiz shape, journal paths…)
    └── smoke.js               # renders every view in a DOM stub, audits HTML/CSS
```

### Reading flow

Cover → **chapter** → *Next chapter* button (or <kbd>→</kbd> arrow key) → … → **Course index**.
Chapters build on each other: each one states its objectives, teaches the idea, shows the worked
examples (badged **From your journal** with the real file path, or **New example**), lists key
points, gives you a practice task, then a short quiz. Passing the quiz ticks the chapter off.

### Syllabus map

`#/syllabus` lists the official CSA 301 syllabus topic by topic, in syllabus order, each linked to
the chapter that teaches it, with the syllabus number (e.g. *9.3*) beside it. Topics that were
blank in the journal are badged **Written from docs**; topics taken from a classmate's backup lab
are badged **Classmate's lab**. Use it to check coverage before an exam.

---

## Working on the content

```powershell
node tools/build-index.js   # after adding/removing/renaming lesson files
node tools/validate.js      # spec + outline conformance (fails on <5 examples, bad quiz, bad paths)
node tools/smoke.js         # renders cover/course/about + every chapter; checks HTML & CSS
```

- **Adding a chapter:** add a row to `OUTLINE.md`, create `content/lessons/<NNN>-<id>.js` that does
  `window.COURSE_LESSONS.push({...})` per `CONTENT_SPEC.md`, then run the three commands above.
- **Theme/text size/TOC** toggles live in the top bar and persist per browser.
- The reader has no dependencies and no bundler — everything is a plain script tag.

## Sources and honesty notes

Some chapters had to be written from official documentation because the journal was blank or the
lab belonged to a classmate — each of those chapters says so in its text and links its sources:

| Topic | Why |
|---|---|
| `useMemo`, `useCallback` (12.6/12.7) | blank in the journal — taught from react.dev |
| React Router / navigation (Week 13) | journal folder empty — taught from reactrouter.com |
| Raw SQL queries (9.3) | only in a classmate's backup project (roll 2408030) — attributed |
| Redux (Week 14) | only in a classmate's backup project (roll 2408030) — attributed |

Known bugs preserved from the original journal (and fixed inside the lessons, on purpose):
`dispatchEvent` instead of `dispatch` in `lab19/src/useReducer.js`, the `sequalize.Define` stub,
the `emial` column typo, the truncated `03_cron3.js`, and the bogus `webpack.config.js` dependency
in `week5-bundler/package.json`.

Built from `sorted_files/`, `journal_sorted/` and `otaku/` in this repository.
