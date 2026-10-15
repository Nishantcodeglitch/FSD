window.COURSE_LESSONS.push({
  id: "w14-redux-capstone",
  file: "078",
  unit: 3,
  week: 14,
  title: "A complete Redux app (counter + todo)",
  kicker: "Unit III · Week 14 · Lesson 4 of 4",
  minutes: 20,
  objectives: [
    "Build a todos slice with add, toggle and remove reducers driven by payloads",
    "Mount two slices in one store while keeping the classmate's counter slice working unchanged",
    "Connect a small UI of components to the store with useSelector and useDispatch",
    "Run the finished app and verify each behaviour against an expected screen, then recap Unit III as one arc"
  ],
  intro: `
    <p>Lessons 75 to 77 gave you the vocabulary — store, slice, action, dispatch, selector —
    so this lesson spends them on one small but complete application: a counter <em>and</em> a
    todo list living in a single store that survives the route swaps of the Week 13 multi-page
    app, drawn by connected components. As throughout Week 14, the base app is the classmate's
    backup (roll <strong>2408030</strong>, used with attribution — this journal has no Redux lab
    of its own); the new todos slice, the wiring and the run notes are written for this book
    from the official Redux Toolkit docs. Finish this chapter and Unit III is complete: Week 15
    then puts a Node + MySQL back end behind the React front end you have been building since
    Week 11.</p>
  `,
  theory: [
    `
      <h3>The plan: two new files, three small changes</h3>
      <p>A Redux capstone should feel boring — that is the point of the architecture. The
      counter from the classmate's project stays exactly as it is; we add one slice for todos,
      one line in the store's reducer map, and two connected components plus the existing
      counter panel:</p>
      <pre class="diagram">src/
├── main.jsx          unchanged      Provider already wraps the app
├── store.js          +1 line        reducer: { counter, todos }
├── counterSlice.js   unchanged      the slice you keep
├── todosSlice.js     NEW            add / toggle / remove
├── AddTodo.jsx       NEW            connected, write-only (dispatch)
├── TodoList.jsx      NEW            connected, read + write
└── App.jsx           +2 imports     counter panel + &lt;AddTodo/&gt; + &lt;TodoList/&gt;</pre>
      <p>Note what does <em>not</em> appear: no prop drilling of todos, no callback prop to
      synchronise two components, no duplicated list in two places. The form and the list both
      talk to the store; neither knows the other exists.</p>
    `,
    `
      <h3>Designing the todos slice</h3>
      <p>The slice owns an array of todo objects
      <code>{ id, text, done }</code>, mounted under the key <code>todos</code>, so components
      read <code>state.todos</code>. Three case reducers cover the feature:</p>
      <ul>
        <li><code>addTodo(text)</code> — the payload is just the string; the reducer mints the
        unique id with <code>nanoid()</code> (shipped inside RTK) and pushes
        <code>{ id, text, done: false }</code> onto the draft array.</li>
        <li><code>toggleTodo(id)</code> — the payload is an id; find that todo on the draft and
        flip <code>done</code>. Never trust a checkbox's idea of which item it belongs to —
        send the id.</li>
        <li><code>removeTodo(id)</code> — the payload is an id; here the reducer
        <em>returns</em> a brand-new array from <code>filter()</code> instead of mutating the
        draft. Both styles are legal: mutate the draft, or return a new value — RTK's Immer
        accepts either inside a reducer.</li>
      </ul>
      <p>Ids instead of array indexes are what keep toggle/remove correct after deletions, and
      plain string ids keep the state serializable (DevTools can replay the whole session).</p>
    `,
    `
      <h3>One store, connected components</h3>
      <p>The store now reads <code>configureStore({ reducer: { counter, todos } })</code> —
      two branches, one object. Each component subscribes to the branch it draws:</p>
      <table>
        <thead><tr><th>Component</th><th>Reads (useSelector)</th><th>Writes (useDispatch)</th></tr></thead>
        <tbody>
          <tr><td>counter panel</td><td><code>state.counter.value</code></td><td><code>increment</code>, <code>decrement</code></td></tr>
          <tr><td>AddTodo</td><td>nothing (local <code>useState</code> for the input)</td><td><code>addTodo(text)</code></td></tr>
          <tr><td>TodoList</td><td><code>state.todos</code></td><td><code>toggleTodo(id)</code>, <code>removeTodo(id)</code></td></tr>
        </tbody>
      </table>
      <p>The input's text stays in <code>useState</code> on purpose — Lesson 75's honesty rule:
      a value only this component reads does not belong in the store. Redux holds what several
      parts share; hooks hold what one part owns.</p>
    `,
    `
      <h3>Run sequence and what you should see</h3>
      <p>Run everything inside the classmate's project folder (its
      <code>package.json</code> already pins <code>@reduxjs/toolkit</code> and
      <code>react-redux</code>): <code>npm i</code>, then <code>npm run dev</code>, then open
      the local URL Vite prints. Example 7 walks the whole session click by click with the
      expected screen at every step — use it as your acceptance checklist, including the
      Redux DevTools action log and the honest final observation: reload the page and the
      todos vanish, because this store lives in memory only. Keeping state across reloads
      (localStorage, or fetching it from the server) is Week 15's problem.</p>
    `,
    `
      <h3>Unit III recap: React - hooks - routing - Redux</h3>
      <p>Fourteen weeks in, the arc reads like one sentence. <strong>Weeks 11–12:</strong>
      React gives you <em>render = f(state)</em> with components and props; hooks add the
      missing verbs — <code>useState</code>/<code>useReducer</code> for local state,
      <code>useContext</code> for sharing nearby, <code>useEffect</code> for side effects,
      <code>useRef</code>/<code>useMemo</code>/<code>useCallback</code> for the sharp edges.
      <strong>Week 13:</strong> once the app has several pages, React Router mounts different
      components at <code>/</code>, <code>/about</code> and so on — and the state problem gets
      harder, because page state dies on navigation (that material was missing from this
      journal and taught from react.dev). <strong>Week 14:</strong> Redux answers the
      cross-cutting half of that problem with one store, actions and pure reducers, packaged
      by Redux Toolkit. <strong>Next, Week 15:</strong> the same front end talks to your Node +
      MySQL API over HTTP — the store then holds server data, the back end becomes the single
      source of truth for anything persistent, and you will see again that hooks and Redux are
      partners, not rivals.</p>
    `
  ],
  examples: [
    {
      title: "todosSlice.js: add, toggle and remove — the new slice",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
import { createSlice, nanoid } from "@reduxjs/toolkit";

const todosSlice = createSlice({
  name: "todos",
  initialState: [],
  reducers: {
    addTodo: (state, action) => {
      state.push({ id: nanoid(6), text: action.payload, done: false });
    },
    toggleTodo: (state, action) => {
      const todo = state.find((t) => t.id === action.payload);
      if (todo) {
        todo.done = !todo.done;
      }
    },
    removeTodo: (state, action) => {
      return state.filter((t) => t.id !== action.payload);
    }
  }
});

export const { addTodo, toggleTodo, removeTodo } = todosSlice.actions;
export default todosSlice.reducer;
`,
      explain: [
        "<code>initialState: []</code> is an array; mounted under the key <code>todos</code> it becomes <code>state.todos</code> — an empty list at boot.",
        "<code>addTodo</code>'s payload is a plain string, and the slice itself mints the id with RTK's <code>nanoid()</code>: components never fabricate identity.",
        "<code>toggleTodo</code> finds by id and mutates the draft (Immer), <code>removeTodo</code> returns a fresh filtered array — reducers may do either, but the store always receives a new state object.",
        "Exports follow the RTK pattern from Lesson 76: named action creators, default-exported reducer — drop-in ready for configureStore."
      ],
      run: "npm run dev  (this module is imported by src/store.js)"
    },
    {
      title: "store.js rebuilt: both slices in one store, plus a scripted walkthrough",
      from: "new",
      file: "",
      lang: "javascript",
      code: `
import { configureStore } from "@reduxjs/toolkit";
import counterReducer, { increment, incrementByAmount } from "./counterSlice.js";
import todosReducer, { addTodo, toggleTodo, removeTodo } from "./todosSlice.js";

const store = configureStore({
  reducer: {
    counter: counterReducer,
    todos: todosReducer
  }
});

const show = (label) => {
  const s = store.getState();
  const open = s.todos.filter((t) => !t.done).map((t) => t.text);
  const done = s.todos.filter((t) => t.done).map((t) => t.text);
  console.log(label, "| counter:", s.counter.value, "| open:", open.join(" + ") || "-", "| done:", done.join(" + ") || "-");
};

show("boot    ");
store.dispatch(addTodo("Write the capstone"));
store.dispatch(addTodo("Try Redux DevTools"));
show("after +2");
store.dispatch(toggleTodo(store.getState().todos[0].id));
store.dispatch(removeTodo(store.getState().todos[1].id));
store.dispatch(incrementByAmount(5));
show("final   ");
`,
      explain: [
        "The whole capstone store is one object literal with two keys: the counter slice from the classmate's project is imported unchanged, the todos slice is new.",
        "Because <code>nanoid</code> makes ids unpredictable, the script reads them back with <code>store.getState().todos[0].id</code> before dispatching — exactly what components do with the ids in their props.",
        "Each <code>show()</code> is a selector in miniature: derive only the view you want to print instead of dumping the raw tree.",
        "Run this <em>before</em> touching the UI: if the state machine behaves here, any later problem is in rendering, not in Redux."
      ],
      run: "node capstone-store.js  (inside the project folder, with counterSlice.js and todosSlice.js beside it)",
      output: `boot     | counter: 0 | open: - | done: -
after +2 | counter: 0 | open: Write the capstone + Try Redux DevTools | done: -
final    | counter: 5 | open: - | done: Write the capstone`
    },
    {
      title: "AddTodo.jsx: a connected component that only writes",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addTodo } from "./todosSlice";

function AddTodo() {
  const [text, setText] = useState("");
  const dispatch = useDispatch();

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    dispatch(addTodo(trimmed));
    setText("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="New todo"
      />
      <button type="submit">Add</button>
    </form>
  );
}

export default AddTodo;
`,
      explain: [
        "Half-connected by design: the draft text lives in <code>useState</code> (local, one consumer) while the committed todo goes to the store — Lesson 75's rule applied literally.",
        "<code>dispatch(addTodo(trimmed))</code> sends the whole todo as an action: <code>{ type: \"todos/addTodo\", payload: \"Buy milk\" }</code>; the slice adds the id and <code>done: false</code>.",
        "Clearing the input with <code>setText(\"\")</code> after dispatch is UI polish that needs no store — another job for local state.",
        "No props and no callbacks are shared with TodoList: the form writes to Redux, the list reads from Redux, and the two never import each other."
      ],
      run: "npm run dev",
      output: "Typing text and pressing Add dispatches todos/addTodo; the new row appears in TodoList"
    },
    {
      title: "TodoList.jsx: a connected component that reads and writes",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
import { useDispatch, useSelector } from "react-redux";
import { toggleTodo, removeTodo } from "./todosSlice";

function TodoList() {
  const todos = useSelector((state) => state.todos);
  const dispatch = useDispatch();

  if (todos.length === 0) {
    return <p>No todos yet - add one above.</p>;
  }

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <label>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => dispatch(toggleTodo(todo.id))}
            />
            <span>{todo.text}</span>
          </label>
          <button onClick={() => dispatch(removeTodo(todo.id))}>x</button>
        </li>
      ))}
    </ul>
  );
}

