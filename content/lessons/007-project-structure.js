window.COURSE_LESSONS.push({
  id: "w01-project-structure",
  file: "007",
  unit: 1,
  week: 1,
  title: "The Node.js project folder structure",
  kicker: "Unit I · Week 1 · Lesson 3 of 6",
  minutes: 12,
  objectives: [
    "Describe the standard layout of a Node.js project folder",
    "Explain what node_modules, package.json and entry files are for",
    "Organise your own Week-1 files so npm and node can find everything"
  ],
  intro: `
    <p>In the last lesson you installed Node and lived in the REPL for a while. But real projects
    don't live at a prompt — they live in folders full of files. This lesson teaches the map of a
    Node.js project so that nothing surprises you when <code>npm</code> starts generating folders
    and files on your disk.</p>
    <p>Look at this book's own source material:
    <code>sorted_files/01_Week-01_Node-Intro/</code> is itself a tiny Node project — a server file,
    a functions file, a <code>package.json</code>, notes and a README. We will use it as our
    example throughout.</p>
  `,
  theory: [
    `
      <h3>The shape of a Node project</h3>
      <p>Every Node.js project, from a two-file lab to a giant application, tends to look like
      this:</p>
      <pre class="diagram">my-node-project/
├── node_modules/        # installed packages (npm generates this)
├── src/                 # your code (optional — folders are up to you)
│   ├── server.js        # entry file: the file you run with node
│   └── helpers.js
├── package.json         # project manifest: name, scripts, dependencies
├── package-lock.json    # exact versions npm resolved (npm generates this)
└── README.txt           # human notes
</pre>
      <p>Three parts matter from day one: the <strong>entry file</strong> (the one you pass to
      <code>node</code>), <strong>package.json</strong> (the manifest), and
      <strong>node_modules</strong> (the warehouse of downloaded packages). Everything else is
      your own organisation.</p>
    `,
    `
      <h3>Entry files: the front door</h3>
      <p>An <strong>entry file</strong> is simply the file Node starts executing when you run
      <code>node something.js</code>. Nothing special marks it — it is just "the file you chose to
      start with". By convention Node projects often call it <code>index.js</code> or
      <code>server.js</code>, and <code>package.json</code> has a <code>main</code> field that can
      name it (Lesson 8 covers that field). In the journal's Week 1 folder the entry file is
      <code>01_server.js</code>; the README says so in one line:
      <em>"server.js needs <code>npm i express</code> then <code>node server.js</code>"</em>.</p>
    `,
    `
      <h3>node_modules: the warehouse you never edit</h3>
      <p>When you run <code>npm install some-package</code>, npm downloads that package — and
      often dozens of its own dependencies — into the <code>node_modules/</code> folder. That
      folder can grow to hundreds of megabytes. The rule for humans:
      <strong>never edit files inside node_modules</strong> — everything there is generated, and
      deleting it is always safe because <code>npm install</code> can recreate it from
      <code>package.json</code>. That's why most projects gitignore it.</p>
      <p>How does your code reach those packages? Via <code>require()</code>. Node looks for a
      built-in module first; if not found, it searches <code>node_modules/</code> upward from the
      file doing the require. You'll see this in Week 2's modules chapter.</p>
    `,
    `
      <h3>Names, folders and small habits</h3>
      <ul>
        <li><strong>One folder per project.</strong> npm walks <em>up</em> the directory tree to
        find the nearest <code>package.json</code>; running inside the wrong folder is the #1
        beginner mystery ("npm installed somewhere else!").</li>
        <li><strong>Lowercase names with dashes</strong> (<code>week1-node</code>) avoid
        surprises; npm has rules about package names that Lesson 8 will show.</li>
        <li><strong>Keep run instructions in a README</strong> — the journal's own
        <code>README.txt</code> is a good habit worth copying.</li>
      </ul>
    `
  ],
  examples: [
    {
      title: "The journal's Week 1 folder, as it really exists",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/README.txt",
      lang: "text",
      code: `Week 1: Intro to Node.js. server.js needs \`npm i express\` then \`node server.js\` (port 8080).`,
      explain: [
        "This README is the journal's own map of the folder: it names the entry file and how to run it.",
        "Even a one-line README counts as project documentation — future-you (and your lab examiner) will thank you.",
        "The two commands it lists — install, then run — are the universal Node workflow."
      ]
    },
    {
      title: "package.json: the manifest at the project root",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/04_package.json",
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
        "This is the real <code>04_package.json</code> from the Week 1 folder — it belongs at the project root, next to your code.",
        "<code>\"main\": \"index.js\"</code> names the default entry file — the structure declaring its own front door.",
        "<code>\"scripts\"</code> holds shortcuts (<code>npm run build</code>), and <code>\"dependencies\"</code> lists the packages npm must install. Lesson 8 dissects every field.",
        "Note the journal file's quirks: the name says \"week5\" and it lists a bogus dependency (<code>\"webpack.config.js\": \"^0.0.0\"</code>) — real journals aren't polished, and we'll call that out in Lesson 8."
      ]
    },
    {
      title: "01_server.js: the folder's entry file",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/01_server.js",
      lang: "javascript",
      code: `const express = require('express'); //importing the express module
const app = express(); //create an express applications
const port = 8080;

app.get('/home',function (req,res){ //defining the rout of the url 
res.send('this is a homepage');
});

app.listen(port, function(){
    console.log(\`server is running on http//localhost:\${port}\`);
})`,
      explain: [
        "This is the file you run with <code>node 01_server.js</code> — the entry file of the Week 1 project.",
        "Because it sits in the same folder tree as <code>package.json</code> and <code>node_modules/</code>, its <code>require('express')</code> can find Express after one <code>npm i express</code>.",
        "If you moved this file somewhere else without a <code>package.json</code> above it, the require would fail with MODULE_NOT_FOUND — location matters in Node projects."
      ],
      run: "node 01_server.js   (after: npm i express)"
    },
    {
      title: "Scaffolding a clean project from scratch",
      from: "new",
      lang: "bash",
      code: `$ mkdir week1-node
$ cd week1-node
$ mkdir src
$ notepad src\\server.js      # or use VS Code
$ type nul > README.txt      # an empty README to fill in
$ dir
 server.js   README.txt
$ node src\\server.js`,
      explain: [
        "A Node project starts with one command: make a folder and move into it — npm always acts on the <em>current</em> folder.",
        "There is no <code>npm create</code> required for a small project: plain folders and files are a completely legitimate structure.",
        "Keep source in <code>src/</code> (or flat at the root, like the journal does) — either is fine; consistency is what counts.",
        "The exact folder names are your choice; what Node needs is only that you run <code>node</code> with a path to your entry file."
      ],
      run: "mkdir week1-node  (PowerShell: New-Item -ItemType Directory week1-node)"
    },
    {
      title: "What npm creates for you: install and the generated folders",
      from: "new",
      lang: "bash",
      code: `$ npm init -y
Wrote to C:\\week1-node\\package.json: { "name": "week1-node", "version": "1.0.0", ... }
$ npm install express
added 57 packages
$ dir
 node_modules\\
 package.json
 package-lock.json
 src\\
 README.txt`,
      explain: [
        "<code>npm init -y</code> generates a starter <code>package.json</code> in the current folder — no questions asked.",
        "<code>npm install express</code> creates <code>node_modules/</code> (the code) and <code>package-lock.json</code> (the exact-version receipt), and updates <code>package.json</code>'s dependencies.",
        "The <code>package-lock.json</code> file should be committed to git; <code>node_modules/</code> should not — it is fully rebuildable.",
        "\"added 57 packages\" for just Express shows how dependencies have dependencies — that's exactly what node_modules is for."
      ],
      run: "npm init -y  &&  npm install express"
    },
    {
      title: "The folder map of this book's real repo",
      from: "new",
      lang: "text",
      code: `FSD_JOURNAL/                         <- repo root
├── sorted_files/                    <- journal code, organised by week
│   └── 01_Week-01_Node-Intro/       <- your Week 1 project folder
│       ├── 01_server.js             <- entry file (run with node)
│       ├── 02_functions.js          <- standalone script
│       ├── 03_notes 1.txt           <- theory notes
│       ├── 04_package.json          <- manifest
│       └── README.txt               <- how to run the folder
├── journal_sorted/                  <- the journal DOCX content as text
└── fsd-course-site/                 <- this book's site (also JS files!)`,
      explain: [
        "You are reading examples from <code>sorted_files/01_Week-01_Node-Intro/</code> — every <code>from:\"journal\"</code> example in this book points at a real path in this map.",
        "Numbered file prefixes (<code>01_</code>, <code>02_</code>…) keep the folder readable and suggest the intended learning order.",
        "Note that even this book's site is plain JavaScript files loaded by a browser — the same language, three different homes."
      ]
    }
  ],
  keyPoints: [
    "A Node project is just a folder: your code plus package.json plus (after installing) node_modules/",
    "The entry file is whatever file you hand to node — conventionally index.js or server.js",
    "node_modules/ holds downloaded packages — never edit it; npm can always rebuild it",
    "package.json at the root is what npm and require() use to orient themselves",
    "package-lock.json pins exact versions and should be kept in version control"
  ],
  practice: `
    <p>Recreate the journal's Week 1 folder in a scratch directory: make five empty files named
    like the originals (<code>01_server.js</code>, <code>02_functions.js</code>,
    <code>03_notes 1.txt</code>, <code>04_package.json</code>, <code>README.txt</code>), then copy
    the real contents in from this book's examples. Write your own 3-line README at the top
    saying which file is the entry point and how to run it. In Lesson 10 you will make
    <code>01_server.js</code> actually run.</p>
  `,
  quiz: [
    {
      q: "Where does npm download installed packages to?",
      options: [
        "node_modules/ in your project folder",
        "The node/ folder in Program Files",
        "package-lock/",
        "Downloads/"
      ],
      answer: 0,
      why: "npm installs every package into the node_modules/ folder at the root of the current project — and you should never edit files there by hand."
    },
    {
      q: "What is an \"entry file\" in a Node project?",
      options: [
        "The file Node starts executing when you run <code>node &lt;file&gt;</code>",
        "The first file listed alphabetically",
        "The file npm deletes first",
        "Any .json file in the project"
      ],
      answer: 0,
      why: "The entry file is simply the one you pass to node (e.g. node 01_server.js). package.json's \"main\" field can name it for other tools."
    }
  ],
  sources: [
    "https://docs.npmjs.com/cli/v10/configuring-npm/folders",
    "https://nodejs.org/api/packages.html"
  ]
});
