# Web MIDI

The demo supports Web MIDI input when the browser allows it.

## Browser Support

Web MIDI availability depends on browser and permissions. Chromium-based browsers usually support it. If Web MIDI is unavailable or permission is denied, the demo logs a graceful error and still works with the NexusUI piano and computer keyboard.

## Permission Flow

The demo calls:

```js
const midiAccess = await navigator.requestMIDIAccess();
```

This must happen in a browser context that allows MIDI permissions. GitHub Pages can request MIDI, but the user must approve access.

## Input Listing

After access is granted:

```js
for (const input of midiAccess.inputs.values()) {
  input.onmidimessage = handleMidiMessage;
}
```

The demo populates a MIDI input selector. It can listen to all inputs or one selected input.

## Note Mapping

MIDI note on:

```js
command === 0x90 && velocity > 0
```

MIDI note off:

```js
command === 0x80 || (command === 0x90 && velocity === 0)
```

The demo maps these to:

```js
UltraSoundEngine.noteOn(note, activeTrack);
UltraSoundEngine.noteOff(note, activeTrack);
```

## Control Change Mapping

`ultrasound.js` keeps the existing Ultragear-style FX CC mapping:

```text
CC10 = track channel, FX 1, control 1
CC11 = track channel, FX 1, control 2
CC12 = track channel, FX 1, control 3

CC20 = track channel, FX 2, control 1
CC21 = track channel, FX 2, control 2
CC22 = track channel, FX 2, control 3
```

In code, the mapping is:

```js
fxIndex = Math.floor(ccNumber / 10) - 1;
controlIndex = ccNumber % 10;
```

MIDI channel selects the track:

```text
status 176 / 0xB0 = track 1
status 177 / 0xB1 = track 2
status 178 / 0xB2 = track 3
```

The incoming CC value `0..127` is mapped to the min/max range of the generated NexusUI FX control.

The demo forwards MIDI CC messages to:

```js
UltraSoundEngine.handleMidiMessage(status, ccNumber, ccValue);
```

## Track Selection

MIDI notes play the currently selected track:

```js
const activeTrack = UltraSoundEngine.getActiveTrack();
```

The active track can be changed by the selector or by clicking a generated track row in the Tracks / Sounds page.

## Future MIDI Work

- MIDI channel-to-track mapping.
- A clearer public CC API in addition to the existing FX CC mapping.
- Pitch bend and aftertouch examples.
- Device reconnect handling.
- Optional MIDI output support.
