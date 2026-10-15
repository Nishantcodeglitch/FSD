/* ============================================================================
 * structure.js — course metadata (units, weeks, book meta)
 * Loads BEFORE the lesson files. Lesson files push into window.COURSE_LESSONS.
 * ==========================================================================*/

window.COURSE_LESSONS = [];

window.COURSE_META = {
  title: "The FSD Book",
  subtitle: "Full Stack Development (CSA 301) — from scratch, chapter by chapter",
  series: "CSA 301 · Full Stack Development",
  edition: "First edition · built from the FSD journal of Nishant (2408023)",
  description:
    "A book-style course that teaches everything covered in the FSD journal — " +
    "Node.js, asynchronous JavaScript, Sequelize/MySQL, React, Redux and full-stack " +
    "integration — starting at zero, with runnable examples in every chapter."
};

window.COURSE_UNITS = [
  {
    n: 0,
    roman: "Preface",
    title: "Ground Zero",
    blurb:
      "Set up your machine, learn the JavaScript you actually need, and learn how to " +
      "read this book and run its code."
  },
  {
    n: 1,
    roman: "I",
    title: "Introduction to Node.js",
    blurb:
      "From \"what is a runtime?\" to servers, modules, the event loop, promises, " +
      "streams, cron jobs and bundlers."
  },
  {
    n: 2,
    roman: "II",
    title: "Backend APIs with Sequelize and MySQL",
    blurb:
      "Relational databases from zero: connecting, models, migrations, queries and " +
      "associations — all written in JavaScript."
  },
  {
    n: 3,
    roman: "III",
    title: "Frontend with React",
    blurb:
      "Components, props, state, every hook you need, routing between pages and " +
      "global state with Redux."
  },
  {
    n: 4,
    roman: "IV",
    title: "Integration — Full Stack",
    blurb:
      "Tie the front end to the back end: REST API, SQL schema, fetch CRUD, the dev " +
      "proxy, and the whole run sequence."
  }
];

window.COURSE_WEEKS = [
  { unit: 0, week: 0, title: "How this book works", blurb: "Roadmap, setup, JavaScript essentials and running the journal code." },
  { unit: 1, week: 1, title: "Introduction to Node.js", blurb: "Install, REPL, project structure, package.json, Express, first server." },
  { unit: 1, week: 2, title: "Node.js Modules", blurb: "require/exports, built-in fs and http, npm packages, CommonJS vs ESM." },
  { unit: 1, week: 3, title: "Event Loop and Asynchronous Programming", blurb: "Blocking vs non-blocking, the event loop, callbacks, timers, events, errors." },
  { unit: 1, week: 4, title: "Promises and File System", blurb: "Promises, chaining, rejections, async file access, process.argv, CLI tools." },
  { unit: 1, week: 5, title: "Streams and Routing", blurb: "Writing files, streams and pipe, standard streams, servers, routes, headers, gateway." },
  { unit: 1, week: 6, title: "Jobs and Webpack", blurb: "Cron jobs, blocking vs non-blocking revisited, webpack bundling, Unit I capstone." },
  { unit: 2, week: 7, title: "Sequelize ORM and MySQL", blurb: "Databases from scratch, installing Sequelize, connecting, testing and closing." },
  { unit: 2, week: 8, title: "Sequelize Models and Migrations", blurb: "Models, attributes, validations, migrations, create()." },
  { unit: 2, week: 9, title: "Model Querying", blurb: "Finders, query options, validation, raw SQL, full CRUD scripts." },
  { unit: 2, week: 10, title: "Associations", blurb: "1:1, 1:M, M:N join tables and eager loading with include()." },
  { unit: 3, week: 11, title: "Introduction to React", blurb: "Why React, Vite, JSX, components, props and the idea of state." },
  { unit: 3, week: 12, title: "React Hooks", blurb: "useState, useReducer, useContext, useRef, useEffect, useMemo, useCallback." },
  { unit: 3, week: 13, title: "Routing and Navigation", blurb: "React Router: routes, params, nested layouts, Link/NavLink/useNavigate." },
  { unit: 3, week: 14, title: "Redux", blurb: "Why Redux, the store, slices, dispatch and selectors with Redux Toolkit." },
  { unit: 4, week: 15, title: "Integrating Node.js with React.js", blurb: "REST API, SQL schema, fetch CRUD, proxy wiring, run sequence and debugging." }
];

