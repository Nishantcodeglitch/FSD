window.COURSE_LESSONS.push({
  id: "w13-router-setup",
  file: "071",
  unit: 3,
  week: 13,
  title: "React Router: installation and your first routes",
  kicker: "Unit III · Week 13 · Lesson 1 of 4",
  minutes: 16,
  objectives: [
    "Explain the difference between server-side routing and client-side routing",
    "Install react-router-dom and wrap a React app in a <code>BrowserRouter</code>",
    "Map a URL to a component with <code>&lt;Routes&gt;</code> and <code>&lt;Route&gt;</code>, including the <code>*</code> catch-all 404",
    "Say where the router sits relative to <code>StrictMode</code> and why it matters"
  ],
  intro: `
    <p>In Week 12 you gave your components memory — <code>useState</code>, <code>useEffect</code>,
    <code>useRef</code> and the rest — but every app you built still has exactly <strong>one
    screen</strong>. The journal's <code>react3</code> stacks five <code>&lt;Books/&gt;</code> cards
    into a single long page, and the only way to "go somewhere else" is to edit the source code.
    <strong>Routing is what turns one screen into an app with pages.</strong></p>
    <p><strong>An honest note before we start.</strong> The journal folder for this week is empty:
    <code>sorted_files/13_Week-13_Routing/</code> holds only a <code>README.txt</code> ("Week 13:
    no routing source supplied - see MISSING.txt") and a <code>MISSING.txt</code> that says
    "MISSING - Week 13 Routes and Navigation: no react-router source supplied", and the DOCX has
    eight blank paragraphs where syllabus items 13.1 Routes and 13.2 Navigation should be. This
    chapter is therefore written from the official documentation —
    <a href='https://reactrouter.com/home' target='_blank' rel='noopener'>reactrouter.com</a> and
    <a href='https://react.dev/learn' target='_blank' rel='noopener'>react.dev</a> — with brand-new
    examples, a couple of which quote real <code>react3</code> files as their starting point. Every
    example is labelled <em>From your journal</em> or <em>New example</em>. Lesson 071 starts at
    zero: what routing actually is, one install command, and your first <code>&lt;Route&gt;</code>.</p>
  `,
  theory: [
    `
      <h3>Two kinds of routing</h3>
      <p>A <strong>route</strong> is a rule that maps a URL to whatever answers it. Unit I already
      built one kind: in Week 1 you wrote "GET /about sends this HTML, GET /contact sends that
      HTML" with Node and Express, and in Week 5 you built a whole server around it. That is
      <strong>server-side routing</strong> — the server decides, the browser throws the old page
      away and paints a new one. Client-side routing keeps the same idea but moves the decision
      into JavaScript:</p>
      <pre class="diagram">SERVER-SIDE ROUTING (Unit I)
click /about  ──HTTP GET──▶  server looks up route  ──sends a whole fresh page──▶  browser repaints
                              (every click = a round trip, all state is lost)

CLIENT-SIDE ROUTING (this week)
click /about  ──React Router intercepts the click──▶  only &lt;About/&gt; swaps into the tree
                              URL updated with the History API  ──▶  NO network request,
                              React state from Week 12 survives, no reload spinner</pre>
      <p>React Router never asks the server for a new document. It calls
      <code>history.pushState()</code> so the address bar truthfully reads <code>/about</code>,
      then re-renders the component tree. The server only ever sent one file:
      <code>index.html</code> (plus your JavaScript bundle). The price of this trick is that the
      server must be willing to serve <code>index.html</code> for <em>every</em> URL the app can
      reach — Vite's dev server does that for you (Lesson 074 covers what happens in production).</p>
    `,
    `
      <h3>Install: one command</h3>
      <p>React Router ships as a normal npm package. The journal's <code>react3/package.json</code>
      lists only <code>react</code> and <code>react-dom</code> as dependencies — nothing
      routing-related exists in any journal file — so the whole setup is:</p>
      <pre class="diagram">npm install react-router-dom</pre>
      <ul>
        <li>This book teaches <strong>React Router v7</strong>. In v7 the package
        <code>react-router-dom</code> simply re-exports everything from the core
        <code>react-router</code> package, so both import styles work and point at identical
        code. The official docs now recommend the shorter <code>from "react-router"</code>, and
        v8 will remove <code>react-router-dom</code> altogether. This chapter writes
        <code>react-router-dom</code> everywhere because that is the name the syllabus and most
        tutorials use — just know the two names are one library.</li>
        <li>v7 needs React 18+ and Node 20+. The journal's react3 runs React 19 on Vite 8, so it
        is already compatible — nothing else to upgrade.</li>
      </ul>
    `,
    `
      <h3>Wrapping the app: where the router lives</h3>
      <p><code>&lt;BrowserRouter&gt;</code> is a context provider: it reads
      <code>window.location</code>, listens for URL changes, and exposes the current URL to
      everything underneath it. A component can only call <code>useNavigate()</code>,
      <code>useParams()</code> and friends if it renders <em>inside</em> the router. There are two
      accepted placements:</p>
      <table>
        <thead><tr><th>Placement</th><th>Router lives in</th><th>Why people pick it</th></tr></thead>
        <tbody>
          <tr><td>A — shown in Example 4</td><td><code>src/main.jsx</code></td>
              <td>The router wraps the whole app once; <code>App</code> stays router-free. The
              usual choice, and what the official docs show first.</td></tr>
          <tr><td>B — shown in Example 5</td><td><code>src/App.jsx</code></td>
              <td><code>main.jsx</code> is never touched — handy if several entry files share one
              <code>App</code>.</td></tr>
        </tbody>
      </table>
      <p><strong>Relative to <code>StrictMode</code>:</strong> keep StrictMode as the outermost
      wrapper (it only adds development-time checks) with the router directly inside it. The rule
      that actually matters is different and simpler: <em>the router must be above every component
      that uses a router hook</em>. Move <code>&lt;BrowserRouter&gt;</code> above
      <code>&lt;StrictMode&gt;</code> and everything still works; put it <em>below</em> a component
      that calls <code>useNavigate()</code> and React throws
      "useNavigate() may be used only in the context of a &lt;Router&gt; component" — that error is
      the router telling you a hook escaped its provider.</p>
      <pre class="diagram">createRoot(document.getElementById('root')).render(
  &lt;StrictMode&gt;             outermost: React's development checks
    &lt;BrowserRouter&gt;         reads the URL, owns the history stack
      &lt;App /&gt;               everything inside may use router hooks
    &lt;/BrowserRouter&gt;
  &lt;/StrictMode&gt;
);</pre>
    `,
    `
      <h3>Routes and Route: one URL, one component</h3>
      <p><code>&lt;Routes&gt;</code> is the matchmaker. On every render it compares the current URL
      with each of its <code>&lt;Route&gt;</code> children and renders the
      <code>element</code> of the single best match — everything else is not rendered at all. Each
      route is a pattern plus a component:</p>
      <pre class="diagram">&lt;Routes&gt;
  &lt;Route path="/"      element={&lt;Home /&gt;} /&gt;     matches exactly "/"
  &lt;Route path="about"  element={&lt;About /&gt;} /&gt;    matches "/about"
  &lt;Route path="*"      element={&lt;NotFound /&gt;} /&gt; matches anything left over
&lt;/Routes&gt;</pre>
      <ul>
        <li><strong>A leading slash makes a path absolute</strong> (<code>/about</code> matches
        only <code>/about</code>). No slash = relative to the parent route, which is how nesting
        works in Lesson 072.</li>
        <li><strong>React Router ranks paths instead of taking the first match.</strong> If you
        write <code>/books/new</code> and <code>/books/:id</code>, the URL
        <code>/books/new</code> goes to the static route because it scores higher. Order in the
        file is a tie-breaker, not the main rule.</li>
        <li><strong><code>&lt;Route index element={...} /&gt;</code></strong> has no path at all:
        it renders when its parent's own URL matches exactly — "the default child". Lesson 072
        uses it with nested routes.</li>
      </ul>
    `,
    `
      <h3>The star: an in-app 404</h3>
      <p>A path ending in <code>*</code> is a <strong>catch-all</strong>: it matches any URL that
      no other route claimed. Put it last and you have a "page not found" screen that runs entirely
      in the browser — the same job <code>app.use(function (req, res) { ... })</code> fallback did
      for you in Week 5's Express server, except now no request ever leaves the page. Every
      well-built React app has exactly one of these; you will meet it again in the Lesson 074
      capstone, where it also swallows mistyped dynamic URLs.</p>
      <div class="note">
        <p><strong>Two failures, two answers.</strong> The catch-all handles URLs that match
        <em>no route</em> (<code>/xyz</code>). A URL that matches a route but has no data
        (<code>/books/999</code> when only 5 books exist) needs a different, in-page answer —
        Lesson 072 builds that.</p>
      </div>
    `,
    `
      <h3>The modern alternative you will read in the docs</h3>
      <p>Everything above is React Router's <strong>declarative mode</strong>: route configuration
      written as JSX that you render. The official documentation also teaches <strong>data
      mode</strong>, where the route tree is plain JavaScript and each route can declare a
      <code>loader</code> that fetches its data before the component paints:</p>
      <pre class="diagram">import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  { path: "/",     element: &lt;Home /&gt; },
  { path: "/about", element: &lt;About /&gt; }
]);

createRoot(root).render(&lt;RouterProvider router={router} /&gt;);</pre>
      <p>Same matching rules, same <code>useParams()</code>, but now you get <code>loader</code>s,
      <code>action</code>s, pending states and <code>useLoaderData</code> — that is the "modern
      alternative" every React Router v7 guide mentions. The docs recommend data mode for new
      apps, yet the JSX form is fully supported in v7 and is the right place to start: once
      <code>&lt;Routes&gt;</code> clicks in your fingers, data mode is a mechanical translation of
      the same table. This book stays in declarative mode, and Example 7 shows the exact same three
      routes rewritten in data mode so you can compare them side by side.</p>
    `
  ],
  examples: [
    {
      title: "The journal's react3 entry file: one screen, no router",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/react3/src/main.jsx",
      lang: "jsx",
      code: `
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import {Students, Teachers } from './students'
import Exployee from './Employee'
import Books from './books'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Books
    title = "Title: tao te ching"
    author = "Author: lau zu"
    price = {450}
    Publisher = "Panguin House"
    pages = {200}
    />

  </StrictMode>
)
`,
      explain: [
        "The three import lines pull in React's <code>StrictMode</code>, the <code>createRoot</code> API and the stylesheet — and note what is <strong>not</strong> imported: nothing from react-router-dom. The journal never installed routing; the Week 13 folder is empty for exactly this reason.",
        "<code>createRoot(...).render(...)</code> decides the entire UI in one place: every card the user will ever see is stacked into this single render call.",
        "The prop is written <code>Publisher</code> (capital P) while <code>books.jsx</code> reads <code>props.publisher</code>. Props are case-sensitive, so in the running journal app that field renders as nothing — a real journal bug, fixed properly in Lesson 074's data file.",
        "Trimmed for space: the real file repeats this Books card five times (lines 17–47) and then comments out Students, Teachers and Employee (lines 49–92). Its <code>App.jsx</code> exists but is <strong>0 bytes</strong> — the journal never gave react3 a second screen."
      ],
      run: "npm run dev   (inside sorted_files/11_Week-11_React-Intro/react3/ after npm install)",
      output: "VITE v8.2.0  ready in 4 ms  ➜  Local:   http://localhost:5173/"
    },
    {
      title: "Install react-router-dom and prove it landed",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# 1. work in a COPY of the journal app, so the journal file stays a faithful record
#    (copy react3 in File Explorer, rename the copy react3-router)

# 2. install the journal's own dependencies first
cd react3-router
npm install

# 3. add the router
npm install react-router-dom

# 4. show what npm put in the tree
npm ls react-router-dom react-router
`,
      explain: [
        "<code>npm install react-router-dom</code> downloads the package and adds <code>\"react-router-dom\": \"^7.18.4\"</code> to the dependencies block of package.json — a normal dependency, committed to git, one install per project.",
        "<code>npm ls</code> prints the installed tree: react-router-dom has exactly one dependency, the core <code>react-router</code> package. Same code, two names (see the theory above).",
        "Copying the folder first is a habit worth keeping: every chapter in this book modifies code, and the journal originals under <code>sorted_files/</code> are the historical record.",
        "No other setup is needed — no config file, no plugin, no server restart. Vite hot-reloads the moment you save a file."
      ],
      run: "npm install react-router-dom   then   npm ls react-router-dom react-router",
      output: "added 2 packages in 6s\n+-- react-router-dom@7.18.4\n`-- react-router@7.18.4"
    },
    {
      title: "Three tiny pages, before any routing exists",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/pages.jsx  -- named exports so one file can hold the small pages
export function Home() {
  return (
    <section>
      <h1>Home</h1>
      <p>The page you land on at "/" -- rendered by Route path="/".</p>
    </section>
  );
}

export function About() {
  return (
    <section>
      <h1>About</h1>
      <p>Reached at "/about" without a single page reload.</p>
    </section>
  );
}

export function NotFound() {
  return (
    <section>
      <h1>404 - page not found</h1>
      <p>The star route caught this URL.</p>
    </section>
  );
}
`,
      explain: [
        "These are ordinary components — there is nothing router-specific in them. Routing is about <em>which</em> component is on screen, not how a component is written.",
        "Named exports (<code>export function Home</code>) let one file carry three small pages; import them with <code>import { Home, About, NotFound } from './pages.jsx'</code>.",
        "<code>NotFound</code> exists purely to be the target of the <code>*</code> route — the client-side version of the 404 page you built with Express in Week 5.",
        "Nothing renders yet: without a router these functions are dead code. Examples 4–6 wire them up."
      ],
      run: "npm run dev   (once Example 4 and Example 6 are in place)"
    },
    {
      title: "Placement A: the router lives in main.jsx",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
`,
      explain: [
        "Exactly one new line compared with the Vite template: <code>import { BrowserRouter } from \"react-router-dom\"</code>. Everything else is unchanged.",
        "The wrappers nest in a deliberate order: <code>StrictMode</code> (development checks, always outermost) → <code>BrowserRouter</code> (owns the URL) → <code>App</code> (your routes).",
        "Because the router is above <code>App</code>, every component <code>App</code> renders — and their children — may call router hooks.",
        "The journal's main.jsx never imports <code>App</code> (its App.jsx is 0 bytes); giving the app pages is the reason to finally use that file."
      ],
      run: "npm run dev",
      output: "VITE v8.2.0  ready in 4 ms  ➜  Local:   http://localhost:5173/"
    },
    {
      title: "Placement B: the router lives in App.jsx instead",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// ---- src/main.jsx : placement B, no router here at all ----
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ---- src/App.jsx : the router lives here ----
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home, About } from "./pages.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
`,
      explain: [
        "Both files together are complete and runnable — pick this <em>or</em> placement A, never both (two nested BrowserRouter components would be a mistake, not a feature).",
        "The pay-off of placement B is visible in the first block: main.jsx keeps the journal's structure and is never edited again.",
        "<code>BrowserRouter</code> wraps <code>Routes</code> inside App, so App itself is still inside the router — calling <code>useNavigate()</code> from App is legal here.",
        "The imports use named exports from <code>./pages.jsx</code> (Example 3); the five Books cards from the journal's main.jsx are simply not rendered any more."
      ],
      run: "npm run dev  →  click http://localhost:5173/about in the address bar"
    },
    {
      title: "First routes: the star catch-all included",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/App.jsx -- companion to placement A (Example 4): App only declares routes
import { Routes, Route } from "react-router-dom";
import { Home, About, NotFound } from "./pages.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
`,
      explain: [
        "Each <code>&lt;Route&gt;</code> pairs a URL pattern with a component; <code>&lt;Routes&gt;</code> renders the one that best matches the address bar.",
        "<code>path=\"*\"</code> is the catch-all: visit <code>http://localhost:5173/anything-else</code> and NotFound renders instead of a blank screen. Keep it last in the file so it never shadows a real page.",
        "React Router ranks paths, so adding <code>/books/new</code> later will not be broken by a hypothetical <code>/books/:id</code> — the more specific pattern wins.",
        "This is the entire API surface of a small React app's navigation: two imports, one Routes, three Routes. Lessons 072–073 add params and links to exactly this table."
      ],
      run: "npm run dev  →  then open http://localhost:5173/nope",
      output: "the NotFound page renders: '404 - page not found'"
    },
    {
      title: "The same three routes in data mode: createBrowserRouter",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/main.jsx -- the modern alternative to <BrowserRouter> + <Routes>
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home, About, NotFound } from "./pages.jsx";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
  { path: "*", element: <NotFound /> }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
`,
      explain: [
        "The route table moved out of JSX into a plain array — same three patterns, same elements, no <code>&lt;Routes&gt;</code> to render.",
        "<code>RouterProvider</code> replaces <code>BrowserRouter</code> in the tree; in data mode it must be the top-level router (and in a React component you would import it from <code>react-router-dom</code> exactly as shown).",
        "You may now attach <code>loader: async () => fetch(...)</code> to any route so data is fetched <em>before</em> the component renders — the main reason the docs call this the modern path.",
        "Use this when you want those data features; otherwise the JSX version of Example 6 is shorter and does the same job. Both are supported in v7."
      ],
      run: "npm run dev  →  identical behaviour to Example 6, different wiring"
    }
  ],
  keyPoints: [
    "Client-side routing swaps components instead of loading new documents: the URL changes through the History API, no request is made, and Week 12 state survives navigation",
    "<code>npm install react-router-dom</code> is the entire setup; in v7 that package re-exports the core <code>react-router</code> library",
    "<code>BrowserRouter</code> must sit above every component that uses a router hook — conventionally inside <code>StrictMode</code>, either in main.jsx (placement A) or App.jsx (placement B)",
    "<code>&lt;Routes&gt;</code> renders the single best-matching <code>&lt;Route&gt;</code>; paths are ranked, a leading slash makes them absolute, and <code>path=\"*\"</code> is the 404 catch-all",
    "<code>createBrowserRouter</code> + <code>RouterProvider</code> is the data-mode alternative: the same routes as an array, plus loaders and actions"
  ],
  practice: `
    <p>Copy <code>sorted_files/11_Week-11_React-Intro/react3</code> to a new folder, run
    <code>npm install</code> and <code>npm install react-router-dom</code> inside it, then apply
    placement A: delete the five <code>&lt;Books/&gt;</code> cards from <code>main.jsx</code>,
    render <code>&lt;App/&gt;</code> inside <code>BrowserRouter</code>, and add
    <code>src/pages.jsx</code> and <code>src/App.jsx</code> from Examples 3 and 6. Start the dev
    server and check three URLs by hand: <code>/</code>, <code>/about</code>, and
    <code>/definitely-not-a-page</code> (which must show your 404). Finally, click between
    <code>/</code> and <code>/about</code> and confirm the browser shows <strong>no</strong> reload
    spinner — that missing spinner is client-side routing working.</p>
  `,
  quiz: [
    {
      q: "Where must a BrowserRouter be placed so that a component deep in the tree can call useNavigate()?",
      options: [
        "Above every component that uses router hooks — conventionally wrapping the app inside <code>&lt;StrictMode&gt;</code>",
        "Below StrictMode but above the CSS import, so styles load first",
        "Inside the same component that calls useNavigate(), so the hook finds it",
        "Anywhere at all — React Router reads window.location without being mounted"
      ],
      answer: 0,
      why: "The router is a context provider: hooks read the URL from it, so it must be rendered <em>above</em> them. StrictMode stays outermost because it only adds development checks."
    },
    {
      q: "What does a route written as path=\"*\" match?",
      options: [
        "Every URL that no other, more specific route claimed — the in-app 404",
        "Only URLs containing the literal asterisk character",
        "Every URL, so it should always be listed first",
        "Nothing; the star is a placeholder the router ignores"
      ],
      answer: 0,
      why: "The catch-all is the last line of defence: routes are ranked, so real pages win, and whatever is left over renders the NotFound component — the client-side equivalent of Week 5's Express 404 fallback."
    }
  ],
  sources: [
    "https://reactrouter.com/home",
    "https://reactrouter.com/start/declarative/routing",
    "https://reactrouter.com/start/modes",
    "https://react.dev/learn"
  ]
});
