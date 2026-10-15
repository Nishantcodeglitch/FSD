window.COURSE_LESSONS.push({
  id: "w15-where-to-go-next",
  file: "085",
  unit: 4,
  week: 15,
  title: "Wrapping up: where to go from here",
  kicker: "Unit IV · Week 15 · Lesson 7 of 7",
  minutes: 20,
  objectives: [
    "Recap the four units of this book and say what you can build with each",
    "Produce a production build and explain why the dev proxy disappears in it",
    "Write a first real test, add a type annotation, and swap the http server for Express",
    "Move secrets into environment variables as the first step toward deploying the app"
  ],
  intro: `
    <p>Lesson 084 got the stack running and gave you the debugging table for when it stops.
    This is the last chapter of the book — and it has two jobs. First, an honest recap of what
    you actually learned across Units I–IV (and what this journal never covered, so you know the
    shape of your own gaps). Then six forward paths, each with code you can run today: a
    production build, a real test, a type annotation, Express, environment variables and a
    Dockerfile — plus the four documentation sites worth bookmarking forever. If you want to
    see how far you have come in one glance, open the <a href='index.html#/course' target='_blank'
    rel='noopener'>Course index &amp; progress</a> page and look at your completed chapters.</p>
  `,
  theory: [
    `
      <h3>The honest recap: four units, four capabilities</h3>
      <p>Read this list as a list of things you can now <em>do</em>, not names you have heard:</p>
      <ul>
        <li><strong>Unit I — Node (Weeks 1–6):</strong> write JavaScript that runs outside the
        browser; organise it with modules and package.json; reason about the event loop,
        callbacks, promises and async file work; take command-line arguments; build raw
        <code>http</code> servers with routes, headers and streams; schedule work with cron; and
        bundle with webpack. You finished with a capstone that combined all of it.</li>
        <li><strong>Unit II — Databases (Weeks 7–10):</strong> design tables, connect with
        Sequelize, authenticate and close connections cleanly, define models with validations,
        write migrations instead of ad-hoc ALTERs, run full CRUD through finders and query
        options, use raw SQL when you must, and wire tables together with one-to-one,
        one-to-many and many-to-many associations plus <code>include()</code>.</li>
        <li><strong>Unit III — React (Weeks 11–14):</strong> scaffold with Vite, think in
        components and JSX, pass props, manage state with <code>useState</code>,
        <code>useReducer</code>, <code>useContext</code>, <code>useRef</code>,
        <code>useEffect</code> (and the memoisation hooks from the docs), navigate with React
        Router, and share state across a large app with Redux Toolkit.</li>
        <li><strong>Unit IV — Integration (Week 15):</strong> the thing most courses skip. You
        read a complete production-shaped trio — REST API, schema, fetch-based CRUD — and
        learned the three ideas that make them behave as one app: JSON as the wire format, a
        proxy (or CORS headers) for origins, and a run/debug discipline that checks each layer
        in order.</li>
      </ul>
      <div class="note"><p><strong>Honest gaps, so you can plan around them.</strong> This book
      teaches this repository's journal, and the journal has holes we flagged along the way:
      <code>useMemo</code>/<code>useCallback</code> (Weeks 12.6–12.7) and all of React Router
      (Week 13) came from react.dev and reactrouter.com rather than class notes; Redux (Week 14)
      came from a classmate's backup; and the Week-15 file <code>server/database.sql</code>
      described in FUNCTIONALITIES.txt does not exist in the repo — the real dump is
      <code>otaku_travel.sql</code>. The Otaku app itself deliberately has no tests, no login,
      no pagination and no environment config. Those four absences are exactly what the rest of
      this chapter attacks.</p></div>
    `,
    `
      <h3>Path 1 — Ship it: npm run build</h3>
      <p>Everything so far ran behind <code>npm run dev</code>: a Vite process that compiles on
      the fly, hot-reloads your edits, and forwards <code>/api</code> through the proxy.
      <code>npm run build</code> does something completely different — it compiles, minifies and
      hashes everything into a single static folder, <code>dist/</code>: plain HTML, CSS and JS
      that any web server can host with Node never involved in the delivery. Two consequences
      you must be ready for:</p>
      <ul>
        <li><strong>The proxy is gone.</strong> There is no Vite in production, so
        <code>fetch('/api/locations')</code> is served by whatever host serves the page. The
        answer is not "add the backend URL back" — it is to serve the API and the files from the
        <em>same origin</em> (one domain), which is why real deployments put both behind one
        host or have Node itself serve <code>dist/</code>.</li>
        <li><strong>Dev conveniences are gone too</strong> — StrictMode's double effects, the
        source maps, the friendly error overlay. What remains is what your users download.</li>
      </ul>
      <p>Run it now and look at the folder: the bundle still contains the relative
      <code>/api/locations</code> string, waiting for a same-origin server to answer it.</p>
    `,
    `
      <h3>Path 2 — Write a real test</h3>
      <p>The app has zero tests, which means every change is verified by clicking through the
      UI. Node ships a test runner (<code>node:test</code>) — no install, one command:
      <code>node --test</code>. The trick that makes server code testable is
      <strong>extraction</strong>: the guard clause inside the POST route
      (<code>if (!b.anime_name || ...) → 400</code>) is pure logic with no MySQL and no HTTP in
      it, so pull it into its own function and assert on it directly (Example 4). Two tests,
      ten lines, and from then on a typo in that validation fails your build instead of a user's
      submission. If you prefer a runner with watch mode and JSX support, Vitest is the
      ecosystem default for Vite projects — same <code>assert</code> style, one
      <code>npm i -D vitest</code> away.</p>
    `,
    `
      <h3>Path 3 — Add TypeScript where it pays</h3>
      <p><strong>TypeScript</strong> is JavaScript plus compile-time checks: you declare what a
      value must look like, and <code>tsc</code> refuses to build code that disagrees. You do
      not need to convert the whole app to benefit — start with the boundaries, exactly where
      this book's bugs lived: the object a form produces and the object a database row provides.
      An optional property (<code>description?: string</code>) mirrors a nullable column
      perfectly, and a typed function like the one in Example 5 would have caught a missing
      field before the browser ever sent it. Vite supports TS out of the box
      (<code>npm create vite@latest -- --template react-ts</code>), and the project's own
      template README points at that path (Example 2).</p>
    `,
    `
      <h3>Path 4 — Express: delete the plumbing, keep the logic</h3>
      <p>Server.js spends most of its 148 lines on things Express does for you: parsing URLs,
      matching routes, reading and JSON-parsing bodies, writing status codes. The trade is one
      <code>npm i express</code>: you get a router (<code>app.get/post/put/delete</code>),
      <code>express.json()</code> instead of <code>readBody()</code>,
      <code>res.status(n).json(...)</code> instead of <code>send()</code>, error-handling
      middleware, static file serving (which is how Node can host <code>dist/</code> for Path 1),
      and a huge ecosystem of middleware for auth, logging and rate limiting. Nothing about your
      SQL changes — the pool and the <code>?</code> placeholders carry over untouched. Example 6
      rewrites the read route so you can compare line counts yourself. The lesson of Unit I was
      that you <em>can</em> build it by hand; the lesson now is that you usually
      <em>shouldn't</em>. One more name belongs here, because this week's syllabus lists it:
      <strong>Next.js</strong> — a React framework that keeps the front end and the server
      routes in one project, so API endpoints live beside your components instead of in a
      second process. It is this whole week's manual wiring, pre-packaged; knowing what it
      automates is exactly what Week 15 gave you.</p>
    `,
    `
      <h3>Path 5 — Deploy: configuration, then containers</h3>
      <p>Deployment is mostly the same idea, applied twice:</p>
      <ul>
        <li><strong>Environment variables.</strong> Your laptop's MySQL has an empty password; a
        server's does not, its port differs, and its hostname is not <code>localhost</code>.
        Twelve-factor style says: read config from <code>process.env</code> with your current
        values as defaults (Example 7), keep secrets out of git, and let the hosting platform
        inject them. One file edited instead of five constants per machine.</li>
        <li><strong>A container.</strong> A <code>Dockerfile</code> (Example 8) is a reproducible
        recipe: base image, <code>npm ci</code>, build, run. It answers "works on my machine"
        by shipping the machine. Most platforms (Render, Railway, Fly, a plain VPS with Docker)
        accept either a Dockerfile or a two-line start command —
        <code>node server/server.js</code> plus <code>npm run build</code> for the files.</li>
      </ul>
      <p>Order matters: env vars first (they fix 90% of "it broke on the server"), containers
      second (they fix "it broke on <em>their</em> server").</p>
    `,
    `
      <h3>Where to learn next</h3>
      <p>Four sources, in the order this book leaned on them, are worth permanent bookmarks —
      all linked in <code>sources</code> below:</p>
      <ul>
        <li><strong>MDN</strong> (Mozilla Developer Network) — the reference for HTTP, status
        codes, fetch, CSS and the DOM. When a browser behaves strangely, this is the court of
        appeal.</li>
        <li><strong>react.dev</strong> — the official React docs, rewritten recently and widely
        considered a model of teaching. Start with <em>Describing the UI</em> and
        <em>Escaping to Effects</em>; they cover the hooks this journal skipped.</li>
        <li><strong>nodejs.org</strong> — the API docs for every built-in you met:
        <code>http</code>, <code>fs</code>, <code>path</code>, <code>test</code>, plus the
        excellent in-site learning guide.</li>
        <li><strong>sequelize.org</strong> — the ORM reference for Models, Migrations, Querying
        and Hooks, the parts of Unit II you will reach for first at work.</li>
      </ul>
      <p>The habit that matters more than any tool: keep the docs open <em>while</em> you build,
      not after you are stuck. You have now read an entire book doing exactly that — the
      project, the journal's own notes, and the documentation underneath them. That is the
      skill; the frameworks were just the excuse.</p>
    `
  ],
  examples: [
    {
      title: "The scripts you already own: dev, build, preview",
      from: "journal",
      file: "sorted_files/15_Week-15_Integration-otaku/package.json",
      lang: "json",
      code: `
{
  "name": "otaku",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.1.1",
    "eslint": "^10.10.0",
    "globals": "^17.12.0",
    "vite": "^8.3.0"
  }
}
`,
      explain: [
        "All three deployment levers were in the file all along: <code>dev</code> (the server you have been running), <code>build</code> (the production compiler), <code>preview</code> (a static server for checking the build).",
        "The devDependencies shown are trimmed to the four that matter for shipping — the full journal file also carries ESLint plugins and React types (Lesson 083 shows it complete).",
        "<code>\"lint\": \"eslint .\"</code> is the cheapest quality gate you have not been using: run it before every commit.",
        "Nothing in this file mentions the backend — the API has its own package.json, and a production deployment must start both halves (Lesson 084, step 4)."
      ],
      run: "cd otaku && npm run build",
      output: "dist/index.html  dist/assets/index-xxxx.js  dist/assets/index-xxxx.css"
    },
    {
      title: "The template README already points at TypeScript",
      from: "journal",
      file: "sorted_files/15_Week-15_Integration-otaku/README.md",
      lang: "text",
      code: `
## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend you use TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [\`typescript-eslint\`] in your project.
`,
      explain: [
        "This is Vite's stock README (boilerplate, not the student's writing — honest attribution), and it is still useful: it links the two upgrade paths this lesson recommends.",
        "The first link is react.dev's React Compiler page — the modern answer to the hand-written <code>useMemo</code>/<code>useCallback</code> material the journal skipped in Weeks 12.6–12.7.",
        "The second is the official TypeScript template: <code>npm create vite@latest -- --template react-ts</code> gives you the same project with types enabled from commit one.",
        "Note the advice is conditional — \"if you are developing a production application\" — matching this lesson's stance: adopt these tools when the project outgrows the tutorial."
      ]
    },
    {
      title: "Path 1: a production build, and what survives it",
      from: "new",
      file: "",
      lang: "bash",
      code: `
cd otaku
npm run build                      # compiles + minifies into dist/

# what you got: static files, no Vite, no proxy
ls dist
ls dist/assets

# the relative API URL survived into the bundle - deliberately
grep -c "/api/locations" dist/assets/*.js

# serve the files with any static server (Vite's own preview included)
npm run preview                    # or: npx serve dist
`,
      explain: [
        "<code>vite build</code> resolves every import, strips dev-only code (StrictMode's double effects included) and fingerprints filenames so browsers can cache them forever.",
        "The <code>grep</code> count of 1+ proves your fetch stayed relative — the right shape for a same-origin deployment, the wrong shape for any assumption that localhost exists.",
        "<code>npm run preview</code> and <code>npx serve dist</code> only serve <em>files</em>: API calls from that page need the API on the same origin (or a proxy you configure yourself) — which is the actual job of a deployment target.",
        "Never upload <code>node_modules</code> or your source: <code>dist/</code> plus the back end process is the whole production app."
      ],
      run: "cd otaku && npm run build && npm run preview",
      output: "dist/index.html\nPreview server running: Local: http://localhost:4173/"
    },
    {
      title: "Path 2: a real test with node:test (no install)",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// locations.test.js - extract the POST guard clause, then assert on it.
const test = require('node:test');
const assert = require('node:assert/strict');

function validateLocation(b) {
  if (!b.anime_name || !b.location_name || !b.city || !b.country) {
    return { code: 400, body: { message: 'Please fill all required fields' } };
  }
  return { code: 201, body: { message: 'Location added' } };
}

test('a missing city is rejected with 400', () => {
  const r = validateLocation({ anime_name: 'Your Name', location_name: 'Suga Shrine', country: 'Japan' });
  assert.equal(r.code, 400);
});

test('a complete location passes validation', () => {
  const r = validateLocation({ anime_name: 'Your Name', location_name: 'Suga Shrine', city: 'Tokyo', country: 'Japan' });
  assert.equal(r.code, 201);
});
`,
      explain: [
        "<code>node:test</code> and <code>node:assert</code> ship with Node 18+ — the first line is a require, not an install, exactly like <code>http</code> in Unit I.",
        "The function under test is the guard clause from server.js's POST route, copied out unchanged: no MySQL, no HTTP, no fetch — pure decision, instantly testable.",
        "<code>assert.equal</code> throws when the values differ, which is what fails a test; <code>node:assert/strict</code> refuses the coercions (<code>0 == '0'</code>) that hide real bugs.",
        "The second test is the one people forget: a validator that rejects everything also passes 'rejects bad input'. Always test the accept path too.",
        "Next step after green: make the tests run automatically (<code>npm test</code> → <code>node --test</code>), then add one for your search LIKE-building function."
      ],
      run: "node --test locations.test.js",
      output: "# tests 2\n# pass 2\n# fail 0"
    },
    {
      title: "Path 3: TypeScript at the boundary (types, not conversion)",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// TypeScript: same file, but tsc checks it before anyone runs it.
type NewLocation = {
  anime_name: string;
  location_name: string;
  city: string;
  country: string;
  description?: string;    // ? = optional, mirroring the NULL column
  image_url?: string;
};

function buildInsertParams(b: NewLocation): string[] {
  return [
    b.anime_name,
    b.location_name,
    b.city,
    b.country,
    b.description ?? '',    // ?? picks the left side unless it is null/undefined
    b.image_url ?? ''
  ];
}

const params = buildInsertParams({
  anime_name: 'Your Name',
  location_name: 'Suga Shrine',
  city: 'Tokyo',
  country: 'Japan'
});
console.log('values for the 6 placeholders:', params.length);
`,
      explain: [
        "This example is TypeScript, shown with the <code>javascript</code> label because the book's renderer has no TS mode — save it as <code>build-params.ts</code> to compile it.",
        "<code>buildInsertParams({ ... })</code> with a missing <code>city</code> is now a <em>build error</em>, not a 400 at runtime — the same rule server.js enforces, checked a year earlier.",
        "<code>description?: string</code> is the nullable column in type clothing, and <code>?? ''</code> is the typed version of the app's <code>b.description || ''</code>.",
        "The return type <code>string[]</code> documents the contract \"one value per ? placeholder\" — the count is exactly what an INSERT silently gets wrong.",
        "Run it with <code>npx tsx build-params.ts</code> (or add <code>\"typescript\": \"latest\"</code> and use <code>tsc</code>) — the output is ordinary JS once checked."
      ],
      run: "npx tsx build-params.ts",
      output: "values for the 6 placeholders: 6"
    },
    {
      title: "Path 4: the same read route, rewritten with Express",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// npm i express - then compare with server.js's 23 lines of route code.
const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());       // replaces readBody() entirely

const db = mysql.createPool({
  host: 'localhost', user: 'root', password: '', database: 'otaku_travel'
});

app.get('/api/locations', (req, res) => {
  const search = req.query.search;
  if (search) {
    const like = '%' + search + '%';
    const sql = 'SELECT * FROM locations WHERE anime_name LIKE ? OR location_name LIKE ? OR city LIKE ? OR country LIKE ? ORDER BY id DESC';
    db.query(sql, [like, like, like, like], (err, rows) =>
      err ? res.status(500).json({ message: 'Database error' }) : res.json(rows));
    return;
  }
  db.query('SELECT * FROM locations ORDER BY id DESC', (err, rows) =>
    err ? res.status(500).json({ message: 'Database error' }) : res.json(rows));
});

app.listen(5000, () => console.log('Express API on http://localhost:5000'));
`,
      explain: [
        "<code>app.get('/api/locations', ...)</code> replaces the URL parsing and the <code>if</code>-chain — Express matched the route before your function ran.",
        "<code>req.query.search</code> replaces <code>new URL(...).searchParams.get(...)</code>, and <code>express.json()</code> replaces the whole <code>readBody()</code> helper.",
        "<code>res.json(rows)</code> sets the status (200 by default) and stringifies — your <code>send()</code> helper in one method; <code>res.status(500).json(...)</code> is the error form.",
        "The SQL is <strong>unchanged</strong>: same pool, same <code>?</code> placeholders, same safety — frameworks replace plumbing, never your data model.",
        "Bonus for Path 1: <code>app.use(express.static('dist'))</code> is the two-line way to let Node serve your built front end from the same origin."
      ],
      run: "npm i express && node server-express.js",
      output: "Express API on http://localhost:5000"
    },
    {
      title: "Path 5a: environment variables instead of hard-coded config",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// The five constants at the top of server.js, made deployment-ready.
const http = require('http');
const mysql = require('mysql2');

const PORT = process.env.PORT || 5000;
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'otaku_travel'
});

console.log('API on port', PORT, '| database:', process.env.DB_NAME || 'otaku_travel');

http.createServer((req, res) => res.end('ok')).listen(PORT);
`,
      explain: [
        "<code>process.env.X || fallback</code> keeps your laptop working (nothing set → today's values) while letting a server inject its own — the defaults are the migration, not a rewrite.",
        "<code>PORT</code> is the classic: hosting platforms assign a port at runtime and expect you to honour it, so hard-coding 5000 gets your app rejected.",
        "Secrets move out of git entirely: set <code>DB_PASSWORD</code> in the platform's dashboard or a git-ignored <code>.env</code> (Lesson 041 showed the dotenv version for Sequelize).",
        "Same pool, same patterns from Lesson 080 — only the source of the values changed, which is the whole point of configuration."
      ],
      run: "node server-env.js   (optionally: set DB_NAME=otaku_travel_dev first)",
      output: "API on port 5000 | database: otaku_travel"
    },
    {
      title: "Path 5b: a Dockerfile for the back end",
      from: "new",
      file: "",
      lang: "text",
      code: `
# server/Dockerfile - reproducible deploy: same image on your laptop and on a server
FROM node:20-alpine
WORKDIR /app

# copy dependency files first: this layer is cached until they change
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# then the code
COPY server.js .

# config comes from the environment, never from the image
ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
`,
      explain: [
        "Six commands: base image, working folder, dependencies, code, config, start. Build with <code>docker build -t otaku-api .</code>, run with <code>docker run -e DB_PASSWORD=... -p 5000:5000 otaku-api</code>.",
        "<code>COPY package*.json</code> before <code>COPY .</code> is the standard layer-caching trick: editing server.js does not re-download your dependencies.",
        "<code>npm ci --omit=dev</code> installs exactly what package-lock.json says, production deps only — the reproducible sibling of <code>npm i</code>.",
        "<code>-e DB_PASSWORD=...</code> is Path 5a in action: the image is identical everywhere, only the environment differs — which is the definition of a deployable artifact.",
        "The front end's <code>dist/</code> goes to a static host (or gets served by Express with <code>express.static</code>) — remember the one-origin rule from Path 1."
      ],
      run: "docker build -t otaku-api server/ && docker run -e DB_HOST=host.docker.internal -p 5000:5000 otaku-api"
    }
  ],
  keyPoints: [
    "Units I–IV gave you four real capabilities: Node scripts and servers, Sequelize databases, React apps, and the integration discipline that makes the three run as one",
    "npm run build produces a static dist/ folder — no Vite and no proxy — so production means serving the files and the API from one origin",
    "node:test runs with zero installs: extract pure logic like the POST guard clause, assert on accept AND reject paths, and wire it to npm test",
    "TypeScript pays first at the boundaries — optional properties mirror NULL columns and a missing required field becomes a build error, not a 400",
    "Express replaces send(), readBody() and the if-chain router while your pool and ? placeholders stay exactly as they are",
    "Deploy in order: environment variables (process.env with safe defaults) first, containers second — secrets never in git"
  ],
  practice: `
    <p>Pick one path and finish it before you close the book — the build is the fastest:
    run <code>npm run build</code> in <code>otaku/</code>, list <code>dist/</code>, and serve it
    with <code>npm run preview</code>. Then write the two tests of Example 4 (typing them counts)
    and run <code>node --test</code> until both are green. Finally, read one page of real
    documentation — <a href='https://react.dev/reference/react/useEffect' target='_blank'
    rel='noopener'>react.dev's useEffect reference</a> is a good one — and notice how much of it
    you already understand. That feeling is the point of everything that came before it.</p>
  `,
  quiz: [
    {
      q: "Which command turns the React app into the static files you upload to a web host?",
      options: [
        "npm run build, which writes the compiled HTML/CSS/JS into dist/",
        "npm run dev, which keeps running until the upload finishes",
        "npm start, which runs the Vite proxy in production",
        "node server.js, which bundles the front end automatically"
      ],
      answer: 0,
      why: "dev starts the development server (with proxy and hot reload); build is the compiler that emits dist/; preview (or any static server) then serves those files. The back end is still started separately with node server.js."
    },
    {
      q: "The app moves to a real server whose MySQL has a password. Where should it come from?",
      options: [
        "An environment variable read via process.env.DB_PASSWORD, with the empty string kept only as a local fallback",
        "A new constant committed to server.js so every clone works the same",
        "The vite.config.js file, which the API reads at start-up",
        "A hardcoded default, changed once on the server's copy of the file"
      ],
      answer: 0,
      why: "Config that differs per machine belongs in the environment: git stays safe, one deploy setting changes, and your laptop keeps working through the || default. Hardcoded copies drift — that is how 'works on my machine' is born."
    }
  ],
  sources: [
    "https://developer.mozilla.org/en-US/docs/Learn",
    "https://react.dev/learn",
    "https://nodejs.org/docs/latest/api/",
    "https://sequelize.org/docs/v6/getting-started/",
    "https://nodejs.org/api/test.html",
    "https://expressjs.com/",
    "https://www.typescriptlang.org/docs/handbook/intro.html"
  ]
});
