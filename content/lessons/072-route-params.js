window.COURSE_LESSONS.push({
  id: "w13-route-params",
  file: "072",
  unit: 3,
  week: 13,
  title: "Route params, query strings and nested routes",
  kicker: "Unit III · Week 13 · Lesson 2 of 4",
  minutes: 18,
  objectives: [
    "Read a dynamic segment like <code>:id</code> with <code>useParams()</code> and use it to choose what to render",
    "Tell route params apart from query-string params and read or write the latter with <code>useSearchParams()</code>",
    "Lay out a section of the app with nested routes, an <code>&lt;Outlet/&gt;</code> and an index route",
    "Redirect a URL that matched a route but has no data using <code>&lt;Navigate replace/&gt;</code>"
  ],
  intro: `
    <p>Lesson 071 gave you a router, static pages and a 404 — but every page showed the same
    content no matter where you were. Real apps need URLs that <em>carry data</em>:
    <code>/books/3</code> shows book 3, <code>/search?q=kafka</code> filters a list,
    <code>/dashboard/settings</code> nests one screen inside another. That is this lesson: three
    ways a URL can deliver information to your components, and the Week 12 hooks
    (<code>useState</code>, <code>useEffect</code>) you already know keep doing the rest — routing
    only decides <em>which</em> component is mounted and with what input.</p>
    <p><strong>The honesty note still stands.</strong> The journal's Week 13 folder
    (<code>sorted_files/13_Week-13_Routing/</code>) is empty — its <code>MISSING.txt</code> reads
    "MISSING - Week 13 Routes and Navigation: no react-router source supplied" — so everything
    below comes from the official React Router documentation and
    <a href='https://react.dev/learn' target='_blank' rel='noopener'>react.dev</a>, with new
    examples built on the journal's own <code>react3</code> components where one fits. Example 1
    quotes <code>books.jsx</code> exactly as it sits on disk, bug included, because it is the
    component we are about to turn into a detail page.</p>
  `,
  theory: [
    `
      <h3>Dynamic segments: the colon in the path</h3>
      <p>A path segment starting with <code>:</code> is a <strong>dynamic segment</strong> — a
      placeholder that matches <em>any</em> value in that position. React Router parses the value
      out of the URL and hands it to you as an object of key/value pairs through the
      <code>useParams()</code> hook:</p>
      <pre class="diagram">&lt;Route path="/books/:id" element={&lt;BookDetail /&gt;} /&gt;
                   │
        URL "/books/42"  ──▶  useParams()  ──▶  { id: "42" }</pre>
      <p>Four things beginners get wrong the first time:</p>
      <ul>
        <li><strong>It is always a string.</strong> <code>42</code> arrives as
        <code>"42"</code>. Wrap it in <code>Number(id)</code> before comparing with a number or
        using it as an array index.</li>
        <li><strong>The name comes from the path, not the URL.</strong> <code>:id</code> is what
        creates <code>params.id</code>; rename the segment to <code>:bookId</code> and every
        <code>useParams()</code> that reads it must change too.</li>
        <li><strong>Several segments are fine</strong> —
        <code>/c/:categoryId/p/:productId</code> puts both keys in the same object — but they must
        be unique within one path, or the later value overwrites the earlier one.</li>
        <li><strong>Child routes inherit their parent's params</strong>, so a nested component
        never re-declares what an ancestor already captured.</li>
      </ul>
    `,
    `
      <h3>Optional segments and the splat</h3>
      <p>Add <code>?</code> to the end of a segment and it becomes <strong>optional</strong>:
      <code>path="settings/:tab?"</code> matches both <code>/settings</code> and
      <code>/settings/profile</code>. In the first case <code>useParams()</code> returns
      <code>{ tab: undefined }</code>, so you supply a default — the pattern is exactly the
      <code>??</code> fallback you used with props in Lesson 062. Optional <em>static</em> segments
      exist too: <code>users/:userId/edit?</code> matches the edit page and the plain profile
      page.</p>
      <p>The <code>*</code> you used as a whole route also works <em>inside</em> a path, where it
      is called a <strong>splat</strong>: it captures the rest of the URL. A file viewer routed at
      <code>/files/*</code> receives <code>useParams()["*"] === "src/App.jsx"</code> for the URL
      <code>/files/src/App.jsx</code> — one route, unlimited depth.</p>
    `,
    `
      <h3>Query strings: state you can bookmark</h3>
      <p>Everything after the <code>?</code> is the <strong>search</strong> (query) string:
      <code>/search?q=kafka&amp;sort=price</code>. Crucially it is <em>not</em> part of route
      matching — the <code>/search</code> route matches with or without it — so it is the right
      home for filters, tabs, sort orders, pagination and search terms: the address bar stays
      honest, a refresh keeps the results, and pasting the URL to a friend reproduces the screen.</p>
      <p><code>useSearchParams()</code> hands you a tuple, deliberately shaped like
      <code>useState</code> from Week 12:</p>
      <pre class="diagram">const [searchParams, setSearchParams] = useSearchParams();

searchParams.get("q")             // READ  → "kafka", or null when absent
setSearchParams({ q: "tolstoy" }) // WRITE → URL becomes /search?q=tolstoy (a navigation)</pre>
      <p><code>searchParams</code> is the browser's standard <code>URLSearchParams</code> object —
      the same API you can poke in the devtools console — and calling the setter performs a
      navigation, which re-renders your page from the new URL. The difference from
      <code>useState</code>: the value lives in the address bar, not in component memory, so it
      survives refresh, Back and sharing.</p>
    `,
    `
      <h3>Nested routes: pages inside pages</h3>
      <p>A route can have children. The <strong>parent</strong> owns the URL prefix and the shell
      of the screen; each <strong>child</strong> decides what appears inside the shell's
      <code>&lt;Outlet/&gt;</code> — a placeholder component that React Router fills with whichever
      child matched.</p>
      <pre class="diagram">&lt;Routes&gt;
  &lt;Route path="dashboard" element={&lt;DashboardLayout /&gt;}&gt;
    &lt;Route index              element={&lt;DashboardHome /&gt;} /&gt;  → /dashboard
    &lt;Route path="settings"    element={&lt;Settings /&gt;} /&gt;       → /dashboard/settings
  &lt;/Route&gt;
&lt;/Routes&gt;

DashboardLayout renders:   &lt;h1&gt;Dashboard&lt;/h1&gt;  &lt;Outlet /&gt;  &lt;footer&gt;...&lt;/footer&gt;
                                            ▲
             the matched child (home OR settings) is drawn right there</pre>
      <ul>
        <li><strong>Paths are relative by default.</strong> The child wrote
        <code>"settings"</code>, not <code>"/dashboard/settings"</code> — React Router joins it
        onto the parent's path. Rename the parent once and every child follows automatically.</li>
        <li><strong>An index route</strong> has no path at all. It fills the parent's
        <code>&lt;Outlet/&gt;</code> when the URL is exactly the parent's own
        (<code>/dashboard</code>), acting as the default child — without it that URL renders the
        shell with a hole in it. Index routes cannot have children of their own.</li>
        <li><strong>A layout route</strong> is a parent with <code>element</code> but no
        <code>path</code>: it adds no segment to the URL and exists purely to share a shell (a
        sidebar, an auth check) between unrelated children.</li>
      </ul>
    `,
    `
      <h3>When the URL matches but the data does not exist</h3>
      <p>The catch-all <code>*</code> from Lesson 071 catches <em>unknown paths</em>. This lesson
      surfaces a second, sneakier failure: the path is perfectly valid
      (<code>/books/999</code> fits <code>/books/:id</code>) but nothing exists at that id. Two
      honest answers:</p>
      <ul>
        <li><strong>Stay and explain</strong> — render "No book with id 999" plus a link back to
        the shelf (Example 2 does this). The URL stays correct, so Back and refresh still make
        sense.</li>
        <li><strong>Redirect</strong> with the <code>&lt;Navigate&gt;</code> component: as soon as
          it renders, React Router performs a navigation. Always pass <code>replace</code> here —
          it overwrites the broken entry in the history stack instead of pushing a new one, so the
          user's Back button does not land them straight back on the broken page, bounce them
          forward again, and trap them in a loop.</li>
      </ul>
      <div class="note">
        <p><strong>Rule of thumb:</strong> redirect when the URL is <em>wrong</em> (an id that
        never existed, a moved page); explain in place when the URL is <em>right</em> but empty
        (a search with no hits). <code>&lt;Navigate&gt;</code> is also how you would force
        unauthenticated visitors to <code>/login</code> — same component, same
        <code>replace</code>.</p>
      </div>
    `
  ],
  examples: [
    {
      title: "The journal's books.jsx: props choose the book, one screen only",
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
        "The entire file: one component that prints five props it was handed by its parent — the parent decides <em>which</em> book, this file only formats it.",
        "This is the props model from Lesson 062: data flows one way, down. The component has no way to ask for a different book, and no URL anywhere.",
        "Journal bug to notice: <code>main.jsx</code> passes <code>Publisher</code> with a capital P while this file reads <code>props.publisher</code>. Props are case-sensitive, so in the running app that line renders nothing. Lesson 074 rebuilds the data with a lowercase key.",
        "Our goal for the rest of this lesson: let the <em>URL</em> pick the book — <code>/books/2</code> renders the third one — with <code>useParams()</code> supplying what a parent used to."
      ]
    },
    {
      title: "BookDetail: useParams() picks which book to show",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/pages/BookDetail.jsx -- the URL chooses the book, not a parent's props
import { useParams, Link } from "react-router-dom";

const BOOKS = [
  { title: "tao te ching", author: "lao zu", price: 450, pages: 200 },
  { title: "metamorphosis", author: "franz kafka", price: 450, pages: 108 },
  { title: "crime and punishment", author: "fyodor dostoevsky", price: 450, pages: 600 }
];

export default function BookDetail() {
  const { id } = useParams();          // "0" | "1" | "2" -- always a string
  const book = BOOKS[Number(id)];      // convert before using it as an index

  if (!book) {
    return (
      <div>
        <h1>No such book</h1>
        <p>Nothing in the array has id {id}.</p>
        <Link to="/books">Back to the shelf</Link>
      </div>
    );
  }

  return (
    <article>
      <h1>{book.title}</h1>
      <p>Author: {book.author}</p>
      <p>Rs {book.price} | {book.pages} pages</p>
      <Link to="/books">Back to the shelf</Link>
    </article>
  );
}
`,
      explain: [
        "<code>const { id } = useParams()</code> destructures the object the router built from the URL — the value of the <code>:id</code> segment in the route's path.",
        "<code>BOOKS[Number(id)]</code>: params are strings, so <code>Number()</code> comes first. <code>BOOKS[\"1\"]</code> would work by accident because JavaScript coerces array keys, but a string compared with <code>&gt;</code> or a non-numeric id would not.",
        "The <code>if (!book)</code> branch is the honest version of a 404 for data that does not exist — Example 8 replaces it with a redirect.",
        "<code>&lt;Link to=\"/books\"&gt;</code> is a client-side link (Lesson 073 covers Link properly); the page swaps with no reload."
      ],
      run: "npm run dev  →  http://localhost:5173/books/1",
      output: "metamorphosis / Author: franz kafka / Rs 450 | 108 pages"
    },
    {
      title: "The list page: building dynamic hrefs with Link",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/pages/Books.jsx -- every title links to its own URL
import { Link } from "react-router-dom";

const TITLES = ["tao te ching", "metamorphosis", "crime and punishment", "surrounded by idiots"];

export default function Books() {
  return (
    <section>
      <h1>Books</h1>
      <ul>
        {TITLES.map((t, i) => (
          <li key={i}>
            <Link to={"/books/" + i}>{t}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
`,
      explain: [
        "<code>to={\"/books/\" + i}</code> stitches the URL at render time: index 0 becomes <code>/books/0</code>, index 2 becomes <code>/books/2</code>. The <code>:</code> in the route path is a <em>pattern</em>; these are the concrete values that fill it.",
        "<code>key={i}</code> — the list-mapping rule from Week 11; React needs a stable key when a list re-renders.",
        "Link renders a real <code>&lt;a href&gt;</code> (so right-click → copy address still works) while keeping the navigation client-side.",
        "Indices are 0-based here because they come from an array. Real databases use their own ids — the pattern stays identical, only the number changes."
      ],
      run: "npm run dev  →  http://localhost:5173/books"
    },
    {
      title: "Wiring the list to the detail page",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/App.jsx -- two routes; the router itself is in main.jsx (Lesson 071, placement A)
import { Routes, Route } from "react-router-dom";
import Books from "./pages/Books.jsx";
import BookDetail from "./pages/BookDetail.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/books" element={<Books />} />
      <Route path="/books/:id" element={<BookDetail />} />
    </Routes>
  );
}
`,
      explain: [
        "<code>/books</code> is static and <code>/books/:id</code> is dynamic — two different depths, so they can never shadow each other, whatever order you list them in.",
        "Every visitor of <code>/books/2</code> renders the <em>same</em> BookDetail component; only <code>useParams()</code> differs. One component, infinite URLs — the whole point of routing.",
        "Sorting out the router: <code>&lt;BrowserRouter&gt;</code> stays in main.jsx from Lesson 071 — Routes/Route go here, in App.",
        "Try <code>/books/not-a-number</code>: <code>Number(...)</code> gives <code>NaN</code>, the lookup fails, and the not-found branch renders. Bad input never crashes the page."
      ],
      run: "npm run dev  →  click a title on /books, then press the browser Back button"
    },
    {
      title: "Optional segment: one component, two URLs",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// route (add inside <Routes>):  <Route path="settings/:tab?" element={<Settings />} />

// src/pages/Settings.jsx
import { useParams, Link } from "react-router-dom";

export default function Settings() {
  const { tab } = useParams();       // undefined at /settings, "profile" at /settings/profile
  const open = tab ?? "general";     // default when the optional segment is missing

  return (
    <section>
      <h1>Settings</h1>
      <p>Showing the {open} tab.</p>
      <Link to="/settings">General</Link>
      {" "}
      <Link to="/settings/profile">Profile</Link>
    </section>
  );
}
`,
      explain: [
        "The <code>?</code> after <code>:tab</code> makes that segment optional: the same route matches <code>/settings</code> and <code>/settings/profile</code>, so you write one route instead of two.",
        "<code>tab ?? \"general\"</code> — the nullish coalescing default from your JavaScript essentials: when the segment is absent, <code>useParams()</code> gives <code>undefined</code> and the fallback kicks in.",
        "Without <code>?</code> you would need two <code>&lt;Route&gt;</code> elements pointing at the same component, which duplicates the table every time the list grows.",
        "The static form works the same way — <code>users/:userId/edit?</code> matches <code>/users/7/edit</code> and <code>/users/7</code>."
      ],
      run: "npm run dev  →  open /settings, then /settings/profile"
    },
    {
      title: "useSearchParams: a filter that survives refresh and sharing",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// route (add inside <Routes>):  <Route path="/search" element={<BookSearch />} />

// src/pages/BookSearch.jsx
import { useSearchParams } from "react-router-dom";

const TITLES = ["tao te ching", "metamorphosis", "crime and punishment", "surrounded by idiots"];

export default function BookSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const hits = TITLES.filter((t) => t.toLowerCase().includes(q.toLowerCase()));

  return (
    <section>
      <h1>Search</h1>
      <input
        value={q}
        placeholder="type a title"
        onChange={(e) => setSearchParams(e.target.value ? { q: e.target.value } : {})}
      />
      <p>
        {hits.length} of {TITLES.length} books match
      </p>
      <ul>
        {hits.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </section>
  );
}
`,
      explain: [
        "<code>useSearchParams()</code> returns a pair just like <code>useState</code>: a readable object and a setter. The difference is the storage location — the address bar instead of component memory.",
        "<code>searchParams.get(\"q\")</code> returns <code>null</code> when the parameter is absent, so <code>|| \"\"</code> keeps the input controlled with a string.",
        "<code>setSearchParams({...})</code> writes <code>?q=...</code> and performs a navigation; passing <code>{}</code> clears the query entirely. Every keystroke updates the URL — copy it, refresh it, send it to a classmate, same results.",
        "Compare with Week 12's <code>useState</code>: with state in the URL, refresh and Back behave correctly for free, and no <code>useEffect</code> synchronisation is needed."
      ],
      run: "npm run dev  →  http://localhost:5173/search?q=kafka"
    },
    {
      title: "Nested routes: a shell, an Outlet and an index route",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/pages/Dashboard.jsx -- the shell: header, sub-navigation, and a hole for the child
import { Link, Outlet } from "react-router-dom";

export default function Dashboard() {
  return (
    <section>
      <h1>Dashboard</h1>
      <nav>
        <Link to="/dashboard">Overview</Link>
        {" "}
        <Link to="settings">Settings</Link>
      </nav>
      <Outlet />
    </section>
  );
}

// ---- src/App.jsx -- children are declared by NESTING, not by long path strings ----
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Overview from "./pages/Overview.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />}>
        <Route index element={<Overview />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
`,
      explain: [
        "<code>&lt;Outlet /&gt;</code> is a placeholder: at <code>/dashboard</code> it renders Overview (the index route), at <code>/dashboard/settings</code> it renders Settings. The shell — heading, sub-nav, footer — never remounts.",
        "Child paths are relative: <code>path=\"settings\"</code> is joined onto the parent's <code>dashboard</code>, so moving the whole section means editing exactly one string.",
        "<code>&lt;Route index&gt;</code> has no path: it is the default child, filling the parent's own URL. Delete it and <code>/dashboard</code> shows the shell with an empty hole.",
        "The second link uses <code>to=\"settings\"</code> with no leading slash — relative to the route you are in, resolving to <code>/dashboard/settings</code>. Absolute links (<code>to=\"/dashboard\"</code>) always start from the site root."
      ],
      run: "npm run dev  →  compare /dashboard with /dashboard/settings: only the Outlet area changes"
    },
    {
      title: "Dynamic not-found: redirecting when the data 404s",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// src/pages/BookDetail.jsx -- the redirect version of Example 2
import { useParams, Link, Navigate } from "react-router-dom";

const TITLES = ["tao te ching", "metamorphosis", "crime and punishment"];

export default function BookDetail() {
  const { id } = useParams();
  const title = TITLES[Number(id)];

  if (!title) {
    // /books/999 fits the route pattern but has no data behind it:
    // swap this URL for one the catch-all "path=*" route will own
    return <Navigate to="/no-such-page" replace />;
  }

  return (
    <article>
      <h1>{title}</h1>
      <Link to="/books">Back to the shelf</Link>
    </article>
  );
}
`,
      explain: [
        "<code>&lt;Navigate&gt;</code> is a component that performs a navigation the moment it renders — no <code>useEffect</code>, no manual <code>navigate()</code> call.",
        "<code>replace</code> overwrites the broken entry in the history stack instead of pushing a new one. Without it, Back returns to <code>/books/999</code>, which immediately redirects again — a loop that traps the user.",
        "The target <code>/no-such-page</code> matches no real route, so the <code>path=\"*\"</code> catch-all from Lesson 071 renders its NotFound page: one 404 screen covers both unknown URLs and invalid ids.",
        "Example 2's alternative — stay and print \"No such book\" — is often friendlier. Redirecting is right when the URL is simply wrong rather than merely empty."
      ],
      run: "npm run dev  →  http://localhost:5173/books/999",
      output: "browser URL changes to /no-such-page and the 404 page renders"
    }
  ],
  keyPoints: [
    "A <code>:id</code> segment is a placeholder that matches any value; <code>useParams()</code> returns it as a <em>string</em> — wrap in <code>Number()</code> before indexing or comparing",
    "<code>?</code> makes a segment optional (<code>params.x</code> is undefined, so supply a default); <code>*</code> captures the rest of the URL",
    "Everything after <code>?</code> is read and written with <code>useSearchParams()</code> — filters and search terms that survive refresh, Back and sharing, unlike useState",
    "Nested routes render into the parent's <code>&lt;Outlet/&gt;</code>; child paths are relative, and an <code>index</code> route fills the parent's own URL",
    "<code>&lt;Navigate to=\"...\" replace /&gt;</code> handles \"route matched, data missing\": replace stops the Back button from looping on a broken URL",
    "Two 404 situations: unknown path → the <code>*</code> catch-all; known path with no data → explain in the page or redirect"
  ],
  practice: `
    <p>In your copy of <code>react3</code>, add <code>/books</code> and <code>/books/:id</code> to
    the route table and give <code>BookDetail</code> an array of the journal's four book titles.
    Visit <code>/books/2</code>, then <code>/books/42</code> and confirm the not-found branch (or
    redirect) fires. Next add a <code>/search</code> route with the search input, type something,
    and <strong>bookmark the resulting URL</strong> — reopen the bookmark in a fresh tab: the same
    results appear with no extra code. Finally nest one section (a shell with an
    <code>&lt;Outlet/&gt;</code> and an index route) and check that only the hole changes between
    <code>/dashboard</code> and <code>/dashboard/settings</code>.</p>
  `,
  quiz: [
    {
      q: "The route path is /books/:id and the URL is /books/42. What does useParams() return?",
      options: [
        "{ id: \"42\" } — the value is always a string, so convert it with Number() before comparing",
        "{ id: 42 } — URL numbers are parsed to numbers automatically",
        "{ id: \"/books/42\" } — the whole path is returned",
        "null — params only exist when a loader is configured"
      ],
      answer: 0,
      why: "Dynamic segments are parsed out of the URL as text. React Router cannot know whether 42 means a number, an id, or a phone digit — conversion is the developer's job."
    },
    {
      q: "What is the difference between /books/42 and /books?id=42 for React Router?",
      options: [
        "The first is a dynamic segment that decides which route matches, read with useParams(); the second is a query string that plays no part in matching, read with useSearchParams()",
        "They are interchangeable — both are read with useParams()",
        "The query string version changes which component mounts; the segment version does not",
        "Segments survive refresh, query strings do not"
      ],
      answer: 0,
      why: "Only the path (before ?) is matched against Route patterns. Query strings are free-form key=value pairs layered on top — ideal for filters, tabs and search, which is why they never affect matching."
    }
  ],
  sources: [
    "https://reactrouter.com/start/declarative/routing",
    "https://reactrouter.com/start/declarative/url-values",
    "https://reactrouter.com/api/hooks/useNavigate",
    "https://react.dev/learn"
  ]
});
