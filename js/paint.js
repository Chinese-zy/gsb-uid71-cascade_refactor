const PAINT_INHERIT = { color: true, "font-size": true };

function painted(rules, el, prop, inline, parentPainted) {
  if (inline && inline[prop] != null && inline[prop] !== "") return inline[prop];
  for (const rule of rules) {
    if (rule.prop !== prop) continue;
    if (matches(el, rule.selector)) return rule.value;
  }
  if (PAINT_INHERIT[prop] && parentPainted && parentPainted[prop] != null) {
    return parentPainted[prop];
  }
  return "";
}
