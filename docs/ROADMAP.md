# Roadmap

## Public API

- Keep `UltraSoundEngine` as the short-term compatibility facade.
- Move toward a cleaner module/factory API.
- Add stable methods for synth replacement, effect add/remove, and sample loading.
- Reduce direct dependency on generated DOM controls.

## Presets

- Define a stable template JSON schema.
- Add validation and migration.
- Keep compatibility with existing `ultrasound.js` extracted presets.
- Add sample presets for the public demo.

## Web MIDI

- Add channel-to-track mapping.
- Add CC mapping through the public API.
- Add pitch bend examples.
- Improve reconnect behavior.

## GitHub Pages

- Keep all paths relative.
- Add public demo smoke-test notes.
- Add small example templates.

## Project Integrations

- Ultragear: reuse the shared engine instead of embedding controller-specific sound logic.
- Midiboy: use the same note and template API.
- BOW: add an input adapter for bow/gesture events.
- Dancing5: map motion or performance events to the shared engine.
- WATTOO: reuse browser synth and template logic.

## Code Cleanup

- Identify old Ultragear controller-specific files.
- Keep the working demo stable during cleanup.
- Avoid heavy build tooling unless it clearly helps.
