function applyInline(computed, inline) {
  const out = Object.assign({}, computed);
  const extra = inline || {};
  for (const key of Object.keys(extra)) {
    if (out[key] == null || out[key] === "") out[key] = extra[key];
  }
  return out;
}
