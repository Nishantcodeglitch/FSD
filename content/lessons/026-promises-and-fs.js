window.COURSE_LESSONS.push({
  id: "w04-promises-and-fs",
  file: "026",
  unit: 1,
  week: 4,
  title: "Promisifying the file system",
  kicker: "Unit I · Week 4 · Lesson 4 of 6",
  minutes: 18,
  objectives: [
    "Explain what promisification means and hand-wrap an error-first callback API",
    "Read and write files with the built-in fs.promises API",
    "Sequence multi-step file operations with a promise chain"
  ],
  intro: `
    <p>You now know how to build a promise, chain it and survive its failures. Time to point all
    that at real work: the <code>fs</code> module from Week 2, whose callbacks still follow the
    error-first convention. Turning a callback API into a promise-returning one has a name —
    <strong>promisifying</strong> — and the journal does it by hand in
    <code>11_reading_file_promises.js</code>.</p>
    <p>One honesty note up front, the same one the journal's own notes record: the file
    <code>08_promise_read_file_using_promise.js</code> has a misleading name — despite it, the file
    never touches <code>fs</code> at all. We will look at it anyway (it is good chaining practice),
    then upgrade <code>03_EX4.js</code>'s callback-style <code>writeFile</code> to the promise style
    modern Node ships with: <code>fs.promises</code>.</p>
  `,
  theory: [
    `
      <h3>What "promisifying" means</h3>
      <p>The <code>fs</code> callbacks look like this: <code>fs.readFile(path, encoding, (err, data) =&gt;
      { ... })</code> — error first, result second, success and failure handled in two branches of one
      function. Promisifying means wrapping that call so it instead <em>returns a promise</em>:</p>
      <pre class="diagram">  callback world                     promise world

  fs.readFile(p, enc, (err, data) =>   new Promise((resolve, reject) => {
    if (err) ...                        fs.readFile(p, enc, (err, data) => {
    else ...                              if (err) return reject(err);
  })                                      return resolve(data);
                                        })
                                      })
                                        └── .then(data) / .catch(err)</pre>
      <p>The mapping is mechanical: an error becomes <code>reject(err)</code>, a result becomes
      <code>resolve(data)</code>. Because the shape is so regular, you can wrap any error-first API
      this way — and JavaScript even ships a machine for it, <code>util.promisify</code>, which you
      will see in the last example.</p>
    `,
    `
      <h3>The hand-written wrapper, line by line</h3>
      <p>Here is the core of <code>11_reading_file_promises.js</code>, which the journal built for the
      exam question <em>"using promises read a file"</em> (see <code>18_noteslab6</code>):</p>
      <pre class="diagram">  var promise = new Promise(function (resolve, reject) {
      fs.readFile('sample.txt', 'utf-8', (error, data) => {
          if (error) {
              return reject(error)     // failure road
          }
          resolve(data);               // success road
      });
  });</pre>
      <p>Three details to burn in: the executor runs immediately and schedules the read;
      <code>return reject(error)</code> must <strong>return</strong>, or <code>resolve(data)</code>
      would run next with <code>undefined</code>; and <code>'utf-8'</code> turns the raw
      <code>Buffer</code> into a readable string, exactly as in Week 2.</p>
    `,
    `
      <h3>Node already ships a promisified fs</h3>
      <p>Hand-wrapping every call gets tedious, so modern Node includes the job done for you:
      <code>require("fs").promises</code> (available since Node 10, stable since 11.14) — the same
      operations, each returning a promise:</p>
      <ul>
        <li><code>fsPromises.readFile(path, "utf-8")</code> → fulfils with the file's text;</li>
        <li><code>fsPromises.writeFile(path, text)</code> → fulfils when the file is written;</li>
        <li><code>fsPromises.appendFile(path, text)</code> / <code>unlink(path)</code> → Lesson 6's
        recipes, in promise form.</li>
      </ul>
      <p>And because these are ordinary promises, everything from Lessons 1–3 composes: chain them,
      run several in parallel with <code>Promise.all([...])</code>, catch once at the end. A whole
      file-processing pipeline becomes a flat five-line chain instead of Week 2's nested callbacks.</p>
    `
  ],
  examples: [
    {
      title: "Spot the mismatch: a \"read file\" file that never touches fs",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/08_promise_read_file_using_promise.js",
      lang: "javascript",
      code: `
//promise chaining
var student = new Promise(function (resolve){
    resolve ("Raju");
});

student
.then(function(name){
    console.log("student name:", name);
    return name + " laal";
})

.then(function(fullname){
    console.log("full name", fullname);
    return fullname.toUpperCase();
})

.then(function(result){
    console.log(result)
})`,
      explain: [
        "Despite the filename, there is no <code>require('fs')</code> and no file is read — this is a plain value-chain over a promise that resolves with the string \"Raju\". The journal's own index notes flag the mismatch (\"filename mismatch noted\"), so we keep it honestly: a good chain, a wrong name.",
        "Link 1 prints the name and returns \"Raju laal\"; link 2 prints it and returns the upper-cased version; link 3 prints that — the return-value relay from Lesson 2 in action.",
        "The exam question this file was preparing for — reading a file <em>with promises</em> — is answered by the next example, 11_reading_file_promises.js."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/08_promise_read_file_using_promise.js",
      output: `student name: Raju
full name Raju laal
RAJU LAAL`
    },
    {
      title: "The real thing: wrapping fs.readFile in a promise by hand",
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
        "The middle of the file is the part that matters: <code>new Promise</code> wraps the error-first <code>fs.readFile</code> callback — <code>reject(error)</code> on failure, <code>resolve(data)</code> on success.",
        "The two demo <code>setTimeout</code> calls (printing 1 after 1 s and 2 after 2 s) are Week 3 warm-up around it; the read itself starts 3 seconds in, purely for show.",
        "The output shown is the success run: copy the fixture first with <code>Copy-Item 19_sample.txt sample.txt</code> (PowerShell) or <code>copy 19_sample.txt sample.txt</code> (cmd) from inside the week folder. Without a sample.txt the same file prints the ENOENT error you saw in Lesson 3.",
        "The file reads <code>'sample.txt'</code> relative to the folder you run it from — not to the script's own folder."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/11_reading_file_promises.js",
      output: `the data will be there in few sec.



1
2
Tum tassali na do sirf baithe raho
Waqt kuchh mere marne ka chal jaayega
Tum tassali na do sirf baithe raho
Waqt kuchh mere marne ka chal jaayega`
    },
    {
      title: "The callback original we are about to upgrade",
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
        "Week 2/3 style: one callback with two branches, success and failure packed into the same function. Run it and it creates <code>sample.txt</code> in the current folder.",
        "Compare with the next example: same job, promise returned, branches separated into .then and .catch.",
        "This file also produced the sample.txt that 11_reading_file_promises.js reads — the journal's files are meant to be run in sequence."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/03_EX4.js",
      output: `writing files
file is writen successfully`
    },
    {
      title: "The modern way: fs.promises.readFile",
      from: "new",
      lang: "javascript",
      code: `
const fs = require("fs").promises;

fs.readFile("19_sample.txt", "utf-8")
  .then(function (data) { console.log(data); })
  .catch(function (err) { console.log("could not read:", err.code); });
`,
      explain: [
        "Save inside the week folder (next to <code>19_sample.txt</code>) as <code>read-promise.js</code>. <code>require(\"fs\").promises</code> is the built-in promisified fs — no hand-written executor anywhere.",
        "The promise fulfils with the file text and prints it; if the path is wrong, it rejects and the catch prints the stable <code>err.code</code> (\"ENOENT\") instead of a giant error object.",
        "Six lines total, and every operation — read, write, append, delete — has this shape. This is how you should write fs code from now on."
      ],
      run: "node read-promise.js",
      output: `Tum tassali na do sirf baithe raho
Waqt kuchh mere marne ka chal jaayega
Tum tassali na do sirf baithe raho
Waqt kuchh mere marne ka chal jaayega`
    },
    {
      title: "Write, then read back: sequencing two file operations",
      from: "new",
      lang: "javascript",
      code: `
const fs = require("fs").promises;

fs.writeFile("report.txt", "week 4 done\\n")
  .then(function () {
    console.log("written");
    return fs.readFile("report.txt", "utf-8");
  })
  .then(function (text) { console.log("read back:", text.trim()); })
  .catch(function (err) { console.log("failed:", err.code); });
`,
      explain: [
        "Save as <code>write-read.js</code>. The first step writes the file; because its handler <em>returns the readFile promise</em>, the chain waits for the write to finish before reading — the sequential chaining from Lesson 2 doing real work.",
        "Skipping the return would break it: the read could start before the write lands. The \"return a promise from a then\" rule is not decoration here, it is the whole schedule.",
        "One <code>.catch</code> at the end covers both operations — try running it in a read-only folder to see \"failed: EACCES\"."
      ],
      run: "node write-read.js",
      output: `written
read back: week 4 done`
    },
    {
      title: "Let the machine promisify: util.promisify",
      from: "new",
      lang: "javascript",
      code: `
const fs = require("fs");
const { promisify } = require("util");

const readFileP = promisify(fs.readFile);

readFileP("19_sample.txt", "utf-8").then(function (data) {
  console.log("first line:", data.split("\\n")[0]);
});
`,
      explain: [
        "Save as <code>promisify.js</code>. <code>util.promisify</code> takes any function using the error-first convention and returns a version that returns a promise — the wrapper from example 2, generated for you.",
        "<code>readFileP</code> is now a drop-in for <code>fs.promises.readFile</code>; use it for third-party libraries that only ship callback APIs.",
        "The .then splits the text into lines and prints the first one — proof the fulfilled value is an ordinary string you can manipulate."
      ],
      run: "node promisify.js",
      output: `first line: Tum tassali na do sirf baithe raho`
    }
  ],
  keyPoints: [
    "Promisifying = wrapping an error-first callback so the wrapper returns a promise: reject(err) on failure, resolve(data) on success.",
    "The return in \"return reject(error)\" matters — without it, resolve(undefined) would run next.",
    "require(\"fs\").promises gives every fs operation as a promise — read, write, append, unlink — with no hand-written wrappers.",
    "Because they are ordinary promises, file operations chain sequentially (return the next promise) or run in parallel (Promise.all).",
    "The journal file 08_promise_read_file_using_promise.js does NOT read a file despite its name — the journal's own notes flag the mismatch; the real promise-read is 11_reading_file_promises.js."
  ],
  practice: `
    <p>Recreate the exam question yourself: write a 10-line program
    <code>read-my-file.js</code> that uses <code>fs.promises.readFile</code> to read
    <code>19_sample.txt</code>, chains a <code>.then</code> that prints the number of characters
    (<code>data.length</code>), and ends with a <code>.catch</code> that prints
    <code>err.code</code>. Then break the filename on purpose and watch your catch fire.</p>
  `,
  quiz: [
    {
      q: "Inside a hand-written readFile wrapper, the error branch must say return reject(error) — not just reject(error). Why?",
      options: [
        "reject only works inside a return statement",
        "Without the return, resolve(data) would execute next with data === undefined, hiding the error",
        "return sends the error to the terminal immediately",
        "It does not matter; both forms are identical"
      ],
      answer: 1,
      why: "Both calls sit in the same callback body. reject(err) settles the promise, but execution would continue to the next line and call resolve(undefined) — harmless (the first settlement wins) but confusing; return makes the intent explicit and skips the dead code."
    },
    {
      q: "Which of these is Node's built-in promisified file system?",
      options: [
        "fs.async",
        "require(\"promise-fs\") — an npm package",
        "require(\"fs\").promises",
        "fs.readFilePromise only"
      ],
      answer: 2,
      why: "require(\"fs\").promises ships with Node (stable since v11.14) and gives readFile/writeFile/appendFile/unlink as promise-returning functions. util.promisify can build the same thing for any other error-first API."
    }
  ],
  sources: [
    "https://nodejs.org/api/fs.html#fspromises",
    "https://nodejs.org/api/util.html#utilpromisifyoriginal"
  ]
});
