window.COURSE_LESSONS.push({
  id: "w11-jsx",
  file: "060",
  unit: 3,
  week: 11,
  title: "JSX: writing UI in JavaScript",
  kicker: "Unit III · Week 11 · Lesson 3 of 6",
  minutes: 17,
  objectives: [
    "Embed JavaScript expressions in markup with curly braces",
    "Render UI conditionally with the ternary operator and the && operator",
    "Turn an array into a list of elements with map() and a key",
    "List the ways JSX differs from HTML (camelCase props, self-closing tags, style objects, one root)"
  ],
  intro: `
    <p>Every component you have seen so far — the journal's <code>App</code>, the four page
    sections in <code>my-react/src/components</code> — returns markup living inside a
    <code>.jsx</code> file. That markup looks almost like HTML, but it is a different language
    with different rules, and knowing those rules is the difference between reading JSX and
    <em>thinking</em> in it. This lesson teaches the whole language: expressions in curly braces,
    conditional rendering, lists from arrays, and every trap where "this looks like HTML" misleads
    you.</p>
    <p>Three of the examples below are the journal's own files, unchanged. The rest are written
    for the book and are meant to be typed into a scratch project — the rules stick once your
    fingers have made the mistakes once.</p>
  `,
  theory: [
    `
      <h3>What JSX actually is</h3>
      <p><strong>JSX</strong> — JavaScript XML — is a syntax extension that lets you write
      markup-like expressions directly inside JavaScript. Browsers do not understand it: when
      Vite's React plugin sees a <code>.jsx</code> file, it transpiles the JSX into plain
      JavaScript function calls (historically <code>React.createElement(...)</code>, today
      <code>jsx(...)</code> from <code>react/jsx-runtime</code>) before the browser ever sees it.
      So JSX is not a template language bolted onto HTML — it is a shorthand for building
      JavaScript values, which is why you can put any JavaScript expression inside it.</p>
      <pre>&lt;h1&gt;Hello&lt;/h1&gt;
   becomes roughly ↓
jsx("h1", { children: "Hello" })</pre>
      <p>That single fact explains every rule in this lesson: JSX compiles to function calls, so
      it must obey what JavaScript allows (one expression, camelCase names, objects for structured
      values) rather than what HTML allows.</p>
    `,
    `
      <h3>Expressions in curly braces</h3>
      <p>Text between tags is literal. Anything wrapped in <code>{ }</code> is evaluated as a
      JavaScript <em>expression</em> — a value, or anything that produces a value: variables,
      arithmetic, function calls, ternaries, whole arrays of elements. This is exactly how the
      journal's prop components print data: <code>&lt;p&gt;{props.name}&lt;/p&gt;</code> in
      <code>docter.jsx</code> drops the current value of <code>props.name</code> into the page.</p>
      <p>Curly braces are an <em>inward</em> door only. To pass data <em>out</em> to an event
      handler you use plain attribute syntax with braces around the value:
      <code>&lt;button onClick={increment}&gt;</code> — the name is camelCase, the value is an
      expression. You cannot interpolate into attribute text the HTML way
      (<code>class="btn-&#123;color&#125;"</code> is wrong); you build the whole value in
      JavaScript instead.</p>
    `,
    `
      <h3>Conditional rendering</h3>
      <p>Because <code>{ }</code> accepts any expression, "if" becomes an expression too. Two
      forms cover almost everything:</p>
      <ul>
        <li><strong>Ternary</strong> — <code>{isLoggedIn ? &lt;p&gt;Welcome&lt;/p&gt; : &lt;p&gt;Please log in&lt;/p&gt;}</code>:
        two branches, both sides produce markup.</li>
        <li><strong><code>&amp;&amp;</code> short-circuit</strong> —
        <code>{count &gt; 0 &amp;&amp; &lt;p&gt;Item in cart&lt;/p&gt;}</code>: if the left side
        is falsy, React renders nothing (in real HTML <code>false</code> would print as the word
        "false"; React is smarter).</li>
      </ul>
      <p>There is no <code>if</code> statement inside JSX, because JSX is an expression, not a
      block — but you can always compute the choice above the <code>return</code> with a normal
      <code>if</code> and return different markup. Both styles are common.</p>
    `,
    `
      <h3>Lists: map() and the key prop</h3>
      <p>Rendering five identical cards by copy-pasting — the way the journal's
      <code>main.jsx</code> writes five <code>&lt;Books&gt;</code> elements — does not scale to
      fifty. The React way is <code>array.map()</code>: turn each datum into an element and let
      JSX render the resulting array. Each element in a list must carry a <code>key</code> — a
      stable, unique string (usually the item's id) — so React can tell which item moved, grew or
      disappeared between renders instead of rebuilding the whole list. A bare index works in
      demos but misbehaves when the list reorders; prefer a real id.</p>
    `,
    `
      <h3>JSX is not HTML — the six rules</h3>
      <table>
        <thead><tr><th>HTML says</th><th>JSX says</th><th>Why</th></tr></thead>
        <tbody>
          <tr><td><code>class="pop"</code></td><td><code>className="pop"</code></td><td><code>class</code> is a reserved word in JavaScript</td></tr>
          <tr><td><code>for="x"</code></td><td><code>htmlFor="x"</code></td><td>same reason (<code>for</code> is a loop keyword)</td></tr>
          <tr><td><code>tabindex</code>, <code>stroke-width</code></td><td><code>tabIndex</code>, <code>strokeWidth</code></td><td>props are JavaScript object keys — camelCase, always</td></tr>
          <tr><td><code>&lt;input&gt;</code>, <code>&lt;br&gt;</code> left open</td><td><code>&lt;input /&gt;</code>, <code>&lt;br /&gt;</code></td><td>every element must be closed; XML discipline</td></tr>
          <tr><td>any number of top-level tags</td><td>one root, or a fragment <code>&lt;&gt;...&lt;/&gt;</code></td><td>the expression must return one value</td></tr>
          <tr><td><code>style="color: red"</code></td><td><code>style={{ color: "red" }}</code></td><td>the value is a JavaScript object — note the <em>double</em> braces</td></tr>
        </tbody>
      </table>
      <p>The journal obeys most of these by instinct — <code>className="pop"</code> appears in
      <code>patient.jsx</code>, <code>docter.jsx</code> and <code>appointment.jsx</code> — but it
      also keeps habits worth unlearning, like using <code>&lt;h1&gt;</code> five times in a row
      for book details. JSX lets you write any tag; good JSX chooses <em>semantic</em> ones.</p>
    `
  ],
  examples: [
    {
      title: "src/App.jsx (journal): markup with a form inside a component",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/my-react/src/App.jsx",
      lang: "jsx",
      code: `
function App(){
  return(
  <div>
    <h1>Student Registration</h1>
    <p>for computer science student</p>
    <p>welcome to react</p>
    <input type="text" placeholder="Enter your name"></input>
    <button>submit</button>
  </div>
);};


export default App;
`,
      explain: [
        "Nothing dynamic yet — but note the JSX discipline already present: one root <code>&lt;div&gt;</code> wrapping everything, and a self-closed-enough <code>&lt;input&gt;</code> (here written with an explicit closing tag, which JSX also accepts for non-void elements).",
        "Attribute values like <code>type=\"text\"</code> are quoted strings exactly as in HTML; anything dynamic would go in braces — you add that in Lesson 6's state section.",
        "The <code>return( ... )</code> with parentheses is a habit, not a rule: it lets the markup span multiple lines without JavaScript inserting a stray <code>;</code> after <code>return</code>.",
        "Compare with example 5 — this file is the \"before\" picture of the HTML→JSX conversion."
      ],
      run: "cd my-react && npm run dev",
      output: "The browser shows a form heading and an empty text box:\nStudent Registration\nfor computer science student\nwelcome to react\n[ Enter your name ]  [ submit ]"
    },
    {
      title: "react3/src/main.jsx (journal): comments and many children in one tree",
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

    {/* <Students
    name="Name: Nishant"
    age = {21}
    course = "Course: BCA"
    subject ="Subject: FSD"
    />
     */}
  </StrictMode>
)
`,
      explain: [
        "Props written as quoted strings (<code>title = \"Title: tao te ching\"</code>) are literal text; props in braces (<code>price = &#123;450&#125;</code>) are JavaScript numbers — Lesson 5 covers why that distinction matters.",
        "<code>{/* ... */}</code> is how you comment inside JSX: braces first turn the comment into an expression, which React then renders as nothing. A bare <code>// comment</code> between tags is a syntax error.",
        "Several sibling elements sit inside <code>&lt;StrictMode&gt;</code> with no wrapper div — StrictMode accepts multiple children; a plain custom component would need a fragment <code>&lt;&gt;...&lt;/&gt;</code> or a single root instead.",
        "This is a trimmed copy: the real file renders five <code>&lt;Books&gt;</code> elements in a row and keeps <code>Students</code>/<code>Exployee</code> commented out. Every import line is kept so the file still runs as-is."
      ],
      run: "cd react3 && npm install && npm run dev",
      output: "The page shows the book details stacked, e.g.:\nTitle: tao te ching\nAuthor: lau zu\n450\nPanguin House\n200"
    },
    {
      title: "appointment.jsx (journal): className, not class",
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
        "<code>className=\"pop\"</code> is rule 1 of the table: the HTML attribute is <code>class</code>, but in JSX it must be <code>className</code> because <code>class</code> is a reserved JavaScript word. CSS then targets it with the normal <code>.pop { ... }</code> selector.",
        "<code>&#123;props.time&#125;</code> shows expressions in braces producing text; no quotes — the braces already mean \"evaluate this\".",
        "Literal text (<strong>Time:</strong>) and expressions can sit in the same paragraph, which is the everyday rhythm of writing JSX.",
        "\"Docter_Name\" is the journal's spelling; React does not care, but your users might — worth a rename when you reuse this component."
      ],
      run: "used inside a project's main.jsx as <Appointment time=\"10:00\" room=\"12\" doctor_name=\"Dr Rao\" />",
      output: "Appointment Details\nTime: 10:00\nRoom: 12\nDocter_Name: Dr Rao"
    },
    {
      title: "Expressions: anything that produces a value",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
const user = "Nishant";
const price = 450;
const inStock = true;

function App() {
  return (
    <div>
      <h1>Hello, {user}</h1>
      <p>Total: {price + 50}</p>
      <p>Status: {inStock ? "In stock" : "Sold out"}</p>
      <p>{\`Greeting of the day: Hello, \${user}\`}</p>
      <p>{["FSD", "DBMS", "OS"].map((s) => <span key={s}>{s} </span>)}</p>
    </div>
  );
}

export default App;
`,
      explain: [
        "<code>&#123;user&#125;</code> prints a variable, <code>&#123;price + 50&#125;</code> an arithmetic result — any expression works, including function calls and ternaries.",
        "The fourth line is a JavaScript template literal inside braces — the tidy way to build one string from several variables. In your own project you write it exactly as shown; inside this book's files the backticks and the dollar sign are backslash-escaped so the lesson file itself still parses.",
        "Booleans, numbers and <code>null</code> rendered directly produce nothing on screen — that is why <code>&#123;count &gt; 0 &amp;&amp; ...&#125;</code> (example 6) works as a condition.",
        "The <code>map</code> line previews list rendering; note the <code>key</code> prop, explained properly in example 7."
      ],
      run: "npx vite (inside a scaffolded project — Lesson 2)",
      output: "Hello, Nishant\nTotal: 500\nStatus: In stock\nGreeting of the day: Hello, Nishant\nFSD DBMS OS"
    },
    {
      title: "HTML → JSX: converting a snippet, trap by trap",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// What you would write in an HTML file:
//   <div class="card">
//     <label for="name">Name</label>
//     <input type="text" id="name" tabindex="2">
//     <img src="/logo.svg">
//   </div>

// The same thing in JSX:
function Card() {
  return (
    <div className="card">
      <label htmlFor="name">Name</label>
      <input type="text" id="name" tabIndex={2} />
      <img src="/logo.svg" />
    </div>
  );
}

export default Card;
`,
      explain: [
        "<code>class</code> → <code>className</code> and <code>for</code> → <code>htmlFor</code>: the two renames every beginner makes wrong for a week.",
        "<code>tabindex=\"2\"</code> → <code>tabIndex=&#123;2&#125;</code>: any attribute that is a number gets braces, and its name camelCases — <code>strokeWidth</code>, <code>viewBox</code>, <code>data-testid</code> stays as-is.",
        "<code>&lt;input&gt;</code> and <code>&lt;img&gt;</code> are \"void\" elements in HTML (no closing tag). JSX insists every element closes itself: <code>/&gt;</code> or an explicit pair.",
        "The result is still one root (<code>div</code>) — had there been two, you would wrap them in <code>&lt;&gt; ... &lt;/&gt;</code> (a fragment) or a real element."
      ],
      run: "npx vite (inside a scaffolded project)"
    },
    {
      title: "Conditional rendering with && and the ternary operator",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
function CartLine({ name, qty, discount }) {
  return (
    <div>
      <p>{name} × {qty}</p>
      {qty === 0 && <p className="warn">Out of stock</p>}
      {discount > 0 ? (
        <p>You save {discount} rupees</p>
      ) : (
        <p>No discount today</p>
      )}
      {qty > 0 && <button>Buy now</button>}
    </div>
  );
}

export default CartLine;
`,
      explain: [
        "<code>&#123;qty === 0 &amp;&amp; &lt;p&gt;...&lt;/p&gt;&#125;</code>: if the left side is falsy, the whole expression is falsy and React renders nothing — no <code>\"false\"</code> text on screen.",
        "The ternary is the two-branch form: a real condition, a then-markup and an else-markup, both sides being valid JSX expressions.",
        "Note <code>qty === 0</code> with three equals — in JSX braces you are in plain JavaScript, and comparison bugs there are the classic source of a component that \"always shows\".",
        "Both operators live inside <code>&#123; &#125;</code>, because they are expressions — there is no statement-level <code>if</code> inside JSX."
      ],
      run: "npx vite (inside a scaffolded project)",
      output: "<CartLine name=\"Pen\" qty={0} discount={0} /> renders:\nPen × 0\nOut of stock"
    },
    {
      title: "Lists with map() and a proper key",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
const books = [
  { id: 1, title: "tao te ching", price: 450 },
  { id: 2, title: "metamorphosis", price: 450 },
  { id: 3, title: "crime and punishment", price: 450 },
];

function BookList() {
  return (
    <ul>
      {books.map((b) => (
        <li key={b.id}>
          {b.title} — {b.price} rupees
        </li>
      ))}
    </ul>
  );
}

export default BookList;
`,
      explain: [
        "<code>map()</code> transforms each book object into a <code>&lt;li&gt;</code> element; JSX renders the resulting array as a real list — the scalable replacement for the journal's five hand-written <code>&lt;Books /&gt;</code> tags.",
        "<code>key=&#123;b.id&#125;</code> gives React a stable identity per item, so inserting or reordering the array patches only the affected <code>&lt;li&gt;</code>s instead of rewriting the whole list.",
        "Using the array index as key (<code>key={i}</code>) works until items move or get deleted — then React can no longer match old and new items; prefer a real id, as here.",
        "The <code>—</code> and <code>rupees</code> text shows literal text mixed with expressions inside one list item — the everyday JSX rhythm."
      ],
      run: "npx vite (inside a scaffolded project)",
      output: "• tao te ching — 450 rupees\n• metamorphosis — 450 rupees\n• crime and punishment — 450 rupees"
    }
  ],
  keyPoints: [
    "JSX is a JavaScript syntax extension transpiled by Vite's React plugin into element-creating function calls — it is not HTML served to the browser.",
    "Anything inside <code>{ }</code> must be a JavaScript <em>expression</em>: variables, arithmetic, ternaries, <code>&amp;&amp;</code> conditions, <code>map()</code> results.",
    "Conditional rendering is done with expressions — <code>condition ? A : B</code> or <code>condition &amp;&amp; A</code> — because JSX has no statement-level <code>if</code>.",
    "Lists come from <code>array.map()</code>, and every list element needs a stable <code>key</code> so React can patch minimally.",
    "JSX rules: <code>className</code> and <code>htmlFor</code>, camelCase props, self-closing tags, <code>style</code> takes an object (double braces), and one root or a fragment.",
    "The journal already follows the className rule everywhere, but uses <code>&lt;h1&gt;</code> for whole blocks of text — semantic tags are free, take them."
  ],
  practice: `
    <p>Take any HTML snippet you wrote before this course — a card, a form, a nav bar — and
    convert it to a React component by hand, hitting every row of the rules table: rename
    <code>class</code>/<code>for</code>, camelCase the numbered attributes, self-close the void
    tags, wrap everything in one root. Then replace any repeated block with
    <code>array.map()</code> plus a <code>key</code>, and add one ternary that swaps part of the
    markup when a variable is true. Paste it into <code>App.jsx</code> of the journal's
    <code>my-react</code> project and watch it render through Vite.</p>
  `,
  quiz: [
    {
      q: "Which line renders nothing at all when count is 0?",
      options: [
        "<p>{count && <span>Items in cart</span>}</p>",
        "<p>count && <span>Items in cart</span></p>",
        "<p>{if (count) <span>Items in cart</span>}</p>",
        "<p>{count > 0 ? <span>Items in cart</span>}</p>"
      ],
      answer: 0,
      why: "Option A puts the && expression in braces, and a falsy left side makes React render nothing. Option D would also render nothing at count 0 — but the question's canonical && form is A; option B is literal text and option C is a syntax error (no if inside JSX)."
    },
    {
      q: "Why must you write className=\"pop\" instead of class=\"pop\" in JSX?",
      options: [
        "Because React only supports the CSS Modules naming convention",
        "Because class is a reserved word in JavaScript, and JSX attributes become JavaScript object keys",
        "Because HTML5 deprecated the class attribute",
        "Because className is faster to render"
      ],
      answer: 1,
      why: "JSX compiles to JavaScript, where class cannot be a property name in that position; className is the agreed name (and htmlFor for the same reason about for). Nothing changes in the CSS — it is still a class selector."
    }
  ],
  sources: [
    "https://react.dev/learn/writing-markup-with-jsx",
    "https://react.dev/learn/javascript-in-jsx-with-curly-braces",
    "https://react.dev/learn/rendering-lists",
    "https://react.dev/learn/conditional-rendering"
  ]
});
