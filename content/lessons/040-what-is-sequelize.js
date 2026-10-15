window.COURSE_LESSONS.push({
  id: "w07-what-is-sequelize",
  file: "040",
  unit: 2,
  week: 7,
  title: "What is Sequelize? Installing the ORM",
  kicker: "Unit II · Week 7 · Lesson 2 of 5",
  minutes: 17,
  objectives: [
    "Define ORM and sketch the JavaScript-object-to-table mapping it performs",
    "Explain what each of sequelize, mysql2 and sequelize-cli contributes",
    "Install the stack in a fresh Node project with npm",
    "Recognise the config/models/migrations/seeders layout that sequelize-cli init creates"
  ],
  intro: `
    <p>Last lesson you created a database and a table with raw SQL, and read rows back with
    <code>SELECT</code>. That language works — but your server is written in JavaScript, and
    gluing JavaScript to SQL means either concatenating query strings by hand (SQL injection and
    typo city) or copying results field by field into objects.</p>
    <p><strong>Sequelize</strong> removes that glue work. It is the ORM this entire unit — and
    the journal's whole Unit II — is built on. This lesson explains what an ORM actually is,
    installs Sequelize the same way the journal's four projects did (with their real
    <code>package.json</code> files), and tours the project skeleton that
    <code>sequelize-cli</code> generates, because Weeks 8–9 live inside that skeleton.</p>
  `,
  theory: [
    `
      <h3>ORM: objects on one side, tables on the other</h3>
      <p><strong>ORM — Object-Relational Mapper</strong> is a tool that lets you write your
      database work as plain JavaScript objects instead of SQL strings. It keeps a live
      translation going in both directions:</p>
      <pre class="diagram">JavaScript world            SQL world
-----------------           --------------------------
User.create({               INSERT INTO users
  username: 'Nishant',  ◀▶    (username, email, age)
  email: '...',              VALUES ('Nishant', ...)
  age: 20
});

const u = await ...         SELECT * FROM users
u.email  // 'nishant@...' ◀▶   WHERE email = '...'
</pre>
      <p>Left side: a JavaScript object with keys. Right side: a row in a table with columns.
      The ORM writes the SQL for you, sends it through a driver, and hands the result back as a
      JavaScript object with properties you can read directly. The concrete benefits:</p>
      <ul>
        <li><strong>No hand-built SQL strings</strong> — no typos in column names, and values are
        <em>escaped</em> for you, which blocks the classic SQL-injection attack.</li>
        <li><strong>Validations</strong> — reject a bad email before it ever reaches the database
        (Week 8).</li>
        <li><strong>Schema as code</strong> — tables are defined in JavaScript files you can
        version-control and migrate (Week 8).</li>
        <li><strong>Swap the database</strong> — change the <code>dialect</code> option and most
        of your code stays put.</li>
      </ul>
      <p>An ORM does not remove SQL from your life — Week 9 even shows how to drop down to raw
      SQL through it — it removes SQL from your <em>daily spelling</em>.</p>
    `,
    `
      <h3>Three packages, three jobs</h3>
      <p>The journal's projects install a consistent trio. It matters which is which, because
      only two of them appear in <code>dependencies</code>:</p>
      <table>
        <thead><tr><th>Package</th><th>Job</th><th>Where the journal keeps it</th></tr></thead>
        <tbody>
          <tr><td><code>sequelize</code></td><td>the ORM itself — models, query building,
          validations, migrations engine</td><td><code>dependencies</code></td></tr>
          <tr><td><code>mysql2</code></td><td>the <em>driver</em> — the low-level module that
          actually speaks the MySQL wire protocol over TCP; Sequelize sends its queries through
          it</td><td><code>dependencies</code></td></tr>
          <tr><td><code>sequelize-cli</code></td><td>command-line helpers —
          <code>init</code>, <code>migration:generate</code>, <code>db:migrate</code> — used at
          development time only, never by your running server</td><td><code>devDependencies</code></td></tr>
        </tbody>
      </table>
      <p>Sequelize supports several databases (MySQL, PostgreSQL, MariaDB, SQLite, MSSQL), which
      is why the driver is a separate package: install <code>sequelize</code> + whichever driver
      matches your server. The journal always chose MySQL — hence <code>mysql2</code>.</p>
    `,
    `
      <h3>Installing, exactly as the journal did</h3>
      <p>A Sequelize project is an ordinary Node project. From an empty folder:</p>
      <pre>npm init -y
npm i sequelize mysql2
npm i -D sequelize-cli</pre>
      <p>Compare with the journal: <code>Lab16/package.json</code> and
      <code>proj-2408023/package.json</code> both declare <code>mysql2 ^3.24.x</code> and
      <code>sequelize ^6.37.8</code> as dependencies and <code>sequelize-cli ^6.6.5</code> as a
      devDependency — the exact split above. One honest variation: <code>lab20_package.json</code>
      (the Week 10 many-to-many lab) skips <code>sequelize-cli</code> entirely, because a
      hand-written script only needs the runtime pair. Install the CLI when you want its
      generators.</p>
    `,
    `
      <h3>The skeleton: config, models, migrations, seeders</h3>
      <p>Run <code>npx sequelize-cli init</code> and the CLI creates four folders plus
      <code>.sequelizerc</code> — the layout every Unit II project in the journal follows:</p>
      <ul>
        <li><code>config/</code> — <code>config.json</code>, your connection settings split by
        environment (<code>development</code>, <code>test</code>, <code>production</code>). You
        already read two of these last lesson.</li>
        <li><code>models/</code> — one file per table, declaring columns and validations.
        Week 8 material.</li>
        <li><code>migrations/</code> — numbered scripts that change the database structure over
        time (create table, add column…). Also Week 8.</li>
        <li><code>seeders/</code> — scripts that insert starter/demo data. The journal's folders
        exist but are empty — nothing to seed yet.</li>
      </ul>
      <p>The journal's <code>proj-2408023/notes.txt</code> is the student's own shorthand for
      these commands; example 6 shows it with its typos intact, because knowing what the commands
      <em>really</em> are (vs how they were jotted down) is half the skill.</p>
    `
  ],
  examples: [
    {
      title: "Lab16/package.json: the journal's real dependency declarations",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/Lab16/package.json",
      lang: "json",
      code: `
{
  "name": "lab-16",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "mysql2": "^3.24.2",
    "sequelize": "^6.37.8"
  },
  "devDependencies": {
    "sequelize-cli": "^6.6.5"
  }
}
`,
      explain: [
        "The three-package trio in the flesh: <code>sequelize</code> (ORM) and <code>mysql2</code> (driver) as runtime dependencies, <code>sequelize-cli</code> (generators) as a devDependency.",
        "<code>\"type\": \"commonjs\"</code> — these projects use <code>require()</code>, exactly like every file from Unit I.",
        "The <code>^</code> prefix (<code>^6.37.8</code>) means \"this minor version or newer, no breaking change\" — the caret ranges npm resolved into the project's <code>package-lock.json</code>.",
        "No custom <code>scripts</code> yet — the student ran <code>node db.js</code> and friends by hand. Adding a <code>\"start\"</code> script is a nice first edit."
      ]
    },
    {
      title: "proj-2408023/package.json: the same trio, second project",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/proj-2408023/package.json",
      lang: "json",
      code: `
{
  "name": "2408023",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "mysql2": "^3.24.2",
    "sequelize": "^6.37.8"
  },
  "devDependencies": {
    "sequelize-cli": "^6.6.5"
  }
}
`,
      explain: [
        "Identical dependency block to Lab16 — this is the course's standard Sequelize setup, not one lab's quirk.",
        "The project name is the student's roll number (<code>2408023</code>) — this folder carries the journal's migrations work in Weeks 8–9.",
        "Both projects shipped <em>without</em> <code>node_modules</code>, so the very first command in each is <code>npm i</code> — exactly what the week's README demands."
      ]
    },
    {
      title: "lab20_package.json: the minimal variant (no sequelize-cli)",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/lab20_package.json",
      lang: "json",
      code: `
{
  "name": "lab20",
  "version": "1.0.0",
  "main": "advance-Many-to-Many-Associations.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "mysql2": "^3.24.5",
    "sequelize": "^6.37.8"
  }
}
`,
      explain: [
        "The third journal project (the Week 10 many-to-many lab) keeps only <code>sequelize</code> + <code>mysql2</code> — no CLI, no devDependencies.",
        "The lesson: you need the ORM and the driver to <em>run</em> code; you need <code>sequelize-cli</code> only when you use its generators. Simple scripts can skip it.",
        "<code>\"main\"</code> names the entry file — this project's work lives in one big script rather than many small ones."
      ]
    },
    {
      title: "From zero: npm install + npx sequelize-cli init",
      from: "new",
      file: "",
      lang: "bash",
      code: `
mkdir week7-demo && cd week7-demo
npm init -y
npm i sequelize mysql2
npm i -D sequelize-cli
npx sequelize-cli init

# resulting folders:
#   config/config.json
#   models/index.js
#   migrations/
#   seeders/
`,
      explain: [
        "<code>npm i sequelize mysql2</code> writes both into <code>dependencies</code> — compare the result with example 1; you have just reproduced the journal's package.json.",
        "<code>-D sequelize-cli</code> puts the CLI in <code>devDependencies</code>: it generates files at development time and is never <code>require</code>d by your scripts.",
        "<code>npx sequelize-cli init</code> runs the locally installed CLI without a global install — it scaffolds <code>config/</code>, <code>models/</code>, <code>migrations/</code> and <code>seeders/</code>.",
        "The generated <code>config/config.json</code> starts with a <code>development</code> block for a database named after your OS username — edit it to point at <code>nishant</code> like the journal did."
      ],
      run: "npx sequelize-cli init"
    },
    {
      title: "The same job, spelled twice: raw SQL vs Sequelize",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// What you would have to write WITHOUT an ORM:
const sql = "INSERT INTO users (username, email, age) " +
            "VALUES ('Nishant', 'nishant@gmail.com', 20)";

// What Sequelize lets you write:
const js = "User.create({ username: 'Nishant', email: 'nishant@gmail.com', age: 20 })";

console.log("SQL side:", sql);
console.log("JS side: ", js);
`,
      explain: [
        "Left: a string. One mistyped column name and you get a SQL error at runtime; one unescaped quote and you open the door to SQL injection.",
        "Right: an ordinary JavaScript object — keys become column names, values are escaped by the ORM automatically.",
        "Week 8 shows the real <code>User.create()</code> against the journal's model; this side-by-side is the whole idea in ten lines.",
        "Print them like this whenever the abstraction feels magical — ORM 'magic' is mostly just a string-builder you no longer have to maintain."
      ],
      run: "node compare.js",
      output: "SQL side: INSERT INTO users (username, email, age) VALUES ('Nishant', 'nishant@gmail.com', 20)\nJS side:  User.create({ username: 'Nishant', email: 'nishant@gmail.com', age: 20 })"
    },
    {
      title: "proj-2408023/notes.txt: the student's own CLI shorthand",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/proj-2408023/notes.txt",
      lang: "text",
      code: `
npx sequelize-cli init
npx sequelize-cli migration:generate --name create-user-table

the up fucntion is used to anythin changes i have done it will apply
the down fucntion is the doing the down shift.

model handles business logic, queris and relationships
migrations file handles creating columns adding column removing columns
overall changing database structure.

//final thing is after we have run the npx sequelize-cli db:migrate
`,
      explain: [
        "Verbatim from the journal — the two commands that open Week 8: <code>init</code> scaffolds the project, <code>migration:generate --name ...</code> creates an empty migration file.",
        "The up/down, model/migration distinctions are the student's own words and they are correct: <code>up</code> applies a change, <code>down</code> reverses it; models hold logic, migrations hold structure.",
        "Spotted in passing: the notes' later lines spell it <code>sequalise-cli</code> — the correct spelling is <strong>sequelize</strong>. Copying commands from hand notes is exactly where such typos bite.",
        "Keep this file around; Lesson 46 (migrations) builds directly on it."
      ]
    }
  ],
  keyPoints: [
    "ORM = Object-Relational Mapper: it translates JavaScript objects into SQL tables and back, so you write objects instead of query strings",
    "sequelize is the ORM, mysql2 is the MySQL driver it talks through, sequelize-cli is the development-time generator trio the journal installs as (dependencies, dependency, devDependency)",
    "Install with: npm init -y; npm i sequelize mysql2; npm i -D sequelize-cli",
    "npx sequelize-cli init scaffolds config/ (connection settings), models/ (tables as JS), migrations/ (schema changes) and seeders/ (starter data)",
    "The journal's Lab16, proj-2408023, lab20 and Advanced_associations projects all declare the same sequelize ^6.37.8 + mysql2 stack — this is the unit's standard setup"
  ],
  practice: `
    <p>Reproduce the journal's setup in a scratch folder: <code>npm init -y</code>, then
    <code>npm i sequelize mysql2</code> and <code>npm i -D sequelize-cli</code>, and diff your
    resulting <code>package.json</code> against
    <code>sorted_files/07_Week-07_Sequelize-MySQL/Lab16/package.json</code> — the dependency
    blocks should match. Then run <code>npx sequelize-cli init</code> and open the generated
    <code>config/config.json</code>; find the <code>database</code>, <code>port</code> and
    <code>dialect</code> keys you already recognise from last lesson's examples, and set the
    development database to <code>nishant</code>.</p>
  `,
  quiz: [
    {
      q: "What are the jobs of sequelize and mysql2 respectively?",
      options: [
        "sequelize is the ORM that builds queries and maps rows to objects; mysql2 is the driver that actually talks the MySQL protocol over the network",
        "mysql2 is the ORM; sequelize is the MySQL driver",
        "Both are ORMs — you install two for redundancy",
        "sequelize runs the database server; mysql2 is the GUI"
      ],
      answer: 0,
      why: "Sequelize builds and escapes queries and turns rows into JavaScript objects, but it needs a driver to put bytes on the wire — that is mysql2 (and why both sit in dependencies)."
    },
    {
      q: "Which folder does npx sequelize-cli init create to hold your connection settings?",
      options: [
        "config/ — with config.json split into development, test and production",
        "models/ — one connection file per table",
        "migrations/ — connection scripts run at startup",
        "connections/ — a folder the CLI names after the database"
      ],
      answer: 0,
      why: "config/config.json holds username/password/database/host/port per environment — you have already read two real ones from the journal (examples in Lesson 39)."
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/getting-started/",
    "https://www.npmjs.com/package/sequelize",
    "https://www.npmjs.com/package/mysql2"
  ]
});
