window.COURSE_LESSONS.push({
  id: "w12-use-callback",
  file: "070",
  unit: 3,
  week: 12,
  title: "useCallback",
  kicker: "Unit III · Week 12 · Lesson 7 of 7",
  minutes: 17,
  objectives: [
    "Explain why a plain function is a brand-new object on every render",
    "Cache a function definition with useCallback(fn, deps) and read its dependency array",
    "State exactly when function identity matters: memo()'d children and hook dependencies",
    "Pair useCallback with useMemo and decide when to skip memoisation entirely"
  ],
  intro: `
    <p>Lesson 069 cached a <em>value</em>; this final lesson of Week 12 caches a <em>function</em>.
    The need looks identical — your journal's <code>react4</code> wallet re-creates
    <code>buyBook</code> on every render just like it re-creates every variable — but the consequences
    land in different places, because other components and effects compare functions by identity.</p>
    <p>Honest note as before: <strong>12.7 is missing from the journal</strong>
    (<code>journal_sorted/03_Unit-III_Weeks-11-14.txt</code>: <code>12.7 useCallback -&gt; MISSING (8
    blank paras in DOCX)</code>, and the week's <code>MISSING.txt</code> says no source files were
    supplied). This lesson follows the official react.dev reference (in <code>sources</code>), with
    mostly <code>new</code> examples — plus the journal's own <code>Students.jsx</code> reused as the
    "before" case every explanation starts from.</p>
  `,
  theory: [
    `
      <h3>Why a function is "new" every render</h3>
      <p>In JavaScript, writing <code>function foo(){}</code> or <code>const foo = () =&gt; {}</code>
      inside another function creates a <strong>fresh object</strong> on every call — exactly like
      <code>{}</code> and <code>[]</code> do (Lesson 064's reference rule). Your component body runs
      top to bottom on each render, so this happens all the time:</p>
      <pre class="diagram">  render #1:  const buyBook = () => {…}   →  function identity A
  render #2:  const buyBook = () => {…}   →  function identity B   (A !== B)</pre>
      <p>Normally that is harmless — nobody is looking. But two places <em>do</em> look:</p>
      <ul>
        <li>a child wrapped in <strong><code>memo()</code></strong>, which compares its props with
        <code>Object.is</code> and would see <code>onBuy</code> change on every render;</li>
        <li>a <strong><code>useEffect</code> / <code>useMemo</code> dependency array</strong>
        (Lesson 068) — a function listed there would be "always new", re-firing the effect forever.</li>
      </ul>
      <p><code>useCallback(fn, deps)</code> is the fix: it keeps <strong>the same function object</strong>
      until one of its dependencies changes.</p>
    `,
    `
      <h3>The API</h3>
      <pre class="diagram">  const handleSubmit = useCallback(
      (orderDetails) => { post(url, orderDetails); },   // 1. the function itself
      [productId, referrer]                             // 2. dependencies (same rules as always)
  );</pre>
      <ul>
        <li><strong>It returns, not calls.</strong> React hands your function back to you; you decide
        when to run it. (Contrast <code>useMemo</code>, which <em>calls</em> its function and caches
        the result.)</li>
        <li><strong>Deps work exactly as in Lesson 068/069:</strong> <code>Object.is</code> comparison,
        list everything the function reads, no array = new function every render (defeats the whole
        point), stale entry = stale closure inside the callback.</li>
        <li><strong>It does not stop you from <em>creating</em> the function</strong> — React still
        builds a new one each render and then discards it in favour of the cached copy. "The
        generation is cheap; the identity is what we're preserving."</li>
        <li>Rules of hooks (Lesson 064 callout) apply unchanged: top level of the component only.</li>
      </ul>
      <p>The journal's wallet is the perfect "before" picture — see example 4, including the react.dev
      trick of dropping the <code>money</code> dependency with a functional updater so the cached
      callback can have <code>[]</code> deps.</p>
    `,
    `
      <h3>useCallback vs useMemo — one idea, two caches</h3>
      <table>
        <thead>
          <tr><th></th><th>useMemo</th><th>useCallback</th></tr>
        </thead>
        <tbody>
          <tr><td>Caches</td><td>the <strong>result</strong> of calling your function</td><td>the <strong>function itself</strong></td></tr>
          <tr><td>React</td><td>runs your function when deps change, stores the return value</td><td>never runs your function — just returns it</td></tr>
          <tr><td>Use when</td><td>a value must stay identical (lists, options objects, JSX)</td><td>a function must stay identical (handlers passed down, effect deps)</td></tr>
          <tr><td>Equivalent form</td><td colspan="2"><code>useCallback(fn, deps)</code> ≡ <code>useMemo(() =&gt; fn, deps)</code> — react.dev gives this exact simplification</td></tr>
        </tbody>
      </table>
      <p>They are routinely paired: memoise the computed <em>requirements</em> with
      <code>useMemo</code> and the <em>submit handler</em> with <code>useCallback</code>, then pass
      both to the same <code>memo()</code>'d child (example 5). Same dependency-array discipline, same
      exhaustive-deps linter, different thing being kept stable.</p>
    `,
    `
      <h3>When identity actually matters (and when to skip it)</h3>
      <p>react.dev is blunt: caching a function is valuable in only a few cases —</p>
      <ol>
        <li>You pass it to a child wrapped in <strong><code>memo()</code></strong> and want that child
        to skip re-rendering when nothing else changed. Without a stable function, <code>memo</code>
        can never see "same props".</li>
        <li>The function is a <strong>dependency of a Hook</strong> — an effect that must not re-fire,
        or another memoised value that derives from it.</li>
        <li>You are writing a <strong>custom hook</strong>: wrap the functions it returns in
        <code>useCallback</code> so your consumers <em>can</em> optimise later (react.dev's explicit
        recommendation).</li>
      </ol>
      <div class="note">
        <p><strong>When to skip it:</strong> for handlers used directly in your own JSX
        (<code>&lt;button onClick={buyBook}&gt;</code>), a new function each render is free — nothing
        compares it. Also skip when the child is not wrapped in <code>memo</code> (memoising a prop
        nobody checks buys nothing), when a dependency is an inline object/array that's "always new",
        and whenever you're memoising <em>before</em> measuring. If your code doesn't work without it,
        the bug is elsewhere — memoisation is performance only, never correctness. Fewer, simpler
        dependencies beat a wall of hooks you're afraid to touch.</p>
      </div>
    `,
    `
      <h3>Common mistakes</h3>
      <ul>
        <li><strong>Forgetting the dependency array.</strong> <code>useCallback(fn)</code> with no deps
        returns a new function every render — you paid for nothing (react.dev's first troubleshooting
        entry).</li>
        <li><strong>Missing dependencies.</strong> Same stale-closure disease as effects (Lesson 068):
        the cached callback keeps reading the value from the render where its deps last changed. Fix by
        listing it, or — better for state — using the functional updater so it isn't read at all
        (example 4).</li>
        <li><strong>Wrapping children that aren't memo'd.</strong> <code>useCallback</code> only pays
        off together with <code>memo()</code> or a dependency array — alone it is ceremony.</li>
        <li><strong>Memoising a value "always new".</strong> A dep like <code>options</code> (inline
        object) or <code>items.filter(...)</code> results in a new function identity anyway; memoise
        the dep too (Lesson 069, example 6) or remove the need.</li>
        <li><strong>Calling a hook inside a condition/loop</strong> — rule 1, every hook, including
        this one.</li>
      </ul>
    `
  ],
  examples: [
    {
      title: "Function identity, demonstrated: plain vs useCallback",
      from: "new",
      lang: "jsx",
      code: `
import { useState, useCallback, useRef } from "react";

export default function Identity() {
  const [n, setN] = useState(0);

  function plain() { return "me"; }                 // new object every render
  const cached = useCallback(function cached() {    // same object until deps change
    return "me";
  }, []);

  const plainId = useRefId(plain);
  const cachedId = useRefId(cached);

  return (
    <div>
      <p>renders: {n}</p>
      <p>plain === previous?  {String(plainId.same)}   (always false)</p>
      <p>cached === previous? {String(cachedId.same)}  (always true)</p>
      <button onClick={() => setN(n + 1)}>re-render</button>
    </div>
  );
}

// tiny helper: compares the current function with the one from the last render
function useRefId(fn) {
  const prev = useRef(fn);
  const same = prev.current === fn;
  prev.current = fn;
  return { same };
}`,
      explain: [
        "Save as <code>Identity.jsx</code> and click <em>re-render</em>: the plain function is a different object every time (<code>===</code> false), the <code>useCallback</code> one keeps its identity (true).",
        "The ref-based helper is a plain-JS probe using Lesson 067: <code>prev.current === fn</code> is exactly how <code>memo()</code> and dependency arrays compare things — <code>Object.is</code> on references.",
        "Note <code>[]</code> deps on the cached version: nothing it reads changes, so its identity is stable for the component's whole life.",
        "Both functions behave identically when <em>called</em> — only their identity differs, and identity is the whole game for the next two examples."
      ],
      run: "drop into any Vite app and npm run dev",
      output: "renders: 1 → plain === previous? false / cached === previous? true → click → same answers again"
    },
    {
      title: "The payoff: useCallback + memo() child skips re-renders",
      from: "new",
      lang: "jsx",
      code: `
import { useState, useCallback, memo } from "react";

const ShippingForm = memo(function ShippingForm({ onSubmit }) {
  console.log("rendering <ShippingForm />");
  function send(e) {
    e.preventDefault();
    onSubmit({ street: e.target.street.value });
  }
  return (
    <form onSubmit={send}>
      <input name="street" placeholder="street" />
      <button>Submit</button>
    </form>
  );
});

export default function ProductPage({ productId }) {
  const [theme, setTheme] = useState("light");

  // ✅ same function identity while productId is unchanged
  const handleSubmit = useCallback((details) => {
    console.log("POST /product/" + productId + "/buy", details);
  }, [productId]);

  return (
    <div className={theme}>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Theme: {theme}
      </button>
      <ShippingForm onSubmit={handleSubmit} />
    </div>
  );
}`,
      explain: [
        "Save as <code>ProductPage.jsx</code> and flip the theme: <code>rendering &lt;ShippingForm /&gt;</code> does <strong>not</strong> log — the memo child saw identical props and skipped.",
        "Two halves are required together: <code>memo()</code> on the child (comparison) and <code>useCallback</code> on the prop (stable identity). Remove either and the child re-renders on every theme click — try it.",
        "<code>[productId]</code> is listed because the handler reads it — change that prop and you <em>want</em> a new function (the cached one would post to the old URL).",
        "react.dev's exact example pattern, including the console.log stand-in for a network POST."
      ],
      run: "drop into any Vite app and npm run dev, watch the console",
      output: "rendering <ShippingForm />   (mount only — theme flips add nothing)"
    },
    {
      title: "As a hook dependency: stopping an effect from re-firing",
      from: "new",
      lang: "jsx",
      code: `
import { useState, useEffect, useCallback } from "react";

export default function Analytics({ userId }) {
  const [events, setEvents] = useState([]);

  const track = useCallback((name) => {
    // real app: navigator.sendBeacon("/track", name)
    setEvents(prev => [...prev, userId + ":" + name]);
  }, [userId]);                       // identity stable while userId is stable

  useEffect(() => {
    console.log("analytics connected for", userId);
    const off = subscribe(track);     // pretend: registers the callback
    return () => off();               // cleanup, per Lesson 068
  }, [track]);                        // ✅ re-subscribes only when track changes

  return <p>{events.length} events tracked</p>;
}

function subscribe(fn) {
  console.log("subscribed with", typeof fn);
  return () => console.log("unsubscribed");
}`,
      explain: [
        "Save as <code>Analytics.jsx</code>. The effect lists a <em>function</em> in its deps — a case where identity decides behaviour.",
        "Without <code>useCallback</code>, <code>track</code> is new every render, so the effect would unsubscribe/resubscribe after every state update — reconnect churn, exactly Lesson 068's \"always-new dependency\" problem.",
        "With it, <code>track</code> only changes when <code>userId</code> changes — the effect fires on mount and on a real user switch, nothing else.",
        "Note the pairing again: <code>setEvents(prev =&gt; …)</code> (functional updater) means the callback reads no other state, keeping its dependency list to one."
      ],
      run: "drop into any Vite app and npm run dev, watch the console",
      output: `subscribed with function
analytics connected for u-2408023
  — click/track → NO reconnect —`
    },
    {
      title: "The journal's wallet as the 'before' case — then memoised",
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
        "This is the journal's code exactly as submitted — and it is <strong>fine</strong> as written: <code>buyBook</code> is handed straight to this component's own <code>&lt;button&gt;</code>, and nothing compares its identity (theory section 3, \"when to skip it\").",
        "But read it through the identity lens: <code>buyBook</code> is re-created on every render, and it reads <code>money</code> — so a naive <code>useCallback(…, [money])</code> would mint a new function on every purchase anyway, useless for a <code>memo()</code>'d child.",
        "<strong>The react.dev fix</strong> (its \"Updating state from a memoized callback\" recipe, same shape): stop reading <code>money</code> — <code>setMoney(prev =&gt; (prev - 200 &lt; 0 ? prev : prev - 200));</code> — then <code>useCallback(fn, [])</code> is genuinely stable for life.",
        "Three lessons meet here: Lesson 064's functional updater, Lesson 068's dependency discipline, and this lesson's identity caching — in one five-line function."
      ],
      run: "cd sorted_files/12_Week-12_Hooks/react4 && npm i && npm run dev",
      output: "Sal / Pocket money: 1000 / [Buy books 200] → click → 800"
    },
    {
      title: "The pair: useMemo for a value + useCallback for a handler",
      from: "new",
      lang: "jsx",
      code: `
import { useMemo, useCallback, memo } from "react";

const OrderSummary = memo(function OrderSummary({ requirements, onSubmit }) {
  return (
    <section>
      <h3>Requirements</h3>
      <ul>{requirements.map(r => <li key={r}>{r}</li>)}</ul>
      <button onClick={() => onSubmit({ kind: "express" })}>Order</button>
    </section>
  );
});

export default function ProductPage({ product }) {
  // 🡒 useMemo caches the RESULT: an array built from product
  const requirements = useMemo(
    () => ["size: " + product.size, "weight: " + product.weight, "ship from: " + product.warehouse"],
    [product]
  );

  // 🡒 useCallback caches the FUNCTION: same object while product is stable
  const handleSubmit = useCallback((details) => {
    console.log("POST /order", { product: product.id, ...details });
  }, [product]);

  return <OrderSummary requirements={requirements} onSubmit={handleSubmit} />;
}`,
      explain: [
        "Save as <code>ProductPage.jsx</code>. Both hooks share the exact dependency array style — the only difference is what each preserves (result vs function, theory section 3's table).",
        "The child gets <em>two</em> stable props, so <code>memo()</code> can skip it whenever <code>product</code> is unchanged — one memoised value alone would not be enough, since <code>onSubmit</code> would still churn.",
        "react.dev states the equivalence directly: <code>useCallback(fn, deps)</code> is <code>useMemo(() =&gt; fn, deps)</code> — this file written with only <code>useMemo</code> would behave identically, just clunkier to read.",
        "Change <code>product</code> (a new object from a fetch, say) and both caches correctly miss together — dependencies are the shared clockwork of Lesson 069 and this one."
      ],
      run: "drop into any Vite app and npm run dev",
      output: "Requirements list rendered once; [Order] logs POST /order with the product id"
    },
    {
      title: "When to skip it: no memo child, no dependency — no useCallback",
      from: "new",
      lang: "jsx",
      code: `
import { useState } from "react";

export default function Local() {
  const [a, setA] = useState(0);
  const [b, setB] = useState("");

  // 🔴 Pointless: this handler goes into OUR OWN JSX — nothing compares it.
  // const bump = useCallback(() => setA(a + 1), [a]);
  const bump = () => setA(a + 1);          // ✅ simpler, identical behaviour

  const rows = b.length > 2 ? b.split("") : [];   // derived, not memoised (it's cheap)

  return (
    <div>
      <p>a = {a}</p>
      <button onClick={bump}>+1</button>
      <input value={b} onChange={e => setB(e.target.value)} />
      <p>{rows.length} chars</p>
    </div>
  );
}`,
      explain: [
        "Save as <code>Local.jsx</code> — a completely normal component, deliberately free of every hook from Lessons 069–070.",
        "The commented-out line shows what you'd be adding: a dependency array to audit, a stale-closure risk (reading <code>a</code>), and zero benefit, because the only consumer of <code>bump</code> is this component's own <code>onClick</code>.",
        "react.dev's skip-list: no <code>memo()</code> child to protect, no hook dependency to stabilise, calculation not slow (the <code>rows</code> split is trivial) → write it plain.",
        "Rule of order from the docs: build it without memoisation → measure with the React DevTools profiler → add <code>useMemo</code>/<code>useCallback</code> only where a real interaction is laggy."
      ],
      run: "drop into any Vite app and npm run dev",
      output: "a = 0 → click → a = 1; typing in the input grows the char count"
    }
  ],
  keyPoints: [
    "Every function you declare in a component body is a new object each render — harmless until something compares identity.",
    "useCallback(fn, deps) returns the SAME function until a dependency changes (Object.is) — it returns the function, never calls it.",
    "Identity matters in exactly two places: a memo()'d child's props and Hook dependency arrays.",
    "useCallback ≡ useMemo(() => fn, deps): one caches the function, the other caches its result — they are routinely paired.",
    "Skip it when the child isn't memo'd, the handler is used locally, or a dependency is 'always new' — memoisation is performance, never correctness.",
    "Week 12.7 is missing from the journal (8 blank DOCX paragraphs) — this lesson follows react.dev; the journal's buyBook handler is the 'before' case."
  ],
  practice: `
    <p>Take <code>sorted_files/12_Week-12_Hooks/react4/src/components/Students.jsx</code> and complete
    example 4's transformation: change the setter to
    <code>setMoney(prev =&gt; (prev - 200 &lt; 0 ? prev : prev - 200))</code>, wrap
    <code>buyBook</code> in <code>useCallback(…, [])</code>, then wrap the whole
    <code>Student</code> in <code>memo(...)</code> and render it from a parent with a counter — click
    the parent's counter and confirm via a <code>console.log</code> inside <code>Student</code> that
    it now skips rendering. Remove <code>useCallback</code> and watch the skip disappear.</p>
  `,
  quiz: [
    {
      q: "What does useCallback(fn, [id]) return?",
      options: [
        "The result of calling fn(id)",
        "The same function object until id changes — fn itself is never called by React",
        "A new function on every render, for safety",
        "A memoised version of the component"
      ],
      answer: 1,
      why: "useCallback caches the function definition and hands it back; calling it is up to you. Caching the *result* of calling it is useMemo — Lesson 069."
    },
    {
      q: "You wrapped a handler in useCallback but the child still re-renders on every parent state change. Most likely cause?",
      options: [
        "useCallback is broken in React 18",
        "The child is not wrapped in memo() (nothing compares the prop), or a dependency is an inline object/array that's 'always new'",
        "The handler should have been wrapped in useMemo instead",
        "The dependency array must be omitted"
      ],
      answer: 1,
      why: "A stable function only pays off where identity is compared: memo()'d children or hook deps. Without memo() the child re-renders regardless; an always-new dependency makes the cache miss every render — and omitting the array guarantees a new function each render."
    }
  ],
  sources: [
    "https://react.dev/reference/react/useCallback",
    "https://react.dev/reference/react/useCallback#how-is-usecallback-related-to-usememo",
    "https://react.dev/reference/react/useMemo#memoizing-a-function",
    "journal: sorted_files/12_Week-12_Hooks/MISSING.txt and journal_sorted/03_Unit-III_Weeks-11-14.txt record 12.7 as MISSING (8 blank DOCX paragraphs) — no journal source files exist for this topic"
  ]
});
