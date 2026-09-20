function inherited(parentValues) {
  const out = {};
  if (!parentValues) return out;
  for (const key of Object.keys(parentValues)) out[key] = parentValues[key];
  return out;
}
