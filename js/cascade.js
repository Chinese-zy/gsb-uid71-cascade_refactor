const INHERITED_PROPS = { color: true, "font-size": true };

function compareSpecificity(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function specificity(selector) {
  const text = String(selector).trim();
  const grouped = text.match(/^:is\((.*)\)\s*$/);
  if (grouped) {
    let best = [0, 0, 0];
    for (const part of grouped[1].split(",")) {
      const current = specificity(part);
      if (compareSpecificity(current, best) > 0) best = current;
    }
    return best;
  }
  const counts = [0, 0, 0];
  if (/^[a-zA-Z]+/.test(text)) counts[2] += 1;
  counts[1] += (text.match(/\.[A-Za-z0-9_-]+/g) || []).length;
  counts[0] += (text.match(/#[A-Za-z0-9_-]+/g) || []).length;
  return counts;
}

function matches(el, selector) {
  const text = String(selector).trim();
  const grouped = text.match(/^:is\((.*)\)\s*$/);
  if (grouped) {
    return grouped[1].split(",").some((part) => matches(el, part));
  }
  let rest = text;
  let tag = "";
  const tagMatch = rest.match(/^[a-zA-Z]+/);
  if (tagMatch) {
    tag = tagMatch[0].toLowerCase();
    rest = rest.slice(tag.length);
  }
  const classes = [];
  const classRe = /\.([A-Za-z0-9_-]+)/g;
  let found;
  while ((found = classRe.exec(rest))) classes.push(found[1]);
  const idMatch = rest.match(/#([A-Za-z0-9_-]+)/);
  const id = idMatch ? idMatch[1] : "";
  if (!tag && !id && classes.length === 0) return false;
  if (tag && el.tag !== tag) return false;
  if (id && el.id !== id) return false;
  for (const name of classes) {
    if (!el.classes.includes(name)) return false;
  }
  return true;
}

function declaredValue(rules, el, prop) {
  let best = null;
  let bestSpec = null;
  for (const rule of rules) {
    if (rule.prop !== prop) continue;
    if (!matches(el, rule.selector)) continue;
    const spec = specificity(rule.selector);
    const wins =
      !best ||
      compareSpecificity(spec, bestSpec) > 0 ||
      (compareSpecificity(spec, bestSpec) === 0 && rule.index > best.index);
    if (wins) {
      best = rule;
      bestSpec = spec;
    }
  }
  return best ? best.value : null;
}

function cascadeValue(rules, node, prop, parentValues) {
  const inline = node.inline || {};
  if (inline[prop] != null && inline[prop] !== "") return inline[prop];
  const declared = declaredValue(rules, node, prop);
  if (declared != null) return declared;
  if (INHERITED_PROPS[prop] && parentValues && parentValues[prop]) {
    return parentValues[prop];
  }
  return "";
}

function computeStyles(nodes, rules, props) {
  const byKey = Object.fromEntries(nodes.map((node) => [node.key, node]));
  const computed = {};
  function resolve(key) {
    if (computed[key]) return computed[key];
    const node = byKey[key];
    const parentValues = node.parent ? resolve(node.parent) : null;
    const out = {};
    for (const prop of props) {
      out[prop] = cascadeValue(rules, node, prop, parentValues);
    }
    computed[key] = out;
    return out;
  }
  for (const node of nodes) resolve(node.key);
  return computed;
}
