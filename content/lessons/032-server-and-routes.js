window.COURSE_LESSONS.push({
  id: "w05-server-and-routes",
  file: "032",
  unit: 1,
  week: 5,
  title: "Creating a server and its routes",
  kicker: "Unit I · Week 5 · Lesson 4 of 6",
  minutes: 20,
  objectives: [
    "Explain what routing is and how req.method and req.url drive it",
    "Build a raw http server that answers different URLs differently, with a 404 fallback",
    "Serve real HTML from a route and write a status code plus content-type header"
  ],
  intro: `
    <p>In Week 2 you met the <code>http</code> module and built a server that returned one fixed string.
    Now you will make it <em>decide</em> what to return based on the URL — the definition of routing. This
    is the backbone of every web framework you will ever use, and Express (which you installed in Week 1)
    is nothing more than a friendly layer over exactly this logic.</p>
    <p>Your journal's Week 5 folder is a step-by-step ladder: <code>11_server_ex1.js</code> (one fixed
    reply), <code>09_serverhttp.js</code> (switch on method and URL), <code>10_routes.js</code> (several
    pages plus a 404), and <code>12_server_with_html.js</code> (real HTML). A short note,
    <code>13_this_is_week_5_creating_server.txt</code>, defines routing in one sentence — we will lean on
    it.</p>
  `,
  theory: [
    `
      <h3>What a server does on every request</h3>
      <p><code>http.createServer(callback)</code> returns a server that holds a single callback. That
      callback runs <strong>once per incoming request</strong>, and it receives two objects:</p>
      <ul>
        <li><code>req</code> (the request) — what the client asked for. The parts you route on are
        <code>req.method</code> (<code>"GET"</code>, <code>"POST"</code>, …) and <code>req.url</code>
        (<code>"/about"</code>, <code>"/data"</code>, …).</li>
        <li><code>res</code> (the response) — what you send back. You set a status code and headers, write
        the body, then call <code>res.end()</code>.</li>
      </ul>
      <p>Calling <code>server.listen(port, cb)</code> binds it to a port so browsers and <code>curl</code>
      can reach it at <code>http://localhost:port</code>.</p>
    `,
    `
      <h3>Routing = choosing a reply from method + url</h3>
      <p>Your note says it plainly: <em>"routing is the process of deciding how a server should respond to
      different requests made by users."</em> Concretely it is just <code>if</code>/<code>else</code> (or a
      lookup table) over <code>req.url</code> and <code>req.method</code>:</p>
      <pre class="diagram">  GET  /home  ──▶ "welcome"      POST /home  ──▶ "saved!"
  GET  /data  ──▶ "here it is"   GET  /nope  ──▶ 404 not found
        ▲                              ▲
        └──── one callback, branching on req.url + req.method ────┘</pre>
      <p>The same path with a different <em>method</em> often means a different action —
      <code>GET /data</code> asks for data, <code>POST /data</code> submits new data. This is the seed of
      the REST conventions you will meet properly in Unit IV.</p>
    `,
    `
      <h3>Status codes, headers, and the 404 catch-all</h3>
      <p>Every response carries a status code: <code>200</code> means OK, <code>404</code> means not
      found. <code>res.writeHead(status, headers)</code> sets both the code and the headers in one call —
      the most important header being <code>content-type</code>, which tells the browser how to interpret
      the body (<code>text/html</code> vs <code>text/plain</code>).</p>
      <p>Two rules beginners trip on:</p>
      <ul>
        <li>Always end with a <code>res.end()</code>. Without it the browser hangs waiting forever, because
        it thinks more data is coming.</li>
        <li>Put a final <code>else</code> that returns <strong>404</strong>. If no branch matches and you
        write nothing, the request silently hangs — the most common early-server bug.</li>
      </ul>
    `
  ],
  examples: [
    {
      title: "The simplest server: one fixed reply for every request",
      from: "journal",
      file: "sorted_files/05_Week-05_Streams-Routing/11_server_ex1.js",
      lang: "javascript",
      code: `
const http = require('http');
const server = http.createServer((request, response)=>// create server is two perameter (req, res)=> these functions that runs for each request
{
response.writeHead(200,{'content-type':"text/plain"});//status code. and content type, this has the header
response.write("this is the first method");//sets status code to (200 = ok)and header.
response.write("\\nsecond line");
response.end('\\nEnded')//after end it will end we cant pass other things we have to do that before 'end'. we cant have multple end.
//response.end ends the conversation
});

server.listen(8080, ()=>{ //tels the server to listen to the code 8080
    console.log("server running on port 8080")
})//port number can be passed from 1 digit to 5 digit
`,
      explain: [
        "<code>require('http')</code> loads Node's built-in HTTP module — no install needed.",
        "<code>createServer((req, res) =&gt; {…})</code> registers the per-request callback; <code>res.writeHead(200, {'content-type':'text/plain'})</code> sets OK plus the header.",
        "Two <code>response.write()</code> calls append to the body, then <code>response.end()</code> sends it — the comments note you cannot write after end, and there is only one end.",
        "There is no routing here: every URL gets the same reply. This is the baseline we build on.",
        "Visit <code>http://localhost:8080/anything</code> and you still see the same two lines plus \"Ended\"."
      ],
      run: "node 11_server_ex1.js",
      output: `server running on port 8080
# browser/curl at http://localhost:8080/any/path returns:
this is the first method
second line
Ended`
    },
    {
      title: "Routing on method AND url: /data and /home",
      from: "journal",
      file: "sorted_files/05_Week-05_Streams-Routing/09_serverhttp.js",
      lang: "javascript",
      code: `
const http = require('http');
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
})
`,
      explain: [
        "The outer <code>if</code> branches on <code>req.url</code>, the inner one on <code>req.method</code> — the two-key routing table from the theory.",
        "GET vs POST to the same path give different answers, exactly as the diagram showed.",
        "Successive <code>res.write()</code> calls build the body; the final <code>res.end()</code> flushes it.",
        "The catch-all <code>else</code> sends \"page not found\" for unknown URLs.",
        "<strong>Subtle bug to notice:</strong> it replies with a plain 200 and no status code for an unknown <em>method</em> on a known path (e.g. <code>PUT /data</code>) — no branch matches, so the request hangs. Lesson 4's 404 pattern fixes this by adding a proper fallthrough."
      ],
      run: "node 09_serverhttp.js",
      output: `server running on http://localhost:3000
# curl http://localhost:3000/data  →  you are GETTING data 1234
# curl -X POST http://localhost:3000/data  →  you are SENDING data`
    },
    {
      title: "Several HTML pages plus a real 404",
      from: "journal",
      file: "sorted_files/05_Week-05_Streams-Routing/10_routes.js",
      lang: "javascript",
      code: `
const http = require('http');
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(\`
      <p>welcome to my page</p>
      <p>This is the homepage</p>
      <a href="http://localhost:9000/about">About</a> |
      <a href="http://localhost:9000/contect">Contect</a> |
      <a href="http://localhost:9000/idk">IDK</a>
    \`);
    }

    else if (req.url === '/about') {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(\`
      <p>this is made by nishant</p>
      <p>This id the about page</p>
    \`);
    }

    else if (req.url === '/contect') {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(\`
      <p>This is the second link</p>
      <p>This id the contect page</p>
    \`);
    }

    else if (req.url === '/idk') {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(\`
      <p>idk PAGE </p>
      <p>this is the third link</p>
    \`);
    }
    else {

        res.writeHead(404, { 'content-type': 'text/html' });
        res.end(\`<p>404 <b>PAGE NOT FOUND</b></p>\`);
    }
});

server.listen(9000, () => {
    console.log('the server is running on port http://localhost:9000/');
});
`,
      explain: [
        "Four real routes (<code>/</code>, <code>/about</code>, <code>/contect</code>, <code>/idk</code>) each set <code>content-type: text/html</code> and end with an HTML fragment.",
        "The homepage's links point at the other routes, so clicking around in the browser exercises the routing for you.",
        "The final <code>else</code> is the catch-all, and it correctly sets <code>404</code> with <code>writeHead</code> — the pattern <code>09_serverhttp.js</code> lacked.",
        "Note the intentional typo <code>/contect</code>: the URL, the branch and the link all agree, so it works — routing is literal string matching, spelling and all.",
        "This is the clearest example of routing-as-if-else in the whole journal; frameworks like Express just hide the <code>if</code> ladder behind <code>app.get('/about', …)</code>."
      ],
      run: "node 10_routes.js",
      output: `the server is running on port http://localhost:9000/
# curl http://localhost:9000/        →  welcome to my page …
# curl http://localhost:9000/idk     →  idk PAGE …
# curl http://localhost:9000/nope    →  404 PAGE NOT FOUND`
    },
    {
      title: "Serving a real HTML table",
      from: "journal",
      file: "sorted_files/05_Week-05_Streams-Routing/12_server_with_html.js",
      lang: "javascript",
      code: `
const http = require('http');
const server = http.createServer((request, response)=>{

console.log("someone visited")
response.writeHead(200,{'Content-Type':"text/html"});
response.end(\`<h1>Name: Nishant</h1><br><p>this is a peragraph</p><br>
    <table>
    <tr>
      <th>Item</th>
      <th>Price</th>
    </tr>
  </th>
  <tbody>
    <tr>
      <td>Potato</td>
      <td>50 rs kg</td>
    </tr>
    <tr>
      <td>Banana</td>
      <td>70 dozzon</td>
    </tr>
</table>

    \`);

});

server.listen(3000,()=>{
    console.log("the server is running rn on http://localhost:3000/")
});
`,
      explain: [
        "Because <code>content-type</code> is <code>text/html</code>, the browser renders the markup instead of showing raw tags — that header is doing the work.",
        "The body is a template literal holding a heading, a paragraph and a full <code>&lt;table&gt;</code>, so a \"page\" can be as rich as you like.",
        "<code>console.log(\"someone visited\")</code> runs on the <em>server's</em> terminal, not the browser — your first taste of server-side logging.",
        "<strong>Markup bug to spot:</strong> the header row closes with <code>&lt;/tr&gt;</code> on line 11, but a stray <code>&lt;/th&gt;</code> follows it on line 12. Browsers forgive it, but the correct closing tag is <code>&lt;/tr&gt;</code>. Worth fixing while you learn."
      ],
      run: "node 12_server_with_html.js",
      output: `the server is running rn on http://localhost:3000/
# browser at http://localhost:3000/ renders the heading, paragraph and the Potato/Banana table
# server terminal prints: someone visited   (once per request)`
    },
    {
      title: "Routing with a lookup table instead of an if-ladder",
      from: "new",
      lang: "javascript",
      code: `
const http = require('http');

const pages = {
  '/':      { code: 200, body: '<h1>Home</h1>' },
  '/about': { code: 200, body: '<h1>About us</h1>' },
  '/news':  { code: 200, body: '<h1>Latest news</h1>' }
};

const server = http.createServer((req, res) => {
  const page = pages[req.url] || { code: 404, body: '<h1>404 Not Found</h1>' };
  res.writeHead(page.code, { 'content-type': 'text/html' });
  res.end(page.body);
});

server.listen(4000, () => console.log('table router on http://localhost:4000'));
`,
      explain: [
        "Save as <code>table-router.js</code>. Same idea as <code>10_routes.js</code>, but the routes live in an object instead of an if-ladder.",
        "<code>pages[req.url]</code> looks up the URL; the <code>|| {…}</code> fallback supplies the 404 for anything unknown — one line, no hang, always a status code.",
        "Adding a page is now one object entry, not another <code>else if</code>. This is essentially what a framework's router does internally.",
        "Note this version ignores <code>req.method</code>; the next lesson and Unit IV show how to fold method handling back in."
      ],
      run: "node table-router.js",
      output: `table router on http://localhost:4000
# curl http://localhost:4000/news  →  <h1>Latest news</h1>
# curl http://localhost:4000/zzz   →  <h1>404 Not Found</h1>`
    }
  ],
  keyPoints: [
    "Routing is deciding the response from <code>req.method</code> + <code>req.url</code>; your journal's note defines it in exactly one sentence.",
    "<code>http.createServer((req, res) =&gt; …)</code> runs its callback once per request; <code>server.listen(port)</code> makes it reachable.",
    "<code>res.writeHead(status, headers)</code> sets the status code and headers (usually <code>content-type</code>) before you write the body.",
    "Always finish with <code>res.end()</code>, and always include a final 404 branch — otherwise requests hang instead of failing cleanly.",
    "Setting <code>content-type: text/html</code> is what makes the browser render your markup; with <code>text/plain</code> it shows the raw tags."
  ],
  practice: `
    <p>Extend <code>10_routes.js</code> into a five-page site: add <code>/contact</code> and
    <code>/services</code>, each returning its own HTML. Then deliberately break it — comment out the 404
    <code>else</code> and request <code>/nowhere</code> in the browser to watch it hang — before restoring
    the catch-all. Finally rewrite the whole thing using the lookup-table style of
    <code>table-router.js</code> and confirm every page still works.</p>
  `,
  quiz: [
    {
      q: "What are the two properties of req that a basic if-based router branches on?",
      options: [
        "req.path and req.body",
        "req.method and req.url",
        "req.host and req.port",
        "req.type and req.data"
      ],
      answer: 1,
      why: "A raw Node router keys off the HTTP method (GET/POST/…) and the URL string. The other names are either Express conveniences (req.path) or not request properties at all."
    },
    {
      q: "A client requests /data with a PUT method on the journal's 09_serverhttp.js. What happens?",
      options: [
        "It returns 404 Not Found",
        "It returns \"you are SENDING data\"",
        "No branch matches, so no response is ever sent and the request hangs",
        "The server crashes"
      ],
      answer: 2,
      why: "The code checks /data for GET and POST only; PUT falls through every branch with no res.end(), so the browser waits forever. This is why you always want a final else that responds — and why 10_routes.js is the better template."
    }
  ],
  sources: [
    "https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener",
    "https://nodejs.org/api/http.html#class-httpserverresponse"
  ]
});
