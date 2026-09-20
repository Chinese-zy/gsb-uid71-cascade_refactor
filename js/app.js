const nodes = [
  {
    key: "根",
    tag: "div",
    id: "main",
    classes: [],
    parent: null,
    inline: { color: "#44403c", width: "320px", height: "160px", "font-size": "16px" },
  },
  {
    key: "盒子",
    tag: "div",
    id: "",
    classes: ["box"],
    parent: "根",
    inline: { color: "#1e3a8a" },
  },
  {
    key: "字",
    tag: "span",
    id: "",
    classes: ["label", "notes"],
    parent: "盒子",
    inline: { color: "#082040" },
  },
];

const rules = [
  { index: 0, selector: "div", prop: "color", value: "#44403c" },
  { index: 1, selector: "div.box", prop: "color", value: "#0f766e" },
  { index: 2, selector: ":is(.box, #main)", prop: "color", value: "#9f1239" },
  { index: 3, selector: ".label", prop: "font-size", value: "14px" },
  { index: 4, selector: ".notes", prop: "font-size", value: "22px" },
  { index: 5, selector: "span", prop: "width", value: "80px" },
  { index: 6, selector: "div.box", prop: "width", value: "200px" },
  { index: 7, selector: "#main", prop: "color", value: "#14532d" },
];

const props = ["color", "font-size", "width", "height"];
const propName = { color: "颜色", "font-size": "字号", width: "宽", height: "高" };
const byKey = Object.fromEntries(nodes.map((node) => [node.key, node]));

function computedFor(node, parentComputed) {
  const base = inherited(parentComputed);
  for (const prop of props) {
    const chosen = pick(rules, node, prop);
    if (chosen != null) base[prop] = chosen;
  }
  return applyInline(base, node.inline);
}

function paintedFor(node, parentPainted) {
  const out = {};
  for (const prop of props) {
    out[prop] = painted(rules, node, prop, node.inline, parentPainted);
  }
  return out;
}

const computed = {};
const paints = {};
function walk(key, parentKey) {
  const node = byKey[key];
  const parentComputed = parentKey ? computed[parentKey] : null;
  const parentPainted = parentKey ? paints[parentKey] : null;
  computed[key] = computedFor(node, parentComputed);
  paints[key] = paintedFor(node, parentPainted);
  for (const child of nodes) {
    if (child.parent === key) walk(child.key, key);
  }
}
walk("根", null);

const stage = document.getElementById("stage");
const dom = {};
function ensure(node) {
  const el = document.createElement(node.tag);
  el.textContent = node.key;
  dom[node.key] = el;
  return el;
}
const rootEl = ensure(byKey["根"]);
const boxEl = ensure(byKey["盒子"]);
const labelEl = ensure(byKey["字"]);
rootEl.appendChild(boxEl);
boxEl.appendChild(labelEl);
stage.appendChild(rootEl);

for (const node of nodes) {
  const el = dom[node.key];
  const view = paints[node.key];
  if (view.color) el.style.color = view.color;
  if (view["font-size"]) el.style.fontSize = view["font-size"];
  if (view.width) el.style.width = view.width;
  if (view.height) el.style.height = view.height;
  el.style.padding = "8px";
  el.style.margin = "8px";
  el.style.border = "1px solid #d6d3d1";
}

const rows = document.getElementById("rows");
for (const node of nodes) {
  for (const prop of props) {
    const left = computed[node.key][prop] || "";
    const right = paints[node.key][prop] || "";
    const tr = document.createElement("tr");
    const diff = left !== right ? "diff" : "";
    tr.innerHTML =
      "<td>" + node.key + "</td><td>" + propName[prop] + "</td><td class=\"" + diff + "\">" +
      left + "</td><td class=\"" + diff + "\">" + right + "</td>";
    rows.appendChild(tr);
  }
}
