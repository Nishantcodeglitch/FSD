window.COURSE_LESSONS.push({
  id: "w11-props",
  file: "062",
  unit: 3,
  week: 11,
  title: "Props: passing data to components",
  kicker: "Unit III · Week 11 · Lesson 5 of 6",
  minutes: 18,
  objectives: [
    "Pass data from a parent component to a child and read it through the props parameter",
    "Explain why props flow one way only and are read-only",
    "Use destructuring and default values to make component parameters tidier",
    "Choose between string props, brace props, the children prop and spreading an object"
  ],
  intro: `
    <p>So far your components print hard-coded text: <code>My College</code>,
    <code>React Course</code>, <code>Book</code> details typed into the file. That makes every
    component a poster, not a part. The fix is as old as programming — pass arguments into the
    function — and in React those arguments are called <strong>props</strong> (short for
    <em>properties</em>). This is syllabus point 11.3, and it is the lesson where the journal
    finally comes alive: five real prop components from
    <code>react3</code> plus the clinic trio (<code>patient</code>, <code>docter</code>,
    <code>appointment</code>) are all read and explained here.</p>
  `,
  theory: [
    `
      <h3>One-way data flow, in the journal's own words</h3>
      <p>The journal's <code>react3/notes.txt</code> from the day this was taught says it better
      than any textbook:</p>
      <blockquote>props allows us to pass data from one component to another. the parent files
      sends data and child file will reciece it. the child file cannot directly change the parent
      data.</blockquote>
      <p>That is <strong>one-way data flow</strong>: data travels down the component tree,
      parent → child, and never back up. A child receives its props and may <em>use</em> them, but
      cannot edit them — not because React is being difficult, but because the same data may feed
      a dozen children, and letting any one of them rewrite it would produce the "who changed
      what" chaos that state management (Week 14, Redux) exists to prevent. If a child needs the
      parent to change something, the parent passes down a <em>callback function</em> and decides
      itself — you will use that pattern from Lesson 6 onwards.</p>
    `,
    `
      <h3>Passing and receiving</h3>
      <p>On the parent's side, props are attributes on the component tag. Two kinds of value
      exist, and the distinction is the first real JSX trap:</p>
      <pre>&lt;Books title="Tao Te Ching" pages={200} /&gt;
   ▲ literal text                 ▲ JavaScript expression — a real number</pre>
      <p>A quoted value is always a <em>string</em>, even if it looks like a number
      (<code>price="450"</code> is the text <code>450</code>). Anything that should be a number,
      boolean, variable, array or object goes in braces. On the child's side, React passes all of
      them as <strong>one object</strong> to the function's first parameter —
      <code>function Books(props)</code> — read as <code>props.title</code>,
      <code>props.price</code>, and so on. Attribute names are matched <em>exactly</em>, which is
      how the journal's <code>main.jsx</code> loses its publisher (example 2 explains the bug).</p>
    `,
    `
      <h3>Destructuring and default values</h3>
      <p>Repeating <code>props.</code> on every line gets tiring, so most React code destructures
      the object right in the parameter list — the ES6 destructuring you met in the JavaScript
      essentials preface:</p>
      <pre>function Employee({ name, department, salary, city }) { ... }</pre>
      <p>Destructuring also gives you <strong>default values</strong> for free: any prop the
      parent did not pass keeps the value you assign in the parameter list
      (<code>function Book({ title = \"Untitled\" })</code>). Together these two lines remove most
      of the boilerplate you see in prop-heavy components.</p>
    `,
    `
      <h3>children, spreading, and styling by prop</h3>
      <ul>
        <li><strong>The <code>children</code> prop.</strong> Whatever a parent places
        <em>between</em> a component's opening and closing tags arrives as
        <code>props.children</code> — the component becomes a container. This is how
        <code>Card</code>, <code>Modal</code> and <code>Layout</code> components are built.</li>
        <li><strong>Spreading.</strong> When your data is already an object, pass it whole with
        the spread operator: <code>&lt;Book {...book} /&gt;</code> copies every property onto the
        props object. It is how <code>map()</code> turns an array of records into a list of
        components.</li>
        <li><strong>Conditional styling via props.</strong> Props are values, so you can compute
        markup from them: a <code>sold</code> prop that swaps a CSS class, a
        <code>price &gt; 500</code> test that renders a "premium" badge. Example 9 shows the
        pattern with the book data you already know.</li>
      </ul>
      <div class="warn"><strong>Props are read-only. Ever.</strong> Assigning to a prop
      (<code>props.price = 0</code>) is a bug, not a feature — under StrictMode React warns
      loudly, and the component becomes unpredictable for every parent that uses it. Components
      never edit their own inputs; they only render them (and, next week, keep their own
      state).</div>
    `,
    `
      <h3>Default vs named exports, and the case-sensitivity trap</h3>
      <p>Week 11's files show both export styles. One component per file →
      <code>export default Books</code>, imported as <code>import Books from './books'</code>.
      Two components in one file → <code>export { Students, Teachers }</code>, imported by
      name: <code>import { Students, Teachers } from './students'</code> (the journal's main.jsx
      does exactly this). And the sharpest trap in the whole lesson: prop names are matched
      exactly, including case. The journal writes
      <code>Publisher = "Panguin House"</code> (capital P) but <code>books.jsx</code> reads
      <code>props.publisher</code> — React looks for a prop literally named
      <code>publisher</code>, finds none, and renders <em>nothing</em> for it. The fix is one
      keystroke; the diagnosis takes a beginner an hour. Check spelling and case first, always.</p>
    `
  ],
  examples: [
    {
      title: "src/books.jsx (journal): a component that is all props",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/react3/src/books.jsx",
      lang: "jsx",
      code: `
function Books(props){
  return(
    <div>
   <h1>{props.title}</h1>
   <h1>{props.author}</h1>
   <h1>{props.price}</h1>
   <h1>{props.publisher}</h1>
   <h1>{props.pages}</h1>
  </div>
  )
  }

  export default Books;
`,
      explain: [
        "The same function renders four different books in the journal's main.jsx — one definition, many instances. That reuse is the entire economic argument for components.",
        "Each <code>&#123;props.x&#125;</code> is an expression reading one property off the props object React built from the parent's attributes.",
        "The component itself contains zero book data — perfect separation: markup here, data in the parent. Change one <code>&lt;Books /&gt;</code> tag and only that card changes.",
        "Style note: five <code>&lt;h1&gt;</code>s in a row is what beginners write; a real card would mix <code>h3</code>, <code>p</code> and a <code>span</code> for the price — same props, better semantics."
      ],
      run: "cd react3 && npm install && npm run dev",
      output: "For the first instance:\nTao Te Ching\nAuthor: lau zu\n450\nPanguin House\n200"
    },
    {
      title: "src/main.jsx (journal): the parent that sends the data (and one lost prop)",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/react3/src/main.jsx",
      lang: "jsx",
      code: `
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import {Students, Teachers } from './students'
import Exployee from './Employee'
import Books from './books'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Books
    title = "Title: tao te ching"
    author = "Author: lau zu"
    price = {450}
    Publisher = "Panguin House"
    pages = {200}
    />
    <Books
    title = "Title: metamorphosis"
    author = "Author: franze kafkta"
    price = {450}
    Publisher = "Panguin House"
    pages = {108}
    />

    {/* <Students name="Name: Nishant" age = {21} course = "Course: BCA" subject ="Subject: FSD" /> */}
  </StrictMode>
)
`,
      explain: [
        "Quoted props (<code>title = \"Title: tao te ching\"</code>) are strings; braced props (<code>price = &#123;450&#125;</code>) are the numbers 450 and 200 — <code>typeof props.price</code> is <code>\"number\"</code> inside the child.",
        "<strong>Spot the bug:</strong> the parent sends <code>Publisher</code> with a capital P, but books.jsx reads <code>props.publisher</code> — props are matched exactly, so this prop renders as <em>nothing</em> (React treats the missing prop as <code>undefined</code> and prints the empty string). Fix: rename the attribute to <code>publisher</code>.",
        "The commented <code>&lt;Students ... /&gt;</code> shows the same four-attribute pattern for another component; the journal commented it out to display only books.",
        "Trimmed from the real file, which renders five <code>&lt;Books&gt;</code> and keeps three commented <code>&lt;Exployee /&gt;</code> instances — all imports kept, so it runs as-is."
      ],
      run: "cd react3 && npm run dev",
      output: "Book cards appear; the publisher line is blank until you lowercase the prop name."
    },
    {
      title: "src/Employee.jsx (journal): four props, one record",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/react3/src/Employee.jsx",
      lang: "jsx",
      code: `
function Employee(props){
    return (<div>
        <h2>{props.name}</h2>
        <h2>{props.department}</h2>
        <h2>{props.salary}</h2>
        <h2>{props.city}</h2>
        <br/>
    </div>)
}

export default Employee;
`,
      explain: [
        "The journal's lab question for this file was exactly four props — name, department, salary, city — and the parent passes them as <code>name = \"rajesh\"</code>, <code>salary = &#123;67000&#125;</code> (a number), and so on.",
        "The component's API is defined by which prop names it reads: rename a prop in the parent and this component silently shows an empty <code>h2</code> — the case-sensitivity lesson again.",
        "<code>&lt;br/&gt;</code> after the last line separates multiple Employee cards — a reminder of the self-closing JSX rule.",
        "Compare with books.jsx: identical shape, different data. Once you can read one prop component, you can read them all."
      ],
      run: "cd react3 && npm run dev (uncomment the Exployee block in main.jsx first)",
      output: "rajesh\nQA\n67000\nPune"
    },
    {
      title: "src/students.jsx (journal): two components, named exports",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/react3/src/students.jsx",
      lang: "jsx",
      code: `
function Students(props){
  return(
    <div>
   <h1>{props.name}</h1>
   <h1>{props.age}</h1>
   <h1>{props.course}</h1>
   <h1>{props.subject}</h1>
  </div>
  )
  }
//we will pass multiple component
//we cant use default for both component
//we use export {student, teacher}
function Teachers(props){
  return(
    <div>
   <h1>{props.name}</h1>
   <h1>{props.age}</h1>
   <h1>{props.course}</h1>
   <h1>{props.subject}</h1>
  </div>
  )
  }

  export {Students, Teachers}
`,
      explain: [
        "Two components in one file forces <em>named</em> exports — the journal's own comment gets the reason right: \"we cant use default for both component\" (a file has exactly one default export).",
        "Named exports pair with braced imports: <code>import &#123; Students, Teachers &#125; from './students'</code> — the names must match on both sides, exactly like <code>require(&#123; ... &#125;</code> destructuring you used in Node.",
        "Both components read the same four prop names (the day's lab question: name, age, course, subject), so the parent uses one attribute layout for either.",
        "The convention in big React codebases is still one component per file — this file is a teaching shortcut, and you will see it undone in professional projects."
      ],
      run: "cd react3 && npm run dev (uncomment the Students block in main.jsx first)",
      output: "Name: Nishant\n21\nCourse: BCA\nSubject: FSD"
    },
    {
      title: "docter.jsx (journal): the clinic's doctor card",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/docter.jsx",
      lang: "jsx",
      code: `
function Doctor(props){
    return(
    <div className="pop">
    <h1>Docter Details</h1>
    <p><strong>Name:</strong>{props.name}</p>
    <p><strong>Specialization:</strong>{props.specialization}</p>
    <p><strong>Experience:</strong>{props.experience}</p>

    </div>
    );
  }


  export default Doctor;
`,
      explain: [
        "Three props — <code>name</code>, <code>specialization</code>, <code>experience</code> — mixed with literal label text in the same paragraph: the everyday JSX idiom of props plus labels.",
        "The function is called <code>Doctor</code> inside a file named <code>docter.jsx</code> — the file-name-matches-component convention bends here (plus the \"Docter\" spelling in the heading). It still works, because the import path, not the filename, is what the parent follows.",
        "<code>className=\"pop\"</code> is shared by all three clinic components — a small hint that props could carry a class name too (example 9 generalises this).",
        "Standalone files like this sit at the week folder's root; you mount them by importing into a project's main.jsx, as the week README instructs."
      ],
      run: "import into a project's main.jsx as <Doctor name=\"Dr Rao\" specialization=\"Cardiology\" experience=\"12\" />",
      output: "Docter Details\nName: Dr Rao\nSpecialization: Cardiology\nExperience: 12"
    },
    {
      title: "appointment.jsx (journal): prop names are the component's contract",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/appointment.jsx",
      lang: "jsx",
      code: `
function Appointment(props){
    return(
    <div className="pop">
    <h1>Appointment Details</h1>
    <p><strong>Time:</strong>{props.time}</p>
    <p><strong>Room:</strong>{props.room}</p>
    <p><strong>Docter_Name:</strong>{props.doctor_name}</p>

    </div>
    );
  }


  export default Appointment;
`,
      explain: [
        "Note <code>doctor_name</code> with an <em>underscore</em>: JSX props are JavaScript object keys, and the underscore style here is the author's choice — either convention works, but the parent must match it character for character.",
        "Passing <code>&lt;Appointment room=&#123;12&#125; /&gt;</code> without <code>time</code> would render an empty Time line — props have no required/optional markers at this level; the component decides what to do with missing data (example 7's defaults are the tidy solution).",
        "<code>patient.jsx</code> in the same folder is the third clinic card, with props <code>name</code>, <code>age</code>, <code>disease</code> — same pattern, so it is left as your reading exercise.",
        "Together the three cards show the family resemblance of every prop component: one function, props in, markup out."
      ],
      run: "import into a project's main.jsx as <Appointment time=\"10:00\" room=\"12\" doctor_name=\"Dr Rao\" />",
      output: "Appointment Details\nTime: 10:00\nRoom: 12\nDocter_Name: Dr Rao"
    },
    {
      title: "Destructuring props with default values",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// Before: props.x on every line
function BookA(props){
  return <h1>{props.title} — {props.author}</h1>;
}

// After: destructured in the parameter list, with a fallback
function BookB({ title, author = "Unknown", price = 0 }){
  return <h1>{title} — {author} ({price} rupees)</h1>;
}

// Parent can now omit any defaulted prop:
// <BookB title="Metamorphosis" />
function App(){
  return (
    <div>
      <BookB title="Metamorphosis" author="Franz Kafka" price={450} />
      <BookB title="Meditations" />
    </div>
  );
}
`,
      explain: [
        "Destructuring <code>&#123; title, author &#125;</code> in the parameter list is pure ES6 — React just hands you the props object as the first argument.",
        "Default values (<code>author = \"Unknown\"</code>) apply when the parent passes <em>nothing</em> for that prop — note they do <strong>not</strong> apply when the parent explicitly passes <code>undefined</code>... and an absent prop is exactly <code>undefined</code>, so the two rules agree.",
        "The second <code>BookB</code> instance omits author and price entirely and still renders sensibly — defaults turn a fragile component into a forgiving one.",
        "The journal always writes <code>(props)</code> with <code>props.</code> lookups; both styles are correct, and you will meet destructured props in nearly every React codebase from now on."
      ],
      run: "npx vite (inside a scaffolded project)",
      output: "Metamorphosis — Franz Kafka (450 rupees)\nMeditations — Unknown (0 rupees)"
    },
    {
      title: "The children prop: a component that wraps content",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
function Card({ title, children }){
  return (
    <div className="pop">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </div>
  );
}

function App(){
  return (
    <Card title="Notice">
      <p>Mid-term exams start Monday.</p>
      <button>OK</button>
    </Card>
  );
}

export default App;
`,
      explain: [
        "Everything the parent nests between <code>&lt;Card&gt;</code> and <code>&lt;/Card&gt;</code> — here a paragraph and a button — arrives as <code>children</code>, a prop like any other.",
        "<code>Card</code> owns the frame (heading, class, body wrapper) while the parent decides the content: the classic separation for layouts, modals, and cards.",
        "Notice there is no attribute for it — <code>children</code> is implicit; but you may also pass it explicitly: <code>&lt;Card title=\"x\" children={&lt;p /&gt;} /&gt;</code> (rare, and considered poor style).",
        "This is the missing piece from Lesson 4's components: those were empty slots; with children, a component becomes a reusable container."
      ],
      run: "npx vite (inside a scaffolded project)",
      output: "A card with heading 'Notice' containing:\nMid-term exams start Monday.\n[ OK ]"
    },
    {
      title: "Spreading a data object and styling by prop",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
const books = [
  { id: 1, title: "tao te ching", author: "lau zu", price: 450, sold: false },
  { id: 2, title: "surrounded by idiots", author: "eric", price: 55, sold: true },
];

function Book({ title, author, price, sold }){
  return (
    <div className={sold ? "book gone" : "book"}>
      <h3>{title}</h3>
      <p>by {author}</p>
      <p className={price > 100 ? "premium" : ""}>{price} rupees</p>
      {sold && <span className="warn">Sold out</span>}
    </div>
  );
}

function BookList(){
  return books.map((b) => <Book key={b.id} {...b} />);
}
`,
      explain: [
        "<code>&#123;...b&#125;</code> spreads every property of the record onto the component — the four attributes are written once in the data, not four times per tag. Combined with <code>map()</code>, this is how real lists of components are built.",
        "Conditional styling: the root <code>className</code> switches between <code>\"book\"</code> and <code>\"book gone\"</code> depending on the <code>sold</code> prop — props drive CSS, no imperative DOM work.",
        "The price class is computed with a ternary (<code>price &gt; 100 ? \"premium\" : \"\"</code>) — an empty string simply adds no class.",
        "<code>&#123;sold &amp;&amp; &lt;span&gt;...&#125;</code> is the Lesson 3 short-circuit, now fed by a prop: the badge appears only where the data says so."
      ],
      run: "npx vite (inside a scaffolded project)",
      output: "tao te ching\nby lau zu\n450 rupees\n\nsurrounded by idiots\nby eric\n55 rupees\nSold out"
    }
  ],
  keyPoints: [
    "Props carry data from parent to child, one way only — the child can never change what the parent passed (the journal's notes.txt: \"the child file cannot directly change the parent data\").",
    "Quoted attributes are strings; anything else (numbers, variables, booleans, objects) goes in braces — <code>price={450}</code> is a number, <code>price=\"450\"</code> is text.",
    "A child reads props as one object (<code>props.title</code>), usually destructured in the parameter list with defaults for anything optional.",
    "Props are read-only: assigning to them is a bug React warns about under StrictMode.",
    "<code>props.children</code> holds whatever the parent nested inside the component's tags; <code>&lt;Comp {...obj} /&gt;</code> spreads an object's properties as props.",
    "Prop names are matched exactly, including case — the journal's <code>Publisher</code> vs <code>props.publisher</code> silently renders nothing."
  ],
  practice: `
    <p>In the journal's <code>react3</code> project, fix the lost publisher: change
    <code>Publisher = "Panguin House"</code> to lowercase <code>publisher</code> in
    <code>main.jsx</code> and confirm the line appears. Then uncomment the
    <code>&lt;Students /&gt;</code> block and the <code>&lt;Exployee /&gt;</code> blocks one at a
    time so all three prop components render together. Finally, rewrite
    <code>books.jsx</code> destructured (<code>function Books(&#123; title, author, price,
    publisher, pages &#125;)</code>) with <code>price = 0</code> as a default, and pass one
    <code>&lt;Books title=\"Untitled\" /&gt;</code> to see the defaults fill the gaps.</p>
  `,
  quiz: [
    {
      q: "A child component writes props.price = 0 inside itself. What is true?",
      options: [
        "It is allowed as long as it happens inside the return statement",
        "Props are read-only; React warns (under StrictMode) and the parent's data is unchanged — ask the parent to change it instead",
        "It works, but only for number props",
        "It silently changes the parent's variable too, because data flows both ways"
      ],
      answer: 1,
      why: "Data flows parent → child only. A child may not edit its props; to change data, the parent must do it (usually via a callback prop). React flags the assignment with a read-only error."
    },
    {
      q: "The parent writes &lt;Books publisher=\"Panguin House\" /&gt; (lowercase) but the component reads props.Publisher. What renders?",
      options: [
        "Panguin House — prop names are matched without regard to case",
        "Nothing for that line — React finds no prop named Publisher and the expression is undefined",
        "The word \"undefined\" in bold",
        "A build error in the terminal"
      ],
      answer: 1,
      why: "Props are matched exactly, character for character. A missing prop evaluates to undefined, and rendering undefined in JSX shows nothing at all (not the literal word). No error is raised — which is why spelling is checked first when a prop \"disappears\"."
    }
  ],
  sources: [
    "https://react.dev/learn/passing-props-to-a-component",
    "https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children",
    "https://react.dev/learn/describing-the-ui#components-inside-components"
  ]
});
