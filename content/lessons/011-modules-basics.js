window.COURSE_LESSONS.push({
  id: "w02-modules-basics",
  file: "011",
  unit: 1,
  week: 2,
  title: "Modules: require and module.exports",
  kicker: "Unit I · Week 2 · Lesson 1 of 6",
  minutes: 15,
  objectives: [
    "Explain what a module is and why Node splits a program into files",
    "Publish functions from a file with module.exports",
    "Load your own file with require() and predict what Node resolves it to",
    "Tell the difference between running a file and requiring it"
  ],
  intro: `
    <p>Last chapter you built an Express server whose first line was
    <code>require('express')</code>. You used a <strong>module</strong> without ever asking what
    one is. Week 2 fixes that: we pull that line apart, and then write our own modules with the
    journal's Lab 2 files — <code>cal.js</code>, <code>hello.js</code> and
    <code>areaCalculator.js</code>.</p>
    <p>By the end of this lesson you will understand the two keywords the whole Node ecosystem is
    built on: <code>require</code> (load) and <code>module.exports</code> (publish). The next
    lesson wires several of these files together into a running program.</p>
  `,
  theory: [
    `
      <h3>A module is a file that hands something out</h3>
      <p>Real programs get long. If every function lived in one file you would scroll forever,
      and you could not reuse anything. So Node uses <strong>modules</strong>: a module is simply
      a JavaScript file that publishes something — a function, an object, a value — for other
      files to use.</p>
      <p>Node's original module system is called <strong>CommonJS</strong>. It is not part of the
      JavaScript language itself; it is a 2009 community standard that Node adopted before
      browsers had any way to split code into files. Everything you write this week is CommonJS.
      (Lesson 6 compares it with the newer language-standard system, ES modules.)</p>
      <pre class="diagram">  cal.js                              app.js
  ---------                           --------
  function add(a, b) { ... }          const cal = require('./cal.js')
  module.exports = { add }   ──────▶  console.log(cal.add(2, 3))</pre>
      <p>A file has two roles depending on which side it sits on: it can <em>publish</em> through
      <code>module.exports</code>, and it can <em>load</em> through <code>require()</code>. The
      same file usually does both.</p>
    `,
    `
      <h3>module.exports — the shop window of a file</h3>
      <p>Every file Node runs gets a free object called <code>module.exports</code>. It starts
      life empty (<code>{}</code>). Whatever you assign to it becomes the public face of your
      file — everything else in the file stays private.</p>
      <p>The journal uses two export styles, and both are everywhere in real code:</p>
      <ul>
        <li><strong>An object of functions</strong> — <code>module.exports = { add, sub, mult }</code>.
        The <code>add</code> shorthand is ES6 property shorthand: it means
        <code>{ add: add, sub: sub }</code>.</li>
        <li><strong>A single value</strong> — <code>module.exports = hello;</code> exports one
        function directly instead of wrapping it in an object.</li>
      </ul>
      <p>Notice something important: a file that only defines exports <em>prints nothing</em>.
      Run <code>node cal.js</code> and the terminal just returns to the prompt. The exports box is
      filled, but nobody has opened it yet.</p>
    `,
    `
      <h3>require() — opening someone else's box</h3>
      <p><code>require('./cal.js')</code> does three things: it finds the file, it runs that file
      <strong>once</strong>, and it evaluates to whatever the file put in
      <code>module.exports</code>. So <code>const cal = require('./cal.js')</code> binds
      <code>cal</code> to that exported object, and <code>cal.add(3, 5)</code> works.</p>
      <p>How Node turns your string into a real file — remember this order, you will use it for
      the rest of the course:</p>
      <ol>
        <li>Is the name a <strong>built-in</strong> module such as <code>fs</code>,
        <code>http</code> or <code>path</code>? Use it immediately — no install needed (lessons 3
        and 4).</li>
        <li>Does it start with <code>./</code> or <code>../</code>? It is a file on disk. Node
        resolves it <strong>relative to the file that wrote the require()</strong>, first trying
        the exact name, then <code>.js</code>, <code>.json</code> and <code>.node</code> — which
        is why the journal writes <code>require('./areaCalculator')</code> without the extension
        and it still works.</li>
        <li>Otherwise it is a bare name like <code>express</code>: Node walks up the folders
        looking for a <code>node_modules</code> folder containing it (lesson 5).</li>
      </ol>
      <div class="warn"><strong>Spot the bug:</strong> <code>require('cal.js')</code> (no
      <code>./</code>) is a <em>bare</em> name, so Node goes hunting in
      <code>node_modules/</code> and fails. Example 6 below shows the real error.</div>
    `
  ],
  examples: [
    {
      title: "cal.js: export five math functions as one object",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/modules/cal.js",
      lang: "javascript",
      code: `
function add(a, b){
    return a+b;
}
function sub(a, b){
    return a-b;
}

function mult(a, b){
    return a*b;
}

function div(a, b){
    return a/b;
}

function mod(a, b){
    return a%b;
}

module.exports = {
    add, sub, mult, div, mod
}
`,
      explain: [
        "The five <code>function</code> declarations are ordinary JavaScript — but because they are not exported yet, no other file can see them.",
        "<code>module.exports = { add, sub, mult, div, mod }</code> publishes an object with five properties; <code>{ add }</code> is shorthand for <code>{ add: add }</code>.",
        "Running it directly (<code>node cal.js</code>) prints nothing and throws no error: it simply builds the exports object and exits.",
        "Lesson 2's <code>app.js</code> is the file that will actually call these functions."
      ],
      run: "node cal.js",
      output: "(no output — a module only fills its exports box until another file requires it)"
    },
    {
      title: "hello.js: export a single function instead of an object",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/modules/hello.js",
      lang: "javascript",
      code: `
function hello(fname, lname){
    console.log("hello dear "+ fname+" "+lname);
}

module.exports = hello;
`,
      explain: [
        "<code>module.exports = hello;</code> replaces the whole exports object with one function — so the consumer can call it directly instead of writing <code>hello.hello()</code>.",
        "Compare with cal.js: exporting an object is handy for a family of related functions, exporting a single value is handy for one job.",
        "The function does not return anything; it logs straight to the console (a returning version would be easier to test — a good first refactor to try)."
      ],
      run: "node hello.js",
      output: "(no output until Q1.js requires it — see Lesson 2)"
    },
    {
      title: "areaCalculator.js: three shapes, one exports object",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/modules/areaCalculator.js",
      lang: "javascript",
      code: `
function circleArea(radius) {
    return 3.14 * radius * radius;
}

function rectangleArea(length, width) {
    return length * width;
}

function triangleArea(base, height) {
    return 0.5 * base * height;
}

module.exports = {
    circleArea,
    rectangleArea,
    triangleArea
};
`,
      explain: [
        "Same shape as cal.js: private helper functions at the top, one <code>module.exports</code> object at the bottom.",
        "Each function is pure — it takes numbers and returns a number, with no console output — which makes the module trivial to reuse.",
        "<code>module.exports = { circleArea, rectangleArea, triangleArea }</code> is written over several lines for readability; it is still one assignment."
      ],
      run: "node areaCalculator.js",
      output: "(no output — it only defines exports)"
    },
    {
      title: "greet.js: a minimal module written from scratch",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// greet.js — save this file on its own
function greet(name) {
  return "Hello, " + name + "!";
}

module.exports = greet;

console.log("greet.js loaded, exports is a", typeof module.exports);
`,
      explain: [
        "This is the smallest possible module: one function, one export, one log line so you can see it run.",
        "<code>typeof module.exports</code> is <code>\"function\"</code> here because we assigned a function to it (the default would be <code>\"object\"</code>).",
        "The <code>console.log</code> is just for learning — it will fire every time Node first loads this file."
      ],
      run: "node greet.js",
      output: "greet.js loaded, exports is a function"
    },
    {
      title: "use-greet.js: the other half — require your own file",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// use-greet.js — save it in the SAME folder as greet.js
const greet = require("./greet.js");

console.log(greet("Node"));
console.log("typeof greet:", typeof greet);
`,
      explain: [
        "<code>require('./greet.js')</code> returns what greet.js put in <code>module.exports</code> — here, the <code>greet</code> function itself.",
        "The <code>./</code> prefix is mandatory for your own files; without it Node searches <code>node_modules</code> instead.",
        "Node will also accept <code>require('./greet')</code> (extension omitted) because it tries <code>.js</code> automatically.",
        "Run greet.js first (or just have both files present) — requiring a file executes it, and its log line appears before yours."
      ],
      run: "node use-greet.js",
      output: "greet.js loaded, exports is a function\nHello, Node!\ntypeof greet: function"
    },
    {
      title: "Spot the bug: forgetting the ./ prefix",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// broken-require.js — cal.js sits in the SAME folder, but the "./" is missing
const cal = require("cal.js");

console.log(cal.add(2, 3));
`,
      explain: [
        "This fails even though cal.js is right there: without <code>./</code> the string is a <em>bare</em> module name, so Node only looks in <code>node_modules</code> folders.",
        "The fix is one character: <code>require('./cal.js')</code>.",
        "Read the error's <em>Require stack</em> line — it tells you which file did the requiring, which is how you debug broken wiring in bigger projects."
      ],
      run: "node broken-require.js",
      output: "Error: Cannot find module 'cal.js'\nRequire stack:\n- C:/path/to/broken-require.js\n  code: 'MODULE_NOT_FOUND'"
    }
  ],
  keyPoints: [
    "A module is a file that publishes values through <code>module.exports</code> and loads others with <code>require()</code>.",
    "<code>require(x)</code> evaluates to exactly what the required file assigned to <code>module.exports</code>.",
    "Your own files must start with <code>./</code> or <code>../</code>; bare names mean built-ins or <code>node_modules</code>.",
    "Node adds <code>.js</code> for you on relative requires, so <code>require('./cal')</code> and <code>require('./cal.js')</code> are the same.",
    "Running a module directly prints nothing — exports only matter to the files that require it."
  ],
  practice: `
    <p>Open <code>sorted_files/02_Week-02_Modules/modules/cal.js</code> and add a sixth function
    <code>square(n)</code> that returns <code>n * n</code>, then add it to the exports object.
    Next to it, create <code>mytest.js</code> with
    <code>const cal = require('./cal.js');</code> and
    <code>console.log('square(9) =', cal.square(9));</code>. Run
    <code>node mytest.js</code> from inside the <code>modules/</code> folder and confirm it prints
    <code>square(9) = 81</code>. Then break it on purpose: delete the <code>./</code> and read the
    error Node gives you.</p>
  `,
  quiz: [
    {
      q: "Which object does a file use to publish its functions for other files?",
      options: ["module.exports", "module.return", "exports.log", "global.send"],
      answer: 0,
      why: "module.exports is the public face of a CommonJS file. Everything else in the file stays private to it."
    },
    {
      q: "In app.js, what does const cal = require('./cal.js') evaluate to?",
      options: [
        "The value that cal.js assigned to module.exports",
        "The source code of cal.js as a string",
        "A brand-new empty object every time it runs",
        "undefined, unless cal.js prints something itself"
      ],
      answer: 0,
      why: "require() runs cal.js once and returns its module.exports — here the object { add, sub, mult, div, mod }."
    }
  ],
  sources: [
    "https://nodejs.org/api/modules.html",
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules"
  ]
});
