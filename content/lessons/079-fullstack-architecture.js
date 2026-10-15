window.COURSE_LESSONS.push({
  id: "w15-fullstack-architecture",
  file: "079",
  unit: 4,
  week: 15,
  title: "How a React front end talks to a Node back end",
  kicker: "Unit IV · Week 15 · Lesson 1 of 7",
  minutes: 17,
  objectives: [
    "Trace a fetch() from the browser, through the Vite dev server, into Node and down to MySQL",
    "Match the four REST verbs to the status codes 200, 201, 400, 404 and 500",
    "Explain why JSON is the wire format both sides agree on",
    "Say why CORS exists and when a proxy is the cleaner fix"
  ],
  intro: `
    <p>Lesson 078 closed Unit III with a complete Redux app — a counter and a todo list that
    lived entirely inside the browser, with no server anywhere in sight. Unit IV puts the two
    halves together, and the project the journal shipped for it is the <strong>Otaku Travel
    Map</strong>: a React front end talking to a Node back end over HTTP. This first chapter of
    the week is the map of the whole machine — what actually travels between a browser and a
    server, the words (verbs, status codes, JSON) both sides must agree on, and why a five-line
    Vite config exists. The next four chapters then open each box in turn: back end, database,
    front end, wiring.</p>
  `,
  theory: [
    `
      <h3>One click, four stops</h3>
      <p>Every feature of a data-driven web app is the same choreography: the browser
      <em>asks</em>, the server <em>answers</em>, and the answer is data that React turns into
      pixels. <strong>HTTP</strong> — HyperText Transfer Protocol — is the language of that
      exchange: a <strong>request</strong> (a method, a URL, optional headers, an optional body)
      goes out, and a <strong>response</strong> (a status code, headers, an optional body) comes
      back. That is the entire contract; everything else is detail.</p>
      <p>In the Otaku Travel Map the request does not travel in a straight line, because the
      React app and the Node API are two different programs on two different ports:</p>
      <pre class="diagram">Browser (React :5173)      Vite dev server (:5173)      Node API (:5000)     MySQL (:3306)

fetch('/api/locations') ──▶ sees /api ──proxy──▶ GET /api/locations ──▶ SELECT * FROM locations
                              forwards it        reads req.url           runs the query
setLocations(rows)      ◀── res.json()  ◀────── send(res, 200, rows) ◀── rows
renders one card
per object</pre>
      <p>Four stops, two conversions: JavaScript object → text on the way out, text → JavaScript
      object on the way back. Learn to narrate that diagram out loud and you can debug any
      full-stack bug by asking <em>which stop failed?</em></p>
    `,
    `
      <h3>REST: four verbs, one vocabulary</h3>
      <p><strong>REST</strong> (REpresentational State Transfer) is not a library you install —
      it is a naming convention that lets strangers read your API. URLs name <em>things</em>
      (<code>/api/locations</code>), and four standard HTTP verbs say what you want to do with
      them:</p>
      <table>
        <thead><tr><th>Verb</th><th>Means</th><th>URL in this app</th><th>Called by</th></tr></thead>
        <tbody>
          <tr><td><code>GET</code></td><td>read / list</td><td><code>/api/locations</code></td><td>page load and Search</td></tr>
          <tr><td><code>POST</code></td><td>create a new one</td><td><code>/api/locations</code></td><td>Save while adding</td></tr>
          <tr><td><code>PUT</code></td><td>replace one by id</td><td><code>/api/locations/3</code></td><td>Save while editing</td></tr>
          <tr><td><code>DELETE</code></td><td>remove one by id</td><td><code>/api/locations/3</code></td><td>Delete button</td></tr>
        </tbody>
      </table>
      <p>That is the whole of the Otaku API — five routes built from one URL and four verbs.
      (A <code>PATCH</code> verb exists for partial updates; this app uses <code>PUT</code> and
      always sends the complete record, which is honest and simple.)</p>
    `,
    `
      <h3>Status codes: the one-word verdict</h3>
      <p>Before it reads a single byte of body, the caller looks at the status code. The
      convention: <strong>2xx means success, 4xx means <em>you</em> sent something wrong, 5xx
      means <em>the server</em> broke.</strong> Five codes cover this entire book:</p>
      <table>
        <thead><tr><th>Code</th><th>Name</th><th>What happened in Otaku</th></tr></thead>
        <tbody>
          <tr><td><code>200</code></td><td>OK</td><td>rows returned, row updated, row deleted</td></tr>
          <tr><td><code>201</code></td><td>Created</td><td>a POST inserted a row; body carries the new <code>id</code></td></tr>
          <tr><td><code>400</code></td><td>Bad Request</td><td>a required field was empty → the UI shows an alert</td></tr>
          <tr><td><code>404</code></td><td>Not Found</td><td>no row with that id, or an unknown URL</td></tr>
          <tr><td><code>500</code></td><td>Internal Server Error</td><td>MySQL failed — the database layer, not the request</td></tr>
        </tbody>
      </table>
      <p>The React app turns those into human words: <code>handleSubmit</code> checks
      <code>res.ok</code> (true only for 200/201-style answers) and pushes the server's
      <code>message</code> into <code>alert(...)</code> when it is false. That one check is why a
      broken request says <em>"Please fill all required fields"</em> instead of failing silently.</p>
    `,
    `
      <h3>JSON: the common language</h3>
      <p><strong>JSON</strong> — JavaScript Object Notation — is plain text with a strict shape:
      keys in double quotes, values that are strings, numbers, booleans, arrays, objects or
      <code>null</code>. It looks like a JavaScript object but is not one until you parse it:</p>
      <pre class="diagram">{"id": 1, "anime_name": "Your Name", "city": "Tokyo", "description": null}</pre>
      <p>Both sides speak it with exactly two functions. The server does
      <code>JSON.stringify(data)</code> inside its <code>send()</code> helper; the browser does
      <code>res.json()</code> (which is <code>JSON.parse</code> wrapped in a promise). Requests
      that carry a body also announce it with the header
      <code>Content-Type: application/json</code>. Why JSON and not XML or a custom format?
      Because it is the one data format every language on the internet already understands —
      MySQL rows become JavaScript objects through it with zero translation code.</p>
    `,
    `
      <h3>Why CORS exists — and why we proxy instead</h3>
      <p>Browsers enforce the <strong>same-origin policy</strong>: page code may freely read
      responses only from the same <em>origin</em> — the exact combination of scheme, host
      <strong>and port</strong>. Your page lives on <code>http://localhost:5173</code>; the API
      lives on <code>http://localhost:5000</code>. Same host, different port = different origin,
      so the browser would refuse to hand you the response and print a
      <strong>CORS</strong> (Cross-Origin Resource Sharing) error in the console.</p>
      <p>CORS is the official escape hatch: the <em>server</em> may opt in per origin by sending
      the response header <code>Access-Control-Allow-Origin</code>. The other standard fix is a
      <strong>proxy</strong>: make the request look same-origin to the browser, and let a
      middleman forward it server-to-server, where no browser rule applies. Otaku Travel Map
      uses the proxy (Vite's <code>server.proxy</code>, Lesson 083) — which is exactly why
      <code>server.js</code> contains <em>zero</em> CORS code. In production the built files and
      the API are normally served from one origin, so the problem mostly disappears.</p>
    `,
    `
      <h3>The three processes of Otaku Travel Map</h3>
      <p>"Running the app" means three programs are alive at once, each with its own port and
      its own job:</p>
      <ul>
        <li><strong>MySQL (XAMPP), port 3306</strong> — stores the rows; created by
        <code>otaku_travel.sql</code> (Lesson 081).</li>
        <li><strong>Node API, port 5000</strong> — <code>otaku/server/server.js</code>, the only
        process allowed to touch the database (Lesson 080).</li>
        <li><strong>Vite dev server, port 5173</strong> — serves and hot-reloads
        <code>otaku/src/App.jsx</code> (Lesson 082).</li>
      </ul>
      <p>The project's own two-line README states the layout in one breath, and
      <code>FUNCTIONALITIES.txt</code> (226 lines, verified against the code in October 2026)
      is the app's hand-written specification. Keep both open while you read this week.</p>
    `
  ],
  examples: [
    {
      title: "The project's own two-line map: two folders, two servers",
      from: "journal",
      file: "sorted_files/15_Week-15_Integration-otaku/README.txt",
      lang: "text",
      code: `
Week 15: Otaku Travel Map. Backend: otaku-server/ (\`npm i && node server.js\`, MySQL :3306).
Frontend: this folder root has vite.config (proxy /api->:5000) + src in otaku-frontend/ (\`npm i && npm run dev\` :5173).
`,
      explain: [
        "Line 1 is the whole back end: one folder, one install, one command — plus MySQL on port 3306, the storage layer of the diagram.",
        "Line 2 is the whole front end, and it names the bridge in passing: <code>vite.config (proxy /api-&gt;:5000)</code> — the five lines that make the two servers behave as one.",
        "Both halves must be started separately; neither can run alone. That is what 'full stack' means concretely: two processes plus a database.",
        "The mirror copy lives at <code>sorted_files/15_Week-15_Integration-otaku/</code>; the original is <code>otaku/</code> — same bytes, verified by hash."
      ]
    },
    {
      title: "vite.config.js: the entire bridge between the two servers",
      from: "journal",
      file: "otaku/vite.config.js",
      lang: "javascript",
      code: `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
`,
      explain: [
        "<code>plugins: [react()]</code> teaches Vite to compile JSX — without it, every <code>.jsx</code> file fails to load.",
        "<code>server.port: 5173</code> fixes the front end's origin, which the CORS rules of the last section care about.",
        "<code>proxy: { '/api': 'http://localhost:5000' }</code> is the architecture in one line: any request whose path starts with <code>/api</code> is forwarded to the Node API, so the browser only ever talks to :5173.",
        "This file runs only in development — there is no Vite at all once the app is built (Lesson 085), which is exactly why the production story differs."
      ],
      run: "cd otaku && npm run dev",
      output: "Local: http://localhost:5173/"
    },
    {
      title: "index.html: what the browser gets before React runs",
      from: "journal",
      file: "otaku/index.html",
      lang: "html",
      code: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Otaku Travel Map</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
      explain: [
        "This 13-line file is the only HTML the app ships: no rows, no cards — just an empty <code>&lt;div id=\"root\"&gt;</code> waiting for React.",
        "<code>type=\"module\"</code> marks the script as an ES module, the same import/export syntax you met in Lesson 016.",
        "<code>/src/main.jsx</code> is served (and transformed) by the Vite dev server; in a production build Vite replaces it with hashed files inside <code>dist/</code>.",
        "Everything you see in the browser — header, search bar, cards — is produced by the fetch → JSON → state → render loop described in the diagram above."
      ],
      run: "open http://localhost:5173  (with npm run dev running)"
    },
    {
      title: "The four verbs and their status codes, with curl",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# 1. read the list -> 200 + a JSON array of 5 objects
curl -i http://localhost:5000/api/locations

# 2. create one -> 201 {"id":6,"message":"Location added"}
curl -i -X POST http://localhost:5000/api/locations \\
  -H "Content-Type: application/json" \\
  -d '{"anime_name":"Your Name","location_name":"Suga Shrine","city":"Tokyo","country":"Japan"}'

# 3. create with a missing field -> 400 {"message":"Please fill all required fields"}
curl -i -X POST http://localhost:5000/api/locations \\
  -H "Content-Type: application/json" -d '{"anime_name":"Your Name"}'

# 4. read a row that does not exist -> 404 {"message":"Location not found"}
curl -i http://localhost:5000/api/locations/9999

# 5. remove it again -> 200 {"message":"Location deleted"}
curl -i -X DELETE http://localhost:5000/api/locations/6
`,
      explain: [
        "<code>curl -i</code> prints the status line and headers — the part of the response beginners skip and then regret: look for <code>HTTP/1.1 201 Created</code>.",
        "<code>-X POST</code>/<code>-X DELETE</code> pick the REST verb; <code>-H \"Content-Type: application/json\"</code> and <code>-d '{...}'</code> build the JSON body the server's <code>readBody()</code> will parse.",
        "Request 3 is the server's 400 path in the flesh: only <code>anime_name</code> was sent, three required fields are missing.",
        "Request 4 shows 404 comes back as a JSON object, not an HTML error page — a custom API controls its own error bodies.",
        "Nothing here touches React: you can test the entire back end from a terminal, which is the first debugging move of Lesson 084."
      ],
      run: "curl -i http://localhost:5000/api/locations   (server.js running)",
      output: "HTTP/1.1 200 OK\nContent-Type: application/json\n[{\"id\":5,\"anime_name\":\"K-On!\",...}, ...]"
    },
    {
      title: "Browser-side fetch that respects the status code",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
async function getLocations() {
  const res = await fetch('/api/locations');
  if (!res.ok) {
    // res.ok is false for every 4xx/5xx - the status tells you which
    const err = await res.json();
    throw new Error(res.status + ' ' + err.message);
  }
  return res.json();          // body was JSON, res.json() parses it
}

getLocations()
  .then((rows) => console.log('rows:', rows.length))
  .catch((e) => console.error('failed:', e.message));
`,
      explain: [
        "<code>fetch</code> takes a relative URL — it is resolved against the page's own origin, which is what keeps the Vite proxy in play (Lesson 083).",
        "A response with status 404 or 500 does <strong>not</strong> reject the promise; only network failures do. Checking <code>res.ok</code> yourself is the difference between an app that reports errors and one that swallows them.",
        "<code>res.json()</code> returns a promise for the parsed body — the browser's half of the JSON conversion the server started with <code>JSON.stringify</code>.",
        "Run it as-is in the DevTools console on http://localhost:5173 with the API up; the same code works in Node 18+ if you give fetch an absolute URL."
      ],
      run: "paste into the DevTools console on http://localhost:5173",
      output: "rows: 5"
    },
    {
      title: "JSON is text: the two conversions at either end",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// What travels over the wire is TEXT, not a JavaScript object.
const row = { id: 1, anime_name: 'Your Name', city: 'Tokyo' };

const text = JSON.stringify(row);     // what server.js send() does
console.log('on the wire:', text);

const back = JSON.parse(text);        // what res.json() does
console.log('back in JS :', back.city);
console.log('same values?', back.id === row.id);
`,
      explain: [
        "<code>JSON.stringify</code> turns an object into the string that <code>send(res, 200, row)</code> writes into the HTTP body.",
        "The wire text shows the JSON rules plainly: double quotes around keys, no trailing comma, no functions — anything else would not parse.",
        "<code>JSON.parse</code> rebuilds an object; <code>back.city</code> proves the round trip lost nothing.",
        "This pair is the only translation in the whole stack — no XML, no schema negotiation, no custom encoder."
      ],
      run: "node json-roundtrip.js",
      output: "on the wire: {\"id\":1,\"anime_name\":\"Your Name\",\"city\":\"Tokyo\"}\nback in JS : Tokyo\nsame values? true"
    }
  ],
  keyPoints: [
    "Every full-stack feature is one HTTP round trip: a request out (verb + URL + optional JSON body) and a response back (status code + optional JSON body)",
    "REST = noun URLs plus GET/POST/PUT/DELETE; the whole Otaku API is five routes hanging off /api/locations",
    "200/201 mean success, 400/404 mean the request was wrong, 500 means the server itself failed",
    "JSON is text: JSON.stringify on the way out, res.json()/JSON.parse on the way back — the only conversion in the stack",
    "Cross-origin reads are blocked by the browser (CORS); Otaku dodges it in development with the Vite /api proxy, which is why server.js has no CORS code",
    "The app needs three processes at once: MySQL :3306, node server.js :5000, vite :5173"
  ],
  practice: `
    <p>With all three processes running (the exact sequence arrives in Lesson 084), open
    DevTools → <strong>Network</strong> and reload. Click the first
    <code>api/locations</code> entry and confirm the three facts: Status
    <strong>200</strong>, Type <strong>fetch</strong>, and a Response tab holding a JSON array of
    five objects. Then press <strong>Add Location</strong>, save a row, and watch a
    <strong>POST</strong> arrive with status <strong>201</strong> followed immediately by the
    <strong>GET</strong> that reloads the list — the reload-after-write pattern you will meet in
    Lesson 082.</p>
  `,
  quiz: [
    {
      q: "A fetch to /api/locations comes back with status 200 and the body [{...},{...}]. What did the server do?",
      options: [
        "SELECTed rows from MySQL and sent them as a JSON array",
        "Inserted a new row into the database",
        "Failed with a database error",
        "Redirected the browser to another page"
      ],
      answer: 0,
      why: "200 OK with an array body is the read path: GET /api/locations runs SELECT * FROM locations and send(res, 200, rows). A create answers 201, a database failure answers 500."
    },
    {
      q: "Which pair tells the server that a request body is JSON?",
      options: [
        "The header Content-Type: application/json and a body produced by JSON.stringify(form)",
        "The header Content-Type: text/plain and a raw JavaScript object as the body",
        "A query string in the URL and no body at all",
        "The response status 201 in the request line"
      ],
      answer: 0,
      why: "The body is text, so it must be stringified, and the header declares its format. server.js readBody() then JSON.parse()s that text back into an object."
    }
  ],
  sources: [
    "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
    "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods",
    "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS",
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON"
  ]
});