/* The official CSA 301 syllabus, topic by topic, in the syllabus order.
   Each topic links to the chapter(s) that teach it.
   src: "journal"    = taught from this journal's own lab code
         "classmate"  = lab file came from a classmate's backup roll (attributed in the chapter)
         "docs"       = topic is blank in the journal; written from official docs
   Rendered by the "#/syllabus" view in assets/app.js.                        */
window.COURSE_SYLLABUS = [
  {
    unit: "Unit I — Introduction to Node.js",
    weeks: "Weeks 1–6",
    weeksList: [
      { n: 1, title: "Introduction to Node.js", topics: [
        { t: "Installation of Node.js", to: ["w01-install-and-repl"], src: "journal" },
        { t: "Node.js REPL", to: ["w01-install-and-repl"], src: "journal" },
        { t: "Understanding the Node.js folder structure", to: ["w01-project-structure"], src: "journal" },
        { t: "Configuring package.json in a new web application", to: ["w01-package-json"], src: "journal" },
        { t: "Installing Express", to: ["w01-install-express"], src: "journal" },
        { t: "Creating a server using Express", to: ["w01-express-server"], src: "journal" }
      ] },
      { n: 2, title: "Node.js Modules", topics: [
        { t: "Node modules", to: ["w02-modules-basics"], src: "journal" },
        { t: "Module dependencies", to: ["w02-module-dependencies"], src: "journal" },
        { t: "Module functionality", to: ["w02-modules-basics", "w02-module-dependencies"], src: "journal" }
      ] },
      { n: 3, title: "Event Loop and Asynchronous Programming", topics: [
        { t: "Event loop, concurrency and asynchronous coding", to: ["w03-blocking-vs-nonblocking", "w03-event-loop"], src: "journal" },
        { t: "Callback functions, calling conventions and exception handling", to: ["w03-callbacks", "w03-error-handling"], src: "journal" },
        { t: "Event emitters and listening for events", to: ["w03-event-emitter"], src: "journal" }
      ] },
      { n: 4, title: "Promises and File System", topics: [
        { t: "Promises", to: ["w04-promise-basics"], src: "journal" },
        { t: "Promise chaining", to: ["w04-promise-chaining", "w04-promise-errors"], src: "journal" },
        { t: "Modules", to: ["w02-modules-basics"], src: "journal", note: "The syllabus repeats “Modules” in Week 4, but the journal has no separate Week-4 module file — it is covered in full in Week 2 above." },
        { t: "Command-line arguments", to: ["w04-cli-args"], src: "journal" },
        { t: "Working with the file system", to: ["w04-promises-and-fs", "w04-fs-and-cli-capstone"], src: "journal" },
        { t: "Reading files", to: ["w04-promises-and-fs"], src: "journal" }
      ] },
      { n: 5, title: "Streams and Routing", topics: [
        { t: "Writing files", to: ["w05-writing-files"], src: "journal" },
        { t: "Readable streams and writable streams", to: ["w05-streams-pipe"], src: "journal" },
        { t: "Standard streams", to: ["w05-standard-streams"], src: "journal" },
        { t: "Creating a server and routes", to: ["w05-server-and-routes"], src: "journal" },
        { t: "Accessing request headers", to: ["w05-request-headers"], src: "journal" },
        { t: "Creating a gateway using Node.js", to: ["w05-gateway"], src: "journal" }
      ] },
      { n: 6, title: "Jobs and Webpack", topics: [
        { t: "Creating cron jobs using Node.js", to: ["w06-cron-jobs"], src: "journal" },
        { t: "Blocking vs. non-blocking methods", to: ["w06-blocking-revisited"], src: "journal" },
        { t: "Webpack", to: ["w06-webpack"], src: "journal" }
      ] }
    ]
  },
  {
    unit: "Unit II — Backend APIs with Sequelize and MySQL",
    weeks: "Weeks 7–10",
    weeksList: [
      { n: 7, title: "Sequelize ORM and MySQL", topics: [
        { t: "Installing Sequelize ORM for MySQL", to: ["w07-databases-and-mysql", "w07-what-is-sequelize"], src: "journal" },
        { t: "Connecting to the database", to: ["w07-connecting"], src: "journal" },
        { t: "Testing the connection", to: ["w07-testing-connection"], src: "journal" },
        { t: "Closing the connection", to: ["w07-closing-connection"], src: "journal" }
      ] },
      { n: 8, title: "Sequelize Models and Migrations", topics: [
        { t: "Creating models using Sequelize", to: ["w08-what-is-a-model", "w08-attributes-validations"], src: "journal" },
        { t: "Sequelize migrations", to: ["w08-migrations-concept", "w08-writing-migrations"], src: "journal" },
        { t: "Model querying basics", to: ["w08-create-and-query-basics"], src: "journal" }
      ] },
      { n: 9, title: "Model Querying", topics: [
        { t: "Model querying — finders", to: ["w09-finders", "w09-query-options"], src: "journal" },
        { t: "Validation and constraints", to: ["w09-validation-constraints"], src: "journal" },
        { t: "Raw queries", to: ["w09-raw-queries"], src: "classmate", note: "The journal’s Week 9 folder holds only MISSING.txt; this chapter is taught from a classmate’s backup lab (roll 2408030), credited inside the chapter." }
      ] },
      { n: 10, title: "Associations", topics: [
        { t: "Sequelize associations: 1:1 and 1:M", to: ["w10-associations-overview", "w10-one-to-one-one-to-many"], src: "journal" },
        { t: "Advanced M:N associations", to: ["w10-many-to-many", "w10-eager-loading-capstone"], src: "journal" }
      ] }
    ]
  },
  {
    unit: "Unit III — Frontend Framework",
    weeks: "Weeks 11–14",
    weeksList: [
      { n: 11, title: "Introduction to React.js", topics: [
        { t: "Installing React.js", to: ["w11-why-react", "w11-vite-setup"], src: "journal" },
        { t: "Components (built-in and custom)", to: ["w11-jsx", "w11-components"], src: "journal" },
        { t: "Props", to: ["w11-props"], src: "journal" },
        { t: "State", to: ["w11-state-intro"], src: "journal" }
      ] },
      { n: 12, title: "React Hooks", topics: [
        { t: "useState", to: ["w12-use-state"], src: "journal" },
        { t: "useReducer", to: ["w12-use-reducer"], src: "journal" },
        { t: "useContext", to: ["w12-use-context"], src: "journal" },
        { t: "useRef", to: ["w12-use-ref"], src: "journal" },
        { t: "useEffect", to: ["w12-use-effect"], src: "journal" },
        { t: "useMemo", to: ["w12-use-memo"], src: "docs", note: "Not in the journal — taught from react.dev with the missing lab exercise written out." },
        { t: "useCallback", to: ["w12-use-callback"], src: "docs", note: "Not in the journal — taught from react.dev with the missing lab exercise written out." }
      ] },
      { n: 13, title: "Routing and Navigation", topics: [
        { t: "Routes in React.js", to: ["w13-router-setup", "w13-route-params"], src: "docs", note: "The journal’s Week 13 folders are empty — taught from reactrouter.com." },
        { t: "Navigation", to: ["w13-navigation", "w13-multi-page-capstone"], src: "docs", note: "The journal’s Week 13 folders are empty — taught from reactrouter.com." }
      ] },
      { n: 14, title: "Redux", topics: [
        { t: "Redux", to: ["w14-why-redux", "w14-store-and-slices"], src: "classmate", note: "No Week 14 folder of your own — taught from a classmate’s backup lab (roll 2408030), credited inside the chapter." },
        { t: "Dispatch", to: ["w14-dispatch-and-selectors", "w14-redux-capstone"], src: "classmate", note: "No Week 14 folder of your own — taught from a classmate’s backup lab (roll 2408030), credited inside the chapter." }
      ] }
    ]
  },
  {
    unit: "Unit IV — Integrating a Node.js application with React.js",
    weeks: "Week 15",
    weeksList: [
      { n: 15, title: "Integrating Node.js with React.js", topics: [
        { t: "Integrating a Node.js application with React.js", to: ["w15-fullstack-architecture", "w15-backend-api", "w15-database-schema", "w15-frontend-crud", "w15-wiring-and-proxy", "w15-run-and-debug"], src: "journal" }
      ] }
    ]
  }
];
