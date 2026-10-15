window.COURSE_LESSONS.push({
  id: "w03-error-handling",
  file: "022",
  unit: 1,
  week: 3,
  title: "Exception handling: try, catch, finally",
  kicker: "Unit I · Week 3 · Lesson 6 of 6",
  minutes: 18,
  objectives: [
    "Wrap risky code in try/catch/finally and say exactly when each block runs",
    "Explain why an error inside an async callback escapes a try/catch written around the scheduling call",
    "Handle errors the Node way: error-first callbacks, per-callback try/catch, and a process-level safety net"
  ],
  intro: `
    <p>Week 2 taught you the first half of Node's error story: every <code>fs.readFile</code> callback
    receives an <code>err</code> parameter and you check it first. This lesson adds the second half —
    the language-level tools <code>try</code>, <code>catch</code> and <code>finally</code> — and then shows
    the trap that catches every beginner: <strong>an error thrown inside an async callback is not covered
    by a try/catch around the call that scheduled it</strong>.</p>
    <p>Honest note first: your Week 3 folder contains no try/catch file at all. The lab's exception-handling
    exercise (<code>EX7.js</code>, a <code>div(a, b)</code> function with try/catch/finally) was filed with
    the Week 4 material — you can read it at
    <code>sorted_files/04_Week-04_Promises-FS-CLI/06_EX7.js</code>. The three Week 3 files below
    (<code>08_app.js</code>, <code>03_Question1.js</code>, <code>04_Question2.js</code>) are the async
    programs that have <em>no</em> protection, so we start there and add it.</p>
  `,
  theory: [
    `
      <h3>What an exception is</h3>
      <p>An <strong>exception</strong> is an error that <em>stops</em> the current function and hands
      control back up the call stack looking for someone who is prepared to deal with it. You
      <strong>throw</strong> one yourself with <code>throw new Error("message")</code>, or let built-in
      operations throw their own (<code>JSON.parse("{oops")</code>,
      <code>undefined.property</code>, <code>10 / 0</code> is <em>not</em> an error in JavaScript — it
      quietly gives <code>Infinity</code>).</p>
      <p>If nobody catches an exception, Node prints the error and its <strong>stack trace</strong> (which
      function called which, line by line) and the whole process exits with code 1. In a server that means
      every connected user is dropped — which is why the next two blocks matter.</p>
    `,
    `
      <h3>try, catch, finally</h3>
      <pre class="diagram">                        ┌── runs first ────────────────────────────┐
   try {                 │  normal work  ───────────▶ no error      │
                         │  throw new Error("boom") ──▶ JUMPS OUT   │
                         └───────────────┬──────────────────────────┘
                                         │  (only if something threw)
   catch (err) {  ◀──────────────────────┘   you get the Error object
        console.log(err.message);
   }
   finally {      ◀───────────────────────────────────────────────────┐
        console.log("cleanup");     runs ALWAYS: on success, on error, │
   }                                                    even on return ┘
   program continues here — an uncaught exception never reaches this line</pre>
      <ul>
        <li><strong>try</strong> — the block whose work might fail. Nothing else belongs inside it; keep
        it small so you know what failed.</li>
        <li><strong>catch (err)</strong> — runs only when something inside <code>try</code> threw. The
        parameter is the error itself: <code>err.message</code>, <code>err.stack</code>.</li>
        <li><strong>finally</strong> — always runs afterwards, whether there was an error or not. It is
        for cleanup: closing a file, closing a connection, logging "program finished".</li>
        <li>Catching means the program <em>keeps going</em>: after the catch block, the next lines execute
        normally instead of the process dying.</li>
      </ul>
    `,
    `
      <h3>The async trap: callbacks run outside your try/catch</h3>
      <p>Here is the part that surprises everyone. This code is <strong>not</strong> protected:</p>
      <pre class="diagram">  try {
      setTimeout(() => {
          throw new Error("boom");   // this runs LATER, in another turn
      }, 100);
  } catch (e) {                      // this try/catch is long gone by then
      console.log("never happens");
  }</pre>
      <p>The <code>try</code> block finishes microseconds after the timer is <em>registered</em>. By the time
      the callback throws, there is nothing on the stack left to catch it — Node reports an
      <strong>uncaught exception</strong> and exits with code 1. Three defensible fixes, in increasing
      order of last resort:</p>
      <ol>
        <li>Put <code>try/catch/finally</code> <em>inside</em> the callback, where the error actually
        happens (example 6 below).</li>
        <li>Use the error-first convention: never throw for expected failures, pass them to the callback —
        that is what <code>08_app.js</code>'s <code>if (err)</code> does.</li>
        <li><code>process.on("uncaughtException", fn)</code> as a global safety net, so the process
        survives (example 7). Real servers log the error and shut down cleanly instead of running on in an
        unknown state — use it deliberately, not as a substitute for 1 and 2.</li>
      </ol>
      <p>Next week you will meet the Promise version of all of this — <code>.catch()</code> and
      <code>.finally()</code> are the same two words doing the same two jobs for async results.</p>
    `
  ],
  examples: [
    {
      title: "The error-first callback: Node's async way of saying \"it failed\"",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/08_app.js",
      lang: "javascript",
      code: `
//this is async file reading

const fs = require('fs');

console.log("reading file.....");

fs.readFile('test2.txt', "utf-8", (err, data)=>{
    if(err){
        console.log("file note found");
    }
    console.log(data);
});

console.log("program continuess")
`,
      explain: [
        "The callback signature <code>(err, data)</code> is the error-first convention: the first parameter is either <code>null</code> or an Error.",
        "In this repository the fixture was renamed to <code>10_test2.txt</code>, so <code>test2.txt</code> is never found and the <code>if(err)</code> branch prints.",
        "<strong>Second bug:</strong> there is no <code>return</code> after the error log, so execution falls through to <code>console.log(data)</code> and prints <code>undefined</code>. One <code>return;</code> fixes it.",
        "Notice the two synchronous lines print first — the callback only runs after the stack empties (Lesson 1)."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/08_app.js",
      output: `reading file.....
program continuess
file note found
undefined`
    },
    {
      title: "Lab Question 1 — an async program with zero error handling",
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
        "This is your own working answer to lab question 1 — and it is perfectly fine as far as it goes.",
        "But look for the protection: there is no <code>try</code>, no <code>catch</code>, no <code>err</code> check anywhere in the file.",
        "If either callback threw (a typo'd variable, a null property), the process would die with an uncaught exception — the sync <code>console.log</code> around it could not help.",
        "Example 4 shows what would happen; example 6 is this same shape with the missing protection added."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/03_Question1.js",
      output: `program started
the program is running
this is after 3 seconds`
    },
    {
      title: "Lab Question 2 — three unprotected timers",
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
        "Three independent callbacks, each one a place where an exception can be born.",
        "A try/catch in the main script would not cover any of them: by the time they run, the main script has already finished.",
        "Remember from Lesson 018: this file prints shortest-delay first (1, 2, 5 seconds) regardless of registration order."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/04_Question2.js",
      output: `this is after 1 seconds
this is after 2 seconds
this is after 5 seconds`
    },
    {
      title: "try / catch / finally doing its three jobs",
      from: "new",
      lang: "javascript",
      code: `
function divide(a, b) {
  try {
    if (b === 0) throw new Error("cannot divide by 0");
    console.log("result =", a / b);
  } catch (err) {
    console.log("caught:", err.message);
  } finally {
    console.log("finally: always runs");
  }
}

divide(10, 2);
divide(5, 0);
console.log("program keeps going");
`,
      explain: [
        "Save as <code>try-catch-demo.js</code>. It is the same shape as the journal's own EX7 exercise (a division helper that validates its inputs), which lives in the Week 4 folder.",
        "First call succeeds: <code>try</code> finishes, <code>catch</code> is skipped, <code>finally</code> still runs.",
        "Second call throws inside <code>try</code>: control jumps straight to <code>catch</code>, prints the message, then <code>finally</code> runs anyway.",
        "Because the error was caught, <code>program keeps going</code> prints — without the try/catch, that line would never be reached."
      ],
      run: "node try-catch-demo.js",
      output: `result = 5
finally: always runs
caught: cannot divide by 0
finally: always runs
program keeps going`
    },
    {
      title: "An uncaught error inside a timer crashes the process",
      from: "new",
      lang: "javascript",
      code: `
console.log("start");

setTimeout(() => {
  throw new Error("boom inside the timer");
}, 100);

console.log("end");
`,
      explain: [
        "Save as <code>uncaught-timer.js</code> and run it — this is the exact failure mode of examples 2 and 3.",
        "Both synchronous lines print, then Node prints the error, its stack trace and the version, and exits with code 1 (you can check with <code>echo $?</code> or <code>$LASTEXITCODE</code>).",
        "The stack trace names <code>Timeout._onTimeout</code>: the throw happened inside a timer callback, on a turn of the event loop where nothing can catch it.",
        "The file path and line numbers in the output will be your own."
      ],
      run: "node uncaught-timer.js",
      output: `<your-file>:4
  throw new Error("boom inside the timer");
  ^

Error: boom inside the timer
    at Timeout._onTimeout (<your-file>:4:9)
    at listOnTimeout (node:internal/timers:635:17)
    at process.processTimers (node:internal/timers:571:7)

Node.js v24.19.0`
    },
    {
      title: "The fix: try/catch INSIDE the callback",
      from: "new",
      lang: "javascript",
      code: `
function safeTimer(label, ms) {
  setTimeout(() => {
    try {
      console.log(label + " fired");
      JSON.parse("{oops"); // something that can go wrong
    } catch (err) {
      console.log("caught in " + label + ": input was not valid JSON");
    } finally {
      console.log(label + ": cleanup done");
    }
  }, ms);
}

safeTimer("timer 1s", 1000);
safeTimer("timer 2s", 2000);
safeTimer("timer 5s", 5000);
`,
      explain: [
        "Save as <code>safe-timers.js</code>. The try/catch sits <em>inside</em> the arrow function, so it is on the stack at the moment the bad line runs — the only place it can help.",
        "All three timers survive their failure and the program runs to the end: the 5-second timer still fires even though the 1-second one already blew up.",
        "This is the repaired version of lab question 2 — same three delays, now with the protection the original lacks.",
        "The <code>finally</code> proves it: cleanup runs for every timer, failed or not."
      ],
      run: "node safe-timers.js",
      output: `timer 1s fired
caught in timer 1s: input was not valid JSON
timer 1s: cleanup done
timer 2s fired
caught in timer 2s: input was not valid JSON
timer 2s: cleanup done
timer 5s fired
caught in timer 5s: input was not valid JSON
timer 5s: cleanup done`
    },
    {
      title: "Last resort: process.on(\"uncaughtException\") as a safety net",
      from: "new",
      lang: "javascript",
      code: `
process.on("uncaughtException", (err) => {
  console.log("safety net caught:", err.message);
});

console.log("script starts");

setTimeout(() => {
  throw new Error("boom");
}, 50);

setTimeout(() => console.log("second timer still runs"), 100);
`,
      explain: [
        "Save as <code>safety-net.js</code>. Remove the handler and the output matches example 4 — process dies at 50 ms, the 100 ms timer never runs.",
        "With the handler, Node delivers the error to your function instead of dying, so the second timer still runs.",
        "This is a <em>global</em> catch: it catches everything, everywhere, which also means the program's state may be half-broken — log, then decide whether to exit.",
        "Prefer examples 6 and 5 (per-callback try/catch, error-first callbacks); reserve the net for truly unexpected failures."
      ],
      run: "node safety-net.js",
      output: `script starts
safety net caught: boom
second timer still runs`
    }
  ],
  keyPoints: [
    "throw new Error(...) stops the current function; if nobody catches it, Node prints the stack and exits with code 1.",
    "catch runs only on failure, finally runs always — it is for cleanup.",
    "A try/catch around setTimeout() does NOT protect code inside the callback: the callback runs on a later turn of the loop.",
    "Put try/catch inside the callback, or pass failures through the error-first (err, data) convention.",
    "process.on('uncaughtException') is a global safety net, not a substitute for handling errors where they happen."
  ],
  practice: `
    <p>Take <code>sorted_files/03_Week-03_Event-Loop-Async/08_app.js</code> and make it correct:
    add <code>return;</code> after the error log, and make the message say \"file not found\". Then copy
    <code>04_Question2.js</code> to a new file and wrap the body of every timer callback in
    <code>try/catch/finally</code>, printing <code>cleanup</code> from the <code>finally</code> — you are
    rebuilding example 6 with the lab's own delays (1000, 2000, 5000 ms).</p>
  `,
  quiz: [
    {
      q: "When does a finally block run?",
      options: [
        "Only if an error was thrown",
        "Only when no error occurred",
        "Always — on success, on failure, and even if you return from inside try",
        "Only inside asynchronous callbacks"
      ],
      answer: 2,
      why: "finally exists for cleanup, so it must not care whether the try block succeeded. In the divide example it prints after both the successful call and the caught one."
    },
    {
      q: "A setTimeout callback throws and nothing catches it. What happens?",
      options: [
        "Nothing — errors thrown in timers are silently ignored",
        "Only that callback is skipped; the program continues normally",
        "The whole Node process crashes with an uncaught exception and exit code 1",
        "The error is forwarded to the err parameter of the last fs.readFile callback"
      ],
      answer: 2,
      why: "Nothing is on the stack to catch it, so Node prints the stack trace and terminates — exactly what uncaught-timer.js shows. The fixes are a try/catch inside the callback, an error-first callback, or a process-level handler."
    }
  ],
  sources: [
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch",
    "https://nodejs.org/api/process.html#process_event_uncaughtexception",
    "https://nodejs.org/api/fs.html#fsreadfile-path-options-callback"
  ]
});
