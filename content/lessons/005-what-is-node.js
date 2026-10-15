window.COURSE_LESSONS.push({
  id: "w01-what-is-node",
  file: "005",
  unit: 1,
  week: 1,
  title: "What is Node.js and why it exists",
  kicker: "Unit I · Week 1 · Lesson 1 of 6",
  minutes: 14,
  objectives: [
    "Explain what Node.js is and the problem it solves",
    "Describe the V8 engine and why Node.js makes JavaScript fast",
    "Give one reason a company would run JavaScript on a server"
  ],
  intro: `
    <p>In the last chapter you brushed up on JavaScript essentials — variables, functions and arrow
    functions — the same fundamentals the journal exercises in
    <code>02_functions.js</code> drill. So far you have only run JavaScript <em>inside a browser</em>.
    This chapter opens Unit I by asking a simple question: what if you could run that exact language
    on a server, or just in a terminal, with no browser anywhere in sight?</p>
    <p>That is exactly what Node.js is. In this lesson you will learn what Node.js is, what the V8
    engine is, and why "event-driven, non-blocking" is the phrase you will hear over and over in
    this course.</p>
  `,
  theory: [
    `
      <h3>Node.js in one sentence</h3>
      <p>Node.js is a <strong>JavaScript runtime</strong> — a program that can execute JavaScript
      code — built on top of Chrome's V8 engine. A runtime is the surrounding machinery that gives a
      language everything it needs to actually run: somewhere to execute, ways to read files, open
      network connections, print to the terminal and so on.</p>
      <p>In a browser, that machinery is the browser itself: it gives JavaScript a page, a DOM and a
      console. Node.js gives JavaScript a different home — your operating system. Once you
      understand that swap, the rest of this course is just exploring what becomes possible.</p>
    `,
    `
      <h3>What is the V8 engine?</h3>
      <p>V8 is Google's <strong>open-source JavaScript engine</strong>, written in C++, that powers
      the Chrome browser. Its job is to take JavaScript source code and compile it down to
      <strong>native machine code</strong> — the raw instructions your CPU understands — using a
      technique called just-in-time (JIT) compilation. That compilation step is why JavaScript under
      V8 runs fast enough to power real applications.</p>
      <p>Node.js was created (by Ryan Dahl, in 2009) by taking that same V8 engine out of the browser
      and wrapping it in a set of tools for building server-side applications. The journal notes say
      it plainly: <em>"node js is a JavaScript runtime built on chrome v8 engine"</em>.</p>
      <pre class="diagram">  BROWSER WORLD                 NODE WORLD
  ┌──────────────┐             ┌──────────────────┐
  │ Chrome + V8  │             │ Node.js           │
  │  + DOM/window│             │  + V8 engine      │
  │              │             │  + fs, net, http  │
  └──────────────┘             └──────────────────┘
   JS sees web pages            JS sees your machine</pre>
    `,
    `
      <h3>Why run JavaScript on a server at all?</h3>
      <p>Before Node.js, servers mostly ran other languages (PHP, Java, Python, C#). JavaScript
      developers had to learn a second language to build the back end. Node.js removed that wall:
      you can write <em>both</em> the browser front end and the server back end in one language,
      share logic between them, and hire for one skill set instead of two.</p>
      <p>The journal's own notes list the practical advantages: <strong>high performance</strong>,
      <strong>concurrent request handling</strong>, <strong>cross-platform apps</strong>,
      <strong>scalable web app development</strong>, and being <strong>easy to learn and
      adapt</strong> (if you already know JavaScript). The notes also name three real-world
      users of Node.js: <strong>Netflix</strong>, <strong>Reddit</strong> and <strong>Paytm</strong>.</p>
    `,
    `
      <h3>The big idea: event-driven and non-blocking</h3>
      <p>The journal notes describe Node.js as using an <em>"event driven and asynchronous non
      blocking I/O model that makes it lightweight and efficient."</em> Let's unpack that, because
      the whole course depends on it.</p>
      <p><strong>I/O</strong> means input/output — anything that talks to the outside world, like
      reading a file or waiting for a network request. <strong>Blocking</strong> I/O means the
      program sits and waits, doing nothing, until the operation finishes.
      <strong>Non-blocking</strong> I/O means Node kicks the operation off and immediately moves on
      to other work, handling the result later via a <em>callback</em> (a function you hand to Node
      that runs when the result is ready).</p>
      <p>The notes put it like this: synchronous code <em>"waits for each operation to complete and
      after that it will execute the next one, step by step"</em>, while asynchronous code <em>"will
      never wait to complete each operation to execute the next one"</em> — <em>"callbacks are used
      to handle results."</em> You will spend all of Week 3 going deep on this machinery; for now
      the headline is enough: Node trades one running thread plus a fast <strong>event loop</strong>
      (a loop that checks "is anything finished?") for the old model of one thread per waiting
      client, which is what makes it lightweight.</p>
    `,
    `
      <h3>What Node.js is NOT</h3>
      <ul>
        <li>It is <strong>not a programming language</strong> — it runs JavaScript, it doesn't
        replace it.</li>
        <li>It is <strong>not a framework</strong> — Express (which you'll install in Lesson 9) is
        a framework; Node.js is the runtime underneath it.</li>
        <li>It is <strong>not limited to servers</strong> — you can build command-line tools,
        desktop apps and automation scripts with it. The journal's own note says node "can be used
        as front end and backend".</li>
      </ul>
    `
  ],
  examples: [
    {
      title: "The journal's own definition of Node.js",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/03_notes 1.txt",
      lang: "text",
      code: `What is node js
>> node js is a JavaScript runtime built on chrome v8 engine
>>it uses event driven and asynchronous non blocking I/o model that makes it lightweight and efficient

what is v8 engine ?
>>it is open source js engine . developed by chromium
>>it is in C++
>>v8 compile js to native machine code and making fast.`,
      explain: [
        "These are the actual Week 1 notes from the journal — the definition you are expected to know for the course.",
        "<code>JavaScript runtime</code> = the thing that executes JS. In a browser that's the browser; in Node it's the <code>node</code> program.",
        "<code>Chrome V8 engine</code> is the same engine inside Chrome, reused by Node to run your code fast."
      ]
    },
    {
      title: "The same JavaScript, now running without a browser",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/02_functions.js",
      lang: "javascript",
      code: `function greet(name, age){
    let alloo = "4kg";
    console.log(alloo + " welcome " + name, " ", age);
}
greet("john", 8999);
greet("banega", 7777);
greet("Don", 454545454);

console.log("========== arrow functions ============");
const numbers = (a, b) => a * b;
console.log(numbers(4, 4));`,
      explain: [
        "Nothing here mentions a browser — no <code>document</code>, no <code>window</code>. Just functions and <code>console.log</code>.",
        "Node provides its own <code>console.log</code> that writes to the terminal instead of the browser dev-tools console.",
        "This is the preface material in action: plain functions and arrow functions are the building blocks of every Node script you will write.",
        "Save it as <code>02_functions.js</code> and run it — the terminal prints <code>16</code> from <code>numbers(4, 4)</code> with zero setup."
      ],
      run: "node 02_functions.js",
      output: `4kg welcome john    8999
4kg welcome banega    7777
4kg welcome Don    454545454
========== arrow functions ============
16`
    },
    {
      title: "Sync vs async, in the journal's own words",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/03_notes 1.txt",
      lang: "text",
      code: `Difference between synchronous and asynchronous

sync
>it waits for each operation to complete and after that int will execute the next one
>step by step

async
>it will never wait to complete each operation to execute the next one
>it will execute all at a time
>the result of all operations will be handled once result is available

>callback are used to handle results`,
      explain: [
        "Sync = queue at a bank teller: one customer fully served before the next is called.",
        "Async = Node starts many operations and checks back when each finishes — this is what \"non-blocking\" means.",
        "A <code>callback</code> is the function that \"handles the result\" once it is available. You will write plenty of them in Week 3."
      ]
    },
    {
      title: "Checking that Node.js is installed",
      from: "new",
      lang: "bash",
      code: `$ node -v
v22.11.0
$ npm -v
10.9.0`,
      explain: [
        "<code>node -v</code> (short for <code>node --version</code>) prints the installed Node version.",
        "<code>npm -v</code> prints npm's version — npm is the package manager that ships with Node.",
        "If either command says it is not recognized, Node is not installed (or not on your PATH) — see the preface for install steps.",
        "The exact numbers on your machine will differ; what matters is that a version number appears."
      ],
      run: "node -v"
    },
    {
      title: "Running a one-liner without creating any file",
      from: "new",
      lang: "bash",
      code: `$ node -e "console.log('hello from node', 2 + 2)"
hello from node 4`,
      explain: [
        "<code>-e</code> tells Node: evaluate this string as JavaScript instead of reading a file.",
        "It is the fastest way to test an idea — no save, no filename.",
        "This works because Node is a general JavaScript runtime, not just a web server tool."
      ],
      run: "node -e \"console.log('hello from node', 2 + 2)\""
    },
    {
      title: "Why Node exists: a web server in ten lines",
      from: "new",
      lang: "javascript",
      code: `const http = require("http");

const server = http.createServer(function (req, res) {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from Node.js! You requested " + req.url);
});

server.listen(8080, function () {
  console.log("Server running at http://localhost:8080/");
});`,
      explain: [
        "This is the payoff of \"server-side JavaScript\": a working web server, written in the language you already know.",
        "<code>require(\"http\")</code> loads one of Node's built-in modules — no npm install needed. Modules get a full chapter in Week 2.",
        "This is the raw <code>http</code> flavour; in Lesson 10 you will build the same server much more comfortably with Express.",
        "Run it, then open <a href='http://localhost:8080/' target='_blank' rel='noopener'>http://localhost:8080/</a> in a browser."
      ],
      run: "node server.js",
      output: "Server running at http://localhost:8080/"
    }
  ],
  keyPoints: [
    "Node.js is a JavaScript runtime built on Chrome's V8 engine — it runs JS outside the browser",
    "V8 compiles JavaScript to native machine code, which is why Node is fast",
    "Node's model is event-driven and non-blocking: it never waits idly, it uses callbacks",
    "Node means you can write both front end and back end in one language",
    "Netflix, Reddit and Paytm are real-world users of Node.js (per the journal notes)"
  ],
  practice: `
    <p>Open <code>sorted_files/01_Week-01_Node-Intro/03_notes 1.txt</code> and read it end to end —
    it is short. Then, from a terminal in that folder, run <code>node 02_functions.js</code> and
    confirm the output matches the example above. Finally, write down in one sentence, in your own
    words, what "non-blocking" means. You will reuse that sentence in Week 3.</p>
  `,
  quiz: [
    {
      q: "Node.js is best described as:",
      options: [
        "A JavaScript runtime built on Chrome's V8 engine",
        "A new programming language for servers",
        "A browser that runs on servers",
        "A database used by JavaScript"
      ],
      answer: 0,
      why: "Node.js is a runtime — the machinery that executes JavaScript outside the browser — and it is built on Chrome's V8 engine."
    },
    {
      q: "What does V8 do with your JavaScript code?",
      options: [
        "Compiles it to native machine code, making it fast",
        "Converts it into HTML",
        "Stores it in a database",
        "Encrypts it before running"
      ],
      answer: 0,
      why: "V8 is Google's open-source JS engine (written in C++); it compiles JavaScript to native machine code, which is why Node runs fast."
    }
  ],
  sources: [
    "https://nodejs.org/en/about",
    "https://v8.dev/",
    "https://nodejs.org/api/"
  ]
});
