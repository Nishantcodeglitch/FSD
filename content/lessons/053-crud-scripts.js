window.COURSE_LESSONS.push({
  id: "w09-crud-scripts",
  file: "053",
  unit: 2,
  week: 9,
  title: "Full CRUD as separate scripts",
  kicker: "Unit II · Week 9 · Lesson 5 of 5",
  minutes: 18,
  objectives: [
    "Run the four CRUD operations — create, read, update, delete — as standalone scripts",
    "Read update()'s [affectedRows, ...] return value and destroy()'s row count",
    "Spot and fix the two real bugs in the classmate backup's create.js and delete.js",
    "Assemble a clean create → read → update → delete → close capstone with predictable output"
  ],
  intro: `
    <p>You now own every individual move: Lesson 48's <code>create()</code>, Lesson 49's
    finders, this week's options, validations and raw SQL. Week 9's final lesson
    reassembles them into the shape every backend project actually ships: one script per
    operation — <code>create.js</code>, <code>read.js</code>, <code>update.js</code>,
    <code>delete.js</code> — the classic CRUD set (Create, Read, Update, Delete). Both
    journal projects have one: <code>Lab16</code>'s (the journal owner's, written properly)
    and the <code>FSD_30-by-2408030</code> backup (classmate, roll 2408030 — containing two
    excellent bugs we will diagnose like detectives). Reading working code <em>and</em>
    broken code is how you learn to write your own.</p>
  `,
  theory: [
    `
      <h3>The CRUD map</h3>
      <table>
        <thead><tr><th>Operation</th><th>Sequelize</th><th>SQL</th><th>Returns</th></tr></thead>
        <tbody>
          <tr><td>Create</td><td><code>Model.create({...})</code></td><td>INSERT</td><td>the new instance</td></tr>
          <tr><td>Read</td><td><code>findAll / findOne / findByPk</code></td><td>SELECT</td><td>array / instance / null</td></tr>
          <tr><td>Update</td><td><code>Model.update(values, { where })</code></td><td>UPDATE</td><td><code>[affectedCount]</code></td></tr>
          <tr><td>Delete</td><td><code>Model.destroy({ where })</code></td><td>DELETE</td><td>number of rows removed</td></tr>
        </tbody>
      </table>
      <p>Two of these return <em>counts</em>, not data — and that trips beginners:
      <code>update()</code> resolves to an array whose first element is how many rows
      changed (Lab16 prints <code>result[0]</code>), while <code>destroy()</code> resolves
      to a plain number. Neither hands you the modified row; if you need it, find it again
      afterwards.</p>
    `,
    `
      <h3>The shape of a well-behaved script</h3>
      <p>Look at Lab16's four scripts and the same skeleton repeats every time:</p>
      <pre class="diagram">require the model + the connection
async function run() {
  try      { ...the one operation... }
  catch    { console.error(...) }
  finally  { await sequelize.close(); process.exit(); }
}
run();</pre>
      <p>Three properties make this shape right: <strong>one operation per file</strong>
      (you run only the step you're testing), a <strong>catch</strong> that prints the
      error instead of a wall of stack trace, and a <strong>finally</strong> that closes
      the pool so the process exits — the difference between a script and a hang we saw
      in Lesson 49.</p>
    `,
    `
      <h3>Two bugs in the backup's CRUD set — study them well</h3>
      <p>The classmate project's <code>create.js</code> and <code>delete.js</code> fail in
      instructive ways:</p>
      <ul>
        <li><strong>create.js</strong> — all three <code>Student.create()</code> calls are
        commented out, but the last line still does
        <code>console.log(\"Created User 2:\", student.toJSON())</code>. There is no
        <code>student</code> variable any more →
        <code>ReferenceError: student is not defined</code> on a fresh run.</li>
        <li><strong>delete.js</strong> — calls
        <code>Student.destroy({ })</code> with an <em>empty</em> where, and never even
        invokes <code>run()</code>. Uncomment the call and the empty where would delete
        <strong>every row in the table</strong>: <code>DELETE FROM students;</code> with
        no WHERE is the classic foot-gun, and Sequelize will happily run it.</li>
      </ul>
      <p>The rules they teach: every <code>destroy</code> (and <code>update</code>) needs a
      non-empty <code>where</code> unless mass deletion is the actual goal — and never
      comment out a variable's birth while keeping its use.</p>
    `,
    `
      <h3>The capstone: one full cycle with clean output</h3>
      <p>The last two examples of this lesson build the pair of scripts every Unit II
      student should be able to write from scratch: <code>seed.js</code> (insert the known
      roster, read it back) and <code>manage.js</code> (update one, delete one, read the
      final table, close). Run them in order and the terminal tells a complete story —
      three rows appear, one changes, one vanishes, and the process exits on its own. That
      is Week 9 in two files.</p>
    `
  ],
  examples: [
    {
      title: "Lab16/create.js: the reference create step",
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
        "<code>User.create({...})</code> is the C of CRUD: one INSERT, and — unlike raw query() — you get a full model instance back, ready for <code>toJSON()</code>.",
        "Every field the model marks <code>allowNull: false</code> (username, email, password) must be present or the create throws — Lesson 51's validation layer guards the door here.",
        "Re-running this script the second time fails on <code>unique: true</code> email — a useful, predictable error that teaches constraints better than any slide.",
        "The try/catch/finally shape closes the pool and exits — run it and the prompt returns immediately."
      ],
      run: "node create.js  (inside sorted_files/07_Week-07_Sequelize-MySQL/Lab16/, after npm i)",
      output: `
Created User: { id: 1, username: 'Nishant', email: 'nishant@gmail.com', password: 'heloow@123', age: 20, createdAt: ..., updatedAt: ... }
Created User: { id: 2, username: 'tushar', email: 'tushar@gmail.com', password: '!!heloow@123456', age: 19, createdAt: ..., updatedAt: ... }
`
    },
    {
      title: "Backup create.js — spot the bug: the variable that no longer exists",
      from: "journal",
      file: "sorted_files/09_Week-09_Querying/FSD_30-by-2408030/create.js",
      lang: "javascript",
      code: `
const Student = require('./models/student');
async function run() {
// const student = await Student.create(
// {
//     name: "Clayton_A",
//     email: "Clayton@gmail.com",
//     age:20,
//     course: "DBMS"
// });

async function createstudents(){

}

// console.log("Created User 1:", student.toJSON());
console.log("Created User 2:", student.toJSON());
// console.log("Created User 3:", student3.toJSON());
}
run();
`,
      explain: [
        "All three <code>Student.create()</code> calls are commented out — so no <code>student</code> variable is ever born.",
        "<strong>The bug:</strong> line 32 still runs <code>student.toJSON()</code> → <code>ReferenceError: student is not defined</code>, the very first thing you see when you run it.",
        "An empty <code>createstudents()</code> function sits in the middle — it was clearly meant to hold the creation logic, but was never filled in.",
        "The fix: uncomment a create (and its matching log), or delete the orphan log line. As written, this script creates nothing and crashes — a good five-minute lesson in \"comment out usage together with declaration\"."
      ],
      run: "node create.js  (inside FSD_30-by-2408030/ — observe the crash)",
      output: "ReferenceError: student is not defined"
    },
    {
      title: "Lab16/update.js: the U of CRUD, and reading affectedRows",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/Lab16/update.js",
      lang: "javascript",
      code: `
const User = require('./models/User');
const sequelize = require('./db');

async function run() {
  try {
    const result = await User.update(
      { age: 25 },
      { where: { email: 'nishant@gmail.com' } }
    );

    console.log('Rows Updated:', result[0]);
  } catch (error) {
    console.error('Error updating record:', error.message);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

run();
`,
      explain: [
        "<code>update(values, { where })</code> takes two objects, in this exact order: <em>what to change</em> first, <em>which rows</em> second. Swap them and Sequelize complains loudly.",
        "<code>result[0]</code> is the affected-row count — UPDATE returns a number, not the updated instance. To see the new value, run a findOne afterwards.",
        "The where matches by email; matching by primary key (<code>{ where: { id: 1 } }</code>) is the more precise habit once rows exist.",
        "No validation fires on age here beyond the column type — Lesson 51's <code>min/max</code> would apply in the proj-2408023 model."
      ],
      run: "node update.js  (inside Lab16/, after create.js has populated the table)",
      output: "Rows Updated: 1"
    },
    {
      title: "Lab16/delete.js: the D of CRUD, counted",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/Lab16/delete.js",
      lang: "javascript",
      code: `
const User = require('./models/User');
const sequelize = require('./db');

async function run() {
  try {
    const deletedRows = await User.destroy({
      where: { email: 'tushar@gmail.com' }
    });

    console.log('Rows Deleted:', deletedRows);
  } catch (error) {
    console.error('Error deleting record:', error.message);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

run();
`,
      explain: [
        "<code>destroy({ where })</code> issues a DELETE and resolves to the <em>number of rows it removed</em> — a plain integer, even more minimal than update's array.",
        "The where clause targets one known email — exactly the safety the backup project's delete.js forgets (next example).",
        "Deleting is final: no undo, no trash can. In real apps this is why \"soft deletes\" (a deletedAt column) exist — but this lab deletes for real.",
        "Run it twice: the second run prints <code>Rows Deleted: 0</code> — an honest zero, not an error."
      ],
      run: "node delete.js  (inside Lab16/, after update.js)",
      output: "Rows Deleted: 1"
    },
    {
      title: "Backup update.js and delete.js — two more bugs to diagnose",
      from: "journal",
      file: "sorted_files/09_Week-09_Querying/FSD_30-by-2408030/update.js",
      lang: "javascript",
      code: `
const Student=require("./models/student");

async function run(){
    const student=await Student.update({
        age: 20
    },
    {
        where: {email:"athena@gmail.com"}

    });
    console.log("Rowws Updated");
}

run();
`,
      explain: [
        "The update itself is correct (values first, where second — same as Lab16). But the log prints <code>\"Rowws Updated\"</code> — a typo — and, worse, it ignores <code>result[0]</code>, so you never learn whether 1 or 0 rows actually changed.",
        "And its sibling <code>delete.js</code> in the same folder carries the week's nastiest bug: <code>Student.destroy({})</code> with an <em>empty</em> where — Sequelize translates that to a bare <code>DELETE FROM students</code> and wipes the table.",
        "delete.js also never calls <code>run()</code> — so it does nothing until you add the call, at which point the mass-delete fires.",
        "Fixed versions of both: always log <code>result[0]</code>/the destroyed count, always require a non-empty where, and remember the closing <code>await sequelize.close()</code> neither file has."
      ],
      run: "node update.js  (inside FSD_30-by-2408030/ — works, but prints the typo and hangs; compare delete.js which never runs at all)"
    },
    {
      title: "Capstone part 1 — seed.js: create the roster and read it back",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const Student = require("./models/student");
const sequelize = require("./db");

async function run() {
  try {
    await Student.create({ name: "Clayton_A", email: "clayton@gmail.com", age: 20, course: "DBMS" });
    await Student.create({ name: "Athena Rodrigues", email: "athena@gmail.com", age: 24, course: "CC" });
    await Student.create({ name: "Federer Rodrigues", email: "federer@gmail.com", age: 45, course: "OOC" });

    const all = await Student.findAll({ order: [["id", "ASC"]] });
    console.log("Seeded", all.length, "students:");
    all.forEach(s => console.log(" ", s.id, s.name, "-", s.course));
  } catch (error) {
    console.error("Seed failed:", error.message);
  } finally {
    await sequelize.close();
  }
}

run();
`,
      explain: [
        "The C and R of CRUD in one file: three <code>create()</code> calls insert the known roster, then a sorted <code>findAll()</code> proves they landed.",
        "An idempotent guard would check for existing rows first; here a duplicate email on re-run is caught by the try/catch and printed as \"Seed failed: ...\" — clean handling, no stack-trace wall.",
        "Ordering by <code>id ASC</code> makes the output deterministic — the same three lines every run, which is what \"expected terminal output\" means."
      ],
      run: "node seed.js  (a new file inside FSD_30-by-2408030/)",
      output: `
Seeded 3 students:
  1 Clayton_A - DBMS
  2 Athena Rodrigues - CC
  3 Federer Rodrigues - OOC
`
    },
    {
      title: "Capstone part 2 — manage.js: update, delete, read, close",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const Student = require("./models/student");
const sequelize = require("./db");

async function run() {
  try {
    const [updated] = await Student.update(
      { course: "OOC" },
      { where: { email: "athena@gmail.com" } }
    );
    console.log("Rows updated:", updated);

    const removed = await Student.destroy({
      where: { email: "clayton@gmail.com" }   // never an empty where!
    });
    console.log("Rows deleted:", removed);

    const all = await Student.findAll({ order: [["id", "ASC"]] });
    console.log("Final roster:");
    all.forEach(s => console.log(" ", s.id, s.name, "-", s.course));
  } finally {
    await sequelize.close();
  }
}

run();
`,
      explain: [
        "The U and D of CRUD: <code>update</code> destructures <code>[updated]</code> (affected count), <code>destroy</code> returns the deleted count — both are numbers, and both are logged, unlike the backup's scripts.",
        "Every where is non-empty and matches one email — the exact fixes for the backup project's bugs from example 5.",
        "The final <code>findAll</code> re-reads the table, so the terminal proves the whole cycle: Athena changed course, Clayton is gone.",
        "<code>finally { await sequelize.close(); }</code> is the last line of the story — the process exits and your prompt returns. Week 9: complete."
      ],
      run: "node manage.js  (inside FSD_30-by-2408030/, right after seed.js)",
      output: `
Rows updated: 1
Rows deleted: 1
Final roster:
  2 Athena Rodrigues - OOC
  3 Federer Rodrigues - OOC
`
    }
  ],
  keyPoints: [
    "CRUD maps to Model.create / findAll-family / Model.update(values, {where}) / Model.destroy({where}) — each script doing one operation",
    "update() resolves to [affectedCount] and destroy() to a plain count — neither returns the changed row; re-find it if you need the data",
    "The backup project's create.js crashes with ReferenceError (variable commented out but still logged) and its delete.js would wipe the table with destroy({}) — always require a non-empty where",
    "The reliable script skeleton: require model + connection, async run(), try/catch, finally { await sequelize.close() }",
    "A full cycle — seed.js then manage.js — prints create → read → update → read → delete → read with deterministic output and exits by itself",
    "Lab16's four scripts are the journal's model citizens; the classmate backup is the journal's best bug museum — both are teaching material"
  ],
  practice: `
    <p>Rebuild the capstone from memory in a fresh folder: <code>seed.js</code> inserting
    three of <em>your</em> own rows, then <code>manage.js</code> that updates one row's
    <code>age</code>, deletes another, prints the affected counts and the final table, and
    closes the connection. Then run both scripts a second time and read the errors — a
    duplicate-key message from the seed, a \"Rows deleted: 0\" from the manage — and
    explain to yourself exactly which layer (validation or constraint) produced each.</p>
  `,
  quiz: [
    {
      q: "What does Student.destroy({}) — an empty options object — do?",
      options: [
        "Deletes every row in the table, because there is no WHERE clause to limit it",
        "Deletes only the last created row",
        "Throws a validation error demanding a where clause",
        "Does nothing, because destroy requires both where and limit"
      ],
      answer: 0,
      why: "An empty where compiles to a bare DELETE FROM students — a legal statement MySQL happily runs to completion. Sequelize does not protect you here; you must always pass a non-empty where unless mass deletion is the goal."
    },
    {
      q: "After await User.update({ age: 25 }, { where: { id: 1 } }), how do you see the updated row's new values?",
      options: [
        "Run a finder again — update() only resolves to an affected-count array, not the modified instance",
        "The first argument of update() becomes the updated instance",
        "console.log the result — result[1] is the updated row",
        "You cannot; update() keeps the new values server-side only"
      ],
      answer: 0,
      why: "update() returns [affectedCount] (plus metadata), never the row. To see new values, call findByPk(1) (or findOne) after the update — the Lab16 script logs result[0] precisely because that is all it gets."
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/core-concepts/model-querying-basics/",
    "https://sequelize.org/docs/v6/core-concepts/managing-sets/"
  ]
});
