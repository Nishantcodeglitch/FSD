window.COURSE_LESSONS.push({
  id: "p01-how-this-book-works",
  file: "001",
  unit: 0,
  week: 0,
  title: "How this book works",
  kicker: "Preface · Lesson 1 of 4",
  minutes: 12,
  objectives: [
    "Describe what this course covers and how its 4 units, 15 weeks and 85 lessons fit together",
    "Explain the parts of a lesson: objectives, theory, examples, key points, practice and quiz",
    "Tell a journal example from a new one and say where each lives"
  ],
  intro: `
    <p>This is the very first page of the book — there is nothing you need to know before it. You
    are about to learn Full Stack Development (CSA 301) from zero, built on top of a real student
    journal: the code written week by week during the course, tidied up so you can run every file
    yourself.</p>
    <p>In this first lesson you will get the map of the whole book, see how each chapter is built,
    and learn the two labels (<code>journal</code> and <code>new</code>) that appear next to the
    code examples. Then Lesson 2 helps you install the tools you will need from Lesson 3 onward.</p>
  `,
  theory: [
    `
      <h3>What this book teaches</h3>
      <p>CSA 301 — Full Stack Development — is a course about building the two halves of a web
      application: a <strong>back end</strong> that stores data and answers requests, and a
      <strong>front end</strong> that people see and click in a browser. The course is organised
      into <strong>4 units</strong> spread over <strong>15 weeks</strong>, and this book turns them
      into <strong>85 lessons</strong> you read in order (001 → 085).</p>
      <table>
        <thead><tr><th>Unit</th><th>Weeks</th><th>What you learn</th></tr></thead>
        <tbody>
          <tr><td><strong>Preface</strong></td><td>—</td><td>Setup, JavaScript basics, how to run the journal code (where you are now)</td></tr>
          <tr><td><strong>I — Introduction to Node.js</strong></td><td>1–6</td><td>Servers, modules, the event loop, promises, streams, cron jobs, webpack</td></tr>
          <tr><td><strong>II — Sequelize and MySQL</strong></td><td>7–10</td><td>Databases from scratch: connecting, models, migrations, queries, associations</td></tr>
          <tr><td><strong>III — React</strong></td><td>11–14</td><td>Components, props, state, hooks, routing and Redux</td></tr>
          <tr><td><strong>IV — Integration</strong></td><td>15</td><td>Tying a React front end to a Node back end and a MySQL database</td></tr>
        </tbody>
      </table>
      <p>Every lesson is short enough to finish in one sitting (the top of each chapter tells you
      how many minutes it takes), and every lesson ends with a small practice task and a quiz.</p>
    `,
    `
      <h3>The parts of a lesson</h3>
      <p>Each chapter follows the same shape, so once you know it you always know where to look:</p>
      <ul>
        <li><strong>Objectives</strong> — the two to four things you will be able to do by the end.</li>
        <li><strong>Theory</strong> — short written sections with headings. Every technical word is
        explained the first time it appears.</li>
        <li><strong>Examples</strong> — at least five complete, runnable code snippets per lesson.
        This is where the real learning happens: <em>type them out and run them</em>.</li>
        <li><strong>Key points</strong> — the chapter's takeaways in one line each.</li>
        <li><strong>Practice</strong> — a 5–10 minute hands-on task using the files in this
        repository.</li>
        <li><strong>Quiz</strong> — two or three questions with an explanation for every answer,
        including the wrong ones.</li>
      </ul>
      <p>The <code>sources</code> at the bottom of a chapter point you at the official documentation
      (nodejs.org, MDN, react.dev and friends) when you want to go deeper.</p>
    `,
    `
      <h3>Journal code vs. new code</h3>
      <p>This repository holds the actual journal of a student (Nishant, roll 2408023) who completed
      CSA 301. The code was collected into a folder called <code>sorted_files/</code>, with one
      subfolder per week. Examples taken from that journal are labelled like this:</p>
      <pre class="diagram">  from: "journal"
  file: "sorted_files/01_Week-01_Node-Intro/02_functions.js"
         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
         a real path in this repo - open it and compare</pre>
      <p>Anything else — written from scratch for this book to explain an idea the journal never
      covered, or to make a first example smaller — is labelled <code>from: "new"</code> and has no
      <code>file</code> path. You can always trust that a <code>journal</code> example matches a
      file you can open side by side.</p>
      <div class="note"><strong>Honest gaps.</strong> The journal is real work, so a few topics are
      missing or imperfect: <code>useMemo</code>/<code>useCallback</code> (Week 12.6/12.7) and all of
      Week 13 (routing) have no source files, Week 14 (Redux) comes from a classmate's backup and is
      credited as such, and some files contain bugs that the book points out and fixes rather than
      hiding. When you meet a <code>MISSING.txt</code> marker in a week folder, the book will tell
      you where the substitute material came from.</div>
    `,
    `
      <h3>How to read this book</h3>
      <p>Read a chapter top to bottom once. When you hit an example, stop reading and
      <strong>type the code into an editor</strong> — copying by hand is slow on purpose, it is how
      the syntax sticks. Run it, compare the output, then read the bullets under it to see what each
      line was doing.</p>
      <p>Answer the quiz before you turn the page; it takes thirty seconds and it works. Finish the
      practice task the same day if you can. Errors are part of the deal — when something breaks,
      the message is telling you exactly what went wrong, and Lessons 2 and 4 teach you to read
      them.</p>
      <p>The left sidebar (or the Prev / Next buttons) always follows the numeric order
      <code>001 → 085</code>, so "next" always means "the next thing you should learn".</p>
    `
  ],
  examples: [
    {
      title: "Your first three lines: console.log prints to the terminal",
      from: "new",
      lang: "javascript",
      code: `console.log("CSA 301 - Full Stack Development");
console.log("Preface: Ground Zero");
console.log("4 units, 15 weeks, 85 lessons - you are at lesson 1 of 85.");`,
      explain: [
        "<code>console.log(...)</code> prints a value — in a browser it goes to the dev-tools console, here (with Node) it goes straight to your terminal.",
        "Strings go in quotes; separate values with commas and <code>console.log</code> puts a space between them.",
        "Save it as <code>start.js</code> and run <code>node start.js</code>."
      ],
      run: "node start.js",
      output: `CSA 301 - Full Stack Development
Preface: Ground Zero
4 units, 15 weeks, 85 lessons - you are at lesson 1 of 85.`
    },
    {
      title: "A tiny progress tracker — the book's own example set, in code",
      from: "new",
      lang: "javascript",
      code: `const chapters = [
  { id: "001", title: "How this book works", read: true },
  { id: "002", title: "Set up your development environment", read: false },
  { id: "003", title: "JavaScript essentials from scratch", read: false },
  { id: "004", title: "Running the journal code", read: false }
];

const done = chapters.filter((c) => c.read).length;
console.log("Preface progress: " + done + "/" + chapters.length + " lessons");

for (const c of chapters) {
  console.log((c.read ? "[x] " : "[ ] ") + c.id + " " + c.title);
}`,
      explain: [
        "An <strong>array</strong> (the square brackets) holds a list; each entry is an <strong>object</strong> (the curly braces) with a <code>id</code>, a <code>title</code> and a <code>read</code> flag.",
        "<code>filter</code> keeps only the chapters where <code>read</code> is true, and <code>length</code> counts what is left — that is your progress number.",
        "The <code>for...of</code> loop walks the list once per chapter and prints a checkbox.",
        "Lesson 3 explains every keyword used here in full; right now just watch it run."
      ],
      run: "node progress.js",
      output: `Preface progress: 1/4 lessons
[x] 001 How this book works
[ ] 002 Set up your development environment
[ ] 003 JavaScript essentials from scratch
[ ] 004 Running the journal code`
    },
    {
      title: "How to read a terminal session in this book",
      from: "new",
      lang: "bash",
      code: `$ cd Desktop/FSD_JOURNAL
$ node -v
v24.19.0
$ npm -v
11.17.0`,
      explain: [
        "Lines starting with <code>$</code> are what <strong>you</strong> type; the lines under them are what the machine answers.",
        "<code>cd</code> changes the folder you are in. Everything in this book assumes your terminal is open at the repository root.",
        "<code>node -v</code> prints the Node version and <code>npm -v</code> the npm version — Lesson 2 shows how to install both.",
        "The exact version numbers on your machine will differ; what matters is that a number appears instead of an error."
      ],
      run: "node -v"
    },
    {
      title: "A sample package.json — a project's ID card",
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
        "This exact file lives in the journal's Week 1 folder. A <code>package.json</code> names a project, lists the commands you can run (<code>scripts</code>) and the packages it needs (<code>dependencies</code>).",
        "<code>\"webpack\": \"^5.109.2\"</code> means any version compatible with 5.109.2 — the caret is npm's way of allowing updates.",
        "<strong>Spot the bug:</strong> <code>\"webpack.config.js\": \"^0.0.0\"</code> is nonsense — a config file is not a package. Running <code>npm install</code> in that folder fails because of it (the repository notes say to install webpack manually instead). The book keeps the journal's quirk and calls it out rather than silently fixing it.",
        "Lesson 8 goes through <code>package.json</code> field by field."
      ]
    },
    {
      title: "Where the journal tells you how to run a week",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/README.txt",
      lang: "text",
      code: `Week 1: Intro to Node.js. server.js needs \`npm i express\` then \`node server.js\` (port 8080).`,
      explain: [
        "Every week folder in <code>sorted_files/</code> ships a one-or-two-line <code>README.txt</code> that says what the week contains and how to run it.",
        "<code>npm i express</code> installs the Express package (Lesson 9 covers this); <code>node server.js</code> starts the program.",
        "The note in parentheses — <em>port 8080</em> — is the number you will type into your browser: <a href='http://localhost:8080/home' target='_blank' rel='noopener'>http://localhost:8080/home</a>.",
        "When a chapter says \"see the week's README\", it means exactly this file."
      ]
    },
    {
      title: "The book never hides what the journal is missing",
      from: "journal",
      file: "sorted_files/12_Week-12_Hooks/MISSING.txt",
      lang: "text",
      code: `MISSING - Week 12.6 useMemo and 12.7 useCallback: no source files supplied.`,
      explain: [
        "Some week folders contain a <code>MISSING.txt</code> that states plainly which syllabus topics had no source code in the journal.",
        "This book still teaches those topics — Lessons 69 and 70 are written from the official React docs and are labelled accordingly.",
        "You will find the same honest markers in Weeks 9 and 13, and Week 14's README credits the classmate's backup it was built from."
      ]
    },
    {
      title: "A quiz-style function — how this book scores you",
      from: "new",
      lang: "javascript",
      code: `function checkAnswer(question, given, correct) {
  if (given === correct) {
    return "correct!";
  }
  return "not quite - the answer was: " + correct;
}

console.log(checkAnswer(1, 0, 0));
console.log(checkAnswer(2, 3, 1));`,
      explain: [
        "A <strong>function</strong> is a named block of code you can call over and over with different values (<code>question</code>, <code>given</code>, <code>correct</code>).",
        "<code>return</code> hands a value back to whoever called the function — that is what gets printed.",
        "<code>===</code> compares strictly: same value <em>and</em> same type.",
        "This is exactly the machinery behind the quiz at the end of every lesson — you pick an option, it compares your index with the right one and explains the result."
      ],
      run: "node quiz.js",
      output: `correct!
not quite - the answer was: 1`
    }
  ],
  keyPoints: [
    "The course is 4 units, 15 weeks, 85 lessons, read in file order 001 → 085",
    "Every lesson gives you objectives, theory, 5+ runnable examples, key points, practice and a quiz",
    "from:\"journal\" means a real file from this repository; from:\"new\" means written for the book",
    "The journal has honest gaps (Week 12.6/12.7, Week 13, Week 14 backup) and the book flags them",
    "Type the examples and run them — reading alone will not teach you to code"
  ],
  practice: `
    <p>Open <code>sorted_files/01_Week-01_Node-Intro/README.txt</code> in this repository and read
    its single line — that is all the instruction the original student needed for Week 1. Then open
    <code>sorted_files/12_Week-12_Hooks/MISSING.txt</code> too. Finally, create a file called
    <code>progress.js</code> anywhere you like, copy the progress-tracker example from this lesson,
    flip every <code>read</code> flag to <code>true</code>, run it, and enjoy your first completed
    checklist.</p>
  `,
  quiz: [
    {
      q: "How many units and how many total lessons does this book have?",
      options: [
        "1 unit, 10 lessons",
        "2 units, 40 lessons",
        "4 units, 85 lessons",
        "4 units, 15 lessons"
      ],
      answer: 2,
      why: "Four units (Node, Sequelize/MySQL, React, Integration) over 15 weeks, expanded into 85 lessons. 15 is the number of weeks, not lessons."
    },
    {
      q: "An example labelled from:\"journal\" tells you that the code:",
      options: [
        "was invented by the book's author to show a clean pattern",
        "comes from a real file in this repository, with its path given",
        "is copied from the official Node.js documentation",
        "was generated automatically from the syllabus"
      ],
      answer: 1,
      why: "Journal examples always carry a real relative path (sorted_files/...) that you can open and compare line for line. Everything else is from:\"new\"."
    }
  ],
  sources: [
    "https://nodejs.org/",
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"
  ]
});
