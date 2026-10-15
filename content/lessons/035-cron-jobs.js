window.COURSE_LESSONS.push({
  id: "w06-cron-jobs",
  file: "035",
  unit: 1,
  week: 6,
  title: "Cron jobs in Node.js",
  kicker: "Unit I · Week 6 · Lesson 1 of 4",
  minutes: 16,
  objectives: [
    "Read a five-field cron expression and say exactly when it will run",
    "Schedule recurring work inside a Node program with the node-cron package",
    "Hand a script to the machine's own scheduler (crontab or Task Scheduler)",
    "Explain why two of the journal's cron files are unfinished — and finish them yourself"
  ],
  intro: `
    <p>In Week 5 you built gateways and servers: programs that sit in one place, run forever, and
    answer requests the moment they arrive. That covers half of real work. The other half is work that
    must happen <em>on a schedule</em> — a report at 9 a.m., a backup every night, a "server is alive"
    ping every five minutes — whether or not anybody sends a request.</p>
    <p>Week 6 opens with that idea: <strong>jobs</strong>, and the classic tool for scheduling them,
    <strong>cron</strong>. You will read four real files from your journal, learn to read expressions
    like <code>*/5 * * * *</code>, and be honest about what is actually in the folder —
    <code>03_cron3.js</code> is truncated and <code>04_cron4.js</code> contains only comments in the
    original journal — and this lesson shows you the finished program those two files were heading
    towards.</p>
  `,
  theory: [
    `
      <h3>Jobs, schedules, and why cron is spelled that way</h3>
      <p>A <strong>job</strong> is any small program (or function) that you want to run for you
      repeatedly. The tool that decides <em>when</em> to run it is called <strong>cron</strong>, after
      the Unix scheduler of the same name that has been shipping with Linux since the 1970s. You write
      your timetable into a plain text file — your <strong>crontab</strong> (cron table) — and the
      machine's cron daemon reads it and starts your program at the right moments.</p>
      <p>There are two ways to get a schedule in Node, and your journal folder contains material for
      both:</p>
      <ul>
        <li><strong>Inside your program</strong> — the <code>node-cron</code> package. Your Node process
        stays running and calls your function itself. Simple to code, but it only works while your
        program is alive.</li>
        <li><strong>Outside your program</strong> — the operating system's own scheduler
        (<code>cron</code>/<code>crontab</code> on Linux and macOS, <strong>Task Scheduler</strong> on
        Windows). The OS starts <code>node your-file.js</code> for you, even after a reboot.</li>
      </ul>
      <pre class="diagram">  run it by hand                    let the machine run it
  ---------------------------- ----------------------------------
  $ node report.js               crontab:  0 9 * * *  node report.js
  (runs once, prints, exits)     every day at 09:00 the OS starts
                                 node for you, it runs, it exits</pre>
    `,
    `
      <h3>Reading a cron expression: five fields</h3>
      <p>A cron expression is a space-separated list of five fields that answers "when?". Read it
      left to right, smallest unit first:</p>
      <table>
        <thead><tr><th>#</th><th>field</th><th>range</th><th>example value</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>minute</td><td>0 – 59</td><td><code>44</code></td></tr>
          <tr><td>2</td><td>hour (0–23)</td><td>0 – 23</td><td><code>16</code></td></tr>
          <tr><td>3</td><td>day of month</td><td>1 – 31</td><td><code>*</code></td></tr>
          <tr><td>4</td><td>month</td><td>1 – 12</td><td><code>*</code></td></tr>
          <tr><td>5</td><td>day of week</td><td>0 – 7 (0 and 7 = Sunday)</td><td><code>*</code></td></tr>
        </tbody>
      </table>
      <p>Four characters do all the work: <code>*</code> means <em>every</em>, <code>-</code> is a range
      (<code>1-5</code>), <code>,</code> is a list (<code>1,15</code>), and <code>/</code> is a step
      (<code>*/5</code> = "every 5th one"). Put them together and you can read any expression:</p>
      <table>
        <thead><tr><th>expression</th><th>meaning</th></tr></thead>
        <tbody>
          <tr><td><code>*/5 * * * *</code></td><td>every 5 minutes, all day</td></tr>
          <tr><td><code>44 16 * * *</code></td><td>at 16:44 every day (this is <code>02_cron2.js</code>)</td></tr>
          <tr><td><code>0 9 * * 1-5</code></td><td>at 09:00 on weekdays</td></tr>
          <tr><td><code>30 12 * * 0</code></td><td>at 12:30 every Sunday</td></tr>
          <tr><td><code>0 0 1 * *</code></td><td>at midnight on the 1st of every month</td></tr>
        </tbody>
      </table>
      <div class="callout"><strong>One trap in this week's journal:</strong> <code>node-cron</code>
      accepts an optional <em>sixth</em> field at the front — <strong>seconds</strong>. So
      <code>01_cron.js</code>'s <code>*/5 * * * * *</code> means "every 5 <em>seconds</em>", not "every
      5 minutes". Six fields = seconds first, then the five fields of the table above.</div>
    `,
    `
      <h3>node-cron: keeping the schedule inside your process</h3>
      <p>The week-6 <code>package.json</code> in your journal already declares
      <code>"node-cron": "^4.6.0"</code>, so a plain <code>npm install</code> in
      <code>sorted_files/06_Week-06_Cron-Webpack/</code> gives you the package. The whole API you need
      is one function:</p>
      <ul>
        <li><code>const cron = require("node-cron");</code> — CommonJS import, same shape as every
        module since Week 2.</li>
        <li><code>cron.schedule(expression, fn)</code> — register a job. It returns a <em>task</em>
        object you can later stop with <code>task.stop()</code>.</li>
        <li><code>cron.validate(expression)</code> — returns <code>true</code>/<code>false</code>. Use it
        before trusting an expression you wrote at 2 a.m.</li>
        <li>The process <strong>does not exit</strong> while jobs are scheduled: Node keeps a live timer,
        so your program waits around to do its work. Stop it with <code>Ctrl+C</code>.</li>
      </ul>
    `,
    `
      <h3>Scheduling outside the program: crontab and Task Scheduler</h3>
      <p>When the schedule must survive reboots or must not keep a Node process alive all day, give the
      job to the operating system instead. On Linux/macOS you edit one file (<code>crontab -e</code>)
      and add a line built from the same five fields you just learned. On Windows, Task Scheduler does
      the same job from the command line with <code>schtasks /create</code>.</p>
      <p>The trade-off is worth stating plainly: <code>node-cron</code> is one line of code but lives
      and dies with your process; the OS scheduler needs a bit of setup but starts your script on its
      own, even after the machine restarts. Production systems usually use the second one to start the
      long-running program, and <code>node-cron</code> for schedules <em>inside</em> it.</p>
    `,
    `
      <h3>What is really in the journal folder</h3>
      <p>Your journal's own README for this week is admirably honest, and this book will not pretend
      otherwise:</p>
      <blockquote>Week 6: cron jobs (need <code>npm i node-cron</code>) + webpack (run inside
      week5-bundler/). cron3.js is truncated and cron4.js comment-only (preserved as-is).</blockquote>
      <ul>
        <li><code>01_cron.js</code> — complete, works, prints every 5 seconds.</li>
        <li><code>02_cron2.js</code> — complete, three daily schedules at 16:44, 16:45, 16:46.</li>
        <li><code>03_cron3.js</code> — <strong>truncated</strong>: it lists nine exercises at the top
        but implements only four, and the file stops on a dangling <code>//random</code> comment where
        the student was clearly still writing. It still parses and runs; it is simply unfinished.</li>
        <li><code>04_cron4.js</code> — <strong>comment-only</strong>: a specification of eight more
        jobs ("happy new year every january 1st", "lunch time every hour" and six more) with no code
        at all.</li>
      </ul>
      <p>The fifth example below is the finished program the journal was heading towards — written for
      this book, built out of both files.</p>
    `
  ],
  examples: [
    {
      title: "The smallest cron program: one job, every 5 seconds",
      from: "journal",
      file: "sorted_files/06_Week-06_Cron-Webpack/01_cron.js",
      lang: "javascript",
      code: `const cron = require('node-cron');

cron.schedule("*/5 * * * * *", ()=>{
    console.log("running every 5 seconds");
});`,
      explain: [
        "<code>require('node-cron')</code> loads the package installed in this week's folder — no built-in cron module exists in Node.",
        "<code>cron.schedule(expr, fn)</code> registers the job and returns immediately; <code>fn</code> is called later by the scheduler.",
        "Six fields here: the first <code>*/5</code> is the <em>seconds</em> field, which only <code>node-cron</code> supports — a real system crontab would reject this line.",
        "The program never exits on its own: press <code>Ctrl+C</code> to stop it."
      ],
      run: "node sorted_files/06_Week-06_Cron-Webpack/01_cron.js",
      output: `running every 5 seconds
running every 5 seconds
running every 5 seconds
(keeps printing every 5 seconds until you press Ctrl+C)`
    },
    {
      title: "Three daily alarms with five-field expressions",
      from: "journal",
      file: "sorted_files/06_Week-06_Cron-Webpack/02_cron2.js",
      lang: "javascript",
      code: `const cron = require('node-cron');

cron.schedule("44 16 * * *", ()=>{
    console.log("running every 04:44 pm");
}); 

cron.schedule("45 16 * * *", ()=>{
    console.log("running every 04:45 pm");
}); 

cron.schedule("46 16 * * *", ()=>{
    console.log("running every 04:46 pm");
}); `,
      explain: [
        "These are proper five-field expressions: minute 44, hour 16, every day of the month, every month, every weekday.",
        "Read <code>44 16 * * *</code> as \"at 16:44\" — the comment's \"every 04:44 pm\" means <em>once a day</em>, at that minute.",
        "Three <code>schedule</code> calls = three independent jobs in one process; each fires its own callback.",
        "Leave this program running past 16:44 and you will see the three lines appear one minute apart."
      ],
      run: "node sorted_files/06_Week-06_Cron-Webpack/02_cron2.js",
      output: `running every 04:44 pm   (at 16:44:00)
running every 04:45 pm   (one minute later)
running every 04:46 pm   (and one more minute later)`
    },
    {
      title: "03_cron3.js — a truncated file, exactly as it sits in the journal",
      from: "journal",
      file: "sorted_files/06_Week-06_Cron-Webpack/03_cron3.js",
      lang: "javascript",
      code: `//print hello every minut
//print "good morning" every 10 sec
// your name every 5 sec
//the current date and times every 30 sec
//print  a random number every 15 secs
//print welcome to node js every min
//print "task running every 20 sec"
// "happy coding!" every 25 seconds
// the mimber 1 to 10 every minuts.
//1 hello
const cron = require('node-cron');

cron.schedule("*/1 * * * *", ()=>{
    console.log("hello");
});

//good morning
cron.schedule("*/10 * * * * *", ()=>{
    console.log("Good morning");
});

//my name
cron.schedule("*/5 * * * * *", ()=>{
    console.log("Nishant");
});
//data and time.
cron.schedule("*/30 * * * * *", ()=>{
    console.log(new Date().toLocaleString());
});


//random`,
      explain: [
        "The top of the file is a <strong>to-do list of nine exercises</strong>; only the first four are implemented below it.",
        "The file ends on <code>//random</code> — the fifth exercise (\"a random number every 15 secs\") was never written. That is what \"truncated\" means here: the original journal was cut off mid-edit.",
        "Because the cut happened on a comment line, the file still parses and runs: <code>hello</code> every minute, <code>Good morning</code> every 10 seconds, <code>Nishant</code> every 5 seconds, the date every 30 seconds.",
        "Note the mix of field counts: <code>*/1 * * * *</code> is five fields (every minute), while <code>*/10 * * * * *</code> is six (every 10 seconds).",
        "This book shows the file untouched, as the journal README asks — the finished version is the next example."
      ],
      run: "node sorted_files/06_Week-06_Cron-Webpack/03_cron3.js",
      output: `Nishant
Good morning
Nishant
Nishant
Good morning
(keeps printing until you press Ctrl+C)`
    },
    {
      title: "04_cron4.js — a specification written entirely in comments",
      from: "journal",
      file: "sorted_files/06_Week-06_Cron-Webpack/04_cron4.js",
      lang: "javascript",
      code: `//print happy new year every january 1st.
//print marry christmas every december 25th 
//print "welcome june" on june 1st

//hour
/*
print "lunch time" every hour
print system memory usage every 3 hours.
print server status every 6 hour
print current time every 12 hours.
*/`,
      explain: [
        "There is no executable statement in this file — running it prints nothing and exits immediately.",
        "It is still useful: it is a <strong>spec</strong>. Each comment maps to exactly one cron expression you can now write yourself.",
        "E.g. \"happy new year every january 1st\" becomes <code>0 0 1 1 *</code> — minute 0, hour 0, day 1, month 1, any weekday.",
        "Turning a comment like this into a working <code>cron.schedule</code> line is precisely the exercise of the next example."
      ],
      run: "node sorted_files/06_Week-06_Cron-Webpack/04_cron4.js",
      output: "(no output — comment-only file)"
    },
    {
      title: "The finished version: cron3.js + cron4.js completed",
      from: "new",
      lang: "javascript",
      code: `const cron = require("node-cron");

// --- from 03_cron3.js: its four implemented exercises, tidied ---
cron.schedule("* * * * *", () => console.log("hello"));
cron.schedule("*/10 * * * * *", () => console.log("Good morning"));
cron.schedule("*/5 * * * * *", () => console.log("Nishant"));
cron.schedule("*/30 * * * * *", () => console.log(new Date().toLocaleString()));

// --- from 04_cron4.js: the comment-only spec, turned into code ---
cron.schedule("0 * * * *", () => console.log("lunch time"));
cron.schedule("0 0 1 1 *", () => console.log("happy new year"));
cron.schedule("0 0 25 12 *", () => console.log("merry christmas"));

// never trust an expression you have not checked
["* * * * *", "70 99 * * *", "44 16 * * *", "*/5 * * * * *"].forEach((expr) => {
  console.log(expr, "->", cron.validate(expr) ? "valid" : "invalid");
});

console.log("scheduler started - press Ctrl+C to stop");`,
      explain: [
        "Save as <code>cron-jobs-finished.js</code> inside <code>sorted_files/06_Week-06_Cron-Webpack/</code> (so <code>node-cron</code> resolves) and run it there.",
        "The eight <code>schedule</code> calls are the whole of cron3 and cron4 turned into working code — eight jobs, one process.",
        "<code>cron.validate()</code> prints <code>true</code> for good expressions and <code>false</code> for <code>70 99 * * *</code> (minute 70 and hour 99 do not exist), which is exactly the kind of typo it exists to catch.",
        "The validation lines print immediately; the jobs then arrive on their own schedule — 5 s, 10 s, 30 s, then once an hour/day/year."
      ],
      run: "node cron-jobs-finished.js",
      output: `* * * * * -> valid
70 99 * * * -> invalid
44 16 * * * -> valid
*/5 * * * * * -> valid
scheduler started - press Ctrl+C to stop
Nishant
Good morning
Nishant`
    },
    {
      title: "The same schedules with the operating system instead of node-cron",
      from: "new",
      lang: "bash",
      code: `# --- Linux / macOS ---
$ crontab -e                    # opens your timetable file in an editor
# inside the editor, add this line (five fields, exactly as in the table):
0 9 * * * /usr/bin/node /home/nishant/report.js >> /home/nishant/report.log 2>&1
$ crontab -l                    # list the lines that are currently active

# --- Windows (PowerShell as Administrator) ---
PS> schtasks /create /tn "node-report" /sc daily /st 09:00 /tr "node C:\\nishant\\report.js"
PS> schtasks /run /tn "node-report"      # test it now instead of waiting until 09:00
PS> schtasks /query /tn "node-report"
PS> schtasks /delete /tn "node-report" /f`,
      explain: [
        "The crontab line is the same grammar you learned: minute 0, hour 9, every day — <code>node report.js</code> is started by the OS, not by you.",
        "<code>&gt;&gt; report.log 2&gt;&amp;1</code> keeps whatever the script prints, so a failed job leaves evidence instead of vanishing.",
        "<code>schtasks /sc daily /st 09:00</code> is Task Scheduler's spelling of the same idea; <code>/tr</code> is the command to run.",
        "<code>schtasks /run</code> is the equivalent of pressing \"Run now\" — always test a schedule before trusting it.",
        "Unlike <code>node-cron</code>, these jobs work even when no Node program is running, and after a reboot."
      ],
      run: "crontab -e   (or: schtasks /create ...)"
    }
  ],
  keyPoints: [
    "A cron expression is five space-separated fields: minute, hour, day of month, month, day of week.",
    "<code>*</code> means every, <code>/</code> steps (<code>*/5</code> = every 5th), <code>-</code> ranges, <code>,</code> lists.",
    "node-cron adds an optional sixth field for seconds — that is why <code>*/5 * * * * *</code> fires every 5 seconds.",
    "<code>cron.schedule(expr, fn)</code> registers a job and keeps the process alive; <code>cron.validate(expr)</code> checks one before you trust it.",
    "Two schedulers: node-cron (inside your program, lives as long as it runs) and crontab / Task Scheduler (outside, survives reboots).",
    "The journal's cron3.js is truncated and cron4.js is comment-only — read honestly, then finish them."
  ],
  practice: `
    <p>Pick two exercises the journal never finished — \"a random number every 15 secs\" and
    \"welcome to node js every min\" from <code>03_cron3.js</code> — and add them to the finished
    program above (they are <code>*/15 * * * * *</code> and <code>*/1 * * * *</code>). Then translate
    one remaining cron4 comment (\"server status every 6 hour\") into a five-field expression and check
    it with <code>cron.validate()</code> before you schedule it.</p>
  `,
  quiz: [
    {
      q: "Which expression means \"at 16:44 every day\"?",
      options: ["44 16 * * *", "16 44 * * *", "*/44 */16 * * *", "44 * 16 * *"],
      answer: 0,
      why: "Field 1 is the minute (44) and field 2 is the hour (16); the three stars mean every day, every month, every weekday. The other options mix up the order or treat the values as steps."
    },
    {
      q: "01_cron.js schedules \"*/5 * * * * *\" and prints every 5 seconds, not every 5 minutes. Why?",
      options: [
        "node-cron accepts an optional sixth field — seconds — in front of the five standard fields",
        "The stars at the end are ignored, so the expression is invalid",
        "Node timers always override cron expressions",
        "Because the file is run inside week5-bundler/"
      ],
      answer: 0,
      why: "With six fields the order is second, minute, hour, day, month, weekday, so the leading */5 steps the seconds field. A system crontab would reject six fields — only node-cron allows it."
    }
  ],
  sources: [
    "https://www.npmjs.com/package/node-cron",
    "https://crontab.guru/",
    "https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/schtasks-create"
  ]
});
