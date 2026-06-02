# API Notes

`ultrasound.js` did not originally expose a clean public API. This task adds a minimal compatibility facade at the end of the file:

```js
window.UltraSoundEngine
```

The original functions and data remain in place.

## Detected Existing Functions

- `initTone()`: starts Tone.js.
- `ensureDefaultSample()`: loads the default sample into IndexedDB if needed.
- `plusTrack()`: creates a track and original NexusUI controls.
- `addOsc(type, sample)`: creates a Tone.js synth or player on the active track.
- `addFX(type)`: adds an effect to the active track.
- `getMidiNote(noteName)`: converts note names such as `C4` to MIDI numbers.
- `getNoteName(midiNumber)`: converts MIDI numbers to note names.
- `handleNoteOn(midiNumber)` / `handleNoteOff(midiNumber)`: monophonic helper handling.
- `midiSound(status, data1, data2)`: MIDI note, CC, and bend dispatch.
- `soundBend(status, data1, data2)`: pitch bend handling.
- `noteOn(note, track)` / `noteOff(note, track)`: direct sound triggering.
- `saveSounds()`, `loadSound(name)`, `fillSounds(preset)`, `extractTrackParams(track)`: preset handling.
- `flipSoundOn(enabled)`: enables or disables the sound path.

## Added Facade Methods

- `UltraSoundEngine.start()`
- `UltraSoundEngine.setEnabled(enabled)`
- `UltraSoundEngine.ensureTracks(count, synthTypes)`
- `UltraSoundEngine.createTrack(synthType)`
- `UltraSoundEngine.setActiveTrack(index)`
- `UltraSoundEngine.getActiveTrack()`
- `UltraSoundEngine.getTrack(index)`
- `UltraSoundEngine.getTracks()`
- `UltraSoundEngine.noteOn(noteOrMidi, trackIndex)`
- `UltraSoundEngine.noteOff(noteOrMidi, trackIndex)`
- `UltraSoundEngine.handleMidiMessage(status, data1, data2)`
- `UltraSoundEngine.setMasterVolume(db)`
- `UltraSoundEngine.setTrackVolume(trackIndex, db)`
- `UltraSoundEngine.exportTemplate()`
- `UltraSoundEngine.importTemplate(template)`
- `UltraSoundEngine.getNoteName(midiNumber)`
- `UltraSoundEngine.getMidiNote(noteName)`
- `UltraSoundEngine.getState()`

## How The Demo Calls The Engine

`sound-demo.js` calls `ensureTracks()` to create four demo synth tracks, then uses `setActiveTrack()`, `noteOn()`, and `noteOff()` for NexusUI piano, computer keyboard, and Web MIDI input.

Export calls `exportTemplate()` and wraps the native track array in a small metadata object. Import accepts either that wrapper object or a raw track array and passes it to `importTemplate()`.

## Missing API To Add Later

- DOM-free track creation.
- A stable `createEngine()` factory instead of browser globals.
- Explicit track synth replacement.
- Effect add/remove/update methods that do not depend on NexusUI controls.
- Preset schema validation and migration.
- Polyphonic note handling policy per track.
- Better sampler API for loading and slicing samples.
