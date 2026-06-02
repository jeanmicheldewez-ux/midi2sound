# midi2sound

Browser sound engine for Web MIDI, synth tracks, presets and interactive music apps.

`midi2sound` is a reusable browser sound-engine project extracted from the Ultragear sound work. It demonstrates how `ultrasound.js` can run independently from the old ESP32 controller interface and can be reused by browser instruments, MIDI tools, gesture controllers, and interactive music apps.

## Live Demo

[Open the midi2sound demo](https://jeanmicheldewez-ux.github.io/midi2sound/)

<img width="703" height="455" alt="sh-md2snd" src="https://github.com/user-attachments/assets/498f8c36-76b3-4dbe-96f8-eafe6478723e" />

## Features

- Browser-based sound engine using the existing `ultrasound.js` library.
- Web MIDI support with graceful fallback when permission or browser support is unavailable.
- NexusUI piano demo.
- Computer keyboard note input: `A S D F G H J K`, with `W` / `X` octave changes.
- Multiple tracks and synths.
- Tone.js effects and generated sound controls.
- Preset/template JSON import and export.
- Reusable in other apps without ESP32 hardware.
- Relative paths for GitHub Pages.

## Run Locally

```bash
npx http-server -p 8080
```

Open:

```text
http://localhost:8080/
```

The root page links to the demo:

```text
http://localhost:8080/sound-demo.html
```

Using a local HTTP server is recommended because browser audio, Web MIDI, IndexedDB, and sample loading are more reliable than direct `file://` access.

## Use The Demo

1. Open `sound-demo.html`.
2. Click `Start Audio`.
3. Click `+` beside the instrument track selector.
4. Select a synth.
5. Play with the NexusUI piano, computer keyboard, or an external MIDI keyboard.
6. Click a generated track row to select the active instrument.
7. Open `Tracks / Sounds` to edit synth parameters and add effects.
8. Use export/import to save or reload a template JSON file.

## Integrate The Engine In Another App

Load the required browser libraries with relative paths:

```html
<script src="nexusUI.js"></script>
<script src="tone_15_04.js"></script>
<script src="ultrasound.js"></script>
```

`ultrasound.js` exposes a small compatibility facade:

```js
await UltraSoundEngine.start();
const trackIndex = UltraSoundEngine.createTrack('Synth');
UltraSoundEngine.setActiveTrack(trackIndex);
UltraSoundEngine.noteOn(60, trackIndex);
UltraSoundEngine.noteOff(60, trackIndex);
```

MIDI-style note handling:

```js
function onMidiMessage(message) {
  const [status, note, velocity] = message.data;
  const command = status & 0xf0;

  if (command === 0x90 && velocity > 0) {
    UltraSoundEngine.noteOn(note, UltraSoundEngine.getActiveTrack());
  } else if (command === 0x80 || command === 0x90) {
    UltraSoundEngine.noteOff(note, UltraSoundEngine.getActiveTrack());
  }
}
```

Template export/import:

```js
const template = UltraSoundEngine.exportTemplate();
UltraSoundEngine.importTemplate(template);
```

See [docs/API.md](docs/API.md), [docs/INTEGRATION.md](docs/INTEGRATION.md), and [docs/PRESET_TEMPLATE_FORMAT.md](docs/PRESET_TEMPLATE_FORMAT.md).

## Relation To Other Projects

This project is intended to provide a shared browser sound engine for:

- ESP32 Ultrasonic MIDI Controller / Ultragear
- Midiboy
- BOW
- Dancing5
- WATTOO

The goal is to avoid duplicating synth, note, MIDI, effect, and preset logic across those projects.

## What Is Not Included

- ESP32 firmware.
- Hardware-specific controller UI.
- Old Ultragear preset manager as the public project focus.
- Production packaging or a build system.

Some old Ultragear-related files may still be present while the reusable sound engine is being isolated.

## Portfolio Note

`midi2sound` is also a portfolio project: it documents the process of extracting a reusable browser sound engine from a hardware-controller app and preparing it for public demos, Web MIDI experiments, and future creative music tools.

## Roadmap

- Stabilize a clean public API for `ultrasound.js`.
- Separate engine logic from generated UI dependencies.
- Define a stable preset/template schema.
- Add more examples for external apps and controllers.
- Add GitHub Pages demo validation.
- Prepare integrations for Midiboy, Ultragear, BOW, Dancing5, and WATTOO.

See [docs/ROADMAP.md](docs/ROADMAP.md).

## License

License placeholder. Add the final license before a production public release.
