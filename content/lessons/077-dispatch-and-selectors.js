window.COURSE_LESSONS.push({
  id: "w14-dispatch-and-selectors",
  file: "077",
  unit: 3,
  week: 14,
  title: "Dispatching actions and reading state with selectors",
  kicker: "Unit III · Week 14 · Lesson 3 of 4",
  minutes: 17,
  objectives: [
    "Use useDispatch() to fire plain actions and payload actions such as incrementByAmount",
    "Write a selector function for useSelector() and explain why components read state.counter.value",
    "Choose the smallest selector that works so unrelated dispatches do not re-render your component",
    "Read a Redux DevTools action log to answer \"what change caused this render?\""
  ],
  intro: `
    <p>Lesson 76 left you with a store wired in <code>main.jsx</code> and a counter slice
    mounted under <code>state.counter</code> — but a store nothing can reach is a tree falling
    in an empty forest. This lesson connects the UI: the classmate's
    <code>src/App.jsx</code> (roll <strong>2408030</strong>'s backup project, used with
    attribution as throughout Week 14) shows both hooks in ten lines, and we will extend the
    slice with a payload action, named selectors and a second slice to see how one store serves
    many features. It is the skill Week 13's multi-page app was missing — a value that stays
    put while routes swap pages underneath it — and Lesson 78 then assembles everything into a
    counter + todo capstone before Week 15 brings a real back end to talk to.</p>
  `,
  theory: [
    `
      <h3>dispatch(): the only door into the store</h3>
      <p><code>useDispatch()</code> is a hook that hands you the store's
      <code>dispatch</code> function — the single legal way to change state. Calling
      <code>dispatch(increment())</code> runs this sequence:</p>
      <ol>
        <li>The action creator <code>increment()</code> builds a plain object
        <code>{ type: "counter/increment" }</code> (Lesson 76).</li>
        <li><code>dispatch</code> sends it to the store; middleware may run first (RTK's
        defaults check the action for mistakes and forward it).</li>
        <li>The store calls the <em>root</em> reducer, which passes the action to every slice
        reducer. Only the slice that has a matching case changes; everything else returns its
        old state, same object identity.</li>
        <li>The store replaces its state with the new one and notifies subscribed components.</li>
        <li>Each <code>useSelector</code> re-runs its selector; React re-renders a component
        only if the selector's result changed (<code>===</code>).</li>
      </ol>
      <pre class="diagram">click -> dispatch(increment()) -> action -> reducer -> new state
                                              -> selectors re-run -> selective re-render</pre>
      <p>Notice what never happens: a component writing into state. Views express
      <em>intent</em> ("this happened"); reducers decide what that means — principle 2 from
      Lesson 75.</p>
    `,
    `
      <h3>useSelector() and selector functions</h3>
      <p><code>useSelector(fn)</code> subscribes the component to the store and calls your
      function with the <strong>whole</strong> state object; whatever it returns becomes the
      hook's result. The classmate's App.jsx passes the function inline:</p>
      <pre class="diagram">const count = useSelector(function(state){
  return state.counter.value;
});</pre>
      <p>The path <code>state.counter.value</code> is not arbitrary: <code>counter</code> is
      the key in <code>configureStore</code>'s reducer map, <code>value</code> is the field in
      the slice's <code>initialState</code>. For reuse and typo-checking, promote the selector
      to a named function exported from the slice file — <code>export const selectCount =
      (state) => state.counter.value;</code> — and import it wherever you need the number.</p>
      <p>Two habits worth forming early: you may call <code>useSelector</code> several times
      in one component (one subscription each), and you should always select the
      <strong>smallest piece you actually render</strong>. Selecting a whole object or a fresh
      array is the classic cause of pointless re-renders — example 5 shows both versions side
      by side.</p>
    `,
    `
      <h3>Payload actions: data along with the news</h3>
      <p>Not every change is a bare "+1". A <strong>payload</strong> is the optional data an
      action carries: dispatching <code>incrementByAmount(5)</code> sends
      <code>{ type: "counter/incrementByAmount", payload: 5 }</code>, and its case reducer
      receives it as <code>action.payload</code>:</p>
      <pre class="diagram">incrementByAmount: (state, action) => {
  state.value += action.payload;
}</pre>
      <p>The rule from Lesson 75 still holds — the payload must be <em>data</em> (a number,
      string, plain object, array), never a function or a promise. Actions describe what
      happened; they do not perform anything.</p>
    `,
    `
      <h3>Many slices, one store</h3>
      <p>Real apps mount several slices by growing the reducer map:
      <code>reducer: { counter: counterReducer, session: sessionReducer }</code>. Each key
      becomes a branch, and every component reads the branch it cares about. When an action is
      dispatched, <em>all</em> slice reducers run — but a slice without a matching case simply
      returns its previous state <strong>unchanged, by reference</strong>. That identity
      preservation is what keeps the rest of the app quiet: a <code>session</code> component's
      selector still returns the same object, so <code>===</code> holds and nothing
      re-renders.</p>
      <p>One action type can also be handled by several slices (a <code>user/loggedOut</code>
      action might clear both the profile and the cart) — you meet that pattern in
      <code>extraReducers</code> when you need it; the beginner default is one slice owning
      each piece of state.</p>
    `,
    `
      <h3>DevTools: the receipt for every change</h3>
      <p>Lesson 75 promised an answer to "what change caused this render?". Install the
      <strong>Redux DevTools</strong> browser extension once (Chrome Web Store / Firefox
      Add-ons) and reload — <code>configureStore</code> connects to it automatically; no code
      changes. The Redux tab then lists every action in order with its type
      (<code>counter/incrementByAmount</code>), shows the state before and after each one, and
      lets you <em>jump</em> the store back to an earlier point to reproduce a bug. An action
      log <em>is</em> the debugging story: click the action that appeared just before the
      wrong render and you have your culprit.</p>
    `
  ],
  examples: [
    {
      title: "App.jsx: the classmate's connected counter, complete",
      from: "journal",
      file: "sorted_files/14_Week-14_Redux/week_14-by-2408030/src/App.jsx",
      lang: "jsx",
      code: `
import { useDispatch, useSelector } from "react-redux";
import {increment,decrement} from "./counterSlice";

function App(){
  const dispatch=useDispatch();
  const count=useSelector(function(state){
    return state.counter.value;
  });

  function handleIncrement(){
    dispatch(increment());
  }

  function handleDecrement(){
    dispatch(decrement());
  }

  return(
    <div>
      <h1>Redux Counter</h1>
      <h2>{count}</h2>
      <button onClick={handleIncrement}>Increment </button>
      <button onClick={handleDecrement}> Decrement</button>
    </div>
  );
}

export default App;`,
      explain: [
        "<code>useSelector(fn)</code> gives the component its slice of state: the function receives the whole store state and returns <code>state.counter.value</code> — the number rendered in the <code>&lt;h2&gt;</code>.",
        "<code>useDispatch()</code> returns the store's dispatch function; the two handlers wrap <code>dispatch(increment())</code> / <code>dispatch(decrement())</code>, the only writes this component is allowed to make.",
        "<code>increment</code> and <code>decrement</code> are the action creators generated by createSlice — calling them builds action objects; dispatching them drives the reducer.",
        "Data flows one way: click -> dispatch -> reducer -> new state -> this selector re-runs -> the <code>&lt;h2&gt;</code> shows the new number. The component never mutates anything.",
        "Everything here is boilerplate-free: three imports, two hooks, two handlers. This is the whole React-Redux surface area for synchronous apps."
      ],
      run: "npm run dev",
      output: "Browser: 'Redux Counter', 0 -> clicking Increment/Decrement moves the number (it stops at 0)"
    },
    {
      title: "Reading state two ways: store.getState() and a selector",
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
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    }
  }
});

