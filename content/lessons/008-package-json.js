window.COURSE_LESSONS.push({
  id: "w01-package-json",
  file: "008",
  unit: 1,
  week: 1,
  title: "Configuring package.json",
  kicker: "Unit I · Week 1 · Lesson 4 of 6",
  minutes: 14,
  objectives: [
    "Explain what package.json is and create one with npm init",
    "Read and edit the name, version, main, scripts and dependencies fields",
    "Spot and fix a broken dependency entry (a real bug from the journal)"
  ],
  intro: `
    <p>Last lesson you saw that every Node project has a <code>package.json</code> at its root —
    the manifest that names the project and lists what it needs. Today we open that file and learn
    every field that matters, using the journal's real
    <code>sorted_files/01_Week-01_Node-Intro/04_package.json</code> as our specimen.</p>
    <p>Heads up before we start: that real file has a genuine bug in it (a dependency named
    <code>webpack.config.js</code>, which is not a package at all). Perfect teaching material — by
    the end of this lesson you will be able to spot why <code>npm install</code> fails there, and
    say exactly how to fix it.</p>
  `,
  theory: [
    `
      <h3>What package.json is</h3>
      <p><code>package.json</code> is a small JSON file that describes your project to npm and to
      Node. <strong>JSON</strong> (JavaScript Object Notation) is a plain-text format for data:
      curly braces <code>{}</code> hold objects, square brackets <code>[]</code> hold lists, keys
      and string values use double quotes, and — unlike JavaScript — comments are not allowed.
      npm reads this file to know the project's name, which commands to expose, and which packages
      to install.</p>
    `,
    `
      <h3>The fields you will actually use</h3>
      <table>
        <thead><tr><th>Field</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td><code>name</code></td><td>The project's name (lowercase, no spaces — npm rules)</td></tr>
          <tr><td><code>version</code></td><td>Your project's version, in <em>semantic versioning</em> (semver) form <code>MAJOR.MINOR.PATCH</code></td></tr>
          <tr><td><code>main</code></td><td>The default entry file for other code that requires this project</td></tr>
          <tr><td><code>scripts</code></td><td>Named shell commands run with <code>npm run &lt;name&gt;</code></td></tr>
          <tr><td><code>dependencies</code></td><td>Packages your app needs in production</td></tr>
          <tr><td><code>devDependencies</code></td><td>Packages needed only for building/testing (not shipped)</td></tr>
        </tbody>
      </table>
      <p><strong>Semver explained:</strong> <code>1.2.3</code> means major version 1, minor
      version 2, patch 3. A patch is a bug fix, a minor adds features without breaking things, a
      major can break compatibility. Version numbers inside <code>dependencies</code> use prefixes:
      <code>^1.2.3</code> allows minor/patch updates (safe), <code>~1.2.3</code> allows patches
      only, and an exact <code>1.2.3</code> pins everything.</p>
    `,
    `
      <h3>Creating one: npm init</h3>
      <p>You never have to type <code>package.json</code> from scratch. <code>npm init</code>
      walks you through questions; <code>npm init -y</code> (the <code>-y</code> means "yes to
      everything") generates a default file instantly. Running
      <code>npm install &lt;package&gt;</code> afterwards automatically adds the package to
      <code>dependencies</code> — this is why you should almost never hand-edit dependency
      entries.</p>
      <pre class="diagram">$ npm init -y
$ npm install express
$ cat package.json      # PowerShell: type package.json</pre>
    `,
    `
      <h3>Reading the journal's real file (bug included)</h3>
      <p>The journal's <code>04_package.json</code> came from the student's Week 5 (webpack)
      lab — the name <code>"week5"</code> tells you so. It contains a <strong>real bug</strong>:
      the dependencies list has an entry <code>"webpack.config.js": "^0.0.0"</code>. A
      <code>.js</code> configuration file is not an npm package — no such thing exists on the
      registry — so running <code>npm install</code> in that folder fails. The fix: delete that
      line, and install the real tools explicitly
      (<code>npm install webpack webpack-cli</code>). Webpack itself returns in Week 6; for now
      the takeaway is the skill: <em>every key inside <code>dependencies</code> must be the name
      of a real package on <a href='https://www.npmjs.com/' target='_blank' rel='noopener'>npmjs.com</a>.</em></p>
    `
  ],
  examples: [
    {
      title: "The journal's real 04_package.json",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/04_package.json",
      lang: "json",
      code: `{
  "name": "week5",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "build": "webpack --config webpack.config.js"
  },
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "webpack": "^5.109.2",
    "webpack.config.js": "^0.0.0"
  }
}`,
      explain: [
        "<code>name: \"week5\"</code> — the project name; here it reveals the file was written during the Week 5 webpack lab and copied into Week 1's folder.",
        "<code>version: \"1.0.0\"</code> — the semver of the project itself, not of any package.",
        "<code>scripts.build</code> — running <code>npm run build</code> executes <code>webpack --config webpack.config.js</code> for you.",
        "<code>dependencies</code> — <code>webpack ^5.109.2</code> means \"any compatible 5.x newer than 5.109.2\". Note the second entry: that's the bug (next example)."
      ]
    },
    {
      title: "Spot the bug: a config file listed as a dependency",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/04_package.json",
      lang: "json",
      code: `{
  "dependencies": {
    "webpack": "^5.109.2",
    "webpack.config.js": "^0.0.0"
  }
}

// npm install in this folder fails:
// npm error code E404
// npm error 404 Not Found - GET https://registry.npmjs.org/webpack.config.js`,
      explain: [
        "<code>\"webpack.config.js\": \"^0.0.0\"</code> names a local configuration file as if it were a package on the npm registry — no such package exists, so install errors with a 404.",
        "The journal's own lab record confirms this: <em>\"week5/package.json declares a bogus 'webpack.config.js' dependency — npm i there errors\"</em>.",
        "<strong>The fix:</strong> remove that line from <code>dependencies</code>, then install the real tools manually: <code>npm install webpack webpack-cli</code>, and finally <code>npm run build</code>.",
        "Rule of thumb: keys inside <code>dependencies</code> must be real registry packages — configuration files are plain files in your project."
      ],
      run: "npm install   (fails)  →  delete the bad line  →  npm install webpack webpack-cli"
    },
    {
      title: "The journal's README workflow that package.json supports",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/README.txt",
      lang: "text",
      code: `Week 1: Intro to Node.js. server.js needs \`npm i express\` then \`node server.js\` (port 8080).`,
      explain: [
        "The README's <code>npm i express</code> is shorthand for <code>npm install express</code> — and it is precisely the command that writes <code>\"express\": \"^5.1.0\"</code> into <code>dependencies</code>.",
        "After one install, the manifest carries the dependency forever — anyone who copies the project just runs <code>npm install</code> to rebuild <code>node_modules/</code>.",
        "<code>node server.js</code> bypasses scripts; a <code>\"start\": \"node server.js\"</code> script (see the \"new\" examples below) would let you type <code>npm start</code> instead."
      ]
    },
    {
      title: "Creating a package.json with npm init -y",
      from: "new",
      lang: "bash",
      code: `$ mkdir my-app
$ cd my-app
$ npm init -y
Wrote to C:\\my-app\\package.json:
{
  "name": "my-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "license": "ISC"
}
$`,
      explain: [
        "<code>cd</code> into the project folder first — npm writes package.json into the <em>current</em> directory.",
        "<code>-y</code> skips the interview and fills sensible defaults; without it npm asks about each field.",
        "The generated <code>test</code> script is a placeholder that deliberately errors — replace or remove it when you add real tests.",
        "Note the JSON is strict: double quotes everywhere, no trailing commas, no comments."
      ],
      run: "npm init -y"
    },
    {
      title: "Adding a start script and running it",
      from: "new",
      lang: "javascript",
      code: `// index.js  — the file "main" points to
console.log("my-app started. args:", process.argv.slice(2));

// package.json scripts section (after editing):
//   "scripts": {
//     "start": "node index.js",
//     "greet": "node index.js hello"
//   }

$ npm start
> my-app@1.0.0 start
> node index.js
my-app started. args: []

$ npm run greet
> node index.js hello
my-app started. args: [ 'hello' ]`,
      explain: [
        "<code>npm start</code> looks up <code>scripts.start</code> in package.json and runs that shell command — no one needs to remember the node command.",
        "Any custom name (<code>greet</code>) runs with <code>npm run &lt;name&gt;</code>; only <code>start</code> and <code>test</code> (plus a few others) are exempt from <code>npm run</code>.",
        "Scripts run inside the project, so relative paths like <code>node src/index.js</code> work as expected.",
        "The <code>scripts</code> field is where a project encodes its own vocabulary: build, start, test, seed — you will use this heavily from Week 6 (webpack) onward."
      ],
      run: "npm start"
    },
    {
      title: "How npm install writes into dependencies",
      from: "new",
      lang: "bash",
      code: `$ npm install express
added 57 packages in 2s

$ type package.json
{
  "name": "my-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": { "start": "node index.js" },
  "license": "ISC",
  "dependencies": {
    "express": "^5.1.0"
  }
}

$ npm install --save-dev nodemon
added 11 packages in 1s      # -> goes to devDependencies, not dependencies`,
      explain: [
        "You never type the <code>dependencies</code> block by hand — <code>npm install</code> maintains it for you.",
        "<code>--save-dev</code> files the package under <code>devDependencies</code>: tools like nodemon (auto-restarts your server while you edit) are needed during development only.",
        "<code>^5.1.0</code> will float to the newest compatible 5.x on the next install, which is what <code>package-lock.json</code> then pins down exactly.",
        "After editing package.json yourself, run <code>npm install</code> once so npm reconciles <code>node_modules/</code> with your changes."
      ],
      run: "npm install express"
    }
  ],
  keyPoints: [
    "package.json is the project's manifest: name, version, scripts, dependencies — read by npm and Node",
    "npm init -y generates one instantly; npm install <code>&lt;pkg&gt;</code> maintains dependencies for you",
    "Versions follow semver MAJOR.MINOR.PATCH; the caret ^ allows safe minor/patch updates",
    "Scripts give your project named commands: npm start, npm run build, npm test",
    "The journal's 04_package.json has a real bug: \"webpack.config.js\" is a config file, not an npm package — remove it and install webpack + webpack-cli manually"
  ],
  practice: `
    <p>Make a scratch folder, run <code>npm init -y</code>, then edit the result so that
    <code>name</code> is your roll number in lowercase, a <code>"start"</code> script points at a
    1-line <code>index.js</code> that prints your name, and <code>description</code> is a real
    sentence. Run <code>npm start</code>. Finally, open the journal's
    <code>04_package.json</code> and (in a copy) delete the bogus
    <code>"webpack.config.js"</code> line — compare your clean file with the buggy one and note
    the difference in one sentence.</p>
  `,
  quiz: [
    {
      q: "Which package.json field lists the packages your app needs at runtime?",
      options: ["dependencies", "scripts", "require", "node_modules"],
      answer: 0,
      why: "<code>dependencies</code> is the map npm uses to (re)build node_modules/. Scripts hold commands; node_modules is the folder itself, not a field."
    },
    {
      q: "Why does npm install fail in the journal's week5 folder?",
      options: [
        "package.json lists \"webpack.config.js\" as a dependency, but that's a config file — not a package on the npm registry",
        "The version field is too old",
        "The author field is empty",
        "npm cannot run on Windows"
      ],
      answer: 0,
      why: "Keys inside dependencies must be real registry packages. webpack.config.js is a local config file, so the registry lookup 404s. Fix: delete the line, then npm install webpack webpack-cli."
    }
  ],
  sources: [
    "https://docs.npmjs.com/cli/v10/configuring-npm/package-json",
    "https://docs.npmjs.com/cli/v10/commands/npm-init",
    "https://docs.npmjs.com/cli/v10/commands/npm-install"
  ]
});
