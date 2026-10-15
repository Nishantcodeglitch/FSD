window.COURSE_LESSONS.push({
  id: "w02-builtin-http-path",
  file: "014",
  unit: 1,
  week: 2,
  title: "Built-in modules: http and path",
  kicker: "Unit I · Week 2 · Lesson 4 of 6",
  minutes: 18,
  objectives: [
    "Create a server with the built-in http module, with no framework",
    "Route a request by comparing req.url and answer with res.write/res.end",
    "Use path.join, basename, dirname and extname to build and pull apart paths",
    "Anchor file paths to the script folder with __dirname instead of your terminal's folder"
  ],
  intro: `
    <p>Last week your Express server was three lines of magic: <code>app.get('/home', ...)</code>,
    <code>app.listen(8080)</code>. Express is wonderful, but it is a third-party package doing
    lots of work behind those lines. This lesson removes it and shows the raw machinery with
    Node's own <code>http</code> module — through the journal's real
    <code>01_httpserver.js</code>, which serves <code>/home</code>, <code>/about</code> and
    <code>/contacts</code> with nothing but <code>if/else</code>.</p>
    <p>We then meet <code>path</code>, the small built-in that fixes the relative-path trap you
    hit at the end of the last lesson.</p>
  `,
  theory: [
    `
      <h3>A server without Express</h3>
      <p>The <code>http</code> module gives you two building blocks. <code>http.createServer(fn)</code>
      makes a server object; <code>listen(port, fn)</code> opens the door on a TCP port so
      browsers can talk to you. Everything in between is your callback, which fires
      <strong>once per request</strong> with two arguments:</p>
      <ul>
        <li><code>req</code> (request) — what the client asked for: <code>req.url</code>,
        <code>req.method</code>, headers.</li>
        <li><code>res</code> (response) — what you send back: <code>res.write(chunk)</code> adds
        body text, <code>res.end()</code> finishes the reply (it can also take the final chunk
        itself).</li>
      </ul>
      <pre class="diagram">browser ──GET /about──▶ http server ──▶ callback(req, res)
        ◀──"welcome to ABOUT PAGE"── res.end()</pre>
      <p>Express is this callback with nicer helpers. Where you wrote
      <code>app.get('/home', handler)</code> in Week 1, raw <code>http</code> gives you a single
      handler and you compare <code>req.url</code> yourself.</p>
    `,
    `
      <h3>Routing = if/else on req.url</h3>
      <p><code>req.url</code> is the path part of the request, so a chain of
      <code>if / else if / else</code> is a complete router. The journal's file maps four
      outcomes:</p>
      <table>
        <thead><tr><th>URL</th><th>Reply</th></tr></thead>
        <tbody>
          <tr><td><code>/home</code></td><td>welcome to HOMEEEEEEE PAGE</td></tr>
          <tr><td><code>/about</code></td><td>welcome to ABOUT PAGE</td></tr>
          <tr><td><code>/contacts</code></td><td>welcome to the contact page</td></tr>
          <tr><td><em>anything else</em></td><td>Welcome to the server</td></tr>
        </tbody>
      </table>
      <p>Two habits worth stealing from it: the <code>else</code> branch is your catch-all (what
      Express users call a 404 handler — example 7 shows how to give it a real status code), and
      the <code>console.log</code> lines run in <em>your terminal</em>, not in the browser — they
      are server-side logs. Week 5 returns to routing properly (methods, headers, queries).</p>
    `,
    `
      <h3>The path module: stop concatenating strings by hand</h3>
      <p>Paths are just strings — but the separator differs (<code>/</code> on macOS/Linux,
      <code>\\</code> on Windows), so hand-built paths break the moment a colleague runs your
      code. The built-in <code>path</code> module does it safely:</p>
      <ul>
        <li><code>path.join('a', 'b', 'c.txt')</code> — glue pieces with the right separator
        (and collapse <code>..</code> segments for you).</li>
        <li><code>path.basename(p)</code> / <code>path.dirname(p)</code> / <code>path.extname(p)</code>
        — the file name, its folder, its extension.</li>
        <li><code>path.resolve(p)</code> — turn a relative path into a full absolute one, starting
        at your terminal's folder.</li>
      </ul>
      <p>Then there is <strong><code>__dirname</code></strong>: a variable Node provides in every
      CommonJS file holding the folder of <em>that file</em>. Combine it with
      <code>path.join</code> and your script finds its data files no matter where it was launched
      from — the fix for the <code>readfilesync.js</code> trap from Lesson 3:</p>
      <pre>const file = path.join(__dirname, 'student.txt');  // next to THIS script
const data = fs.readFileSync(file, 'utf-8');</pre>
    `
  ],
  examples: [
    {
      title: "01_httpserver.js: the journal's raw http server with three routes",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/01_httpserver.js",
      lang: "javascript",
      code: `
const http = require('http');

const  myserver = http.createServer((req, res) => {
if(req.url == '/home'){
console.log("request sent to HOME us page");
res.write("welcome to HOMEEEEEEE PAGE");
res.end();
}
else if(req.url ==='/about'){
console.log("request sent to About us page");
res.write("welcome to ABOUT PAGE");
res.end();
}
else if(req.url==='/contacts'){
    console.log("request has been sent to CONTECT page");
    res.end("welcome to the contact page");
}
else {
    res.end("Welcome to the server");
}
});

myserver.listen(8080, function(error){
if (error){
    console.log("this error is ", error)
}
else{
    console.log("the server is running");
}
});
`,
      explain: [
        "<code>require('http')</code> is a built-in — compare with <code>require('express')</code> in Week 1: no install, no <code>node_modules</code>.",
        "One callback handles every request; <code>req.url</code> decides which branch answers.",
        "<code>res.write(...)</code> followed by <code>res.end()</code> sends body then closes; on <code>/contacts</code> the journal calls <code>res.end(\"...\")</code> directly, which does both at once — equally valid.",
        "<code>listen(8080, cb)</code> runs the callback once the port is open; the server then stays alive, so stop it with Ctrl+C.",
        "The console messages appear in the terminal (server log), the res text appears in the browser."
      ],
      run: "node sorted_files/02_Week-02_Modules/01_httpserver.js",
      output: "the server is running"
    },
    {
      title: "Talking to it: curl each route",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# start the server in one terminal, then run these in a second one
curl http://localhost:8080/home
curl http://localhost:8080/about
curl http://localhost:8080/contacts
curl http://localhost:8080/anything-else
`,
      explain: [
        "<code>curl</code> is a tiny command-line HTTP client — faster than opening a browser while you test routes.",
        "Each call triggers the server callback once, so the terminal running the server logs one line per request.",
        "The last request lands in the <code>else</code> branch, proving your catch-all works.",
        "No <code>Content-Type</code> header is set by the journal file, so the browser treats the reply as plain text."
      ],
      run: "curl http://localhost:8080/home",
      output: "welcome to HOMEEEEEEE PAGE\nwelcome to ABOUT PAGE\nwelcome to the contact page\nWelcome to the server"
    },
    {
      title: "The same three routes, written with Express (Week 1's file)",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/01_server.js",
      lang: "javascript",
      code: `
const express = require('express'); //importing the express module
const app = express(); //create an express applications
const port = 8080;

app.get('/home',function (req,res){ //defining the rout of the url 
res.send('this is a homepage');


});

app.listen(port, function(){
    console.log(\`server is running on http//localhost:\${port}\`);
})
`,
      explain: [
        "Put this next to example 1: <code>app.get('/home', handler)</code> <em>is</em> an <code>if (req.url === '/home')</code> that Express writes for you, plus status codes, headers and more.",
        "<code>res.send(...)</code> finishes the reply in one call (raw http needs <code>res.end</code>), and <code>app.listen</code> wraps <code>http.createServer(...).listen(...)</code>.",
        "This is Week 1's file included for comparison — it is a different lab folder, and it is where this whole course started.",
        "<strong>Spot the bug:</strong> the logged URL says <code>http//localhost:8080</code> — the colon after <code>http</code> is missing, so you cannot click the address. Fix: <code>http://localhost:${port}</code>."
      ],
      run: "node sorted_files/01_Week-01_Node-Intro/01_server.js",
      output: "server is running on http//localhost:8080"
    },
    {
      title: "README.txt: the journal's own warning about folders",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/README.txt",
      lang: "text",
      code: `
Week 2: Node modules. Run inside subfolders so require() resolves, e.g. modules/ \`node app.js\`.
week5-bundler/ is the same pair reused as webpack input in Week 6.
`,
      explain: [
        "The journal's two-line README for this week — worth reading before you run anything.",
        "Partly a myth, now that you know resolution: <code>require('./cal.js')</code> resolves from the <em>requiring file</em>, so entry points can be launched from the repo root.",
        "It is <strong>not</strong> a myth for <code>fs</code> paths — <code>student.txt</code> inside readfilesync.js really does start at your terminal's folder, which is why Lesson 3's runs all begin with <code>cd .../modules</code>.",
        "Line 2 foreshadows Week 6: these same files become webpack's input."
      ]
    },
    {
      title: "path: join, basename, dirname, extname",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const path = require("path");

const full = path.join("projects", "fsd", "notes.txt");

console.log("join:    ", full);
console.log("basename:", path.basename(full));
console.log("extname: ", path.extname(full));
console.log("dirname: ", path.dirname(full));
`,
      explain: [
        "<code>path.join</code> inserts the correct separator for the current OS — run this on Windows and you get <code>projects\\fsd\\notes.txt</code> instead.",
        "<code>basename</code>, <code>extname</code> and <code>dirname</code> pull the three useful pieces out of a path string without any <code>split('/')</code> gymnastics.",
        "All of it is pure string work — nothing touches the disk until you hand a result to <code>fs</code>."
      ],
      run: "node path-demo.js",
      output: "join:     projects/fsd/notes.txt\nbasename: notes.txt\nextname:  .txt\ndirname:  projects/fsd"
    },
    {
      title: "__dirname + path.join: a file path that never breaks",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// save this NEXT TO student.txt (inside the journal's modules/ folder)
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "student.txt");
const data = fs.readFileSync(file, "utf-8");

console.log(data);
`,
      explain: [
        "<code>__dirname</code> is the folder of <em>this script</em>; joining with <code>student.txt</code> anchors the lookup to the script, not to your terminal.",
        "Because of that, this file runs correctly from the repo root, from <code>modules/</code>, or from anywhere — unlike the journal's <code>readfilesync.js</code>, which only works when you <code>cd</code> first.",
        "<code>path.join</code> also repairs <code>/</code> vs <code>\\</code>, so the same line works on every OS."
      ],
      run: "node sorted_files/02_Week-02_Modules/modules/whereami.js",
      output: "welcome to nodejs 2\nwelcome to nodejs 3\nwelcome to nodejs 4"
    },
    {
      title: "A proper 404: status codes with res.writeHead",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url === "/time") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("now: " + new Date().toISOString());
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 - page not found");
  }
});

server.listen(8081, () => console.log("status server on http://localhost:8081"));
`,
      explain: [
        "<code>res.writeHead(status, headers)</code> sets the HTTP status and headers before the body — the journal's file skips it, so every reply claims a default 200.",
        "<code>200</code> means OK, <code>404</code> means Not Found — browsers, curl and every API client switch behaviour on these numbers (you will rely on them in Unit IV).",
        "The <code>Content-Type: text/plain</code> header tells the client the body is plain text; example 1 sends none, which is why the browser guesses.",
        "Port 8081 avoids clashing with example 1 — you can even run both servers at once."
      ],
      run: "node status-server.js",
      output: "status server on http://localhost:8081"
    }
  ],
  keyPoints: [
    "<code>http.createServer(callback)</code> plus <code>listen(port)</code> is the entire server — Express is only a friendlier layer on top.",
    "Raw routing is <code>if/else</code> on <code>req.url</code>; the final <code>else</code> is your 404.",
    "<code>res.write</code> adds body text, <code>res.end</code> finishes the reply, <code>res.writeHead</code> sets the status and headers first.",
    "<code>path.join/basename/dirname/extname</code> build and dissect paths portably.",
    "<code>path.join(__dirname, 'file.txt')</code> anchors a path to the script's folder and beats terminal-relative <code>fs</code> paths."
  ],
  practice: `
    <p>Run <code>node sorted_files/02_Week-02_Modules/01_httpserver.js</code>, then hit all four
    URLs from the theory table with <code>curl http://localhost:8080/...</code> and watch the
    terminal logs. Next, add a <code>/team</code> route to a <em>copy</em> of the file (do not
    edit the journal original) that answers <code>welcome to the TEAM page</code>, and add
    <code>res.writeHead(404)</code> to the final <code>else</code> so unknown URLs stop lying
    about being 200s. Finish by saving the <code>__dirname</code> example inside
    <code>modules/</code> and running it from three different folders.</p>
  `,
  quiz: [
    {
      q: "In http.createServer((req, res) => { ... }), where does the code learn which page the browser asked for?",
      options: [
        "req.url — you compare it yourself in an if/else chain",
        "res.write — it returns the requested path",
        "listen(8080) — the port identifies the page",
        "console.log — it prints the URL to read back"
      ],
      answer: 0,
      why: "req.url holds the request path (/home, /about...). Express turns that same comparison into app.get('/home', ...)."
    },
    {
      q: "Which expression makes 'student.txt' resolve next to the script regardless of where node was launched?",
      options: [
        "path.join(__dirname, 'student.txt')",
        "path.join(process.cwd(), 'student.txt')",
        "'./student.txt' passed straight to fs",
        "'student.txt' + __dirname"
      ],
      answer: 0,
      why: "__dirname is the script's own folder, while cwd() is the terminal's folder — anchoring to __dirname removes the dependency on where you ran node."
    }
  ],
  sources: [
    "https://nodejs.org/api/http.html",
    "https://nodejs.org/api/path.html"
  ]
});
