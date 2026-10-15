window.COURSE_LESSONS.push({
  id: "w08-what-is-a-model",
  file: "044",
  unit: 2,
  week: 8,
  title: "What is a Sequelize model?",
  kicker: "Unit II · Week 8 · Lesson 1 of 5",
  minutes: 16,
  objectives: [
    "Explain what a model is and how it maps to a table, its columns and its rows",
    "Read sequelize.define() and Model.init() and say what every argument does",
    "Trace how models/index.js finds your model files and wires them to one connection",
    "Spot the two model-style bugs the journal kept: sequalize.Define and the unexported db.js"
  ],
  intro: `
    <p>Last week you built the connection: <code>new Sequelize(...)</code> from
    <code>db.js</code>, a quick <code>authenticate()</code> test, and a clean
    <code>sequelize.close()</code> when the script finished. A connection is only a pipe to
    MySQL, though — everything you typed was raw SQL strings, exactly like the phpMyAdmin and
    <code>CREATE TABLE</code> work of Lesson 39.</p>
    <p>This week you replace those strings with JavaScript, twice over. A <strong>model</strong>
    describes a table in code (this lesson), and a <strong>migration</strong> is the script that
    actually builds that table in the database (Lessons 46–47). Today we start with the model,
    read the journal's own three model files, and repair the broken stub the student left in
    <code>proj-2408023/config/books.js</code>.</p>
  `,
  theory: [
    `
      <h3>A model is a class; the table is its shape</h3>
      <p>A <strong>model</strong> is a JavaScript class that Sequelize binds to one database
      table. The class describes the table's columns; an <em>instance</em> of the class is one
      row. Sequelize keeps the two sides in sync in both directions — this is the "ORM" idea
      from Lesson 40, now applied concretely:</p>
      <pre class="diagram">JavaScript                          MySQL
--------------------------          --------------------------
class User (the model)      &lt;--&gt;   table \`users\`
User.create({...})          &lt;--&gt;   INSERT INTO users ...
User.findAll()              &lt;--&gt;   SELECT * FROM users ...
user.email                  &lt;--&gt;   a cell in one row</pre>
      <p>Three words you will hear constantly, so fix them now:</p>
      <ul>
        <li><strong>model</strong> — the class; one per table.</li>
        <li><strong>attribute</strong> (or field) — one property declared on the model; one
        column in the table.</li>
        <li><strong>instance</strong> (or row) — one object created from the model; one row in
        the table.</li>
      </ul>
      <p>The reason this matters: a model lives in a file, the file lives in git, and every
      teammate reads the same file. The table's shape stops being tribal knowledge and becomes
      code you can review.</p>
    `,
    `
      <h3>Style 1: sequelize.define (the journal's Lab16 and proj-2408023)</h3>
      <p>The quickest way to make a model is <code>sequelize.define(name, attributes, options)</code>:</p>
      <ul>
        <li><code>name</code> — a string. It becomes the model's name, and Sequelize derives the
        table name from it by <em>pluralising</em>: <code>'User'</code> becomes table
        <code>\`Users\`</code>, <code>'Student'</code> becomes <code>\`Students\`</code>. (Run
        <code>Model.getTableName()</code> any time you are unsure — we do exactly that in
        example 6.)</li>
        <li><code>attributes</code> — an object whose keys are column names and whose values
        describe the column (<code>type</code>, <code>allowNull</code>, <code>validate</code>…).
        Lesson 45 is entirely about this argument.</li>
        <li><code>options</code> — model-level settings. The one you will meet first is
        <code>timestamps: false</code>, which removes the automatic
        <code>createdAt</code>/<code>updatedAt</code> columns.</li>
      </ul>
      <p><code>define</code> needs a connection object to hang the model on. Lab16 and
      proj-2408023 both pass theirs in by hand: <code>require('../db.js')</code>. That works
      only if <code>db.js</code> actually exports the connection — keep reading, because in one
      of the two projects it does not.</p>
      <p>There is a generator for all this, by the way:
      <code>npx sequelize-cli model:generate --name User --attributes name:string,email:string</code>
      writes the model file <em>and</em> its migration in one go. None of the journal's projects
      used it — they wrote their models by hand, which is why this book teaches the file first
      — and Lesson 47 shows what it produces and what it leaves for you to write.</p>
    `,
    `
      <h3>Style 2: Model.init inside a factory, wired by models/index.js</h3>
      <p><code>npx sequelize-cli init</code> scaffolds a different pattern. Each model file
      exports a <em>function</em> that receives the shared connection and returns the class:</p>
      <pre>module.exports = (sequelize, DataTypes) =&gt; {
  class Student extends Model { }
  Student.init({ ... }, { sequelize, modelName: 'Student' });
  return Student;
};</pre>
      <p>The glue is the generated <code>models/index.js</code>, which does four jobs in order
      (example 4 is the journal's real copy):</p>
      <ol>
        <li>Read <code>config/config.json</code> for the current environment
        (<code>process.env.NODE_ENV</code>, defaulting to <code>development</code>) and create
        <strong>one</strong> connection.</li>
        <li>Read its own folder with <code>fs.readdirSync(__dirname)</code> and keep every
        <code>.js</code> file except itself.</li>
        <li>Call each file as a function — <code>require(file)(sequelize, Sequelize.DataTypes)</code>
        — and store the result under <code>db[model.name]</code>.</li>
        <li>Call <code>associate(db)</code> on every model that has it (Week 10 material), then
        <code>module.exports = db</code>.</li>
      </ol>
      <p>So <code>require('./models')</code> hands you an object like
      <code>{ Department, Passport, Student, sequelize, Sequelize }</code> — one import, every
      table, one connection. That is the shape the rest of this unit builds on.</p>
    `,
    `
      <h3>Two styles that must not mix — the journal proves it</h3>
      <p>The journal contains both patterns side by side, plus the wreckage you get when they
      collide. Three real findings, verified by running the repository's own files:</p>
      <div class="warn">
        <strong>1. <code>config/books.js</code> is a broken stub.</strong> The whole file is
        three lines ending in <code>sequalize.Define("book")</code>. JavaScript is
        case-sensitive and Sequelize's method is lowercase <code>define</code>, so it dies with
        <code>TypeError: sequalize.Define is not a function</code>. Even after fixing the
        spelling it would fail again, because <code>db.js</code> in that project never calls
        <code>module.exports</code> — <code>require('../db.js')</code> returns an empty object
        <code>{}</code>, and <code>{}</code> has no <code>define</code> either. Example 5 shows
        the file; example 6 shows a working rewrite.
      </div>
      <div class="note">
        <strong>2. The factory index and a direct-style model cannot cooperate.</strong> Lab16's
        <code>models/User.js</code> exports a finished model, but Lab16's generated
        <code>models/index.js</code> <em>calls</em> whatever it requires. Loading it today
        throws <code>TypeError: Class constructor model cannot be invoked without 'new'</code>.
        Neither script in the journal ever imports <code>models/index.js</code> —
        <code>create.js</code> imports <code>./models/User</code> directly — which is why the
        lab still ran in class. Pick one style per project and stay there.
      </div>
      <div class="note">
        <strong>3. The sequelize-association-lab does it the canonical way.</strong> Its three
        model files are factories, its <code>index.js</code> is the generated one, and loading
        it returns <code>[ 'Department', 'Passport', 'Student', 'sequelize', 'Sequelize' ]</code>
        with no errors. Copy that project's layout, not the other two.
      </div>
    `
  ],
  examples: [
    {
      title: "proj-2408023/models/user.js: a model in the direct style",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/proj-2408023/models/user.js",
      lang: "javascript",
      code: `
const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
   
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 100,
    },
  },
});

module.exports = User;
`,
      explain: [
        "Line 2 loads the ORM; line 3 loads the connection that <code>db.js</code> is supposed to export (in this project it forgot <code>module.exports</code> — see example 5).",
        "<code>define('User', ...)</code> creates the class <em>and</em> tells Sequelize the table is <code>`Users`</code> (the pluralised name).",
        "Each key of the second argument becomes a column: <code>username</code> → <code>VARCHAR(255)</code>, <code>age</code> → <code>INTEGER</code>.",
        "<code>allowNull: false</code> and <code>unique: true</code> are constraints; <code>validate</code> is JavaScript-level checking. Both get a full lesson next (045).",
        "Timestamps are left on, so this table also gains <code>createdAt</code> and <code>updatedAt</code>."
      ]
    },
    {
      title: "Lab16/models/User.js: the same table, timestamps switched off",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/Lab16/models/User.js",
      lang: "javascript",
      code: `
const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
    },
}, {
    timestamps: false
});

module.exports = User;
`,
      explain: [
        "Same model name (<code>User</code>), same four columns — but the third argument turns timestamps off, so no <code>createdAt</code>/<code>updatedAt</code> columns exist.",
        "No <code>validate</code> blocks at all: this model trusts the caller. Lab16 is the 'before validations' version of proj-2408023.",
        "<code>db.js</code> <em>does</em> export the connection here, which is why <code>require('./models/User')</code> in Lab16/create.js works.",
        "Compare the two files side by side — that diff is the whole of Lesson 45."
      ]
    },
    {
      title: "sequelize-association-lab/models/student.js: the factory style",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/models/student.js",
      lang: "javascript",
      code: `
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The \`models/index\` file will call this method automatically.
     */
    static associate(models) {
     Student.hasOne(models.Passport)
     Student.belongsTo(models.Department)
    }
  }
  Student.init({
    name: DataTypes.STRING,
    emial: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Student',
    timestamps:false
  });
  return Student;
};
`,
      explain: [
        "<code>module.exports</code> is a <em>function</em>, not a class: it receives the shared <code>sequelize</code> connection and the <code>DataTypes</code> namespace as arguments.",
        "<code>class Student extends Model</code> — the built-in <code>Model</code> base class supplies <code>create</code>, <code>findAll</code>, <code>save</code>… (Lesson 48 starts using them).",
        "<code>Student.init({...}, { sequelize, modelName: 'Student', timestamps: false })</code> does what <code>define()</code> does, just split across a class declaration.",
        "<code>static associate()</code> is a placeholder the CLI adds; <code>models/index.js</code> calls it for you in step 4. Week 10 fills it in — right now it just declares two relationships.",
        "<strong>Spot the bug:</strong> line 19 says <code>emial</code>, not <code>email</code>. The model, the migration and later scripts disagree about this column — Lesson 45 makes you fix it."
      ]
    },
    {
      title: "sequelize-association-lab/models/index.js: the wiring harness",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/models/index.js",
      lang: "javascript",
      code: `
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
`,
      explain: [
        "<code>require(.../config/config.json)[env]</code> picks the <code>development</code> block by default — the file you met in Lesson 39/40, containing username, password, database, host, port and dialect.",
        "<code>new Sequelize(config.database, config.username, config.password, config)</code> builds the single shared connection — nobody writes it twice.",
        "<code>fs.readdirSync(__dirname)</code> lists this folder; the <code>filter</code> keeps only plain <code>.js</code> files, skipping dotfiles, itself and tests.",
        "<code>require(file)(sequelize, Sequelize.DataTypes)</code> is the key line: every model file is <em>called</em> as a function with the connection. Export a class instead and this line throws (see example 5's sibling error in the practice task).",
        "<code>db[model.name] = model</code> — the key is the model's name (<code>'Student'</code>), so you get <code>db.Student</code>. Finally <code>associate</code> is invoked for each model and the whole bag is exported."
      ]
    },
    {
      title: "proj-2408023/config/books.js: the journal's broken stub (spot the bug)",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/proj-2408023/config/books.js",
      lang: "javascript",
      code: `
const { DataTypes } = require('sequelize');
const sequalize = require('../db.js');
const Book = sequalize.Define("book")
`,
      explain: [
        "The complete file — three unfinished lines the student saved as a note to self. Run it and it throws immediately.",
        "<strong>Bug 1:</strong> <code>Define</code> with a capital D. JavaScript method names are case-sensitive; Sequelize exposes <code>define</code>, so <code>sequalize.Define</code> is <code>undefined</code> and calling it produces <code>TypeError: sequalize.Define is not a function</code>.",
        "<strong>Bug 2 (hidden underneath):</strong> <code>require('../db.js')</code> in this project yields <code>{}</code>, because proj-2408023's <code>db.js</code> has no <code>module.exports</code> line. Even a correctly spelled <code>define</code> would fail the same way.",
        "<strong>Bug 3:</strong> <code>define</code> expects three arguments — name, attributes, options. <code>define(\"book\")</code> with no attributes would give you a table with nothing but an <code>id</code>.",
        "The variable is also misspelled (<code>sequalize</code>). That one is legal JavaScript — but it is why the error message reads so oddly. Spellings are how you keep stack traces readable."
      ],
      run: "node -e \"require('./config/books.js')\"",
      output: "TypeError: sequalize.Define is not a function"
    },
    {
      title: "A working Book model, rewritten from scratch",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize, DataTypes } = require('sequelize');

// One connection (in a real project this comes from db.js or models/index.js)
const sequelize = new Sequelize('nishant', 'root', '', {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  logging: false
});

const Book = sequelize.define('Book', {
  title: { type: DataTypes.STRING, allowNull: false },
  pages: { type: DataTypes.INTEGER },
  published: { type: DataTypes.DATE }
}, { timestamps: true });

console.log('model name :', Book.name);
console.log('table name :', Book.getTableName());
console.log('columns    :', Object.keys(Book.rawAttributes).join(', '));
`,
      explain: [
        "The three-argument shape that books.js was missing: <code>name</code>, <code>attributes</code>, <code>options</code>.",
        "<code>define()</code> never opens a connection by itself — creating a model is pure JavaScript, so this script prints even if MySQL is off.",
        "<code>getTableName()</code> is the honest answer to \"what table is this?\" — Sequelize pluralises and capitalises: <code>Book</code> → <code>Books</code>.",
        "<code>rawAttributes</code> is the object you declared; <code>timestamps: true</code> (the default) adds <code>createdAt</code> and <code>updatedAt</code> to that list.",
        "Note the port: 3306 is XAMPP's default. The journal's files often say 3307 — Lesson 48 shows what that costs you."
      ],
      run: "node book-model.js",
      output: "model name : Book\ntable name : Books\ncolumns    : title, pages, published, createdAt, updatedAt"
    }
  ],
  keyPoints: [
    "A model is a JavaScript class bound to one table: class ↔ table, instance ↔ row, attribute ↔ column",
    "sequelize.define(name, attributes, options) is the one-call style; Model.init(attributes, options) inside a class is the CLI's factory style — pick one per project",
    "Sequelize derives the table name by pluralising the model name: User → `Users`, Book → `Books`; getTableName() tells you for sure",
    "models/index.js creates ONE connection from config/config.json, requires every model file as a function, then runs each associate() hook",
    "The journal kept a broken stub: sequalize.Define is not a function (case + missing export + missing arguments) — read it as a checklist of how not to define a model"
  ],
  practice: `
    <p>Open the three model files the lesson used — <code>Lab16/models/User.js</code>,
    <code>proj-2408023/models/user.js</code> and
    <code>08_Week-08_Models-Migrations/sequelize-association-lab/models/student.js</code> — and
    label each one <em>direct style</em> or <em>factory style</em> by asking a single question:
    does the file export a class, or a function that returns a class?</p>
    <p>Then prove the wiring difference from a terminal. Inside
    <code>sorted_files/07_Week-07_Sequelize-MySQL/Lab16</code> run
    <code>node -e "require('./models')"</code>. You get
    <code>TypeError: Class constructor model cannot be invoked without 'new'</code> (plus a
    <code>Connection failed:</code> line from <code>db.js</code> trying port 3307) — the factory
    <code>index.js</code> calling a class that was never meant to be called. Now run the same
    command inside <code>08_Week-08_Models-Migrations/sequelize-association-lab</code> after
    <code>npm i</code>, and it prints
    <code>[ 'Department', 'Passport', 'Student', 'sequelize', 'Sequelize' ]</code>. One project
    wires itself; the other does not.</p>
  `,
  quiz: [
    {
      q: "In Sequelize, what is the relationship between a model and a database table?",
      options: [
        "One model class describes one table; each instance of that class is one row in the table",
        "One model describes the whole database; every class you write creates a new database",
        "A model is a template for the connection — tables are still written by hand in SQL",
        "Models only exist while the script runs; tables are created by phpMyAdmin alone"
      ],
      answer: 0,
      why: "The model carries the table's shape (its attributes become columns), and objects built from the model correspond to rows — that is the mapping the whole ORM sits on."
    },
    {
      q: "The journal's books.js throws `TypeError: sequalize.Define is not a function`. Which fix matters most?",
      options: [
        "Rename the variable from sequalize to sequelize",
        "Call the real API — sequelize.define('Book', attributes, options) — on an object that is actually exported by db.js",
        "Change the file extension from .js to .mjs",
        "Add a await in front of require('../db.js')"
      ],
      answer: 1,
      why: "JavaScript is case-sensitive, so Define simply does not exist; and db.js exports nothing in that project, so there is no define to call either. Renaming the variable alone changes nothing but the wording of the error."
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/core-concepts/model-basics/",
    "https://sequelize.org/api/v6/classes/model"
  ]
});
