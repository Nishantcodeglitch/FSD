window.COURSE_LESSONS.push({
  id: "p04-running-the-journal-code",
  file: "004",
  unit: 0,
  week: 0,
  title: "Running the journal code",
  kicker: "Preface · Lesson 4 of 4",
  minutes: 16,
  objectives: [
    "Find your way around the sorted_files/ repository and read a week's README.txt to learn how that week runs",
    "Run any journal file with node from the right folder, including demos that need command-line arguments",
    "Check a file's syntax without running it using node --check",
    "Diagnose the three errors you will actually hit: missing module, port already in use, MySQL switched off"
  ],
  intro: `
    <p>You have installed Node, npm and VS Code (Lesson 2) and you have seen the JavaScript
    language itself (Lesson 3). Now it is time to do the thing the whole book is built on:
    <strong>run the real journal files</strong> that sit in this repository.</p>
    <p>This final preface lesson is the practical bridge. It shows how the
    <code>sorted_files/</code> folder is organised, the one rule that decides whether a file runs
    or dies with a confusing error, how to check a file before running it, and the three errors
    you will meet in your first week — with the exact fix for each. From Lesson 5 onward, every
    chapter assumes you can do everything on this page.</p>
  `,
  theory: [
    `
      <h3>How the repository is organised</h3>
      <p>The journal's code lives in one folder, <code>sorted_files/</code>, with
      <strong>15 subfolders — one per week</strong> of the course. Each subfolder is named with a
      number so it sorts in study order:</p>
      <pre class="diagram">  sorted_files/
    01_Week-01_Node-Intro/        06_Week-06_Cron-Webpack/      11_Week-11_React-Intro/
    02_Week-02_Modules/           07_Week-07_Sequelize-MySQL/   12_Week-12_Hooks/
    03_Week-03_Event-Loop-Async/  08_Week-08_Models-Migrations/ 13_Week-13_Routing/
    04_Week-04_Promises-FS-CLI/   09_Week-09_Querying/          14_Week-14_Redux/
    05_Week-05_Streams-Routing/   10_Week-10_Associations/      15_Week-15_Integration-otaku/</pre>
      <p>Inside a week folder you will usually find:</p>
      <ul>
        <li><strong><code>README.txt</code></strong> — one or two lines saying what the week
        covers and <em>how to run it</em>. Always read it first; it is the shortest instruction
        manual you will ever open.</li>
        <li><strong>Numbered <code>.js</code> files</strong> — <code>01_server.js</code>,
        <code>02_functions.js</code> and so on. The numbers are just the order they were written
        in; there is no deeper meaning.</li>
        <li><strong>Data fixtures</strong> — small files some programs read at runtime, such as
        <code>sampleForStream.txt</code> in Week 5. They are part of the code: if you delete one,
        the program that needs it stops working.</li>
        <li><strong><code>MISSING.txt</code></strong> — (Weeks 9, 12, 13) an honest note that
        some syllabus topics had no journal code. Lesson 1 introduced these.</li>
      </ul>
      <p>Two things are deliberately <em>not</em> in the repository: <code>node_modules/</code>
      (re-downloadable with <code>npm i</code> — Lesson 2) and <code>.env</code> files (Lesson
      40 explains how database passwords are kept out of the journal).</p>
    `,
    `
      <h3>One rule decides everything: where you run from</h3>
      <p>Node resolves the paths inside a file in two different ways, and the difference causes
      half of all beginner confusion:</p>
      <ul>
        <li><code>require('./cal.js')</code> — a <strong>module path</strong> is resolved
        <em>relative to the file that contains it</em>. So
        <code>modules/app.js</code> finds <code>cal.js</code> sitting next to it, no matter which
        folder you launch <code>node</code> from.</li>
        <li><code>fs.createReadStream('sampleForStream.txt')</code> — a <strong>plain file
        path</strong> is resolved <em>relative to your terminal's current folder</em>. Run Week
        5's stream demo from the repository root and Node goes looking for
        <code>sampleForStream.txt</code> in the root — where it does not exist — and crashes
        with <code>ENOENT</code>.</li>
      </ul>
      <p>The habit that saves you: <strong><code>cd</code> into the week folder before running
      anything</strong>. That is exactly what every README.txt tells you to do.</p>
    `,
    `
      <h3>node --check: is this file even valid?</h3>
      <p>When you mistype JavaScript, the error can arrive long after the typo — halfway through
      a loop, or deep inside a function you never called. <code>node --check somefile.js</code>
      parses a file <strong>without running it</strong>: no output at all means the syntax is
      fine, and a <code>SyntaxError</code> with a caret (<code>^</code>) under the guilty
      character means it is not. Run it on any file before — or immediately after — an
      unexplained failure.</p>
    `,
    `
      <h3>The three errors you will actually meet</h3>
      <table>
        <thead><tr><th>Error</th><th>What it means</th><th>The fix</th></tr></thead>
        <tbody>
          <tr>
            <td><code>Cannot find module 'express'</code></td>
            <td>The package is not installed in this folder yet</td>
            <td><code>npm i express</code> inside that folder, then run again</td>
          </tr>
          <tr>
            <td><code>listen EADDRINUSE: address already in use :::8080</code></td>
            <td>Another process (often your own last server, still running) holds port 8080</td>
            <td>Stop the old server with <code>Ctrl + C</code>, or pick another port number</td>
          </tr>
          <tr>
            <td><code>connect ECONNREFUSED</code> / "Connection failed"</td>
            <td>Nothing is listening on the MySQL port — XAMPP's MySQL is off, or it listens on
            3306 while the code asks for another port (Journal's Lab16 asks for 3307)</td>
            <td>Start MySQL in the XAMPP control panel; check the port with the one-liner in
            Example 8</td>
          </tr>
        </tbody>
      </table>
      <p>All three are environmental, not logical: your code can be perfect and still die because
      a package, a port or a database is missing. That is why this lesson comes before Unit I.</p>
    `
  ],
  examples: [
    {
      title: "The map: listing the 15 week folders",
      from: "new",
      lang: "text",
      code: `  sorted_files/
    01_Week-01_Node-Intro/          06_Week-06_Cron-Webpack/        11_Week-11_React-Intro/
    02_Week-02_Modules/             07_Week-07_Sequelize-MySQL/     12_Week-12_Hooks/
    03_Week-03_Event-Loop-Async/    08_Week-08_Models-Migrations/   13_Week-13_Routing/
    04_Week-04_Promises-FS-CLI/     09_Week-09_Querying/            14_Week-14_Redux/
    05_Week-05_Streams-Routing/     10_Week-10_Associations/        15_Week-15_Integration-otaku/`,
      explain: [
        "This is a map of the folders, not a terminal transcript — in a real terminal, <code>dir sorted_files</code> (Windows) or <code>ls sorted_files</code> (macOS/Linux) prints one name per line.",
        "The leading numbers (01, 02, ... 15) keep the folders in course order wherever you sort them.",
        "Every example in this book that is labelled from:\"journal\" points into one of these folders — you can open the exact file beside the book.",
        "You will also find <code>fsd-course-site/</code> at the repository root: that folder is this book's own source code."
      ],
      run: "dir sorted_files"
    },
    {
      title: "The journal tells you how to run it — Week 2's README",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/README.txt",
      lang: "text",
      code: `Week 2: Node modules. Run inside subfolders so require() resolves, e.g. modules/ \`node app.js\`.
week5-bundler/ is the same pair reused as webpack input in Week 6.`,
      explain: [
        "Two sentences, and they tell you everything: what the week covers, and the exact command to type — including <em>which folder to type it in</em>.",
        "Every week folder has one of these; the book quotes them whenever a chapter starts a new week.",
        "The second line explains a reuse: the same mini-project reappears in Week 6 as webpack's input, which is why the folder looks duplicated."
      ]
    },
    {
      title: "Running a journal file: node app.js inside the modules folder",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/modules/app.js",
      lang: "javascript",
      code: `const cal = require('./cal.js')


console.log("addition", cal.add(3,5));
console.log("substraction", cal.sub(3,5));
console.log("multiplication", cal.mult(3,5));
console.log("division", cal.div(3,5));
console.log("modulo", cal.mod(3,5));`,
      explain: [
        "<code>require('./cal.js')</code> loads a sibling file (the calculator from Lesson 3's examples) and gives this file access to whatever it exports — Lesson 7 covers modules properly.",
        "Each <code>console.log(a, b)</code> prints both values with a space between them.",
        "Because the path starts with <code>./</code>, Node looks next to <code>app.js</code> itself — this file actually runs from any folder, but the README's advice (cd in first) is still the habit to build.",
        "Try it: <code>cd sorted_files/02_Week-02_Modules/modules</code> then <code>node app.js</code>."
      ],
      run: "node app.js",
      output: `addition 8
substraction -2
multiplication 15
division 0.6
modulo 3`
    },
    {
      title: "When the folder matters — Week 5's README",
      from: "journal",
      file: "sorted_files/05_Week-05_Streams-Routing/README.txt",
      lang: "text",
      code: `Week 5: streams, servers/routes, headers, gateways. Run from this folder: streams.js reads sampleForStream.txt here.`,
      explain: [
        "Notice the wording: <em>Run from this folder</em> — not because of <code>require()</code>, but because the program opens a data file with a plain path.",
        "<code>sampleForStream.txt</code> (the jokes file you will see in the next example) is that data file, shipped in the same folder.",
        "Ignore the advice and run it from the repository root and you get <code>Error: ENOENT: no such file or directory, open '...\\sampleForStream.txt'</code> — the file exists, Node just looked in the wrong place."
      ]
    },
    {
      title: "A real stream demo, run the right way",
      from: "journal",
      file: "sorted_files/05_Week-05_Streams-Routing/01_streams.js",
      lang: "javascript",
      code: `const fs = require('fs');

const readStream = fs.createReadStream('sampleForStream.txt', {encoding:'utf-8'});

readStream.on('data',(chunk)=>{
//it has to be data as the varible name followed by where is the data is stored that is readStream in our cace.

console.log("chunk revieved");
console.log(chunk);

});

readStream.on("end",()=>{ //this will only print if we reach at the end of the file if any error it wont print.
    console.log("End of the file");
})`,
      explain: [
        "<code>fs</code> is Node's built-in File System module; <code>createReadStream</code> opens the file and hands it over in pieces (<strong>chunks</strong>) instead of loading it all at once — the efficient way to read big files.",
        "The <code>.on('data', ...)</code> line registers a <strong>callback</strong> that runs once per chunk; <code>.on('end', ...)</code> runs when the file is finished.",
        "The book keeps the journal's typos (<em>revieved</em>, <em>cace</em>) untouched — the file you run is the file the student wrote.",
        "Run it from inside the Week 5 folder. The whole small file arrives as one chunk, then \"End of the file\" prints."
      ],
      run: "node 01_streams.js",
      output: `chunk revieved

What concert only costs 45 cents? 50 Cent and Nickelback.
The guy who stole my diary went missing. My thoughts are with his family.
Don’t take life too seriously. Remember, you will never get out of it alive!
Knock knock. Who’s there? Ben. Ben who? Ben thinking about you all day!
What car does Jesus drive? A Christler.
It was so hot today. I almost called my ex to be around something shady.
End of the file`
    },
    {
      title: "Some demos need arguments — Week 4's CLI reader",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/13_cmd-arg2.js",
      lang: "javascript",
      code: `let name = process.argv[2];
let age = process.argv[3];
console.log("Name: ", name);
console.log("Age: ", age);`,
      explain: [
        "<code>process.argv</code> is an array of everything typed after <code>node</code>: index 0 is Node itself, index 1 is the script, so the <strong>first real argument is index 2</strong>.",
        "Week 4's README warns about exactly this: \"CLI demos need args, e.g. <code>node cmd-arg2.js Raju 20</code>\". Run it with no arguments and you get <code>Name: undefined</code> — not a crash, just missing data.",
        "This is the pattern behind every command-line tool you will ever use; here it is four lines long."
      ],
      run: "node 13_cmd-arg2.js Raju 20",
      output: `Name:  Raju
Age:  20`
    },
    {
      title: "node --check: pass and fail, side by side",
      from: "new",
      lang: "bash",
      code: `$ node --check 01_streams.js
$ echo $?
0
$ node --check broken.js
broken.js:1
function add(a, b {
                  ^
SyntaxError: Unexpected token '{'
    at wrapSafe (node:internal/modules/cjs/loader:1804:18)
    at checkSyntax (node:internal/main/check_syntax:76:3)`,
      explain: [
        "First command: <strong>no output at all</strong> means the syntax is valid. Silence is success — do not go looking for a message.",
        "<code>echo $?</code> prints the exit code of the previous command: 0 means fine, 1 means failure (macOS/Linux/Git Bash; Windows PowerShell uses <code>$LASTEXITCODE</code>).",
        "The broken file is missing the <code>)</code> after the parameter list — the caret points at the character Node choked on, and <code>node --check</code> found it <em>without running anything</em>.",
        "The last two lines of the trace (internal Node frames) are almost never about your code; the first three lines are the part to read."
      ],
      run: "node --check broken.js"
    },
    {
      title: "The three errors, and their one-line fixes",
      from: "new",
      lang: "bash",
      code: `# 1 - package not installed yet
$ node server.js
Error: Cannot find module 'express'
$ npm i express
$ node server.js
server is running on http//localhost:8080

# 2 - a server already owns the port
$ node server.js
Error: listen EADDRINUSE: address already in use :::8080
# fix: press Ctrl+C in the terminal running the old server

# 3 - MySQL is not reachable
$ node -e "require('net').connect(3306,'localhost',()=>console.log('MySQL is up')).on('error',()=>console.log('MySQL is OFF - start it in XAMPP'))"
MySQL is OFF - start it in XAMPP
# fix: open XAMPP, press Start next to MySQL, run the check again`,
      explain: [
        "Error 1: Node only ships its <em>core</em> modules — everything else must be downloaded into the project with <code>npm i</code> (Lesson 2). The fix happens in the folder that contains the file.",
        "Error 2: a port allows exactly one listener. The message <code>address already in use :::8080</code> literally means \"something is already there\" — usually the server you started five minutes ago and forgot about.",
        "Error 3: the one-liner opens a socket to port 3306 (MySQL's default, and XAMPP's) and prints one of two honest answers. The journal's Lab16/db.js asks for <strong>3307</strong> instead, so even with XAMPP running you would see \"Connection failed\" — a real, preserved quirk you will meet in Lesson 30.",
        "None of these three errors mean your code is wrong. Check the environment first, then the code."
      ],
      run: "node -e \"require('net').connect(3306,'localhost',()=>console.log('MySQL is up')).on('error',()=>console.log('MySQL is OFF - start it in XAMPP'))\""
    }
  ],
  keyPoints: [
    "The journal lives in sorted_files/ as 15 numbered week folders, each with a README.txt saying how to run it",
    "require() paths resolve next to the file; plain fs paths resolve next to your terminal — cd into the week folder first",
    "node file.js runs a program; node --check file.js only validates its syntax and prints nothing when it is fine",
    "Cannot find module → npm i in that folder; EADDRINUSE → Ctrl+C the old server; MySQL refused → start it in XAMPP and mind the port",
    "Some demos expect command-line arguments (process.argv[2], [3], ...); without them you get undefined, not a crash"
  ],
  practice: `
    <p>Do the full run-through once, end to end. From the repository root:
    <code>cd sorted_files/02_Week-02_Modules/modules</code>, then <code>node app.js</code> — five
    arithmetic lines. Then <code>cd ../../05_Week-05_Streams-Routing</code> and
    <code>node 01_streams.js</code> for the jokes file. Now break something on purpose: copy any
    journal <code>.js</code> file, delete a closing brace, run <code>node --check</code> on it
    and read the caret, then fix it and watch the check go silent. Finish by running the MySQL
    one-liner from Example 8 — and if it says OFF, open XAMPP and turn MySQL on. You now know
    everything the Preface had to teach.</p>
  `,
  quiz: [
    {
      q: "You run node sorted_files/05_Week-05_Streams-Routing/01_streams.js from the repository root and get Error: ENOENT: no such file or directory, open '...\\sampleForStream.txt'. Why?",
      options: [
        "Express is not installed in the Week 5 folder",
        "fs.createReadStream resolves its path from your terminal's folder, and the data file lives inside the Week 5 folder, so you must run it from there",
        "The sampleForStream.txt file is corrupt",
        "Node cannot execute files that live in subfolders"
      ],
      answer: 1,
      why: "require() paths resolve relative to the file that contains them, but plain file paths resolve relative to your current working directory — the file is fine, the working directory is wrong. That is exactly why Week 5's README says \"Run from this folder\"."
    },
    {
      q: "node server.js prints Error: Cannot find module 'express'. What is the right first move?",
      options: [
        "Rewrite the file without the require() line",
        "Reinstall Node.js",
        "Run npm i express in the folder that contains server.js, then run it again",
        "Change the port from 8080 to 3306"
      ],
      answer: 2,
      why: "Express is a third-party package, not part of Node's core — it must be downloaded into the project with npm. Rewriting hides the problem, reinstalling Node changes nothing, and the port has nothing to do with a missing module (EADDRINUSE would be the port error)."
    }
  ],
  sources: [
    "https://nodejs.org/api/cli.html",
    "https://nodejs.org/api/fs.html"
  ]
});
