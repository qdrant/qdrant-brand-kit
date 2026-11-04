// Library flow: how new Design Lab library images become mesh patterns.
//
// When an image is approved in the library:
//   1. canUseImage(info, rule)  -> is it allowed as a pattern source?
//   2. meshesForImage(...)      -> one mesh per look, saved with the image
// Every mesh pattern can then use the image, at any size. The image isn't needed again.
//
// The rule lives in presets/mesh-pattern.shared.json ("source"), so it can change
// without touching code.

import { imageToMesh } from "./mesh-source.js";

// info = the image's library details:
//   { assetType: "image" | "mascot" | "event", approved: true, moodboard: "Default",
//     title: "…", prompt: "…" }
// rule = preset.source from any mesh pattern.
// Returns { allowed, reasons }: reasons lists every rule the image breaks.
export function canUseImage(info, rule) {
  const filter = rule.filter;
  const reasons = [];
  if (info.assetType !== filter.assetType) reasons.push(`asset type is "${info.assetType}", needs "${filter.assetType}" (no mascot or Luma/event images)`);
  if (filter.approvedOnly && !info.approved) reasons.push("not design-approved");
  if (filter.moodboard && info.moodboard !== filter.moodboard) reasons.push(`moodboard is "${info.moodboard}", needs "${filter.moodboard}"`);
  const text = `${info.title ?? ""} ${info.prompt ?? ""}`.toLowerCase();
  for (const word of filter.excludePromptWords ?? []) {
    if (new RegExp(`\\b${word}`, "i").test(text)) reasons.push(`title or prompt mentions "${word}"`);
  }
  return { allowed: reasons.length === 0, reasons };
}

// Makes every mesh an image needs: one per meshGroup (look) used by the patterns,
// for example { "mesh-pattern": {...}, "mesh-dithered-pattern": {...} }.
// image = a loaded <img> or ImageBitmap. patterns = loadPatterns(). Save the result
// with the image in the library (about 3.5 KB per mesh); the PNG isn't needed for
// patterns after this.
export function meshesForImage(image, tokens, patterns) {
  const meshes = {};
  for (const preset of patterns) {
    if (!preset.meshGroup || meshes[preset.meshGroup]) continue;
    meshes[preset.meshGroup] = { group: preset.meshGroup, ...imageToMesh(image, tokens, preset.settings) };
  }
  return meshes;
}
