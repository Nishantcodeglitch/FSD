window.COURSE_LESSONS.push({
  id: "w12-use-memo",
  file: "069",
  unit: 3,
  week: 12,
  title: "useMemo",
  kicker: "Unit III · Week 12 · Lesson 6 of 7",
  minutes: 18,
  objectives: [
    "Explain memoisation: caching a VALUE so it survives re-renders until its inputs change",
    "Read a useMemo dependency array using the same Object.is rules as useEffect",
    "Decide when useMemo helps (slow calcs, memo children, hook dependencies) and when it hurts",
    "Avoid the classic traps: cheap computations, missing deps and the arrow-function object trap"
  ],
  intro: `
    <p>Honest note first: <strong>this topic is missing from your journal.</strong> The Week 12
    section of <code>journal_sorted/03_Unit-III_Weeks-11-14.txt</code> records
    <code>12.6 useMemo -&gt; MISSING (8 blank paras in DOCX)</code>, the week's
    <code>MISSING.txt</code> says <em>"no source files supplied"</em>, and there is no lab file for it
    in <code>sorted_files/12_Week-12_Hooks/</code>. So this lesson is written from the official
    react.dev reference (cited in <code>sources</code>), and its examples are mostly <code>new</code> —
    the one journal file reused is <code>states/src/Student.jsx</code>, kept as the "before" case that
    shows what does <em>not</em> need memoising.</p>
    <p>Lesson 068 ended with values as dependencies: <code>[count]</code>, <code>[roomId]</code>.
    <code>useMemo</code> uses exactly that machinery for a different purpose — instead of deciding
    <em>when to run an effect</em>, it decides <em>when to recompute a value</em>.</p>
  `,
  theory: [
    `
      <h3>Memoisation: caching a value between renders</h3>
      <p>React re-runs your whole component function on every render (that is the contract from
      Lesson 063: <code>render = f(state)</code>). Usually that is free — JavaScript is fast. But some
      lines are <strong>expensive</strong>: filtering a list of 50 000 products, parsing JSON,
      running a calculation over a big array. Re-running them on every keystroke is waste.</p>
      <p><strong>Memoisation</strong> (the word is "memo" + "isation" — remembering) means: compute it
      once, remember the result, hand back the remembered result until an input changes.
      <code>useMemo</code> is React's hook for exactly that:</p>
      <pre class="diagram">  const visibleTodos = useMemo(
      () => filterTodos(todos, tab),   // 1. the calculation (a function!)
      [todos, tab]                     // 2. its dependencies
  );
  // returns: cached result from last render, or a fresh call if todos/tab changed</pre>
      <p>Read it as: <em>"recompute <code>filterTodos(todos, tab)</code> only when
      <code>todos</code> or <code>tab</code> changes; otherwise give me the array you already
      computed."</em> On the first render it just calculates (no speed-up on mount — memoisation only
      saves work on <em>later</em> renders). A non-hook equivalent to picture it:
      <code>let last = { deps, value }</code> checked before recomputing.</p>
      <p>Crucially: <code>useMemo</code> caches the <strong>result</strong>. It does not stop the
      component from re-rendering — it stops this one calculation from re-running inside the render.
      (Lesson 070 caches the <em>function itself</em>; the difference is the whole lesson.)</p>
    `,
    `
      <h3>The dependency array: same rules as useEffect, one difference</h3>
      <p>You already know the mechanics from Lesson 068, and they transfer word for word:</p>
      <ul>
        <li>React compares each dependency with <code>Object.is</code> between renders — same
        comparison state uses, same comparison effects use.</li>
        <li><strong>All changed?</strong> → recompute and store a new value.
        <strong>None changed?</strong> → return the cached value.</li>
        <li><strong>No dependency array at all</strong> → recalculates every single render. That is
        <em>worse</em> than no <code>useMemo</code>: you pay the cache bookkeeping for zero savings
        (react.dev lists this under Troubleshooting).</li>
        <li><strong>Everything the calculation reads goes in the array</strong> — the same
        exhaustive-deps discipline as effects, for the same reason: an unlisted input leaves you
        serving a <em>stale</em> value, which for correctness is worse than being slow.</li>
      </ul>
      <p>What counts as "reads"? Props, state, and variables declared in the component body — and
      remember from Lesson 064 that a fresh object or array literal in the body
      (<code>const opts = { text }</code>) is a <em>new</em> value every render, so putting it in the
      deps defeats the cache entirely (react.dev calls this a dependency that is "always new"). Memoise
      the small object too, or depend on its primitive parts.</p>
    `,
    `
      <h3>When it helps — three cases (from react.dev)</h3>
      <ol>
        <li><strong>The calculation is genuinely slow.</strong> "Slow" means measured: filtering or
        looping over <em>thousands</em> of items, heavy math, JSON parsing. react.dev's own test is
        <code>console.time('filter array')</code> — if it is not ~1&nbsp;ms or more, skip the hook.</li>
        <li><strong>You pass the value to a child wrapped in <code>memo()</code>.</strong> A new array
        literal every render makes <code>memo</code> see "changed props" and re-render the child;
        a cached array lets it skip. (Memoise + <code>memo()</code> is a pair — memoising a value
        nobody compares buys nothing.)</li>
        <li><strong>The value is a dependency of another hook</strong> — a <code>useEffect</code> that
        should reconnect only when the object's real inputs change, or a second
        <code>useMemo</code>. A cached object keeps that dependency stable.</li>
      </ol>
      <p>The journal has a genuine instance of case 3's shape waiting: Lesson 066's context Provider
      built <code>value={{ user, setUser }}</code> inline — an "always new" object — and
      <code>useMemo</code> is the standard repair.</p>
    `,
    `
      <h3>When it hurts — the "don't do this" side</h3>
      <div class="warn">
        <p><strong>Do not wrap cheap computations.</strong> <code>useMemo(() =&gt; count + 1,
        [count])</code> is a loss: React must store the old deps, run <code>Object.is</code> over the
        new array, and hold the cached value in memory — overhead that costs <em>more</em> than just
        adding 1. Memoisation also makes code less readable and adds a dependency array you must now
        keep correct. react.dev's rule: <em>"You should only rely on useMemo as a performance
        optimization — if your code doesn't work without it, find the underlying problem
        first."</em></p>
      </div>
      <ul>
        <li><strong>It can even break:</strong> a single "always new" dependency (an inline object or
        array) silently disables the cache for the whole call.</li>
        <li><strong>It never helps the first render</strong>, and it can't fix a slow <em>render</em>
        (JSX diffing) — only a slow calculation. If the list itself renders slowly, you want
        virtualisation or splitting components, not <code>useMemo</code>.</li>
        <li><strong>Correctness must not depend on it.</strong> React may throw the cache away
        (dev reload, a suspended component) — a calculation whose result is <em>stored elsewhere</em>
        belongs in state, a ref, or an effect, not in a cache.</li>
      </ul>
      <p>So the order is: write it plain → measure with the profiler or <code>console.time</code> →
      only then memoise. Your journal's counters are the perfect example of the first step: see
      example 3.</p>
    `,
    `
      <h3>Common mistakes</h3>
      <ul>
        <li><strong>The arrow-function object trap.</strong>
        <code>useMemo(() => { mode: "dark" }, [x])</code> — remember Lesson 003: <code>() =&gt; {
        …</code> starts a function <em>body</em>, so those braces are not an object; the function
        returns <code>undefined</code>. Use an explicit <code>return {…}</code> or wrap in
        parentheses <code>(() => ({…}))</code>. react.dev has a whole troubleshooting entry for it.</li>
        <li><strong>Calling it in a loop or condition</strong> — same rule 1 as every hook since
        Lesson 064: the calculation must run at top level; for per-item work, extract a component and
        memoise inside it.</li>
        <li><strong>Missing dependencies</strong> → stale values served from cache. Add them, or
        compute inside the calculation so the input is a primitive.</li>
        <li><strong>Memoising to hide a bug</strong> — if two values can disagree (derived-state,
        Lesson 064), caching one of them makes the drift permanent. Fix the derivation first.</li>
      </ul>
    `
  ],
  examples: [
    {
      title: "The basic shape: cache an expensive filter",
      from: "new",
      lang: "jsx",
      code: `
import { useMemo, useState } from "react";

function slowSum(n) {                 // stands in for real heavy work
  let total = 0;
  for (let i = 0; i < n; i++) total += i;
  return total;
}

export default function BigSum() {
  const [n, setN] = useState(1000000);
  const [label, setLabel] = useState("hi");

  const total = useMemo(() => {
    console.log("computing total for", n);
    return slowSum(n);
  }, [n]);                            // recomputes ONLY when n changes

  return (
    <div>
      <p>total = {total}</p>
      <button onClick={() => setN(n + 1)}>n++</button>
      <button onClick={() => setLabel(label + "!")}>label (re-render only)</button>
    </div>
  );
}`,
      explain: [
        "Save as <code>BigSum.jsx</code>. Every click of <em>label</em> re-renders the component, but the console proves <code>slowSum</code> does <strong>not</strong> run — the cached value is returned.",
        "Click <em>n++</em>: <code>n</code> is a listed dependency, so <code>Object.is</code> sees a change and the calculation re-runs — exactly the behaviour you want.",
        "The structure is always the same pair: a zero-argument calculation function, and an inline dependency array listing everything it reads.",
        "On the very first render there is no cache — <code>slowSum</code> runs once like it would without the hook. useMemo only saves <em>subsequent</em> work."
      ],
      run: "drop into any Vite app and npm run dev, watch the console",
      output: "computing total for 1000000   (on mount, and again only after n++ — never on label clicks)"
    },
    {
      title: "Dependency-array semantics: what makes the cache miss",
      from: "new",
      lang: "jsx",
      code: `
import { useMemo, useState } from "react";

export default function Deps() {
  const [items, setItems] = useState(["b", "c", "a"]);
  const [query, setQuery] = useState("");

  // ✅ correct: depends on both inputs the calculation reads
  const sorted = useMemo(() => {
    console.log("sort ran");
    return [...items].sort();
  }, [items]);

  // 🔴 wrong shape: fresh object every render is an "always new" dependency
  const opts = { query };
  const broken = useMemo(() => {
    console.log("search ran (never cached!)");
    return items.filter(i => i.includes(opts.query));
  }, [opts]);                         // opts is a NEW object every render

  return (
    <div>
      <p>sorted: {sorted.join(",")}</p>
      <p>match: {broken.join(",") || "(none)"}</p>
      <button onClick={() => setItems([...items, "d"])}>add item</button>
      <button onClick={() => setQuery("a")}>search</button>
    </div>
  );
}`,
      explain: [
        "Save as <code>Deps.jsx</code> and click around: <code>sort ran</code> appears only when <code>items</code> genuinely changes — one <code>Object.is</code> comparison per dep is all React does.",
        "The bottom half is the trap: <code>opts</code> is re-created in the component body on every render (Lesson 064: <code>{}</code> always makes a new reference), so <code>[opts]</code> always differs and <code>search ran</code> spams the console — zero caching.",
        "The fix per react.dev: depend on the primitive (<code>[items, query]</code> and read <code>query</code> directly) or memoise the options object too.",
        "Also note <code>[...items].sort()</code> — sorting mutates, so copy first; the calculation must stay pure (Strict Mode runs it twice on purpose)."
      ],
      run: "drop into any Vite app and npm run dev, watch the console",
      output: `sort ran            (mount)
search ran (never cached!)
search ran (never cached!)  ← click anywhere → still logs`
    },
    {
      title: "The journal's counter: a 'before' case that needs NO memo",
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
        "Here is what the journal actually shipped for 12.x — and it is <strong>correct as written</strong>: the only 'calculation' per render is <code>count + 1</code> inside a handler.",
        "Hypothetically memoising this render would be example 4's anti-pattern: <code>useMemo(() =&gt; count + 1, [count])</code> costs more than it saves, and the JSX work (<code>{count}</code>) cannot be skipped by <code>useMemo</code> anyway.",
        "This is the honest 'before' picture for 12.6: nothing in the file is expensive, so the right amount of <code>useMemo</code> here is <strong>zero</strong>.",
        "Contrast with example 5: replace <code>count</code> with a 10 000-row product list and a search box, and the same code shape suddenly deserves the hook."
      ],
      run: "cd sorted_files/12_Week-12_Hooks/states && npm i && npm run dev",
      output: "Counter App / count: 0 / [Increment] [Decrement]"
    },
    {
      title: "The 'don't do this' anti-pattern: memoising a cheap computation",
      from: "new",
      lang: "jsx",
      code: `
import { useMemo, useState } from "react";

export default function Overkill() {
  const [count, setCount] = useState(0);
  const [dark, setDark] = useState(false);

  // 🔴 DON'T: these are arithmetic and string ops — nanoseconds.
  const doubled = useMemo(() => count * 2, [count]);
  const label = useMemo(() => "Count is " + count, [count]);
  const style = useMemo(() => ({ background: dark ? "#222" : "#fff" }), [dark]);

  return (
    <div style={style}>
      <p>{label} (doubled: {doubled})</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setDark(!dark)}>toggle</button>
    </div>
  );
}`,
      explain: [
        "Save as <code>Overkill.jsx</code> — it works, and that is the trap: correct, readable-destroying, and slower than plain code.",
        "Each <code>useMemo</code> makes React store a deps array, compare it with <code>Object.is</code> on every render, and keep a cached entry alive — real overhead to avoid arithmetic that is effectively free.",
        "The spread of three memoised values is also noise: a reviewer must now audit three dependency arrays where one line of plain code would do.",
        "react.dev's advice, in order: measure with <code>console.time</code>/the profiler first; memoise only slow calculations, values passed to <code>memo()</code> children, or dependencies of other hooks (theory section 3)."
      ],
      run: "drop into any Vite app and npm run dev",
      output: "Count is 0 (doubled: 0) — renders identically with or without the useMemo calls"
    },
    {
      title: "The typical real use: filtering and sorting a big list",
      from: "new",
      lang: "jsx",
      code: `
import { useMemo, useState } from "react";

const PRODUCTS = Array.from({ length: 20000 }, (_, i) => ({
  id: i + 1,
  name: "Item " + (i + 1),
  price: (i * 7) % 500 + 1
}));

export default function Shop() {
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(false);

  const visible = useMemo(() => {
    console.time("filter+sort");
    const q = query.toLowerCase();
    const rows = PRODUCTS.filter(p => p.name.toLowerCase().includes(q));
    rows.sort((a, b) => (sortDesc ? b.price - a.price : a.price - b.price));
    console.timeEnd("filter+sort");
    return rows;
  }, [query, sortDesc]);              // 20 000 rows re-examined only when these change

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={() => setSortDesc(!sortDesc)}>
        Sort {sortDesc ? "high→low" : "low→high"}
      </button>
      <p>{visible.length} matches, cheapest {visible[0] && visible[0].price}</p>
      <ul>
        {visible.slice(0, 5).map(p => <li key={p.id}>{p.name}: {p.price}</li>)}
      </ul>
    </div>
  );
}`,
      explain: [
        "Save as <code>Shop.jsx</code>. Filtering <em>and</em> sorting 20 000 rows inside render is exactly the \"thousands of objects\" case react.dev calls expensive — and <code>console.time</code> lets you prove it instead of guessing.",
        "The calculation reads two values, so the array is <code>[query, sortDesc]</code> — nothing else, because <code>PRODUCTS</code> is a module constant that never changes.",
        "Without the hook, every keystroke re-sorts the whole list; with it, React still re-renders on each keystroke (typing must update the input!) but the heavy work runs once per distinct <code>query</code>.",
        "Next step if the <em>rendering</em> of matches is the bottleneck: slice to a page (shown) or wrap the row component in <code>memo()</code> — which is where <code>useMemo</code> pairs with Lesson 070's <code>useCallback</code>."
      ],
      run: "drop into any Vite app and npm run dev, watch 'filter+sort' timings",
      output: "filter+sort: 3.412ms   (logged on mount, on each new query, and on sort flips)"
    },
    {
      title: "Case 3: a stable value for useEffect / context / memo() children",
      from: "new",
      lang: "jsx",
      code: `
import { useMemo, useEffect, useState } from "react";

export default function Chat({ roomId }) {
  const [theme, setTheme] = useState("dark");   // changes often, irrelevant to the effect
  const [log, setLog] = useState([]);

  // 🡒 without useMemo, options is a NEW object every render → effect re-runs always
  const options = useMemo(
    () => ({ serverUrl: "https://localhost:1234", roomId }),
    [roomId]                                   // stable until roomId actually changes
  );

  useEffect(() => {
    console.log("connecting with", JSON.stringify(options));
    setLog(prev => [...prev, "connected: " + options.roomId]);
    return () => console.log("disconnecting");
  }, [options]);        // ✅ exhaustive-deps satisfied AND not over-firing

  return (
    <div>
      <p>room {roomId} / theme {theme}</p>
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>theme</button>
      <ul>{log.map((l, i) => <li key={i}>{l}</li>)}</ul>
    </div>
  );
}`,
      explain: [
        "Save as <code>Chat.jsx</code>. This is react.dev's own scenario: an effect needs an options object, and a raw object would be \"always new\", firing the effect on every render.",
        "<code>useMemo(…, [roomId])</code> gives the object a <strong>stable identity</strong>, so the effect's <code>[options]</code> comparison is <code>Object.is</code> on the same reference — the effect runs when <code>roomId</code> changes and not on theme clicks.",
        "This is one of the three legitimate reasons to memoise (theory section 3): <em>the value is a dependency of another hook</em>. The same stability is what lets a <code>memo()</code>'d child or a context Provider (Lesson 066, example 6) skip re-rendering.",
        "Caveat from react.dev worth knowing: <code>useMemo</code> is a cache, not a guarantee — if you need a value that is truly permanent, keep it in state or a ref instead."
      ],
      run: "drop into any Vite app and npm run dev, watch the console",
      output: `connecting with {"serverUrl":"https://localhost:1234","roomId":"lab"}   (mount)
  — click theme → NO new log —
  — change roomId → disconnecting → connecting with the new room`
    }
  ],
  keyPoints: [
    "useMemo(calculateValue, deps) caches a VALUE between re-renders: recompute only when a dependency changed (Object.is), otherwise return the cached result.",
    "It never speeds the first render and never stops re-rendering — it only skips re-running one calculation.",
    "Legitimate uses (react.dev): genuinely slow calculations, values passed to memo()'d children, and values that are dependencies of other hooks.",
    "Cheap computations are a net loss — memoisation is a performance optimization, never a correctness requirement.",
    "Same discipline as useEffect: list every value you read, keep deps inline and constant-length, and beware 'always new' object/array dependencies.",
    "Week 12.6 is missing from the journal (8 blank DOCX paragraphs) — this lesson comes from react.dev; the journal's counter proves most UI needs no memoisation at all."
  ],
  practice: `
    <p>Take <code>sorted_files/12_Week-12_Hooks/states/src/App.jsx</code>'s counter idea and grow it:
    generate an array of 5 000 random numbers <em>inside</em> the component, sort it, show the
    median. Open the console, click <em>toggle theme</em> ten times and watch the sort re-run on every
    click. Now wrap the sort in <code>useMemo(…, [items])</code> and repeat — the log should stop.
    Then delete one dependency and observe how stale the cached value becomes.</p>
  `,
  quiz: [
    {
      q: "What exactly does useMemo return?",
      options: [
        "The function you passed, so you can call it later",
        "The cached RESULT of calling your calculation — recomputed only when a dependency changed",
        "A new object on every render for safety",
        "The value from the previous render, always"
      ],
      answer: 1,
      why: "useMemo calls your function and keeps its result (memoisation); it hands back the stored result while the deps are unchanged. Returning the function itself is useCallback — Lesson 070."
    },
    {
      q: "A component wraps count + 1 in useMemo with [count]. What does react.dev say about this?",
      options: [
        "It is required for all arithmetic in React",
        "It is a good habit to memoise everything by default",
        "It is pointless — memoise only measured slow calculations, passing a memo() child, or hook dependencies; otherwise the overhead exceeds the saving",
        "It will cause a stale value"
      ],
      answer: 2,
      why: "Dependency bookkeeping (store deps, Object.is compare, cache entry) costs more than adding one. react.dev: rely on useMemo only as a performance optimization — profile first, and remember code becomes less readable."
    }
  ],
  sources: [
    "https://react.dev/reference/react/useMemo",
    "https://react.dev/learn/memoization",
    "https://react.dev/reference/react/useMemo#troubleshooting",
    "journal: sorted_files/12_Week-12_Hooks/MISSING.txt and journal_sorted/03_Unit-III_Weeks-11-14.txt record 12.6 as MISSING (8 blank DOCX paragraphs) — no journal source files exist for this topic"
  ]
});
