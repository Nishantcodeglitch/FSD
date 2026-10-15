window.COURSE_LESSONS.push({
  id: "w09-raw-queries",
  file: "052",
  unit: 2,
  week: 9,
  title: "Raw SQL with sequelize.query()",
  kicker: "Unit II · Week 9 · Lesson 4 of 5",
  minutes: 16,
  objectives: [
    "Run a hand-written SELECT with sequelize.query() and unpack its [rows, metadata] result",
    "Explain SQL injection in plain terms and prevent it with the replacements array",
    "Insert and update rows safely with parameterised raw statements",
    "Know when a raw query is justified and when a finder is the better tool"
  ],
  intro: `
    <p>Every lesson so far let Sequelize <em>generate</em> your SQL. But sometimes you want
    the wheel yourself: a JOIN the associations haven't modelled yet, a GROUP BY report, an
    EXISTS clause. That escape hatch is <code>sequelize.query()</code> — and with it comes
    the oldest security bug on the internet, SQL injection, which you must understand before
    you type a single raw string. One honest piece of provenance first: the journal owner's
    own labs contain <em>no</em> raw-query work (the Week 9 folder's
    <code>MISSING.txt</code> says so plainly). The topic is covered by a classmate's backup
    project, <code>FSD_30-by-2408030</code> (roll 2408030), copied into this repo intact —
    we study it as shared reading, exactly as its README instructs, and never as the
    journal owner's own lab.</p>
  `,
  theory: [
    `
      <h3>query() in one minute</h3>
      <p><code>sequelize.query(sql)</code> sends your string to the database verbatim and
      returns a promise. The resolved value is a <strong>two-element array</strong>:</p>
      <pre class="diagram">const [rows, metadata] = await sequelize.query("SELECT * FROM students");
//        │                   └─ for SELECTs: the result rows
//        └─ (confusingly) the first element — for SELECTs it IS the rows</pre>
      <p>The exact order surprises people: for a SELECT, <code>rows</code> comes first and
      <code>metadata</code> (affected-row info) second. That's why the classmate's
      <code>query.js</code> destructures with
      <code>const [students] = await sequelize.query(...)</code> — grab element zero and
      ignore the rest. For INSERT/UPDATE/DELETE you care about the second element.</p>
    `,
    `
      <h3>SQL injection, explained for someone who has never heard of it</h3>
      <p>Databases can't tell <em>code</em> from <em>data</em>. If you build a query by
      pasting a value into the string:</p>
      <pre class="diagram">const course = req.query.course;            // user types:  ' OR '1'='1
"SELECT * FROM students WHERE course = '" + course + "'"
// becomes:
SELECT * FROM students WHERE course = '' OR '1'='1';
//                                     the quote closes early ──┘
// '1'='1' is always true, so... every row matches.</pre>
      <p>One typed-in apostrophe turned a search box into <em>dump the whole table</em>.
      Real attacks do worse — deleting tables, reading passwords. The defence is
      <strong>parameterisation</strong>: you write the SQL with placeholders and hand the
      values over separately, so the driver escapes them and the database treats them as
      pure data, never as syntax:</p>
      <pre class="diagram">sequelize.query("SELECT * FROM students WHERE course = ?", {
  replacements: [course]        // ? is filled in, safely escaped
});</pre>
      <p>You'll meet <code>?</code> (positional) and <code>:name</code> (named) forms.
      Sequelize sends them as a <em>prepared statement</em>, the same mechanism every
      driver-level safety talk boils down to: <strong>never build SQL by string
      concatenation with user input — ever.</strong></p>
    `,
    `
      <h3>When raw is right</h3>
      <p>Finders (<code>findAll</code> and friends) should stay your default — they are
      portable across databases, they return model instances, and they handle escaping.
      Step down to <code>query()</code> when:</p>
      <ul>
        <li>You need SQL a model can't express: complex JOINs, GROUP BY/HAVING reports,
        window functions, EXISTS/NOT EXISTS.</li>
        <li>You're talking to a legacy database with tables no model describes.</li>
        <li>You want bulk DDL or admin statements (<code>CREATE INDEX</code>…).</li>
      </ul>
      <p>And always prefer <code>replacements</code> over concatenation — raw SQL is not a
      licence to skip escaping.</p>
    `
  ],
  examples: [
    {
      title: "query.js: the classmate's raw SELECT — the whole lab",
      from: "journal",
      file: "sorted_files/09_Week-09_Querying/FSD_30-by-2408030/query.js",
      lang: "javascript",
      code: `
const sequelize=require("./db");

async function run(){
    const [students]=await sequelize.query(
        "SELECT * FROM students"
    );

    console.log(students);
}

run();
`,
      explain: [
        "Honest attribution: this file is from the classmate backup project (roll 2408030). The journal owner's MISSING.txt states their own raw-query labs never existed — this is the shared stand-in.",
        "<code>require(\"./db\")</code> gives the raw Sequelize instance (example 2) — <code>query()</code> lives on the connection, not on a model.",
        "<code>const [students] = ...</code> destructures element zero of the [rows, metadata] pair — for a SELECT that's the array of row objects.",
        "Plain <code>\"SELECT * FROM students\"</code> has no placeholders and no user input, so it's safe as written — the danger starts the moment anything dynamic joins the string.",
        "Rows come back as plain objects (snake/camel keys as the table defines them), not model instances — no <code>toJSON()</code> needed, and no instance methods available either.",
        "Like the other scripts in this project, it never closes the connection — Ctrl+C to end the hang."
      ],
      run: "node query.js  (inside sorted_files/09_Week-09_Querying/FSD_30-by-2408030/, after npm i + the student_30 database exists; press Ctrl+C when it hangs)",
      output: `
[
  { id: 1, name: 'Clayton_A', email: 'Clayton@gmail.com', age: 20, course: 'DBMS' },
  { id: 2, name: 'Athena Rodrigues', email: 'athena@gmail.com', age: 24, course: 'CC' },
  { id: 3, name: 'Federer Rodrigues', email: 'federer@gmail.com', age: 45, course: 'OOC' }
]
`
    },
    {
      title: "db.js: the connection module the raw query depends on",
      from: "journal",
      file: "sorted_files/09_Week-09_Querying/FSD_30-by-2408030/db.js",
      lang: "javascript",
      code: `
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('student_30', 'root', "", {
  host: 'localhost',
  dialect: 'mysql',
  logging:false
});

//Test the connection
async function testConnection(){
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
        "query() needs a live connection, and this file is the project's single door to MySQL — database <code>student_30</code> (the classmate's), user root, empty password, port defaulted to 3306.",
        "<code>logging: false</code> hides the SQL echo; for raw-query learning, flip it to <code>console.log</code> and watch your exact string reach MySQL.",
        "Note the table-name detail: this model names itself <code>Student</code> (Sequelize would pluralise to <code>Students</code>), yet query.js types <code>students</code> lowercase — Windows MySQL treats table names case-insensitively, which is why both work here. On a case-sensitive Linux server, that luck runs out.",
        "The connection test prints first every run — 'Connection successful!' is your green light before any query, raw or generated."
      ],
      run: "node db.js  (inside FSD_30-by-2408030/)",
      output: "Connection successful!"
    },
    {
      title: "models/student.js: the schema your SELECT comes back with",
      from: "journal",
      file: "sorted_files/09_Week-09_Querying/FSD_30-by-2408030/models/student.js",
      lang: "javascript",
      code: `
const Student = sequelize.define('Student', {
name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique:false,
},
email:{
type: DataTypes.STRING,
allowNull: false,
unique: true,
},
age: {
type: DataTypes.INTEGER,
},
course:{
    type: DataTypes.STRING,
    allowNull: false,
    unique:false,
    },
},{
    timestamps: false
});
`,
      explain: [
        "Excerpt of the real model (full file in Lesson 51) — it defines exactly the five columns a raw <code>SELECT *</code> returns: id, name, email, age, course.",
        "<code>timestamps: false</code> matters for raw queries: no createdAt/updatedAt columns exist, so your hand-written SELECTs don't need to expect them.",
        "Compare paths: <code>Student.findAll()</code> and <code>sequelize.query(\"SELECT * FROM students\")</code> return the same data — one as instances, one as plain objects. Knowing both routes is the point of this lesson."
      ],
      run: "n/a — a model definition, required by the scripts around it"
    },
    {
      title: "Safe raw SELECT with replacements: search a course",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const sequelize = require("./db");

async function run() {
  const course = "CC";
  const [rows] = await sequelize.query(
    "SELECT id, name, course FROM students WHERE course = :c",
    { replacements: { c: course } }
  );

  rows.forEach(r => console.log(r.id, r.name, "-", r.course));
  await sequelize.close();
}

run();
`,
      explain: [
        "<code>:c</code> is a named placeholder; <code>replacements: { c: course }</code> supplies its value — the driver escapes it and MySQL receives it strictly as data.",
        "Destructure with <code>const [rows] = ...</code> as the journal's query.js does — element zero of the [rows, metadata] pair.",
        "Named replacements let you reuse one value in several spots (<code>:c ... WHERE x = :c</code>) without counting question marks.",
        "Try <code>course = \"CC' OR '1'='1\"</code>: with replacements it's just a weird course name that matches nothing — the injection is neutralised. Without them (next example) it would empty the table's privacy."
      ],
      run: "node search.js  (a new file inside FSD_30-by-2408030/)",
      output: "2 Athena Rodrigues - CC"
    },
    {
      title: "Spot the vulnerability: concatenation vs replacements",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const sequelize = require("./db");

async function run() {
  const evil = "CC' OR '1'='1";

  const [bad] = await sequelize.query(
    "SELECT * FROM students WHERE course = '" + evil + "'"
  );
  console.log("concatenation returned", bad.length, "rows");

  const [good] = await sequelize.query(
    "SELECT * FROM students WHERE course = ?",
    { replacements: [evil] }
  );
  console.log("replacements returned", good.length, "rows");

  await sequelize.close();
}

run();
`,
      explain: [
        "The concatenated string becomes <code>WHERE course = 'CC' OR '1'='1'</code> — the quote closed early, the OR is always true, so every row leaks. That's SQL injection in six words: data became syntax.",
        "The second query uses <code>?</code> with <code>replacements: [evil]</code> — positional placeholder, value escaped, treated as one literal string. The database looks for a course literally named <code>CC' OR '1'='1</code> and finds nobody.",
        "Same variable, same database, opposite outcome — the only difference is <em>how</em> the value reached the SQL.",
        "Note the safe version returns 0 rows, not an error: the injection didn't crash anything, it silently widened the query. Silent widening is what makes this bug so dangerous in production."
      ],
      run: "node injection-demo.js  (a new file inside FSD_30-by-2408030/)",
      output: `
concatenation returned 3 rows
replacements returned 0 rows
`
    },
    {
      title: "Raw INSERT with replacements — write with query() too",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const sequelize = require("./db");

async function run() {
  const [result] = await sequelize.query(
    "INSERT INTO students (name, email, age, course) VALUES (:n, :e, :a, :c)",
    {
      replacements: {
        n: "Ishaan",
        e: "ishaan@gmail.com",
        a: 22,
        c: "DBMS"
      }
    }
  );
  console.log("Inserted row id:", result.insertId);

  const [count] = await sequelize.query(
    "SELECT COUNT(*) AS total FROM students"
  );
  console.log("Students now:", count[0].total);

  await sequelize.close();
}

run();
`,
      explain: [
        "For an INSERT the destructured first element is the driver's result object — <code>insertId</code> is MySQL's gift of the new auto-increment key, exactly what you'd need to redirect to the new record.",
        "Every value still goes through <code>replacements</code>, even in an INSERT — escaping is not only a SELECT concern; names with apostrophes (\"O'Brien\") break naive concatenation on writes too.",
        "The follow-up COUNT query shows raw SQL's reporting strength — <code>SELECT COUNT(*) AS total</code>, read back as <code>count[0].total</code>.",
        "Compare with Lesson 48's <code>Student.create({...})</code>: fewer characters, an instance back, validations for free. That's why finders stay the default and raw stays the escape hatch."
      ],
      run: "node raw-insert.js  (a new file inside FSD_30-by-2408030/)",
      output: `
Inserted row id: 5
Students now: 5
`
    }
  ],
  keyPoints: [
    "sequelize.query(sql) runs hand-written SQL; for SELECTs, destructuring const [rows] = await query(...) gives you the plain-object rows",
    "The journal owner's own labs never contained raw queries (their MISSING.txt admits it) — the runnable example is classmate roll 2408030's backup project, studied as shared reading",
    "SQL injection = letting user data become SQL syntax (' OR '1'='1' turns a filter into 'return everything')",
    "Prevent it with replacements — ? positional or :name named placeholders — never string concatenation with user input",
    "Raw queries return plain objects, not model instances: no validations, no toJSON, no hooks — you own everything",
    "Finders remain the default; reach for query() only for JOINs/GROUP BY/legacy tables, and parameterise every value"
  ],
  practice: `
    <p>Inside <code>FSD_30-by-2408030/</code>, write
    <code>report.js</code> that runs a raw GROUP BY:
    <code>SELECT course, COUNT(*) AS n FROM students GROUP BY course</code> with
    <code>replacements</code>-free static SQL, prints each row, then runs a second query
    filtered by <code>:course</code> through the replacements object for whichever course
    the first row reported. Finish with <code>await sequelize.close()</code> so the process
    exits — the one habit this classmate project forgot.</p>
  `,
  quiz: [
    {
      q: "Why is sequelize.query(\"SELECT * FROM students WHERE course = '\" + req.query.course + \"'\") dangerous?",
      options: [
        "A user can type a quote to break out of the string and change the query's logic (SQL injection) — use replacements instead",
        "It is slower than a finder because raw SQL skips the query cache",
        "sequelize.query cannot run SELECT statements, only INSERT/UPDATE/DELETE",
        "It prints the password in the logs"
      ],
      answer: 0,
      why: "Concatenating user input lets it become SQL syntax — ' OR '1'='1' makes the WHERE clause always-true and dumps the table. The replacements array (or ?/:name placeholders) keeps values as escaped data."
    },
    {
      q: "What does const [rows] = await sequelize.query(\"SELECT ...\") give you?",
      options: [
        "The first element of the [rows, metadata] pair — an array of plain row objects (not model instances)",
        "An array of Sequelize model instances you can call toJSON() on",
        "Just the number of affected rows",
        "A single row, already unwrapped"
      ],
      answer: 0,
      why: "query() resolves to a two-element array; for SELECTs the first element is the rows as plain objects. The journal's query.js destructures exactly this way. Model instances — and their methods — only come from finders."
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/core-concepts/raw-queries/",
    "https://owasp.org/www-community/attacks/SQL_Injection"
  ]
});
