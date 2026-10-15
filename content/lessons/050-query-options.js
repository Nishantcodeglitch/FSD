window.COURSE_LESSONS.push({
  id: "w09-query-options",
  file: "050",
  unit: 2,
  week: 9,
  title: "Query options: where, attributes, order, limit",
  kicker: "Unit II · Week 9 · Lesson 2 of 5",
  minutes: 18,
  objectives: [
    "Filter rows with where using operators like $gt and $like from the Op object",
    "Pick specific columns with attributes and sort with order",
    "Page through results with limit and offset",
    "Read the SQL Sequelize generates for each option combination"
  ],
  intro: `
    <p>Lesson 49 gave you the three finders and the one option they lean on most,
    <code>where</code> with plain equality. This lesson turns that single option into a full
    toolbox: comparisons (<code>$gt</code>), pattern matching (<code>$like</code>), column
    selection, sorting and paging. One honest note before we start: the Week 9 folder's
    only file that looks like a \"query lab\" — <code>FSD_30-by-2408030/query.js</code> —
    turned out to be <em>raw SQL</em>, so it has its own lesson (Lesson 52). The option-based
    examples below build on the journal's real finder scripts plus new code written for this
    book, and every one of them shows you the SQL it produces.</p>
  `,
  theory: [
    `
      <h3>The anatomy of a query object</h3>
      <p>Every finder takes one big options object. You already know <code>where</code>;
      the rest slot in beside it:</p>
      <pre class="diagram">Model.findAll({
  where:     { ... },     // WHICH rows  -> WHERE clause
  attributes: [ ... ],    // WHICH cols  -> SELECT id, name ...
  order:     [ ... ],     // SORT how    -> ORDER BY ...
  limit:     10,          // HOW MANY    -> LIMIT 10
  offset:    20           // SKIP how many -> OFFSET 20
});</pre>
      <p>They compose: think of them as stacked filters, <code>where</code> first, then
      sorting, then the window of rows you actually want. Each one maps directly to the
      matching SQL clause — which is why turning on logging (Lesson 41's
      <code>logging: console.log</code>) is the best way to learn this topic.</p>
    `,
    `
      <h3>Operators: $gt, $like and friends live on Op</h3>
      <p>Equality covers only some questions. \"Older than 21?\" \"Course name starts with C?\"
      need comparison operators, and Sequelize keeps them on a special imported object:</p>
      <pre class="diagram">const { Op } = require("sequelize");

where: { age: { [Op.gt]: 21 } }        // age > 21
where: { name: { [Op.like]: "A%" } }   // name starts with A</pre>
      <p>The square brackets <code>[Op.gt]</code> are computed property keys — plain
      JavaScript. A common v5-to-v6 gotcha: <code>age: { $gt: 21 }</code> (dollar-sign
      shorthand) is <strong>not</strong> enabled by default in Sequelize v6 — the journal's
      projects use v6 (<code>sequelize ^6.37.8</code>), so import <code>Op</code> and use
      <code>[Op.gt]</code>. A few operators you'll use daily:</p>
      <table>
        <thead><tr><th>Operator</th><th>Meaning</th><th>SQL</th></tr></thead>
        <tbody>
          <tr><td><code>Op.eq</code></td><td>equals (default)</td><td><code>=</code></td></tr>
          <tr><td><code>Op.gt / Op.lt</code></td><td>greater / less than</td><td><code>&gt; / &lt;</code></td></tr>
          <tr><td><code>Op.gte / Op.lte</code></td><td>&gt;= / &lt;=</td><td><code>&gt;= / &lt;=</code></td></tr>
          <tr><td><code>Op.in</code></td><td>in a list</td><td><code>IN (...)</code></td></tr>
          <tr><td><code>Op.ne</code></td><td>not equal</td><td><code>!=</code></td></tr>
          <tr><td><code>Op.or</code></td><td>either condition</td><td><code>OR</code></td></tr>
          <tr><td><code>Op.like</code></td><td>pattern match</td><td><code>LIKE</code></td></tr>
        </tbody>
      </table>
      <p><code>Op.like</code> deserves its own word: <code>%</code> matches any run of
      characters, <code>_</code> exactly one character. So <code>"%r%"</code> means \"contains
      an r\" and <code>"A%\"</code> means \"starts with A\". On MySQL, LIKE is
      case-insensitive by default — handy to know when your data mixes cases.</p>
    `,
    `
      <h3>attributes, order, limit, offset</h3>
      <ul>
        <li><strong><code>attributes</code></strong> — an array of column names to SELECT.
        Big tables have wide rows; if you only need names, don't ship emails and passwords
        across the wire.</li>
        <li><strong><code>order</code></strong> — an array of
        <code>[column, "ASC"|"DESC"]</code> pairs. It's an array (not a pair) because you
        can sort by several columns: <code>[[\"course\", \"ASC\"], [\"age\", \"DESC\"]]</code>.</li>
        <li><strong><code>limit</code></strong> — at most N rows. <code>findOne()</code>
        silently adds <code>LIMIT 1</code> for you.</li>
        <li><strong><code>offset</code></strong> — skip N rows before taking the limit. This
        pair is <em>pagination</em>: page 3 with 10 per page is
        <code>limit: 10, offset: 20</code>.</li>
      </ul>
      <pre class="diagram">SELECT id, name FROM Students
  WHERE age >= 21
  ORDER BY age DESC
  LIMIT 2 OFFSET 0;</pre>
    `,
    `
      <h3>include: a one-line preview of Lesson 57</h3>
      <p>One more option you'll meet in Week 10 but can already read: <code>include</code>.
      The association lab's <code>read.js</code> calls
      <code>Student.findOne({ include: Passport })</code> and gets the student
      <em>plus</em> their passport nested inside one object. That's <em>eager loading</em> —
      one query instead of two. You'll build it properly in Lesson 57; here it just
      completes the picture of what a query object can ask for.</p>
    `
  ],
  examples: [
    {
      title: "findone.js: the simplest where — one column, one value",
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
        "The <code>where</code> object here is the atom every option in this lesson builds on: <code>{ email: \"athena@gmail.com\" }</code> — a key that is a column name, a value that must match exactly.",
        "It compiles to <code>WHERE email = 'athena@gmail.com'</code> — Sequelize escapes the value for you; you never paste it into a SQL string yourself (Lesson 52 shows why that matters).",
        "Add a second key, say <code>{ email: ..., age: 24 }</code>, and Sequelize joins them with AND — both must be true.",
        "Remember the classmate-backup attribution (roll 2408030) and the missing <code>close()</code> — Ctrl+C ends the hang."
      ],
      run: "node findone.js  (inside sorted_files/09_Week-09_Querying/FSD_30-by-2408030/; press Ctrl+C when it hangs)"
    },
    {
      title: "Lab16/read.js: findAll() with no options vs findOne() with where",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/Lab16/read.js",
      lang: "javascript",
      code: `
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
`,
      explain: [
        "Shown from the middle of the real Lab16/read.js (the full file is in Lesson 49) — the contrast is the point: <code>findAll()</code> with an empty call fetches the whole table (<code>SELECT * FROM Users;</code>), while findOne's where narrows to one row.",
        "No where on findAll is fine for a lab table; on a table with a million rows it's the classic way to freeze an app — which is exactly why limit/offset exist further down this lesson.",
        "Both calls return <em>instances</em>; the array one is handled with forEach, the single one with a null check."
      ],
      run: "node read.js  (inside sorted_files/07_Week-07_Sequelize-MySQL/Lab16/)",
      output: `
All Users:
Nishant nishant@gmail.com 20
tushar tushar@gmail.com 19

Single User:
Nishant nishant@gmail.com 20
`
    },
    {
      title: "read.js (association lab): where + include — pulling the passport along",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/read.js",
      lang: "javascript",
      code: `
const { Student, Passport } = require("./models");

async function run() {
const student = await Student.findOne({
    include:Passport
});
console.log(student.toJSON());
}

run()
`,
      explain: [
        "A new option appears: <code>include: Passport</code> tells Sequelize \"while you're fetching the student, also fetch their passport and nest it inside\".",
        "The printed object will contain a <code>Passport</code> key beside the student's own columns — the shape <code>toJSON()</code> exposes to the outside world.",
        "Behind the scenes this is two tables joined in one query (or two queries) — the topic is eager loading, fully unpacked in Lesson 57. Here it just shows the query object's range.",
        "No where on this findOne, so MySQL's first student row wins — fine for a 2-row lab, a bug in real life."
      ],
      run: "node read.js  (inside sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/, after npm i and migrations + seed)"
    },
    {
      title: "Op.gte and Op.desc: adults first, with the SQL on screen",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Op } = require("sequelize");
const Student = require("./models/student");
const sequelize = require("./db");

async function run() {
  const adults = await Student.findAll({
    where: { age: { [Op.gte]: 21 } },
    order: [["age", "DESC"]],
    logging: console.log
  });

  adults.forEach(s => console.log(s.name, "-", s.age));
  await sequelize.close();
}

run();
`,
      explain: [
        "<code>const { Op } = require(\"sequelize\")</code> — the operators aren't magic strings, they're an exported object; destructuring it is the standard opening line of any filtered query.",
        "<code>[Op.gte]: 21</code> becomes <code>age &gt;= 21</code> — the computed key <code>[Op.gte]</code> is ordinary ES6 syntax, not Sequelize wizardry.",
        "<code>order: [[\"age\", \"DESC\"]]</code> sorts oldest-first; the inner array is <code>[column, direction]</code>, the outer array allows more sort keys after it.",
        "<code>logging: console.log</code> re-enables the SQL echo (Lesson 41) — run it and read the exact query Sequelize built."
      ],
      run: "node adults.js  (a new file inside FSD_30-by-2408030/)",
      output: `
Executed (default): SELECT \`id\`, \`name\`, \`email\`, \`age\`, \`course\` FROM \`Students\` AS \`Student\` WHERE \`Student\`.\`age\` >= 21 ORDER BY \`Student\`.\`age\` DESC;
Federer Rodrigues - 45
Athena Rodrigues - 24
`
    },
    {
      title: "Op.like: find every name containing \"er\"",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Op } = require("sequelize");
const Student = require("./models/student");
const sequelize = require("./db");

async function run() {
  const matches = await Student.findAll({
    where: { name: { [Op.like]: "%er%" } },
    order: [["id", "ASC"]]
  });

  console.log('Names containing "er":', matches.length);
  matches.forEach(s => console.log(s.id, s.name));
  await sequelize.close();
}

run();
`,
      explain: [
        "<code>%</code> is LIKE's wildcard for \"any characters, any length\" — <code>%er%</code> means \"an er anywhere in the string\". <code>er%</code> would mean \"starts with er\".",
        "The whole pattern sits as the value of <code>[Op.like]</code>, generating <code>WHERE name LIKE '%er%'</code>.",
        "Sorting by <code>id ASC</code> keeps the output in insertion order so the result is predictable — a small habit that makes testing much easier.",
        "Try changing the pattern to <code>%R%</code> — on MySQL's default collation it still matches lowercase r, a case-insensitivity surprise worth remembering."
      ],
      run: "node like.js  (a new file inside FSD_30-by-2408030/)",
      output: `
Names containing "er": 1
3 Federer Rodrigues
`
    },
    {
      title: "attributes + limit + offset: a real pagination query",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const Student = require("./models/student");
const sequelize = require("./db");

async function run() {
  const page = await Student.findAll({
    attributes: ["id", "name", "course"],
    order: [["id", "ASC"]],
    limit: 2,
    offset: 1,
    logging: console.log
  });

  page.forEach(s => console.log(s.toJSON()));
  await sequelize.close();
}

run();
`,
      explain: [
        "<code>attributes: [\"id\", \"name\", \"course\"]</code> drops <code>email</code> and <code>age</code> from the SELECT — fewer bytes, and no leaking of columns you didn't ask for.",
        "<code>limit: 2, offset: 1</code> is page 2 of a 2-per-page view: skip the first row, take the next two. Feed it <code>(pageNo - 1) * pageSize</code> for the offset and you have a paging API.",
        "Order matters for paging: without <code>order</code>, MySQL makes no promise about which rows land on which page — always sort your paged queries.",
        "The logged SQL shows all four options stacking into one statement: SELECT cols, ORDER BY, LIMIT, OFFSET."
      ],
      run: "node page2.js  (a new file inside FSD_30-by-2408030/)",
      output: `
Executed (default): SELECT \`id\`, \`name\`, \`course\` FROM \`Students\` AS \`Student\` ORDER BY \`Student\`.\`id\` ASC LIMIT 2 OFFSET 1;
{ id: 2, name: 'Athena Rodrigues', course: 'CC' }
{ id: 3, name: 'Federer Rodrigues', course: 'OOC' }
`
    }
  ],
  keyPoints: [
    "A query object stacks options: where picks rows, attributes picks columns, order sorts, limit/offset window the result — each maps to its SQL clause",
    "Comparison operators ($gt, $gte, $like, Op.in, Op.or...) live on the imported Op object: const { Op } = require(\"sequelize\"), then { [Op.gte]: 21 }",
    "The v6 dollar-sign shorthand ($gt) is not enabled by default in the journal's Sequelize 6 projects — use Op",
    "Op.like with % wildcards does pattern matching (%x% = contains, x% = starts with) and is case-insensitive on default MySQL",
    "limit + offset is pagination: page N with size S is limit S, offset (N-1)*S — always add order, or pages are unpredictable",
    "Turn on logging: console.log while learning — every option you add is visible in the generated SQL"
  ],
  practice: `
    <p>In the <code>FSD_30-by-2408030</code> project, write <code>report.js</code>: find every
    student whose <code>course</code> <code>Op.like</code>s <code>%C%</code> (contains a C),
    aged <code>Op.gte</code> 20, selecting only <code>name</code> and
    <code>course</code>, ordered by name alphabetically, with
    <code>logging: console.log</code> on. Run it, read the generated SQL aloud clause by
    clause, then close the connection and confirm the process exits.</p>
  `,
  quiz: [
    {
      q: "In the journal's Sequelize v6 projects, what is the correct way to filter students older than 21?",
      options: [
        "where: { age: { [Op.gt]: 21 } } after const { Op } = require(\"sequelize\")",
        "where: { age: { $gt: 21 } } — dollar-sign operators work out of the box",
        "where: \"age > 21\" — where also accepts SQL strings",
        "where: { age.gt: 21 } — dot access on the column"
      ],
      answer: 0,
      why: "Sequelize v6 keeps operators on the Op object and uses computed keys [Op.gt]. The $gt shorthand exists but is not enabled by default in v6, and where never takes raw SQL."
    },
    {
      q: "A query has order: [[\"id\", \"ASC\"]], limit: 10, offset: 30. Which rows come back?",
      options: [
        "Rows 31–40 when sorted by id ascending — offset skips 30, then limit takes 10",
        "Rows 1–10, because limit always wins",
        "Rows 41–50, because offset is added to limit",
        "Random rows — offset requires a where clause"
      ],
      answer: 0,
      why: "Offset discards that many rows from the sorted result, then limit takes the next batch — the standard page-4-of-10-per-page slice. The order guarantee is why you should always sort paged queries."
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/core-concepts/model-querying-basics/",
    "https://sequelize.org/docs/v6/other-topics/operators/"
  ]
});
