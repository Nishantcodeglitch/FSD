window.COURSE_LESSONS.push({
  id: "w12-use-ref",
  file: "067",
  unit: 3,
  week: 12,
  title: "useRef",
  kicker: "Unit III · Week 12 · Lesson 4 of 7",
  minutes: 16,
  objectives: [
    "Explain what a ref is: one mutable box whose identity survives re-renders",
    "Contrast ref with state — when .current changes, React does NOT redraw",
    "Attach a ref to a DOM element and use .current for focus, scroll and timer ids",
    "Explain why the journal's timer stores its interval id in a ref"
  ],
  intro: `
    <p>Lesson 066 ended with data that skips drilling: a context Provider at the top,
    <code>useContext</code> at the bottom. This lesson covers the quiet member of the family:
    <code>useRef</code>, a hook that holds a value <em>without</em> ever triggering a render. Your
    journal uses it for the most classic reason there is — remembering a
    <code>setInterval</code> id so it can be cleared later — in both
    <code>lab19/src/App.jsx</code> and its duplicate <code>setTimeout_useRef.js</code>.</p>
  `,
  theory: [
    `
      <h3>A mutable box that survives re-renders</h3>
      <p><code>useRef(initialValue)</code> returns an object with one property:
      <code>{ current: initialValue }</code>. That object is created once and React keeps handing you
      <strong>the exact same object</strong> on every subsequent render — write to
      <code>ref.current</code> whenever you like and the next render sees the new value. Nothing
      schedules a re-render. In the journal's own words (its notes point you to a Medium article on
      "real life examples" of this hook): it is a box you can reach into at any time.</p>
      <pre class="diagram">  const timerRef = useRef(null);

  timerRef.current = 42;     // write — silently, no render
  console.log(timerRef.current);  // read  — 42, in this and every later render</pre>
      <p>Two properties make it special:</p>
      <ul>
        <li><strong>Stable identity.</strong> <code>timerRef</code> is the same object forever, so a
        callback captured in render 1 can safely write to it during render 9 — no stale-closure
        surprises (Lesson 064's stale <code>count</code> problem simply does not exist for refs,
        because you are not reading a frozen <em>value</em>, you are poking the same box).</li>
        <li><strong>No re-render.</strong> The flip side: changing <code>.current</code> updates
        nothing on screen. That is a feature — it is the hook for values the UI does not display.</li>
      </ul>
    `,
    `
      <h3>ref vs state — the one comparison to memorise</h3>
      <table>
        <thead>
          <tr><th></th><th>useState</th><th>useRef</th></tr>
        </thead>
        <tbody>
          <tr><td>Changing it…</td><td>schedules a re-render</td><td>schedules <strong>nothing</strong></td></tr>
          <tr><td>Read during render</td><td>always the current value</td><td><code>.current</code> may be whatever was last written (and <code>null</code> initially for DOM refs)</td></tr>
          <tr><td>Typical contents</td><td>data the screen shows (count, text, flag)</td><td>DOM nodes, timer ids, previous values, scroll positions, anything not rendered</td></tr>
          <tr><td>Updated with</td><td><code>setX(value)</code></td><td><code>ref.current = value</code> (direct assignment)</td></tr>
          <tr><td>Rules of hooks</td><td colspan="2">both: top level only, from a component (Lesson 064 callout still applies)</td></tr>
        </tbody>
      </table>
      <p>The decision test: <strong>would the user see a difference if this value changed?</strong>
      If yes, it is state. If no (a stopwatch's start time, the id of a timer you will clear, the DOM
      node of an input), it is a ref.</p>
    `,
    `
      <h3>The first job: DOM refs — focus, scroll, measuring</h3>
      <p>JSX gives you elements, not variables. Passing <code>ref={someRef}</code> to a built-in
      element makes React store the real DOM node in <code>someRef.current</code> after the element is
      mounted (and set it back to <code>null</code> when it unmounts):</p>
      <pre class="diagram">  const inputRef = useRef(null);

  &lt;input ref={inputRef} placeholder="search" /&gt;
  &lt;button onClick={() =&gt; inputRef.current.focus()}&gt;Focus it&lt;/button&gt;</pre>
      <p>Because <code>.current</code> is only filled in <em>after</em> the first render, you can never
      touch it during the render body — event handlers and effects run later, which is exactly when DOM
      nodes exist. The usual partners are <code>.focus()</code>, <code>.scrollIntoView()</code>,
      <code>.getBoundingClientRect()</code> and <code>.value</code> for reading an input outside React's
      controlled-input pattern.</p>
    `,
    `
      <h3>The journal's job: holding a timer id so it can be cleared</h3>
      <p>The second classic use is holding a <em>handle</em> to something outside React — an interval,
      a timeout, a subscription. Look at the journal's Timer: inside <code>useEffect</code> it starts a
      <code>setInterval</code> and stores the returned id in <code>timerRef.current</code>. The
      effect's cleanup function then reads that id and calls <code>clearInterval</code> — without the
      ref, the cleanup would have no way to know <em>which</em> interval to cancel, and the component
      would keep ticking after it disappears from the screen (or, with Strict Mode's double-mount, tick
      <em>twice</em> — lesson 068 will unpack the whole effect).</p>
      <p>Could a plain variable (<code>let id</code> in module or function scope) do this? No: the
      function that starts the interval and the function that clears it are two different closures from
      two different renders. The ref is the one box both of them can see. This is why
      <code>useRef</code> exists at all — <strong>for values that must live across renders without
      causing them</strong>.</p>
      <div class="note">
        <p><strong>Honest note on the journal file:</strong> <code>lab19/src/setTimeout_useRef.js</code>
        is byte-for-byte the same component as <code>src/App.jsx</code>, and despite its name it uses
        <code>setInterval</code>, not <code>setTimeout</code>. Your <code>journal_sorted</code> entry
        files it as an "unused duplicate" — worth knowing when you run lab19: only
        <code>App.jsx</code> is wired up through <code>main.jsx</code>.</p>
      </div>
    `,
    `
      <h3>Common mistakes</h3>
      <ul>
        <li><strong>Using a ref to make the screen update.</strong> <code>ref.current = x</code> never
        redraws. If the UI must change, it is state (or move it to a reducer/context from earlier
        lessons).</li>
        <li><strong>Reading <code>.current</code> during render and expecting it to be current.</strong>
        For DOM refs it is <code>null</code> on the first render. Read it in handlers/effects only.</li>
        <li><strong>Re-creating the box each render.</strong> You never do this with
        <code>useRef</code> — which is exactly why writing <code>const ref = { current: null }</code>
        manually is a bug: that creates a <em>new</em> object every render and your writes vanish.</li>
        <li><strong>Skipping cleanup because "it's just a timer".</strong> Every id you store wants a
        matching <code>clearInterval</code>/<code>clearTimeout</code> in the effect's return — Lesson
        068.</li>
      </ul>
    `
  ],
  examples: [
    {
      title: "The journal's Timer: a ref holding a setInterval id",
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
        "<code>const timerRef = useRef(null)</code> — one line, one job: a box to keep the interval id in. It starts empty (<code>null</code>).",
        "<code>timerRef.current = setInterval(...)</code> writes the id the moment the effect runs — a silent write, no re-render (contrast with <code>setCount</code> on the line above, which does render).",
        "The cleanup function reads the <em>same box</em> — even though it was registered during a different render's closure — and cancels the right interval.",
        "<code>count</code> is state because the number is displayed; <code>timerRef</code> is a ref because an interval id is never displayed. Both choices, side by side, in 18 lines.",
        "This is the whole week's lab19 file: three hooks (useState, useRef, useEffect) working as one machine."
      ],
      run: "cd sorted_files/12_Week-12_Hooks/lab19 && npm i && npm run dev",
      output: "Count: 1 / Count: 2 / Count: 3 / … (stops the moment the component unmounts)"
    },
    {
      title: "The journal's duplicate file — same box, misleading name",
      from: "journal",
      file: "sorted_files/12_Week-12_Hooks/lab19/src/setTimeout_useRef.js",
      lang: "jsx",
      code: `
import { useState, useRef, useEffect } from 'react';

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
        "This file is identical to <code>src/App.jsx</code> (compare the two examples) — the journal filed it as an unused duplicate, and <code>main.jsx</code> never imports it.",
        "The filename says <code>setTimeout</code> but the code uses <code>setInterval</code> + <code>clearInterval</code> — a naming trap worth calling out; a one-shot timeout would need <code>clearTimeout</code> instead.",
        "Why keep showing it? Because it proves the pattern is the point: whatever the timer API, <em>store the id in a ref</em> so the cleanup can find it.",
        "Rename it mentally: <code>timerRef_interval.js</code>. Nothing else in the file is misleading."
      ],
      run: "not wired into the app — copy it over src/App.jsx if you want to run it",
      output: "Count: 1 / Count: 2 / Count: 3 / …"
    },
    {
      title: "ref vs state: same click, one redraw, one silence",
      from: "new",
      lang: "jsx",
      code: `
import { useState, useRef } from "react";

export default function Race() {
  const [stateCount, setStateCount] = useState(0);
  const refCount = useRef(0);
  const renders = useRef(0);        // counts renders WITHOUT causing more renders
  renders.current = renders.current + 1;   // safe: runs during render, writes a ref

  const bump = () => {
    setStateCount(stateCount + 1); // ← triggers a re-render
    refCount.current = refCount.current + 1; // ← triggers nothing
  };

  return (
    <div>
      <p>Render #{renders.current}</p>
      <p>stateCount: {stateCount} (shown, re-renders)</p>
      <p>refCount: {refCount.current} (stale display — no re-render!)</p>
      <button onClick={bump}>Click both</button>
    </div>
  );
}`,
      explain: [
        "Save as <code>Race.jsx</code>. One button increments a piece of state and a ref — click it five times.",
        "<code>stateCount</code> updates the screen each time (React re-renders and shows 1…5).",
        "<code>refCount</code> also reached 5 — you can verify from the render counter staying still — but the <code>&lt;p&gt;</code> showing it never changed: writing <code>.current</code> schedules no render.",
        "Caveat shown honestly: the JSX reading <code>refCount.current</code> is <em>stale</em> — it only displays whatever the value was at the last (state-caused) render. Never render a ref's value; the render counter is the correct way to observe it.",
        "If the number must be on screen, it was state all along — Lesson 064's decision test."
      ],
      run: "drop into any Vite app and npm run dev",
      output: "Render #1 → click → Render #2, stateCount: 1, refCount: 1 → click → Render #3, stateCount: 2, refCount: 1 (display frozen)"
    },
    {
      title: "DOM ref: focusing an input with .current.focus()",
      from: "new",
      lang: "jsx",
      code: `
import { useRef, useEffect } from "react";

export default function SearchBox() {
  const inputRef = useRef(null);

  useEffect(() => {
    // after mount the DOM node exists, so .current is safe here
    inputRef.current.focus();
  }, []);

  const selectAll = () => {
    inputRef.current.select();   // .current is the real <input> DOM node
  };

  return (
    <div>
      <input ref={inputRef} placeholder="type a roll number" />
      <button onClick={selectAll}>Select text</button>
      <p>The ref never causes a render — it only names an element.</p>
    </div>
  );
}`,
      explain: [
        "Save as <code>SearchBox.jsx</code>. <code>ref={inputRef}</code> is JSX for \"store this DOM node in <code>inputRef.current</code> after mounting\".",
        "The effect runs after the first render, so <code>.current</code> is a live <code>HTMLInputElement</code> and <code>.focus()</code> works — during render it would still be <code>null</code>.",
        "<code>inputRef.current.select()</code> inside the handler proves the write/read path: one stable box holding a node the browser owns.",
        "React sets <code>.current</code> back to <code>null</code> when the element unmounts — another reason to touch it only after render, never during."
      ],
      run: "drop into any Vite app and npm run dev",
      output: "Cursor is in the input on page load; [Select text] highlights what you typed"
    },
    {
      title: "A ref as memory: when did this interaction start?",
      from: "new",
      lang: "jsx",
      code: `
import { useState, useRef, useEffect } from "react";

export default function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startedAt = useRef(0);   // a timestamp the UI never displays directly

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed(prev => Math.round((Date.now() - startedAt.current) / 1000));
    }, 500);
    return () => clearInterval(id);   // same id-in-a-ref pattern as the journal
  }, [running]);

  const start = () => {
    startedAt.current = Date.now();   // no re-render needed — it's just a note
    setElapsed(0);
    setRunning(true);
  };

  return (
    <div>
      <p>{elapsed}s</p>
      <button onClick={start}>{running ? "Running..." : "Start"}</button>
    </div>
  );
}`,
      explain: [
        "Save as <code>Stopwatch.jsx</code>. The start timestamp must be readable by the interval callback but should not itself re-render anything — the textbook ref case.",
        "If <code>startedAt</code> were state, calling <code>setStartedAt</code> would re-render (harmless but wrong tool) — and its value would be frozen inside old closures anyway; the ref's <em>same box</em> guarantees the interval reads the fresh timestamp.",
        "Note the two-hook pair you already know: <code>elapsed</code> is state (displayed), <code>startedAt</code> and the interval id are refs (invisible bookkeeping), <code>running</code> drives the effect (Lesson 068).",
        "The <code>clearInterval(id)</code> cleanup stops the timer when <code>running</code> flips or the component unmounts."
      ],
      run: "drop into any Vite app and npm run dev",
      output: "0s / [Start] → 1s, 2s, 3s…"
    },
    {
      title: "Scrolling back to the top: ref + scrollIntoView",
      from: "new",
      lang: "jsx",
      code: `
