window.COURSE_LESSONS.push({
  id: "w05-writing-files",
  file: "029",
  unit: 1,
  week: 5,
  title: "Writing files",
  kicker: "Unit I · Week 5 · Lesson 1 of 6",
  minutes: 15,
  objectives: [
    "Use writeFile, appendFile and their sync/promise variants to create and grow a file",
    "Explain the difference between write (overwrite) and append (add to the end)",
    "Choose the right flavour — callback, sync, or promise — for a given job"
  ],
  intro: `
    <p>In Week 4 you met the <code>fs</code> module and wrapped <code>fs.readFile</code> in promises. This
    lesson returns to <code>fs</code> from the other side: instead of reading a file you <em>create and
    grow</em> one. Writing files is the foundation under everything else in Week 5 — a stream is just a
    very efficient file writer, and a web server often saves request data to disk.</p>
    <p>Your journal already has a working append example, <code>04_EX5_appendfiles.js</code> (reused here
    from Week 4), plus a note file listing the four <code>fs</code> writing flavours. We will read that
    note, fix a small bug in the append example, and build up from there.</p>
  `,
  theory: [
    `
      <h3>Two verbs: write and append</h3>
      <p>Every file-writing function in <code>fs</code> does one of two things. <strong>Write</strong>
      (<code>writeFile</code>) replaces the whole file — if it already exists its old contents are thrown
      away and overwritten. <strong>Append</strong> (<code>appendFile</code>) keeps whatever is already in
      the file and adds your new text to the end. A diary uses append; a "reset settings" button uses
      write.</p>
      <ul>
        <li><code>fs.writeFile(path, data, cb)</code> — overwrite (create the file if missing).</li>
        <li><code>fs.appendFile(path, data, cb)</code> — add to the end (create the file if missing).</li>
      </ul>
      <p>Both accept an optional options object, which is where you pass <code>{ encoding: 'utf-8' }</code>
      or a flag like <code>'w'</code> (write) vs <code>'a'</code> (append).</p>
    `,
    `
      <h3>Three flavours: callback, sync, promise</h3>
      <p>Like <code>readFile</code>, each writing function comes in the same three styles you learned in
      Week 3 and Week 4:</p>
      <ul>
        <li><strong>Async callback</strong> — <code>fs.writeFile(path, data, (err) =&gt; {…})</code>. The
        normal choice: Node keeps running other work while the disk is busy.</li>
        <li><strong>Synchronous</strong> — <code>fs.writeFileSync(path, data)</code>. Freezes the whole
        program until the write finishes. Fine for a tiny script, bad for a server.</li>
        <li><strong>Promise</strong> — <code>fs.promises.writeFile(path, data)</code>. Returns a promise you
        can <code>await</code>, the modern clean style.</li>
      </ul>
      <p>The behaviour is identical; only how you wait for the result changes. The rule of thumb from Week
      3 still holds: in a server use the async or promise form so you never block the event loop.</p>
    `,
    `
      <h3>Write vs append, side by side</h3>
      <pre class="diagram">  writeFile("log.txt", "A")      appendFile("log.txt", "B")
  ─────────────────────         ──────────────────────────
  file: "A"                     file: "A"

  writeFile("log.txt", "C")     appendFile("log.txt", "D")
  ─────────────────────         ──────────────────────────
  file: "C"   (A is GONE)       file: "ABD"   (history kept)</pre>
      <p>The diagram is the whole idea: write replaces, append accumulates. This is why a log file is
      built with <code>appendFile</code> — you would lose the earlier lines every run if you used
      <code>writeFile</code>.</p>
    `
  ],
  examples: [
    {
      title: "The journal's append example (with the missing file explained)",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/04_EX5_appendfiles.js",
      lang: "javascript",
      code: `
const fs = require('fs');

console.log("appending data");

const details = \`student name: Raju
roll no: 2408028
course: bca
age: 2890
\`;

fs.appendFile('sample.txt', details, (err) => {
  if (err) {
    console.log("error", err);
  } else {
    console.log("it worked");
  }
});
`,
      explain: [
        "<code>require('fs')</code> loads the built-in file module — no npm install needed.",
        "<code>details</code> is a template literal spanning several lines, so the newline characters are part of the data being written.",
        "<code>fs.appendFile</code> creates <code>sample.txt</code> if it does not exist, otherwise adds these four lines to the end.",
        "The callback checks <code>err</code> first: a missing folder or locked file lands in the error branch, success prints <code>it worked</code>.",
        "Run it twice — the second run adds the same block again, which is exactly how append differs from write."
      ],
      run: "node 04_EX5_appendfiles.js",
      output: `appending data
it worked`
    },
    {
      title: "writeFile overwrites, appendFile adds",
      from: "new",
      lang: "javascript",
      code: `
const fs = require('fs');

// Start fresh so the output is predictable.
fs.writeFileSync('demo.txt', 'line one\n');

fs.appendFile('demo.txt', 'line two\n', (err) => {
  if (err) return console.log("append error", err);

  // Overwrite the whole file — "line one" and "line two" are lost.
  fs.writeFile('demo.txt', 'OVERWRITTEN\n', (err2) => {
    if (err2) return console.log("write error", err2);
    console.log("final file:");
    console.log(fs.readFileSync('demo.txt', 'utf-8'));
  });
});
`,
      explain: [
        "Save as <code>write-vs-append.js</code>. It builds the file with <code>appendFile</code> then replaces it with <code>writeFile</code>.",
        "<code>fs.writeFileSync</code> at the top clears the file so the demo always shows the same thing.",
        "The nested callbacks run in order: append, then write, then read — a small promise-free chain.",
        "The final read proves the point: after <code>writeFile</code> only <code>OVERWRITTEN</code> survives."
      ],
      run: "node write-vs-append.js",
      output: `final file:
OVERWRITTEN`
    },
    {
      title: "The three flavours doing the same job",
      from: "new",
      lang: "javascript",
      code: `
const fs = require('fs');
const fsp = fs.promises;

// 1) async callback
fs.writeFile('flavours.txt', 'from callback\n', (err) => {
  if (err) return console.log("cb error", err);
  console.log("1 callback wrote");

  // 2) sync — blocks until the file is on disk
  fs.appendFileSync('flavours.txt', 'from sync\n');
  console.log("2 sync appended");

  // 3) promise
  fsp.appendFile('flavours.txt', 'from promise\n')
     .then(() => console.log("3 promise appended"))
     .catch((e) => console.log("promise error", e));
});
`,
      explain: [
        "Save as <code>three-flavours.js</code>. All three write the same file, just waiting in three different ways.",
        "<code>fs.writeFile</code> with a callback is the classic style from Week 3.",
        "<code>fs.appendFileSync</code> has no callback — it returns only after the bytes hit the disk, blocking everything else briefly.",
        "<code>fs.promises.appendFile</code> returns a promise, the style you practised wrapping by hand in Week 4 — here Node hands it to you ready-made."
      ],
      run: "node three-flavours.js",
      output: `1 callback wrote
2 sync appended
3 promise appended`
    },
    {
      title: "async/await over fs.promises — the cleanest form",
      from: "new",
      lang: "javascript",
      code: `
const fsp = require('fs').promises;

async function buildReport() {
  await fsp.writeFile('report.txt', 'Weekly report\n');
  await fsp.appendFile('report.txt', 'items sold: 42\n');
  await fsp.appendFile('report.txt', 'revenue: 900\n');

  const text = await fsp.readFile('report.txt', 'utf-8');
  console.log(text);
}

buildReport().catch((e) => console.log("error", e.message));
`,
      explain: [
        "Save as <code>async-report.js</code>. Same three writes as before, but the flow reads top-to-bottom like ordinary code.",
        "<code>await</code> pauses the <code>buildReport</code> function — not the whole program — until each write finishes, so the event loop stays free.",
        "Because each line awaits the previous one, the file grows in order: header, then items, then revenue.",
        "The final <code>readFile</code> confirms all three appends landed together."
      ],
      run: "node async-report.js",
      output: `Weekly report
items sold: 42
revenue: 900`
    },
    {
      title: "A tiny append-only logger you can reuse",
      from: "new",
      lang: "javascript",
      code: `
const fs = require('fs');

function log(message) {
  const line = \`\${new Date().toISOString()}  \${message}\n\`;
  fs.appendFile('app.log', line, (err) => {
    if (err) console.log("could not write log:", err.message);
  });
}

log("server started");
log("user signed in");
log("cache warmed");

setTimeout(() => {
  console.log("--- app.log so far ---");
  console.log(fs.readFileSync('app.log', 'utf-8'));
}, 300);
`,
      explain: [
        "Save as <code>logger.js</code>. A real-world use of <code>appendFile</code>: a log that only ever grows.",
        "<code>new Date().toISOString()</code> stamps each line so you can tell entries apart.",
        "The <code>\${new Date().toISOString()}</code> and <code>\${message}</code> inside the log template are real: Node evaluates them and writes the filled-in line to the file.",
        "A <code>setTimeout</code> waits 300 ms to give the three async writes time to finish before reading the file back — a plain fix for \"why is my file empty?\"."
      ],
      run: "node logger.js",
      output: `--- app.log so far ---
2026-10-15T09:12:03.411Z  server started
2026-10-15T09:12:03.415Z  user signed in
2026-10-15T09:12:03.419Z  cache warmed   (timestamps will be yours)`
    }
  ],
  keyPoints: [
    "<code>writeFile</code> overwrites a file from scratch; <code>appendFile</code> adds to the end.",
    "Both create the file if it does not exist, and both report failure through the <code>err</code> argument.",
    "Each writer comes in three flavours: async callback, sync (blocking), and <code>fs.promises</code>.",
    "In servers prefer the async or promise form so the event loop is never blocked on disk.",
    "Writing is asynchronous by nature — if you read a file straight after writing it, give the write time to land (a callback, <code>await</code>, or a short timeout)."
  ],
  practice: `
    <p>Take <code>04_EX5_appendfiles.js</code> and turn it into a contact-book: loop over an array of three
    student objects and <code>appendFile</code> one formatted line each into <code>contacts.txt</code>. Run
    the program twice and open the file — you should see all six lines, because append keeps history. Then
    change one call to <code>writeFile</code> and watch the earlier lines vanish.</p>
  `,
  quiz: [
    {
      q: "My file currently contains \"AAA\". I run appendFile(\"f.txt\", \"B\"), then writeFile(\"f.txt\", \"C\"). What is in the file?",
      options: [
        "AAABC",
        "AB then C replaces it, so just \"C\"",
        "ACB",
        "The program errors out because you cannot mix the two"
      ],
      answer: 1,
      why: "appendFile adds a B (making \"AAB\"), but writeFile then throws the whole file away and writes \"C\". Write always replaces from the start."
    },
    {
      q: "Which statement about fs.writeFileSync is true?",
      options: [
        "It is faster than the async version in every case",
        "It blocks the event loop until the write finishes, so it is best avoided in a server",
        "It needs a callback as its third argument",
        "It can only create new files, never overwrite"
      ],
      answer: 1,
      why: "Sync fs calls stop everything — including handling other requests — until the disk work is done. Handy in a one-shot script, harmful in a server. It also overwrites, and takes no callback."
    }
  ],
  sources: [
    "https://nodejs.org/api/fs.html#fswritefile-path-data-options-callback",
    "https://nodejs.org/api/fs.html#fsappendfile-path-data-options-callback"
  ]
});
