window.COURSE_LESSONS.push({
  id: "w15-run-and-debug",
  file: "084",
  unit: 4,
  week: 15,
  title: "Run sequence, data flow and debugging",
  kicker: "Unit IV · Week 15 · Lesson 6 of 7",
  minutes: 17,
  objectives: [
    "Start the whole stack from a cold machine, in the right order, checking each layer",
    "Trace each of the five UI actions to the exact HTTP request and SQL statement it produces",
    "Diagnose the six most common failures from their symptoms alone",
    "Verify the data with SELECT COUNT(*) before blaming any JavaScript"
  ],
  intro: `
    <p>Lessons 080–083 explained every file; this one is about <em>running</em> them together
    and fixing what goes wrong. The journal is unusually helpful here: the week map
    (<code>04_Unit-IV_Week-15.txt</code>) records the exact sequence — including the fact that
    during verification in October 2026 <strong>MySQL was off</strong> and the backend printed
    <code>ECONNREFUSED</code> until step 1 was done first. We take that sequence as
    authoritative, add the data flows for all five UI actions (15.6), and finish with a
    troubleshooting table you can keep open next to your terminal.</p>
  `,
  theory: [
    `
      <h3>The sequence, in order — each step with its proof</h3>
      <p>Order matters, because every step assumes the one before it. Never start at step 3:</p>
      <table>
        <thead><tr><th>#</th><th>Do</th><th>Proof it worked</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>Start MySQL in XAMPP (port 3306)</td><td>green/Running in the XAMPP panel</td></tr>
          <tr><td>2</td><td>Import <code>otaku_travel.sql</code> once per machine (Lesson 081)</td><td>table <code>locations</code> appears in phpMyAdmin</td></tr>
          <tr><td>3</td><td><code>SELECT COUNT(*) FROM locations;</code></td><td><strong>5</strong></td></tr>
          <tr><td>4</td><td><code>cd otaku/server &amp;&amp; node server.js</code></td><td><code>MySQL connected</code> then <code>Server running on http://localhost:5000</code></td></tr>
          <tr><td>5</td><td><code>cd otaku &amp;&amp; npm run dev</code> (second terminal)</td><td><code>Local: http://localhost:5173/</code></td></tr>
          <tr><td>6</td><td>Open http://localhost:5173</td><td>five cards, no alerts, Network shows GET 200</td></tr>
        </tbody>
      </table>
      <p>The journal's own run notes call the same order out, and they also record the trap:
      after a reboot the backend prints <code>MySQL not connected. Start MySQL and run
      database.sql</code> (and the raw <code>ECONNREFUSED</code> message) because step 1 was
      skipped. The API deliberately stays alive in that state — it will answer 500s rather than
      crash — so the <em>terminal log</em>, not the browser, is where the first clue always
      is.</p>
    `,
    `
      <h3>Five actions, five round trips</h3>
      <p>Everything the user can do maps to one chain — this is the journal's own 15.6 data-flow
      list, with the SQL made explicit:</p>
      <table>
        <thead><tr><th>Action</th><th>UI event</th><th>HTTP</th><th>SQL</th><th>Result</th></tr></thead>
        <tbody>
          <tr><td>Open</td><td><code>useEffect([])</code></td><td>GET <code>/api/locations</code></td><td><code>SELECT * ORDER BY id DESC</code></td><td>5 cards</td></tr>
          <tr><td>Search</td><td>search submit</td><td>GET <code>/api/locations?search=x</code></td><td><code>WHERE ... LIKE '%x%' OR ...</code></td><td>filtered cards</td></tr>
          <tr><td>Add</td><td>Save (no editingId)</td><td>POST <code>/api/locations</code> → 201</td><td><code>INSERT ... VALUES (?,...)</code></td><td>reload GET → new card</td></tr>
          <tr><td>Edit</td><td>Save (editingId set)</td><td>PUT <code>/api/locations/:id</code> → 200</td><td><code>UPDATE ... WHERE id=?</code></td><td>reload GET → changed card</td></tr>
          <tr><td>Delete</td><td>confirm → button</td><td>DELETE <code>/api/locations/:id</code> → 200</td><td><code>DELETE ... WHERE id=?</code></td><td>reload GET → card gone</td></tr>
        </tbody>
      </table>
      <p>Two structural facts fall out: <strong>every write is followed by a read</strong>
      (reload-after-write, Lesson 082), and <strong>every failure ends as an
      <code>alert(message)</code></strong> — 400 for missing fields, 404 for a bad id, 500 for a
      database failure. When a user says "it did nothing", the Network tab tells you which of
      the five chains never completed.</p>
    `,
    `
      <h3>Troubleshooting table</h3>
      <p>These six cover virtually every first-run failure. Match the <em>symptom</em> to the
      <em>layer</em> — that is the whole skill:</p>
      <table>
        <thead><tr><th>Symptom</th><th>Likely cause</th><th>Fix</th></tr></thead>
        <tbody>
          <tr>
            <td>Backend prints <code>MySQL not connected...</code> or throws <code>connect ECONNREFUSED 127.0.0.1:3306</code></td>
            <td>MySQL is not running — or the database/credentials at the top of server.js are wrong</td>
            <td>Start MySQL in XAMPP (step 1), then confirm <code>otaku_travel</code> exists and <code>DB_PASSWORD</code> matches yours; re-import if the table is missing</td>
          </tr>
          <tr>
            <td>Browser alert: <em>"Cannot connect to backend. Run: node server.js"</em></td>
            <td>The API is not running (or not on :5000)</td>
            <td>Start it in <code>otaku/server</code>; look for <code>Server running on http://localhost:5000</code></td>
          </tr>
          <tr>
            <td>GET <code>/api/locations</code> returns <strong>HTML</strong> with status 404 (Type: html), server terminal shows no request</td>
            <td><strong>The proxy is not working</strong> — Vite answered the URL itself</td>
            <td>Check <code>server.proxy</code> in vite.config.js, fix it, and <em>restart</em> <code>npm run dev</code> (config is read once); make sure you are on http://localhost:5173</td>
          </tr>
          <tr>
            <td>Console error: <em>"blocked by CORS policy"</em></td>
            <td>The proxy is missing/bypassed, or a fetch hardcodes <code>http://localhost:5000</code></td>
            <td>Restore the <code>/api</code> proxy and use the relative URL (Lesson 083, Example 5)</td>
          </tr>
          <tr>
            <td>Backend says <code>MySQL not connected</code> even though XAMPP is green</td>
            <td>Wrong database name/user/password in server.js, or the DB was never created</td>
            <td>Run the COUNT check from step 3; align <code>DB_NAME</code>, <code>DB_USER</code>, <code>DB_PASSWORD</code> with your machine</td>
          </tr>
          <tr>
            <td>Blank page, or React error in the browser console</td>
            <td>The dev server failed to compile, or a runtime error crashed the render</td>
            <td>Read the <strong>terminal running npm run dev</strong> first (syntax errors land there), then the browser console; confirm http://localhost:5173 returns HTML via <code>curl</code></td>
          </tr>
        </tbody>
      </table>
      <div class="note"><p><strong>The one-question triage:</strong> <em>did the request reach
      the server terminal?</em> No → front end or proxy layer. Yes, but the answer was 400/404/500
      → read the JSON body, it names the problem. Everything else is detail.</p></div>
    `,
    `
      <h3>Verify data before code</h3>
      <p>Empty grid, missing row, search that finds nothing — the fastest way to decide whether
      to blame SQL or JavaScript is a direct query:
      <code>SELECT COUNT(*) FROM locations;</code> returns 5? The database is innocent and the bug
      is upstream in Node or React. Returns 0? Stop debugging code entirely: you are looking at
      an import that never ran, or a connection to the wrong database. The journal's
      <code>FUNCTIONALITIES.txt</code> records exactly this check as its live verification
      (Example 3), and it is the habit that separates "I think the data is there" from "I know".</p>
    `
  ],
  examples: [
    {
      title: "The journal's own HOW TO RUN, verbatim",
      from: "journal",
      file: "sorted_files/15_Week-15_Integration-otaku/FUNCTIONALITIES.txt",
      lang: "text",
      code: `
12. HOW TO RUN (verified 2026-10-09)
------------------------------------
  1. MySQL via XAMPP must be running on port 3306. After a machine
     restart, start it again (mysqld runs in background; the XAMPP
     panel is only a GUI for it).
  2. Setup DB once: & "C:\\xampp\\mysql\\bin\\mysql.exe" -u root -e
     "SOURCE C:/Users/Nishant/Desktop/otaku/server/database.sql".
     Check: ... -e "USE otaku_travel; SELECT COUNT(*) FROM locations;"
     must return 5.
  3. Backend: cd server, node server.js. Must print "MySQL connected".
     Check http://localhost:5000/api/locations shows 5-item JSON.
  4. Frontend: npm.cmd run dev (root folder). Open http://localhost:5173.
  Note: server.js DB_PASSWORD at top must match MySQL (currently '').
`,
      explain: [
        "Step 1 is the one people skip: mysqld does not survive a reboot by itself, and the XAMPP panel is only its remote control — exactly the ECONNREFUSED the journal recorded during verification.",
        "Step 2's check (<em>\"must return 5\"</em>) is the COUNT rule of the theory section; <code>SOURCE</code> is phpMyAdmin-style file execution from the CLI.",
        "<strong>Two honest corrections to the journal text:</strong> the referenced <code>server/database.sql</code> is not in the repo — the dump you actually have is <code>otaku/otaku_travel.sql</code> (Lesson 081); and the trailing <code>...</code> in step 2 is the journal's own shorthand for repeating the mysql.exe path.",
        "Steps 3 and 4 are two terminals, two logs — and the two proof strings (<code>MySQL connected</code>, <code>5-item JSON</code>) tell you which layer is alive before you open a browser."
      ]
    },
    {
      title: "The journal's DATA FLOWS for all five actions, verbatim",
      from: "journal",
      file: "otaku/FUNCTIONALITIES.txt",
      lang: "text",
      code: `
11. DATA FLOWS
--------------
  VIEW: open page -> useEffect -> GET / -> SELECT * -> JSON -> cards.
  SEARCH: Search btn -> GET ?search=x -> LIKE %x% on 4 cols -> filtered cards.
  ADD: Add -> blank form -> POST JSON -> INSERT -> 201 -> reload GET.
  EDIT: Edit -> form filled + editingId -> PUT JSON -> UPDATE -> reload.
  DELETE: Delete -> confirm -> DELETE -> reload.
  Errors: 400 missing fields, 404 bad id, 500 DB fail -> alert(message).
`,
      explain: [
        "Six arrows per line: UI event → React handler → HTTP → SQL → JSON → render. Reading a feature this way localises any bug to a single arrow.",
        "The <code>-&gt; reload</code> suffix on all three writes is reload-after-write (Lesson 082) written down by the journal itself.",
        "The last line is the error contract: whichever of 400/404/500 comes back, the front end's single job is <code>alert(message)</code>.",
        "Vocabulary check: <code>LIKE %x%</code> is SQL's contains-search, and <code>4 cols</code> means anime_name, location_name, city, country — the four searchable columns."
      ]
    },
    {
      title: "The journal's live database check, verbatim",
      from: "journal",
      file: "otaku/FUNCTIONALITIES.txt",
      lang: "text",
      code: `
8. DATABASE (server/database.sql + live check)
----------------------------------------------
  Live MySQL (XAMPP, port 3306) verified 2026-10-09:
    DESCRIBE locations = id int PRI auto_increment, anime_name,
    location_name, city, country varchar(100) NOT NULL,
    description text NULL, image_url varchar(500) NULL,
    created_at timestamp default current_timestamp().
    5 rows: ids 1-5 (Your Name/Tokyo, Slam Dunk/Kamakura,
    Steins;Gate/Tokyo, Weathering With You/Tokyo, K-On!/Toyosato).
`,
      explain: [
        "<code>DESCRIBE locations</code> is the live echo of the schema you read in Lesson 081 — every column and type matches the dump.",
        "\"5 rows: ids 1-5\" is the COUNT=5 claim with the names attached — your sanity check after any import.",
        "The header line mentions <code>server/database.sql</code> again; as everywhere in this repo, the file on disk is <code>otaku_travel.sql</code> — same schema, different name.",
        "Note the verification date: this is a recorded observation against a real XAMPP install, not a theory claim — the standard this book holds itself to."
      ]
    },
    {
      title: "Cold start: the whole sequence as one script",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# ---- STEP 1: MySQL first, always (XAMPP Control Panel -> Start on MySQL)
C:\\xampp\\mysql\\bin\\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS otaku_travel;"
C:\\xampp\\mysql\\bin\\mysql.exe -u root otaku_travel < otaku/otaku_travel.sql
C:\\xampp\\mysql\\bin\\mysql.exe -u root -e "USE otaku_travel; SELECT COUNT(*) FROM locations;"   # -> 5

# ---- STEP 2: the API (terminal 1)
cd otaku/server
node server.js
# expected: MySQL connected
# expected: Server running on http://localhost:5000

# ---- STEP 3: the UI (terminal 2)
cd otaku
npm run dev
# expected: Local: http://localhost:5173/   then open it
`,
      explain: [
        "Every line before <code>node server.js</code> is layer 1 (MySQL); skip it and the API logs <code>MySQL not connected</code> instead of crashing.",
        "<code>&lt; otaku/otaku_travel.sql</code> streams the dump into the client — a no-op for the table if it already exists, so re-running is safe after a <code>CREATE DATABASE</code>.",
        "Two <code>expected:</code> comments in the API terminal are your checkpoints: neither printed means the terminal itself has the answer (wrong folder, missing <code>npm i</code>, port already in use).",
        "The COUNT and the API's <code>MySQL connected</code> are the same fact checked from two directions — CLI and application."
      ],
      run: "run the three blocks in order, from the repo root",
      output: "MySQL connected\nServer running on http://localhost:5000"
    },
    {
      title: "Three curls that identify the broken layer in 10 seconds",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# A) the API directly - must be JSON
curl -i http://localhost:5000/api/locations

# B) the UI - must be HTML
curl -i http://localhost:5173/

# C) the API THROUGH the dev server - must ALSO be JSON
curl -i http://localhost:5173/api/locations
`,
      explain: [
        "A fails (connection refused) → MySQL/Node layer: go to the server terminal. A works but B fails → Vite layer: check the npm run dev terminal.",
        "C is the proxy test: JSON means Vite forwarded <code>/api</code> to :5000; <code>text/html</code> with 404 means Vite served its own fallback — the proxy rule is missing or Vite was not restarted after editing it.",
        "<code>-i</code> shows the status line and <code>Content-Type</code>, the two fields that identify which program answered.",
        "This is the same triage as the troubleshooting table, in three commands — run it before reading any stack trace."
      ],
      run: "curl -i http://localhost:5173/api/locations",
      output: "HTTP/1.1 200 OK\nContent-Type: application/json\n[{...}]  (or: HTTP/1.1 404 Not Found / Content-Type: text/html = proxy broken)"
    },
    {
      title: "Which layer is even alive? Check the three ports",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# Windows PowerShell / cmd: is each layer LISTENING?
netstat -ano | findstr :3306
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# macOS / Linux equivalent
lsof -iTCP -sTCP:LISTEN -P | grep -E "3306|5000|5173"
`,
      explain: [
        "No output for :3306 → start MySQL; that single absence produces the <code>ECONNREFUSED</code> and the backend's <code>MySQL not connected</code> message.",
        "No output for :5000 → node server.js is not running (it crashed, or you are in the wrong folder); :5173 → the dev server is down.",
        "Extra lines on :5000 with <code>ESTABLISHED</code> instead of <code>LISTENING</code> mean something is connecting, not serving — look for a stray second copy of the API still holding the port.",
        "One command, three layers: it answers \"is it off?\" before you spend a minute reading logs that assume it is on."
      ],
      run: "netstat -ano | findstr :5000"
    }
  ],
  keyPoints: [
    "Order matters: MySQL (:3306) first, then node server.js (proof: 'MySQL connected'), then npm run dev (proof: Local http://localhost:5173)",
    "Every UI action is one chain — open/search GET, add POST, edit PUT, delete DELETE — and every write is followed by a reload GET",
    "ECONNREFUSED / 'MySQL not connected' = database layer; HTML with 404 on /api = proxy layer; CORS error = fetch URL/origin layer; blank page = dev-server terminal",
    "Verify the data with SELECT COUNT(*) FROM locations = 5 before debugging a single line of JavaScript",
    "The Network tab's Status + Content-Type columns answer most full-stack bugs: JSON+200 is healthy, HTML+404 means the proxy never ran"
  ],
  practice: `
    <p>Do a deliberate cold start: stop MySQL in XAMPP and reload the app. Write down what you
    see in <em>both</em> terminals and the browser, then work the troubleshooting table until the
    five cards are back — one layer at a time, checking each fix with the three curls of Example 5.
    Finally, delete every row through the UI and confirm the empty state
    (\"No locations found.\") while <code>SELECT COUNT(*)</code> returns 0 — then re-import the
    dump to restore the seed data.</p>
  `,
  quiz: [
    {
      q: "The API terminal prints 'MySQL not connected. Start MySQL and run database.sql' plus a connection refused error. What is your first move?",
      options: [
        "Start MySQL in XAMPP, then run the COUNT check to confirm database otaku_travel and its 5 rows exist",
        "Reinstall Node.js, because the server cannot start",
        "Delete vite.config.js so the proxy stops interfering",
        "Edit App.jsx to retry the fetch every second"
      ],
      answer: 0,
      why: "The message is about layer 1: MySQL is unreachable (after a reboot it must be started again). Node and React cannot be the cause of a database connection error — verify the database, and only then look at code."
    },
    {
      q: "DevTools shows GET /api/locations with Status 404 and Type: html, and the server terminal shows no request at all. What is wrong?",
      options: [
        "The Vite proxy is not forwarding — the dev server answered its own 404 fallback, so check server.proxy in vite.config.js and restart npm run dev",
        "The row with id 404 does not exist in MySQL",
        "The API returned a JSON 404 body that React failed to parse",
        "The COUNT check was never run"
      ],
      answer: 0,
      why: "The giveaway is 'server terminal shows no request': Node never received it. HTML content type means Vite itself answered — a missing/unrestarted proxy rule. A real API 404 would be JSON and would appear in the server log."
    }
  ],
  sources: [
    "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
    "https://vite.dev/config/server-options",
    "https://nodejs.org/api/cli.html"
  ]
});