export default TodoList;
`,
      explain: [
        "<code>key={todo.id}</code> — stable ids (not array indexes) keep React's list reconciliation correct after removals; this is why the slice mints ids itself.",
        "Both handlers dispatch the id as the payload, so reordering or deleting rows can never target the wrong todo.",
        "Selecting <code>state.todos</code> re-renders this component whenever a todo changes — correct, because it draws the whole list — and stays silent for counter actions, because those leave the array's reference untouched.",
        "The empty-state branch returns early: selectors run before your early return, so the subscription is still active and the message disappears the moment a todo is added."
      ],
      run: "npm run dev",
      output: "Empty store shows 'No todos yet - add one above.'; adding/ticking/removing rows updates the list instantly"
    },
    {
      title: "App.jsx: the counter panel plus the two connected components",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
import { useDispatch, useSelector } from "react-redux";
import { increment, decrement } from "./counterSlice";
import AddTodo from "./AddTodo";
import TodoList from "./TodoList";

function App() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <h1>Week 14 capstone: counter + todos, one store</h1>

      <section>
        <h2>Counter (the classmate's slice, kept)</h2>
        <p>{count}</p>
        <button onClick={() => dispatch(increment())}>Increment</button>
        <button onClick={() => dispatch(decrement())}>Decrement</button>
      </section>

      <section>
        <h2>Todos (new slice)</h2>
        <AddTodo />
        <TodoList />
      </section>
    </div>
  );
}

export default App;
`,
      explain: [
        "The counter half is the classmate's App.jsx, unchanged in behaviour — the capstone <em>extends</em> Week 14's project instead of replacing it.",
        "The selector is inlined (<code>state.counter.value</code>) so this file works with the original untouched counterSlice; once Lesson 77's <code>selectCount</code> exists, import it instead.",
        "Three sections of the tree now depend on the store, each selecting only its own branch: counter value here, todos in TodoList, nothing in AddTodo.",
        "Parent-child props still flow as usual — Redux replaces only the <em>shared</em> data plumbing, not React's own model."
      ],
      run: "npm run dev",
      output: "Browser shows one page with the counter panel on top and the todo form + list below"
    },
    {
      title: "index.html: the boot chain your capstone hangs from",
      from: "journal",
      file: "sorted_files/14_Week-14_Redux/week_14-by-2408030/index.html",
      lang: "html",
      code: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>week_14</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
      explain: [
        "The whole chain starts here: Vite serves this file, the module script loads <code>src/main.jsx</code>, which renders <code>&lt;Provider store={store}&gt;&lt;App/&gt;</code> into <code>#root</code>.",
        "<code>type=\"module\"</code> is what allows the <code>import</code>/<code>export</code> syntax used by store.js, the slices and every component (<code>\"type\": \"module\"</code> in package.json does the same for Node).",
        "This is the stock Vite template from Week 11 — Redux changed none of it, which is the whole idea: state management is a library concern, not a build-tool concern.",
        "When the capstone screen looks wrong, walk this chain backwards: blank page -> main.jsx -> Provider -> store.js -> slices."
      ],
      run: "npm run dev",
      output: "Vite serves index.html at the Local URL; the React tree mounts inside <div id='root'>"
    },
    {
      title: "Run sequence and the expected screen, click by click",
      from: "new",
      file: "",
      lang: "text",
      code: `
RUN SEQUENCE
  1. cd sorted_files/14_Week-14_Redux/week_14-by-2408030
  2. npm i          (installs @reduxjs/toolkit + react-redux from package.json)
  3. npm run dev    (Vite prints the Local URL - open it)

EXPECTED SCREEN (top to bottom)
  Week 14 capstone: counter + todos, one store
  Counter (the classmate's slice, kept)
  0                          [Increment] [Decrement]
  Todos (new slice)
  [New todo____________]    [Add]
  No todos yet - add one above.

ACCEPTANCE CHECKLIST (behaviour to verify, in order)
  a. Type "Buy milk", press Add
       -> row appears: "( ) Buy milk  [x]"  | counter still 0
  b. Add "Walk the dog"
       -> two unchecked rows
  c. Tick "Buy milk"
       -> checkbox fills in (todos/toggleTodo with that row's id)
  d. Press [x] on "Walk the dog"
       -> row disappears (todos/removeTodo with its id)
  e. Press Increment 5 times
       -> counter shows 5; the todo rows do not flicker or re-render
  f. Open the Redux DevTools tab
       -> log reads: todos/addTodo, todos/addTodo, todos/toggleTodo,
          todos/removeTodo, counter/increment x5 - each with its state diff
  g. Reload the page
       -> counter back to 0, list empty: state is in memory only.
          Persisting it (localStorage / your API) is Week 15's job.
`,
      explain: [
        "Steps 1-3 are the repo's own run line from sorted_files/14_Week-14_Redux/README.txt — the classmate's project was verified to build with <code>vite build</code> as well.",
        "Checklist a-d exercise each of the three todos reducers; e exercises a second slice; together they cover the whole capstone.",
        "Step e is the performance claim from Lesson 77 in a live test: the counter selector changes, the todos selector's result keeps its reference, so only the counter panel re-renders.",
        "Step g is the honest limit of a plain Redux store: no persistence and no network yet — exactly where Unit IV picks the story up."
      ],
      run: "npm run dev",
      output: "The screen above, plus one Redux DevTools entry per click: todos/addTodo, todos/toggleTodo, todos/removeTodo, counter/increment"
    }
  ],
  keyPoints: [
    "A second feature is one slice plus one line in configureStore's reducer map — the counter code stays untouched",
    "Todos are addressed by nanoid ids carried in every payload: addTodo(text), toggleTodo(id), removeTodo(id)",
    "Reducers may mutate the Immer draft (push, flip a flag) or return a new value (filter) — both produce a fresh state object",
    "Connected components subscribe to their own branch: AddTodo writes only, TodoList reads state.todos and writes by id, the panel reads state.counter.value",
    "Local input text stays in useState; only shared data goes to the store — hooks and Redux are partners",
    "Reload loses everything: this store is in-memory. Persistence and server data belong to Week 15"
  ],
  practice: `
    <p>Finish the capstone yourself: copy the classmate's folder, create
    <code>src/todosSlice.js</code> and <code>src/AddTodo.jsx</code> from examples 1 and 3,
    write <code>TodoList.jsx</code> from example 4, then edit <code>store.js</code> (add the
    <code>todos</code> key) and <code>App.jsx</code> (render the two components) as in example
    5. Run <code>npm run dev</code> and walk the acceptance checklist in example 7, watching
    each click appear in the Redux DevTools log. Bonus: add a <code>clearDone</code> reducer
    and a button for it — slice, export, dispatch, done, in four places.</p>
  `,
  quiz: [
    {
      q: "In the todos slice, where does a new todo's id come from?",
      options: [
        "nanoid() called inside the addTodo reducer, so the component only dispatches the text",
        "The React key prop, which assigns ids to list items",
        "The array index of the todo in state.todos",
        "The back end, which returns an id when the todo is saved"
      ],
      answer: 0,
      why: "The slice mints the id with RTK's nanoid() when it pushes the todo — identity belongs with the state owner. Indexes break after deletions; keys are React's rendering concern, not data; a server id only exists in Week 15, after saving."
    },
    {
      q: "The counter panel shows 5 after you click Increment; TodoList has three todos. Which statement is correct?",
      options: [
        "TodoList does not re-render, because the counter action leaves state.todos with the same reference and its selector result is unchanged",
        "TodoList re-renders, because every dispatch re-renders the whole tree via Provider",
        "Nothing re-renders, because Redux bypasses React's rendering",
        "TodoList re-renders only if its props change"
      ],
      answer: 0,
      why: "Dispatch notifies subscribers, but react-redux re-renders a component only when its own selector's result fails the === check. Counter actions don't touch the todos branch, so state.todos is the same array as before — TodoList stays put while the counter panel updates."
    }
  ],
  sources: [
    "https://redux.js.org/",
    "https://redux-toolkit.js.org/",
    "https://react.dev/reference/react-redux",
    "https://redux-toolkit.js.org/api/createSlice",
    "https://redux-toolkit.js.org/usage/adding-data",
    "https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow"
  ]
});
