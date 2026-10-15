window.COURSE_LESSONS.push({
  id: "w07-closing-connection",
  file: "043",
  unit: 2,
  week: 7,
  title: "Closing connections and exiting cleanly",
  kicker: "Unit II · Week 7 · Lesson 5 of 5",
  minutes: 14,
  objectives: [
    "Close a Sequelize connection with sequelize.close() and explain why it matters",
    "Explain why a finished script hangs when a database connection is still open",
    "Use finally so cleanup runs after success and after errors alike",
    "Add a SIGINT handler that closes the connection on Ctrl+C in long-running servers"
  ],
  intro: `
    <p>Connection tested, database ready. Now the small discipline that separates scripts that
    end cleanly from scripts that leave you staring at a blinking cursor: <strong>closing what
    you opened</strong>. Every CRUD script the journal wrote this week —
    <code>create.js</code>, <code>read.js</code>, <code>update.js</code>, <code>delete.js</code>
    — ends with the same two lines, <code>await sequelize.close()</code> and
    <code>process.exit()</code>, tucked into a <code>finally</code> block. This lesson explains
    what those lines are fighting against (open handles), and what to do instead in a real
    server, which must <em>never</em> exit (the <code>SIGINT</code> handler).</p>
  `,
  theory: [
    `
      <h3>Why Node hangs: open handles</h3>
      <p>Node.js exits when it has <strong>nothing left to do</strong> — no pending timers, no
      listening sockets, no in-flight requests. A live database connection is exactly such a
      pending thing: the MySQL server is still holding a session open for you, so the event
      loop has a reason to stay alive. Run a script that queries and forgets to close, and the
      console output finishes… then the cursor just sits there. That is not a crash and not a
      freeze — it is Node correctly waiting for work that will never come.</p>
      <pre class="diagram">query done, output printed
        │
        ▼
Node: "any work left?" ──▶ connection socket still open ──▶ WAIT (hangs)
        │
        └── after sequelize.close() ──▶ no handles ──▶ exit code 0</pre>
      <p>The fix is one call: <code>await sequelize.close()</code> releases the connection
      (logging out of MySQL and freeing the handle), after which Node finds nothing to do and
      exits on its own.</p>
    `,
    `
      <h3>The journal's pattern: finally + close + exit</h3>
      <p>Look at how every Lab16 script is shaped: <code>try</code> does the work,
      <code>catch</code> reports errors, and <code>finally</code> always — <em>always</em> —
      closes:</p>
      <pre>try {
  ...work...
} catch (error) {
  console.error(...);
} finally {
  await sequelize.close();
  process.exit();
}</pre>
      <p>Two details worth absorbing:</p>
      <ul>
        <li><code>finally</code> runs after the try <em>or</em> the catch — so a failed query
        still releases the connection. Without it, the error path leaks a connection every run.</li>
        <li><code>process.exit()</code> ends the process immediately with exit code 0. It is the
        belt to close()'s braces: close() shuts the database session cleanly (finishing any
        pending writes on the wire), exit() guarantees the process ends even if some other
        handle (a timer you forgot, an npm log watcher) would keep it alive.</li>
      </ul>
      <p>For one-shot scripts like these CRUD files, the combination is perfect. Order matters:
      close <em>first</em>, then exit — <code>exit()</code> first would cut the logout short.</p>
    `,
    `
      <h3>Servers: the opposite rule</h3>
      <p>A web server (everything from Unit I onward) must <em>keep</em> its connection pool
      open for the life of the process — closing after every request would log in and out
      constantly. So a server never calls <code>process.exit()</code> in its main flow; instead
      it cleans up when someone <em>else</em> decides the process should end. On a terminal, that
      decision arrives as <strong>SIGINT</strong> — the signal Node receives when you press
      <code>Ctrl+C</code>. The pattern:</p>
      <pre>process.on("SIGINT", async () => {
  console.log("\\nShutting down, closing the database...");
  await sequelize.close();
  process.exit(0);
});</pre>
      <p>This is a <strong>new</strong> idea for this course — you have used
      <code>process.argv</code> and <code>process.env</code>; now <code>process.on(...)</code>
      subscribes to process-lifecycle events, the same event-emitter pattern you met in
      Lesson 21, applied to the process itself. Unit III/IV servers will use exactly this.</p>
    `
  ],
  examples: [
    {
      title: "Lab16/create.js: insert two users, then close and exit",
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
        "<code>require('./db')</code> brings in the shared connection from Lesson 41/42 — one connection file, many scripts.",
        "The work is <code>User.create({...})</code> — an object in, a row out; Week 8 defines the model it targets. <code>.toJSON()</code> strips Sequelize's internal fields and prints a plain object.",
        "The <code>finally</code> block is the lesson's headline: whether both creates succeeded or the first one threw, <code>await sequelize.close()</code> runs, then <code>process.exit()</code> ends the process — no blinking cursor.",
        "This is Week 8/9 content used here as cleanup teaching material: the journal's create script happens to be the clearest close() example in the repo."
      ],
      run: "node create.js  (inside Lab16/, MySQL running, tables synced)",
      output: "Created User: { id: 1, username: 'Nishant', email: 'nishant@gmail.com', password: 'heloow@123', age: 20 }\nCreated User: { id: 2, username: 'tushar', email: 'tushar@gmail.com', password: '!!heloow@123456', age: 19 }"
    },
    {
      title: "Lab16/read.js: the same finally, after SELECT-ing rows",
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
        "Second appearance of the pattern: different work (<code>findAll()</code>, <code>findOne({ where })</code>), identical cleanup.",
        "<code>user.username</code> — the rows come back as objects, so the loop prints columns without touching SQL. That is the ORM promise from Lesson 40, delivered.",
        "<code>\\n</code> inside the string prints a blank line — cosmetic, but it makes the two sections of output readable.",
        "If you deleted create.js's <code>finally</code> and ran read.js, the numbers below would print… and the terminal would hang. That is example 4."
      ],
      run: "node read.js  (after create.js has populated the table)",
      output: "\nAll Users:\nNishant nishant@gmail.com 20\ntushar tushar@gmail.com 19\n\nSingle User:\nNishant nishant@gmail.com 20"
    },
    {
      title: "Lab16/delete.js: cleanup even when the work removes things",
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
        "<code>User.destroy({ where })</code> deletes matching rows and returns how many went — here 1, once tushar exists.",
        "Note what the journal does <em>not</em> do: no <code>process.exitCode = 1</code> on failure. A stricter version would set it inside catch, so shells and CI can detect the failure.",
        "Third identical <code>finally</code> — by now the shape should feel automatic: work / report / always close.",
        "<code>update.js</code> (in the same folder) is the fourth sibling; all four scripts close the same way. Consistency is the point."
      ],
      run: "node delete.js  (inside Lab16/)",
      output: "Rows Deleted: 1"
    },
    {
      title: "The hang, demonstrated: forget close() and watch Node wait",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("nishant", "root", "", {
  host: "127.0.0.1",
  port: 3307,
  dialect: "mysql",
  logging: false
});

async function run() {
  await sequelize.authenticate();
  console.log("Query done. Now... nothing. But the process does NOT exit.");

  // BUG (on purpose): no await sequelize.close() here.
  // The connection is an open handle, so Node keeps waiting.
}

run();
`,
      explain: [
        "Run it: the message prints, then the terminal just sits there with a blinking cursor — no error, no exit. That is an <em>open handle</em>: the MySQL session keeps the event loop alive.",
        "Kill it with Ctrl+C. Now add <code>await sequelize.close();</code> as the last line of <code>run()</code> and rerun: same output, instant exit.",
        "A third option for scripts: <code>process.exit()</code> — but close() first, or the logout (and any queued writes) may be cut short.",
        "Why care? In CI and npm scripts, a hanging process blocks the pipeline forever — one missing close() can stall an entire build for hours."
      ],
      run: "node no-close.js  (then Ctrl+C; add close() and rerun)",
      output: "Query done. Now... nothing. But the process does NOT exit."
    },
    {
      title: "process.exitCode: failing without dying mid-cleanup",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("nishant", "root", "", {
  host: "127.0.0.1",
  port: 3307,
  dialect: "mysql",
  logging: false
});

async function run() {
  try {
    await sequelize.authenticate();
    console.log("Connected - doing work...");
  } catch (error) {
    console.error("Failed:", error.message);
    process.exitCode = 1;          // schedule a failure exit...
  } finally {
    await sequelize.close();       // ...but only AFTER cleanup finishes
    console.log("Connection closed.");
  }
}

run();
`,
      explain: [
        "<code>process.exitCode = 1</code> is the polite alternative to <code>process.exit(1)</code>: it marks the eventual exit as a failure but lets pending work (our close) finish first.",
        "<code>process.exit()</code> kills the process on the spot — useful as a final safety net, dangerous in the middle of asynchronous cleanup.",
        "Run it both ways: with MySQL on you see Connected / Connection closed and <code>echo $?</code> is 0; with MySQL off, Failed / Connection closed and the code is 1. Either way the connection is released.",
        "The journal's scripts call <code>process.exit()</code> in finally after close() — correct order, and this example shows the more refined habit to grow into."
      ],
      run: "node exit-code.js; echo $?",
      output: "Connected - doing work...\nConnection closed."
    },
    {
      title: "SIGINT cleanup: the server version of closing up",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const http = require("http");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("nishant", "root", "", {
  host: "127.0.0.1",
  port: 3307,
  dialect: "mysql",
  logging: false
});

const server = http.createServer(async (req, res) => {
  await sequelize.authenticate();     // pool is alive for the server's lifetime
  res.end("database is up");
});

server.listen(8080, () => console.log("server on http://localhost:8080"));

// close the connection ONLY when the process is asked to stop (Ctrl+C)
process.on("SIGINT", async () => {
  console.log("\\nSIGINT received - closing database and server...");
  await sequelize.close();
  server.close();
  process.exit(0);
});
`,
      explain: [
        "Unlike the CRUD scripts, this process must outlive a single query — so no close() in the request handler, and no process.exit() in the main flow.",
        "<code>process.on(\"SIGINT\", handler)</code> intercepts Ctrl+C. It is the same EventEmitter API from Lesson 21, applied to the process itself.",
        "The handler closes in reverse order of importance: database first (finish the logout cleanly), then the HTTP server, then exit(0) to guarantee the process ends even if a stray handle remains.",
        "This is the shape of every production Node service you will write in Units III and IV: run until told to stop, then release everything you hold."
      ],
      run: "node server-cleanup.js  (then press Ctrl+C in that terminal)",
      output: "server on http://localhost:8080\nSIGINT received - closing database and server..."
    }
  ],
  keyPoints: [
    "A live database connection is an open handle: Node waits on it, so a script without close() prints its output and then hangs",
    "await sequelize.close() releases the MySQL session; after it, Node finds no work and exits by itself with code 0",
    "The journal's Lab16 CRUD scripts all end with finally { await sequelize.close(); process.exit(); } — finally guarantees cleanup on the error path too",
    "Close before you exit: process.exit() kills the process instantly and can cut a pending logout short",
    "Long-running servers invert the rule — keep the connection open, and close it only in a process.on(\"SIGINT\") handler (the Ctrl+C path)"
  ],
  practice: `
    <p>Take a copy of <code>Lab16/read.js</code> and delete its <code>finally</code> block.
    Run it with MySQL up: confirm the output prints and the terminal then hangs — kill it with
    Ctrl+C. Restore the <code>finally</code>, run again, and confirm the process now exits by
    itself. Finally, save example 6's server, start it, hit
    <code>http://localhost:8080</code> once, then press Ctrl+C and watch the two cleanup lines
    appear before the prompt returns.</p>
  `,
  quiz: [
    {
      q: "A script runs authenticate(), prints its result, and then the terminal never returns to the prompt. What is the most likely cause?",
      options: [
        "The database connection was never closed — the open handle keeps Node's event loop alive",
        "The MySQL server crashed",
        "The script has a syntax error",
        "console.log is asynchronous in Node"
      ],
      answer: 0,
      why: "That is the classic open-handle hang: Node exits only when nothing is pending. Closing with sequelize.close() (or calling process.exit()) makes it exit."
    },
    {
      q: "In the journal's CRUD scripts, why is await sequelize.close() placed inside finally?",
      options: [
        "So the connection is released whether the try block succeeded or the catch block handled an error",
        "So close() runs before any query executes",
        "Because finally is the only block that supports await",
        "To make the script print one extra line"
      ],
      answer: 0,
      why: "finally always runs after try or catch — without it, the error path would leak a connection. And await inside finally is perfectly legal; the reason is purely about guaranteeing cleanup."
    }
  ],
  sources: [
    "https://sequelize.org/api/v6/classes/sequelize#close",
    "https://nodejs.org/api/process.html#processoneventsigint-handler",
    "https://nodejs.org/api/process.html#processexitcode"
  ]
});
