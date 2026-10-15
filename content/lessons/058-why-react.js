window.COURSE_LESSONS.push({
  id: "w11-why-react",
  file: "058",
  unit: 3,
  week: 11,
  title: "Why React? The declarative component model",
  kicker: "Unit III · Week 11 · Lesson 1 of 6",
  minutes: 15,
  objectives: [
    "Explain what problem React solves compared with updating the DOM by hand",
    "Tell declarative code apart from imperative code",
    "Describe a component as a function of props and state (UI = f(props, state))",
    "Name Vite, JSX and hooks and say what each one is for"
  ],
  intro: `
    <p><strong>This lesson opens Unit III — the front end.</strong> For ten weeks you built the
    <em>back end</em>: Express servers that answer HTTP requests, Sequelize models that talk to
    MySQL, associations that join tables, and finally a REST API that hands out JSON. What you
    never built is the part the user actually sees and clicks. That is what Unit III is about, and
    the tool we use is <strong>React</strong> — the JavaScript library that renders your pages.</p>
    <p>This first lesson is the "why". You will see the pain of updating a web page by hand with
    plain JavaScript, how React replaces that pain with <em>declarative</em> code, and the mental
    model every React developer carries around: a component is a function of its props and its
    state. The next lesson scaffolds a real React project with Vite, so nothing is installed
    yet — read, type nothing.</p>
  `,
  theory: [
    `
      <h3>The problem: keeping the page in sync by hand</h3>
      <p>In plain JavaScript, changing a web page means reaching into the <strong>DOM</strong> —
      the Document Object Model, the tree of objects the browser builds from your HTML — and
      mutating it: <code>document.getElementById(...)</code>, <code>createElement</code>,
      <code>textContent</code>, <code>appendChild</code>, <code>remove</code>. For a static page
      that is fine. For a live interface — a search box that filters as you type, a shopping cart
      that totals itself, a counter button — it turns into a nightmare of <em>imperative</em> code:
      you must remember, yourself, exactly which nodes to patch after every single change.</p>
      <p>Two things go wrong as the interface grows. First, <strong>duplication of truth</strong>:
      your data lives in JavaScript variables, and the same information is written again in the
      DOM. Forget to update one of the two places and the page lies to the user. Second,
      <strong>ordering</strong>: the DOM calls must happen in the right sequence (empty the list,
      rebuild it, re-attach the handlers), and every new feature is a chance to break an old
      sequence. React exists to remove both problems.</p>
    `,
    `
      <h3>Declarative beats imperative</h3>
      <p><strong>Imperative</strong> code tells the computer <em>how</em>: step 1 find the node,
      step 2 clear it, step 3 build new nodes, step 4 attach a click handler, step 5 repeat after
      every change. <strong>Declarative</strong> code tells the computer <em>what</em>: "for this
      data, the screen looks like this" — and lets React work out the how. Example 4 is the same
      counter written the imperative way; example 5 shows the declarative shape React uses.</p>
      <p>The React way is summarised by one tiny formula you will see again and again in this
      unit:</p>
      <pre class="diagram">   UI = f(props, state)

   props (data the parent passes in)  ─┐
                                      ├──▶  your component function  ──▶  markup on screen
   state (data the component owns)    ─┘

   change either one  ──▶  React calls the function again  ──▶  screen updates</pre>
      <p>React keeps a copy of what is on screen, compares it with what your function just
      returned, and touches the real DOM only where they differ. That comparison step is called
      <strong>reconciliation</strong> (often "diffing"), and it is why you never write
      <code>DOM</code> code yourself in React.</p>
    `,
    `
      <h3>Components: functions that return markup</h3>
      <p>The unit of composition in React is the <strong>component</strong> — a plain JavaScript
      function that takes some data in (its <em>props</em>) and returns markup describing how that
      piece of the screen should look. A page is not one giant HTML file; it is a tree of small
      functions: <code>App</code> contains <code>Header</code>, <code>Navbar</code>,
      <code>Content</code>, <code>Footer</code> — exactly how the journal's Week 11 project is
      built (you will read those four files in Lesson 4). Because a component is just a function,
      you can reuse it, pass data into it, and test it like any other function.</p>
      <p>Data flows <strong>down</strong> only: a parent passes props to a child, and the child
      can never reach back up and change the parent. The journal's own notes for Week 11 say it
      plainly (Lesson 5 quotes them in full). Data that changes <em>inside</em> a component is
      <strong>state</strong> — the topic that closes this week (Lesson 6).</p>
    `,
    `
      <h3>The ecosystem in one paragraph</h3>
      <p>Three names will follow you through this unit. <strong>Vite</strong> (pronounced
      "veet") is the build tool and dev server that starts your project, transpiles JSX, and
      refreshes the browser the instant you save a file — the React equivalent of
      <code>npm start</code> on your Express servers. <strong>JSX</strong> is the HTML-like
      syntax you write inside JavaScript files; it is not HTML, and Lesson 3 covers its rules.
      <strong>Hooks</strong> are functions like <code>useState</code> and <code>useEffect</code>
      that give a component extra abilities (memory, side effects) — Unit III's Week 12 is
      entirely about them. Under the hood, the <code>react-dom</code> package is what actually
      puts your components' output into the browser's DOM.</p>
    `
  ],
  examples: [
    {
      title: "src/App.jsx (journal): a component described, not a page ordered",
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
        "This is the journal's first React component. <code>App</code> is an ordinary function that <em>returns markup</em> — there is no <code>document.</code> call anywhere.",
        "Read it as a sentence: \"<em>for this component, the screen is a div containing a heading, two paragraphs, an input and a button</em>\". That is the declarative style — you describe the result, React builds the DOM.",
        "<code>export default App</code> publishes the component so another file (main.jsx) can import it — the same default-export idea you used in every Node module, applied to UI.",
        "The commented-out <code>App1</code> above it in the real file shows the journal's habit of keeping old drafts inline; comments in JSX are written as <code>{/* ... */}</code>, not <code>//</code>, once markup is involved."
      ],
      run: "cd my-react && npm run dev",
      output: "The browser page shows:\nStudent Registration\nfor computer science student\nwelcome to react\n[ Enter your name ]  [ submit ]"
    },
    {
      title: "src/main.jsx (journal): the entry point that mounts the tree",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/my-react/src/main.jsx",
      lang: "jsx",
      code: `
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx' //we put curly brackets as we exported the function
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Content from './components/Content.jsx'
import Navbar from './components/Navbar.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <Header></Header>
    <Navbar></Navbar>
    <Content></Content>
    <Footer></Footer>

  </StrictMode>,
)
//we have removed the app import for now.
`,
      explain: [
        "<code>createRoot(document.getElementById('root'))</code> is the one place React is allowed to touch the DOM: it takes over the empty <code>&lt;div id=\"root\"&gt;</code> from index.html.",
        "This is the React equivalent of <code>const app = express()</code> in your Unit I servers — the file where everything is wired together and started.",
        "The four components inside <code>&lt;StrictMode&gt;</code> are the whole page: Header, Navbar, Content, Footer, in that order. Composing a UI out of small functions is the component model in action.",
        "<code>StrictMode</code> is a development-only wrapper that runs your components extra strictly to surface mistakes; it never appears on the final screen."
      ],
      run: "cd my-react && npm run dev",
      output: "The browser page shows, top to bottom:\nMy College\n[ Home ] [ Course ] [ Contect ]\nReact Course\nLearn React from the Basics  My college"
    },
    {
      title: "index.html (journal): the single empty root React fills",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/my-react/index.html",
      lang: "html",
      code: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>my-react</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
      explain: [
        "Notice what is <em>missing</em>: no <code>&lt;h1&gt;</code>, no content at all. The whole visible page is generated by JavaScript — this file only provides the mount point.",
        "<code>&lt;div id=\"root\"&gt;</code> is the target of <code>createRoot(document.getElementById('root'))</code> in main.jsx. Delete the div and the app crashes with <em>Target container is not a DOM element</em>.",
        "<code>script type=\"module\"</code> is an ES module — the same module system (import/export) you learned in Lesson 16, now used by the browser itself.",
        "In Unit I your servers sent complete HTML pages; a React app flips the model — the server sends an almost-empty page plus a script, and the script draws everything."
      ],
      run: "cd my-react && npm run dev"
    },
    {
      title: "The same counter, written the imperative way",
      from: "new",
      file: "",
      lang: "html",
      code: `
<!doctype html>
<!-- imperative.html: what the counter looks like with NO framework -->
<body>
  <div id="app"></div>
  <script>
    let count = 0;
    const app = document.getElementById("app");

    function render() {
      app.innerHTML = "";
      const h = document.createElement("h1");
      h.textContent = "Count: " + count;
      const btn = document.createElement("button");
      btn.textContent = "Add 1";
      btn.addEventListener("click", () => {
        count = count + 1;
        render();
      });
      app.append(h, btn);
    }
    render();
  </script>
</body>
`,
      explain: [
        "This works — but look at the shape of it: every change means rebuilding the DOM yourself with <code>createElement</code>, <code>textContent</code> and <code>append</code>.",
        "The data (<code>count</code>) and the instructions for drawing it are tangled together in one function you must keep in sync by hand.",
        "Now imagine this is a 40-screen app: a thousand little <code>render()</code> variants, each knowing which nodes to patch. This is exactly the problem React was created to remove.",
        "Save this file and open it in a browser to feel the old way — it is worth 60 seconds of your life."
      ],
      run: "open imperative.html in a browser",
      output: "The page shows:\nCount: 0\n[ Add 1 ]\nClicking the button rebuilds the heading with Count: 1, Count: 2, ..."
    },
    {
      title: "model.js: the React idea in ten lines of plain JavaScript",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// model.js — the heart of React, without React
function render(state) {
  return "<h1>Count: " + state.count + "</h1><button>Add 1</button>";
}

const state = { count: 0 };

console.log(render(state));   // what the screen should look like NOW

state.count = 1;
console.log(render(state));   // change the data, ask again — always in sync
`,
      explain: [
        "This is <code>UI = f(state)</code> made concrete: the output is purely a function of the input data. No DOM calls, no bookkeeping, nothing to forget.",
        "Because <code>render</code> never touches the global world, the same state always produces the same markup — you can test it with <code>console.log</code> like any function.",
        "React is this idea, productionised: instead of returning strings it returns element descriptions, and instead of replacing the whole screen it computes the minimal DOM patch (reconciliation).",
        "Everything in the rest of Unit III — props, state, hooks — is about supplying the inputs to this one function."
      ],
      run: "node model.js",
      output: "<h1>Count: 0</h1><button>Add 1</button>\n<h1>Count: 1</h1><button>Add 1</button>"
    },
    {
      title: "Props in, state held: the two inputs of a component",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
// Greeting reads PROPS — data someone else passes in (Lesson 5)
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Counter holds STATE — data it owns and may change (Lesson 6)
function Counter() {
  const count = 0;
  return (
    <div>
      <h1>Count: {count}</h1>
      <button>Add 1</button>
    </div>
  );
}

// A parent using both:
function App() {
  return (
    <div>
      <Greeting name="Nishant" />
      <Counter />
    </div>
  );
}
`,
      explain: [
        "Both are ordinary JavaScript functions — that is the whole trick of the component model. Props are the parameters; state is the function's own memory.",
        "<code>{name}</code> inside the markup is JSX expression syntax: anything between curly braces is evaluated as JavaScript (Lesson 3 covers every rule).",
        "Because components are functions of their inputs, React can re-run a component whenever its props or state change and trust that the new output matches the new data.",
        "This snippet is a sketch to fix the vocabulary — prop, state, component — before Lessons 5 and 6 build each one properly."
      ],
      run: "npx vite (inside a scaffolded project — see Lesson 2)",
      output: "The browser page shows:\nHello, Nishant!\nCount: 0\n[ Add 1 ]"
    }
  ],
  keyPoints: [
    "React is a UI library: you describe what the screen should look like for a given set of data, and React keeps the real DOM in sync.",
    "Imperative DOM code says <em>how</em> to update the page step by step; declarative React code says <em>what</em> the page is — and avoids the bookkeeping that breaks as apps grow.",
    "A component is a function of props and state that returns markup: <code>UI = f(props, state)</code>.",
    "Data flows one way, parent to child: props go down, and a child can never change its parent's data.",
    "Vite starts and reloads the app, JSX is the HTML-like syntax inside JavaScript files, and hooks (Week 12) give components extra abilities like memory."
  ],
  practice: `
    <p>Open <code>sorted_files/11_Week-11_React-Intro/my-react/src/App.jsx</code> and
    <code>src/main.jsx</code> in an editor and trace the chain with your finger:
    index.html loads main.jsx, main.jsx imports the components, and
    <code>createRoot(...).render(...)</code> puts them inside the empty
    <code>&lt;div id=\"root\"&gt;</code>. Then type example 4 (<code>imperative.html</code>) into
    a scratch file, open it in the browser, click the button, and count how many separate DOM
    instructions you wrote to make one counter work. That count is the reason this unit exists.</p>
  `,
  quiz: [
    {
      q: "In React, who is responsible for updating the real DOM when data changes?",
      options: [
        "React, after comparing what your component returned with what is on screen",
        "You, by writing document.getElementById and textContent after every change",
        "The browser, automatically, whenever a JavaScript variable changes",
        "Vite, which patches the DOM on every file save"
      ],
      answer: 0,
      why: "You only describe the UI for a given state. React compares that description with the current DOM (reconciliation) and applies the minimal changes. Vite only serves and reloads files; the browser never watches your variables."
    },
    {
      q: "Which line best describes the difference between declarative and imperative code?",
      options: [
        "Declarative code is shorter; imperative code is longer",
        "Declarative code runs faster than imperative code",
        "Declarative code states the desired result for a given input; imperative code spells out each step to reach it",
        "Declarative code is only for HTML; imperative code is only for JavaScript"
      ],
      answer: 2,
      why: "The distinction is what vs how. React's render = f(state) is declarative: same data in, same markup out, no steps spelled — versus example 4's step-by-step createElement/append choreography."
    }
  ],
  sources: [
    "https://react.dev/learn/thinking-in-react",
    "https://react.dev/learn/describing-the-ui",
    "https://react.dev/learn"
  ]
});
