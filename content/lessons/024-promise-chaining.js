window.COURSE_LESSONS.push({
  id: "w04-promise-chaining",
  file: "024",
  unit: 1,
  week: 4,
  title: "Promise chaining with then/catch/finally",
  kicker: "Unit I · Week 4 · Lesson 2 of 6",
  minutes: 17,
  objectives: [
    "Explain what each .then() returns and how a returned value reaches the next .then()",
    "Build a multi-step chain where each step transforms the value",
    "Use .catch() and .finally() correctly in a chain and predict where they fire"
  ],
  intro: `
    <p>Last lesson you met the promise: an object that delivers a value later. The payoff arrives
    today, because promises — unlike bare callbacks — can be <em>chained</em>: each step hands its
    result to the next, flat instead of nested. This is the "relief" from Week 3's callback pyramids.</p>
    <p>The journal has three files for it: <code>03_EX4.js</code> (the callback-style
    <code>fs.writeFile</code> you already know — the "before" picture), <code>09_promise_using_ThenCatchFinally.js</code>
    (the full then/catch/finally trio from the lab's Program 3) and <code>10_Question1.js</code>
    (the login-check question from the same lab). We will also build chains that wait in sequence —
    something callbacks could never do neatly.</p>
  `,
  theory: [
    `
      <h3>What .then() really returns</h3>
      <p>Here is the fact that unlocks everything: <strong>every call to <code>.then()</code> returns a
      brand-new promise</strong>. If your handler function returns a plain value, the new promise
      becomes fulfilled with that value. If it returns another promise, the new promise
      <em>waits</em> for that promise and takes over its outcome. If the handler throws, the new
      promise rejects with whatever was thrown.</p>
      <p>So a chain is not one promise with callbacks bolted on — it is a relay of promises, each one
      fed by the return value of the previous handler. That is why <code>07_promise.js</code> printed
      10, 20, 120: each <code>.then</code> returned <code>result + something</code>, and the next
      <code>.then</code> received it.</p>
      <pre class="diagram">  promise(10) ──▶ then #1 ──▶ then #2 ──▶ then #3
       fulfills        │           │           │
      with 10     receives 10  receives 20  receives 120
                   returns 20  returns 120
                   (new        (new
                   promise)    promise)</pre>
    `,
    `
      <h3>Returning a promise makes the chain wait</h3>
      <p>The most useful rule in chaining: if a <code>.then</code> handler returns a <em>promise</em>,
      the chain pauses at that link until the promise settles. Your journal's timers from Week 3 become
      building blocks — wrap a <code>setTimeout</code> in a promise, return it from a
      <code>.then</code>, and you can sequence "wait, then do the next thing" with no nested callbacks.
      This is exactly how real asynchronous pipelines (read file → parse → write file) are written,
      and Lesson 4 uses it on the <code>fs</code> module.</p>
    `,
    `
      <h3>.catch and .finally: the safety net and the cleanup</h3>
      <p><code>.catch(fn)</code> is really just <code>.then(null, fn)</code> — a subscription to
      <em>rejection</em>. In a chain it catches any rejection produced upstream: by the original
      promise, or by a <code>throw</code> inside any earlier handler. Whichever link fails, execution
      jumps forward to the first <code>.catch</code>, skipping the handlers in between.</p>
      <p><code>.finally(fn)</code> runs whether the chain was fulfilled or rejected, and — important
      detail — it passes the original value (or reason) through untouched, so code after
      <code>.finally</code> still sees the same outcome. It is for cleanup: "close the file",
      "stop the spinner", "log 'done'" — the journal's Program 3 prints
      <code>"Exam result checked."</code> this way.</p>
      <table>
        <thead><tr><th>Week 2–3 callback style</th><th>Week 4 promise style</th></tr></thead>
        <tbody>
          <tr><td>check <code>if (err)</code> in every callback</td><td>one <code>.catch</code> at the end of the chain</td></tr>
          <tr><td>nest callbacks to sequence work</td><td>return promises from <code>.then</code> handlers</td></tr>
          <tr><td>no way to "always run" across branches</td><td><code>.finally</code></td></tr>
        </tbody>
      </table>
    `
  ],
  examples: [
    {
      title: "The before picture: async writeFile with an error-first callback",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/03_EX4.js",
      lang: "javascript",
      code: `
//write file asyncronously

const fs = require('fs');

const details = \`student name: Raju
roll no: 2408028

course: bca
age: 2890
\`;

console.log('writing files');

fs.writeFile('sample.txt', details, (err)=>{
   if(err){console.log(err) }
   else {
    console.log("file is writen successfully");
   }
});
`,
      explain: [
        "This is Week 2/3 style: <code>fs.writeFile</code> takes an error-first callback, and every callback must open with <code>if (err)</code>.",
        "The multi-line string uses a template literal (backticks), so the newlines are part of the value written to <code>sample.txt</code>.",
        "Lesson 4 rewrites this exact program with promises — compare how much smaller the error handling gets.",
        "Creates <code>sample.txt</code> in the folder you run it from; <code>05_EX6_deletefile.js</code> (Lesson 6) deletes it again."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/03_EX4.js",
      output: `writing files
file is writen successfully`
    },
    {
      title: "Program 3: then, catch and finally together",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/09_promise_using_ThenCatchFinally.js",
      lang: "javascript",
      code: `
let exam = new Promise (function(resolve, reject){
    let pass = true;
    if (pass){
        resolve("you passed the exam");
    }
    else{
        reject("you failed the exam.");
    }
});

exam
.then(function(result){
    console.log(result);
})

.catch(function(error){
    console.log(error);
})

.finally(function (){
    console.log("Exam result checked.");
});
`,
      explain: [
        "The full three-part recipe the lab asks for: <code>.then</code> for success, <code>.catch</code> for failure, <code>.finally</code> for \"no matter what\".",
        "With <code>pass = true</code> only the then handler and the finally block run — output order is the settled value first, then the finally line.",
        "Flip it to <code>let pass = false;</code>: the then handler is skipped, the catch prints \"you failed the exam.\" and finally still runs — try it.",
        "<code>.finally</code> is placed last here, but it may appear anywhere in the chain; it always passes the value through unchanged."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/09_promise_using_ThenCatchFinally.js",
      output: `you passed the exam
Exam result checked.`
    },
    {
      title: "Lab question: a login check that greets the Admin",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/10_Question1.js",
      lang: "javascript",
      code: `
let Log = new Promise(function (resolve, reject) {
  let loggedIn = true;

  if (loggedIn) {
    resolve("Welcome");
  } else {
    reject("Access denied");
  }
});

Log
  .then(function (message) {
    let fullmessage = message + " Admin";
    console.log(fullmessage);
  })
  .catch(function (error) {
    console.log(error);
  })
  .finally(function () {
    console.log("system check complete.");
  });
`,
      explain: [
        "This is the exact question in <code>18_noteslab6</code>: resolve \"Welcome\" when logged in, reject \"Access denied\" otherwise, append \" Admin\", and always finish with the system-check line.",
        "The <code>.then</code> handler builds <code>fullmessage</code> and returns nothing — fine here, because no later link needs the value.",
        "Set <code>loggedIn = false</code> and the chain reroutes: \"Access denied\" comes from the catch, while finally still prints.",
        "Note there is no <code>return</code> in the then handler; Lesson 3's sibling file 07_promise.js shows what changes when you add one."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/10_Question1.js",
      output: `Welcome Admin
system check complete.`
    },
    {
      title: "Return-value flow, one link at a time",
      from: "new",
      lang: "javascript",
      code: `
Promise.resolve(5)
  .then(function (n) {
    console.log("step 1 got:", n);
    return n * 2;
  })
  .then(function (n) {
    console.log("step 2 got:", n);
    return n + 8;
  })
  .then(function (n) {
    console.log("step 3 got:", n);
  });
`,
      explain: [
        "Save as <code>value-flow.js</code>. Start: a promise already fulfilled with 5.",
        "Step 1 receives 5 and returns 10 → step 2 receives 10 and returns 18 → step 3 receives 18.",
        "Each <code>.then</code> call created a new promise that the next <code>.then</code> subscribed to; the return statement is what carried the value across.",
        "This works with synchronous values only — no timers, no files — pure plumbing."
      ],
      run: "node value-flow.js",
      output: `step 1 got: 5
step 2 got: 10
step 3 got: 18`
    },
    {
      title: "Spot the bug: forgetting the return",
      from: "new",
      lang: "javascript",
      code: `
Promise.resolve("Raju")
  .then(function (name) {
    console.log("hello", name);
    // (no return statement here)
  })
  .then(function (value) {
    console.log("next step received:", value);
  });
`,
      explain: [
        "Save as <code>missing-return.js</code>. The handler runs fine and prints \"hello Raju\", but it returns nothing — so the promise created by the first <code>.then</code> fulfills with <code>undefined</code>.",
        "<code>undefined</code> is a perfectly valid fulfillment value, so no error is raised — the second step just silently receives it. This is the promise-world version of the forgotten <code>return</code> that Week 3 warned about in error-first callbacks.",
        "Fix: <code>return name + \"!\";</code> in the first handler and the second step receives \"Raju!\" instead."
      ],
      run: "node missing-return.js",
      output: `hello Raju
next step received: undefined`
    },
    {
      title: "Chaining that waits: making tea, one timer at a time",
      from: "new",
      lang: "javascript",
      code: `
function wait(ms, label) {
  return new Promise(function (resolve) {
    setTimeout(function () { resolve(label); }, ms);
  });
}

wait(500, "tea is ready")
  .then(function (step1) { console.log("1:", step1); return wait(300, "milk arrived"); })
  .then(function (step2) { console.log("2:", step2); return wait(200, "chai is served"); })
  .then(function (step3) { console.log("3:", step3); });
`,
      explain: [
        "Save as <code>chai.js</code>. <code>wait()</code> wraps a Week 3 timer in a promise and returns it — a homemade building block.",
        "Because each <code>.then</code> <em>returns a promise</em>, the chain waits: 500 ms, then 300 ms, then 200 ms — about a second total, in strict order.",
        "Three nested <code>setTimeout</code> callbacks would have written the same logic as a staircase; the chain stays flat.",
        "This \"return a promise from a then\" pattern is exactly what Lesson 4 uses to read and write files in sequence."
      ],
      run: "node chai.js",
      output: `1: tea is ready
2: milk arrived
3: chai is served`
    }
  ],
  keyPoints: [
    "Every .then() returns a NEW promise; the return value of your handler becomes that promise's fulfillment value.",
    "Return a plain value → next .then receives it; return a promise → the chain waits and inherits its outcome; throw → the chain rejects.",
    ".catch() handles any rejection produced anywhere upstream in the chain and skips the remaining .then handlers.",
    ".finally() runs for fulfilled or rejected outcomes alike and passes the original value/reason through unchanged.",
    "Returning a promise from a handler is how you sequence asynchronous steps flatly, instead of nesting callbacks."
  ],
  practice: `
    <p>In <code>09_promise_using_ThenCatchFinally.js</code>, change <code>let pass = true;</code> to
    <code>false</code> and rerun — confirm the catch handler replaces the then handler while
    <code>Exam result checked.</code> still prints. Then rewrite your <code>chai.js</code> to add a
    fourth link that logs \"guests arrived\" after another 400 ms wait.</p>
  `,
  quiz: [
    {
      q: "What does a .then(handler) call return?",
      options: [
        "The same promise it was called on",
        "A new promise that fulfills with whatever the handler returns",
        "Always undefined",
        "A string — the handler's console output"
      ],
      answer: 1,
      why: "Each .then() creates a new promise. If the handler returns a plain value, that new promise fulfills with it; if it returns a promise, the new promise waits for it."
    },
    {
      q: "In a chain then → then → catch, the handler of the FIRST then throws an Error. What happens?",
      options: [
        "The program crashes immediately with that error",
        "The second then handler runs normally",
        "The chain skips the remaining .then handlers and the catch receives the Error",
        "The finally block is never reached"
      ],
      answer: 2,
      why: "A throw inside a handler rejects the promise that .then created, and that rejection travels forward to the first .catch. If a .finally sits in the chain it still runs."
    }
  ],
  sources: [
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then",
    "https://nodejs.org/api/promise.html"
  ]
});
