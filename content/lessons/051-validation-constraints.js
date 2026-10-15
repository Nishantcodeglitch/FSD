window.COURSE_LESSONS.push({
  id: "w09-validation-constraints",
  file: "051",
  unit: 2,
  week: 9,
  title: "Validation and constraints",
  kicker: "Unit II · Week 9 · Lesson 3 of 5",
  minutes: 17,
  objectives: [
    "Explain the difference between Sequelize validations and database constraints",
    "Read the validate block (len, isEmail, min, max) in the journal's user model",
    "Predict which error a bad create() throws: SequelizeValidationError vs SequelizeUniqueConstraintError",
    "Add a beforeValidate/beforeCreate hook that fixes data before it is stored"
  ],
  intro: `
    <p>Lesson 48 created rows with <code>create()</code> and Week 8 taught your models to
    <em>describe</em> columns — <code>allowNull: false</code>, <code>unique: true</code>,
    <code>isEmail: true</code>. This lesson is about what happens when someone tries to
    break those rules, because \"someone\" is usually future you: a typo'd script, a test
    run twice, an empty field. Sequelize defends at <strong>two layers</strong> — your
    JavaScript (validations) and MySQL itself (constraints) — and knowing which layer
    fired tells you exactly what went wrong and how to fix it.</p>
  `,
  theory: [
    `
      <h3>Two guards, two places</h3>
      <table>
        <thead><tr><th></th><th>Validation (Sequelize, in Node)</th><th>Constraint (MySQL)</th></tr></thead>
        <tbody>
          <tr><td><strong>Where</strong></td><td>your JS, before any SQL is sent</td><td>inside the database engine</td></tr>
          <tr><td><strong>Declared by</strong></td><td><code>validate: { ... }</code></td><td><code>allowNull</code>, <code>unique</code>, types</td></tr>
          <tr><td><strong>Error</strong></td><td><code>SequelizeValidationError</code></td><td><code>SequelizeUniqueConstraintError</code>, <code>SequelizeForeignKeyConstraintError</code>…</td></tr>
          <tr><td><strong>Can be bypassed?</strong></td><td>yes, with tricks like <code>save({ validate: false })</code></td><td>never — the engine itself refuses</td></tr>
        </tbody>
      </table>
      <p>The rule of thumb: use <strong>validations</strong> for rules the database can't
      express or where a friendly message helps (\"email looks wrong\"), and
      <strong>constraints</strong> for rules the database must never, ever let slip —
      uniqueness especially, because two sessions can insert at the same instant and only
      the engine can arbitrate.</p>
    `,
    `
      <h3>The journal's validation lab: proj-2408023/models/user.js</h3>
      <p>The Week 8 project <code>proj-2408023/models/user.js</code> is the journal's
      richest validation file (the journal's Week 9 write-up points straight back to it for
      syllabus 9.2). Three built-in validators appear:</p>
      <ul>
        <li><code>len: [3, 50]</code> — string length between 3 and 50 characters.</li>
        <li><code>isEmail: true</code> — a regex check that the value looks like an email.</li>
        <li><code>min: 0, max: 100</code> — numeric range for age.</li>
      </ul>
      <p>Try <code>User.create({ username: \"ab\", ... })</code> and Node throws
      <em>before</em> MySQL hears a word:</p>
      <pre class="diagram">SequelizeValidationError: Validation error: Validation len on username failed</pre>
      <p>Contrast <code>Lab16/models/User.js</code> from the same course: same columns,
      but no <code>validate</code> block at all — only <code>allowNull</code> and
      <code>unique</code>. Two labs, two philosophies, and the journal notes the difference.</p>
    `,
    `
      <h3>Constraints: the model's and the migration's</h3>
      <p>The classmate backup's <code>models/student.js</code> shows the constraint style:
      <code>allowNull: false</code> on name/email/course and <code>unique: true</code> on
      email, with no <code>validate</code> anywhere. When you break one, the <em>database</em>
      answers — and the error names the actual SQL rule:</p>
      <pre class="diagram">SequelizeUniqueConstraintError: Validation error:
Duplicate entry 'athena@gmail.com' for key 'Students.email_unique'</pre>
      <p>One honest gotcha lives in the same project's migration
      <code>20260908032331-create-students-table.js</code>: it contains a
      <code>validate: { len: [3,50] }</code> block inside <code>createTable</code>. That
      does <strong>nothing</strong> — migrations emit raw DDL straight to MySQL, and MySQL
      has never heard of Sequelize validators. Copy the column options (<code>allowNull</code>,
      <code>unique</code>) into migrations; keep <code>validate</code> in the model where it
      belongs.</p>
    `,
    `
      <h3>Hooks: fixing data before the guard checks it</h3>
      <p>Sequelize models also run <em>hooks</em> — lifecycle callbacks at fixed moments.
      The two you need now:</p>
      <ul>
        <li><code>beforeValidate(instance)</code> — runs before validations, perfect for
        trimming and normalising (lowercase an email, fill a default).</li>
        <li><code>beforeCreate(instance)</code> — runs after validation, right before the
        INSERT.</li>
      </ul>
      <pre class="diagram">Student.beforeValidate(s => { if (s.email) s.email = s.email.trim().toLowerCase(); });</pre>
      <p>The order is: hooks → validations → SQL. So normalising in
      <code>beforeValidate</code> means the <em>cleaned</em> value is what gets validated —
      and a create with <code>"Athena@Gmail.com"</code> can no longer sneak past the unique
      constraint just because of capital letters.</p>
    `
  ],
  examples: [
    {
      title: "proj-2408023/models/user.js: the journal's validator-rich model",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/proj-2408023/models/user.js",
      lang: "javascript",
      code: `
const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 100,
    },
  },
});

module.exports = User;
`,
      explain: [
        "Two guards sit side by side on <code>username</code>: <code>unique: true</code> (a MySQL constraint) and <code>validate.len</code> (a Node-side check) — the two layers from the theory in one column.",
        "<code>len: [3, 50]</code> rejects \"ab\" with a Validation len error before any SQL runs; <code>isEmail: true</code> rejects \"not-an-email\" the same way.",
        "<code>age</code> has no <code>allowNull</code>, so it may be missing — but if present it must be 0–100 via min/max.",
        "<code>password</code> is bare: type + allowNull only. Validations are opt-in per column — nothing here checks its strength."
      ],
      run: "require it from a script and try User.create({ username: 'ab', email: 'x@y.com', password: 'p1', age: 20 })"
    },
    {
      title: "models/student.js (classmate backup): constraints only, no validators",
      from: "journal",
      file: "sorted_files/09_Week-09_Querying/FSD_30-by-2408030/models/student.js",
      lang: "javascript",
      code: `
const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');
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

module.exports = Student;
`,
      explain: [
        "This model (classmate's backup, roll 2408030 — kept honestly as shared reading) defends with constraints only: <code>allowNull: false</code> forbids empty, <code>unique: true</code> on email makes duplicates MySQL's problem.",
        "No <code>validate</code> block anywhere — <code>Student.create({ name: \"X\", email: \"bad\", course: \"DBMS\" })</code> sails through Node and stores the malformed email happily.",
        "<code>unique: false</code> on name and course is the default; writing it out is just being explicit.",
        "With <code>timestamps: false</code>, no createdAt/updatedAt columns exist — this model matches the hand-written migration in the same folder, not Sequelize's default sync."
      ],
      run: "require it from a script and try Student.create({ name: '', email: 'a@b.com', course: 'CC' }) -> SequelizeNotNullConstraintError"
    },
    {
      title: "The migration that tries to validate — and quietly can't",
      from: "journal",
      file: "sorted_files/09_Week-09_Querying/FSD_30-by-2408030/migrations/20260908032331-create-students-table.js",
      lang: "javascript",
      code: `
      name:{
        type:Sequelize.STRING,
        allowNull:false,
        unique:false,
        validate:{
         len:[3,50],
        }
     },
`,
      explain: [
        "Excerpt from the real migration: inside <code>queryInterface.createTable('students', ...)</code> sits a <code>validate: { len: [3,50] }</code> option on the name column.",
        "<strong>Spot the bug:</strong> this validate is silently ignored. Migrations compile column options to raw MySQL DDL — MySQL understands NULL/UNIQUE/DEFAULT, never Sequelize validators. A 1-char name will insert just fine if something calls the table directly.",
        "The options that <em>do</em> work here: <code>allowNull:false</code> and <code>unique:true</code> (on email) become real MySQL constraints.",
        "Rule to keep: <code>validate</code> belongs in <code>sequelize.define</code> (models), not in migrations. The model from example 2 is where this project's real rules live."
      ],
      run: "npx sequelize-cli db:migrate  (inside FSD_30-by-2408030/ — the table builds; the validate block never runs)"
    },
    {
      title: "Breaking a validation: friendly error, no SQL sent",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const User = require("./models/User");
const sequelize = require("./db");

async function run() {
  try {
    await User.create({
      username: "ab",
      email: "not-an-email",
      password: "x",
      age: 200
    });
  } catch (error) {
    console.log(error.name);
    error.errors.forEach(e => console.log("-", e.path, ":", e.message));
  } finally {
    await sequelize.close();
  }
}

run();
`,
      explain: [
        "Three validators fail at once (len, isEmail, max) — the error is a <code>SequelizeValidationError</code> whose <code>errors</code> array lists every broken rule, not just the first.",
        "<code>error.errors[].path</code> tells you which column offended; <code>message</code> is the human-readable rule — exactly what a web form should show the user.",
        "Nothing reached MySQL: validations run in Node, so a bad create costs you one in-process check, not a round trip.",
        "The model is Lab16's User (constraints only) — running this against <em>proj-2408023's</em> validating model is what produces the len/isEmail/max failures."
      ],
      run: "node bad-validation.js  (beside Lab16's scripts; run against the proj-2408023 model to see all three validators fire)",
      output: `
SequelizeValidationError
- username : Validation len on username failed
- email : Validation isEmail on email failed
- age : Max validation on age failed
`
    },
    {
      title: "Breaking a constraint: MySQL's answer",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const Student = require("./models/student");
const sequelize = require("./db");

async function run() {
  try {
    await Student.create({
      name: "Clayton A",
      email: "Clayton@gmail.com",
      age: 20,
      course: "DBMS"
    });
  } catch (error) {
    console.log(error.name + ":", error.message.split("\\n")[0]);
  } finally {
    await sequelize.close();
  }
}

run();
`,
      explain: [
        "The email <code>Clayton@gmail.com</code> already exists (create.js inserted it), and the model declares <code>unique: true</code> on email — the INSERT itself is rejected by MySQL.",
        "The error is <code>SequelizeUniqueConstraintError</code>, not a ValidationError: the two error names are your fastest clue to <em>which layer</em> fired.",
        "This guard is un-bypassable and race-proof: even two simultaneous inserts can't both win — the engine serialises them.",
        "Compare with example 4: validations give friendly field-level messages; constraints give the database's blunt refusal. Handle both in real code."
      ],
      run: "node duplicate.js  (a new file inside FSD_30-by-2408030/, after create.js has inserted Clayton)",
      output: "SequelizeUniqueConstraintError: Validation error: Duplicate entry 'Clayton@gmail.com' for key 'Students.email_unique'"
    },
    {
      title: "beforeValidate + beforeCreate hooks: clean the data automatically",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const Student = require("./models/student");
const sequelize = require("./db");

Student.beforeValidate(s => {
  if (s.email) s.email = s.email.trim().toLowerCase();
  if (s.name) s.name = s.name.trim();
});

Student.beforeCreate(s => {
  if (!s.course) s.course = "Unassigned";
});

async function run() {
  const s = await Student.create({
    name: "  Riya  ",
    email: "  Riya@Gmail.com  ",
    age: 21
  });
  console.log(s.toJSON());
  await sequelize.close();
}

run();
`,
      explain: [
        "Hooks are model-level callbacks: <code>beforeValidate</code> receives the instance and may edit it — here the messy input is trimmed and lower-cased <em>before</em> any validator or unique check runs.",
        "Because normalising happens first, <code>\" Riya@Gmail.com  \"</code> becomes <code>\"riya@gmail.com\"</code> — the unique constraint can no longer be dodged with capital letters or stray spaces.",
        "<code>beforeCreate</code> fills the missing course — a default value applied only on insert, invisible to updates.",
        "Order to remember: hooks → validations → SQL. Hooks fix, validators judge, MySQL stores or refuses."
      ],
      run: "node hooks.js  (a new file inside FSD_30-by-2408030/)",
      output: "{ id: 4, name: 'Riya', email: 'riya@gmail.com', age: 21, course: 'Unassigned' }"
    }
  ],
  keyPoints: [
    "Two guard layers: Sequelize validations run in Node before any SQL; DB constraints (allowNull/unique/types) run inside MySQL and cannot be bypassed",
    "validate: { len, isEmail, min, max } are built-in validators; a violation throws SequelizeValidationError with a per-field errors array",
    "A duplicate unique email throws SequelizeUniqueConstraintError — the error's name tells you which layer fired",
    "validate blocks inside migrations are silently ignored — migrations emit DDL that MySQL understands; keep validators in sequelize.define",
    "Hooks like beforeValidate/beforeCreate run before validations, so they are the right place to trim, lowercase and default incoming data",
    "The journal's own validation story lives in Week 8's proj-2408023/models/user.js; the Week 9 backup model shows the constraints-only style"
  ],
  practice: `
    <p>Take <code>proj-2408023/models/user.js</code> and add
    <code>validate: { isIn: [[\"DBMS\", \"CC\", \"OOC\"]] }</code> to a course field (or add
    an <code>isInt: true</code> check to age). Then write <code>bad.js</code> that tries
    three bad <code>create()</code> calls — short username, garbage email, out-of-range age —
    and prints <code>error.name</code> plus every <code>e.path</code>/<code>e.message</code>
    from <code>error.errors</code>. You should see one ValidationError listing all three
    problems at once.</p>
  `,
  quiz: [
    {
      q: "Student.create({ email: \"athena@gmail.com\", ... }) fails with SequelizeUniqueConstraintError. What happened?",
      options: [
        "MySQL itself rejected the INSERT because a row with that email already exists (the model's unique: true became a DB unique index)",
        "The model's isEmail validator decided the address was invalid",
        "Sequelize's len validation failed on the email string",
        "The database was offline, so the constraint check could not complete"
      ],
      answer: 0,
      why: "SequelizeUniqueConstraintError comes from the database layer — a duplicate key on the unique index. Validators would have produced SequelizeValidationError instead."
    },
    {
      q: "Where should validate: { isEmail: true } live so that it actually runs?",
      options: [
        "In the model, inside sequelize.define — migrations emit raw DDL and their validate blocks are ignored",
        "In the migration, inside queryInterface.createTable",
        "In db.js, in the Sequelize constructor options",
        "Anywhere — validate runs no matter where you write it"
      ],
      answer: 0,
      why: "Validations are a Sequelize model-layer feature. The journal's own migration contains a validate block that does nothing — a perfect example of the right idea in the wrong file."
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/core-concepts/validations-and-constraints/",
    "https://sequelize.org/docs/v6/other-topics/hooks/"
  ]
});
