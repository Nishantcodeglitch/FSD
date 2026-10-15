window.COURSE_LESSONS.push({
  id: "w03-timers",
  file: "020",
  unit: 1,
  week: 3,
  title: "Timers: setTimeout, setInterval, setImmediate, nextTick",
  kicker: "Unit I · Week 3 · Lesson 4 of 6",
  minutes: 16,
  objectives: [
    "Choose between setTimeout, setInterval, setImmediate and process.nextTick for a given job",
    "Cancel scheduled work with clearTimeout and clearInterval before it fires",
    "Explain why \"0 ms\" means \"after the current code\", and why setImmediate has no delay parameter"
  ],
  intro: `
    <p>Lesson 2 showed you where each scheduler lives in the event loop; this lesson is the hands-on tour of
    the four APIs themselves — the same callbacks you handed to <code>fs.readFile</code> and the
    <code>http</code> server in Week 2 are all scheduled by these functions.</p>
    <p>Your journal contains a file for each idea:
    <code>06_set_immediate.js</code>, <code>12_EX2_setinterval.js</code> and
    <code>07_set_time_out_readfile.js</code> — plus the lab question sheet in <code>14_note.txt</code>
    that asks you to build them. Timers are also the first place beginners meet a program that
    <em>refuses to exit</em>, so we will cover handles, cancellation and how Node decides it is done.</p>
  `,
  theory: [
    `
      <h3>The four schedulers at a glance</h3>
      <table>
        <thead><tr><th>API</th><th>Runs</th><th>Loop phase</th><th>Typical use</th></tr></thead>
        <tbody>
          <tr><td><code>setTimeout(fn, ms)</code></td><td>once, after at least <code>ms</code></td><td>timers</td><td>delay one task</td></tr>
          <tr><td><code>setInterval(fn, ms)</code></td><td>again every <code>ms</code>, forever</td><td>timers</td><td>polling, tickers</td></tr>
          <tr><td><code>setImmediate(fn)</code></td><td>once, next loop turn</td><td>check</td><td>hand control back after I/O</td></tr>
          <tr><td><code>process.nextTick(fn)</code></td><td>once, as soon as this turn ends</td><td>microtask queue</td><td>fire before anything else</td></tr>
        </tbody>
      </table>
      <p>All four take the callback as their first argument, and the timers accept extra arguments that are
      forwarded to the callback (Lesson 3). Each timer returns a <strong>handle</strong> — an object you can
      keep and cancel later.</p>
    `,
    `
      <h3>setTimeout vs setImmediate: the difference your notes record</h3>
      <p>The lab note is one sentence long, and it is right:</p>
      <blockquote><p>"setTimeout execute after a delay as it accepts a delay perameter — in setImmediate
      there is no delay parameter."</p></blockquote>
      <pre class="diagram">  setTimeout(fn, 500)
      ──▶ wait at least 500 ms AND for the call stack to be empty
      ──▶ then run fn in the TIMERS phase of some lap

  setImmediate(fn)
      ──▶ no delay parameter at all
      ──▶ run fn in the CHECK phase of the current/next lap
          (i.e. right after the poll phase has handled I/O)

  setTimeout(fn, 0)  vs  setImmediate(fn)
      ──▶ which one wins depends on how long the process took to
          start: run it twice and the last two lines may swap</pre>
      <p>One warning about intervals: <code>setInterval</code> keeps scheduling work forever, so Node never
      decides there is "nothing left to do" and the process will not exit — your
      <code>12_EX2_setinterval.js</code> and <code>13_EX3.js</code> both need <kbd>Ctrl</kbd>+<kbd>C</kbd>.
      The cure is to keep the handle returned by <code>setInterval</code> and call
      <code>clearInterval(handle)</code> when you are done.</p>
    `,
    `
      <h3>\"0 ms\" is \"later\", not \"now\"</h3>
      <p>A delay of 0 does not bypass the event loop: the timer callback is queued in the timers phase and
      runs only after the synchronous code finishes. If your synchronous code blocks for 300 ms (Lesson 1's
      busy-wait), a 0 ms timer fires after roughly 300 ms. Node's own documentation is blunt about it: the
      callback "will likely not be invoked in precisely delay milliseconds" and no guarantee is made about
      ordering. Timers are for <em>approximate</em> delays, never for exact scheduling.</p>
    `
  ],
  examples: [
    {
      title: "setTimeout and setImmediate side by side",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/06_set_immediate.js",
      lang: "javascript",
      code: `
setTimeout(()=>{
console.log("timeout")
},1000);


setImmediate(()=> console.log("instant noodle"));

setTimeout(()=>{
console.log(" 2 timeout")
},0);


setImmediate(()=> console.log("instant noodle"));

setTimeout(()=>{
console.log(" 3 timeout")
},0);


setImmediate(()=> console.log("instant noodle"));
`,
      explain: [
        "Three immediates and three timeouts are registered; only the 1000 ms timeout is genuinely slow.",
        "In this run all three <code>instant noodle</code> lines printed before the 0 ms timeouts — the check phase beat the timers phase on this machine.",
        "Re-run it a few times: if the two 0 ms timeouts jump ahead, that is the start-up race the theory warned about, not a mistake in the file.",
        "The 1000 ms <code>timeout</code> always comes last — a real delay always loses to no delay."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/06_set_immediate.js",
      output: `instant noodle
instant noodle
instant noodle
 2 timeout
 3 timeout
timeout`
    },
    {
      title: "setInterval: three repeating tasks at three speeds",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/12_EX2_setinterval.js",
      lang: "javascript",
      code: `
//SET INTERVAL
//it is used to repetedly execute a funtion
//diff between settime and set interval
//in setinterval it will excute after the given time like every xx seconds mentioned..

setInterval(() => {
    console.log("2")
},1000);

setInterval(() => {
    console.log("+")
},2000);

setInterval(() => {
    console.log("3")
},3000);
`,
      explain: [
        "Three intervals, no <code>clearInterval</code> anywhere: the program runs until you press <kbd>Ctrl</kbd>+<kbd>C</kbd>.",
        "<code>\"2\"</code> appears every second, <code>\"+\"</code> every two, <code>\"3\"</code> every three — the output below is the first 7 seconds.",
        "When several callbacks become due at the same moment (2 s, 4 s, 6 s), their relative order is the registration order, not something to build logic on.",
        "This is the lab's ex3/ex4 pattern: repeated work without writing a loop yourself."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/12_EX2_setinterval.js",
      output: `2
+
2
3
2
+
2
2
3
+
2`
    },
    {
      title: "A timeout that starts a file read (timers + fs together)",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/07_set_time_out_readfile.js",
      lang: "javascript",
      code: `
console.log("it has begunnnn")

setTimeout(()=>{
const fs = require('fs');

console.log("reading file.....");

fs.readFile('test2.txt', "utf-8", (err, data)=>{
    if(err){
        console.log("file note found");
    }
    console.log(data);
});
},5000);
`,
      explain: [
        "Two phases of waiting in one program: 5000 ms of timer, then the file read's own callback.",
        "<code>require('fs')</code> is inside the callback — legal, and it shows a timer callback can do real work, not just print.",
        "In this repository the fixture was renamed to <code>10_test2.txt</code>, so <code>test2.txt</code> is never found: you get the error branch, then <code>undefined</code>.",
        "<strong>Second bug:</strong> there is no <code>return</code> after the error log, so <code>console.log(data)</code> runs anyway and prints <code>undefined</code>. Add <code>return;</code> to fix it (Lesson 6 covers this pattern properly).",
        "The original lab copy of the fixture survives in <code>drive-download-*/Nishant_2408023/LAB3/test2.txt</code> — copy it next to the file to see real content."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/07_set_time_out_readfile.js",
      output: `it has begunnnn
reading file.....
file note found
undefined`
    },
    {
      title: "Cancelling work: clearTimeout and clearInterval",
      from: "new",
      lang: "javascript",
      code: `
const t1 = setTimeout(() => console.log("this never prints"), 1000);
clearTimeout(t1);
console.log("t1 cancelled");

let count = 0;
const iv = setInterval(() => {
  count++;
  console.log("tick", count);
  if (count === 3) {
    clearInterval(iv);
    console.log("interval stopped");
  }
}, 500);
`,
      explain: [
        "Save as <code>cancel-timers.js</code>. <code>setTimeout</code> returns a handle; hand it to <code>clearTimeout</code> and the callback is dropped.",
        "The interval keeps its handle in <code>iv</code> and clears itself after the third tick — without that, the program would never exit.",
        "Clearing an already-fired or already-cleared timer is harmless: Node just does nothing.",
        "Watch the total runtime: about 1500 ms (3 ticks × 500 ms), then Node finds no pending work and exits on its own."
      ],
      run: "node cancel-timers.js",
      output: `t1 cancelled
tick 1
tick 2
tick 3
interval stopped`
    },
    {
      title: "Chained timers: scheduling from inside a callback",
      from: "new",
      lang: "javascript",
      code: `
console.log("t=0: script starts");

setTimeout(() => {
  console.log("t=1000: first timeout");
  setTimeout(() => console.log("t=2000: chained timeout"), 1000);
}, 1000);

console.log("end of script");
`,
      explain: [
        "Save as <code>chained-timers.js</code>. The second timeout only exists once the first callback runs — timers can schedule more timers.",
        "Each chained timeout counts 1000 ms from the moment it was registered, so the lines land at roughly t=1000 and t=2000.",
        "A chain like this is how you write a repeating task by hand when you want each delay measured from the previous run instead of a fixed interval."
      ],
      run: "node chained-timers.js",
      output: `t=0: script starts
end of script
t=1000: first timeout
t=2000: chained timeout`
    },
    {
      title: "What output do you expect? (three delays, one race)",
      from: "new",
      lang: "javascript",
      code: `
console.log("A");

setTimeout(() => console.log("B: 50ms"), 50);
setTimeout(() => console.log("C: 0ms"), 0);
setTimeout(() => console.log("D: 10ms"), 10);

console.log("E");
`,
      explain: [
        "Predict it: sync lines first (A, E), then the timers in delay order — 0 ms, 10 ms, 50 ms.",
        "Registration order (50, 0, 10) is a decoy; the timers phase sorts by expiry.",
        "Unlike the setImmediate race, ordering <em>between different delays</em> is stable: run it ten times and you will get the same sequence every time."
      ],
      run: "node timer-puzzle.js",
      output: `A
E
C: 0ms
D: 10ms
B: 50ms`
    }
  ],
  keyPoints: [
    "setTimeout runs once after a delay, setInterval repeats, setImmediate runs with no delay parameter at all.",
    "Every scheduler takes the callback first; timers also forward extra arguments to it.",
    "Timers belong to the timers phase, setImmediate to the check phase, process.nextTick to the microtask queue.",
    "Keep the handle a timer returns and call clearTimeout/clearInterval to cancel — an interval without one never lets the process exit.",
    "0 ms means \"after the current synchronous code\", and timers promise approximation, not exact timing."
  ],
  practice: `
    <p>Copy <code>12_EX2_setinterval.js</code> to a new file and make it stop by itself: keep the handle
    returned by the first interval in a variable, count to 5 ticks, then call <code>clearInterval(handle)</code>
    and print <code>done</code>. Verify that the process now exits on its own — no <kbd>Ctrl</kbd>+<kbd>C</kbd>
    needed. Then fix <code>07_set_time_out_readfile.js</code> by adding <code>return;</code> inside the
    <code>if(err)</code> block and re-run it.</p>
  `,
  quiz: [
    {
      q: "Which scheduler repeats on its own until you cancel it?",
      options: [
        "setTimeout(fn, 1000)",
        "setImmediate(fn)",
        "setInterval(fn, 1000)",
        "process.nextTick(fn)"
      ],
      answer: 2,
      why: "setInterval keeps re-queueing its callback every delay ms. It is also the one that can keep a Node process alive forever — clear it with clearInterval."
    },
    {
      q: "What is the difference between setTimeout(fn, 0) and setImmediate(fn)?",
      options: [
        "None — they are two names for the same thing",
        "setTimeout accepts a delay parameter and runs in the timers phase; setImmediate has no delay parameter and runs in the check phase",
        "setImmediate runs synchronously, before console.log",
        "setTimeout only works inside a server"
      ],
      answer: 1,
      why: "That is exactly your journal's note: the timeout takes a delay, the immediate does not — it simply means \"the next loop turn, after poll\", i.e. the check phase."
    }
  ],
  sources: [
    "https://nodejs.org/api/timers.html",
    "https://nodejs.org/api/fs.html#fsreadfile-path-options-callback"
  ]
});
