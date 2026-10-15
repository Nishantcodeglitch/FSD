window.COURSE_LESSONS.push({
  id: "w01-express-server",
  file: "010",
  unit: 1,
  week: 1,
  title: "Your first server with Express",
  kicker: "Unit I · Week 1 · Lesson 6 of 6",
  minutes: 16,
  objectives: [
    "Explain what a web server does and what a route is",
    "Build an Express app with app.get() and app.listen() and run it",
    "Test routes with the browser and curl, and add a JSON route plus a 404 handler"
  ],
  intro: `
    <p>Everything converges here. You know what Node is (Lesson 1), how to run it (Lesson 2), how a
    project folder is shaped (Lesson 3), what <code>package.json</code> records (Lesson 4) and how
    <code>npm install express</code> put Express on your disk (Lesson 5). Now you build the thing
    the whole week was aiming at: the journal's own <code>01_server.js</code> — a web server with
    a <code>GET /home</code> route on port 8080. We'll read it line by line, fix the small bug
    hiding in it, and then push further with new routes, a JSON response and a 404 handler.</p>
  `,
  theory: [
    `
      <h3>What a server actually does</h3>
      <p>A web server is a long-running program that waits on a <strong>port</strong> for HTTP
      requests. <strong>HTTP</strong> is the conversation format of the web: a client (browser,
      curl, later your React app) sends a <em>request</em> — a method plus a path, like
      <code>GET /home</code> — and the server answers with a <em>response</em> — a status code,
      headers and a body ("this is a homepage").</p>
      <p>A <strong>port</strong> is a number that picks which door on this machine the request
      should knock on. Web traffic defaults to port 80 (HTTP) and 443 (HTTPS); during
      development we use high numbers like <code>8080</code> or <code>3000</code> to avoid
      clashes. So <code>http://localhost:8080/home</code> means: "HTTP, on this machine, door
      8080, path /home".</p>
      <pre class="diagram">  browser                      node server.js
    │  GET /home                   │  listening on :8080
    │─────────────────────────────▶│
    │  200 OK                      │  app.get('/home', handler)
    │  "this is a homepage"        │
    │◀─────────────────────────────│</pre>
    `,
    `
      <h3>Express: routing without the boilerplate</h3>
      <p>Node has a built-in <code>http</code> module that can do all of this by itself — Week 2
      will show it — but it makes you handle a lot of plumbing by hand. Express is a thin
      <strong>framework</strong>: a layer of convenient tools on top of <code>http</code>. Its
      central idea is the <strong>route</strong>: a pair of (URL path, function) registered with a
      method-matching helper. <code>app.get('/home', fn)</code> reads as an English sentence:
      "when a <em>GET</em> request arrives for <em>/home</em>, call <em>fn</em>".</p>
      <p>Each route's function receives two objects:</p>
      <ul>
        <li><code>req</code> (request) — everything the client sent: <code>req.url</code>,
        <code>req.params</code>, headers, query string…</li>
        <li><code>res</code> (response) — tools for answering: <code>res.send()</code> for a body,
        <code>res.json()</code> for JSON, <code>res.status()</code> to set the status code.</li>
      </ul>
    `,
    `
      <h3>Reading the journal's server, line by line</h3>
      <p>Here is the entire Week 1 server — thirteen lines, and you can now name every piece:</p>
      <pre class="diagram">const express = require('express');  // load the installed package
const app = express();               // create the app object
const port = 8080;                   // which door to listen on

app.get('/home', function (req, res) {  // register a route
  res.send('this is a homepage');        // answer it
});

app.listen(port, function () {       // start listening
  console.log(\`server is running on http//localhost:\${port}\`);
});</pre>
      <p><code>app.listen(port, cb)</code> starts the listener and calls <code>cb</code> once it
      is ready — which is why the console message appears and then nothing else happens: the
      process stays alive, waiting. <strong>Stopping the server</strong> means pressing
      <code>Ctrl+C</code> in that terminal.</p>
      <div class="warn"><p><strong>Spot the bug in the journal file:</strong> the printed URL is
      <code>http//localhost:8080</code> — the colon after <code>http</code> is missing, so it
      isn't a valid address. The server works fine; only the message is wrong. The corrected
      version appears in an example below. (The journal notes also define Express as
      <em>"a backend web application framework for node js"</em> — exactly what you're holding.)</p></div>
    `,
    `
      <h3>Running it and testing it</h3>
      <p>From the folder containing the file:</p>
      <pre class="diagram">$ npm i express        # once per project
$ node 01_server.js
server is running on http://localhost:8080
# new terminal (or browser):
$ curl http://localhost:8080/home
this is a homepage</pre>
      <p>Requests to any path other than <code>/home</code> currently get Express's default 404
      (Not Found) page. In the examples we'll add our own 404 handler and a JSON route so the
      API starts behaving like the real back ends you'll build in Unit IV.</p>
    `
  ],
  examples: [
    {
      title: "The journal's complete server (01_server.js)",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/01_server.js",
      lang: "javascript",
      code: `const express = require('express'); //importing the express module
const app = express(); //create an express applications
const port = 8080;

app.get('/home',function (req,res){ //defining the rout of the url 
res.send('this is a homepage');


});

app.listen(port, function(){
    console.log(\`server is running on http//localhost:\${port}\`);
})`,
      explain: [
        "Lines 1–3: load Express, create the app, choose port 8080. You could rename the port variable to 3000 and nothing else would change.",
        "<code>app.get('/home', fn)</code> registers the only route: GET requests to path <code>/home</code> get \"this is a homepage\"; every other path 404s.",
        "<code>res.send()</code> ends the request — Express even sets the Content-Type and content length for you.",
        "<code>app.listen(8080, cb)</code> keeps the process running; the callback logs the ready message.",
        "<strong>Bug preserved from the journal:</strong> <code>http//localhost</code> is missing its colon — the message prints a broken URL. Functional, but fix it (see the next example)."
      ],
      run: "node 01_server.js   (after: npm i express)",
      output: "server is running on http//localhost:8080"
    },
    {
      title: "The same server with the URL bug fixed and comments tidied",
      from: "new",
      lang: "javascript",
      code: `const express = require('express');
const app = express();
const port = 8080;

// Route: method GET, path /home
app.get('/home', function (req, res) {
  res.send('this is a homepage');
});

app.listen(port, function () {
  console.log(\`server is running on http://localhost:\${port}\`);
});`,
      explain: [
        "Only change versus the journal file: <code>http//</code> → <code>http://</code> in the template literal. Small typo, big confusion — always copy-paste printed URLs to test them.",
        "A template literal (backticks) lets us drop the port into the string with <code>\${port}</code> instead of string concatenation.",
        "Save as <code>server.js</code>, run it, then visit <a href='http://localhost:8080/home' target='_blank' rel='noopener'>http://localhost:8080/home</a>.",
        "<code>Ctrl+C</code> in the terminal stops the server. Every server in this book obeys this same lifecycle: start, log, wait, Ctrl+C."
      ],
      run: "node server.js",
      output: "server is running on http://localhost:8080"
    },
    {
      title: "The journal README confirms the run sequence",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/README.txt",
      lang: "text",
      code: `Week 1: Intro to Node.js. server.js needs \`npm i express\` then \`node server.js\` (port 8080).`,
      explain: [
        "The README's two commands are the exact ritual: <code>npm i express</code> once, <code>node server.js</code> whenever you want the server up.",
        "\"port 8080\" in the README matches the <code>const port = 8080</code> in the code — docs and code agreeing is the goal.",
        "If you ever get EADDRINUSE, another process still owns port 8080 — close it or change the port."
      ]
    },
    {
      title: "Testing the server from the terminal",
      from: "new",
      lang: "bash",
      code: `# terminal 1 — start the server
$ node server.js
server is running on http://localhost:8080

# terminal 2 — talk to it
$ curl http://localhost:8080/home
this is a homepage

$ curl -i http://localhost:8080/home
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
this is a homepage

$ curl http://localhost:8080/nope
Cannot GET /nope`,
      explain: [
        "Two terminals: one runs the long-lived server, one acts as the client. (Browsers work as clients too — visit the URL directly.)",
        "<code>curl</code> sends an HTTP request and prints the response body — the developer's stethoscope for servers.",
        "<code>-i</code> includes the headers, revealing <code>HTTP/1.1 200 OK</code> — status 200 means success.",
        "<code>Cannot GET /nope</code> is Express's built-in 404 for unregistered paths — we'll replace it with our own handler below."
      ],
      run: "curl http://localhost:8080/home"
    },
    {
      title: "The journal's functions file is the callback pattern you just used",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/02_functions.js",
      lang: "javascript",
      code: `function greet(name, age){
    let alloo = "4kg";
    console.log(alloo + " welcome " + name, " ", age);
}
greet("john", 8999);

let greeet = (naam, age) => console.log(naam, age);
greeet("aloo", 34);

let sum = (a , b) => console.log(a + b);
sum(5, 5);`,
      explain: [
        "The preface file drilled exactly the skill the server needs: passing functions as values. <code>sum</code> is a function stored in a variable — same idea as <code>app.get('/home', function (req, res) {...})</code>.",
        "In <code>greeet(\"aloo\", 34)</code> the function receives arguments; in the server, Express calls your handler with <code>req</code> and <code>res</code>. You write it, Express calls it — a <em>callback</em>.",
        "Rewrite any of these arrows to match the server's style: <code>app.get('/home', (req, res) => res.send('this is a homepage'))</code> — one line, same behaviour."
      ],
      run: "node 02_functions.js",
      output: `4kg welcome john    8999
aloo 34
10`
    },
    {
      title: "Growing the app: /about, a JSON API route, and our own 404",
      from: "new",
      lang: "javascript",
      code: `const express = require('express');
const app = express();
const port = 8080;

app.get('/home', function (req, res) {
  res.send('this is a homepage');
});

app.get('/about', function (req, res) {
  res.send('About page: CSA 301 Full Stack Development');
});

app.get('/api/student', function (req, res) {
  res.json({ roll: 2408023, name: 'Nishant', subject: 'FSD' });
});

// Catch-all: any path not matched above lands here
app.use(function (req, res) {
  res.status(404).send('404 - page not found');
});

app.listen(port, function () {
  console.log(\`server is running on http://localhost:\${port}\`);
});`,
      explain: [
        "Three route registrations = three working URLs. Express checks them top to bottom; the first match wins.",
        "<code>res.json()</code> serialises the object and sets the JSON content type — this is how real APIs answer; your React front end in Unit IV will call routes just like this one.",
        "<code>app.use(fn)</code> with no path is a middleware that runs for <em>every</em> request — placed last, it becomes a custom 404 (Not Found) handler.",
        "<code>res.status(404).send(...)</code> chains: set the status code, then send the body. The browser now shows your message, not Express's default."
      ],
      run: "node server.js   (then curl each route)",
      output: `server is running on http://localhost:8080
$ curl http://localhost:8080/api/student
{"roll":2408023,"name":"Nishant","subject":"FSD"}`
    },
    {
      title: "The same server in raw Node http — no Express at all",
      from: "new",
      lang: "javascript",
      code: `const http = require('http');
const port = 8080;

const server = http.createServer(function (req, res) {
  if (req.method === 'GET' && req.url === '/home') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('this is a homepage');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - page not found');
  }
});

server.listen(port, function () {
  console.log(\`server is running on http://localhost:\${port}\`);
});`,
      explain: [
        "<code>require('http')</code> is a <em>built-in</em> module — no npm install needed. Express itself is built on exactly this module.",
        "You must branch manually on <code>req.method</code> and <code>req.url</code>, set headers with <code>writeHead</code> and end with <code>res.end()</code> — that's the boilerplate Express removes.",
        "Same output as the Express version of <code>/home</code>, ~the same line count here, but imagine ten routes: Express's <code>app.get</code> wins on clarity. That's the trade-off this comparison makes visible.",
        "Week 2, lesson \"Built-in modules: http and path\", returns to this style on purpose — frameworks are clearer once you've seen what they abstract."
      ],
      run: "node raw-server.js",
      output: "server is running on http://localhost:8080"
    }
  ],
  keyPoints: [
    "A server listens on a port and answers HTTP requests with a status, headers and a body",
    "Express routes pair a method + path with a handler: app.get('/home', fn)",
    "Route handlers receive req (what the client sent) and res (how you answer)",
    "app.listen() starts the listener; Ctrl+C stops the process",
    "res.json() powers APIs, and a final app.use() handler is the standard custom-404 trick",
    "The journal's 01_server.js works but prints http//localhost — missing colon; fix the message"
  ],
  practice: `
    <p>Copy the journal's <code>01_server.js</code> into a scratch folder, run
    <code>npm i express</code>, start it and open <code>http://localhost:8080/home</code>. Then:
    fix the URL typo in the log message; change the port to 3000 and update the message to match;
    add a <code>GET /greet</code> route that responds \"welcome 2408023\"; and add the catch-all
    404 handler from Example 5. Test each change with <code>curl</code> before moving on — you
    have just written your first real web API.</p>
  `,
  quiz: [
    {
      q: "In app.get('/home', function (req, res) { ... }), what does the function do?",
      options: [
        "It is the route handler: called whenever a client sends GET /home, and it crafts the response",
        "It runs once when the server starts",
        "It installs Express into node_modules",
        "It redirects the browser to the home page automatically"
      ],
      answer: 0,
      why: "app.get(path, handler) registers a route. The handler runs per matching request with req (client's request) and res (response tools)."
    },
    {
      q: "How do you stop a running Node server started with node server.js?",
      options: [
        "Press Ctrl+C in the terminal running it",
        "Close the browser tab",
        "Run npm stop-server",
        "It stops by itself after 60 seconds"
      ],
      answer: 0,
      why: "app.listen() keeps the process alive indefinitely waiting for requests. Ctrl+C sends an interrupt that terminates it. (Closing the browser just closes one client — the server keeps listening.)"
    }
  ],
  sources: [
    "https://expressjs.com/en/starter/hello-world.html",
    "https://expressjs.com/en/guide/routing.html",
    "https://nodejs.org/api/http.html"
  ]
});
