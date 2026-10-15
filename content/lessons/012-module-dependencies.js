window.COURSE_LESSONS.push({
  id: "w02-module-dependencies",
  file: "012",
  unit: 1,
  week: 2,
  title: "Module dependencies: wiring files together",
  kicker: "Unit I · Week 2 · Lesson 2 of 6",
  minutes: 16,
  objectives: [
    "Identify the entry point and the library files in a small program",
    "Trace how Node resolves require('./cal.js') step by step",
    "Run the journal's three module pairs and read their output",
    "Explain what require caching means for a running program"
  ],
  intro: `
    <p>In the last lesson you met the two halves of the module system: publish with
    <code>module.exports</code>, load with <code>require()</code>. A single pair of files is
    simple — but real programs are graphs of dozens of files that require each other.</p>
    <p>This chapter wires the journal's actual Lab 2 programs: <code>app.js</code> +
    <code>cal.js</code>, <code>index.js</code> + <code>areaCalculator.js</code>, and
    <code>Q1.js</code> + <code>hello.js</code>. You will learn which file you "run", how Node
    finds each partner, and why a required file only ever executes once. The Express server you
    built last week (<code>require('express')</code>) is exactly this same idea, with the library
    coming from <code>node_modules</code> instead of your own folder.</p>
  `,
  theory: [
    `
      <h3>Entry point vs. library file</h3>
      <p>When you type <code>node something.js</code>, the file you name is the
      <strong>entry point</strong> — the one file Node loads first. Everything it requires gets
      pulled in behind it. The files that are required but never typed into the terminal are
      <strong>library files</strong>: they exist to be used, not to be run.</p>
      <table>
        <thead><tr><th>You run (entry point)</th><th>It requires (library)</th><th>Published</th></tr></thead>
        <tbody>
          <tr><td><code>node app.js</code></td><td><code>./cal.js</code></td><td><code>{ add, sub, mult, div, mod }</code></td></tr>
          <tr><td><code>node index.js</code></td><td><code>./areaCalculator</code></td><td><code>{ circleArea, rectangleArea, triangleArea }</code></td></tr>
          <tr><td><code>node Q1.js</code></td><td><code>./hello.js</code></td><td>the <code>hello</code> function</td></tr>
        </tbody>
      </table>
      <p>Technically you <em>can</em> run a library file too — it just does nothing interesting,
      because it only fills its exports box. That is why the journal's README says to run from
      inside the right folder: you are choosing an entry point.</p>
    `,
    `
      <h3>How Node resolves require('./cal.js')</h3>
      <p>"Resolution" is just the fancy word for turning your string into a real file on disk.
      For a relative path Node does this:</p>
      <ol>
        <li>Look at the folder of the file that <em>wrote the require()</em> — not the folder you
        happen to be standing in at the terminal. <code>app.js</code> lives next to
        <code>cal.js</code>, so <code>./cal.js</code> finds it even if you launch from the repo
        root: <code>node sorted_files/02_Week-02_Modules/modules/app.js</code> works.</li>
        <li>Try the exact name first, then <code>.js</code>, <code>.json</code>,
        <code>.node</code> in turn. That is why <code>index.js</code> can say
        <code>require('./areaCalculator')</code> with no extension and still succeed.</li>
        <li>If nothing matches, throw <code>Cannot find module</code> and stop — you never get a
        half-running program.</li>
      </ol>
      <div class="note"><strong>Two kinds of "relative", do not mix them.</strong> A
      <code>require()</code> path is relative to the <em>requiring file</em>. A file-system path
      you pass to <code>fs</code> (next lesson) is relative to <em>where your terminal is
      standing</em>. The journal README's advice — "run inside subfolders" — is really about the
      second kind.</div>
      <pre class="diagram">        app.js ──require──▶ cal.js
entry ──┤        index.js ──require──▶ areaCalculator.js
        Q1.js  ──require──▶ hello.js</pre>
    `,
    `
      <h3>Required once, then served from a cache</h3>
      <p>Node keeps a cache (an in-memory map) of every module it has already loaded. The first
      <code>require('./cal.js')</code> runs the file top to bottom and stores its exports;
      every later <code>require('./cal.js')</code> in the same run skips straight to the stored
      result. Two consequences worth remembering:</p>
      <ul>
        <li>A <code>console.log</code> at the top of a library file fires <strong>once per
        program</strong>, no matter how many times it is required.</li>
        <li>Everyone shares the same exports object — <code>require('./x') === require('./x')</code>
        is <code>true</code>. You can prove it in three lines:</li>
      </ul>
      <pre>const a = require('./mathUtils.js');
const b = require('./mathUtils.js');
console.log(a === b); // true — one file, one execution, one object</pre>
    `
  ],
  examples: [
    {
      title: "app.js: the entry point that requires cal.js",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/modules/app.js",
      lang: "javascript",
      code: `
const cal = require('./cal.js')


console.log("addition", cal.add(3,5));
console.log("substraction", cal.sub(3,5));
console.log("multiplication", cal.mult(3,5));
console.log("division", cal.div(3,5));
console.log("modulo", cal.mod(3,5));
`,
      explain: [
        "Line 1 is the whole wiring: <code>cal</code> now holds whatever <code>cal.js</code> published, i.e. <code>{ add, sub, mult, div, mod }</code>.",
        "Before any of the <code>console.log</code> lines run, Node loads and executes <code>cal.js</code> completely — that is what <code>require()</code> means.",
        "<code>console.log(\"addition\", 8)</code> prints two values separated by one space — that is why the output has no colon."
      ],
      run: "node app.js",
      output: "addition 8\nsubstraction -2\nmultiplication 15\ndivision 0.6\nmodulo 3"
    },
    {
      title: "index.js: same idea, extensionless require",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/modules/index.js",
      lang: "javascript",
      code: `
const areaCalc = require('./areaCalculator');

const circle = areaCalc.circleArea(5);
console.log("Circle Area:", circle);

const rectangle = areaCalc.rectangleArea(4, 7);
console.log("Rectangle Area:", rectangle);

const triangle = areaCalc.triangleArea(6, 8);
console.log("Triangle Area:", triangle);
`,
      explain: [
        "<code>require('./areaCalculator')</code> has no extension — Node appends <code>.js</code> for you during resolution.",
        "The returned object is renamed <code>areaCalc</code>: the local variable name is yours to choose, the file name is not.",
        "Each function is called with literal numbers so you can verify the arithmetic: 3.14×5×5 = 78.5, 4×7 = 28, 0.5×6×8 = 24."
      ],
      run: "node index.js",
      output: "Circle Area: 78.5\nRectangle Area: 28\nTriangle Area: 24"
    },
    {
      title: "Q1.js: requiring a single exported function",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/modules/Q1.js",
      lang: "javascript",
      code: `
const hello =  require('./hello.js');

hello( "nishant", "yadav");
`,
      explain: [
        "hello.js exported the function itself, not an object — so <code>hello</code> <em>is</em> a function and can be called straight away.",
        "Compare with app.js: if the module exports an object you write <code>cal.add(...)</code>; if it exports one value you just call it.",
        "Calling it runs its <code>console.log(\"hello dear \" + fname + \" \" + lname)</code> line inside hello.js."
      ],
      run: "node Q1.js",
      output: "hello dear nishant yadav"
    },
    {
      title: "mathUtils.js: a library file for our own wiring",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// mathUtils.js — the library half
function add(a, b) { return a + b; }
function double(n) { return n * 2; }

module.exports = { add, double };

console.log("mathUtils.js loaded");
`,
      explain: [
        "One job per file: this one knows nothing about your terminal, it just defines and exports two helpers.",
        "The log line is a tripwire — it lets you see exactly how many times Node really executes the file.",
        "It prints when it is run directly <em>and</em> the first time it is required (see cache-check.js below)."
      ],
      run: "node mathUtils.js",
      output: "mathUtils.js loaded"
    },
    {
      title: "report.js: an entry point that wires the library in",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// report.js — the entry point; save it next to mathUtils.js
const utils = require("./mathUtils.js");

console.log("10 + 20 =", utils.add(10, 20));
console.log("double(7) =", utils.double(7));
`,
      explain: [
        "This is the whole shape of a Node program: one entry file, one or more local libraries, <code>require</code> at the top, work below.",
        "Expected order of lines: <code>mathUtils.js loaded</code> appears first, because require() finishes running the library before report.js continues.",
        "Requires conventionally live at the very top of the file so the dependencies are obvious at a glance."
      ],
      run: "node report.js",
      output: "mathUtils.js loaded\n10 + 20 = 30\ndouble(7) = 14"
    },
    {
      title: "cache-check.js: prove a module runs only once",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// cache-check.js — save it next to mathUtils.js from above
const first = require("./mathUtils.js");
const second = require("./mathUtils.js");

console.log("10 + 20 =", first.add(10, 20));
console.log("double(7) =", second.double(7));
console.log("same exports object?", first === second);
`,
      explain: [
        "Two require calls, but <code>mathUtils.js loaded</code> appears only <strong>once</strong> — the second call was answered from Node's cache.",
        "<code>first === second</code> is <code>true</code>: both variables point at the very same object, so a change made through one is visible through the other.",
        "This is also why requiring a big library twice is cheap — the expensive work happens a single time per run."
      ],
      run: "node cache-check.js",
      output: "mathUtils.js loaded\n10 + 20 = 30\ndouble(7) = 14\nsame exports object? true"
    }
  ],
  keyPoints: [
    "The file you type after <code>node</code> is the entry point; files it requires are libraries that never need to be run directly.",
    "A relative <code>require()</code> is resolved from the folder of the <em>requiring file</em>, first trying the exact name and then <code>.js</code>/<code>.json</code>/<code>.node</code>.",
    "If resolution fails Node throws <code>Cannot find module</code> — wiring errors are loud, not silent.",
    "Each module executes at most once per run; later requires return the cached exports object.",
    "<code>fs</code> paths behave differently from require paths: they start at your terminal's folder, not the file's folder (Lesson 3)."
  ],
  practice: `
    <p>From the repo root run all three journal entry points and compare: <code>node
    sorted_files/02_Week-02_Modules/modules/app.js</code>, then <code>index.js</code>, then
    <code>Q1.js</code> — each should print exactly the outputs above. Now open
    <code>app.js</code>, add <code>console.log(cal.mult(cal.add(2, 3), 10))</code> at the end and
    predict the answer before running it (it composes two exports: <code>(2+3) × 10</code>).
    Finally, add a <code>console.log('cal.js executed')</code> line at the top of
    <code>cal.js</code> and confirm it prints only once even though <code>app.js</code> requires
    it once — then make <code>app.js</code> require it twice and watch the cache eat the second
    load.</p>
  `,
  quiz: [
    {
      q: "app.js says require('./cal.js'). Against which folder does Node resolve './cal.js'?",
      options: [
        "The folder that contains app.js",
        "The folder you were standing in when you ran node",
        "The node_modules folder",
        "The folder that contains cal.js's own requires"
      ],
      answer: 0,
      why: "Relative requires resolve from the requiring file's directory, which is why the program still works when you launch it from the repo root."
    },
    {
      q: "A file requires './mathUtils.js' twice in the same run. What happens the second time?",
      options: [
        "Node returns the cached exports — the file is not executed again",
        "Node runs the file a second time and creates fresh functions",
        "Node throws 'Cannot find module' because it is already loaded",
        "Node waits for the first require to finish asynchronously"
      ],
      answer: 0,
      why: "CommonJS caches by resolved filename: one execution, one exports object, served to every later require."
    }
  ],
  sources: [
    "https://nodejs.org/api/modules.html#modules_required",
    "https://nodejs.org/api/modules.html#modules_caching"
  ]
});
