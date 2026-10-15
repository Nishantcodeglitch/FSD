window.COURSE_LESSONS.push({
  id: "w13-navigation",
  file: "073",
  unit: 3,
  week: 13,
  title: "Navigation with Link, NavLink and useNavigate",
  kicker: "Unit III · Week 13 · Lesson 3 of 4",
  minutes: 16,
  objectives: [
    "Explain why a plain <code>&lt;a href&gt;</code> reloads the page and use <code>&lt;Link&gt;</code> instead",
    "Highlight the current page with <code>NavLink</code>'s <code>className={({ isActive }) =&gt; ...}</code> function",
    "Move the user from JavaScript with <code>useNavigate()</code>, including replace and <code>navigate(-1)</code>",
    "Keep the nav bar outside <code>&lt;Routes&gt;</code> and reset the scroll position on navigation"
  ],
  intro: `
    <p>Lesson 072 taught the router to <em>read</em> the URL — params, query strings, nesting — but
    a page nobody can reach is a page nobody sees. This lesson is the other half:
    <strong>getting the user from here to there</strong>. You will see why the obvious
    <code>&lt;a href&gt;...&lt;/a&gt;</code> tag is quietly wrong inside a React app, what
    <code>Link</code> and <code>NavLink</code> do differently, and how to drive navigation from
    code with <code>useNavigate()</code> — the hook that finally makes those Week 12 state changes
    useful, because now a counter or a form can decide where the user goes next.</p>
    <p><strong>Same honest note as the rest of Week 13.</strong> The journal folder
    <code>sorted_files/13_Week-13_Routing/</code> is empty — its <code>MISSING.txt</code> says
    "MISSING - Week 13 Routes and Navigation: no react-router source supplied", and syllabus item
    13.2 Navigation was eight blank paragraphs in the DOCX. This chapter is therefore written from
    the official documentation at
    <a href='https://reactrouter.com/home' target='_blank' rel='noopener'>reactrouter.com</a> and
    <a href='https://react.dev/learn' target='_blank' rel='noopener'>react.dev</a>, with new
    examples; Example 1 quotes a real journal file to show what "no navigation" looks like in
    code.</p>
  `,
  theory: [
    `
      <h3>Why &lt;a href&gt; is the wrong tool inside a SPA</h3>
      <p>An anchor tag is the web's original navigation primitive: tell it a path, the browser
      fetches that path and <strong>replaces the entire document</strong>. That was correct when
      every page really was a different document. A single-page app (SPA) is not: it has one
      document, and React swaps parts of it. Clicking a plain anchor inside an SPA therefore
      throws away everything the page had built up:</p>
      <pre class="diagram">&lt;a href="/about"&gt; CLICK            &lt;Link to="/about"&gt; CLICK
─────────────────────────            ─────────────────────────
browser drops the whole document     React Router calls history.pushState("/about")
sends GET /about to the server       URL changes, NOT ONE byte is requested
waits for a fresh index.html         &lt;About/&gt; mounts; the navbar stays mounted
ALL React state is destroyed         Week 12 state survives the trip
reload spinner, flash of blank       instant swap</pre>
      <p><code>&lt;Link to="/about"&gt;</code> from React Router renders a real
      <code>&lt;a href&gt;</code> — so middle-click, ctrl-click, right-click → copy address and
      keyboard focus all keep working — but it intercepts the left-click, updates the URL through
      the History API, and lets React re-render. Same browser features, no reload. The only time
      an anchor is correct is for leaving your app entirely (<code>https://react.dev</code>,
      <code>mailto:</code>, a PDF).</p>
    `,
    `
      <h3>NavLink: the link that knows it is current</h3>
      <p><code>NavLink</code> is <code>Link</code> plus one question: <em>is this the page we are
      on right now?</em> It compares its own <code>to</code> with the current URL and exposes the
      answer as a render prop, which you pass to <code>className</code> (or <code>style</code>, or
      even the children):</p>
      <pre class="diagram">&lt;NavLink to="/books" className={({ isActive }) =&gt;
    isActive ? "active" : ""}&gt;
  Books
&lt;/NavLink&gt;

→ on /books        renders  &lt;a class="active" href="/books"&gt;
→ anywhere else    renders  &lt;a href="/books"&gt;</pre>
      <ul>
        <li><strong>It also does accessibility for you:</strong> the current link automatically
        gets <code>aria-current="page"</code>, which screen readers announce. Hand-rolled
        <code>useState</code> highlighting never does this.</li>
        <li><strong>Use <code>end</code> for the root link.</strong> <code>to="/"</code> matches
        <em>every</em> path (they all start with <code>/</code>), so Home would stay highlighted
        forever. <code>&lt;NavLink to="/" end&gt;</code> matches only exactly
        <code>/</code>.</li>
        <li>Without a <code>className</code> prop, NavLink still adds a class named
        <code>active</code> on its own — the function form exists so you can rename, combine, or
        compute classes yourself.</li>
      </ul>
    `,
    `
      <h3>useNavigate: navigation from code</h3>
      <p>Links are for clicks. But navigation often has to happen <em>because something in your
      code happened</em>: a login form validated, a record saved, a countdown expired, an
      unauthenticated visitor reached a protected page. <code>useNavigate()</code> returns a
      function for exactly those moments:</p>
      <pre class="diagram">const navigate = useNavigate();          // must be inside the router

navigate("/books");                       // push: Back returns to where they were
navigate("/books", { replace: true });    // replace: current history entry is overwritten
navigate(-1);                             // go BACK one entry (the Back button, in JS)
navigate(1);                              // go forward one
navigate("..", { relative: "route" });    // up one level from the current route</pre>
      <ul>
        <li><strong><code>replace</code> is for redirects.</strong> After a successful login you
        <em>replace</em> so the Back button does not return to the login form (and then re-submit
        it).</li>
        <li><strong>Reserve it for when the user is not clicking a link.</strong> This is the
        documentation's own advice: an <code>onClick</code> that calls
        <code>navigate()</code> throws away middle-click, ctrl-click and "copy link address". If
        the user clicked text that leads somewhere, use <code>Link</code>.</li>
        <li><strong>It must run inside the router.</strong> Calling it in a component rendered
        above <code>BrowserRouter</code> throws — that is Lesson 071's placement rule in
        action.</li>
      </ul>
    `,
    `
      <h3>The scroll position nobody remembers to fix</h3>
      <p>On classic multi-page sites every navigation loads a fresh document, so the browser
      naturally starts at the top. In an SPA the DOM is reused — scroll position and all. Scroll
      halfway down <code>/books</code>, click a title, and the detail page opens halfway down too.
      Five lines fix it: watch the pathname with <code>useLocation()</code> and scroll to zero in
      a <code>useEffect</code> whenever it changes (that dependency array is Week 12 muscle
      memory). Example 7 builds the component; it renders <code>null</code> so it can sit silently
      next to the navbar.</p>
      <div class="note">
        <p>Data mode has <code>&lt;ScrollRestoration/&gt;</code> built in — but only for
        framework/data routers. In the declarative <code>&lt;BrowserRouter&gt;</code> mode this
        book teaches, the hand-written effect is the standard solution.</p>
      </div>
    `,
    `
      <h3>Why the nav bar lives OUTSIDE &lt;Routes&gt;</h3>
      <p>Every route in Lesson 071 rendered its own page component. If the navbar is written
      <em>inside</em> those elements, it becomes part of every page — and is re-created on every
      single navigation:</p>
      <pre class="diagram">WRONG                                 RIGHT
&lt;Routes&gt;                              &lt;Navbar /&gt;              mounts ONCE
  &lt;Route path="/" element={            &lt;Routes&gt;
      &lt;&gt;&lt;Navbar/&gt;&lt;Home/&gt;&lt;/&gt;} /&gt;          &lt;Route path="/" element={&lt;Home/&gt;} /&gt;
  &lt;Route path="/about" element={       &lt;Route path="/about" element={&lt;About/&gt;} /&gt;
      &lt;&gt;&lt;Navbar/&gt;&gt;&lt;About/&gt;&lt;/&gt;} /&gt;        &lt;Route path="*" element={&lt;NotFound/&gt;} /&gt;
&lt;/Routes&gt;                             &lt;/Routes&gt;

navbar remounts on every click:       navbar is created once, survives every
its own state is lost, and it         navigation, and is still there on the
vanishes completely on the 404        404 page — where users need it most</pre>
      <p>The same rule covers <code>ScrollToTop</code>, a footer, a sidebar — anything that should
      exist <em>across</em> pages belongs above <code>&lt;Routes&gt;</code>, and only the region
      that changes goes inside it.</p>
    `
  ],
  examples: [
    {
      title: "The journal's students.jsx: finished components with nowhere to go",
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
        "Two finished components with named exports (the pattern from Lesson 062) — and a real navigation problem: <code>main.jsx</code> has both calls <em>commented out</em>, so the journal's only way to \"switch view\" is to edit source code and reload.",
        "This is what syllabus item 13.2 was about: navigation had eight blank paragraphs in the DOCX and no react-router code anywhere in the journal.",
        "With a nav bar plus two routes, <code>Students</code> and <code>Teachers</code> become <code>/students</code> and <code>/teachers</code> — visible, linkable, bookmarkable, without touching a line of this file.",
        "Note the journal's own comment admits the constraint: two default exports would clash, hence <code>export { Students, Teachers }</code> — routes fix that at a different level: each component gets its own URL."
      ],
      run: "npm run dev   (react3 as shipped renders neither component — both are commented out in main.jsx)"
    },
    {
      title: "The tempting version: plain anchors (do not ship this)",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/components/NavNaive.jsx -- looks identical in the browser, behaves completely differently
export default function NavNaive() {
  return (
    <nav>
      <a href="/">Home</a>
      <a href="/books">Books</a>
      <a href="/about">About</a>
    </nav>
  );
}
`,
      explain: [
        "Each click is a real HTTP request: the browser tears down the document, asks the server for <code>/about</code>, and rebuilds the page from zero.",
        "Consequences you can observe in five seconds: the console clears, every <code>useState</code> from Week 12 resets, timers from <code>useEffect</code> restart, and the reload icon spins.",
        "In Vite's dev server the request succeeds (it serves <code>index.html</code> for unknown paths), so the bug looks harmless — on a plain static production host without an SPA rewrite, the same click is a hard 404.",
        "Anchors keep one advantage — right-click → copy address — which is exactly why React Router's <code>Link</code> renders an anchor instead of replacing it."
      ],
      run: "npm run dev  →  click About, watch the network tab and the cleared console"
    },
    {
      title: "Navbar with Link: same bar, no reload",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/components/Navbar.jsx -- step one: client-side links
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      <Link to="/books">Books</Link>
      <Link to="/employees">Employees</Link>
      <Link to="/about">About</Link>
    </nav>
  );
}
`,
      explain: [
        "<code>to</code> replaces <code>href</code>: React Router matches it against your route table and swaps the component — no request, no state loss.",
        "It still renders <code>&lt;a href=\"/books\"&gt;</code> underneath, so the browser's own link affordances (status bar preview, copy address, open in new tab) all keep working.",
        "Paths here are absolute (leading slash): from any page, <code>/books</code> means the same place. Lesson 072's relative <code>to=\"settings\"</code> is the exception, used inside nested routes.",
        "Nothing is highlighted yet — every item looks the same whether or not you are there. Example 4 fixes that with NavLink."
      ],
      run: "npm run dev  →  click between pages and confirm the console does NOT clear"
    },
    {
      title: "NavLink with the isActive function",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/components/Navbar.jsx -- step two: the current page lights up
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/books", label: "Books" },
  { to: "/employees", label: "Employees" },
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
        "<code>className={({ isActive }) =&gt; ...}</code> is a render prop: React Router calls your function on every render with the truth about this link, and whatever string you return becomes the class attribute.",
        "<code>end</code> on the Home link stops it from matching every URL in the app (all paths start with <code>/</code>) — without it Home stays highlighted on /books too.",
        "Data-driven links: add a page by appending one object to the array; no markup editing, no duplicated conditions.",
        "NavLink also sets <code>aria-current=\"page\"</code> on the active link automatically — accessibility you would otherwise hand-write.",
        "This one file replaces the whole journal pattern of static buttons: the highlight is derived from the URL, so it can never drift out of sync with reality."
      ],
      run: "npm run dev  →  open /books: only Books is highlighted"
    },
    {
      title: "The CSS that the active class hooks into",
      from: "new",
      file: "",
      lang: "css",
      code: `
/* src/index.css -- append to the Vite starter stylesheet */
.navbar {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 2px solid #2b6cb0;
}

.navbar a {
  text-decoration: none;
  color: #2d3748;
  padding: 4px 10px;
  border-radius: 6px;
}

.navbar a:hover {
  background: #ebf4ff;
}

.navbar a.active {
  background: #2b6cb0;
  color: #ffffff;
  font-weight: 700;
}
`,
      explain: [
        "<code>.navbar a.active</code> is the rule that turns \"which page am I on?\" into pixels — it matches only the anchor carrying the class the NavLink function returned (or the one NavLink adds by itself).",
        "<code>text-decoration: none</code> removes the default underline; anchors inside a nav bar almost always want this.",
        "Hover and active are separate states: hover = cursor is over it, active = you are already here. Keeping them visually distinct stops users clicking the page they are on.",
        "Plain CSS, no CSS-in-JS: the style lives in <code>index.css</code>, exactly where the Vite scaffold put the styles you have used since Week 11."
      ],
      run: "npm run dev  →  the current nav item renders as a solid blue chip"
    },
    {
      title: "useNavigate: redirect after login, Back on cancel",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/pages/Login.jsx -- navigation that happens because code ran, not because a link was clicked
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    // pretend the server said yes: REPLACE so Back cannot return to this form
    navigate("/", { replace: true });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Log in</h1>
      <input name="user" placeholder="roll number" />
      <input name="pass" type="password" placeholder="password" />
      <button type="submit">Log in</button>
      <button type="button" onClick={() => navigate(-1)}>Go back</button>
    </form>
  );
}
`,
      explain: [
        "<code>useNavigate()</code> is a hook, so it is called at the top of a component — and only works inside the router (Lesson 071's placement rule).",
        "<code>navigate(\"/\", { replace: true })</code> overwrites the current history entry: after logging in, pressing Back skips the login form instead of returning to it and re-submitting.",
        "<code>navigate(-1)</code> takes a number instead of a path — it walks the history stack like the browser's Back button. This is why the cancel button needs no hardcoded previous URL.",
        "The cancel button is <code>type=\"button\"</code>: without it, inside a form it would submit. Small detail, classic bug.",
        "Note what is <em>not</em> here: no <code>&lt;Link&gt;</code> — this is navigation driven by an event, which is precisely when the docs say to use this hook."
      ],
      run: "npm run dev  →  submit the form: URL changes to / with no reload"
    },
    {
      title: "ScrollToTop: reset the scroll bar on every navigation",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/components/ScrollToTop.jsx -- remembers to un-scroll after each page change
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
`,
      explain: [
        "<code>useLocation()</code> returns the current URL as an object — here we only need <code>pathname</code>, the part before the <code>?</code>.",
        "The <code>useEffect</code> dependency array <code>[pathname]</code> is the Week 12 pattern: the effect runs on mount and then again on every navigation, and only on navigation.",
        "<code>return null</code> — the component draws nothing. It is pure side effects, so it can sit above the navbar without affecting the layout.",
        "Only the path is watched: typing a new <code>?q=</code> filter should <em>not</em> throw the user back to the top mid-search, which is why <code>search</code> is deliberately excluded."
      ],
      run: "npm run dev  →  scroll down /books, open a title: the detail page starts at the top"
    },
    {
      title: "App.jsx: navbar and ScrollToTop above the route table",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { Home, About, NotFound } from "./pages.jsx";
import BookSearch from "./pages/BookSearch.jsx";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<BookSearch />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
`,
      explain: [
        "<code>&lt;Navbar /&gt;</code> sits <em>above</em> <code>&lt;Routes&gt;</code>: it mounts once and survives every navigation, including the 404 — the theory diagram's \"right\" column.",
        "<code>&lt;ScrollToTop /&gt;</code> goes even higher so nothing can re-mount it when routes change; both are siblings of the route table, not children of any route.",
        "<code>&lt;main&gt;</code> is a semantic wrapper: assistive technology finds the page content in one landmark, the chrome lives outside it.",
        "The fragment <code>&lt;&gt;...&lt;/&gt;</code> (Lesson 060) is needed because a component's JSX must have one root — three siblings would otherwise be a syntax error.",
        "Everything here (Home, About, NotFound, BookSearch) comes from Lessons 071–072: this file is the assembly, not new API."
      ],
      run: "npm run dev  →  navigate from Home to 404: the navbar is still there, scroll starts at top"
    }
  ],
  keyPoints: [
    "<code>&lt;a href&gt;</code> reloads the document and destroys all React state; <code>&lt;Link to&gt;</code> intercepts the click, updates the URL via the History API and swaps components instead",
    "<code>NavLink</code> = Link + active detection: <code>className={({ isActive }) =&gt; ...}</code> drives the highlight, <code>end</code> pins the root link, and <code>aria-current</code> is set for free",
    "<code>useNavigate()</code> is for navigation your code triggers: <code>navigate(\"/x\")</code>, <code>navigate(\"/x\", { replace: true })</code>, <code>navigate(-1)</code> for back",
    "An SPA keeps the DOM (and the scroll position) between navigations — a small <code>useLocation</code> + <code>useEffect</code> component scrolls back to the top",
    "The navbar, footer and scroll handler live <em>above</em> <code>&lt;Routes&gt;</code>; only the region that changes goes inside"
  ],
  practice: `
    <p>Add a counter (<code>useState</code> from Week 12) to the Home page, then navigate to About
    two ways and watch what happens: first with a hand-written <code>&lt;a href="/about"&gt;</code>
    — reload spinner, counter reset to 0 — then swap it for <code>&lt;Link to="/about"&gt;</code> —
    counter still holds its value when you come back. Next give every nav item a class by hand with
    <code>useState</code>, delete it, and replace it with the NavLink function from Example 4;
    confirm <code>aria-current="page"</code> appears on the active link in devtools. Finish by
    scrolling down a long page before navigating: without <code>ScrollToTop</code> the new page
    opens where the old one left off.</p>
  `,
  quiz: [
    {
      q: "What happens when a user clicks a plain anchor written as <code>&lt;a href='/about'&gt;</code> inside a React app?",
      options: [
        "The browser requests the page from the server and reloads the whole document — every useState in the app is destroyed",
        "React Router detects the anchor and routes it client-side automatically",
        "Nothing happens; anchors are disabled in single-page apps",
        "The URL changes without a request, exactly like Link"
      ],
      answer: 0,
      why: "Only React Router's Link/NavLink intercept clicks. A raw anchor performs the browser's default action — a full navigation — which is why it works in dev (Vite returns index.html) but silently wipes your state every time."
    },
    {
      q: "Your login handler needs to send the user home after a successful sign-in, and Back must not return to the login form. Which call does that?",
      options: [
        "navigate(\"/\", { replace: true }) — the login entry in the history stack is overwritten",
        "navigate(\"/\") — pushing a new entry is always correct",
        "navigate(-1) — going back is the same as replacing",
        "<code>&lt;Link to=\"/\"&gt;Home&lt;/Link&gt;</code> rendered automatically after submit"
      ],
      answer: 0,
      why: "<code>replace: true</code> overwrites the current history entry instead of adding one, so Back steps past the login form rather than into it. Links are for clicks; this is a code-triggered redirect, which is what useNavigate is for."
    }
  ],
  sources: [
    "https://reactrouter.com/api/components/NavLink",
    "https://reactrouter.com/api/hooks/useNavigate",
    "https://reactrouter.com/start/declarative/navigating",
    "https://react.dev/learn"
  ]
});
