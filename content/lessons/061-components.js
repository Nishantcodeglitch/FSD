window.COURSE_LESSONS.push({
  id: "w11-components",
  file: "061",
  unit: 3,
  week: 11,
  title: "Components: built-in and custom",
  kicker: "Unit III · Week 11 · Lesson 4 of 6",
  minutes: 16,
  objectives: [
    "Tell React's built-in elements (div, button, input...) apart from custom components",
    "Write a custom component as a function that returns markup and export it from its own .jsx file",
    "Compose a page from several components and mount them with createRoot in main.jsx",
    "Explain what StrictMode does and why one component belongs per file"
  ],
  intro: `
    <p>JSX taught you the syntax; this lesson teaches the unit of organisation. React apps are
    not written as one giant return statement — they are trees of small functions, each drawing
    one piece of the screen. The journal's Week 11 project does exactly this:
    <code>Header</code>, <code>Navbar</code>, <code>Content</code> and <code>Footer</code> are four
    separate files, composed together in <code>main.jsx</code>. You will read all five files in
    this lesson, plus the journal's honest share of beginner bugs — including a copy of
    <code>main.jsx</code> where every import was pasted under the same name, which cannot possibly
    run.</p>
  `,
  theory: [
    `
      <h3>Two kinds of tag</h3>
      <p>When React parses JSX it looks at each tag name. A name starting with a
      <strong>lowercase</strong> letter is a <strong>built-in element</strong> —
      <code>div</code>, <code>span</code>, <code>button</code>, <code>h1</code>, <code>p</code>,
      <code>ul</code>/<code>li</code>, <code>input</code>, <code>form</code>,
      <code>label</code>, <code>table</code> and friends. React knows these directly; they become
      plain DOM nodes. A name starting with an <strong>uppercase</strong> letter is a
      <strong>custom component</strong> — a JavaScript function <em>you</em> wrote (or imported).
      That capitalisation is not a style preference; it is how JSX decides between
      <code>"div"</code> the string and <code>Header</code> the function. Lowercase
      <code>&lt;header&gt;</code> is the HTML tag; uppercase <code>&lt;Header /&gt;</code> is your
      function called with whatever props you wrote on the tag.</p>
    `,
    `
      <h3>A component is a function that returns markup</h3>
      <p>The whole recipe for a custom component is: declare a function, return JSX, export it.
      The journal's <code>Header.jsx</code> is the minimal possible example — nine lines. Three
      conventions hold the ecosystem together, and the journal follows all three:</p>
      <ul>
        <li><strong>One component per file</strong>, and the file name matches the component:
        <code>Header.jsx</code> contains <code>function Header</code>. Beginners ask why not keep
        ten small components in one file — the answer is that components are imported by path,
        and a predictable file tree is what makes a large app navigable.</li>
        <li><strong>The <code>.jsx</code> extension</strong> tells Vite's tooling (and your
        editor) that this file contains JSX and should be transpiled with the React plugin. A
        <code>.js</code> file with JSX in it will fail to parse.</li>
        <li><strong><code>export default</code></strong> at the bottom publishes exactly one
        component per file, imported by name in the parent: <code>import Header from
        './components/Header.jsx'</code>. (When a file genuinely holds two components — the
        journal's <code>students.jsx</code> — you use <em>named</em> exports instead; Lesson 5
        shows that file.)</li>
      </ul>
    `,
    `
      <h3>Composing: the page is a tree of components</h3>
      <p><strong>Composition</strong> is building a UI by nesting components inside one another.
      In <code>my-react</code> the composition happens at the very top, in
      <code>main.jsx</code>:</p>
      <pre class="diagram"> index.html
    └── src/main.jsx           createRoot(...).render(...)
          └── &lt;StrictMode&gt;
                ├── &lt;Header /&gt;      (its own file, its own div)
                ├── &lt;Navbar /&gt;
                ├── &lt;Content /&gt;
                └── &lt;Footer /&gt;</pre>
      <p><code>createRoot(document.getElementById('root'))</code> finds the empty div from
      index.html and gives React ownership of it; <code>.render(...)</code> mounts the tree. Each
      component can then use other components inside its own markup — <code>Content</code> could
      render <code>&lt;CourseCard /&gt;</code> five times — which is how an app grows from four
      files to four hundred without any of them becoming huge.</p>
      <p><strong>StrictMode</strong> is the wrapper you see around the tree. It renders nothing
      itself; it is a development-only tool that deliberately double-invokes your components and
      flags illegal patterns (like mutating props, Lesson 5) so you find them while coding rather
      than in production. Deleting it makes demos look identical — keep it anyway.</p>
    `,
    `
      <h3>What the journal got wrong (honestly)</h3>
      <p>Two defects in the repo are worth learning from. The journal's own notes record that a
      duplicate scaffold in <code>react2_Lab10</code> shipped a <code>main.jsx</code> where all
      four component files were imported under the name <code>Header</code>, and an
      <code>App.jsx</code> that came out 0 bytes — the app could not build. Example 6 rebuilds
      that bug so you can recognise the error message. The checked-in <code>react3</code>
      project has the harmless half of the same story: its <code>src/App.jsx</code> is 0 bytes
      too, yet the app runs fine, because <code>main.jsx</code> — not <code>App.jsx</code> — is
      the entry point Vite follows from index.html. Nothing imports the empty file, so nothing
      breaks. Keep the lesson: the entry chain is index.html → main.jsx, and files off that
      chain are inert.</p>
    `
  ],
  examples: [
    {
      title: "src/components/Header.jsx (journal): the minimal component",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/my-react/src/components/Header.jsx",
      lang: "jsx",
      code: `
function Header(){
    return(
        <div>
            <header>
                <h1>My College</h1>
            </header>
        </div>
    )
}
export default Header;
`,
      explain: [
        "A function, a return of JSX, an export — that is the entire component recipe, nothing else required.",
        "Note both kinds of tag in one file: uppercase <code>&lt;Header&gt;</code> (the custom function, used from main.jsx) and lowercase <code>&lt;header&gt;</code> (the built-in HTML element it renders inside a div).",
        "The wrapping <code>&lt;div&gt;</code> is technically optional here (the <code>&lt;header&gt;</code> alone would do) — beginners wrap everything at first, and it never hurts.",
        "Because it is <code>export default</code>, the parent imports it by a chosen name: <code>import Header from './components/Header.jsx'</code>."
      ],
      run: "cd my-react && npm run dev",
      output: "Top of the page shows:\nMy College"
    },
    {
      title: "src/components/Navbar.jsx (journal): buttons as a component",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/my-react/src/components/Navbar.jsx",
      lang: "jsx",
      code: `
function Navbar(){
    return (
        <div>
            <button>Home</button>
            <button>Course</button>
            <button>Contect</button>
        </div>
    )
}

export default Navbar;
`,
      explain: [
        "<code>button</code> is lowercase — a built-in element, not a component. Three of them side by side inside one root div.",
        "The buttons do nothing yet: no <code>onClick</code>, no router (Week 13 adds real navigation). Static markup is a legitimate first version of a component.",
        "\"Contect\" is the journal's spelling of \"Contact\" — harmless in a demo, a reminder that component text is just strings you can (and should) proofread.",
        "Same file-name-matches-component rule: Navbar lives in <code>Navbar.jsx</code> and nowhere else."
      ],
      run: "cd my-react && npm run dev",
      output: "Below the header:\n[ Home ]  [ Course ]  [ Contect ]"
    },
    {
      title: "src/components/Footer.jsx (journal): another section, same pattern",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/my-react/src/components/Footer.jsx",
      lang: "jsx",
      code: `
function Footer(){
    return (
        <div>
            <footer>
                <h3>Learn React from the Basics</h3>
                <h3> My college</h3>

            </footer>
        </div>
    )
}

export default Footer;
`,
      explain: [
        "Identical structure to Header and Navbar — that repetition <em>is</em> the point: once you have written one component, you have written the pattern for all of them.",
        "<code>&lt;footer&gt;</code> is the semantic built-in element for a page footer; using the real HTML elements (header, nav, footer, main) costs nothing and helps accessibility and SEO.",
        "Multiple children (<code>h3</code>, <code>h3</code>) are fine inside the built-in <code>&lt;footer&gt;</code> element — only a custom component needs a single root or fragment."
      ],
      run: "cd my-react && npm run dev",
      output: "Bottom of the page shows:\nLearn React from the Basics\nMy college"
    },
    {
      title: "src/components/Content.jsx (journal): the smallest section",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/my-react/src/components/Content.jsx",
      lang: "jsx",
      code: `
function Content(){
    return (
        <div>
            <h2>React Course</h2>
        </div>
    )
}

export default Content;
`,
      explain: [
        "One heading, one component. Components do not have to be clever to be useful — the value is the boundary they draw around a piece of the page.",
        "In the real app this is the slot where the page's \"main\" content grows: tomorrow it could render a list of courses from data instead of one hard-coded heading.",
        "Read all four section components side by side: Header, Navbar, Content, Footer. Four files, four functions, one screen — the composition lesson in one glance."
      ],
      run: "cd my-react && npm run dev",
      output: "Between navbar and footer:\nReact Course"
    },
    {
      title: "src/main.jsx (journal): composing and mounting the tree",
      from: "journal",
      file: "sorted_files/11_Week-11_React-Intro/my-react/src/main.jsx",
      lang: "jsx",
      code: `
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx' //we put curly brackets as we exported the function
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Content from './components/Content.jsx'
import Navbar from './components/Navbar.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <Header></Header>
    <Navbar></Navbar>
    <Content></Content>
    <Footer></Footer>

  </StrictMode>,
)
//we have removed the app import for now.
`,
      explain: [
        "Four imports from four files — the file-per-component convention paying off: each line is one piece of the page.",
        "<code>createRoot(document.getElementById('root')).render(...)</code> is the mount: it hands React the empty div from index.html and inserts the whole tree into it.",
        "<code>&lt;Header&gt;&lt;/Header&gt;</code> is the long form; components without children are usually written <code>&lt;Header /&gt;</code> — both call the same function.",
        "The trailing journal comment is accurate: <code>App</code> is imported but never rendered, so it contributes nothing to the screen — dead imports are a classic beginner leftover (an editor will grey them out)."
      ],
      run: "cd my-react && npm run dev",
      output: "The whole page, top to bottom:\nMy College\n[ Home ] [ Course ] [ Contect ]\nReact Course\nLearn React from the Basics  My college"
    },
    {
      title: "A built-in elements sampler: div, span, button, ul, input, form",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
function EnrolmentForm(){
  return (
    <form>
      <label>Name <input type="text" placeholder="your name" /></label>
      <ul>
        <li><span>Course:</span> FSD</li>
        <li><span>Unit:</span> III</li>
      </ul>
      <button type="submit">Enrol</button>
    </form>
  )
}

export default EnrolmentForm;
`,
      explain: [
        "Every tag here is lowercase — all built-in elements React hands straight to the DOM. No custom component is in sight, which is normal: most tags in a real app are built-ins.",
        "<code>form</code>, <code>label</code>, <code>input</code>, <code>ul</code>/<code>li</code>, <code>span</code>, <code>button</code> — the everyday vocabulary; the full list lives in react.dev's <em>React DOM DOM Attributes</em> reference.",
        "<code>&lt;input ... /&gt;</code> is self-closed per the JSX rules from Lesson 3, and <code>type=\"submit\"</code> shows a plain string attribute.",
        "Swap this into <code>Content.jsx</code> of the journal project to see a built-in-only component on screen in seconds."
      ],
      run: "npx vite (inside a scaffolded project; or replace Content.jsx in my-react)",
      output: "A small form appears:\nName [________]  •  Course: FSD  •  Unit: III  [ Enrol ]"
    },
    {
      title: "Spot the bug: every import pasted under the same name",
      from: "new",
      file: "",
      lang: "jsx",
      code: `
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// BROKEN — as the journal's react2_Lab10 copy of main.jsx was:
import Header from './components/Header.jsx'
import Header from './components/Navbar.jsx'
import Header from './components/Content.jsx'
import Header from './components/Footer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Header />
    <Header />
    <Header />
    <Header />
  </StrictMode>,
)
`,
      explain: [
        "Four <code>import</code> lines all declaring the same constant <code>Header</code>: JavaScript rejects this immediately with <em>Identifier 'Header' has already been declared</em> — the app never gets to render.",
        "The journal's DOCX notes admit this happened in the <code>react2_Lab10</code> duplicate: the imports were pasted without renaming the local bindings. Each import needs its own name — <code>Navbar</code>, <code>Content</code>, <code>Footer</code>.",
        "Even had it compiled, four <code>&lt;Header /&gt;</code> tags would render the college heading four times — importing and <em>using</em> are two separate mistakes to check.",
        "The fix is exactly what the journal's real <code>my-react/src/main.jsx</code> (example 5) does: one distinct name per import, each used once, in the order the page should read."
      ],
      run: "npm run dev in that project",
      output: "Build error in the browser overlay:\nIdentifier 'Header' has already been declared"
    }
  ],
  keyPoints: [
    "Lowercase tags are React's built-in DOM elements; a Uppercase tag is a custom component — a JavaScript function you wrote.",
    "A component is a function that returns JSX, saved in its own <code>.jsx</code> file whose name matches the component, with <code>export default</code> at the bottom.",
    "A page is composed by nesting components; in this journal the composition happens in <code>main.jsx</code>, which mounts Header, Navbar, Content and Footer.",
    "<code>createRoot(document.getElementById('root')).render(...)</code> is the single bridge between your component tree and the browser's DOM.",
    "<code>StrictMode</code> renders nothing extra; it is a development wrapper that surfaces mistakes like mutating props.",
    "Dead files do not hurt: the journal's 0-byte <code>react3/src/App.jsx</code> is never imported, so the app runs — but a mistyped import (or duplicate name) stops everything."
  ],
  practice: `
    <p>Inside the journal's <code>my-react</code> project, create a new file
    <code>src/components/Notice.jsx</code> containing a component that renders one paragraph of
    your own text. Import it in <code>main.jsx</code> and render it between
    <code>Content</code> and <code>Footer</code>. Then break it deliberately on purpose — rename
    the import to <code>notice</code> (lowercase) and see the error JSX gives you for treating a
    component as a built-in tag — and fix it back. Finally, delete the unused
    <code>App</code> import line and confirm the page still renders identically.</p>
  `,
  quiz: [
    {
      q: "In JSX, what does an Uppercase tag name like &lt;Navbar /&gt; mean?",
      options: [
        "It is an HTML5 custom element defined in the browser",
        "It is a JavaScript function in scope that React calls to produce markup",
        "It is the same as &lt;nav&gt; but with extra styling",
        "It is a built-in React element with higher priority"
      ],
      answer: 1,
      why: "Capitalisation is the signal: lowercase names are strings meaning DOM elements; uppercase names are values in scope — normally your own component function, which React invokes with its props."
    },
    {
      q: "Why did the react2_Lab10 main.jsx described in the journal fail to build?",
      options: [
        "Because it imported all four component files under the same name Header, redeclaring the identifier",
        "Because it used JSX in a .js file",
        "Because StrictMode cannot render more than one child",
        "Because createRoot needs to be called twice"
      ],
      answer: 0,
      why: "Each import declares a constant; four imports named Header collide with 'Identifier has already been declared'. StrictMode accepts many children, JSX lives in .jsx files here, and one createRoot call is correct."
    }
  ],
  sources: [
    "https://react.dev/learn/your-first-component",
    "https://react.dev/learn/importing-and-exporting-components",
    "https://react.dev/reference/react/StrictMode"
  ]
});
