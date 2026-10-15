window.COURSE_LESSONS.push({
  id: "w02-builtin-fs",
  file: "013",
  unit: 1,
  week: 2,
  title: "Built-in module: fs (read, write, append)",
  kicker: "Unit I · Week 2 · Lesson 3 of 6",
  minutes: 16,
  objectives: [
    "Load a built-in module with require() without installing anything",
    "Choose between writeFileSync, readFileSync and appendFileSync",
    "Explain what sync means and why utf-8 is passed to readFileSync",
    "Predict where a relative file path starts from when Node runs it"
  ],
  intro: `
    <p>So far the only <code>require()</code> you have used loaded your own files — and back in
    Week 1, <code>require('express')</code> loaded a package from <code>node_modules</code> for
    your Express server. There is a third category that needs neither: <strong>built-in
    modules</strong>, small libraries that ship inside Node itself.</p>
    <p>This lesson opens the most-used one, <code>fs</code> (file system), through the journal's
    real trio from <code>modules/builtine_modules/</code>: <code>builtinmodules.js</code>,
    <code>readfilesync.js</code> and <code>appendfilesync.js</code>. You will also see the
    folder-related trap the journal's own README warns about — and the async style that takes
    over in Week 3.</p>
  `,
  theory: [
    `
      <h3>Built-ins: modules that come with Node</h3>
      <p>Type <code>require('fs')</code> and it just works — no <code>npm install</code>, no
      <code>node_modules</code> folder, nothing to download. Built-in modules are compiled into
      Node itself, and their bare names (like <code>fs</code>) are matched <em>before</em> Node
      looks anywhere on disk. That is the first rule of resolution you met in Lesson 1.</p>
      <ul>
        <li><code>fs</code> — read, write, append and delete files (this lesson).</li>
        <li><code>http</code> and <code>path</code> — servers and file paths (lesson 4).</li>
        <li><code>os</code>, <code>events</code>, <code>child_process</code> — more of Unit I.</li>
      </ul>
      <p>A useful test: if <code>require('x')</code> works in an empty folder with no
      <code>package.json</code>, <code>x</code> is built in.</p>
    `,
    `
      <h3>writeFileSync, readFileSync, appendFileSync</h3>
      <p>The journal's own notes (<code>modules/notes2.txt</code>) already hold the three facts,
      in the student's words:</p>
      <blockquote>writefilessysnc creates a file / if a file already exit it replaces the content
      completly / utf 8 converts binary data into human readable text</blockquote>
      <table>
        <thead><tr><th>Call</th><th>What it does</th></tr></thead>
        <tbody>
          <tr><td><code>fs.writeFileSync(file, text)</code></td><td>Creates the file, or <strong>wipes and replaces</strong> everything in it</td></tr>
          <tr><td><code>fs.readFileSync(file, 'utf-8')</code></td><td>Returns the whole file as a string</td></tr>
          <tr><td><code>fs.appendFileSync(file, text)</code></td><td>Adds text to the end, keeping what was there</td></tr>
        </tbody>
      </table>
      <p>Drop <code>'utf-8'</code> from <code>readFileSync</code> and you get a
      <code>Buffer</code> — Node's raw byte container — instead of readable text. Buffers are not
      wrong, they are just for when you actually want bytes (images, video); for text you decode
      with utf-8, which turns those bytes back into characters.</p>
    `,
    `
      <h3>Sync means "wait here" — and every path has a starting point</h3>
      <p>The <code>Sync</code> suffix means these calls are <strong>synchronous</strong>: Node
      stops everything and waits for the disk to answer before running the next line. For a small
      script that is perfectly fine, and it makes error handling easy — a failed
      <code>readFileSync</code> <em>throws</em>, so you can wrap it in <code>try/catch</code>.
      For a server that must answer hundreds of people at once it would be a disaster, which is
      exactly why Week 3 is about the non-blocking alternative. Example 4 shows both styles
      side by side.</p>
      <p>The other trap is <strong>where a relative path starts</strong>. <code>fs</code> paths
      begin at <em>your terminal's current folder</em> (<code>process.cwd()</code>) — not at the
      folder of the script. The journal's <code>readfilesync.js</code> lives in
      <code>builtine_modules/</code> yet reads <code>'student.txt'</code>, which sits one level up
      in <code>modules/</code>. So it only works when you stand in <code>modules/</code>:</p>
      <pre class="diagram">cd sorted_files/02_Week-02_Modules/modules
node builtine_modules/readfilesync.js   ✓  finds student.txt
cd builtine_modules
node readfilesync.js                    ✗  ENOENT: no such file</pre>
      <div class="note">Lesson 4 shows the bulletproof fix: <code>path.join(__dirname, 'student.txt')</code>,
      which anchors the path to the script's own folder instead of your terminal's.</div>
    `
  ],
  examples: [
    {
      title: "builtinmodules.js: create (or overwrite) a file with writeFileSync",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/modules/builtine_modules/builtinmodules.js",
      lang: "javascript",
      code: `
//FS modules {filesystem}

const fs = require('fs');

fs.writeFileSync('student.txt',"welcome to nodejs 2");

console.log("the file has been created");
`,
      explain: [
        "<code>require('fs')</code> loads the built-in file-system module — no installation, no <code>node_modules</code>.",
        "<code>writeFileSync('student.txt', ...)</code> writes relative to the folder you run node from. Run it from <code>modules/</code> and it overwrites that copy of <code>student.txt</code> — <strong>all previous lines are gone</strong>, exactly as notes2.txt warns.",
        "Because it is synchronous, <code>console.log</code> only runs after the bytes have hit the disk."
      ],
      run: "cd sorted_files/02_Week-02_Modules/modules && node builtine_modules/builtinmodules.js",
      output: "the file has been created"
    },
    {
      title: "readfilesync.js: read a text file back",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/modules/builtine_modules/readfilesync.js",
      lang: "javascript",
      code: `
const fs = require('fs');

const data = fs.readFileSync('student.txt', 'utf-8');
console.log(data);
`,
      explain: [
        "<code>readFileSync</code> returns the whole file's contents; passing <code>'utf-8'</code> decodes the bytes into a string (omit it and you get a <code>Buffer</code>).",
        "Run it from inside <code>modules/</code> so that the relative path <code>'student.txt'</code> lands on the real file — the script's own folder is irrelevant to <code>fs</code>.",
        "The output is exactly the three lines currently stored in the journal's <code>student.txt</code>."
      ],
      run: "cd sorted_files/02_Week-02_Modules/modules && node builtine_modules/readfilesync.js",
      output: "welcome to nodejs 2\nwelcome to nodejs 3\nwelcome to nodejs 4"
    },
    {
      title: "appendfilesync.js: add a line without destroying the rest",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/modules/builtine_modules/appendfilesync.js",
      lang: "javascript",
      code: `
const fs = require('fs');

fs.appendFileSync('student.txt',"\\nwelcome to nodejs 4");
`,
      explain: [
        "Where <code>writeFileSync</code> replaces everything, <code>appendFileSync</code> keeps the existing content and adds to the end — the difference between overwriting a notebook and adding a page.",
        "The <code>\\n</code> inside the string is the newline escape, so this call starts a fresh line.",
        "Running it twice makes <code>student.txt</code> longer each time — try it and then read the file with readfilesync.js.",
        "No <code>console.log</code> here, so a successful run prints nothing at all."
      ],
      run: "cd sorted_files/02_Week-02_Modules/modules && node builtine_modules/appendfilesync.js",
      output: "(no output — but student.txt grows by one line)"
    },
    {
      title: "The non-blocking style: fs.readFile with a callback",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const fs = require("fs");

fs.readFile("student.txt", "utf-8", (err, data) => {
  if (err) {
    console.error("read failed:", err.code);
    return;
  }
  console.log(data);
});

console.log("this line prints FIRST - readFile does not wait");
`,
      explain: [
        "Instead of returning the data, this form takes a <strong>callback</strong>: a function Node calls later, when the disk has answered.",
        "Notice the order: <code>readFile</code> hands the job to the OS and returns immediately, so the last <code>console.log</code> runs before the file contents appear.",
        "Errors arrive in <code>err</code> instead of being thrown — so a missing file never crashes the program.",
        "This is the pattern Week 3 (event loop) and Week 4 (promises) build on; you need it the moment a program does more than one thing at a time."
      ],
      run: "cd sorted_files/02_Week-02_Modules/modules && node read-async.js",
      output: "this line prints FIRST - readFile does not wait\nwelcome to nodejs 2\nwelcome to nodejs 3\nwelcome to nodejs 4"
    },
    {
      title: "Sync errors are exceptions: catch them with try/catch",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const fs = require("fs");

try {
  const data = fs.readFileSync("does-not-exist.txt", "utf-8");
  console.log(data);
} catch (err) {
  console.error("could not read the file:", err.code);
}

console.log("program continues normally");
`,
      explain: [
        "A synchronous <code>fs</code> call on a missing file <em>throws</em> — without a <code>try/catch</code> around it the program would stop on that line.",
        "<code>err.code</code> is the machine-readable reason — <code>ENOENT</code> means \"no such file or directory\" — much better for logs than the full message.",
        "The final line still prints, proving the exception was handled rather than fatal."
      ],
      run: "node sync-error.js",
      output: "could not read the file: ENOENT\nprogram continues normally"
    },
    {
      title: "Buffer vs text: what utf-8 actually does",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const fs = require("fs");

fs.writeFileSync("demo.txt", "line one\\nline two");

const raw = fs.readFileSync("demo.txt");
console.log("no encoding ->", raw.constructor.name, "with", raw.length, "bytes");

const text = fs.readFileSync("demo.txt", "utf-8");
console.log("utf-8      ->", text);
`,
      explain: [
        "Without an encoding, <code>readFileSync</code> returns a <code>Buffer</code> — Node's container for raw bytes (17 of them here, newline included).",
        "With <code>'utf-8'</code> Node decodes those bytes into a JavaScript string, which is what you almost always want for text.",
        "<code>writeFileSync</code> creates <code>demo.txt</code> if it is missing — the same call from the journal's builtinmodules.js, pointed at a throwaway file so you do not clobber the journal's fixture."
      ],
      run: "node buffer-demo.js",
      output: "no encoding -> Buffer with 17 bytes\nutf-8      -> line one\nline two"
    }
  ],
  keyPoints: [
    "Built-in modules (<code>fs</code>, <code>http</code>, <code>path</code>…) need only <code>require</code> — no npm install.",
    "<code>writeFileSync</code> replaces file content, <code>appendFileSync</code> adds to it, <code>readFileSync</code> returns it.",
    "Pass <code>'utf-8'</code> to decode bytes into text; skip it and you get a <code>Buffer</code>.",
    "Synchronous calls block Node and throw on failure (handle with <code>try/catch</code>); async calls continue immediately and report errors through a callback.",
    "<code>fs</code> relative paths start at your terminal's folder, not at the script's folder."
  ],
  practice: `
    <p>Stand in <code>sorted_files/02_Week-02_Modules/modules/</code> and run the journal trio in
    order: <code>node builtine_modules/builtinmodules.js</code>, then
    <code>node builtine_modules/readfilesync.js</code>, then run the read script twice with
    <code>appendfilesync.js</code> in between and watch the file grow. Finally, try
    <code>node readfilesync.js</code> from inside <code>builtine_modules/</code> and read the
    <code>ENOENT</code> error — that is the relative-path trap from the theory, reproduced.</p>
  `,
  quiz: [
    {
      q: "student.txt already has three lines. What does writeFileSync('student.txt', 'hi') leave in the file?",
      options: [
        "One line: hi — the old content is replaced completely",
        "hi appended as a fourth line",
        "The old three lines followed by hi",
        "An error, because the file already exists"
      ],
      answer: 0,
      why: "writeFileSync truncates: it creates the file if missing and wipes existing content. appendFileSync is the one that adds to the end."
    },
    {
      q: "Why does readFileSync('student.txt', 'utf-8') include utf-8?",
      options: [
        "To decode the file's bytes into a readable string instead of returning a Buffer",
        "To make the file read faster in parallel",
        "To convert line endings from Windows to Unix",
        "To tell fs which folder to search"
      ],
      answer: 0,
      why: "Files are bytes on disk; utf-8 is the encoding rule for turning them into characters. Without it you get Node's raw Buffer object."
    }
  ],
  sources: [
    "https://nodejs.org/api/fs.html",
    "https://nodejs.org/api/buffer.html"
  ]
});
