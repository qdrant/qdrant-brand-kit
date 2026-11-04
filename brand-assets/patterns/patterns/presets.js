// Loads a preset from presets/. A preset with "extends" starts from that shared file
// (for example mesh-pattern.shared.json) and adds its own settings on top. Generative
// presets list only the Pattern Studio settings they change, so "engine" is merged
// key by key too.

const getJson = (url) => fetch(url).then((r) => r.json());

export async function loadPreset(id, base = "presets") {
  const preset = await getJson(`${base}/${id}.json`);
  if (!preset.extends) return preset;
  const { $description, ...shared } = await loadPreset(preset.extends, base);
  return { ...shared, ...preset, settings: mergeSettings(shared.settings, preset.settings) };
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
