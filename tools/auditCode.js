// Audyt kodu: duplikaty funkcji globalnych i wywołania niezdefiniowanych funkcji.
// Uruchomienie: node tools/auditCode.js
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const loaded = [...html.matchAll(/<script[^>]+src="([^"?]+)/g)].map((m) => m[1]);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : p.endsWith(".js") ? [p] : [];
  });
}
const allJs = walk(path.join(root, "js")).map((p) =>
  path.relative(root, p).split(path.sep).join("/"),
);

// Usuwa komentarze oraz zawartość tekstów, zostawia kod (przybliżenie).
function strip(src) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (c === "/" && n === "/") {
      while (i < src.length && src[i] !== "\n") i++;
    } else if (c === "/" && n === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        if (src[i] === "\n") out += "\n";
        i++;
      }
      i += 2;
    } else if (c === '"' || c === "'") {
      i++;
      while (i < src.length && src[i] !== c && src[i] !== "\n") {
        if (src[i] === "\\") i++;
        i++;
      }
      i++;
      out += '""';
    } else if (c === "`") {
      // szablon: wnętrze ${...} też zawiera kod, więc je zachowujemy
      i++;
      out += '""';
      while (i < src.length && src[i] !== "`") {
        if (src[i] === "\\") {
          i += 2;
        } else if (src[i] === "$" && src[i + 1] === "{") {
          let d = 1;
          i += 2;
          let expr = "";
          while (i < src.length && d) {
            if (src[i] === "{") d++;
            else if (src[i] === "}") d--;
            if (d) expr += src[i];
            i++;
          }
          out += " " + strip(expr) + " ";
        } else {
          if (src[i] === "\n") out += "\n";
          i++;
        }
      }
      i++;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

const keywords = new Set(
  "if for while switch catch function return typeof new await async do else try finally super import export delete void in of case throw yield class".split(
    " ",
  ),
);
const builtins = new Set(
  `Object Array String Number Boolean Math Date JSON Promise Set Map WeakMap WeakSet Symbol RegExp Error TypeError RangeError parseInt parseFloat isNaN isFinite setTimeout clearTimeout setInterval clearInterval requestAnimationFrame cancelAnimationFrame alert confirm prompt fetch structuredClone Intl BigInt Reflect Proxy encodeURIComponent decodeURIComponent atob btoa queueMicrotask Function require console document window localStorage sessionStorage navigator location history performance Image Audio Event CustomEvent MutationObserver IntersectionObserver ResizeObserver URL Blob FileReader AbortController Notification getComputedStyle matchMedia addEventListener removeEventListener Uint8Array Int32Array Float64Array`.split(
    /\s+/,
  ),
);

const declared = new Map(); // nazwa -> [pliki] (tylko funkcje poziomu głównego)
const anyDecl = new Set();
const calls = new Map(); // nazwa -> Set(plików)
const topFunctions = new Map();

for (const file of allJs) {
  const code = strip(fs.readFileSync(path.join(root, file), "utf8"));
  for (const m of code.matchAll(/^function\s+([A-Za-z_$][\w$]*)/gm)) {
    if (!topFunctions.has(m[1])) topFunctions.set(m[1], []);
    topFunctions.get(m[1]).push(file);
  }
  for (const m of code.matchAll(/\bfunction\s*\*?\s*([A-Za-z_$][\w$]*)/g)) anyDecl.add(m[1]);
  for (const m of code.matchAll(/\b(?:const|let|var|class)\s+([A-Za-z_$][\w$]*)/g)) anyDecl.add(m[1]);
  // destrukturyzacja i parametry: bierzemy wszystkie identyfikatory z nawiasów
  for (const m of code.matchAll(/\b(?:const|let|var)\s*[\[{]([^=]*?)[\]}]\s*=/g))
    for (const id of m[1].matchAll(/[A-Za-z_$][\w$]*/g)) anyDecl.add(id[0]);
  for (const m of code.matchAll(/\(([^()]*)\)\s*(?:=>|\{)/g))
    for (const id of m[1].matchAll(/[A-Za-z_$][\w$]*/g)) anyDecl.add(id[0]);
  for (const m of code.matchAll(/\b([A-Za-z_$][\w$]*)\s*=>/g)) anyDecl.add(m[1]);
  for (const m of code.matchAll(/(?<![.\w$])([A-Za-z_$][\w$]*)\s*\(/g)) {
    const name = m[1];
    if (keywords.has(name) || builtins.has(name)) continue;
    if (!calls.has(name)) calls.set(name, new Set());
    calls.get(name).add(file);
  }
  // metody obiektów: name(...) { w definicjach obiektów/klas
  for (const m of code.matchAll(/^\s+(?:async\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/gm))
    anyDecl.add(m[1]);
  // przypisania window.x = / globalne właściwości
  for (const m of code.matchAll(/window\.([A-Za-z_$][\w$]*)\s*=/g)) anyDecl.add(m[1]);
}

let problems = 0;

console.log("== Skrypty w js/ nieładowane w index.html ==");
for (const f of allJs) {
  const used = loaded.some((l) => l === f);
  if (!used) {
    console.log("  " + f);
    problems++;
  }
}

console.log("\n== Funkcje globalne zdefiniowane więcej niż raz ==");
for (const [name, files] of topFunctions) {
  if (files.length > 1) {
    const counts = {};
    files.forEach((f) => (counts[f] = (counts[f] || 0) + 1));
    console.log(
      "  " + name + ": " + Object.entries(counts).map(([f, n]) => f + (n > 1 ? " x" + n : "")).join(", "),
    );
    problems++;
  }
}

console.log("\n== Wywołania funkcji, których nigdzie nie zdefiniowano ==");
for (const [name, files] of calls) {
  if (anyDecl.has(name)) continue;
  console.log("  " + name + "()  <- " + [...files].join(", "));
  problems++;
}

console.log("\n== Funkcje globalne, których nikt nie woła ani nie referencjonuje ==");
// surowy kod (z tekstami), bo funkcje bywają wołane z onclick="..." w HTML-u generowanym w tekstach
const allCode = allJs.map((f) => fs.readFileSync(path.join(root, f), "utf8")).join("\n") + "\n" + html;
for (const name of topFunctions.keys()) {
  const re = new RegExp("(?<![\\w$])" + name.replace(/\$/g, "\\$") + "(?![\\w$])", "g");
  const count = (allCode.match(re) || []).length;
  if (count <= topFunctions.get(name).length) console.log("  " + name + "  (" + topFunctions.get(name)[0] + ")");
}

console.log("\nProblemy (bez martwych funkcji): " + problems);