const store = configureStore({ reducer: { counter: counterSlice.reducer } });

// A selector: a function from the WHOLE state to the one piece you want.
const selectCount = (state) => state.counter.value;

store.dispatch(counterSlice.actions.incrementByAmount(5));
store.dispatch(counterSlice.actions.increment());

console.log("raw state    :", JSON.stringify(store.getState()));
console.log("selectCount():", selectCount(store.getState()));
`,
      explain: [
        "Outside React there is no hook: <code>store.getState()</code> returns the entire state object — this is exactly what <code>useSelector</code> calls internally before comparing results.",
        "A <em>selector</em> is just a function taking that whole state and returning a part of it. In React you pass it to <code>useSelector(selectCount)</code>; in a script you call it yourself.",
        "Two dispatches, one new state each time: <code>incrementByAmount(5)</code> then <code>increment()</code> land at 6 — actions are processed strictly in order.",
        "Keeping selectors as named functions (not anonymous arrows) means you can reuse them in components, tests and log lines."
      ],
      run: "node read-state.js  (inside week_14-by-2408030, after npm i)",
      output: `raw state    : {"counter":{"value":6}}
selectCount(): 6`
    },
    {
      title: "A slice with a payload action and a named selector",
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
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    }
  }
});

// Exported next to the actions, so components import all three together.
export const selectCount = (state) => state.counter.value;
export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;

console.log("action object:", JSON.stringify(incrementByAmount(5)));
`,
      explain: [
        "The new case reducer <code>incrementByAmount</code> reads <code>action.payload</code> — the data you passed to <code>incrementByAmount(5)</code> arrives as <code>payload: 5</code>.",
        "Immer still applies: <code>state.value += action.payload</code> mutates a draft and produces a new state object.",
        "<code>selectCount</code> is exported beside the action creators — the standard RTK file layout: actions to write, selectors to read, one default-exported reducer for the store.",
        "Compare the printed object with Lesson 75's principle 3: plain data, only a type and a payload — serializable, loggable, replayable."
      ],
      run: "node counter-slice-v2.js  (inside week_14-by-2408030, after npm i)",
      output: `action object: {"type":"counter/incrementByAmount","payload":5}`
    },
    {
      title: "A component that fires plain and payload actions",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
import { useDispatch, useSelector } from "react-redux";
import {
  increment,
  decrement,
  incrementByAmount,
  selectCount
} from "./counterSlice";

function Counter() {
  const count = useSelector(selectCount);
  const dispatch = useDispatch();

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(decrement())}>-1</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
      <button onClick={() => dispatch(incrementByAmount(-10))}>-10</button>
    </div>
  );
}

