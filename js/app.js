(function () {
  const { nodes, rules, props, propName } = StyleData;
  const computed = Cascade.computeTree(nodes, rules, props);

  const stage = document.getElementById("stage");
  const dom = {};
  function ensure(node) {
    const el = document.createElement(node.tag);
    el.textContent = node.key;
    dom[node.key] = el;
    return el;
  }
  const rootEl = ensure(StyleData.byKey["根"]);
  const boxEl = ensure(StyleData.byKey["盒子"]);
  const labelEl = ensure(StyleData.byKey["字"]);
  rootEl.appendChild(boxEl);
  boxEl.appendChild(labelEl);
  stage.appendChild(rootEl);

  for (const node of nodes) {
    const el = dom[node.key];
    const view = computed[node.key];
    el.style.color = view.color;
    el.style.fontSize = view["font-size"];
    el.style.width = view.width;
    el.style.height = view.height;
    el.style.padding = "8px";
    el.style.margin = "8px";
    el.style.border = "1px solid #d6d3d1";
  }

  const rows = document.getElementById("rows");
  for (const node of nodes) {
    for (const prop of props) {
      const value = computed[node.key][prop] || "";
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + node.key + "</td><td>" + propName[prop] + "</td><td>" +
        value + "</td><td>" + value + "</td>";
      rows.appendChild(tr);
    }
  }
})();
