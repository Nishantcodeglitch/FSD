window.COURSE_LESSONS.push({
  id: "w14-store-and-slices",
  file: "076",
  unit: 3,
  week: 14,
  title: "The store and slices with Redux Toolkit",
  kicker: "Unit III · Week 14 · Lesson 2 of 4",
  minutes: 18,
  objectives: [
    "Install @reduxjs/toolkit and react-redux and say what each package is for",
    "Read a createSlice definition and predict the action types and initial state it generates",
    "Wrap an app in Provider store={store} and wire slice reducers with configureStore",
    "Explain how Immer lets reducers look like mutations while the store itself never mutates"
  ],
  intro: `
    <p>Lesson 75 argued for one store holding your global state; this lesson builds exactly
    that, line by line, on the classmate's Week 14 counter app — <code>src/main.jsx</code>,
    <code>src/store.js</code> and <code>src/counterSlice.js</code> from
    <code>sorted_files/14_Week-14_Redux/week_14-by-2408030/</code>. As before, that project is
    a <strong>classmate's backup (roll 2408030)</strong>, not this journal's own lab, and is
    used with attribution; the explanations come from the official Redux Toolkit docs. Keep the
    Week 13 app in mind while you read: the routes React Router mounts and unmounts are exactly
    where a store-backed value (a logged-in user, a cart) has to outlive any single page.
    Lesson 77 then makes the components talk to this store with <code>useDispatch</code> and
    <code>useSelector</code>, and Week 15 puts real server data behind it.</p>
  `,
  theory: [
    `
      <h3>Two packages, two jobs</h3>
      <p>Redux in React always means two installs, and confusing them is the classic beginner
      mistake:</p>
      <ul>
        <li><code>@reduxjs/toolkit</code> (RTK) — the engine. Pure JavaScript: it builds
        stores, slices, actions and reducers. It never imports React, so you could use it in a
        Node script or a mobile app.</li>
        <li><code>react-redux</code> — the bridge. It provides the <code>&lt;Provider&gt;</code>
        component and the hooks (<code>useSelector</code>, <code>useDispatch</code>) that let
        React components read from and write to the store. It requires React 18 or newer.</li>
      </ul>
      <pre class="diagram">npm i @reduxjs/toolkit react-redux
  RTK  ---> store + slices (logic)
  react-redux ---> Provider + hooks (binding)</pre>
    `,
    `
      <h3>createSlice: state, actions and reducer in one call</h3>
      <p>A <strong>slice</strong> is one self-contained piece of your global state — the
      counter, the todos, the logged-in user — plus everything needed to change it.
      <code>createSlice</code> takes one configuration object with three fields you write:</p>
      <ul>
        <li><code>name</code> — a short label used to build action type strings:
        name <code>"counter"</code> + reducer key <code>increment</code> becomes
        <code>"counter/increment"</code>.</li>
        <li><code>initialState</code> — the value the slice starts with, e.g.
        <code>{ value: 0 }</code>.</li>
        <li><code>reducers</code> — an object of <em>case reducers</em>. Each key is an action
        name; each function is <code>(state, action) => void</code> and describes how the state
        changes for that action.</li>
      </ul>
      <p>It returns an object with a <code>reducer</code> (to hand to the store) and an
      <code>actions</code> object of generated action creators — that is why the classmate's
      file ends with
      <code>export const { increment, decrement } = counterSlice.actions;</code> and
      <code>export default counterSlice.reducer;</code>. You never hand-write an action type
      string or a <code>switch</code> anywhere.</p>
    `,
    `
      <h3>configureStore: wiring the slices together</h3>
      <p>The store is created once, at startup, by <code>configureStore</code>. Its
      <code>reducer</code> option takes an <em>object map</em>: each key becomes a branch of
      the global state. The classmate's file mounts one slice:</p>
      <pre class="diagram">configureStore({ reducer: { counter: counterReducer } })
                    │
state =  ───────────┴──▶ { counter: { value: 0 } }
                        key comes from the map, shape from the slice's initialState</pre>
      <p>One call also switches on the defaults RTK is loved for: <code>combineReducers</code>
      behind the scenes, thunk middleware (Lesson 78's async work would need it), development
      warnings for accidental mutations and non-serializable values, and the Redux DevTools
      connection. The two <code>console.log</code> lines at the bottom of the journal's file
      are a nice beginner habit: print the store and its state the moment the app boots.</p>
    `,
    `
      <h3>Provider: giving the whole tree access to the store</h3>
      <p>React has no way of knowing a store exists unless you publish it. React Redux's
      <code>&lt;Provider store={store}&gt;</code> puts the store into React's context at the
      very top of the tree, so any component — however deep — can call the hooks. In the
      journal's <code>main.jsx</code> it wraps <code>&lt;App/&gt;</code> inside
      <code>StrictMode</code>.</p>
      <p>Forget it, and every hook fails immediately with a loud, useful error:
      <code>Could not find "store" in the context of ...</code>. The Provider is also why the
      store is imported in exactly one file: creating a second store would split your app into
      two universes.</p>
    `,
    `
      <h3>Immer: mutation syntax inside reducers, immutability outside</h3>
      <p>Redux's rule is "state is read-only" — but the classmate's reducer writes
      <code>state.value += 1</code>, which <em>looks</em> like mutation. The trick is
      <strong>Immer</strong>, a small library bundled inside RTK. Inside a case reducer your
      <code>state</code> is a <em>draft</em> proxy: changes you make to the draft are recorded,
      and when the reducer returns, Immer produces a brand-new object containing your changes.
      So reducers read like mutations and stay immutable.</p>
      <ul>
        <li><strong>Allowed:</strong> mutate the <code>state</code> argument inside a
        reducer — <code>state.value += 1</code>, <code>state.todos.push(todo)</code>,
        <code>state.user.name = "Ada"</code>.</li>
        <li><strong>Forbidden:</strong> mutate anything you got from the store outside a
        reducer — in a component, an event handler, a utility. The store's object identity
        never changes silently, so React would not re-render and DevTools time travel would
        show a history that is already corrupted.</li>
        <li>Also forbidden: mutating state you kept from an <em>earlier</em> render, or
        mutating objects that were spliced into the store by mistake — share data by copying,
        not by handing out live references.</li>
      </ul>
      <p>One honest note on the classmate's slice: the <code>else</code> branch of
      <code>decrement</code> contains <code>state.value == 0;</code> — a comparison whose
      result is thrown away, so it does nothing. Harmless, but it is exactly the kind of line
      a reviewer should flag: the guard already keeps the value at zero.</p>
    `,
    `
      <h3>File layout of the Week 14 app</h3>
      <p>Redux projects keep the same shape as this one, growing a folder per feature as they
      scale:</p>
      <pre class="diagram">week_14-by-2408030/
├── package.json          dependencies: @reduxjs/toolkit, react-redux
├── vite.config.js        Vite + React plugin (same scaffold as Week 11)
├── index.html            mounts #root
└── src/
    ├── main.jsx          createRoot + &lt;Provider store={store}&gt;
    ├── store.js          configureStore({ reducer: { counter } })
    ├── counterSlice.js   createSlice + exported actions/reducer
    ├── App.jsx           useSelector + useDispatch  (Lesson 77)
    ├── App.css           styles</pre>
      <p>Read the arrow of dependency: <code>counterSlice.js</code> knows nothing about the
      store; <code>store.js</code> imports the slice; <code>main.jsx</code> imports the store;
      components import the slice's actions and the hooks. Nothing imports upwards.</p>
    `
  ],
  examples: [
    {
      title: "Install the two packages and start the app",
      from: "new",
      file: "",
      lang: "bash",
      code: `
cd sorted_files/14_Week-14_Redux/week_14-by-2408030
npm i @reduxjs/toolkit react-redux
npm run dev
`,
      explain: [
        "Run these <em>inside</em> the classmate's project folder — its <code>package.json</code> already lists both packages, so a plain <code>npm i</code> installs them at the pinned versions too.",
        "<code>@reduxjs/toolkit</code> is the engine, <code>react-redux</code> is the React binding; you always need both for a React + Redux app.",
        "<code>npm run dev</code> runs Vite (the script from Week 11's scaffold) and serves the counter app on a local port."
      ],
      run: "npm i @reduxjs/toolkit react-redux; npm run dev",
      output: "Local: http://localhost:5173/  - browser shows 'Redux Counter', '0', [Increment] [Decrement]"
    },
    {
      title: "main.jsx: publishing the store with Provider",
      from: "journal",
      file: "sorted_files/14_Week-14_Redux/week_14-by-2408030/src/main.jsx",
      lang: "jsx",
      code: `
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {store} from './store.js'
import {Provider} from "react-redux"


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <App/>
    </Provider>
  </StrictMode>,
)`,
      explain: [
        "<code>import {store} from './store.js'</code> pulls in the one store built by configureStore — named export, because store.js exports it as <code>export const store</code>.",
        "<code>&lt;Provider store={store}&gt;</code> publishes that store through React context so every descendant can call <code>useSelector</code>/<code>useDispatch</code>; without it those hooks throw \"Could not find store in the context\".",
        "The Provider wraps <code>&lt;App/&gt;</code> inside <code>StrictMode</code> — top of the tree, one store, one source of truth (principle 1 from Lesson 75).",
        "This is the only file in the app that imports the store object directly; components go through the hooks instead."
      ],
      run: "npm run dev",
      output: "Browser renders App with the Redux store available to it"
    },
    {
      title: "store.js: configureStore wiring the counter slice",
      from: "journal",
      file: "sorted_files/14_Week-14_Redux/week_14-by-2408030/src/store.js",
      lang: "javascript",
      code: `
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice.js"

export const store=configureStore({
    reducer:{
        counter:counterReducer
    }
});

console.log("Redux store:",store);
console.log("Current state",store.getState());`,
      explain: [
        "<code>counterReducer</code> is the slice's default export; the key <code>counter:</code> is the branch name — it is the reason components later read <code>state.counter.value</code>.",
        "<code>configureStore</code> merges the slice's <code>initialState</code> into the store, so the app boots with <code>{ counter: { value: 0 } }</code>.",
        "<code>store.getState()</code> is the plain-JavaScript way to read the whole state — handy in Node scripts and exactly what DevTools does behind the scenes.",
        "The two console.logs run once when the module loads: the store object (with <code>getState</code>, <code>dispatch</code>, <code>subscribe</code>) followed by its current state.",
        "Adding a second slice later means one more line in this map — the rest of the app does not change."
      ],
      run: "node src/store.js  (inside week_14-by-2408030, after npm i)",
      output: `Redux store: { ... }   (Object containing getState, dispatch, subscribe)
Current state { counter: { value: 0 } }`
    },
    {
      title: "counterSlice.js: createSlice with initialState and reducers",
      from: "journal",
      file: "sorted_files/14_Week-14_Redux/week_14-by-2408030/src/counterSlice.js",
      lang: "javascript",
      code: `
import {createSlice} from "@reduxjs/toolkit"
const counterSlice=createSlice({
    name:"counter",
    initialState:{
        value:0
    },
    reducers:{
        increment:(state)=>{
            state.value += 1;
        },
        decrement:(state)=>{
            if(state.value!=0){
                state.value -= 1;
            }
            else{
                state.value==0;
            }
        }
    }
});

export const { increment, decrement }= counterSlice.actions;

export default counterSlice.reducer;`,
      explain: [
        "<code>name: \"counter\"</code> + reducer keys generate the action types <code>counter/increment</code> and <code>counter/decrement</code> — no constants file exists and none is needed.",
        "<code>state.value += 1</code> is legal inside a reducer: Immer treats <code>state</code> as a draft and produces a new object when the reducer returns.",
        "<code>export const { increment, decrement } = counterSlice.actions;</code> unpacks the generated action creators — calling <code>increment()</code> later builds a ready-made action object.",
        "<code>export default counterSlice.reducer;</code> is what store.js imports; the default-export/ named-exports split is the standard RTK file pattern.",
        "Spot the dead line: <code>state.value==0;</code> compares and discards — it changes nothing. Clean version: <code>if (state.value > 0) state.value -= 1;</code>"
      ],
      run: "npm run dev  (this module is imported by src/store.js)",
      output: "No output of its own — it defines the slice that store.js mounts under 'counter'"
    },
    {
      title: "What an action really is: the objects createSlice generates",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
import { createSlice } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    }
  }
});

