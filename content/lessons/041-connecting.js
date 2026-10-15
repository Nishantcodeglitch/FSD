window.COURSE_LESSONS.push({
  id: "w07-connecting",
  file: "041",
  unit: 2,
  week: 7,
  title: "Connecting to the database",
  kicker: "Unit II · Week 7 · Lesson 3 of 5",
  minutes: 15,
  objectives: [
    "Construct a Sequelize instance from database name, user, password and options",
    "Explain what the host, port, dialect and logging options each control",
    "Read the journal's two db.js files and explain their different ports honestly",
    "Move credentials out of code into a config file or .env"
  ],
  intro: `
    <p>Lesson 39 gave you a running MySQL server with a <code>nishant</code> database;
    Lesson 40 gave you the ORM packages installed in <code>node_modules</code>. This lesson is
    the handshake between the two: a file that tells Sequelize <em>which</em> database, on
    <em>which</em> machine, behind <em>which</em> port, as <em>which</em> user. The journal
    wrote that file twice — <code>proj-2408023/db.js</code> and <code>Lab16/db.js</code> — and
    they disagree about the port. Reading them side by side is the fastest way to understand
    every option.</p>
  `,
  theory: [
    `
      <h3>The five things a connection needs</h3>
      <p>Before your code can store a single row, the database server needs to know who is
      asking and where to answer:</p>
      <table>
        <thead><tr><th>Piece</th><th>Journal value</th><th>Meaning</th></tr></thead>
        <tbody>
          <tr><td>database</td><td><code>nishant</code></td><td>which database on the server</td></tr>
          <tr><td>username</td><td><code>root</code></td><td>who you are (XAMPP's default admin)</td></tr>
          <tr><td>password</td><td><code>''</code> (empty)</td><td>proof — XAMPP's root ships with none</td></tr>
          <tr><td>host</td><td><code>localhost</code> / <code>127.0.0.1</code></td><td>which machine ("this one")</td></tr>
          <tr><td>port</td><td><code>3307</code></td><td>which door on that machine</td></tr>
        </tbody>
      </table>
      <pre class="diagram">Node script                          MySQL server
db.js ──new Sequelize(...)──▶ TCP connect to 127.0.0.1:3307 ──▶ mysqld
                                   (database: nishant, user: root)</pre>
      <p>Get any one wrong and no query will ever run — so this file is the first thing to
      check when Unit II misbehaves.</p>
    `,
    `
      <h3>Anatomy of new Sequelize(...)</h3>
      <p>The constructor takes the three secrets as plain strings and then an options object:</p>
      <ul>
        <li><code>dialect: 'mysql'</code> — which flavour of SQL to speak. Required; Sequelize
        supports several, the driver must match.</li>
        <li><code>logging: false</code> — when set (or to a function), Sequelize prints every
        SQL query it runs. The journal turns it off for clean output; beginners often turn it
        <em>on</em> to see the SQL their JavaScript generates — a superb learning trick.</li>
        <li><code>host</code> — <code>127.0.0.1</code> and <code>localhost</code> normally mean
        the same machine; on some systems <code>localhost</code> resolves to a Unix socket
        instead of TCP, which is a classic source of "works on my machine".</li>
        <li><code>port</code> — see below.</li>
      </ul>
      <p>Important mental model: <strong>creating the instance does not connect</strong>. The
      constructor just stores your settings; the TCP handshake happens when you call a method
      like <code>authenticate()</code>. Lesson 42 does exactly that.</p>
    `,
    `
      <h3>Two ports, one student: 3306 vs 3307, honestly</h3>
      <p>XAMPP's MySQL listens on <strong>3306</strong> by default — but if any other MySQL or
      MariaDB already owns 3306 (a standalone MySQL install, another dev tool), XAMPP slides to
      <strong>3307</strong>. The journal shows this history in plain text:</p>
      <ul>
        <li><code>Lab16/config/config.json</code> says development runs on <code>3306</code>.</li>
        <li><code>Lab16/db.js</code> says <code>port: 3307</code>.</li>
        <li><code>proj-2408023/db.js</code> and its config both say <code>3307</code>.</li>
      </ul>
      <p>At some point between writing the config and writing the code, the student's MySQL moved
      ports and the hand-written <code>db.js</code> was updated to follow. Neither number is
      "wrong" in the abstract — <strong>the only number that matters is the one your XAMPP
      Control Panel shows beside MySQL when it starts.</strong> On your machine, copy that one.
      (And note both db.js files also use an empty password and the <code>root</code> user —
      fine for a local lab, never for a real server.)</p>
    `,
    `
      <h3>Keeping credentials out of the code</h3>
      <p>Hard-coding <code>'root'</code> and <code>''</code> directly in <code>db.js</code>
      works on a laptop and fails everywhere else: your real server will have a different
      password, and committing secrets to git is how databases end up on the internet. Two
      patterns solve this:</p>
      <ul>
        <li><strong>A config file</strong> — the journal's <code>config/config.json</code>
        already separates credentials from code (and splits them by environment). The CLI reads
        it for you.</li>
        <li><strong><code>.env</code> + dotenv</strong> — the industry-standard pattern: secrets
        live in a <code>.env</code> file that is git-ignored, and your code reads them from
        <code>process.env</code>. Example 5 builds the same <code>db.js</code> this way.</li>
      </ul>
    `
  ],
  examples: [
    {
      title: "Lab16/db.js: the journal's connection file, complete",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/Lab16/db.js",
      lang: "javascript",
      code: `
const { Sequelize } = require('sequelize');

//Connect to the database
const sequelize = new Sequelize('nishant', 'root', '', {
  host: 'localhost',
  port: 3307,
  dialect: 'mysql',
  logging: false
});

//Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection successful!');

  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();

module.exports = sequelize;
`,
      explain: [
        "<code>require('sequelize')</code> returns an object; the ORM's main class is destructured off it — the same <code>const { Sequelize } = require('sequelize')</code> line opens both journal connection files.",
        "The three positional arguments are database <code>'nishant'</code>, user <code>'root'</code>, password <code>''</code> (empty — XAMPP's default), then the options object.",
        "<code>port: 3307</code> — compare the config.json in example 4: on this student's machine XAMPP had moved off the default 3306.",
        "<code>logging: false</code> silences the SQL echo; delete it (or set it to console.log) while learning, to watch every generated query.",
        "The bottom half tests the connection and exports the instance for the CRUD scripts — Lesson 42 dissects the test, Lesson 43 the tidy exit. One file, three lessons."
      ],
      run: "node sorted_files/07_Week-07_Sequelize-MySQL/Lab16/db.js  (after: cd Lab16 && npm i)",
      output: "Connection successful!"
    },
    {
      title: "proj-2408023/db.js: the connection part of the second project's file",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/proj-2408023/db.js",
      lang: "javascript",
      code: `
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  "nishant", //database name
  "root",
  "",
  {
    host: "127.0.0.1",
    port: 3307,
    dialect: "mysql",
    logging: false,
  },
);
`,
      explain: [
        "Shown from the real file (lines 1–13): the rest of proj-2408023/db.js defines a Student model and tests the connection — Weeks 8 and 9 use it.",
        "Same database, user and empty password as Lab16 — but here the constructor is spread across lines with a <code>//database name</code> comment, and the host is the numeric <code>127.0.0.1</code> instead of the string <code>'localhost'</code>.",
        "Functionally identical on most machines: both names point at your own computer. Pick one style and keep it — mixing them mid-project makes port bugs harder to spot.",
        "It also imports <code>DataTypes</code> here because this file defines a model in the same breath; Lab16 keeps models in separate files."
      ]
    },
    {
      title: "Lab16/config/config.json: the same settings, CLI edition",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/Lab16/config/config.json",
      lang: "json",
      code: `
{
  "development": {
    "username": "root",
    "password": null,
    "database": "nishant",
    "host": "127.0.0.1",
    "port": 3306,
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "port": 3306,
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "port": 3307,
    "dialect": "mysql"
  }
}
`,
      explain: [
        "Every key from the options object in example 1 appears here as JSON: <code>username</code>, <code>password</code>, <code>database</code>, <code>host</code>, <code>port</code>, <code>dialect</code>.",
        "<code>\"password\": null</code> is JSON's way of saying empty — Sequelize treats a null password as no password.",
        "<strong>The mismatch in the wild:</strong> development says port <code>3306</code> while this project's db.js says <code>3307</code>. Anything driven by the CLI (Week 8's migrations) would dial 3306; the hand-written scripts dial 3307. One of the two only works — proof that the port must come from <em>your</em> XAMPP, not from copied files.",
        "The <code>test</code> and <code>production</code> blocks still hold placeholder databases (<code>database_test</code>, <code>database_production</code>) that were never created — harmless until something actually runs in those environments."
      ]
    },
    {
      title: "A .env file: secrets out of your code",
      from: "new",
      file: "",
      lang: "text",
      code: `
# .env  (next to db.js - add ".env" to .gitignore so it never reaches GitHub)
DB_NAME=nishant
DB_USER=root
DB_PASS=
DB_HOST=127.0.0.1
DB_PORT=3307
`,
      explain: [
        "<code>.env</code> is a plain file of <code>KEY=value</code> lines — one place to change when the password changes, and one file git ignores so secrets stay on your machine.",
        "The values are the journal's own: database <code>nishant</code>, user <code>root</code>, empty password, port <code>3307</code>.",
        "Empty after <code>=</code> means empty string — the same as the <code>''</code> in Lab16/db.js.",
        "dotenv (next example) reads this file into <code>process.env</code> before the connection is built."
      ]
    },
    {
      title: "db.js rebuilt on process.env — the same connection, portable",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
require("dotenv").config();            // reads .env into process.env
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false
  }
);

console.log("Connecting to", process.env.DB_NAME, "on port", process.env.DB_PORT);
module.exports = sequelize;
`,
      explain: [
        "<code>npm i dotenv</code> once, then <code>require('dotenv').config()</code> as the first line — it loads the .env file into <code>process.env</code> (the same global object you met with <code>process.argv</code> in Unit I).",
        "Compare with example 1 line by line: identical constructor, but every secret is now a lookup instead of a literal — the db.js can be committed to git safely.",
        "<code>DB_PORT</code> arrives from .env as a <em>string</em>; Sequelize accepts it, but if you ever do arithmetic with it, wrap it in <code>Number(...)</code>.",
        "On your machine: copy the port from the XAMPP Control Panel into .env — now changing MySQL's port is a one-line edit, not a code change."
      ],
      run: "node db.js  (with dotenv + sequelize installed and .env beside it)",
      output: "Connecting to nishant on port 3307"
    },
    {
      title: "Reading your real port from XAMPP before you hard-code anything",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# Windows: the XAMPP console prints it when MySQL starts,
# or check with the client that ships in C:\\xampp\\mysql\\bin:
C:\\xampp\\mysql\\bin\\mysql.exe -u root -P 3306 -e "SELECT 1"
# port right? -> +---+
#                | 1 |
#                +---+
# port wrong?  -> ERROR 2003 (HY000): Can't connect to MySQL server on 'localhost' (10061)

# macOS/Linux, after adding /Applications/XAMPP/xamppfiles/bin to PATH:
mysql -u root -P 3307 -e "SELECT 1"
`,
      explain: [
        "<code>-P</code> picks the port explicitly — a 10-second check that beats ten minutes of guessing why db.js fails.",
        "<code>-e \"SELECT 1\"</code> runs one statement and exits: if the table appears, that port is alive and that is the number for your db.js.",
        "The ERROR 2003 message is the CLI form of the ECONNREFUSED from Lesson 39 — wrong door, same meaning.",
        "Do this once per machine, then freeze the number in db.js or .env and stop copying 3306/3307 from anyone else's files — including the journal's."
      ],
      run: "mysql -u root -P 3306 -e \"SELECT 1\""
    }
  ],
  keyPoints: [
    "new Sequelize(database, user, password, options) takes three credentials plus host/port/dialect/logging — nothing connects yet, the constructor only stores settings",
    "The journal's two projects both target database nishant as root with an empty password; Lab16/db.js uses host localhost while proj-2408023/db.js uses 127.0.0.1",
    "The journal's files honestly disagree on the port (config says 3306, db.js says 3307) — copy the port your XAMPP Control Panel actually shows, never one from a stranger's file",
    "logging: false silences the SQL echo; removing it while learning shows you every query Sequelize generates",
    "Credentials belong in config.json or a git-ignored .env read via process.env, not hard-coded in committed code",
    "module.exports = sequelize lets every other script share one connection file"
  ],
  practice: `
    <p>Open <code>sorted_files/07_Week-07_Sequelize-MySQL/Lab16/db.js</code> and put your own
    machine's port in place of <code>3307</code> in a <em>copy</em> of the file (leave the
    journal original untouched). Start MySQL in XAMPP, run
    <code>mysql -u root -P &lt;yourport&gt; -e "SELECT 1"</code> to confirm the number, then
    <code>npm i</code> inside your copy's folder. Optionally rebuild the same file on
    <code>.env</code> + <code>dotenv</code> — if you do, remember to git-ignore
    <code>.env</code>.</p>
  `,
  quiz: [
    {
      q: "What does the options object in new Sequelize('nishant', 'root', '', { ... }) control?",
      options: [
        "Where and how to connect: host, port, dialect, logging — the three strings before it are the database, user and password",
        "Which SQL queries the app will run",
        "The table names inside the database",
        "Nothing — options are optional, defaults always work"
      ],
      answer: 0,
      why: "The three positional arguments are credentials (database, user, password); everything after them — host, port, dialect, logging — is connection behaviour."
    },
    {
      q: "proj-2408023/db.js says port 3307 but Lab16/config/config.json says 3306. What is the right port to use on your machine?",
      options: [
        "Whichever port your XAMPP Control Panel shows MySQL listening on — verify with the mysql client and a quick SELECT 1",
        "3307, because db.js is newer than config.json",
        "3306, because it is the MySQL default",
        "Either, since Sequelize retries every port automatically"
      ],
      answer: 0,
      why: "Ports depend on what else is installed on the machine — that is why the student's own two files disagree. The source of truth is your running server, verified with a quick client command."
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/getting-started/",
    "https://sequelize.org/api/v6/classes/sequelize",
    "https://www.npmjs.com/package/dotenv"
  ]
});
