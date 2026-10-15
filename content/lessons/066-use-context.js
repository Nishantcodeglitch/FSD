window.COURSE_LESSONS.push({
  id: "w12-use-context",
  file: "066",
  unit: 3,
  week: 12,
  title: "useContext",
  kicker: "Unit III · Week 12 · Lesson 3 of 7",
  minutes: 17,
  objectives: [
    "Explain prop drilling and why passing data through many layers fails at scale",
    "Wire createContext, a Provider and useContext to share one value across the tree",
    "Share multiple values at once by putting an object in the Provider's value prop",
    "Name the common context mistakes: missing Provider, wrong context, over-wide scope"
  ],
  intro: `
    <p>Lesson 065 kept state managed, but there is a different problem waiting: if a value lives in
    <code>App</code> and the component that needs it is four levels down, props force you to thread that
    value through every layer in between. The journal's own context files contain exactly this chain —
    <code>App → Home → Profile → Student</code> — where only the last link wants the data. That
    chore is called <strong>prop drilling</strong>, and <code>useContext</code> is its cure: one
    Provider at the top, one <code>useContext</code> call at the bottom, nothing in between.</p>
    <p>All three journal examples for this lesson live in
    <code>lab19/src</code>: a plain string ("Rohit"), an object with three fields, and an animal record.</p>
  `,
  theory: [
    `
      <h3>The prop drilling problem</h3>
      <p><strong>Props are one-way: parent → child.</strong> That is a feature (Lesson 063) until a
      <em>grandchild</em> needs something only the <em>grandparent</em> has. Then every middle component
      must accept a prop it never uses and pass it down again:</p>
      <pre class="diagram">   App (has username)
     └─▶ Home (doesn't care, must still take + forward username)
           └─▶ Profile (doesn't care, must still take + forward username)
                 └─▶ Student (the only one that actually renders it)</pre>
      <p>It gets worse: a shared value like the logged-in user, the colour theme or the current locale
      is needed in <em>many</em> scattered leaves, so every branch needs the prop drilled through it.
      Rename the prop and you edit fifteen files. Context removes the middle links entirely.</p>
    `,
    `
      <h3>The three pieces: createContext, Provider, useContext</h3>
      <p>Context is a "radio channel" your components can tune into instead of being handed a
      microphone:</p>
      <ol>
        <li><strong><code>createContext()</code></strong> — creates the channel and returns a context
        object. Do this <em>once</em>, at module top level, and give it a capitalised name
        (<code>userContext</code> in the journal, conventionally <code>UserContext</code>):
        <code>const userContext = createContext();</code></li>
        <li><strong><code>&lt;userContext.Provider value={...}&gt;</code></strong> — the Provider
        component decides <em>which value</em> is currently broadcasting, and it wraps a whole
        subtree. Everything rendered inside it — at any depth — can hear that value.</li>
        <li><strong><code>useContext(userContext)</code></strong> — any component inside the Provider
        calls this at its top level (rule 1 from the Lesson 064 callout still applies) and gets the
        current value directly. No prop, no middlemen.</li>
      </ol>
      <pre class="diagram">  const userContext = createContext();        // 1. create the channel

  function App() {                            // 2. broadcast at the top
    return &lt;userContext.Provider value="Rohit"&gt;
             &lt;Home /&gt;
           &lt;/userContext.Provider&gt;;
  }

  function Student() {                        // 3. tune in at the bottom
    const username = useContext(userContext);  // "Rohit" — Home and Profile untouched
    return &lt;h1&gt; Hello {username} &lt;/h1&gt;;
  }</pre>
      <p>One honest detail from the journal: <code>createContext()</code> is called with
      <strong>no default value</strong> in all three lab19 files, so if a component ever calls
      <code>useContext</code> <em>outside</em> its Provider, it receives <code>undefined</code>
      instead of crashing. You can pass a sensible default — <code>createContext("guest")</code> — or
      deliberately throw to catch the mistake early.</p>
    `,
    `
      <h3>Sharing multiple values: put an object in value</h3>
      <p>The <code>value</code> prop accepts anything a JavaScript variable can hold. The journal
      escalates through the natural progression in its three files:</p>
      <table>
        <thead>
          <tr><th>Journal file</th><th>value</th><th>useContext returns</th></tr>
        </thead>
        <tbody>
          <tr><td><code>useContext.js</code></td><td><code>"Rohit"</code> (string)</td><td>a string</td></tr>
          <tr><td><code>useContext-multValue.js</code></td><td><code>{username, age, class}</code></td><td>an object — read with <code>userData.username</code></td></tr>
          <tr><td><code>usecontext-multAnimal.js</code></td><td><code>{name, age, type: "Lion"}</code></td><td>an object — read with <code>animal.name</code></td></tr>
        </tbody>
      </table>
      <p>The idiomatic object version bundles the value <em>and</em> its setters
      (<code>value={{ user, login, logout }}</code>), so any leaf can both read and change the shared
      state — which is how a "context + useReducer" store works, a preview of Redux in Week 14.</p>
    `,
    `
      <h3>When to use context — and the common mistakes</h3>
      <ul>
        <li><strong>Use it for genuinely global data</strong>: the current user, theme, language, the
        active route. Not for every prop — drilling a prop two levels is perfectly fine and clearer
        than a context. Context is for values <em>many</em> distant components need.</li>
        <li><strong>Common mistake — the Provider is missing or too low.</strong> If
        <code>useContext</code> returns <code>undefined</code>, the component is rendering outside the
        Provider's subtree, or the Provider is nested below it. Draw the tree and find where the
        Provider wraps.</li>
        <li><strong>Common mistake — the wrong context object.</strong> You can only
        <code>useContext</code> a context you have <em>created</em> (or imported). Reading the context
        object itself (<code>userContext</code>) gives you the object; only
        <code>useContext(userContext)</code> gives you the <em>value</em>.</li>
        <li><strong>Context is not a performance shield.</strong> A new <code>value</code> object is
        created on every render of the Provider, which re-renders every consumer — see example 6 for
        the fix (memoise the value with <code>useMemo</code>, Lesson 069) and remember the rules of
        hooks callout from Lesson 064 when you do.</li>
        <li><strong>Context does not replace state.</strong> Keep state where it is used; share it
        upwards only when siblings or distant branches truly need it.</li>
      </ul>
    `
  ],
  examples: [
    {
      title: "The chain that needed drilling: App → Home → Profile → Student",
      from: "new",
      lang: "jsx",
      code: `
// The prop-drilling version of journal file lab19/src/useContext.js
function App(){
  return <Home username="Rohit" />;
}
function Home({ username }){          // doesn't use it, must forward it anyway
  return <Profile username={username} />;
}
function Profile({ username }){       // still doesn't use it
  return <Student username={username} />;
}
function Student({ username }){       // the only component that renders it
  return <h1> Hello {username} </h1>;
}

export default App;`,
      explain: [
        "Same four components as the journal file — written with plain props instead of context.",
        "<code>Home</code> and <code>Profile</code> accept <code>username</code> purely as couriers: they never display it. That is <strong>prop drilling</strong>.",
        "Add a second leaf that needs the user (a NavBar, a Footer) and every path to it needs the same courier code — rename the prop and you edit all four files.",
        "Example 2 is this exact file rewritten with <code>createContext</code> + <code>useContext</code>: the two couriers disappear entirely."
      ],
      run: "drop into any Vite app and npm run dev",
      output: "Hello Rohit"
    },
    {
      title: "The journal's fix: one string, three middlemen gone",
      from: "journal",
      file: "sorted_files/12_Week-12_Hooks/lab19/src/useContext.js",
      lang: "jsx",
      code: `
import { useContext, createContext } from "react";
//provider is use to share the data
const userContext = createContext();

function App() {
    return (
        <userContext.Provider value="Rohit">
            <Home />
        </userContext.Provider>
    );
}

function Home() {
    return <Profile />
}
function Profile() {
    return <Student />
}
function Student() {
    const username = useContext(userContext);
    return <h1> Hello {username} </h1>;
}

export default App;`,
      explain: [
        "<code>createContext()</code> runs once at module level and returns the channel object <code>userContext</code>.",
        "The Provider wraps the whole subtree with <code>value=\"Rohit\"</code> — that string is the only place the data is written.",
        "<code>Home</code> and <code>Profile</code> now take <strong>no props at all</strong> — the drilling from example 1 is gone.",
        "<code>useContext(userContext)</code> inside <code>Student</code> returns \"Rohit\" directly; the hook call sits at the top level of the component, obeying rule 1 from Lesson 064.",
        "Nothing between the Provider and <code>Student</code> knows or cares that the value exists — add ten more levels and the code stays the same."
      ],
      run: "cd sorted_files/12_Week-12_Hooks/lab19 && npm i && npm run dev",
      output: "Hello Rohit"
    },
    {
      title: "Multiple values: an object in the Provider",
      from: "journal",
      file: "sorted_files/12_Week-12_Hooks/lab19/src/useContext-multValue.js",
      lang: "jsx",
      code: `
import { useContext , createContext } from "react";
//provider is use to share the data
const userContext = createContext();
function App(){
  const userData = {
    username : "Nishant",
    age : 21,
    class : "tybca",
  };
    return(
    <userContext.Provider value = {userData}>
        <Home/>
    </userContext.Provider>
    );
}
function Home(){
    return <Profile/>
}
function Profile(){
    return <Student/>
}
function Student() {
  const userData = useContext(userContext);

  return (
    <>
      <h1> Hello {userData.username} </h1>
      <p>Your age is {userData.age}</p>
      <p>Class is {userData.class}</p>
    </>
  );
}
export default App;`,
      explain: [
        "Instead of a bare string, the <code>value</code> is an object literal — a context can broadcast any JavaScript value.",
        "The consumer receives the whole object: <code>userData.username</code>, <code>userData.age</code>, <code>userData.class</code>.",
        "Compare with example 2: adding fields to <code>userData</code> requires no changes to the courier components (there are none) — only the Producer and the Consumer touch the shape.",
        "Watch the perf note: this object is re-created on every render of <code>App</code>, so every context consumer re-renders too — harmless here, noticeable in big apps (example 6)."
      ],
      run: "cd sorted_files/12_Week-12_Hooks/lab19 && npm i && npm run dev",
      output: "Hello Nishant / Your age is 21 / Class is tybca"
    },
    {
      title: "The same pattern with a different domain: the animal record",
      from: "journal",
      file: "sorted_files/12_Week-12_Hooks/lab19/src/usecontext-multAnimal.js",
      lang: "jsx",
      code: `
import { useContext, createContext } from "react";


const AnimalContext = createContext();

function App() {
  return (

    <AnimalContext.Provider
      value={{
        name: "Leo",
        age: 5,
        type: "Lion"
      }}
    >
      <Zoo />
    </AnimalContext.Provider>
  );
}

function Zoo() {
  return <Animal />;
}

function Animal() {
  const animal = useContext(AnimalContext);

  return (
    <>
      <h1>Name: {animal.name}</h1>
      <h2>Age: {animal.age}</h2>
      <h3>Type: {animal.type}</h3>
    </>
  );
}

export default App;`,
      explain: [
        "Identical machinery to example 3, different domain — the context is named <code>AnimalContext</code> and the object is written inline in the JSX.",
        "Inline <code>value={{...}}</code> creates a fresh object every render; that is fine for a demo, a hazard for hot paths (fixed in example 6).",
        "<code>type: \"Lion\"</code> shows a field whose <em>name</em> collides with action types from Lesson 065 — here it is just data, no dispatch involved.",
        "Three journal files, one idea: pick the context, wrap with a Provider, read with <code>useContext</code>. Everything else is naming."
      ],
      run: "cd sorted_files/12_Week-12_Hooks/lab19 && npm i && npm run dev",
      output: "Name: Leo / Age: 5 / Type: Lion"
    },
    {
      title: "A global toggle: context carrying state AND its setter",
      from: "new",
      lang: "jsx",
      code: `
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext("light");   // default if no Provider wraps you

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function Toolbar() {                 // no props — just a pass-through layer
  return <Toggle />;                 // (the drilling we are avoiding)
}

function Toggle() {
  const { theme, setTheme } = useContext(ThemeContext);   // read AND write
  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Current theme: {theme}
    </button>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Toolbar />
    </ThemeProvider>
  );
}`,
      explain: [
        "The idiomatic object value: <code>{{ theme, setTheme }}</code> — any consumer can both read the shared state and change it.",
        "<code>ThemeProvider</code> is a component you write yourself (capitalised, as React requires) that owns the state and broadcasts it; it returns <code>{children}</code> so it can wrap anything.",
        "<code>createContext(\"light\")</code> passes a default: components rendered outside the Provider see \"light\" instead of <code>undefined</code>.",
        "This is the shape of every state library you meet next: Week 14's Redux <code>Provider</code> + <code>useSelector</code>/<code>useDispatch</code> is the same idea with more machinery."
      ],
      run: "drop into any Vite app and npm run dev",
      output: "Button: Current theme: light  →  click  →  Current theme: dark"
    },
    {
      title: "Avoiding the re-render trap: memoise the context value",
      from: "new",
      lang: "jsx",
      code: `
import { createContext, useContext, useState, useMemo } from "react";

const SessionContext = createContext(null);

function SessionProvider({ children }) {
  const [user, setUser] = useState({ name: "Nishant", roll: 2408023 });

  // Without useMemo, value={ {user, setUser} } would be a brand-new object
  // on every render → every consumer re-renders, memo() children never skip.
  const value = useMemo(() => ({ user, setUser }), [user]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

function Badge() {
  const { user } = useContext(SessionContext);
  return <span>{user.name} ({user.roll})</span>;
}

export default function App() {
  return (
    <SessionProvider>
      <Badge />
    </SessionProvider>
  );
}`,
      explain: [
        "Save as <code>SessionProvider.jsx</code>. The value object is now <strong>the same reference</strong> until <code>user</code> actually changes — <code>useMemo</code> is Lesson 069's hook, used here as a context best practice.",
        "Why it matters: React re-renders every component that calls <code>useContext(SessionContext)</code> whenever the Provider's value reference changes — an inline object changes every render.",
        "Note where <code>useMemo</code> sits: top level of <code>SessionProvider</code>, obeying the rules of hooks from Lesson 064.",
        "Do not reach for this by reflex — for the journal's small demos the inline object is perfectly fine. Memoise when you have measured a re-render problem."
      ],
      run: "drop into any Vite app and npm run dev",
      output: "Nishant (2408023)"
    }
  ],
  keyPoints: [
    "Prop drilling is passing a prop through components that don't use it just to reach a distant descendant — context skips the middlemen.",
    "createContext() once at module level; wrap the subtree in <code>&lt;Context.Provider value={...}&gt;</code>; read it anywhere inside with useContext(...).",
    "value can be a string, an object, or an object bundling state and setters so leaves can read and write shared data.",
    "useContext returns undefined if the component renders outside the Provider — the classic 'missing Provider' bug.",
    "Context re-renders all consumers when its value reference changes; memoise the value object with useMemo when that matters."
  ],
  practice: `
    <p>In <code>lab19</code>, create a new file <code>useContext-myvalue.js</code> modelled on
    <code>useContext.js</code>, but broadcast <code>{{ branch: "BCA", semester: 5 }}</code> from
    <code>App</code> and render both fields in <code>Student</code>. Then break it on purpose: delete
    the Provider and see <code>useContext</code> return your default/undefined — read the error, then
    restore it.</p>
  `,
  quiz: [
    {
      q: "What problem does useContext solve?",
      options: [
        "It makes components render faster by default",
        "Prop drilling — passing data through components that don't need it to reach a distant descendant",
        "It replaces useState for all local state",
        "It lets you call hooks inside loops"
      ],
      answer: 1,
      why: "One Provider high in the tree plus one useContext call deep in the tree removes the courier props entirely (example 1 vs example 2). It neither replaces local state nor changes the rules of hooks."
    },
    {
      q: "A component calls useContext(userContext) and gets undefined. What is the most likely cause?",
      options: [
        "createContext was called with no arguments",
        "The component is rendering outside the <code>&lt;userContext.Provider&gt;</code> subtree, or the Provider is nested below it",
        "useContext must be called inside an event handler",
        "The value prop can only hold strings"
      ],
      answer: 1,
      why: "The Provider defines what the consumers see — outside it you get the createContext default (undefined here). String values are fine; the journal's first file uses exactly one."
    }
  ],
  sources: [
    "https://react.dev/reference/react/useContext",
    "https://react.dev/learn/passing-data-deeply-with-context",
    "https://react.dev/reference/react/createContext"
  ]
});
