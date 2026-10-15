# FSD Book — Master Lesson Outline (CANONICAL)

Site: `fsd-course-site/` — a book-like, chapter-by-chapter course that teaches everything in this
repository's journal code (CSA 301 Full Stack Development) from scratch.

**Rules for every content author:**
1. The lesson `title`, `id`, `file` name, `unit` and `week` in this table are **canonical — copy them
   exactly**. Do not rename, reword or renumber.
2. Lessons are read in the numeric order of the file name (`001` → `085`). The Next/Prev buttons and
   the course index follow that order.
3. **Every lesson needs at least 5 complete, runnable code examples** (hard requirement).
4. `unit: 0` = Preface, `unit: 1..4` = Units I–IV. `week: 0` = Preface, `week: 1..15` = Weeks.
5. Source of truth for "journal" examples: `sorted_files/<week-folder>/` in this repo.
   Mark such examples `from: "journal"` with the real relative path. Anything else is `from: "new"`.

---

## UNIT 0 — Preface: Ground Zero (unit 0, week 0)

| file | id | title | focus |
|---|---|---|---|
| 001-how-this-book-works.js | p01-how-this-book-works | How this book works | Course map, units/weeks, how to read, how journal code is referenced, how to use quizzes + progress |
| 002-setup-your-environment.js | p02-setup-your-environment | Set up your development environment | Install Node.js/npm, VS Code, XAMPP (MySQL), terminal basics, `node -v`, `npm -v` |
| 003-javascript-essentials.js | p03-javascript-essentials | JavaScript essentials from scratch | variables, types, functions (incl. `01_Week-01_Node-Intro/02_functions.js`), arrays, objects, ES6 arrow/template/destructuring |
| 004-running-the-journal-code.js | p04-running-the-journal-code | Running the journal code | How the repo is organised, `node file.js`, `node --check`, fixtures/README files, common errors |

## UNIT I — Introduction to Node.js (unit 1, weeks 1–6)

### Week 1 — Introduction to Node.js (`week: 1`)
| file | id | title | syllabus / source |
|---|---|---|---|
| 005-what-is-node.js | w01-what-is-node | What is Node.js and why it exists | 1.1 theory; V8, event-driven I/O, single thread |
| 006-install-and-repl.js | w01-install-and-repl | Installing Node.js and the REPL | 1.1, 1.2; `01_Week-01_Node-Intro/03_notes 1.txt` |
| 007-project-structure.js | w01-project-structure | The Node.js project folder structure | 1.3; node_modules, entry files |
| 008-package-json.js | w01-package-json | Configuring package.json | 1.4; `01_Week-01_Node-Intro/04_package.json` |
| 009-install-express.js | w01-install-express | Installing Express and third-party packages | 1.5; npm install workflow |
| 010-express-server.js | w01-express-server | Your first server with Express | 1.6; `01_Week-01_Node-Intro/01_server.js` |

### Week 2 — Node.js Modules (`week: 2`)
| file | id | title | syllabus / source |
|---|---|---|---|
| 011-modules-basics.js | w02-modules-basics | Modules: require and module.exports | 2.1; `02_Week-02_Modules/modules/cal.js`, `hello.js`, `areaCalculator.js` |
| 012-module-dependencies.js | w02-module-dependencies | Module dependencies: wiring files together | 2.2, 2.3; `modules/app.js`, `modules/index.js`, `modules/Q1.js` |
| 013-builtin-fs.js | w02-builtin-fs | Built-in module: fs (read, write, append) | `modules/builtine_modules/readfilesync.js`, `appendfilesync.js`, `builtinmodules.js` |
| 014-builtin-http-path.js | w02-builtin-http-path | Built-in modules: http and path | `02_Week-02_Modules/01_httpserver.js` raw http server with routes |
| 015-third-party-npm.js | w02-third-party-npm | Third-party modules and the npm registry | `02_Week-02_Modules/02_third_party_module.js` (colors) |
| 016-esm-vs-cjs.js | w02-esm-vs-cjs | CommonJS vs ES modules | theory + `week5-bundler` files; import/export |

### Week 3 — Event Loop and Asynchronous Programming (`week: 3`)
| file | id | title | syllabus / source |
|---|---|---|---|
| 017-blocking-vs-nonblocking.js | w03-blocking-vs-nonblocking | Blocking vs non-blocking execution | 3.1; `01_concurrency.js`, `02_concurrency2.js`, `05_test.js` |
| 018-event-loop.js | w03-event-loop | The event loop, phase by phase | 3.1; `09_notes.txt` (nextTick > promise > timeout > immediate) |
| 019-callbacks.js | w03-callbacks | Callbacks and calling conventions | 3.2; `15_callback.js`, `11_EX1.js`, `13_EX3.js` |
| 020-timers.js | w03-timers | Timers: setTimeout, setInterval, setImmediate, nextTick | `06_set_immediate.js`, `12_EX2_setinterval.js`, `07_set_time_out_readfile.js` |
| 021-event-emitter.js | w03-event-emitter | Events and the EventEmitter | 3.3; `16_events.js`, `17_Q1_and_Q2.js` |
| 022-error-handling.js | w03-error-handling | Exception handling: try, catch, finally | 3.2; `03_Question1.js`, `04_Question2.js`, `08_app.js` |

