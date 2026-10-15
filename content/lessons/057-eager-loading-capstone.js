window.COURSE_LESSONS.push({
  id: "w10-eager-loading-capstone",
  file: "057",
  unit: 2,
  week: 10,
  title: "include() and eager loading",
  kicker: "Unit II · Week 10 · Lesson 4 of 4",
  minutes: 20,
  objectives: [
    "Explain the difference between eager loading (include) and lazy loading (getX), and the N+1 problem in plain language",
    "Use include with a model or an alias, nest includes, and filter the included rows with where and required",
    "Count related rows correctly, and recognise when a query has silently become a Cartesian product",
    "Run all four Unit II labs in the right order and know what each one proves"
  ],
  intro: `
    <p>Last lesson you enrolled Rahul in three courses with <code>addCourse</code> and read them
    back with <code>getCourses()</code>. That worked — but notice what it cost: one call, one
    extra round trip to MySQL, every single time. A page listing 50 students would make 51
    queries.</p>
    <p>This final lesson of Unit II is about doing it in <strong>one</strong> query with
    <code>include()</code>, understanding what Sequelize generates underneath, and knowing when
    the shortcut is quietly making things worse. It ends with the unit capstone: every lab from
    Weeks 7–10, in the order you run them.</p>
  `,
  theory: [
    `
      <h3>Eager vs lazy: two ways to follow a link</h3>
      <p>You already know both, even if the words are new. When <code>priya.getCourses()</code>
      runs, Priya has already been fetched — that method issues a <em>second</em> query for the
      courses. That is <strong>lazy loading</strong>: the related rows are fetched only when you
      ask, one query per ask. It is called lazy because the work is deferred.</p>
      <p><strong>Eager loading</strong> is the opposite: you ask for the related rows
      <em>as part of the original query</em>, so they arrive already joined:</p>
      <pre class="diagram">LAZY                                EAGER
const priya = await ...findOne()    const priya = await ...findOne({
const courses = await priya.getCourses()    include: [Course]
                                    })
--&gt; 2 queries                        --&gt; 1 query, JOINed</pre>
      <p>The journal's <code>sequelize-association-lab/read.js</code> and
      <code>readDept.js</code> were already doing this back in Week 9 — you just did not have a
      name for it. <code>include: Passport</code> is eager loading with an alias-free model.</p>
    `,
    `
      <h3>The N+1 problem, in plain language</h3>
      <p>Imagine printing a class list where each student's courses are shown underneath. With
      lazy loading:</p>
      <pre class="diagram">SELECT * FROM students;                            -- 1 query
SELECT * FROM enrollments WHERE studentId = 1;   -- 2
SELECT * FROM enrollments WHERE studentId = 2;   -- 3
SELECT * FROM enrollments WHERE studentId = 3;   -- 4
...one more per student...                       -- N
lazy:   6 queries for 5 students
eager:  1 query  for 5 students</pre>
      <p>That is the <strong>N+1 problem</strong>: 1 query to fetch N parents, plus N more
      queries for their children. It is the single most common performance bug in applications
      that use ORMs, and it hides easily — each query is fast, there are just far too many of
      them, and each one pays a full network round trip to the database server.</p>
      <p>The fix is always the same: load the children <em>with</em> the parents using
      <code>include</code>, turning N+1 queries into 1. Run the simulation above (example 4) to
      see the counter move.</p>
      <div class="note"><p>Rule of thumb: if you are inside a <code>for</code> or
      <code>map</code> loop and you see <code>await</code>, stop and ask whether the query
      belongs outside the loop. Usually it does.</p></div>
    `,
    `
      <h3>What include actually generates</h3>
      <p>Under the hood <code>include</code> writes a SQL <code>JOIN</code>. Knowing the shape
      helps you predict the result — and the two shapes differ by association type:</p>
      <pre class="diagram">Student.findOne({ include: Passport })
  SELECT s.*, p.id AS "Passport.id", p."passportNumber" AS "Passport.passportNumber", ...
  FROM Students AS s LEFT OUTER JOIN Passports AS p ON s.id = p."StudentId";

Department.findOne({ include: Student })
  ... LEFT OUTER JOIN Students AS st ON d.id = st."DepartmentId";
  --&gt; hasOne  yields ONE nested object   (student.Passport)
  --&gt; hasMany yields an ARRAY            (department.Students)</pre>
      <p>Three details worth internalising:</p>
      <ul>
        <li><strong>The join type is <code>LEFT OUTER</code> by default</strong> — students
        without a passport are still returned, with <code>Passport: null</code>. Set
        <code>required: true</code> to force an inner join that excludes them.</li>
        <li><strong><code>where</code> inside an include flips <code>required</code> on
        automatically.</strong> Sequelize checks <code>include.required = !!include.where</code>
        — so filtering the <em>child</em> silently excludes parents that have no matching child.
        This surprises people; it is documented behaviour, not a bug.</li>
        <li><strong>Aliased associations need the alias in include.</strong> If you declared
        <code>Passport.belongsTo(Department, { as: "issuingDept" })</code>, then
        <code>include: [Department]</code> will not find it — you pass
        <code>{ model: Department, as: "issuingDept" }</code>.</li>
      </ul>
    `,
    `
      <h3>Filtering and counting related rows</h3>
      <p>Once the join is automatic, two follow-up questions come up constantly: "only the
      children matching this condition" and "how many children?".</p>
      <p><strong>Filter with <code>where</code></strong> — on the included model, or on the
      join row itself via <code>through</code>. This is how you ask "which students have grade
      A in Node.js?" in one query (example 6). Because <code>where</code> implies
      <code>required: true</code>, students who never took Node.js drop out of the result.</p>
      <p><strong>Count without loading</strong> — two idioms:</p>
      <ul>
        <li><code>rahul.countCourses()</code> — the <code>count</code> accessor every
        <code>hasMany</code>/<code>belongsToMany</code> installs. One <code>SELECT COUNT(*)</code>,
        returns a number, transfers no rows.</li>
        <li><code>Enrollment.count({ where: { courseId: node.id } })</code> — count the join
        table directly when you want the raw number of links.</li>
        <li>For "count per parent" across many parents, aggregate with
        <code>fn("COUNT", ...)</code> inside <code>findAll</code> plus <code>group</code>
        (example 7) — one query for every parent's count, which is the eager answer to N+1.</li>
      </ul>
    `,
    `
      <h3>Unit II recap: what you can now do</h3>
      <p>Four weeks, one arc — from "how do I talk to a database at all?" to "how do I model a
      whole college in three tables and query it in one statement?":</p>
      <table>
        <thead><tr><th>Week</th><th>Tool</th><th>You can now…</th></tr></thead>
        <tbody>
          <tr><td>7</td><td>Sequelize ORM + MySQL</td><td>install the stack
              (<code>sequelize</code>, <code>mysql2</code>, <code>sequelize-cli</code>), write a
              connection config, <code>authenticate()</code>, and close cleanly</td></tr>
          <tr><td>8</td><td>Models &amp; migrations</td><td>describe a table as a model with
              attributes, types and validations, and version the schema with numbered
              migrations run by <code>sequelize-cli db:migrate</code></td></tr>
          <tr><td>9</td><td>Querying</td><td><code>findAll</code>, <code>findOne</code>,
              <code>findByPk</code>, shape results with <code>where</code>/<code>attributes</code>/
              <code>order</code>/<code>limit</code>, and drop to raw SQL with
              <code>sequelize.query()</code></td></tr>
          <tr><td>10</td><td>Associations</td><td>model 1:1, 1:M and M:N with
              <code>hasOne</code>/<code>belongsTo</code>/<code>hasMany</code>/
              <code>belongsToMany</code>, and pull related rows in one query with
              <code>include</code></td></tr>
        </tbody>
      </table>
      <p>The capstone is not a new project — it is <em>sequence</em>. The journal's three
      association projects only work in order, and each needs something the previous one
      established. Here is the run order, verified against the journal's own config files:</p>
      <pre class="diagram">1. Start XAMPP (MySQL on port 3306) — every lab below fails without it
2. Create the databases in phpMyAdmin: association_db   (Week 8 lab)
                                      college_db        (Week 10 labs)
3. cd sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab
   npm i
   npx sequelize-cli db:migrate     -- creates Departments, Students, Passports
   node create.js                   --&gt; "Student Created"        (1:1 insert)
   node createDept.js               --&gt; "Data Inserted Created"  (1:M insert)
   node read.js                     --&gt; student + nested Passport
   node readDept.js                 --&gt; department + nested Students[]
4. cd ../../10_Week-10_Associations/lab20
   npm i
   node app.js                      --&gt; "Database Synced"        (M:N schema)
5. cd ../Advanced_associations
   npm i
   node app.js                      --&gt; courses, students, true  (M:N demo)</pre>
      <p>Two honest caveats from the journal's own README: the <code>lab20</code> copy inside
      <code>lab20/lab20/</code> is a duplicate of the outer folder (use the outer one), and
      <code>lab20/advance-Many-to-Many-Associations.js</code> is a 0-byte placeholder that was
      never written — the real demo is <code>Advanced_associations/app.js</code>. And the two
      bugs you fixed last lesson still stand: rename <code>foreignkey</code> in
      <code>lab20/app.js</code>, and prefer <code>INTEGER</code> for
      <code>studentId</code> in the Advanced model, before you rely on either.</p>
    `
  ],
  examples: [
    {
      title: "read.js: eager loading a one-to-one with include",
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
        "<code>include: Passport</code> is the whole lesson in one option — the passport arrives nested on the same object, from a single <code>SELECT ... LEFT OUTER JOIN Passports</code>.",
        "Because <code>Student.hasOne(Passport)</code>, the nested value is one object (<code>student.Passport</code>), not an array.",
        "Run <code>create.js</code> first or <code>findOne</code> returns <code>null</code> and the <code>.toJSON()</code> call throws — script order is part of the program.",
        "The <code>emial</code> typo is still in this output, faithfully: the book reproduces the journal's real behaviour rather than tidying it away silently."
      ]
    },
    {
      title: "readDept.js: eager loading a one-to-many (array result)",
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
        "Same <code>include</code> syntax as <code>read.js</code>, but <code>Department.hasMany(Student)</code> makes the nested value an <strong>array</strong> — <code>department.Students</code>.",
        "One query returned the department AND both students; lazy-loading this would take three.",
        "<code>emial: null</code> for both students is the bug from lesson 55 showing up again — <code>createDept.js</code> passed <code>email</code>, which Sequelize dropped.",
        "The <code>LEFT OUTER JOIN</code> means a department with zero students would still be returned, with <code>Students: []</code>."
      ]
    },
    {
      title: "Advanced_associations/app.js: the lazy-loading half of the demo",
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

    await sequelize.sync({force:true});

    const rahul=await Student.create({ name:"Rahul" });
    const priya=await Student.create({ name:"Priya" });

    const node=await Course.create({ name:"Node.js" });
    const react=await Course.create({ name:"React" });
    const sql=await Course.create({ name:"SQL" });
    await Course.create({ name:"C programming" });

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
}

main();
`,
      run: "node app.js",
      output: "[ { id: 1, name: 'Node.js', ..., Enrollment: { studentId: 2, courseId: 1, semester: null, grade: null, status: null } } ]\n[ { id: 1, name: 'Rahul', ..., Enrollment: { studentId: 1, courseId: 1 } },\n  { id: 2, name: 'Priya', ..., Enrollment: { studentId: 2, courseId: 1 } } ]\ntrue",
      explain: [
        "This file is the <strong>lazy</strong> reference implementation: <code>priya.getCourses()</code> and <code>node.getStudents()</code> each issue their own query after the parent was fetched.",
        "Note the accessors work from <em>either</em> side — <code>student.getCourses()</code> and <code>course.getStudents()</code> — because <code>belongsToMany</code> was declared on both models.",
        "Each returned course carries its <code>Enrollment</code> row (semester, grade, status): the through-table data travels with the result even under lazy loading.",
        "<code>rahul.hasCourse(node)</code> returns the boolean <code>true</code> — a membership check that is itself a query. In a loop over 50 students this is exactly where N+1 creeps in."
      ]
    },
    {
      title: "The N+1 problem, simulated in plain JavaScript",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// The N+1 query problem, simulated with plain JavaScript.
const students = ["Rahul", "Priya", "Anil", "Sara", "Vikram"];

// ---- LAZY LOADING: one query for the list, then one MORE per student ----
let queries = 0;
function fakeQuery(sql) { queries++; return sql; }

fakeQuery("SELECT * FROM students");       // query #1
for (const name of students) {
  fakeQuery("SELECT * FROM enrollments WHERE studentId = " + name);  // queries #2..#6
}
console.log("lazy:   " + queries + " queries for " + students.length + " students");

// ---- EAGER LOADING: include() folds it into ONE joined query ----
queries = 0;
fakeQuery("SELECT students.name, enrollments.courseId FROM students " +
          "LEFT JOIN enrollments ON students.id = enrollments.studentId");
console.log("eager:  " + queries + " query  for " + students.length + " students");
`,
      run: "node n-plus-one.js",
      output: "lazy:   6 queries for 5 students\neager:  1 query  for 5 students",
      explain: [
        "No database needed — the point is the arithmetic, not the SQL. One <code>fakeQuery</code> call is one round trip to MySQL.",
        "The lazy version issues 1 + N queries: 6 for 5 students, and it would be 101 for 100. The cost grows with your data, not with your code.",
        "The eager version is always 1 query regardless of student count, because <code>include</code> turns the per-child lookups into a single JOIN.",
        "Double every number for latency: on a real network each round trip also carries connection and parsing overhead the simulation flatters."
      ]
    },
    {
      title: "Eager loading a many-to-many: Student with their Courses",
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
const Enrollment = sequelize.define("Enrollment", {}, { timestamps: false });

Student.belongsToMany(Course, { through: Enrollment, foreignKey: "studentId" });
Course.belongsToMany(Student, { through: Enrollment, foreignKey: "courseId" });

async function main() {
  // ONE query returns every student AND their courses — the include() upgrade
  // over Advanced_associations/app.js's per-student getCourses().
  const students = await Student.findAll({ include: [Course] });
  for (const s of students) {
    console.log(s.name + ": " + s.Courses.map(c => c.name).join(", "));
  }
}
main();
`,
      run: "node include-many-to-many.js",
      output: "Rahul: Node.js, React, SQL\nPriya: Node.js",
      explain: [
        "Run the journal's <code>Advanced_associations/app.js</code> first — this script reads the same <code>college_db</code> data it seeded, so the names match exactly.",
        "Same data as the journal's lazy demo, same order, but <strong>one</strong> query instead of one-plus-many: <code>include: [Course]</code> follows the <code>belongsToMany</code> declared on Student.",
        "Sequelize joins Students → Enrollments → Courses and nests the result: <code>student.Courses</code> is an array, mirroring <code>hasMany</code>.",
        "You pass the <em>target model</em> here, not the through model — Sequelize already knows the path because you told it <code>through: Enrollment</code>.",
        "Replace the loop's <code>getCourses()</code> calls in the journal file with this pattern and the N+1 counter from example 4 drops to 1."
      ]
    },
    {
      title: "include with where: filter the child rows inside the join",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("college_db", "root", "", {
  host: "localhost", dialect: "mysql", logging: false
});

const Student = sequelize.define("Student", { name: { type: DataTypes.STRING, allowNull: false } });
const Course = sequelize.define("Course", { name: { type: DataTypes.STRING, allowNull: false } });
const Enrollment = sequelize.define("Enrollment", {
  semester: { type: DataTypes.STRING },
  grade: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING }
});

Student.belongsToMany(Course, { through: Enrollment, foreignKey: "studentId" });
Course.belongsToMany(Student, { through: Enrollment, foreignKey: "courseId" });

async function main() {
  await sequelize.sync({ force: true });   // seed with DIFFERENT grades on purpose
  const rahul = await Student.create({ name: "Rahul" });
  const priya = await Student.create({ name: "Priya" });
  const node = await Course.create({ name: "Node.js" });
  await rahul.addCourse(node, { through: { grade: "A" } });
  await priya.addCourse(node, { through: { grade: "B" } });

  // "Which students have grade A in Node.js?" — one query.
  // where on the include turns required on automatically (INNER JOIN).
  const students = await Student.findAll({
    include: [{
      model: Course,
      required: true,
      where: { name: "Node.js" },
      through: { where: { grade: "A" } }
    }]
  });
  console.log("students with grade A in Node.js:",
    students.map(s => s.name).join(", "));
}
main();
`,
      run: "node include-where.js",
      output: "students with grade A in Node.js: Rahul",
      explain: [
        "Seeded on purpose so the filter has something to reject: Rahul is graded A and Priya graded B in the same course.",
        "Two filters in one JOIN: the <code>where</code> on Course narrows the joined courses, and <code>through.where</code> narrows the <em>join rows</em> by grade — the link-level data paying off.",
        "Verified against real MySQL: Priya is excluded because her Enrollments row fails the through filter, even though she IS enrolled in Node.js.",
        "<code>required: true</code> makes it an INNER JOIN. It is also the default the moment a <code>where</code> is present — Sequelize sets <code>required = !!where</code> — so writing it here is documentation, not necessity.",
        "Leave <code>where</code> off and set <code>required: false</code> for a LEFT JOIN: every student appears, with <code>Courses: []</code> for those enrolled in nothing."
      ]
    },
    {
      title: "Counting related rows: one query for every parent's total",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("college_db", "root", "", {
  host: "localhost", dialect: "mysql", logging: false
});

const Student = sequelize.define("Student", { name: { type: DataTypes.STRING, allowNull: false } });
const Course = sequelize.define("Course", { name: { type: DataTypes.STRING, allowNull: false } });
const Enrollment = sequelize.define("Enrollment", {}, { timestamps: false });

Student.belongsToMany(Course, { through: Enrollment, foreignKey: "studentId" });
Course.belongsToMany(Student, { through: Enrollment, foreignKey: "courseId" });

async function main() {
  await sequelize.sync({ force: true });   // seed, so the counts mean something
  const rahul = await Student.create({ name: "Rahul" });
  const priya = await Student.create({ name: "Priya" });
  const node = await Course.create({ name: "Node.js" });
  const react = await Course.create({ name: "React" });
  const sql = await Course.create({ name: "SQL" });
  await rahul.addCourse(node); await priya.addCourse(node);
  await rahul.addCourse(react); await rahul.addCourse(sql);

  // per-row count, no include needed at all
  console.log("Rahul's courses:", await rahul.countCourses());

  // counts from the join table directly
  console.log("students in Node.js:",
              await Enrollment.count({ where: { courseId: node.id } }));

  // EVERY student's count in ONE grouped query — the eager answer to N+1
  const counts = await Student.findAll({
    attributes: ["name", [Sequelize.fn("COUNT", Sequelize.col("Courses.id")), "courses"]],
    include: [{ model: Course, attributes: [] }],
    group: ["Student.id"]
  });
  // the alias "courses" is not a model attribute: read it with .get(), not with a dot
  console.log(counts.map(c => c.name + "=" + c.get("courses")).join(", "));
}
main();
`,
      run: "node count-related.js",
      output: "Rahul's courses: 3\nstudents in Node.js: 2\nRahul=3, Priya=1",
      explain: [
        "Three idioms, three costs: <code>countCourses()</code> is one COUNT for one student; <code>Enrollment.count()</code> counts raw link rows; the grouped <code>findAll</code> gets every student's total in a single query.",
        "The grouped query is the pattern that kills the counting version of N+1 — no loop, no per-student COUNT.",
        "<code>attributes: []</code> on the included Course means \"join it, but return none of its columns\" — we only want it there to be counted.",
        "<strong>Watch the alias:</strong> <code>c.courses</code> is <code>undefined</code> because <code>courses</code> is a SQL alias, not an attribute the model declares. Read it with <code>c.get(\"courses\")</code> — we checked, and only <code>.get()</code> and <code>toJSON()</code> see it.",
        "<code>Sequelize.fn</code>/<code>Sequelize.col</code> are the escape hatch from Week 9's raw-SQL lesson back into the query builder: a SQL function, spelled in JavaScript."
      ]
    },
    {
      title: "The Unit II run sequence, end to end",
      from: "new",
      file: "",
      lang: "bash",
      code: `
# ---- Unit II capstone: run every lab in the right order ----

# 0. XAMPP must be running (MySQL on 3306). Create both databases in phpMyAdmin:
#      association_db      and      college_db

# 1. Week 8/10 1:1 + 1:M lab
cd sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab
npm i
npx sequelize-cli db:migrate
node create.js        # -> Student Created
node createDept.js    # -> Data Inserted Created
node read.js          # -> student + nested Passport
node readDept.js      # -> department + nested Students[]

# 2. Week 10 M:N schema check (after fixing "foreignkey" -> "foreignKey"!)
cd ../../10_Week-10_Associations/lab20
npm i
node app.js           # -> Database Synced

# 3. Week 10 M:N full demo
cd ../Advanced_associations
npm i
node app.js           # -> courses for Priya, students in Node.js, true
`,
      run: "npx sequelize-cli db:migrate   (first command of the block, run inside sequelize-association-lab)",
      output: "node create.js  -> Student Created\nnode read.js    -> { id: 1, name: 'Roger', ..., Passport: { ... } }\nnode app.js     -> Database Synced\nnode app.js     -> [ { name: 'Node.js', Enrollment: {...} } ] / [ Rahul, Priya ] / true",
      explain: [
        "The journal's README says it plainly: the 1:1/1:M work runs in <code>sequelize-association-lab</code>, the M:N work in <code>lab20</code> or <code>Advanced_associations</code> — and each needs MySQL plus its own <code>npm i</code>.",
        "Order matters twice over: migrations before the create/read scripts (the tables must exist), and the scripts within each lab in the printed order (readers depend on rows the creators inserted).",
        "Each project has its own <code>config</code> pointing at its own database — <code>association_db</code> for the Week 8 lab, <code>college_db</code> for the Week 10 labs. Mixing them up gives a confusing \"table doesn't exist\" error.",
        "Before step 2, apply the two fixes from lesson 56 (<code>foreignkey</code> → <code>foreignKey</code>, <code>studentId</code> → INTEGER) — otherwise step 2 crashes with \"Duplicate column name 'StudentId'\".",
        "The <code>lab20/lab20/</code> subfolder is an exact duplicate of the outer one, and <code>advance-Many-to-Many-Associations.js</code> is 0 bytes — the real demo is <code>Advanced_associations/app.js</code>."
      ]
    }
  ],
  keyPoints: [
    "Lazy loading (getX) issues one extra query per parent; eager loading (include) folds related rows into the original query as a SQL JOIN",
    "The N+1 problem is 1 query for N parents plus N queries for their children — the most common ORM performance bug; include() collapses it back to one query",
    "hasOne/belongsTo includes nest ONE object, hasMany/belongsToMany includes nest an ARRAY; the join is a LEFT OUTER JOIN unless required is set",
    "A where inside an include flips required to true automatically, so filtering the child excludes parents with no matching child — documented behaviour, not a bug",
    "Count with the countCourses() accessor, Enrollment.count({ where }), or a grouped fn(\"COUNT\") findAll for every parent's total in one query",
    "Unit II capstone: XAMPP up, association_db and college_db created, then sequelize-association-lab (migrate → create → read) before lab20 and Advanced_associations (npm i → node app.js)"
  ],
  practice: `
    <p>Follow the run sequence above from top to bottom and keep the console output next to
    each command — if any line differs from the printed expectation, stop and diagnose before
    moving on. The two most likely failures: MySQL is not running (XAMPP), or
    <code>lab20/app.js</code> still has the <code>foreignkey</code> typo.</p>
    <p>Then convert the journal's lazy demo to eager: in
    <code>Advanced_associations/app.js</code> replace the <code>priya.getCourses()</code> call
    with a single <code>Student.findAll({ include: [Course] })</code> (example 5) and confirm
    you get the same names from one query instead of three.</p>
  `,
  quiz: [
    {
      q: "What is the N+1 problem, and what is the standard fix?",
      options: [
        "Running the same query twice by accident; the fix is a transaction",
        "Fetching N parents with one query and then each parent's children with one query each (N+1 total); the fix is include() so the children arrive in the original joined query",
        "A bug in Sequelize where include() returns N copies; the fix is limit",
        "Having N models and 1 migration; the fix is one migration per model"
      ],
      answer: 1,
      why: "N+1 means 1 query for the list plus one query per row inside a loop. include() turns the per-row lookups into a single JOIN, so 5 students cost 1 query instead of 6."
    },
    {
      q: "You write Student.findAll({ include: [{ model: Course, where: { name: \"Node.js\" } }] }). What happens to students who are NOT enrolled in Node.js?",
      options: [
        "They are returned with Course: null",
        "They are returned with Courses: []",
        "They are excluded, because a where inside an include sets required: true and turns the LEFT JOIN into an INNER JOIN",
        "Sequelize throws an error — where is not allowed inside include"
      ],
      answer: 2,
      why: "Sequelize sets include.required = !!include.where, so any where on the included model forces an INNER JOIN: parents without a matching child drop out of the result. Use required: false explicitly if you want the LEFT JOIN behaviour back."
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/core-concepts/assocs/",
    "https://sequelize.org/docs/v6/core-concepts/model-querying-basics/",
    "https://sequelize.org/docs/v6/advanced-association-concepts/advanced-many-to-many/"
  ]
});
