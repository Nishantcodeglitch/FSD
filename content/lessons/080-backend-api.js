window.COURSE_LESSONS.push({
  id: "w15-backend-api",
  file: "080",
  unit: 4,
  week: 15,
  title: "The back end: a REST API with http + mysql2",
  kicker: "Unit IV · Week 15 · Lesson 2 of 7",
  minutes: 20,
  objectives: [
    "Read server.js top to bottom and name each of its five layers",
    "Explain what the mysql2 pool does and what the startup check prints when MySQL is off",
    "Write every query with ? placeholders and explain the SQL injection attack they prevent",
    "Choose 400, 404 or 500 for each failure path and know which ones the UI turns into an alert"
  ],
  intro: `
    <p>Lesson 079 drew the whole pipeline: browser → Vite proxy → Node API → MySQL. This
    chapter opens the middle box — <code>otaku/server/server.js</code>, 148 lines with
    <strong>no Express</strong>, built from Node's built-in <code>http</code> module plus the
    single npm dependency <code>mysql2</code>. Because the file is long we read it in
    well-chosen excerpts, with its two small helper functions shown complete on their own. By
    the end you will be able to narrate every line of it — and next chapter we follow its
    queries into the database it talks to.</p>
  `,
  theory: [
    `
      <h3>Five layers in one file</h3>
      <p>There is no routing framework and no directory of controllers here. The whole back end
      is a stack of five layers, in this order:</p>
      <ol>
        <li><strong>Requires and config (lines 1–8)</strong> — <code>http</code> from Node,
        <code>mysql2</code> from npm, then five constants: host, user, password, database,
        port.</li>
        <li><strong>The connection pool and startup check (10–27)</strong> — how the app talks
        to MySQL, and the two log lines that tell you whether it can.</li>
        <li><strong>Two helpers (29–48)</strong> — <code>send()</code> writes every response,
        <code>readBody()</code> reads every request body.</li>
        <li><strong>The request handler (50–144)</strong> — parse the URL, then an
        <code>if</code>-chain matching five (path, method) combinations, with a 404 fallthrough.</li>
        <li><strong><code>server.listen(5000)</code> (146–148)</strong> — open the door and
        announce it.</li>
      </ol>
      <p>If you can point to which layer a bug lives in, you have already fixed half of it.</p>
    `,
    `
      <h3>Node's http module: you are the router</h3>
      <p><code>http.createServer(callback)</code> hands your function two objects on every
      incoming request: <code>req</code> (the request — it has <code>method</code>,
      <code>url</code>, headers, and delivers the body as a stream) and <code>res</code> (the
      response — a writable stream you write the status line, headers and body into). The server
      never guesses: you decide what a request means.</p>
      <p>The first two lines of the callback do the deciding:</p>
      <pre class="diagram">const u = new URL(req.url, 'http://localhost');
const path = u.pathname;          // '/api/locations/3'
const method = req.method;        // 'GET' | 'POST' | 'PUT' | 'DELETE'</pre>
      <p><code>new URL()</code> needs a second argument because <code>req.url</code> is relative
      (<code>/api/locations?search=Tokyo</code>) and a base URL is required to parse a relative
      one — the base is a dummy here, its value never matters. From there it is plain string
      matching: <code>path === '/api/locations' && method === 'GET'</code>, and each branch ends
      with <code>return;</code> so exactly one route answers. Anything unmatched reaches the last
      line: <code>send(res, 404, { message: 'Not found' })</code> — an unknown URL is simply
      another 404.</p>
    `,
    `
      <h3>The pool, and the two-line health check</h3>
      <p><code>mysql.createPool(...)</code> opens <em>up to 10 reusable connections</em>
      (<code>connectionLimit: 10</code>) instead of one long-lived socket.
      <code>waitForConnections: true</code> queues queries when all ten are busy rather than
      failing them. The payoff is resilience: if a connection drops (the classic
      <code>ECONNRESET</code>), the next query simply borrows a healthy one and the process
      survives — with a single connection, that drop could take your server down.</p>
      <p>Right after the pool, the file borrows one connection purely to <em>say hello</em>:</p>
      <ul>
        <li>success → <code>MySQL connected</code>, then <code>c.release()</code> returns the
        connection to the pool (borrowing one and never giving it back is a classic leak).</li>
        <li>failure → <code>MySQL not connected. Start MySQL and run database.sql</code> plus
        the real <code>err.message</code> — usually the connection refused error you get when
        XAMPP's MySQL is not running.</li>
      </ul>
      <div class="note"><p><strong>Honest detail:</strong> that message names
      <code>database.sql</code>, and <code>FUNCTIONALITIES.txt</code> also describes a
      <code>server/database.sql</code> — but no such file ships in the repo. The dump that
      actually exists is <code>otaku/otaku_travel.sql</code>, and the log line is a leftover
      name. Same schema, wrong filename — Lesson 081 loads it for real.</p></div>
    `,
    `
      <h3>send() and readBody(): the only two doors</h3>
      <p>Every byte the client receives comes out of <code>send(res, code, data)</code>: set the
      status code, declare <code>Content-Type: application/json</code>, then
      <code>JSON.stringify(data)</code> into the body. Three lines, used by all five routes —
      that is why every success <em>and</em> every error in this API is JSON.</p>
      <p><code>readBody(req, done)</code> is the mirror image, and it exists because a request
      body arrives in <strong>chunks</strong>: <code>req</code> is a stream, so the callback
      subscribes to <code>'data'</code>, concatenating each <code>part</code> into a string, and
      to <code>'end'</code>, which fires once the client has finished sending. Then:</p>
      <ul>
        <li>empty text (a GET-style request with no body) → <code>done({})</code> immediately;</li>
        <li>otherwise <code>JSON.parse(text)</code> inside <code>try/catch</code> — malformed
        JSON degrades to an empty object, which the route's field validation then rejects with
        400 rather than crashing the process.</li>
      </ul>
      <p>Both functions are complete in Example 2, and both are worth typing out by hand — they
      are the smallest possible "framework" and they explain what Express does for you.</p>
    `,
    `
      <h3>Parameterised queries: the ? that saves you</h3>
      <p>Every query in the file puts <code>?</code> in the SQL text and the values in a separate
      array: <code>db.query(sql, [id], callback)</code>. The driver sends those two parts to
      MySQL <em>separately</em>, so the database always treats the values as data — never as
      SQL.</p>
      <div class="warn"><p><strong>Why never concatenate SQL — the beginner version.</strong>
      Suppose search is built the lazy way:
      <code>'SELECT * FROM locations WHERE city = "' + search + '"'</code>. A visitor who types
      <code>x" OR "1"="1</code> does not search for that phrase — they close your quote and add
      a condition that is always true, so the query now means "return every row". Change the
      payload to <code>"; DELETE FROM locations; --</code> and you are handing a stranger the
      keyboard to your table. This is <strong>SQL injection</strong>, and it has topped the web
      security risk lists for over a decade, because the mistake is invisible: the code looks
      fine, the attack simply re-reads as different SQL. With <code>?</code> placeholders the
      statement text never changes — <code>OR "1"="1</code> arrives as a literal string to
      compare against a column, and matches nothing. The rule for the rest of your career:
      <strong>values go in the array, never into the string.</strong></p></div>
      <p>Note that JavaScript still builds the <em>wildcards</em> for the search route
      (<code>'%' + search + '%'</code>) — that is fine: <code>%</code> shapes the pattern, the
      user's text still travels as a bound value.</p>
    `,
    `
      <h3>Which status for which failure</h3>
      <p>The route code is an exercise in choosing honest answers. Read this table next to
      Examples 3 and 4:</p>
      <table>
        <thead><tr><th>Situation</th><th>Code</th><th>Body</th></tr></thead>
        <tbody>
          <tr><td>list / update / delete succeeded</td><td><code>200</code></td><td>rows, or <code>{ message: ... }</code></td></tr>
          <tr><td>POST inserted a row</td><td><code>201</code></td><td><code>{ id: result.insertId, message: 'Location added' }</code></td></tr>
          <tr><td>POST/PUT missing one of the 4 required fields</td><td><code>400</code></td><td><code>{ message: 'Please fill all required fields' }</code></td></tr>
          <tr><td>GET/PUT/DELETE with an id that matches no row</td><td><code>404</code></td><td><code>{ message: 'Location not found' }</code></td></tr>
          <tr><td>unknown path or method</td><td><code>404</code></td><td><code>{ message: 'Not found' }</code></td></tr>
          <tr><td>MySQL answered with an error</td><td><code>500</code></td><td><code>{ message: 'Database error' }</code></td></tr>
        </tbody>
      </table>
      <p>Two details worth stealing: a PUT or DELETE checks <code>result.affectedRows ===
      0</code> — "the query worked, it just matched nothing" — to tell 404 from 500; and the 400
      check runs <em>before</em> any SQL is built, so bad input never reaches the database.</p>
    `
  ],
  examples: [
    {
      title: "server.js head: config, pool and the startup health check",
      from: "journal",
      file: "otaku/server/server.js",
      lang: "javascript",
      code: `
const http = require('http');
const mysql = require('mysql2');

const DB_HOST = 'localhost';
const DB_USER = 'root';
const DB_PASSWORD = '';
const DB_NAME = 'otaku_travel';
const PORT = 5000;

const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

db.getConnection((err, c) => {
  if (err) {
    console.log('MySQL not connected. Start MySQL and run database.sql');
    console.log(err.message);
  } else {
    console.log('MySQL connected');
    c.release();
  }
});
`,
      explain: [
        "<code>require('http')</code> needs no install — it ships with Node; <code>require('mysql2')</code> is the folder <code>npm i mysql2</code> put in <code>server/node_modules</code>.",
        "<code>DB_PASSWORD = ''</code> matches XAMPP's default root account; if your MySQL has a password, this one line is the only thing to change.",
        "<code>createPool</code> returns immediately with a pool object — no connection is opened yet, which is why the explicit <code>db.getConnection</code> check below exists.",
        "<code>c.release()</code> hands the test connection back; the failure branch deliberately keeps the process alive so the API can still answer 500s while you fix MySQL."
      ],
      run: "cd otaku/server && node server.js",
      output: "MySQL connected\nServer running on http://localhost:5000"
    },
    {
      title: "send() and readBody(), the complete helpers",
      from: "journal",
      file: "otaku/server/server.js",
      lang: "javascript",
      code: `
function send(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req, done) {
  let text = '';
  req.on('data', (part) => { text = text + part; });
  req.on('end', () => {
    if (text === '') {
      done({});
    } else {
      try {
        done(JSON.parse(text));
      } catch (e) {
        done({});
      }
    }
  });
}
`,
      explain: [
        "<code>send</code> sets the status code and the JSON content type in one <code>writeHead</code>, then closes the response with the stringified body — every route calls it, so every reply is JSON.",
        "<code>readBody</code> treats <code>req</code> as the stream it is: <code>'data'</code> fires per chunk and concatenates, <code>'end'</code> fires when the client is done.",
        "The empty-body shortcut (<code>done({})</code>) means a GET with no body never runs <code>JSON.parse</code> on an empty string, which would throw.",
        "The <code>try/catch</code> turns malformed JSON into an empty object — the route's required-field check then answers 400 instead of the process dying on a bad request."
      ],
      run: "node server.js  (the helpers are exercised by any POST/PUT below)"
    },
    {
      title: "The read route: URL parsing, search, and 200 vs 500",
      from: "journal",
      file: "otaku/server/server.js",
      lang: "javascript",
      code: `
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const path = u.pathname;
  const method = req.method;

  if (path === '/api/locations' && method === 'GET') {
    const search = u.searchParams.get('search');
    let sql = 'SELECT * FROM locations ORDER BY id DESC';
    let p = [];
    if (search) {
      sql = 'SELECT * FROM locations WHERE anime_name LIKE ? OR location_name LIKE ? OR city LIKE ? OR country LIKE ? ORDER BY id DESC';
      const like = '%' + search + '%';
      p = [like, like, like, like];
    }
    db.query(sql, p, (err, rows) => {
      if (err) {
        send(res, 500, { message: 'Database error' });
      } else {
        send(res, 200, rows);
      }
    });
    return;
  }
`,
      explain: [
        "<code>new URL(req.url, 'http://localhost')</code> splits the request into <code>pathname</code> (which route) and query parameters (which data) — <code>u.searchParams.get('search')</code> reads <code>?search=Tokyo</code> for you, decoding it too.",
        "Without a search term the route runs a plain <code>SELECT ... ORDER BY id DESC</code>, so the newest row is always first — the same order the React cards use.",
        "With a search term the SQL text is <em>swapped</em>, not concatenated: both variants are complete literal statements, and the four <code>?</code> get four copies of <code>%term%</code> from the array <code>p</code>.",
        "The callback is the 200/500 fork: <code>err</code> non-null means MySQL failed (bad table name, server down mid-request) and the client gets a clean 500 instead of a hang.",
        "The trailing <code>return;</code> stops the handler here — without it, execution would fall into the next route's <code>if</code>."
      ],
      run: "curl \"http://localhost:5000/api/locations?search=Tokyo\"",
      output: "[{\"id\":5,...},{\"id\":4,...},{\"id\":3,...}]  (200 OK, newest first)"
    },
    {
      title: "The write route: validation, INSERT, and the 201 answer",
      from: "journal",
      file: "otaku/server/server.js",
      lang: "javascript",
      code: `
  if (path === '/api/locations' && method === 'POST') {
    readBody(req, (b) => {
      if (!b.anime_name || !b.location_name || !b.city || !b.country) {
        send(res, 400, { message: 'Please fill all required fields' });
        return;
      }
      const sql = 'INSERT INTO locations (anime_name, location_name, city, country, description, image_url) VALUES (?, ?, ?, ?, ?, ?)';
      const p = [b.anime_name, b.location_name, b.city, b.country, b.description || '', b.image_url || ''];
      db.query(sql, p, (err, result) => {
        if (err) {
          send(res, 500, { message: 'Database error' });
        } else {
          send(res, 201, { id: result.insertId, message: 'Location added' });
        }
      });
    });
    return;
  }
`,
      explain: [
        "<code>readBody</code> runs first — until <code>'end'</code> fires there is no object to validate, so every body-handling route is wrapped inside its callback.",
        "The <code>!b.field</code> test rejects missing, empty or falsy values with 400 <em>before</em> any SQL exists — bad data never reaches MySQL.",
        "<code>b.description || ''</code> defaults the two optional columns to the empty string so the INSERT always supplies six values for six placeholders.",
        "<code>result.insertId</code> is MySQL telling you the id it just auto-assigned; returning it in the 201 body is what lets a client know the new row's identity immediately.",
        "Note the shape difference: 201 carries <code>id</code>, 400 carries only <code>message</code> — the front end only needs <code>message</code> for its alert."
      ],
      run: "curl -X POST http://localhost:5000/api/locations -H \"Content-Type: application/json\" -d '{\"anime_name\":\"Your Name\",\"location_name\":\"Suga Shrine\",\"city\":\"Tokyo\",\"country\":\"Japan\"}'",
      output: "{\"id\":6,\"message\":\"Location added\"}"
    },
    {
      title: "server/package.json: the back end's entire manifest",
      from: "journal",
      file: "otaku/server/package.json",
      lang: "json",
      code: `
{
  "name": "otaku-travel-map-server",
  "version": "1.0.0",
  "description": "Backend for Otaku Travel Map - only Node http + MySQL",
  "main": "server.js",
  "type": "commonjs",
  "scripts": {
    "start": "node server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "mysql2": "^3.9.7"
  }
}
`,
      explain: [
        "One dependency in the whole back end: <code>mysql2</code>. The <code>^3.9.7</code> caret means \"any 3.x at least 3.9.7\" when you run <code>npm i</code>.",
        "<code>\"type\": \"commonjs\"</code> is why server.js may use <code>require</code> — the frontend package.json says <code>\"module\"</code> and uses <code>import</code>. Same language, two module systems (Lesson 016).",
        "<code>\"main\": \"server.js\"</code> names the entry file; <code>\"scripts\": { \"start\": \"node server.js\" }</code> lets anyone run it with <code>npm start</code> without knowing the filename.",
        "Two package.json files exist on purpose: the API has its own folder (and its own <code>node_modules</code>) so its dependencies never mix with React's."
      ],
      run: "cd otaku/server && npm start",
      output: "MySQL connected\nServer running on http://localhost:5000"
    },
    {
      title: "Spot the bug: string-built SQL vs ? placeholders",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// Two ways to build the same search query. Only one is safe.
const search = 'x" OR "1"="1';

// BROKEN: the visitor's text becomes part of the SQL statement itself
const broken = 'SELECT * FROM locations WHERE city = "' + search + '"';
console.log('string-built  :', broken);

// SAFE: the statement text is fixed; the value travels separately
const safe = 'SELECT * FROM locations WHERE city = ?';
console.log('parameterised :', safe);
console.log('value stays data:', [search]);
`,
      explain: [
        "Run it and read line by line: the broken query now ends in <code>\"x\" OR \"1\"=\"1\"</code> — a condition that is always true, so MySQL would return every row instead of matching a city.",
        "This is SQL injection in its smallest form: no password cracked, no file touched — the code simply read the visitor's text as instructions.",
        "The parameterised version's text is unchanged no matter what <code>search</code> contains; mysql2 delivers the value through a separate channel and MySQL compares it literally.",
        "server.js uses the safe form in all five routes — the pattern to copy is <code>db.query(sql, [a, b], cb)</code>, with one array entry per <code>?</code>, in order."
      ],
      run: "node sql-injection-demo.js",
      output: "string-built  : SELECT * FROM locations WHERE city = \"x\" OR \"1\"=\"1\"\nparameterised : SELECT * FROM locations WHERE city = ?\nvalue stays data: [ 'x\" OR \"1\"=\"1' ]"
    },
    {
      title: "Where the route data comes from: new URL() picked apart",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// The exact expression server.js uses on line 51, with real request URLs.
const one = new URL('/api/locations/3?search=Tokyo', 'http://localhost');
console.log('pathname   :', one.pathname);
console.log('segments   :', one.pathname.split('/'));
console.log('id         :', one.pathname.split('/')[3]);
console.log('?search=   :', one.searchParams.get('search'));

const list = new URL('/api/locations?search=Kamakura', 'http://localhost');
console.log('list id    :', list.pathname.split('/')[3]);
console.log('list search:', list.searchParams.get('search'));
`,
      explain: [
        "<code>pathname</code> is the path only — the query string is split off, so route matching compares clean strings like <code>/api/locations/3</code>.",
        "<code>split('/')</code> gives <code>['', 'api', 'locations', '3']</code>; index 3 is the id, which is exactly how PUT and DELETE dig out <code>path.split('/')[3]</code>.",
        "<code>searchParams.get('search')</code> handles URL-encoding for you: <code>?search=Kamakura%20High</code> arrives already decoded.",
        "On the list URL the id slot prints <code>undefined</code> — there is no fourth segment. That is why the list route and the by-id route need separate <code>if</code> checks."
      ],
      run: "node url-demo.js",
      output: "pathname   : /api/locations/3\nsegments   : [ '', 'api', 'locations', '3' ]\nid         : 3\n?search=   : Tokyo\nlist id    : undefined\nlist search: Kamakura"
    }
  ],
  keyPoints: [
    "server.js has no framework: http.createServer plus an if-chain on (pathname, method) is the entire router, ending in a 404 fallthrough",
    "The mysql2 pool keeps up to 10 reusable connections, and the startup check prints either 'MySQL connected' or the literal error message",
    "send(res, code, data) writes every JSON response; readBody(req, cb) glues the request's chunks and JSON.parse()s them, defaulting to {}",
    "Never build SQL by string concatenation — ? placeholders keep user input data instead of code, which is what stops SQL injection",
    "400 = incomplete input, 404 = no such row or route, 500 = the database failed; only 200/201 are success, and 201 carries the new insertId",
    "Validation runs before any SQL is built, and affectedRows === 0 is how PUT/DELETE distinguish 404 from 500"
  ],
  practice: `
    <p>With MySQL running, start the API (<code>cd otaku/server &amp;&amp; node server.js</code>)
    and drive it from a second terminal: a plain
    <code>curl http://localhost:5000/api/locations</code> (200, five objects), then a POST
    missing <code>city</code> (400), then <code>curl http://localhost:5000/api/locations/9999</code>
    (404). Now stop MySQL in XAMPP, restart the server, and read the two console lines it prints
    — that exact output is your first entry in the troubleshooting table of Lesson 084.</p>
  `,
  quiz: [
    {
      q: "Why is the query written as db.query('SELECT * FROM locations WHERE id = ?', [id], cb) instead of 'WHERE id = ' + id?",
      options: [
        "Because ? is a placeholder: MySQL receives the value through a separate channel and can never read it as SQL — concatenation lets input like x\" OR \"1\"=\"1 change the query",
        "Because placeholders make the query run faster than string concatenation",
        "Because concatenation only works with numbers, and ids can be strings",
        "Because mysql2 refuses to accept a string as the second argument"
      ],
      answer: 0,
      why: "The safety is structural, not cosmetic: the statement text is fixed and the value is bound separately, so quotes, OR clauses and semicolons inside the input stay literal data. That is the defence against SQL injection."
    },
    {
      q: "A POST reaches the server with only anime_name set. What is the correct response?",
      options: [
        "400 with { message: 'Please fill all required fields' }, sent before any SQL runs",
        "201 with the new insertId, because a partial row is better than none",
        "500, because the INSERT would have failed anyway",
        "404, because the resource does not exist yet"
      ],
      answer: 0,
      why: "Three required fields are missing, so the guard clause answers 400 Bad Request immediately and returns — the database is never involved. 500 is reserved for MySQL's own failures, 404 for ids that match no row."
    }
  ],
  sources: [
    "https://nodejs.org/api/http.html",
    "https://www.npmjs.com/package/mysql2",
    "https://owasp.org/www-community/attacks/SQL_Injection",
    "https://dev.mysql.com/doc/refman/8.0/en/sql-injection.html"
  ]
});
