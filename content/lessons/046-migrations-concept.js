window.COURSE_LESSONS.push({
  id: "w08-migrations-concept",
  file: "046",
  unit: 2,
  week: 8,
  title: "Migrations: version-controlled schema",
  kicker: "Unit II · Week 8 · Lesson 3 of 5",
  minutes: 15,
  objectives: [
    "Explain the difference between describing a table (model) and building it (migration)",
    "Say three concrete reasons sync() is not enough for a real project",
    "Describe what a migration's up() and down() functions are responsible for",
    "Name the file sequelize-cli reads for connection settings and the table it uses for history"
  ],
  intro: `
    <p>Last lesson you filled in the braces of <code>define()</code>: types, options,
    validations. The model now describes <code>Users</code> perfectly — and if you run nothing
    else, MySQL has never heard of it. Week 7's <code>db.js</code> had a quick answer,
    <code>sequelize.sync()</code>, and it worked for a first lab. This lesson explains why that
    answer stops working the moment a project has a past, teammates, or real data, and introduces
    the replacement the whole back end of this course uses: <strong>migrations</strong>.</p>
    <p>The connection you built in Week 7 does not disappear — the migration CLI reads exactly
    the same username/password/host/port from <code>config/config.json</code> — but now it is
    used at <em>development time</em>, by a command-line tool, instead of at run time by your
    server.</p>
  `,
  theory: [
    `
      <h3>Two jobs, two files</h3>
      <p>Your journal's own notes put it in one sentence, and it is the right one:</p>
      <blockquote>
        model handles business logic, queris and relationships<br>
        migrations file handles creating columns adding column removing columns<br>
        overall changing database structure
      </blockquote>
      <p>A <strong>model</strong> says what a table looks like <em>now</em>. A
      <strong>migration</strong> is a small numbered script that moves the real database from
      what it looked like before to what it looks like now. Think of it as git for your schema:
      every change is a commit, every commit has a name, and anyone can replay the whole history
      on a fresh machine.</p>
      <pre class="diagram">models/user.js        migrations/20260828063041-create-user-table.js
---------------       ------------------------------------------
"a User has these     "step 1: create the users table
 columns"             step 2: later add a phone column
                      step 3: later drop the age column"
(describe)            (do, step by step, in order)</pre>
    `,
    `
      <h3>Why not just sync()?</h3>
      <p>Sequelize's <code>sync()</code> reads your models and asks MySQL to make the world
      match. With no arguments it creates any table that does not exist yet;
      <code>sync({ force: true })</code> drops existing tables first (that is the nuclear
      option, and it deletes data); <code>sync({ alter: true })</code> tries to patch existing
      tables. Example 5 shows the SQL that a plain <code>sync()</code> issues against the
      journal's User model.</p>
      <p>It is perfect for a throwaway experiment and dangerous for everything else, for three
      concrete reasons:</p>
      <ol>
        <li><strong>It has no memory.</strong> <code>sync()</code> creates tables that are
        missing; it does not know that last week's table needs a new column, so your colleague's
        already-created table silently lacks it. (Adding a column is a migration's job —
        Lesson 47.)</li>
        <li><strong>It cannot roll back.</strong> If the change was wrong, there is no
        <code>down()</code> to undo it and no record of what ran.</li>
        <li><strong>Every machine diverges.</strong> With no history to replay, your laptop,
        your teammate's laptop and the server each end up slightly different, and "it works on
        my machine" becomes a database problem.</li>
      </ol>
      <p>Migrations solve all three: an ordered list of changes, an undo for each one, and a
      bookkeeping table so the CLI knows exactly which changes any given database has already
      received.</p>
    `,
    `
      <h3>How the CLI keeps score</h3>
      <p><code>sequelize-cli</code> runs migrations and records them in a table named
      <strong><code>SequelizeMeta</code></strong> inside your database. It has a single column,
      <code>name</code>, holding the filename of every migration that has been applied:</p>
      <pre>SELECT * FROM SequelizeMeta;
+---------------------------------------+
| name                                  |
+---------------------------------------+
| 20260828063041-create-user-table      |
| 20260829180812-create-users-table     |
+---------------------------------------+</pre>
      <p>Running <code>npx sequelize-cli db:migrate</code> compares that list with the files in
      your <code>migrations/</code> folder and executes, in timestamp order, only the ones the
      database has not seen. A brand-new database therefore rebuilds the entire schema by
      replaying history — which is exactly what you want for a demo, a test database or a
      deployment.</p>
    `,
    `
      <h3>Where the CLI learns your connection</h3>
      <p>The tool has no idea how to reach MySQL until you tell it, and it looks in one place:
      <code>config/config.json</code>, choosing the block named by <code>NODE_ENV</code>
      (defaulting to <code>development</code>). Every key you already met in Week 7 is here:</p>
      <table>
        <thead><tr><th>Key</th><th>Meaning</th></tr></thead>
        <tbody>
          <tr><td><code>username</code> / <code>password</code></td><td>MySQL login — XAMPP's default is <code>root</code> with an empty password</td></tr>
          <tr><td><code>database</code></td><td>which database to alter (it must already exist — the CLI creates <em>tables</em>, not databases)</td></tr>
          <tr><td><code>host</code></td><td>usually <code>127.0.0.1</code> for XAMPP</td></tr>
          <tr><td><code>port</code></td><td>3306 normally; the journal's proj-2408023 says 3307 because of the machine it was written on</td></tr>
          <tr><td><code>dialect</code></td><td><code>mysql</code> — tells Sequelize which SQL dialect to speak</td></tr>
        </tbody>
      </table>
      <div class="warn">
        <strong>Two of the journal's configs will not work on your machine as written.</strong>
        proj-2408023 points at port <code>3307</code>, and the association lab's
        <code>config.json</code> has no <code>port</code> key at all (Sequelize then assumes
        3306). XAMPP listens on 3306 unless another MySQL stole the port. If you get
        <code>ECONNREFUSED</code>, that key — not your code — is the first suspect.
      </div>
    `
  ],
  examples: [
    {
      title: "08_Week-08_Models-Migrations/notes-2408023.txt: the student's own summary",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/notes-2408023.txt",
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
        "Verbatim from the journal, typos included — this is the week's own to-do list: scaffold, generate, migrate.",
        "<code>up</code> \"applies the change\", <code>down</code> \"does the down shift\" — i.e. reverses it. Lesson 47 opens these files for real.",
        "The model/migration split quoted in the theory above comes from this file.",
        "That commented last line is the punchline: everything before it is preparation for one command, <code>npx sequelize-cli db:migrate</code>."
      ]
    },
    {
      title: "proj-2408023/db.js: the sync() shortcut the journal started with",
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
        "Week 7's connection, unchanged — but look what happens after <code>authenticate()</code>: <code>sequelize.sync()</code> creates the table straight from the model. No migration file involved.",
        "That is the prototype workflow: define the model, run the script, get a table. Perfectly fine for an experiment you can afford to throw away.",
        "Note <code>port: 3307</code> — on today's XAMPP (3306) this script fails with <code>ECONNREFUSED</code> before it can sync anything.",
        "Also note: <code>module.exports</code> is missing from this file, which is why Lesson 44's <code>books.js</code> stub could not work either.",
        "The migration approach replaces the <code>.sync()</code> block with <code>npx sequelize-cli db:migrate</code> and keeps the model as description only."
      ]
    },
    {
      title: "proj-2408023/config/config.json: what the CLI reads first",
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
        "Three environments in one file. <code>db:migrate</code> uses <code>development</code> unless you export <code>NODE_ENV</code> — so experiments hit your own database, never production.",
        "The database (<code>nishant</code>, the student's own name) must already exist: the CLI creates tables <em>inside</em> it, not the database itself. Make it once in phpMyAdmin, as in Lesson 39.",
        "<code>\"password\": null</code> is JSON's way of saying \"no password\" — XAMPP's root user ships with none.",
        "<code>\"port\": 3307</code> is machine-specific. If migrations die with <code>ECONNREFUSED</code>, this is one of the two places to correct (the other being db.js).",
        "The three blocks also explain the journal's odd port mix: dev and test on 3307 while Lab16's production block says 3307 and its development block says 3306."
      ]
    },
    {
      title: "sequelize-association-lab/config/config.json: the same file, different project",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/config/config.json",
      lang: "json",
      code: `
{
  "development": {
    "username": "root",
    "password": "",
    "database": "association_db",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
`,
      explain: [
        "A second real config to compare against: different database (<code>association_db</code>), and an empty-string password instead of <code>null</code> — both are accepted.",
        "No <code>port</code> key at all. Sequelize fills the default (3306) for you, which is why this project's migrations run on a stock XAMPP with no editing.",
        "Lesson: the skeleton is identical across projects; only the values differ per machine and per database.",
        "The database itself is created by hand — <code>CREATE DATABASE association_db;</code> — before any migration runs."
      ]
    },
    {
      title: "What sync() actually sends to MySQL",
      from: "new",
      file: "",
      lang: "sql",
      code: `
-- sequelize.sync() with the journal's User model:
CREATE TABLE IF NOT EXISTS \`Users\` (
  \`id\` INTEGER NOT NULL auto_increment ,
  \`username\` VARCHAR(255) NOT NULL UNIQUE,
  \`email\` VARCHAR(255) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`age\` INTEGER,
  \`createdAt\` DATETIME NOT NULL,
  \`updatedAt\` DATETIME NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB;

-- sequelize.sync({ force: true }) first runs:
DROP TABLE IF EXISTS \`Users\`;
`,
      explain: [
        "Captured with Sequelize 6.37.8 while loading the journal's model — this is the real statement, wrapped here for readability; the log prints it as one line.",
        "Note the table name: the model is called <code>User</code>, so Sequelize pluralises it to <code>`Users`</code> — Lesson 44's <code>getTableName()</code> trick again.",
        "<code>CREATE TABLE IF NOT EXISTS</code> is the reason plain <code>sync()</code> is safe to re-run but useless for changing an existing table: if the table is there, the statement does nothing at all.",
        "The model's <code>allowNull: false</code> and <code>unique: true</code> became <code>NOT NULL</code> and <code>UNIQUE</code> — constraints that live in MySQL, not in Node.",
        "<code>force: true</code> prints a <code>DROP TABLE</code> first: that is a real table full of real rows being deleted, which is why it belongs in development only. A migration issues the same kind of statement — but as file #1 of a history, with a matching <code>down()</code>, instead of an undocumented side effect of starting your server."
      ]
    },
    {
      title: "The migration workflow in four commands",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# 1. scaffold the project (creates config/, models/, migrations/, seeders/)
npx sequelize-cli init

# 2. describe a change to the schema (creates an empty file, touches no database)
npx sequelize-cli migration:generate --name create-user-table

# 3. apply every pending migration, in timestamp order
npx sequelize-cli db:migrate

# 4. undo the most recent one if it was wrong
npx sequelize-cli db:migrate:undo
`,
      explain: [
        "Steps 1 and 2 need no database at all — they only create files. That is the point of \"schema as code\": the change is written, reviewed and committed before it touches anything.",
        "Step 3 connects with <code>config/config.json</code>, creates the bookkeeping table <code>SequelizeMeta</code>, and runs each pending migration's <code>up()</code>.",
        "Run it a second time and you get <code>No migrations were executed, database schema was already up to date.</code> — the CLI is idempotent because of that bookkeeping table.",
        "Step 4 runs the matching <code>down()</code> of the last migration — in this journal's files, usually a <code>dropTable</code>.",
        "Nothing here runs when your server starts. Migrations are executed by a human (or a deploy script), on purpose, at a moment you choose."
      ],
      run: "npx sequelize-cli db:migrate",
      output: "== 20260828063041-create-user-table: migrating =======\n== 20260828063041-create-user-table: migrated (0.241s)\n\n== 20260829180812-create-users-table: migrating =======\n== 20260829180812-create-users-table: migrated (0.187s)"
    }
  ],
  keyPoints: [
    "A model describes a table's current shape; a migration is a numbered script that changes the real database to match it",
    "sync() creates missing tables but never alters existing ones, has no history and no undo — fine for prototypes, wrong for shared databases",
    "Every migration exports up(queryInterface, Sequelize) to apply a change and down(...) to reverse it",
    "sequelize-cli reads config/config.json (environment NODE_ENV, default development) for username/password/database/host/port/dialect",
    "Applied migrations are recorded in the SequelizeMeta table, so db:migrate only runs what a given database has not seen yet"
  ],
  practice: `
    <p>Set the stage without touching any real data. In a scratch folder run
    <code>npx sequelize-cli init</code>, then open <code>config/config.json</code> and set the
    <code>development</code> block to your own machine — for XAMPP that is
    <code>username: root</code>, an empty <code>password</code>, <code>host: 127.0.0.1</code>,
    <code>port: 3306</code>, <code>dialect: mysql</code> — and a database you created in
    phpMyAdmin.</p>
    <p>Now generate a migration with
    <code>npx sequelize-cli migration:generate --name first-table</code> (no database is needed
    for this) and open the file it prints. You will see the empty <code>up</code>/<code>down</code>
    pair that Lesson 47 fills in. Finally, compare the three journal configs —
    <code>proj-2408023/config/config.json</code>, <code>Lab16/config/config.json</code> and the
    association lab's — and write down which one you would copy, and what you would change in
    it.</p>
  `,
  quiz: [
    {
      q: "What is the fundamental difference between a model and a migration?",
      options: [
        "Models are for MySQL, migrations are for PostgreSQL",
        "A model declares what a table should look like; a migration is the script that makes an existing database actually change to look like that",
        "Models run at run time, migrations run only in the browser",
        "There is no difference — a migration is just another name for a model"
      ],
      answer: 1,
      why: "The model is a description kept in sync with your code; the migration is the ordered, recorded, reversible action that transforms the database. One says, the other does."
    },
    {
      q: "You run `npx sequelize-cli db:migrate` a second time right after a successful run. What do you see and why?",
      options: [
        "The migrations run again, doubling your tables",
        "Nothing happens and the tables are dropped",
        "'No migrations were executed, database schema was already up to date.' — the CLI checked the SequelizeMeta bookkeeping table and found nothing pending",
        "A new migration is generated automatically"
      ],
      answer: 2,
      why: "Every applied migration is recorded by name in SequelizeMeta, so db:migrate is safe to re-run: it only executes files that database has not seen."
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/other-topics/migrations/",
    "https://sequelize.org/api/v6/classes/cli"
  ]
});
