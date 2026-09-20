(function (global) {
  const INHERITED_PROPS = { color: true, "font-size": true };
  const ID_RE = /#([A-Za-z0-9_-]+)/g;
  const CLASS_RE = /\.([A-Za-z0-9_-]+)/g;
  const TAG_RE = /^[a-zA-Z][a-zA-Z0-9]*/;

  function splitArgs(text) {
    const parts = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (ch === "(") depth += 1;
      if (ch === ")") depth -= 1;
      if (ch === "," && depth === 0) {
        parts.push(text.slice(start, i));
        start = i + 1;
      }
    }
    parts.push(text.slice(start));
    return parts;
  }

  function compoundSpecificity(text) {
    const ids = text.match(ID_RE) || [];
    const classes = text.match(CLASS_RE) || [];
    const tagMatch = text.match(TAG_RE);
    return [ids.length, classes.length, tagMatch ? 1 : 0];
  }

  function specificity(selector) {
    const text = String(selector).trim();
    if (!text) return [0, 0, 0];
    let best = [0, 0, 0];
    for (const part of splitArgs(text)) {
      const candidate = partSpecificity(part.trim());
      if (compareSpecificity(candidate, best) > 0) best = candidate;
    }
    return best;
  }

  function partSpecificity(text) {
    const result = [0, 0, 0];
    const rest = text.replace(/:is\(([^()]*)\)/g, (match, inner) => {
      const branch = specificity(inner);
      result[0] += branch[0];
      result[1] += branch[1];
      result[2] += branch[2];
      return " ";
    });
    const base = compoundSpecificity(rest);
    return [result[0] + base[0], result[1] + base[1], result[2] + base[2]];
  }

  function compareSpecificity(a, b) {
    for (let i = 0; i < 3; i += 1) {
      if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
    }
    return 0;
  }

  function matchesCompound(el, text) {
    let rest = text.trim();
    const tagMatch = rest.match(TAG_RE);
    if (tagMatch) {
      if (el.tag !== tagMatch[0].toLowerCase()) return false;
      rest = rest.slice(tagMatch[0].length);
    }
    const idMatch = rest.match(ID_RE);
    if (idMatch && el.id !== idMatch[1]) return false;
    const classes = [];
    let found;
    CLASS_RE.lastIndex = 0;
    while ((found = CLASS_RE.exec(rest))) classes.push(found[1]);
    for (const name of classes) {
      if (!el.classes.includes(name)) return false;
    }
    return true;
  }

  function matches(el, selector) {
    const text = String(selector).trim();
    for (const part of splitArgs(text)) {
      if (matchesPart(el, part.trim())) return true;
    }
    return false;
  }

  function matchesPart(el, text) {
    const groups = [];
    const rest = text.replace(/:is\(([^()]*)\)/g, (match, inner) => {
      groups.push(inner);
      return " ";
    });
    for (const inner of groups) {
      if (!matches(el, inner)) return false;
    }
    return matchesCompound(el, rest);
  }

  function hasInline(value) {
    return value != null && value !== "";
  }

  function resolve(rules, el, prop, inline, parentValues) {
    if (hasInline(inline && inline[prop])) return inline[prop];

    let best = null;
    let bestSpecificity = [0, 0, 0];
    for (const rule of rules) {
      if (rule.prop !== prop || !matches(el, rule.selector)) continue;
      const weight = specificity(rule.selector);
      const wins =
        !best ||
        compareSpecificity(weight, bestSpecificity) > 0 ||
        (compareSpecificity(weight, bestSpecificity) === 0 && rule.index > best.index);
      if (wins) {
        best = rule;
        bestSpecificity = weight;
      }
    }
    if (best) return best.value;

    if (INHERITED_PROPS[prop] && parentValues && hasInline(parentValues[prop])) {
      return parentValues[prop];
    }
    return "";
  }

  function computeTree(nodes, rules, props) {
    const byKey = Object.fromEntries(nodes.map((node) => [node.key, node]));
    const computed = {};

    function compute(key) {
      if (computed[key]) return computed[key];
      const node = byKey[key];
      const parent = node.parent ? compute(node.parent) : null;
      const values = {};
      for (const prop of props) {
        values[prop] = resolve(rules, node, prop, node.inline, parent);
      }
      computed[key] = values;
      return values;
    }

    for (const node of nodes) compute(node.key);
    return computed;
  }

  const api = {
    INHERITED_PROPS,
    specificity,
    compareSpecificity,
    matches,
    resolve,
    computeTree,
  };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    global.Cascade = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
