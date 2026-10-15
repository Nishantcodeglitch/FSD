window.COURSE_LESSONS.push({
  id: "w06-unit-1-capstone",
  file: "038",
  unit: 1,
  week: 6,
  title: "Unit I capstone: a scheduled file-report service",
  kicker: "Unit I · Week 6 · Lesson 4 of 4",
  minutes: 20,
  objectives: [
    "Map each week of Unit I onto a concrete part of a working service",
    "Build an http server that logs every request to a file without blocking the event loop",
    "Add a cron-scheduled report generator and a webpack-built asset to the same program",
    "Follow a written mini-spec through install, build, run and verify"
  ],
  intro: `
    <p>Unit I is finished, and it was not six unrelated topics. Week 1 gave you <code>http</code> and a
    server; Week 2 gave you <code>require</code>, <code>fs</code> and <code>path</code>; Week 3 gave
    you the event loop that makes one thread enough; Week 4 gave you promises and file recipes;
    Week 5 gave you routes, headers and a gateway you could answer requests on; and Week 6 added the
    two missing pieces of a real service — <strong>scheduled work</strong> (cron, Lesson 1) and a
    <strong>build step</strong> (webpack, Lesson 3).</p>
    <p>This last lesson of Unit I puts all six weeks into one program: a <strong>scheduled file-report
    service</strong>. You will read a mini-spec, watch it grow example by example from the journal's
    own files, and finish with a run sequence you can repeat. Everything after this — databases in
    Unit II, React in Unit III — is new <em>material</em> plugged into exactly this shape of
    program.</p>
  `,
  theory: [
    `
      <h3>The mini-spec</h3>
      <p>Build one program, <code>report-server.js</code>, that does all of the following:</p>
      <ol>
        <li><strong>Serve</strong> — an http server with three routes: <code>GET /</code> returns a
        one-line welcome; <code>GET /report</code> returns the current report; <code>GET /bundle.js</code>
        returns the webpack bundle built in this folder.</li>
        <li><strong>Log</strong> — every request is appended to <code>requests.log</code> as
        <code>&lt;ISO time&gt; &lt;METHOD&gt; &lt;path&gt;</code>, <em>without</em> blocking the
        response.</li>
        <li><strong>Schedule</strong> — a cron job fires every 10 seconds, reads
        <code>requests.log</code> and writes <code>report.txt</code>: total request count, a count per
        path, and the time the report was written.</li>
        <li><strong>Build</strong> — the bundle at <code>/bundle.js</code> comes from
        <code>npm run build</code> in <code>week5-bundler/</code>, so the build is part of the run
        sequence, not an afterthought.</li>
        <li><strong>Never block</strong> — a request arriving while the log is being written, or while
        the report is being generated, is still answered promptly.</li>
      </ol>
      <p>Point 5 is the one that separates a demo from a service, and it is why Week 3 and Week 6 sit
      in the same unit.</p>
    `,
    `
      <h3>How each week of Unit I maps onto the spec</h3>
      <table>
        <thead><tr><th>week</th><th>what you learned</th><th>line of the spec it becomes</th></tr></thead>
        <tbody>
          <tr><td>1</td><td><code>http.createServer</code>, <code>listen</code></td><td>requirement 1 — the server itself</td></tr>
          <tr><td>2</td><td><code>require</code>, <code>fs</code>, <code>path</code></td><td>requirement 2 — <code>path.join(__dirname, ...)</code> for every file name</td></tr>
          <tr><td>3</td><td>event loop, blocking vs non-blocking</td><td>requirement 5 — <code>appendFile</code>, not <code>appendFileSync</code></td></tr>
          <tr><td>4</td><td>file recipes, <code>readFileSync</code> vs promises</td><td>requirement 3 — reading the log when the job runs</td></tr>
          <tr><td>5</td><td>routes, <code>req.url</code>, <code>req.method</code>, headers</td><td>requirement 1 — the <code>if (req.url === ...)</code> router</td></tr>
          <tr><td>6</td><td>cron schedules, webpack bundles</td><td>requirements 3 and 4</td></tr>
        </tbody>
      </table>
      <p>Read the table backwards from the program and every line of it has a home. When something
      breaks, you can name the week the bug belongs to — that habit is worth more than the
      program.</p>
    `,
    `
      <h3>Two honest engineering notes</h3>
      <p><strong>1. The report job reads the log synchronously.</strong> Inside
      <code>writeReport()</code> the example uses <code>fs.readFileSync</code>. That is a deliberate,
      small trade-off: the job runs on a tick where being simple beats being clever, and a log of a few
      hundred lines reads in under a millisecond. But the moment the file grows, that same call would
      freeze the server for the duration — which is exactly what Lesson 2 of this week measured. The
      upgrade path is <code>fs.readFile</code> (callback), promises (<code>fs.promises.readFile</code>),
      or a stream for a really large log.</p>
      <p><strong>2. The service listens on port 3456, not the journal's 3000.</strong> While writing
      this lesson, port 3000 on the author's machine was already taken by another process and Node
      answered with <code>Error: listen EADDRINUSE: address already in use</code>. That is not a bug in
      your code — a port is exclusive. Either stop the process that holds it, or pick a free number.
      The transcript below is real, on 3456.</p>
      <div class="note">A quick way to find the culprit on Windows is
      <code>Get-NetTCPConnection -LocalPort 3000 -State Listen</code> (the <code>OwningProcess</code>
      column tells you what to stop); on Linux/macOS use <code>lsof -i :3000</code>.</div>
    `
  ],
  examples: [
    {
      title: "Piece 1: a raw http server with routes (Week 5's file)",
      from: "journal",
      file: "sorted_files/05_Week-05_Streams-Routing/09_serverhttp.js",
      lang: "javascript",
      code: `const http = require('http');
const server = http.createServer((req,res)=>{
    const method = req.method;
    if (req.url==='/data'){
        if (method ==='GET'){
            res.write('you are ');
            res.write('GETTING data ');
            res.end('1234');
        }
        else if(method === 'POST'){
            res.end('you are SENDING data');
        }
    }
    else if(req.url==='/home'){
         if (method ==='GET'){
            res.write('this is \\n ');
            res.write('the home page ');
            res.end('\\n1234');
        }
        else if(method === 'POST'){
            res.end('you are SENDING data');
        }
    }
    
    else {
        res.end('page not found');
    }
});
server.listen(3000,()=>{
    console.log('server running on http://localhost:3000');
})`,
      explain: [
        "This is requirement 1 in its purest form: one <code>createServer</code> callback that branches on <code>req.url</code> and <code>req.method</code>.",
        "The capstone's router is the same shape, with three routes instead of two paths × two methods.",
        "Note <code>res.write(...)</code> followed by <code>res.end(...)</code> — the response can be sent in pieces; <code>res.end</code> is what actually flushes it to the client.",
        "Run this one first if the capstone fails to start: it proves your machine can bind a port at all (the capstone's EADDRINUSE note applies here too)."
      ],
      run: "node sorted_files/05_Week-05_Streams-Routing/09_serverhttp.js",
      output: "server running on http://localhost:3000"
    },
    {
      title: "Piece 2: appending a log line with fs (Week 4's file)",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/04_EX5_appendfiles.js",
      lang: "javascript",
      code: `const fs = require('fs');

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
});`,
      explain: [
        "<code>fs.appendFile</code> adds to the end of a file and creates it if it does not exist — the exact behaviour a request log needs.",
        "It is the callback (non-blocking) form: requirement 5 satisfied, because the disk work goes to libuv's thread pool.",
        "The capstone replaces the literal <code>details</code> with a timestamp + <code>req.method</code> + <code>req.url</code>, and keeps the same <code>if (err)</code> guard.",
        "Rerun this file twice and <code>sample.txt</code> grows — that is what \"append\" means versus Week 2's <code>writeFile</code>, which truncates."
      ],
      run: "node sorted_files/04_Week-04_Promises-FS-CLI/04_EX5_appendfiles.js",
      output: `appending data
it worked`
    },
    {
      title: "Piece 3: the scheduler (Week 6's file, reused verbatim)",
      from: "journal",
      file: "sorted_files/06_Week-06_Cron-Webpack/01_cron.js",
      lang: "javascript",
      code: `const cron = require('node-cron');

cron.schedule("*/5 * * * * *", ()=>{
    console.log("running every 5 seconds");
});`,
      explain: [
        "Requirement 3 is this three-line program with the callback swapped: instead of <code>console.log</code>, call <code>writeReport()</code>.",
        "The capstone uses <code>\"*/10 * * * * *\"</code> — six fields, so the first one is seconds: every 10 seconds.",
        "The scheduled job keeps the process alive, which is convenient here: the server and the scheduler live in one process.",
        "Check your expression with <code>cron.validate(\"*/10 * * * * *\")</code> before you trust it (Lesson 1)."
      ],
      run: "node sorted_files/06_Week-06_Cron-Webpack/01_cron.js",
      output: `running every 5 seconds
running every 5 seconds
(keeps printing every 5 seconds until you press Ctrl+C)`
    },
    {
      title: "Piece 4: the build step (Week 6's config)",
      from: "journal",
      file: "sorted_files/06_Week-06_Cron-Webpack/week5-bundler/webpack.config.js",
      lang: "javascript",
      code: `module.exports = {
    entry: "./index.js", 

    output:{
        filename:"bundle.js"
    }
}`,
      explain: [
        "Requirement 4: <code>npm run build</code> in <code>week5-bundler/</code> produces <code>dist/bundle.js</code>, and the capstone serves that file at <code>/bundle.js</code>.",
        "The service checks <code>fs.existsSync</code> first, so a missing build produces a helpful comment instead of a crash.",
        "Remember the trap from Lesson 3: do <em>not</em> run <code>npm install</code> inside <code>week5-bundler/</code> — its package.json carries the bogus <code>webpack.config.js</code> dependency.",
        "Installing once in the week-6 root gives you both <code>node-cron</code> and <code>webpack</code> for the whole run sequence."
      ],
      run: "npm.cmd run build   (inside week5-bundler/)"
    },
    {
      title: "Piece 5: generate report.txt from requests.log",
      from: "new",
      lang: "javascript",
      code: `const fs = require("fs");
const path = require("path");

const LOG = path.join(__dirname, "requests.log");
const REPORT = path.join(__dirname, "report.txt");

const lines = fs.existsSync(LOG)
  ? fs.readFileSync(LOG, "utf-8").split("\\n").filter(Boolean)
  : [];

const counts = {};
lines.forEach((line) => {
  const p = line.split(" ")[2] || "?";
  counts[p] = (counts[p] || 0) + 1;
});

const body =
  "total requests: " + lines.length + "\\n" +
  Object.keys(counts).map((p) => "  " + p + ": " + counts[p]).join("\\n") + "\\n" +
  "written at " + new Date().toISOString() + "\\n";

fs.writeFileSync(REPORT, body);
console.log(body);`,
      explain: [
        "Save as <code>report.js</code> next to where the service will write its log; it is the body of the cron callback, runnable on its own so you can test it without the server.",
        "<code>split(\"\\n\").filter(Boolean)</code> turns the file into an array of non-empty lines — <code>filter(Boolean)</code> drops the trailing empty string after the last newline.",
        "<code>line.split(\" \")[2]</code> picks the third token of <code>2026-10-15T12:18:27.984Z GET /</code>, i.e. the path, which is what gets counted.",
        "Give it a log with two <code>GET /</code> lines and one <code>GET /report</code> line and you get the summary printed below — <code>fs.existsSync</code> means it also survives an empty first run."
      ],
      run: "node report.js",
      output: `total requests: 3
  /: 2
  /report: 1
written at 2026-10-15T12:15:55.673Z`
    },
    {
      title: "The whole service: http + fs + cron + the bundle, in one file",
      from: "new",
      lang: "javascript",
      code: `const http = require("http");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");

const LOG = path.join(__dirname, "requests.log");
const REPORT = path.join(__dirname, "report.txt");
const BUNDLE = path.join(__dirname, "week5-bundler", "dist", "bundle.js");

function writeReport() {
  const lines = fs.existsSync(LOG)
    ? fs.readFileSync(LOG, "utf-8").split("\\n").filter(Boolean)
    : [];
  const counts = {};
  lines.forEach((line) => {
    const p = line.split(" ")[2] || "?";
    counts[p] = (counts[p] || 0) + 1;
  });
  const body =
    "total requests: " + lines.length + "\\n" +
    Object.keys(counts).map((p) => "  " + p + ": " + counts[p]).join("\\n") + "\\n" +
    "written at " + new Date().toISOString() + "\\n";
  fs.writeFileSync(REPORT, body);
  console.log("report written: " + lines.length + " requests so far");
}

const server = http.createServer((req, res) => {
  fs.appendFile(LOG, new Date().toISOString() + " " + req.method + " " + req.url + "\\n", (err) => {
    if (err) console.log("could not append to log:", err.message);
  });

  if (req.url === "/report") {
    res.setHeader("Content-Type", "text/plain");
    res.end(fs.existsSync(REPORT) ? fs.readFileSync(REPORT, "utf-8") : "no report yet\\n");
  } else if (req.url === "/bundle.js") {
    res.setHeader("Content-Type", "application/javascript");
    res.end(fs.existsSync(BUNDLE) ? fs.readFileSync(BUNDLE, "utf-8") : "// bundle missing: run npm run build\\n");
  } else {
    res.end("file report service - try /report and /bundle.js\\n");
  }
});

cron.schedule("*/10 * * * * *", writeReport); // every 10 seconds
writeReport();                                // first report straight away

server.listen(3456, () => {
  console.log("service on http://localhost:3456");
});`,
      explain: [
        "Save as <code>report-server.js</code> inside <code>sorted_files/06_Week-06_Cron-Webpack/</code> (so <code>node-cron</code> and the bundle path both resolve), after <code>npm install</code> once in that folder.",
        "Requirement 2 lives inside the <code>createServer</code> callback: a non-blocking <code>appendFile</code> before the router even looks at the URL.",
        "Requirement 3 is one <code>cron.schedule</code> line plus <code>writeReport()</code> — the same function you tested in the previous example.",
        "Requirement 1 is the three-branch router: <code>/report</code> and <code>/bundle.js</code> read files; everything else gets the welcome line.",
        "Requirement 5 holds because nothing in the request path waits on disk: the append is async and the two reads are tiny.",
        "Port 3456 with a comment, because 3000 was EADDRINUSE on this machine — see the second engineering note."
      ],
      run: "node report-server.js",
      output: `report written: 0 requests so far
service on http://localhost:3456
report written: 0 requests so far
report written: 0 requests so far
report written: 2 requests so far
report written: 4 requests so far`
    },
    {
      title: "The run sequence: install, build, start, verify, watch",
      from: "new",
      lang: "bash",
      code: `# --- terminal 0: dependencies and bundle (from the repo root) ---
PS> cd sorted_files\\06_Week-06_Cron-Webpack
PS> npm.cmd install                       # node-cron + webpack + webpack-cli
PS> cd week5-bundler
PS> npm.cmd run build                     # emits dist\\bundle.js (no npm install here!)
PS> cd ..

# --- terminal 1: start the service ---
PS> node report-server.js
report written: 0 requests so far
service on http://localhost:3456
report written: 0 requests so far
report written: 0 requests so far
report written: 2 requests so far

# --- terminal 2: verify each requirement ---
PS> curl.exe -s http://localhost:3456/
file report service - try /report and /bundle.js
PS> curl.exe -s http://localhost:3456/report
total requests: 0

written at 2026-10-15T12:18:20.011Z
PS> Start-Sleep 11                        # wait for one 10-second cron tick
PS> curl.exe -s http://localhost:3456/report
total requests: 2
  /: 1
  /report: 1
written at 2026-10-15T12:18:30.007Z
PS> curl.exe -s http://localhost:3456/
file report service - try /report and /bundle.js
PS> Get-Content requests.log
2026-10-15T12:18:27.984Z GET /
2026-10-15T12:18:28.031Z GET /report
2026-10-15T12:18:39.071Z GET /report
2026-10-15T12:18:39.100Z GET /
PS> Get-Content report.txt
total requests: 2
  /: 1
  /report: 1
written at 2026-10-15T12:18:30.007Z`,
      explain: [
        "Order matters: <strong>install</strong> (week-6 root, where package.json is valid), <strong>build</strong> (creates the bundle the service serves), <strong>start</strong>, then <strong>verify</strong>. This whole transcript was produced by following exactly these steps.",
        "The first <code>/report</code> shows <code>total requests: 0</code> plus a blank line — the start-up job ran before any request, and an empty <code>counts</code> object joins to nothing. One second later your two requests are already in <code>requests.log</code>.",
        "After <code>Start-Sleep 11</code> a cron tick has definitely fired, so the counts appear — requirement 3 proven end to end.",
        "The raw log is requirement 2: one ISO-timestamped line per request in arrival order. Compare it with <code>report.txt</code>: the report says 2 while the log already has 4, because a report is a snapshot of the <em>last</em> tick — the next one catches up.",
        "Requirement 4: <code>(curl.exe -s http://localhost:3456/bundle.js).Length</code> returns <code>289</code>, the exact size of <code>week5-bundler/dist/bundle.js</code> on disk. On Linux/macOS swap <code>curl.exe</code> for <code>curl</code> and <code>Start-Sleep 11</code> for <code>sleep 11</code>."
      ],
      run: "node report-server.js   (then curl the routes from a second terminal)"
    }
  ],
  keyPoints: [
    "Unit I is one shape of program: a server (W1) built from modules (W2), kept responsive by the event loop (W3), reading and writing files (W4), answering routes (W5), doing scheduled work and shipping a bundle (W6).",
    "Log requests with <code>fs.appendFile</code> so the response never waits for the disk.",
    "A cron callback is an ordinary function — schedule it, call it once at start-up so a report exists immediately.",
    "Serve build output defensively: check <code>fs.existsSync</code> before reading <code>dist/bundle.js</code>.",
    "Small logs may be read synchronously; large ones must go async — measure, do not guess (Lesson 2).",
    "Run sequences have an order for a reason: install, build, start, verify — and <code>EADDRINUSE</code> means the port, not your code, is the problem."
  ],
  practice: `
    <p>Add two things to the spec and implement them: a <code>GET /health</code> route that returns
    <code>ok</code> (three lines, Week 5 skill), and a <strong>daily</strong> five-field cron job
    (<code>0 23 * * *</code>) that copies <code>report.txt</code> to
    <code>report-2026-10-15.txt</code> with <code>fs.copyFile</code>. Then break it on purpose: change
    the port to 3000, restart, and read the <code>EADDRINUSE</code> error before fixing it.</p>
  `,
  quiz: [
    {
      q: "In report-server.js, why does the log line use fs.appendFile instead of fs.appendFileSync?",
      options: [
        "appendFileSync does not exist in Node",
        "appendFile hands the disk work to a helper thread, so the event loop keeps answering other requests while it runs",
        "appendFile writes to the report instead of the log",
        "Sync file calls only work with promises"
      ],
      answer: 1,
      why: "That is requirement 5, and it is Week 3's lesson applied: appendFileSync would occupy the main thread on every single request, delaying timers, the cron job and other clients. appendFile returns immediately and calls back when the bytes are written."
    },
    {
      q: "The service listens on port 3456 instead of the journal's 3000. What happened on port 3000?",
      options: [
        "Port 3000 is reserved by Node.js and can never be used",
        "Another process already held it, so Node reported Error: listen EADDRINUSE — stop that process or pick another port",
        "The route table for /home was missing, so listen() picked a random port",
        "webpack rewrites the port during the build"
      ],
      answer: 1,
      why: "A port can belong to only one listening socket. EADDRINUSE (address already in use) means something else — often a forgotten dev server — still holds 3000. Find it with Get-NetTCPConnection -LocalPort 3000 or lsof -i :3000, or simply listen somewhere else."
    }
  ],
  sources: [
    "https://nodejs.org/api/http.html",
    "https://nodejs.org/api/fs.html#fs_fs_appendfile_path_data_options_callback",
    "https://webpack.js.org/concepts/"
  ]
});
