window.COURSE_LESSONS.push({
  id: "w07-databases-and-mysql",
  file: "039",
  unit: 2,
  week: 7,
  title: "Databases and MySQL from scratch",
  kicker: "Unit II · Week 7 · Lesson 1 of 5",
  minutes: 20,
  objectives: [
    "Explain what a database is and describe tables, rows and columns",
    "Say in one paragraph when SQL and when NoSQL is the right tool",
    "Install MySQL through XAMPP and start Apache + MySQL in the control panel",
    "Create a database and a table both in the phpMyAdmin GUI and with raw SQL"
  ],
  intro: `
    <p>Welcome to <strong>Unit II</strong>. In Unit I you learned to build servers, read and
    write files, schedule jobs and bundle modules — but every one of your programs forgot
    everything the moment it exited. The <code>fs.writeFile</code> tricks from Weeks 1–4 were a
    stop-gap: rewriting a whole text file every time one number changes does not scale, breaks
    the moment two requests arrive at once, and gives you no way to ask questions like
    "every user older than 20".</p>
    <p>Now that you can build servers, they need to <strong>remember data</strong>. That is what
    a database is for, and this lesson starts at absolute zero: what a database actually is, what
    MySQL has to do with it, how to get MySQL running on your machine with XAMPP, and how to
    create your first database and table — both by clicking in phpMyAdmin and by typing real SQL.
    Everything in Weeks 7–10, and the whole back half of this book, sits on top of what you learn
    right here.</p>
  `,
  theory: [
    `
      <h3>Why a database, not a text file</h3>
      <p>A <strong>database</strong> is a program whose only job is to store, organise and answer
      questions about data — safely and quickly, even when many programs ask at the same time.
      You already met one by accident: <code>node_modules</code> is not a database, but
      phpMyAdmin, which you will use in a moment, is a window into one.</p>
      <p>The most common kind organises data into <strong>tables</strong>, like a spreadsheet:</p>
      <ul>
        <li>A <strong>table</strong> is one kind of thing — <code>users</code>,
        <code>products</code>, <code>orders</code>.</li>
        <li>A <strong>row</strong> (also a <em>record</em>) is one single thing — one user.</li>
        <li>A <strong>column</strong> (also a <em>field</em>) is one property shared by every
        row — <code>username</code>, <code>email</code>, <code>age</code>.</li>
      </ul>
      <pre class="diagram">users table
+----+----------+--------------------+-----+
| id | username | email              | age |
+----+----------+--------------------+-----+
|  1 | Nishant  | nishant@gmail.com  |  20 |  &lt;-- one row
|  2 | tushar   | tushar@gmail.com   |  19 |  &lt;-- one row
+----+----------+--------------------+-----+
  ^ column</pre>
      <p>Compare that with the text files you used in Unit I. A table gives you structure (every
      row has the same columns), concurrency (two requests can insert at once without clobbering
      each other), and questions ("all rows where <code>age &gt;= 20</code>") that would take you
      fifty lines of <code>fs</code> code — if the file even held still.</p>
    `,
    `
      <h3>SQL, NoSQL, and why this book picks SQL</h3>
      <p>Databases come in two big families. <strong>SQL</strong> databases (MySQL, PostgreSQL,
      SQLite, MariaDB) store data in tables and are queried with a shared language — SQL — that
      has looked roughly the same for 50 years. <strong>NoSQL</strong> databases (MongoDB,
      Redis, Firebase) store documents, key-value pairs or graphs instead of tables; they trade
      some of SQL's rigid guarantees for flexible schemas and easy horizontal scaling. One
      paragraph is honestly all you need today: if your data is record-shaped and the questions
      are "find rows matching conditions", SQL is the classic answer — which is why this course
      uses <strong>MySQL</strong>, one of the most widely deployed SQL databases in the world and
      the one your syllabus specifies. You can revisit NoSQL later; the concepts transfer.</p>
      <p>SQL databases are also called <strong>relational</strong>: tables can <em>reference</em>
      each other — a <code>orders</code> row points at the <code>users</code> row it belongs to —
      so the data forms relations rather than isolated piles. You will see this properly in
      Week 10 (associations); today, just remember the word.</p>
    `,
    `
      <h3>Getting MySQL running: XAMPP</h3>
      <p>MySQL is a server: a separate program that listens on a TCP port and answers database
      questions. You do not "import MySQL into Node" — your Node scripts <em>talk to</em> it over
      that port. The easiest way to install it on Windows or macOS is
      <strong>XAMPP</strong>, a free bundle that ships Apache (a web server), MySQL and a control
      panel that starts and stops them:</p>
      <ol>
        <li>Download XAMPP from <a href='https://www.apachefriends.org/' target='_blank' rel='noopener'>apachefriends.org</a>
        and install it.</li>
        <li>Open the <strong>XAMPP Control Panel</strong> and press <strong>Start</strong> next to
        <strong>Apache</strong> and next to <strong>MySQL</strong>. Both should turn green.</li>
        <li>Open <a href='http://localhost/phpmyadmin' target='_blank' rel='noopener'>http://localhost/phpmyadmin</a>
        in your browser — that is <strong>phpMyAdmin</strong>, a GUI for your databases.</li>
      </ol>
      <div class="callout">
        <strong>MySQL must be RUNNING, or everything else fails.</strong> If you skip the Start
        button, every Node script in this entire unit dies with
        <code>Error: connect ECONNREFUSED 127.0.0.1:3306</code> — nothing is listening on the
        port. That single error message will account for most of your debugging in Weeks 7–10, so
        learn it by sight now: <em>ECONNREFUSED means "the database is off" (or you typed the wrong
        port), not "your code is wrong"</em>. The journal's own notes confirm this — see the first
        example.
      </div>
      <p>XAMPP's MySQL normally listens on port <strong>3306</strong>. If another MySQL is
      already installed on your machine, XAMPP often moves to <strong>3307</strong> — you will see
      both numbers in the journal's files later this week, and Lesson 41 explains the difference
      honestly.</p>
    `,
    `
      <h3>Your first database: the GUI way and the SQL way</h3>
      <p>In phpMyAdmin you can click <strong>New</strong>, type a database name (the journal used
      <code>nishant</code>), pick a collation and press Go — a database is created. Under it you
      can click <strong>New</strong> again to design a table column by column. That is perfectly
      legitimate, but a full-stack developer also needs the typed version, because the typed
      version can live in a file, be reviewed, be re-run and be run by your Node code. The
      essential statements:</p>
      <table>
        <thead><tr><th>Statement</th><th>What it does</th></tr></thead>
        <tbody>
          <tr><td><code>SHOW DATABASES;</code></td><td>list every database on the server</td></tr>
          <tr><td><code>CREATE DATABASE nishant;</code></td><td>make a new empty database</td></tr>
          <tr><td><code>USE nishant;</code></td><td>select it so following statements target it</td></tr>
          <tr><td><code>CREATE TABLE users (...)</code></td><td>define a table and its columns</td></tr>
          <tr><td><code>INSERT INTO users ...</code></td><td>add a row</td></tr>
          <tr><td><code>SELECT * FROM users;</code></td><td>read rows back</td></tr>
        </tbody>
      </table>
      <p>You can type these into phpMyAdmin's <strong>SQL</strong> tab, or into the
      <code>mysql</code> command-line client that ships with XAMPP — both send the exact same
      statements to the exact same server. Examples 3–5 walk through both routes.</p>
    `
  ],
  examples: [
    {
      title: "The journal's own README: run prerequisites for this week",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/README.txt",
      lang: "text",
      code: `
Week 7: Sequelize+MySQL. Run inside Lab16/ or proj-2408023/ (needs MySQL + npm i).
The same projects also cover Weeks 8-9 (models/migrations/CRUD live inside them).
`,
      explain: [
        "The two-line README the journal keeps beside this week's projects — read it before running anything.",
        "needs MySQL + npm i — the two prerequisites this unit adds to everything you already know: a running database server, and a per-project npm install.",
        "The same projects also cover Weeks 8-9 — Lab16/ and proj-2408023/ grow with the course; this week we only wire up the connection."
      ]
    },
    {
      title: "Is MySQL even on? Ping it before you blame your code",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# With XAMPP's MySQL started, this answers instantly:
mysqladmin -u root ping
# output: mysqld is alive

# Stop MySQL in the XAMPP Control Panel and run it again:
mysqladmin -u root ping
# output: mysqladmin: connect to server at 'localhost' failed
# error: 'Can't connect to MySQL server on 'localhost' (10061)'
`,
      explain: [
        "<code>mysqladmin</code> is a tiny client that ships with MySQL; <code>-u root</code> says which database user to act as (XAMPP's default is <code>root</code> with no password).",
        "<code>mysqld is alive</code> is your green light — only now is it worth running any Node code.",
        "The second output is the CLI cousin of the <code>ECONNREFUSED</code> you would otherwise see from Node: nothing is listening, because you stopped it.",
        "Make this ping a reflex. Half of this unit's errors are answered by the XAMPP Control Panel, not by the code."
      ],
      run: "mysqladmin -u root ping",
      output: "mysqld is alive"
    },
    {
      title: "SQL part 1: create a database and step inside it",
      from: "new",
      file: "",
      lang: "sql",
      code: `
SHOW DATABASES;

CREATE DATABASE IF NOT EXISTS nishant;

USE nishant;

SHOW TABLES;
`,
      explain: [
        "Type these in phpMyAdmin's <strong>SQL</strong> tab (press Go after each statement or as one block) or in the <code>mysql</code> command-line client.",
        "<code>SHOW DATABASES;</code> lists what the server holds — XAMPP typically shows <code>information_schema</code>, <code>mysql</code>, <code>performance_schema</code>, <code>phpmyadmin</code> and <code>test</code> before yours.",
        "<code>CREATE DATABASE IF NOT EXISTS nishant</code> is idempotent — re-running it never errors, which matters once this line lives inside a setup script.",
        "<code>USE nishant;</code> selects the database; without it, every following statement must qualify table names (<code>nishant.users</code>).",
        "<code>SHOW TABLES;</code> returns an empty set right now — you are inside a brand-new database."
      ],
      run: "mysql -u root -p  (then paste the statements)",
      output: "+--------------------+\n| Database           |\n+--------------------+\n| information_schema |\n| mysql              |\n| nishant            |\n| performance_schema |\n| phpmyadmin         |\n+--------------------+\nEmpty set (0.00 sec)"
    },
    {
      title: "SQL part 2: the users table — create, fill, read",
      from: "new",
      file: "",
      lang: "sql",
      code: `
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  age INT
);

INSERT INTO users (username, email, age) VALUES
  ('Nishant', 'nishant@gmail.com', 20),
  ('tushar',  'tushar@gmail.com',  19);

SELECT * FROM users;
`,
      explain: [
        "<code>CREATE TABLE</code> defines the columns — this is exactly the shape Sequelize models will declare for you in Week 8, and the same values the journal's <code>create.js</code> inserts.",
        "<code>AUTO_INCREMENT PRIMARY KEY</code> gives every row a unique <code>id</code> the database assigns itself — the backbone of every relational table.",
        "<code>NOT NULL</code> is a database-level constraint: even raw SQL cannot insert a user without an email.",
        "The final <code>SELECT *</code> returns both rows — the payoff. In phpMyAdmin you would see a results grid with the identical content."
      ],
      run: "mysql -u root -p nishant  (then paste)",
      output: "+----+----------+--------------------+------+\n| id | username | email              | age  |\n+----+----------+--------------------+------+\n|  1 | Nishant  | nishant@gmail.com  |   20 |\n|  2 | tushar   | tushar@gmail.com   |   19 |\n+----+----------+--------------------+------+\n2 rows in set (0.00 sec)"
    },
    {
      title: "The same statements through the mysql command-line client",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# XAMPP puts the mysql client in something like C:\\xampp\\mysql\\bin
# (add that folder to your PATH, or type its full path)

mysql -u root -p
Enter password:            # XAMPP root has no password - just press Enter

mysql> USE nishant;
Database changed
mysql> SELECT username, age FROM users WHERE age >= 20;
+----------+------+
| username | age  |
+----------+------+
| Nishant  |   20 |
+----------+------+
1 row in set (0.00 sec)

mysql> quit
`,
      explain: [
        "<code>mysql -u root -p</code> opens an interactive session: the <code>mysql&gt;</code> prompt means the server is listening and you are talking SQL directly.",
        "You never needed Node for this — your Unit I servers will connect to this exact same server over this exact same port, just from JavaScript.",
        "The filtered query previews the point of a database: ask a <em>question</em> (<code>WHERE age &gt;= 20</code>) instead of loading a whole file and filtering it yourself."
      ],
      run: "mysql -u root -p"
    },
    {
      title: "Lab16's config.json: the database your Node code will target",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/Lab16/config/config.json",
      lang: "json",
      code: `
{
  "development": {
    "username": "root",
    "password": null,
    "database": "nishant",
    "host": "127.0.0.1",
    "port": 3306,
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "port": 3306,
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
        "This is the file <code>npx sequelize-cli init</code> generated inside the journal's Lab16 project — Lesson 40 explains the whole folder layout.",
        "<code>database: \"nishant\"</code> is the same <code>nishant</code> you just created with SQL — that name choice came from here.",
        "<code>development / test / production</code> are environments: your laptop, an automated test run, and the real server. Only development is filled in; the others still hold placeholders.",
        "Honest detail: development says port <code>3306</code> (XAMPP's default) while production says <code>3307</code> — the student's machine clearly had a port conflict at some point. Lesson 41 deals with this for real.",
        "<code>\"password\": null</code> means an empty password — XAMPP's <code>root</code> user ships that way."
      ]
    },
    {
      title: "proj-2408023's config.json: same database, different port",
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
        "The second journal project's config — same database (<code>nishant</code>), same user (<code>root</code>), but <em>every</em> environment uses port <code>3307</code>.",
        "Two files from the same student, two different ports. One of them matches your XAMPP and the other does not — which is exactly why the port must be checked on <em>your</em> machine (XAMPP Control Panel shows the port beside MySQL when it starts).",
        "Remember this file. Weeks 8 and 9 run migrations and queries through it, and if the port is wrong there, everything downstream fails with the ECONNREFUSED you met in example 2."
      ]
    }
  ],
  keyPoints: [
    "A database stores data in tables; a row is one record, a column is one property",
    "SQL databases (MySQL, PostgreSQL) use tables and a shared query language; NoSQL (MongoDB, Redis) trades tables for flexible documents — this course uses MySQL",
    "MySQL is a separate server process; XAMPP's Control Panel starts it (Apache + MySQL), and phpMyAdmin at localhost/phpmyadmin is its GUI",
    "CREATE DATABASE / USE / CREATE TABLE / INSERT / SELECT are the six SQL statements everything else builds on — and they work identically in the GUI and on the command line",
    "If MySQL is not running, nothing in this unit works: ECONNREFUSED means \"start XAMPP\", not \"fix your code\""
  ],
  practice: `
    <p>Open the XAMPP Control Panel and start Apache + MySQL. In phpMyAdmin, create a database
    called <code>nishant</code> (or any name you like), then open its <strong>SQL</strong> tab and
    run the <code>CREATE TABLE users</code>, <code>INSERT</code> and <code>SELECT</code> statements
    from example 4. Confirm the two rows appear in the <strong>Browse</strong> tab. Then stop
    MySQL in XAMPP and run example 2's <code>mysqladmin -u root ping</code> again to see what
    "down" looks like — that exact feeling is what every ECONNREFUSED error in the rest of this
    unit means. Start MySQL back up before the next lesson.</p>
  `,
  quiz: [
    {
      q: "In a users table, what is a row and what is a column?",
      options: [
        "A row is one user; a column is one property like email or age",
        "A column is one user; a row is one property like email or age",
        "A row is a database; a column is a table",
        "Both are the same thing, just named differently"
      ],
      answer: 0,
      why: "Rows are records (one user each) and columns are fields shared by every row (username, email, age) — the spreadsheet mental model is exactly right."
    },
    {
      q: "Your Node script prints Error: connect ECONNREFUSED 127.0.0.1:3306. What is almost certainly wrong?",
      options: [
        "MySQL is not running (or you are using the wrong port) — start it in the XAMPP Control Panel",
        "The JavaScript has a syntax error",
        "The SELECT statement is misspelled",
        "Node.js cannot talk to databases at all"
      ],
      answer: 0,
      why: "ECONNREFUSED means nothing was listening on that TCP port — in this course that is 99% \"MySQL is stopped in XAMPP\" (or a 3306 vs 3307 mix-up). The journal's own notes list starting MySQL as a run prerequisite."
    }
  ],
  sources: [
    "https://www.apachefriends.org/",
    "https://dev.mysql.com/doc/refman/8.0/en/what-is-mysql.html",
    "https://www.phpmyadmin.net/docs/"
  ]
});
