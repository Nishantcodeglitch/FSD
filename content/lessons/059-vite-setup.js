window.COURSE_LESSONS.push({
  id: "w11-vite-setup",
  file: "059",
  unit: 3,
  week: 11,
  title: "Scaffolding a React app with Vite",
  kicker: "Unit III · Week 11 · Lesson 2 of 6",
  minutes: 14,
  objectives: [
    "Scaffold a React project with npm create vite@latest and run it with npm run dev",
    "Explain what each file Vite generates is for (index.html, src/main.jsx, vite.config.js, package.json)",
    "Say what a bundler and a dev server do, and why a React project needs them",
    "Describe what hot module replacement (HMR) does when you save a file"
  ],
  intro: `
    <p>Last lesson you met the idea: components describe the screen, React keeps the DOM in sync.
    But a browser cannot run the code we will write — JSX is not JavaScript the browser understands,
    and <code>import</code> chains of dozens of files load one-by-one over HTTP if you let them.
    Something must sit between your source files and the browser. That something is
    <strong>Vite</strong>, and this lesson takes the journal's real <code>my-react</code> project
    apart file by file so you know exactly what every generated file does.</p>
    <p>You will not need to run anything to follow along — every file below is copied from
    <code>sorted_files/11_Week-11_React-Intro/my-react/</code>. By the end you will be able to
    create your own project, start the dev server, and understand the two words every React
    developer says a hundred times a day: <em>install</em> and <em>dev</em>.</p>
  `,
  theory: [
    `
      <h3>Why a project needs scaffolding at all</h3>
      <p>A plain HTML/JS site is two files. A React app needs more: JSX must be translated into
      plain JavaScript, a hundred <code>import</code> statements must be resolved and bundled, and
      the browser must be served the result. Hand-assembling that toolchain (Babel here, a bundler
      there, a dev server somewhere else) was the old way and it was miserable. A
      <strong>scaffolder</strong> generates a working project for you in one command, with every
      tool pre-configured and versions known to work together. For React the scaffolder of choice
      is <strong>Vite</strong>, and the journal's projects were all made this way —
      <code>my-react</code>, <code>react3</code>, and every Week 12/13 folder in the repo.</p>
      <p>The command the journal used (and the one to remember) is:</p>
      <pre>npm create vite@latest my-react -- --template react</pre>
      <p>Breaking it down: <code>npm create</code> fetches and runs a package without installing
      it globally; <code>vite@latest</code> is the package (the <code>@latest</code> asks npm for
      the newest version); <code>my-react</code> is the folder name you want; and
      <code>-- --template react</code> tells the scaffolder to generate the React template. The
      double <code>--</code> passes everything after it through to the scaffolder rather than to
      npm itself. The generated <code>package.json</code> even carries the
      <code>&lt;template&gt;</code>'s name, which is why the journal's project is literally called
      <code>my-react</code>.</p>
    `,
    `
      <h3>The four files you must know</h3>
      <table>
        <thead><tr><th>File</th><th>Job</th></tr></thead>
        <tbody>
          <tr><td><code>index.html</code></td><td>The page the browser loads. Lives at the
          project root (not inside src!), contains the empty <code>&lt;div id="root"&gt;</code>
          and one <code>&lt;script type="module" src="/src/main.jsx"&gt;</code>.</td></tr>
          <tr><td><code>src/main.jsx</code></td><td>The JavaScript entry point: imports React,
          imports your components, and mounts the tree with
          <code>createRoot(...).render(...)</code>.</td></tr>
          <tr><td><code>vite.config.js</code></td><td>Configuration for Vite — in Week 11 it is
          three lines that load the React plugin; in Week 15 the <code>otaku</code> project adds a
          proxy to your Node server here.</td></tr>
          <tr><td><code>package.json</code></td><td>Declares the dependencies (react, react-dom)
          and the scripts (<code>dev</code>, <code>build</code>, <code>preview</code>) that run
          Vite.</td></tr>
        </tbody>
      </table>
      <p>There is no <code>node_modules</code> until you run <code>npm install</code> — the
      scaffolder never downloads packages for you. And the folder Vite generates also has
      <code>src/App.jsx</code>, <code>src/App.css</code>, <code>src/index.css</code> and an
      <code>assets/</code> folder: these are the starter components and styles you are meant to
      edit or delete.</p>
    `,
    `
      <h3>npm install, npm run dev, and HMR</h3>
      <p><code>npm install</code> reads <code>package.json</code>, downloads every listed
      dependency into <code>node_modules</code>, and writes an exact-version lockfile
      (<code>package-lock.json</code>) — the same workflow you used in every Unit I lab, so
      nothing is new here except the packages. <code>npm run dev</code> then starts the Vite
      <strong>development server</strong>: a small local web server (default
      <code>http://localhost:5173</code>) that serves your source files to the browser on
      demand, transpiling JSX and bundling modules on the fly.</p>
      <p>The dev server's killer feature is <strong>HMR — hot module replacement</strong>. When
      you save a file, Vite does not reload the whole page: it re-transpiles just that module and
      pushes the new version into the running browser, swapping it in place. Components you did
      <em>not</em> edit keep their memory — no form you half-filled gets wiped because you fixed a
      typo in a sibling file. If a changed module cannot be swapped safely, Vite falls back to a
      full reload. (<code>npm run build</code> is the production path: it bundles everything into
      a static <code>dist/</code> folder you can host anywhere — preview it with
      <code>npm run preview</code>.)</p>
      <div class="note"><strong>The journal's versions.</strong> The checked-in
      <code>package.json</code> files pin <code>react ^19.2.x</code> and <code>vite ^8.x</code> —
      current, modern versions. If your own machine installs newer ones, minor differences in the
      generated files are normal and harmless.</div>
    `,
    `
      <h3>Honest notes on the journal folders</h3>
      <p>Two quirks worth knowing before you explore the repo. First, in the
      <code>react3</code> project (Lesson 5's home) the file <code>src/App.jsx</code> is
      <strong>0 bytes</strong> — the real root of that app is <code>src/main.jsx</code>, which
      imports the prop components directly and renders them inside <code>StrictMode</code>. A
      Vite project happily runs with an unused, even empty, <code>App.jsx</code>, because only
      <code>index.html</code> → <code>main.jsx</code> is on the critical path. Second, the
      journal's DOCX notes record a broken copy of the scaffold in <code>react2_Lab10</code>
      where <code>main.jsx</code> was pasted wrong and <code>App.jsx</code> came out 0 bytes;
      Lesson 4 reconstructs that bug as a "spot the error" exercise.</p>
    `
  ],
  examples: [
    {
      title: "package.json (journal): the project's identity card",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/my-react/package.json",
      lang: "json",
      code: `
{
  "name": "my-react",
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
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.3",
    "vite": "^8.1.1"
  }
}
`,
      explain: [
        "Read this with Unit I eyes: it is exactly the package.json shape you already know — name, scripts, dependencies — the scaffolder just filled it in for you.",
        "<code>\"dev\": \"vite\"</code> is why <code>npm run dev</code> starts the dev server; <code>\"build\": \"vite build\"</code> produces the static <code>dist/</code> site.",
        "<code>react</code> and <code>react-dom</code> sit in <code>dependencies</code> (needed at runtime); Vite and the React plugin sit in <code>devDependencies</code> (only needed while developing) — the same split your Express projects used.",
        "<code>\"type\": \"module\"</code> makes every <code>.js</code> file here an ES module — the lesson-16 rule, now the default in every modern front-end project.",
        "This trimmed version keeps the interesting fields; the real file also lists ESLint and TypeScript-helper dev dependencies."
      ],
      run: "npm install   (then)   npm run dev"
    },
    {
      title: "vite.config.js (journal): three lines of configuration",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/my-react/vite.config.js",
      lang: "javascript",
      code: `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
`,
      explain: [
        "A config file is just an ES module that default-exports its settings — the same convention as the journal's <code>webpack.config.js</code> in Week 6, with <code>export default</code> instead of <code>module.exports</code>.",
        "<code>defineConfig</code> is a helper from Vite that gives you editor hints; you could export the plain object and it would work identically.",
        "<code>@vitejs/plugin-react</code> is the plugin that transpiles JSX and wires the React fast-refresh runtime — without it, <code>.jsx</code> files would not build.",
        "Later, in the Week 15 <code>otaku</code> project, this same file grows a <code>server.proxy</code> section that forwards <code>/api</code> requests to your Node back end — config grows with the app."
      ],
      run: "npx vite --help   (a config file itself produces no output)"
    },
    {
      title: "index.html (journal): the entry the browser actually loads",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/my-react/index.html",
      lang: "html",
      code: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>my-react</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
      explain: [
        "Unlike most build tools, Vite keeps index.html at the project root and treats <em>it</em> as the entry — the script tag points into src/, not the other way round.",
        "<code>src=\"/src/main.jsx\"</code> uses an absolute path from the project root; Vite resolves, transpiles and (in dev) serves it on the fly.",
        "<code>&lt;div id=\"root\"&gt;</code> is the empty mount point — the whole UI is rendered inside it by main.jsx.",
        "Because the page ships almost no markup, the first paint is tiny and fast; all content arrives as JavaScript modules."
      ],
      run: "cd my-react && npm install && npm run dev",
      output: "VITE v8.1.1  ready in 300 ms\n\n  ➜  Local:   http://localhost:5173/\n  ➜  Network: use --host to expose"
    },
    {
      title: "src/main.jsx (journal): where the app is mounted",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/my-react/src/main.jsx",
      lang: "jsx",
      code: `
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx' //we put curly brackets as we exported the function
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Content from './components/Content.jsx'
import Navbar from './components/Navbar.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <Header></Header>
    <Navbar></Navbar>
    <Content></Content>
    <Footer></Footer>

  </StrictMode>,
)
//we have removed the app import for now.
`,
      explain: [
        "<code>react</code> provides the component machinery; <code>react-dom/client</code> provides <code>createRoot</code>, the piece that connects React to the browser's DOM.",
        "<code>import './index.css'</code> has no braces and no name — importing a side effect (the stylesheet) rather than a value. Vite bundles the CSS along with the JS.",
        "<code>createRoot(document.getElementById('root'))</code> grabs the empty div from index.html and hands it to React; <code>.render(...)</code> mounts the component tree into it.",
        "Note the journal's own trailing comment: App is imported but not rendered — the four page components are composed directly. Lesson 4 picks this file apart properly."
      ],
      run: "cd my-react && npm run dev"
    },
    {
      title: "From zero to running app: the three commands",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# 1. scaffold a fresh project (any empty folder works)
npm create vite@latest my-app -- --template react

# 2. go inside it and download the dependencies
cd my-app
npm install

# 3. start the development server
npm run dev
`,
      explain: [
        "Step 1 only writes files — it downloads <em>one</em> scaffolding package, not your dependencies. That is why step 2 exists: <code>npm install</code> reads package.json and fills <code>node_modules</code>.",
        "Step 3 starts Vite's dev server; the terminal prints the local URL (default <code>http://localhost:5173</code>) — the React equivalent of your Unit I \"Server running at http://localhost:8080\".",
        "The journal never shows these commands, only their result: every Week 11–13 folder in <code>sorted_files/</code> is the output of exactly this sequence.",
        "Stop the server with Ctrl+C; edit any file under <code>src/</code> while it runs and watch the browser update without a manual refresh (HMR)."
      ],
      run: "npm create vite@latest my-app -- --template react && cd my-app && npm install && npm run dev",
      output: "VITE v8.x.x  ready in ~300 ms\n\n  ➜  Local:   http://localhost:5173/"
    },
    {
      title: "Spot the bug: deleting the root div from index.html",
      from: "new",
      file: "",
      lang: "html",
      code: `
<!doctype html>
<!-- BROKEN: the mount point is missing -->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>my-app</title>
  </head>
  <body>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
      explain: [
        "main.jsx still runs <code>createRoot(document.getElementById('root'))</code> — but there is no element with <code>id=\"root\"</code> any more, so <code>getElementById</code> returns <code>null</code>.",
        "React then throws <em>Uncaught Error: Target container is not a DOM element</em> in the browser console — one of the two or three errors every React beginner meets in week one.",
        "The fix is to put the div back: <code>&lt;div id=\"root\"&gt;&lt;/div&gt;</code> before the script tag. The id string must match what main.jsx asks for, exactly.",
        "Try it on the journal's <code>my-react</code> copy (mentally or for real): the error names the container, not the component — the container is index.html's job, not React's."
      ],
      run: "npm run dev, then open the browser console",
      output: "Uncaught Error: Target container is not a DOM element.\n    at main.jsx"
    }
  ],
  keyPoints: [
    "<code>npm create vite@latest my-app -- --template react</code> generates a ready-to-run React project; <code>npm install</code> then <code>npm run dev</code> brings it up.",
    "Vite's index.html lives at the project root and points at <code>src/main.jsx</code>; everything visible is rendered into the empty <code>&lt;div id=\"root\"&gt;</code>.",
    "<code>vite.config.js</code> loads the React plugin that transpiles JSX — the one config line a Week 11 project cannot do without.",
    "<code>npm run dev</code> starts a local dev server (default port 5173) that transpiles and bundles on demand; <code>npm run build</code> emits the static production site.",
    "HMR (hot module replacement) swaps only the file you saved into the running page, so unrelated component state survives your edits.",
    "The journal's <code>react3/src/App.jsx</code> is 0 bytes — harmless, because the app's real root is <code>src/main.jsx</code>."
  ],
  practice: `
    <p>Open the journal's <code>sorted_files/11_Week-11_React-Intro/my-react/</code> folder and
    match every generated file to the table in this lesson without looking. Then run
    <code>npm install</code> followed by <code>npm run dev</code> inside it, open the printed
    localhost URL, and edit <code>src/components/Content.jsx</code> — change
    <code>React Course</code> to your own course name — and watch the browser update
    <em>without</em> you touching refresh. That instant update is HMR, and it is the reason
    Vite is the default scaffold.</p>
  `,
  quiz: [
    {
      q: "You just ran npm create vite@latest. What must you do before npm run dev will work in the new folder?",
      options: [
        "Run npm install — the scaffolder writes package.json but does not download the dependencies",
        "Run npm update — the scaffolder installs old versions",
        "Edit vite.config.js to point at your src folder",
        "Nothing — npm run dev works immediately after scaffolding"
      ],
      answer: 0,
      why: "The scaffolder only generates files. node_modules stays empty until npm install reads package.json and downloads react, react-dom, vite and the plugins."
    },
    {
      q: "You save a change to Header.jsx while the dev server is running and only that piece of the page updates, with other components keeping their data. What is this called?",
      options: [
        "Reconciliation",
        "Server-side rendering",
        "Hot module replacement (HMR)",
        "Minification"
      ],
      answer: 2,
      why: "HMR swaps just the changed module into the running page. Reconciliation is React's separate job of diffing component output against the DOM; the other two options are unrelated build concepts."
    }
  ],
  sources: [
    "https://vite.dev/guide/",
    "https://vite.dev/guide/#scaffolding-a-new-vite-project",
    "https://react.dev/learn/installation"
  ]
});
