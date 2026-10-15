window.COURSE_LESSONS.push({
  id: "w11-state-intro",
  file: "063",
  unit: 3,
  week: 11,
  title: "State: the missing piece (introduction)",
  kicker: "Unit III · Week 11 · Lesson 6 of 6",
  minutes: 15,
  objectives: [
    "Explain what state is and how it differs from props",
    "Describe what happens when state changes: the component re-runs and React updates the screen",
    "Recognise why a plain variable cannot drive a React screen",
    "Trace the journal's pocketmoney-to-money example from parent prop to child state"
  ],
  intro: `
    <p>This is syllabus point 11.4, and the honest truth recorded in the course journal is that
    Week 11 never got a standalone state file — the DOCX has only part of the topic, and the
    idea leaked into Week 12's <code>states</code> project instead. So this lesson builds the
    concept from that real code: the counter and the pocketmoney example in
    <code>sorted_files/12_Week-12_Hooks/states/src/Student.jsx</code>, plus the parent file that
    feeds it. You will learn what state is, why props alone cannot run an interactive app, and
    exactly what "re-rendering" means. The function that makes state work,
    <code>useState</code>, is named here but fully taught next week — this lesson is the
    <em>idea</em>, next week is the <em>tool</em>.</p>
  `,
  theory: [
    `
      <h3>Why props are not enough</h3>
      <p>Props let a parent hand data to a child — but they are read-only and they come from
      outside. A counter, a shopping cart, a "liked" button, a form that remembers what you
      typed: all of these hold data that <em>the component itself changes while the user
      interacts</em>. No parent is going to send you a new number every time someone clicks.
      Components therefore need a second kind of data: their own private memory that may change
      over time. React calls it <strong>state</strong>.</p>
      <p>The journal's own explanation (a comment at the top of the Week 12
      <code>App.jsx</code>) puts it well:</p>
      <blockquote>use states is a react hook that allows a component to create and manage the
      data that can change overtime. whenever this data changes react automatically updates the
      user interface.</blockquote>
    `,
    `
      <h3>State is data the component owns</h3>
      <p>Think of every component as a small machine with two inputs. <strong>Props</strong> are
      the settings someone else dials in — the same for as long as the parent says so.
      <strong>State</strong> is the machine's own live readings — it starts at some initial
      value and only the machine itself changes it. The journal's App.jsx comment reaches for
      the same picture with a WhatsApp analogy: person A sends a message to person B — the
      message is like a prop, and person B cannot rewrite what person A sent; but person B has
      their own chat history (their own state) that they add to freely.</p>
      <pre class="diagram">   parent ─── props ───▶ child     (data down, read-only)
                            │
                            └─ state          (private, may change over time)
                                 │
                                 └─ change it  ──▶  React re-renders this component</pre>
    `,
    `
      <h3>What "re-rendering" actually means</h3>
      <p>You already know a component is a function of its inputs. When its state changes, React
      simply <strong>calls that function again</strong> — that is the whole mechanism. The second
      call returns new markup for the new data; React compares it with what is on screen
      (reconciliation, Lesson 1) and patches only the difference. Nobody touches the DOM, and
      nobody keeps two copies of the truth in sync by hand:</p>
      <pre class="diagram">   setCount(1)  ──▶  Counter() runs again  ──▶  markup says "count: 1"
                        ▲                            │
                        └──── React updates the &lt;h3&gt; only ◀┘</pre>
      <p>Two consequences beginners must internalise. First, <em>calling the component function
      yourself</em> does nothing to the screen — only React's re-render does. Second, the
      rendering is a snapshot: the markup you return describes the screen <em>at this moment</em>,
      with the current state value baked in.</p>
    `,
    `
      <h3>State vs props, side by side</h3>
      <table>
        <thead><tr><th></th><th>Props</th><th>State</th></tr></thead>
        <tbody>
          <tr><td>Who sets it</td><td>The parent, when it renders the component</td><td>The component itself</td></tr>
          <tr><td>Can the component change it?</td><td>No — read-only</td><td>Yes, through the setter (never by assignment)</td></tr>
          <tr><td>Lives where</td><td>Arguments of this render</td><td>React's internal memory for this component</td></tr>
          <tr><td>Changes when</td><td>The parent re-renders with new data</td><td>The component calls its setter</td></tr>
          <tr><td>Typical use</td><td>configuration, labels, callbacks down</td><td>counters, toggles, form input, anything interactive</td></tr>
        </tbody>
      </table>
      <div class="warn"><strong>useState arrives next week.</strong> The journal's counter uses
      <code>useState</code>, the React hook that provides state; Week 12 (Lesson 64) covers it
      properly — creating state, updating it, updating from the previous value, and object/array
      state. This lesson only fixes the vocabulary and the mental model; do not worry yet about
      the syntax details of the hook itself.</div>
      <div class="note"><strong>Two small journal quirks.</strong> The <code>states</code>
      project's <code>main.jsx</code> imports <code>'./student.jsx'</code> in lowercase while the
      file is <code>Student.jsx</code> — Windows does not care, but on Linux/macOS (and in CI)
      that import fails, because module paths are case-sensitive. And in the same project,
      <code>App.jsx</code> is entirely comments — the real entry renders
      <code>Counter</code> directly, which is why <code>main.jsx</code> is the file to read.</div>
    `
  ],
  examples: [
    {
      title: "states/src/main.jsx (journal): mounting the counter",
      from: "journal",
      file: "sorted_files/12_Week-12_Hooks/states/src/main.jsx",
      lang: "jsx",
      code: `
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
//import App from './App.jsx'
import Counter from './student.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <Counter />
  </StrictMode>,
)
`,
      explain: [
        "Same mount pattern as every project so far — createRoot, StrictMode, one component; by now this file should read like plain prose.",
        "<code>import Counter from './student.jsx'</code>: the file on disk is <code>Student.jsx</code> but the import says lowercase, and the <em>default export</em> of that file is the Counter function — the import name (<code>Counter</code>) and the export name need not match, only the path must resolve.",
        "The path does resolve on Windows (case-insensitive) — which is exactly how the journal's version got away with it — but a lowercase <code>'./student.jsx'</code> would fail on Linux or macOS.",
        "<code>App</code> is imported in a comment: this project renders the stateful component directly, so the prop-parent wiring lives in comments (example 4)."
      ],
      run: "cd states && npm install && npm run dev",
      output: "The browser shows:\nCounter App\ncount: 0\n[ Increment ] [ Decrement ]"
    },
    {
      title: "states/src/Student.jsx (journal): a counter with state",
      from: "journal",
      file: "sorted_files/12_Week-12_Hooks/states/src/Student.jsx",
      lang: "jsx",
      code: `
import {useState} from "react";
function Counter(){
    const [count, setCount]= useState(0);

    const increment = () => {
        setCount(count + 1);
    };

    const decrement = () => {
        if (count > 0) {
            setCount(count-1);
        }
    };

    return (
        <div>
        <h2>Counter App</h2>

        <h3>count: {count}</h3>

        <button onClick={increment}>Increment</button>

        <button onClick={decrement}>Decrement</button>

        </div>
      );
      }

      export default Counter;
`,
      explain: [
        "<code>const [count, setCount] = useState(0)</code> asks React for a piece of state with initial value 0. It returns a pair: the current value, and the function that changes it — the array-destructuring you met in the JavaScript preface.",
        "<code>setCount(count + 1)</code> is the <em>only</em> correct way to update state. You never write <code>count = count + 1</code>: the assignment would change a local variable and React would never notice, so nothing would redraw.",
        "<code>onClick=&#123;increment&#125;</code> wires a click to a function — the first interactive wiring in this course; the JSX value is a function reference, not a call.",
        "The <code>if (count &gt; 0)</code> guard on decrement keeps the counter non-negative; note it reads the state value, which is fine for this render's logic.",
        "Shown trimmed to the active Counter function; the file's real content also holds the commented pocketmoney Student of example 3."
      ],
      run: "cd states && npm run dev",
      output: "Click Increment three times:\ncount: 3"
    },
    {
      title: "Student.jsx (journal): pocketmoney prop becomes money state",
      from: "journal",
      file: "sorted_files/12_Week-12_Hooks/states/src/Student.jsx",
      lang: "jsx",
      code: `
//import {useState} from "react";
/*function Student(props){
    const [money , setMoney] = useState(props.pocketmoney); // props.pocketmoney is renamed to money

    return (
        <div>
            <h1>{props.name}</h1>
            <h1>Pocket Money: {money}</h1>

            <button onClick={()=>setMoney(money-100)}>Buy Books 150rs</button>


        </div>
    );
}

export default Student;
*/
`,
      explain: [
        "This half of the file is commented out in the journal, and it is the bridge between Lessons 5 and 6: the parent passes <code>pocketmoney</code> as a prop, and the child copies it into its own state with <code>useState(props.pocketmoney)</code>.",
        "<code>useState(0)</code> is a one-time initial value; <code>useState(props.pocketmoney)</code> means the state starts at whatever the parent sent — after that, the prop and the state are independent (that is the point: spending does not rewrite the parent's data).",
        "<code>onClick={() =&gt; setMoney(money - 100)}</code> wraps the update in an arrow function so it runs on click, not during render.",
        "Uncomment this function (and comment the Counter), render <code>&lt;Student name=\"Sal\" pocketmoney=&#123;1000&#125; /&gt;</code>, and you get the classic demo: money drops by 100 per click while the parent's 1000 stays untouched.",
        "The button label says \"150rs\" but subtracts 100 — a real journal inconsistency; the state code, not the label, decides what happens."
      ],
      run: "cd states && npm run dev (with the Student variant uncommented)",
      output: "Sal\nPocket Money: 1000\n[ Buy Books 150rs ]\nAfter one click: Pocket Money: 900"
    },
    {
      title: "states/src/App.jsx (journal): the parent, as the journal left it",
      from: "journal",
      file: "sorted_files/12_Week-12_Hooks/states/src/App.jsx",
      lang: "jsx",
      code: `
//import Counter from "./Student";

/*function App() {
  return (
    <>
    <Student name="Sal" pocketmoney={1000}/>
    </>
  );
}

export default App;
*/

// 1.use states is a react  hook that allows a component to create and manage the data that can change overtime
//2. whenever this data changes react automatically updates the user interface
// App.jsx is the parent class and student.jsx is the child class but its not necessary that App.jsx is always the parent class
// eg sending messages on whatsapp person1 sending message to person2 . the message sent by person2 cannot alter the message sent by person1 so here the person1 is the parent class the message is the prop and person2 is the child class.
`,
      explain: [
        "The functional part is two lines, both commented: <code>&lt;Student name=\"Sal\" pocketmoney={1000} /&gt;</code> — a string prop and a number prop, the Lesson 5 pattern feeding a stateful child.",
        "<code>&lt;&gt; ... &lt;/&gt;</code> is a fragment: this parent has a single child, but the journal wrapped it anyway — fragments let JSX return several roots with no extra DOM node.",
        "The comments are the journal's own lecture notes: state = data that changes over time; when it changes, React updates the UI automatically.",
        "The WhatsApp analogy in the last comment is worth keeping: the sent message is a prop (the sender's data, unchangeable by the receiver); your own replies are your own state.",
        "A live <code>main.jsx</code> in this project renders Counter directly, so nothing here executes — but the file is exactly how the prop→state bridge would be wired for real."
      ],
      run: "no output as the file stands — everything in it is commented out"
    },
    {
      title: "Why a plain variable cannot drive the screen",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
import { useState } from "react";

// BROKEN attempt — the mistake state exists to prevent
let count = 0;

function BrokenCounter() {
  const handleClick = () => {
    count = count + 1;      // the variable DOES change...
    console.log("count is now", count);
  };

  return (
    <div>
      <h3>Count: {count}</h3>
      <button onClick={handleClick}>Add 1</button>
    </div>
  );
}

export default BrokenCounter;
`,
      explain: [
        "Click the button and the console prints 1, 2, 3 — but the heading never changes. The variable updates; React simply was never told anything happened, so no re-render runs.",
        "This is the conceptual wall this lesson exists to build: React does not watch your variables (nothing in JavaScript can be watched). It re-renders when <em>its</em> state or props change.",
        "The fix is <code>const [count, setCount] = useState(0)</code> plus <code>setCount(count + 1)</code> — the setter both changes the value and schedules the re-render.",
        "Type this one in and watch it fail; the broken counter teaches more in one click than three paragraphs."
      ],
      run: "npx vite (inside a scaffolded project)",
      output: "Browser console on each click:\ncount is now 1\ncount is now 2\n— while the page heading stays \"Count: 0\""
    },
    {
      title: "Props in, state held: both in one component, with a render trace",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
import { useState } from "react";

function Money({ name, pocketmoney }) {          // props: fixed for this render
  const [money, setMoney] = useState(pocketmoney); // state: starts from the prop
  console.log(name, "has", money, "rupees");    // runs on EVERY render

  return (
    <div>
      <h1>{name}: {money} rupees left</h1>
      <button onClick={() => setMoney(money - 100)}>Buy books</button>
    </div>
  );
}

function App() {
  return <Money name="Sal" pocketmoney={1000} />;
}
`,
      explain: [
        "One component, both kinds of data: <code>name</code>/<code>pocketmoney</code> arrive as props; <code>money</code> is the component's own state, seeded from the prop exactly like the journal's Student.",
        "Watch the console while clicking: the <code>console.log</code> line prints again after every click — proof that a state change re-runs the whole function with a new <code>money</code> value (re-rendering, made visible).",
        "<code>money</code> inside the arrow function refers to the value from the render that created that handler; the setter's job is to trigger a fresh render with the new value — a detail Week 12 explores (updating from the previous state).",
        "Change <code>pocketmoney</code> in <code>App</code> and the log's starting number moves too — that is the props half of the equation still working."
      ],
      run: "npx vite (inside a scaffolded project)",
      output: "On mount:\nSal has 1000 rupees\nAfter one click:\nSal has 900 rupees"
    }
  ],
  keyPoints: [
    "State is a component's own private data that can change over time — distinct from props, which are read-only inputs from the parent.",
    "When a component's state changes, React re-runs the component function (a re-render) and patches only the screen differences.",
    "A plain variable can change without React noticing; only the state setter changes data <em>and</em> schedules the redraw.",
    "State can be seeded from a prop — <code>useState(props.pocketmoney)</code> — but from then on the two are independent: spending does not edit the parent.",
    "Props and state together are the two inputs of <code>UI = f(props, state)</code> from Lesson 1 — that formula is now complete.",
    "The journal's Week 11 state material is genuinely partial; the concept lives in Week 12's <code>states</code> project, whose <code>main.jsx</code> also carries a lowercase-import portability bug."
  ],
  practice: `
    <p>Open the journal's <code>sorted_files/12_Week-12_Hooks/states</code> project, run it, and
    click Increment five times while watching the number. Then type example 5 (the broken
    counter) into <code>App.jsx</code>, click it, and confirm from the console that the variable
    moves while the screen does not. Finally, uncomment the <code>Student</code> function in
    <code>Student.jsx</code> and the <code>App</code> block in <code>App.jsx</code>, comment the
    Counter out of <code>main.jsx</code>, and rebuild the pocketmoney demo — one prop in,
    state held, money going down by 100 a click.</p>
  `,
  quiz: [
    {
      q: "Which statement best describes a component's state?",
      options: [
        "Data the parent passes down and the child may edit when needed",
        "Data a component owns privately, which may change over time and triggers a re-render when it does",
        "The HTML attributes of the component's root element",
        "A copy of all the props, kept for performance"
      ],
      answer: 1,
      why: "State is the component's own memory: it starts at an initial value, only the component changes it (via the setter), and each change makes React re-run the component. Props are the read-only parent inputs — option A is exactly what props forbid."
    },
    {
      q: "In the broken counter (example 5), the console shows the number rising but the page never changes. Why?",
      options: [
        "Because console.log and the screen share no connection in React",
        "Because buttons cannot update the DOM in React applications",
        "Because re-renders happen when props change, and props are constant here",
        "Because changing a plain variable does not notify React; only a state setter schedules a re-render"
      ],
      answer: 3,
      why: "React re-renders in response to its own state and prop updates, not to arbitrary JavaScript assignments. The fix is useState so the change goes through setCount, which both updates the value and requests the redraw."
    }
  ],
  sources: [
    "https://react.dev/learn/state-a-components-memory",
    "https://react.dev/learn/render-and-commit",
    "https://react.dev/learn/updating-objects-in-state"
  ]
});
