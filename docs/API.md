# API

`ultrasound.js` exposes a compatibility facade:

```js
window.UltraSoundEngine
```

The facade is intentionally small. It wraps the existing working library without rewriting it.

## Start Audio

```js
await UltraSoundEngine.start();
```

Starts Tone.js after a browser user gesture and enables the sound path. Browsers require audio to start from a click/tap.

## Enable Or Disable Sound

```js
UltraSoundEngine.setEnabled(true);
UltraSoundEngine.setEnabled(false);
```

## Tracks

Create one track:

```js
const trackIndex = UltraSoundEngine.createTrack('Synth');
```

Create multiple tracks:

```js
UltraSoundEngine.ensureTracks(3, ['Synth', 'FMSynth', 'MonoSynth']);
```

Select a track:

```js
UltraSoundEngine.setActiveTrack(1);
const active = UltraSoundEngine.getActiveTrack();
```

List tracks:

```js
const tracks = UltraSoundEngine.getTracks();
```

Track objects returned by the facade are summaries:

```js
{
  index: 0,
  tone: "Synth",
  effects: ["Filter"],
  volume: 0.8,
  sample: null
}
```

## Notes

Play by MIDI note number:

```js
UltraSoundEngine.noteOn(60, 0);
UltraSoundEngine.noteOff(60, 0);
```

Play by note name:

```js
UltraSoundEngine.noteOn('C4', 0);
UltraSoundEngine.noteOff('C4', 0);
```

Helpers:

```js
UltraSoundEngine.getNoteName(60); // "C4"
UltraSoundEngine.getMidiNote('C4'); // 60
```

## MIDI Message Handling

You can dispatch MIDI bytes:

```js
UltraSoundEngine.handleMidiMessage(status, data1, data2);
```

For custom apps, direct `noteOn()` / `noteOff()` calls are often clearer than passing raw MIDI bytes.

### Existing FX CC Mapping

Control change messages are mapped to generated FX controls by CC number:

```text
CC10 -> FX 1, control 1
CC11 -> FX 1, control 2
CC12 -> FX 1, control 3
CC20 -> FX 2, control 1
CC21 -> FX 2, control 2
CC22 -> FX 2, control 3
```

The MIDI channel selects the track because the legacy function computes:

```js
trackIndex = status - 176;      // 0xB0 => track 0
fxIndex = Math.floor(cc / 10) - 1;
controlIndex = cc % 10;
```

Example:

```js
// MIDI channel 1, CC20, value 96:
// controls track 0, FX 2, first generated FX control.
UltraSoundEngine.handleMidiMessage(0xb0, 20, 96);
```

## Volume

Master output:

```js
UltraSoundEngine.setMasterVolume(-6);
```

Track volume:

```js
UltraSoundEngine.setTrackVolume(0, -3);
```

Values are in decibels.

## Templates

Export:

```js
const template = UltraSoundEngine.exportTemplate();
```

Import:

```js
UltraSoundEngine.importTemplate(template);
```

The current template is still based on the native `ultrasound.js` track extraction format. See `PRESET_TEMPLATE_FORMAT.md`.

## State

```js
const state = UltraSoundEngine.getState();
```

Example:

```js
{
  soundInit: true,
  soundEnabled: true,
  activeTrack: 0,
  trackCount: 1
}
```

## Current Limitations

- `ultrasound.js` is not yet an ES module.
- Some generated controls still depend on NexusUI DOM containers.
- Preset data is not yet schema-validated.
- Effects are added through existing engine UI/functions, not a complete new public effect API.
