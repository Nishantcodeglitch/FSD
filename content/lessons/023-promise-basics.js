window.COURSE_LESSONS.push({
  id: "w04-promise-basics",
  file: "023",
  unit: 1,
  week: 4,
  title: "Promises: the idea and the syntax",
  kicker: "Unit I · Week 4 · Lesson 1 of 6",
  minutes: 16,
  objectives: [
    "Describe the three states of a promise and how a promise moves between them",
    "Create a promise with new Promise and settle it using resolve and reject",
    "Attach then and catch handlers and predict the order of the printed output"
  ],
  intro: `
    <p>Last week you learned why asynchronous Node code is written with callbacks — and why
    nesting them gets ugly fast. Week 4 opens the drawer marked "relief": the <strong>Promise</strong>,
    the modern JavaScript answer to "give me a value that will arrive later".</p>
    <p>The journal starts small: <code>01_promise.js</code> is a ten-line first contact with
    <code>new Promise</code>, <code>02_promise_1.js</code> makes the promise choose between pass and
    fail, and <code>07_promise.js</code> sneaks a look at chaining. By the end of this lesson you will
    be able to read all three and predict exactly what they print.</p>
  `,
  theory: [
    `
      <h3>The problem a promise solves</h3>
      <p>In Week 2 you read a file with <code>fs.readFile(path, callback)</code>, and in Week 3 you
      delayed work with <code>setTimeout(callback, ms)</code>. Both hand a function to Node and say
      "call me later". That works, but the result of the work only exists <em>inside</em> the
      callback — you cannot return it, store it in a variable, or wait for two of them at once without
      nesting.</p>
      <p>A <strong>promise</strong> is an ordinary JavaScript <em>object</em> that acts as a placeholder
      for a value that does not exist yet. Instead of handing over a callback, a function hands you back
      a promise object immediately; when the work finishes, the promise "fills in" with the result (or
      with a reason it failed), and anyone who is interested gets notified. Your journal's own lab notes
      (<code>18_noteslab6</code>) put it in exam form: <em>"what is promise? is it async? >> yesss!!!"</em>
      — a promise is how an asynchronous function reports its eventual answer.</p>
    `,
    `
      <h3>Three states, one settlement</h3>
      <p>A promise is always in exactly one of three states:</p>
      <ul>
        <li><strong>pending</strong> — the work has not finished yet; the value is unknown. This is the
        state a promise starts in.</li>
        <li><strong>fulfilled</strong> (a.k.a. resolved) — the work succeeded and the promise now carries
        a value. You get that value with <code>.then(...)</code>.</li>
        <li><strong>rejected</strong> — the work failed and the promise carries a <em>reason</em> (an
        error value). You get that reason with <code>.catch(...)</code>.</li>
      </ul>
      <p>The two right-hand states are together called <strong>settled</strong>. A promise may settle
      <em>exactly once</em>. Any <code>resolve</code> or <code>reject</code> call after that first
      settlement is silently ignored — remember this, because it explains the output of
      <code>01_promise.js</code> below.</p>
      <pre class="diagram">              new Promise()
                    │
                    ▼
               ┌─────────┐   resolve(value)   ┌───────────┐
               │ pending │ ─────────────────▶ │ fulfilled │
               └─────────┘                    └───────────┘
                    │
                    │ reject(reason)
                    ▼
              ┌───────────┐
              │ rejected  │   (settled exactly once — no way back)
              └───────────┘</pre>
    `,
    `
      <h3>The syntax: new Promise(executor)</h3>
      <p>You create a promise with <code>new Promise(function (resolve, reject) { ... })</code>. The
      function passed to the constructor is called the <strong>executor</strong>. Node (well, JavaScript)
      runs it <em>immediately</em>, and hands it two functions:</p>
      <ul>
        <li><code>resolve(value)</code> — call this when the work succeeds. The promise becomes
        fulfilled with <code>value</code>.</li>
        <li><code>reject(reason)</code> — call this when the work fails. The promise becomes rejected
        with <code>reason</code>.</li>
      </ul>
      <p>Consumers then subscribe: <code>promise.then(fn)</code> runs <code>fn</code> with the resolved
      value, <code>promise.catch(fn)</code> runs <code>fn</code> with the rejection reason. Subscribing
      after the promise has already settled is fine — the handler still runs, because the promise
      remembers its outcome.</p>
    `,
    `
      <h3>Where promise handlers run (hi again, event loop)</h3>
      <p>The <code>.then</code> callback is asynchronous, exactly like the timer callbacks of Week 3:
      it never runs in the middle of your synchronous code. Promise handlers are queued as
      <strong>microtasks</strong> and run as soon as the current synchronous code finishes and the call
      stack is empty — before any <code>setTimeout</code> callback. Your Week 3 notes
      (<code>09_notes.txt</code>) already ranked them: <em>nextTick &gt; promise &gt; timeout &gt;
      immediate</em>. That ranking is why, in the fourth example below, both <code>console.log</code>
      lines print before the promise's value arrives.</p>
    `
  ],
  examples: [
    {
      title: "First contact: resolve, reject, then, catch",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/01_promise.js",
      lang: "javascript",
      code: `
let promise = new Promise(function(resolve, reject){
    resolve("promise is completed");

    reject("promise is reject")
});

promise.then(function(result){
    console.log(result);
});


promise.catch(function(result){
    console.log(result);
});
`,
      explain: [
        "The executor runs at once: <code>resolve(...)</code> settles the promise as fulfilled, so the later <code>reject(...)</code> is <strong>ignored</strong> — a promise settles only once.",
        "<code>.then</code> receives the resolved value and prints it.",
        "<code>.catch</code> is attached to the same promise, but that promise never rejected — so the catch handler never runs and \"promise is reject\" is never printed.",
        "Swap the two lines inside the executor (reject first) and you get the mirror image: only the catch handler prints."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/01_promise.js",
      output: `promise is completed`
    },
    {
      title: "A promise that chooses: pass or fail from a mark",
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
        "This is the classic promise shape for an if/else decision: the success branch calls <code>resolve</code>, the failure branch calls <code>reject</code>.",
        "With <code>marks = 45</code> the if-condition is true, the promise fulfills with \"pass\", and only the <code>.then</code> handler runs.",
        "Change the first line to <code>let marks = 30;</code> and rerun: the promise rejects with \"fail\", the then handler is skipped, and the catch handler prints instead.",
        "Note the chain style — <code>.then(...).catch(...)</code> on separate lines. That fluent, dot-per-line shape is the signature of promise code, and Lesson 2 dissects how it flows."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/02_promise_1.js",
      output: `pass`
    },
    {
      title: "Sneak peek: a chain that transforms the value",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/07_promise.js",
      lang: "javascript",
      code: `
//15 July 2026 08:35:50

let promise =  new Promise(function(resolve){
    resolve(10);
});


promise
.then(function(result){
    console.log(result);
    return result+10;
})


.then(function(result){
    console.log(result);
    return result+100;
})


.then(function(result){
    console.log(result);
});
`,
      explain: [
        "The promise starts fulfilled with the number 10.",
        "Each <code>.then</code> prints the value it received and <code>return</code>s a new one: 10 → 10+10 = 20 → 20+100 = 120. That return-value hand-off is the whole trick of chaining, and Lesson 2 devotes itself to it.",
        "There is no <code>reject</code> parameter here at all — the executor only handles the success path, which is fine for a promise you know cannot fail."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/07_promise.js",
      output: `10
20
120`
    },
    {
      title: "A promise that really waits (pending → fulfilled)",
      from: "new",
      lang: "javascript",
      code: `
let timer = new Promise(function (resolve) {
  setTimeout(function () {
    resolve("1 second has passed");
  }, 1000);
});

console.log("1. promise created - its state is pending");
timer.then(function (value) {
  console.log("3. then() received:", value);
});
console.log("2. this runs immediately, while the promise is still pending");
`,
      explain: [
        "Save as <code>pending-promise.js</code>. The executor schedules a 1000 ms timer and returns immediately — so the promise sits in the <strong>pending</strong> state until the timer fires and calls <code>resolve</code>.",
        "Lines 2 and 3 of the output prove the ordering rule from Week 3: synchronous code first, promise handlers after.",
        "This is exactly how <code>fs.readFile</code> promises behave in Lesson 4 — only the <code>setTimeout</code> is replaced by a real file read."
      ],
      run: "node pending-promise.js",
      output: `1. promise created - its state is pending
2. this runs immediately, while the promise is still pending
3. then() received: 1 second has passed`
    },
    {
      title: "The three states side by side",
      from: "new",
      lang: "javascript",
      code: `
let later = new Promise(function (resolve) {
  setTimeout(function () { resolve("done later"); }, 500);
});

let now = Promise.resolve(42);

let broken = Promise.reject("something went wrong");

broken.catch(function (reason) { console.log("rejected with:", reason); });
now.then(function (value) { console.log("fulfilled with:", value); });
later.then(function (value) { console.log("later says:", value); });
`,
      explain: [
        "Save as <code>three-states.js</code>. <code>later</code> is <strong>pending</strong> for 500 ms; <code>now</code> is already <strong>fulfilled</strong>; <code>broken</code> is already <strong>rejected</strong>.",
        "<code>Promise.resolve(42)</code> and <code>Promise.reject(\"...\")</code> are shortcuts: get a settled promise without writing the executor by hand.",
        "The catch on <code>broken</code> is attached right away, so Node never sees an unhandled rejection (Lesson 3 shows what happens when you forget).",
        "Output order: the two settled promises' handlers are microtasks that run in creation order; <code>later</code>'s handler waits for its timer."
      ],
      run: "node three-states.js",
      output: `rejected with: something went wrong
fulfilled with: 42
later says: done later`
    },
    {
      title: "A settled promise remembers its value, even for late subscribers",
      from: "new",
      lang: "javascript",
      code: `
let score = Promise.resolve(95);

// ... other code could run here ...

score.then(function (value) {
  console.log("the promise remembers its value:", value);
});
`,
      explain: [
        "Save as <code>remembers.js</code>. The promise is created and settled <em>before</em> anyone subscribes — yet the <code>.then</code> still fires with the value.",
        "This is the key difference from a callback: a callback must be handed over <em>at the moment of the call</em>, but a promise is an object you can keep in a variable and pass around, and handlers can be attached any time later.",
        "That property is what makes it possible for ten different parts of a program to await the same file read."
      ],
      run: "node remembers.js",
      output: `the promise remembers its value: 95`
    }
  ],
  keyPoints: [
    "A promise is an object standing in for a value that will arrive later — the modern alternative to a bare callback.",
    "It is always pending, fulfilled or rejected, and it settles exactly once; later resolve/reject calls are ignored.",
    "new Promise(function(resolve, reject){ ... }) — the executor runs immediately; resolve(value) fulfils, reject(reason) rejects.",
    ".then(fn) delivers the fulfilled value; .catch(fn) delivers the rejection reason; handlers may be attached before or after settling.",
    "Promise handlers run as microtasks: after all synchronous code, before any setTimeout callback (nextTick > promise > timeout > immediate)."
  ],
  practice: `
    <p>Open <code>sorted_files/04_Week-04_Promises-FS-CLI/01_promise.js</code> and move the
    <code>reject(...)</code> line <em>above</em> the <code>resolve(...)</code> line. Run it and confirm
    the output flips to <code>promise is reject</code> — the first settlement wins. Then edit
    <code>02_promise_1.js</code> to <code>let marks = 30;</code> and confirm you get
    <code>fail</code> from the catch handler.</p>
  `,
  quiz: [
    {
      q: "A promise has just been created and its executor scheduled a 2-second timer before calling resolve. What state is the promise in right now?",
      options: ["fulfilled", "rejected", "pending", "completed"],
      answer: 2,
      why: "Until resolve or reject is actually called, the promise is pending. Creating it (even with an instant executor) does not settle it — the timer has not fired yet."
    },
    {
      q: "In 01_promise.js the executor calls resolve(\"promise is completed\") and then reject(\"promise is reject\"). What is printed?",
      options: [
        "Both lines, resolve's first then reject's",
        "promise is reject — the last settlement wins",
        "promise is completed — the first settlement wins, the reject is ignored",
        "Nothing; the program throws an error"
      ],
      answer: 2,
      why: "A promise settles exactly once. The resolve() settles it as fulfilled, so the later reject() is silently dropped, .then runs and .catch never does."
    }
  ],
  sources: [
    "https://nodejs.org/api/promise.html",
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise"
  ]
});