export default Counter;
`,
      explain: [
        "Payload actions are ordinary calls with an argument: <code>dispatch(incrementByAmount(5))</code> — the number travels inside the action as <code>payload</code>.",
        "A negative payload (<code>-10</code>) works with no extra reducer: the same case reducer adds whatever it is given, which is why payloads beat one-reducer-per-value explosion.",
        "<code>useSelector(selectCount)</code> reuses the named selector from example 3 instead of an inline arrow — the path <code>state.counter.value</code> is written exactly once in the app.",
        "Each handler is a one-liner arrow function because <code>dispatch</code> is stable: it never changes identity, so no memoisation is needed for these."
      ],
      run: "npm run dev",
      output: "Browser: 'Count: 0' -> +5 shows 5, -10 shows -5, +1 shows -4 (state lives in the store, not in this component)"
    },
    {
      title: "Selector granularity: why one version re-renders and the other does not",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
import { useSelector } from "react-redux";

// BAD: a fresh object on every call. The reference always changes, so React
// re-renders this component after EVERY dispatch - even session ones.
function BadCounter() {
  const counter = useSelector((state) => ({ ...state.counter }));
  return <p>Built a new object: {counter.value}</p>;
}

// GOOD: a primitive from the smallest slice. '=== 0' stays true while other
// slices act, so this component does not re-render.
function GoodCounter() {
  const value = useSelector((state) => state.counter.value);
  return <p>Stable value: {value}</p>;
}

export { BadCounter, GoodCounter };
`,
      explain: [
        "react-redux compares the previous and next selector result with strict <code>===</code>: different reference -> re-render, same reference -> stay quiet.",
        "<code>({ ...state.counter })</code> allocates a new object each call, so the comparison always fails — your component becomes a follower of every action in the app.",
        "Selecting a primitive (<code>state.counter.value</code>) is the sweet spot: it only changes when the value actually changes.",
        "Selecting the slice object itself (<code>state.counter</code>) is also safe <em>while</em> its reducer only mutates nested fields (Immer keeps the outer reference) — but selecting primitives is the habit that never bites.",
        "Rule: never call <code>.map</code>/<code>.filter</code>/<code>Object.keys</code> inside a selector and return the result — derive it with useMemo instead, or select the raw list."
      ],
      run: "npm run dev",
      output: "Browser console: dispatching a session action re-renders BadCounter, leaves GoodCounter untouched"
    },
    {
      title: "Two slices in one store: each action only touches its own branch",
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
    }
  }
});

const sessionSlice = createSlice({
  name: "session",
  initialState: { user: null, theme: "dark" },
  reducers: {
    signIn: (state, action) => {
      state.user = action.payload;
    },
    signOut: (state) => {
      state.user = null;
    }
  }
});

const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    session: sessionSlice.reducer
  }
});

store.dispatch(counterSlice.actions.increment());
store.dispatch(sessionSlice.actions.signIn("nishant"));
console.log("after sign-in:", JSON.stringify(store.getState()));
store.dispatch(sessionSlice.actions.signOut());
console.log("after signOut:", JSON.stringify(store.getState()));
`,
      explain: [
        "The reducer map now has two keys, so the state has two branches: <code>state.counter</code> and <code>state.session</code> — one store, as the first principle demands.",
        "The <code>signIn</code> action does not mention the counter, yet every slice reducer runs on it: <code>counterSlice</code> has no matching case and returns its old state unchanged.",
        "After <code>signOut</code> the counter is still <code>{ value: 1 }</code> — untouched, same reference, so counter components do not re-render.",
        "This is how the capstone in Lesson 78 adds todos: one more slice, one more key, zero edits to the counter code."
      ],
      run: "node two-slices.js  (inside week_14-by-2408030, after npm i)",
      output: `after sign-in: {"counter":{"value":1},"session":{"user":"nishant","theme":"dark"}}