### Week 4 — Promises and File System (`week: 4`)
| file | id | title | syllabus / source |
|---|---|---|---|
| 023-promise-basics.js | w04-promise-basics | Promises: the idea and the syntax | 4.1; `01_promise.js`, `02_promise_1.js`, `07_promise.js` |
| 024-promise-chaining.js | w04-promise-chaining | Promise chaining with then/catch/finally | 4.2; `03_EX4.js`, `09_promise_using_ThenCatchFinally.js`, `10_Question1.js` |
| 025-promise-errors.js | w04-promise-errors | Handling rejected promises | 4.2; error paths, `06_EX7.js` |
| 026-promises-and-fs.js | w04-promises-and-fs | Promisifying the file system | 4.6; `08_promise_read_file_using_promise.js`, `11_reading_file_promises.js` |
| 027-cli-args.js | w04-cli-args | Command-line arguments with process.argv | 4.4; `12_command-line.js`, `13_cmd-arg2.js`, `14_cmd-arg3sum.js`, `15_nameagepost.js` |
| 028-fs-and-cli-capstone.js | w04-fs-and-cli-capstone | File-system recipes and CLI mini programs | 4.5; `04_EX5_appendfiles.js`, `05_EX6_deletefile.js`, `16_grade-check.js`, `17_question2.js` |

### Week 5 — Streams and Routing (`week: 5`)
| file | id | title | syllabus / source |
|---|---|---|---|
| 029-writing-files.js | w05-writing-files | Writing files | 5.1; `04_EX5_appendfiles.js` (Week 4 files reused), append vs write |
| 030-streams-pipe.js | w05-streams-pipe | Readable streams, writable streams and pipe | 5.2; `01_streams.js`, `02_writable-streams.js`, `03_pipe.js` |
| 031-standard-streams.js | w05-standard-streams | Standard streams: stdin, stdout, stderr | 5.3; `05_...` week5 app.js equivalent |
| 032-server-and-routes.js | w05-server-and-routes | Creating a server and its routes | 5.4; `09_serverhttp.js`, `10_routes.js`, `11_server_ex1.js`, `12_server_with_html.js` |
| 033-request-headers.js | w05-request-headers | Accessing request and response headers | 5.5; `14_responce_header.js` |
| 034-gateway.js | w05-gateway | Building a gateway with Node.js | 5.6; `15_gateway.js`, `16_gateway_http.js`, `17_app.js` |

### Week 6 — Jobs and Webpack (`week: 6`)
| file | id | title | syllabus / source |
|---|---|---|---|
| 035-cron-jobs.js | w06-cron-jobs | Cron jobs in Node.js | 6.1; `01_cron.js`, `02_cron2.js`, `03_cron3.js`, `04_cron4.js` |
| 036-blocking-revisited.js | w06-blocking-revisited | Blocking vs non-blocking, revisited | 6.2; `05_...` notes + `sorted_files/03.../05_test.js` |
| 037-webpack.js | w06-webpack | Webpack: bundling your modules | 6.3; `week5-bundler/webpack.config.js`, `index.js`, `math.js`, `app.js` |
| 038-unit-1-capstone.js | w06-unit-1-capstone | Unit I capstone: a scheduled file-report service | combines http + fs + cron + bundler |

## UNIT II — Sequelize and MySQL (unit 2, weeks 7–10)

### Week 7 — Sequelize ORM and MySQL (`week: 7`)
| file | id | title | syllabus / source |
|---|---|---|---|
| 039-databases-and-mysql.js | w07-databases-and-mysql | Databases and MySQL from scratch | theory: tables, rows, SQL, XAMPP/phpMyAdmin |
| 040-what-is-sequelize.js | w07-what-is-sequelize | What is Sequelize? Installing the ORM | 7.1; package.json files (`Lab16`, `proj-2408023`, `Advanced_associations`) |
| 041-connecting.js | w07-connecting | Connecting to the database | 7.2; `07_Week-07_Sequelize-MySQL/proj-2408023/db.js`, `Lab16/db.js` |
| 042-testing-connection.js | w07-testing-connection | Testing the connection with authenticate() | 7.3; same db.js files |
| 043-closing-connection.js | w07-closing-connection | Closing connections and exiting cleanly | 7.4; `Lab16/create.js`, `read.js`, `update.js`, `delete.js` |