import { useRef } from "react";

export default function Article() {
  const topRef = useRef(null);

  const scrollToTop = () => {
    topRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <div ref={topRef} style={{ height: "40vh", background: "#eee" }}>
        <h1>Chapter 12 — React Hooks</h1>
      </div>
      <div style={{ height: "120vh" }}>long content the reader scrolls through</div>
      <button onClick={scrollToTop}>Back to top</button>
    </div>
  );
}`,
      explain: [
        "Save as <code>Article.jsx</code>. The ref points at a <code>&lt;div&gt;</code>, not an input — any HTML element can be a ref target.",
        "<code>scrollIntoView({ behavior: \"smooth\" })</code> is plain DOM API on <code>topRef.current</code>; React is not involved in the scrolling at all.",
        "No state needed: scrolling does not change what the component renders, so a ref keeps rule \"if the screen must change, use state\" intact — nothing on screen changed, only the viewport moved.",
        "Same shape as examples 4 and 5: <em>JSX names the node, .current is the handle, handlers do the work.</em>"
      ],
      run: "drop into any Vite app and npm run dev",
      output: "Clicking [Back to top] smoothly scrolls to Chapter 12"
    }
  ],
  keyPoints: [
    "useRef(initial) returns a stable object { current } that is the same identity across every render.",
    "Writing ref.current never causes a re-render — refs are for values the UI does not display; state is for values it does.",
    "ref={someRef} on a JSX element stores the real DOM node in .current after mount (null before / after unmount) — use it for focus, select, scroll, measurements.",
    "Timer and subscription ids belong in a ref so the cleanup closure from another render can clear the right handle (the journal's lab19 Timer).",
    "Never read .current during render (it may be null or stale) and never hand-roll { current: null } — that creates a new box each render."
  ],
  practice: `
    <p>Take <code>lab19/src/App.jsx</code> and add a <em>Pause/Resume</em> button: keep
    <code>paused</code> as state, and inside the effect clear the interval when paused
    (store a second ref if you need it). Then rename <code>setTimeout_useRef.js</code> to
    <code>setInterval_useRef.js</code> in your own copy — the journal's name is simply wrong.</p>
  `,
  quiz: [
    {
      q: "What happens when you assign ref.current = 5 inside an event handler?",
      options: [
        "React re-renders the component with the new value",
        "React throws — refs are read-only",
        "Nothing is re-rendered; the value is simply stored for later reads",
        "React replaces the component's state with 5"
      ],
      answer: 2,
      why: "Refs are the 'no re-render' tool: .current is a plain property on a stable object. That silence is the entire point — and exactly why you cannot use a ref for data the screen should show."
    },
    {
      q: "Why does lab19's Timer store the setInterval id in timerRef instead of a plain let variable?",
      options: [
        "Because setInterval only accepts refs as arguments",
        "The interval is started and cleared in different render closures — the ref is the one box both can see, so cleanup can clear the right timer",
        "Because state would reset every second",
        "To avoid installing clearInterval"
      ],
      answer: 1,
      why: "The effect body and its cleanup belong to different executions of the component; a let variable would not be shared between them. The ref object is identical across renders, so the cleanup reads the id the setup wrote."
    }
  ],
  sources: [
    "https://react.dev/reference/react/useRef",
    "https://react.dev/learn/referencing-values-with-refs",
    "https://medium.com/zestgeek/understanding-the-useref-hook-in-react-real-life-examples-98339ab7f768"
  ]
});
