window.COURSE_LESSONS.push({
  id: "w10-one-to-one-one-to-many",
  file: "055",
  unit: 2,
  week: 10,
  title: "One-to-one and one-to-many associations",
  kicker: "Unit II · Week 10 · Lesson 2 of 4",
  minutes: 18,
  objectives: [
    "Declare a one-to-one (hasOne + belongsTo) and a one-to-many (hasMany + belongsTo) association",
    "Explain what foreignKey, sourceKey, targetKey and the as alias each change",
    "Predict, before running anything, which column Sequelize will add and to which table",
    "Create and read linked rows, and fix the two real bugs hiding in the journal's association lab"
  ],
  intro: `
    <p>Last lesson you drew the three shapes on paper: a student <em>has one</em> passport,
    a department <em>has many</em> students, and you learned that the foreign key lands on the
    child table. Now we write those two shapes for real, with the journal's own
    <code>sequelize-association-lab</code> project — the 1:1 and 1:M half of Week 10.</p>
    <p>By the end you will be able to read any <code>hasOne</code>/<code>belongsTo</code>/
    <code>hasMany</code> line and say out loud which column it creates, on which table, of which
    type — and you will have caught two genuine bugs in the lab code, one of which silently
    throws away data.</p>
  `,
  theory: [
    `
      <h3>Every association is declared twice</h3>
      <p>The single most confusing thing for beginners: you do not declare a relationship once,
      you declare it <strong>once per side</strong>. Each declaration teaches one
      <em>model</em> how to reach the other, and each one adds its own piece of machinery.</p>
      <pre class="diagram">Passport.belongsTo(Student);   // adds column  StudentId  to Passports
Student.hasOne(Passport);      // adds NO column; gives Student a .getPassport()

Department.hasMany(Student);   // adds column  DepartmentId  to Students
Student.belongsTo(Department); // adds NO column; gives Student a .getDepartment()</pre>
      <p>Read that carefully: <strong>only <code>belongsTo</code> adds a column</strong>. It is
      the side that "belongs to" the other — a passport belongs to a student — and it is the
      side that must remember <em>which</em> student, via a key. The <code>hasOne</code> and
      <code>hasMany</code> calls add no columns at all; they only install accessor methods on
      the instance (<code>student.getPassport()</code>, <code>department.getStudents()</code>).</p>
      <p>That is why declaring both sides is not duplication of <em>data</em> — one column,
      defined once — but duplication of <em>navigation</em>: without
      <code>Student.hasOne(Passport)</code> the student has no way to ask for its passport,
      even though the passport can ask for its student.</p>
    `,
    `
      <h3>What Sequelize actually generates</h3>
      <p>Here is the schema Sequelize builds once you declare the journal's four lines — this
      output is from running the real code, not a mock-up:</p>
      <pre class="diagram">Passports gains column: id, passportNumber, StudentId
  -&gt; type: INTEGER -&gt; references: Students
Student gains column:  id, name, emial, DepartmentId</pre>
      <p>Three properties of the generated key matter, and you can read all three off that
      output:</p>
      <ul>
        <li><strong>Name.</strong> Default is <code>&lt;TargetModelName&gt;&lt;Key&gt;</code>:
        <code>StudentId</code>, <code>DepartmentId</code>. PascalCase, singular, exactly the
        model name plus <code>Id</code>.</li>
        <li><strong>Type.</strong> Copied from the referenced key — <code>Students.id</code> is
        an INTEGER, so <code>StudentId</code> is an INTEGER. If you ever point at a
        <code>STRING</code> key (a username, say), the foreign key becomes a STRING too.</li>
        <li><strong>Constraint.</strong> <code>references: Students</code> means MySQL itself
        will reject a passport whose <code>StudentId</code> matches no student. Sequelize also
        adds <code>ON DELETE CASCADE</code> by default: delete the student, the passport row
        goes with it.</li>
      </ul>
      <p>And because a <code>belongsTo</code>/<code>hasOne</code> pair describes one column from
      two directions, Sequelize recognises them as describing the <em>same</em> key rather than
      creating two.</p>
    `,
    `
      <h3>The four options you will actually use</h3>
      <p>Beyond the method names, only four options come up in practice. All outputs below are
      from the real Sequelize version the journal installs (6.37.8):</p>
      <table>
        <thead><tr><th>Option</th><th>What it changes</th><th>Example</th></tr></thead>
        <tbody>
          <tr><td><code>foreignKey</code></td><td>the name of the generated key column</td>
              <td><code>Department.hasMany(Student, { foreignKey: "deptCode" })</code> →
              the column is <code>deptCode</code>, not <code>DepartmentId</code></td></tr>
          <tr><td><code>sourceKey</code></td><td>which column of the <em>parent</em> the key
              points at (default: its primary key <code>id</code>)</td>
              <td><code>{ sourceKey: "code" }</code> → keys point at
              <code>Departments.code</code></td></tr>
          <tr><td><code>targetKey</code></td><td>the <code>belongsTo</code> mirror of
              <code>sourceKey</code>: which column of the <em>child</em> holds the value</td>
              <td><code>Passport.belongsTo(Student, { targetKey: "rollNo" })</code></td></tr>
          <tr><td><code>as</code></td><td>the accessor/label name, when a model links to the
              same table twice</td>
              <td><code>{ as: "members" }</code> → <code>dept.getMembers()</code></td></tr>
        </tbody>
      </table>
      <p>The alias case is the one that saves you: a university can have a
      <em>head</em> and a <em>deputy</em>, both <code>belongsTo(User)</code> — without
      <code>as</code> the two would fight over the same accessor name. Aliases also rename the
      key on <code>belongsTo</code> (alias <code>issuingDept</code> produced a column
      <code>issuingDeptId</code> in our run), which is why you should always pick the alias
      <em>before</em> your first <code>sync()</code>.</p>
      <pre class="diagram">Accessors installed by the four methods (real output):
belongsTo  -&gt; get, set, create          (singular: one parent)
hasOne     -&gt; get, set, create          (singular: one child)
hasMany    -&gt; get, set, addMultiple, add, create,
             removeMultiple, remove, hasSingle, hasAll, count</pre>
    `,
    `
      <h3>Two real bugs in the journal's lab</h3>
      <p>Honesty time — this lab is not clean, and the flaws are better teaching material than a
      polished file would be.</p>
      <ul>
        <li><strong>The <code>emial</code> typo.</strong> <code>models/student.js</code> and
        the migration both spell the column <code>emial</code>. <code>create.js</code> repeats
        the typo so it accidentally works; but <code>createDept.js</code> passes
        <code>email</code> — the correct spelling — and Sequelize <em>silently drops</em>
        attributes the model does not declare. Rohit and Anil end up with a NULL email and no
        error anywhere. We reproduce and fix this below.</li>
        <li><strong>The casing mismatch.</strong> The migration creates
        <code>departmentId</code> (lowercase d) but the association generates
        <code>DepartmentId</code>. It happens to work on MySQL because column names are
        case-insensitive there — but it would break on PostgreSQL, and it makes the schema
        confusing to read. Pick one spelling and use it everywhere.</li>
      </ul>
    `
  ],
  examples: [
    {
      title: "models/student.js: both sides of two associations, plus the typo",
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
        "Two associations in one <code>associate()</code> block — this single model sits in the middle of a 1:1 above it and a 1:M below it.",
        "<code>Student.hasOne(models.Passport)</code> installs <code>student.getPassport()</code> and adds no column; <code>Passport.belongsTo(Student)</code> (next example) is the half that adds <code>StudentId</code>.",
        "<code>Student.belongsTo(models.Department)</code> is the column-owning half of the 1:M — <code>Students.DepartmentId</code> appears.",
        "<strong>The bug:</strong> <code>emial: DataTypes.STRING</code>. That misspelling is now baked into the model, the migration, and every query. Keep reading — it costs real data."
      ]
    },
    {
      title: "models/passport.js: the belongsTo half of the 1:1",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/models/passport.js",
      lang: "javascript",
      code: `
'use strict';

const {
  Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {

  class Passport extends Model {

    static associate(models) {

      Passport.belongsTo(models.Student);

    }

  }


  Passport.init({

    passportNumber: DataTypes.STRING

  }, {

    sequelize,

    modelName: 'Passport',
    timestamps: false

  });


  return Passport;

};
`,
      explain: [
        "One association, one line: <code>Passport.belongsTo(models.Student)</code> — and that line is what creates the <code>StudentId</code> INTEGER column on the <code>Passports</code> table.",
        "With no options given, Sequelize uses its defaults: key name <code>StudentId</code>, key type copied from <code>Students.id</code>, plus <code>ON DELETE CASCADE</code>.",
        "Pair it with <code>Student.hasOne(models.Passport)</code> from the previous example and both models can navigate: <code>passport.getStudent()</code> and <code>student.getPassport()</code>.",
        "Blank lines are in the journal file exactly as written — this model was clearly pasted and edited a few times."
      ]
    },
    {
      title: "create.js: inserting a 1:1 pair by hand",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/create.js",
      lang: "javascript",
      code: `
const { Student, Passport } = require("./models");

async function run() {
    const student = await Student.create({
        name: "Roger",
        emial: "roger@gmail.com"
    });
    await Passport.create({
        passportNumber: "AUGK33940",
        StudentId: student.id
    });
    console.log("Student Created");
}
run();
`,
      run: "node create.js",
      output: "Student Created",
      explain: [
        "<code>require(\"./models\")</code> is the <code>models/index.js</code> loader — it reads every model file, wires the associations, and hands back <code>{ Student, Passport, sequelize }</code> in one call.",
        "The two inserts are <strong>manual</strong>: create the student first, then copy its generated <code>id</code> into the passport's <code>StudentId</code>. This is the foreign key being set by hand — exactly what <code>passport.setStudent(student)</code> or <code>student.createPassport({...})</code> would do for you.",
        "Note the attribute is spelled <code>StudentId</code> here — PascalCase, matching the column Sequelize generated, not the <code>studentId</code> the migration happens to create. MySQL does not care about case; your model does.",
        "Run it from the lab folder after <code>npx sequelize-cli db:migrate</code>, with XAMPP's MySQL running."
      ]
    },
    {
      title: "createDept.js: a department with two students — and a silent data loss",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/createDept.js",
      lang: "javascript",
      code: `
const { Student,Department} = require("./models");

async function run(){
    const department = await Department.create({
        name:"BCA"
    });

    await Student.create({
        name:"Rohit",
        email:"rohit@gmail.com",
        DepartmentId: department.id
    });

    await Student.create({
        name:"Anil",
        email:"anil@gmail.com",
        DepartmentId: department.id
    });

    console.log("Data Inserted Created");
}

run();
`,
      run: "node createDept.js",
      output: "Data Inserted Created",
      explain: [
        "The 1:M insert pattern: create the <em>one</em> first, then create each <em>many</em> row with <code>DepartmentId: department.id</code> — one parent id copied into many child rows.",
        "Both scripts print a cheerful message, so it looks like success. It is not: look at the attribute names.",
        "<strong>The bug:</strong> the model declares <code>emial</code>, this script passes <code>email</code>. Sequelize ignores keys the model does not declare — no error, no warning — so the email column is left NULL for both students.",
        "The next example proves it against a real MySQL server, and shows the one-character fix."
      ]
    },
    {
      title: "The email bug, reproduced and fixed against real MySQL",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("association_db", "root", "", {
  host: "localhost", dialect: "mysql", logging: false
});

// FIXED version: the column is now spelled "email" in the model too
const Department = sequelize.define("Department", { name: DataTypes.STRING }, { timestamps: false });
const Student = sequelize.define("Student", {
  name: DataTypes.STRING,
  email: DataTypes.STRING       // was: "emial"
}, { timestamps: false });

Student.belongsTo(Department);
Department.hasMany(Student);

async function run() {
  await sequelize.sync({ force: true });
  const department = await Department.create({ name: "BCA" });
  await Student.create({ name: "Rohit", email: "rohit@gmail.com", DepartmentId: department.id });
  await Student.create({ name: "Anil", email: "anil@gmail.com", DepartmentId: department.id });
  console.log("Data Inserted Created");

  const [rows] = await sequelize.query("SELECT id, name, email, DepartmentId FROM Students");
  console.log(JSON.stringify(rows));
}
run();
`,
      run: "node email-fixed.js",
      output: "Data Inserted Created\n[{\"id\":1,\"name\":\"Rohit\",\"email\":\"rohit@gmail.com\",\"DepartmentId\":1},{\"id\":2,\"name\":\"Anil\",\"email\":\"anil@gmail.com\",\"DepartmentId\":1}]",
      explain: [
        "Run with the model spelling <code>emial</code> instead and the same query returns <code>\"email\":null</code> for both rows — verified against the journal's MySQL setup. The insert succeeds; the data is simply gone.",
        "The fix is one word in one place — but the <em>lesson</em> is that <code>create()</code> silently drops unknown keys. When a value vanishes, diff your attribute names against the model's.",
        "Note the association lines are identical to the journal's; only the column spelling changed, so <code>DepartmentId</code> still appears on each student.",
        "<code>sync({ force: true })</code> drops and rebuilds the tables — convenient in a lab, never run it against data you care about."
      ]
    },
    {
      title: "read.js: pulling a student and its passport in ONE query",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/read.js",
      lang: "javascript",
      code: `
const { Student, Passport } = require("./models");

async function run() {
const student = await Student.findOne({
    include:Passport
});
console.log(student.toJSON());
}
run()
`,
      run: "node read.js",
      output: "{ id: 1,\n  name: 'Roger',\n  emial: 'roger@gmail.com',\n  DepartmentId: null,\n  Passport: { id: 1, passportNumber: 'AUGK33940', StudentId: 1 } }",
      explain: [
        "<code>include: Passport</code> is <strong>eager loading</strong> — the single most important option of the whole week. One <code>SELECT</code> with a <code>JOIN</code> returns the student <em>and</em> its passport.",
        "The passport does not come back as an array even though the syntax looks like <code>include: [Passport]</code> territory — <code>hasOne</code> yields one object, hanging off <code>student.Passport</code>.",
        "Run <code>create.js</code> first, or <code>findOne</code> returns <code>null</code> and <code>student.toJSON()</code> throws. Ordering of scripts matters as much as their contents.",
        "Lesson 57 is entirely about <code>include</code>; here it is just a first look at the payoff of declaring associations."
      ]
    },
    {
      title: "readDept.js: the same trick on the one-to-many side",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/readDept.js",
      lang: "javascript",
      code: `
const {Department, Student}=require("./models");

async function run(){
const department = await Department.findOne({
    include: Student
});

console.log(department.toJSON());
}

run();
`,
      run: "node readDept.js",
      output: "{ id: 1,\n  name: 'BCA',\n  Students:\n   [ { id: 2, name: 'Rohit', emial: null, DepartmentId: 1 },\n     { id: 3, name: 'Anil', emial: null, DepartmentId: 1 } ] }",
      explain: [
        "Identical syntax to <code>read.js</code>, opposite shape: <code>hasMany</code> means <code>department.Students</code> is an <strong>array</strong> — every student row whose <code>DepartmentId</code> matches.",
        "There is the bug again, in living colour: <code>emial: null</code> for both students. The department link worked, the email silently did not.",
        "One <code>SELECT</code> plus a <code>LEFT JOIN</code> produced the whole nested object — no loop, no second query, no manual stitching.",
        "This file and <code>read.js</code> are the entire payoff of Week 10 in ten lines each."
      ]
    },
    {
      title: "Seeing the generated keys and accessors for yourself",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("association_db", "root", "", {
  host: "localhost", dialect: "mysql", logging: false
});

const Student = sequelize.define("Student", { name: DataTypes.STRING }, { timestamps: false });
const Passport = sequelize.define("Passport", { passportNumber: DataTypes.STRING }, { timestamps: false });
const Department = sequelize.define("Department", {
  name: DataTypes.STRING,
  code: DataTypes.INTEGER
}, { timestamps: false });

// Default naming: the foreign key is <TargetModel><Key> — here "StudentId"
Passport.belongsTo(Student);

// An alias renames the accessors; on belongsTo it also renames the foreign key
Passport.belongsTo(Department, { as: "issuingDept" });

// foreignKey renames the column; sourceKey says WHICH column is referenced
Department.hasMany(Student, { as: "members", foreignKey: "deptCode", sourceKey: "code" });

console.log("Passport columns:", Object.keys(Passport.rawAttributes).join(", "));
console.log("Student columns:", Object.keys(Student.rawAttributes).join(", "));
console.log("Accessors on a department instance:",
            Object.keys(Department.associations.members.accessors).join(", "));
`,
      run: "node association-options.js",
      output: "Passport columns: id, passportNumber, StudentId, issuingDeptId\nStudent columns: id, name, deptCode\nAccessors on a department instance: get, set, addMultiple, add, create, remove, removeMultiple, hasSingle, hasAll, count",
      explain: [
        "No database needed — reading <code>rawAttributes</code> shows the schema Sequelize built in memory, so you can experiment with options in seconds.",
        "Line 3 (<code>belongsTo(Student)</code>, no options) produced <code>StudentId</code>: the default naming rule, visible.",
        "Line 5's alias <code>issuingDept</code> produced <code>issuingDeptId</code> — proof that <code>as</code> renames the key too, which is why you settle aliases before the first sync.",
        "Line 8's <code>foreignKey: \"deptCode\"</code> renamed the generated column from <code>DepartmentId</code> to <code>deptCode</code>, and the accessors became <code>getMembers()</code>, <code>addMember()</code>… — the alias flows into every method name."
      ]
    }
  ],
  keyPoints: [
    "Declare an association once per side: belongsTo owns the foreign-key column; hasOne/hasMany only install accessor methods",
    "Default key name is TargetModelName+Id (StudentId, DepartmentId), its type is copied from the referenced key, and it carries a REFERENCES constraint with ON DELETE CASCADE",
    "foreignKey renames the column, sourceKey/targetKey choose which key column is referenced, and as renames the accessors (and the belongsTo key)",
    "hasMany yields an array (department.Students), hasOne yields a single object (student.Passport)",
    "The journal's lab has an emial typo: createDept.js passes email, Sequelize silently drops unknown attributes, and the students' emails are stored as NULL"
  ],
  practice: `
    <p>In <code>sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/</code>,
    fix the typo for real: rename <code>emial</code> to <code>email</code> in
    <code>models/student.js</code> and <code>migrations/2-create-student.js</code>, drop and
    re-run the migrations (<code>npx sequelize-cli db:migrate</code>, or undo with
    <code>--to 1</code> first), then run <code>node createDept.js</code> followed by
    <code>node readDept.js</code>. The emails must now show up instead of
    <code>null</code>.</p>
    <p>Bonus: add a <code>phone</code> STRING column to the Passport model and re-run
    <code>create.js</code> passing <code>phone</code> — then check
    <code>node read.js</code> prints it nested under <code>Passport</code>.</p>
  `,
  quiz: [
    {
      q: "You write Student.hasOne(Passport) and Passport.belongsTo(Student) with no options. Which column is created, on which table?",
      options: [
        "PassportId on the Students table",
        "StudentId (INTEGER, references Students.id) on the Passports table",
        "A PassportId column on Students AND a StudentId column on Passports",
        "No columns at all — associations only add methods"
      ],
      answer: 1,
      why: "Only belongsTo adds the key, and it adds it to its OWN table: Passports gains StudentId, an INTEGER matching Students.id, with a REFERENCES constraint. hasOne contributes navigation only."
    },
    {
      q: "createDept.js passes email: \"rohit@gmail.com\" but the model declares the column as emial. What happens when you run it?",
      options: [
        "Sequelize throws an error: unknown attribute email",
        "Sequelize renames email to emial automatically, because the case differs",
        "The row is inserted with emial = NULL — unknown attributes are silently ignored",
        "The email is stored in a separate table keyed by student name"
      ],
      answer: 2,
      why: "Sequelize only writes attributes the model declares; anything else in the create() object is dropped without a word. That is why the lab's readDept.js output shows emial: null for both students."
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/core-concepts/assocs/",
    "https://sequelize.org/docs/v6/core-concepts/model-querying-basics/"
  ]
});
