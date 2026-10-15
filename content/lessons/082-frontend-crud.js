window.COURSE_LESSONS.push({
  id: "w15-frontend-crud",
  file: "082",
  unit: 4,
  week: 15,
  title: "The front end: fetch-based CRUD in React",
  kicker: "Unit IV · Week 15 · Lesson 4 of 7",
  minutes: 18,
  objectives: [
    "Name the five useState slices in App.jsx and say what each one redraws",
    "Trace loadLocations() from useEffect through fetch to setLocations",
    "Pick GET, POST, PUT or DELETE from the frontend code and read its error alerts",
    "Explain why this app reloads after every write instead of updating state optimistically"
  ],
  intro: `
    <p>Lessons 080 and 081 built the machine: an API that answers JSON and a table full of five
    seed rows. Now the half you can see — <code>otaku/src/App.jsx</code>, 157 lines that hold
    the <em>entire</em> UI and every network call in one component. It is the shortest honest
    example of CRUD in React: five pieces of state, one effect, four fetch calls. We read it
    section by section, and next chapter we wire its relative URLs to the server with the Vite
    proxy.</p>
  `,
  theory: [
    `
      <h3>Five slices of state, one component</h3>
      <p>Everything this app remembers lives in five <code>useState</code> hooks at the top of
      <code>App()</code>. Reading them first makes every handler below unsurprising:</p>
      <table>
        <thead><tr><th>State</th><th>Starts as</th><th>Job</th></tr></thead>
        <tbody>
          <tr><td><code>locations</code></td><td><code>[]</code></td><td>the rows from the API — rendered as the card grid</td></tr>
          <tr><td><code>search</code></td><td><code>''</code></td><td>what you are typing in the search box</td></tr>
          <tr><td><code>form</code></td><td>the blank <code>emptyForm</code></td><td>the six inputs being filled in (4 required + 2 optional)</td></tr>
          <tr><td><code>editingId</code></td><td><code>null</code></td><td><code>null</code> = adding; a number = editing that id</td></tr>
          <tr><td><code>showForm</code></td><td><code>false</code></td><td>whether the Add/Edit form is on screen</td></tr>
        </tbody>
      </table>
      <p>Notice the design: <code>editingId</code> alone decides which HTTP verb Save will use,
      so one form component does double duty as "Add" and "Edit". And because the inputs are
      <em>controlled</em> (their <code>value</code> comes from state), typing in the fourth box
      never erases what you typed in the first — that is the whole point of storing
      <code>form</code> as an object and spreading it on every keystroke.</p>
    `,
    `
      <h3>Reading: one function, called two ways</h3>
      <p><code>loadLocations(text)</code> is the app's only read path. It builds a URL (plain
      <code>/api/locations</code>, or with <code>?search=</code> appended when text is given),
      then runs the classic fetch chain:</p>
      <pre class="diagram">fetch(url)  →  res.json()  →  setLocations(data)
 network      parse body      store it - React redraws the grid</pre>
      <p>The final <code>.catch</code> is the human touch: if the back end is not running, the
      promise rejects at the network step and an alert says
      <em>"Cannot connect to backend. Run: node server.js"</em> — a message written by someone
      who has forgotten to start the server before.</p>
      <p>It is called from exactly two places: <code>useEffect(..., [])</code> once when the
      page mounts (the empty dependency array means "no re-runs"), and <code>handleSearch</code>
      on submit. One small honest wart worth noticing: unlike <code>handleSubmit</code>,
      <code>loadLocations</code> never checks <code>res.ok</code> — a 500 from the API would be
      parsed as if it were rows. Good to spot, easy to fix, and a nice exercise at the end of
      this lesson.</p>
    `,
    `
      <h3>Writing: Save chooses POST or PUT</h3>
      <p><code>handleSubmit</code> starts with <code>e.preventDefault()</code> — without it the
      browser would do its ancient thing and reload the page (and lose all state) on any form
      submit. Then the fork:</p>
      <ul>
        <li><code>editingId</code> is <code>null</code> → <code>POST /api/locations</code>,
        create;</li>
        <li><code>editingId</code> is a number → <code>PUT /api/locations/&lt;id&gt;</code>,
        replace.</li>
      </ul>
      <p>The request carries two things the read path has no need for:
      <code>headers: { 'Content-Type': 'application/json' }</code> announcing the format, and
      <code>body: JSON.stringify(form)</code> — because fetch can only send text, not objects.
      The response handling is the pattern from Lesson 079 in code: if <code>!res.ok</code>,
      parse the server's error body and <code>throw</code> its <code>message</code>, so the
      single <code>.catch</code> at the bottom can <code>alert(err.message)</code> — that is how
      <em>"Please fill all required fields"</em> from server.js appears as a browser alert.</p>
    `,
    `
      <h3>Reload-after-write vs optimistic updates</h3>
      <p>After a successful write, React has two strategies for keeping the grid honest:</p>
      <ul>
        <li><strong>Reload-after-write</strong> (what this app does): call
        <code>loadLocations('')</code> again and let the server's answer be the only truth.
        Three extra lines, impossible to get wrong, always matches the database — including ids
        and timestamps the server assigned.</li>
        <li><strong>Optimistic update</strong>: change local state immediately (delete the card
        from the array), assuming success, and roll back if the request fails. Instant feel, but
        you must remember to write the rollback, and you must guess values like the new
        <code>insertId</code>.</li>
      </ul>
      <p>For a five-row list the extra GET costs nothing, so reloading is clearly the simpler
      correct choice — the database stays the single source of truth. Optimistic updates earn
      their complexity only where latency is visible (chat, feeds, slow mobile links). Example 6
      shows both side by side so you can see exactly what "optimistic" adds.</p>
    `,
    `
      <h3>Delete: a confirm gate, then a verb</h3>
      <p><code>handleDelete</code> has three lines of manners before the request:
      <code>window.confirm('Delete this location?')</code> shows a blocking Yes/No dialog, and
      returning early on "No" means the fetch is never sent. Destructive actions deserve a
      speed bump, and this is the built-in one. The DELETE itself needs no body and no headers —
      the id in the URL says everything — and like every write it finishes with
      <code>loadLocations('')</code>.</p>
    `,
    `
      <h3>Rendering: the grid and the empty state</h3>
      <p>The JSX at the bottom is data-driven end to end:
      <code>locations.map((loc) =&gt; (...))</code> turns the array into cards, and
      <code>key={loc.id}</code> gives React a stable identity per row so it can update only the
      cards that changed instead of re-creating the whole grid. Two small guards make the
      rendering safe:</p>
      <ul>
        <li><code>{loc.image_url &amp;&amp; &lt;img .../&gt;}</code> — an empty optional column
        renders <em>nothing</em> rather than a broken image icon. Falsy-guarding nullable
        database columns is a habit worth keeping.</li>
        <li><code>{locations.length === 0 &amp;&amp; &lt;p&gt;No locations found.&lt;/p&gt;}</code>
        — the explicit empty state. Without it, a zero-row API looks exactly like a broken page.</li>
      </ul>
      <p>Search that finds nothing and an empty database both land on that one line — which is
      why the message says "found", not "empty".</p>
    `
  ],
  examples: [
    {
      title: "emptyForm and the five useState hooks",
      from: "journal",
      file: "otaku/src/App.jsx",
      lang: "jsx",
      code: `
const emptyForm = {
  anime_name: '',
  location_name: '',
  city: '',
  country: '',
  description: '',
  image_url: ''
};

function App() {
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
`,
      explain: [
        "<code>emptyForm</code> is defined once outside the component so both Add and Save-after-success can reset to the same blank object without recreating it each render.",
        "Each destructured pair is <code>[value, setValue]</code>: calling a setter schedules a redraw of the component — that is the entire re-render mechanism (Lesson 064).",
        "<code>editingId</code> starts <code>null</code> for \"adding\"; a number means \"editing row with this id\" — one value selects POST vs PUT later.",
        "<code>useState(emptyForm)</code> shares that object as the initial value; the app never mutates it in place — always spreads it (<code>{ ...form, ... }</code>), so React always sees a new reference."
      ]
    },
    {
      title: "loadLocations() + the mount effect + search",
      from: "journal",
      file: "otaku/src/App.jsx",
      lang: "jsx",
      code: `
  function loadLocations(text) {
    let url = '/api/locations';
    if (text) {
      url = '/api/locations?search=' + text;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch(() => alert('Cannot connect to backend. Run: node server.js'));
  }

  useEffect(() => {
    loadLocations('');
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSearch(e) {
    e.preventDefault();
    loadLocations(search);
  }
`,
      explain: [
        "The URL is relative — no host, no port. That is deliberate: the Vite proxy (Lesson 083) owns the decision of where <code>/api</code> really goes.",
        "<code>useEffect(fn, [])</code> runs once after the first render: the app's entire start-up sequence is \"GET the rows\".",
        "<code>.then((res) =&gt; res.json())</code> parses the body; <code>.then((data) =&gt; setLocations(data))</code> stores it — after which React re-renders the grid from state.",
        "The <code>.catch</code> fires only when the request itself fails (server down, proxy missing) — a friendly alert instead of a permanently blank page.",
        "<code>handleChange</code> uses a computed key <code>[e.target.name]</code>: the input's own <code>name</code> attribute decides which field of <code>form</code> gets the keystroke, so one handler serves all six inputs."
      ],
      run: "open http://localhost:5173  (Vite + server.js + MySQL running)",
      output: "5 cards appear; console shows no errors"
    },
    {
      title: "handleSubmit: POST or PUT, and the error-to-alert path",
      from: "journal",
      file: "otaku/src/App.jsx",
      lang: "jsx",
      code: `
  function handleSubmit(e) {
    e.preventDefault();
    let url = '/api/locations';
    let method = 'POST';
    if (editingId) {
      url = '/api/locations/' + editingId;
      method = 'PUT';
    }
    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => { throw new Error(err.message); });
        }
        return res.json();
      })
      .then(() => {
        setShowForm(false);
        setForm(emptyForm);
        setEditingId(null);
        loadLocations('');
      })
      .catch((err) => alert(err.message));
  }
`,
      explain: [
        "<code>e.preventDefault()</code> first: without it the browser's default form submit would reload the page and throw away all five state slices.",
        "The <code>if (editingId)</code> block is the whole Add-vs-Edit difference — same form, same function, two verbs and two URLs.",
        "<code>JSON.stringify(form)</code> turns the state object into the text fetch can send; the Content-Type header tells server.js's readBody() how to read it back.",
        "<code>if (!res.ok)</code> is the status-code discipline from Lesson 079: parse the server's error body and <em>throw</em> its message, so control jumps to the single <code>.catch</code> → <code>alert(err.message)</code>.",
        "The success branch does a tidy-up in order — hide form, blank form, clear editingId, then <code>loadLocations('')</code> to show the server's new truth (reload-after-write)."
      ],
      run: "click Save in the running app; watch DevTools → Network for POST (201) then GET (200)",
      output: "alert on failure, refreshed grid on success"
    },
    {
      title: "handleDelete: confirm gate, DELETE, reload",
      from: "journal",
      file: "otaku/src/App.jsx",
      lang: "jsx",
      code: `
  function handleDelete(id) {
    if (!window.confirm('Delete this location?')) {
      return;
    }
    fetch('/api/locations/' + id, { method: 'DELETE' })
      .then(() => loadLocations(''))
      .catch(() => alert('Cannot delete'));
  }
`,
      explain: [
        "<code>window.confirm</code> returns a boolean and blocks the page until answered — \"No\" means the function returns before any network call happens.",
        "The id travels in the URL (<code>/api/locations/3</code>); DELETE needs no body, which is why there are no headers and no JSON.stringify here.",
        "The <code>.then(() =&gt; loadLocations(''))</code> runs on <em>any</em> HTTP status — even a 404 triggers the reload. The grid is still correct (the row never vanished), just not told why; a stricter version would check <code>res.ok</code> first.",
        "This is the third and last call to <code>loadLocations</code>: mount, after write, after delete. Every mutation ends by re-reading."
      ],
      run: "click Delete in the running app, accept the dialog",
      output: "card disappears after the follow-up GET"
    },
    {
      title: "The card grid and the empty state",
      from: "journal",
      file: "otaku/src/App.jsx",
      lang: "jsx",
      code: `
      <div className="grid">
        {locations.map((loc) => (
          <div key={loc.id} className="card">
            {loc.image_url && <img src={loc.image_url} alt={loc.location_name} />}
            <h3>{loc.anime_name}</h3>
            <p><b>Place:</b> {loc.location_name}</p>
            <p><b>City:</b> {loc.city}, {loc.country}</p>
            <p>{loc.description}</p>
            <div className="card-buttons">
              <button onClick={() => handleEdit(loc)}>Edit</button>
              <button onClick={() => handleDelete(loc.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {locations.length === 0 && <p>No locations found.</p>}
`,
      explain: [
        "<code>locations.map(...)</code> is read-model: the array from the API becomes JSX directly — no manual DOM code anywhere.",
        "<code>key={loc.id}</code> gives React a stable identity per card so it can patch only the rows that changed between renders.",
        "The <code>loc.image_url &amp;&amp; &lt;img /&gt;</code> guard handles the nullable column: no link means no image element at all, not a broken one.",
        "<code>onClick={() =&gt; handleEdit(loc)}</code> wraps the call in an arrow so the whole <em>row object</em> is passed — Edit needs every field, Delete only needs <code>loc.id</code>.",
        "The final line is the explicit empty state: zero rows → \"No locations found.\" instead of a mysterious blank area."
      ]
    },
    {
      title: "handleChange in isolation: one handler, six inputs",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
import { useState } from 'react';

export function NameFields() {
  const [form, setForm] = useState({ city: '', country: '' });

  function handleChange(e) {
    // [e.target.name] is a COMPUTED KEY: the input's name attribute
    // decides which field of form receives this keystroke.
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div>
      <input name="city" value={form.city} onChange={handleChange} />
      <input name="country" value={form.country} onChange={handleChange} />
      <p>You typed: {form.city}, {form.country}</p>
    </div>
  );
}
`,
      explain: [
        "Copy the pattern from App.jsx: six inputs, one handler — each input only needs a matching <code>name</code> attribute.",
        "<code>{ ...form, [e.target.name]: value }</code> copies the old object and overwrites one key, so typing in \"country\" never wipes \"city\" — the reason <code>form</code> survives focus changes.",
        "<code>value={form.city}</code> + <code>onChange</code> makes the input <em>controlled</em>: React state is the single source of truth for what the box shows.",
        "Drop the spread (<code>setForm({ [e.target.name]: value })</code>) and only the last-typed field survives — a classic first-react bug worth reproducing once on purpose.",
        "Render it inside a Vite React page to run it: type in both boxes and watch neither erase the other."
      ],
      run: "render <NameFields /> inside a Vite React app, then npm run dev"
    },
    {
      title: "Reload-after-write vs an optimistic delete, side by side",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// A) what App.jsx actually does - reload from the server (3 lines, always correct)
fetch('/api/locations/' + id, { method: 'DELETE' })
  .then(() => loadLocations(''));

// B) optimistic - the card vanishes instantly, and comes back if the request fails
function deleteOptimistic(id) {
  const before = locations;
  setLocations(locations.filter((l) => l.id !== id));   // UI updates now
  fetch('/api/locations/' + id, { method: 'DELETE' })
    .then((res) => {
      if (!res.ok) throw new Error('delete failed');
    })
    .catch(() => {
      setLocations(before);                             // rollback: put the card back
    });
}
`,
      explain: [
        "Version A is the journal's code: one round trip later the grid matches the database exactly — no rollback logic, no guessing what the server did.",
        "Version B optimistically edits local state and only reconciles on failure; the <code>before</code> snapshot plus <code>setLocations(before)</code> is the rollback every optimistic update must have.",
        "Notice B also checks <code>res.ok</code> — optimistically hiding a row the server refused to delete is exactly the drift the rollback exists to repair.",
        "For a 5-row list, A's extra GET is microseconds; B's instant feel starts to matter only on slow links or long lists. Choose the simple one until the data proves you otherwise."
      ],
      run: "paste into App.jsx beside handleDelete, then compare DevTools → Network"
    }
  ],
  keyPoints: [
    "App.jsx holds five useState slices — locations, search, form, editingId, showForm — and every handler is a small combination of them",
    "useEffect with an empty dependency array calls loadLocations('') once on mount; both writes and deletes end by calling it again",
    "handleSubmit sends POST when editingId is null and PUT /api/locations/:id when it is set — one form, two verbs",
    "fetch does not reject on 4xx/5xx, which is why handleSubmit checks res.ok and throws the server's message into an alert",
    "Reload-after-write trades one extra GET for a single source of truth — the simplest correct state strategy, and what this app chooses",
    "key={loc.id} plus the two && guards (image, empty state) are what make the grid safe when data is missing"
  ],
  practice: `
    <p>Run the app and open DevTools → Network. Do three things and write down the exact
    requests you see: (1) search for <code>Kamakura</code> → a GET with
    <code>?search=Kamakura</code>; (2) add a location → a POST (201) followed by a GET (200);
    (3) edit it → a PUT to <code>/api/locations/&lt;id&gt;</code> followed by another GET.
    Then break the reload-on-purpose: comment out the
    <code>loadLocations('')</code> line inside <code>handleSubmit</code> in a <em>copy</em> of
    App.jsx and watch the new card fail to appear — the clearest proof of why the app reloads
    after every write.</p>
  `,
  quiz: [
    {
      q: "editingId is 3 when the user presses Save. Which request does handleSubmit send?",
      options: [
        "PUT /api/locations/3 with the form as a JSON body",
        "POST /api/locations with editingId: 3 inside the body",
        "DELETE /api/locations/3 followed by a POST",
        "GET /api/locations/3 to fetch the row first"
      ],
      answer: 0,
      why: "The fork is explicit: if (editingId) → url = '/api/locations/' + editingId, method = 'PUT'. A null editingId is the only path that keeps the default POST to the collection URL."
    },
    {
      q: "After a successful POST the new card appears. What made it appear?",
      options: [
        "handleSubmit called loadLocations('') again, so React re-rendered from the server's fresh rows",
        "React guessed a new card because the form closed",
        "The POST response body contained the whole updated list",
        "The browser reloaded the page and the useEffect ran again"
      ],
      answer: 0,
      why: "This app never edits the locations array by hand after a write — it re-reads the server (reload-after-write). The page does not reload either: e.preventDefault() stopped that, and useEffect only runs on mount."
    }
  ],
  sources: [
    "https://react.dev/reference/react/useState",
    "https://react.dev/reference/react/useEffect",
    "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"
  ]
});
