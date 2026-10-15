window.COURSE_LESSONS.push({
  id: "w06-webpack",
  file: "037",
  unit: 1,
  week: 6,
  title: "Webpack: bundling your modules",
  kicker: "Unit I · Week 6 · Lesson 3 of 4",
  minutes: 16,
  objectives: [
    "Explain what a bundler does and why browsers and CDNs need one",
    "Read and write a webpack config with entry, output and mode",
    "Build a project with npm scripts and interpret webpack's console output",
    "Diagnose the journal's bogus webpack.config.js dependency and work around it"
  ],
  intro: `
    <p>Week 5 ended with routing, headers and a gateway — and the folder you bundled all of that into
    is tellingly named <code>week5-bundler</code>. Weeks 2–5 taught you a program can be split into
    many small modules with <code>require</code>, which is great for humans and awkward for the web: a
    browser fetching twenty files, or a CDN keeping twenty connections open, pays for every one.</p>
    <p>Syllabus 6.3 closes Unit I with the tool that solves this: <strong>webpack</strong>, a
    <em>bundler</em>. You will run the journal's own tiny project — <code>math.js</code> +
    <code>index.js</code> — read its six-line config, produce <code>dist/bundle.js</code>, and deal
    honestly with the trap this folder hides: a bogus <code>"webpack.config.js"</code> dependency that
    breaks <code>npm install</code>.</p>
  `,
  theory: [
    `
      <h3>Why a bundler exists</h3>
      <p>Node resolves <code>require("./math")</code> at runtime by looking through
      <code>node_modules</code> and following paths — it can do that because Node <em>is</em> the
      environment. A browser has no such rule, and even if it did, every <code>&lt;script&gt;</code>
      tag and every imported module would normally be a separate HTTP request.</p>
      <p>A <strong>bundler</strong> fixes this by doing the resolving <em>ahead of time</em>: it starts
      at one file, follows every <code>require</code>/<code>import</code> to build a dependency graph,
      then writes the whole graph into a single output file. Your journal's own notes for this week
      say it in the student's words:</p>
      <blockquote>webpack is a module bundler — it takes all the files of your project [js, css,
      images etc] and it combines them into one bundle file. Importance: combines multiple files into
      one bundle, improves application performance, manages project dependencies, minimizes and
      optimizes code for production.</blockquote>
      <pre class="diagram">   entry            the graph webpack follows        output
   -------          ----------------------------       ------------
   index.js ──require──▶ math.js                ──▶  dist/bundle.js
                       (and every module they pull in)   one file,
                                                         one request</pre>
    `,
    `
      <h3>Four config words: entry, output, loaders, mode</h3>
      <p>Almost every webpack config is a <code>module.exports</code> object with these keys:</p>
      <ul>
        <li><strong>entry</strong> — the file where the graph starts. Default:
        <code>./src/index.js</code>; the journal sets it to <code>./index.js</code>.</li>
        <li><strong>output</strong> — where the bundle goes. <code>filename</code> names the file and
        <code>path</code> the folder; if you omit <code>path</code>, webpack uses the folder it calls
        <code>dist</code>. Remember this one rule from Week 2's <code>path</code> lesson: webpack wants
        an <strong>absolute</strong> path, which is why configs use
        <code>path.resolve(__dirname, "dist")</code>.</li>
        <li><strong>loaders</strong> — out of the box webpack only understands JavaScript and JSON.
        A <em>loader</em> is a transform that lets it swallow other things: <code>babel-loader</code>
        for modern/JSX syntax, <code>css-loader</code> + <code>style-loader</code> for CSS, asset
        modules for images. The journal project has none — which is exactly why its config is six
        lines long.</li>
        <li><strong>mode</strong> — <code>"development"</code> (readable code, fast builds),
        <code>"production"</code> (minified, tree-shaken, slowest) or <code>"none"</code>. If you leave
        it out, webpack warns and assumes <code>production</code>.</li>
      </ul>
    `,
    `
      <h3>webpack, webpack-cli and npm scripts</h3>
      <p>The job is split in two: <code>webpack</code> is the engine (all the compiling and packing)
      and <code>webpack-cli</code> is the command-line wrapper that reads your config file and drives
      it. You need both installed, and you normally never type either name — you put it in
      <code>package.json</code>:</p>
      <pre class="diagram">  "scripts": { "build": "webpack --config webpack.config.js" }
                  │
                  └──▶ npm run build   (npm adds node_modules/.bin to your PATH)</pre>
      <p><code>--config webpack.config.js</code> is the default name, so typing it is optional — but it
      makes the command self-documenting, which is why the journal does.</p>
      <div class="warn"><strong>Windows note from this book's own machine:</strong> in PowerShell,
      <code>npm</code> may refuse to run ("running scripts is disabled on this system"). Use
      <code>npm.cmd run build</code> instead — nothing is wrong with your project.</div>
    `,
    `
      <h3>CAUTION: the journal's bogus "webpack.config.js" dependency</h3>
      <p>The <code>week5-bundler/package.json</code> in this repository contains a mistake that is
      worth studying rather than hiding — the journal's own note (verified October 2026) records it:</p>
      <blockquote>CAUTION (verified Oct 2026): week5/package.json declares a bogus
      <code>"webpack.config.js": "^0.0.0"</code> dependency — <code>npm i</code> there errors; install
      manually (<code>npm i webpack webpack-cli</code>) then <code>npm run build</code>.</blockquote>
      <p>The error has a simple cause: <code>webpack.config.js</code> is <em>your configuration
      file</em>, not a package on the npm registry. Someone (probably an editor's autocomplete or a
      half-typed <code>npm i</code>) wrote it into <code>dependencies</code> as if it were a library.
      npm then tries to download a package by that name, and the install fails or installs nonsense.</p>
      <p>Two safe routes, both real:</p>
      <ul>
        <li><strong>Run the install where the manifest is correct.</strong> The week-6 root
        <code>package.json</code> declares <code>node-cron</code>, <code>webpack ^5.111.1</code> and
        <code>webpack-cli ^7.2.3</code> — install there and build from the subfolder; Node resolves
        <code>node_modules</code> in parent directories too. (This is how the output in this lesson was
        produced.)</li>
        <li><strong>Fix the file:</strong> delete the <code>"webpack.config.js"</code> line and run
        <code>npm install webpack webpack-cli</code> so only real packages are listed.</li>
      </ul>
    `
  ],
  examples: [
    {
      title: "math.js: a plain CommonJS module, nothing special",
      from: "journal",
      file: "sorted_files/06_Week-06_Cron-Webpack/week5-bundler/math.js",
      lang: "javascript",
      code: `function add(a,b){
    return a+b
}

function sub(a,b){
    return a - b
}

module.exports = { add, sub};`,
      explain: [
        "Two function declarations and one <code>module.exports</code> — the same Week 2 pattern you have used since <code>cal.js</code>.",
        "Nothing here is \"webpack syntax\": plain Node code stays plain, and that is a deliberate design goal of bundlers.",
        "webpack will read this file because <code>index.js</code> requires it — it never scans the folder, it follows the graph."
      ],
      run: "node sorted_files/06_Week-06_Cron-Webpack/week5-bundler/math.js",
      output: "(no output — it only exports two functions)"
    },
    {
      title: "index.js: the entry point of the graph",
      from: "journal",
      file: "sorted_files/06_Week-06_Cron-Webpack/week5-bundler/index.js",
      lang: "javascript",
      code: `const math = require("./math");

console.log(math.add(3,4));
console.log(math.sub(300,60));`,
      explain: [
        "<code>require(\"./math\")</code> is the edge webpack follows from entry to module — this is the whole dependency graph of the project.",
        "Running it with plain <code>node</code> and bundling it with webpack must print the same numbers; only the packaging differs.",
        "The relative <code>./</code> matters: bare specifiers (no <code>./</code>) would make webpack look in <code>node_modules</code>."
      ],
      run: "node sorted_files/06_Week-06_Cron-Webpack/week5-bundler/index.js",
      output: `7
240`
    },
    {
      title: "The whole webpack config (six lines)",
      from: "journal",
      file: "sorted_files/06_Week-06_Cron-Webpack/week5-bundler/webpack.config.js",
      lang: "javascript",
      code: `module.exports = {
    entry: "./index.js", 

    output:{
        filename:"bundle.js"
    }
}`,
      explain: [
        "<code>module.exports</code> again — webpack simply <code>require()</code>s your config like any other Node module, so a config can be generated by code if you ever need that.",
        "<code>entry: \"./index.js\"</code> — start the graph at this file (relative to the config file's folder).",
        "<code>output.filename: \"bundle.js\"</code> — the emitted file lands in webpack's default output folder, <code>dist/</code>.",
        "No <code>mode</code> and no loaders: this is the smallest config that works, and the missing <code>mode</code> is what produces the warning you will see."
      ],
      run: "npm run build   (inside week5-bundler/)"
    },
    {
      title: "package.json: the npm script — and the trap",
      from: "journal",
      file: "sorted_files/06_Week-06_Cron-Webpack/week5-bundler/package.json",
      lang: "json",
      code: `{
  "name": "week5",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "build": "webpack --config webpack.config.js"
  },
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "webpack": "^5.109.2",
    "webpack.config.js": "^0.0.0"
  }
}`,
      explain: [
        "<code>scripts.build</code> is the whole workflow in one word: <code>npm run build</code> runs the webpack CLI with this config.",
        "<strong>Spot the bug:</strong> <code>\"webpack.config.js\": \"^0.0.0\"</code> is not a real package — the config file has been mistaken for a dependency, so a plain <code>npm install</code> in this folder fails.",
        "<code>webpack</code> is listed as a <em>dependency</em> here; most projects would put it in <code>devDependencies</code>, since it builds the code rather than running in production.",
        "<code>\"main\": \"index.js\"</code> is what Node would load if this folder were itself a package — harmless, and it matches the entry."
      ],
      run: "npm install   (fails on the bogus dependency — see the next example)"
    },
    {
      title: "The sequence that actually works, start to finish",
      from: "new",
      lang: "bash",
      code: `# 1. install where package.json is correct (week-6 root: node-cron + webpack + webpack-cli)
PS> cd sorted_files\\06_Week-06_Cron-Webpack
PS> npm.cmd install

# 2. build the bundle in the subfolder (webpack is found in the parent node_modules)
PS> cd week5-bundler
PS> npm.cmd run build

> week5@1.0.0 build
> webpack --config webpack.config.js

asset bundle.js 289 bytes [minimized] (name: main)
./index.js 98 bytes [built] [code generated]
./math.js 113 bytes [built] [code generated]

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value.

webpack 5.111.1 compiled with 1 warning in 4751 ms

# 3. run the bundle — it prints exactly what index.js prints
PS> node dist\\bundle.js
7
240`,
      explain: [
        "On Windows PowerShell use <code>npm.cmd</code> if <code>npm</code> is blocked by execution policy; on Linux/macOS plain <code>npm</code> is fine.",
        "Notice the build reports both source files: webpack followed <code>index.js</code> → <code>math.js</code> and packed them together (exact byte counts and timings vary a little from machine to machine).",
        "The <code>mode</code> warning is informational: without it webpack assumes <code>production</code> (minified output) — the next example removes it.",
        "<code>node dist/bundle.js</code> printing <code>7</code> and <code>240</code> proves the bundle is complete and runnable on its own."
      ],
      run: "npm.cmd run build   (inside week5-bundler/)"
    },
    {
      title: "dist/bundle.js: what the bundler emitted (the real 05_bundle.js)",
      from: "journal",
      file: "sorted_files/06_Week-06_Cron-Webpack/05_bundle.js",
      lang: "javascript",
      code: `(()=>{var o={627(o){o.exports={add:function(o,n){return o+n},sub:function(o,n){return o-n}}}};const n={},t=function t(r){const s=n[r];if(void 0!==s)return s.exports;const e=n[r]={exports:{}};return o[r](e,e.exports,t),e.exports}(627);console.log(t.add(3,4)),console.log(t.sub(300,60))})();`,
      explain: [
        "One line, three parts: the <code>math</code> module wrapped as entry <code>627</code>, webpack's tiny <em>require shim</em> that resolves it, and your two <code>console.log</code> calls.",
        "Compare with <code>math.js</code>: the function names are gone and the code is minified — that is <code>mode: \"production\"</code> doing its job.",
        "The journal keeps this generated file at the week's root (and an identical one in <code>week5-bundler/dist/</code>) as proof the build ran.",
        "Run it and you get the same <code>7</code> and <code>240</code> — a bundle is an ordinary program."
      ],
      run: "node sorted_files/06_Week-06_Cron-Webpack/05_bundle.js",
      output: `7
240`
    },
    {
      title: "A complete config: mode + absolute output path",
      from: "new",
      lang: "javascript",
      code: `const path = require("path");

module.exports = {
  mode: "production",              // "development" while you are learning
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  }
};`,
      explain: [
        "Save as <code>webpack.config.js</code> (replacing the six-line one) and run <code>npm run build</code>: the <code>mode</code> warning disappears.",
        "<code>require(\"path\")</code> is a built-in module — configs are Node programs, so anything you have used since Week 2 works here.",
        "<code>path.resolve(__dirname, \"dist\")</code> gives webpack the absolute folder it demands; <code>__dirname</code> is the config file's own directory.",
        "Switch to <code>mode: \"development\"</code> and rebuild: the bundle becomes readable (and larger). That single word is a performance switch."
      ],
      run: "npm.cmd run build   (then compare dist/bundle.js)"
    },
    {
      title: "The student's own notes on what webpack is for",
      from: "journal",
      file: "sorted_files/06_Week-06_Cron-Webpack/week5-bundler/notes.txt",
      lang: "text",
      code: `web packs
npm i webpack webpack-cli

notes:

webpack is  a module bundler
it takes all the files of your porjects [js , css, images etc]
and it combines them
into one bundle file

importanece:
combines multiple file into one bundle
improve application performance
manages project dependancies

minimize and optimize code for production



//even if we delete the initial files and still run the code we will get the wokrking output`,
      explain: [
        "Line 2 is the correct install command — and the answer to the bogus dependency problem: <code>npm i webpack webpack-cli</code>.",
        "The four bullets are the standard justification for bundling; the last one (\"minimize and optimize code for production\") is exactly what the minified <code>05_bundle.js</code> demonstrates.",
        "The closing comment hides a great exercise: move <code>index.js</code> and <code>math.js</code> aside and run <code>node dist/bundle.js</code> — the bundle still works, because it no longer depends on them at run time."
      ],
      run: "(a notes file — read it, nothing to execute)"
    },
    {
      title: "app.js in the same folder: swap the entry and rebuild",
      from: "journal",
      file: "sorted_files/06_Week-06_Cron-Webpack/week5-bundler/app.js",
      lang: "javascript",
      code: `process.stdout.write("program started\\n"); //stdout used to display an output

process.stdin.on("data", (data) => { //stdin to recive an input 
  console.log("Input:", data.toString());
});
//stderr used to display an error
process.stderr.write("this is an error message\\n");`,
      explain: [
        "This is Week 5's standard-streams program (syllabus 5.3) that happens to live in the bundler folder — proof that any Node file can be an entry.",
        "Change the config to <code>entry: \"./app.js\"</code>, run <code>npm run build</code>, and webpack emits a bundle for <em>this</em> graph instead.",
        "Stdout, stdin and stderr all survive bundling: webpack only changes how files are found and packaged, never how Node's streams behave.",
        "Type a line and press Enter to see <code>Input:</code>; press <code>Ctrl+C</code> to stop it (a stdin listener keeps the process alive)."
      ],
      run: "node sorted_files/06_Week-06_Cron-Webpack/week5-bundler/app.js",
      output: `program started
this is an error message
(type a line and press Enter -> Input: <your line>)`
    }
  ],
  keyPoints: [
    "A bundler follows <code>require</code>/<code>import</code> from one entry file and emits a single output file.",
    "Config keys: <code>entry</code> (where the graph starts), <code>output</code> (filename + absolute path), <code>loaders</code> (transform other file types), <code>mode</code> (development vs production).",
    "You need both <code>webpack</code> (engine) and <code>webpack-cli</code> (command line), normally invoked through <code>npm run build</code>.",
    "Without a <code>mode</code>, webpack warns and falls back to <code>production</code> — minified output like <code>05_bundle.js</code>.",
    "The journal's <code>\"webpack.config.js\": \"^0.0.0\"</code> dependency is bogus: your config file is not a package. Install <code>webpack webpack-cli</code> manually instead.",
    "A bundle is an ordinary program: <code>node dist/bundle.js</code> prints exactly what <code>node index.js</code> prints."
  ],
  practice: `
    <p>Rebuild the folder with <code>app.js</code> as the entry: edit
    <code>week5-bundler/webpack.config.js</code> to <code>entry: "./app.js"</code>, run
    <code>npm.cmd run build</code>, then run <code>node dist/bundle.js</code> and type something.
    Finally add <code>mode: "development"</code>, rebuild, and open <code>dist/bundle.js</code> to see
    the difference minification made.</p>
  `,
  quiz: [
    {
      q: "In the journal's config, what does <code>entry: \"./index.js\"</code> decide?",
      options: [
        "It is the file webpack starts from; it follows that file's require() calls to build the bundle",
        "It is the name of the output file",
        "It tells webpack to install index.js as a dependency",
        "It copies index.js into node_modules"
      ],
      answer: 0,
      why: "entry marks the root of the dependency graph. The output name comes from output.filename (\"bundle.js\"), and webpack never installs anything — that is npm's job."
    },
    {
      q: "<code>npm install</code> fails in week5-bundler because package.json lists \"webpack.config.js\": \"^0.0.0\". What is the right fix?",
      options: [
        "Nothing — that entry makes webpack use your config file",
        "Install webpack and webpack-cli manually (and delete the bogus line); webpack.config.js is your config, not a package",
        "Rename webpack.config.js to webpack.conf so npm can find it",
        "Run npm install with --force until it succeeds"
      ],
      answer: 1,
      why: "\"webpack.config.js\" is not a package on the npm registry — it is the file webpack reads. The journal's own note says the same: install manually with npm i webpack webpack-cli, then npm run build."
    }
  ],
  sources: [
    "https://webpack.js.org/concepts/",
    "https://webpack.js.org/configuration/",
    "https://webpack.js.org/loaders/"
  ]
});