### Week 8 — Models and Migrations (`week: 8`)
| file | id | title | syllabus / source |
|---|---|---|---|
| 044-what-is-a-model.js | w08-what-is-a-model | What is a Sequelize model? | 8.1; `proj-2408023/models/user.js`, `Lab16/models/User.js` |
| 045-attributes-validations.js | w08-attributes-validations | Attributes, data types and validations | 8.1; `models/user.js` (len/isEmail/min/max) |
| 046-migrations-concept.js | w08-migrations-concept | Migrations: version-controlled schema | 8.2 theory; `proj-2408023/notes.txt` |
| 047-writing-migrations.js | w08-writing-migrations | Writing and running migrations | 8.2; `migrations/20260828063041-create-user-table.js`, `Lab16/migrations/...`, `sequelize-association-lab/migrations/1-3` |
| 048-create-and-query-basics.js | w08-create-and-query-basics | Model querying basics: create() | 8.3; `Lab16/create.js`, `sequelize-association-lab/create.js`, `createDept.js` |

### Week 9 — Model Querying (`week: 9`)
| file | id | title | syllabus / source |
|---|---|---|---|
| 049-finders.js | w09-finders | Finders: findAll, findOne, findByPk | 9.1; `Lab16/read.js`, `09_Week-09_Querying/FSD_30-by-2408030/findone.js`, `findbyPK.js`, `query.js` |
| 050-query-options.js | w09-query-options | Query options: where, attributes, order, limit | 9.1; `FSD_30-by-2408030/query.js` + theory |
| 051-validation-constraints.js | w09-validation-constraints | Validation and constraints | 9.2; model validations + DB-level constraints |
| 052-raw-queries.js | w09-raw-queries | Raw SQL with sequelize.query() | 9.3; `FSD_30-by-2408030/query.js` — **classmate's lab (roll 2408030), attribute honestly** |
| 053-crud-scripts.js | w09-crud-scripts | Full CRUD as separate scripts | `FSD_30-by-2408030/create.js|query.js|update.js|delete.js`, `Lab16/*` |

### Week 10 — Associations (`week: 10`)
| file | id | title | syllabus / source |
|---|---|---|---|
| 054-associations-overview.js | w10-associations-overview | Relational ideas: 1:1, 1:M, M:N | 10.1 theory; `10_Week-10_Associations/lab20/notes.txt` |
| 055-one-to-one-one-to-many.js | w10-one-to-one-one-to-many | One-to-one and one-to-many associations | 10.1; `sequelize-association-lab/models/*.js`, `create.js`, `createDept.js`, `read.js`, `readDept.js` |
| 056-many-to-many.js | w10-many-to-many | Many-to-many with a join table | 10.2; `lab20/models/*.js`, `lab20/app.js`, `Advanced_associations/models/*.js` |
| 057-eager-loading-capstone.js | w10-eager-loading-capstone | include() and eager loading | `Advanced_associations/app.js`, `lab20/app.js` |

## UNIT III — React (unit 3, weeks 11–14)

### Week 11 — Introduction to React (`week: 11`)
| file | id | title | syllabus / source |
|---|---|---|---|
| 058-why-react.js | w11-why-react | Why React? The declarative component model | 11.1 theory; render = f(state) |
| 059-vite-setup.js | w11-vite-setup | Scaffolding a React app with Vite | 11.1; `11_Week-11_React-Intro/my-react/vite.config.js`, `index.html`, `package.json` |
| 060-jsx.js | w11-jsx | JSX: writing UI in JavaScript | `my-react/src/App.jsx` fragments, expressions |
| 061-components.js | w11-components | Components: built-in and custom | 11.2; `my-react/src/components/Header.jsx`, `Navbar.jsx`, `Content.jsx`, `Footer.jsx`, `main.jsx` |
| 062-props.js | w11-props | Props: passing data to components | 11.3; `11_Week-11_React-Intro/react3/src/books.jsx`, `Employee.jsx`, `students.jsx`, `docter.jsx`, `patient.jsx`, `appointment.jsx` |
| 063-state-intro.js | w11-state-intro | State: the missing piece (introduction) | 11.4 (partial in journal); `12_Week-12_Hooks/states/src/Student.jsx` |

