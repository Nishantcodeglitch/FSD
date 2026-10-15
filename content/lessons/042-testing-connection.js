window.COURSE_LESSONS.push({
  id: "w07-testing-connection",
  file: "042",
  unit: 2,
  week: 7,
  title: "Testing the connection with authenticate()",
  kicker: "Unit II · Week 7 · Lesson 4 of 5",
  minutes: 14,
  objectives: [
    "Use sequelize.authenticate() to open a real connection and verify credentials",
    "Predict the exact console output when MySQL is up and when it is down",
    "Read an ECONNREFUSED error and list the three things it can mean",
    "Explain the difference between authenticate() and sync()"
  ],
  intro: `
    <p>Last lesson your <code>db.js</code> created a Sequelize instance — but recall the warning:
    the constructor only <em>stored</em> your settings. No socket was opened, no password was
    checked. <code>sequelize.authenticate()</code> is the method that does the real thing: it
    dials the server, logs in, and either resolves or throws. This lesson runs the journal's two
    test functions, watches both outcomes, and turns the scariest error of the week
    (<code>ECONNREFUSED</code>) into a three-item checklist.</p>
  `,
  theory: [
    `
      <h3>Connections are lazy</h3>
      <p>Nothing about <code>new Sequelize(...)</code> touches the network — you could run that
      line with XAMPP completely stopped and see no error. The first real I/O happens when you
      call a method, and <code>authenticate()</code> is the purest one: it performs a tiny
      round-trip (MySQL users call it the "ping" query) and returns a <strong>Promise</strong>:</p>
      <ul>
        <li>Server reachable, credentials good → the promise <strong>resolves</strong> (with
        nothing useful — success <em>is</em> the value).</li>
        <li>Server off, wrong port, bad password → the promise <strong>rejects</strong>, and in
        <code>async/await</code> land that means a thrown error you catch.</li>
      </ul>
      <p>Because it is async, the pattern is always the same: <code>await</code> it inside a
      <code>try</code>, print success, and <code>catch</code> the failure. Both journal projects
      wrote this test into their <code>db.js</code> — in two different styles.</p>
    `,
    `
      <h3>The journal's two test styles</h3>
      <p><strong>Lab16/db.js</strong> uses the modern shape: an <code>async</code>
      <code>testConnection()</code> function, <code>try/catch/finally</code>, and the message
      <code>Connection successful!</code>. <strong>proj-2408023/db.js</strong> uses the
      promise-chain shape: <code>sequelize.authenticate().then(...).catch(...)</code> — and, on
      success, goes one step further and calls <code>sequelize.sync()</code>. Worth separating
      those two clearly:</p>
      <ul>
        <li><code>authenticate()</code> = "can I log in?" — touches nothing else.</li>
        <li><code>sync()</code> = "make the database match my models" — it creates any missing
        tables (calling <code>CREATE TABLE IF NOT EXISTS</code> under the hood). That is Week 8
        territory; today just remember: <em>authenticate tests the connection, sync builds the
        schema</em>.</li>
      </ul>
      <p>So if <code>proj-2408023/db.js</code> prints both <code>Database Connected</code> and
      <code>Table created successfully</code>, the first line is the connection test and the
      second is sync having done its job.</p>
    `,
    `
      <h3>Failure: the ECONNREFUSED checklist</h3>
      <p>When the test fails, the error message is doing you a favour — it names the exact host
      and port it tried. Here is the whole decision tree, in order:</p>
      <table>
        <thead><tr><th>Symptom</th><th>Cause</th><th>Fix</th></tr></thead>
        <tbody>
          <tr><td><code>connect ECONNREFUSED 127.0.0.1:3307</code></td><td>nothing listening on
          that port</td><td>start MySQL in XAMPP, or fix the port number</td></tr>
          <tr><td><code>ER_BAD_DB_ERROR: Unknown database</code></td><td>server is up but the
          database does not exist</td><td>create it (Lesson 39's <code>CREATE DATABASE</code>)</td></tr>
          <tr><td><code>ER_ACCESS_DENIED_ERROR</code></td><td>wrong user or password</td><td>check
          them against XAMPP's defaults</td></tr>
        </tbody>
      </table>
      <p>Notice what changes between the rows: the <em>first</em> error is about your machine
      (is anything listening?), the second and third are about your credentials. Reading which
      family you are in turns a vague "database is broken" into a single check. Examples 4 and 5
      run the identical script both ways so you can recognise both by sight.</p>
    `
  ],
  examples: [
    {
      title: "Lab16/db.js: authenticate() with async/await and try/catch",
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
        "<code>await sequelize.authenticate()</code> is the whole test — it resolves if the login worked and throws otherwise.",
        "The success branch prints the journal's own <code>Connection successful!</code>; the catch prints only <code>error.message</code>, which keeps the output to one readable line instead of a stack trace.",
        "<code>console.error</code> writes to stderr — the convention for failures (Unit I, standard streams).",
        "<code>testConnection()</code> is called but not awaited at the top level — fine here: the promise runs, and Node stays alive until it settles because the open socket keeps the event loop busy.",
        "<code>module.exports = sequelize</code> — after the test passes, every other Lab16 script reuses this one connection object."
      ],
      run: "node db.js  (inside Lab16/, MySQL running in XAMPP)",
      output: "Connection successful!"
    },
    {
      title: "proj-2408023/db.js: authenticate() with .then()/.catch() — plus sync()",
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

//model
const student = sequelize.define("Student", {//Student is the name of the table
  name: { type: DataTypes.STRING },
  age: { type: DataTypes.INTEGER },
});

//to test the database connection
sequelize
  .authenticate()

  .then(() => {
    console.log("Database Connected");
    //create a table in Database
    sequelize
      .sync()

      .then(() => {
        console.log("Table created successfully");
      })

      .catch((error) => {
        console.log("Table creation error:", error);
      });
  })

  .catch((error) => {
    console.log(error);
  });
`,
      explain: [
        "The same test in promise clothes: <code>.then</code> is the try, <code>.catch</code> is the catch. Functionally identical to Lab16's async/await version.",
        "<code>sequelize.define(\"Student\", ...)</code> declares a model — the <code>Student</code> table with <code>name</code> and <code>age</code> columns. It is Week 8 material; it appears here because sync needs something to sync.",
        "<code>sequelize.sync()</code> runs only after authenticate succeeds, and creates the <code>Students</code> table if missing — this is <em>not</em> part of testing the connection.",
        "The outer <code>.catch</code> logs the whole error object rather than just <code>error.message</code> — compare with Lab16 and pick the tidier habit (message first, stack when debugging).",
        "The nested then/then/catch chain is exactly the \"pyramid\" that <code>async/await</code> (example 1) was designed to flatten — you have now seen both dialects of the same idea."
      ],
      run: "node db.js  (inside proj-2408023/, MySQL running in XAMPP)",
      output: "Database Connected\nTable created successfully"
    },
    {
      title: "The smallest possible connection test, with the classic message",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("nishant", "root", "", {
  host: "127.0.0.1",
  port: 3307,
  dialect: "mysql",
  logging: false
});

async function check() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

check();
`,
      explain: [
        "This is Sequelize's own documentation example nearly verbatim — <code>Connection has been established successfully.</code> is the sentence you will see in almost every tutorial, so it is worth having typed once.",
        "The failure branch prints <code>error</code> in full: scroll up from <code>message</code> to see <code>original.code</code> (like <code>ECONNREFUSED</code>) and the exact port it dialled.",
        "No <code>module.exports</code> and no model — a throwaway file whose only job is to answer yes/no. Keep one of these in every database project as your first debugging step.",
        "Same database, user, empty password and port as the journal's files — swap in your own port if 3307 is not yours."
      ],
      run: "node check.js",
      output: "Connection has been established successfully."
    },
    {
      title: "Outcome A: MySQL running (XAMPP green)",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# 1. XAMPP Control Panel: press Start next to MySQL (green = listening)
# 2. confirm from the terminal:
mysqladmin -u root ping
# mysqld is alive

# 3. now run the test from example 3:
node check.js
# Connection has been established successfully.
`,
      explain: [
        "Three steps, always in this order: server on → ping it → run your code. The ping isolates \"is the server there?\" from \"is my JavaScript right?\".",
        "The success line means all five connection settings from Lesson 41 were correct: database, user, password, host and port.",
        "Nothing else has happened — no tables, no data. authenticate() is a doorbell, not a renovation."
      ],
      run: "node check.js",
      output: "Connection has been established successfully."
    },
    {
      title: "Outcome B: MySQL stopped — meet ECONNREFUSED",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# 1. press Stop next to MySQL in the XAMPP Control Panel
# 2. run the exact same script:
node check.js

# output:
# Unable to connect to the database:
# ConnectionError: connect ECONNREFUSED 127.0.0.1:3307
#     at ClientHandshake._handlePacket ...
#     at ... {
#   name: 'ConnectionError',
#   parent: Error: connect ECONNREFUSED 127.0.0.1:3307
# }
`,
      explain: [
        "Identical script, one checkbox flipped in XAMPP — this is the error the journal's notes flag as the week's #1 run prerequisite: MySQL was off (ECONNREFUSED), start it first.",
        "<code>ConnectionError</code> + <code>connect ECONNREFUSED 127.0.0.1:3307</code> is the whole story: the TCP dial to that host and port was refused because nothing is listening.",
        "Read the port in the error. If it is not your XAMPP port, that is a Lesson 41 problem — no amount of starting XAMPP will fix a wrong number.",
        "If it <em>is</em> your port: start MySQL and rerun. The script itself needs zero changes — database outages are environmental, not code bugs."
      ],
      run: "node check.js",
      output: "Unable to connect to the database:\nConnectionError: connect ECONNREFUSED 127.0.0.1:3307"
    },
    {
      title: "proj-2408023/config/config.json: what to check when the test fails",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/proj-2408023/config/config.json",
      lang: "json",
      code: `
{
  "development": {
    "username": "root",
    "password": null,
    "database": "nishant",
    "host": "127.0.0.1",
    "port": 3307,
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "port": 3307,
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
        "When authenticate() fails, this file is the checklist: <code>port</code> (is MySQL there?), <code>database</code> (does nishant exist?), <code>username/password</code> (can root log in?).",
        "This project's config agrees with its db.js on 3307 — unlike Lab16, where config says 3306 and db.js says 3307. Knowing which file your code actually reads (Lesson 41) tells you which one to trust.",
        "<code>\"test\": { \"database\": \"database_test\" ... }</code> is a placeholder — if you ever run with NODE_ENV=test, authenticate will fail with ER_BAD_DB_ERROR until you create that database. Errors in the second and third rows of the theory table are waiting right here.",
        "Keep this file next to your terminal while debugging Week 7–9: every connection error maps onto one of its six keys."
      ]
    }
  ],
  keyPoints: [
    "new Sequelize(...) only stores settings; authenticate() is what actually dials the server and verifies the login",
    "authenticate() returns a Promise: it resolves on success (\"Connection has been established successfully.\") and throws on failure",
    "authenticate() tests the connection; sync() creates missing tables from your models — two different jobs the journal's proj-2408023/db.js chains together",
    "ECONNREFUSED means nothing is listening on that port: start MySQL in XAMPP or fix the port — it is an environment problem, not a code bug",
    "ER_BAD_DB_ERROR and ER_ACCESS_DENIED_ERROR are the other two families: they mean the server IS up, so check the database name and credentials"
  ],
  practice: `
    <p>With MySQL running, copy example 3's <code>check.js</code> into the Lab16 folder of the
    journal (or a copy of it), set your own port, and run it until you see
    <code>Connection has been established successfully.</code> Then stop MySQL in XAMPP and run it
    again — find the <code>ECONNREFUSED</code> line and confirm the port inside it. Start MySQL
    back up, rerun to green, and only then continue to the final lesson of the week.</p>
  `,
  quiz: [
    {
      q: "What does sequelize.authenticate() actually do?",
      options: [
        "Opens a real connection to the server and verifies the credentials, returning a Promise",
        "Creates the database if it does not exist",
        "Prints every SQL query to the console",
        "Loads the config.json file into memory"
      ],
      answer: 0,
      why: "It is the real dial-and-login round trip — it touches nothing else. Creating databases is SQL's CREATE DATABASE; creating tables is sync(); printing queries is the logging option."
    },
    {
      q: "Your test prints ConnectionError: connect ECONNREFUSED 127.0.0.1:3307. Which fix is most likely to help?",
      options: [
        "Start MySQL in the XAMPP Control Panel — or, if it is already running, change your code's port to the one XAMPP shows",
        "Add a try/catch around the script",
        "Reinstall sequelize with npm i",
        "Delete the nishant database and recreate it"
      ],
      answer: 0,
      why: "ECONNREFUSED says nothing is listening on that port — an environment problem. try/catch only hides the message, reinstalling changes nothing, and dropping the database cannot help while the server itself is unreachable."
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/getting-started/",
    "https://sequelize.org/api/v6/classes/sequelize#authenticate"
  ]
});
