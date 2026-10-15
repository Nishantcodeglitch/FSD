window.COURSE_LESSONS.push({
  id: "w05-request-headers",
  file: "033",
  unit: 1,
  week: 5,
  title: "Accessing request and response headers",
  kicker: "Unit I · Week 5 · Lesson 5 of 6",
  minutes: 14,
  objectives: [
    "Read the headers a client sent by printing req.headers",
    "Set a response header with res.setHeader or writeHead and explain content-type",
    "Explain what headers are for and spot the common ones (host, user-agent, content-type)"
  ],
  intro: `
    <p>Every HTTP request carries more than a URL and a body — it carries <em>metadata</em>: the type of
    content the client will accept, the browser's name, the length of the data, and so on. That metadata
    travels in <strong>headers</strong>, and you have already been setting one all week without naming it:
    <code>content-type</code>. This lesson makes headers explicit — reading the ones clients send and
    setting the ones your server replies with.</p>
    <p>Your journal has a twelve-line program for this, <code>14_responce_header.js</code> (the filename
    keeps the "responce" typo). It prints every incoming header, which is the fastest way to see what a
    real request looks like.</p>
  `,
  theory: [
    `
      <h3>What a header is</h3>
      <p>A <strong>header</strong> is a name/value pair sent alongside an HTTP request or response. Both
      sides use them to describe the message rather than carry its content. The request you send to a
      server always includes headers, whether you typed the URL by hand or a browser did:</p>
      <table>
        <thead><tr><th>Header</th><th>Sent by</th><th>Meaning</th></tr></thead>
        <tbody>
          <tr><td><code>host</code></td><td>client</td><td>which domain the request is for (a server can host many sites)</td></tr>
          <tr><td><code>user-agent</code></td><td>client</td><td>the browser/app making the request</td></tr>
          <tr><td><code>accept</code></td><td>client</td><td>content types the client is happy to receive</td></tr>
          <tr><td><code>content-type</code></td><td>either</td><td>what type the message body is (HTML, JSON, …)</td></tr>
          <tr><td><code>content-length</code></td><td>either</td><td>size of the body in bytes</td></tr>
        </tbody>
      </table>
    `,
    `
      <h3>Reading request headers: req.headers</h3>
      <p>Node gathers every incoming header into a plain object on the request:
      <code>req.headers</code>. Keys are lower-cased by Node (HTTP headers are case-insensitive, and Node
      normalises them), and values are strings. Printing the whole object is the beginner's best friend —
      it shows exactly what the client said.</p>
      <pre class="diagram">  req.headers  →  {
    host: 'localhost:3000',
    'user-agent': 'Mozilla/5.0 …',
    accept: 'text/html',
    connection: 'Keep-Alive'
  }</pre>
      <p>Individual headers are just properties: <code>req.headers.host</code>,
      <code>req.headers['user-agent']</code>, and so on. (Hyphenated names need bracket notation, which is
      why you see <code>['user-agent']</code> with square brackets.)</p>
    `,
    `
      <h3>Setting response headers</h3>
      <p>On the way out you attach headers to your response. There are two equivalent styles, and you have
      already used both this week:</p>
      <ul>
        <li><code>res.setHeader('content-type', 'text/html')</code> — set one header at a time, then write
        the body.</li>
        <li><code>res.writeHead(200, { 'content-type': 'text/html' })</code> — set the status code and a
        batch of headers in one call.</li>
      </ul>
      <p>The rule: send headers <em>before</em> any body data. Once <code>write()</code> or
      <code>end()</code> has flushed the first byte, Node sends the header block and it can no longer be
      changed — calling <code>setHeader</code> after writing throws an error. That is the header-side
      version of the "no writing after end" rule you met in the last lesson.</p>
    `
  ],
  examples: [
    {
      title: "The journal's header dumper",
      from: "journal",
      file: "sorted_files/05_Week-05_Streams-Routing/14_responce_header.js",
      lang: "javascript",
      code: `
//this is week 5

const http  = require('http');
const server = http.createServer((req, res)=>{
    console.log("All headers: ");
    console.log(req.headers);
    res.end("header recieved");
});

server.listen(3000, ()=>{
    console.log("server running on port 3000");
});
`,
      explain: [
        "<code>req.headers</code> is a plain object of every header the client sent — <code>console.log</code> prints them all at once.",
        "<code>res.end(\"header recieved\")</code> sends a body without ever setting a header; Node fills in defaults for you (a <code>text/plain</code> 200 response).",
        "Start the server, then visit <code>http://localhost:3000</code> in a browser and watch the server terminal fill with <code>host</code>, <code>user-agent</code>, <code>accept</code> and friends.",
        "Try it with <code>curl -v http://localhost:3000</code> too — the header set changes with the client, which is the whole lesson in one experiment."
      ],
      run: "node 14_responce_header.js",
      output: `server running on port 3000
# after a browser request, the server prints:
All headers:
{
  accept: 'text/html',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; …)',
  host: 'localhost:3000',
  connection: 'Keep-Alive'
}`
    },
    {
      title: "Read one specific header and branch on it",
      from: "new",
      lang: "javascript",
      code: `
const http = require('http');

const server = http.createServer((req, res) => {
  const host = req.headers.host || '(no host header)';
  const ua   = req.headers['user-agent'] || '(unknown client)';

  console.log('host:', host);
  console.log('user-agent:', ua);

  res.setHeader('content-type', 'text/plain');
  res.end('You asked for ' + req.url + ' on host ' + host);
});

server.listen(3100, () => console.log('header reader on http://localhost:3100'));
`,
      explain: [
        "Save as <code>read-one.js</code>. It reads two headers by name instead of dumping everything.",
        "<code>req.headers['user-agent']</code> needs square brackets because of the hyphen — <code>req.headers.user-agent</code> would be a syntax error.",
        "The <code>|| 'fallback'</code> guards cover clients that omit the header, so the reply never says <code>undefined</code>.",
        "<code>res.setHeader('content-type', 'text/plain')</code> is called before any body write, following the order rule from the theory."
      ],
      run: "node read-one.js",
      output: `header reader on http://localhost:3100
# after curl http://localhost:3100/hello
host: localhost:3100
user-agent: curl/8.x.x`
    },
    {
      title: "setHeader one at a time vs writeHead in one call",
      from: "new",
      lang: "javascript",
      code: `
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/one') {
    // Style A: individual headers, then the body.
    res.setHeader('content-type', 'application/json');
    res.setHeader('x-built-by', 'week5-lesson');
    res.end(JSON.stringify({ style: 'setHeader' }));
  } else {
    // Style B: status + headers together, then the body.
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ style: 'writeHead' }));
  }
});

server.listen(3200, () => console.log('styles on http://localhost:3200'));
`,
      explain: [
        "Save as <code>styles.js</code>. Two routes, two equivalent ways to set headers — pick whichever reads better.",
        "Style A uses <code>setHeader</code> repeatedly, which is nicer when you add headers conditionally.",
        "Style B uses <code>writeHead(status, headers)</code>, the compact form from <code>10_routes.js</code>.",
        "Both reply with <code>application/json</code>; add <code>-i</code> to curl to see the headers arrive with the body and confirm they match."
      ],
      run: "node styles.js",
      output: `styles on http://localhost:3200
# curl -i http://localhost:3200/one
HTTP/1.1 200 OK
content-type: application/json
x-built-by: week5-lesson
{"style":"setHeader"}`
    },
    {
      title: "Echo every header back as a JSON body",
      from: "new",
      lang: "javascript",
      code: `
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify(req.headers, null, 2));
});

server.listen(3300, () => console.log('echo headers on http://localhost:3300'));
`,
      explain: [
        "Save as <code>echo.js</code>. It sends <code>req.headers</code> straight back as the response body.",
        "<code>JSON.stringify(obj, null, 2)</code> pretty-prints with 2-space indentation, making the headers readable in the browser.",
        "Because the response's own <code>content-type</code> is <code>application/json</code>, the browser formats and colours it.",
        "A one-line server that reveals everything a client tells you about itself — useful both for learning and for debugging a real API."
      ],
      run: "node echo.js",
      output: `echo headers on http://localhost:3300
# curl http://localhost:3300 returns, e.g.:
{
  "host": "localhost:3300",
  "user-agent": "curl/8.x.x",
  "accept": "*/*"
}`
    },
    {
      title: "Set a custom header and read it in the browser's dev tools",
      from: "new",
      lang: "javascript",
      code: `
const http = require('http');

const server = http.createServer((req, res) => {
  res.setHeader('content-type', 'text/html');
  res.setHeader('x-course', 'CSA301');
  res.setHeader('cache-control', 'no-store');
  res.end('<h1>Open dev tools → Network → this response</h1>');
});

server.listen(3400, () => console.log('custom headers on http://localhost:3400'));
`,
      explain: [
        "Save as <code>custom.js</code>. It sets three response headers before replying with a small HTML page.",
        "<code>x-course</code> is a <em>custom</em> header — anything prefixed <code>x-</code> is free for you to invent.",
        "<code>cache-control: no-store</code> tells browsers not to cache the page, a real-world header you will use often.",
        "Visit the page, open dev tools' Network tab (your journal's note <code>13_this_is_week_5_creating_server.txt</code> describes exactly this), click the request, and find all three headers in the response section."
      ],
      run: "node custom.js",
      output: `custom headers on http://localhost:3400
# in the browser dev tools → Network → Response Headers:
#   content-type: text/html
#   x-course: CSA301
#   cache-control: no-store`
    }
  ],
  keyPoints: [
    "Headers are name/value metadata that ride along with every HTTP request and response.",
    "Read incoming headers from <code>req.headers</code> — a plain, lower-cased object; use bracket notation for hyphenated names like <code>['user-agent']</code>.",
    "Set outgoing headers with <code>res.setHeader(name, value)</code> or in a batch via <code>res.writeHead(status, {…})</code>.",
    "Always set headers <em>before</em> writing any body — after the first <code>write()</code>/<code>end()</code> the header block is already sent.",
    "<code>content-type</code> is the header that decides whether the browser renders your markup or shows raw text; custom headers use the <code>x-</code> prefix."
  ],
  practice: `
    <p>Modify <code>14_responce_header.js</code> so that, instead of printing all headers, it prints only
    <code>req.headers.host</code> and <code>req.headers['user-agent']</code>, and replies with a JSON body
    containing those two values. Then use <code>curl -H 'x-student: 2408023' http://localhost:3000</code> to
    send your own custom header and confirm it shows up in <code>req.headers</code>.</p>
  `,
  quiz: [
    {
      q: "How do you read the user-agent header from an incoming request?",
      options: [
        "req.getHeader('user-agent')",
        "req.headers['user-agent']",
        "req.header.userAgent",
        "res.headers['user-agent']"
      ],
      answer: 1,
      why: "Incoming headers live on <code>req.headers</code>, a plain object with lower-cased keys. Because of the hyphen you must use bracket notation. <code>res.headers</code> is the response's, not the request's."
    },
    {
      q: "You call res.setHeader('content-type', …) after already writing part of the body. What happens?",
      options: [
        "The header is added and applies to the whole response",
        "It is silently ignored",
        "It throws an error, because headers are sent with the first body byte and cannot change afterwards",
        "The body is discarded and only the header is sent"
      ],
      answer: 2,
      why: "Headers must be set before any <code>write()</code>/<code>end()</code>. Once the first chunk goes out, the header block is already on the wire, so Node raises an error rather than send an inconsistent response."
    }
  ],
  sources: [
    "https://nodejs.org/api/http.html#messageheaders",
    "https://developer.mozilla.org/en-US/docs/Glossary/HTTP_header"
  ]
});
