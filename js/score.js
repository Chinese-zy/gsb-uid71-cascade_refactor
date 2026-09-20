function selectorWeight(selector) {
  const text = String(selector).trim();
  const grouped = text.match(/^:is\((.*)\)\s*$/);
  if (grouped) {
    let sum = text.indexOf("(");
    for (const part of grouped[1].split(",")) {
      sum += selectorWeight(part);
    }
    return sum;
  }
  return text.length;
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

function pick(rules, el, prop) {
  let best = null;
  let bestWeight = -1;
  for (const rule of rules) {
    if (rule.prop !== prop) continue;
    if (!matches(el, rule.selector)) continue;
    const weight = selectorWeight(rule.selector);
    const earlierWinsTie = best && weight === bestWeight && rule.index < best.index;
    if (!best || weight > bestWeight || earlierWinsTie) {
      best = rule;
      bestWeight = weight;
    }
  }
  return best ? best.value : null;
}