### Week 12 — React Hooks (`week: 12`)
| file | id | title | syllabus / source |
|---|---|---|---|
| 064-use-state.js | w12-use-state | useState | 12.1; `12_Week-12_Hooks/ShoppingCart/src/App.jsx`, `states/src/Student.jsx`, `react4/src/components/Students.jsx`, `lab19/src/App.jsx` |
| 065-use-reducer.js | w12-use-reducer | useReducer | 12.2; `lab19/src/useReducer.js` (**buggy: uses dispatchEvent — point it out and fix it**) |
| 066-use-context.js | w12-use-context | useContext | 12.3; `lab19/src/useContext.js`, `useContext-multValue.js`, `usecontext-multAnimal.js` |
| 067-use-ref.js | w12-use-ref | useRef | 12.4; `lab19/src/App.jsx` (timerRef), `setTimeout_useRef.js` |
| 068-use-effect.js | w12-use-effect | useEffect | 12.5; `lab19/src/App.jsx` (interval + cleanup) |
| 069-use-memo.js | w12-use-memo | useMemo | 12.6 **MISSING IN JOURNAL — write from internet sources (react.dev) + new examples** |
| 070-use-callback.js | w12-use-callback | useCallback | 12.7 **MISSING IN JOURNAL — write from internet sources (react.dev) + new examples** |

### Week 13 — Routing and Navigation (`week: 13`)
> The journal has **no** react-router material (topic blank in the DOCX). These four lessons are
> written from internet sources (react.dev / reactrouter.com) with **new** examples; say so honestly
> in the lesson's `sources` field.

| file | id | title |
|---|---|---|
| 071-router-setup.js | w13-router-setup | React Router: installation and your first routes |
| 072-route-params.js | w13-route-params | Route params, query strings and nested routes |
| 073-navigation.js | w13-navigation | Navigation with Link, NavLink and useNavigate |
| 074-multi-page-capstone.js | w13-multi-page-capstone | Putting Week 13 together: a multi-page app |

### Week 14 — Redux (`week: 14`)
> Covered in the journal only via a classmate's backup (`FSD_Backup_30/week_14_30`) — attribute it
> honestly in `sources` while teaching the topic from scratch.

| file | id | title |
|---|---|---|
| 075-why-redux.js | w14-why-redux | Why Redux? Shared state problems |
| 076-store-and-slices.js | w14-store-and-slices | The store and slices with Redux Toolkit |
| 077-dispatch-and-selectors.js | w14-dispatch-and-selectors | Dispatching actions and reading state with selectors |
| 078-redux-capstone.js | w14-redux-capstone | A complete Redux app (counter + todo) |

## UNIT IV — Integration (unit 4, week 15)

### Week 15 — Integrating Node.js with React.js (`week: 15`)

| file | id | title | syllabus / source |
|---|---|---|---|
| 079-fullstack-architecture.js | w15-fullstack-architecture | How a React front end talks to a Node back end | 15.x theory; HTTP/REST/JSON |
| 080-backend-api.js | w15-backend-api | The back end: a REST API with http + mysql2 | 15.1; `otaku/server/server.js` (also `15_Week-15_Integration-otaku/otaku-server/server.js`) |
| 081-database-schema.js | w15-database-schema | The database: schema and seed data | 15.4; `otaku/otaku_travel.sql` |
| 082-frontend-crud.js | w15-frontend-crud | The front end: fetch-based CRUD in React | 15.2; `otaku/src/App.jsx` |
| 083-wiring-and-proxy.js | w15-wiring-and-proxy | Wiring it together: Vite proxy, main.jsx, CORS | 15.3; `otaku/vite.config.js`, `otaku/src/main.jsx` |
| 084-run-and-debug.js | w15-run-and-debug | Run sequence, data flow and debugging | 15.5, 15.6; `otaku/FUNCTIONALITIES.txt`, `otaku/README.md` |
| 085-where-to-go-next.js | w15-where-to-go-next | Wrapping up: where to go from here | deployment, testing, TypeScript, Next.js; 5 forward-looking examples |

---

## Canonical metadata (for `structure.js`, already written)

| unit | roman | title |
|---|---|---|
| 0 | — | Preface: Ground Zero |
| 1 | I | Introduction to Node.js |
| 2 | II | Backend APIs with Sequelize and MySQL |
| 3 | III | Frontend with React |
| 4 | IV | Integration: Full-Stack |

| week | title |
|---|---|
| 1 | Introduction to Node.js |
| 2 | Node.js Modules |
| 3 | Event Loop and Asynchronous Programming |
| 4 | Promises and File System |
| 5 | Streams and Routing |
| 6 | Jobs and Webpack |
| 7 | Sequelize ORM and MySQL |
| 8 | Sequelize Models and Migrations |
| 9 | Model Querying |
| 10 | Associations |
| 11 | Introduction to React |
| 12 | React Hooks |
| 13 | Routing and Navigation |
| 14 | Redux |
| 15 | Integrating Node.js with React.js |

TOTAL: 85 lessons.
