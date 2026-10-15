window.COURSE_LESSONS.push({
  id: "w15-database-schema",
  file: "081",
  unit: 4,
  week: 15,
  title: "The database: schema and seed data",
  kicker: "Unit IV · Week 15 · Lesson 3 of 7",
  minutes: 16,
  objectives: [
    "Read every column of the locations table and say what its type and NULL flag allow",
    "Load otaku_travel.sql into MySQL and verify it with SELECT COUNT(*)",
    "Explain what AUTO_INCREMENT and the primary key give you for free",
    "Write a CREATE DATABASE / CREATE TABLE / INSERT script for your own domain"
  ],
  intro: `
    <p>Lesson 080 ended inside a query: <code>db.query('SELECT * FROM locations ...')</code>,
    with database <code>otaku_travel</code> named at the top of the file. This chapter opens the
    file that makes that query possible — <code>otaku/otaku_travel.sql</code>, the schema (the
    table's shape) plus five seed rows so the app has something to show on first run. We read it
    section by section, load it into MySQL the way the journal verified it, and finish by
    writing a schema for a domain of your own. Front end comes next — but React can only render
    what this file decides exists.</p>
  `,
  theory: [
    `
      <h3>A schema is a contract</h3>
      <p>Before any JavaScript runs, the database decides what a "location" <em>is</em>: which
      fields it has, how long each may be, and which ones may be empty. That decision is the
      schema, and it is a contract on three sides at once:</p>
      <ul>
        <li>the <strong>API</strong> mirrors it — server.js rejects a POST missing
        <code>anime_name</code> with a 400 precisely because the column is
        <code>NOT NULL</code>;</li>
        <li>the <strong>front end</strong> mirrors it — the form marks those same four inputs
        <code>required</code>;</li>
        <li>MySQL <strong>enforces</strong> it — a query that violates the schema fails, and the
        API answers 500.</li>
      </ul>
      <p>Change the schema and all three must change together. That is why the schema is written
      down in a <code>.sql</code> file instead of living in someone's head.</p>
    `,
    `
      <h3>The locations table, line by line</h3>
      <p>Here is the whole shape, exactly as the dump defines it:</p>
      <table>
        <thead><tr><th>Column</th><th>Type</th><th>Allowed?</th><th>Why</th></tr></thead>
        <tbody>
          <tr><td><code>id</code></td><td><code>int(11)</code></td><td>auto-filled</td><td>unique identity for every row — the <code>:id</code> in every PUT/DELETE URL</td></tr>
          <tr><td><code>anime_name</code></td><td><code>varchar(100)</code></td><td><code>NOT NULL</code></td><td>required — a location without the anime makes no sense</td></tr>
          <tr><td><code>location_name</code></td><td><code>varchar(100)</code></td><td><code>NOT NULL</code></td><td>required — the real-world place</td></tr>
          <tr><td><code>city</code></td><td><code>varchar(100)</code></td><td><code>NOT NULL</code></td><td>required — searched by the LIKE filter</td></tr>
          <tr><td><code>country</code></td><td><code>varchar(100)</code></td><td><code>NOT NULL</code></td><td>required — searched too</td></tr>
          <tr><td><code>description</code></td><td><code>text</code></td><td><code>NULL</code></td><td>optional — longer prose, no length worry</td></tr>
          <tr><td><code>image_url</code></td><td><code>varchar(500)</code></td><td><code>NULL</code></td><td>optional — long enough for any link; empty means a text-only card</td></tr>
          <tr><td><code>created_at</code></td><td><code>timestamp</code></td><td>auto-filled</td><td>defaults to <code>current_timestamp()</code> — insert time, for free</td></tr>
        </tbody>
      </table>
      <p>Two type families do all the work: <strong>varchar(n)</strong> is a short string with a
      hard length limit (100 characters for names, 500 for links — more than enough, and the
      limit is enforced), while <strong>text</strong> has no practical limit, for descriptions.
      <strong>NOT NULL</strong> versus <strong>DEFAULT NULL</strong> is the required/optional
      switch. The trailing <code>ENGINE=InnoDB DEFAULT CHARSET=utf8mb4</code> sets the storage
      engine and the character set (utf8mb4 stores every emoji and Japanese character — sensible
      for an anime guide).</p>
    `,
    `
      <h3>id, the primary key, and AUTO_INCREMENT</h3>
      <p>In the body of the dump, <code>id</code> is declared as a plain
      <code>int(11) NOT NULL</code> — nothing about uniqueness yet. phpMyAdmin puts that part
      <em>after</em> the data, as two <code>ALTER TABLE</code> statements:</p>
      <ul>
        <li><code>ADD PRIMARY KEY (id)</code> — promises every row's id is unique and never
          duplicated, and makes looking a row up by id fast (an index is built).</li>
        <li><code>MODIFY id ... AUTO_INCREMENT, AUTO_INCREMENT=6</code> — tells MySQL "assign
        the next id yourself"; the <code>=6</code> records that ids 1–5 are already taken, so
        your next INSERT becomes id 6.</li>
      </ul>
      <p>Why does the dump dare to insert explicit ids (1, 2, 3...)? Look at its very first
      statement: <code>SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO"</code> — "if you supplied an id of
      0, treat it as 0, don't replace it with an auto value". Supplying 1–5 keeps the seed rows
      exactly as written, so screenshots and the book always match. When <em>you</em> insert
      later, you leave <code>id</code> out entirely and let it count up.</p>
    `,
    `
      <h3>The five seed rows</h3>
      <p>Seed data is demo content shipped with the schema, so a fresh install is never an empty
      screen. The dump inserts five real anime pilgrimage spots:</p>
      <ol>
        <li><strong>Your Name</strong> — Suga Shrine, Tokyo (the famous stairs)</li>
        <li><strong>Slam Dunk</strong> — Kamakura High School Crossing, Kamakura</li>
        <li><strong>Steins;Gate</strong> — Akihabara Radio Kaikan, Tokyo</li>
        <li><strong>Weathering With You</strong> — Yoyogi Kaikan, Tokyo</li>
        <li><strong>K-On!</strong> — Toyosato Elementary School, Toyosato</li>
      </ol>
      <p>Every row fills the four required columns plus description and image; only
      <code>created_at</code> is left to the default. Note that row 3 contains a semicolon
      (<code>Steins;Gate</code>) — harmless inside a quoted SQL string, and a nice reminder that
      quotes, not luck, protect literal values.</p>
    `,
    `
      <h3>Loading the dump (and the line it does not contain)</h3>
      <p>Important honesty about this file: <code>otaku_travel.sql</code> is a
      <strong>phpMyAdmin export</strong> — it starts with <code>SET SQL_MODE ...</code> and then
      <code>CREATE TABLE</code>. It contains <strong>no <code>CREATE DATABASE</code> line and no
      <code>USE</code></strong>. (The journal map and <code>FUNCTIONALITIES.txt</code> both
      describe a setup file with <code>CREATE DATABASE IF NOT EXISTS otaku_travel;</code> —
      that file, named <code>server/database.sql</code>, is not in the repo. The dump we have is
      complete for table and data; you supply the database itself.) So loading it takes one
      statement of yours plus the file:</p>
      <pre class="diagram">mysql -u root -e "CREATE DATABASE IF NOT EXISTS otaku_travel;"
mysql -u root otaku_travel &lt; otaku/otaku_travel.sql
mysql -u root -e "USE otaku_travel; SELECT COUNT(*) FROM locations;"   -- must print 5</pre>
      <p>The terminal way (above) and the phpMyAdmin way (Import tab → choose file → Go) are
      equivalent; both end with the same check. <strong>Always run the COUNT</strong> before you
      debug any code: 5 means the database layer is proven good and any bug is upstream in Node
      or React; 0 means you are about to waste an hour blaming the wrong layer.</p>
    `,
    `
      <h3>Writing a schema for your own domain</h3>
      <p>The recipe transfers wholesale. Pick a domain (a book library, a recipe box, a task
      list) and follow five moves:</p>
      <ol>
        <li><code>CREATE DATABASE IF NOT EXISTS</code> + <code>USE</code> — idempotent, so
        re-running your setup file never errors.</li>
        <li><code>id INT NOT NULL AUTO_INCREMENT</code> + <code>PRIMARY KEY (id)</code> — every
        table gets one.</li>
        <li>Required facts → <code>varchar(n) NOT NULL</code>; optional facts →
        <code>NULL</code> allowed or a <code>DEFAULT</code>.</li>
        <li>Long prose → <code>TEXT</code>; links → <code>varchar(500)</code>; a "when was it
        added" column → <code>TIMESTAMP DEFAULT CURRENT_TIMESTAMP</code>.</li>
        <li>Seed two rows so your app renders something on first run.</li>
      </ol>
      <p>Example 7 does exactly that for a small library, side by side with the Otaku table so
      you can see which parts were copied and which were chosen.</p>
    `
  ],
  examples: [
    {
      title: "The CREATE TABLE statement: the whole schema",
      from: "journal",
      file: "otaku/otaku_travel.sql",
      lang: "sql",
      code: `
CREATE TABLE \`locations\` (
  \`id\` int(11) NOT NULL,
  \`anime_name\` varchar(100) NOT NULL,
  \`location_name\` varchar(100) NOT NULL,
  \`city\` varchar(100) NOT NULL,
  \`country\` varchar(100) NOT NULL,
  \`description\` text DEFAULT NULL,
  \`image_url\` varchar(500) DEFAULT NULL,
  \`created_at\` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
`,
      explain: [
        "The backticks around identifiers are MySQL quoting — they let you use words that are reserved elsewhere; they are not the JavaScript kind.",
        "Four <code>varchar(100) NOT NULL</code> columns are the app's four required fields — the same four server.js checks before INSERT and the form marks <code>required</code>.",
        "<code>description text DEFAULT NULL</code> and <code>image_url varchar(500) DEFAULT NULL</code> are the two optional fields; <code>DEFAULT NULL</code> means \"no value supplied? that's fine\".",
        "<code>created_at timestamp NOT NULL DEFAULT current_timestamp()</code> fills itself with the insert time — no application code ever writes it.",
        "<code>ENGINE=InnoDB ... utf8mb4</code> picks the storage engine and a character set that covers emoji and Japanese text."
      ],
      run: "mysql -u root otaku_travel < otaku/otaku_travel.sql   (database otaku_travel must exist)"
    },
    {
      title: "The five seed rows",
      from: "journal",
      file: "otaku/otaku_travel.sql",
      lang: "sql",
      code: `
INSERT INTO \`locations\` (\`id\`, \`anime_name\`, \`location_name\`, \`city\`, \`country\`, \`description\`, \`image_url\`, \`created_at\`) VALUES
(1, 'Your Name', 'Suga Shrine', 'Tokyo', 'Japan', 'Famous stairs seen at the end of the movie.', 'https://filmcolossus.com/wp-content/uploads/2019/03/Your-Name.jpg', '2026-10-08 20:12:22'),
(2, 'Slam Dunk', 'Kamakura High School Crossing', 'Kamakura', 'Japan', 'Iconic railway crossing from the opening.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQScgWN7IKgVPdyLicwST4RWMkqskKSuDqlSuJ068vdd69Plb39z3wODmI1DVRyZjgAZd5lvOo92YDXT69ZuXoq8P-UToOJL6HXqlzQST2W&s=10', '2026-10-08 20:12:22'),
(3, 'Steins Gate', 'Akihabara Radio Kaikan', 'Tokyo', 'Japan', 'Real building shown as the lab in Akihabara.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQCd_bidcfzdbXyeVyBKXX5gcoqQn1u2eaU2wj5evTqudwTl9jzDFhVTjwhXRvL0aBZzRo7kVoTddPDWihnZrrdINhWUnxbaoJKQ0aMg&s=10', '2026-10-08 20:12:22'),
(4, 'Weathering With You', 'Yoyogi Kaikan', 'Tokyo', 'Japan', 'Rooftop shrine building from the movie.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSx5tPw_cc--fDzksEpNYYYaPEKeWF_w2wh_m7fuFhtTFlfWhJqtO13q1KAfvNqclxj2I9sw&s=10', '2026-10-08 20:12:22'),
(5, 'K-On!', 'Toyosato Elementary School', 'Toyosato', 'Japan', 'School used as model for Sakuragaoka High.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFL5L_rC6pu83BARvRb_72nmHMfd1TJtEc8EMC41bYs6-AwcrA9Oq3XYbEEIVi5WpDqIEAVM3spwdBDSxp7kEyPUGmkidzfjPv492Dqw&s=10', '2026-10-08 20:12:22');
`,
      explain: [
        "One INSERT with six rows-worth of value tuples (five rows here): supplying <code>id</code> explicitly keeps ids 1–5 stable — allowed only because the dump set <code>NO_AUTO_VALUE_ON_ZERO</code> at the top.",
        "<code>created_at</code> is listed with an explicit timestamp in the dump; your own INSERTs may simply omit it and take the default.",
        "This is what <code>SELECT COUNT(*)</code> must return: 5 — the journal re-verified these exact rows against a live XAMPP MySQL in October 2026.",
        "Row 3's title contains a semicolon; single-quoted SQL strings make it ordinary text. Never rely on that trick for user input — that is what <code>?</code> placeholders are for (Lesson 080)."
      ]
    },
    {
      title: "The dump's tail: primary key and AUTO_INCREMENT",
      from: "journal",
      file: "otaku/otaku_travel.sql",
      lang: "sql",
      code: `
ALTER TABLE \`locations\`
  ADD PRIMARY KEY (\`id\`);

--
-- AUTO_INCREMENT for table \`locations\`
--
ALTER TABLE \`locations\`
  MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;
`,
      explain: [
        "phpMyAdmin exports structure, then data, then constraints — so the table only becomes <em>unique-id</em> capable at the very end.",
        "<code>ADD PRIMARY KEY (id)</code> is the uniqueness promise, and it is what makes <code>WHERE id = 3</code> a fast index lookup instead of a full scan.",
        "<code>AUTO_INCREMENT=6</code> says \"next free id is 6\" — after loading this dump, your first POST becomes id 6 with no id in its INSERT.",
        "<code>COMMIT;</code> closes the transaction the file opened on line 11 (<code>START TRANSACTION;</code>), so the whole import lands atomically."
      ]
    },
    {
      title: "The two statements the dump is missing",
      from: "new",
      file: "",
      lang: "sql",
      code: `
-- Run this BEFORE the dump: otaku_travel.sql is a phpMyAdmin export and
-- never creates (or selects) a database itself.
CREATE DATABASE IF NOT EXISTS otaku_travel;
USE otaku_travel;

-- IF NOT EXISTS makes the line safe to re-run: the second time it is a no-op.
-- USE selects the database, so the CREATE TABLE in the dump lands in the right place.
`,
      explain: [
        "Without a database selected, importing the dump fails with <code>ERROR 1046 (3D000): No database selected</code> — the most common first-run stumble of this week.",
        "<code>IF NOT EXISTS</code> is the idempotent style you saw in Unit II migrations: running setup twice is harmless.",
        "This pair is exactly what the journal's <code>server/database.sql</code> (described in FUNCTIONALITIES.txt but absent from the repo) would have contained — write it once yourself and keep it beside the dump.",
        "After this, <code>mysql -u root otaku_travel &lt; otaku/otaku_travel.sql</code> has a home for the table and the five rows."
      ],
      run: "mysql -u root -e \"CREATE DATABASE IF NOT EXISTS otaku_travel; USE otaku_travel; SHOW TABLES;\""
    },
    {
      title: "Load it and prove it: import + COUNT check",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# from the repo root, after starting MySQL in XAMPP
# Windows (the client ships with XAMPP):
C:\\xampp\\mysql\\bin\\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS otaku_travel;"
C:\\xampp\\mysql\\bin\\mysql.exe -u root otaku_travel < otaku/otaku_travel.sql

# macOS / Linux, if mysql is on your PATH:
mysql -u root -e "CREATE DATABASE IF NOT EXISTS otaku_travel;"
mysql -u root otaku_travel < otaku/otaku_travel.sql

# the check that matters - must print 5:
mysql -u root -e "USE otaku_travel; SELECT COUNT(*) FROM locations;"
`,
      explain: [
        "<code>&lt; otaku/otaku_travel.sql</code> feeds the file's statements into the client — the shell equivalent of pasting it into phpMyAdmin's SQL box.",
        "The <code>-e</code> flag runs one statement batch and exits, which makes it perfect for scripted checks.",
        "If the import printed errors like <code>Table 'locations' exists</code>, the dump was loaded twice — harmless for a lab, but drop the table first when you are changing the schema.",
        "COUNT is your layer boundary: 5 = database layer proven, blame moves to Node or React; 0 or an error = stop here and fix this layer first."
      ],
      run: "mysql -u root -e \"USE otaku_travel; SELECT COUNT(*) FROM locations;\"",
      output: "+----------+\n| COUNT(*) |\n+----------+\n|        5 |\n+----------+"
    },
    {
      title: "The same load, entirely in phpMyAdmin",
      from: "new",
      file: "",
      lang: "text",
      code: `
phpMyAdmin route (no terminal needed) - XAMPP must be running

1. XAMPP Control Panel -> MySQL -> Start  (port 3306 must show green)
2. Browser -> http://localhost/phpmyadmin
3. New (left sidebar) -> Database name: otaku_travel -> Create
4. Import tab -> Choose File -> otaku/otaku_travel.sql -> Go
5. Open table locations -> 5 rows visible
6. SQL tab, to confirm like the journal did:
   SELECT COUNT(*) FROM locations;        -> 5
`,
      explain: [
        "Step 3 is the CREATE DATABASE the dump skips — doing it by hand in a GUI makes the missing line obvious.",
        "Step 4 runs the same statements the terminal command runs; phpMyAdmin simply sends them for you.",
        "Step 6 is the journal's own verification habit — FUNCTIONALITIES.txt records this live check as \"verified 2026-10-09\".",
        "Whichever route you take, the result must be identical: database otaku_travel, table locations, 5 rows."
      ]
    },
    {
      title: "Your own schema: a tiny library, built on the same pattern",
      from: "new",
      file: "",
      lang: "sql",
      code: `
CREATE DATABASE IF NOT EXISTS library;
USE library;

CREATE TABLE books (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(100) NOT NULL,
  genre VARCHAR(50) NULL,
  review TEXT NULL,
  cover_url VARCHAR(500) NULL,
  rating TINYINT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO books (title, author, genre, review, cover_url, rating) VALUES
('The Little Prince', 'Antoine de Saint-Exupery', 'Fable', 'A pilot meets a boy on an asteroid.', NULL, 5),
('Norwegian Wood', 'Haruki Murakami', 'Novel', NULL, 'https://example.com/norwegian-wood.jpg', 4);
`,
      explain: [
        "Copied from locations: the id/created_at pair, four required-or-optional facts, one TEXT for prose, one varchar(500) for a link, the InnoDB/utf8mb4 trailer — that skeleton fits almost any CRUD app.",
        "Chosen for this domain: <code>rating TINYINT</code> (0–255 is plenty for a 1–5 score) and a <code>genre VARCHAR(50)</code> — types follow the data you expect.",
        "The INSERT omits <code>id</code> and <code>created_at</code> on purpose: auto-increment and the default fill them — exactly how the React app's POST will insert later.",
        "The second row passes <code>NULL</code> for <code>review</code> while the first supplies text: optional columns accept both, and your front end must render \"no review\" gracefully (Otaku's answer is the <code>loc.image_url &amp;&amp; &lt;img&gt;</code> guard you will meet in Lesson 082).",
        "Point a copy of server.js at this table by changing DB_NAME and the column list — the pattern of the API is entirely generic."
      ],
      run: "mysql -u root < library.sql"
    }
  ],
  keyPoints: [
    "locations = 4 required varchar(100) columns, optional description TEXT and image_url VARCHAR(500), plus an auto-filled created_at TIMESTAMP — the API's 400 check and the form's required flags are the same rule in three places",
    "id INT AUTO_INCREMENT plus a PRIMARY KEY gives every row a unique, server-assigned identity — it is the :id in every PUT and DELETE URL",
    "The shipped otaku_travel.sql is a phpMyAdmin export: it creates the table and seeds 5 rows but never creates the database — you run CREATE DATABASE and USE first",
    "Verify with SELECT COUNT(*) FROM locations = 5 before debugging any JavaScript — it proves which layer is broken",
    "Schema recipe for a new domain: id + timestamps auto, required columns NOT NULL, optional columns NULL/DEFAULT, TEXT for prose, then two seed rows"
  ],
  practice: `
    <p>Create a second database, <code>otaku_travel_dev</code>, import the same dump into it
    (<code>mysql -u root otaku_travel_dev &lt; otaku/otaku_travel.sql</code>), confirm the COUNT
    is 5, then add a sixth row of your own with plain SQL:
    <code>INSERT INTO locations (anime_name, location_name, city, country) VALUES ('Spirited Away','Aburaya','Takarazuka','Japan');</code>
    followed by <code>SELECT id, anime_name FROM locations ORDER BY id DESC;</code> — your row
    should come back first, which is precisely the order the API and the card grid use. Leave
    the real <code>otaku_travel</code> database untouched.</p>
  `,
  quiz: [
    {
      q: "You INSERT into locations supplying only the six data columns. Which two columns fill themselves?",
      options: [
        "id (AUTO_INCREMENT) and created_at (DEFAULT current_timestamp)",
        "description and image_url, because they are nullable",
        "city and country, because they are indexed",
        "Nothing — MySQL requires a value for every column"
      ],
      answer: 0,
      why: "id is AUTO_INCREMENT (the dump sets AUTO_INCREMENT=6 after the seed rows) and created_at has DEFAULT current_timestamp(). Optional columns still need explicit NULL or '' if you want to be sure, but the two auto columns are the ones that are never supplied."
    },
    {
      q: "mysql -u root otaku_travel < otaku/otaku_travel.sql fails with \"ERROR 1046 (3D000): No database selected\". What is missing?",
      options: [
        "The database itself — the dump never runs CREATE DATABASE or USE, so create otaku_travel first and import into it",
        "A password on the command line",
        "The CREATE TABLE statement, which the dump forgot",
        "Root privileges — the file must be run as the mysql admin user"
      ],
      answer: 0,
      why: "otaku_travel.sql is a phpMyAdmin export that starts at SET SQL_MODE and jumps straight to CREATE TABLE. With no database selected there is nowhere to put the table — one CREATE DATABASE IF NOT EXISTS otaku_travel; USE otaku_travel; before the import fixes it."
    }
  ],
  sources: [
    "https://dev.mysql.com/doc/refman/8.0/en/create-table.html",
    "https://dev.mysql.com/doc/refman/8.0/en/data-types.html",
    "https://www.phpmyadmin.net/docs/"
  ]
});
