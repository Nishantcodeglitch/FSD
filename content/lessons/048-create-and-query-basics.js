window.COURSE_LESSONS.push({
  id: "w08-create-and-query-basics",
  file: "048",
  unit: 2,
  week: 8,
  title: "Model querying basics: create()",
  kicker: "Unit II · Week 8 · Lesson 5 of 5",
  minutes: 17,
  objectives: [
    "Describe the four steps Model.create() performs and what it resolves to",
    "Turn on SQL logging and read the INSERT statement Sequelize generates",
    "Explain what bind parameters (? placeholders) are and why they protect you",
    "Run the journal's three insert scripts and diagnose their failures"
  ],
  intro: `
    <p>Three lessons of preparation end here. You have a connection (Week 7), a model that
    describes the table (Lessons 44–45) and a database whose structure was built by recorded,
    reversible migrations (Lessons 46–47). Now the payoff: one line of JavaScript that inserts a
    row — <code>Model.create()</code> — and the honest work of making the journal's own
    <code>create.js</code> scripts run on your machine.</p>
    <p>We will not take the line on faith. Every INSERT in this lesson is shown next to the SQL
    Sequelize really generated, captured with the same Sequelize 6.37.8 that the journal's
    <code>package.json</code> installs, so by the end the ORM should feel like a transparent
    layer rather than a magic trick.</p>
  `,
  theory: [
    `
      <h3>create(): build, validate, save, INSERT</h3>
      <p><code>User.create(values)</code> is asynchronous — it returns a <em>promise</em> that
      resolves to the model instance, the same object you passed in, but finished: the database
      assigned its <code>id</code>, timestamps are stamped, and the row exists. Under the hood
      it runs four steps in order:</p>
      <ol>
        <li><strong>build</strong> — turn the plain object into an instance (unknown keys are
        dropped here — the <code>emial</code> bug of Lesson 45).</li>
        <li><strong>validate</strong> — run every <code>validate</code> rule from the model.
        Fail here and no SQL is ever built.</li>
        <li><strong>save</strong> — assemble an <code>INSERT</code> statement and send it through
        the mysql2 driver.</li>
        <li><strong>set the result</strong> — copy the auto-increment id (and, unless you
        switched them off, <code>createdAt</code>/<code>updatedAt</code>) back onto the
        instance.</li>
      </ol>
      <p>Because step 2 happens first, a bad value throws <code>SequelizeValidationError</code>
      before the table is touched — and because step 3 is a database write, everything after it
      can still fail (server off, table missing, duplicate key). Both belong in a
      <code>try</code>/<code>catch</code>, as Lab16's script shows.</p>
    `,
    `
      <h3>The SQL you are not writing</h3>
      <p>The journal's <code>db.js</code> files pass <code>logging: false</code>, so all this
      happens silently. Set <code>logging: console.log</code> (and the extra option
      <code>logQueryParameters: true</code>) and Sequelize prints every statement it runs —
      captured here against Lab16's model:</p>
      <pre>Executing (default): INSERT INTO \`Users\` (\`id\`,\`username\`,\`email\`,\`password\`,\`age\`) VALUES (DEFAULT,?,?,?,?); ["Nishant","nishant@gmail.com","heloow@123",20]</pre>
      <p>Read it carefully, because it explains three things at once:</p>
      <ul>
        <li><code>Users</code> — the pluralised, capitalised table name from Lesson 44, quoted
        with backticks because MySQL reserves some words.</li>
        <li><code>(\`id\`, ...)</code> with <code>DEFAULT</code> for the id: the model lets the
        database choose the primary key.</li>
        <li><strong><code>?</code> placeholders</strong>: the values are <em>not</em> pasted into
        the string. They are sent to MySQL separately, as <strong>bind parameters</strong> (the
        list in square brackets is what <code>logQueryParameters</code> appends). This is what
        makes SQL injection impossible through these queries — a value like
        <code>O'Brien</code> or <code>'; DROP TABLE Users; --</code> can never become SQL,
        because it is never part of the statement text.</li>
      </ul>
    `,
    `
      <h3>Errors, closes and exits</h3>
      <p>A script that talks to a database has three failure families, and the journal's scripts
      handle them in the right order:</p>
      <ul>
        <li><strong>Validation errors</strong> — your own rules said no. Message looks like
        <code>Validation error: Validation len on username failed</code> and, when several
        rules broke, Sequelize lists them all separated by commas.</li>
        <li><strong>Connection errors</strong> — MySQL is off or on another port:
        <code>connect ECONNREFUSED 127.0.0.1:3307</code>. Not your data, not your SQL — your
        environment.</li>
        <li><strong>Database errors</strong> — the table does not exist (you never ran the
        migration), the key is not unique, the row violates a foreign key.</li>
      </ul>
      <p>Whatever happens, close the connection pool when you are done:
      <code>await sequelize.close()</code> inside a <code>finally</code> block, exactly as
      Lesson 43 taught and Lab16's <code>create.js</code> practices — otherwise the Node
      process can hang around holding MySQL connections.</p>
    `,
    `
      <h3>The journal's three insert scripts, run for real</h3>
      <p>The week's <code>README.txt</code> says it plainly: run these inside
      <code>sequelize-association-lab/</code>, and they need MySQL plus <code>npm i</code>.
      Here is what each one does, and what actually happened when we ran them in this
      repository (example 6 is the transcript):</p>
      <table>
        <thead><tr><th>Script</th><th>Does</th><th>Result</th></tr></thead>
        <tbody>
          <tr><td><code>Lab16/create.js</code></td><td>inserts two users, prints them, closes</td>
          <td>correct — once the port in <code>db.js</code> matches your MySQL</td></tr>
          <tr><td><code>sequelize-association-lab/create.js</code></td>
          <td>inserts Roger + his passport (a 1:1 pair)</td>
          <td>works — it stores the email under the misspelt <code>emial</code> column</td></tr>
          <tr><td><code>sequelize-association-lab/createDept.js</code></td>
          <td>inserts the BCA department + two students</td>
          <td><strong>silently loses both email addresses</strong> — it says <code>email</code>,
          the model says <code>emial</code>, so the keys are dropped (Lesson 45)</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>Running the labs today, honestly.</strong> Two things bite immediately:
        <code>sequelize-association-lab</code> ships without <code>node_modules</code>, so the
        first run dies with <code>Error: Cannot find module 'sequelize'</code> — the README's
        <code>npm i</code> is not optional. And Lab16's <code>db.js</code> points at port
        <code>3307</code> while a stock XAMPP listens on <code>3306</code>, so its script
        prints a bare <code>Connection failed:</code> with an <em>empty</em> message (Node
        hides the details inside an AggregateError when <code>localhost</code> resolves to both
        IPv4 and IPv6). Underneath it is the familiar
        <code>connect ECONNREFUSED 127.0.0.1:3307</code> — start MySQL, fix the port, rerun.
      </div>
    `
  ],
  examples: [
    {
      title: "Lab16/create.js: the journal's own insert script",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/Lab16/create.js",
      lang: "javascript",
      code: `
const User = require('./models/User');
const sequelize = require('./db');

async function run() {
  try {
    const user1 = await User.create({
      username: 'Nishant',
      email: 'nishant@gmail.com',
      password: 'heloow@123',
      age: 20
    });
    console.log('Created User:', user1.toJSON());

    const user2 = await User.create({
      username: 'tushar',
      email: 'tushar@gmail.com',
      password: '!!heloow@123456',
      age: 19
    });
    console.log('Created User:', user2.toJSON());
  } catch (error) {
    console.error('Error creating user:', error.message);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

run();
`,
      explain: [
        "Two imports: the model (which loads <code>db.js</code> and defines <code>User</code>) and the connection itself, so it can be closed at the end.",
        "<code>await User.create({...})</code> — one INSERT, one returned instance. The <code>await</code> is mandatory: without it you would print a Promise.",
        "<code>user1.toJSON()</code> strips the model internals and hands you a plain object — safe to send over HTTP or <code>JSON.stringify</code>.",
        "<code>catch</code> prints <code>error.message</code>: for a validation failure you would see <code>Validation error: Validation len on username failed</code> and friends.",
        "<code>finally</code> closes the connection pool and exits — Week 7's lesson, applied. Even on failure the process ends cleanly."
      ],
      run: "node create.js",
      output: "Created User: {\n  id: 1,\n  username: 'Nishant',\n  email: 'nishant@gmail.com',\n  password: 'heloow@123',\n  age: 20\n}\nCreated User: {\n  id: 2,\n  username: 'tushar',\n  email: 'tushar@gmail.com',\n  password: '!!heloow@123456',\n  age: 19\n}"
    },
    {
      title: "sequelize-association-lab/create.js: a student and their passport",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/create.js",
      lang: "javascript",
      code: `
const { Student, Passport } = require("./models");

async function run() {
    const student = await Student.create({
        name: "Roger",
        emial: "roger@gmail.com"
    });
    await Passport.create({
        passportNumber: "AUGK33940",
        StudentId: student.id
    });
    console.log("Student Created");
}
run();
`,
      explain: [
        "<code>require(\"./models\")</code> is the Lesson 44 wiring harness: one import yields every model plus the shared connection.",
        "The first <code>create</code> stores the email under the misspelt <code>emial</code> column — the key matches the model, so <em>this</em> script keeps its data.",
        "<code>student.id</code> is how you get the auto-generated primary key back: the second INSERT needs it, because the passport row points at the student (Week 10's associations).",
        "The foreign key is passed as <code>StudentId</code> — that is the attribute <code>Student.hasOne(Passport)</code> created on the Passport model, capital S included.",
        "No <code>try/catch</code> and no <code>close()</code> here — a lab shortcut. In anything real, add both (example 1 shows the pattern)."
      ],
      run: "node create.js",
      output: "Student Created"
    },
    {
      title: "sequelize-association-lab/createDept.js: two students, zero saved emails",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/createDept.js",
      lang: "javascript",
      code: `
const { Student,Department} = require("./models");

async function run(){
    const department = await Department.create({
        name:"BCA"
    });

    await Student.create({
        name:"Rohit",
        email:"rohit@gmail.com",
        DepartmentId: department.id
    });

    await Student.create({
        name:"Anil",
        email:"anil@gmail.com",
        DepartmentId: department.id
    });

    console.log("Data Inserted Created");
}

run();
`,
      explain: [
        "A department first, then two students pointing at it via <code>DepartmentId: department.id</code> — the one-to-many insert pattern Week 10 generalises.",
        "<strong>The bug, in the flesh:</strong> these two calls say <code>email</code>, but the model declares <code>emial</code>. Sequelize drops the unknown key, inserts only <code>name</code> and the foreign key, and stores <code>NULL</code> for the email. No error, no warning.",
        "The script still prints <code>Data Inserted Created</code> — the classic sign that \"it worked\" means nothing until you look at the row (example 5 of Lesson 45 reproduces the drop in two lines).",
        "Fix: rename the column in <code>models/student.js</code> and <code>migrations/2-create-student.js</code>. Then this file stores both addresses without a single change here."
      ],
      run: "node createDept.js",
      output: "Data Inserted Created"
    },
    {
      title: "Turn the lights on: watch the INSERT Sequelize builds",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize, DataTypes, Model } = require('sequelize');

const sequelize = new Sequelize('nishant', 'root', '', {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  logging: console.log,        // the journal writes false here - we want the SQL
  logQueryParameters: true     // ... and this appends the values as well
});

class User extends Model {}
User.init({
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  age: { type: DataTypes.INTEGER },
}, { sequelize, modelName: 'User', timestamps: false });

(async () => {
  const user = await User.create({
    username: 'Nishant', email: 'nishant@gmail.com', password: 'heloow@123', age: 20
  });
  console.log('Created User:', JSON.stringify(user.dataValues));
  await sequelize.close();
})();
`,
      explain: [
        "Lab16's model and its exact <code>create()</code> call, with the two logging options flipped on. Run it against a migrated database and this is the whole ORM, exposed.",
        "<code>logging: console.log</code> prints every statement; <code>logQueryParameters: true</code> adds the bound values in brackets after it — off by default, because parameters can contain passwords. Yours does.",
        "<code>VALUES (DEFAULT,?,?,?,?)</code>: the id is left to MySQL; each <code>?</code> is filled with one value from the list, in order.",
        "<code>user.dataValues.id</code> now holds the id MySQL generated — the instance came back from the database, not just from your object literal.",
        "The table must exist first: run <code>npx sequelize-cli db:migrate</code> (or the Week 7 <code>sync()</code> script) before this, or you get <code>Table 'nishant.Users' doesn't exist</code>."
      ],
      run: "node create-with-logging.js",
      output: "Executing (default): INSERT INTO `Users` (`id`,`username`,`email`,`password`,`age`) VALUES (DEFAULT,?,?,?,?); [\"Nishant\",\"nishant@gmail.com\",\"heloow@123\",20]\nCreated User: {\"id\":1,\"username\":\"Nishant\",\"email\":\"nishant@gmail.com\",\"password\":\"heloow@123\",\"age\":20}"
    },
    {
      title: "The same INSERT, filled in",
      from: "new",
      file: "",
      lang: "sql",
      code: `
-- What Sequelize sent (placeholders):
INSERT INTO \`Users\` (\`id\`,\`username\`,\`email\`,\`password\`,\`age\`)
VALUES (DEFAULT, ?, ?, ?, ?);
-- with the parameters: 1) 'Nishant' 2) 'nishant@gmail.com' 3) 'heloow@123' 4) 20

-- The equivalent single statement MySQL ends up executing:
INSERT INTO \`Users\` (\`id\`,\`username\`,\`email\`,\`password\`,\`age\`)
VALUES (DEFAULT, 'Nishant', 'nishant@gmail.com', 'heloow@123', 20);
`,
      explain: [
        "Two spellings of one event. The top is what crosses the wire as a prepared statement; the bottom is what it means once the parameters are substituted.",
        "You never write either one. That is the point of the ORM — but now you know exactly what it produced, which is what makes debugging possible.",
        "Note the quoting: text values are wrapped in single quotes by the driver, numbers are not. A value containing a quote is escaped automatically — the classic injection vector, closed.",
        "Compare with Lesson 39's hand-written <code>INSERT INTO users (...) VALUES (...)</code>: same statement, none of the bookkeeping, all of the risk."
      ]
    },
    {
      title: "Running the journal's scripts today: the two real failures",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# Attempt 1 - the association lab has no node_modules in the repository:
cd sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab
node create.js

# Fix, then attempt 2 - Lab16 points at port 3307:
cd ../../07_Week-07_Sequelize-MySQL/Lab16
npm i
node create.js

# Fix (start XAMPP, set port 3306, create the database, run the migration), then:
npx sequelize-cli db:migrate
node create.js
`,
      explain: [
        "Attempt 1 dies immediately with <code>Error: Cannot find module 'sequelize'</code> (a MODULE_NOT_FOUND from <code>models/index.js</code>) — the week's README is explicit that each project needs <code>npm i</code> first.",
        "Attempt 2 prints two short lines with nothing after the colons: <code>Connection failed:</code> and <code>Error creating user:</code>. The messages are empty because <code>db.js</code> says <code>host: 'localhost'</code>, Node tries IPv4 and IPv6 and wraps the failure in an AggregateError with an empty message.",
        "The real cause is visible if you connect to 127.0.0.1 instead: <code>connect ECONNREFUSED 127.0.0.1:3307</code> — nothing is listening on 3307. XAMPP's MySQL is on 3306.",
        "The fix, in order: start MySQL in the XAMPP control panel; change <code>port: 3307</code> to <code>3306</code> in <code>db.js</code> (and in <code>config/config.json</code> if you migrate); create the database; run <code>db:migrate</code>; rerun <code>node create.js</code>.",
        "Then attempt 3 succeeds and prints the two <code>Created User:</code> blocks from example 1."
      ],
      run: "node create.js",
      output: "Connection failed: \nError creating user: "
    },
    {
      title: "When create() rejects: the validation error, verbatim",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('nishant', 'root', '', { dialect: 'mysql', logging: false });

class User extends Model {}
User.init({
  username: { type: DataTypes.STRING, allowNull: false, validate: { len: [3, 50] } },
  email: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  age: { type: DataTypes.INTEGER, validate: { min: 0, max: 100 } },
}, { sequelize, modelName: 'User', timestamps: false });

(async () => {
  try {
    await User.create({ username: 'xy', email: 'nope', password: 'x', age: 200 });
  } catch (error) {
    console.error('Error creating user:', error.message);
    error.errors.forEach(item => console.log(' -', item.path, '=>', item.message));
  }
  await sequelize.close();
})();
`,
      explain: [
        "proj-2408023's model again, this time fed three broken values at once. All three rules fail — Sequelize collects every violation instead of stopping at the first.",
        "<code>error.message</code> joins the violations with commas and newlines; <code>error.errors</code> is the structured array you would feed to a web form, one entry per field.",
        "No INSERT was attempted: the failure happened in step 2 of <code>create()</code>, before any SQL existed. Turn <code>logging</code> on and you will see no query at all.",
        "The <code>username</code> entry says <code>Validation len on username failed</code> — the validator's own name is in the message, so you can map any error back to the model in one glance."
      ],
      run: "node create-invalid.js",
      output: "Error creating user: Validation error: Validation len on username failed,\nValidation error: Validation isEmail on email failed,\nValidation error: Validation max on age failed\n - username => Validation len on username failed\n - email => Validation isEmail on email failed\n - age => Validation max on age failed"
    }
  ],
  keyPoints: [
    "Model.create(values) is async: build → validate → INSERT → return the instance with its new id and timestamps",
    "With logging: console.log (and logQueryParameters: true) you can see the exact INSERT Sequelize generates — read it whenever something looks wrong",
    "Values travel as bind parameters (? placeholders), never pasted into the SQL string — that is what blocks SQL injection",
    "Failures come in three families: SequelizeValidationError (your rules), connection errors (ECONNREFUSED — wrong port or MySQL off), and database errors (missing table, duplicate key)",
    "Always close the connection with await sequelize.close() in a finally block; and fix the emial/email typo before trusting createDept.js's 'success' message"
  ],
  practice: `
    <p>Make Lab16's script really run. Copy
    <code>sorted_files/07_Week-07_Sequelize-MySQL/Lab16</code> to a scratch folder, run
    <code>npm i</code>, and change <code>port: 3307</code> in <code>db.js</code> to the port your
    XAMPP MySQL actually uses (3306 unless another installation took it). Create the database
    once — <code>CREATE DATABASE nishant;</code> in phpMyAdmin — then apply the journal's
    migration with <code>npx sequelize-cli db:migrate</code> and run
    <code>node create.js</code>.</p>
    <p>You should see the two <code>Created User:</code> blocks. Confirm from the other side in
    phpMyAdmin: open the <code>Users</code> table and find the rows with ids 1 and 2. Then break
    it on purpose — set <code>username: 'xy'</code> in the script and rerun: the
    <code>len: [3, 50]</code> rule from proj's model is not in Lab16's, so instead duplicate
    <code>Nishant</code> and watch the <code>unique: true</code> constraint produce
    <code>SequelizeUniqueConstraintError</code>.</p>
  `,
  quiz: [
    {
      q: "What exactly does `await User.create({ ... })` resolve to?",
      options: [
        "The string of SQL that was executed",
        "The number of affected rows",
        "The model instance that was inserted — with the database-assigned id and the timestamps Sequelize filled in",
        "true, meaning \"the insert worked\""
      ],
      answer: 2,
      why: "create() returns the finished instance (that is why Lab16 can call user1.toJSON() and print username, email, age together with the new id)."
    },
    {
      q: "You run the journal's Lab16/create.js and see `Connection failed: ` followed by `Error creating user: ` — with nothing after either colon. What is going on?",
      options: [
        "The Users table is missing, so Sequelize prints empty messages",
        "MySQL rejected the values as invalid",
        "MySQL is not reachable on the configured port (3307 in db.js) and the empty message is Node wrapping the failure; start XAMPP and match the port (3306)",
        "npm i was skipped, so the mysql2 driver is a stub"
      ],
      answer: 2,
      why: "An empty error.message with a host called localhost is the AggregateError signature of a refused connection; the underlying error is connect ECONNREFUSED 127.0.0.1:3307. Fix the environment, not the data."
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/core-concepts/model-basics/#creating-an-instance",
    "https://sequelize.org/docs/v6/other-topics/logging/"
  ]
});
