window.COURSE_LESSONS.push({
  id: "w03-callbacks",
  file: "019",
  unit: 1,
  week: 3,
  title: "Callbacks and calling conventions",
  kicker: "Unit I · Week 3 · Lesson 3 of 6",
  minutes: 15,
  objectives: [
    "Explain what a callback is and name the two situations (sync and async) where you already use one",
    "Use setTimeout's extra-argument convention to pass data to a callback later",
    "Spot and fix a broken timer call, including the missing-delay bug in your own journal file"
  ],
  intro: `
    <p>You have now predicted the output of a dozen timer programs. Every one of them passed a function to
    Node — in <code>fs.readFile()</code> in Week 2, in <code>setTimeout()</code> all week — and Node decided
    <em>when</em> to call it. This lesson names that pattern properly: the <strong>callback</strong>, and the
    conventions for calling one.</p>
    <p>The journal has three files on the subject: <code>15_callback.js</code> (functions as values),
    <code>11_EX1.js</code> (passing a function plus data to a timer — with a genuine bug worth finding) and
    <code>13_EX3.js</code> (one callback for three different schedulers).</p>
  `,
  theory: [
    `
      <h3>A callback is just a function you hand over</h3>
      <p>Your notes file <code>18_notes_5.txt</code> defines it in one line: <em>"a callback function is a
      function that is passed to another function to run later"</em>. In JavaScript this is easy because
      functions are ordinary values — you can store one in a variable, put it in an array, or hand it to
      another function as an argument.</p>
      <p>You meet callbacks in two flavours:</p>
      <ul>
        <li><strong>Synchronous callbacks</strong> — run immediately, in the middle of the other function.
        Array's <code>forEach(fn)</code> and the <code>try/catch/finally</code> blocks you will meet in
        Lesson 6 work like this: your function is called before the outer function returns.</li>
        <li><strong>Asynchronous callbacks</strong> — the outer function returns <em>first</em>, and your
        function is called later, when the work (file read, timer, database query) is done. This is the
        flavour that keeps Node's single thread non-blocking.</li>
      </ul>
      <pre class="diagram">  your code                          Node later
  --------                           --------
  setTimeout(greet, 3000, "Raju")
       ── greet + 3000 ms + "Raju" ──▶ [ timer queue ]
  "the timer is set..." (runs now)
                                     ... 3000 ms later, stack is empty ...
  greet("Raju") ──▶ "Hello, Raju! ..."</pre>
    `,
    `
      <h3>Calling conventions: how the extra arguments arrive</h3>
      <p>Node's timer API has a convention beginners rarely notice: after the callback and the delay you may
      pass as many extra arguments as you like, and Node forwards them, in order, when it finally calls your
      function.</p>
      <table>
        <thead><tr><th>You write</th><th>Node calls</th></tr></thead>
        <tbody>
          <tr><td><code>setTimeout(greet, 3000, "Raju")</code></td><td><code>greet("Raju")</code></td></tr>
          <tr><td><code>setTimeout(bio, 1000, "raju", 16, 1471471470)</code></td><td><code>bio("raju", 16, 1471471470)</code></td></tr>
        </tbody>
      </table>
      <p>That is why your journal can define <code>welcome(name)</code> once and schedule it for three
      different names without writing three separate arrow functions. The same idea powers the
      <strong>error-first</strong> convention you saw in Week 2 and will see in every Node library: the
      callback's <em>first</em> parameter is an error (or <code>null</code>), and the result comes second.</p>
    `,
    `
      <h3>Spot the bug: a timer with no delay</h3>
      <p>File <code>11_EX1.js</code> contains a real, preserved bug from the journal. The first timer is
      written like this:</p>
      <pre class="diagram">  setTimeout(function(){
      console.log("executed after 2 sec");
  },);          // &lt;-- delay is missing (only a trailing comma)</pre>
      <p>JavaScript allows a trailing comma in a function call, so this is <strong>not</strong> a syntax
      error — the delay argument is simply <code>undefined</code>, and Node falls back to its default of
      <strong>1 millisecond</strong>. The comment says "after 2 sec"; reality prints it almost first, ahead
      of the 1000 ms timer. Watch for it in the output below, then fix it by typing <code>2000</code> after
      the comma.</p>
    `
  ],
  examples: [
    {
      title: "Functions as values: passing id and age as callbacks",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/15_callback.js",
      lang: "javascript",
      code: `
function name(id, address, callage, gender) {
    id();
    console.log("raju");
    console.log("address:", address);
    callage();
    console.log("Gender:", gender);
}

function id() {
    console.log(147);
}

function age() {
    console.log(20);
}

name(id, "cuncolim", age, 'female');
`,
      explain: [
        "<code>id</code> and <code>age</code> are passed <em>without</em> parentheses — you are handing over the functions themselves, not calling them.",
        "Inside <code>name()</code>, the line <code>id()</code> is where the handed-over function actually runs: that is the callback being called.",
        "Notice the callbacks run at an exact point in the middle of the outer function's work — the essence of every <code>forEach</code>, <code>setTimeout</code> and <code>fs.readFile</code> you will use."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/15_callback.js",
      output: `147
raju
address: cuncolim
20
Gender: female`
    },
    {
      title: "Passing a function and its data to setTimeout (bug included)",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/11_EX1.js",
      lang: "javascript",
      code: `
//settimeout with functions

console.log("start");

setTimeout(function(){
    console.log("executed after 2 sec");
},);

setTimeout(() => {
  console.log("executes after 5 sec")
},5000);

function welcome (name){
    console.log("welcome to college "+ name);
}
setTimeout(welcome,3000, 'Raju');

function bio (name,age,num){

    console.log("welcome to college "+ name);
    console.log("your age is ",age);
    console.log("your number is ",num);

}
setTimeout(bio,1000, 'raju',16,1471471470);
`,
      explain: [
        "<strong>The bug:</strong> <code>},);</code> leaves the delay out of the first timer, so it fires after the default 1 ms — that is why \"executed after 2 sec\" prints <em>before</em> the 1000 ms timer, not after.",
        "<code>setTimeout(welcome, 3000, 'Raju')</code> uses the extra-argument convention: 3000 ms later Node calls <code>welcome('Raju')</code>.",
        "The <code>bio</code> timer forwards three values, so one function handles name, age and number without three arrow functions.",
        "Fix: change <code>},);</code> to <code>}, 2000);</code> and the output order becomes start → bio → welcome → \"2 sec\" → \"5 sec\"."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/11_EX1.js",
      output: `start
executed after 2 sec
welcome to college raju
your age is  16
your number is  1471471470
welcome to college Raju
executes after 5 sec`
    },
    {
      title: "One function, three different schedulers",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/13_EX3.js",
      lang: "javascript",
      code: `
setTimeout(() => {
  console.log("TO");
}, 2000);

setInterval(() => {
  console.log("inter");
}, 2000);


setImmediate(() => {
  console.log("imiii");
});
`,
      explain: [
        "Every scheduling API in Node takes a callback first — <code>setTimeout</code>, <code>setInterval</code> and <code>setImmediate</code> are three calling conventions for the same idea.",
        "<code>imiii</code> prints first because the immediate runs on the first lap of the loop, long before the 2000 ms timers.",
        "At 2000 ms both the timeout and the interval are due; the timeout was registered first, so <code>TO</code> lands before the first <code>inter</code>.",
        "This file never exits — the interval keeps scheduling work. Press <kbd>Ctrl</kbd>+<kbd>C</kbd> to stop it."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/13_EX3.js",
      output: `imiii
TO
inter
inter
inter`
    },
    {
      title: "greet(name) after 3 seconds (the lab's ex2, working)",
      from: "new",
      lang: "javascript",
      code: `
console.log("waiting...");

function greet(name) {
  console.log("Hello, " + name + "! Welcome to Node.js");
}

setTimeout(greet, 3000, "Raju");

console.log("the timer is set — this line runs right now");
`,
      explain: [
        "This is the solution to the Week 3 lab exercise \"call a function greet that takes a name after 3 seconds\" (see <code>14_note.txt</code>, ex2).",
        "Note what is <em>not</em> here: no parentheses after <code>greet</code>. <code>greet</code> passes the function; <code>greet()</code> would call it immediately and hand <code>setTimeout</code> the string it returned.",
        "The two synchronous lines print instantly; the greeting arrives about 3000 ms later."
      ],
      run: "node greet-after-3s.js",
      output: `waiting...
the timer is set — this line runs right now
Hello, Raju! Welcome to Node.js`
    },
    {
      title: "The error-first convention every Node library uses",
      from: "new",
      lang: "javascript",
      code: `
function fetchScore(name, callback) {
  // pretend this talks to a database and takes time
  setTimeout(() => {
    if (typeof name !== "string" || name === "") {
      callback(new Error("missing name"), null);
      return;
    }
    callback(null, 100);
  }, 100);
}

fetchScore("Raju", (err, score) => {
  if (err) {
    console.log("failed:", err.message);
    return;
  }
  console.log("score:", score);
});

fetchScore("", (err, score) => {
  if (err) {
    console.log("failed:", err.message);
    return;
  }
  console.log("score:", score);
});
`,
      explain: [
        "Save as <code>error-first.js</code>. The callback always receives two things: an error first, the result second.",
        "On success we pass <code>(null, 100)</code>; on failure <code>(new Error(...), null)</code> — exactly the shape of the <code>fs.readFile</code> callback from Week 2.",
        "Every caller checks <code>if (err)</code> first and <code>return</code>s — forgetting that <code>return</code> is the classic beginner crash, and you will see it again in Lesson 6.",
        "Both callbacks are 100 ms old, so they run in the order they were scheduled."
      ],
      run: "node error-first.js",
      output: `score: 100
failed: missing name`
    },
    {
      title: "Why a callback is needed at all: return runs too early",
      from: "new",
      lang: "javascript",
      code: `
function delayedGreeting(name) {
  setTimeout(() => {
    console.log("Hello " + name);
  }, 1000);
  return "greeting scheduled"; // this returns NOW, not the greeting
}

console.log(delayedGreeting("Raju"));
console.log("this prints before the greeting");
`,
      explain: [
        "Save as <code>return-too-early.js</code>. The function cannot <em>return</em> the greeting because the greeting does not exist yet — 1000 ms have not passed.",
        "So we return a placeholder immediately and let the callback deliver the real result later. That is the entire reason callbacks exist.",
        "Compare with a synchronous function: <code>function add(a,b){ return a+b; }</code> has its answer in hand, so no callback is needed."
      ],
      run: "node return-too-early.js",
      output: `greeting scheduled
this prints before the greeting
Hello Raju`
    }
  ],
  keyPoints: [
    "A callback is a function passed to another function, to be called later (and possibly asynchronously).",
    "Functions are values in JavaScript: pass them by name, without parentheses, when you want Node to call them.",
    "setTimeout(fn, delay, ...extra) forwards the extra arguments to fn when the timer fires.",
    "Node's error-first convention: callback(error, result) — check error first, then return.",
    "A missing timer delay is silent, not a syntax error: Node uses its 1 ms default instead."
  ],
  practice: `
    <p>Fix the bug in <code>sorted_files/03_Week-03_Event-Loop-Async/11_EX1.js</code>: type
    <code>2000</code> where the first timer's delay is missing, run the file, and confirm that
    <code>executed after 2 sec</code> now arrives after <code>welcome to college Raju</code>. Then write a
    5-line program that passes your own name and age as extra arguments to a 2-second timer — the lab's ex2
    and ex4 in <code>14_note.txt</code> are waiting for you.</p>
  `,
  quiz: [
    {
      q: "In setTimeout(greet, 3000, \"Raju\"), what does the third argument do?",
      options: [
        "It is ignored by Node",
        "It is passed to greet as its first parameter when the timer fires",
        "It sets a second, hidden delay",
        "It gives the timer a name"
      ],
      answer: 1,
      why: "Any arguments after the delay are forwarded to the callback: Node calls greet(\"Raju\") 3000 ms later. That is the extra-argument calling convention."
    },
    {
      q: "What does the line setTimeout(function(){ ... },); in 11_EX1.js actually do?",
      options: [
        "Waits exactly 2 seconds as the comment claims",
        "Runs after Node's default delay of 1 ms, because the delay argument is missing",
        "Throws a syntax error — a trailing comma is illegal",
        "Runs the callback synchronously, before console.log(\"start\")"
      ],
      answer: 1,
      why: "A trailing comma in a call is legal, so the delay is undefined and Node defaults to 1 ms. That is why the \"after 2 sec\" line prints almost immediately."
    }
  ],
  sources: [
    "https://nodejs.org/api/timers.html",
    "https://nodejs.org/api/fs.html#fsreadfile-path-options-callback"
  ]
});
