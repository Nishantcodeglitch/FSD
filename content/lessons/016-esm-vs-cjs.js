window.COURSE_LESSONS.push({
  id: "w02-esm-vs-cjs",
  file: "016",
  unit: 1,
  week: 2,
  title: "CommonJS vs ES modules",
  kicker: "Unit I · Week 2 · Lesson 6 of 6",
  minutes: 18,
  objectives: [
    "Name the syntax of CommonJS and of ES modules and say where each one comes from",
    "Switch a folder between the two systems with package.json \"type\": \"module\" or the .mjs/.cjs extensions",
    "State the extension rule ES modules enforce and CommonJS does not",
    "Load an ES module from CommonJS code with dynamic import()"
  ],
  intro: `
    <p>Every file in this course so far — Week 1's Express server included — has been
    <strong>CommonJS</strong>: <code>require()</code> and <code>module.exports</code>, the system
    Node shipped with in 2009. Your journal contains nothing else, so this lesson teaches the
    second system, <strong>ES modules</strong>, from the official Node.js documentation and marks
    its examples accordingly; the CommonJS half is illustrated with the journal's real
    <code>week5-bundler</code> files.</p>
    <p>You will learn the syntax of each, how Node decides which system a file belongs to, the
    rules that trip almost everyone up (file extensions!), and the one call — dynamic
    <code>import()</code> — that bridges the two worlds.</p>
  `,
  theory: [
    `
      <h3>Two module systems, one runtime</h3>
      <p>JavaScript arrived in Node before the language itself had modules, so Node borrowed a
      2009 community standard called <strong>CommonJS</strong>: <code>require(x)</code> loads at
      the moment that line runs, <code>module.exports = ...</code> publishes. In 2015 the
      JavaScript language (ECMAScript 2015, "ES6") finally gained real modules —
      <strong>ES modules</strong>, written <code>import</code> / <code>export</code>. Browsers
      support only that second system, which is why modern tooling (Vite for React in Unit III,
      webpack's default mode) speaks ESM natively.</p>
      <table>
        <thead><tr><th></th><th>CommonJS</th><th>ES modules</th></tr></thead>
        <tbody>
          <tr><td>Load</td><td><code>const x = require('./x.js')</code></td><td><code>import x from './x.js'</code></td></tr>
          <tr><td>Publish</td><td><code>module.exports = { x }</code></td><td><code>export const x = ...</code></td></tr>
          <tr><td>Origin</td><td>Node.js / 2009 community</td><td>The JavaScript language, ES2015</td></tr>
          <tr><td>When it loads</td><td>Line by line, at the <code>require</code></td><td>All imports resolved <em>before</em> any code runs</td></tr>
          <tr><td>Top-level <code>await</code></td><td>No</td><td>Yes</td></tr>
        </tbody>
      </table>
      <p>Because ES module imports are read before execution, bundlers can analyse a whole
      program's dependency graph statically — that static structure is what webpack (Week 6) and
      Vite (Unit III) exploit to bundle code so efficiently.</p>
    `,
    `
      <h3>How Node decides which system a file uses</h3>
      <p>There is no marker inside the file itself. Node looks at two things — the file
      extension and the nearest <code>package.json</code>:</p>
      <ul>
        <li><code>.mjs</code> → always an ES module.</li>
        <li><code>.cjs</code> → always CommonJS.</li>
        <li><code>.js</code> → CommonJS <strong>unless</strong> the closest
        <code>package.json</code> says <code>"type": "module"</code>.</li>
      </ul>
      <p>The journal's <code>week5-bundler/package.json</code> has no <code>type</code> field at
      all, so every <code>.js</code> in that folder is CommonJS — which is exactly why
      <code>index.js</code> can say <code>require("./math")</code>. Add that one line and the
      folder flips: the same <code>index.js</code> would now die with
      <em>ReferenceError: require is not defined in ES module scope</em>, because
      <code>require</code> does not exist in ES modules.</p>
      <div class="note"><strong>Modern-Node footnote.</strong> Since Node 22.7 a plain
      <code>.js</code> file with <code>import</code> in it is usually <em>auto-detected</em> as an
      ES module instead of crashing, and since Node 20.19/22.12 <code>require()</code> can load
      many ES modules (<code>require(esm)</code>) instead of throwing
      <code>ERR_REQUIRE_ESM</code>. Do not build on the guesses: be explicit with
      <code>"type": "module"</code> or <code>.mjs</code>, and treat auto-detection as a safety
      net, not a style.</div>
    `,
    `
      <h3>The rules that trip beginners</h3>
      <ul>
        <li><strong>Extensions are mandatory in ESM.</strong>
        <code>import x from './math'</code> fails with
        <code>ERR_MODULE_NOT_FOUND</code> — ES module resolution does not try
        <code>.js</code> for you (example 8). CommonJS, by contrast, happily accepts
        <code>require('./math')</code>.</li>
        <li><strong><code>export</code> is a statement, not an assignment.</strong> You write
        <code>export function add(){}</code> or <code>export { add, sub }</code> at the top
        level; there is no <code>module.exports</code> object in ESM.</li>
        <li><strong>Imports are hoisted and fixed.</strong> Moving an <code>import</code> line
        cannot change behaviour, and you cannot put one inside an <code>if</code> block — the
        dependency graph must be known before the code runs.</li>
        <li><strong><code>import()</code> is the bridge.</strong> The dynamic
        <code>import()</code> form returns a promise, works in <em>both</em> systems, and is the
        supported way to load an ES module from CommonJS code (example 7) or to load a heavy file
        only when the user needs it.</li>
      </ul>
      <pre>const math = await import('./math.mjs');   // ESM, top-level await
import('./math.mjs').then(m => m.add(3, 4));  // CommonJS — the promise style</pre>
    `
  ],
  examples: [
    {
      title: "math.js (journal): publishing the CommonJS way",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/week5-bundler/math.js",
      lang: "javascript",
      code: `
function add(a,b){
    return a+b
}

function sub(a,b){
    return a - b
}

module.exports = { add, sub};
`,
      explain: [
        "Textbook CommonJS: plain functions plus one <code>module.exports</code> object at the bottom.",
        "Nothing in this file says \"CommonJS\" — the default is CommonJS for any <code>.js</code> file whose nearest package.json has no <code>\"type\"</code> field.",
        "These two files are the journal's webpack input (Week 6): the bundler follows the same <code>require</code> graph you traced in Lesson 2."
      ],
      run: "node math.js",
      output: "(no output — it only defines exports)"
    },
    {
      title: "index.js (journal): loading the CommonJS way",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/week5-bundler/index.js",
      lang: "javascript",
      code: `
const math = require("./math");

console.log(math.add(3,4));
console.log(math.sub(300,60));
`,
      explain: [
        "<code>require(\"./math\")</code> with no extension — CommonJS resolution appends <code>.js</code> for you (unlike ESM, example 8).",
        "<code>math</code> is exactly the object math.js exported: <code>{ add, sub }</code>.",
        "This whole file is the ES-module equivalent of <code>import { add, sub } from './math.js'</code> — compare with example 6, which prints the same two numbers."
      ],
      run: "node index.js",
      output: "7\n240"
    },
    {
      title: "webpack.config.js (journal): CommonJS for configuration",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/week5-bundler/webpack.config.js",
      lang: "javascript",
      code: `
module.exports = {
    entry: "./index.js", 

    output:{
        filename:"bundle.js"
    }
}
`,
      explain: [
        "A config file is a module too — whatever it exports is what webpack reads.",
        "Tooling config files are conventionally kept CommonJS (or renamed <code>webpack.config.cjs</code> in ESM projects) because tools historically call <code>require()</code> on them.",
        "<code>entry: \"./index.js\"</code> points webpack at the journal's index.js, whose <code>require('./math')</code> pulls math.js into the bundle."
      ],
      run: "node webpack.config.js",
      output: "(no output — it only defines exports)"
    },
    {
      title: "package.json: flipping a folder to ES modules",
      from: "new",
      file: "",
      lang: "json",
      code: `
{
  "name": "esm-demo",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  }
}
`,
      explain: [
        "The single line <code>\"type\": \"module\"</code> turns every <code>.js</code> file in this folder (and below) into an ES module.",
        "Drop this file next to the journal's <code>index.js</code> and it breaks immediately — <code>require</code> no longer exists there; you would rewrite it with <code>import</code>.",
        "Alternative without touching package.json: rename files to <code>.mjs</code> (ES module) or <code>.cjs</code> (CommonJS). Extension beats the field, so you can mix both systems in one project."
      ]
    },
    {
      title: "math.mjs: publishing the ES-module way",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// math.mjs — the .mjs extension says "ES module" with no package.json needed
export const add = (a, b) => a + b;
export const sub = (a, b) => a - b;

console.log("math.mjs exports:", typeof add, typeof sub);
`,
      explain: [
        "<code>export const ...</code> both creates and publishes the value — there is no exports object to assemble.",
        "The <code>.mjs</code> extension is what tells Node the file is ESM (with <code>\"type\": \"module\"</code> you could call it math.js instead).",
        "Exported bindings stay linked to their module: changing a <code>let</code> export updates every importer — a live binding, unlike CommonJS's snapshot object.",
        "The log line lets you confirm the file ran before its importer's output appears."
      ],
      run: "node math.mjs",
      output: "math.mjs exports: function function"
    },
    {
      title: "index.mjs: loading with import",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// index.mjs — save next to math.mjs
import { add, sub } from "./math.mjs";

console.log(add(3, 4));
console.log(sub(300, 60));
`,
      explain: [
        "Same two calculations as the journal's CommonJS index.js — same numbers, new syntax.",
        "<code>from \"./math.mjs\"</code> <strong>must</strong> carry the file; there is no automatic <code>.js</code> search in ES modules.",
        "The imported names are destructured-looking but are fixed at compile time; you cannot assign <code>import ... from</code> inside a condition.",
        "If both files sat in a package with <code>\"type\": \"module\"</code> you could drop <code>.mjs</code> and write <code>from './math.js'</code> — the extension is still required, only the suffix changes."
      ],
      run: "node index.mjs",
      output: "7\n240"
    },
    {
      title: "Bridging worlds: dynamic import() from CommonJS",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// still CommonJS — no "type": "module" anywhere
console.log("loading later, not at the top...");

import("./math.mjs")
  .then((math) => {
    console.log("dynamic import works:", math.add(3, 4));
  })
  .catch((err) => {
    console.log("failed to load:", err.message);
  });
`,
      explain: [
        "<code>import(...)</code> is <em>dynamic</em> import: it returns a promise instead of being hoisted, so it is legal inside CommonJS, inside <code>if</code> blocks and inside click handlers in the browser.",
        "This is the supported escape hatch for loading ESM from CommonJS code — the promise resolves to a namespace object with the exports on it (<code>math.add</code>).",
        "Because it returns a promise, error handling belongs in <code>.catch</code> (or <code>try/catch</code> around <code>await</code>), which Week 4 covers properly.",
        "A practical use: loading a big module only when someone actually needs it, so program start-up stays fast."
      ],
      run: "node dynamic-import.js",
      output: "loading later, not at the top...\ndynamic import works: 7"
    },
    {
      title: "Spot the bug: an ES-module import with no file extension",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// index-broken.mjs — math is really math.mjs, but the extension is missing
import { add, sub } from "./math";

console.log(add(3, 4));
console.log(sub(300, 60));
`,
      explain: [
        "ES-module resolution does <strong>not</strong> guess extensions: <code>./math</code> is looked up literally, and there is no such file.",
        "The fix is to write what you mean: <code>from './math.mjs'</code> (or <code>'./math.js'</code> in a <code>\"type\": \"module\"</code> folder).",
        "Compare CommonJS: <code>require('./math')</code> works fine because CommonJS tries <code>.js</code>, <code>.json</code> and <code>.node</code> for you — the single most common ESM migration error.",
        "Watch the <em>imported from</em> line in the stack trace: it names the file that did the importing, just like CommonJS's <em>Require stack</em>."
      ],
      run: "node index-broken.mjs",
      output: "Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:/path/to/math' imported from C:/path/to/index-broken.mjs\n  code: 'ERR_MODULE_NOT_FOUND'"
    }
  ],
  keyPoints: [
    "CommonJS (<code>require</code> / <code>module.exports</code>) is Node's original system; ES modules (<code>import</code> / <code>export</code>) come from the JavaScript language itself.",
    "A <code>.js</code> file is CommonJS unless the nearest package.json declares <code>\"type\": \"module\"</code>; <code>.mjs</code> is always ESM and <code>.cjs</code> always CommonJS.",
    "ES-module relative imports must include the file extension; CommonJS lets you omit <code>.js</code>.",
    "ESM imports are resolved before any code runs and cannot be moved into conditionals; <code>require()</code> runs where the line is.",
    "Dynamic <code>import()</code> returns a promise and works in both systems — the bridge from CommonJS to ESM.",
    "This journal is 100% CommonJS; the ESM examples here come from the Node.js docs, not from the labs."
  ],
  practice: `
    <p>Copy <code>week5-bundler/math.js</code> and <code>index.js</code> into a scratch folder and
    confirm they print <code>7</code> and <code>240</code>. Now add a
    <code>package.json</code> containing <code>{ \"type\": \"module\" }</code> and run
    <code>node index.js</code> again — read the <em>require is not defined in ES module scope</em>
    error, then convert the file to <code>import { add, sub } from './math.js'</code> (keeping the
    extension) and run it once more. Finish by renaming your two files to
    <code>math.mjs</code>/<code>index.mjs</code> with no package.json at all, proving the
    extension alone is enough.</p>
  `,
  quiz: [
    {
      q: "Which pair of keywords marks a file as an ES module?",
      options: [
        "import / export",
        "require / module.exports",
        "load / save",
        "include / publish"
      ],
      answer: 0,
      why: "import and export are the ES-module syntax (from ECMAScript 2015); require and module.exports are CommonJS."
    },
    {
      q: "You want every .js file in a folder to be treated as an ES module. What do you do?",
      options: [
        "Add \"type\": \"module\" to that folder's package.json",
        "Add \"type\": \"esm\" to package.json",
        "Rename package.json to module.json",
        "Prefix each file with // @esm"
      ],
      answer: 0,
      why: "The field is exactly \"type\": \"module\". Alternatively rename the files to .mjs, which works with no package.json at all."
    }
  ],
  sources: [
    "https://nodejs.org/api/esm.html",
    "https://nodejs.org/api/packages.html",
    "https://nodejs.org/en/blog/release/v22.12.0",
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules"
  ]
});
