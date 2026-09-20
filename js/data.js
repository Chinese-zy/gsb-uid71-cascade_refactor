(function (global) {
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

  const styleData = { nodes, rules, props, propName, byKey };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = styleData;
  } else {
    global.StyleData = styleData;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
