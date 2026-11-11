// Loads a preset from presets/. A preset with "extends" starts from that shared file
// (for example mesh-pattern.shared.json) and adds its own settings on top. Generative
// presets list only the Pattern Studio settings they change, so "engine" is merged
// key by key too. A preset with "layers" also loads those presets, drawn on top.

const getJson = (url) => fetch(url).then((r) => r.json());

export async function loadPreset(id, base = "presets") {
  let preset = await getJson(`${base}/${id}.json`);
  if (preset.extends) {
    const { $description, ...shared } = await loadPreset(preset.extends, base);
    preset = { ...shared, ...preset, settings: mergeSettings(shared.settings, preset.settings) };
  }
  if (preset.layers) preset = { ...preset, layers: await Promise.all(preset.layers.map((layer) => loadPreset(layer, base))) };
  return preset;
}

export function mergeSettings(shared = {}, own = {}) {
  const settings = { ...shared, ...own };
  if (shared.engine || own.engine) settings.engine = { ...shared.engine, ...own.engine };
  return settings;
}

export async function loadAllPresets(base = "presets") {
  const ids = await getJson(`${base}/index.json`);
  return Promise.all(ids.map((id) => loadPreset(id, base)));
}
