window.COURSE_LESSONS.push({
  id: "w15-wiring-and-proxy",
  file: "083",
  unit: 4,
  week: 15,
  title: "Wiring it together: Vite proxy, main.jsx, CORS",
  kicker: "Unit IV · Week 15 · Lesson 5 of 7",
  minutes: 15,
  objectives: [
    "Explain what server.proxy does to a fetch('/api/...') and where the request really goes",
    "Describe the CORS problem in one sentence and name its two standard fixes",
    "Say why a fetch URL must never hardcode http://localhost:5000",
    "Recognise StrictMode's double-invoked effect and start both halves of the app"
  ],
  intro: `
    <p>You now have every piece: an API that answers JSON (Lesson 080), a database full of rows
    (081), and a React app that fetches them (082) — each half written, none of them
    <em>introduced</em> to each other. This chapter is the introduction: three small files —
    <code>vite.config.js</code>, <code>src/main.jsx</code> and the npm scripts — decide whether
    the pieces find each other or fail with a CORS wall of red text. It is the shortest chapter
    of the week and the one beginners skip at their peril; after it, Lesson 084 runs the whole
    thing top to bottom.</p>
  `,
  theory: [
    `
      <h3>The bridge: five lines in vite.config.js</h3>
      <p>The React app's fetches use relative URLs (<code>/api/locations</code>), so on their
      own they would be answered by the Vite dev server — which would return
      <code>index.html</code> for an unknown path, not your rows. The <code>server.proxy</code>
      setting changes that:</p>
      <pre class="diagram">server: {
  port: 5173,
  proxy: {
    '/api': 'http://localhost:5000'
  }
}</pre>
      <p>Read it as a forwarding rule: <em>"any request whose path starts with
      <code>/api</code>, send it to the Node API on port 5000, and hand me back whatever it
      answers."</em> The browser never knows — from DevTools' point of view the response came
      from <code>localhost:5173</code>, same origin as the page, so no security rule is even
      asked. The <strong>path is forwarded unchanged</strong>:
      <code>GET /api/locations?search=Tokyo</code> arrives at server.js exactly as written.
      (Config files are read once at start-up — edit it and restart <code>npm run dev</code>.)</p>
    `,
    `
      <h3>CORS in one paragraph, and the two ways out</h3>
      <p>Lesson 079 introduced it; here is the working definition: the browser's
      <strong>same-origin policy</strong> refuses to let a page on
      <code>http://localhost:5173</code> <em>read</em> responses from
      <code>http://localhost:5000</code>, because the ports differ — and a server that wants to
      allow it must explicitly answer with <code>Access-Control-Allow-Origin</code>. Those
      opt-in response headers are <strong>CORS</strong> (Cross-Origin Resource Sharing). You
      have exactly two standard moves:</p>
      <table>
        <thead><tr><th>Fix</th><th>How</th><th>Trade-off</th></tr></thead>
        <tbody>
          <tr><td>CORS headers on the API</td><td>the server sets <code>Access-Control-Allow-Origin</code> on every response (plus OPTIONS preflight handling for JSON POST/PUT)</td><td>works everywhere, but the plumbing is yours — every route, every method, and you must restrict the origin in production</td></tr>
          <tr><td>Proxy (this project)</td><td>Vite forwards <code>/api</code> server-to-server</td><td>zero CORS code in server.js; but the proxy only exists while the dev server runs</td></tr>
        </tbody>
      </table>
      <p>Otaku Travel Map takes the proxy route — grep <code>server.js</code> for
      <code>Access-Control</code> and you will find nothing, and that is not an oversight.
      Example 4 builds the header alternative so you can see exactly what the proxy is doing for
      you.</p>
    `,
    `
      <h3>Why you never hardcode http://localhost:5000 in fetch</h3>
      <p>It works on your laptop, which is precisely the problem. A hard-coded backend URL bakes
      three lies into your bundle:</p>
      <ul>
        <li><strong>The host changes.</strong> On a server, the API is
        <code>api.yourdomain.com</code>, not <code>localhost</code> — localhost there means
        <em>the visitor's own machine</em>, which does not run your API.</li>
        <li><strong>The scheme changes.</strong> Pages served over <code>https</code> are blocked
        from calling <code>http://</code> endpoints (mixed content), so the literal
        <code>http://</code> can break a deployed app that works perfectly in dev.</li>
        <li><strong>It becomes cross-origin by construction</strong> — you then need the CORS
        headers of the previous section for a problem the relative URL never had.</li>
      </ul>
      <p><code>fetch('/api/locations')</code> has none of these problems: it always goes to
      whatever origin served the page. In development the Vite proxy carries it to
      <code>:5000</code>; in production the built files and the API are served from one origin,
      so it just works. If you ever truly need a separate API host, the standard compromise is
      an environment variable (<code>VITE_API_URL</code>) read at build time — configuration,
      not source code (Lesson 085 does this properly for the back end).</p>
    `,
    `
      <h3>main.jsx: the ten lines that start React (and StrictMode's trick)</h3>
      <p><code>index.html</code> ships an empty <code>&lt;div id="root"&gt;</code>;
      <code>src/main.jsx</code> is what fills it:</p>
      <pre class="diagram">createRoot(document.getElementById('root')).render(
  &lt;StrictMode&gt;
    &lt;App /&gt;
  &lt;/StrictMode&gt;,
)</pre>
      <p><code>createRoot</code> (React 18+; the older <code>ReactDOM.render</code> is gone)
      attaches React to that div, and everything inside it is your component tree.
      <code>&lt;StrictMode&gt;</code> is a wrapper with <strong>no visual effect</strong> — it
      is a development-only examiner that deliberately runs things twice to expose lazy code.
      Its most famous habit: <strong>mount effects are invoked twice</strong> in dev
      (run → cleanup → run again), which is why the Network tab shows
      <em>two identical <code>GET /api/locations</code> requests</em> when the app opens. If
      your effect is well written (fetch and store; no subscriptions to leak), running it twice
      is harmless — and it does <strong>not</strong> happen in the production build. Newcomers
      spend hours hunting this "double API call bug" that is actually React doing its job;
      Lesson 085's testing example shows the same code running once under a real test runner.</p>
    `,
    `
      <h3>Two processes, two terminals (or one command)</h3>
      <p>Nothing in this project starts both halves, and that is intentional — a full-stack app
      is two programs with two logs, and separating them makes errors obvious:</p>
      <table>
        <thead><tr><th>Terminal</th><th>Folder</th><th>Command</th><th>Script</th><th>Prints</th></tr></thead>
        <tbody>
          <tr><td>1</td><td><code>otaku/server</code></td><td><code>node server.js</code></td><td><code>npm start</code></td><td>MySQL connected / Server running on :5000</td></tr>
          <tr><td>2</td><td><code>otaku</code></td><td><code>npm run dev</code></td><td>—</td><td>VITE ready → http://localhost:5173/</td></tr>
        </tbody>
      </table>
      <p>If two terminals annoy you, the ecosystem's answer is
      <strong>concurrently</strong>, a tiny dev dependency that runs several npm scripts in one
      window with coloured labels (Example 7). Either way you still have two processes — the
      tool just types <code>cd</code> and <code>npm</code> for you.</p>
    `
  ],
  examples: [
    {
      title: "vite.config.js: the proxy rule, annotated",
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
        "<code>defineConfig</code> just gives your object a little IDE help; the object itself is plain — Vite reads it at start-up.",
        "<code>plugins: [react()]</code> enables JSX compilation and fast refresh; without it the browser cannot load <code>.jsx</code> files at all.",
        "<code>server.port: 5173</code> pins the front end's origin — the value you will type into the browser a thousand times.",
        "<code>proxy: { '/api': 'http://localhost:5000' }</code> is a prefix match: <code>/api/locations?search=x</code> is forwarded verbatim to the API; <code>/src/App.jsx</code> is not.",
        "This whole <code>server</code> block applies to <code>npm run dev</code> only — a production build has no Vite running (Lesson 085), which is why the fetch URL must stay relative."
      ],
      run: "cd otaku && npm run dev   (edit this file and the dev server must restart)",
      output: "Local:   http://localhost:5173/"
    },
    {
      title: "main.jsx: the complete entry point",
      from: "journal",
      file: "otaku/src/main.jsx",
      lang: "jsx",
      code: `
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`,
      explain: [
        "Line 3 imports CSS as a module — Vite inlines it into the page; nothing appears without it, which is a classic \"why is my app unstyled\" check.",
        "<code>document.getElementById('root')</code> is the same div index.html shipped empty; <code>createRoot(...).render(...)</code> mounts the tree into it.",
        "<code>&lt;StrictMode&gt;</code> wraps only the dev behaviour: in development React double-invokes effects to surface missing cleanups — the source of the \"two GETs on load\" mystery below.",
        "Ten lines, zero app logic: main.jsx is pure wiring, so a bug you can see on screen almost always lives in App.jsx instead.",
        "ES modules again (Lesson 016): <code>import</code> here works because package.json says <code>\"type\": \"module\"</code> and Vite bundles it."
      ],
      run: "open http://localhost:5173  (renders the Otaku Travel Map header immediately)"
    },
    {
      title: "otaku/package.json: the scripts that run the front end",
      from: "journal",
      file: "otaku/package.json",
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
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.7",
    "@vitejs/plugin-react": "^6.1.1",
    "eslint": "^10.10.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.6",
    "globals": "^17.12.0",
    "vite": "^8.3.0"
  }
}
`,
      explain: [
        "<code>\"dev\": \"vite\"</code> is why <code>npm run dev</code> starts the dev server (with the proxy from example 1) — the command behind terminal 2.",
        "<code>\"type\": \"module\"</code> explains the <code>import</code>/<code>export</code> syntax everywhere in <code>src/</code> — the exact opposite of the back end's <code>\"commonjs\"</code>.",
        "<code>\"build\": \"vite build\"</code> and <code>\"preview\": \"vite preview\"</code> are the production pair you will use in the final lesson.",
        "React 19 and Vite 8 sit in different sections: <code>dependencies</code> ship with the app, <code>devDependencies</code> (Vite, ESLint, types) are build-time tools only.",
        "Compare <code>otaku/server/package.json</code> from Lesson 080: one dependency versus seventeen — the two halves genuinely are different programs."
      ],
      run: "cd otaku && npm run dev",
      output: "VITE v8.x.x  ready in xxx ms"
    },
    {
      title: "The other way out of CORS: headers from the server",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// What the proxy does invisibly, done by hand instead.
// server.js does NOT contain this - it relies on the Vite proxy.
const http = require('http');

http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:5173'
  });
  res.end(JSON.stringify({ ok: true, path: req.url }));
}).listen(5000, () => console.log('CORS demo on http://localhost:5000'));
`,
      explain: [
        "<code>Access-Control-Allow-Origin</code> is the browser's permission slip: it names the one origin allowed to read this response — here the Vite page.",
        "Remove that header and the same request from :5173 fails with the console error \"...has been blocked by CORS policy\" — reproduce it once and you will recognise it forever.",
        "For JSON POST/PUT the browser additionally sends an <strong>OPTIONS preflight</strong>, so a real CORS API must also answer those with <code>Access-Control-Allow-Methods</code> and <code>-Headers</code> — plumbing the proxy gives you for free, and a good reason the project skipped it.",
        "In production, never allow <code>*</code> or your dev origin blindly: name your real domain, or keep requests same-origin and avoid CORS entirely."
      ],
      run: "node cors-demo.js   (then fetch('http://localhost:5000') from a page on :5173)",
      output: "CORS demo on http://localhost:5000"
    },
    {
      title: "Spot the bug: a hardcoded backend URL",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
async function loadWrong() {
  // Cross-origin: a page on :5173 reading :5000 -> CORS error in the console.
  // And when deployed, the API is neither on localhost nor on http:// ...
  const res = await fetch('http://localhost:5000/api/locations');
  return res.json();
}

async function loadRight() {
  // Same origin always: dev sends it through the Vite proxy to :5000,
  // production serves the files and the API from one host.
  const res = await fetch('/api/locations');
  return res.json();
}
`,
      explain: [
        "Both functions are correct JavaScript — only the URL differs, which is what makes the bug invisible in code review.",
        "<code>loadWrong</code> fails today (proxy bypassed → CORS) and would still fail after deployment (no server on the visitor's localhost, and https pages may not call http endpoints).",
        "<code>loadRight</code> is what App.jsx actually uses: a relative URL resolved against the page's origin, delegated to the proxy in development.",
        "The one thing the relative URL cannot do is reach a <em>different</em> domain — when that day comes, put the base URL in an environment variable, not in the source."
      ],
      run: "open http://localhost:5173, paste into the DevTools console, compare the two calls"
    },
    {
      title: "StrictMode's double effect, made visible",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

function Probe() {
  const [runs, setRuns] = useState(0);
  useEffect(() => {
    console.log('effect run - this is where loadLocations() fires');
    setRuns((n) => n + 1);
  }, []);
  return <p>effect runs seen: {runs}</p>;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Probe />
  </StrictMode>
);
`,
      explain: [
        "Run it with <code>npm run dev</code>: the console line appears twice and the page shows \"effect runs seen: 2\" — that is the double invocation, not a runaway loop.",
        "React mounts, immediately tears down (you would see a cleanup log here), then mounts again — its way of testing that your effect can start from scratch.",
        "That is exactly why DevTools shows two <code>GET /api/locations</code> on the Otaku app's first load in development.",
        "Build for production (<code>npm run build</code>) and serve it: the effect runs once. Well-written effects — fetch data, store it — are safe under both."
      ],
      run: "npm run dev   (dev server: effect runs twice)",
      output: "effect run - this is where loadLocations() fires\neffect run - this is where loadLocations() fires"
    },
    {
      title: "One command for both halves: concurrently",
      from: "new",
      file: "",
      lang: "json",
      code: `
{
  "name": "otaku",
  "private": true,
  "type": "module",
  "scripts": {
    "api": "node server/server.js",
    "web": "vite",
    "dev": "concurrently -n api,web -c blue,green \\"npm run api\\" \\"npm run web\\""
  },
  "devDependencies": {
    "concurrently": "^9.1.0"
  }
}
`,
      explain: [
        "<code>npm i -D concurrently</code> once, then <code>npm run dev</code> starts the API and Vite together in a single window.",
        "<code>-n api,web</code> labels the two streams and <code>-c blue,green</code> colour-codes them — you still see each process's own log, which is the whole point.",
        "Inside the JSON string the quotes are escaped (<code>\\\"</code>) because JSON strings may not contain bare double quotes — a common copy-paste bug.",
        "This is convenience, not architecture: two processes still run, Ctrl+C stops both, and if the API dies the label tells you which one."
      ],
      run: "npm i -D concurrently && npm run dev",
      output: "[api] MySQL connected\n[api] Server running on http://localhost:5000\n[web] Local: http://localhost:5173/"
    }
  ],
  keyPoints: [
    "server.proxy { '/api': 'http://localhost:5000' } makes the dev server forward API calls — from the browser's view everything stays on :5173",
    "CORS is the same-origin policy's opt-in escape hatch (Access-Control-Allow-Origin); Otaku proxies instead, so server.js contains no CORS code at all",
    "fetch('/api/...') with a relative URL survives dev, https and any hostname; a hardcoded http://localhost:5000 survives only your laptop",
    "StrictMode double-invokes effects in development — two identical GETs on load are expected, and stop in the production build",
    "Two processes, two terminals: node server.js (5000) and npm run dev (5173) — or one concurrently command if you prefer"
  ],
  practice: `
    <p>Make a copy of <code>otaku/vite.config.js</code>, delete the whole
    <code>proxy</code> block in the copy, and point the app at it (or simply delete the block,
    run, then undo it). Reload the page and read the console: a red
    <em>"blocked by CORS policy"</em> for the GET, or a 404 HTML response — both mean the bridge
    is gone. Restore the rule, restart <code>npm run dev</code> (config files are read once),
    and count the <code>api/locations</code> requests on a fresh load: <strong>two</strong>, from
    StrictMode — and only two.</p>
  `,
  quiz: [
    {
      q: "The page runs on localhost:5173 and fetch('/api/locations') ends up reaching Node on localhost:5000. Which component actually sends the second hop?",
      options: [
        "The Vite dev server: your fetch goes to :5173, the proxy rule matches the /api prefix and forwards it to :5000 behind the scenes",
        "React, which appends the API port to every fetch call automatically",
        "The browser, which follows a redirect from the Node server",
        "MySQL, which answers on 5173 and Node picks it up"
      ],
      answer: 0,
      why: "The browser only ever talks to :5173; server.proxy in vite.config.js makes the dev server relay /api requests to :5000 server-to-server — outside the browser, so no CORS rule is triggered."
    },
    {
      q: "The Network tab shows two identical GET /api/locations requests when the app opens. Is something broken?",
      options: [
        "No — StrictMode intentionally runs effects twice in development (run, cleanup, run) to expose missing cleanup; the production build runs it once",
        "Yes — useEffect has a missing dependency array, so it loops forever",
        "Yes — two components are accidentally mounted; delete main.jsx's App import",
        "No — the browser retries every request once when HTTP/2 is unavailable"
      ],
      answer: 0,
      why: "The effect does have an empty dependency array, so it runs on mount only — StrictMode deliberately mounts twice in dev as a lint for your effects. Nothing doubles in the built app."
    }
  ],
  sources: [
    "https://vite.dev/config/server-options",
    "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS",
    "https://react.dev/reference/react/StrictMode",
    "https://www.npmjs.com/package/concurrently"
  ]
});