after signOut: {"counter":{"value":1},"session":{"user":null,"theme":"dark"}}`
    },
    {
      title: "Redux DevTools: reading the change history",
      from: "new",
      file: "",
      lang: "text",
      code: `
Redux DevTools - the receipt for "what change caused this render?"

1. Install the browser extension "Redux DevTools"
   (Chrome Web Store or Firefox Add-ons). There is no npm package to add
   and no code to write: configureStore connects to it automatically
   (the devTools option defaults to true).
2. Start the app (npm run dev), open the browser DevTools, find the "Redux" tab.
3. Click buttons in the app. The left column lists every action in order:
       counter/increment
       counter/incrementByAmount
       session/signIn
   The right column shows the full state tree after the selected action,
   with a diff view against the previous one.
4. Select an action to inspect state at THAT moment; "Jump to this state"
   resets the store back to it so you can re-run the broken UI path.
5. Use the action filter box to hide noisy types while testing.
`,
      explain: [
        "Every entry in the left column is one action object — the same <code>{ type, payload }</code> data from examples 3 and 4, now recorded instead of lost.",
        "Selecting an action shows state before/after it, which turns 'the number flickered' into 'counter/incrementByAmount set value to -10 right before the flicker'.",
        "Because reducers are pure and state is serializable (Lesson 75's principles 4 and 5), the extension can rebuild any earlier state — that is what time travel debugging is.",
        "If the Redux tab is missing: the extension is not installed, or the app builds for production where DevTools can be turned off with the <code>devTools</code> option."
      ]
    }
  ],
  keyPoints: [
    "dispatch(action) is the only legal way to change state; the reducer runs, slices without a matching case keep their old object",
    "useSelector(fn) hands your function the whole state and returns the piece you asked for; the classmate's inline selector is state.counter.value",
    "Payload actions carry data: incrementByAmount(5) sends {type, payload:5} and the case reducer reads action.payload",
    "Export named selectors (selectCount) from the slice file next to the action creators — one place owns the state path",
    "Select the smallest value you render: returning fresh objects or arrays from a selector defeats the === check and re-renders on every action",
    "Redux DevTools (browser extension, auto-connected by configureStore) logs every action and can jump the store back in time"
  ],
  practice: `
    <p>In a copy of <code>week_14-by-2408030</code>, add <code>incrementByAmount</code> and
    <code>selectCount</code> exactly as in example 3, then add a <code>+5</code> button to
    <code>App.jsx</code> with <code>onClick={() =&gt; dispatch(incrementByAmount(5))}</code>.
    Run <code>npm run dev</code>, click around, and if you have the Redux DevTools extension,
    confirm each click produces one entry (<code>counter/incrementByAmount</code>) with the
    payload <code>5</code> and the counter branch changing while <code>counter.value</code>
    in the log matches your screen.</p>
  `,
  quiz: [
    {
      q: "In useSelector((state) => state.counter.value), where does the path 'counter' come from?",
      options: [
        "The key in configureStore's reducer map: reducer: { counter: counterReducer } creates state.counter",
        "The name field of createSlice — all slices are stored under their name automatically",
        "The component that dispatched the last action",
        "react-redux flattens state by hook name"
      ],
      answer: 0,
      why: "createSlice's name builds action type strings (counter/increment); the reducer map's key builds the state branch (state.counter). Value then comes from the slice's initialState field, so the full selector path is key + field: state.counter.value."
    },
    {
      q: "A component uses useSelector((state) => ({ ...state.counter })) and re-renders after every action in the app. Why?",
      options: [
        "The selector returns a brand-new object each call, so react-redux's strict === check always sees a 'changed' result",
        "Spread always mutates the store, triggering a global update",
        "useSelector runs on every dispatch by design, regardless of results",
        "The Provider re-mounts the whole tree when state changes"
      ],
      answer: 0,
      why: "react-redux only re-renders when the selector's result differs from last time, compared with ===. A fresh object always differs. Select a primitive (state.counter.value) or a stable reference instead, and the component stays quiet until its own data really changes."
    }
  ],
  sources: [
    "https://redux.js.org/",
    "https://redux-toolkit.js.org/",
    "https://react.dev/reference/react-redux",
    "https://react-redux.js.org/api/hooks",
    "https://redux-toolkit.js.org/api/createSlice",
    "https://github.com/reduxjs/redux-devtools"
  ]
});
