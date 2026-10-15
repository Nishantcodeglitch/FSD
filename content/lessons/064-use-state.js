window.COURSE_LESSONS.push({
  id: "w12-use-state",
  file: "064",
  unit: 3,
  week: 12,
  title: "useState",
  kicker: "Unit III · Week 12 · Lesson 1 of 7",
  minutes: 20,
  objectives: [
    "Explain what a hook is and recite the two rules of hooks",
    "Read and write useState calls, including the functional updater form",
    "Update objects and arrays in state immutably, and avoid the derived-state anti-pattern"
  ],
  intro: `
    <p>Lesson 063 ended on a cliffhanger: props can pass data <em>down</em> from parent to child, but
    they are read-only, and the child cannot change them. Something that <em>can</em> change, lives
    inside the component, and makes React redraw the screen — that something is <strong>state</strong>.
    Week 11 promised it was coming. This lesson delivers the hook that creates it:
    <code>useState</code>, the first and most-used of React's Hooks.</p>
    <p>Your journal already has four working <code>useState</code> files — a counter in
    <code>ShoppingCart</code>, a pocket-money wallet in <code>react4</code>, a second counter in
    <code>states</code>, and a ticking timer in <code>lab19</code> — so this week starts with code you
    have actually written.</p>
  `,
  theory: [
    `
      <h3>What a hook is — and the two rules of hooks</h3>
      <p>React used to be split into two worlds: class components with lifecycle methods, and function
      components that could render but could <em>not</em> remember anything. <strong>Hooks</strong> (added
      in React 16.8) closed that gap: they are ordinary functions built into React that let a function
      component "hook into" React features — state, side effects, sharing data, holding references. Your
      own <code>lab19/notes.txt</code> says it in one line:</p>
      <blockquote>this is a builtin react hook, a hook is a special function that lets your components
      remember values and automaticaly updates the screen whenever a value changes</blockquote>
      <p>Every hook name starts with <code>use</code> — <code>useState</code>, <code>useReducer</code>,
      <code>useContext</code>, <code>useRef</code>, <code>useEffect</code>, <code>useMemo</code>,
      <code>useCallback</code>. The next six lessons cover those remaining six.</p>
      <div class="callout">
        <p><strong>The rules of hooks — memorise these now.</strong> React tracks hooks in the exact
        order they are called during a render, so breaking the order corrupts its bookkeeping:</p>
        <ul>
          <li><strong>Only call hooks at the top level of a component</strong> (or inside your own custom
          hooks). Never inside loops, conditions (<code>if</code>, <code>&amp;&amp;</code>, ternaries),
          or nested functions. If a value only sometimes matters, compute it with plain JavaScript
          <em>around</em> the hook call.</li>
          <li><strong>Only call hooks from React functions</strong> — a component your component function
          (one that React renders), or a custom hook whose name starts with <code>use</code>. Never from
          regular functions, event handlers, or <code>setTimeout</code> callbacks.</li>
        </ul>
        <p>ESLint's <code>eslint-plugin-react-hooks</code> enforces both rules and is already switched on
        in every Vite scaffold in this repo — that is what <code>lab19/eslint.config.js</code> is for.
        Every hook in this book obeys them; the rules are repeated here only once, but each later lesson
        leans on them.</p>
      </div>
    `,
    `
      <h3>The useState API: a value plus a function to change it</h3>
      <p><code>useState(initialValue)</code> does two things: it creates a piece of state holding
      <code>initialValue</code> for <em>this</em> component instance, and it returns a pair — an array
      of exactly two items — which you unpack with array destructuring:</p>
      <pre class="diagram">  const [count, setCount] = useState(0);
        │      │          │
        │      │          └─ the setter: call it to update the state
        │      └─ the current value (a variable like any other, read-only)
        └─ a name you invent — it is NOT a string, do not quote it</pre>
      <ul>
        <li><strong>The initial value is used once.</strong> On every later render React hands you the
        current value; passing <code>useState(0)</code> again does not reset it. Re-running your
        component function is <em>how</em> React re-renders — state is remembered across those runs.</li>
        <li><strong>Never write <code>count = count + 1</code>.</strong> The destructured variable is a
        plain const. The <em>only</em> way to change state is <code>setCount(newValue)</code>, and that
        call is what tells React: "redraw this component".</li>
        <li><strong>State is per component instance.</strong> Render <code>&lt;Student/&gt;</code> five
        times and you get five independent <code>money</code> values — which is exactly why
        <code>react4/App.jsx</code> passes <code>pocketmoney={1000}</code> as a prop: each student's
        wallet starts from the prop but then lives its own life.</li>
        <li><strong>The setter is also stable.</strong> <code>setCount</code> is the same function
        identity across renders — keep that in mind for <code>useCallback</code> in Lesson 070.</li>
      </ul>
      <p>The cycle looks like this:</p>
      <pre class="diagram">  setCount(count + 1)
        └─▶ React schedules a re-render
              └─▶ your function runs AGAIN, top to bottom
                    └─▶ useState returns the NEW count
                          └─▶ React updates the screen (diffs the old vs new output)</pre>
    `,
    `
      <h3>Functional updates and batching: why two +1s can become +1</h3>
      <p>The value you pass to a setter is read at the moment you call it. If two updates are queued
      before React redraws, the second one can be computed from a <em>stale</em> count. The safe form
      passes a <strong>function</strong> instead — React then hands your function the freshest previous
      value:</p>
      <pre class="diagram">  setCount(count + 1);        // ⚠ reads THIS render's count
  setCount(count + 1);        // ⚠ same stale value — ends up +1, not +2

  setCount(prev => prev + 1); // ✅ always uses the latest state
  setCount(prev => prev + 1); // ✅ ends up +2</pre>
      <p>The journal's <code>lab19/src/App.jsx</code> timer uses this exact form —
      <code>setCount((prevCount) =&gt; prevCount + 1)</code> — because a <code>setInterval</code> callback
      captured the component closure once and would otherwise tick on a frozen value forever.</p>
      <p><strong>Batching</strong> is React's promise that multiple <code>setState</code> calls made in
      the same event handler (or the same timeout tick) are grouped into <strong>one</strong> re-render.
      React 18 batches automatically everywhere, so this handler renders once, not three times:</p>
      <pre class="diagram">  const grow = () => {
      setCount(count + 1);       // queued
      setGreeting("hello");      // queued
      setIsAdult(true);          // queued
      };  // ──▶ one single re-render with all three values applied</pre>
      <p>Batching is only about <em>how many re-renders</em> — every state value is still applied.</p>
    `,
    `
      <h3>Objects, arrays and multiple state variables</h3>
      <p>State can hold any JavaScript value, including objects and arrays. But React compares the old
      and new state with <code>Object.is</code>: if you mutate the object in place, the reference is
      identical, React says "nothing changed" — and nothing re-renders. <strong>Never mutate; copy
      first, then change the copy</strong> (spread for objects, <code>map</code>/<code>slice</code> +
      spread for arrays):</p>
      <pre class="diagram">  setProfile({ ...profile, city: "Pune" });            // ✅ new object
  setTodos(todos.map(t => t.id === id ? { ...t, done: true } : t));  // ✅ new array</pre>
      <p>Second trap: <strong>derived state</strong> — storing a value you can already compute. The
      classic case is <code>const total = count * price</code> kept in its own <code>useState</code>;
      now every <code>setCount</code> must remember to update <code>total</code> too, and the two can
      drift apart. Compute it during render (<code>const total = count * price;</code>) with no hook at
      all. Separate state variables are for things that change <em>independently</em> — Lesson 065's
      reducer is for things that must change <em>together</em>.</p>
    `,
    `
      <h3>When to reach for useState (and when not to)</h3>
      <ul>
        <li><strong>Use it</strong> for input values, toggles, counters, open/closed flags, the current
        filter/tab, anything the user changes and the screen must show.</li>
        <li><strong>Don't use it</strong> for values derived from other state (compute them), for data
        that never changes during the component's life (use a plain variable or a prop), and for values
        that must be readable but must <em>not</em> trigger a re-render — that is
        <code>useRef</code> (Lesson 067).</li>
        <li><strong>Common mistake:</strong> calling the setter during render, or reading state that
        belongs to a parent through five layers of props. If updating state in one component forces you
        to thread props through <code>App → Home → Profile → Student</code>, that is prop drilling, and
        <code>useContext</code> (Lesson 066) is the cure.</li>
      </ul>
    `
  ],
  examples: [
    {
      title: "The journal's counter: setter basics from ShoppingCart",
      from: "journal",
      file: "sorted_files/12_Week-12_Hooks/ShoppingCart/src/App.jsx",
      lang: "jsx",
      code: `
import {useState} from "react";
function User(){
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

      export default User;`,
      explain: [
        "<code>useState(0)</code> runs once: count starts at <code>0</code>. Every later render gets whatever the last setter call stored.",
        "<code>setCount(count + 1)</code> reads the current render's <code>count</code> — fine inside a single click, the stale-closure case is shown in example 4.",
        "<code>if (count &gt; 0)</code> is plain JavaScript guarding the setter — conditions around a <em>setter call</em> are legal; conditions around a <em>hook call</em> are not (rule 1).",
        "The JSX reads <code>{count}</code>, so React must re-render this component whenever the setter runs — that is the whole useState contract."
      ],
      run: "cd sorted_files/12_Week-12_Hooks/ShoppingCart && npm i && npm run dev",
      output: "Counter App / count: 0 / [Increment] [Decrement]"
    },
    {
      title: "State seeded from a prop: the pocket-money wallet in react4",
      from: "journal",
      file: "sorted_files/12_Week-12_Hooks/react4/src/components/Students.jsx",
      lang: "jsx",
      code: `
import {useState} from "react";

function Student(props){
    const [money, setMoney] = useState(props.pocketmoney);
    const buyBook = () => {
    if (money - 200 < 0) {
      alert("Money can't be -ve");

    } else {
      setMoney(money - 200);

    }
  };

    return (
        <div>
            <h1>{props.name}</h1>
            <h1>Pocket money: {money}</h1>
            <h2></h2>
            <button onClick={buyBook}>Buy books 200</button>
        </div>
    );
}

export default Student;`,
      explain: [
        "<code>useState(props.pocketmoney)</code> shows the pattern: the <em>initial</em> value comes from a prop (1000, passed by <code>react4/src/App.jsx</code>), but afterwards <code>money</code> is local state the parent cannot see or reset.",
        "This is the bridge from Lesson 063: prop → initial state → independently changing value.",
        "<code>setMoney(money - 200)</code> recomputes from the current value each click; the guard keeps the wallet from going negative.",
        "Bug-hunt: this is the journal's own code as written. It works, but it is one click behind if two updates ever queue up — example 4 shows the bulletproof form."
      ],
      run: "cd sorted_files/12_Week-12_Hooks/react4 && npm i && npm run dev",
      output: "Sal / Pocket money: 1000 / [Buy books 200]"
    },
    {
      title: "Two counters, one file: states/src/Student.jsx",
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
        "Same counter as example 1, written again in the <code>states</code> project — the journal's repetition is useful: it shows the shape is a pattern, not a one-off.",
        "The top of this file (commented out in the real file) held the earlier pocket-money version using <code>setMoney(money-100)</code>, kept as a working note of the prop → state bridge.",
        "Note there is exactly <strong>one</strong> piece of state here. If you later need <code>count</code>, a label and an on/off flag, you add three separate <code>useState</code> calls — see example 5."
      ],
      run: "cd sorted_files/12_Week-12_Hooks/states && npm i && npm run dev",
      output: "Counter App / count: 0 / [Increment] [Decrement]"
    },
    {
      title: "Functional updates: the timer that must not freeze",
      from: "journal",
      file: "sorted_files/12_Week-12_Hooks/lab19/src/App.jsx",
      lang: "jsx",
      code: `
import React, { useState, useRef, useEffect } from 'react';

function Timer() {
  const [count, setCount] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  return <p>Count: {count}</p>;
}`,
      explain: [
        "The full lab19 Timer — it uses three hooks at once, and this lesson only reads the <code>useState</code> line: <code>const [count, setCount] = useState(0)</code>.",
        "<code>setCount((prevCount) =&gt; prevCount + 1)</code> is the <strong>functional updater</strong>: React supplies the latest value, so the interval never ticks on a stale count.",
        "A <code>setInterval</code> callback runs long after the render that created it — writing <code>setCount(count + 1)</code> there would repeat the same number forever.",
        "<code>useRef</code> and <code>useEffect</code> here belong to Lessons 067 and 068; notice the file already obeys both rules of hooks (top level, component function)."
      ],
      run: "cd sorted_files/12_Week-12_Hooks/lab19 && npm i && npm run dev",
      output: "Count: 1 / Count: 2 / Count: 3 / …"
    },
    {
      title: "Batching: three setters, one re-render",
      from: "new",
      lang: "jsx",
      code: `
import { useState } from "react";

export default function Signup() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [joined, setJoined] = useState(false);

  const submit = () => {
    setName("Nishant");
    setAge(21);
    setJoined(true);   // all three queued: React renders ONCE with the new values
  };

  return (
    <div>
      <p>Name: {name || "(empty)"}</p>
      <p>Age: {age || "(empty)"}</p>
      <p>Joined: {joined ? "yes" : "no"}</p>
      <button onClick={submit}>Pretend submit</button>
    </div>
  );
}`,
      explain: [
        "Save as <code>Signup.jsx</code>. Three separate state variables, three setters in one click handler.",
        "React 18 batches them: one single re-render, even though three pieces of state changed — no flicker of 'half-updated' UI.",
        "Each variable changes independently, which is exactly when separate <code>useState</code> calls are the right choice.",
        "The display uses <code>||</code> fallbacks so the first render still has something sensible to show."
      ],
      run: "drop into any Vite app and npm run dev",
      output: "Name: (empty) / Age: (empty) / Joined: no   →   click →   Name: Nishant / Age: 21 / Joined: yes"
    },
    {
      title: "The derived-state anti-pattern (and its fix)",
      from: "new",
      lang: "jsx",
      code: `
import { useState } from "react";

export default function Cart() {
  // 🔴 WRONG: total is derived, but stored as its own state
  const [qty, setQty] = useState(1);
  const [price] = useState(499);
  const [total, setTotal] = useState(499);

  const addOne = () => {
    setQty(qty + 1);
    setTotal((qty + 1) * price);   // must remember to update TWO states (fragile!)
  };

  const subOne = () => {
    setQty(qty - 1);
    setTotal((qty - 1) * price);   // ...and every new handler must do it too
  };

  return (
    <div>
      <p>Qty: {qty} × {price} = {total}</p>
      <button onClick={addOne}>+</button>
      <button onClick={subOne}>-</button>
    </div>
  );
}`,
      explain: [
        "Save as <code>Cart.jsx</code> and try adding a third button — you must remember to update <code>total</code> there too, or the screen lies.",
        "<code>total</code> is not independent data: it is just <code>qty * price</code>. Storing it is called the <strong>derived-state anti-pattern</strong>.",
        "<strong>The fix:</strong> delete the <code>total</code> state and the <code>setTotal</code> calls, then compute <code>const total = qty * price;</code> directly in the component body. It is recalculated on every render for free — no hook, no sync bugs.",
        "Rule of thumb: separate <code>useState</code> calls only for values that change <em>independently</em>."
      ],
      run: "drop into any Vite app and npm run dev",
      output: "Qty: 1 × 499 = 499"
    },
    {
      title: "Objects and arrays: update by copying, never by mutating",
      from: "new",
      lang: "jsx",
      code: `
import { useState } from "react";

export default function Todos() {
  const [items, setItems] = useState([
    { id: 1, text: "Read the React docs", done: false },
    { id: 2, text: "Finish lab19", done: false }
  ]);
  const [filter, setFilter] = useState("all"); // object + array + string state

  const toggle = (id) => {
    // 🔴 WRONG: items.find(i => i.id === id).done = true;  — same array reference, no render
    setItems(items.map(i => (i.id === id ? { ...i, done: !i.done } : i)));
  };

  const visible = filter === "done" ? items.filter(i => i.done) : items;

  return (
    <div>
      <button onClick={() => setFilter("all")}>All</button>
      <button onClick={() => setFilter("done")}>Done</button>
      <ul>
        {visible.map(i => (
          <li key={i.id} onClick={() => toggle(i.id)}>
            {i.done ? "[x] " : "[ ] "}{i.text}
          </li>
        ))}
      </ul>
    </div>
  );
}`,
      explain: [
        "<code>setItems(items.map(...))</code> builds a brand-new array; inside, <code>{ ...i, done: !i.done }</code> builds a brand-new object for the one item that changed.",
        "React compares state with <code>Object.is</code> — a copied array is a different reference, so the re-render happens; a mutated one is silently ignored.",
        "<code>visible</code> is <strong>derived</strong> (a filter of <code>items</code>) and deliberately has no <code>useState</code> — Lesson 069 will memoise exactly this kind of list with <code>useMemo</code>.",
        "The <code>key={i.id}</code> is required whenever you map an array to JSX — React uses it to match old and new rows."
      ],
      run: "drop into any Vite app and npm run dev",
      output: "[ ] Read the React docs / [ ] Finish lab19   → click a row →   [x] Read the React docs"
    }
  ],
  keyPoints: [
    "A hook is a built-in React function that lets a function component remember values and re-render when they change; every hook name starts with 'use'.",
    "Rules of hooks: only at the top level of a component (never in loops/conditions), and only from React components or custom hooks.",
    "useState returns [value, setter]; call the setter to change state — never assign to the variable directly.",
    "Use the functional form setX(prev => …) whenever the new value depends on the old one; React batches setters in one handler into a single re-render.",
    "Update objects/arrays by copying (spread/map), never mutating; compute derived values during render instead of storing them as extra state."
  ],
  practice: `
    <p>Open <code>sorted_files/12_Week-12_Hooks/react4/src/components/Students.jsx</code>. Add a
    second button, <em>Deposit 500</em>, and a fourth line showing
    <code>Money after books: {money}</code>. Then deliberately break rule 1 — move
    <code>const [money, setMoney] = useState(props.pocketmoney);</code> inside the <code>buyBook</code>
    function — and read the ESLint / React error that appears. Put it back.</p>
  `,
  quiz: [
    {
      q: "Where may you call useState?",
      options: [
        "Anywhere inside the component, including inside an if statement",
        "Only at the top level of a component function, or inside a custom hook",
        "Inside event handlers and setTimeout callbacks",
        "At the module top level, outside any function"
      ],
      answer: 1,
      why: "React relies on hooks being called in the same order every render, so conditionals that skip a hook break it. Rule 2 also forbids regular functions — hooks come from components and hooks only."
    },
    {
      q: "A component keeps count and total (total = count × 5) in two separate useState calls. What is wrong?",
      options: [
        "Nothing — two state variables are always fine",
        "total should be a prop passed by the parent",
        "total is derived state: delete it and compute const total = count * 5 during render",
        "You must use useReducer whenever there are two state variables"
      ],
      answer: 2,
      why: "Derived values must be recalculated, not stored — storing them means every setter must update both, and they drift apart. Only independently-changing data deserves its own useState."
    }
  ],
  sources: [
    "https://react.dev/reference/react/useState",
    "https://react.dev/learn/state-a-components-memory",
    "https://react.dev/learn/updating-objects-in-state",
    "https://react.dev/learn/queueing-a-series-of-state-updates"
  ]
});
