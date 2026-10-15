/* ==========================================================================
   The FSD Book — application
   A single-file reader: routing, table of contents, lesson rendering,
   syntax highlighting, quizzes, progress tracking (localStorage).
   No dependencies. Works from file:// (double-click index.html).
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- utils */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }
  function strip(html) {
    return String(html == null ? "" : html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  function num(v, d) {
    const n = parseInt(v, 10);
    return isNaN(n) ? d : n;
  }
  const ROMAN = { 0: "Preface", 1: "Unit I", 2: "Unit II", 3: "Unit III", 4: "Unit IV" };

  let toastTimer = null;
  function toast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ----------------------------------------------------------------- data */
  const UNITS = window.COURSE_UNITS || [];
  const WEEKS = window.COURSE_WEEKS || [];
  const META = window.COURSE_META || { title: "The FSD Book", subtitle: "" };

  /* "Unit I · Week 1 · Lesson 3 of 6" -> "Lesson 3 of 6" (tolerates odd separators) */
  function kickerLessonLabel(L) {
    const raw = String(L.kicker || "");
    const parts = raw.split(/\s*[·•|>]\s*/);
    const last = (parts[parts.length - 1] || "").trim();
    const label = /lesson|preface|chapter|part/i.test(last) ? last : raw;
    const s = String(label).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );
    return s;
  }

  const LESSONS = (function () {
    const raw = (window.COURSE_LESSONS || []).slice();
    raw.sort((a, b) => num(a.file, 0) - num(b.file, 0));
    const seen = Object.create(null);
    const out = [];
    raw.forEach((l) => {
      if (!l || !l.id) return;
      if (seen[l.id]) { console.warn("[FSD Book] duplicate lesson id skipped:", l.id); return; }
      seen[l.id] = true;
      out.push(l);
    });
    out.forEach((l, i) => {
      l.pos = i + 1;                                   // global reading position
      l.unit = num(l.unit, 0);
      l.week = num(l.week, 0);
      l.minutes = num(l.minutes, 12);
      l.examples = Array.isArray(l.examples) ? l.examples : [];
      l.quiz = Array.isArray(l.quiz) ? l.quiz : [];
      l.keyPoints = Array.isArray(l.keyPoints) ? l.keyPoints : [];
      l.objectives = Array.isArray(l.objectives) ? l.objectives : [];
      l.theory = Array.isArray(l.theory) ? l.theory : [];
      l.sources = Array.isArray(l.sources) ? l.sources : [];
      const wk = WEEKS.find((w) => w.unit === l.unit && w.week === l.week);
      l.weekTitle = wk ? wk.title : "";
      l.unitTitle = (UNITS.find((u) => u.n === l.unit) || {}).title || "";
      if (!l.kicker) {
        const sameWeek = out.filter((x) => x.unit === l.unit && x.week === l.week);
        const idx = sameWeek.indexOf(l) + 1;
        l.kicker = l.week === 0
          ? "Preface · Lesson " + idx + " of " + sameWeek.length
          : ROMAN[l.unit] + " · Week " + l.week + " · Lesson " + idx + " of " + sameWeek.length;
      }
    });
    return out;
  })();

  const BY_ID = Object.create(null);
  LESSONS.forEach((l) => (BY_ID[l.id] = l));
  function idxOf(id) { return LESSONS.findIndex((l) => l.id === id); }
  function lessonAt(i) { return i >= 0 && i < LESSONS.length ? LESSONS[i] : null; }
  function prevOf(l) { return lessonAt(idxOf(l.id) - 1); }
  function nextOf(l) { return lessonAt(idxOf(l.id) + 1); }

  function weekLessons(unit, week) {
    return LESSONS.filter((l) => l.unit === unit && l.week === week);
  }
  function unitLessons(n) { return LESSONS.filter((l) => l.unit === n); }

  /* --------------------------------------------------------------- store */
  const KEY = "fsdbook.progress.v1";
  const S = (function () {
    const def = { completed: {}, quiz: {}, last: null, theme: "paper", font: 0, toc: true };
    let s;
    try {
      s = Object.assign({}, def, JSON.parse(localStorage.getItem(KEY) || "{}"));
    } catch (e) {
      s = def;
    }
    if (!s.completed) s.completed = {};
    if (!s.quiz) s.quiz = {};
    s.theme = ["paper", "sepia", "night"].indexOf(s.theme) >= 0 ? s.theme : "paper";
    s.font = num(s.font, 0);
    return s;
  })();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* file:// without storage */ }
  }
  const doneCount = () => Object.keys(S.completed).filter((id) => BY_ID[id]).length;
  const quizPassed = () => Object.keys(S.quiz).filter((id) => BY_ID[id]).length;
  const pct = () => (LESSONS.length ? Math.round((doneCount() / LESSONS.length) * 100) : 0);

  /* --------------------------------------------------------- highlighting */
  const HL_JS = {
    kw: "kw", com: "com", str: "str", num: "num", fn: "fn", con: "con", tag: "tag"
  };
  const KW_JS = "const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|typeof|instanceof|class|extends|super|this|import|export|from|default|async|await|try|catch|finally|throw|delete|in|of|void|yield|static";

  function jsPattern(withGuard) {
    const tagStart = withGuard ? "(?<=[\\s(={\\[>,!&|?:;])" : "";
    return (
      "(?<com>\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)" +
      "|(?<str>`(?:\\\\[\\s\\S]|[^\\\\`])*`|\"(?:\\\\[\\s\\S]|[^\\\\\"])*\"|'(?:\\\\[\\s\\S]|[^\\\\'])*')" +
      "|(?<kw>\\b(?:" + KW_JS + ")\\b)" +
      "|(?<con>\\b(?:true|false|null|undefined|NaN|Infinity)\\b)" +
      "|(?<num>\\b\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?\\b)" +
      "|(?<fn>[A-Za-z_$][\\w$]*(?=\\s*\\())" +
      "|(?<tag>" + tagStart + "<\\/?[A-Za-z][\\w.]*|\\/>)" +
      "|(?<pun>=>|\\*\\*|===|!==|==|!=|<=|>=|\\+\\+|--)"
    );
  }

  const SQL_KW = "SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|CREATE|DROP|ALTER|TABLE|DATABASE|IF|NOT|NULL|DEFAULT|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|AUTO_INCREMENT|INT|INTEGER|VARCHAR|TEXT|TIMESTAMP|DATE|DECIMAL|BOOLEAN|ENUM|ORDER|GROUP|BY|LIMIT|OFFSET|JOIN|INNER|LEFT|RIGHT|ON|AS|AND|OR|IN|LIKE|BETWEEN|COUNT|SUM|AVG|MIN|MAX|VALUES|SET|SHOW|USE|DESCRIBE|EXISTS|CASCADE|CONSTRAINT|ENGINE|CHARSET|AUTOINCREMENT|SERIAL|INTEGER_PRIMARY|BIGSERIAL";

  const HIGHLIGHT_SPECS = {
    javascript: { pattern: jsPattern(true), fallback: jsPattern(false) },
    jsx: { pattern: jsPattern(true), fallback: jsPattern(false) },
    json: {
      pattern:
        "(?<com>\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)" +
        "|(?<str>\"(?:\\\\[\\s\\S]|[^\\\\\"])*\")(?=\\s*:)|(?<str2>\"(?:\\\\[\\s\\S]|[^\\\\\"])*\")" +
        "|(?<num>-?\\b\\d+(?:\\.\\d+)?\\b)" +
        "|(?<con>\\b(?:true|false|null)\\b)",
      fallback: null
    },
    sql: {
      pattern:
        "(?<com>--[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)" +
        "|(?<str>'(?:''|[^'])*'|\"(?:\"\"|[^\"])*\")" +
        "|(?<num>\\b\\d+(?:\\.\\d+)?\\b)" +
        "|(?<kw>\\b(?:" + SQL_KW + ")\\b)",
      fallback: null
    },
    bash: {
      pattern:
        "(?<com>#[^\\n]*)" +
        "|(?<str>\"(?:\\\\[\\s\\S]|[^\\\\\"])*\"|'(?:[^'])*')" +
        "|(?<var>\\$\\{?[A-Za-z_][\\w]*\\}?" +
        ")" +
        "|(?<num>\\b\\d+(?:\\.\\d+)?\\b)" +
        "|(?<kw>\\b(?:npm|npx|node|cd|mkdir|rm|cp|mv|ls|cat|echo|export|source|mysql|git|vite|webpack|sudo|ping|curl|chmod|powershell|Set-ExecutionPolicy)\\b)",
      fallback: null
    },
    html: {
      pattern:
        "(?<com><!--[\\s\\S]*?-->)" +
        "|(?<str>\"[^\\\"]*\"|'(?:[^'])*')" +
        "|(?<tag><\\/?[A-Za-z][\\w:-]*|\\/?>)" +
        "|(?<att>\\b[A-Za-z-]+(?==))",
      fallback: null,
      escapeFirst: false
    },
    css: {
      pattern:
        "(?<com>\\/\\*[\\s\\S]*?\\*\\/)" +
        "|(?<str>\"[^\\\"]*\"|'[^']*')" +
        "|(?<kw>@[A-Za-z-]+|--[A-Za-z-]+)" +
        "|(?<num>-?\\b\\d+(?:\\.\\d+)?(?:px|rem|em|%|vh|vw|s|ms|fr|deg)?\\b)" +
        "|(?<fn>[A-Za-z-]+(?=\\s*:))",
      fallback: null
    },
    text: { pattern: null, fallback: null }
  };
  // names used by json alternation that map to classes:
  const CLASS_OF = {
    com: "com", str: "str", str2: "str", kw: "kw", con: "con", num: "num",
    fn: "fn", tag: "tag", att: "att", var: "kw", pun: "pun"
  };

  let lookbehindOK = true;
  try { new RegExp("(?<=a)"); } catch (e) { lookbehindOK = false; }
  const compiled = Object.create(null);

  function highlight(code, lang) {
    const spec = HIGHLIGHT_SPECS[lang] || HIGHLIGHT_SPECS.javascript;
    if (!spec || !spec.pattern) return esc(code);
    if (!compiled[lang]) {
      const pat = spec.fallback && !lookbehindOK ? spec.fallback : spec.pattern;
      try {
        compiled[lang] = { re: new RegExp(pat, "g"), escapeFirst: !!spec.escapeFirst };
      } catch (e) {
        return esc(code);
      }
    }
    const re = compiled[lang].re;
    re.lastIndex = 0;
    let out = "", last = 0, m;
    let guard = 0;
    while ((m = re.exec(code)) !== null) {
      if (++guard > 100000) break;
      if (m[0] === "") { re.lastIndex++; continue; }
      out += esc(code.slice(last, m.index));
      let cls = "pun";
      if (m.groups) {
        for (const g in m.groups) {
          if (m.groups[g] !== undefined) { cls = CLASS_OF[g] || "pun"; break; }
        }
      }
      out += '<span class="tok-' + cls + '">' + esc(m[0]) + "</span>";
      last = m.index + m[0].length;
    }
    out += esc(code.slice(last));
    return out;
  }

  function codeBlock(ex, n) {
    const lang = ex.lang || "javascript";
    return (
      '<div class="code-wrap">' +
        '<div class="code-head">' +
          '<span class="code-lang">' + esc(lang) + "</span>" +
          '<button class="code-copy" type="button">Copy</button>' +
        "</div>" +
        '<pre class="code"><code class="language-' + esc(lang) + '" data-raw="' +
          esc(ex.code || "") + '">' + highlight(ex.code || "", lang) + "</code></pre>" +
      "</div>"
    );
  }

  function exampleCard(ex, n) {
    const badge = ex.from === "journal"
      ? '<span class="badge journal">From your journal</span>' +
        (ex.file ? '<span class="badge file" title="' + esc(ex.file) + '">' + esc(ex.file) + "</span>" : "")
      : '<span class="badge new">New example</span>';
    const explain = (ex.explain || []).length
      ? '<ul class="ex-explain">' + ex.explain.map((e) => "<li>" + e + "</li>").join("") + "</ul>"
      : "";
    const run = ex.run || ex.output
      ? '<div class="ex-run">' +
          (ex.run ? '<span class="lbl">Run</span><span>' + esc(ex.run) + "</span>" : "") +
          (ex.output ? '<span class="lbl">Output</span><span class="out">' + esc(ex.output) + "</span>" : "") +
        "</div>"
      : "";
    return (
      '<figure class="ex" id="ex-' + n + '">' +
        '<figcaption class="ex-head">' +
          '<div class="ex-no">Example ' + n + "</div>" +
          "<h4>" + esc(ex.title || "Example " + n) + "</h4>" +
          '<div class="badges">' + badge + "</div>" +
        "</figcaption>" +
        codeBlock(ex, n) +
        explain + run +
      "</figure>"
    );
  }

  function quizBlock(L) {
    if (!L.quiz.length) return "";
    const qs = L.quiz.map((q, i) => {
      const opts = q.options.map((o, j) =>
        '<button class="quiz-opt" type="button" data-o="' + j + '">' +
          '<span class="k">' + "ABCDE"[j] + "</span><span>" + o + "</span>" +
        "</button>"
      ).join("");
      return (
        '<div class="quiz-q" data-i="' + i + '" data-answer="' + num(q.answer, 0) + '">' +
          '<div class="q-text">Q' + (i + 1) + ". " + esc(q.q) + "</div>" +
          '<div class="quiz-opts">' + opts + "</div>" +
          '<div class="quiz-why"><strong>Why:</strong> ' + (q.why || "") + "</div>" +
        "</div>"
      );
    }).join("");
    return (
      '<section class="quiz">' +
        '<div class="quiz-title"><h3>Check yourself</h3><span class="pill">Quiz</span></div>' +
        qs +
        '<div class="quiz-foot">' +
          '<button class="btn btn-primary js-check" type="button">Check answers</button>' +
          '<button class="btn js-retry" type="button" hidden>Try again</button>' +
          '<span class="quiz-result"></span>' +
        "</div>" +
      "</section>"
    );
  }

  function navCard(l, dir) {
    if (!l) {
      return dir === "prev" ? "" :
        '<a class="nav-card next" href="#/course">' +
          '<span class="dir">End of the book &#8594;</span>' +
          '<span class="ttl">Course index &amp; progress</span>' +
        "</a>";
    }
    const cls = dir === "prev" ? "nav-card prev" : "nav-card next";
    const lbl = dir === "prev" ? "&#8592; Previous chapter" : "Next chapter &#8594;";
    return '<a class="' + cls + '" href="#/lesson/' + esc(l.id) + '">' +
      '<span class="dir">' + lbl + "</span>" +
      '<span class="ttl">' + esc(l.title) + "</span>" +
    "</a>";
  }

  /* ------------------------------------------------------------ views: cover */
  function viewCover() {
    const total = LESSONS.length;
    const done = doneCount();
    const minutes = LESSONS.reduce((a, l) => a + l.minutes, 0);
    const start = S.last && BY_ID[S.last] ? S.last : (LESSONS[0] ? LESSONS[0].id : "");
    const startLabel = S.last && BY_ID[S.last] ? "Resume reading" : "Start reading";

    const cards = UNITS.map((u) => {
      const ls = unitLessons(u.n);
      const d = ls.filter((l) => S.completed[l.id]).length;
      const first = ls.find((l) => !S.completed[l.id]) || ls[0];
      const w = ls.length ? Math.round((d / ls.length) * 100) : 0;
      return '<a class="unit-card" href="' + (first ? "#/lesson/" + esc(first.id) : "#/course") + '">' +
        '<span class="uc-roman">' + esc(u.n === 0 ? "Preface" : "Unit " + u.roman) + "</span>" +
        "<h3>" + esc(u.title) + "</h3>" +
        "<p>" + esc(u.blurb) + "</p>" +
        '<div class="uc-bar"><i style="width:' + w + '%"></i></div>' +
        '<div class="uc-meta"><span>' + ls.length + " chapters</span><span>" + w + "% read</span></div>" +
      "</a>";
    }).join("");

    return (
      '<div class="cover">' +
        '<div class="cover-rule"><span>' + esc(META.series || "") + "</span></div>" +
        "<h1>" + esc(META.title || "The FSD Book") + "</h1>" +
        '<p class="cover-sub">' + esc(META.subtitle || "") + "</p>" +
        '<div class="cover-ornament">&#10087;</div>' +
        '<p class="cover-desc">' + esc(META.description || "") + "</p>" +
        '<div class="cover-actions">' +
          '<a class="btn btn-primary" href="#/lesson/' + esc(start) + '">' + startLabel + " &#8594;</a>" +
          '<a class="btn" href="#/course">Course index</a>' +
          '<a class="btn" href="#/syllabus">Syllabus map</a>' +
          '<a class="btn btn-ghost" href="#/about">About this book</a>' +
        "</div>" +
        '<div class="cover-stats">' +
          '<div class="stat"><b>' + total + "</b><span>Chapters</span></div>" +
          '<div class="stat"><b>' + UNITS.length + "</b><span>Units</span></div>" +
          '<div class="stat"><b>' + Math.round((minutes / 60) * 10) / 10 + "h</b><span>Reading time</span></div>" +
          '<div class="stat"><b>' + done + "</b><span>Completed</span></div>" +
        "</div>" +
        '<div class="unit-grid">' + cards + "</div>" +
      "</div>"
    );
  }

  /* --------------------------------------------------------- views: lesson */
  function viewLesson(id) {
    const L = BY_ID[id];
    if (!L) {
      return '<div class="sheet"><h1>Chapter not found</h1>' +
        '<p>No chapter with id <code>' + esc(id) + "</code>. " +
        '<a href="#/course">Open the course index</a>.</p></div>';
    }
    const done = !!S.completed[L.id];
    const score = S.quiz[L.id];

    const objectives = L.objectives.length
      ? '<div class="objectives"><h4>By the end of this chapter you can</h4><ul>' +
          L.objectives.map((o) => "<li>" + o + "</li>").join("") + "</ul></div>"
      : "";

    const theory = L.theory.map((b) => b).join("");

    const examples = L.examples.length
      ? '<hr class="chap-rule thin" /><h3 id="examples">Worked examples (' + L.examples.length + ")</h3>" +
        L.examples.map((ex, i) => exampleCard(ex, i + 1)).join("")
      : "";

    const keypoints = L.keyPoints.length
      ? '<section class="keypoints"><h3>What to remember</h3><ul>' +
          L.keyPoints.map((k) => "<li>" + k + "</li>").join("") + "</ul></section>"
      : "";

    const practice = L.practice
      ? '<section class="practice"><h3>Your turn &#9998;</h3>' + L.practice + "</section>"
      : "";

    const sources = L.sources.length
      ? '<p class="sources">Further reading: ' +
          L.sources.map((u) => '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u) + "</a>").join(" &middot; ") +
        "</p>"
      : "";

    const statusPill = done
      ? '<span class="badge new">Completed &#10003;</span>'
      : '<span class="badge">Not started</span>';
    const quizPill = score
      ? '<span class="badge new">Quiz ' + score.score + "/" + score.total + "</span>"
      : "";

    return (
      '<article class="sheet" data-lesson="' + esc(L.id) + '">' +
        '<header class="chap-head">' +
          '<div class="chap-kicker">' +
            "<span>" + esc(ROMAN[L.unit] || "") + "</span>" +
            '<span class="sep">&middot;</span>' +
            "<span>" + (L.week === 0 ? "Preface" : "Week " + L.week) + "</span>" +
            '<span class="sep">&middot;</span>' +
            "<span>" + kickerLessonLabel(L) + "</span>" +
            '<span class="sep">&middot;</span>' +
            '<span class="minutes">&#8986; ' + L.minutes + " min</span>" +
          "</div>" +
          "<h1>" + esc(L.title) + "</h1>" +
          '<div class="chap-meta"><span>Chapter ' + L.pos + " of " + LESSONS.length + "</span>" +
            statusPill + quizPill +
            (L.weekTitle ? "<span>" + esc(L.weekTitle) + "</span>" : "") +
          "</div>" +
          '<hr class="chap-rule" />' +
        "</header>" +
        objectives +
        '<div class="lede">' + (L.intro || "") + "</div>" +
        theory +
        examples +
        keypoints +
        practice +
        quizBlock(L) +
        sources +
        '<nav class="chap-nav">' +
          navCard(prevOf(L), "prev") +
          '<div class="center">' +
            '<button class="btn ' + (done ? "btn-done" : "") +
              ' js-complete" type="button">' + (done ? "&#10003; Completed" : "Mark complete") + "</button>" +
            '<span class="kbd-hint">Tip: <kbd>&larr;</kbd> <kbd>&rarr;</kbd> turn pages</span>' +
          "</div>" +
          navCard(nextOf(L), "next") +
        "</nav>" +
      "</article>"
    );
  }

  /* -------------------------------------------------------- views: course */
  function viewCourse() {
    const total = LESSONS.length;
    const done = doneCount();
    const passed = quizPassed();
    const leftMin = LESSONS.filter((l) => !S.completed[l.id]).reduce((a, l) => a + l.minutes, 0);
    const resume = nextUnfinished();

    const unitsHtml = UNITS.map((u) => {
      const ls = unitLessons(u.n);
      if (!ls.length) return "";
      const ud = ls.filter((l) => S.completed[l.id]).length;
      const weeks = WEEKS.filter((w) => w.unit === u.n);
      const weeksHtml = weeks.map((w) => {
        const wls = weekLessons(w.unit, w.week);
        if (!wls.length) return "";
        const wd = wls.filter((l) => S.completed[l.id]).length;
        const rows = wls.map((l) => {
          const isDone = !!S.completed[l.id];
          const sc = S.quiz[l.id];
          const cls = "lesson-row" + (isDone ? " done" : "") + (!isDone && sc ? " quizok" : "");
          const status = isDone ? "&#10003;" : (sc ? "&#9681;" : "");
          return '<a class="' + cls + '" href="#/lesson/' + esc(l.id) + '">' +
            '<span class="status">' + status + "</span>" +
            '<span class="lt"><span class="rm">' + String(l.pos).padStart(2, "0") + "</span> " + esc(l.title) + "</span>" +
            (sc ? '<span class="qb">quiz ' + sc.score + "/" + sc.total + "</span>" : "") +
            '<span class="rm">' + l.minutes + " min</span>" +
          "</a>";
        }).join("");
        return '<div class="week-block">' +
          '<div class="wk-title"><span class="no">W' + w.week + "</span>" + esc(w.title) +
            '<span class="wk-count">' + wd + "/" + wls.length + "</span></div>" + rows +
        "</div>";
      }).join("");
      return '<section class="unit-block">' +
        '<div class="unit-block-head"><span class="roman">' +
          esc(u.n === 0 ? "Preface" : "Unit " + u.roman) + "</span><h2>" + esc(u.title) + "</h2>" +
          '<span class="count">' + ud + "/" + ls.length + " read</span></div>" +
        weeksHtml +
      "</section>";
    }).join("");

    return (
      '<div class="wide">' +
        '<div class="course-head">' +
          "<div>" +
            '<div class="chap-kicker"><span>The full course</span></div>' +
            "<h1>Course index &amp; progress</h1>" +
            '<p style="margin:0;color:var(--ink-2)">Every chapter of the book, in reading order. ' +
            "Tick chapters as you finish them — your place is saved in this browser.</p>" +
          "</div>" +
        "</div>" +

        '<div class="progress-panel">' +
          '<div class="pp-cell"><b id="pp-pct">' + pct() + '%</b><span>Complete</span></div>' +
          '<div class="pp-cell"><b>' + done + "/" + total + "</b><span>Chapters read</span></div>" +
          '<div class="pp-cell"><b>' + passed + "</b><span>Quizzes passed</span></div>" +
          '<div class="pp-cell"><b>' + Math.round(leftMin) + "m</b><span>Time left</span></div>" +
          '<div class="pp-cell bar"><div class="pp-bar"><i style="width:' + pct() + '%"></i></div></div>' +
        "</div>" +

        '<div class="course-actions">' +
          (resume
            ? '<a class="btn btn-primary" href="#/lesson/' + esc(resume.id) + '">Continue &#8212; ' + esc(resume.title) + "</a>"
            : '<a class="btn btn-primary" href="#/">Start the course &#8594;</a>') +
          '<button class="btn js-print" type="button">Print</button>' +
          '<a class="btn" href="#/syllabus">Syllabus map</a>' +
          '<button class="btn btn-ghost js-reset" type="button">Reset progress</button>' +
        "</div>" +

        '<div class="howto">' +
          '<div class="step"><b>How to use this book</b><p>Read chapter by chapter. Each chapter teaches one idea, shows at least five runnable examples, then asks you two quick questions.</p></div>' +
          '<div class="step"><b>Use the Next button</b><p>Press the big <em>Next chapter</em> button (or the &#8594; arrow key) to move on. The order builds on itself — do not skip ahead.</p></div>' +
          '<div class="step"><b>Run the code</b><p>Every example tells you how to run it (<code>node file.js</code>) and what you should see. Type them out — do not just read.</p></div>' +
          '<div class="step"><b>Track your progress</b><p>Mark chapters complete and pass the quizzes. The index below remembers where you stopped, in this browser only.</p></div>' +
        "</div>" +

        unitsHtml +
      "</div>"
    );
  }

  function nextUnfinished() {
    return LESSONS.find((l) => !S.completed[l.id]) || null;
  }

  /* -------------------------------------------------------- views: syllabus */
  const SylSrc = {
    journal: "From your journal",
    classmate: "Classmate's lab",
    docs: "Written from docs"
  };

  function viewSyllabus() {
    const data = window.COURSE_SYLLABUS || [];
    let topics = 0, hits = 0, misses = [];

    const units = data.map((u) => {
      const weeks = u.weeksList.map((w) => {
        const rows = w.topics.map((t, i) => {
          topics++;
          const links = t.to.map((id) => {
            const L = BY_ID[id];
            if (L) { hits++; return '<a class="syl-ch" href="#/lesson/' + esc(id) + '">' + esc(L.title) + "</a>"; }
            misses.push(id);
            return '<span class="syl-ch missing">' + esc(id) + "</span>";
          }).join("");
          return '<div class="syl-topic">' +
            '<span class="syl-no">' + w.n + "." + (i + 1) + "</span>" +
            '<div class="syl-body">' +
              '<div class="syl-t">' + esc(t.t) +
                ' <span class="syl-src s-' + esc(t.src) + '">' + esc(SylSrc[t.src] || t.src) + "</span></div>" +
              '<div class="syl-links">' + links + "</div>" +
              (t.note ? '<div class="syl-note">' + esc(t.note) + "</div>" : "") +
            "</div>" +
          "</div>";
        }).join("");
        return '<div class="week-block syl-week">' +
          '<div class="wk-title"><span class="no">W' + w.n + "</span>" + esc(w.title) + "</div>" + rows +
        "</div>";
      }).join("");
      return '<section class="unit-block">' +
        '<div class="unit-block-head"><span class="roman">Syllabus</span>' +
          "<h2>" + esc(u.unit) + '</h2><span class="count">' + esc(u.weeks) + "</span></div>" + weeks +
      "</section>";
    }).join("");

    return (
      '<div class="wide">' +
        '<div class="course-head"><div>' +
          '<div class="chap-kicker"><span>Official CSA 301 syllabus</span></div>' +
          "<h1>Syllabus &#8594; chapter map</h1>" +
          '<p style="margin:0;color:var(--ink-2)">Every topic of the CSA 301 syllabus, in the official order, ' +
          "linked to the chapter that teaches it. If a topic came from a classmate's lab or from the official " +
          "documentation because your journal was blank, it is labelled here and explained inside the chapter.</p>" +
        "</div></div>" +
        '<div class="progress-panel">' +
          '<div class="pp-cell"><b>' + topics + "</b><span>Syllabus topics</span></div>" +
          '<div class="pp-cell"><b>' + hits + "/" + topics + "</b><span>Topics with chapters</span></div>" +
          '<div class="pp-cell"><b>' + LESSONS.length + "</b><span>Chapters in the book</span></div>" +
          '<div class="pp-cell"><b>' + (window.COURSE_SYLLABUS || []).length + "</b><span>Units covered</span></div>" +
        "</div>" +
        '<div class="course-actions">' +
          '<a class="btn btn-primary" href="#/course">Open the course index</a>' +
          '<a class="btn" href="#/">Back to the cover</a>' +
        "</div>" +
        units +
        (misses.length ? '<p class="syl-warn">Unmapped topic ids: ' + esc(misses.join(", ")) + "</p>" : "") +
      "</div>"
    );
  }

  /* --------------------------------------------------------- views: about */
  function viewAbout() {
    return (
      '<div class="sheet about">' +
        '<div class="chap-kicker"><span>Colophon</span></div>' +
        "<h1>About this book</h1>" +
        '<hr class="chap-rule" />' +
        "<p class=\"lede\">" + esc(META.description || "") + "</p>" +
        "<dl>" +
          "<dt>What it is built from</dt>" +
          "<dd>Every chapter is tied to the code in this repository's FSD journal — " +
          "<code>sorted_files/01_Week-01_Node-Intro</code> through " +
          "<code>sorted_files/15_Week-15_Integration-otaku</code> — plus the unit notes in " +
          "<code>journal_sorted/</code>. Chapters marked <em>From your journal</em> quote those files directly.</dd>" +

          "<dt>Honest gaps</dt>" +
          "<dd>Four topics were blank in the original journal (<code>useMemo</code>, " +
          "<code>useCallback</code>, React Router/navigation) and two were only covered by a " +
          "classmate's backup lab (raw SQL queries in Week 9, Redux in Week 14). Those chapters say so " +
          "plainly and teach the topic from official documentation, with the sources linked. " +
          'The <a href="#/syllabus">syllabus map</a> shows the official CSA 301 topic list ' +
          "and exactly which chapter covers each one.</dd>" +

          "<dt>How to run the code</dt>" +
          "<dd>Install Node.js, then run any example with <code>node path/to/file.js</code>. " +
          "Backend chapters need MySQL running (XAMPP) and an <code>npm install</code> inside the " +
          "project folder; React chapters need <code>npm install</code> then <code>npm run dev</code>.</dd>" +

          "<dt>Where to read next</dt>" +
          "<dd>The last chapter — <em>Wrapping up: where to go from here</em> — points at deployment, " +
          "testing, TypeScript and Next.js.</dd>" +
        "</dl>" +
        '<p class="sources">' + esc(META.edition || "") + "</p>" +
        '<p><a href="#/">&#8592; Back to the cover</a></p>' +
      "</div>"
    );
  }

  /* ---------------------------------------------------------------- TOC */
  function buildToc() {
    const toc = $("#toc");
    if (!toc) return;
    let html = "";
    UNITS.forEach((u) => {
      const units = WEEKS.filter((w) => w.unit === u.n);
      let inner = "";
      units.forEach((w) => {
        const ls = weekLessons(w.unit, w.week);
        if (!ls.length) return;
        inner += '<div class="toc-week" data-week="' + w.week + '" data-unit="' + u.n + '">' +
          '<span class="wk-no">' + (w.week === 0 ? "PRE" : "W" + w.week) + "</span>" +
          "<span>" + esc(w.title) + "</span></div>";
        inner += ls.map((l) =>
          '<a class="toc-item" href="#/lesson/' + esc(l.id) + '" data-id="' + esc(l.id) + '">' +
            '<span class="num">' + String(l.pos).padStart(2, "0") + "</span>" +
            "<span>" + esc(l.title) + "</span>" +
            '<span class="tick">&#10003;</span>' +
          "</a>"
        ).join("");
      });
      if (!inner) return;
      html += '<div class="toc-unit" data-unit="' + u.n + '">' +
        '<div class="toc-unit-title"><span>' + esc(u.n === 0 ? "Preface" : "Unit " + u.roman) + "</span>" +
        "<span>" + esc(u.title) + "</span></div>" + inner + "</div>";
    });
    toc.innerHTML = html;
  }

  function syncToc(activeId) {
    $$(".toc-item").forEach((a) => {
      a.classList.toggle("active", a.dataset.id === activeId);
      a.classList.toggle("done", !!S.completed[a.dataset.id]);
    });
    const active = $('.toc-item.active');
    if (active && !document.body.classList.contains("printing")) {
      const box = $("#sidebar");
      if (box) {
        const top = active.offsetTop, bottom = top + active.offsetHeight;
        if (top < box.scrollTop || bottom > box.scrollTop + box.clientHeight) {
          box.scrollTop = top - box.clientHeight / 2;
        }
      }
    }
  }

  function syncChrome() {
    const p = pct();
    const fill = $("#top-progress-fill");
    const label = $("#top-progress-label");
    if (fill) fill.style.width = p + "%";
    if (label) label.textContent = p + "%";
  }

  function filterToc(q) {
    const query = (q || "").trim().toLowerCase();
    $$(".toc-unit").forEach((unit) => {
      let visible = 0;
      $$(".toc-week", unit).forEach((wk) => {
        let wkVisible = 0;
        const items = [];
        let node = wk.nextElementSibling;
        while (node && node.classList.contains("toc-item")) { items.push(node); node = node.nextElementSibling; }
        items.forEach((it) => {
          const hay = it.textContent.toLowerCase();
          const match = !query || hay.indexOf(query) >= 0;
          it.classList.toggle("hidden", !match);
          if (match) wkVisible++;
        });
        wk.classList.toggle("hidden", wkVisible === 0);
        visible += wkVisible;
      });
      unit.classList.toggle("hidden", visible === 0);
    });
  }

  /* -------------------------------------------------------------- router */
  function parseHash() {
    const h = (location.hash || "").replace(/^#\/?/, "");
    const parts = h.split("/").filter(Boolean);
    if (!parts.length) return { name: "cover" };
    if (parts[0] === "lesson" && parts[1]) return { name: "lesson", id: decodeURIComponent(parts[1]) };
    if (parts[0] === "course") return { name: "course" };
    if (parts[0] === "syllabus") return { name: "syllabus" };
    if (parts[0] === "about") return { name: "about" };
    return { name: "cover" };
  }

  let current = null;

  function route() {
    const r = parseHash();
    const main = $("#main");
    if (!main) return;
    let activeId = null;

    if (r.name === "lesson" && BY_ID[r.id]) {
      const L = BY_ID[r.id];
      main.innerHTML = viewLesson(L.id);
      activeId = L.id;
      S.last = L.id;
      save();
      document.title = L.title + " — " + META.title;
    } else if (r.name === "course") {
      main.innerHTML = viewCourse();
      document.title = "Course index — " + META.title;
    } else if (r.name === "syllabus") {
      main.innerHTML = viewSyllabus();
      document.title = "Syllabus map — " + META.title;
    } else if (r.name === "about") {
      main.innerHTML = viewAbout();
      document.title = "About — " + META.title;
    } else {
      main.innerHTML = viewCover();
      document.title = META.title + " — " + (META.subtitle || "");
    }

    current = r;
    syncToc(activeId);
    syncChrome();
    window.scrollTo(0, 0);
    document.body.classList.remove("toc-open");
    const search = $("#toc-search");
    if (search && search.value) filterToc(search.value);
  }

  function go(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  /* ------------------------------------------------------------- actions */
  function toggleComplete(id) {
    if (S.completed[id]) delete S.completed[id];
    else S.completed[id] = Date.now();
    save();
    syncChrome();
    syncToc(id);
    const btn = $(".js-complete");
    if (btn) {
      const done = !!S.completed[id];
      btn.classList.toggle("btn-done", done);
      btn.innerHTML = done ? "&#10003; Completed" : "Mark complete";
    }
    toast(S.completed[id] ? "Chapter marked complete ✓" : "Chapter unmarked");
  }

  function checkQuiz(root) {
    const boxes = $$(".quiz-q", root);
    let score = 0;
    boxes.forEach((q) => {
      const ans = num(q.dataset.answer, 0);
      const sel = $(".quiz-opt.selected", q);
      const chosen = sel ? num(sel.dataset.o, -1) : -1;
      $$(".quiz-opt", q).forEach((o) => {
        const oi = num(o.dataset.o, -1);
        o.disabled = true;
        if (oi === ans) o.classList.add("correct");
        else if (oi === chosen) o.classList.add("wrong");
      });
      if (chosen === ans) score++;
      q.classList.add("revealed");
    });
    const total = boxes.length;
    const foot = $(".quiz-foot", root);
    const result = $(".quiz-result", foot);
    const retry = $(".js-retry", foot);
    $(".js-check", foot).disabled = true;
    if (retry) retry.hidden = false;
    if (result) {
      result.textContent = score === total
        ? "Perfect — " + score + "/" + total + " ✓"
        : score + "/" + total + " correct";
    }
    const id = root.closest("[data-lesson]") ? root.closest("[data-lesson]").dataset.lesson : null;
    if (id) {
      const prev = S.quiz[id];
      if (!prev || score > prev.score) S.quiz[id] = { score: score, total: total };
      save();
      if (score === total && !S.completed[id]) {
        S.completed[id] = Date.now();
        save();
        toast("Quiz passed — chapter marked complete ✓");
        const btn = $(".js-complete");
        if (btn) { btn.classList.add("btn-done"); btn.innerHTML = "&#10003; Completed"; }
        syncToc(id);
      } else if (score === total) {
        toast("Quiz passed ✓");
      }
      syncChrome();
      // refresh the pill in the header
      const meta = $(".chap-meta");
      if (meta) {
        const sc = S.quiz[id];
        if (sc && !/Quiz /.test(meta.innerHTML)) {
          const b = document.createElement("span");
          b.className = "badge new";
          b.textContent = "Quiz " + sc.score + "/" + sc.total;
          meta.appendChild(b);
        }
      }
    }
  }

  function retryQuiz(root) {
    $$(".quiz-q", root).forEach((q) => {
      q.classList.remove("revealed");
      $$(".quiz-opt", q).forEach((o) => {
        o.disabled = false;
        o.classList.remove("selected", "correct", "wrong");
      });
    });
    const foot = $(".quiz-foot", root);
    $(".js-check", foot).disabled = false;
    $(".js-retry", foot).hidden = true;
    $(".quiz-result", foot).textContent = "";
  }

  function copyCode(btn) {
    const wrap = btn.closest(".code-wrap");
    const code = $("code", wrap);
    const text = code ? (code.dataset.raw != null ? code.dataset.raw : code.textContent) : "";
    const done = () => { btn.textContent = "Copied ✓"; setTimeout(() => (btn.textContent = "Copy"), 1400); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { toast("Copy failed — select the code manually"); }
    document.body.removeChild(ta);
  }

  /* ------------------------------------------------------------- chrome */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", S.theme);
    document.documentElement.setAttribute("data-font", String(S.font));
    const b = $("#btn-theme");
    if (b) b.innerHTML = S.theme === "night" ? "&#9728;" : S.theme === "sepia" ? "&#9788;" : "&#9681;";
  }

  function applyTocPref() {
    document.body.classList.toggle("no-toc", !S.toc);
    const sidebar = $("#sidebar");
    if (window.matchMedia && window.matchMedia("(max-width: 980px)").matches) {
      document.body.classList.remove("no-toc");
      if (sidebar) sidebar.style.display = "";
    }
  }

  /* --------------------------------------------------------------- events */
  function bind() {
    document.addEventListener("click", (e) => {
      const copy = e.target.closest(".code-copy");
      if (copy) { copyCode(copy); return; }

      const complete = e.target.closest(".js-complete");
      if (complete) {
        const art = $("[data-lesson]");
        if (art) toggleComplete(art.dataset.lesson);
        return;
      }

      const opt = e.target.closest(".quiz-opt");
      if (opt && !opt.disabled) {
        const q = opt.closest(".quiz-q");
        $$(".quiz-opt", q).forEach((o) => o.classList.toggle("selected", o === opt));
        return;
      }

      const check = e.target.closest(".js-check");
      if (check) { checkQuiz(check.closest(".quiz")); return; }

      const retry = e.target.closest(".js-retry");
      if (retry) { retryQuiz(retry.closest(".quiz")); return; }

      if (e.target.closest(".js-reset")) {
        if (confirm("Reset all progress and quiz results?")) {
          S.completed = {}; S.quiz = {}; S.last = null;
          save(); route(); toast("Progress reset");
        }
        return;
      }
      if (e.target.closest(".js-print")) { window.print(); return; }

      const tocLink = e.target.closest(".toc-item, .brand, .chap-nav a, .unit-card, .sidebar-foot a");
      if (tocLink && tocLink.getAttribute("href") && tocLink.getAttribute("href").startsWith("#/")) {
        document.body.classList.remove("toc-open");
      }
    });

    const tocBtn = $("#btn-toc");
    if (tocBtn) {
      tocBtn.addEventListener("click", () => {
        if (window.matchMedia && window.matchMedia("(max-width: 980px)").matches) {
          document.body.classList.toggle("toc-open");
        } else {
          S.toc = !S.toc;
          save();
          applyTocPref();
        }
      });
    }
    const scrim = $("#scrim");
    if (scrim) scrim.addEventListener("click", () => document.body.classList.remove("toc-open"));

    const themeBtn = $("#btn-theme");
    if (themeBtn) themeBtn.addEventListener("click", () => {
      S.theme = S.theme === "paper" ? "sepia" : S.theme === "sepia" ? "night" : "paper";
      save(); applyTheme();
      toast("Theme: " + S.theme);
    });

    const fontBtn = $("#btn-font");
    if (fontBtn) fontBtn.addEventListener("click", () => {
      S.font = (S.font + 1) % 3;
      save(); applyTheme();
      toast("Text size: " + ["normal", "large", "larger"][S.font]);
    });

    const search = $("#toc-search");
    if (search) search.addEventListener("input", () => filterToc(search.value));

    document.addEventListener("keydown", (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const art = $("[data-lesson]");
        if (!art) return;
        const L = BY_ID[art.dataset.lesson];
        if (!L) return;
        const target = e.key === "ArrowRight" ? nextOf(L) : prevOf(L);
        if (e.key === "ArrowRight" && !target) { go("#/course"); return; }
        if (target) { e.preventDefault(); go("#/lesson/" + target.id); }
      } else if (e.key === "Escape") {
        document.body.classList.remove("toc-open");
      }
    });

    window.addEventListener("hashchange", route);
  }

  /* ---------------------------------------------------------------- boot */
  function boot() {
    applyTheme();
    applyTocPref();
    buildToc();
    syncChrome();
    bind();
    route();
    if (!LESSONS.length) {
      console.warn("[FSD Book] No lessons loaded. Run: node tools/build-index.js");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  // expose for debugging / tests
  window.FSDBook = { lessons: LESSONS, highlight: highlight, state: S, route: route };
})();
