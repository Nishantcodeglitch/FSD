window.COURSE_LESSONS.push({
  id: "w04-fs-and-cli-capstone",
  file: "028",
  unit: 1,
  week: 4,
  title: "File-system recipes and CLI mini programs",
  kicker: "Unit I · Week 4 · Lesson 6 of 6",
  minutes: 18,
  objectives: [
    "Choose correctly between writeFile, appendFile and unlink for a file task",
    "Fix a CLI program's argument handling, including out-of-range indices",
    "Combine process.argv parsing with fs.promises in a small working tool"
  ],
  intro: `
    <p>Two halves of Week 4 meet in this final lesson: file-system recipes (syllabus 4.5) and the
    command-line programs you met last lesson. The journal supplies four short files — an
    append, a delete, a grade checker and a vote-eligibility checker — and we will treat two of them
    as what they really are: excellent material for spotting and fixing bugs.</p>
    <p>Then the capstone: a tiny <code>notes.js</code> tool that takes an argument from the command
    line and saves it to a file with <code>fs.promises</code> — everything Week 4 taught, in fifteen
    lines you can actually use.</p>
  `,
  theory: [
    `
      <h3>The fs recipe trio: write, append, delete</h3>
      <p>Week 2 met <code>fs</code> synchronously; Lesson 4 showed the promise style. The three
      operations the journal drills this week differ in one key behaviour:</p>
      <table>
        <thead><tr><th>Operation</th><th>If the file exists</th><th>If it does not</th></tr></thead>
        <tbody>
          <tr><td><code>writeFile</code></td><td>overwrites it from scratch</td><td>creates it</td></tr>
          <tr><td><code>appendFile</code></td><td>adds text at the end</td><td>creates it</td></tr>
          <tr><td><code>unlink</code></td><td>deletes it</td><td>fails with error <code>ENOENT</code></td></tr>
        </tbody>
      </table>
      <p>That last row dictates the <strong>run order</strong> of the journal's files:
      <code>03_EX4.js</code> writes <code>sample.txt</code>, <code>04_EX5_appendfiles.js</code>
      grows it, <code>05_EX6_deletefile.js</code> removes it. Run the delete first and you get an
      <code>ENOENT</code> error — every one of these callbacks checks <code>if (err)</code> for
      exactly that reason. (Week 5 returns to append in the world of streams — today's version is
      the simple whole-file one.)</p>
    `,
    `
      <h3>CLI programs need a contract</h3>
      <p>A command-line tool is only as good as its argument handling, and the journal's two quiz
      programs show both failure modes worth knowing:</p>
      <ul>
        <li><strong>Wrong indices.</strong> <code>16_grade-check.js</code> reads
        <code>process.argv[5]</code> and <code>process.argv[6]</code> — slots 5 and 6! Your first
        argument lives at slot 2, so the file only works if you pad the command with three dummy
        values first: <code>node 16_grade-check.js d1 d2 d3 Raju 95</code>. The lesson: after
        writing a CLI, count the indices from your <em>first typed value</em>, and prefer
        <code>argv[2]</code>, <code>argv[3]</code>… unless the slots genuinely mean something.</li>
        <li><strong>Unvalidated comparison.</strong> <code>17_question2.js</code> checks
        <code>age &gt;= 18</code> on a raw string. JavaScript converts numeric strings for you
        (<code>"20" &gt;= 18</code> is true), so the happy path works — but junk like
        <code>"eighteen"</code> converts to <code>NaN</code>, every comparison against
        <code>NaN</code> is false, and the program silently declares an adult "not eligible".
        Convert with <code>Number()</code> and reject <code>NaN</code> explicitly.</li>
      </ul>
      <p>And a tiny typesetting bug in the same file —
      <code>name + "you are eligible to vote"</code> has no space, printing
      <code>Rajuyou are eligible</code>. Small, real, and exactly the kind of thing code review
      exists for.</p>
    `,
    `
      <h3>The capstone: argv in, file out</h3>
      <p>Now combine the two halves. A CLI tool that saves notes: parse
      <code>process.argv</code>, validate it, then hand the text to
      <code>fs.promises.appendFile</code> and report success or the error code from a single
      <code>.catch</code>:</p>
      <pre class="diagram">  $ node notes.js add "learn promises"
   │
   ▼
  process.argv = ["node", "notes.js", "add", "learn promises"]
   │
   ▼
  validation ok ───────────────▶ fs.appendFile("notes.txt", text + "\\n")
   │                                    │
   ▼                                    ▼
  "usage: ..." (missing args)   fulfilled → "note saved: learn promises"
                                rejected  → "could not save: EACCES / ENOENT ..."
   </pre>
      <p>That shape — <em>parse → validate → do one asynchronous thing → report</em> — is the skeleton
      of nearly every CLI tool you will ever meet, including the big ones like <code>npm</code>
      itself. Fifteen lines below, and it is yours.</p>
    `
  ],
  examples: [
    {
      title: "The append recipe",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/04_EX5_appendfiles.js",
      lang: "javascript",
      code: `
const fs = require('fs');

console.log("appending data");

const details = \`student name: Raju
roll no: 2408028
course: bca
age: 2890
\`;

fs.appendFile('sample.txt', details, (err) => {
  if (err) {
    console.log("error", err);
  } else {
    console.log("it worked");
  }
});
`,
      explain: [
        "<code>fs.appendFile</code> adds the text to the end of <code>sample.txt</code> (creating the file if it does not exist) — the difference from 03_EX4's <code>writeFile</code>, which would have overwritten it.",
        "Run <code>03_EX4.js</code> first so there is something to append to, then run this twice to see the file grow.",
        "Same error-first shape as always: the <code>if (err)</code> branch would report a failure such as EACCES on a read-only folder."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/04_EX5_appendfiles.js",
      output: `appending data
it worked`
    },
    {
      title: "The delete recipe",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/05_EX6_deletefile.js",
      lang: "javascript",
      code: `
const fs = require('fs');

console.log("deleting file");

fs.unlink('sample.txt', (err) => {
  if (err) {
    console.log("error", err);
  } else {
    console.log("it got deleted");
  }
});
`,
      explain: [
        "<code>fs.unlink</code> is Node's name for \"delete this file\" (named long before Node existed, in the Unix tradition).",
        "The output shown assumes <code>sample.txt</code> exists — created by <code>03_EX4.js</code> or grown by the previous example. Delete it twice in a row and the second run prints the error branch with code <code>ENOENT</code>: the file was already gone.",
        "Together with write and append this completes the week's file trio: create/overwrite, grow, remove."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/05_EX6_deletefile.js",
      output: `deleting file
it got deleted`
    },
    {
      title: "Grade checker — works, but only with three dummy arguments",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/16_grade-check.js",
      lang: "javascript",
      code: `
let name = process.argv[5]; 
let mark = Number(process.argv[6]);
console.log(name);
if (mark >= 90 && mark <= 100) {
  console.log("A");
} else if (mark >= 75 && mark < 90) {
  console.log("B");
} else if (mark >= 50 && mark < 75) {
  console.log("C");
} else if (mark >= 0 && mark < 50) {
  console.log("fail");
}
`,
      explain: [
        "Read the indices: <code>argv[5]</code> and <code>argv[6]</code>. The first user argument is at index 2, so the name only lands at 5 if three dummy values (\"d1 d2 d3\") are typed before it — that is how the output below was produced.",
        "The mark <em>is</em> converted with <code>Number()</code>, which is why the comparisons work; A covers 90–100, B 75–89, C 50–74, fail below 50.",
        "Two gaps a real tool must close: marks above 100 or below 0 print nothing at all (no branch matches), and missing arguments print <code>undefined</code> plus nothing. Example 5 fixes both.",
        "Try <code>node 16_grade-check.js Raju 95</code> with no dummies: name prints \"Raju\" but the mark read from argv[6] is undefined → NaN → no grade."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/16_grade-check.js d1 d2 d3 Raju 95",
      output: `Raju
A`
    },
    {
      title: "Vote eligibility checker (with two small bugs)",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/17_question2.js",
      lang: "javascript",
      code: `
let name = process.argv[2];
let age = process.argv[3];

if (age>=18){
    console.log(name + "you are eligible to vote");
}else{
    console.log("you are not eligible to vote");
    console.log("sorry ", name);
}
`,
      explain: [
        "This one uses the correct indices (2 and 3). Because <code>\"16\" &gt;= 18</code> makes JavaScript convert the string to a number, the comparison works — but <code>Number()</code> would say so explicitly, and junk input like <code>eighteen</code> would fail silently instead of loudly.",
        "Bug 1, visible with <code>node 17_question2.js Raju 20</code>: the missing space produces <code>Rajuyou are eligible to vote</code>. Fix: <code>name + \" you are...\"</code>.",
        "Bug 2, visible below with Raju 16: <code>console.log(\"sorry \", name)</code> already adds a space between its arguments, so \"sorry \" with its own trailing space prints two.",
        "Run both ways yourself: <code>node 17_question2.js Raju 20</code> vs <code>node 17_question2.js Raju 16</code>."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/17_question2.js Raju 16",
      output: `you are not eligible to vote
sorry  Raju`
    },
    {
      title: "The grade checker, fixed: right indices, range guard, usage message",
      from: "new",
      lang: "javascript",
      code: `
let name = process.argv[2];
let mark = Number(process.argv[3]);

if (!name || Number.isNaN(mark)) {
  console.log("usage: node grade.js <name> <mark>");
} else if (mark < 0 || mark > 100) {
  console.log("mark must be between 0 and 100");
} else if (mark >= 90) {
  console.log(name + " got A");
} else if (mark >= 75) {
  console.log(name + " got B");
} else if (mark >= 50) {
  console.log(name + " got C");
} else {
  console.log(name + " failed");
}
`,
      explain: [
        "Save as <code>grade.js</code>. Arguments now start at index 2, so <code>node grade.js Raju 95</code> works with no dummy padding.",
        "<code>Number.isNaN(mark)</code> catches junk input (<code>node grade.js Raju abc</code> → usage message instead of silence), and a missing-argument check covers <code>node grade.js Raju</code>.",
        "The range guard (<code>mark &lt; 0 || mark &gt; 100</code>) closes the original's silent hole where 250 would slip into the B branch.",
        "The remaining branches no longer repeat the upper bounds (<code>mark &gt;= 90</code> is enough once 100+ is excluded) — shorter and equally correct."
      ],
      run: "node grade.js Raju 95",
      output: `Raju got A`
    },
    {
      title: "Capstone: a notes CLI built on argv + fs.promises",
      from: "new",
      lang: "javascript",
      code: `
const fs = require("fs").promises;

let action = process.argv[2];
let text = process.argv[3];

if (action !== "add" || !text) {
  console.log("usage: node notes.js add \\"your note\\"");
} else {
  fs.appendFile("notes.txt", text + "\\n")
    .then(function () { console.log("note saved:", text); })
    .catch(function (err) { console.log("could not save:", err.code); });
}
`,
      explain: [
        "Save as <code>notes.js</code>. Every piece of Week 4 in one file: argv parsing (Lesson 5), validation with a usage message, and a promise-returning <code>appendFile</code> with .then/.catch (Lessons 1–4).",
        "Run <code>node notes.js add \"learn promises\"</code> — the note lands in <code>notes.txt</code> in the current folder, one line per run. Check with <code>Get-Content notes.txt</code> (PowerShell) or <code>type notes.txt</code> (cmd).",
        "Run it wrong — <code>node notes.js</code> or <code>node notes.js remove x</code> — and the usage message appears; run it in a read-only folder and the catch prints the error code.",
        "Possible upgrades for practice: a \"list\" action that reads the file back with <code>fs.readFile</code>, and a \"clear\" action that unlinks it — the write/append/delete trio, all through the same CLI."
      ],
      run: "node notes.js add \"learn promises\"",
      output: `note saved: learn promises`
    }
  ],
  keyPoints: [
    "writeFile overwrites (or creates), appendFile adds to the end (or creates), unlink deletes — and only unlink fails with ENOENT when the file is missing.",
    "The journal's 16_grade-check.js reads argv[5]/argv[6], so it needs three dummy arguments; count indices from your first typed value and prefer argv[2], argv[3]....",
    "Raw argv strings compare surprisingly: \"20\" >= 18 works via coercion, but junk becomes NaN and every NaN comparison is false — convert and validate with Number()/Number.isNaN().",
    "The CLI skeleton: parse process.argv → validate → do one asynchronous operation → report success or err.code from a single .catch.",
    "console.log adds a space between arguments — \"sorry \" plus a name prints two spaces; watch spacing in string concatenation too."
  ],
  practice: `
    <p>Extend <code>notes.js</code> into a two-action tool: <code>node notes.js add \"text\"</code>
    appends (as shown) and <code>node notes.js list</code> reads <code>notes.txt</code> back with
    <code>fs.readFile</code> and prints it — with its own <code>.catch</code> for the
    \"file not created yet\" case. Then run the full journal trio in order on one file:
    <code>03_EX4.js</code> → <code>04_EX5_appendfiles.js</code> → <code>05_EX6_deletefile.js</code>,
    and once more starting at the delete to see ENOENT appear.</p>
  `,
  quiz: [
    {
      q: "You run node 16_grade-check.js Raju 95 and it prints \"Raju\" but no grade. What is the cause and the fix?",
      options: [
        "The Number() conversion is broken; remove it",
        "The file reads argv[5] and argv[6], but name and mark are at argv[2] and argv[3] — change the indices",
        "Marks above 90 are not supported",
        "The file can never print a grade for Raju"
      ],
      answer: 1,
      why: "With only two typed arguments, argv[5] and argv[6] are undefined; Number(undefined) is NaN, so no comparison branch matches. Re-index to argv[2]/argv[3] (as in example 5) or pad with three dummy arguments."
    },
    {
      q: "node notes.js add \"learn promises\" runs and nothing is written to notes.txt — instead the catch prints \"EACCES\". What happened?",
      options: [
        "Promises cannot write files",
        "The text contained a quote character that erased the file",
        "EACCES means permission denied — the operating system refused the write (e.g. a read-only folder); err.code let you diagnose it",
        "appendFile only works with numbers"
      ],
      answer: 2,
      why: "EACCES (and its Windows cousin EPERM) is the OS-level \"you may not write here\" error. The promise rejected, the single .catch received the error object, and printing err.code gave you the diagnosis in one word — exactly why one catch at the end is enough."
    }
  ],
  sources: [
    "https://nodejs.org/api/fs.html#fspromisesappendfile-path-data-options",
    "https://nodejs.org/api/fs.html#fsunlink-path-callback"
  ]
});
