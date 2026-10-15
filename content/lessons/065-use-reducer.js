window.COURSE_LESSONS.push({
  id: "w12-use-reducer",
  file: "065",
  unit: 3,
  week: 12,
  title: "useReducer",
  kicker: "Unit III · Week 12 · Lesson 2 of 7",
  minutes: 18,
  objectives: [
    "Describe the reducer pattern: state in, action in, new state out",
    "Wire useReducer, dispatch and a reducer function into a component",
    "Spot and fix the dispatchEvent bug in the journal's lab19 file",
    "Choose between useState and useReducer using a clear decision table"
  ],
  intro: `
    <p>Lesson 064 gave you <code>useState</code> — one value, one setter. That is perfect for a counter
    or a toggle. But what happens when one button must update <em>three</em> related values at once, or
    when the same widget needs a dozen different transitions? Passing
    <code>setCount(count + 1)</code> around starts to get messy. Your own
    <code>lab19/notes.txt</code> names the escape hatch: <em>"useReducer … is a builtin react hook
    designed to manage complex state logic in functional components."</em></p>
    <p>This lesson teaches the reducer pattern with the journal's own
    <code>lab19/src/useReducer.js</code> — a file with a real, preserved bug in it. You will see it
    broken first, understand exactly why it fails, and then fix it.</p>
  `,
  theory: [
    `
      <h3>The problem: state logic scattered across handlers</h3>
      <p>Imagine a shopping cart with <code>items</code>, <code>coupon</code> and
      <code>step</code> (checkout stage: cart → address → payment → done). Every button must update a
      <em>different combination</em> of those three values, and some buttons must update two at once.
      With plain <code>useState</code> you end up with a handler per button, each calling three setters,
      and the rules for what may change when are smeared across the component. Bugs hide in that smear:
      one handler forgets to reset <code>coupon</code> when <code>step</code> changes back.</p>
      <p>The fix is to <strong>pull all the transition rules into one pure function</strong> and let a
      tiny hook hold it. That is the whole idea of <code>useReducer</code>.</p>
    `,
    `
      <h3>The pattern: state + action → reducer → new state</h3>
      <p>A <strong>reducer</strong> is a pure function with two inputs and one output:
      <code>reducer(state, action)</code> receives the current state and a small
      <strong>action</strong> object describing <em>what happened</em>, and returns the next state. It
      never touches the outside world — no fetching, no <code>alert</code>, no mutation — it just
      computes. (The name comes from <code>Array.prototype.reduce</code>: same "combine into a new
      value" shape.)</p>
      <pre class="diagram">   dispatch({ type: "increase" })          the action: a plain object,
            │                               almost always with a .type string
            ▼
   reducer(state, action)  ──▶  returns brand-new state
            │
            ▼
   React stores it and re-renders the component</pre>
      <p><code>useReducer(reducer, initialArg)</code> gives you back a pair, just like
      <code>useState</code>: the <strong>current state</strong> and a
      <strong><code>dispatch</code></strong> function. You never call the reducer yourself — you
      dispatch actions and React runs the reducer for you:</p>
      <pre class="diagram">  const [state, dispatch] = useReducer(reducer, { count: 0 });

  dispatch({ type: "increase" });   // reducer runs: { count: 1 }
  dispatch({ type: "decrease" });   // reducer runs: { count: 0 }
  dispatch({ type: "reset" });      // reducer runs: { count: 0 }</pre>
      <p>Because every rule now lives in one function, you can read the entire behaviour of the widget
      by reading one <code>reducer</code> — and you can test it in plain Node with no React at all
      (example 5).</p>
    `,
    `
      <h3>Spot the bug: the journal's useReducer.js calls dispatchEvent</h3>
      <div class="warn">
        <p><code>sorted_files/12_Week-12_Hooks/lab19/src/useReducer.js</code> is preserved exactly as
        submitted, and it has <strong>three mistakes in its three buttons</strong>. Running it does not
        decrement anything — it throws. Read them carefully in example 1:</p>
        <ol>
          <li><strong><code>dispatchEvent</code> instead of <code>dispatch</code>.</strong>
          <code>dispatchEvent</code> is a browser <code>window</code> method used to fire DOM events
          (like <code>click</code>) at an element — it is not the function
          <code>useReducer</code> returned, so the click handler calls the wrong thing and React never
          updates state.</li>
          <li><strong>Unquoted action types.</strong> <code>{type: increase}</code> treats
          <code>increase</code> as a variable name (a <code>ReferenceError</code>:
          <code>increase is not defined</code>), not the string <code>"increase"</code> the reducer
          compares against. Same for <code>Decrease</code> and <code>reset</code>.</li>
          <li><strong><code>Decrease</code> with a capital D</strong> would not match the reducer's
          <code>"decrease"</code> even if it were quoted — action types are case-sensitive strings.</li>
        </ol>
        <p>Example 2 is the same file repaired: <code>dispatch({ type: "increase" })</code> with every
        type quoted and lowercased, plus a <code>Count:</code> line so you can see the state move.
        (The file also declares <code>function app()</code> lowercase — React needs a capitalised
        component name to recognise <code>&lt;App/&gt;</code>; the fix renames it.)</p>
      </div>
    `,
    `
      <h3>useState vs useReducer — choosing one</h3>
      <table>
        <thead>
          <tr><th>Question</th><th>useState</th><th>useReducer</th></tr>
        </thead>
        <tbody>
          <tr><td>What does it hold?</td><td>One value (or one object) with a setter</td><td>One state object managed by a reducer</td></tr>
          <tr><td>How do you change it?</td><td><code>setX(newValue)</code> or <code>setX(prev =&gt; …)</code></td><td><code>dispatch({ type: "…" })</code></td></tr>
          <tr><td>Where do the rules live?</td><td>Scattered in each handler</td><td>Centralised in the reducer</td></tr>
          <tr><td>Best for</td><td>Counters, toggles, inputs, single flags</td><td>Several related values, many transitions, one widget's whole behaviour</td></tr>
          <tr><td>Testing</td><td>Needs a rendered component</td><td>Reducer is pure — test it with plain <code>node</code></td></tr>
          <tr><td>Boilerplate</td><td>Minimal</td><td>More (action objects, a switch)</td></tr>
        </tbody>
      </table>
      <p>Neither is "better" — they are the same tool at different scales. When you catch yourself
      writing a chain of <code>if</code>s or updating two state variables in the same handler, that is
      the signal to switch to a reducer. In Week 14, Redux is built on this exact idea at app scale:
      <code>dispatch</code>, actions and reducers are Redux vocabulary too.</p>
    `,
    `
      <h3>Common mistakes</h3>
      <ul>
        <li><strong>Breaking the rules of hooks</strong> — <code>useReducer</code> must sit at the top
        level of the component like every hook since the Lesson 064 callout: no reducers or dispatches
        inside <code>if</code> blocks or loops.</li>
        <li><strong>Mutating the state inside the reducer</strong> (<code>state.count++</code> then
        <code>return state</code>) — React sees the same reference and skips the render. Copy first:
        <code>return { ...state, count: state.count + 1 }</code>, exactly as Lesson 064's immutability
        rule.</li>
        <li><strong>Doing side effects in the reducer</strong> — no <code>fetch</code>, no
        <code>localStorage</code>, no <code>alert</code> inside it. Reducers must be pure so React can
        safely call them (Strict Mode calls them twice on purpose to catch impurity).</li>
        <li><strong>Calling the reducer yourself</strong> — always go through
        <code>dispatch</code>; calling <code>reducer(state, action)</code> manually computes a new state
        that React never stores.</li>
        <li><strong>Forgetting <code>default: return state</code></strong> (or the journal's
        <code>return state</code> at the end) — an unknown action type must leave state untouched, not
        blow up or return <code>undefined</code>.</li>
      </ul>
    `
  ],
  examples: [
    {
      title: "The journal's useReducer file — broken as submitted",
      from: "journal",
      file: "sorted_files/12_Week-12_Hooks/lab19/src/useReducer.js",
      lang: "jsx",
      code: `
import { useReducer } from "react";
import './app.css'

function reducer(state, action){
    if (action.type === "increase"){
        return{
            count:state.count+1
        }
    };
    if (action.type === "decrease"){
        return{
            count:state.count-1
        }
    };
    if (action.type === "reset"){
        return{
            count: 0
        }
    };
    return state;
}

function app(){
    const [state, dispatch] = useReducer(reducer,{
        count : 0
    })


    return(
        <>
        <button onClick={()=>dispatchEvent({type:increase})}>Increase</button>
        <button onClick={()=>dispatchEvent({type:Decrease})}>Decrease</button>
        <button onClick={()=>dispatchEvent({type:reset})}>Reset</button>
        </>
    )
}`,
      explain: [
        "The <code>reducer</code> itself is <strong>correct</strong>: a pure <code>(state, action)</code> function with three transitions and a safe <code>return state</code> fallback for unknown actions.",
        "The bug is in the buttons: <code>dispatchEvent(...)</code> is the browser's DOM-event method, not the <code>dispatch</code> returned by <code>useReducer</code> — so React never hears the action and no state changes.",
        "<code>type: increase</code> (no quotes) looks for a variable named <code>increase</code> → <code>ReferenceError</code>. It must be <code>type: \"increase\"</code> to match the strings the reducer compares.",
        "<code>Decrease</code> is capitalised while the reducer checks <code>\"decrease\"</code> — even quoted, it would fall through to <code>return state</code>. And no state value is rendered at all, so you could never see a change.",
        "This file is preserved on purpose (see the week's <code>README.txt</code>: \"useReducer.js has a dispatchEvent bug (preserved, noted in DOCX)\") — it is this week's best 'spot the bug' exercise."
      ],
      run: "cd sorted_files/12_Week-12_Hooks/lab19 && npm i && npm run dev",
      output: "Clicking any button → Uncaught ReferenceError: increase is not defined (state never changes)"
    },
    {
      title: "The fix: dispatch, quoted types, capitalised component",
      from: "new",
      lang: "jsx",
      code: `
import { useReducer } from "react";
import './app.css'

function reducer(state, action){
    if (action.type === "increase"){
        return{
            count:state.count+1
        }
    };
    if (action.type === "decrease"){
        return{
            count:state.count-1
        }
    };
    if (action.type === "reset"){
        return{
            count: 0
        }
    };
    return state;
}

function App(){
    const [state, dispatch] = useReducer(reducer,{
        count : 0
    })


    return(
        <>
        <p>Count: {state.count}</p>
        <button onClick={()=>dispatch({type:"increase"})}>Increase</button>
        <button onClick={()=>dispatch({type:"decrease"})}>Decrease</button>
        <button onClick={()=>dispatch({type:"reset"})}>Reset</button>
        </>
    )
}

export default App;`,
      explain: [
        "Only four things changed from example 1: <code>dispatchEvent</code> → <code>dispatch</code>, every <code>type</code> value quoted, <code>Decrease</code> → <code>\"decrease\"</code>, and <code>app</code> → <code>App</code> (capital, so React accepts it as a component).",
        "Added <code>&lt;p&gt;Count: {state.count}&lt;/p&gt;</code> — without rendering the state, 'it works' is invisible.",
        "The reducer is untouched: it was already right. The bug was purely in how the buttons <em>talked</em> to it.",
        "Flow to trace: click → <code>dispatch({type:\"increase\"})</code> → React runs <code>reducer(state, action)</code> → new <code>{ count }</code> → re-render → line 1 shows the new number."
      ],
      run: "replace lab19/src/useReducer.js with this file, then npm run dev",
      output: "Count: 0 → click Increase → Count: 1 → click Decrease → Count: 0 → click Reset → Count: 0"
    },
    {
      title: "The week's own notes: what the journal says a reducer is",
      from: "journal",
      file: "sorted_files/12_Week-12_Hooks/lab19/notes.txt",
      lang: "text",
      code: `
this project is teahing hooks.
so you can name the project Hooks.

useState is a builtin react hook,
a hook is a special function that lets
your components remember values and automaticaly updates the screen
whenever a value changes

useReducer it is a builtin react hook
designed to manage complex state logic
in functional components`,
      explain: [
        "The journal's own definition, typos and all: hooks let components <em>remember values</em> and update the screen when they change.",
        "It draws the line exactly where this lesson does — <code>useState</code> for remembering, <code>useReducer</code> for <strong>complex state logic</strong>.",
        "The rest of this file points you to online material for <code>useRef</code> and <code>useEffect</code>, and admits the useEffect example was added from the internet — Lesson 068 picks that up."
      ],
      run: "not a program — read it with: Get-Content sorted_files/12_Week-12_Hooks/lab19/notes.txt"
    },
    {
      title: "The same counter with useState: what useReducer replaces",
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

      export default Counter;`,
      explain: [
        "This is example 2's behaviour written with <code>useState</code>: two handlers each containing part of the transition logic (<code>if (count &gt; 0)</code> lives in the handler, not in a central place).",
        "Side by side with the reducer version: same UI, same result — but here the rules are split between the JSX handlers, and in the reducer version they are all readable in one function.",
        "Notice the two approaches produce identical screens. Choose by <em>complexity of the rules</em>, not by which screen you want.",
        "As transitions multiply (add/remove/edit/reset/coupon…), this style multiplies handlers; the reducer style just adds <code>if</code> branches to one function."
      ],
      run: "cd sorted_files/12_Week-12_Hooks/states && npm i && npm run dev",
      output: "Counter App / count: 0 / [Increment] [Decrement]"
    },
    {
      title: "Testing a reducer with plain Node — no React needed",
      from: "new",
      lang: "javascript",
      code: `
function reducer(state, action){
    if (action.type === "increase"){
        return { count: state.count + 1 };
    }
    if (action.type === "decrease"){
        return { count: state.count - 1 };
    }
    if (action.type === "reset"){
        return { count: 0 };
    }
    return state;
}

let state = { count: 0 };
const actions = [{type:"increase"},{type:"increase"},{type:"decrease"},{type:"reset"},{type:"typo"}];

for (const action of actions){
    state = reducer(state, action);
    console.log(action.type, "->", JSON.stringify(state));
}`,
      explain: [
        "Save as <code>reducer-demo.js</code>. The reducer is a pure function, so it runs happily outside React — this is the killer practical advantage of the pattern (decision-table row: 'Testing').",
        "Each action flows through exactly the way React would run it: <code>state = reducer(state, action)</code> is literally what <code>dispatch</code> does internally.",
        "Watch the last line: the unknown <code>\"typo\"</code> action falls through to <code>return state</code> and changes nothing — proof the fallback matters.",
        "You can now unit-test every transition of a widget by feeding it actions and asserting on the returned state."
      ],
      run: "node reducer-demo.js",
      output: `increase -> {"count":1}
increase -> {"count":2}
decrease -> {"count":1}
reset -> {"count":0}
typo -> {"count":0}`
    },
    {
      title: "A real reducer: actions with payloads and two fields at once",
      from: "new",
      lang: "jsx",
      code: `
import { useReducer } from "react";

const initial = { items: [], note: "" };

function cartReducer(state, action){
  switch (action.type){
    case "add":
      return { ...state, items: [...state.items, action.payload] };
    case "removeLast":
      return { ...state, items: state.items.slice(0, -1) };
    case "clear":
      return { items: [], note: "" };          // two fields, one transition
    case "setNote":
      return { ...state, note: action.payload };
    default:
      return state;
  }
}

export default function Cart(){
  const [state, dispatch] = useReducer(cartReducer, initial);

  return (
    <div>
      <p>Items: {state.items.join(", ") || "(empty)"}</p>
      <p>Note: {state.note || "(none)"}</p>
      <button onClick={() => dispatch({ type: "add", payload: "book" })}>Add book</button>
      <button onClick={() => dispatch({ type: "removeLast" })}>Undo</button>
      <button onClick={() => dispatch({ type: "setNote", payload: "gift wrap" })}>Set note</button>
      <button onClick={() => dispatch({ type: "clear" })}>Clear</button>
    </div>
  );
}`,
      explain: [
        "A <code>switch</code> is the idiomatic shape once you have more than two actions — each case returns a <em>copied</em> state, never a mutation.",
        "Actions carry data in <code>action.payload</code> — the standard convention you will meet again in Redux next week.",
        "The <code>clear</code> action resets <strong>two</strong> fields in one transition: this is the situation where <code>useState</code> would force two setters (and a chance to forget one).",
        "<code>default: return state</code> guarantees unknown actions are harmless no-ops."
      ],
      run: "drop into any Vite app and npm run dev",
      output: "Items: (empty) / Note: (none)  →  click Add book →  Items: book"
    }
  ],
  keyPoints: [
    "A reducer is a pure function reducer(state, action) that returns the next state — it must never mutate state or do side effects.",
    "useReducer(reducer, initialState) returns [state, dispatch]; you change state only by dispatching { type: \"...\", payload } actions.",
    "All transition rules live in one function, so a widget's whole behaviour is readable (and testable) in one place.",
    "The journal's lab19/src/useReducer.js is broken on purpose: dispatchEvent + unquoted types — dispatch({type:\"increase\"}) fixes it.",
    "Use useState for one independent value; switch to useReducer when one action must update several related values."
  ],
  practice: `
    <p>Take the repaired example 2 and add a <em>step by 5</em> button: add an
    <code>"increaseBy5"</code> branch to the reducer (remember <code>action.payload</code> or a fixed
    <code>+5</code>), quote its type, and render <code>state.count</code> to confirm. Then break it
    deliberately — call <code>reducer(state, {type:\"reset\"})</code> directly in a handler instead of
    <code>dispatch</code> — and observe that the screen does not update, because React never stored the
    result.</p>
  `,
  quiz: [
    {
      q: "In the journal's lab19/src/useReducer.js, why does clicking Increase throw instead of changing state?",
      options: [
        "The reducer mutates state, so React refuses to render",
        "The buttons call dispatchEvent (a DOM method) instead of dispatch, and the action type increase is an unquoted variable",
        "useReducer can only be used with a switch statement",
        "The initial state was passed as the third argument"
      ],
      answer: 1,
      why: "Two bugs stack: dispatchEvent is the window method for firing DOM events — not the dispatch returned by useReducer — and {type: increase} references an undefined variable instead of the string \"increase\" the reducer matches."
    },
    {
      q: "When should you reach for useReducer instead of useState?",
      options: [
        "Whenever a component has more than one piece of state",
        "Always — useReducer is the modern replacement for useState",
        "When one event must update several related values and the transition rules are getting complex",
        "Only when you are also using Redux"
      ],
      answer: 2,
      why: "Reducers shine when transitions are numerous or interdependent: all rules sit in one testable function. Independent single values (Lesson 064) are simpler with useState, and Redux (Week 14) uses the same pattern at app scale."
    }
  ],
  sources: [
    "https://react.dev/reference/react/useReducer",
    "https://react.dev/learn/extracting-state-into-a-reducer"
  ]
});
