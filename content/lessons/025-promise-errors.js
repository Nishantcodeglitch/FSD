window.COURSE_LESSONS.push({
  id: "w04-promise-errors",
  file: "025",
  unit: 1,
  week: 4,
  title: "Handling rejected promises",
  kicker: "Unit I · Week 4 · Lesson 3 of 6",
  minutes: 16,
  objectives: [
    "Explain what a rejection carries and where its reason comes from",
    "Predict how an error travels along a chain until it meets a .catch()",
    "Show why an unhandled rejection crashes modern Node, and fix it with .catch()"
  ],
  intro: `
    <p>Week 3's <code>try/catch/finally</code> lesson taught you to trap errors that happen
    <em>right now</em>, in synchronous code. Promises add a second kind: an error that happens
    <em>later</em>, delivered through a rejection. Today you learn to see that error coming, carry it
    down a chain, and — just as important — what happens when nobody bothers to listen.</p>
    <p>The journal's <code>06_EX7.js</code> gives us the synchronous baseline to compare against,
    <code>02_promise_1.js</code> hides an unused rejection branch, and <code>11_reading_file_promises.js</code>
    shows a real <code>ENOENT</code> error caught by a promise's <code>.catch</code>.</p>
  `,
  theory: [
    `
      <h3>A rejection is a value like any other</h3>
      <p>When a promise rejects, it carries a <strong>reason</strong> — any JavaScript value, usually a
      string or an <code>Error</code> object. The reason comes from the call
      <code>reject(reason)</code> inside the executor, or from a <code>throw</code> inside a
      <code>.then</code> handler. The <code>.catch(fn)</code> handler receives it as its argument,
      exactly like <code>.then</code> receives a fulfilled value.</p>
      <p>Compare the two error worlds you now know:</p>
      <table>
        <thead><tr><th>synchronous (Week 3)</th><th>asynchronous (Week 4)</th></tr></thead>
        <tbody>
          <tr><td><code>throw "message"</code></td><td><code>reject("message")</code> or a throw inside a handler</td></tr>
          <tr><td>caught by <code>catch (e) { ... }</code></td><td>caught by <code>.catch(e => ...)</code></td></tr>
          <tr><td>skips straight to catch / finally</td><td>skips remaining .then links, goes to first .catch</td></tr>
        </tbody>
      </table>
      <p>One crucial difference: a synchronous throw stops the function <em>immediately</em>. A
      rejection only reroutes the promise chain — the code after
      <code>new Promise(...)</code> in your main program keeps running as if nothing happened.</p>
    `,
    `
      <h3>Errors travel forward until something catches them</h3>
      <p>In a chain, a rejection skips every <code>.then</code> handler that follows and lands in the
      first <code>.catch</code>. It does not stop there forever, though: if the catch handler returns
      a value (or simply finishes normally), the promise <em>it</em> created becomes fulfilled, and any
      <code>.then</code> handlers after the catch run with that value. That is <strong>recovery</strong>
      — the standard way to give a chain a fallback answer.</p>
      <pre class="diagram">  promise ──reject──▶ then ✗ ──▶ then ✗ ──▶ catch ✓ ──▶ then ✓ (fallback flows on)
                                      (skipped)      (recovers)</pre>
      <p>And remember: a <code>throw</code> inside a <code>.then</code> handler is turned into a
      rejection of the promise that <code>.then</code> created — so ordinary validation logic inside
      a chain needs no special syntax, just a throw.</p>
    `,
    `
      <h3>Unhandled rejections: loud failures since Node 15</h3>
      <p>If a promise rejects and <em>no</em> <code>.catch</code> is ever attached anywhere, that is
      called an <strong>unhandled rejection</strong>. Older Node versions printed a deprecation
      warning and carried on; from Node 15 onwards the default behaviour is to
      <strong>crash the process</strong> with an <code>ERR_UNHANDLED_REJECTION</code> error and exit
      code 1. You will see the real crash message in the fourth example.</p>
      <p>This is deliberate: a silently swallowed async error is far more dangerous than a crash —
      imagine a bank server that "lost" a payment error. The lesson for you is a habit:
      <em>every</em> promise chain that can fail needs a <code>.catch</code> at the end. Even a
      <code>console.log</code> beats silence.</p>
    `
  ],
  examples: [
    {
      title: "The synchronous baseline: try/catch/finally from the journal",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/06_EX7.js",
      lang: "javascript",
      code: `
//using exeption handling devide to 2 numbers
function div(a, b) {
  try {
    if (isNaN(a) || isNaN(b)) {
      throw "Enter numbers only";
    }

    if (b == 0) {
      throw "the number can't be divided by 0";
    }

    console.log("results = ", a / b);
  } catch (error) {
    console.log("error", error);
  } finally {
    console.log("program finished");
  }
}


div(10, 2);

div(20,"all");
`,
      explain: [
        "Week 3 material, kept as the reference point: <code>throw</code> jumps to the <code>catch</code> block <em>in the same instant</em>, the <code>finally</code> block always runs.",
        "First call: 10/2 is fine, so \"results =  5\" prints. Second call: <code>isNaN(\"all\")</code> is true, the string is thrown, and the catch prints it.",
        "Notice a rejected promise works the same way conceptually — if/throw becomes if/reject, catch block becomes .catch handler — which is what the next examples show."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/06_EX7.js",
      output: `results =  5
program finished
error Enter numbers only
program finished`
    },
    {
      title: "The rejection branch hiding in 02_promise_1.js",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/02_promise_1.js",
      lang: "javascript",
      code: `
let marks = 45;

let promise = new Promise(function(resolve, reject){ 
    if (marks >= 35)
        resolve("pass");
    else
        reject("fail");
});

promise
.then(function(result){ 
    console.log(result);
})
.catch(function(error){
    console.log(error);
});
`,
      explain: [
        "As saved, <code>marks = 45</code> takes the resolve path and prints \"pass\" — the reject path is written but never taken.",
        "Change line 1 to <code>let marks = 30;</code> and rerun: the executor calls <code>reject(\"fail\")</code>, the .then handler is skipped entirely, and the .catch prints \"fail\".",
        "That if/resolve/else/reject shape is the promise version of the try/throw pattern in 06_EX7.js — same decision, delivered later."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/02_promise_1.js",
      output: `pass`
    },
    {
      title: "A real error caught: reading a file that does not exist",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/11_reading_file_promises.js",
      lang: "javascript",
      code: `
//reading a file in promises yo 
const fs = require('fs');
console.log("the data will be there in few sec.\\n\\n\\n");


setTimeout(() => {
    console.log(1)

}, 1000);


setTimeout(() => {
    console.log(2)

}, 2000);


setTimeout(() => {
    var promise = new Promise(function (resolve, reject) {
        fs.readFile('sample.txt', 'utf-8', (error, data) => {
            if (error) {
                return reject(error)

            }
            resolve(data);
        });
    });

    promise
        .then(result =>
            console.log(result)
        )

        .catch(error =>
            console.log(error)
        );
}, 3000);
`,
      explain: [
        "Delete (or rename) <code>sample.txt</code> in the folder you run from, then run this file: the <code>fs.readFile</code> callback receives an error, the wrapper calls <code>reject(error)</code>, and the promise's <code>.catch</code> prints the whole ENOENT error object.",
        "The <code>return reject(error)</code> line is the heart of it — without the <code>return</code>, <code>resolve(data)</code> would run with <code>data === undefined</code> and the error would be lost. Week 3's error-first rule again.",
        "With <code>sample.txt</code> present (run <code>03_EX4.js</code> first, or copy <code>19_sample.txt</code>) the same file prints the contents instead — one chain, two possible outcomes.",
        "The output below is the missing-file run. Stack details and the absolute path vary per machine; the <code>code: 'ENOENT'</code> line is the stable, checkable part."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/11_reading_file_promises.js",
      output: `the data will be there in few sec.



1
2
[Error: ENOENT: no such file or directory, open '...sample.txt'] {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'open',
  path: '...\\sample.txt'
}`
    },
    {
      title: "What an unhandled rejection does: Node crashes",
      from: "new",
      lang: "javascript",
      code: `
let p = new Promise(function (resolve, reject) {
  reject("boom");
});

p.then(function (r) {
  console.log(r);
});
// no .catch anywhere - Node 15+ kills the process
`,
      explain: [
        "Save as <code>unhandled.js</code> and run it on any Node from version 15 onwards: the promise rejects, the only .then is for success, and nothing handles the rejection.",
        "Node does not merely warn — it throws <code>UnhandledPromiseRejection</code>, prints a stack, and exits with code 1. (Verify with <code>echo $LASTEXITCODE</code> in PowerShell.)",
        "Fix by adding <code>p.catch(reason =&gt; console.log(\"caught:\", reason));</code> — one line turns a crash into a handled error.",
        "The exact stack lines differ between Node versions, but the <code>ERR_UNHANDLED_REJECTION</code> code is constant."
      ],
      run: "node unhandled.js",
      output: `node:internal/process/promises:392
      new UnhandledPromiseRejection(reason);
      ^

UnhandledPromiseRejection: This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). The promise rejected with the reason "boom".
    at throwUnhandledRejectionsMode (node:internal/process/promises:392:7)
    ...
  code: 'ERR_UNHANDLED_REJECTION'
}

Node.js v24.19.0

Exited with code 1`
    },
    {
      title: "A throw inside .then becomes a rejection",
      from: "new",
      lang: "javascript",
      code: `
Promise.resolve(0)
  .then(function (n) {
    if (n === 0) throw "cannot divide by zero";
    return 100 / n;
  })
  .then(function (result) { console.log("result:", result); })
  .catch(function (err) { console.log("caught:", err); });
`,
      explain: [
        "Save as <code>throw-in-then.js</code>. The handler throws a plain string — the promise created by the first <code>.then</code> becomes rejected with it.",
        "The second <code>.then</code> (the success step) is skipped, and the catch at the end receives the thrown string.",
        "Change the seed value to <code>Promise.resolve(4)</code> and the same file prints \"result: 25\" — the validation guard never fires.",
        "This means you can write ordinary if/throw validation inside chain handlers, reusing everything 06_EX7.js taught you."
      ],
      run: "node throw-in-then.js",
      output: `caught: cannot divide by zero`
    },
    {
      title: "Recovery: the catch hands the chain a fallback value",
      from: "new",
      lang: "javascript",
      code: `
Promise.reject("network down")
  .then(function (v) { console.log("success:", v); })
  .catch(function (err) {
    console.log("caught:", err);
    return "cached data";
  })
  .then(function (v) { console.log("after recovery:", v); })
  .finally(function () { console.log("always runs"); });
`,
      explain: [
        "Save as <code>recovery.js</code>. The rejection skips the first .then and is caught.",
        "The catch handler returns \"cached data\", so the promise <em>it</em> created fulfills — the .then after the catch runs with the fallback. The chain is back on the success road.",
        "<code>.finally</code> prints last regardless: fulfilled or rejected, cleanup runs.",
        "This is the pattern behind every \"offline mode\" you have ever seen in an app: fail, catch, serve something reasonable, keep going."
      ],
      run: "node recovery.js",
      output: `caught: network down
after recovery: cached data
always runs`
    }
  ],
  keyPoints: [
    "A rejection carries a reason value — from reject(reason) in the executor or a throw inside a .then handler.",
    "In a chain, a rejection skips the remaining .then links and lands in the first .catch; sync throw vs async reject are the same idea in two timeframes.",
    "A .catch that returns a value recovers the chain: downstream .then handlers run with the fallback.",
    "An unhandled rejection (no .catch anywhere) crashes Node 15+ with ERR_UNHANDLED_REJECTION and exit code 1.",
    "Every promise chain that can fail should end in a .catch — silence is worse than a crash."
  ],
  practice: `
    <p>Take <code>09_promise_using_ThenCatchFinally.js</code>, set <code>pass = false</code>, then
    delete the <code>.catch</code> block entirely and run it — watch Node crash with an
    <code>UnhandledPromiseRejection</code>. Restore the catch, add
    <code>return "result released"</code> to it, and insert one more <code>.then</code> after the catch
    that prints the value it receives. You have just written a recovering chain.</p>
  `,
  quiz: [
    {
      q: "A promise chain has .then, .then, .catch and the SECOND .then handler throws an Error. Which code runs?",
      options: [
        "The first .then handler runs again to compensate",
        "The catch handler receives the Error; the handlers between it and the throw are skipped",
        "Node crashes with ERR_UNHANDLED_REJECTION",
        "The throw is ignored — handlers cannot throw"
      ],
      answer: 1,
      why: "A throw inside a handler rejects the promise that .then created. The rejection travels forward, skipping the remaining success handlers, until the first .catch — which, being attached, also prevents the unhandled-rejection crash."
    },
    {
      q: "Why does an unhandled promise rejection kill a modern Node program while a forgotten error-first callback argument often did not?",
      options: [
        "Promises use more memory, so Node aborts to save it",
        "Callbacks never have errors",
        "Since Node 15 the default is to throw on unhandled rejections, making silent async failures impossible",
        "It only crashes in the REPL"
      ],
      answer: 2,
      why: "Old Node merely warned; from v15 the default --unhandled-rejections=throw mode raises UnhandledPromiseRejection (code ERR_UNHANDLED_REJECTION) and exits with status 1 — a deliberate choice to surface silent failures."
    }
  ],
  sources: [
    "https://nodejs.org/api/process.html#event-unhandledrejection",
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch"
  ]
});
