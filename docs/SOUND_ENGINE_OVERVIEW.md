# Sound Engine Overview

`midi2sound` centers on the existing browser sound library `ultrasound.js`. The library was originally used inside Ultragear, an ESP32 ultrasonic MIDI controller app, but the standalone demo proves that the sound engine can run without ESP32 hardware or the old controller UI.

## Main Files

- `ultrasound.js`: sound engine, track creation, synth creation, effect creation, note triggering, preset extraction/import, and the `UltraSoundEngine` facade.
- `sound-demo.html`: standalone demo page.
- `sound-demo.js`: demo-only adapter for UI, NexusUI piano, Web MIDI, keyboard input, track selection, and import/export.
- `tone_15_04.js`: local Tone.js build.
- `nexusUI.js`: local NexusUI build.
- `ultra.css`: existing generated synth/effect control styling reused by the demo.

## Engine Structure

`ultrasound.js` currently runs as a browser script rather than a module. It keeps internal state in file-scoped variables:

- `tracks`: generated track objects.
- `trackCount`: number of created tracks.
- `actualTrack`: active track index.
- `soundInit`: whether Tone.js was started.
- `flagSoundOn`: whether sound handling is enabled.
- `CC`: MIDI CC mapping metadata.
- `osc`: NexusUI oscilloscope widgets.

The sound engine exposes a small public facade:

```js
window.UltraSoundEngine
```

This facade avoids requiring other apps to call every legacy global directly.

## Tracks

Each track contains:

- a Tone.js synth/player in `track.tones`
- an ordered effect chain in `track.fx`
- generated NexusUI synth controls in `track.nexus`
- generated NexusUI effect controls in `track.nexusFX`
- a NexusUI volume widget in `track.vol`
- sample metadata for `Player`/`Looper`

The demo creates a track when the user selects an instrument from the full-page chooser.

## Synths And Effects

Detected synth/player types:

- `Synth`
- `AMSynth`
- `FMSynth`
- `DuoSynth`
- `MonoSynth`
- `MembraneSynth`
- `MetalSynth`
- `NoiseSynth`
- `PluckSynth`
- `Player` / Looper

Effects are Tone.js effect nodes such as `Filter`, `AutoFilter`, `FeedbackDelay`, `Reverb`, `PingPongDelay`, `Chorus`, `Phaser`, `EQ3`, `Compressor`, `Limiter`, `Tremolo`, and others exposed by the existing library.

## Note Triggering

The normal note path is:

1. Select the active track.
2. Convert a MIDI note number to a note name if needed.
3. Call `noteOn(note, trackIndex)`.
4. Call `noteOff(note, trackIndex)`.

The facade supports both MIDI note numbers and note names:

```js
UltraSoundEngine.noteOn(60, 0);   // C4 on track 0
UltraSoundEngine.noteOff(60, 0);
UltraSoundEngine.noteOn('C4', 0);
UltraSoundEngine.noteOff('C4', 0);
```

## MIDI CC And FX Control

The existing library also maps MIDI control changes to generated FX controls. The CC number encodes the FX slot and the control index:

```text
CC10 = FX 1, control 1
CC11 = FX 1, control 2
CC20 = FX 2, control 1
CC21 = FX 2, control 2
```

The MIDI channel maps to the track index. For example, `0xB0` controls track 1, `0xB1` controls track 2, and so on.

This behavior is kept because it was already part of the existing Ultragear sound code and is useful for hardware controllers.

## Demo Flow

`sound-demo.js` does not rewrite the engine. It adapts the existing engine to a clean standalone demo:

- starts audio after a user gesture
- creates tracks through `UltraSoundEngine.createTrack()`
- selects tracks through `UltraSoundEngine.setActiveTrack()`
- plays notes from NexusUI, keyboard, and Web MIDI
- logs status/errors
- exports/imports current engine templates

## Reuse

The reusable pieces are:

- browser audio start flow
- track and synth creation
- note on/off playback
- Web MIDI mapping
- generated synth/effect controls
- template import/export

Future integrations can use this engine for Ultragear, Midiboy, BOW, Dancing5, and WATTOO instead of duplicating sound logic.
