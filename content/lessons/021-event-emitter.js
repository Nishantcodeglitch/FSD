window.COURSE_LESSONS.push({
  id: "w03-event-emitter",
  file: "021",
  unit: 1,
  week: 3,
  title: "Events and the EventEmitter",
  kicker: "Unit I · Week 3 · Lesson 5 of 6",
  minutes: 15,
  objectives: [
    "Explain the publish/subscribe idea behind Node's events module",
    "Register listeners with on(), once() and off() and trigger them with emit()",
    "Predict listener output for case-sensitive names, multiple listeners and passed arguments"
  ],
  intro: `
    <p>Timers and file reads are one way to run code later. The second — and the one that powers almost
    every Node object you will meet, from <code>http.Server</code> to <code>fs</code> streams — is the
    <strong>event</strong>: something announces that it happened, and anyone who registered interest gets
    called. Your Week 2 http server already used it: <code>server.on("request", ...)</code>.</p>
    <p>This lesson works through the journal's two event files, <code>16_events.js</code> and
    <code>17_Q1_and_Q2.js</code> — the second one contains a preserved <code>=&gt;</code> typo bug that
    is too good a teaching moment to skip.</p>
  `,
  theory: [
    `
      <h3>on() to listen, emit() to trigger</h3>
      <p>The built-in <code>events</code> module exports one class you will use constantly:
      <code>EventEmitter</code>. An instance of it is a little message board. You <strong>register</strong>
      functions for a named event with <code>.on(name, fn)</code>, and any time <code>.emit(name, ...args)</code>
      is called, every function registered for that name runs, in registration order, receiving whatever
      arguments you passed to <code>emit</code>.</p>
      <p>Your notes file <code>18_notes_5.txt</code> puts it in two lines: <em>"event.on is used to listen
      for an event; event.emit is used to triger an event."</em> This is the publish/subscribe pattern —
      the emitter never needs to know who is listening.</p>
      <pre class="diagram">  listeners registered on "greet"                when it fires

  em.on("greet", fnA)   ┐
  em.on("greet", fnB)   ┴─▶  list: [ fnA, fnB ]

  em.emit("greet")  ──▶  run fnA()  ──▶  run fnB()      (registration order)

  em.emit("mon")    ──▶  nothing happens:
                         event names are case-sensitive,
                         only "Mon" has a listener</pre>
    `,
    `
      <h3>The rules that trip people up</h3>
      <ul>
        <li><strong>Order is registration order.</strong> Listeners run one after another, exactly as you
        attached them — never rely on a "most recent wins" idea.</li>
        <li><strong>Names are case-sensitive.</strong> <code>emit("mon")</code> will not reach a listener
        registered on <code>"Mon"</code>; nothing is printed and no error is raised.</li>
        <li><strong>Arguments flow through.</strong> <code>emit("greetings", "rajuu", 20)</code> calls the
        handler as <code>fn("rajuu", 20)</code> — parameters, not hard-coded strings.</li>
        <li><strong>Any number of listeners</strong> may share one name; all of them run.</li>
        <li><strong>The <code>"error"</code> event is special:</strong> if you <code>emit("error")</code>
        with no listener attached, Node <em>throws</em> the error and crashes. Always attach an error
        listener first.</li>
      </ul>
      <p>Two more methods complete the set: <code>.once(name, fn)</code> registers a listener that removes
      itself after the first call, and <code>.off(name, fn)</code> (older name: <code>.removeListener</code>)
      removes one. Try them in the examples below.</p>
    `,
    `
      <h3>Spot the bug: <code>age =&gt; 18</code></h3>
      <p>The second half of <code>17_Q1_and_Q2.js</code> is supposed to test whether a student is an adult.
      The condition is written like this:</p>
      <pre class="diagram">  if (age => 18) {          // &lt;-- BUG: this is not a comparison
      console.log("Is an Adult");
  } else {
      console.log("is a minor");
  }</pre>
      <p>Because of the <code>=&gt;</code>, JavaScript reads it as an <strong>arrow function</strong>:
      "a function that takes <code>age</code> and returns <code>18</code>". An <code>if</code> that receives
      a function object always treats it as truthy, so the program prints <code>Is an Adult</code> for
      <em>every</em> age — 93, 12, or 0. The fix is one character flipped: <code>if (age >= 18)</code>.
      Run the journal file, see the wrong answer, then run the corrected version below.</p>
    `
  ],
  examples: [
    {
      title: "Multiple listeners, case sensitivity and arguments",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/16_events.js",
      lang: "javascript",
      code: `
const Eventemiters = require('events')


//create a object

const emit = new Eventemiters();

emit.on("greet", function(){
    console.log("hello Alooogajar");
});
//we can have multiple fucntions and all the functions things are case sensitive.
emit.on("greet", function(){
    console.log("hello dhaniya");
});



emit.on("greet", function(){
    console.log("hello lol");
});

emit.on("Mon", function(){
    console.log("hello anna");
});


//to call this event

emit.emit("greet");
emit.emit("mon");//it wont print as mon is not Mon..
emit.emit("Mon");//hello anna

emit.on("greetings", function(name, age){ // we use perameters not hardcoding
    console.log(\`hello \${name}, you are \${age} years big\`);
});

emit.emit("greetings", "rajuu",20);
`,
      explain: [
        "<code>require('events')</code> returns the EventEmitter class; <code>new Eventemiters()</code> creates your own bus (the capitalisation in the journal name is cosmetic, but variable names are case-sensitive).",
        "Three listeners sit on <code>\"greet\"</code>, so one <code>emit(\"greet\")</code> prints three lines — in the order they were attached.",
        "<code>emit(\"mon\")</code> prints nothing: the listener is on <code>\"Mon\"</code> and event names are case-sensitive. No error is raised for a name nobody listens to.",
        "The last block passes arguments: <code>emit(\"greetings\", \"rajuu\", 20)</code> calls the handler with <code>name=\"rajuu\"</code> and <code>age=20</code>."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/16_events.js",
      output: `hello Alooogajar
hello dhaniya
hello lol
hello anna
hello rajuu, you are 20 years big`
    },
    {
      title: "Lab Q1 + Q2 with the preserved '=>' bug",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/17_Q1_and_Q2.js",
      lang: "javascript",
      code: `
/*
Q1. create a event named "marks" that accepts:
Student Name, Subject, Marks
*Expected output:*
Student:RAJU
Subject: Javascript
Marks: 100
*_________________*

Q2. create an evet named "agecheck" that accepts name and age.
if the age is 18 or above it prints: Is an adult.
otherwise, prints: is a minor.
*/

const event = require('events');

const em = new event();

em.on( "info",function(name, age, marks){
    console.log(\`Student:\${name}\\nSubject:\${age}\\nMarks:\${marks}\\n*--------------------*\\n\\n\\n\`);
});

em.emit("info", "lolu","Python", 100);
//Q2
em.on("age", function(age){
    if(age => 18){
        console.log("Is an Adult");
    }else {
        console.log("is a minor")
    }
});

em.emit("age",93);
`,
      explain: [
        "Q1 works: the handler prints the three fields passed by <code>emit</code>, followed by the separator and three blank lines from the escaped newlines in the template literal.",
        "<strong>Q2 is wrong on purpose:</strong> <code>if (age => 18)</code> declares an arrow function instead of comparing, and a function is always truthy — so <code>Is an Adult</code> prints for age 93 <em>and</em> would print for age 12.",
        "The event is named <code>\"age\"</code> while the question asks for <code>\"agecheck\"</code>, and the handler takes only <code>age</code> although the question says \"accepts name and age\" — two more spec mismatches worth noticing.",
        "Fix it with <code>if (age >= 18)</code> and the handler signature <code>(name, age)</code>; the corrected version is the next example."
      ],
      run: "node sorted_files/03_Week-03_Event-Loop-Async/17_Q1_and_Q2.js",
      output: `Student:lolu
Subject:Python
Marks:100
*--------------------*



Is an Adult`
    },
    {
      title: "The journal's event notes (on / emit / callbacks / promises)",
      from: "journal",
      file: "sorted_files/03_Week-03_Event-Loop-Async/18_notes_5.txt",
      lang: "text",
      code: `
event.on
event.emit

event. on is used to listen for an event
event. emit is used to triger an event


=========
callback functions
=> a callback functions is a funtion that is passed to an another funtion to
to run later
node js uses callbacks to handle asynchrounous classes
like reading files or making network requests
==========================

promises
=>
what are three stages of promise?
pending.
fullfilment.
reject.

these are the three stages of promises.
`,
      explain: [
        "Verbatim from the journal — the whole week's vocabulary in one file: <code>on</code>/<code>emit</code>, callbacks, promises.",
        "The <code>=&gt;</code> lines here are the notes author's own bullet points (not arrow functions) — but seeing <code>=&gt;</code> in this very folder makes the <code>age =&gt; 18</code> bug in the previous example easier to understand.",
        "The promise stages (pending, fulfilment, reject) are next week's entire topic — Lesson 023 picks up exactly here."
      ]
    },
    {
      title: "The fixed age check (Q2 done properly)",
      from: "new",
      lang: "javascript",
      code: `
const EventEmitter = require("events");
const em = new EventEmitter();

em.on("agecheck", (name, age) => {
  if (age >= 18) {
    console.log(name + ": Is an adult");
  } else {
    console.log(name + ": is a minor");
  }
});

em.emit("agecheck", "Raju", 93);
em.emit("agecheck", "Chinu", 12);
`,
      explain: [
        "Save as <code>agecheck-fixed.js</code> — the lab question exactly as written: event named <code>agecheck</code>, both name and age passed through.",
        "<code>age >= 18</code> is the comparison that was missing; the original <code>age => 18</code> built a function instead.",
        "One listener, two emits: the same handler runs twice with different data, which is the whole point of events."
      ],
      run: "node agecheck-fixed.js",
      output: `Raju: Is an adult
Chinu: is a minor`
    },
    {
      title: "once() and off(): adding and removing listeners",
      from: "new",
      lang: "javascript",
      code: `
const EventEmitter = require("events");
const bus = new EventEmitter();

function first() {
  console.log("first listener");
}

bus.on("ping", first);
bus.once("ping", () => console.log("one-time listener"));

bus.emit("ping");
bus.emit("ping");

bus.off("ping", first);
bus.emit("ping");
console.log("done — nothing prints after off()");
`,
      explain: [
        "Save as <code>once-off.js</code>. Listeners run in registration order, so <code>first</code> prints before the one-time listener.",
        "The <code>once</code> listener removes itself after the first call — the second <code>emit</code> only reaches <code>first</code>.",
        "<code>off()</code> needs the <em>same function reference</em> you passed to <code>on()</code>; a fresh arrow function would not match and would stay attached.",
        "After the third emit nothing fires — an emitter with no listeners left is completely silent."
      ],
      run: "node once-off.js",
      output: `first listener
one-time listener
first listener
done — nothing prints after off()`
    },
    {
      title: "The special 'error' event: always attach a listener",
      from: "new",
      lang: "javascript",
      code: `
const EventEmitter = require("events");
const bus = new EventEmitter();

bus.on("error", (err) => {
  console.log("caught:", err.message);
});

bus.emit("error", new Error("connection lost"));
console.log("the program keeps running");
`,
      explain: [
        "Save as <code>error-event.js</code>. Delete the first three lines and run it again: Node throws <code>Unhandled 'error' event</code> and the process dies.",
        "That crash-by-default is deliberate — it forces you to decide what to do when something fails (you will build on this in Lesson 6).",
        "The listener receives the error as its argument, exactly like an error-first callback, only delivered by <code>emit</code>."
      ],
      run: "node error-event.js",
      output: `caught: connection lost
the program keeps running`
    }
  ],
  keyPoints: [
    "require('events') gives you EventEmitter; .on(name, fn) registers, .emit(name, ...args) triggers.",
    "Listeners run in registration order and receive whatever arguments emit() was called with.",
    "Event names are case-sensitive: emit(\"mon\") never reaches a listener on \"Mon\".",
    "if (age => 18) creates a truthy arrow function — the comparison needs age >= 18.",
    "Emitting 'error' with no listener crashes the process; other unknown events are silently ignored."
  ],
  practice: `
    <p>Repair <code>sorted_files/03_Week-03_Event-Loop-Async/17_Q1_and_Q2.js</code> in place: rename the
    event to <code>agecheck</code>, give the handler <code>(name, age)</code> parameters, and replace the
    broken condition with <code>age >= 18</code>. Re-run it and expect <code>Raju: Is an adult</code>-style
    output for both test ages. Then add a third listener with <code>bus.once()</code> in
    <code>16_events.js</code> and confirm it prints only once.</p>
  `,
  quiz: [
    {
      q: "em.on(\"Mon\", fn); em.emit(\"mon\");  — what happens?",
      options: [
        "fn runs — event names are matched loosely",
        "Nothing prints: names are case-sensitive, and no listener is attached to \"mon\"",
        "Node throws an error because no listener matched",
        "fn runs, but without its arguments"
      ],
      answer: 1,
      why: "Only events with at least one listener (or the special \"error\" event) do anything. \"mon\" and \"Mon\" are different names, so the emit is a no-op — exactly what the comment in 16_events.js says."
    },
    {
      q: "The condition if (age => 18) in 17_Q1_and_Q2.js always prints \"Is an Adult\". Why?",
      options: [
        "Because 18 is bigger than every test age",
        "Because emit() resets variables between calls",
        "Because age => 18 is an arrow function, and a function object is always truthy in an if",
        "Because the listener was registered with on() instead of once()"
      ],
      answer: 2,
      why: "\"age => 18\" is read as \"a function taking age and returning 18\", not as a comparison. if receives a function (truthy) every time, so the else branch is unreachable until you write age >= 18."
    }
  ],
  sources: [
    "https://nodejs.org/api/events.html",
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions"
  ]
});
