window.COURSE_LESSONS.push({
  id: "w14-why-redux",
  file: "075",
  unit: 3,
  week: 14,
  title: "Why Redux? Shared state problems",
  kicker: "Unit III · Week 14 · Lesson 1 of 4",
  minutes: 16,
  objectives: [
    "Describe the three shared-state pains Redux was built for: prop drilling, mystery re-renders and state that distant branches both need",
    "State Redux's five rules in plain words and name the three the official docs list",
    "Decide honestly when useState or useContext is already enough and Redux is not needed",
    "Explain why Redux Toolkit's configureStore and createSlice replaced hand-written constants and switch statements"
  ],
  intro: `
    <p>Week 13 gave your app several pages with React Router, but navigating between pages is
    only half a UI — the <em>data</em> those pages show has to live somewhere that survives the
    trip. This lesson opens Week 14 by asking when React's own <code>useState</code> and
    <code>useContext</code> stop being enough, and what Redux adds: one store, and one log of
    every change. One honesty note before we start: this repository's journal has
    <strong>no Redux lab of its own</strong> — the Week 14 material here comes from a classmate's
    backup project (roll <strong>2408030</strong>, <code>FSD_backup_30/week_14_30</code>), copied
    into <code>sorted_files/14_Week-14_Redux/week_14-by-2408030/</code> and used here with
    attribution; the teaching itself comes from the official docs. Week 15 then connects React to
    a real Node + MySQL back end, where shared client state finally has something real to hold.</p>
  `,
  theory: [
    `
      <h3>Three pains that are really one problem</h3>
      <p>Start with the symptoms every React developer meets. <strong>Prop drilling</strong> is
      passing a value down through components that do not use it, purely so a component five
      levels deeper can reach it — three intermediate components all carry a
      <code>theme</code> prop they never look at. Rename that prop and you edit four files.</p>
      <p>The second pain is the debugging question: <em>"what change caused this
      render?"</em> When the screen misbehaves you sprinkle <code>console.log</code> through your
      components, but a log tells you <em>that</em> a component rendered, never <em>why</em>.
      The answer lives in the state — and in plain React nobody writes the state changes down.</p>
      <p>The third pain appears once your app grows routes: a value needed in two distant
      branches (a cart in the navbar and on the checkout page, a logged-in user in a header and
      in a settings page) has no common ancestor near where it is used, so you lift it to the
      very top — and now everything under the top depends on it.</p>
      <pre class="diagram">App (theme)
 └─ Layout          "I don't use theme, I just pass it"
     └─ Toolbar     "me neither"
         └─ Greeting "I'm the only one that reads it"
 prop drilling: the value travels through hands that never open it</pre>
    `,
    `
      <h3>Redux's answer: one store and a one-way loop</h3>
      <p>Redux (a library for predictable, shared state) solves all three pains with one idea:
      put the <em>global</em> state in a single JavaScript object called the
      <strong>store</strong>, and allow nobody to write to it directly. Components
      <strong>dispatch</strong> an <em>action</em> — a tiny plain object that describes what
      happened — and a <strong>reducer</strong> (a pure function) computes the next state from
      it. The store then tells subscribed components to re-read what they need.</p>
      <pre class="diagram">UI event ──dispatch──▶ action {type,payload} ──▶ reducer (pure fn)
   ▲                                                   │
   └────── re-render ◀── new state ◀───────────────────┘
        (one-way data flow — state never flows backwards)</pre>
      <p>Because every change arrives as an action object, the app keeps a complete,
      replayable history of itself — that is the direct answer to "what change caused this
      render?".</p>
    `,
    `
      <h3>The five principles, in plain words</h3>
      <p>The official docs distill Redux into <strong>three</strong> principles
      (<a href='https://redux.js.org/understanding/thinking-in-redux/three-principles' target='_blank' rel='noopener'>Three
      Principles</a>); this book spells them out as five plain rules, adding the data-flow loop
      and the action log that the same pages describe:</p>
      <ol>
        <li><strong>One store, one object.</strong> All the state you consider global lives in
        one JavaScript object tree — one place to look, one place to check.</li>
        <li><strong>You never write state; you dispatch actions.</strong> Views and callbacks
        only <em>express intent</em> ("increment happened"), so no code can sneak a mutation
        in behind your back.</li>
        <li><strong>Actions are plain data:</strong> <code>{ type, payload }</code> — a string
        saying what happened plus optional data. No functions, no promises, no network calls
        inside, so every action can be logged, stored and replayed.</li>
        <li><strong>Reducers are pure functions:</strong>
        <code>(state, action) => newState</code>. Same inputs, same output; no mutation, no
        side effects — the only legal way to produce a new state.</li>
        <li><strong>One-way loop, full history.</strong> Event → action → reducer → new state →
        render, never backwards; because everything is serializable, the Redux DevTools can
        show the whole timeline and even jump back in it (time travel).</li>
      </ol>
      <p>Memorise the shape, not the wording: <em>store holds state, actions describe change,
      reducers compute the next state, everything flows one way.</em></p>
    `,
    `
      <h3>When you do NOT need Redux (be honest)</h3>
      <p>Redux is a sharp tool, not a badge. If a value is used by <strong>one</strong>
      component, <code>useState</code> is correct; if a handful of nearby components share it,
      lifting state or <code>useContext</code> (Lesson 66) is correct. The Redux style guide
      itself says local values should stay in the nearest component — even Redux apps keep most
      state in <code>useState</code>.</p>
      <ul>
        <li><strong>Still fine without Redux:</strong> form inputs, toggles, a modal's
        open/closed flag, a filter string, anything one screen owns.</li>
        <li><strong>Redux starts earning its place:</strong> the same value is needed by two
        distant branches or must survive route changes; you cannot explain a re-render; you
        want a history of changes for debugging; several features write to the same data.</li>
      </ul>
      <p>Rule of thumb for this course: if drilling the prop or adding one context is still
      readable, do that. Example 5 builds a component where Redux would be pure overhead.</p>
    `,
    `
      <h3>Redux Toolkit: the modern default</h3>
      <p>Old tutorials show "classic" Redux: a <code>createStore</code> call (now deprecated),
      a hand-written constant per action type, a giant <code>switch</code>, and manual spread
      copies of every nested object. Redux Toolkit (RTK) is the official, opinionated package
      that wraps all of that away — the docs say to start with RTK, not with classic Redux.</p>
      <ul>
        <li><code>configureStore()</code> — one call that combines your slice reducers, adds
        the thunk middleware for async work, turns on development checks (accidental
        mutations, non-serializable values) and connects the Redux DevTools automatically.</li>
        <li><code>createSlice()</code> — one call that takes a name, an initial state and
        reducer functions, and generates the action creators <em>and</em> the reducer for you:
        no constants, no switch, no boilerplate action-creator files.</li>
      </ul>
      <p>Example 3 writes the counter by hand the classic way; example 4 writes the
      <em>same</em> counter with RTK — compare how much is left for you to type.</p>
    `
  ],
  examples: [
    {
      title: "Prop drilling: one value carried by three hands that never use it",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
import { useState } from "react";

function App() {
  const [theme, setTheme] = useState("dark");
  return (
    <div>
      <h1>Book shop</h1>
      <Layout theme={theme} setTheme={setTheme} />
    </div>
  );
}

function Layout({ theme, setTheme }) {
  return <Toolbar theme={theme} setTheme={setTheme} />;
}

function Toolbar({ theme, setTheme }) {
  return <Greeting theme={theme} setTheme={setTheme} />;
}

function Greeting({ theme, setTheme }) {
  return (
    <p>
      Theme is {theme}.{" "}
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        Switch
      </button>
    </p>
  );
}

export default App;
`,
      explain: [
        "Only <code>Greeting</code> reads <code>theme</code>, yet <code>Layout</code> and <code>Toolbar</code> must declare and forward it — that is prop drilling, and it grows one layer per component you insert.",
        "<code>setTheme</code> is drilled too, so a rename of either prop touches three files at once — a classic place for a typo that React will not warn you about.",
        "Nothing here is <em>wrong</em>: for two or three levels this is still the clearest code. This is the \"before\" picture Redux is compared against."
      ],
      run: "npm run dev",
      output: "Browser: 'Book shop' + 'Theme is dark. [Switch]' — clicking Switch flips dark/light"
    },
    {
      title: "useContext removes the drilling but not the mystery",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext(null);

function App() {
  const [theme, setTheme] = useState("dark");
  const value = { theme, setTheme };
  return (
    <ThemeContext.Provider value={value}>
      <Toolbar />
      <ThemeSwitcher />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  return <p>Toolbar rendered - no theme prop anywhere.</p>;
}

function ThemeSwitcher() {
  const { theme, setTheme } = useContext(ThemeContext);
  return <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>Theme: {theme}</button>;
}

export default App;
`,
      explain: [
        "Drilling is gone: intermediate components no longer declare props they ignore — <code>useContext</code> (Lesson 66) lets any descendant read the nearest provider's value.",
        "But the debugging questions remain: which component re-rendered, and which change caused it? Context shares values; it keeps no history of changes.",
        "The <code>value={value}</code> object is rebuilt on every render, so <em>every</em> consumer re-renders whenever <code>App</code> does — the same \"who re-rendered and why?\" fog Redux's action log removes."
      ],
      run: "npm run dev",
      output: "Browser: 'Toolbar rendered - no theme prop anywhere.' + button 'Theme: dark'"
    },
    {
      title: "The hand-written classic way: constants, switch, manual copies",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// Pre-Toolkit Redux style: you type every constant, every switch, every copy.
const INCREMENT = "counter/INCREMENT";
const DECREMENT = "counter/DECREMENT";

const initialState = { value: 0 };

function reducer(state = initialState, action) {
  switch (action.type) {
    case INCREMENT:
      return { value: state.value + 1 };
    case DECREMENT:
      return { value: state.value - 1 };
    default:
      return state;
  }
}

let state = reducer(undefined, { type: "@@INIT" });
const history = [];

function dispatch(action) {
  state = reducer(state, action);
  history.push(action.type);
}

dispatch({ type: INCREMENT });
dispatch({ type: INCREMENT });
dispatch({ type: DECREMENT });

console.log("state:", state);
console.log("actions:", history.join(" -> "));
`,
      explain: [
        "<code>reducer(state, action)</code> is the whole contract: it returns a brand-new state object instead of touching the old one (compare <code>{ value: state.value + 1 }</code> — no mutation).",
        "Each action is just <code>{ type: 'counter/INCREMENT' }</code> — plain data, so it can be logged and replayed. Our tiny <code>history</code> array is a poor man's DevTools.",
        "Count the boilerplate: two constants, a switch, a default case, hand-written copies — every action multiplies this. RTK's <code>createSlice</code> writes all of it for you (example 4).",
        "This file needs no library at all, which is the point: Redux is an <em>idea</em> you can implement in 30 lines; the library adds tooling, middleware and scale."
      ],
      run: "node legacy-store.js",
      output: `state: { value: 1 }
actions: counter/INCREMENT -> counter/INCREMENT -> counter/DECREMENT`
    },
    {
      title: "The same counter as Redux Toolkit writes it",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
import { configureStore, createSlice } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    }
  }
});

const store = configureStore({
  reducer: { counter: counterSlice.reducer }
});

store.dispatch(counterSlice.actions.increment());
store.dispatch(counterSlice.actions.increment());
store.dispatch(counterSlice.actions.decrement());

console.log("state:", store.getState());
console.log("first action type:", counterSlice.actions.increment.type);
`,
      explain: [
        "No constants, no switch, no hand-written action creators: <code>createSlice</code> generated the reducer and the action creators <code>increment()</code>/<code>decrement()</code> from the keys of <code>reducers</code>.",
        "The action type string is built for you from <code>name</code> plus the reducer key — that is why it prints <code>counter/increment</code>.",
        "<code>configureStore({ reducer: { counter: ... } })</code> mounts that reducer under the key <code>counter</code>, so state lives at <code>state.counter.value</code> — the exact path Lesson 77's selectors read.",
        "Compare with example 3: same behaviour, roughly half the code, and thunk middleware, mutation checks and DevTools switched on behind the scenes."
      ],
      run: "node rtk-counter.js  (inside week_14-by-2408030, after npm i)",
      output: `state: { counter: { value: 1 } }
first action type: counter/increment`
    },
    {
      title: "When you do NOT need Redux: one component, one useState",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
import { useState } from "react";

function BookSearch() {
  const [query, setQuery] = useState("");
  const books = ["Eloquent JavaScript", "Refactoring", "The Pragmatic Programmer"];
  const hits = books.filter((b) => b.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search books"
      />
      <ul>
        {hits.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

export default BookSearch;
`,
      explain: [
        "<code>query</code> is read by exactly one component — <code>useState</code> is the right and final answer. Moving it to a store would add a slice file, a dispatch and a selector to do this.",
        "Honesty check: a Redux store full of values like this one is a sign the team is cargo-culting, not designing. Local state belongs to the nearest component.",
        "Ask two questions before reaching for Redux: does this value cross distant branches or routes, and do I need a history of its changes? Two \"no\"s → stay with hooks.",
        "This component would change nothing to run inside a Redux app — both styles coexist happily."
      ],
      run: "npm run dev",
      output: "Browser: typing 'ref' filters the list to 'Refactoring'"
    },
    {
      title: "The repo's own Week 14 README — the honest coverage note",
      from: "journal",
      file: "sorted_files/14_Week-14_Redux/README.txt",
      lang: "text",
      code: `
Week 14: COVERED via classmate backup week_14-by-2408030/ (roll 2408030, DO NOT claim as own).
store.js (configureStore) + counterSlice.js (createSlice increment/decrement) + App.jsx (useDispatch/useSelector).
Run inside week_14-by-2408030/ (npm i @reduxjs/toolkit react-redux, npm run dev). No own-lab redux exists.
`,
      explain: [
        "This repository's own note states the facts plainly: Week 14 has <strong>no lab written by the journal owner</strong> — the Redux app comes from a classmate's backup, roll 2408030.",
        "It also tells you exactly what the project contains: <code>store.js</code> (configureStore), <code>counterSlice.js</code> (createSlice) and <code>App.jsx</code> (useDispatch/useSelector) — the three files Lessons 76 and 77 dissect.",
        "The run line is the whole workflow for this week: install the two packages, start Vite, click the buttons. Everything else in this week is taught from the official docs."
      ],
      run: "cd sorted_files/14_Week-14_Redux/week_14-by-2408030; npm i; npm run dev",
      output: "Local: http://localhost:5173/  - browser shows 'Redux Counter', '0' and two buttons"
    },
    {
      title: "package.json: Redux Toolkit is just two dependencies",
      from: "journal",
      file: "sorted_files/14_Week-14_Redux/week_14-by-2408030/package.json",
      lang: "json",
      code: `
{
  "name": "week_14",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@reduxjs/toolkit": "^2.13.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-redux": "^9.3.0"
  }
}
`,
      explain: [
        "Two Redux packages sit beside React: <code>@reduxjs/toolkit</code> (the store/slice library — plain JavaScript, knows nothing about React) and <code>react-redux</code> (the React bindings: <code>Provider</code>, <code>useSelector</code>, <code>useDispatch</code>).",
        "RTK 2.x + react-redux 9.x are the current major versions, and react-redux 9 requires React 18 or newer — this project uses React 19, so the pair matches.",
        "<code>\"type\": \"module\"</code> is why every file in the project uses <code>import</code>/<code>export</code> instead of <code>require</code>.",
        "Everything else in this file is the stock Vite scaffold from Week 11 — Redux added no build tooling at all, just the two dependencies."
      ],
      run: "npm ls @reduxjs/toolkit react-redux  (inside week_14-by-2408030)",
      output: `week_14@0.0.0
├── @reduxjs/toolkit@2.13.0
└── react-redux@9.3.0`
    }
  ],
  keyPoints: [
    "Redux exists for three pains: prop drilling, unexplainable re-renders, and state needed by distant branches or across routes",
    "Five plain rules: one store object, dispatch-only changes, plain {type,payload} actions, pure reducers, one-way loop with a replayable log",
    "The official docs name three of those rules (single source of truth, read-only state, pure reducers); the loop and the log are how this book teaches the same idea",
    "Do NOT reach for Redux when useState or useContext already fits — local values belong in the nearest component, even in Redux apps",
    "Redux Toolkit (configureStore + createSlice) is the modern default: no hand-written constants, no switch, DevTools and checks on by default",
    "This repo has no own Week 14 lab — the counter app is a classmate's backup (roll 2408030), used with attribution; the teaching comes from the official docs"
  ],
  practice: `
    <p>Take example 1 from this lesson and add one more level (<code>Greeting</code> inside a
    <code>Card</code> inside a <code>Page</code>) so the theme must cross five components.
    Feel the friction. Then delete every <code>theme</code> prop and rebuild the same screen
    with <code>createContext</code>/<code>useContext</code> as in example 2. Finally write two
    sentences in your notes: which of the two versions could still not answer "what change
    caused this render?" — and why an action log can. Do this <em>before</em> Lesson 76 installs
    any Redux package.</p>
  `,
  quiz: [
    {
      q: "Which of these is prop drilling?",
      options: [
        "Passing a prop through Layout and Toolbar because the component five levels down needs it",
        "Drilling a bug with console.log until it disappears",
        "Passing state as a default parameter to a function",
        "Rendering the same component twice with different keys"
      ],
      answer: 0,
      why: "Prop drilling means forwarding a value through intermediate components that do not use it themselves — they only carry it deeper. It wastes typing and makes renames risky, and it is Redux's most cited motivation."
    },
    {
      q: "A single component owns a search box's text that no other component reads. What does the Redux style guide (and this lesson) advise?",
      options: [
        "Keep it in useState — local values belong to the nearest component; a store would only add files and indirection",
        "Move it into a Redux slice immediately, because all state must live in one store",
        "Copy it into context as well, so both can render it",
        "Store it in a JavaScript global variable outside React"
      ],
      answer: 0,
      why: "Redux's own style guide says the single-store rule means all <em>global</em> app-wide values, not literally every value. One consumer → useState (or useContext for a few nearby consumers). Redux earns its place only when state is shared widely, survives routes, or needs a change history."
    }
  ],
  sources: [
    "https://redux.js.org/",
    "https://redux-toolkit.js.org/",
    "https://react.dev/reference/react-redux",
    "https://redux.js.org/understanding/thinking-in-redux/three-principles",
    "https://redux.js.org/style-guide/",
    "https://redux.js.org/introduction/why-need-redux"
  ]
});
