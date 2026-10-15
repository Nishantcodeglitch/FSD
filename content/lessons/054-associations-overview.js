window.COURSE_LESSONS.push({
  id: "w10-associations-overview",
  file: "054",
  unit: 2,
  week: 10,
  title: "Relational ideas: 1:1, 1:M, M:N",
  kicker: "Unit II · Week 10 · Lesson 1 of 4",
  minutes: 15,
  objectives: [
    "Explain why real data is split across several tables and linked by foreign keys",
    "Tell a one-to-one, a one-to-many and a many-to-many relationship apart, with a real example of each",
    "Say which table holds the key in each shape, and why the many-to-many case needs a third table",
    "Map every shape to its Sequelize method: hasOne, belongsTo, hasMany, belongsToMany"
  ],
  intro: `
    <p>Last week every query you wrote touched exactly <strong>one</strong> table:
    <code>findAll()</code> on <code>Users</code>, <code>findOne({ where: ... })</code>,
    <code>sequelize.query("SELECT * FROM students")</code>. One table in, one array out.</p>
    <p>Real data refuses to live in one table. A student <em>has</em> a passport; a department
    <em>has</em> many students; a student <em>enrols in</em> many courses and a course
    <em>has</em> many students. Week 10 is about the glue between tables — <strong>associations</strong> —
    and by the end of the week one <code>findAll()</code> will hand you a student
    <em>together with</em> their passport, their department and their courses.</p>
    <p>This first lesson is the map: the three relationship shapes, the foreign keys they imply,
    and the four Sequelize methods that declare them. No new API to memorise yet — just ideas you
    can hold in your head before the syntax arrives.</p>
  `,
  theory: [
    `
      <h3>Why data is split, and what a foreign key is</h3>
      <p>Suppose you stored students and their courses in one table, one row per
      student-course pair. Every time Rahul adds a course you re-type his name, his email, his
      department — and if he changes his email you must update five rows or the data disagrees
      with itself. Databases solve this by splitting data into focused tables and linking the
      rows with a <strong>foreign key</strong>.</p>
      <p>A <strong>foreign key</strong> is simply a column that holds the primary key of a row in
      <em>another</em> table. If <code>Students.departmentId</code> holds <code>3</code> and
      <code>Departments.id = 3</code> is "BCA", then that student studies in BCA — stated once,
      in one integer, in one row.</p>
      <pre class="diagram">Departments                     Students
+----+------+                 +----+--------+--------------+
| id | name |                 | id | name   | departmentId |
+----+------+                 +----+--------+--------------+
|  3 | BCA  |  &lt;-----------  |  1 | Rahul  |            3 |
+----+------+   references    |  2 | Priya  |            3 |
                              +----+--------+--------------+
                                ^^^^^^^^^^^^
                                the foreign key: it points
                                at Departments.id = 3</pre>
      <p>Splitting tables this way is the whole idea of a <em>relational</em> database: data is
      stored in relations (tables), and relationships are expressed by keys rather than by
      repetition.</p>
    `,
    `
      <h3>The three shapes every schema is built from</h3>
      <p>Every relationship you will ever model is one of three shapes. Learn to spot them in a
      requirement sentence — the wording gives the shape away ("has one", "has many", "enrols in").</p>
      <h4>1. One-to-one (1:1) — "a student has one passport"</h4>
      <pre class="diagram">Students                         Passports
+----+-------+                +----+----------------+-----------+
| id | name  |                | id | passportNumber | studentId |
+----+-------+                +----+----------------+-----------+
|  1 | Roger | &lt;------------ |  1 | AUGK33940      |         1 |
+----+-------+   studentId    +----+----------------+-----------+
                 lives on Passports</pre>
      <p>Exactly one passport per student, exactly one student per passport. The key goes on
      whichever side the world treats as the "extra" — here, a passport is extra information
      about a student, so <code>Passports</code> carries the key.</p>
      <h4>2. One-to-many (1:M) — "a department has many students"</h4>
      <pre class="diagram">Departments                     Students
+----+------+                 +----+-------+--------------+
| id | name |                 | id | name  | departmentId |
+----+------+                 +----+-------+--------------+
|  3 | BCA  | &lt;------------ |  1 | Rohit  |            3 |
+----+------+                 |  2 | Anil   |            3 |
                              +----+-------+--------------+
                                one key column, many rows
                                pointing at the same parent</pre>
      <p>One department, many students — but each student belongs to only one department. The
      key sits on the <strong>many</strong> side, because that is the side that needs to say
      "which one?". You cannot put a list of student ids inside the department row; you put one
      department id inside each student row.</p>
      <h4>3. Many-to-many (M:N) — "students enrol in courses"</h4>
      <pre class="diagram">Students                         Courses
+----+-------+                +----+-----------+
| id | name  |                | id | name      |
+----+-------+                +----+-----------+
|  1 | Rahul |                | 10 | Node.js   |
|  2 | Priya |                | 20 | React     |
+----+-------+                +----+-----------+
     \                            /
      \     Enrollments (the     /
       \      join table)       /
        +----+-----------+-----+
        | studentId | courseId |
        +----+-----------+-----+
        |    1    |     10    |   Rahul takes Node.js
        |    1    |     20    |   Rahul takes React
        |    2    |     10    |   Priya takes Node.js
        +----+-----------+-----+</pre>
      <p>Now <em>both</em> sides are plural, so <em>neither</em> table can hold the key: you
      cannot squeeze "10, 20" into one student cell, nor "1, 2" into one course cell. The
      solution is a third table — a <strong>join table</strong> (Sequelize calls it the
      <em>through</em> table) — whose rows each say one true thing: <em>this</em> student takes
      <em>that</em> course. Three students × three courses would need nine rows in the join
      table if everyone took everything; the join table only stores the pairs that actually exist.</p>
    `,
    `
      <h3>What Sequelize generates for each shape</h3>
      <p>You declare the relationship in JavaScript; Sequelize writes the columns and the SQL
      constraints. This is the entire method vocabulary, and each shape uses a pair of calls so
      that <em>both</em> sides can navigate the link:</p>
      <table>
        <thead><tr><th>Shape</th><th>Declare (both sides)</th><th>What Sequelize adds</th></tr></thead>
        <tbody>
          <tr><td>1:1</td><td><code>Passport.belongsTo(Student)</code><br>
              <code>Student.hasOne(Passport)</code></td>
              <td>a <code>StudentId</code> column on <code>Passports</code></td></tr>
          <tr><td>1:M</td><td><code>Department.hasMany(Student)</code><br>
              <code>Student.belongsTo(Department)</code></td>
              <td>a <code>DepartmentId</code> column on <code>Students</code></td></tr>
          <tr><td>M:N</td><td><code>Student.belongsToMany(Course, { through: Enrollment })</code><br>
              <code>Course.belongsToMany(Student, { through: Enrollment })</code></td>
              <td>a whole <code>Enrollments</code> junction table with two key columns,
              a composite primary key, and foreign keys back to both parents</td></tr>
        </tbody>
      </table>
      <p>Two rules of thumb that will save you an hour of confusion:</p>
      <ul>
        <li><strong><code>belongsTo</code> is the side that owns the key.</strong> The name is
        literal — a passport <em>belongs to</em> a student, so the passport table gets the
        column. <code>hasOne</code> / <code>hasMany</code> describe the same link from the other
        end and add no column of their own.</li>
        <li><strong>The key lands on the "many" side.</strong> Many students → the
        <code>Students</code> table gets <code>departmentId</code>. Two "many" sides → no single
        table can hold the key → a join table.</li>
      </ul>
      <p>These names — <code>hasOne</code>, <code>belongsTo</code>, <code>hasMany</code>,
      <code>belongsToMany</code> — are the whole of Week 10's new vocabulary. The next three
      lessons use them for real against the journal's own labs.</p>
    `,
    `
      <h3>Where this week's code lives</h3>
      <p>The journal splits Week 10 across two folders, and its own
      <code>README.txt</code> says so: the 1:1 and 1:M material is the
      <code>sequelize-association-lab</code> project (which you first met back in Week 8), and
      the M:N material is <code>lab20</code> plus <code>Advanced_associations</code>. One honest
      note before we start: the file
      <code>lab20/advance-Many-to-Many-Associations.js</code> is <strong>0 bytes</strong> — an
      empty placeholder that was never written. The real M:N demo is
      <code>Advanced_associations/app.js</code>, and that is the file we treat as canonical.</p>
    `
  ],
  examples: [
    {
      title: "lab20/notes.txt: the join table, drawn by hand in class",
      from: "journal",
      file: "sorted_files/10_Week-10_Associations/lab20/notes.txt",
      lang: "text",
      code: `
courseId
10  | node.js
20      react
30      c++
40      python

enrolments {table}
student | courseId
--------|----------
1           10
1           20
2           10
2           30

Student Table       Enrollment Table        Course Table
Rahul---------->    1 | 10 ----------------> node.js
Rahul---------->    1 | 20 ----------------> React
Priya---------->    2 | 10 ----------------> node.js
Priya---------->    1 | 30 ----------------> SQL
`,
      explain: [
        "Verbatim from the journal — the student's own sketch of the problem before any code was written. The <code>enrolments</code> table is the join table.",
        "Notice row pairs: <code>1|10</code> means Rahul takes Node.js, <code>2|20</code> means Rahul takes React. One row per relationship, never a list inside a cell.",
        "The right-hand column shows the payoff: three tables wired together, so a course name is stored once no matter how many students take it.",
        "The last line's mismatch (Priya with course 30 labelled SQL while the list above says c++) is in the original notes — harmless, the ids are what the database cares about."
      ]
    },
    {
      title: "migrations/2-create-student.js: a foreign key written by hand",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/migrations/2-create-student.js",
      lang: "javascript",
      code: `
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Students', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      emial: {
        type: Sequelize.STRING
      },
      departmentId:{
        type: Sequelize.INTEGER,
        references:{
          model:"Departments",
          key:"id"
        }
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Students');
  }
};
`,
      run: "npx sequelize-cli db:migrate",
      explain: [
        "This is what a foreign key looks like with the ORM stripped away: <code>departmentId</code> is a plain INTEGER column plus a <code>references</code> block saying \"this column points at Departments.id\".",
        "<code>references</code> is what makes the database itself refuse a student with <code>departmentId = 99</code> when no department 99 exists — the guarantee lives in MySQL, not in your JavaScript.",
        "<code>up</code> builds the table, <code>down</code> drops it — the migration pair from Week 8, now carrying a relationship.",
        "<strong>Spot the bug:</strong> the column is spelled <code>emial</code>. Week 8 glossed over it; this week it bites (lesson 55)."
      ]
    },
    {
      title: "migrations/3-create-passport.js: the same idea for a 1:1 link",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/migrations/3-create-passport.js",
      lang: "javascript",
      code: `
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('passports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      passportNumber: {
        type: Sequelize.STRING
      },
      studentId:{
        type:Sequelize.INTEGER,
        references:{
          model:"Students",
          key:"id"
        }
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('passports');
  }
};
`,
      run: "npx sequelize-cli db:migrate",
      explain: [
        "Structurally identical to the department migration — a foreign key is a foreign key — but the <em>story</em> is 1:1 rather than 1:M.",
        "The key column is <code>studentId</code> on the <code>passports</code> table, exactly as the diagram in the theory section predicted.",
        "Nothing in this SQL stops you inserting two passport rows with the same <code>studentId</code>. A true 1:1 needs a <code>UNIQUE</code> constraint on the key column — and that is precisely what Sequelize adds for you, which you will see next lesson.",
        "Migration order matters: 1-department, 2-student, 3-passport, because each table's key references a table that must already exist."
      ]
    },
    {
      title: "models/department.js: the parent side of a one-to-many",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/models/department.js",
      lang: "javascript",
      code: `
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The \`models/index\` file will call this method automatically.
     */
    static associate(models) {
      Department.hasMany(models.Student);
    }

  }
  Department.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Department',
    timestamps:false
  });
  return Department;
};
`,
      explain: [
        "The entire relationship declaration is one line inside <code>static associate()</code>: <code>Department.hasMany(models.Student)</code>.",
        "The generated <code>models/index.js</code> calls <code>associate()</code> for every model after loading them all — which is why the parameter is <code>models</code> (the whole bag) and not a single model: at definition time <code>Student</code> may not be loaded yet.",
        "Note the class is <code>extends Model</code> with <code>Model.init(...)</code> — the sequelize-cli style, unlike the <code>sequelize.define()</code> style used in the M:N labs later this week.",
        "<code>timestamps:false</code> switches off the <code>createdAt</code>/<code>updatedAt</code> columns, so a <code>SELECT</code> from this table returns just <code>id</code> and <code>name</code>."
      ]
    },
    {
      title: "models/Enrollment.js: the join table as a model",
      from: "journal",
      file: "sorted_files/10_Week-10_Associations/lab20/models/Enrollment.js",
      lang: "javascript",
      code: `
const {DataTypes} = require ("sequelize")
const sequelize = require("../config/database")

const Enrollment = sequelize.define("Enrollment",{
    studentId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    courseId:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
});

module.exports = Enrollment;
`,
      explain: [
        "This is the join table from the hand-drawn diagram, written as an ordinary Sequelize model: two columns, both foreign keys, both required.",
        "Both are <code>INTEGER</code> — matching the <code>id</code> type of the tables they point at. Getting this wrong is a real bug in the journal's other lab (lesson 56).",
        "<code>allowNull:false</code> on both means a link row can never say \"some student, some course\" — a link must always name both ends.",
        "This model is passed to <code>belongsToMany</code> as the <code>through</code> option; Sequelize then fills in the composite primary key and the actual SQL-level references for you."
      ]
    },
    {
      title: "models/index.js: the loader that wires every association for you",
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
      run: "node -e \"const db = require('./models'); console.log(Object.keys(db).join(', '))\"",
      output: "Department, Passport, Student, sequelize, Sequelize",
      explain: [
        "This file is generated by <code>sequelize-cli init</code> and it is the reason <code>require('./models')</code> returns <em>every</em> model at once — the pattern all of the lab's scripts start with.",
        "The first loop reads every <code>.js</code> file in the folder and calls it as a factory <code>(sequelize, DataTypes) =&gt; Model</code> — which is exactly the shape of <code>student.js</code>, <code>passport.js</code> and <code>department.js</code>.",
        "The second loop is the payoff: <code>db[modelName].associate(db)</code> runs each model's <code>associate()</code> method, passing the whole bag of models — this is where <code>Student.hasOne(models.Passport)</code> finally executes.",
        "Order matters: all models must be <em>loaded</em> before any association is declared, which is why loading and associating are two separate loops. The printed keys prove all three models made it into <code>db</code>.",
        "Note it reads <code>config/config.json</code> — the same connection settings the migrations use. One config, two consumers."
      ]
    },
    {
      title: "The three shapes in plain JavaScript (no database needed)",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// The three relationship shapes, modelled with plain objects (no database needed).
const depts = [{ id: 10, name: "BCA" }];
const students = [
  { id: 1, name: "Rahul", departmentId: 10 },
  { id: 2, name: "Priya", departmentId: 10 }
];

// ONE-TO-MANY: the "many" side stores the foreign key (departmentId)
for (const s of students) {
  const dept = depts.find(d => d.id === s.departmentId);
  console.log(s.name + " studies in " + dept.name);
}

// MANY-TO-MANY: neither side can hold the key, so a third table does.
const enrollments = [
  { studentId: 1, courseId: 10 },
  { studentId: 1, courseId: 20 },
  { studentId: 2, courseId: 10 }
];
const courses = [{ id: 10, name: "Node.js" }, { id: 20, name: "React" }];

const rahulCourses = enrollments
  .filter(e => e.studentId === 1)
  .map(e => courses.find(c => c.id === e.courseId).name);
console.log("Rahul is enrolled in: " + rahulCourses.join(", "));
`,
      run: "node three-shapes.js",
      output: "Rahul studies in BCA\nPriya studies in BCA\nRahul is enrolled in: Node.js, React",
      explain: [
        "Run this before touching Sequelize — it proves the ideas need no database at all, only arrays and ids.",
        "The 1:M lookup is a <code>find</code> on the foreign key: <code>depts.find(d =&gt; d.id === s.departmentId)</code>. Sequelize's <code>include()</code> does this same join for you, in SQL.",
        "The M:N lookup is a two-step filter-then-map through the join array — exactly the double join that <code>belongsToMany</code> will generate as SQL."
      ]
    },
    {
      title: "What Sequelize generates when you declare the relationships",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("college_db", "root", "", {
  host: "localhost", dialect: "mysql", logging: false
});

const Student = sequelize.define("Student", { name: DataTypes.STRING }, { timestamps: false });
const Passport = sequelize.define("Passport", { passportNumber: DataTypes.STRING }, { timestamps: false });
const Course = sequelize.define("Course", { name: DataTypes.STRING }, { timestamps: false });
const Enrollment = sequelize.define("Enrollment", {}, { timestamps: false });

// Declare the relationships (next two lessons pick these apart)
Passport.belongsTo(Student);
Student.belongsToMany(Course, { through: Enrollment, foreignKey: "studentId" });
Course.belongsToMany(Student, { through: Enrollment, foreignKey: "courseId" });

console.log("Passports gains column:", Object.keys(Passport.rawAttributes).join(", "));
console.log("  -> type:", Passport.rawAttributes.StudentId.type.key,
            "-> references:", Passport.rawAttributes.StudentId.references.model);
console.log("Junction table columns:", Object.keys(Enrollment.rawAttributes).join(", "));
`,
      run: "node generated-columns.js",
      output: "Passports gains column: id, passportNumber, StudentId\n  -> type: INTEGER -> references: Students\nJunction table columns: studentId, courseId",
      explain: [
        "No <code>sync()</code> and no MySQL server needed — this reads Sequelize's in-memory schema, so it runs anywhere after <code>npm i sequelize mysql2</code>.",
        "<code>Passport.belongsTo(Student)</code> silently appended a <code>StudentId</code> column of type <code>INTEGER</code> that references <code>Students</code> — the foreign key the theory diagram promised, generated rather than typed.",
        "<code>belongsToMany</code> built the junction table's columns: <code>studentId</code> and <code>courseId</code>. Sequelize also adds a composite primary key over the pair and <code>ON DELETE CASCADE</code> references to both parents.",
        "Change a model, re-run <code>sync()</code> or a migration, and the generated schema follows — declaration and database never drift apart."
      ]
    }
  ],
  keyPoints: [
    "Real data is split into focused tables; the glue between them is a foreign key — a column holding the primary key of a row in another table",
    "1:1 (student/passport) and 1:M (department/students) each put the key on the child table; M:N (students/courses) cannot, so it needs a third join table",
    "Sequelize's four methods come in pairs so both ends can navigate: hasOne/belongsTo for 1:1, hasMany/belongsTo for 1:M, belongsToMany/belongsToMany for M:N",
    "belongsTo is the side that owns the key column; the key always lands on the \"many\" side of the relationship",
    "belongsToMany's through option names the join-table model, and Sequelize generates its key columns, composite primary key and cascade constraints for you"
  ],
  practice: `
    <p>Take three sentences and decide each shape <em>before</em> looking anything up:
    (a) "a user has one profile", (b) "a blog post has many comments", (c) "a library book is
    borrowed by many members and a member borrows many books". For each, name the table that
    gets the foreign key — or say "join table" for the M:N case.</p>
    <p>Then run the journal's own sketch: open
    <code>sorted_files/10_Week-10_Associations/lab20/notes.txt</code> and check your answers
    against the diagram the student drew in class. Finally, run example 6
    (<code>node three-shapes.js</code>) and edit the <code>enrollments</code> array so that
    Priya also takes React (add <code>{ studentId: 2, courseId: 20 }</code>) — confirm the
    output changes to match.</p>
  `,
  quiz: [
    {
      q: "A student has exactly one passport, and a passport belongs to exactly one student. Which shape is this, and where does the key go?",
      options: [
        "One-to-one; the key (studentId) goes on the Passports table",
        "One-to-many; the key (passportId) goes on the Students table",
        "Many-to-many; a join table is needed",
        "One-to-one; a join table is needed"
      ],
      answer: 0,
      why: "Both sides are singular, so it is 1:1. The key goes on whichever table treats the other as extra information — a passport is extra data about a student, so Passports.studentId holds it."
    },
    {
      q: "In Department.hasMany(Student), which table ends up with a foreign key column, and what is it called by default?",
      options: [
        "Departments gets a StudentId column",
        "Students gets a DepartmentId column",
        "Neither — hasMany uses a join table",
        "Students gets a DepartmentId column, but only after a migration is written by hand"
      ],
      answer: 1,
      why: "The \"many\" side always carries the key, so Students gains DepartmentId. (Sequelize generates it the moment you call sync() — no hand-written migration needed.)"
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/core-concepts/assocs/",
    "https://sequelize.org/docs/v6/advanced-association-concepts/advanced-many-to-many/",
    "https://sequelize.org/docs/v6/core-concepts/model-basics/"
  ]
});
