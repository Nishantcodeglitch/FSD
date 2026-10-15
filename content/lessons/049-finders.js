window.COURSE_LESSONS.push({
  id: "w09-finders",
  file: "049",
  unit: 2,
  week: 9,
  title: "Finders: findAll, findOne, findByPk",
  kicker: "Unit II · Week 9 · Lesson 1 of 5",
  minutes: 16,
  objectives: [
    "Call findAll(), findOne() and findByPk() and predict what each returns",
    "Filter a finder with a where object and read the instance it gives back",
    "Explain the difference between an array of instances, one instance, and null",
    "Close the connection so your finder script actually exits"
  ],
  intro: `
    <p>Last week you defined models and ran migrations — your <code>users</code> and
    <code>students</code> tables now physically exist in MySQL, and Lesson 48's
    <code>create()</code> pushed the first rows into them. A table full of rows is worthless
    if you can't get the data back out. Week 9 is entirely about getting data back out, and
    Sequelize gives you three <em>finder</em> methods to start with:
    <code>findAll()</code>, <code>findOne()</code> and <code>findByPk()</code>. The journal's
    own finder scripts live in two places — <code>Lab16/read.js</code> (the journal owner's
    lab) and the Week 9 folder's <code>FSD_30-by-2408030/</code> scripts (a classmate's
    backup project, roll 2408030 — we use it honestly as reading material, exactly as the
    journal's own README instructs).</p>
  `,
  theory: [
    `
      <h3>What a "finder" returns</h3>
      <p>Every finder is an <code>async</code> method on your model, so you always
      <code>await</code> it. What comes back differs — and knowing the difference saves you
      from the most common beginner crash:</p>
      <table>
        <thead><tr><th>Method</th><th>Returns</th><th>SQL it runs</th></tr></thead>
        <tbody>
          <tr><td><code>findAll()</code></td><td>an <strong>array</strong> of instances
          (possibly empty)</td><td><code>SELECT * FROM Students;</code></td></tr>
          <tr><td><code>findOne()</code></td><td><strong>one instance</strong>, or
          <code>null</code> if nothing matched</td><td><code>SELECT ... WHERE ... LIMIT 1;</code></td></tr>
          <tr><td><code>findByPk(3)</code></td><td>one instance by primary key, or
          <code>null</code></td><td><code>SELECT ... WHERE id = 3 LIMIT 1;</code></td></tr>
        </tbody>
      </table>
      <p>The trap: <code>findOne()</code> and <code>findByPk()</code> do <strong>not</strong>
      throw when nothing matches — they hand you <code>null</code>. The moment you write
      <code>student.name</code> on a null, Node throws
      <code>TypeError: Cannot read properties of null</code>. Always check for null first
      (example 5 shows the pattern).</p>
    `,
    `
      <h3>Reading a model instance</h3>
      <p>The thing a finder returns is not a plain object — it's a <em>model instance</em>:
      your row, wrapped in a class that also carries helper methods. Two ways to read it:</p>
      <ul>
        <li><strong>Dot access</strong> — <code>student.name</code>, <code>student.email</code>.
        Works because Sequelize defines a getter for every attribute.</li>
        <li><strong><code>student.toJSON()</code></strong> — a plain object of just the
        columns, perfect for <code>console.log</code> or sending over HTTP later. This is what
        the journal's scripts print.</li>
      </ul>
      <p>The journal's <code>findbyPK.js</code> uses both: <code>student.toJSON()</code> for
      the whole row, then reads individual fields off the same instance.</p>
    `,
    `
      <h3>where: the one option you will use constantly</h3>
      <p>A finder with no arguments grabs everything. To filter, pass a
      <code>where</code> object whose keys are column names:</p>
      <pre class="diagram">Student.findOne({ where: { email: "athena@gmail.com" } })
        │
        ▼
SELECT ... FROM Students WHERE email = 'athena@gmail.com' LIMIT 1;</pre>
      <p>Multiple keys mean <strong>AND</strong>: <code>where: { course: "CC", age: 24 }</code>
      matches only rows where both are true. Lesson 50 goes deep on <code>where</code> with
      operators like <code>$gt</code> and <code>$like</code>.</p>
    `,
    `
      <h3>Why the classmate's scripts hang — and Lab16's don't</h3>
      <p>Sequelize keeps a <em>connection pool</em> — a handful of open sockets to MySQL.
      That pool keeps the Node process alive: even after your last <code>console.log</code>,
      the script sits there with the terminal prompt missing. The fix is one line:
      <code>await sequelize.close()</code>. Compare the two styles in this week's folder:</p>
      <ul>
        <li><code>Lab16/read.js</code> ends with
        <code>await sequelize.close(); process.exit();</code> in a <code>finally</code> block
        — it exits cleanly every time.</li>
        <li>The <code>FSD_30-by-2408030</code> finder scripts
        (<code>findone.js</code>, <code>findbyPK.js</code>) never close — after printing,
        they just hang until you press Ctrl+C. Example 6 fixes one of them.</li>
      </ul>
      <p>Keep the pool habit: connect once per script, close at the end.</p>
    `
  ],
  examples: [
    {
      title: "Lab16/read.js: findAll() then findOne(), the journal's own finder lab",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/Lab16/read.js",
      lang: "javascript",
      code: `
const User = require('./models/User');
const sequelize = require('./db');

async function run() {
  try {
    // Fetch all users
    const allUsers = await User.findAll();
    console.log('\\nAll Users:');
    allUsers.forEach(user => {
      console.log(user.username, user.email, user.age);
    });

    // Fetch single user
    const singleUser = await User.findOne({
      where: { email: 'nishant@gmail.com' }
    });

    console.log('\\nSingle User:');
    if (singleUser) {
      console.log(singleUser.username, singleUser.email, singleUser.age);
    } else {
      console.log('User not found.');
    }
  } catch (error) {
    console.error('Error reading data:', error.message);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

run();
`,
      explain: [
        "<code>User.findAll()</code> takes no arguments and returns an <em>array</em> of User instances — one per row — which is why the code can immediately call <code>.forEach()</code> on it.",
        "Dot access (<code>user.username</code>) reads each column straight off the instance; no JSON conversion needed just to look at a field.",
        "<code>findOne({ where: { email: 'nishant@gmail.com' } })</code> sends a WHERE clause and asks for <code>LIMIT 1</code> — the natural way to look someone up by a unique column.",
        "The <code>if (singleUser)</code> guard is the null check from the theory: a findOne that matches nothing returns <code>null</code>, and the script says <code>'User not found.'</code> instead of crashing.",
        "The <code>finally</code> block closes the pool and exits — copy this shape into every script you write."
      ],
      run: "node read.js  (inside sorted_files/07_Week-07_Sequelize-MySQL/Lab16/, after npm i, with the nishant database populated by create.js)",
      output: `
All Users:
Nishant nishant@gmail.com 20
tushar tushar@gmail.com 19

Single User:
Nishant nishant@gmail.com 20
`
    },
    {
      title: "findbyPK.js: the fastest finder — straight to the primary key",
      from: "journal",
      file: "sorted_files/09_Week-09_Querying/FSD_30-by-2408030/findbyPK.js",
      lang: "javascript",
      code: `
const Student=require("./models/student");

async function run(){
    const student=await Student.findByPk(3);

    console.log("Student Details:",student.toJSON());
}

run();
`,
      explain: [
        "This file is from the classmate's backup project (roll 2408030) kept in the Week 9 folder — the journal owner's own raw finders are missing, and the folder README says to treat this as shared reading, not own work.",
        "<code>findByPk(3)</code> looks up the row whose <code>id</code> column is 3 — the primary-key lookup, the single fastest query a table can run (MySQL finds it through the index, not by scanning).",
        "<code>toJSON()</code> strips the instance wrapper and prints just the columns — the friendliest way to log a row while learning.",
        "Notice what's <em>missing</em>: no <code>sequelize.close()</code>. Run it and the prompt never comes back — Ctrl+C to escape. Example 6 shows the fix.",
        "It also skips the null check: if id 3 doesn't exist, <code>student.toJSON()</code> throws. A production version checks <code>if (!student)</code> first."
      ],
      run: "node findbyPK.js  (inside sorted_files/09_Week-09_Querying/FSD_30-by-2408030/ — needs npm i and the student_30 database; press Ctrl+C when it hangs)",
      output: "Student Details: { id: 3, name: 'Federer Rodrigues', email: 'federer@gmail.com', age: 45, course: 'OOC' }"
    },
    {
      title: "findone.js: findOne() with a where on a unique column",
      from: "journal",
      file: "sorted_files/09_Week-09_Querying/FSD_30-by-2408030/findone.js",
      lang: "javascript",
      code: `
const Student = require("./models/student");

async function run(){
    const student=await Student.findOne({
        where:{email:"athena@gmail.com"}
    });

    console.log("Student Details:",student.toJSON());
    console.log("ID",student.id);
    console.log("Course:",student.course);
}

run();
`,
      explain: [
        "The <code>where: { email: ... }</code> option becomes a WHERE clause — this is finder filtering in its simplest, most common form: look up one row by a value you already know.",
        "Because <code>email</code> is declared <code>unique: true</code> in the model, at most one row can match — exactly the situation <code>findOne()</code> is designed for.",
        "The instance is read three ways: the whole row via <code>toJSON()</code>, then two individual fields via dot access — both styles from the theory, side by side.",
        "Running all three logs proves the instance carries every column of the row, not just the one you searched on."
      ],
      run: "node findone.js  (inside sorted_files/09_Week-09_Querying/FSD_30-by-2408030/; press Ctrl+C when it hangs)",
      output: `
Student Details: { id: 2, name: 'Athena Rodrigues', email: 'athena@gmail.com', age: 24, course: 'CC' }
ID 2
Course: CC
`
    },
    {
      title: "findAll() with a where: every student in one course",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const Student = require("./models/student");
const sequelize = require("./db");

async function run() {
  const inCC = await Student.findAll({
    where: { course: "CC" }
  });

  console.log("Students in CC:", inCC.length);
  inCC.forEach(s => console.log(s.id, s.name, s.age));

  await sequelize.close();
}

run();
`,
      explain: [
        "Same project, same model as the journal's finders — only the finder changed: <code>findAll</code> plus <code>where</code> returns an <em>array</em> of every matching row, so <code>.length</code> and <code>.forEach()</code> both work.",
        "<code>where: { course: \"CC\" }</code> generates <code>WHERE course = 'CC'</code> — one key means equality; add more keys and they join with AND.",
        "Unlike findOne, findAll on zero matches returns an empty array <code>[]</code>, not null — <code>inCC.length</code> is safe even when nobody matches.",
        "This one closes the pool, so Ctrl+C is never needed."
      ],
      run: "node cc.js  (a new file beside the journal's scripts, inside FSD_30-by-2408030/)",
      output: `
Students in CC: 1
2 Athena Rodrigues 24
`
    },
    {
      title: "The null check: findOne() when nothing matches",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const Student = require("./models/student");
const sequelize = require("./db");

async function run() {
  const student = await Student.findOne({
    where: { email: "nobody@gmail.com" }
  });

  if (!student) {
    console.log("No student with that email.");
  } else {
    console.log(student.toJSON());
  }

  await sequelize.close();
}

run();
`,
      explain: [
        "The email matches no row, so <code>findOne()</code> resolves to <code>null</code> — a successful query with an empty result, not an error.",
        "The <code>if (!student)</code> guard is the whole lesson: check before you touch. Skip it and <code>student.toJSON()</code> throws <code>TypeError: Cannot read properties of null</code>.",
        "This is the pattern every \"look up by email/username\" code path in a real app uses — API registration, login, password reset all begin with exactly this findOne."
      ],
      run: "node nobody.js  (a new file inside FSD_30-by-2408030/)",
      output: "No student with that email."
    },
    {
      title: "The journal's findone.js, fixed: null check + close",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const Student = require("./models/student");
const sequelize = require("./db");

async function run() {
  try {
    const student = await Student.findOne({
      where: { email: "athena@gmail.com" }
    });

    if (!student) {
      console.log("No student with that email.");
      return;
    }
    console.log("Student Details:", student.toJSON());
  } finally {
    await sequelize.close();
  }
}

run();
`,
      explain: [
        "This is example 3 (the real journal file) with its two flaws repaired: a null guard and a guaranteed <code>close()</code>.",
        "<code>try / finally</code> means the pool is closed whether the query succeeds or throws — the same structure Lab16/read.js uses.",
        "<code>return</code> inside try still runs the finally block, so the early exit closes the connection too.",
        "Run this version and the process exits on its own — the terminal prompt comes straight back. That's the difference between a script and a hang."
      ],
      run: "node findone-fixed.js  (a new file inside FSD_30-by-2408030/)",
      output: "Student Details: { id: 2, name: 'Athena Rodrigues', email: 'athena@gmail.com', age: 24, course: 'CC' }"
    }
  ],
  keyPoints: [
    "findAll() returns an array of instances; findOne() and findByPk() return one instance or null — never an empty array",
    "A where object filters rows: keys are column names, multiple keys join with AND",
    "Read instances with dot access (student.name) or student.toJSON() for the whole row as a plain object",
    "findOne()/findByPk() return null on no match — check before you access properties or Node throws a TypeError",
    "The classmate backup scripts (FSD_30-by-2408030) never close the connection and hang; Lab16/read.js ends with sequelize.close() and exits cleanly — copy Lab16's shape"
  ],
  practice: `
    <p>Open <code>sorted_files/07_Week-07_Sequelize-MySQL/Lab16/read.js</code> and add a third
    finder to the try block: <code>User.findOne({ where: { username: 'tushar' } })</code>, with
    its own null check and log line. Run it with <code>node read.js</code> (after
    <code>node create.js</code> has populated the database) and confirm the prompt returns by
    itself. Then do the same addition inside a copy of the classmate's
    <code>findbyPK.js</code> — but add the missing <code>await sequelize.close()</code> and
    notice how the hang disappears.</p>
  `,
  quiz: [
    {
      q: "You call Student.findByPk(99) but no row has id 99. What happens?",
      options: [
        "It returns null — findByPk only throws if the query itself fails, not if the row is missing",
        "It throws \"Row not found\" immediately",
        "It returns an empty array",
        "It returns a Student instance with every field undefined"
      ],
      answer: 0,
      why: "findByPk (like findOne) resolves to null when nothing matches. That is why the journal's scripts really need an if (!student) check before calling .toJSON()."
    },
    {
      q: "After your finder script prints its last line, the terminal prompt never comes back. What is the most likely cause?",
      options: [
        "The Sequelize connection pool keeps the process alive — you never called sequelize.close()",
        "MySQL crashed mid-query",
        "console.log is asynchronous and still buffering",
        "findAll() forgot to return"
      ],
      answer: 0,
      why: "Sequelize holds open connections in a pool, and open sockets keep Node running. await sequelize.close() (as Lab16/read.js does in its finally block) lets the process exit naturally."
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/core-concepts/model-basics/",
    "https://sequelize.org/docs/v6/core-concepts/assocs/",
    "https://sequelize.org/api/v6/classes/model"
  ]
});
