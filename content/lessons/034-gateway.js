window.COURSE_LESSONS.push({
  id: "w05-gateway",
  file: "034",
  unit: 1,
  week: 5,
  title: "Building a gateway with Node.js",
  kicker: "Unit I · Week 5 · Lesson 6 of 6",
  minutes: 17,
  objectives: [
    "Explain what an API gateway is and why an app with several services needs one",
    "Forward an incoming request to a matching route and return its result, using a lookup table",
    "Build the same routing shell in both Express and raw http, as your journal does"
  ],
  intro: `
    <p>This lesson is the capstone of Week 5. You can write files, stream them, read input, and route
    HTTP requests to different replies. A <strong>gateway</strong> is what happens when that routing
    grows up: a single front door that receives every request and decides which backing service should
    answer it. The name sounds grand, but the mechanism is precisely the routing you built in Lesson 4 —
    now pointed at other services instead of returning a string.</p>
    <p>Your journal's Week 5 folder contains two gateways plus a tiny app: <code>15_gateway.js</code> (an
    Express version), <code>16_gateway_http.js</code> (the same idea in raw <code>http</code>), and
    <code>17_app.js</code> (the standard-streams program from Lesson 3). Building both flavours side by
    side is the point — it shows that Express adds convenience, not new power.</p>
  `,
  theory: [
    `
      <h3>What a gateway is</h3>
      <p>An <strong>API gateway</strong> is one public entry point that sits in front of several services
      and routes each incoming request to the right one. Instead of clients memorising five URLs on five
      ports, they talk to one host, and the gateway does the matching:</p>
      <pre class="diagram">                  ┌──────────────┐        ┌── /users   → user service
  client ───────▶│   GATEWAY    │───────┼── /product → product service
  (one URL)      │  (port 8080) │        └── /orders  → order service
                 └──────────────┘</pre>
      <p>Because every request passes through it, the gateway is the natural place to add cross-cutting
      concerns — logging, authentication, rate limiting — exactly what <code>15_gateway.js</code> does
      with its one-line logging middleware.</p>
    `,
    `
      <h3>Routing is the same skill, aimed at services</h3>
      <p>Compare a gateway with the router from Lesson 4. The structure is identical: a callback that
      branches on <code>req.url</code> (and usually <code>req.method</code>), with a 404 fallback for
      anything unknown. The only difference is that instead of a hard-coded string, the branch hands the
      request to a service — here simulated by a distinct reply per path. In a real deployment each branch
      would make an outbound request (with <code>http.request</code> or a fetch) and stream the
      service's answer back to the client.</p>
      <ul>
        <li>Lesson 4's router: <code>req.url</code> → static HTML.</li>
        <li>A gateway: <code>req.url</code> → the matching backing service.</li>
      </ul>
    `,
    `
      <h3>Express vs raw http — your journal writes both</h3>
      <p>The journal explicitly notes there may be "two types of questions, one using http or one using
      express." Both are worth knowing:</p>
      <table>
        <thead><tr><th></th><th>Express (<code>15_gateway.js</code>)</th><th>Raw http (<code>16_gateway_http.js</code>)</th></tr></thead>
        <tbody>
          <tr><td>Route</td><td><code>gateway.get("/about", (req,res) =&gt; …)</code></td><td><code>if (req.url === "/about") …</code></td></tr>
          <tr><td>Shared logic</td><td><code>gateway.use(fn)</code> middleware + <code>next()</code></td><td>just call it first in the callback</td></tr>
          <tr><td>Reply</td><td><code>res.send("text")</code></td><td><code>res.end("text")</code> (+ <code>writeHead</code>)</td></tr>
        </tbody>
      </table>
      <p>Express needs <code>npm install express</code> (Week 1); raw http needs nothing. Express reads
      better for many routes because <code>.get(path, fn)</code> declares the path next to the handler.</p>
    `
  ],
  examples: [
    {
      title: "The Express gateway with logging middleware",
      from: "journal",
      file: "sorted_files/05_Week-05_Streams-Routing/15_gateway.js",
      lang: "javascript",
      code: `
//we can get two types of questions one is using http or one using express
//import express
// we are creating with express.

const express = require("express");
const gateway = express();

gateway.use((req, res, next) => {
console.log("request:", req.url);
next();
});

//user
//we have to use next so we can get the data of the next route
gateway.get("/", (req, res)=>{
    res.send("welcome user");
});


gateway.get("/about", (req, res)=>{
    res.send("about");

});

gateway.get("/acount", (req, res)=>{
    res.send("account page");

});

gateway.get("/contact", (req, res)=>{
    res.send("contact page");

});

gateway.listen(3000, ()=>{
    console.log("server running on port 3000");
});
`,
      explain: [
        "<code>require(\"express\")</code> returns the framework; <code>express()</code> creates the app object (named <code>gateway</code> here).",
        "<code>gateway.use(fn)</code> registers middleware that runs on <em>every</em> request before any route; it logs the URL then calls <code>next()</code> to continue — without <code>next()</code> the request would hang.",
        "Each <code>gateway.get(path, handler)</code> is a route; <code>res.send(\"…\")</code> sets a body and ends the response for you.",
        "The comment <code>//we have to use next so we can get the data of the next route</code> captures the middleware contract precisely.",
        "Note the path <code>/acount</code> (one <code>c</code>) — routing is literal, so a client must type the same spelling or get Express's default 404."
      ],
      run: "node 15_gateway.js",
      output: `server running on port 3000
# each request also logs on the server terminal:
request: /
request: /about
request: /acount
request: /contact`
    },
    {
      title: "The same gateway in raw http, with an explicit 404",
      from: "journal",
      file: "sorted_files/05_Week-05_Streams-Routing/16_gateway_http.js",
      lang: "javascript",
      code: `
const http = require("http");
const server = http.createServer((req, res)=>{

    console.log("API Gateway: ");
    //console.log("Method", req.method);
    console.log("URL: ", req.url);


    if(req.url === "/users"){
        res.writeHead(200, {"content-type": "text-plain"});
        res.end("user service");
    }

    else if (req.url === "/product"){
        res.writeHead(200, {"content-type": "text/plain"});
        res.end("Product Services")
    }

      else if (req.url === "/new"){
        res.writeHead(200, {"content-type": "text/html"});
        res.end(\`
            <h1> this is a new page</h1>
            <br>
            <p>this is a HTML code</p>
            \`)
    }

else{
    res.writeHead(404,{"content-type":"text/plain"});
    res.end("Service Not Found");
}

});

server.listen(8080,()=>{console.log("it is running on 8080")})
`,
      explain: [
        "This is the raw-<code>http</code> twin of <code>15_gateway.js</code>: the same gateway, no Express dependency.",
        "Each branch is a \"service\" — <code>/users</code>, <code>/product</code>, <code>/new</code> — answering with its own content-type and body.",
        "The final <code>else</code> returns <code>404 \"Service Not Found\"</code>, the disciplined catch-all that Lesson 4 taught.",
        "<strong>Typo to notice:</strong> the <code>/users</code> branch sets <code>\"text-plain\"</code>, which is not a valid content-type (it should be <code>\"text/plain\"</code>). Browsers will usually still show the text, but it is wrong and worth fixing.",
        "Logging the URL on every request is the gateway's middleware-equivalent, done by hand at the top of the callback."
      ],
      run: "node 16_gateway_http.js",
      output: `it is running on 8080
# curl http://localhost:8080/users    →  user service
# curl http://localhost:8080/product →  Product Services
# curl http://localhost:8080/nope    →  404 Service Not Found`
    },
    {
      title: "A real forwarder: the gateway sends the request on and returns the answer",
      from: "new",
      lang: "javascript",
      code: `
const http = require('http');

// The backing service the gateway forwards to.
const users = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ service: 'users', count: 3 }));
});
users.listen(5001);

// The gateway: one public port in front of the private service.
const gateway = http.createServer((req, res) => {
  if (req.url === '/users') {
    const up = http.request(
      { host: 'localhost', port: 5001, path: '/users', method: req.method },
      (upRes) => {
        res.writeHead(upRes.statusCode, upRes.headers);   // relay status + headers
        upRes.pipe(res);                                   // relay the body (stream!)
      }
    );
    up.end();
  } else {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('no such service');
  }
});
gateway.listen(8000, () => console.log('gateway on http://localhost:8000'));
`,
      explain: [
        "Save as <code>forwarder.js</code>. This is the real gateway pattern: two servers, one public, one private.",
        "<code>http.request(...)</code> makes an <em>outbound</em> request from the gateway to the backing service on port 5001 — the other side of the <code>http</code> module you have been using as a server.",
        "<code>res.writeHead(upRes.statusCode, upRes.headers)</code> relays the service's status and headers straight through, so the client sees the original response.",
        "<code>upRes.pipe(res)</code> streams the service's body to the client — the pipe from Lesson 3 doing real work, with backpressure handled for free.",
        "Try <code>curl http://localhost:8000/users</code> (works) and <code>curl http://localhost:8000/zzz</code> (404 from the gateway itself, without ever reaching a service)."
      ],
      run: "node forwarder.js",
      output: `gateway on http://localhost:8000
# curl http://localhost:8080 → see below; use 8000 for this script
# curl http://localhost:8000/users  →  {"service":"users","count":3}
# curl http://localhost:8000/zzz    →  404 no such service`
    },
    {
      title: "A lookup-table gateway that dispatches to handler functions",
      from: "new",
      lang: "javascript",
      code: `
const http = require('http');

const services = {
  '/users':   () => ({ code: 200, body: 'user service' }),
  '/product': () => ({ code: 200, body: 'product service' }),
  '/orders':  () => ({ code: 200, body: 'order service' })
};

const gateway = http.createServer((req, res) => {
  const match = services[req.url];

  if (!match) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    return res.end('Service Not Found');
  }

  const { code, body } = match();
  res.writeHead(code, { 'content-type': 'text/plain' });
  res.end(body);
});

gateway.listen(8001, () => console.log('table gateway on http://localhost:8001'));
`,
      explain: [
        "Save as <code>table-gateway.js</code>. Same job as <code>16_gateway_http.js</code>, but routes live in an object of functions.",
        "Each value is a function returning the service's answer, so adding a service is one new entry — no growing if-ladder.",
        "<code>services[req.url]</code> returns <code>undefined</code> for an unknown path, and the <code>if (!match)</code> guard turns that into the 404.",
        "This maps one-to-one onto Express's <code>.get(path, fn)</code> — which is why <code>15_gateway.js</code> reads so cleanly."
      ],
      run: "node table-gateway.js",
      output: `table gateway on http://localhost:8001
# curl http://localhost:8001/orders  →  order service
# curl http://localhost:8001/zzz     →  404 Service Not Found`
    },
    {
      title: "A gateway that also logs with middleware-style next()",
      from: "new",
      lang: "javascript",
      code: `
const http = require('http');

// A tiny middleware runner, mimicking Express's use()/next().
function makeStack() {
  const fns = [];
  return {
    use: (fn) => fns.push(fn),
    run: (req, res) => {
      let i = 0;
      const next = () => {
        const fn = fns[i++];
        if (fn) fn(req, res, next);
      };
      next();
    }
  };
}

const app = makeStack();
app.use((req, res, next) => { console.log('logged:', req.url); next(); });
app.use((req, res, next) => { res.end('handled at ' + req.url); });

http.createServer((req, res) => app.run(req, res))
  .listen(8002, () => console.log('middleware gateway on http://localhost:8002'));
`,
      explain: [
        "Save as <code>middleware-gateway.js</code>. It rebuilds Express's core idea — <code>use()</code> plus <code>next()</code> — in about fifteen lines.",
        "<code>makeStack()</code> collects middleware functions; <code>run()</code> walks them in order.",
        "<code>next()</code> is the hand-off: the logger calls it to reach the handler, exactly like the comment in <code>15_gateway.js</code> explains.",
        "Seeing Express reproduced from scratch demystifies it: middleware is just an array of functions, each deciding whether to call the next one."
      ],
      run: "node middleware-gateway.js",
      output: `middleware gateway on http://localhost:8002
# after curl http://localhost:8002/hello the server prints:
logged: /hello
# and curl receives: handled at /hello`
    }
  ],
  keyPoints: [
    "A gateway is a single front door that routes each incoming request to the right backing service.",
    "Its routing is exactly Lesson 4's routing — branch on <code>req.url</code> (+ method), with a 404 catch-all.",
    "Express (<code>.get(path, fn)</code>) and raw <code>http</code> (<code>if/else</code>) implement the same gateway; your journal deliberately writes both.",
    "Middleware + <code>next()</code> is how Express runs shared logic (like logging) before every route.",
    "In a real forwarder the gateway uses <code>http.request</code> to call the service and <code>upRes.pipe(res)</code> to stream the answer back."
  ],
  practice: `
    <p>Turn <code>16_gateway_http.js</code> into a real forwarder for <em>two</em> backing services: start
    two small servers on ports 5001 and 5002 that each reply with a JSON message, then make the gateway
    forward <code>/users</code> to the first and <code>/product</code> to the second using
    <code>http.request</code> + <code>pipe</code> (see <code>forwarder.js</code>). Confirm with curl that
    both paths return their service's JSON, and that an unknown path still 404s from the gateway.</p>
  `,
  quiz: [
    {
      q: "What is the core job of an API gateway?",
      options: [
        "To compile JavaScript before it runs",
        "To be a single entry point that receives each request and routes it to the correct backing service",
        "To store data in a database",
        "To minify CSS for the browser"
      ],
      answer: 1,
      why: "A gateway sits in front of several services and dispatches each request by URL (and method) to the right one — the routing you built in Lesson 4, aimed at other services."
    },
    {
      q: "In the Express gateway, what does next() do?",
      options: [
        "It ends the response and sends it to the client",
        "It moves to the next route path automatically",
        "It passes control to the next middleware/route handler in the stack",
        "It forwards the request to another port"
      ],
      answer: 2,
      why: "<code>next()</code> hands control to the next function in the middleware chain. A middleware that forgets to call it leaves the request hanging, which is why the journal's comment stresses its importance."
    }
  ],
  sources: [
    "https://nodejs.org/api/http.html#httprequestoptions-callback",
    "https://expressjs.com/en/guide/using-middleware.html"
  ]
});
