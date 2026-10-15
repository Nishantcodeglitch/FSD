window.COURSE_LESSONS.push({
  id: "w08-writing-migrations",
  file: "047",
  unit: 2,
  week: 8,
  title: "Writing and running migrations",
  kicker: "Unit II · Week 8 · Lesson 4 of 5",
  minutes: 20,
  objectives: [
    "Read a migration file and explain every part of its up() and down() functions",
    "Use queryInterface methods: createTable, addColumn, removeColumn and dropTable",
    "Generate, run, inspect and undo migrations with sequelize-cli commands",
    "Keep a model and its migration in agreement, including table-name case"
  ],
  intro: `
    <p>Last lesson you learned <em>why</em> migrations exist: an ordered, reversible,
    shareable history of every change to your database structure, recorded in
    <code>SequelizeMeta</code>. Today you write them. Every migration in this lesson is a real
    file from the journal — the <code>users</code> migrations of Lab16 and proj-2408023, and the
    three numbered files of the association lab — and every terminal output was produced by the
    same <code>sequelize-cli 6.6.5</code> that <code>package.json</code> in those projects
    installs.</p>
    <p>Nothing here needs the connection from Week 7 until the very last command: writing a
    migration is writing JavaScript; only <code>db:migrate</code> reaches out to MySQL.</p>
  `,
  theory: [
    `
      <h3>Anatomy: one file, two functions</h3>
      <p>A migration is a CommonJS module exporting exactly two async functions. Both receive
      the same two arguments:</p>
      <ul>
        <li><code>queryInterface</code> — an object of database-changing methods. The ones you
        will use in your first month:</li>
      </ul>
      <table>
        <thead><tr><th>Method</th><th>SQL it runs</th></tr></thead>
        <tbody>
          <tr><td><code>createTable(name, columns)</code></td><td><code>CREATE TABLE ...</code></td></tr>
          <tr><td><code>dropTable(name)</code></td><td><code>DROP TABLE ...</code></td></tr>
          <tr><td><code>addColumn(table, column, definition)</code></td><td><code>ALTER TABLE ... ADD ...</code></td></tr>
          <tr><td><code>removeColumn(table, column)</code></td><td><code>ALTER TABLE ... DROP ...</code></td></tr>
          <tr><td><code>renameColumn(table, old, new)</code></td><td><code>ALTER TABLE ... RENAME ...</code></td></tr>
        </tbody>
      </table>
      <ul>
        <li><code>Sequelize</code> — the data-type namespace. Inside a migration you write
        <code>Sequelize.STRING</code>, <code>Sequelize.INTEGER</code>, <code>Sequelize.DATE</code>.
        Exactly the same types as Lesson 45's <code>DataTypes</code>, under a different alias,
        because the CLI passes the <code>Sequelize</code> class itself.</li>
      </ul>
      <p>The contract between the two functions is simple and absolute:
      <strong><code>down()</code> must undo <code>up()</code> exactly</strong>. If
      <code>up()</code> creates a table, <code>down()</code> drops it; if <code>up()</code> adds
      a column, <code>down()</code> removes it. That contract is what makes
      <code>db:migrate:undo</code> safe.</p>
    `,
    `
      <h3>Creating the file</h3>
      <p><code>npx sequelize-cli migration:generate --name create-user-table</code> writes an
      empty migration for you, prefixed with a timestamp:</p>
      <pre>migrations/20260828063041-create-user-table.js
              ^^^^^^^^^^^^ YYYYMMDDHHMMSS — when it was written</pre>
      <p>The timestamp is not decoration: pending migrations run in filename order, so the
      prefix guarantees chronological order no matter how your files are created. (The
      association lab hand-numbered its files <code>1-create-department.js</code>,
      <code>2-create-student.js</code>, <code>3-create-passport.js</code> — that works too,
      because those names still sort correctly, but the timestamp style is the default for good
      reason.)</p>
      <p>The generated skeleton is shown in example 4. Note the comment
      <code>/** @type {import('sequelize-cli').Migration} */</code> — it is only an editor
      hint, and the journal's own migration files kept it.</p>
    `,
    `
      <h3>The shortcut: model:generate</h3>
      <p>There is a second generator, and it is the one most tutorials show first:</p>
      <pre>npx sequelize-cli model:generate --name User --attributes name:string,email:string</pre>
      <p>It writes <strong>two</strong> files in one command:</p>
      <ul>
        <li><code>models/user.js</code> — the model, already wired to your <code>db.js</code>,
        with every attribute you listed given a Sequelize type;</li>
        <li><code>migrations/&lt;timestamp&gt;-create-user.js</code> — the matching migration,
        with a <code>createTable</code> whose columns mirror those attributes.</li>
      </ul>
      <p>So it is one command standing in for two steps: writing the model yourself (Lesson 44)
      and running <code>migration:generate</code> (just above). <code>model:create</code> is an
      alias for exactly the same thing, and <code>seed:generate</code> is the third sibling,
      used for data seeders rather than schema.</p>
      <p><strong>Why this book does not lead with it.</strong> None of the journal's projects
      used it — Lab16, proj-2408023 and the association lab each hand-wrote their
      <code>models/*.js</code> and generated the migration separately — and that is a habit
      worth keeping. The model is where the real work lives: <code>allowNull</code>,
      <code>isEmail</code>, <code>len</code>, <code>min</code>/<code>max</code>, foreign keys,
      associations (Week 10). A generator gives you a skeleton, not a schema. It also names the
      table for you, pluralised and capitalised (<code>User</code> → table
      <code>Users</code>) — the exact habit that produced the case mismatches in rule 3 below.</p>
      <p>Two things it does <em>not</em> do: it never connects to MySQL (generating is
      file-writing only — <code>db:migrate</code> is what connects), and it never creates your
      database (rule 4). Run it once, read what it produced, and treat the output as a first
      draft you are expected to edit.</p>
    `,
    `
      <h3>Running, checking, undoing</h3>
      <p><code>npx sequelize-cli db:migrate</code> is the moment of truth. It: reads
      <code>config/config.json</code> (default environment <code>development</code>); connects
      to MySQL; creates <code>SequelizeMeta</code> if it is missing; runs each pending
      migration's <code>up()</code> in filename order, printing a line before and after each;
      records the names. Example 5 shows the real transcript.</p>
      <p>Two companion commands complete the set:</p>
      <ul>
        <li><code>npx sequelize-cli db:migrate:status</code> — prints <code>up</code> or
        <code>down</code> next to every migration file, so you can see at a glance which
        database has received which changes.</li>
        <li><code>npx sequelize-cli db:migrate:undo</code> — runs the <code>down()</code> of the
        most recent applied migration. (Use <code>--name</code> to pick a specific one, and
        <code>db:migrate:undo:all</code> to unwind everything.)</li>
      </ul>
      <p>And if you run <code>db:migrate</code> when there is nothing pending, you get the
      friendly <code>No migrations were executed, database schema was already up to date.</code></p>
    `,
    `
      <h3>Four rules that will save your weekend</h3>
      <ol>
        <li><strong>Never edit a migration that has already run.</strong> Your database (and
        your teammates' databases) already recorded that name as done, so the edit will never
        execute there — the databases silently diverge. Wrong change? Undo it, then write a new
        migration.</li>
        <li><strong>Model and migration must describe the same table.</strong> The model says
        <code>emial</code>, the migration creates <code>emial</code> — consistent, if
        misspelled. Rename one without the other and Lesson 45's silent-drop bug returns.</li>
        <li><strong>Watch the case of table names.</strong> Sequelize pluralises the model name
        with a capital: <code>Passport</code> → <code>Passports</code>. Migration 3 of the lab
        creates <code>'passports'</code> with a lowercase <code>p</code>, and proj-2408023's
        migration creates <code>'users'</code> while its model wants <code>Users</code>. MySQL
        on Windows (XAMPP) folds table-name case, so both worked in class — on Linux servers,
        where names are case-sensitive, those pairs would break. Match the case exactly and the
        problem never exists.</li>
        <li><strong>The database must already exist.</strong> The CLI creates <em>tables</em>,
        not databases: <code>CREATE DATABASE nishant;</code> in phpMyAdmin (or raw SQL) comes
        first, every time.</li>
      </ol>
      <p>One more habit, cheap and worth it: run <code>db:migrate:status</code> after every
      migration you write. It is the fastest way to find out that your migration never ran
      because you were in the wrong folder (the CLI looks for <code>migrations/</code> under
      your current directory).</p>
    `
  ],
  examples: [
    {
      title: "proj-2408023/migrations/20260828063041-create-user-table.js: the canonical create",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/proj-2408023/migrations/20260828063041-create-user-table.js",
      lang: "javascript",
      code: `
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
`,
      explain: [
        "The filename's timestamp prefix (<code>20260828063041</code> = 28 Aug 2026, 06:30:41) fixes the execution order; the rest is a readable name for humans.",
        "<code>up()</code> is one call: <code>createTable('users', { ...columns })</code>. Each key becomes a column; <code>id</code> is spelled out as <code>INTEGER autoIncrement primaryKey NOT NULL</code>.",
        "<code>age</code> keeps <code>allowNull: true</code> — being explicit here costs nothing and documents the design.",
        "<code>defaultValue: Sequelize.fn('NOW')</code> is a <em>SQL function</em>, not a JavaScript Date: MySQL fills <code>createdAt</code> itself at insert time.",
        "<code>down()</code> is the exact inverse — <code>dropTable('users')</code> — so <code>db:migrate:undo</code> returns the database to empty. And every column here mirrors <code>models/user.js</code> (Lesson 45): keep the two open side by side whenever you change either."
      ]
    },
    {
      title: "Lab16/migrations/20260829180812-create-users-table.js: the same table, no timestamp columns",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/Lab16/migrations/20260829180812-create-users-table.js",
      lang: "javascript",
      code: `
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      age: {
        type: Sequelize.INTEGER
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
`,
      explain: [
        "Written one day after proj's (note the later timestamp) and almost identical — the course's standard users table.",
        "No <code>createdAt</code>/<code>updatedAt</code> columns, matching the model's <code>timestamps: false</code>. Agreement between model and migration, both directions.",
        "Table name <code>'Users'</code> with a capital U — which is exactly what <code>define('User')</code> produces by default (Lesson 44). This pair is consistent; proj-2408023's lowercase <code>'users'</code> is not.",
        "<code>age</code> with no options: nullable, default <code>INTEGER</code>. Shorthand is fine when it is deliberate."
      ]
    },
    {
      title: "sequelize-association-lab/migrations/3-create-passport.js: foreign keys and a case slip",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/migrations/3-create-passport.js",
      lang: "javascript",
      code: `
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('passports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      passportNumber: {
        type: Sequelize.STRING
      },
      studentId:{
        type:Sequelize.INTEGER,
        references:{
          model:"Students",
          key:"id"
        }
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('passports');
  }
};
`,
      explain: [
        "The third of the lab's hand-named migrations. Because it runs after <code>2-create-student.js</code>, the table it points at (<code>Students</code>) already exists.",
        "<code>references: { model: \"Students\", key: \"id\" }</code> is a foreign key — MySQL will enforce that every <code>studentId</code> really exists in <code>Students</code> (Week 10 builds the JavaScript side).",
        "Generated SQL (verified): <code>CREATE TABLE IF NOT EXISTS `passports` (`id` INTEGER NOT NULL auto_increment , `passportNumber` VARCHAR(255), `studentId` INTEGER, PRIMARY KEY (`id`), FOREIGN KEY (`studentId`) REFERENCES `Students` (`id`)) ENGINE=InnoDB;</code>.",
        "<strong>Spot the slip:</strong> the table is <code>passports</code> (lowercase) but the model <code>Passport</code> maps to <code>`Passports`</code>. XAMPP's MySQL on Windows ignores table-name case, so the lab ran; on a Linux server the two names are different tables. Type the capital."
      ]
    },
    {
      title: "The skeleton migration:generate writes for you",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
`,
      explain: [
        "Verbatim from sequelize-cli 6.6.5's own template — compare it with the journal's three migrations: same shape, same <code>'use strict'</code>, same type-hint comment.",
        "Both functions are <code>async</code> and both must <code>await</code> their <code>queryInterface</code> calls. Forgetting <code>await</code> is the classic bug: the migration \"succeeds\" before the SQL finishes, and the error surfaces later as a confusing failure.",
        "An empty <code>up()</code> is a no-op that still gets recorded as done — which is why a fresh skeleton deserves a real body before you run <code>db:migrate</code>.",
        "The <code>Sequelize</code> parameter is the class itself: <code>Sequelize.STRING</code>, <code>Sequelize.DATE</code>, <code>Sequelize.fn('NOW')</code> all hang off it."
      ]
    },
    {
      title: "Generate, migrate, inspect, undo — the full loop",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# creates an empty migration (no database is contacted)
npx sequelize-cli migration:generate --name create-users-table

# apply every pending migration, oldest first
npx sequelize-cli db:migrate

# see what this database has and has not run
npx sequelize-cli db:migrate:status

# undo the most recent one (runs its down())
npx sequelize-cli db:migrate:undo
`,
      explain: [
        "<code>migration:generate</code> only writes a file — you can do it with MySQL switched off, and you should do it before you touch any database. Its real first line is <code>Sequelize CLI [Node: 24.19.0, CLI: 6.6.5, ORM: 6.37.8]</code>, then <code>New migration was created at ...migrations/20261015121619-create-users-table.js .</code> (the versions and the absolute path depend on your machine).",
        "<code>db:migrate</code> is the only command here that connects, and it prints a pair of lines per migration: <code>migrating</code> then <code>migrated (0.241s)</code> with the elapsed time.",
        "<code>db:migrate:status</code> prints <code>up &lt;filename&gt;</code> for applied migrations and <code>down &lt;filename&gt;</code> for pending ones — the fastest health check there is.",
        "<code>db:migrate:undo</code> executes the matching <code>down()</code>; for these projects that means a <code>DROP TABLE</code>, so use it deliberately.",
        "Run everything from inside the project folder (where <code>config/</code> and <code>migrations/</code> live) or the CLI will report that it cannot find the config."
      ],
      run: "npx sequelize-cli db:migrate",
      output: "== 20261015121619-create-users-table: migrating =======\n== 20261015121619-create-users-table: migrated (0.241s)"
    },
    {
      title: "The SQL a createTable migration runs",
      from: "new",
      file: "",
      lang: "sql",
      code: `
-- migration 2 of the association lab, as MySQL receives it:
CREATE TABLE IF NOT EXISTS \`Students\` (
  \`id\` INTEGER NOT NULL auto_increment ,
  \`name\` VARCHAR(255),
  \`emial\` VARCHAR(255),
  \`departmentId\` INTEGER,
  PRIMARY KEY (\`id\`),
  FOREIGN KEY (\`departmentId\`) REFERENCES \`Departments\` (\`id\`)
) ENGINE=InnoDB;
`,
      explain: [
        "Captured with Sequelize 6.37.8 by running the journal's own <code>queryInterface.createTable</code> definition — the migration file and this statement are the same thing.",
        "<code>Sequelize.STRING</code> became <code>VARCHAR(255)</code>, <code>Sequelize.INTEGER</code> became <code>INTEGER</code>: the migration alias behaves exactly like the model's <code>DataTypes</code> (Lesson 45's table).",
        "The <code>references</code> block became a <code>FOREIGN KEY ... REFERENCES ...</code> clause — now the database itself guarantees the pointer is valid.",
        "<code>IF NOT EXISTS</code> is why re-running is harmless, and also why a migration will never \"fix\" a table that already exists under a different shape.",
        "And there it is again, in SQL: <code>`emial`</code>. Fix the model <em>and</em> this migration together."
      ]
    },
    {
      title: "Growing a table later: addColumn and removeColumn",
      from: "new",
      file: "",
      lang: "sql",
      code: `
-- up() of a migration that adds a phone column:
--   await queryInterface.addColumn('Students', 'phone', { type: Sequelize.STRING, allowNull: true });
ALTER TABLE \`Students\` ADD \`phone\` VARCHAR(255);

-- its down():
--   await queryInterface.removeColumn('Students', 'phone');
ALTER TABLE \`Students\` DROP \`phone\`;
`,
      explain: [
        "The journal's notes said migrations handle \"creating columns adding column removing column\" — this is that, in SQL.",
        "These two statements come from a real <code>addColumn</code>/<code>removeColumn</code> pair against the lab's <code>Students</code> table.",
        "This is precisely what <code>sync()</code> cannot do: the table already exists, so <code>CREATE TABLE IF NOT EXISTS</code> would skip it and the new column would never appear.",
        "Order matters in the real world: adding a <code>NOT NULL</code> column to a table that already has rows needs a <code>defaultValue</code>, or MySQL has nothing to put in the old rows."
      ]
    }
  ],
  keyPoints: [
    "A migration exports up(queryInterface, Sequelize) to apply a change and down(...) to reverse it exactly",
    "queryInterface is your toolbox: createTable, dropTable, addColumn, removeColumn, renameColumn — they become CREATE/ALTER/DROP statements",
    "migration:generate writes an empty file named YYYYMMDDHHMMSS-name.js; the timestamp guarantees execution order",
    "model:generate writes models/user.js and the matching migration together (--name User --attributes name:string,email:string); it only writes files — db:migrate is what connects, and validations are still your job",
    "db:migrate applies pending migrations in order and records them in SequelizeMeta; db:migrate:status lists them; db:migrate:undo runs the last down()",
    "Never edit a migration that has already run — write a new one; and keep model and migration in exact agreement, including table-name case"
  ],
  practice: `
    <p>Take the association lab to a scratch folder, run <code>npm i</code>, and add a fourth
    migration by hand: create
    <code>migrations/4-add-phone-to-students.js</code> whose <code>up()</code> is
    <code>await queryInterface.addColumn('Students', 'phone', { type: Sequelize.STRING, allowNull: true });</code>
    and whose <code>down()</code> removes it again. Use example 3's file as your formatting
    guide.</p>
    <p>With MySQL running and <code>association_db</code> created, run
    <code>npx sequelize-cli db:migrate</code>, then
    <code>npx sequelize-cli db:migrate:status</code> (your file should say <code>up</code>),
    then <code>npx sequelize-cli db:migrate:undo</code> and check the status again — it flips to
    <code>down</code>. Finally, confirm the column really appeared and disappeared:
    <code>DESCRIBE Students;</code> in phpMyAdmin.</p>
  `,
  quiz: [
    {
      q: "A migration's up() creates a table called Classes. What must its down() do?",
      options: [
        "Nothing — down() may stay empty for a createTable migration",
        "Drop the Classes table, so that undoing the migration returns the database to its previous state",
        "Create a backup table called Classes_old",
        "Delete the migration file from disk"
      ],
      answer: 1,
      why: "down() is the exact inverse of up(). db:migrate:undo runs it, so a create is undone by a drop — anything less breaks the promise the migration system is built on."
    },
    {
      q: "You already ran a migration, then spotted a typo in it and edited the file. What happens next time you (or a teammate) run db:migrate?",
      options: [
        "The corrected migration runs automatically and fixes the database",
        "Sequelize asks interactively whether to re-run it",
        "Nothing: the database recorded that migration's name as done in SequelizeMeta, so the edited version never runs there — the databases diverge silently",
        "The edit rolls the database back and re-applies everything"
      ],
      answer: 2,
      why: "The bookkeeping table stores names, not contents. A changed file with a known name is invisible to the CLI — which is why the rule is: undo it, then write a new migration with the fix."
    },
    {
      q: "You run npx sequelize-cli model:generate --name User --attributes name:string,email:string. What has happened when it returns?",
      options: [
        "The Users table now exists in MySQL, with the two columns",
        "The database has been created, the two files written and the migration applied",
        "Two files are on disk — models/user.js and a matching migration — and nothing has touched MySQL yet; the validations are still yours to add",
        "The model is written and the table is created the first time you run a query"
      ],
      answer: 2,
      why: "Generators only write files: models/user.js plus a createTable migration whose columns mirror the --attributes list. The table appears when db:migrate runs that migration's up(), the CLI never creates your database, and it cannot know your business rules — isEmail, len, allowNull: false and foreign keys are added by hand. That is exactly why the journal's projects wrote their models themselves."
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/other-topics/migrations/",
    "https://sequelize.org/api/v6/classes/queryinterface",
    "https://github.com/sequelize/cli"
  ]
});
