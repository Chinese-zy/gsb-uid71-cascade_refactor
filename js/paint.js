const scratch = document.createElement("div");

function serialized(prop, value) {
  if (!value) return "";
  scratch.style.cssText = "";
  scratch.style.setProperty(prop, value);
  return scratch.style.getPropertyValue(prop);
}

function applyStyles(el, values) {
  for (const prop of Object.keys(values)) {
    if (values[prop]) el.style.setProperty(prop, values[prop]);
  }
}

function readStyles(el, props) {
  const out = {};
  for (const prop of props) {
    out[prop] = el.style.getPropertyValue(prop);
  }
  return out;
}
