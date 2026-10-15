window.COURSE_LESSONS.push({
  id: "w10-many-to-many",
  file: "056",
  unit: 2,
  week: 10,
  title: "Many-to-many with a join table",
  kicker: "Unit II · Week 10 · Lesson 3 of 4",
  minutes: 18,
  objectives: [
    "Explain why a many-to-many relationship needs a third (join) table instead of a foreign key",
    "Declare Student.belongsToMany(Course, { through: Enrollment }) on both sides and say what Sequelize generates",
    "Use the addX/getX/hasX/removeX accessors, including the through option to store data on the link itself",
    "Spot and fix the two real bugs in the journal's M:N labs (the foreignkey typo and the STRING key)"
  ],
  intro: `
    <p>Last lesson you built the shapes that need one key: passports pointing at students,
    students pointing at departments. This lesson is the awkward one — <em>students enrol in
    courses and courses have students</em> — where both sides are plural, no single column can
    hold the key, and a whole third table appears.</p>
    <p>This is the journal's <code>lab20</code> and <code>Advanced_associations</code> material.
    It is also the week where the code starts to bite back: one lab has a one-letter typo that
    makes <code>sync()</code> crash with a database error, and the other declares a key column
    as the wrong type. Both are fixed below, with the real error messages shown.</p>
  `,
  theory: [
    `
      <h3>Why one foreign key cannot work here</h3>
      <p>Take the department case from last lesson and push on it. A department has many
      students, but each student has exactly one department — so one column
      (<code>Students.departmentId</code>) can express the whole relationship. Now try students
      and courses: Rahul takes Node.js <em>and</em> React <em>and</em> SQL. Where would you
      put the link?</p>
      <ul>
        <li><code>Students.courses = "10,20,30"</code> — a comma-separated string in one cell.
        The database cannot index it, cannot enforce it, and every query becomes string
        splitting. This is the classic anti-pattern; never do it.</li>
        <li><code>Courses.students = "1,2"</code> — same disease, other side.</li>
        <li><strong>A third table.</strong> One row per relationship, two key columns, each row
        saying one atomic fact: <em>student 1 takes course 10</em>.</li>
      </ul>
      <pre class="diagram">Students       Enrollments (the join / through table)     Courses
+----+------+   +-----------+----------+   +----+---------+
| id | name |   | studentId | courseId |   | id | name    |
+----+------+   +-----------+----------+   +----+---------+
|  1 | Rahul|---|     1     |    10    |---| 10 | Node.js |
|  2 | Priya|---|     1     |    20    |---| 20 | React   |
+----+------+   |     2     |    10    |   | 30 | C++     |
                +-----------+----------+   +----+---------+
                 two foreign keys, one row per link
                 (studentId → Students.id, courseId → Courses.id)</pre>
      <p>That table is called a <strong>join table</strong>, <strong>junction table</strong> or
      <strong>through table</strong> — three names, one idea. Sequelize's word for it is
      <em>through</em>, after the option you pass. The journal's own
      <code>lab20/notes.txt</code> draws exactly this picture in class, before any code was
      written (example 1).</p>
    `,
    `
      <h3>belongsToMany: declare it on both sides</h3>
      <p>A many-to-many is <em>two</em> one-to-many relationships pointing at the same join
      table, so you declare it twice — once from each end:</p>
      <pre class="diagram">Student.belongsToMany(Course, { through: Enrollment, foreignKey: "studentId" });
Course.belongsToMany(Student, { through: Enrollment, foreignKey: "courseId" });</pre>
      <p>Read the first line as: "a Student reaches Courses <em>through</em> the Enrollment
      table, and the column in that table pointing back at students is called
      <code>studentId</code>." The second line supplies the other column. Sequelize needs both
      because each call only knows its own direction — the same reason <code>belongsTo</code>
      and <code>hasOne</code> came in pairs last lesson.</p>
      <p>What Sequelize generates from those two lines (real output, verified):</p>
      <ul>
        <li>the <code>Enrollments</code> table with columns <code>studentId</code> and
        <code>courseId</code>, each an INTEGER with <code>REFERENCES</code> and
        <code>ON DELETE/UPDATE CASCADE</code>;</li>
        <li>a <strong>composite primary key</strong> over the pair — so Rahul cannot be enrolled
        in Node.js twice; the database refuses it;</li>
        <li>a pile of accessor methods on every instance (below).</li>
      </ul>
      <p>Note what you do <em>not</em> write: no <code>StudentId</code> column anywhere on
      Students or Courses. The link lives entirely in the middle.</p>
    `,
    `
      <h3>The accessor toolkit</h3>
      <p><code>belongsToMany</code> installs the richest set of methods of any association —
      this is the real output of <code>Object.keys(association.accessors)</code>:</p>
      <pre class="diagram">get, set, addMultiple, add, create, removeMultiple,
remove, hasSingle, hasAll, count</pre>
      <p>Sequelize folds those into names built from the target model, singular for one row and
      plural for many. With <code>Student.belongsToMany(Course, ...)</code> on a
      <code>rahul</code> instance:</p>
      <table>
        <thead><tr><th>Method</th><th>Does</th><th>SQL underneath</th></tr></thead>
        <tbody>
          <tr><td><code>rahul.addCourse(node)</code></td><td>enrol Rahul in one course</td>
              <td><code>INSERT INTO Enrollments ...</code></td></tr>
          <tr><td><code>rahul.getCourses()</code></td><td>list Rahul's courses (array)</td>
              <td><code>SELECT ... FROM Courses JOIN Enrollments ...</code></td></tr>
          <tr><td><code>rahul.hasCourse(node)</code></td><td>is he enrolled? (boolean)</td>
              <td>a <code>SELECT</code> filtered to the pair</td></tr>
          <tr><td><code>rahul.removeCourse(react)</code></td><td>drop one enrolment</td>
              <td><code>DELETE FROM Enrollments WHERE ...</code></td></tr>
          <tr><td><code>rahul.setCourses([...])</code></td><td>replace the whole set</td>
              <td>delete stale rows, insert missing ones</td></tr>
          <tr><td><code>rahul.countCourses()</code></td><td>how many</td>
              <td><code>SELECT COUNT(*) ...</code></td></tr>
        </tbody>
      </table>
      <p>And the trick that makes M:N shine: the link itself can carry data. An enrolment is
      not just "Rahul ↔ Node.js" — it also has a <em>semester</em>, a <em>grade</em>, a
      <em>status</em>. Add those columns to the Enrollment model and pass them with the
      <code>through</code> option of <code>addCourse</code> (example 6).</p>
    `,
    `
      <h3>Two real bugs in the journal's M:N labs</h3>
      <ul>
        <li><strong><code>foreignkey</code> vs <code>foreignKey</code> (lab20/app.js, line 8).</strong>
        JavaScript option names are case-sensitive. With the lowercase <code>k</code>, Sequelize
        ignores the option and invents its own key name <code>StudentId</code> — while your
        model already declares <code>studentId</code>. On MySQL, whose column names are
        case-insensitive, that is <em>two definitions of the same column</em>, and
        <code>sync({ force: true })</code> dies with
        <code>Duplicate column name 'StudentId'</code>. Reproduced and fixed in example 4.</li>
        <li><strong><code>studentId: DataTypes.STRING</code> (Advanced_associations/models/Enrollment.js).</strong>
        The key it points at, <code>Student.id</code>, is an INTEGER. Sequelize silently
        <em>corrects</em> the type to INTEGER when the association is injected (we verified:
        <code>before associations: STRING → after associations: INTEGER</code>), so the lab
        happens to work — but the declaration is still wrong, and it would mislead anyone
        reading the model or writing a migration from it.</li>
      </ul>
    `
  ],
  examples: [
    {
      title: "lab20/notes.txt: the join table, drawn before the code",
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

GO TO XAMPP
CREAT NEW DB IN MY PHP ADMIN
DATABASE = college_db
 npm init -y
 npm install sequelize mysql2
`,
      explain: [
        "The whole design, decided on paper first: two parent tables, one <code>enrolments</code> join table in the middle. This is exactly the diagram in the theory section.",
        "Each row of <code>enrolments</code> is one atomic fact. Rahul needs two rows because he takes two courses — that is the 'many' in many-to-many made concrete.",
        "The bottom half is the setup checklist: XAMPP running, a database named <code>college_db</code>, <code>npm init -y</code>, then <code>sequelize</code> + <code>mysql2</code>.",
        "This is the same two-package install you have used since Week 7 — associations need no new dependencies."
      ]
    },
    {
      title: "lab20/app.js: wiring the many-to-many (with the case typo)",
      from: "journal",
      file: "sorted_files/10_Week-10_Associations/lab20/app.js",
      lang: "javascript",
      code: `
const sequelize = require("./config/database");
const Student = require('./models/Student');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

Student.belongsToMany(Course,{
    through:Enrollment,
    foreignkey:"studentId"
});

Course.belongsToMany(Student,{
    through:Enrollment,
    foreignKey:"courseId"
});

async function main(){
    await sequelize.sync({force:true});
    console.log("Database Synced")
}

main();
`,
      run: "node app.js",
      output: "Database Synced   (only after fixing line 8 — see example 4)",
      explain: [
        "The complete M:N declaration: both models imported, <code>through: Enrollment</code> naming the join table on both sides, and one <code>foreignKey</code> per direction.",
        "<code>sequelize.sync({ force: true })</code> drops and recreates every table — so this file alone builds the whole three-table schema. That is why <code>lab20</code> ships no migrations.",
        "<strong>Spot the bug:</strong> line 8 says <code>foreignkey</code> (lowercase <code>k</code>), line 13 says <code>foreignKey</code>. Only the second is a real Sequelize option — and the two lines disagree.",
        "Notice the file stops at syncing — it never inserts anything. The full working demo is <code>Advanced_associations/app.js</code>, which is where we go next."
      ]
    },
    {
      title: "lab20-typo.js: the crash the typo causes, reproduced",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("college_db", "root", "", {
  host: "localhost", dialect: "mysql", logging: false
});

// EXACT replica of lab20 models + app.js (note "foreignkey" lowercase k on line 8)
const Student = sequelize.define("Student", { name: { type: DataTypes.STRING, allowNull: false } });
const Course = sequelize.define("Course", { name: { type: DataTypes.STRING, allowNull: false } });
const Enrollment = sequelize.define("Enrollment", {
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  courseId: { type: DataTypes.INTEGER, allowNull: false }
});

Student.belongsToMany(Course, { through: Enrollment, foreignkey: "studentId" });
Course.belongsToMany(Student, { through: Enrollment, foreignKey: "courseId" });

async function main() {
  await sequelize.sync({ force: true });
  console.log("Database Synced");
}
main();
`,
      run: "node lab20-typo.js",
      output: "SequelizeDatabaseError: Duplicate column name 'StudentId'",
      explain: [
        "Run against real MySQL (XAMPP up, <code>college_db</code> created): sync dies before it prints anything.",
        "The generated CREATE TABLE contains <em>both</em> <code>studentId</code> (declared in your model) and <code>StudentId</code> (invented by Sequelize because it never saw the option) — and MySQL, whose column names are case-insensitive, rejects the second as a duplicate.",
        "The fix is one letter: <code>foreignkey</code> → <code>foreignKey</code> on the Student line. Example 4 shows it working.",
        "The lesson outlives the typo: option names are case-sensitive, and a mis-spelled option is ignored <em>silently</em> until the database complains."
      ]
    },
    {
      title: "The one-letter fix, verified",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("college_db", "root", "", {
  host: "localhost", dialect: "mysql", logging: false
});

// lab20 models, with the ONE fix: "foreignkey" -> "foreignKey" on the Student line
const Student = sequelize.define("Student", { name: { type: DataTypes.STRING, allowNull: false } });
const Course = sequelize.define("Course", { name: { type: DataTypes.STRING, allowNull: false } });
const Enrollment = sequelize.define("Enrollment", {
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  courseId: { type: DataTypes.INTEGER, allowNull: false }
});

Student.belongsToMany(Course, { through: Enrollment, foreignKey: "studentId" });
Course.belongsToMany(Student, { through: Enrollment, foreignKey: "courseId" });

async function main() {
  await sequelize.sync({ force: true });
  console.log("Database Synced");
  console.log("Enrollments columns:", Object.keys(Enrollment.rawAttributes).join(", "));
}
main();
`,
      run: "node lab20-fixed.js",
      output: "Database Synced\nEnrollments columns: studentId, courseId, createdAt, updatedAt",
      explain: [
        "Identical to the previous example except the capital K — and it runs. The join table now has exactly the two key columns the hand-drawn diagram promised.",
        "<code>createdAt</code>/<code>updatedAt</code> appear because the journal's Enrollment model does not pass <code>timestamps: false</code>. Harmless, but now you know where they came from.",
        "Compare with the journal's <code>lab20/models/Enrollment.js</code>, which declares both keys as INTEGER and <code>allowNull: false</code> — that part is correct and worth keeping.",
        "If you prefer real migrations over <code>sync()</code>, this fixed model is exactly what lesson 47's <code>sequelize-cli migration:generate</code> workflow would emit."
      ]
    },
    {
      title: "Advanced_associations/models/Enrollment.js: the link carries data (and a type slip)",
      from: "journal",
      file: "sorted_files/10_Week-10_Associations/Advanced_associations/models/Enrollment.js",
      lang: "javascript",
      code: `
const {DataTypes}=require('sequelize');
const sequelize=require('../config/database');

const Enrollment=sequelize.define("Enrollment",{
    studentId:{
        type:DataTypes.STRING,
        allowNull:false
    },
    courseId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    semester:{
        type:DataTypes.STRING,
    },
    grade:{
        type:DataTypes.STRING
    },
    status:{
        type:DataTypes.STRING
    }

});

module.exports=Enrollment;
`,
      explain: [
        "Three extra columns — <code>semester</code>, <code>grade</code>, <code>status</code> — that describe the <em>link</em>, not the student and not the course. This is the whole reason to model an M:N with a real through model instead of a bare two-column table.",
        "<strong>Spot the bug:</strong> <code>studentId</code> is declared <code>DataTypes.STRING</code> while <code>courseId</code> right below it is INTEGER. The key it points at, <code>Student.id</code>, is INTEGER.",
        "Sequelize papers over it: when <code>belongsToMany</code> runs, it overwrites the column type with the source key's type. We verified the flip — STRING before the association, INTEGER after — so <code>sync()</code> still produces a sane table.",
        "Still fix it: a reader trusts the model file, and if you ever wrote a migration from it by hand you would ship a VARCHAR where an INT belongs."
      ]
    },
    {
      title: "Advanced_associations/app.js: the full M:N demo, end to end",
      from: "journal",
      file: "sorted_files/10_Week-10_Associations/Advanced_associations/app.js",
      lang: "javascript",
      code: `
const sequelize=require('./config/database');
const Student=require('./models/Student');
const Enrollment=require('./models/Enrollment');
const Course=require('./models/Course');

Student.belongsToMany(Course, {
    through:Enrollment,
    foreignKey:"studentId"
});

Course.belongsToMany(Student, {
    through:Enrollment,
    foreignKey:"courseId"
});

async function main(){

    // Database connection
    await sequelize.sync({force:true}); // Drops tables and creates it again

    // Inserting values into students table
    const rahul=await Student.create({ name:"Rahul" });
    const priya=await Student.create({ name:"Priya" });

    // Inserting values into course table
    const node=await Course.create({ name:"Node.js" });
    const react=await Course.create({ name:"React" });
    const sql=await Course.create({ name:"SQL" });
    await Course.create({ name:"C programming" });

    // Create Enrollments table
    await rahul.addCourse(node);
    await priya.addCourse(node);
    await rahul.addCourse(react);
    await rahul.addCourse(sql);

    // Fetching Data of Priya
    const course= await priya.getCourses();
    console.log(course.map(course=>course.toJSON()))

    // Fetching Data of Students in node.js course
    const students=await node.getStudents();
    console.log(students.map(student=>student.toJSON()));

    //Check whether student is enrolled
    const result=await rahul.hasCourse(node);
    console.log(result);

    //
    await rahul.addCourse(node,{
        through:{
            semester:"Sem 5",
            grade:"A",
            status:"active"
        }
    })

}

main();
`,
      run: "node app.js",
      output: "[ { id: 1, name: 'Node.js', ..., Enrollment: { studentId: 2, courseId: 1, semester: null, grade: null, status: null } } ]\n[ { id: 1, name: 'Rahul', ..., Enrollment: { studentId: 1, courseId: 1 } },\n  { id: 2, name: 'Priya', ..., Enrollment: { studentId: 2, courseId: 1 } } ]\ntrue",
      explain: [
        "This is the canonical Week 10 demo (the <code>lab20/advance-Many-to-Many-Associations.js</code> file that should have held it is 0 bytes — never written).",
        "Four <code>addCourse</code> calls build the join table one row at a time — the same rows the hand-drawn notes sketch showed. Note <code>C programming</code> is created but never enrolled: it stays course-less, proving links are optional.",
        "<code>priya.getCourses()</code> returns courses with an <code>Enrollment</code> object hanging off each one — the through-row travels with the result, so the link's own data comes along for free.",
        "<code>rahul.hasCourse(node)</code> prints <code>true</code> — the boolean membership check that would otherwise be a manual SELECT.",
        "The last call re-adds a course Rahul already has, this time with <code>through: { semester, grade, status }</code>. Because the enrolment exists, Sequelize <em>updates</em> the existing row rather than inserting a duplicate — the composite primary key doing its job."
      ]
    },
    {
      title: "through-extras.js: storing a grade ON the link, and reading it back",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("college_db", "root", "", {
  host: "localhost", dialect: "mysql", logging: false
});

const Student = sequelize.define("Student", { name: { type: DataTypes.STRING, allowNull: false } }, { timestamps: false });
const Course = sequelize.define("Course", { name: { type: DataTypes.STRING, allowNull: false } }, { timestamps: false });
const Enrollment = sequelize.define("Enrollment", {
  semester: { type: DataTypes.STRING },
  grade: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING }
}, { timestamps: false });

Student.belongsToMany(Course, { through: Enrollment, foreignKey: "studentId" });
Course.belongsToMany(Student, { through: Enrollment, foreignKey: "courseId" });

async function main() {
  await sequelize.sync({ force: true });
  const rahul = await Student.create({ name: "Rahul" });
  const node = await Course.create({ name: "Node.js" });
  const react = await Course.create({ name: "React" });

  // the last four lines of Advanced_associations/app.js: carry data ON the link
  await rahul.addCourse(node, { through: { semester: "Sem 5", grade: "A", status: "active" } });
  await rahul.addCourse(react);

  const courses = await rahul.getCourses();
  for (const c of courses) {
    console.log(c.name + " -> semester:" + c.Enrollment.semester +
                " grade:" + c.Enrollment.grade + " status:" + c.Enrollment.status);
  }
}
main();
`,
      run: "node through-extras.js",
      output: "Node.js -> semester:Sem 5 grade:A status:active\nReact -> semester:null grade:null status:null",
      explain: [
        "Verified against real MySQL. The <code>through</code> object of <code>addCourse</code> writes straight into the join row — the grade lives on the <em>relationship</em>, which is the only correct place for it.",
        "<code>React</code> was added without a <code>through</code> object, so its link fields are <code>null</code>: enrolment data is optional per link, exactly like any other row.",
        "<code>getCourses()</code> hands back each course with <code>course.Enrollment</code> attached — that nested object is how you reach link-level data when reading.",
        "Same pattern works for any M:N with payload: orders↔products (quantity, priceAtPurchase), users↔roles (grantedAt, grantedBy)."
      ]
    }
  ],
  keyPoints: [
    "When both sides are plural neither table can hold the key — the many-to-many needs a join (through) table with one row per relationship",
    "belongsToMany is declared on both sides, each naming the join table with through and its own column with foreignKey",
    "Sequelize generates the junction table with two INTEGER foreign keys, CASCADE constraints and a composite primary key so a pair cannot be duplicated",
    "Accessors come in sets: addCourse, getCourses, hasCourse, removeCourse, setCourses, countCourses — INSERT, SELECT, DELETE and COUNT on the join table, hidden behind method names",
    "The through option of addCourse stores extra data (semester, grade, status) on the link itself, and getCourses() returns it nested under course.Enrollment",
    "Two real lab bugs: lab20's foreignkey (lowercase k) is ignored by Sequelize and makes sync crash with Duplicate column name 'StudentId'; Advanced_associations declares studentId as STRING where the key is INTEGER"
  ],
  practice: `
    <p>Fix the journal's <code>lab20</code> for real: open
    <code>sorted_files/10_Week-10_Associations/lab20/app.js</code>, change line 8's
    <code>foreignkey</code> to <code>foreignKey</code>, make sure XAMPP's MySQL is running and a
    <code>college_db</code> database exists in phpMyAdmin, then <code>npm i</code> and
    <code>node app.js</code>. You should see <code>Database Synced</code>.</p>
    <p>Then extend the demo: in <code>Advanced_associations/app.js</code> add
    <code>await priya.addCourse(sql, { through: { semester: "Sem 5", grade: "A+", status: "active" } });</code>
    before the fetch, re-run, and confirm Priya's list now has two courses with her SQL grade
    attached.</p>
  `,
  quiz: [
    {
      q: "Why can't a Students table and a Courses table express \"students enrol in courses\" with a single foreign key?",
      options: [
        "Because the tables would be too large",
        "Because both sides are plural — a student has many courses AND a course has many students — so no single column can hold the other side; a join table with one row per pair is required",
        "Because Sequelize does not support foreign keys between those two tables",
        "Because courses have no primary key"
      ],
      answer: 1,
      why: "A foreign key column holds ONE value pointing at ONE parent row. Here each row has many parents, so the link becomes rows in a third table — the join/through table."
    },
    {
      q: "lab20/app.js calls Student.belongsToMany(Course, { through: Enrollment, foreignkey: \"studentId\" }) — lowercase k. What happens?",
      options: [
        "Sequelize accepts it; foreignkey and foreignKey are interchangeable",
        "Sequelize ignores the unknown option and invents StudentId, which on MySQL collides with the declared studentId column, and sync() fails with \"Duplicate column name 'StudentId'\"",
        "The association is skipped entirely and no join table is created",
        "The studentId column is created as a VARCHAR instead of an INTEGER"
      ],
      answer: 1,
      why: "Option names are case-sensitive; an unrecognised one is dropped silently. Sequelize then falls back to its default name StudentId, which MySQL treats as the same column as studentId (column names are case-insensitive) — hence the duplicate-column error at sync time."
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/core-concepts/assocs/",
    "https://sequelize.org/docs/v6/advanced-association-concepts/advanced-many-to-many/"
  ]
});