const plain = counterSlice.actions.increment();
const withPayload = counterSlice.actions.incrementByAmount(5);

console.log("no-arg action:", JSON.stringify(plain));
console.log("payload action:", JSON.stringify(withPayload));
console.log("type strings:", counterSlice.actions.increment.type, "|", counterSlice.actions.incrementByAmount.type);
`,
      explain: [
        "An action is a <em>plain object</em>: a <code>type</code> string saying what happened, plus an optional <code>payload</code> carrying data. Nothing else belongs in it — that is what makes actions loggable and replayable.",
        "<code>increment()</code> takes no argument, so its action has no payload; <code>incrementByAmount(5)</code> puts <code>5</code> into <code>payload</code>, and the case reducer reads it as <code>action.payload</code>.",
        "The type strings are assembled from the slice <code>name</code> and the reducer key — the <code>/</code> naming also guarantees two slices can both have an <code>increment</code> without clashing.",
        "Action creators are just functions returning these objects; dispatching one is the only legal way to change state."
      ],
      run: "node action-anatomy.js  (inside week_14-by-2408030, after npm i)",
      output: `no-arg action: {"type":"counter/increment"}
payload action: {"type":"counter/incrementByAmount","payload":5}
type strings: counter/increment | counter/incrementByAmount`
    },
    {
      title: "Why mutating OUTSIDE a reducer corrupts the previous state",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
// Spread copies the object - but only one level deep.
const stateInStore = { authors: ["Ursula K. Le Guin"] };
const next = { ...stateInStore };

next.authors.push("Octavia E. Butler");

console.log("same array object?", stateInStore.authors === next.authors);
console.log("store state now:", JSON.stringify(stateInStore));
console.log("next state      :", JSON.stringify(next));
`,
      explain: [
        "<code>{ ...stateInStore }</code> copies the <em>outer</em> object only — <code>next.authors</code> and <code>stateInStore.authors</code> are still the same array.",
        "Pushing to it therefore rewrites the \"old\" state: the store now holds a history in which the previous state was never true. React's <code>===</code> comparison also sees no identity change, so nothing re-renders.",
        "This is exactly what Redux's read-only rule protects against, and why mutation is only safe on Immer's draft <em>inside</em> a reducer — there Immer tracks the changes and returns a genuinely new object.",
        "RTK's development-mode middleware detects this class of mistake and logs a warning naming the offending action, before your UI ever misbehaves."
      ],
      run: "node mutate-outside.js",
      output: `same array object? true
store state now: {"authors":["Ursula K. Le Guin","Octavia E. Butler"]}
next state      : {"authors":["Ursula K. Le Guin","Octavia E. Butler"]}`
    },
    {
      title: "Immer done right: push inside a reducer, dispatch outside",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
import { configureStore, createSlice, nanoid } from "@reduxjs/toolkit";

const booksSlice = createSlice({
  name: "books",
  initialState: { authors: ["Ursula K. Le Guin"] },
  reducers: {
    // state is an Immer draft here: mutation syntax, immutable result.
    addAuthor: (state, action) => {
      state.authors.push(action.payload);
    },
    renameFirst: (state, action) => {
      state.authors[0] = action.payload;
    }
  }
});

const store = configureStore({ reducer: { books: booksSlice.reducer } });

store.dispatch(booksSlice.actions.addAuthor("Octavia E. Butler"));
store.dispatch(booksSlice.actions.renameFirst("Ursula K. Le Guin (aka L. K. Le Guin)"));

console.log("id sample:", nanoid(6));
console.log("state:", JSON.stringify(store.getState()));
`,
      explain: [
        "<code>push</code> and index assignment inside a reducer are the Immer pattern: mutate the draft freely, return nothing — Immer builds the next state for you.",
        "The same two operations in a component would be forbidden (example 6): only reducers may write, and only by dispatching actions.",
        "<code>nanoid</code> ships with RTK and is the standard way to mint the unique ids Lesson 78's todos slice needs.",
        "Note the immutability survives: after each dispatch the previous state object is untouched, so DevTools can still replay the exact history."
      ],
      run: "node immer-right.js  (inside week_14-by-2408030, after npm i)",
      output: `id sample: Xf3Qa9
state: {"books":{"authors":["Ursula K. Le Guin (aka L. K. Le Guin)","Octavia E. Butler"]}}`
    }
  ],
  keyPoints: [
    "Two packages: @reduxjs/toolkit builds stores and slices (no React), react-redux provides Provider and the hooks (needs React 18+)",
    "createSlice({name, initialState, reducers}) generates the reducer AND the action creators; action types become name/key like 'counter/increment'",
    "configureStore's reducer map sets the state shape: the key 'counter' is why components read state.counter.value",
    "Provider must wrap the app in main.jsx — without it the hooks throw 'Could not find store in the context'",
    "Immer lets reducers use mutation syntax (state.value += 1, state.todos.push(x)) while producing a new object; mutating store data outside a reducer is always wrong",
    "The classmate's decrement contains a dead line (state.value==0;) — comparisons do nothing; the guard above it already prevents negative values"
  ],
  practice: `
    <p>Inside a <em>copy</em> of <code>week_14-by-2408030</code>, add a third reducer to
    <code>counterSlice.js</code> called <code>reset</code> that sets
    <code>state.value = 0</code>, export it alongside <code>increment</code>/<code>decrement</code>,
    and print <code>counterSlice.actions.reset().type</code> with a tiny Node script to see the
    generated action type. Then run <code>node src/store.js</code> and confirm the boot output
    still says <code>{ counter: { value: 0 } }</code>. (Wiring the button into the UI is
    Lesson 77's job — do not touch <code>App.jsx</code> yet.)</p>
  `,
  quiz: [
    {
      q: "Why does state.value += 1 work inside a createSlice reducer even though Redux state is read-only?",
      options: [
        "Immer wraps state in a draft inside reducers: your mutation is recorded and a brand-new state object is produced when the reducer returns",
        "Redux only enforces read-only state in production builds",
        "Reducers run before the state exists, so mutating it has no effect",
        "The += operator is rewritten by Babel into an immutable update"
      ],
      answer: 0,
      why: "RTK includes Immer. Inside a case reducer you get a draft proxy — mutate it however you like; Immer snapshots the original, applies your changes and returns a genuinely new object, so the previous state stays intact for React's === checks and DevTools replay."
    },
    {
      q: "The app shows the error 'Could not find \"store\" in the context'. What is missing?",
      options: [
        "The <code>&lt;Provider store={store}&gt;</code> wrapper in main.jsx — hooks reach the store through React context, which the Provider publishes",
        "A second configureStore call inside the component",
        "The useSelector selector function",
        "The action type string in the slice"
      ],
      answer: 0,
      why: "react-redux's hooks look up the nearest Provider in the React tree. Without it there is no store to find, and the library fails fast with that exact message. The fix is one wrapper in the entry file, not more store code."
    }
  ],
  sources: [
    "https://redux.js.org/",
    "https://redux-toolkit.js.org/",
    "https://react.dev/reference/react-redux",
    "https://redux-toolkit.js.org/api/createSlice",
    "https://redux-toolkit.js.org/api/configureStore",
    "https://immerjs.github.io/immer/"
  ]
});
