window.COURSE_LESSONS.push({
  id: "p03-javascript-essentials",
  file: "003",
  unit: 0,
  week: 0,
  title: "JavaScript essentials from scratch",
  kicker: "Preface · Lesson 3 of 4",
  minutes: 20,
  objectives: [
    "Declare variables with let and const and identify the basic types with typeof",
    "Write functions that take parameters and return values, and read the journal's 02_functions.js",
    "Use arrays, objects, arrow functions, template literals, destructuring and spread"
  ],
  intro: `
    <p>In the last lesson you installed Node.js, npm, VS Code and MySQL, and you proved each one
    works. Now it is time to learn the language itself — or rather, the slice of JavaScript this
    course actually uses. Every Node script, Sequelize query and React component from here on is
    built from the pieces in this chapter.</p>
    <p>We start with variables and types, move through functions (including the journal's own
    <code>02_functions.js</code>), and finish with the modern shorthand — arrows, template
    literals, destructuring and spread — that you will read every day in the journal code.</p>
  `,
  theory: [
    `
      <h3>Values, variables and the const/let question</h3>
      <p>A <strong>value</strong> is a piece of data: the text <code>"Nishant"</code>, the number
      <code>2408023</code>, the truth value <code>true</code>. A <strong>variable</strong> is a
      labelled box you keep a value in so you can use it later. You create one with
      <code>let</code> or <code>const</code>:</p>
      <pre class="diagram">  const PI = 3.14;   // const: the box contents never change (no reassignment)
  let  roll = 2408023; // let:  you may reassign later (roll = 2408024 is legal)</pre>
      <p>The journal's own Week 1 notes end with the teacher's question
      <em>"what is the difference between const, let and var"</em> — here is the answer. Use
      <strong><code>const</code> by default</strong>; the JavaScript engine will refuse a
      reassignment, which catches bugs before they run. Use <strong><code>let</code></strong> when
      the value genuinely changes (a counter, a running total). <strong><code>var</code></strong> is
      the older form with looser scoping rules — you will meet it in legacy code, but modern
      JavaScript (and this book) avoids it.</p>
      <p>A <strong>scope</strong> is simply "where a variable is visible": <code>let</code> and
      <code>const</code> live inside the nearest { curly braces }, which is why you can reuse the
      same name in two different blocks without conflict.</p>
    `,
    `
      <h3>Types: what kind of value is that?</h3>
      <p>Every value has a <strong>type</strong>. The ones you need are
      <code>string</code> (text), <code>number</code> (integers and decimals alike),
      <code>boolean</code> (<code>true</code>/<code>false</code>), <code>undefined</code> (declared
      but never given a value), <code>null</code> (deliberately empty), and <code>object</code>
      (which also covers arrays and functions). The operator <code>typeof x</code> asks a value what
      it is.</p>
      <p>Types matter because JavaScript converts between them, sometimes surprisingly. Reading the
      command line always gives you <em>text</em> — even <code>"95"</code> is a string — so the
      journal's grade checker forces a number with <code>Number(process.argv[6])</code> before
      comparing with <code>&gt;=</code>. Without that conversion you would be comparing text to
      numbers, and <code>"9" &gt;= 100</code> is <code>true</code> in JavaScript (string
      comparison) — a classic beginner trap.</p>
    `,
    `
      <h3>Functions: names for behaviour</h3>
      <p>A <strong>function</strong> is a block of code with a name, written once and called as
      often as you like. The values you hand it are <strong>parameters</strong>; what it gives back
      is the <strong>return value</strong>. There are two very different styles in the journal, and
      telling them apart is the single most useful reading skill for this course:</p>
      <ul>
        <li><strong>Print functions</strong> — like <code>greet()</code> in
        <code>02_functions.js</code>: they call <code>console.log</code> and return
        <code>undefined</code>. Their effect is the output.</li>
        <li><strong>Calculate functions</strong> — like <code>cal.js</code>'s <code>add(a, b)</code>:
        they <code>return</code> a value and print nothing. Their effect is the value you get
        back.</li>
      </ul>
      <p><code>return</code> does two jobs: it hands the value out, and it exits the function
      immediately — nothing after it runs.</p>
    `,
    `
      <h3>Arrow functions and template literals (the ES6 shorthand)</h3>
      <p>ES6 (the 2015 JavaScript update) added two forms you will see constantly in the journal and
      in every React file later:</p>
      <pre class="diagram">  function add(a, b) { return a + b; }   // classic
  const   add = (a, b) => a + b;          // arrow, same job, one line</pre>
      <p>An <strong>arrow function</strong> drops the <code>function</code> keyword and the
      <code>return</code> when the body is a single expression — that expression's value is returned
      automatically. With exactly one parameter you may even drop the parentheses:
      <code>n => n * 2</code>.</p>
      <p>A <strong>template literal</strong> is a string in backticks that can embed expressions
      with a dollar sign and braces. Instead of
      <code>"The Name is :" + name</code> you write
      <code>\`The Name is :\${name}\` </code> — readable, and impossible to get wrong about where
      the spaces go. The journal's <code>15_nameagepost.js</code> is built entirely from them.</p>
    `,
    `
      <h3>Arrays, objects, destructuring and spread</h3>
      <p>An <strong>array</strong> is an ordered list: <code>["Node", "React"]</code>, accessed by
      index starting at <strong>0</strong>. An <strong>object</strong> groups named properties:
      <code>{ name: "Nishant", roll: 2408023 }</code>, accessed by name. Arrays hold the "many
      things"; objects hold the "one thing with many facts" — a student, a book, a database row.</p>
      <p><strong>Destructuring</strong> pulls values out of an array or object in one line:
      <code>const { name, roll } = student;</code> creates two variables from the matching
      properties. <strong>Spread</strong> (<code>...</code>) copies everything into a new array or
      object, which is how you "update without mutating": <code>{ ...student, passed: true }</code>
      is a fresh object containing all of <code>student</code> plus one extra property. You will see
      this exact pattern in React state updates in Unit III
      (<code>setForm({ ...form, city: "Pune" })</code>).</p>
    `
  ],
  examples: [
    {
      title: "The journal's own warm-up: functions and arrows side by side",
      from: "journal",
      file: "sorted_files/01_Week-01_Node-Intro/02_functions.js",
      lang: "javascript",
      code: `function greet(name, age){
    let alloo = "4kg";
    console.log(alloo + " welcome " + name, " ", age);
}
greet("john", 8999);
greet("banega", 7777);
greet("Don", 454545454);

console.log("========== arrow functions ============");
const numbers = (a, b) => a * b;
console.log(numbers(4, 4));

let greeet = (naam, age) => console.log(naam, age);
greeet("aloo", 34); 

let sum = (a , b) => console.log(a + b);
let sub = (a , b) => console.log(a - b);
let mult = (a, b) => console.log(a * b);
let div = (a, b) => console.log(a / b);
let mod = (a, b) => console.log(a % b); 

sum(5, 5);  
sub(10, 3); 
mult(4, 5); 
div(20, 4); 
mod(10, 3);`,
      explain: [
        "<code>greet</code> is a classic function declaration: <code>function name(params) { body }</code>, called three times with different arguments.",
        "Inside, <code>let alloo = \"4kg\"</code> is a variable that lives only inside the function, and <code>+</code> concatenates strings (with numbers converted to text automatically).",
        "<code>const numbers = (a, b) => a * b;</code> is the arrow form — note there is no <code>return</code>: a single-expression arrow returns its expression, so <code>numbers(4, 4)</code> is <code>16</code>.",
        "<code>%</code> is the remainder operator, so <code>mod(10, 3)</code> prints <code>1</code>; <code>div(20, 4)</code> prints <code>5</code> (still a number, not a string).",
        "Every line runs top to bottom — this file has no browser, no server, just JavaScript. That is the whole point of the preface."
      ],
      run: "node 02_functions.js",
      output: `4kg welcome john   8999
4kg welcome banega   7777
4kg welcome Don   454545454
========== arrow functions ============
16
aloo 34
10
7
20
5
1`
    },
    {
      title: "Variables and types with typeof",
      from: "new",
      lang: "javascript",
      code: `let name = "Nishant";
let roll = 2408023;
let passed = true;
let grade;
const PI = 3.14;

console.log(typeof name, typeof roll, typeof passed, typeof grade);
console.log(PI);

name = 100;
console.log(typeof name);`,
      explain: [
        "<code>typeof</code> reports each value's type: string, number, boolean, undefined.",
        "<code>grade</code> was declared with <code>let</code> but never assigned, so its type is <code>undefined</code> — that is exactly what \"declared, not yet set\" means.",
        "<code>const PI</code> cannot be reassigned; <code>let name</code> can — and notice the type of <code>name</code> changes from <code>string</code> to <code>number</code> after <code>name = 100</code>.",
        "Try reassigning <code>PI = 3</code> and running it: Node throws a TypeError. That guard rail is why the book uses <code>const</code> by default."
      ],
      run: "node types.js",
      output: `string number boolean undefined
3.14
number`
    },
    {
      title: "cal.js — functions that calculate and return",
      from: "journal",
      file: "sorted_files/02_Week-02_Modules/modules/cal.js",
      lang: "javascript",
      code: `function add(a, b){
    return a+b;
}
function sub(a, b){
    return a-b;
}

function mult(a, b){
    return a*b;
}

function div(a, b){
    return a/b;
}

function mod(a, b){
    return a%b;
}

module.exports = {
    add, sub, mult, div, mod
}`,
      explain: [
        "Unlike <code>greet()</code>, these five functions print nothing — they <code>return</code> a value, so the caller decides what to do with it.",
        "<code>module.exports = { add, sub, ... }</code> is the shorthand for <code>{ add: add, sub: sub, ... }</code>: it hands these functions to whoever <code>require()</code>s this file (Week 2's topic; here we just call them).",
        "Because <code>return</code> also exits the function, nothing can run after it — that is why each function is three lines, start to finish.",
        "Call one from the same folder with: <code>node -e \"const cal = require('./cal.js'); console.log(cal.add(3,5), cal.mod(10,3))\"</code>"
      ],
      run: "node -e \"const cal = require('./cal.js'); console.log(cal.add(3,5), cal.mod(10,3))\"",
      output: "8 1"
    },
    {
      title: "Template literals: the journal's 15_nameagepost.js",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/15_nameagepost.js",
      lang: "javascript",
      code: `let name = process.argv[2];
let age = Number(process.argv[3]);
let post = process.argv[4];

console.log(\`The Name is :\${name}\\nThe age is:\${age}\\nThe post is \${post}\`);`,
      explain: [
        "The backtick string is a <strong>template literal</strong>: <code>\\\${name}</code> splices the variable straight into the text, no <code>+</code> operators needed.",
        "<code>\\n</code> inside it is a newline — that is why the output comes out on three lines from a single <code>console.log</code>.",
        "<code>process.argv</code> is the command-line argument list; items 2, 3 and 4 are the words you typed after the filename (item 0 is node, item 1 is the script path).",
        "<code>Number(process.argv[3])</code> converts the text <code>\"20\"</code> into the number <code>20</code> — types again, exactly as the theory section warned.",
        "Run it as shown; your name, age and post will come back formatted."
      ],
      run: "node 15_nameagepost.js Raju 20 Trainer",
      output: `The Name is :Raju
The age is:20
The post is Trainer`
    },
    {
      title: "Arrays: destructuring and spread",
      from: "new",
      lang: "javascript",
      code: `const weeks = ["Node", "Sequelize", "React", "Redux"];

const [first, second] = weeks;
console.log(first, second);

const student = { name: "Nishant", roll: 2408023 };
const { name, roll } = student;
console.log(name, roll);

const extra = [...weeks, "Integration"];
console.log(extra.length, extra.join(" > "));`,
      explain: [
        "<code>const [first, second] = weeks;</code> destructures the array's first two slots into two variables.",
        "<code>const { name, roll } = student;</code> destructures an <em>object</em> — square brackets for arrays, curly braces for objects.",
        "<code>[...weeks, \"Integration\"]</code> spreads every element into a <em>new</em> array with one extra item; the original <code>weeks</code> is untouched.",
        "<code>join(\" > \")</code> glues an array into a single string, and <code>.length</code> counts it — the result shows 5 because spread added \"Integration\"."
      ],
      run: "node arrays.js",
      output: `Node Sequelize
Nishant 2408023
5 Node > Sequelize > React > Redux > Integration`
    },
    {
      title: "Objects: read, extend, and copy with spread",
      from: "new",
      lang: "javascript",
      code: `const student = { name: "Nishant", roll: 2408023, marks: [88, 92, 79] };
console.log(student.name, student["roll"]);

student.city = "Pune";
const summary = { ...student, passed: true };
console.log(Object.keys(summary).join(", "));

console.log(typeof student, Array.isArray(student.marks));
console.log(student.marks.reduce((t, m) => t + m, 0));`,
      explain: [
        "Properties are read by name (<code>student.name</code>) or by string key (<code>student[\"roll\"]</code>) — same value either way.",
        "Arrays are objects too, so an array inside an object is perfectly normal; <code>Array.isArray</code> is the honest way to test for one.",
        "<code>{ ...student, passed: true }</code> copies every property into a new object and adds <code>passed</code> — the update pattern React state relies on in Unit III.",
        "<code>reduce</code> folds the array into one number (88 + 92 + 79 = 259); the arrow function <code>(t, m) => t + m</code> is the running total."
      ],
      run: "node objects.js",
      output: `Nishant 2408023
name, roll, marks, city, passed
object true
259`
    },
    {
      title: "Types in the real world: the journal's grade checker",
      from: "journal",
      file: "sorted_files/04_Week-04_Promises-FS-CLI/16_grade-check.js",
      lang: "javascript",
      code: `let name = process.argv[5]; 
let mark = Number(process.argv[6]);
console.log(name);
if (mark >= 90 && mark <= 100) {
  console.log("A");
} else if (mark >= 75 && mark < 90) {
  console.log("B");
} else if (mark >= 50 && mark < 75) {
  console.log("C");
} else if (mark >= 0 && mark < 50) {
  console.log("fail");
}`,
      explain: [
        "<code>Number(process.argv[6])</code> converts the command-line text to a number so the <code>&gt;=</code> comparisons compare numbers, not characters.",
        "<code>&&</code> means logical AND: both bounds must hold for the branch to fire.",
        "The <code>if / else if</code> chain checks top to bottom and stops at the first match — order matters (swap the first two branches and a 95 would be graded B... check it!).",
        "This script reads <code>argv[5]</code> and <code>argv[6]</code>, so you must pass five words before the name — the odd-looking <code>x y z</code> padding in the run command is why.",
        "Both invocations below are real runs: one passes (95 → A), one fails (42 → fail)."
      ],
      run: "node 16_grade-check.js x y z Alice 95",
      output: `Alice
A`
    }
  ],
  keyPoints: [
    "const blocks reassignment, let allows it — reach for const first; avoid var",
    "typeof tells you a value's type; command-line input is always text, so convert with Number()",
    "Functions either print (console.log) or calculate (return) — which one decides how you use them",
    "Arrow functions and template literals are the shorthand every journal file and React component uses",
    "Arrays destructure with [], objects with {}; spread (...) copies into a fresh array or object",
    "The journal's 02_functions.js and cal.js are your reference for the two function styles"
  ],
  practice: `
    <p>From the repo, run <code>node sorted_files/01_Week-01_Node-Intro/02_functions.js</code> and
    confirm the output matches example 1 line for line. Then copy
    <code>sorted_files/04_Week-04_Promises-FS-CLI/16_grade-check.js</code> to a scratch file, change
    it so it also prints a <code>D</code> grade for 40–49, and test it with
    <code>node scratch.js x y z Sam 45</code>. Finally, write a one-line arrow function called
    <code>total</code> that adds two numbers and log <code>total(7, 8)</code> — you should see
    <code>15</code>.</p>
  `,
  quiz: [
    {
      q: "Which keyword declares a variable that may NEVER be reassigned?",
      options: ["let", "const", "var", "static"],
      answer: 1,
      why: "const declares a binding that cannot be reassigned (its contents never change). let may be reassigned, var is the old looser form, and static is unrelated (a class keyword)."
    },
    {
      q: "const numbers = (a, b) => a * b; console.log(numbers(4, 4)); prints:",
      options: ["44", "8", "16", "undefined"],
      answer: 2,
      why: "The arrow function returns a * b implicitly (no return keyword needed for a single expression), so 4 * 4 = 16."
    }
  ],
  sources: [
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions"
  ]
});
