// Loads a preset from presets/. A preset with "extends" starts from that shared file
// (for example image-pattern.shared.json) and adds its own settings on top.

const getJson = (url) => fetch(url).then((r) => r.json());

export async function loadPreset(id, base = "presets") {
  const preset = await getJson(`${base}/${id}.json`);
  if (!preset.extends) return preset;
  const { $description, ...shared } = await loadPreset(preset.extends, base);
  return { ...shared, ...preset, settings: { ...shared.settings, ...preset.settings } };
}

export async function loadAllPresets(base = "presets") {
  const ids = await getJson(`${base}/index.json`);
  return Promise.all(ids.map((id) => loadPreset(id, base)));
}
