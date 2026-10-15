window.COURSE_LESSONS.push({
  id: "w08-attributes-validations",
  file: "045",
  unit: 2,
  week: 8,
  title: "Attributes, data types and validations",
  kicker: "Unit II · Week 8 · Lesson 2 of 5",
  minutes: 18,
  objectives: [
    "Map every Sequelize data type to the MySQL column type it produces",
    "Apply the common column options: allowNull, unique, defaultValue and timestamps",
    "Write validations (notNull, isEmail, len, min/max) and read the error they raise",
    "Diagnose the journal's emial/email column bug and fix it in every file"
  ],
  intro: `
    <p>Last lesson a model was a class bound to a table — <code>sequelize.define('User', {
    ... })</code>. The empty braces in that sentence are the whole of today: what exactly goes
    <em>inside</em> an attribute, and how you make Sequelize refuse to store rubbish before a
    single byte reaches MySQL.</p>
    <p>We stay on the connection you built in Week 7, but you will barely notice it: a model's
    attributes and validations are pure JavaScript, and by the end of the lesson you will be
    testing bad data with <code>build()</code> and <code>validate()</code> <em>without any
    database running at all</em>. Everything is taught from the journal's own
    <code>user.js</code>, <code>student.js</code> and migration files — including the
    <code>emial</code> typo that survived into the lab.</p>
  `,
  theory: [
    `
      <h3>Attributes: columns, and the SQL type behind each one</h3>
      <p>An <strong>attribute</strong> is one key of the object you pass to
      <code>define()</code> (or <code>init()</code>). At minimum it names a
      <code>type</code>, and the type is what decides the MySQL column type. Sequelize's
      <code>DataTypes</code> are portable names; here is the mapping that MySQL actually
      receives (generated with Sequelize 6.37.8 — example 4 shows the real statement):</p>
      <table>
        <thead><tr><th>Sequelize type</th><th>MySQL column</th><th>Use it for</th></tr></thead>
        <tbody>
          <tr><td><code>DataTypes.STRING</code></td><td><code>VARCHAR(255)</code></td><td>names, emails, codes</td></tr>
          <tr><td><code>DataTypes.STRING(50)</code></td><td><code>VARCHAR(50)</code></td><td>short strings, a length limit</td></tr>
          <tr><td><code>DataTypes.TEXT</code></td><td><code>TEXT</code></td><td>long articles, comments</td></tr>
          <tr><td><code>DataTypes.INTEGER</code></td><td><code>INTEGER</code></td><td>ages, counts, ids</td></tr>
          <tr><td><code>DataTypes.FLOAT</code></td><td><code>FLOAT</code></td><td>approximate decimals</td></tr>
          <tr><td><code>DataTypes.DOUBLE</code></td><td><code>DOUBLE PRECISION</code></td><td>precise large decimals</td></tr>
          <tr><td><code>DataTypes.DECIMAL(10,2)</code></td><td><code>DECIMAL(10,2)</code></td><td>money — exact to 2 decimals</td></tr>
          <tr><td><code>DataTypes.BOOLEAN</code></td><td><code>TINYINT(1)</code></td><td>flags, is-active</td></tr>
          <tr><td><code>DataTypes.DATE</code></td><td><code>DATETIME</code></td><td>instants: createdAt, birthdays-with-time</td></tr>
          <tr><td><code>DataTypes.DATEONLY</code></td><td><code>DATE</code></td><td>calendar dates with no time</td></tr>
          <tr><td><code>DataTypes.BIGINT</code></td><td><code>BIGINT</code></td><td>huge counters</td></tr>
        </tbody>
      </table>
      <p>Two habits worth building: reach for <code>DECIMAL</code> whenever the number is money
      (floating point rounding is a real bug factory), and remember
      <code>STRING(n)</code> when 255 characters is too generous.</p>
    `,
    `
      <h3>Column options: the flags beside the type</h3>
      <p>Type is only the start. The options the journal actually uses, in the order you will
      meet them:</p>
      <ul>
        <li><code>allowNull: false</code> — the column is required. Two effects: the generated
        <code>CREATE TABLE</code> adds <code>NOT NULL</code>, and Sequelize raises a
        <em>validation</em> error when the value is missing.</li>
        <li><code>unique: true</code> — no two rows may share the value. This one is a real
        database constraint (in MySQL: a unique index), so it also protects you against other
        programs writing to the same table.</li>
        <li><code>defaultValue</code> — used when a value is not supplied.</li>
        <li><code>primaryKey</code> / <code>autoIncrement</code> — Sequelize already gives every
        model an <code>id INTEGER NOT NULL auto_increment PRIMARY KEY</code>; you only write
        these when you want a different key.</li>
      </ul>
      <p>Then there is the model-level switch <code>timestamps</code>, on by default: every
      table gains <code>createdAt</code> and <code>updatedAt</code> <code>DATETIME NOT NULL</code>
      columns that Sequelize fills in on every <code>create()</code> and <code>save()</code>.
      Lab16 switches them off with <code>timestamps: false</code>; proj-2408023 leaves them on,
      and its migration even gives them <code>defaultValue: Sequelize.fn('NOW')</code>. Neither
      is wrong — but the model and the migration must agree, or the two definitions drift.</p>
    `,
    `
      <h3>Validations: rules run in JavaScript, before the SQL</h3>
      <p>A <strong>validation</strong> is a check Sequelize performs on the instance before it
      builds an <code>INSERT</code>. It lives inside the attribute under
      <code>validate</code>, and the built-ins cover most needs:</p>
      <table>
        <thead><tr><th>Validation</th><th>Meaning</th><th>Journal example</th></tr></thead>
        <tbody>
          <tr><td><code>isEmail: true</code></td><td>value must look like an email</td><td>proj <code>user.js</code> email</td></tr>
          <tr><td><code>len: [3, 50]</code></td><td>string length between 3 and 50</td><td>proj <code>user.js</code> username</td></tr>
          <tr><td><code>min: 0, max: 100</code></td><td>numeric range</td><td>proj <code>user.js</code> age</td></tr>
          <tr><td><code>isInt</code>, <code>isIn</code>, <code>isUrl</code>, …</td><td>other shapes</td><td>not used in the journal</td></tr>
        </tbody>
      </table>
      <p>Validation failures throw a <code>SequelizeValidationError</code> whose message lists
      every broken rule (all four outputs in example 5 were produced with Sequelize 6.37.8):</p>
      <pre>Validation error: Validation isEmail on email failed
Validation error: Validation len on username failed
Validation error: Validation max on age failed
notNull Violation: User.username cannot be null</pre>
      <p>Two things beginners get wrong, so say them out loud:</p>
      <ul>
        <li><strong>Validations are not constraints.</strong> <code>isEmail</code> lives in
        Node; someone inserting rows from phpMyAdmin bypasses it completely. Constraints
        (<code>allowNull: false</code> → <code>NOT NULL</code>, <code>unique</code>) live in
        MySQL and hold for everyone. Use both; Week 9 digs into the difference.</li>
        <li><strong>You can run them alone.</strong> <code>await instance.validate()</code>
        needs no database — building an object and checking it is a pure JavaScript operation.
        That is why example 5 runs with MySQL switched off.</li>
      </ul>
      <p>And when the built-ins are not enough, <code>validate</code> also takes plain
      functions — a <strong>custom validator</strong>. Example 6 writes one for a positive
      price.</p>
    `,
    `
      <h3>Spot the bug: the emial column</h3>
      <p>The association lab defines its student columns as
      <code>{ name: DataTypes.STRING, emial: DataTypes.STRING }</code>, and migration 2 builds
      a matching <code>emial VARCHAR(255)</code>. So far so consistent — and so consistently
      misspelled. The damage appears when code uses the <em>correct</em> spelling:
      <code>createDept.js</code> calls
      <code>Student.create({ name: 'Rohit', email: 'rohit@gmail.com', ... })</code>.</p>
      <div class="warn">
        <strong>Sequelize silently ignores attributes your model does not declare.</strong> There
        is no warning and no error: <code>email</code> is not an attribute of Student, so it
        never reaches the <code>INSERT</code>, and the row is stored with
        <code>emial = NULL</code>. Run example 7 and watch the key vanish from
        <code>dataValues</code>. This is the sneakiest bug in the whole unit — the script prints
        <code>Data Inserted Created</code> and looks like it worked.
      </div>
      <p>The fix is boring and complete: rename the column in <strong>both</strong> places that
      define it — <code>models/student.js</code> and <code>migrations/2-create-student.js</code>
      (or write a fresh migration that renames the column in an existing database) — and then
      every script that already says <code>email</code> simply works.</p>
    `
  ],
  examples: [
    {
      title: "proj-2408023/models/user.js: attributes and validations, read closely",
      from: "journal",
      file: "sorted_files/07_Week-07_Sequelize-MySQL/proj-2408023/models/user.js",
      lang: "javascript",
      code: `
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
    },
  },
  age: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 100,
    },
  },
});
`,
      explain: [
        "Excerpt of the journal's file (the email and password columns are identical in spirit — open the real file to see all four).",
        "<code>username</code> stacks four concerns on one column: type <code>VARCHAR(255)</code>, required (<code>allowNull: false</code>), one-of-a-kind (<code>unique: true</code>) and a length rule (<code>len: [3, 50]</code>).",
        "<code>age</code> shows the other half: a plain <code>INTEGER</code> with no null restriction — omitting it is fine — but a range rule if you do pass it.",
        "<code>validate</code> is checked by Node before any SQL is built; a bad value stops the script with <code>SequelizeValidationError</code> (example 5 prints the exact messages)."
      ]
    },
    {
      title: "sequelize-association-lab/models/student.js: two columns, one typo",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/models/student.js",
      lang: "javascript",
      code: `
  Student.init({
    name: DataTypes.STRING,
    emial: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Student',
    timestamps:false
  });
  return Student;
`,
      explain: [
        "The shorthand form: <code>DataTypes.STRING</code> alone means \"a STRING column with every option left at its default\" — nullable, unvalidated, 255 characters.",
        "<code>emial</code> is the column name that will really exist in MySQL. Note there is no <code>validate</code> block at all here, so nothing checks the value's shape.",
        "<code>timestamps: false</code> — no <code>createdAt</code>/<code>updatedAt</code> columns on this table.",
        "Everything that later says <code>email</code> instead of <code>emial</code> is silently ignored by Sequelize — the bug this lesson is named after, waiting in the next example."
      ]
    },
    {
      title: "sequelize-association-lab/migrations/2-create-student.js: the same columns from the database side",
      from: "journal",
      file: "sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab/migrations/2-create-student.js",
      lang: "javascript",
      code: `
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
`,
      explain: [
        "In migrations the type namespace is <code>Sequelize.STRING</code> (the <code>Sequelize</code> class passed into <code>up</code>), not <code>DataTypes.STRING</code> — same types, different alias.",
        "<code>id</code> is spelled out here on purpose: MySQL will create <code>id INTEGER NOT NULL auto_increment PRIMARY KEY</code>.",
        "<code>emial</code> appears in the migration too — so the typo is baked into the schema, not just the model. Fixing only one file would break the pair.",
        "<code>references: { model: 'Departments', key: 'id' }</code> is a foreign key; Week 10 explains relationships, today just read it as \"this column points at another table\".",
        "The result in MySQL: <code>CREATE TABLE IF NOT EXISTS `Students` (`id` INTEGER NOT NULL auto_increment, `name` VARCHAR(255), `emial` VARCHAR(255), `departmentId` INTEGER, PRIMARY KEY (`id`), FOREIGN KEY (`departmentId`) REFERENCES `Departments` (`id`)) ENGINE=InnoDB;</code>."
      ]
    },
    {
      title: "What Sequelize turns your types into",
      from: "new",
      file: "",
      lang: "sql",
      code: `
CREATE TABLE IF NOT EXISTS \`type_demo\` (
  \`name\`      VARCHAR(255),
  \`shortCode\` VARCHAR(10),
  \`bio\`       TEXT,
  \`age\`       INTEGER,
  \`price\`     FLOAT,
  \`salary\`    DECIMAL(10,2),
  \`active\`    TINYINT(1),
  \`bornAt\`    DATETIME,
  \`bornOn\`     DATE
) ENGINE=InnoDB;
`,
      explain: [
        "The real statement Sequelize 6.37.8 generated from a model using <code>STRING, STRING(10), TEXT, INTEGER, FLOAT, DECIMAL(10,2), BOOLEAN, DATE, DATEONLY</code>.",
        "<code>STRING</code> with no length becomes <code>VARCHAR(255)</code>; <code>STRING(10)</code> becomes <code>VARCHAR(10)</code> — the argument is the max length.",
        "<code>BOOLEAN</code> is <code>TINYINT(1)</code> in MySQL: the database stores 0/1, Sequelize converts to and from JavaScript <code>true</code>/<code>false</code>.",
        "<code>DATE</code> → <code>DATETIME</code> (a moment, including time) while <code>DATEONLY</code> → <code>DATE</code> (a calendar day). Getting this wrong is a classic timezone bug.",
        "Money as <code>DECIMAL(10,2)</code>: exactly 10 digits, 2 after the point — no floating-point rounding."
      ]
    },
    {
      title: "Validations running without a database",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize, DataTypes, Model } = require('sequelize');

// build() + validate() never open a connection - MySQL may be switched off.
const sequelize = new Sequelize('nishant', 'root', '', { dialect: 'mysql', logging: false });

class User extends Model {}
User.init({
  username: { type: DataTypes.STRING, allowNull: false, validate: { len: [3, 50] } },
  email:    { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  age:      { type: DataTypes.INTEGER, validate: { min: 0, max: 100 } },
}, { sequelize, modelName: 'User', timestamps: false });

async function check(label, values) {
  try {
    await User.build(values).validate();
    console.log(label, '=> VALID');
  } catch (e) {
    e.errors.forEach(x => console.log(label, '=>', x.message));
  }
}

(async () => {
  await check('bad email     ', { username: 'abcd', email: 'not-an-email', password: 'x', age: 20 });
  await check('short username', { username: 'ab',   email: 'a@b.com',     password: 'x', age: 20 });
  await check('age 150       ', { username: 'abcd', email: 'a@b.com',     password: 'x', age: 150 });
  await check('missing name  ', { email: 'a@b.com', password: 'x', age: 20 });
})();
`,
      explain: [
        "This is proj-2408023's model, rewritten self-contained so you can run it anywhere with <code>npm i sequelize</code>. Same rules, same messages.",
        "<code>User.build(values)</code> makes an instance in memory; <code>validate()</code> runs every rule and returns a promise that rejects if any fail.",
        "<code>e.errors</code> is an array — one entry per broken rule — so a form can show every problem at once instead of the first only.",
        "<code>allowNull: false</code> failing is not phrased as \"validation\" but as <code>notNull Violation: User.username cannot be null</code> — same mechanism, different wording."
      ],
      run: "node validate-demo.js",
      output: "bad email      => Validation isEmail on email failed\nshort username => Validation len on username failed\nage 150        => Validation max on age failed\nmissing name   => User.username cannot be null"
    },
    {
      title: "A custom validator, when the built-ins run out",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('shop_db', 'root', '', { dialect: 'mysql', logging: false });

class Product extends Model {}
Product.init({
  name: { type: DataTypes.STRING, allowNull: false },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      isPositive(value) {                       // name it anything you like
        if (value <= 0) {
          throw new Error('price must be greater than 0');
        }
      }
    }
  }
}, { sequelize, modelName: 'Product', timestamps: false });

(async () => {
  for (const price of [-5, 0, 99]) {
    try {
      await Product.build({ name: 'Pen', price }).validate();
      console.log('price', price, '=> VALID');
    } catch (e) {
      console.log('price', price, '=>', e.message);
    }
  }
})();
`,
      explain: [
        "A custom validator is just a method: it receives the value, and it throws to reject it. Anything you can express in JavaScript, you can enforce.",
        "The thrown message becomes the user-facing validation message — write it for a human, not for yourself at 2 a.m.",
        "Throwing inside the validator produces <code>SequelizeValidationError</code> like the built-ins, so your <code>catch</code> blocks do not change.",
        "Same rule without Sequelize: <code>if (price <= 0) throw ...</code> in your route handler. The model puts the rule next to the column, where the next developer will find it."
      ],
      run: "node price-demo.js",
      output: "price -5 => Validation error: price must be greater than 0\nprice 0 => Validation error: price must be greater than 0\nprice 99 => VALID"
    },
    {
      title: "The silent drop: an unknown attribute never reaches the table",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('association_db', 'root', '', { dialect: 'mysql', logging: false });

class Student extends Model {}
Student.init({
  name: DataTypes.STRING,
  emial: DataTypes.STRING        // the typo, exactly as the lab has it
}, { sequelize, modelName: 'Student', timestamps: false });

// This is what createDept.js asks for:
const rohit = Student.build({ name: 'Rohit', email: 'rohit@gmail.com' });

console.log('dataValues :', JSON.stringify(rohit.dataValues));
console.log('rohit.email:', rohit.email);
console.log('rohit.emial:', rohit.emial);
`,
      explain: [
        "<code>email</code> is not a declared attribute, so Sequelize drops it during <code>build()</code> — no warning, no exception.",
        "The stored row will be <code>{ id, name: 'Rohit', emial: NULL }</code>: the script \"succeeds\" and the data is quietly missing. That is why this bug is worth a whole page.",
        "The fix: rename the attribute to <code>email</code> in <code>models/student.js</code> <em>and</em> in <code>migrations/2-create-student.js</code>.",
        "Rule of thumb: if a value seems to vanish, print <code>instance.dataValues</code> immediately — the keys tell you exactly which columns Sequelize recognised."
      ],
      run: "node typo-demo.js",
      output: "dataValues : {\"id\":null,\"name\":\"Rohit\"}\nrohit.email: undefined\nrohit.emial: undefined"
    }
  ],
  keyPoints: [
    "Attributes are columns: DataTypes.STRING→VARCHAR(255), TEXT→TEXT, INTEGER→INTEGER, BOOLEAN→TINYINT(1), DATE→DATETIME, DATEONLY→DATE, DECIMAL(10,2)→DECIMAL(10,2)",
    "allowNull:false and unique:true become real MySQL constraints (NOT NULL, unique index); validate rules are JavaScript that only runs through Sequelize",
    "Built-in validations: isEmail, len:[min,max], min/max, plus custom functions that throw on bad values",
    "instance.validate() rejects with SequelizeValidationError listing every broken rule — and it needs no database at all",
    "Sequelize silently ignores keys your model does not declare: the lab's emial/email typo stores NULL emails while every script prints success"
  ],
  practice: `
    <p>Repair the lab's typo end to end. In
    <code>sorted_files/08_Week-08_Models-Migrations/sequelize-association-lab</code>, copy the
    project to a scratch folder, rename <code>emial</code> to <code>email</code> in
    <code>models/student.js</code> and in <code>migrations/2-create-student.js</code>, and grep
    the folder for <code>emial</code> until nothing remains.</p>
    <p>Then check your model without a database, using the same trick as example 5:
    <code>node -e "const {Student}=require('./models'); console.log(Object.keys(Student.rawAttributes))"</code>
    after <code>npm i</code> — you want <code>[ 'id', 'name', 'email', 'DepartmentId' ]</code>.
    Now <code>createDept.js</code>'s two students will keep their email addresses instead of
    storing NULL.</p>
  `,
  quiz: [
    {
      q: "A model declares `age: { type: DataTypes.INTEGER, validate: { min: 0, max: 100 } }` and you call `User.create({ age: 150, ... })`. What happens?",
      options: [
        "The row is inserted with 150 and a warning is logged",
        "Sequelize throws SequelizeValidationError (Validation max on age failed) before any SQL runs; nothing is inserted",
        "MySQL truncates the value to 100",
        "The connection is closed to protect the data"
      ],
      answer: 1,
      why: "Validations run in JavaScript while the instance is being prepared — the INSERT is never built, so the table never sees 150."
    },
    {
      q: "Why does the lab's `Student.create({ name: 'Rohit', email: 'rohit@gmail.com' })` store a NULL email without any error?",
      options: [
        "MySQL rejects emails that are not in its dictionary",
        "The string is too short for VARCHAR(255)",
        "Sequelize drops attributes the model does not declare, and the model declares `emial` — so `email` never reaches the INSERT",
        "email is a reserved word in MySQL and must be escaped"
      ],
      answer: 2,
      why: "Unknown keys are silently ignored at build time. Rename the column in the model and its migration (or add a renaming migration) and the same script stores the address correctly."
    }
  ],
  sources: [
    "https://sequelize.org/docs/v6/core-concepts/model-basics/#data-types",
    "https://sequelize.org/docs/v6/core-concepts/validations-and-constraints/"
  ]
});
