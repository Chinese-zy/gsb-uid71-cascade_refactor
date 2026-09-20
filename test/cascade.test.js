const assert = require("assert");
const path = require("path");

const data = require("../js/data.js");
const Cascade = require("../js/cascade.js");

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log("ok - " + name);
}

test("权重按 id/类/标签 分层，:is 取最具体的分支", () => {
  assert.deepEqual(Cascade.specificity("div"), [0, 0, 1]);
  assert.deepEqual(Cascade.specificity("div.box"), [0, 1, 1]);
  assert.deepEqual(Cascade.specificity("#main"), [1, 0, 0]);
  assert.deepEqual(Cascade.specificity(":is(.box, #main)"), [1, 0, 0]);
  assert.deepEqual(Cascade.specificity(":is(span, p.note)"), [0, 1, 1]);
  assert.ok(Cascade.compareSpecificity([1, 0, 0], [0, 9, 9]) > 0);
  assert.ok(Cascade.compareSpecificity([0, 1, 1], [0, 1, 0]) > 0);
});

test("行内样式压过 id 选择器", () => {
  const el = { tag: "div", id: "main", classes: [] };
  const value = Cascade.resolve(data.rules, el, "color", { color: "#aaaaaa" }, null);
  assert.equal(value, "#aaaaaa");
});

test("同样权重后写的规则赢（.notes 压过 .label）", () => {
  const el = { tag: "span", id: "", classes: ["label", "notes"] };
  const value = Cascade.resolve(data.rules, el, "font-size", {}, null);
  assert.equal(value, "22px");
});

test("宽高不继承，颜色字号继承", () => {
  const computed = Cascade.computeTree(data.nodes, data.rules, data.props);
  assert.equal(computed["根"].color, "#44403c");
  assert.equal(computed["盒子"].color, "#1e3a8a");
  assert.equal(computed["字"].color, "#082040");
  assert.equal(computed["根"]["font-size"], "16px");
  assert.equal(computed["盒子"]["font-size"], "16px");
  assert.equal(computed["字"]["font-size"], "22px");
  assert.equal(computed["根"].width, "320px");
  assert.equal(computed["盒子"].width, "200px");
  assert.equal(computed["字"].width, "80px");
  assert.equal(computed["盒子"].height, "");
  assert.equal(computed["字"].height, "");
});

const APP_PATH = path.join(__dirname, "..", "js", "app.js");
const STYLE_PROPS = ["color", "font-size", "width", "height"];

function fakeElement(tag) {
  return { tag, style: {}, textContent: "", children: [], appendChild(child) { this.children.push(child); } };
}

function runApp(rules) {
  const stage = fakeElement("div");
  const rows = fakeElement("table");
  global.document = {
    getElementById(id) {
      return id === "stage" ? stage : rows;
    },
    createElement: fakeElement,
  };
  global.StyleData = { ...data, rules };
  global.Cascade = Cascade;
  delete require.cache[APP_PATH];
  require(APP_PATH);
  return { stage, rows };
}

function paintedByKey(stage) {
  const root = stage.children[0];
  const box = root.children[0];
  const label = box.children[0];
  return { "根": root, "盒子": box, "字": label };
}

test("画面元素上的 style 与表格计算值逐格一致", () => {
  const computed = Cascade.computeTree(data.nodes, data.rules, data.props);
  const { stage, rows } = runApp(data.rules);
  const painted = paintedByKey(stage);

  for (const node of data.nodes) {
    const elStyle = painted[node.key].style;
    for (const prop of STYLE_PROPS) {
      const camel = prop.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
      assert.equal(elStyle[camel] || "", computed[node.key][prop], node.key + " " + prop);
    }
  }

  assert.equal(rows.children.length, data.nodes.length * STYLE_PROPS.length);
  for (const tr of rows.children) {
    const cells = [...tr.innerHTML.matchAll(/<td>(.*?)<\/td>/g)].map((m) => m[1]);
    assert.equal(cells.length, 4);
    assert.equal(cells[2], cells[3]);
  }
});

test("改一条规则后，计算值与画面仍然对得上", () => {
  const rules = JSON.parse(JSON.stringify(data.rules));
  rules[4].value = "30px";
  const computed = Cascade.computeTree(data.nodes, rules, data.props);
  assert.equal(computed["字"]["font-size"], "30px");

  const { stage, rows } = runApp(rules);
  const painted = paintedByKey(stage);
  assert.equal(painted["字"].style.fontSize, "30px");

  for (const node of data.nodes) {
    const elStyle = painted[node.key].style;
    for (const prop of STYLE_PROPS) {
      const camel = prop.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
      assert.equal(elStyle[camel] || "", computed[node.key][prop], node.key + " " + prop);
    }
  }
  for (const tr of rows.children) {
    const cells = [...tr.innerHTML.matchAll(/<td>(.*?)<\/td>/g)].map((m) => m[1]);
    assert.equal(cells[2], cells[3]);
  }
});

console.log("\n" + passed + " 个用例全部通过");
