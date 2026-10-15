window.COURSE_LESSONS.push({
  id: "w01-install-and-repl",
  file: "006",
  unit: 1,
  week: 1,
  title: "Installing Node.js and the REPL",
  kicker: "Unit I · Week 1 · Lesson 2 of 6",
  minutes: 13,
  objectives: [
    "Install Node.js and verify the installation with node -v and npm -v",
    "Start, use and exit the Node REPL",
    "Evaluate expressions and run small snippets interactively before writing files"
  ],
  intro: `
    <p>Last chapter you learned that Node.js is a JavaScript runtime built on V8 — a browser-less
    home for JavaScript. Before you can use it, you obviously have to install it. That is this
    lesson: get Node onto your machine, prove it works, and meet the <strong>REPL</strong> — the
    interactive playground where you will test every idea in this course before committing it to a
    file.</p>
    <p>The journal's Week 1 notes (<code>03_notes 1.txt</code>) cover the installation and REPL
    topics for the lab record, so we will reuse their facts and turn them into working terminal
    sessions.</p>
  `,
  theory: [
    `
      <h3>Installing Node.js</h3>
      <p>Installation is deliberately boring: download the installer from
      <a href='https://nodejs.org/' target='_blank' rel='noopener'>nodejs.org</a> and run it. Two
      terms appear on the download page:</p>
      <ul>
        <li><strong>LTS (Long Term Support)</strong> — the stable, safe choice. It receives
        security fixes for years. <em>Take this one.</em></li>
        <li><strong>Current</strong> — the newest release, with the latest features but shorter
        support. Useful only if you need a brand-new API.</li>
      </ul>
      <p>The installer puts two commands on your PATH: <code>node</code> (the runtime that executes
      JavaScript files) and <code>npm</code> (the Node Package Manager — the tool that downloads
      third-party libraries, which you will meet properly in Lesson 9). On macOS/Linux you can
      also install via a version manager like <code>nvm</code>, which lets you switch Node
      versions per project — handy later, but not required to follow this book.</p>
    `,
    `
      <h3>Proving it works</h3>
      <p>Open a terminal (Command Prompt, PowerShell, or any shell) and ask each tool for its
      version:</p>
      <pre class="diagram">$ node -v
v22.11.0
$ npm -v
10.9.0</pre>
      <p>Both print a version number → Node is installed and reachable. If the shell replies
      <em>"node is not recognized"</em> / <em>"command not found"</em>, the installer's PATH entry
      was not picked up — restart the terminal, or reinstall and tick the "add to PATH" option.
      The exact version numbers do not matter; any LTS-or-newer version can run everything in this
      book.</p>
    `,
    `
      <h3>What is the REPL?</h3>
      <p>REPL stands for <strong>Read – Eval – Print – Loop</strong>. It is an interactive prompt
      that keeps doing four things, forever:</p>
      <ol>
        <li><strong>Read</strong> — type a line of JavaScript and press Enter.</li>
        <li><strong>Eval</strong> — evaluate it (V8 runs it).</li>
        <li><strong>Print</strong> — show the result.</li>
        <li><strong>Loop</strong> — go back to step 1 and wait for you again.</li>
      </ol>
      <p>Start it by typing <code>node</code> with no arguments. You get a <code>&gt;</code>
      prompt. Type any JavaScript you know — <code>2 + 2</code>, <code>const name = "Ada"</code>,
      <code>name.toUpperCase()</code> — and see the result instantly. It is the cheapest possible
      way to test a doubt: "does <code>[1,2,3].includes(2)</code> return true?" — ask the REPL.</p>
    `,
    `
      <h3>REPL dot-commands</h3>
      <p>Some inputs are JavaScript, some are special <em>dot-commands</em> that control the REPL
      itself:</p>
      <table>
        <thead><tr><th>Command</th><th>What it does</th></tr></thead>
        <tbody>
          <tr><td><code>.help</code></td><td>List all dot-commands</td></tr>
          <tr><td><code>.exit</code></td><td>Leave the REPL (or press <code>Ctrl+C</code> twice / <code>Ctrl+D</code>)</td></tr>
          <tr><td><code>.clear</code></td><td>Reset multi-line state — but <em>not</em> your declared variables</td></tr>
          <tr><td><code>.load file.js</code></td><td>Read a file's code into the REPL and run it</td></tr>
          <tr><td><code>.save file.js</code></td><td>Write everything you typed into a file</td></tr>
        </tbody>
      </table>
      <p>The REPL also remembers your variables between lines (<code>const x = 10</code> once,
      then <code>x * 3</code> works), which is what makes it feel like a conversation with Node
      rather than a series of commands.</p>
    `
  ],
  examples: [
    {
      title: "The journal's own install notes (lab record material)",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/03_notes 1.txt",
      lang: "text",
      code: `What is node js
>> node js is a JavaScript runtime built on chrome v8 engine
>>it uses event driven and asynchronous non blocking I/o model that makes it lightweight and efficient

Any three company that use the node js

>>Netflix
>>Reddit
>>Paytm

##NOTEs by sir
with the help of node js we can create server applications, node js can be used as front end and backend.`,
      explain: [
        "These are the actual Week 1 notes from the journal — the answers you reproduce in the lab record for topic 1.1 (\"Installation of Node.js\" asks you to state what you are installing and why).",
        "The phrase <em>\"front end and backend\"</em> is exactly what installation enables: one runtime for server code, and later, tools for front-end builds.",
        "Once this file's definitions are understood, installation itself is just running the nodejs.org installer."
      ]
    },
    {
      title: "Verifying the install in the terminal",
      from: "new",
      lang: "bash",
      code: `$ node -v
v22.11.0
$ npm -v
10.9.0
$ node
Welcome to Node.js v22.11.0.
Type ".help" for more information.
> 2 + 2
4
> .exit
$`,
      explain: [
        "<code>node -v</code> and <code>npm -v</code> prove both tools are installed and on your PATH.",
        "Running <code>node</code> with <em>no arguments</em> starts the REPL — the <code>&gt;</code> prompt is the giveaway.",
        "<code>2 + 2</code> → <code>4</code> shows the full Read-Eval-Print-Loop working.",
        "<code>.exit</code> leaves the REPL and returns you to the shell."
      ],
      run: "node -v  (then  node  to enter the REPL)"
    },
    {
      title: "A first REPL conversation: variables, functions, mistakes",
      from: "new",
      lang: "bash",
      code: `> const course = "FSD"
'FSD'
> course.toUpperCase()
'FSD'
> function double(n) { return n * 2 }
undefined
> double(21)
42
> doubl(21)
Uncaught ReferenceError: doubl is not defined
> double(22)
44
>`,
      explain: [
        "The REPL echoes the <em>value</em> of each expression — declaring <code>const course</code> prints <code>'FSD'</code> because that's the declaration's value.",
        "A <code>function</code> declaration prints <code>undefined</code> but is now stored: <code>double(21)</code> works on the next line.",
        "Typos throw a <code>ReferenceError</code> immediately — and the REPL survives, so you can just fix and retry. That instant feedback loop is why the REPL is the perfect place to learn."
      ],
      run: "node   (then type the lines at the > prompt)"
    },
    {
      title: "REPL dot-commands in action",
      from: "new",
      lang: "bash",
      code: `> .help
.break    Currently parsing multiline expression
.clear    Resets the REPL context
.editor   Enter editor mode
.exit     Exit the REPL
.help     Print this help message
.load     Load JS from a file into the REPL session
.save     Save all evaluated commands to a file
> .save my-session.js
Session saved to: my-session.js
> .exit`,
      explain: [
        "<code>.help</code> lists every dot-command — always safe to explore with.",
        "<code>.save my-session.js</code> writes everything you typed to a file, so an exploratory session can become your first real script with zero copying.",
        "<code>.load my-session.js</code> is the reverse: run an existing file's code inside the REPL (you'll use it next with the journal's <code>02_functions.js</code>)."
      ],
      run: "node   (then type .help at the > prompt)"
    },
    {
      title: "Loading the journal's functions file into the REPL",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/02_functions.js",
      lang: "javascript",
      code: `function greet(name, age){
    let alloo = "4kg";
    console.log(alloo + " welcome " + name, " ", age);
}
greet("john", 8999);

console.log("========== arrow functions ============");
const numbers = (a, b) => a * b;
console.log(numbers(4, 4));

let sum = (a , b) => console.log(a + b);
sum(5, 5);`,
      explain: [
        "In the REPL, run <code>.load 02_functions.js</code> from inside this folder — the whole file executes, printing its output.",
        "Better still: after loading, the REPL keeps the definitions. Type <code>numbers(5, 5)</code> or <code>sum(100, 200)</code> and get <code>25</code> / <code>120</code> instantly.",
        "This is the bridge between \"running a file once\" and \"interacting with your own code\" — a habit worth building in Week 1."
      ],
      run: "node   (then  .load 02_functions.js)",
      output: `4kg welcome john    8999
========== arrow functions ============
16
10
> numbers(5, 5)
25`
    },
    {
      title: "node -e: the REPL in a single command",
      from: "new",
      lang: "bash",
      code: `$ node -e "console.log(1 + 2 * 3)"
7
$ node -e "const fs = require('fs'); console.log(typeof fs.readFile)"
function
$ echo "console.log('from a pipe', 10 / 4)" | node
from a pipe 2.5`,
      explain: [
        "<code>-e</code> runs a string of JavaScript and exits — the non-interactive cousin of the REPL, perfect for one-off checks and scripts.",
        "It can even load built-in modules like <code>fs</code> (the file-system module — Week 4 covers it), proving <code>node -e</code> runs real Node code, not just arithmetic.",
        "Piping <code>echo</code> output into <code>node</code> with no flags is another trick: Node reads the script from standard input."
      ],
      run: "node -e \"console.log(1 + 2 * 3)\""
    },
    {
      title: "The journal's README: the install → run workflow in one line",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/README.txt",
      lang: "text",
      code: `Week 1: Intro to Node.js. server.js needs \`npm i express\` then \`node server.js\` (port 8080).`,
      explain: [
        "The week's own README states the whole workflow: install dependencies with npm, then run the file with <code>node</code>.",
        "You will execute exactly these two commands in Lessons 9 and 10 — here they are, from the journal itself.",
        "<code>port 8080</code> is the number your browser will use to find the server — it becomes concrete in Lesson 10."
      ]
    }
  ],
  keyPoints: [
    "Install Node.js from nodejs.org — choose the LTS build; it provides both node and npm",
    "node -v and npm -v are the two commands that prove a working install",
    "The REPL (Read-Eval-Print-Loop) starts with plain node and lets you test JavaScript interactively",
    "REPL dot-commands like .help, .exit, .load and .save control the REPL itself",
    "node -e 'code' runs a one-off snippet without creating a file"
  ],
  practice: `
    <p>Start the REPL with <code>node</code>. Declare <code>const roll = 2408023</code>, then
    experiment: <code>String(roll).length</code>, <code>roll % 100</code>, and a small arrow
    function like <code>const last2 = (n) => n % 100</code>. Use <code>.save week1-play.js</code>
    before exiting — you have just created your first Node script by accident. Then run it with
    <code>node week1-play.js</code>.</p>
  `,
  quiz: [
    {
      q: "Which build of Node.js should you install from nodejs.org for normal development?",
      options: ["LTS (Long Term Support)", "Current", "Nightly", "Either — they are identical"],
      answer: 0,
      why: "LTS is the stable, long-supported build and the right default. \"Current\" has the newest features but shorter support."
    },
    {
      q: "What does the REPL stand for?",
      options: [
        "Read – Eval – Print – Loop",
        "Run – Export – Publish – Load",
        "Read – Execute – Package – List",
        "Reset – Evaluate – Print – Log"
      ],
      answer: 0,
      why: "The REPL reads your line, evaluates it, prints the result, and loops back for the next line — that's exactly what happens at the > prompt."
    }
  ],
  sources: [
    "https://nodejs.org/en/download",
    "https://nodejs.org/api/repl.html"
  ]
});
