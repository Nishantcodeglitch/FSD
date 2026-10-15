window.COURSE_LESSONS.push({
  id: "w12-use-effect",
  file: "068",
  unit: 3,
  week: 12,
  title: "useEffect",
  kicker: "Unit III · Week 12 · Lesson 5 of 7",
  minutes: 20,
  objectives: [
    "Explain what an effect is and separate rendering from synchronising with the outside world",
    "Use the useEffect API: callback, dependency array, cleanup function",
    "Tell apart empty-array, changing-array and missing dependency arrays",
    "Read the exhaustive-deps warning in plain language and fix a stale-closure bug"
  ],
  intro: `
    <p>Lesson 067 gave you a box that never redraws — a ref holding a timer id but not reacting to
    anything. Everything in these first five lessons, however, still happens <em>during</em> render:
    state in, JSX out, React redraws. But a real app must also talk to things React does not own —
    start a timer, fetch from a server, subscribe to an event, focus a DOM node.
    <code>useEffect</code> is the hook for that <strong>outside world</strong>. Your journal admits
    straight up where its version of this topic comes from —
    <code>lab19/notes.txt</code> says <em>"we have to add the useEffect in the journal as it is the
    last part we can find examples online"</em> — so this lesson teaches the official react.dev way and
    lines it up against your lab's real interval code.</p>
  `,
  theory: [
    `
      <h3>What an effect is (and what it is not)</h3>
      <p>An <strong>effect</strong> is code that must run <em>because something happened in the real
      world</em>, not because of what React is about to draw. Rendering must stay <strong>pure</strong>
      (same state → same JSX, no side effects — Lesson 063's <code>render = f(state)</code>), so the
      two are kept apart:</p>
      <table>
        <thead>
          <tr><th>During render</th><th>In an effect</th></tr>
        </thead>
        <tbody>
          <tr><td>read state and props, return JSX</td><td>fetch data, set timers, subscribe, log, focus, talk to browser APIs</td></tr>
          <tr><td>runs on every render React does</td><td>runs <em>after</em> React commits the render to the screen (after paint)</td></tr>
          <tr><td>must be pure</td><td>impure by definition — it's the sanctioned place for impurity</td></tr>
        </tbody>
      </table>
      <p>Equally important: <strong>many things don't need an effect at all.</strong> Recomputing a
      total, filtering a list, toggling a class when a prop changes — that is derived data or plain
      render logic. If your effect only sets state from other state, you probably wanted a render-time
      calculation (Lesson 064's derived-state rule) or an event handler instead. Effects are for
      <em>external</em> systems.</p>
    `,
    `
      <h3>The API: callback, dependencies, cleanup</h3>
      <pre class="diagram">  useEffect(() => {
      // 1. SETUP — start the external thing
      const id = setInterval(tick, 1000);

      return () => {
          // 2. CLEANUP — undo it (optional but critical for timers/subscriptions)
          clearInterval(id);
      };
  }, [roomId]);   // 3. DEPENDENCIES — "run again when these change"</pre>
      <ul>
        <li>The <strong>callback</strong> is what to do. It runs after the first paint, and again
        whenever a dependency changed. It returns either <code>undefined</code> or a
        <strong>cleanup function</strong>.</li>
        <li>The <strong>cleanup</strong> runs before the effect re-runs and when the component
        unmounts. Timer started? Clean it up. Event listener added? Remove it. Connection opened?
        close it. Matching pairs, always.</li>
        <li>The <strong>dependency array</strong> is a list of values the effect reads
        (<code>[roomId]</code>, <code>[count]</code>, <code>[data]</code>). React compares it with
        <code>Object.is</code> between renders — the same rule state uses. <strong>If nothing in the
        list changed, the effect does not re-run.</strong></li>
      </ul>
      <p>Ordering guarantee: setup → (deps changed) → cleanup → setup → … → (unmount) → cleanup. The
      journal's Timer is a complete specimen of this lifecycle — see example 1.</p>
    `,
    `
      <h3>Three flavours of the dependency array</h3>
      <table>
        <thead>
          <tr><th>You write</th><th>Effect runs</th><th>Typical use</th></tr>
        </thead>
        <tbody>
          <tr><td><code>[]</code> (empty array)</td><td><strong>once on mount</strong>, cleanup on unmount</td><td>fetch initial data, start an interval, subscribe</td></tr>
          <tr><td><code>[a, b]</code></td><td>on mount and <strong>whenever a or b changes</strong></td><td>reconnect when <code>roomId</code> changes, refetch when <code>userId</code> changes</td></tr>
          <tr><td><em>no second argument</em></td><td><strong>after every single render</strong></td><td>almost always an accident — it fires on keystrokes, counters, everything</td></tr>
          <tr><td><code>undefined</code></td><td>same as omitting it</td><td>never do this on purpose</td></tr>
        </tbody>
      </table>
      <p>The subtle one is the <strong>empty array</strong>: <code>[]</code> says "this list is always
      empty, so nothing can change, so never re-run". It does <em>not</em> mean \"run before mount\" —
      it means mount-only. And an empty array with stale data inside is the classic beginner bug,
      explained next.</p>
    `,
    `
      <h3>Exhaustive deps, in plain English</h3>
      <p>Here is the entire rule: <strong>if your effect mentions a value, that value goes in the
      dependency array.</strong> The ESLint rule <code>react-hooks/exhaustive-deps</code> (part of
      <code>eslint-plugin-react-hooks</code>, already configured in your lab's
      <code>eslint.config.js</code>) reads your effect and complains about anything you forgot.</p>
      <p><em>Why?</em> Because the effect only re-runs when its dependencies change — so a value that
      is <em>not</em> listed freezes at the value it had when the effect last ran. That frozen copy is
      a <strong>stale closure</strong>. Classic repro: an interval created once with
      <code>setInterval(() => setCount(count + 1), 1000)</code> and <code>[]</code> deps — the
      callback captured <code>count = 0</code> from the first render forever and prints 1 forever.
      You have already seen the two cures in this course: the functional updater
      <code>setCount(prev =&gt; prev + 1)</code> (Lesson 064, the journal's Timer uses it) or adding
      <code>count</code> to the deps — which restarts the effect, hence the id-in-a-ref pattern from
      Lesson 067.</p>
      <div class="callout">
        <p><strong>When the linter says \"move it into the effect\" instead:</strong> sometimes the fix
        for a missing dependency is not adding it but <em>removing the need</em> — define the object or
        helper function <em>inside</em> the effect so it is no longer an outside value. react.dev's
        guidance: prefer the smallest change that makes the effect's logic self-contained
        (see <code>removing-effect-dependencies</code> in the sources).</p>
      </div>
    `,
    `
      <h3>Common mistakes</h3>
      <ul>
        <li><strong>Missing cleanup.</strong> Starting an interval/listener/subscription and never
        clearing it → in Strict Mode dev you get <em>two</em> intervals ticking (double-mount is
        deliberate, to expose exactly this), and in production the ghost survives unmounts.</li>
        <li><strong>Async callback directly.</strong> <code>useEffect(async () =&gt; {...})</code> is
        wrong: the callback must return cleanup or nothing, and an async function returns a Promise.
        Wrap the async work inside: <code>useEffect(() => { async function go(){...} go(); }, [])</code>
        or use an inner <code>.then</code>/<code>AbortController</code>.</li>
        <li><strong>Syncing state with an effect when rendering would do.</strong> If
        <code>setTotal(count * price)</code> lives in an effect, delete it and compute during render
        (Lesson 064).</li>
        <li><strong>Ignoring the linter.</strong> <code>// eslint-disable-next-line
        exhaustive-deps</code> is a confession, not a fix — understand what the rule wants first.</li>
        <li><strong>Effect in the wrong place.</strong> Top level of the component only — the rules of
        hooks callout from Lesson 064 applies to <code>useEffect</code> like every other hook.</li>
      </ul>
    `
  ],
  examples: [
    {
      title: "The journal's full lifecycle: interval + cleanup in lab19",
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
        "<strong>Setup:</strong> <code>setInterval</code> starts once, after the first paint — nothing runs during render itself.",
        "<strong>Dependencies: <code>[]</code></strong> — mount-only. The interval is started once and never restarted, which is right for a lifetime timer.",
        "<strong>Cleanup:</strong> the returned arrow function calls <code>clearInterval</code>; React runs it on unmount (and before any re-run of the effect).",
        "The updater form <code>prevCount =&gt; prevCount + 1</code> dodges the stale-closure problem even though <code>count</code> is deliberately absent from the deps.",
        "This one file demonstrates all three API parts — it is the reference specimen for this lesson."
      ],
      run: "cd sorted_files/12_Week-12_Hooks/lab19 && npm i && npm run dev",
      output: "Count: 1 → Count: 2 → Count: 3 (stops on unmount; dev Strict Mode may start it twice, which cleanup prevents)"
    },
    {
      title: "The journal admits where its useEffect material came from",
      from: "journal",
      file: "sorted_files/12_Week-12_Hooks/lab19/notes.txt",
      lang: "text",
      code: `
//do the set interval example from there and set immediate

we have to add the useEffect in the journal as it is the last part we can find examples online.`,
      explain: [
        "The journal's own confession, quoted verbatim (the file also links a Medium article about <code>useRef</code> examples above this line).",
        "So of all the hooks this week, <code>useEffect</code> is the one your class sourced from the internet — this lesson therefore follows the official react.dev material (see <code>sources</code>) and maps it onto <code>lab19/src/App.jsx</code>.",
        "\"the set interval example from there\" is precisely the interval+cleanup code of example 1 — the thread from the notes to the lab file."
      ],
      run: "not a program — read it with: Get-Content sorted_files/12_Week-12_Hooks/lab19/notes.txt"
    },
    {
      title: "Three dependency arrays side by side: [] vs [count] vs none",
      from: "new",
      lang: "jsx",
      code: `
import { useState, useEffect } from "react";

export default function DepsDemo() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("lab");

  useEffect(() => {
    console.log("[mount only] effect ran once");
  }, []);                                  // empty array → mount

  useEffect(() => {
    console.log("[count changed] count is now", count);
  }, [count]);                             // listed value → on change

  useEffect(() => {
    console.log("[every render] fires on ANY state change");
  });                                      // no array → after every render

  return (
    <div>
      <p>count {count} / name {name}</p>
      <button onClick={() => setCount(count + 1)}>count++</button>
      <button onClick={() => setName(name + "!")}>rename</button>
    </div>
  );
}`,
      explain: [
        "Save as <code>DepsDemo.jsx</code> and open the browser console — the logs make the table from theory section 3 visible and audible.",
        "Initial load prints all three lines: every effect runs once after the first paint.",
        "Click <em>count++</em>: the <code>[count]</code> and no-array effects log; the <code>[]</code> one stays silent.",
        "Click <em>rename</em>: only the no-array effect logs — that is the \"runs after every render\" flavour, and the reason an omitted array is almost always a bug (it fires on every keystroke in a real form)."
      ],
      run: "drop into any Vite app and npm run dev, then watch the console",
      output: `[mount only] effect ran once
[count changed] count is now 0
[every render] fires on ANY state change
  — click count++ →
[count changed] count is now 1
[every render] fires on ANY state change`
    },
    {
      title: "Fetch on mount: the pattern with a guard against late replies",
      from: "new",
      lang: "jsx",
      code: `
import { useState, useEffect } from "react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let ignore = false;   // becomes true if we unmount or refetch first

    async function load() {
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        const data = await res.json();
        if (!ignore) {
          setUsers(data);
          setStatus("ready");
        }
      } catch (err) {
        if (!ignore) setStatus("error: " + err.message);
      }
    }
    load();

    return () => { ignore = true; };   // cleanup: cancel the state update
  }, []);                              // mount only — one fetch per mount

  if (status === "loading") return <p>Fetching users...</p>;

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}`,
      explain: [
        "Save as <code>Users.jsx</code>. The async work lives in an inner <code>async function load()</code> called from the effect — the effect callback itself stays synchronous so it can return cleanup (mistake list, item 2).",
        "<code>let ignore = false</code> is the classic guard: if the component unmounts while the network is still round, cleanup sets it and the <code>setState</code> calls are skipped — no \"setState on unmounted component\" warnings.",
        "<code>[]</code> = fetch once on mount. If the fetch depended on a prop (say <code>userId</code>), that prop would go in the array and retrigger the effect — same rule as everywhere in this lesson.",
        "<code>key={u.id}</code> on the mapped rows: React needs a stable identity per list item (Lesson 064)."
      ],
      run: "drop into any Vite app and npm run dev",
      output: "Fetching users... → Leanne Graham, Ervin Howell, Clementine Bauch, ..."
    },
    {
      title: "Update effect: syncing the document title",
      from: "new",
      lang: "jsx",
      code: `
import { useState, useEffect } from "react";

export default function CartPage() {
  const [items, setItems] = useState(["book"]);
  const [theme, setTheme] = useState("light"); // changes but shouldn't touch the title

  useEffect(() => {
    document.title = "Cart (" + items.length + ")";
    return () => { document.title = "My Shop"; };  // tidy up on unmount
  }, [items]);   // <- only 'items' is mentioned in the effect, so only 'items' is listed

  return (
    <div>
      <p>Theme: {theme} — toggling me does NOT re-run the effect.</p>
      <p>{items.length} item(s)</p>
      <button onClick={() => setItems([...items, "pen"])}>Add</button>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>Theme</button>
    </div>
  );
}`,
      explain: [
        "Save as <code>CartPage.jsx</code>. An \"update effect\": it runs when a specific value changes and touches a real external system (<code>document.title</code>, which React does not manage).",
        "Note the dependency discipline: <code>theme</code> exists in the component but is <em>not</em> in the effect and not in the deps — react's rule is \"everything the effect reads\", not \"everything in the component\".",
        "The cleanup restores the original title — every setup (write) gets an undo (cleanup), same pairing as <code>clearInterval</code> in example 1.",
        "Compare with the anti-pattern: if you set state from state here, you wanted render-time computation instead — see theory section 1."
      ],
      run: "drop into any Vite app and npm run dev",
      output: "Browser tab reads 'Cart (1)'; click Add → 'Cart (2)'"
    },
    {
      title: "Spot the stale closure — and the two fixes",
      from: "new",
      lang: "jsx",
      code: `
import { useState, useEffect } from "react";

export default function StaleCounter() {
  const [count, setCount] = useState(0);
  const [log, setLog] = useState("");

  useEffect(() => {
    // 🔴 BROKEN: count is not in the deps, so this closure froze at count = 0.
    // The interval would print "1" forever if it used count + 1.
    const id = setInterval(() => setCount(count + 1), 1000);
    return () => clearInterval(id);
  }, []); // exhaustive-deps warns: 'count' is missing

  // ✅ FIX 1 (what the journal's lab19 Timer does): functional updater, no count read
  //    setCount(prev => prev + 1)  — but then the interval must not restart on count,
  //    which is exactly why [] with prev => prev + 1 is the right pairing.

  // ✅ FIX 2: list it and accept the restart
  //    }, [count]);  ← effect re-runs every second: clear + new interval each tick.

  return (
    <div>
      <p>count: {count} / {log}</p>
      <button onClick={() => setLog("count was " + count)}>Snapshot</button>
    </div>
  );
}`,
      explain: [
        "Save as <code>StaleCounter.jsx</code> and run it — ESLint underlines <code>count</code> and prints <code>React Hook useEffect has a missing dependency: 'count'</code>. That warning <em>is</em> exhaustive-deps.",
        "The mechanism: <code>count</code> was captured when the effect ran (mount), so the closure holds <code>0</code> forever — every tick computes <code>0 + 1 = 1</code> and React replaces the value with the same number.",
        "<strong>Fix 1</strong> — the functional updater: never read <code>count</code>, so there is no dependency to declare; this is exactly what <code>lab19/src/App.jsx</code> does with <code>prevCount =&gt; prevCount + 1</code>.",
        "<strong>Fix 2</strong> — <code>[count]</code>: correct but wasteful here (clear/recreate the interval every second), a reminder that sometimes the right fix is restructuring (Lesson 069/070's memoisation, or moving the value inside the effect)."
      ],
      run: "drop into any Vite app and npm run dev (with ESLint running)",
      output: "ESLint: React Hook useEffect has a missing dependency: 'count'. Either include it or remove the dependency array."
    }
  ],
  keyPoints: [
    "useEffect runs AFTER React commits a render: useEffect(callback, deps) — callback does setup, may return a cleanup that runs before re-run and on unmount.",
    "Empty array [] = run once on mount; [a, b] = run when a or b change; no array = after every render (almost always a bug).",
    "Exhaustive deps in one sentence: every value the effect reads belongs in the dependency array — otherwise it goes stale (frozen closure).",
    "Pair every setup with cleanup: setInterval ↔ clearInterval, fetch ↔ ignore/abort, listener ↔ removeEventListener.",
    "Effects are for React's outside world (timers, network, DOM, subscriptions) — derived values are computed during render, not in an effect."
  ],
  practice: `
    <p>Open <code>lab19/src/App.jsx</code> and change the deps from <code>[]</code> to
    <code>[count]</code>. Predict first, then run: the interval restarts every tick (the cleanup
    clears the old one each second) — count still climbs, but the ESLint warning is gone. Revert to
    <code>[]</code>. Then write your own effect that hides a <code>&lt;div className="banner"&gt;</code>
    after 5 seconds using <code>setTimeout</code> — remember the <code>clearTimeout</code> cleanup
    (the journal file named <em>setTimeout</em> really does use <code>setInterval</code>, Lesson 067).</p>
  `,
  quiz: [
    {
      q: "A component has useEffect(() => { ... }); with NO dependency array. When does the effect run?",
      options: [
        "Only once, on mount",
        "Only when the component unmounts",
        "After every re-render of the component",
        "Never — it is a syntax error"
      ],
      answer: 2,
      why: "With no array React re-runs the effect after every commit; [] means mount-only; [a] means whenever a changes. The no-array form usually fires far more often than intended — that is the mistake."
    },
    {
      q: "ESLint says: 'React Hook useEffect has a missing dependency: roomId'. What is the real problem being reported?",
      options: [
        "The effect needs a cleanup function",
        "The effect reads roomId but roomId is not in the deps array, so the effect keeps using a stale (frozen) copy of it",
        "roomId must be converted to state",
        "The effect must be moved inside an event handler"
      ],
      answer: 1,
      why: "Dependencies decide when the effect re-runs — an unlisted value never triggers a re-run, so the effect operates on the value from the last time it ran. exhaustive-deps is pointing at that stale closure; the fix is to add it (or remove the need, e.g. move the value inside the effect)."
    }
  ],
  sources: [
    "https://react.dev/reference/react/useEffect",
    "https://react.dev/learn/synchronizing-with-effects",
    "https://react.dev/learn/lifecycle-of-reactive-effects",
    "https://react.dev/learn/removing-effect-dependencies"
  ]
});
