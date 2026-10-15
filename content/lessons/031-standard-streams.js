window.COURSE_LESSONS.push({
  id: "w05-standard-streams",
  file: "031",
  unit: 1,
  week: 5,
  title: "Standard streams: stdin, stdout, stderr",
  kicker: "Unit I · Week 5 · Lesson 3 of 6",
  minutes: 14,
  objectives: [
    "Name the three standard streams and what each is for",
    "Read user input from process.stdin by subscribing to its 'data' event",
    "Send normal output to stdout and errors to stderr, and explain why they are separate"
  ],
  intro: `
    <p>You have been using one standard stream all along: every <code>console.log</code> you have typed
    writes to <strong>stdout</strong>. Streams are not only for files — the terminal itself is a stream,
    and Node exposes it as <code>process.stdin</code>, <code>process.stdout</code> and
    <code>process.stderr</code>. This is how a Node program talks to the person running it.</p>
    <p>Your journal's Week 5 <code>17_app.js</code> is a nine-line program that demonstrates all three at
    once. We will run it, then build a small interactive program on top of the same ideas.</p>
  `,
  theory: [
    `
      <h3>The three standard streams</h3>
      <p>Every process, in every operating system, is handed three open streams when it starts:</p>
      <table>
        <thead><tr><th>Stream</th><th>Direction</th><th>What it carries</th><th>Typical use</th></tr></thead>
        <tbody>
          <tr><td><code>process.stdin</code></td><td>IN (readable)</td><td>whatever the user types / pipes in</td><td>reading input</td></tr>
          <tr><td><code>process.stdout</code></td><td>OUT (writable)</td><td>normal results</td><td><code>console.log</code> is a thin wrapper over this</td></tr>
          <tr><td><code>process.stderr</code></td><td>OUT (writable)</td><td>errors and diagnostics</td><td>failure messages, warnings</td></tr>
        </tbody>
      </table>
      <p><code>stdin</code> is a <em>readable</em> stream and <code>stdout</code>/<code>stderr</code> are
      <em>writable</em> streams — the same two kinds you used on files in the last lesson. The only
      difference is the source and destination: the keyboard/terminal instead of a file on disk.</p>
    `,
    `
      <h3>Why two separate outputs?</h3>
      <p>It may seem odd to have two ways to print, but separating them is what makes shell pipelines
      work. Normal output is the program's <em>answer</em>; stderr is its <em>complaints</em>. Because
      they are separate streams, you can send answers to a file while still showing complaints on screen:</p>
      <pre class="diagram">  node program.js &gt; answers.txt     # stdout goes to the file
  node program.js 2&gt; errors.log   # stderr goes to the file
  node program.js &gt; out.txt 2&gt;/dev/null   # keep stdout, throw away errors</pre>
      <p>If errors were printed to stdout they would be silently mixed into the data. Keeping them apart
      is a design habit worth building now, before you meet real servers that log errors to stderr.</p>
    `,
    `
      <h3>Reading input: the 'data' event again</h3>
      <p><code>process.stdin</code> is a readable stream, so — exactly like
      <code>fs.createReadStream</code> — you subscribe to it rather than call a "read" function:</p>
      <pre class="diagram">  process.stdin.on("data", (chunk) =&gt; {
      // chunk is a Buffer; call .toString() (or set encoding) to get text
  });</pre>
      <p>One important detail: attaching a <code>'data'</code> listener puts the stream into flowing mode,
      so it starts delivering keystrokes immediately. Each chunk usually arrives when the user presses
      <kbd>Enter</kbd>, and it ends with a trailing <code>\n</code> — beginners often print a value and
      see an unwanted blank line because they forgot to trim it.</p>
    `
  ],
  examples: [
    {
      title: "The journal's app.js: all three streams in nine lines",
      from: "journal",
      file: "sorted_files/05_Week-05_Streams-Routing/17_app.js",
      lang: "javascript",
      code: `
process.stdout.write("program started\\n"); //stdout used to display an output

process.stdin.on("data", (data) => { //stdin to recive an input
  console.log("Input:", data.toString());
});
//stderr used to display an error
process.stderr.write("this is an error message\\n");
`,
      explain: [
        "<code>process.stdout.write(\"…\\n\")</code> is the low-level call underneath <code>console.log</code> — you write the newline yourself.",
        "<code>process.stdin.on(\"data\", …)</code> subscribes to user keystrokes; each time you press <kbd>Enter</kbd> the callback fires with a Buffer.",
        "<code>data.toString()</code> turns that Buffer into text so it can be printed.",
        "<code>process.stderr.write(\"…\")</code> sends the message to the error stream — it still shows in your terminal, but it is logically separate.",
        "Type a line and press <kbd>Enter</kbd> to see it echoed; press <kbd>Ctrl</kbd>+<kbd>C</kbd> to exit, because an active stdin keeps the process alive."
      ],
      run: "node 17_app.js",
      output: `program started
this is an error message
Input: hello from the terminal
Input: ... (keep typing; Ctrl+C to quit)`
    },
    {
      title: "Reading a number and replying (a tiny calculator)",
      from: "new",
      lang: "javascript",
      code: `
process.stdout.write("Enter a number: ");

process.stdin.on("data", (chunk) => {
  const text = chunk.toString().trim();      // strip the trailing newline
  const n = Number(text);

  if (Number.isNaN(n)) {
    process.stderr.write("That was not a number: " + text + "\\n");
  } else {
    process.stdout.write("Double of " + n + " is " + (n * 2) + "\\n");
  }
});
`,
      explain: [
        "Save as <code>double.js</code>. It prompts, reads one line, and answers — the skeleton of every CLI tool.",
        "<code>.trim()</code> removes the newline the user's <kbd>Enter</kbd> added; skip it and your output gets an extra blank line.",
        "<code>Number(text)</code> converts; <code>Number.isNaN</code> catches junk input. Validation on the way in is a habit worth keeping.",
        "Valid answers go to <code>stdout</code>, complaints to <code>stderr</code> — the separation from the theory in practice."
      ],
      run: "node double.js",
      output: `Enter a number: 21
Double of 21 is 42
Enter a number: abc
That was not a number: abc`
    },
    {
      title: "Piping a file in — stdin is just a stream",
      from: "new",
      lang: "javascript",
      code: `
let lines = 0;
let chars = 0;

process.stdin.on("data", (chunk) => {
  lines += chunk.toString().split("\\n").length - 1;
  chars += chunk.length;
});

process.stdin.on("end", () => {
  console.log("lines:", lines, "chars:", chars);
});
`,
      explain: [
        "Save as <code>wc-lite.js</code>. It reads whatever it is given and reports a count, like the classic <code>wc</code> tool.",
        "Because <code>stdin</code> is a normal readable stream, the shell can hand it a file: <code>node wc-lite.js &lt; sampleForStream.txt</code>.",
        "The <code>'end'</code> event fires when input is exhausted — the right place to print the final tally, mirroring <code>01_streams.js</code>.",
        "The same program also works with a pipe: <code>type sampleForStream.txt | node wc-lite.js</code>. Streams compose, which is the whole point."
      ],
      run: "node wc-lite.js < sorted_files/05_Week-05_Streams-Routing/sampleForStream.txt",
      output: `lines: 6 chars: 404`
    },
    {
      title: "Prompt, then exit explicitly with the exit code",
      from: "new",
      lang: "javascript",
      code: `
process.stdout.write("Type 'quit' to exit.\\n");

process.stdin.on("data", (chunk) => {
  const text = chunk.toString().trim();

  if (text === "quit") {
    process.stdout.write("bye\\n");
    process.exit(0);            // 0 = success
  } else if (text === "fail") {
    process.stderr.write("exiting with an error\\n");
    process.exit(1);            // non-zero = something went wrong
  } else {
    process.stdout.write("you said: " + text + "\\n");
  }
});
`,
      explain: [
        "Save as <code>repl-lite.js</code>. It loops until the user types a keyword, then stops on purpose.",
        "<code>process.exit(code)</code> ends the program immediately; convention is <code>0</code> for success and anything else for failure.",
        "Typing <code>quit</code> exits cleanly; typing <code>fail</code> exits non-zero after writing to stderr — you can see the difference with <code>echo $?</code> (or <code>$LASTEXITCODE</code> in PowerShell).",
        "An active <code>stdin</code> listener keeps Node alive, which is why the program needs an explicit exit rather than just returning from a callback."
      ],
      run: "node repl-lite.js",
      output: `Type 'quit' to exit.
you said: hello
bye`
    },
    {
      title: "process.argv + stdin together: a name from the command line, a greeting from stdin",
      from: "new",
      lang: "javascript",
      code: `
const name = process.argv[2] || "friend";

process.stdout.write("Hello, " + name + "! What is your favourite colour? ");

process.stdin.once("data", (chunk) => {          // once = listen a single time
  const colour = chunk.toString().trim();
  console.log(name + " likes " + colour + ". Noted.");
  process.exit(0);
});
`,
      explain: [
        "Save as <code>greet.js</code> and run it as <code>node greet.js Nishant</code>. It mixes <code>argv</code> (Week 4) with stdin.",
        "<code>process.argv[2]</code> is the first argument after the script name; the <code>|| \"friend\"</code> fallback covers the no-argument case.",
        "<code>.once(\"data\", …)</code> fires for a single chunk and then unsubscribes — the right choice when you only want one answer.",
        "The prompt has no newline, so the user's typing appears on the same line — a small touch that makes CLIs feel polished."
      ],
      run: "node greet.js Nishant",
      output: `Hello, Nishant! What is your favourite colour? blue
Nishant likes blue. Noted.`
    }
  ],
  keyPoints: [
    "Every process starts with three streams: <code>stdin</code> (readable, input), <code>stdout</code> (writable, normal output) and <code>stderr</code> (writable, errors).",
    "<code>console.log</code> is just a wrapper around <code>process.stdout.write</code>, with a newline added for you.",
    "Reading input means subscribing: <code>process.stdin.on('data', chunk =&gt; …)</code>, then calling <code>chunk.toString()</code>.",
    "Remember to <code>trim()</code> input — each Enter adds a <code>\\n</code> that will otherwise appear in your output.",
    "Keep stdout and stderr separate so errors can be redirected apart from real data, exactly like the shell operators <code>&gt;</code> and <code>2&gt;</code> expect."
  ],
  practice: `
    <p>Write <code>quiz.js</code>: it asks three yes/no questions on stdin, counts how many were answered
    <code>y</code>, then prints the score to stdout and exits with code <code>0</code>. If any answer is
    neither <code>y</code> nor <code>n</code>, write a complaint to <code>stderr</code> and re-ask that
    question. Run it once normally and once with <code>node quiz.js &lt; answers.txt</code> to prove it
    works without a keyboard.</p>
  `,
  quiz: [
    {
      q: "Which standard stream would you write an error message to?",
      options: [
        "process.stdin",
        "process.stdout",
        "process.stderr",
        "process.error"
      ],
      answer: 2,
      why: "<code>process.stderr</code> is the dedicated error stream. There is no <code>process.error</code>. Keeping errors on stderr lets the shell redirect them separately from real output."
    },
    {
      q: "Why does process.stdin.on('data', cb) deliver text only after the user presses Enter?",
      options: [
        "Because Node buffers the whole program's input before starting",
        "Because the terminal delivers input line by line by default, so a chunk arrives when a full line is typed",
        "Because 'data' fires only once per program",
        "Because stdin is a synchronous stream"
      ],
      answer: 1,
      why: "In its default (line-buffered) mode the terminal hands the program a chunk each time a line is completed — hence the trailing <code>\\n</code> you need to trim. stdin is asynchronous and can fire many times, so the other options are wrong."
    }
  ],
  sources: [
    "https://nodejs.org/api/process.html#process-process-stdin",
    "https://nodejs.org/api/process.html#process-process-stdout"
  ]
});
