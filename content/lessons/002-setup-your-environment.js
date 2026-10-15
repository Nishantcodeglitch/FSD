window.COURSE_LESSONS.push({
  id: "p02-setup-your-environment",
  file: "002",
  unit: 0,
  week: 0,
  title: "Set up your development environment",
  kicker: "Preface · Lesson 2 of 4",
  minutes: 16,
  objectives: [
    "Install Node.js and npm and prove they work with node -v and npm -v",
    "Install VS Code and open this repository as a folder",
    "Start MySQL through XAMPP and check that it is listening on port 3306"
  ],
  intro: `
    <p>Last lesson you learned how the book is organised and how its examples are labelled. Now we
    do the one piece of real-world preparation the rest of the course assumes: getting your machine
    ready. By the end of this chapter you will have Node.js and npm on your path, VS Code open on
    this repository, and MySQL listening so Unit II runs without surprises.</p>
    <p>Nothing here is difficult, but the order matters — Lessons 3 and 4 will ask you to run
    <code>node</code> commands immediately, so install first and read on.</p>
  `,
  theory: [
    `
      <h3>Four tools, one job each</h3>
      <p>Full stack work uses a small toolchain. Four pieces matter in this course:</p>
      <ul>
        <li><strong>Node.js</strong> — the JavaScript runtime. It is the <code>node</code> command
        that executes every script in this book.</li>
        <li><strong>npm</strong> — the Node Package Manager. It ships <em>with</em> Node.js and
        downloads other people's packages (Express, Sequelize, React tooling). It is the
        <code>npm</code> command.</li>
        <li><strong>VS Code</strong> — the code editor. Any text editor works, but VS Code gives
        you syntax colouring, an integrated terminal and IntelliSense for free.</li>
        <li><strong>XAMPP</strong> — a free local server stack whose important part for us is
        <strong>MySQL</strong>, the database used throughout Unit II. XAMPP also bundles Apache (a
        web server) and phpMyAdmin (a browser for looking at databases).</li>
      </ul>
      <p>You only need the first three for Units I and III. XAMPP becomes essential from Week 7
      onward, but installing it now means you never hit a wall mid-chapter.</p>
    `,
    `
      <h3>Installing Node.js and npm</h3>
      <p>Download the <strong>LTS</strong> (Long Term Support) installer from
      <a href='https://nodejs.org/en/download' target='_blank' rel='noopener'>nodejs.org/en/download</a>
      and run it — accept every default. The installer puts <code>node.exe</code> and
      <code>npm.cmd</code> into a folder on your system <strong>PATH</strong>, the list of folders
      Windows searches when you type a command. That is why typing <code>node</code> in a fresh
      terminal works afterwards.</p>
      <p>If you prefer the terminal, on Windows <code>winget install OpenJS.NodeJS.LTS</code> does
      the same job. npm needs no separate install — it arrives bundled with Node.</p>
      <div class="warn"><strong>Always open a NEW terminal after installing.</strong> An already-open
      terminal keeps the old PATH; <code>node</code> will look like it is missing even though the
      install succeeded.</div>
    `,
    `
      <h3>Your editor: VS Code</h3>
      <p>Install VS Code from
      <a href='https://code.visualstudio.com/' target='_blank' rel='noopener'>code.visualstudio.com</a>.
      During setup on Windows, tick the option <em>"Add to PATH"</em> — it makes the
      <code>code .</code> command work, which opens the current folder as a project in one step.</p>
      <p>Two VS Code habits pay off immediately: press <code>Ctrl+</code>\` (backtick) to open the
      <strong>integrated terminal</strong> so you never leave the editor, and always open the
      <em>folder</em> (File → Open Folder → <code>FSD_JOURNAL</code>) rather than a single file, so
      the editor knows where your project lives.</p>
    `,
    `
      <h3>MySQL via XAMPP (needed from Week 7)</h3>
      <p>Install XAMPP from
      <a href='https://www.apachefriends.org/' target='_blank' rel='noopener'>apachefriends.org</a>.
      Its Control Panel has Start buttons for Apache and MySQL — click <strong>Start</strong> next to
      MySQL whenever you want the database up. MySQL listens on <strong>port 3306</strong>, the
      standard database port; a port is just a numbered doorway into your machine, and 3306 is the
      one MySQL always answers on unless configured otherwise.</p>
      <p>Sequelize code (the ORM in Unit II) talks to that port. If MySQL is not running, you get a
      connection error and nothing else will work — which is why this lesson ends with a one-line
      check you can run any time.</p>
      <pre class="diagram">  your script  ──▶  Sequelize  ──▶  port 3306  ──▶  MySQL (in XAMPP)
   (node)                                   ▲
                                            └── start it in the XAMPP Control Panel</pre>
    `,
    `
      <h3>Terminal basics you will use every day</h3>
      <p>A <strong>terminal</strong> (PowerShell or Command Prompt on Windows) is a text window
      where you type commands instead of clicking. Only a handful appear in this course:</p>
      <ul>
        <li><code>cd folder</code> — change directory, i.e. move into a folder.</li>
        <li><code>dir</code> (PowerShell/CMD) or <code>ls</code> — list what is in the current
        folder.</li>
        <li><code>node file.js</code> — run a JavaScript file.</li>
        <li><code>npm install</code> (short: <code>npm i</code>) — download a project's
        dependencies.</li>
        <li><code>Ctrl+C</code> — stop whatever is running (servers do not exit on their own).</li>
      </ul>
      <p>One honest Windows gotcha: PowerShell sometimes blocks the <code>npm.ps1</code> script that
      wraps npm. The next example shows the exact error and two ways past it.</p>
    `
  ],
  examples: [
    {
      title: "Install Node.js and prove it works",
      from: "new",
      lang: "bash",
      code: `# option A: download the installer from nodejs.org and run it
# option B: install from the terminal (Windows)
$ winget install OpenJS.NodeJS.LTS

# open a NEW terminal, then verify both tools
$ node -v
v24.19.0
$ npm -v
11.17.0`,
      explain: [
        "<code>winget</code> is Windows' built-in package manager; the LTS installer from nodejs.org does exactly the same thing.",
        "<code>node -v</code> prints the Node version — if you see a version, Node is installed <em>and</em> on your PATH.",
        "<code>npm -v</code> prints npm's version (11.17.0 at the time of writing). No separate npm install is needed.",
        "Different numbers on your machine are fine; an error like <code>'node' is not recognized</code> means you need a new terminal or a reinstall."
      ],
      run: "node -v"
    },
    {
      title: "PowerShell blocks npm.ps1 — the fix",
      from: "new",
      lang: "bash",
      code: `PS> npm -v
npm : File C:\\Program Files\\nodejs\\npm.ps1 cannot be loaded because running
scripts is disabled on this system. For more information, see
about_Execution_Policies at https:/go.microsoft.com/fwlink/?LinkID=135170.

# fix A (no settings changed): call npm.cmd explicitly
PS> npm.cmd -v
11.17.0

# fix B (one-time): allow local scripts for your account
PS> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
PS> npm -v
11.17.0`,
      explain: [
        "This is a real Windows PowerShell message: its <strong>execution policy</strong> refuses to run <code>.ps1</code> scripts, and npm ships one of those.",
        "Nothing is wrong with your Node install — the underlying <code>npm.cmd</code> works, so <code>npm.cmd -v</code> gives you 11.17.0 immediately.",
        "<code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code> lifts the block for your account only; answer <code>Y</code> when asked.",
        "Command Prompt (<code>cmd</code>) and Git Bash are not affected by this at all."
      ],
      run: "npm.cmd -v"
    },
    {
      title: "Open this repository in VS Code",
      from: "new",
      lang: "bash",
      code: `# navigate to the repo, then open the whole folder as a project
$ cd Desktop\\FSD_JOURNAL
$ code .

# or without the CLI: VS Code -> File -> Open Folder -> FSD_JOURNAL
# inside VS Code, Ctrl+\` opens the integrated terminal`,
      explain: [
        "<code>code .</code> opens VS Code on the current folder (the dot means \"here\").",
        "It needs the <em>Add to PATH</em> checkbox during install; if Windows says it is unknown, use File → Open Folder instead — the result is identical.",
        "Open the <strong>folder</strong>, not individual files: the editor then resolves <code>require()</code> paths, the terminal starts in the right place, and the file tree on the left shows all 15 week folders.",
        "All later lessons assume your integrated terminal is at the repository root."
      ],
      run: "code ."
    },
    {
      title: "Check that MySQL is up — one safe line",
      from: "new",
      lang: "bash",
      code: `# start MySQL first: XAMPP Control Panel -> Start next to MySQL

# now ask port 3306 if anyone is home
$ node -e "require('net').connect(3306,'127.0.0.1',()=>{console.log('MySQL is up');process.exit(0)}).on('error',()=>{console.log('MySQL is OFF - start it in XAMPP');process.exit(1)})"
MySQL is up

# if you skip the XAMPP step, you get the other answer:
MySQL is OFF - start it in XAMPP`,
      explain: [
        "<code>node -e \"...\"</code> runs a JavaScript snippet without creating a file — a habit you will reuse throughout the book.",
        "The snippet opens a TCP connection to port 3306 on your own machine (<code>127.0.0.1</code>, also called localhost).",
        "Success prints <code>MySQL is up</code> and exits with code 0; a refusal (nothing listening) fires the <code>error</code> handler and exits with code 1.",
        "Run this line before any Unit II chapter — it turns \"my database is broken\" into a two-second yes/no."
      ],
      run: "node -e \"require('net').connect(3306,'127.0.0.1',()=>{console.log('MySQL is up');process.exit(0)}).on('error',()=>{console.log('MySQL is OFF - start it in XAMPP');process.exit(1)})\""
    },
    {
      title: "What the journal expects from your setup (Week 7)",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/README.txt",
      lang: "text",
      code: `Week 7: Sequelize+MySQL. Run inside Lab16/ or proj-2408023/ (needs MySQL + npm i).
The same projects also cover Weeks 8-9 (models/migrations/CRUD live inside them).`,
      explain: [
        "This is the journal's own README for Week 7 — note the two prerequisites: <em>MySQL</em> and <em>npm i</em>.",
        "<em>Run inside Lab16/ or proj-2408023/</em> means <code>cd</code> into that folder first; Node resolves packages relative to where you run the command (Lesson 4 covers this in depth).",
        "If you skip starting MySQL in XAMPP, this is the week where everything suddenly \"stops working\" — it is almost always the database, not your code."
      ]
    },
    {
      title: "What a full-stack week asks of your machine (Week 15)",
      from: "journal",
      file: "sorted_files/15_Week-15_Integration-otaku/README.txt",
      lang: "text",
      code: `Week 15: Otaku Travel Map. Backend: otaku-server/ (\`npm i && node server.js\`, MySQL :3306).
Frontend: this folder root has vite.config (proxy /api->:5000) + src in otaku-frontend/ (\`npm i && npm run dev\` :5173).`,
      explain: [
        "The final week runs three things at once: a Node back end on port 5000, a Vite front end on port 5173, and MySQL on port 3306.",
        "<code>npm i && node server.js</code> chains two commands: install dependencies, then start the server — both come from this lesson's toolchain.",
        "Every port in this course is just a number identifying a service: 3306 MySQL, 5000 API, 5173 dev server, 8080 Express labs.",
        "Reading a README like this before running a project takes ten seconds and prevents most setup failures."
      ]
    },
    {
      title: "A connection that fails — the price of a wrong port or a stopped MySQL",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/Lab16/db.js",
      lang: "javascript",
      code: `const { Sequelize } = require('sequelize');

//Connect to the database
const sequelize = new Sequelize('nishant', 'root', '', {
  host: 'localhost',
  port: 3307,
  dialect: 'mysql',
  logging: false
});

//Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection successful!');

  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();`,
      explain: [
        "This is the journal's real database configuration: database <code>nishant</code>, user <code>root</code>, empty password, MySQL on <code>localhost</code>.",
        "<strong>Spot the mismatch:</strong> it asks for port <strong>3307</strong>, but XAMPP's MySQL listens on <strong>3306</strong> by default. On a stock install the run below fails — either start MySQL on 3307 or change this line to <code>port: 3306</code>.",
        "<code>try/catch</code> wraps the connection test: success prints <code>Connection successful!</code>, any failure lands in <code>catch</code> and prints <code>Connection failed:</code> with the driver's message.",
        "Run it with <code>node db.js</code> inside <code>Lab16/</code> after <code>npm i</code> — this exact file is reused in Lessons 41–43."
      ],
      run: "node db.js",
      output: "Connection failed:"
    }
  ],
  keyPoints: [
    "Node.js gives you the node command; npm (bundled with it) downloads packages",
    "Verify installs with node -v and npm -v, in a freshly opened terminal",
    "PowerShell may block npm.ps1 — use npm.cmd or Set-ExecutionPolicy -Scope CurrentUser RemoteSigned",
    "XAMPP supplies MySQL on port 3306; start it in the Control Panel before any Unit II lab",
    "Open the FSD_JOURNAL folder (code .) and work from a terminal at the repository root"
  ],
  practice: `
    <p>Install Node.js (LTS), then open a <em>new</em> terminal and run <code>node -v</code> and
    <code>npm -v</code> — write both versions down. Install VS Code and open this repository as a
    folder; press <code>Ctrl+</code>\` to open the integrated terminal. Install XAMPP, press Start
    next to MySQL, and run the port-3306 check line from example 4 until it prints
    <code>MySQL is up</code>. Finally, try <code>npm -v</code> in PowerShell: if the
    <code>npm.ps1</code> error appears, apply fix A (<code>npm.cmd</code>) or fix B
    (<code>Set-ExecutionPolicy</code>) from example 2 and confirm it prints a version.</p>
  `,
  quiz: [
    {
      q: "Which pair of commands proves that Node.js and npm are installed correctly?",
      options: [
        "node --list and npm list all",
        "node -v and npm -v",
        "npm node and node npm",
        "node install and npm setup"
      ],
      answer: 1,
      why: "node -v (short for node --version) prints the Node version and npm -v prints npm's version. Both must show a version number, in a terminal opened after the install."
    },
    {
      q: "A Sequelize script fails with a connection error. What should you check FIRST?",
      options: [
        "Reinstall VS Code",
        "Delete the node_modules folder",
        "Whether MySQL is started in XAMPP and listening on port 3306",
        "Change the file extension from .js to .jsx"
      ],
      answer: 2,
      why: "Unit II code talks to MySQL on port 3306. If the XAMPP Control Panel shows MySQL stopped, nothing else matters — start it (and remember the journal's Lab16/db.js asks for port 3307)."
    }
  ],
  sources: [
    "https://nodejs.org/en/download",
    "https://code.visualstudio.com/",
    "https://www.apachefriends.org/",
    "https://sequelize.org/docs/v6/getting-started/"
  ]
});
