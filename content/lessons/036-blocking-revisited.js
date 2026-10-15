window.COURSE_LESSONS.push({
  id: "w06-blocking-revisited",
  file: "036",
  unit: 1,
  week: 6,
  title: "Blocking vs non-blocking, revisited",
  kicker: "Unit I · Week 6 · Lesson 2 of 4",
  minutes: 17,
  objectives: [
    "Explain why the event loop can be delayed but never paused or interrupted",
    "Predict how readFileSync and a CPU-heavy loop postpone timers and pending requests",
    "Move heavy computation to a worker thread so the main thread stays responsive"
  ],
  intro: `
    <p>In Week 5 your gateway and your streams did something quietly amazing: one thread, many
    clients, nothing waiting. In Week 3 you had already met the reason — the difference between
    blocking and non-blocking code — and predicted the output of small programs like
    <code>sorted_files/03_Week-03_Event-Loop-Async/05_test.js</code>.</p>
    <p>Syllabus 6.2 returns to that idea on purpose, one level deeper. This time the question is not
    "what prints first?" but <strong>what exactly happens inside Node while it waits</strong> — why
    <code>readFileSync</code> is far more expensive than "it reads a file", what a heavy loop does to
    your timers, and the tool Node ships for the jobs too big for the main thread: <strong>worker
    threads</strong>.</p>
  `,
  theory: [
    `
      <h3>The loop cannot be paused — only delayed</h3>
      <p>Recap the model from Week 3: your JavaScript runs on <strong>one thread</strong>, one call
      stack, one statement at a time. Around it spins the <strong>event loop</strong>, a plain
      <code>while</code> loop inside Node that keeps asking: <em>is any callback ready?</em> If yes, it
      runs that callback to completion; if no, it waits for the next timer, the next file read, the
      next request.</p>
      <p>The crucial detail the first pass skipped: the loop starts a callback only when the call stack
      is <strong>empty</strong>, and it cannot take a callback back once started. There is no
      preemption in JavaScript — no callback, timer or I/O completion can cut in halfway through your
      code. So the loop is never <em>paused</em>; it is simply <em>starved</em>, waiting for your
      code to finish.</p>
      <pre class="diagram">   your code runs here                ready callbacks wait here
   -----------------------  ------------------------------------------
   statements, loops,             timer queue     (setTimeout due)
   sync fs reads, JSON.parse      I/O queue       (fs.readFile finished)
   ── one at a time ──            poll queue      (new HTTP request)
                                        ▲
        event loop: while (true) ───────┘
        "stack empty? run the next ready callback, then ask again"</pre>
      <p>Consequence: a callback that takes 2 seconds delays <em>every</em> ready callback by 2 seconds.
      Not pauses the loop — starves it. Your program still "runs", it just does nothing else.</p>
    `,
    `
      <h3>readFileSync vs readFile: what each one actually costs</h3>
      <p>Week 2 showed you both functions; now the cost breakdown. <code>fs.readFileSync(path)</code>
      does the disk work <strong>on the main thread</strong> and only then returns: the whole event
      loop waits for the platter (or SSD), for the OS cache, for the antivirus. In a one-shot script
      that is fine — even nice, because you get the data as a plain variable on the next line. Inside a
      server, it is a tax paid on <em>every request</em>.</p>
      <p><code>fs.readFile(path, callback)</code> hands the disk work to Node's <strong>thread pool</strong>
      — a small set of helper threads (four by default) managed for Node by the C library libuv. The main
      thread returns to the event loop immediately, keeps answering requests, and libuv calls your
      callback when the bytes are in memory.</p>
      <ul>
        <li><strong>Ordering consequence:</strong> with <code>readFileSync</code> the next line sees the
        data; with <code>readFile</code> the next line runs <em>before</em> the data exists.</li>
        <li><strong>Error consequence:</strong> sync throws an exception you catch with
        <code>try/catch</code>; async delivers it as the <code>err</code> argument of the callback.</li>
        <li><strong>System consequence:</strong> sync file reads on a busy server show up as latency
        spikes for <em>other</em> users — you paid with somebody else's response time.</li>
      </ul>
      <p>Example 4 below proves the timer half of this claim: a 1000 ms timer cannot fire while a sync
      read holds the thread.</p>
    `,
    `
      <h3>CPU-heavy work: the loop you cannot interrupt</h3>
      <p>File reads are the polite kind of blocking, because libuv can do them elsewhere. The impolite
      kind is pure computation: a big <code>for</code> loop, a huge <code>JSON.parse</code>, image
      processing, encryption. Nothing can run it but the main thread, and nothing can interrupt
      it.</p>
      <p>So a loop that takes two seconds means: no timer fires, no file callback runs, no HTTP request
      is even accepted (the OS holds the connection in a queue, but Node does not look at it) — for two
      full seconds. Example 5 shows this with a 100 ms timer that ends up firing after roughly two
      seconds.</p>
      <blockquote>Your journal's Week 3 notes say asynchronous coding "allows the program to start an
      operation and continue executing other statements without waiting". True for I/O — and untrue
      the moment the operation is <em>your own arithmetic</em>. Node cannot spread one loop across
      threads for you.</blockquote>
    `,
    `
      <h3>Worker threads: give the heavy job its own lane</h3>
      <p>The fix is a real second thread. Node's built-in <code>worker_threads</code> module gives you
      a <strong>Worker</strong>: a separate JavaScript environment with its own event loop, its own
      call stack and its own copy of the memory. The main thread keeps running its loop; the worker
      crunches numbers; they talk by passing messages.</p>
      <pre class="diagram">   MAIN THREAD                      WORKER THREAD
   -----------                      -------------
   event loop spins     message     event loop spins
   timers, requests  ─── postMessage ──▶  the heavy loop
   never starved      ◀── onmessage ───  result sent back</pre>
      <ul>
        <li><code>isMainThread</code> lets one file play both roles (see example 6).</li>
        <li>Data passed with <code>workerData</code> / <code>postMessage</code> is <strong>copied</strong>,
        not shared — no accidental races, and a reason not to send huge objects.</li>
        <li>Trade-off: starting a worker costs a few milliseconds and each worker costs memory, so use
        them for work that takes tens of milliseconds or more — not for <code>a + b</code>.</li>
      </ul>
    `
  ],
  examples: [
    {
      title: "The file Week 6 points back to: two sync lines, one timer",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/05_test.js",
      lang: "javascript",
      code: `console.log("program started")



setTimeout(() => {
    console.log("task completed")
}, 2000);



console.log("task continues")

`,
      explain: [
        "This is the exact file syllabus 6.2 cross-references: Week 3 asked you to predict it, Week 6 asks you to explain <em>why</em>.",
        "The timer is registered, not run — the event loop cannot start its callback until the stack is empty and 2000 ms have passed.",
        "So the two synchronous lines print first, and <code>task completed</code> waits in the timer queue."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/05_test.js",
      output: `program started
task continues
task completed`
    },
    {
      title: "Your own Week 3 notes: async, concurrency, priority",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/09_notes.txt",
      lang: "text",
      code: `1. Asyncronous
Concurrency and asyncronous  coding in node js

points for asyncronous.
->> async coding it allows the peogram to start an operation and continue executing other statements
without waiting for that operation to finish

adv.
better performance
it doesnt block the programs
usefull for file handling, databases, web servers, api's etc.


2. Concurrency

->>
means progress on multiple task
during the same period time



3.priority
(highest to lowest)

process.nextTick()
promise.then()
setTimeout()
setImmediate()
Close callback`,
      explain: [
        "The definition is the whole lesson in one line: start an operation, keep executing other statements.",
        "The priority list is the order the event loop picks <em>ready</em> callbacks in — it does not change the rule from Week 3 that your synchronous lines still finish first.",
        "\"Useful for file handling, databases, web servers, APIs\" describes exactly what your Week 5 gateway was doing all along.",
        "Two of these four items (<code>process.nextTick</code> and <code>promise.then</code>) only ever run after your sync code ends — they can never interrupt a running loop either."
      ],
      run: "(a notes file — read it, nothing to execute)"
    },
    {
      title: "Async read inside a timer — and a filename that does not exist",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/07_set_time_out_readfile.js",
      lang: "javascript",
      code: `console.log("it has begunnnn")

setTimeout(()=>{
const fs = require('fs');

console.log("reading file.....");

fs.readFile('test2.txt', "utf-8", (err, data)=>{
    if(err){
        console.log("file note found");
    }
    console.log(data);
});
},5000);`,
      explain: [
        "Two waits stacked: the callback starts 5000 ms late, and <code>readFile</code> itself is non-blocking inside that callback.",
        "<strong>Spot the bug:</strong> the code asks for <code>test2.txt</code>, but the fixture in this folder is named <code>10_test2.txt</code>. The journal file is run as-is, so the read fails.",
        "Because there is no <code>return</code> after the error log, execution continues to <code>console.log(data)</code> and prints <code>undefined</code> — the classic async error-handling slip.",
        "Fix: rename the fixture to <code>test2.txt</code>, or change the path to <code>10_test2.txt</code>."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/07_set_time_out_readfile.js",
      output: `it has begunnnn
reading file.....
file note found
undefined`
    },
    {
      title: "A sync read blocks the timer too (measured, 5 MB fixture)",
      from: "new",
      lang: "javascript",
      code: `const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "big.txt");
fs.writeFileSync(file, "x".repeat(5 * 1024 * 1024)); // our own 5 MB fixture

setTimeout(() => console.log("T: 1000 ms timer fired"), 1000);

fs.readFileSync(file); // BLOCKS the thread while the disk is read
console.log("A: readFileSync done — the timer had to wait for it");

fs.readFile(file, (err, data) => {
  console.log("B: readFile callback done — timers were free the whole time");
});

console.log("C: script continues straight away");`,
      explain: [
        "Save as <code>sync-blocks-timers.js</code>. It creates its own fixture first, so it runs on any machine.",
        "Watch the order: <strong>A</strong> prints first because <code>readFileSync</code> occupies the thread — the 1000 ms timer cannot start during that.",
        "<strong>C</strong> prints next (line after the sync read), then <strong>B</strong>: <code>readFile</code> did its disk work on a libuv helper thread while the main thread was already free.",
        "<strong>T</strong> comes last — the timer's delay is measured from registration, but its callback only runs when the stack is empty.",
        "Expected order: <code>A, C, B, T</code>. Two functions, same file, completely different effect on everything else in the program."
      ],
      run: "node sync-blocks-timers.js",
      output: `A: readFileSync done — the timer had to wait for it
C: script continues straight away
B: readFile callback done — timers were free the whole time
T: 1000 ms timer fired`
    },
    {
      title: "A CPU-heavy loop starves a 100 ms timer",
      from: "new",
      lang: "javascript",
      code: `console.log("1: script starts");

setTimeout(() => {
  console.log("4: timer fired — its delay was only 100 ms!");
}, 100);

// a CPU-heavy job: this loop hogs the single thread for roughly 2 seconds
let checksum = 0;
for (let i = 0; i < 5e8; i++) {
  checksum += i;
  if (i % 3 === 0) checksum -= 1;
}

console.log("2: heavy loop done, checksum =", checksum);
console.log("3: script ends — the timer is still waiting");`,
      explain: [
        "Save as <code>heavy-loop.js</code> and run it; the pause between lines 1 and 2 is visible to the naked eye.",
        "The timer was armed with a 100 ms delay <em>before</em> the loop, yet it prints last — nothing can interrupt 500 million iterations.",
        "This is \"starvation\", not a crash: the event loop was never paused, it simply had no chance to run until the stack emptied.",
        "The checksum value varies with Node's version; the <strong>order</strong> of the four lines does not.",
        "Do the experiment yourself: halve the loop bound and watch line 4 move up."
      ],
      run: "node heavy-loop.js",
      output: `1: script starts
2: heavy loop done, checksum = 124999999522369660
3: script ends — the timer is still waiting
4: timer fired — its delay was only 100 ms!`
    },
    {
      title: "The fix: the same heavy loop in a worker thread",
      from: "new",
      lang: "javascript",
      code: `const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");

if (isMainThread) {
  console.log("main: arming a 100 ms timer, then starting a worker");

  setTimeout(() => console.log("main: timer fired on time (main thread was never blocked)"), 100);

  const w = new Worker(__filename, { workerData: 2e7 });
  w.on("message", (msg) => console.log("main: got message ->", msg));
  w.on("exit", (code) => console.log("main: worker exited with code", code));
} else {
  const n = workerData;
  const t0 = Date.now();
  let sum = 0;
  for (let i = 0; i < n; i++) sum += Math.sqrt(i) % 7;
  parentPort.postMessage("worker: " + n + " iterations done in " + (Date.now() - t0) + " ms");
}`,
      explain: [
        "Save as <code>main-worker.js</code> — one file, two roles: <code>isMainThread</code> is <code>true</code> the first time it runs, <code>false</code> inside the worker.",
        "<code>new Worker(__filename, ...)</code> tells Node to start a second thread running <em>this same file</em>, with <code>workerData</code> carrying the loop bound.",
        "The 100 ms timer fires on time — compare with the previous example, where the identical style of loop delayed it past two seconds.",
        "<code>parentPort.postMessage(...)</code> sends a <em>copy</em> of the result back; <code>w.on(\"message\")</code> receives it on the main thread.",
        "This is the pattern for image processing, compression, big sorts, encryption — anything that would otherwise starve your server."
      ],
      run: "node main-worker.js",
      output: `main: arming a 100 ms timer, then starting a worker
main: timer fired on time (main thread was never blocked)
main: got message -> worker: 20000000 iterations done in 266 ms
main: worker exited with code 0`
    }
  ],
  keyPoints: [
    "The event loop is never paused — it is starved: a callback runs to completion before any other can start.",
    "<code>readFileSync</code> does disk work on the main thread; <code>readFile</code> uses libuv's thread pool and calls you back.",
    "Sync I/O in a server is paid for by other users' response time; sync errors throw, async errors arrive as <code>err</code>.",
    "Pure CPU work cannot be offloaded automatically — a two-second loop delays every timer and every request by two seconds.",
    "worker_threads gives heavy work its own thread and event loop; the main loop keeps running, and results arrive by message.",
    "Use a worker for work that takes tens of milliseconds or more — starting one costs a little time and memory."
  ],
  practice: `
    <p>Take <code>heavy-loop.js</code> and measure it: wrap the loop in <code>console.time("loop")</code> /
    <code>console.timeEnd("loop")</code>. Then run the same bound inside the worker example and compare
    the two numbers — plus the position of the 100 ms timer line in each. Finally, arm <em>three</em>
    timers (100, 500, 1000 ms) before the loop in <code>sync-blocks-timers.js</code> and predict their
    firing order.</p>
  `,
  quiz: [
    {
      q: "Which of these stops the event loop from running anything else while it executes?",
      options: [
        "fs.readFile(path, callback)",
        "A two-second for-loop written in your own code",
        "setTimeout(fn, 2000)",
        "new Worker(pathToFile)"
      ],
      answer: 1,
      why: "JavaScript has no preemption: your own synchronous code runs until it ends. readFile hands disk work to a helper thread, setTimeout only registers a callback, and a Worker runs in a different thread entirely."
    },
    {
      q: "In the CPU-heavy example, what is the exact output order?",
      options: [
        "1, 4, 2, 3 — the timer keeps its 100 ms delay",
        "1, 2, 4, 3 — the timer fires before the script ends",
        "1, 2, 3, 4 — the timer waits until the stack is empty",
        "4, 1, 2, 3 — timers always run first"
      ],
      answer: 2,
      why: "Lines 1–3 are synchronous, so they run in order; the timer's callback can only be started once the stack is empty, which is after the heavy loop and line 3. Its 100 ms delay had already passed — it just had nowhere to run."
    }
  ],
  sources: [
    "https://nodejs.org/api/worker_threads.html",
    "https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback",
    "https://docs.libuv.org/en/v1.x/threadpool.html"
  ]
});
