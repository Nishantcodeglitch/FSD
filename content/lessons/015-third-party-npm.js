window.COURSE_LESSONS.push({
  id: "w02-third-party-npm",
  file: "015",
  unit: 1,
  week: 2,
  title: "Third-party modules and the npm registry",
  kicker: "Unit I · Week 2 · Lesson 5 of 6",
  minutes: 15,
  objectives: [
    "Explain what npm, a package and node_modules are",
    "Install a package and load it with a bare-name require",
    "Read a dependencies block in package.json and spot a bad entry",
    "Say why dependency versions and maintenance status matter"
  ],
  intro: `
    <p>Week 1's Express server gave you <code>require('express')</code> and an
    <code>npm install</code> you ran on faith. Now that you understand your <em>own</em> modules
    (lessons 1–2) and built-ins (lessons 3–4), the last piece of the resolution puzzle is where a
    bare name like <code>express</code> or <code>colors</code> comes from: the npm registry, a
    package manager's warehouse of everyone else's modules.</p>
    <p>The chapter runs the journal's real experiment — <code>02_third_party_module.js</code>,
    which paints the terminal with the <code>colors</code> package — and finishes by fixing a
    genuine bug the journal itself warns about in its <code>week5-bundler/package.json</code>.</p>
  `,
  theory: [
    `
      <h3>The registry: everyone else's modules, on tap</h3>
      <p><strong>npm</strong> is two things with one name: the command-line <em>package
      manager</em> that ships with Node, and the <em>registry</em> — a public warehouse with
      hundreds of thousands of reusable packages (express, colors, webpack, sequelize from Unit
      II, and so on). A <strong>package</strong> is just a folder containing JavaScript plus a
      <code>package.json</code> file describing it.</p>
      <p>The loop is always the same:</p>
      <pre class="diagram">npm install &lt;name&gt;   ──▶  downloads into node_modules/
                        ──▶  records it in package.json
require('&lt;name&gt;')     ──▶  Node finds it by walking up to node_modules/</pre>
      <p>That is why example 6's <code>require('colors')</code> has no <code>./</code>: remember
      Lesson 1's resolution order — a bare name means "look in <code>node_modules</code>"
      (built-in names such as <code>fs</code> are checked first). Node searches the current
      folder, then each parent folder in turn, so installing once at your project root serves
      every file beneath it.</p>
      <div class="note"><strong>Windows tip:</strong> if PowerShell refuses
      <code>npm</code> with "running scripts is disabled on this system", either type
      <code>npm.cmd install colors</code> or run
      <code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code> once. The error is
      PowerShell's execution policy, not a broken Node install.</div>
    `,
    `
      <h3>package.json is the receipt</h3>
      <p>Every install writes two records. <code>package.json</code>'s
      <code>dependencies</code> object lists what your project needs and which versions are
      allowed — <code>"^5.109.2"</code> means "5.109.2 or any later compatible 5.x"
      (the <code>^</code> caret allows bug-fix and minor updates). Next to it,
      <code>package-lock.json</code> freezes the <em>exact</em> versions that were actually
      downloaded, so your teammates and your future laptop install an identical tree.</p>
      <div class="warn"><strong>A real bug in the journal — tested October 2026.</strong>
      <code>week5-bundler/package.json</code> lists <code>"webpack.config.js": "^0.0.0"</code>
      under dependencies — the project's own config file masquerading as a package. The journal's
      Unit I notes say <code>npm i</code> there "errors"; re-testing now, the install actually
      <em>succeeds</em>, because an empty placeholder package with that exact name happens to
      exist on the registry (you end up with a useless 249-byte stub inside
      <code>node_modules</code>). The line is still a bug: it does nothing useful, and if that
      placeholder ever disappeared, every future install would break — that is the classic
      <em>dependency-confusion</em> trap. The failure that really bites is
      <code>npm run build</code>, which stops with <em>CLI for webpack must be installed</em>
      because <code>webpack-cli</code> is missing. Examples 3 and 4 walk through both.</div>
    `,
    `
      <h3>A dependency is code you are trusting</h3>
      <p>Everything in <code>node_modules</code> runs on your machine with your permissions the
      moment you <code>require</code> it — which is exactly what happened to the package in this
      lesson's lab. In January 2022 the maintainer of <code>colors</code> (and
      <code>faker</code>) deliberately published broken versions that printed endless gibberish
      as a protest, breaking thousands of builds; npm has also had packages hijacked by
      attackers. None of this makes npm dangerous, but it does make three habits worth forming
      early:</p>
      <ul>
        <li>Check a package's last publish date and download count on npmjs.com before adopting it.</li>
        <li>Pin known-good versions for risky packages (<code>"colors": "1.4.0"</code> — no caret).</li>
        <li>Prefer packages that are actively maintained; for <code>colors</code>, modern
        alternatives such as <code>picocolors</code> or <code>chalk</code> exist.</li>
      </ul>
      <p>Express, which the whole course runs on, is a well-maintained counter-example — the
      same mechanism, with a large team behind it.</p>
    `
  ],
  examples: [
    {
      title: "02_third_party_module.js: colour the terminal with 'colors'",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/02_third_party_module.js",
      lang: "javascript",
      code: `
var colors = require('colors');

console.log('hello'.green); // outputs green text
console.log('OMG Rainbows!'.rainbow); // rainbow
console.log('Run the trap'.trap); // Drops the bass
`,
      explain: [
        "<code>require('colors')</code> is a bare name, so Node fetched the package from <code>node_modules/colors</code> — run <code>npm install colors</code> first or you get <code>Cannot find module</code>.",
        "The package adds properties like <code>.green</code> and <code>.rainbow</code> to every string — a side effect of loading it, which is why there is no <code>const ... =</code> on line 1.",
        "<code>.rainbow</code> paints each letter a different colour; <code>.trap</code> is the package's joke flashing/inverse mode.",
        "The colours are ANSI escape codes: they show in a real terminal, but many file previews will show plain text.",
        "The journal uses <code>var</code> here; <code>const</code> is preferred today — <code>var</code> was the old, function-scoped way to declare a variable."
      ],
      run: "npm install colors && node sorted_files/02_Week-02_Modules/02_third_party_module.js",
      output: "hello   (green text)\nOMG Rainbows!   (rainbow text)\nRun the trap   (flashing inverse text)"
    },
    {
      title: "The install loop, from the terminal",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# 1. get the package (downloads into node_modules/, records it in package.json)
npm install colors

# 2. now any script in this project can load it by bare name
node sorted_files/02_Week-02_Modules/02_third_party_module.js

# 3. ask npm what it actually installed
npm ls colors
`,
      explain: [
        "Step 1 is the only way to get a third-party module: npm downloads it, unpacks it into <code>node_modules/colors/</code> and writes <code>\"colors\": \"^1.4.0\"</code> into your <code>package.json</code>.",
        "Step 2 works because resolution for bare names walks up the folder tree until it finds <code>node_modules</code>.",
        "<code>npm ls colors</code> prints the installed version and its tree — useful when something mysteriously breaks after an update.",
        "<code>node_modules/</code> is disposable and normally committed to nothing: any machine recreates it from <code>package.json</code> with <code>npm install</code>."
      ],
      run: "npm install colors",
      output: "added 1 package (node_modules/colors) — exact wording varies with your npm version"
    },
    {
      title: "week5-bundler/package.json: reading a dependencies block",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/week5-bundler/package.json",
      lang: "json",
      code: `
{
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
}
`,
      explain: [
        "<code>dependencies</code> lists the packages this project needs: <code>webpack</code> with a caret range <code>^5.109.2</code> (any compatible 5.x is fine).",
        "<code>scripts.build</code> is a shortcut: <code>npm run build</code> runs webpack with this config — you will meet this pattern again in Week 6.",
        "<strong>The bug:</strong> <code>\"webpack.config.js\": \"^0.0.0\"</code> is not a package, it is this project's own config file mis-declared as a dependency. npm searches the registry, finds an empty placeholder package of that name and installs it — a 249-byte stub that does nothing and could vanish tomorrow.",
        "Then try <code>npm run build</code> and it stops with <em>CLI for webpack must be installed</em>: webpack-cli is not listed anywhere, so the <code>webpack</code> command has no interface to run (see example 4 for the repaired file).",
        "<code>main</code> names the file other people would get if this folder itself were required as a module."
      ],
      run: "cd sorted_files/02_Week-02_Modules/week5-bundler && npm install",
      output: "added 69 packages in 3s  (the bogus webpack.config.js@0.0.0 stub installs too — re-tested Oct 2026)"
    },
    {
      title: "The fix: drop the stub, add webpack-cli",
      from: "new",
      file: "",
      lang: "json",
      code: `
{
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
    "webpack": "^5.109.2"
  },
  "devDependencies": {
    "webpack-cli": "^7.2.3"
  }
}
`,
      explain: [
        "One deletion, one addition: the fake <code>webpack.config.js</code> entry is gone and <code>webpack-cli</code> has taken its place.",
        "<code>devDependencies</code> is for tools you need while <em>building</em> (bundlers, linters) as opposed to <code>dependencies</code>, which the app itself needs at run time — npm installs both for you, so beginners can treat them the same.",
        "npm itself writes this shape: run <code>npm install -D webpack-cli</code> and watch it appear in package.json with the current version.",
        "The journal's <code>notes.txt</code> names the same fix in one line: <code>npm i webpack webpack-cli</code>.",
        "JSON has no comments and no trailing commas, so mistakes here surface as a parse error before npm even runs."
      ],
      run: "cd sorted_files/02_Week-02_Modules/week5-bundler && npm install -D webpack-cli && npm run build",
      output: "asset bundle.js 289 bytes [emitted] ... webpack 5.109.2 compiled with 1 warning (mode not set)"
    },
    {
      title: "notes.txt: the journal's own install notes",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/week5-bundler/notes.txt",
      lang: "text",
      code: `
web packs
npm i webpack webpack-cli

notes:

webpack is  a module bundler
it takes all the files of your porjects [js , css, images etc]
and it combines them
into one bundle file
`,
      explain: [
        "<code>npm i</code> is shorthand for <code>npm install</code> — the first command in the journal's notes, and precisely the fix for the missing webpack-cli from example 3.",
        "<code>webpack-cli</code> is a separate package because webpack's command-line interface was split out — a reminder that packages often depend on other packages.",
        "The description of bundling ('combines multiple files into one bundle') is a preview: it is the browser-side mirror of what you did with <code>require()</code> in Lesson 2, covered properly in Week 6."
      ]
    },
    {
      title: "mathjs: a second package, doing real work",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// npm install mathjs  first
const math = require("mathjs");

console.log("sqrt(144)   =", math.sqrt(144));
console.log("2 ^ 10      =", math.pow(2, 10));
console.log("factorial5 =", math.factorial(5));
console.log("unit calc   =", math.format(math.evaluate("12 cm + 3 in")));
`,
      explain: [
        "Exactly the same two steps as colors: <code>npm install mathjs</code>, then <code>require</code> it by bare name — the pattern never changes.",
        "Unlike colors, this package returns values instead of patching strings, so you can see results in the output.",
        "<code>math.evaluate(\"12 cm + 3 in\")</code> does unit conversion; packages are often just collections of functions like this.",
        "Spot the floating-point truth in the last line: 12 cm + 7.62 cm prints as 19.619999999999997 — computers store decimals approximately, which is why <code>math.format</code> (or <code>.toFixed(2)</code>) rounds before showing humans.",
        "A package's README on npmjs.com is its manual — beginners benefit more from reading it than from memorising APIs."
      ],
      run: "npm install mathjs && node math-demo.js",
      output: "sqrt(144)   = 12\n2 ^ 10      = 1024\nfactorial5 = 120\nunit calc   = 19.619999999999997 cm"
    }
  ],
  keyPoints: [
    "npm install downloads a package into <code>node_modules</code> and records it in <code>package.json</code>; <code>require('name')</code> (bare, no <code>./</code>) loads it.",
    "Node finds bare-name packages by walking up from the script's folder until it reaches a <code>node_modules</code> directory.",
    "<code>dependencies</code> lists allowed version ranges; <code>package-lock.json</code> pins the exact tree you installed.",
    "The journal's <code>week5-bundler/package.json</code> declares its own config file as a dependency — it installs an empty stub, and <code>npm run build</code> still fails until <code>webpack-cli</code> is added.",
    "A dependency is code running with your permissions: check maintenance, watch versions, prefer actively maintained packages."
  ],
  practice: `
    <p>From the repo root run <code>npm install colors</code> and then
    <code>node sorted_files/02_Week-02_Modules/02_third_party_module.js</code> — your terminal
    should print the three coloured lines. Inspect what changed: open the newly created
    <code>package-lock.json</code> (or your <code>package.json</code> if one exists) and find the
    recorded version. Then walk through the journal's bug in a scratch copy of
    <code>week5-bundler/</code>: run <code>npm install</code> (it succeeds — look inside
    <code>node_modules/webpack.config.js</code> to see the empty stub it pulled in), then
    <code>npm run build</code> and read the <em>CLI for webpack must be installed</em> failure,
    then fix it with <code>npm install -D webpack-cli</code> and build again to get
    <code>dist/bundle.js</code>.</p>
  `,
  quiz: [
    {
      q: "You have run npm install colors. Which line loads it inside a script?",
      options: [
        "const colors = require('colors');",
        "const colors = require('./colors');",
        "import colors = require('node_modules/colors');",
        "const colors = loadModule('colors.txt');"
      ],
      answer: 0,
      why: "Third-party packages are loaded by bare name — no ./ (that means a local file) and no node_modules/ prefix (npm already resolved it for you)."
    },
    {
      q: "Which field of package.json records the packages your project depends on?",
      options: ["dependencies", "requires", "modules", "node_modules"],
      answer: 0,
      why: "dependencies maps package names to version ranges (e.g. \"webpack\": \"^5.109.2\"). node_modules is the folder npm fills to satisfy it, not a field."
    }
  ],
  sources: [
    "https://www.npmjs.com/package/colors",
    "https://snyk.io/blog/open-source-npm-packages-colors-faker/",
    "https://docs.npmjs.com/cli/commands/npm-install",
    "https://docs.npmjs.com/cli/v10/configuring-npm/package-json"
  ]
});
