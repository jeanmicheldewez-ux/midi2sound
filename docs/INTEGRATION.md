# Integration

This document explains how another browser app can reuse the sound engine.

## Minimal HTML

```html
<script src="nexusUI.js"></script>
<script src="tone_15_04.js"></script>
<script src="ultrasound.js"></script>
```

Keep paths relative for GitHub Pages and other static hosts.

## Required DOM Compatibility

The current `ultrasound.js` generated controls still expect a few DOM containers when creating tracks and effects:

```html
<input type="checkbox" id="soundon">
<div id="sound"></div>
<div id="mytracks"></div>
<div id="menuSynth"></div>
<div id="menuFX"></div>
<div id="samplepage"></div>
```

The standalone demo provides those elements and then uses its own cleaner UI around them.

Future work should make track creation DOM-independent.

## Basic Integration Flow

```js
await UltraSoundEngine.start();

const lead = UltraSoundEngine.createTrack('Synth');
UltraSoundEngine.setActiveTrack(lead);

UltraSoundEngine.noteOn(60, lead);
UltraSoundEngine.noteOff(60, lead);
```

## Track Selection

Use the selected track for all input sources:

```js
let activeTrack = 0;

function selectTrack(index) {
  activeTrack = index;
  UltraSoundEngine.setActiveTrack(index);
}
```

## Input Sources

Any input source can call the same note API:

- Web MIDI keyboard
- computer keyboard
- touch piano
- ultrasonic controller
- game controller
- gesture sensor

Example:

```js
function triggerFromController(midiNote, pressed) {
  if (pressed) {
    UltraSoundEngine.noteOn(midiNote, activeTrack);
  } else {
    UltraSoundEngine.noteOff(midiNote, activeTrack);
  }
}
```

## Mapping Hardware CC To FX

The existing engine supports CC-to-FX mapping. This is useful for hardware controllers:

```text
CC10 -> first FX, first dial/control
CC11 -> first FX, second dial/control
CC20 -> second FX, first dial/control
CC21 -> second FX, second dial/control
```

Forward raw MIDI CC messages to the engine:

```js
function onControlChange(status, ccNumber, ccValue) {
  UltraSoundEngine.handleMidiMessage(status, ccNumber, ccValue);
}
```

For MIDI channel 1:

```js
UltraSoundEngine.handleMidiMessage(0xb0, 10, 64);
```

This controls track 1, FX 1, control 1.

## Reusing In Ultragear And Midiboy

Ultragear and Midiboy should eventually call the same facade:

- create tracks once
- select active track from app state
- map incoming controller events to `noteOn()` / `noteOff()`
- use shared template JSON
- avoid duplicating synth/effect logic

## Reusing In BOW, Dancing5, And WATTOO

Those apps can implement their own input adapters and visual UI, then call the shared engine API:

```js
UltraSoundEngine.setActiveTrack(track);
UltraSoundEngine.noteOn(note, track);
UltraSoundEngine.noteOff(note, track);
```

The sound layer should remain shared even if the controller UI differs.
