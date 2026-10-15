window.COURSE_LESSONS.push({
  id: "w04-cli-args",
  file: "027",
  unit: 1,
  week: 4,
  title: "Command-line arguments with process.argv",
  kicker: "Unit I · Week 4 · Lesson 5 of 6",
  minutes: 15,
  objectives: [
    "Explain what process.argv contains and where the user's arguments begin",
    "Read one or several command-line values and convert them to numbers safely",
    "Write a small CLI program that reports on the arguments it was given"
  ],
  intro: `
    <p>So far your Node programs decided everything themselves. This lesson hands the decisions to
    whoever types the command: <strong>command-line arguments</strong>, the values you write after the
    file name — <code>node app.js Raju 20</code>. The journal's notes
    (<code>18_noteslab6</code>) define them plainly: <em>"values passed to a Node.js program when it is
    executed from the command line; they allow the user to provide input without modifying the
    code"</em>.</p>
    <p>Five journal files explore the idea, from inspecting the raw <code>process.argv</code> array in
    <code>12_command-line.js</code> up to a name/age/post printer and a two-number sum. Nothing here
    uses promises yet — that combination is the capstone, next lesson.</p>
  `,
  theory: [
    `
      <h3>argv: the argument vector</h3>
      <p>Your notes unpack the name: <em>arg</em> = argument, <em>v</em> = vector (an old word for
      array). Whenever you run <code>node something.js a b c</code>, Node stores the whole invocation
      in the global <code>process.argv</code> array — <code>process</code> being the object that always
      describes the running program (you already met <code>process</code> in Week 1's <code>node -v</code>
      world).</p>
      <pre class="diagram">  $ node 13_cmd-arg2.js Raju 20

  process.argv =
    [ 0 ]  path to node        (e.g. C:\\...\\node.exe)
    [ 1 ]  path to the script  (e.g. C:\\...\\13_cmd-arg2.js)
    [ 2 ]  "Raju"              &lt;-- the FIRST user argument
    [ 3 ]  "20"                &lt;-- the SECOND user argument</pre>
      <p>The trap every beginner hits: <strong>the first two slots are never yours</strong>. Indices
      0 and 1 belong to Node and the script; your arguments start at index 2. That is why
      <code>12_command-line.js</code> prints <code>process.argv[2]</code> to show "the second element
      of the array" — it means the element at index 2, your first argument.</p>
    `,
    `
      <h3>Everything arrives as a string</h3>
      <p><code>process.argv</code> holds exactly what was typed, and what was typed is text. Typing
      <code>node sum.js 10 25</code> does not produce the numbers 10 and 25 — it produces the strings
      <code>"10"</code> and <code>"25"</code>. JavaScript's <code>+</code> on two strings concatenates,
      so <code>argv[2] + argv[3]</code> gives <code>"1025"</code>, not 35. Every numeric CLI program —
      including the journal's <code>14_cmd-arg3sum.js</code> — must convert with
      <code>Number(value)</code> first.</p>
      <p>Two related details:</p>
      <ul>
        <li><strong>Spaces split arguments.</strong> <code>node 13_cmd-arg2.js New Delhi 20</code>
        would give THREE arguments — \"New\", \"Delhi\", \"20\". Quote it: <code>"New Delhi"</code>.</li>
        <li><strong>Garbage converts to <code>NaN</code></strong> (Not a Number). Check for it with
        <code>Number.isNaN()</code> before doing arithmetic, or your sum prints
        <code>NaN</code>.</li>
      </ul>
    `,
    `
      <h3>Programs of any length: slice(2) and usage messages</h3>
      <p>For a fixed number of arguments you index directly: <code>argv[2]</code>, <code>argv[3]</code>,
      <code>argv[4]</code> — exactly what the journal's files do. For a <em>variable</em> number, cut
      off the first two entries with <code>process.argv.slice(2)</code> and work with the resulting
      list: check its <code>length</code>, map every item through <code>Number</code>, and so on.</p>
      <p>Good CLI programs also fail politely. If the arguments are missing or malformed, print a
      one-line <strong>usage</strong> message telling the user how to run the program, instead of
      crashing with <code>undefined</code> or printing <code>NaN</code>. You will write several today.</p>
    `
  ],
  examples: [
    {
      title: "Look inside process.argv",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/12_command-line.js",
      lang: "javascript",
      code: `
console.log(process.argv);

console.log("================only the second element of the array==================");
console.log(process.argv[2]);
console.log("================only the third element of the array==================")
console.log(process.argv[3]);
`,
      explain: [
        "Run it with two arguments and the first console.log dumps the whole array: Node's path, the script's path, then your \"Raju\" and \"20\".",
        "The first two entries are machine-specific — yours will show your own Node install and repo path. That is exactly why real programs never use <code>argv[0]</code> or <code>argv[1]</code>.",
        "\"the second element\" means <code>argv[2]</code>: index 2 is your FIRST typed argument, index 3 the second."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/12_command-line.js Raju 20",
      output: `[ '/usr/local/bin/node',
  '/home/student/FSD_JOURNAL/sorted_files/04_Week-04_Promises-FS-CLI/12_command-line.js',
  'Raju',
  '20' ]
================only the second element of the array==================
Raju
================only the third element of the array==================
20`
    },
    {
      title: "Name and age from the command line",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/13_cmd-arg2.js",
      lang: "javascript",
      code: `
let name = process.argv[2];
let age = process.argv[3];
console.log("Name: ", name);
console.log("Age: ", age);
`,
      explain: [
        "The smallest useful CLI program: take the two user arguments into variables and print them.",
        "Notice <code>console.log(\"Name: \", name)</code> — console.log separates multiple arguments with a space, which is why the output shows two spaces after each colon.",
        "<code>age</code> is still the string \"20\" here; the next two examples show why that difference matters."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/13_cmd-arg2.js Raju 20",
      output: `Name:  Raju
Age:  20`
    },
    {
      title: "Sum two arguments (with the Number() conversion)",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/14_cmd-arg3sum.js",
      lang: "javascript",
      code: `
let num1 = Number(process.argv[2]);
let num2 = Number(process.argv[3]);
console.log("the sum of the two number is: ",num1+num2);
`,
      explain: [
        "The line that makes this arithmetic work is <code>Number(...)</code> around each argument — without it, <code>\"10\" + \"25\"</code> would print \"1025\" (see the last example of this lesson).",
        "Typing <code>node 14_cmd-arg3sum.js 10 25</code> gives 35; typing non-numbers gives <code>NaN</code>, which the file does not check for — a gap our final examples fix."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/14_cmd-arg3sum.js 10 25",
      output: `the sum of the two number is:  35`
    },
    {
      title: "Three arguments and a template literal: name, age, post",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/15_nameagepost.js",
      lang: "javascript",
      code: `
let name = process.argv[2];
let age = Number(process.argv[3]);
let post = process.argv[4];

console.log(\`The Name is :\${name}\\nThe age is:\${age}\\nThe post is \${post}\`);
`,
      explain: [
        "Mixed handling in one file: <code>age</code> is converted with <code>Number()</code> while name and post stay strings — convert only what you will compute with.",
        "The template literal uses \\n escapes, so one console.log prints three lines; \${...} placeholders inject the variables.",
        "Post indices grow with the arguments: 2, 3, 4 — always count from your first typed value, never from 0."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/15_nameagepost.js Raju 20 cricketer",
      output: `The Name is :Raju
The age is:20
The post is cricketer`
    },
    {
      title: "Any number of arguments: sum them all",
      from: "new",
      lang: "javascript",
      code: `
let args = process.argv.slice(2);

if (args.length < 2) {
  console.log("usage: node sum.js <num1> <num2> ...");
} else {
  let numbers = args.map(Number);
  let total = numbers.reduce(function (sum, n) { return sum + n; }, 0);
  console.log("sum of", numbers.length, "numbers =", total);
}
`,
      explain: [
        "Save as <code>sum.js</code>. <code>process.argv.slice(2)</code> cuts off Node and script paths — everything left is the user's arguments, however many there are.",
        "<code>args.map(Number)</code> converts the whole list at once; <code>reduce</code> folds it into one running total (starting from 0).",
        "Run it with <code>node sum.js 10 20 30</code> or with ten numbers — no code changes needed. Run it with nothing and the usage message appears instead of a crash."
      ],
      run: "node sum.js 10 20 30",
      output: `sum of 3 numbers = 60`
    },
    {
      title: "The string trap, demonstrated in six lines",
      from: "new",
      lang: "javascript",
      code: `
// command-line values are always strings
let a = process.argv[2];   // typed 10
let b = process.argv[3];   // typed 25

console.log("without Number():", a + b);
console.log("with Number():", Number(a) + Number(b));
`,
      explain: [
        "Save as <code>string-trap.js</code> and run <code>node string-trap.js 10 25</code>.",
        "First line: <code>\"10\" + \"25\"</code> is string concatenation → \"1025\". Second line: converted to numbers first → 35.",
        "If your CLI ever prints a bizarre concatenated number or <code>NaN</code>, this file is the diagnosis: argv values need <code>Number()</code> before any arithmetic."
      ],
      run: "node string-trap.js 10 25",
      output: `without Number(): 1025
with Number(): 35`
    }
  ],
  keyPoints: [
    "process.argv is an array of everything typed to run the program; it is called the argument vector.",
    "Indices 0 and 1 are Node's path and the script's path — user arguments start at index 2.",
    "All arguments arrive as strings; use Number(value) before arithmetic, and check Number.isNaN() for junk input.",
    "Spaces split arguments — quote values that contain them; process.argv.slice(2) gives you just the user's arguments.",
    "Good CLI programs print a one-line usage message when arguments are missing instead of crashing."
  ],
  practice: `
    <p>Write <code>greet.js</code> that takes a name and a number of exclamation marks:
    <code>node greet.js Raju 3</code> prints <code>Raju!!!</code>. Convert the count with
    <code>Number()</code>, guard against a missing argument with a usage line, then try it with no
    arguments, with junk (<code>node greet.js Raju many</code>) and with a quoted name
    (<code>node greet.js "New Delhi" 2</code>).</p>
  `,
  quiz: [
    {
      q: "You run node cmd.js Priya 21. Which process.argv entries hold \"Priya\" and \"21\"?",
      options: [
        "argv[0] and argv[1]",
        "argv[1] and argv[2]",
        "argv[2] and argv[3]",
        "argv[3] and argv[4]"
      ],
      answer: 2,
      why: "argv[0] is Node's own path and argv[1] is the script's path; the first typed value sits at argv[2] and the next at argv[3]."
    },
    {
      q: "node sum.js 10 25 runs let num1 = process.argv[2]; let num2 = process.argv[3]; console.log(num1 + num2); — what is printed?",
      options: ["35", "1025", "NaN", "10 25"],
      answer: 1,
      why: "Arguments arrive as strings, and + on two strings concatenates: \"10\" + \"25\" === \"1025\". Wrapping each in Number() gives 35."
    }
  ],
  sources: [
    "https://nodejs.org/api/process.html#processargv"
  ]
});
