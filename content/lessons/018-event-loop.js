window.COURSE_LESSONS.push({
  id: "w03-event-loop",
  file: "018",
  unit: 1,
  week: 3,
  title: "The event loop, phase by phase",
  kicker: "Unit I · Week 3 · Lesson 2 of 6",
  minutes: 20,
  objectives: [
    "Describe what the event loop does and why a single-threaded language needs one",
    "List the loop's phases in order and say which API belongs to each",
    "Predict output for puzzles that mix plain statements, nextTick, timers and setImmediate"
  ],
  intro: `
    <p>In Week 2 an <code>fs.readFile()</code> callback ran long after the line that scheduled it, and last
    lesson you proved the same for <code>setTimeout(fn, 0)</code>. Something had to be running those
    callbacks after your script ended — and something had to decide whether a timer or an
    <code>immediate</code> goes first. That something is the <strong>event loop</strong>, the heartbeat of
    every Node program.</p>
    <p>We will open your notes file <code>09_notes.txt</code>, draw the loop phase by phase, and then answer
    the lab's favourite question: <em>what output do you expect?</em></p>
  `,
  theory: [
    `
      <h3>One thread, one loop, many queues</h3>
      <p>Your JavaScript has exactly one thread, so it can only run one callback at a time. When your script
      finishes, callbacks are still waiting: timers that have not fired yet, file reads in progress, sockets
      with data arriving. The <strong>event loop</strong> is the small piece of C code (inside libuv, the
      library bundled with Node) that keeps the process alive and, every time the call stack is empty, asks:
      <em>what work is ready?</em> — then runs the next callback and repeats.</p>
      <pre class="diagram">  your JS code          event loop               waiting work
  ------------          ---------               ------------
  console.log(...)  ──▶ stack runs it now
  setTimeout(fn,0)  ──▶ registers fn ────────▶ [ timer queue ]
  script ends  ──────▶ stack empty ──────────▶ loop wakes up:
                                                 1) anything due?  ─▶ run one callback
                                                 2) stack empty again? ─▶ repeat
                                                 3) nothing left? ─▶ process exits</pre>
      <p>Two consequences you already met in Lesson 1: your synchronous lines always finish first, and a
      program exits as soon as the loop finds no pending work (that is why <code>setInterval</code> without
      <code>clearInterval</code> runs forever).</p>
    `,
    `
      <h3>The phases: where each callback lives</h3>
      <p>One lap of the loop is not a single step. Node goes through named <strong>phases</strong>, each with
      its own queue of callbacks, always in the same order:</p>
      <pre class="diagram">             ┌──────────────────────────────────────────────────┐
        ┌────│ 1. timers          setTimeout / setInterval      │
        │    ├──────────────────────────────────────────────────┤
        │    │ 2. pending callbacks  OS-level callbacks (rare)  │
        │    ├──────────────────────────────────────────────────┤
        │    │ 3. idle / prepare    internal only               │
        │    ├──────────────────────────────────────────────────┤
  loop  │    │ 4. poll              I/O callbacks: fs, net,     │
        │    │                      incoming connections       │
        │    ├──────────────────────────────────────────────────┤
        │    │ 5. check             setImmediate               │
        │    ├──────────────────────────────────────────────────┤
        │    │ 6. close callbacks   socket.on("close") etc.     │
        │    └──────────────────────────────────────────────────┘
        │
        └── after each phase (and after each single callback):
              1) drain the process.nextTick() queue completely
              2) drain the Promise (.then) microtask queue completely
             ...then move to the next phase</pre>
      <ul>
        <li><strong>timers</strong> — callbacks whose delay has expired.</li>
        <li><strong>poll</strong> — results of file reads and network events (this is where your Week 2
        <code>fs.readFile</code> callbacks run).</li>
        <li><strong>check</strong> — the <code>setImmediate</code> phase.</li>
        <li><strong>close</strong> — last-words callbacks such as a socket closing.</li>
      </ul>
      <p>Note the small queues drained in between: <code>process.nextTick()</code> and Promise
      <code>.then()</code> callbacks are <em>microtasks</em> — they jump ahead of every phase, and the
      nextTick queue always empties before the Promise queue.</p>
    `,
    `
      <h3>Your notes' priority list</h3>
      <p>The lab's own cheat-sheet (<code>09_notes.txt</code>) records the running order from highest to
      lowest priority. It is the single most useful line of the whole week:</p>
      <pre class="diagram">  priority (highest → lowest)

    process.nextTick()   ┐
                         ├─ microtasks: run before any phase moves on
    promise.then()       ┘

    setTimeout()         ┐
                         ├─ timed callbacks: run in their own phase
    setImmediate()       ┘

    Close callback       ── the last phase of the lap</pre>
      <div class="note"><p><strong>Honest caveat about <code>setTimeout(0)</code> vs
      <code>setImmediate()</code>:</strong> the last two lines above are <em>not</em> a guarantee. Which one
      runs first depends on how long the process took to start — run the same puzzle several times and the
      last two lines can swap. The first three (nextTick → promise → timed callbacks) are stable.</p></div>
      <p>Your other notes file, <code>18_notes_5.txt</code>, adds the three stages of a Promise
      (pending, fulfilment, reject) — remember that <code>promise.then()</code> sits second in this
      priority list; Week 4 is entirely about promises.</p>
    `
  ],
  examples: [
    {
      title: "The lab cheat-sheet: async, concurrency, priority",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/09_notes.txt",
      lang: "text",
      code: `
1. Asyncronous
Concurrency and asyncronous  coding in node js

points for asyncronous.
->> async coding it allows the peogram to start an operation and continue
executing other statements without waiting for that operation to finish

adv.
better performance
it doesnt block the programs
usefull for file handling, databases, web servers, api's etc.

2.Concurrency

->>
means progress on multiple task
during the same period time

3.priority
(highest to lowest)

process.nextTick()
promise.then()
setTimeout()
setImmediate()
Close callback

note for difference between setTimeout and setImmediate

setTimeout execute after a delay as it accepts a delay perameter
in setImmediate there is no delay parameter
`,
      explain: [
        "Reproduced verbatim from the journal, spelling mistakes and all — this is the priority list every lab question is graded against.",
        "<code>process.nextTick()</code> beats everything: it runs right after the current operation, before any phase of the loop moves on.",
        "<code>setTimeout</code> versus <code>setImmediate</code>: the timeout accepts a delay parameter, the immediate has none — it just means \"the next loop turn\".",
        "The three lab questions at the bottom of the file are the ordering exercises from Lessons 1 and 2."
      ]
    },
    {
      title: "Lab Question 1: sync line, 0 ms timer, 3 s timer",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/03_Question1.js",
      lang: "javascript",
      code: `
console.log("program started");


setTimeout(()=>{
console.log("the program is running")
},0);

setTimeout(()=>{
console.log("this is after 3 seconds")
},3000);
`,
      explain: [
        "The journal's answer to lab question 1: \"program started\", \"program running\", \"program finished after three seconds\".",
        "Even the 0 ms timer waits until the synchronous line has run — so <code>program started</code> is always first.",
        "The 3000 ms timer fires last, which is why the whole script takes about 3 seconds to exit."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/03_Question1.js",
      output: `program started
the program is running
this is after 3 seconds`
    },
    {
      title: "Lab Question 2: three timers must fire shortest-first",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/04_Question2.js",
      lang: "javascript",
      code: `
setTimeout(()=>{
console.log("this is after 5 seconds")
},5000);

setTimeout(()=>{
console.log("this is after 2 seconds")
},2000);

setTimeout(()=>{
console.log("this is after 1 seconds")
},1000);
`,
      explain: [
        "Registration order (5, 2, 1) is deliberately wrong; firing order follows the delays: 1, 2, 5.",
        "There is no synchronous output at all, so the first line appears only after 1000 ms.",
        "Ask yourself before running: does registering the slowest timer first change anything? No — the timers phase picks whichever delay has expired."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/04_Question2.js",
      output: `this is after 1 seconds
this is after 2 seconds
this is after 5 seconds`
    },
    {
      title: "The full priority list in one program",
      from: "new",
      lang: "javascript",
      code: `
console.log("1: main script");

setImmediate(() => console.log("5: setImmediate (check phase)"));
setTimeout(() => console.log("4: setTimeout (timers phase)"), 0);

process.nextTick(() => console.log("2: process.nextTick"));
Promise.resolve().then(() => console.log("3: promise.then"));

console.log("6: end of main script");
`,
      explain: [
        "Save as <code>priority.js</code>. It is <code>09_notes.txt</code> written as runnable code.",
        "Lines 1 and 6 are synchronous, so they print first and last of the sync group.",
        "Then the microtasks in priority order: <code>process.nextTick</code> before <code>promise.then</code>.",
        "Then the timed callbacks: timers phase (setTimeout) before check phase (setImmediate).",
        "On some machines the last two lines swap — that is the caveat from the theory, not a mistake in your file."
      ],
      run: "node priority.js",
      output: `1: main script
6: end of main script
2: process.nextTick
3: promise.then
4: setTimeout (timers phase)
5: setImmediate (check phase)`
    },
    {
      title: "Nested timers: each lap of the loop, one callback",
      from: "new",
      lang: "javascript",
      code: `
console.log("start");

setTimeout(() => {
  console.log("timeout 1");
  setTimeout(() => console.log("nested timeout"), 0);
}, 0);

process.nextTick(() => console.log("tick"));

console.log("end");
`,
      explain: [
        "Save as <code>nested-timers.js</code> and predict the five lines before running.",
        "<code>tick</code> is a microtask: it runs the moment the synchronous code ends, before any timer.",
        "A timer registered <em>from inside</em> a timer callback cannot run in the same lap — it is queued for a future lap, which is why <code>nested timeout</code> comes last.",
        "The program then has no work left and exits cleanly."
      ],
      run: "node nested-timers.js",
      output: `start
end
tick
timeout 1
nested timeout`
    },
    {
      title: "What output do you expect? (nextTick vs timers vs immediate)",
      from: "new",
      lang: "javascript",
      code: `
console.log("A");

setTimeout(() => console.log("B"), 0);

process.nextTick(() => console.log("C"));

setImmediate(() => console.log("D"));

console.log("E");
`,
      explain: [
        "Save as <code>event-loop-puzzle.js</code>. Sync lines first: A then E.",
        "<code>C</code> is a nextTick, so it jumps ahead of every queued timer.",
        "Between <code>B</code> (timers phase) and <code>D</code> (check phase) the race is real: run it five times — on the machine where this book was written, D won four runs out of five and B once.",
        "A result that flips is not a bug in your code; it is the loop's start-up timing, exactly as the note in the theory warns."
      ],
      run: "node event-loop-puzzle.js",
      output: `A
E
C
D
B`
    }
  ],
  keyPoints: [
    "The event loop keeps the process alive and picks the next callback whenever the call stack is empty.",
    "One lap = timers → pending → idle/prepare → poll → check → close, and the process exits when no work remains.",
    "process.nextTick() and Promise .then() are microtasks: they are drained before any phase moves on, nextTick first.",
    "setImmediate belongs to the check phase; fs.readFile callbacks belong to the poll phase.",
    "setTimeout(0) vs setImmediate has no guaranteed winner — never build logic on that order."
  ],
  practice: `
    <p>Take the lab question in <code>09_notes.txt</code>: write a program that prints
    <code>program started</code>, <code>program running</code> and <code>program finished after three
    seconds</code>. Type your predicted order as a comment above the file, then run it. Finally, add one
    <code>process.nextTick</code> and one <code>setImmediate</code> line to the same file and re-order your
    prediction using the priority diagram — the cheat-sheet is allowed, exams are not.</p>
  `,
  quiz: [
    {
      q: "After the main script finishes, which of these runs FIRST?",
      options: [
        "setTimeout(fn, 0)",
        "setImmediate(fn)",
        "process.nextTick(fn)",
        "the socket close callback"
      ],
      answer: 2,
      why: "The journal's priority list is process.nextTick() → promise.then() → setTimeout() → setImmediate() → close callback. nextTick drains before everything else."
    },
    {
      q: "setImmediate(fn) runs its callback in which phase of the event loop?",
      options: ["timers", "poll", "check", "close callbacks"],
      answer: 2,
      why: "check is the setImmediate phase. Timers live in the timers phase, fs/network results in poll, and socket.on('close') in the close phase."
    }
  ],
  sources: [
    "https://nodejs.org/api/timers.html",
    "https://docs.libuv.org/en/v1.x/design.html",
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop"
  ]
});
