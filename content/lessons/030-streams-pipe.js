window.COURSE_LESSONS.push({
  id: "w05-streams-pipe",
  file: "030",
  unit: 1,
  week: 5,
  title: "Readable streams, writable streams and pipe",
  kicker: "Unit I · Week 5 · Lesson 2 of 6",
  minutes: 18,
  objectives: [
    "Explain what a stream is and why chunks beat loading a whole file into memory",
    "Read a file piece by piece with fs.createReadStream and write one with fs.createWriteStream",
    "Join a readable to a writable with pipe(), and name the four kinds of streams"
  ],
  intro: `
    <p>Last lesson you wrote whole files in one call — fine for a report, ruinous for a 4 GB video.
    <code>fs.readFile</code> and <code>fs.writeFile</code> hold the <em>entire</em> file in memory at once.
    Streams are the answer: they move data in small pieces, called chunks, so a program can handle files
    far bigger than its RAM.</p>
    <p>Your journal's Week 5 folder has three tiny stream programs — <code>01_streams.js</code>,
    <code>02_writable-streams.js</code> and <code>03_pipe.js</code> — plus a note
    (<code>08_notes.txt</code>) that sums the idea up in two lines. We will run all three against the
    fixture file <code>sampleForStream.txt</code>.</p>
  `,
  theory: [
    `
      <h3>What a stream is, and why it exists</h3>
      <p>A <strong>stream</strong> is an object that carries data from a source to a destination in
      successive chunks, instead of all at once. Reading a big file with <code>readFile</code> means the
      whole thing has to fit in memory; a <code>createReadStream</code> reads, say, 64 KB at a time, hands
      it to you, then reads the next 64 KB. Memory stays flat no matter how big the file grows.</p>
      <pre class="diagram">   WITHOUT streams (readFile)          WITH streams (createReadStream)

   [ ================= entire file ================= ]   [chunk1][chunk2][chunk3]…[chunkN]
                        │                                          │
                        ▼                                          ▼
              all in RAM at once                          only one chunk in RAM at a time
              4 GB file needs 4 GB RAM                    4 GB file needs ~64 KB RAM</pre>
      <p>Your journal note <code>08_notes.txt</code> lists exactly the payoff:
      <em>"less memory … they are faster … better performance."</em> "Faster" here really means
      <em>constant memory</em> and the ability to start producing output before the whole input has
      arrived.</p>
    `,
    `
      <h3>The four kinds of streams</h3>
      <p>Streams come in four flavours, as your note records:</p>
      <table>
        <thead><tr><th>Kind</th><th>Reads</th><th>Writes</th><th>You have seen</th></tr></thead>
        <tbody>
          <tr><td><strong>Readable</strong></td><td>yes</td><td>no</td><td><code>fs.createReadStream</code>, <code>process.stdin</code></td></tr>
          <tr><td><strong>Writable</strong></td><td>no</td><td>yes</td><td><code>fs.createWriteStream</code>, <code>process.stdout</code></td></tr>
          <tr><td><strong>Duplex</strong></td><td>yes</td><td>yes</td><td>a TCP socket (both directions at once)</td></tr>
          <tr><td><strong>Transform</strong></td><td>yes</td><td>yes, transformed</td><td>gzip compression — data goes in one shape, out another</td></tr>
        </tbody>
      </table>
      <p>Reading and writing files uses the first two. Duplex and transform become important once you
      build servers and compressors, but you only need the names for now.</p>
    `,
    `
      <h3>Events: data and end</h3>
      <p>A readable stream is an <em>event emitter</em> (Week 3). You do not "get" the data as a return
      value — you subscribe to it. The two events that matter:</p>
      <ul>
        <li><code>'data'</code> — fires each time a chunk is ready. The callback receives the chunk as a
        <code>Buffer</code>; pass <code>{ encoding: 'utf-8' }</code> to get a string instead.</li>
        <li><code>'end'</code> — fires once, when every chunk has been delivered. It does <em>not</em> fire
        if the stream errored, which is why it is the right place for "done" logic.</li>
      </ul>
    `,
    `
      <h3>pipe: joining a readable to a writable</h3>
      <p>Copying a file the long way means reading a chunk, writing the chunk, repeating. <code>pipe</code>
      does that loop for you and adds something important — <strong>backpressure</strong>. If the
      destination fills up its internal buffer, <code>pipe</code> tells the source to <em>pause</em> until
      the destination drains. Without it a fast source can pile data into memory faster than the disk can
      take it.</p>
      <pre class="diagram">  readstream ──chunk──▶ writable's buffer ──chunk──▶ disk
       ▲                        │
       └──── pause when full ───┘   ◀── resume when drained ──  (this is backpressure)

  one line does all of it:   readstream.pipe(writeStream);</pre>
      <p>Modern Node also offers <code>stream.pipeline</code> and <code>fs</code>'s
      <code>pipeline</code>-style promises, which handle errors as well as backpressure — but the journal
      teaches plain <code>pipe()</code>, so that is what we run first.</p>
    `
  ],
  examples: [
    {
      title: "Reading a file with a readable stream",
      from: "journal",
      file: "sorted_files/05_Week-05_Streams-Routing/01_streams.js",
      lang: "javascript",
      code: `
const fs = require('fs');

const readStream = fs.createReadStream('sampleForStream.txt', {encoding:'utf-8'});

readStream.on('data',(chunk)=>{
//it has to be data as the varible name followed by where is the data is stored that is readStream in our cace.

console.log("chunk revieved");
console.log(chunk);

});

readStream.on("end",()=>{ //this will only print if we reach at the end of the file if any error it wont print.
    console.log("End of the file");
})
`,
      explain: [
        "Run this from inside <code>sorted_files/05_Week-05_Streams-Routing/</code> so the relative path <code>sampleForStream.txt</code> resolves — the folder's README says exactly that.",
        "<code>createReadStream</code> opens the file and starts flowing; nothing is read until the first <code>'data'</code> listener is attached.",
        "<code>{encoding:'utf-8'}</code> turns each chunk from a raw <code>Buffer</code> into a string, so <code>console.log(chunk)</code> prints readable text.",
        "The fixture is only a few hundred bytes, so Node delivers it as <strong>one</strong> chunk — a bigger file would fire <code>'data'</code> several times.",
        "The <code>'end'</code> listener prints its message only after the last chunk; on a read error it would never run."
      ],
      run: "node 01_streams.js",
      output: `chunk revieved

What concert only costs 45 cents? 50 Cent and Nickelback.
The guy who stole my diary went missing. My thoughts are with his family.
Don\u2019t take life too seriously. Remember, you will never get out of it alive!
Knock knock. Who\u2019s there? Ben. Ben who? Ben thinking about you all day!
What car does Jesus drive? A Christler.
It was so hot today. I almost called my ex to be around something shady.
End of the file`
    },
    {
      title: "Writing a file with a writable stream",
      from: "journal",
      file: "sorted_files/05_Week-05_Streams-Routing/02_writable-streams.js",
      lang: "javascript",
      code: `
//for write streams we dont need encoding.

const fs = require("fs");

const writeStream  = fs.createWriteStream('output.txt');

writeStream.write("heloo");
writeStream.write("\\nlearning node js");
writeStream.write("\\nwritable streams");
writeStream.end();
`,
      explain: [
        "<code>createWriteStream('output.txt')</code> creates (or truncates) the file and hands you an object you can keep feeding.",
        "Each <code>write()</code> call appends one more chunk to the stream's buffer — note the file itself carries no encoding option, exactly as the comment says.",
        "The literal <code>\\n</code> sequences become real newlines in the file, giving it three lines.",
        "<code>end()</code> is required: it flushes the final buffer and closes the file. Forget it and the file can end up empty or truncated."
      ],
      run: "node 02_writable-streams.js",
      output: `(no console output — check output.txt instead)
heloo
learning node js
writable streams`
    },
    {
      title: "pipe: copy a file in one line",
      from: "journal",
      file: "sorted_files/05_Week-05_Streams-Routing/03_pipe.js",
      lang: "javascript",
      code: `
//it is just joining my read and write stream

const fs = require("fs");
 const readstream = fs.createReadStream('sampleForStream.txt');
 const writeStream = fs.createWriteStream('copyFile.txt');

 readstream.pipe(writeStream);
`,
      explain: [
        "One readable + one writable + <code>pipe</code> = a complete file copy. This is the whole point of the lesson.",
        "<code>pipe</code> wires the source's <code>'data'</code> events into the destination's <code>write()</code>, and calls <code>end()</code> on the destination when the source emits <code>'end'</code>.",
        "No <code>encoding</code> is set here — raw bytes flow through, which is exactly what you want for a byte-perfect copy (this would even work for an image or a zip).",
        "Compare <code>copyFile.txt</code> with <code>sampleForStream.txt</code> afterwards: identical, one character for character.",
        "Backpressure is happening invisibly — if the disk writes slower than the read, <code>pipe</code> pauses the source until it catches up."
      ],
      run: "node 03_pipe.js",
      output: `(no console output — copyFile.txt becomes an exact copy of sampleForStream.txt)`
    },
    {
      title: "Seeing backpressure: a slow destination and a fast source",
      from: "new",
      lang: "javascript",
      code: `
const fs = require("fs");
const { Readable } = require("stream");

// A source that always has more data to give (a "fast source").
let n = 0;
const source = new Readable({
  read() {
    this.push("chunk " + (++n) + "\\n");
    if (n === 5) this.push(null); // signal end
  }
});

// A destination that writes very slowly.
const slow = new fs.createWriteStream("slow.txt");
slow._write = (chunk, enc, cb) => setTimeout(cb, 200); // pretend disk is slow

source.pipe(slow);
console.log("piping 5 chunks through a slow writer...");
`,
      explain: [
        "Save as <code>backpressure.js</code>. It builds a fake readable with <code>Readable</code> instead of a file so you control the pace.",
        "<code>read()</code> is called by the stream when it wants more data; pushing <code>null</code> means \"that's all\".",
        "The <code>_write</code> override adds a 200 ms delay per chunk, simulating a slow disk.",
        "Watch it take about a second for 5 chunks: <code>pipe</code> does not let the fast source dump everything into memory — it waits for the slow writer each time. That waiting <em>is</em> backpressure."
      ],
      run: "node backpressure.js",
      output: `piping 5 chunks through a slow writer...
(then ~1 second of nothing while the 5 chunks drain into slow.txt)`
    },
    {
      title: "The same copy, done longhand (why pipe is worth it)",
      from: "new",
      lang: "javascript",
      code: `
const fs = require("fs");

const read = fs.createReadStream("sampleForStream.txt");
const write = fs.createWriteStream("copy-longhand.txt");

// No pipe: you drive every step yourself.
read.on("data", (chunk) => {
  const ok = write.write(chunk);
  if (!ok) {
    console.log("destination full — pausing source");
    read.pause();
    write.once("drain", () => read.resume()); // backpressure by hand
  }
});

read.on("end", () => {
  write.end(() => console.log("copy complete"));
});

read.on("error", (e) => console.log("read failed:", e.message));
`,
      explain: [
        "Save as <code>copy-longhand.js</code> next to <code>sampleForStream.txt</code>. It does exactly what <code>pipe</code> does, but you write every line.",
        "<code>write()</code> returning <code>false</code> is the signal that the internal buffer is full — the contract behind backpressure.",
        "<code>read.pause()</code> / <code>read.resume()</code> (with the <code>'drain'</code> event) is the manual version of what <code>pipe</code> automates.",
        "You also had to add error handling yourself — which is the one thing plain <code>pipe()</code> still leaves to you (and why <code>stream.pipeline</code> exists)."
      ],
      run: "node copy-longhand.js",
      output: `copy complete`
    },
    {
      title: "Counting chunks to prove data really arrives in pieces",
      from: "new",
      lang: "javascript",
      code: `
const fs = require("fs");

let chunks = 0;
let bytes = 0;

const rs = fs.createReadStream("sampleForStream.txt");
rs.on("data", (c) => { chunks++; bytes += c.length; });
rs.on("end", () => {
  console.log("chunks:", chunks);
  console.log("bytes:", bytes);
});
`,
      explain: [
        "Save as <code>count-chunks.js</code>. It never prints the data — only how it was delivered.",
        "Each <code>c</code> is a <code>Buffer</code>; <code>c.length</code> is that chunk's size in bytes.",
        "For this small fixture you will see <code>chunks: 1</code> — Node reads up to 64 KB at once, and the whole file fits in one chunk.",
        "Change the read path to a much larger file and <code>chunks</code> climbs into the hundreds, while memory usage stays nearly flat. That is the whole argument for streams."
      ],
      run: "node count-chunks.js",
      output: `chunks: 1
bytes: 431`
    }
  ],
  keyPoints: [
    "A stream moves data in chunks so memory use stays constant no matter the file size — your note says it plainly: less memory, better performance.",
    "The four kinds are readable, writable, duplex and transform.",
    "<code>fs.createReadStream</code> emits <code>'data'</code> per chunk and <code>'end'</code> once; pass <code>{encoding:'utf-8'}</code> for strings instead of Buffers.",
    "<code>fs.createWriteStream</code> needs <code>end()</code> to flush and close the file.",
    "<code>readable.pipe(writable)</code> copies automatically and enforces backpressure, pausing the source whenever the destination falls behind."
  ],
  practice: `
    <p>From inside <code>sorted_files/05_Week-05_Streams-Routing/</code>, write a new script
    <code>count-lines.js</code> that reads <code>sampleForStream.txt</code> as a stream and counts the
    newline characters across all chunks (hint: split each chunk on <code>"\\n"</code> and add the pieces,
    minus one, to a running total). Then use <code>pipe</code> to copy the file to
    <code>backup.txt</code> and confirm with a diff that the two match.</p>
  `,
  quiz: [
    {
      q: "Why would you prefer fs.createReadStream over fs.readFile for a 2 GB log file?",
      options: [
        "Because createReadStream is the only one that can read a text file",
        "Because readFile must hold the whole 2 GB in memory, while a stream delivers it in small chunks with near-constant memory use",
        "Because createReadStream is synchronous and therefore faster",
        "Because readFile cannot open files larger than 1 GB"
      ],
      answer: 1,
      why: "The whole-file-in-memory cost is the reason streams exist. A stream reads a chunk (typically 64 KB), gives it to you, then reads the next one — so a huge file costs about the same RAM as a tiny one."
    },
    {
      q: "What does pipe() do that read.on('data', d => write.write(d)) alone does not?",
      options: [
        "It converts every chunk to a string",
        "It handles backpressure — pausing the source when the destination's buffer is full — and ends the writable when the source ends",
        "It compresses the data in transit",
        "It retries the write if the disk fails"
      ],
      answer: 1,
      why: "Backpressure is the key difference: pipe watches the boolean from write(), pauses the readable on false, resumes on 'drain', and calls end() when the source finishes. Plain on('data') gives you none of that for free."
    }
  ],
  sources: [
    "https://nodejs.org/api/stream.html",
    "https://nodejs.org/api/fs.html#fscreateReadStream-path-options",
    "https://nodejs.org/api/stream.html#readablepipedestination-options"
  ]
});
