window.COURSE_LESSONS.push({
  id: "w01-install-express",
  file: "009",
  unit: 1,
  week: 1,
  title: "Installing Express and third-party packages",
  kicker: "Unit I · Week 1 · Lesson 5 of 6",
  minutes: 13,
  objectives: [
    "Explain what the npm registry is and what a third-party package is",
    "Install Express with npm install and describe what changes on disk",
    "Require an installed package and diagnose a MODULE_NOT_FOUND error"
  ],
  intro: `
    <p>Last lesson you learned that <code>package.json</code>'s <code>dependencies</code> field is
    where packages live. Now comes the fun part: actually getting one. Express — "a backend web
    application framework for node js", in the journal's own words — is the package that will turn
    ten lines of Node into the server in the next lesson. But Express is just the first of
    thousands: this lesson teaches the install workflow you will use for the rest of the
    course.</p>
  `,
  theory: [
    `
      <h3>The npm registry: a vending machine for code</h3>
      <p><strong>npm</strong> (Node Package Manager) is two things at once: the command-line tool
      installed with Node, and the <strong>registry</strong> — a huge public server
      (<a href='https://www.npmjs.com/' target='_blank' rel='noopener'>npmjs.com</a>) where the
      community uploads packages. A <strong>package</strong> is a folder of JavaScript someone
      shared with a <code>package.json</code> describing it. <strong>Third-party</strong> simply
      means "written by someone else" — as opposed to Node's <em>built-in</em> modules like
      <code>http</code> and <code>fs</code>, which need no install at all.</p>
      <p>As of the mid-2020s the registry hosts well over two million packages. Whatever you need
      — a web framework, a cron scheduler, a MySQL driver (Week 7 needs one!) — somebody has
      probably already published it.</p>
    `,
    `
      <h3>What npm install actually does</h3>
      <p>Run <code>npm install express</code> inside your project folder and four things happen:</p>
      <ol>
        <li>npm asks the registry for <code>express</code> and downloads the newest compatible
        version;</li>
        <li>it downloads express's own dependencies, and their dependencies, into
        <code>node_modules/</code> (that's why "installing one package" often adds 50+);</li>
        <li>it writes <code>"express": "^5.1.0"</code> (or whatever the current version is) into
        <code>package.json</code> → <code>dependencies</code>;</li>
        <li>it records the exact resolved tree in <code>package-lock.json</code> so everyone on
        your team gets identical versions.</li>
      </ol>
      <p>One flag you'll meet early: <code>-g</code> (<code>npm install -g some-tool</code>)
      installs a package <em>globally</em>, as a system-wide command instead of a project
      dependency. Global installs are for developer tools (like <code>nodemon</code> or
      <code>webpack-cli</code>), never for libraries your code requires — libraries belong in
      <code>package.json</code>.</p>
    `,
    `
      <h3>Using the package: require resolves through node_modules</h3>
      <p>Installation only puts the code on disk. To <em>use</em> it, your file loads it with the
      <code>require()</code> function you met in the preface — Node's CommonJS way of importing:
      <code>const express = require('express')</code>. When the string in <code>require</code>
      isn't a built-in module and doesn't start with <code>./</code>, Node searches the
      <code>node_modules</code> folders from your file's directory upward until it finds a match.
      That's the whole magic — and the reason the famous error exists:</p>
      <pre class="diagram">Error: Cannot find module 'express'
Require stack:
- C:\\my-app\\server.js</pre>
      <p>Nine times out of ten it means one of three things: you never ran
      <code>npm install express</code>, you ran it in a <em>different folder</em> than the one you
      are running the script from, or you spelled the name wrong.</p>
    `
  ],
  examples: [
    {
      title: "The journal's README: install first, run second",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/README.txt",
      lang: "text",
      code: `Week 1: Intro to Node.js. server.js needs \`npm i express\` then \`node server.js\` (port 8080).`,
      explain: [
        "The week's own README states the exact order of operations: <em>install, then run</em>.",
        "<code>npm i express</code> is shorthand — npm accepts unambiguous abbreviations, and <code>i</code> = <code>install</code>.",
        "Skipping the install step is the single most common way a first server run fails; the README's author learned that the hard way."
      ]
    },
    {
      title: "The journal's server begins by requiring Express",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/01_server.js",
      lang: "javascript",
      code: `const express = require('express'); //importing the express module
const app = express(); //create an express applications
const port = 8080;`,
      explain: [
        "Line 1 is the consumer side of an npm install: <code>require('express')</code> finds the package in <code>node_modules/</code> that <code>npm i express</code> placed there.",
        "The comment says \"importing\" — accurate! <code>require()</code> is Node's module import (Week 2 covers the mechanics, including the <code>import/export</code> alternative).",
        "Line 2 calls the imported function to create an <code>app</code> — the object that will hold your routes. The rest of this file is Lesson 10's subject.",
        "Without a prior <code>npm i express</code>, line 1 is where this file dies."
      ],
      run: "node 01_server.js   (after: npm i express)"
    },
    {
      title: "Where express lands in the journal's package.json layout",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/04_package.json",
      lang: "json",
      code: `{
  "name": "week5",
  "version": "1.0.0",
  "dependencies": {
    "webpack": "^5.109.2",
    "webpack.config.js": "^0.0.0"
  }
}

// After running: npm i express
// The file becomes:
{
  "dependencies": {
    "webpack": "^5.109.2",
    "webpack.config.js": "^0.0.0",
    "express": "^5.1.0"
  }
}`,
      explain: [
        "Before: the journal's dependencies block (still carrying its bogus webpack.config.js entry — see Lesson 8).",
        "After: <code>npm i express</code> has appended <code>\"express\": \"^5.1.0\"</code> automatically. Nobody hand-types dependency blocks; npm maintains them.",
        "The caret means \"5.x, latest compatible\" — the exact resolved version is frozen separately in <code>package-lock.json</code>.",
        "The journal file is shown in its real (slightly buggy) state on purpose — real projects look like this, and reading them honestly is part of the skill."
      ],
      run: "npm i express"
    },
    {
      title: "A clean install, step by step in the terminal",
      from: "new",
      lang: "bash",
      code: `$ mkdir my-app
$ cd my-app
$ npm init -y > nul
$ npm install express
added 57 packages in 1s
found 0 vulnerabilities
$ dir node_modules | findstr express
express
$ type package.json | findstr express
  "express": "^5.1.0",`,
      explain: [
        "Always <code>cd</code> into the project first — npm installs into the <em>current</em> folder's <code>node_modules/</code>.",
        "\"added 57 packages\": express plus its transitive dependencies (body-parser, router, debug…). You wrote one line; npm filled the warehouse.",
        "\"found 0 vulnerabilities\" is npm's security audit summary — a nice habit to glance at.",
        "The last two commands prove both artifacts exist: code in <code>node_modules/</code>, manifest entry in <code>package.json</code>."
      ],
      run: "npm install express"
    },
    {
      title: "A package.json with several real backend dependencies",
      from: "new",
      lang: "json",
      code: `{
  "name": "my-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^5.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}`,
      explain: [
        "Two sections, two audiences: <code>express</code> is needed to <em>run</em> the app, so it's a regular dependency; <code>nodemon</code> only helps you during development, so it's a devDependency.",
        "The <code>dev</code> script wires them together: <code>npm run dev</code> will auto-restart the server on every save — expect to live in this command from next lesson on.",
        "This file shape — start script, express in dependencies — is the exact skeleton every Node backend project in this course will grow from."
      ],
      run: "npm install express  &&  npm install --save-dev nodemon"
    },
    {
      title: "Spot the error: require without install",
      from: "new",
      lang: "javascript",
      code: `// server.js
const express = require('express');
const app = express();

// $ node server.js
// Error: Cannot find module 'express'
// Require stack:
// - C:\\my-app\\server.js
//     at Module._resolveFilename (node:internal/modules/cjs/loader:...)
//     at Module.require (node:internal/modules/cjs/loader:...) {
//   code: 'MODULE_NOT_FOUND'
// }

// FIX: run this in the same folder, then try again:
// $ npm install express
// added 57 packages, and now node server.js works`,
      explain: [
        "The error's last line, <code>code: 'MODULE_NOT_FOUND'</code>, is npm/Node's way of saying: this file's <code>require</code> found nothing.",
        "Read the <em>Require stack</em> path — it tells you which file failed and from which folder, which is how you catch the \"installed in the wrong folder\" mistake.",
        "The fix is one command in the right directory. Never patch this by editing node_modules — reinstall instead.",
        "Compare with <code>require('http')</code>: built-in modules never produce MODULE_NOT_FOUND, because they ship inside Node itself."
      ],
      run: "node server.js   (then: npm install express, then run again)"
    }
  ],
  keyPoints: [
    "npm is both the CLI tool shipped with Node and the public registry of 2M+ community packages",
    "A third-party package is community code you add via npm; built-in modules like http need no install",
    "npm install express updates three things: node_modules/, package.json's dependencies, package-lock.json",
    "Use packages with const express = require('express') — Node resolves it through node_modules/",
    "MODULE_NOT_FOUND almost always means: not installed, installed in the wrong folder, or misspelled"
  ],
  practice: `
    <p>Create a scratch folder, <code>cd</code> into it, run <code>npm init -y</code> and then
    <code>npm install express</code>. Open the resulting <code>package.json</code> and find the
    line npm added. Now delete the whole <code>node_modules</code> folder, write a 2-line script
    that requires express, and watch it fail — then run plain <code>npm install</code> (no
    arguments!) and see it restore everything from the manifest. That restore trick is the
    superpower of <code>package.json</code>.</p>
  `,
  quiz: [
    {
      q: "Which command installs Express into the current project AND records it in package.json?",
      options: [
        "npm install express",
        "npm install -g express",
        "node add express",
        "npm get express"
      ],
      answer: 0,
      why: "npm install express (or npm i express) downloads into node_modules/ and adds the entry to dependencies. -g would install globally instead — wrong for libraries."
    },
    {
      q: "You ran node server.js and got \"Cannot find module 'express'\". What is the most likely cause?",
      options: [
        "You never ran npm install express in that project folder",
        "Express is built into Node and shouldn't be required",
        "The port 8080 is already in use",
        "server.js must be renamed to index.html"
      ],
      answer: 0,
      why: "MODULE_NOT_FOUND means require() found nothing in node_modules/. Fix: cd to the project folder and npm install express. (Other possibilities: wrong spelling or installed in a different folder.)"
    }
  ],
  sources: [
    "https://www.npmjs.com/package/express",
    "https://docs.npmjs.com/cli/v10/commands/npm-install",
    "https://nodejs.org/api/modules.html"
  ]
});
