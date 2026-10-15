window.COURSE_LESSONS.push({
  id: "w13-multi-page-capstone",
  file: "074",
  unit: 3,
  week: 13,
  title: "Putting Week 13 together: a multi-page app",
  kicker: "Unit III · Week 13 · Lesson 4 of 4",
  minutes: 20,
  objectives: [
    "Turn the journal's single-screen <code>react3</code> app into a multi-page app with a shared navbar",
    "Map each journal component (Books, Employee, Students) onto its own URL and route",
    "Build a detail page driven by a <code>:id</code> param and style the active nav link",
    "Explain why <code>BrowserRouter</code> works under the Vite dev server and when hash routing is the right alternative"
  ],
  intro: `
    <p>Three lessons, three halves of one skill: Lesson 071 installed the router, Lesson 072 made
    URLs carry data, Lesson 073 taught the app to move. This capstone is where your Week 12 hooks
    and the journal's Week 11 components finally become an actual <em>application</em>: the
    <code>react3</code> app that has always rendered one long stack of cards becomes a six-page
    site with a nav bar, active-link highlighting, a <code>:id</code> detail page and a 404 —
    every screen reachable by URL.</p>
    <p><strong>Honesty note, one last time.</strong> The journal's Week 13 folder
    (<code>sorted_files/13_Week-13_Routing/</code>) is empty — its <code>MISSING.txt</code> reads
    "MISSING - Week 13 Routes and Navigation: no react-router source supplied" — so the routing
    layer here is written from the official documentation at
    <a href='https://reactrouter.com/home' target='_blank' rel='noopener'>reactrouter.com</a> and
    <a href='https://react.dev/learn' target='_blank' rel='noopener'>react.dev</a>. What
    <em>is</em> yours is everything else: Examples 1–3 quote your real
    <code>react3/src</code> files verbatim, and the pages are those components with routes around
    them. Three journal bugs turn up along the way; all three are fixed in place and
    called out.</p>
  `,
  theory: [
    `
      <h3>The plan: one component tree, six URLs</h3>
      <p>A multi-page app is not a rewrite — it is a <strong>re-shelving</strong>. Today the
      journal's <code>main.jsx</code> renders everything at once; after the capstone it renders
      only <code>&lt;App/&gt;</code>, and App decides which single screen the URL asks for. This
      is the file list, with the example that builds each part:</p>
      <pre class="diagram">react3-router/            a COPY of sorted_files/11_Week-11_React-Intro/react3
├─ index.html             unchanged (the Vite entry)
├─ package.json           unchanged + react-router-dom (Lesson 071)
└─ src/
   ├─ main.jsx            BrowserRouter wraps the app                → Example 10
   ├─ App.jsx             navbar + ScrollToTop + the route table     → Example 9
   ├─ components/
   │  ├─ Navbar.jsx       NavLink bar, active item highlighted       → Example 5
   │  └─ ScrollToTop.jsx  from Lesson 073, Example 7 (copy it over)
   ├─ pages.jsx           Home, About, NotFound                      → Example 6
   ├─ pages/
   │  ├─ Books.jsx        the shelf, each title links to its URL     → Example 7
   │  └─ BookDetail.jsx   /books/:id detail page                     → Example 8
   ├─ data.js             the journal's books, as data               → Example 4
   ├─ books.jsx           journal component, reused as-is            → Example 1
   ├─ students.jsx        journal Students + Teachers                → Example 2
   └─ Employee.jsx        journal Employee                           → Example 3</pre>
      <p>Seven routes cover the whole journal: <code>/</code>, <code>/books</code>,
      <code>/books/:id</code>, <code>/employees</code>, <code>/students</code>,
      <code>/about</code>, and the <code>*</code> catch-all.</p>
    `,
    `
      <h3>What maps to what — and the three journal bugs</h3>
      <table>
        <thead><tr><th>Journal (Week 11)</th><th>URL after the capstone</th><th>Route</th></tr></thead>
        <tbody>
          <tr><td>five <code>&lt;Books/&gt;</code> cards stacked in main.jsx</td>
              <td><code>/books</code> and <code>/books/0</code> through <code>/books/3</code></td>
              <td>list page + <code>/books/:id</code> detail</td></tr>
          <tr><td><code>Employee</code> (commented out in main.jsx)</td>
              <td><code>/employees</code></td>
              <td><code>element={&lt;Employee ... /&gt;}</code> with the same props</td></tr>
          <tr><td><code>Students</code> (also commented out)</td>
              <td><code>/students</code></td>
              <td><code>element={&lt;Students ... /&gt;}</code> with the same props</td></tr>
          <tr><td><code>App.jsx</code> — <strong>0 bytes</strong></td>
              <td><code>/</code>, <code>/about</code>, anything else</td>
              <td>Home, About, NotFound</td></tr>
        </tbody>
      </table>
      <p>Three honest defects in that journal code, all visible once you line the files up:</p>
      <ul>
        <li><strong>The publisher never rendered.</strong> <code>main.jsx</code> passes
        <code>Publisher</code> (capital P) and <code>books.jsx</code> reads
        <code>props.publisher</code> — props are case-sensitive, so the line painted nothing.
        Fixed by Example 4: the data key is lowercase <code>publisher</code>, matching the
        component.</li>
        <li><strong>The fifth book is a copy of the first.</strong> main.jsx renders
        <code>tao te ching</code> twice — harmless in a stack of cards, confusing once each card
        is a URL with its own id, so the data keeps the four unique books.</li>
        <li><strong>The import is misspelled:</strong> <code>import Exployee from './Employee'</code>
        (and <code>Employee</code> is a default export while <code>Students</code> is a named one —
        Lesson 062's export rules again). Example 9 imports both correctly.</li>
      </ul>
    `,
    `
      <h3>Why BrowserRouter works in dev — and the two places it stops</h3>
      <p>Type <code>http://localhost:5173/books/2</code> into a <em>fresh</em> browser tab: no
      404. Vite's dev server has SPA fallback built in — any URL it cannot find as a real file
      gets <code>index.html</code> back, and React Router takes over from there. That is the whole
      reason deep links work while you develop. Two environments do not give you that fallback:</p>
      <ul>
        <li><strong>A plain static production host.</strong> A built <code>dist/</code> folder
        served as-is answers <code>/books/2</code> with a genuine 404, because there is no file
        with that name. The fix is a rewrite rule that sends every unknown path back to
        <code>index.html</code> — Netlify's <code>_redirects</code> file says
        <code>/*    /index.html   200</code>, nginx says
        <code>try_files $uri /index.html;</code>. React Router cannot do this for you: the server
        must cooperate.</li>
        <li><strong><code>file://</code></strong> — double-clicking the built
        <code>index.html</code>. There is no server at all, so <code>/books/2</code> is read as a
        folder on your disk. Swapping <code>BrowserRouter</code> for <code>HashRouter</code>
        (Example 12) moves the route behind a <code>#</code> — <code>index.html#/books/2</code> —
        which the browser never sends anywhere, so routing works with no server. Build with a
        relative asset base at the same time: <code>npm run build -- --base=./</code>.</li>
      </ul>
      <pre class="diagram">BrowserRouter  →  /books/2      needs a server that rewrites unknown paths to index.html
HashRouter     →  /index.html#/books/2   works from file:// and any dumb static host</pre>
      <p>(Data mode's <code>createBrowserRouter</code> from Lesson 071 solves a different problem
      — a <code>loader</code> could fetch this book list before the page paints — but the URL
      rules above apply to it identically.)</p>
    `
  ],
  examples: [
    {
      title: "react3/src/books.jsx: the component the detail page will reuse",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/react3/src/books.jsx",
      lang: "jsx",
      code: `
function Books(props){
  return(
    <div>
   <h1>{props.title}</h1>
   <h1>{props.author}</h1>
   <h1>{props.price}</h1>
   <h1>{props.publisher}</h1>
   <h1>{props.pages}</h1>
  </div>
  )
  }

  export default Books;
`,
      explain: [
        "Quoted again (Lesson 072 opened with it) because this capstone is where it actually gets a second life: the detail page renders this component with the book the URL picked.",
        "Default export, five props, no state and no imports — nothing about it needs to change for routing. That is the point: routes wrap components, they do not rewrite them.",
        "<code>props.publisher</code> is the line the journal broke by passing <code>Publisher</code> — once the data key matches (Example 4), this line finally renders.",
        "As a detail-page renderer it is perfect: <code>&lt;Books {...book} /&gt;</code> passes whichever record <code>:id</code> selected."
      ]
    },
    {
      title: "react3/src/students.jsx: Students and Teachers become a page",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/react3/src/students.jsx",
      lang: "jsx",
      code: `
function Students(props){
  return(
    <div>
   <h1>{props.name}</h1>
   <h1>{props.age}</h1>
   <h1>{props.course}</h1>
   <h1>{props.subject}</h1>
  </div>
  )
  }
//we will pass multiple component
//we cant use default for both component
//we use export {student, teacher}
function Teachers(props){
  return(
    <div>
   <h1>{props.name}</h1>
   <h1>{props.age}</h1>
   <h1>{props.course}</h1>
   <h1>{props.subject}</h1>
  </div>
  )
  }

  export {Students, Teachers}
`,
      explain: [
        "Lesson 073 quoted this file to make the navigation point; here it is wired up: <code>import { Students } from './students.jsx'</code> (named export) becomes the element of the <code>/students</code> route.",
        "The journal's own comment explains why both live in one file — you cannot have two default exports — and routing answers at a different level: two components, two URLs.",
        "<code>Teachers</code> is imported by nothing today; adding <code>/teachers</code> would be one more line in the route table. Try it in the practice task.",
        "Props are passed exactly as main.jsx used to do — only the screen they appear on has changed."
      ]
    },
    {
      title: "react3/src/Employee.jsx: the third journal component",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/react3/src/Employee.jsx",
      lang: "jsx",
      code: `
function Employee(props){
    return (<div>
        <h2>{props.name}</h2>
        <h2>{props.department}</h2>
        <h2>{props.salary}</h2>
        <h2>{props.city}</h2>
        <br/>
    </div>)
}

export default Employee;
`,
      explain: [
        "Default export — so Example 9 writes <code>import Employee from './Employee.jsx'</code>, while Students needs curly braces. Mixing the two up is the classic \"Element type is invalid\" crash from Lesson 062.",
        "This component was commented out in the journal's main.jsx along with four other Employee calls; its route keeps one instance with the journal's own props (rajesh, QA, 67000, Pune).",
        "Salary renders as a plain number here — a real app would format it, but keeping the journal's exact props keeps the capstone honest.",
        "One file, one URL: <code>/employees</code> renders it and nothing else."
      ]
    },
    {
      title: "src/data.js: the book cards, now as data (publisher bug fixed)",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// src/data.js -- the four unique Books cards the journal rendered in main.jsx
export const BOOKS = [
  { title: "tao te ching", author: "lau zu", price: 450, publisher: "Panguin House", pages: 200 },
  { title: "metamorphosis", author: "franze kafkta", price: 450, publisher: "Panguin House", pages: 108 },
  { title: "crime and punishment", author: "fyodor dostoevsky", price: 450, publisher: "Panguin House", pages: 600 },
  { title: "surrounded by idiots", author: "eric", price: 450, publisher: "panguin", pages: 55 }
];
`,
      explain: [
        "A plain ES module — <code>export const</code>, imported with <code>import { BOOKS } from '../data.js'</code> (Week 2's modules, now in the browser).",
        "<strong>The fix:</strong> the key is <code>publisher</code>, lowercase, matching what <code>books.jsx</code> reads. The journal's <code>Publisher</code> prop was silently rendering nothing.",
        "The label is out of the value: the journal passed <code>\"Title: tao te ching\"</code> as the prop — the words \"Title:\" belong in the markup, not the data, so only the book name is stored.",
        "The journal's fifth card was a duplicate of the first; as data that is obviously the same book twice, so four unique records remain and index 0-3 become the ids <code>/books/0</code> through <code>/books/3</code>."
      ],
      run: "npm run dev  →  http://localhost:5173/books"
    },
    {
      title: "src/components/Navbar.jsx: five links, one active",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/components/Navbar.jsx
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/books", label: "Books" },
  { to: "/employees", label: "Employees" },
  { to: "/students", label: "Students" },
  { to: "/about", label: "About" }
];

export default function Navbar() {
  return (
    <nav className="navbar">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}
`,
      explain: [
        "The NavLink pattern from Lesson 073, now carrying every page of the capstone: the array <em>is</em> the navigation design — add a page by appending one object.",
        "<code>end</code> appears only on Home; without it the root link matches every URL and stays highlighted forever.",
        "<code>key={l.to}</code> gives React a stable identity per link while mapping.",
        "Remember the CSS: paste Lesson 073 Example 5's <code>.navbar a.active</code> rules into <code>src/index.css</code>, otherwise the class is there but invisible."
      ]
    },
    {
      title: "src/pages.jsx: Home, About and the catch-all 404",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
export function Home() {
  return (
    <section>
      <h1>CSA 301 book club</h1>
      <p>Four journal components, six URLs, one app. Use the bar above to move around.</p>
    </section>
  );
}

export function About() {
  return (
    <section>
      <h1>About</h1>
      <p>Built from the journal's react3 app (Week 11) plus React Router (Week 13).</p>
    </section>
  );
}

export function NotFound() {
  return (
    <section>
      <h1>404 - page not found</h1>
      <p>No route matched this URL - the catch-all caught it.</p>
    </section>
  );
}
`,
      explain: [
        "Three small pages in one file with named exports — the layout from Lesson 071, reworded for this app.",
        "<code>NotFound</code> is double-duty here: it serves unknown URLs <em>and</em> invalid book ids, because Example 8 redirects bad ids to a path only the <code>*</code> route matches.",
        "These components never call a hook — they are pure presentation, exactly the shape Week 12 hooks slot into later when the pages start fetching data.",
        "The two lines of copy are the only \"branding\" a demo needs; the structure is what matters."
      ]
    },
    {
      title: "src/pages/Books.jsx: the shelf, every title linking to its id",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/pages/Books.jsx
import { Link } from "react-router-dom";
import { BOOKS } from "../data.js";

export default function Books() {
  return (
    <section>
      <h1>Books</h1>
      <ul>
        {BOOKS.map((b, i) => (
          <li key={i}>
            <Link to={"/books/" + i}>
              {b.title} by {b.author} (Rs {b.price})
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
`,
      explain: [
        "<code>to={\"/books/\" + i}</code> builds the concrete URL from the array index — the values that fill the <code>:id</code> pattern in Example 8's route.",
        "One <code>Link</code> per book, rendered by <code>map</code>: the list and its navigation are the same loop, so a new book is a data change, never a markup change.",
        "The link text composes several props with JSX expressions — <code>{b.title} by {b.author}</code> — the Week 11 interpolation you already know.",
        "<code>key={i}</code> keeps React's list reconciliation happy; with real database ids, use those instead."
      ],
      run: "npm run dev  →  http://localhost:5173/books shows four links: /books/0 through /books/3"
    },
    {
      title: "src/pages/BookDetail.jsx: params in, journal component out",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/pages/BookDetail.jsx
import { useParams, Link, Navigate } from "react-router-dom";
import Books from "../books.jsx";
import { BOOKS } from "../data.js";

export default function BookDetail() {
  const { id } = useParams();
  const book = BOOKS[Number(id)];

  if (!book) {
    // unknown id: hand the URL to the catch-all 404 without stacking history
    return <Navigate to="/no-such-page" replace />;
  }

  return (
    <section>
      <Books {...book} />
      <p>
        <Link to="/books">Back to all books</Link>
      </p>
    </section>
  );
}
`,
      explain: [
        "The whole Week 13 story in one file: <code>useParams()</code> reads <code>:id</code>, the array lookup picks the record, <code>&lt;Books {...book} /&gt;</code> renders the journal's own component with that record's five props.",
        "<code>{...book}</code> is the spread operator from your JavaScript essentials — it expands <code>{ title, author, price, publisher, pages }</code> into five props, so the untouched journal component works.",
        "<code>&lt;Navigate to=\"/no-such-page\" replace /&gt;</code> handles a data 404: no real route matches that path, so the <code>path=\"*\"</code> route paints the 404 page, and <code>replace</code> keeps Back from looping.",
        "The publisher line finally renders, because data.js spells the key the way books.jsx reads it (Example 4)."
      ],
      run: "npm run dev  →  http://localhost:5173/books/1  then  http://localhost:5173/books/99",
      output: "/books/1 shows metamorphosis; /books/99 lands on the 404 page"
    },
    {
      title: "src/App.jsx: the complete route table (the file the journal left empty)",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/App.jsx -- react3's App.jsx is 0 bytes in the journal; here it is, complete
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { Home, About, NotFound } from "./pages.jsx";
import Books from "./pages/Books.jsx";
import BookDetail from "./pages/BookDetail.jsx";
import Employee from "./Employee.jsx";
import { Students } from "./students.jsx";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/employees" element={<Employee name="rajesh" department="QA" salary={67000} city="Pune" />} />
          <Route path="/students" element={<Students name="Nishant" age={21} course="BCA" subject="FSD" />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
`,
      explain: [
        "Seven routes: five static pages, one dynamic detail page, one catch-all — the whole application described in twenty lines.",
        "<code>Navbar</code> and <code>ScrollToTop</code> sit <em>above</em> <code>&lt;Routes&gt;</code> (Lesson 073's rule), so they mount once and the 404 page still has a working menu.",
        "Journal props ride along unchanged: <code>element={&lt;Employee name=\"rajesh\" ... /&gt;}</code> is exactly what main.jsx used to do inline — now it is a whole screen.",
        "Import styles differ by export type: <code>Employee</code> is a default import, <code>Students</code> needs braces (see Example 3). Getting this backwards throws \"Element type is invalid\".",
        "<code>/books</code> and <code>/books/:id</code> coexist safely: React Router ranks the static path above the dynamic one when both could fit."
      ],
      run: "npm run dev  →  click through all five nav items, then open /nonsense"
    },
    {
      title: "src/main.jsx: the entry file, rewritten once",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/main.jsx -- placement A from Lesson 071
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
        "Compared with the journal file: the five <code>&lt;Books/&gt;</code> cards and the commented-out block are gone, <code>import App</code> is new, and <code>BrowserRouter</code> wraps everything. Nine lines changed, whole app re-shaped.",
        "StrictMode stays outermost, the router directly inside — Lesson 071's placement rule, now permanent.",
        "Everything that used to render at once now renders <em>sometimes</em>: App's <code>&lt;Routes&gt;</code> picks one screen per URL.",
        "This is the last edit to this file: routes live in App, pages live in src/pages, data lives in data.js."
      ],
      run: "npm run dev",
      output: "VITE v8.2.0  ready in 4 ms  ➜  Local:   http://localhost:5173/"
    },
    {
      title: "The run sequence, start to finish",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# 1. copy the journal app (File Explorer: Ctrl+C, Ctrl+V) and rename it react3-router
cd react3-router

# 2. dependencies: the journal's own, then the router
npm install
npm install react-router-dom

# 3. add the files from Examples 4-10 under src/, and copy
#    src/components/ScrollToTop.jsx from Lesson 073 Example 7

# 4. start
npm run dev

# 5. click the nav bar, or paste these straight into the address bar:
#    http://localhost:5173/            home
#    http://localhost:5173/books       four links to /books/0 ... /books/3
#    http://localhost:5173/books/2     crime and punishment
#    http://localhost:5173/employees   rajesh | QA | 67000 | Pune
#    http://localhost:5173/students    Nishant | 21 | BCA | FSD
#    http://localhost:5173/nonsense    the 404 page
`,
      explain: [
        "Copy before you edit — <code>sorted_files/</code> stays a faithful record of what the journal actually shipped.",
        "<code>npm install</code> restores react/react-dom from the journal's package.json; the router install adds react-router-dom on top (Lesson 071).",
        "Step 3 is where the writing happens: every other step is mechanical.",
        "Deep-link check: paste <code>http://localhost:5173/books/2</code> into a <em>fresh</em> tab — it must load directly. That works because Vite's dev server falls back to index.html for unknown paths (theory, last block).",
        "Then watch the browser while you click: no reload spinner, the navbar never flickers, and the counter state from Week 12 would survive."
      ],
      run: "npm run dev",
      output: "VITE v8.2.0  ready in 4 ms  ➜  Local:   http://localhost:5173/"
    },
    {
      title: "One-line swap: HashRouter so it runs from file://",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/main.jsx -- the only change: BrowserRouter becomes HashRouter
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
`,
      explain: [
        "Nothing else changes: HashRouter is a sibling API with the same <code>Routes</code>, <code>Link</code>, <code>useParams</code> — only how the URL is stored differs.",
        "Routes now live after the hash: <code>index.html#/books/2</code>. Everything before <code>#</code> is a real file path, so the browser never asks a server for <code>/books/2</code> and no 404 is possible.",
        "Use it when there is no cooperating server: double-clicked builds on file://, a shared classmate's folder, some static preview hosts.",
        "For file:// also build with a relative base — <code>npm run build -- --base=./</code> — so index.html can find its own assets, then open <code>dist/index.html</code> directly.",
        "Vite's dev server and most real deployments should stay on BrowserRouter: cleaner URLs, no # in the address bar."
      ],
      run: "npm run build -- --base=./   then   double-click dist/index.html"
    }
  ],
  keyPoints: [
    "A multi-page app is a re-shelving, not a rewrite: main.jsx renders <code>&lt;App/&gt;</code>, App's seven routes choose one screen per URL, and the journal's components are reused untouched",
    "Journal props still flow into route elements exactly as they did in main.jsx — only <em>when</em> a component appears has changed; <code>/books/:id</code> + <code>useParams()</code> + <code>{...book}</code> turns the static Books card into a detail page",
    "The navbar and ScrollToTop live above <code>&lt;Routes&gt;</code> so they mount once and remain visible even on the 404",
    "Three journal defects are fixed in passing: the <code>Publisher</code> prop case mismatch, the duplicated fifth book, and the misspelled <code>Exployee</code> import",
    "Vite's dev server rewrites unknown paths to index.html, so BrowserRouter deep links work in development; a production host needs a rewrite rule, and file:// needs HashRouter (routes behind <code>#</code>)",
    "Copy the journal folder before editing — <code>sorted_files/</code> remains the honest record of what was submitted"
  ],
  practice: `
    <p>Run the capstone and prove every claim: (1) click all five nav items and confirm the active
    chip follows you; (2) open <code>/books/2</code> in a fresh tab and press F5 — it must survive,
    which is what BrowserRouter + the dev server give you; (3) edit a title in
    <code>data.js</code> and watch both the list and the detail page update; (4) add a
    <code>/teachers</code> route using the journal's <code>Teachers</code> export (one line — the
    file already exists); (5) run <code>npm run build -- --base=./</code>, double-click
    <code>dist/index.html</code> and see routing work through the HashRouter swap. Anything that
    404s unexpectedly means a URL is missing from the table in App.jsx — add it there, not in the
    pages.</p>
  `,
  quiz: [
    {
      q: "Opening /books/2 renders the third book. Which hook supplied the value 2?",
      options: [
        "useParams(), because the route is written as /books/:id and the URL filled that segment",
        "useSearchParams(), because 2 comes after a ? in the URL",
        "useState(), because the detail page remembers the last id it showed",
        "useNavigate(), because navigation carries the id between pages"
      ],
      answer: 0,
      why: "The colon segment is the only thing that captures <code>/books/2</code>'s 2 — as a string, which is why the lookup wraps it in <code>Number()</code>. Query strings never take part in route matching."
    },
    {
      q: "You run npm run build, double-click dist/index.html, and every internal link gives a 404. What is the fix?",
      options: [
        "Swap BrowserRouter for HashRouter in main.jsx so routes sit after #, where no server is needed",
        "Install react-router-dom again — the build strips it out",
        "Nothing; file:// cannot run JavaScript, so the app is broken by definition",
        "Rename index.html to home.html so the server recognises it"
      ],
      answer: 0,
      why: "On file:// there is no server to rewrite unknown paths to index.html, so BrowserRouter's clean URLs are unfindable. HashRouter keeps the route out of the server's hands entirely — and remember <code>--base=./</code> so the built assets load too."
    }
  ],
  sources: [
    "https://reactrouter.com/home",
    "https://reactrouter.com/api/declarative-routers/HashRouter",
    "https://reactrouter.com/start/declarative/routing",
    "https://react.dev/learn",
    "https://vite.dev/guide/"
  ]
});
