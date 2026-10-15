window.COURSE_LESSONS.push({
  id: "w03-blocking-vs-nonblocking",
  file: "017",
  unit: 1,
  week: 3,
  title: "Blocking vs non-blocking execution",
  kicker: "Unit I · Week 3 · Lesson 1 of 6",
  minutes: 16,
  objectives: [
    "Explain what blocking and non-blocking mean for Node's single JavaScript thread",
    "Predict the console output of a program that mixes plain statements with timers",
    "Prove with your own hands that readFileSync waits while readFile does not"
  ],
  intro: `
    <p>In Week 2 you used <code>fs.readFile()</code> and the raw <code>http</code> module. Both times you
    passed Node a function and it ran that function <em>later</em>, without waiting for it — and nobody
    explained why that hand-over is even necessary. Week 3 opens the hood: this is the hardest theory week
    of Unit I, and it starts with the question that makes everything else click — what is the difference
    between <strong>blocking</strong> and <strong>non-blocking</strong> code?</p>
    <p>We will read three real programs from your journal, learn to predict their output line by line, and
    only then move on to the machine that makes those predictions come true: the event loop (Lesson 2).</p>
  `,
  theory: [
    `
      <h3>Blocking: the queue stops until you are served</h3>
      <p>Node runs your JavaScript on <strong>one thread</strong> — one lane of execution, one thing at a
      time. A <strong>blocking</strong> (synchronous) call is a function call that does not return until the
      work is completely finished. While it runs, that single lane is occupied: no other JavaScript of yours
      executes, no timers fire, no callbacks run.</p>
      <p>The <code>fs</code> module you met in Week 2 has both flavours. <code>fs.readFileSync(path)</code>
      reads the file and only then hands you the data, so the next line of your program waits. It is simple
      and fine for small startup files (like reading <code>package.json</code>), but deadly inside a web
      server that must answer many users at once.</p>
      <ul>
        <li><strong>Blocking example:</strong> <code>const data = fs.readFileSync("a.txt", "utf-8");</code></li>
        <li>Line 2 of your file does not run until <code>a.txt</code> has been read from the disk.</li>
        <li>If the disk is slow (or the file is huge), your whole program stalls at that line.</li>
      </ul>
    `,
    `
      <h3>Non-blocking: take a ticket and keep working</h3>
      <p>A <strong>non-blocking</strong> (asynchronous) call hands the actual work to Node's background
      systems and returns <em>immediately</em>. You keep coding; when the work finishes, Node calls the
      function you supplied — the <strong>callback</strong> — with the result.</p>
      <p>Your journal's own notes file defines it well: asynchronous coding "allows the program to start an
      operation and continue executing other statements without waiting for that operation to finish". The
      analogy is a counter with a ticket machine:</p>
      <pre class="diagram">  BLOCKING — one customer is served before the counter moves

     you ──▶ counter ──▶ [ wait ... wait ... ] ──▶ data in your hand
                                 │
                    nobody else (not even your own
                    next line of code) can move

  NON-BLOCKING — take a ticket, sit down, the kitchen calls you

     you ──▶ ticket #7 ──▶ you walk away, script continues
                               kitchen prepares the order in the background
                               ... 2 seconds later ...
     "ticket #7!" ──▶ your callback runs with the result</pre>
      <p>The benefits your notes list are exactly the ones you will feel in Week 4 and beyond: better
      performance, nothing blocks the program, and the pattern is what makes file handling, databases, web
      servers and APIs possible on a single thread. In Node, <strong>concurrency</strong> means
      "progress on multiple tasks during the same period of time" — not several threads, but one thread
      juggling many half-finished operations.</p>
    `,
    `
      <h3>Reading output as a timeline</h3>
      <p>The examples below are ordering exercises: the book and your lab both ask "what output do you
      expect?" before you are allowed to run anything. Three rules are enough to answer every time:</p>
      <ol>
        <li>Every ordinary statement (<code>console.log</code>, assignments, <code>require</code>) runs
        top-to-bottom, <strong>now</strong>, on the thread.</li>
        <li><code>setTimeout(fn, ms)</code> does <strong>not</strong> run <code>fn</code> now. It only
        <em>registers</em> a task and returns; <code>fn</code> runs later, after the delay has passed
        <em>and</em> the synchronous code has finished.</li>
        <li>Registered tasks fire in order of their <strong>delay</strong>, not in order of registration.</li>
      </ol>
      <pre class="diagram">  synchronous lines (run immediately)      timers registered (run later)
  ----------------------------------     ------------------------------
  console.log("1")                       Task A  4000 ms
  setTimeout(Task A, 4000)  ──register──▶ Task B  3000 ms
  setTimeout(Task B, 3000)  ──register──▶ Task C  2000 ms
  setTimeout(Task C, 2000)  ──register──▶ Task D  1000 ms
  setTimeout(Task D, 1000)  ──register──▶
  console.log("done dona done")

  call stack empty ──▶ 1000 ms: Task D ──▶ 2000 ms: Task C ──▶ 3000 ms: Task B ──▶ 4000 ms: Task A
                              (shortest delay wins, even though it was registered last)</pre>
    `
  ],
  examples: [
    {
      title: "Four tasks, four delays (the classic concurrency question)",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/01_concurrency.js",
      lang: "javascript",
      code: `
console.log("1");

setTimeout(()=>{
    console.log("Task A");
},4000 );

setTimeout(()=>{
    console.log("Task B");
},3000);

setTimeout(()=>{
    console.log("Task C");
},2000);

setTimeout(()=>{
    console.log("Task D");
},1000);

console.log("done dona done");
`,
      explain: [
        "Lines 1 and the last line are ordinary statements — they run immediately, in order.",
        "Each <code>setTimeout</code> only <em>registers</em> a task; it never pauses the program for 4000 ms.",
        "Timers fire by delay, not by registration order: <code>Task D</code> (1000 ms) beats <code>Task A</code> (4000 ms) even though A was registered first.",
        "The whole program takes about 4 seconds — 4000 ms for the last timer — then Node has no work left and exits."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/01_concurrency.js",
      output: `1
done dona done
Task D
Task C
Task B
Task A`
    },
    {
      title: "setTimeout(fn, 0) still runs last",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/02_concurrency2.js",
      lang: "javascript",
      code: `
console.log("1");

setTimeout(()=>{
    console.log("2");
},3000 );

console.log("3");
console.log("4");

setTimeout(()=>{
    console.log("6");
},0 );

console.log("5");


//all three set timeout start immedtly
//the program does not wait for 1 timer to finish before starting another
`,
      explain: [
        "The <code>0</code> delay does not mean \"run immediately\" — it means \"run on the next turn, after the synchronous lines are done\".",
        "So the sync lines print 1, 3, 4, 5 first, then the 0 ms callback prints 6, and only then the 3000 ms callback prints 2.",
        "The journal comment is right: the timers all start together; the program does not wait for one timer to finish before starting another."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/02_concurrency2.js",
      output: `1
3
4
5
6
2`
    },
    {
      title: "The smallest possible async program",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/05_test.js",
      lang: "javascript",
      code: `
console.log("program started")



setTimeout(() => {
    console.log("task completed")
}, 2000);



console.log("task continues")

`,
      explain: [
        "Predict it before you run it: two sync lines, then one delayed line.",
        "<code>task continues</code> prints before <code>task completed</code> because the timer only fires after the script and 2000 ms are done.",
        "This file is also cross-referenced in Week 6 (syllabus 6.2, blocking vs non-blocking revisited) — the same idea, two weeks apart."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/05_test.js",
      output: `program started
task continues
task completed`
    },
    {
      title: "A busy synchronous call delays a 0 ms timer",
      from: "new",
      lang: "javascript",
      code: `
console.log("1: script starts");

setTimeout(() => {
  console.log("3: timer callback (delay was 0 ms)");
}, 0);

// busy-wait 300 ms — this is what a SLOW SYNCHRONOUS function does
const end = Date.now() + 300;
while (Date.now() < end) {}

console.log("2: sync work finished");
`,
      explain: [
        "Save as <code>blocking-demo.js</code> and run it: the timer's delay was 0 ms, yet it prints only after line 2.",
        "The <code>while</code> loop is a stand-in for any blocking call (<code>readFileSync</code>, a heavy calculation, <code>JSON.parse</code> of a huge file): it occupies the single thread.",
        "Watch your terminal: \"2\" appears after roughly 300 ms and \"3\" right after — the timer could not fire while the thread was busy.",
        "Rule of thumb: anything that makes your thread wait makes every timer wait too."
      ],
      run: "node blocking-demo.js",
      output: `1: script starts
2: sync work finished
3: timer callback (delay was 0 ms)`
    },
    {
      title: "readFileSync vs readFile, measured side by side",
      from: "new",
      lang: "javascript",
      code: `
const fs = require("fs");

fs.writeFileSync("demo.txt", "hello node");

console.log("A: before any read");

const syncData = fs.readFileSync("demo.txt", "utf-8"); // BLOCKS until the read finishes
console.log("B: readFileSync got", syncData.length, "chars");

fs.readFile("demo.txt", "utf-8", (err, data) => {
  console.log("D: readFile callback got", data.length, "chars");
});

console.log("C: readFile() handed the work over — script continues");
`,
      explain: [
        "Save as <code>sync-vs-async.js</code>. It creates its own fixture first, so it runs anywhere.",
        "<code>readFileSync</code> blocks: line B is printed only after the data is in memory, and it prints before C.",
        "<code>readFile</code> is non-blocking: it returns instantly, so line C prints before the callback D.",
        "D is the same shape as the <code>fs.readFile</code> callbacks you wrote in Week 2 — that callback is the price of not blocking."
      ],
      run: "node sync-vs-async.js",
      output: `A: before any read
B: readFileSync got 10 chars
C: readFile() handed the work over — script continues
D: readFile callback got 10 chars`
    },
    {
      title: "What output do you expect? (mini ordering exercise)",
      from: "new",
      lang: "javascript",
      code: `
console.log("first");

setTimeout(() => console.log("fourth"), 100);

setTimeout(() => console.log("third"), 0);

console.log("second");
`,
      explain: [
        "Say the order out loud before running it — this is exactly the lab's style of question.",
        "<code>first</code> and <code>second</code> are synchronous, so they come first in source order.",
        "Between the two timers, the smaller delay wins (0 ms before 100 ms), so <code>third</code> precedes <code>fourth</code> even though it was registered later.",
        "Expected output: <code>first, second, third, fourth</code>."
      ],
      run: "node order-puzzle.js",
      output: `first
second
third
fourth`
    }
  ],
  keyPoints: [
    "Node runs JavaScript on one thread — blocking that thread stops everything, including timers.",
    "Blocking (sync) calls finish before the next line runs; non-blocking (async) calls hand work over and return immediately.",
    "setTimeout(fn, 0) does not run \"now\": it runs after the current synchronous code has finished.",
    "Timers fire in order of delay, not in order of registration.",
    "Node's concurrency is one thread juggling many in-progress operations — not many threads."
  ],
  practice: `
    <p>Open <code>sorted_files/03_Week-03_Event-Loop-Async/01_concurrency.js</code> and give the four
    tasks delays of 1000, 4000, 2000 and 3000 ms (so Task A becomes the fastest). Write down the output you
    expect, run it with <code>node</code>, and check. Then take <code>05_test.js</code>, change the delay
    to 0 and add one more <code>console.log</code> <em>after</em> the <code>setTimeout</code> call — the
    printed order should surprise nobody who has done the first exercise.</p>
  `,
  quiz: [
    {
      q: "Which of these calls BLOCKS the Node thread until the work is finished?",
      options: [
        "fs.readFile(path, callback)",
        "fs.readFileSync(path)",
        "setTimeout(fn, 100)",
        "setImmediate(fn)"
      ],
      answer: 1,
      why: "fs.readFileSync runs the read on the main thread and returns only when the data is ready — nothing else can run meanwhile. The other three hand the work over and return immediately."
    },
    {
      q: "What does this print?  console.log(\"A\"); setTimeout(() => console.log(\"B\"), 0); console.log(\"C\");",
      options: ["A, B, C", "A, C, B", "B, A, C", "C, A, B"],
      answer: 1,
      why: "A and C are synchronous and run first, in order. The timer callback B runs on a later turn of the event loop, even with a 0 ms delay."
    }
  ],
  sources: [
    "https://nodejs.org/api/fs.html",
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop"
  ]
});
