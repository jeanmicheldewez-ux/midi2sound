(function () {
  'use strict';

  const synthTypes = [
    'AMSynth',
    'Synth',
    'DuoSynth',
    'FMSynth',
    'MembraneSynth',
    'MetalSynth',
    'MonoSynth',
    'NoiseSynth',
    'PluckSynth',
    'Player'
  ];
  const state = {
    piano: null,
    midiAccess: null,
    selectedInputId: '',
    activeTrack: 0,
    pressedKeys: new Map(),
    baseOctave: 4
  };

  const els = {};

  document.addEventListener('DOMContentLoaded', initDemo);

  function initDemo() {
    cacheElements();
    installHandlers();
    setupEngineTracks();
    setupPiano();
    setMasterVolume(Number(els.masterVolume.value));
    log('Demo loaded. Click Start Audio before playing notes.');
  }

  function cacheElements() {
    els.startAudio = document.getElementById('startAudio');
    els.trackSelect = document.getElementById('trackSelect');
    els.midiInput = document.getElementById('midiInput');
    els.enableMidi = document.getElementById('enableMidi');
    els.addTrack = document.getElementById('addTrack');
    els.plustrack = document.getElementById('plustrack');
    els.toggleTracksPage = document.getElementById('toggleTracksPage');
    els.closeTracksPage = document.getElementById('closeTracksPage');
    els.tracksPage = document.getElementById('tracksPage');
    els.instrumentChooser = document.getElementById('instrumentChooser');
    els.closeInstrumentChooser = document.getElementById('closeInstrumentChooser');
    els.instrumentGrid = document.getElementById('instrumentGrid');
    els.mytracks = document.getElementById('mytracks');
    els.masterVolume = document.getElementById('masterVolume');
    els.trackVolume = document.getElementById('trackVolume');
    els.exportTemplate = document.getElementById('exportTemplate');
    els.importTemplate = document.getElementById('importTemplate');
    els.templateFile = document.getElementById('templateFile');
    els.log = document.getElementById('log');
  }

  function installHandlers() {
    els.startAudio.addEventListener('click', startAudio);
    els.enableMidi.addEventListener('click', enableMidi);
    els.addTrack.addEventListener('click', openInstrumentChooser);
    els.plustrack.addEventListener('click', openInstrumentChooser);
    els.toggleTracksPage.addEventListener('click', toggleTracksPage);
    els.closeTracksPage.addEventListener('click', closeTracksPage);
    els.closeInstrumentChooser.addEventListener('click', closeInstrumentChooser);
    els.mytracks.addEventListener('pointerdown', handleGeneratedTrackPointerDown, true);
    els.trackSelect.addEventListener('change', event => selectTrack(Number(event.target.value)));
    els.midiInput.addEventListener('change', event => selectMidiInput(event.target.value));
    els.masterVolume.addEventListener('input', event => setMasterVolume(Number(event.target.value)));
    els.trackVolume.addEventListener('input', event => setTrackVolume(Number(event.target.value)));
    els.exportTemplate.addEventListener('click', exportTemplate);
    els.importTemplate.addEventListener('click', () => els.templateFile.click());
    els.templateFile.addEventListener('change', importTemplateFromFile);
    document.addEventListener('keydown', handleComputerKeyDown, true);
    document.addEventListener('keyup', handleComputerKeyUp, true);
  }

  function setupEngineTracks() {
    const engine = getEngine();
    if (!engine) {
      log('Error: ultrasound.js did not expose window.UltraSoundEngine.');
      return;
    }

    renderTrackOptions();
    renderInstrumentChooser();
  }

  function renderTrackOptions() {
    els.trackSelect.innerHTML = '';
    const tracks = getEngine().getTracks();

    if (tracks.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No tracks yet';
      els.trackSelect.appendChild(option);
      return;
    }

    tracks.forEach(track => {
      const option = document.createElement('option');
      option.value = String(track.index);
      option.textContent = `Track ${track.index + 1}: ${track.tone || 'empty'}`;
      els.trackSelect.appendChild(option);
    });
  }

  function renderInstrumentChooser() {
    els.instrumentGrid.innerHTML = '';
    synthTypes.forEach(synthType => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = synthType === 'Player' ? 'Looper' : synthType;
      button.addEventListener('click', () => createTrackFromInstrument(synthType));
      els.instrumentGrid.appendChild(button);
    });

    document.querySelectorAll('#menuSynth [data-synth]').forEach(item => {
      item.addEventListener('click', event => {
        event.stopPropagation();
        createTrackFromInstrument(item.dataset.synth);
      });
    });
  }

  function createTrackFromInstrument(synthType) {
    const engine = getEngine();
    if (!engine) return log('Error: sound engine unavailable.');

    try {
      const index = engine.createTrack(synthType);
      renderTrackOptions();
      annotateGeneratedTracks();
      selectTrack(index);
      closeInstrumentChooser();
      openTracksPage();
      log(`Added track ${index + 1}: ${synthType === 'Player' ? 'Looper' : synthType}`);
    } catch (error) {
      log('Add track error: ' + error.message);
    }
  }

  function setupPiano() {
    if (!window.Nexus || !Nexus.Piano) {
      log('Error: NexusUI piano is not available.');
      return;
    }

    state.piano = new Nexus.Piano('#piano', {
      size: [document.getElementById('piano').clientWidth, 120],
      mode: 'button',
      lowNote: 48,
      highNote: 84
    });
    state.piano.colorize('accent', '#ff7a18');
    colorPianoKeys();

    state.piano.on('change', value => {
      if (value.state) {
        playMidiNote(value.note, 'NexusUI');
      } else {
        stopMidiNote(value.note, 'NexusUI');
      }
    });

    window.addEventListener('resize', resizePiano);
    log('NexusUI piano ready.');
  }

  function resizePiano() {
    if (!state.piano || typeof state.piano.resize !== 'function') return;
    state.piano.resize(document.getElementById('piano').clientWidth, 120);
    colorPianoKeys();
  }

  function colorPianoKeys() {
    if (!state.piano || !Array.isArray(state.piano.keys)) return;

    state.piano.keys.forEach(key => {
      key.colors.w = '#ffffff';
      key.colors.b = '#000000';
      key.colors.accent = '#ff7a18';
      key.render();
    });
  }

  async function startAudio() {
    const engine = getEngine();
    if (!engine) return log('Error: sound engine unavailable.');

    try {
      await engine.start();
      setMasterVolume(Number(els.masterVolume.value));
      setTrackVolume(Number(els.trackVolume.value));
      els.startAudio.hidden = true;
      log('Audio started.');
    } catch (error) {
      log('Audio start error: ' + error.message);
    }
  }

  function selectTrack(index) {
    if (!Number.isInteger(index)) return;
    try {
      const track = getEngine().setActiveTrack(index);
      state.activeTrack = index;
      els.trackSelect.value = String(index);
      log(`Selected track ${index + 1}: ${track.tone || 'empty'}`);
    } catch (error) {
      log('Track selection error: ' + error.message);
    }
  }

  function handleGeneratedTrackPointerDown(event) {
    const trackElement = event.target.closest('.onetrack');
    if (!trackElement || !els.mytracks.contains(trackElement)) return;

    const match = trackElement.id.match(/^track-(\d+)$/);
    if (!match) return;

    const index = Number(match[1]);
    if (index !== state.activeTrack) {
      selectTrack(index);
    }
  }

  function playMidiNote(midiNote, source) {
    if (getEngine().getTracks().length === 0) {
      log(`${source} note ignored: add an instrument track first.`);
      return;
    }

    try {
      getEngine().noteOn(midiNote, state.activeTrack);
      log(`${source} note on: ${getEngine().getNoteName(midiNote)} on track ${state.activeTrack + 1}`);
    } catch (error) {
      log('Note on error: ' + error.message);
    }
  }

  function stopMidiNote(midiNote, source) {
    if (getEngine().getTracks().length === 0) return;

    try {
      getEngine().noteOff(midiNote, state.activeTrack);
      log(`${source} note off: ${getEngine().getNoteName(midiNote)} on track ${state.activeTrack + 1}`);
    } catch (error) {
      log('Note off error: ' + error.message);
    }
  }

  function handleComputerKeyDown(event) {
    if (event.repeat || isTypingTarget(event.target)) return;

    const key = event.key.toLowerCase();
    if (key === 'w' || key === 'x') {
      event.stopImmediatePropagation();
      state.baseOctave = Math.max(1, Math.min(7, state.baseOctave + (key === 'x' ? 1 : -1)));
      log('Keyboard octave: ' + state.baseOctave);
      return;
    }

    const note = keyMap()[key];
    if (!note || state.pressedKeys.has(key)) return;

    const midiNote = getEngine().getMidiNote(note + state.baseOctave);
    state.pressedKeys.set(key, midiNote);
    playMidiNote(midiNote, 'Keyboard');
    event.stopImmediatePropagation();
    event.preventDefault();
  }

  function handleComputerKeyUp(event) {
    const key = event.key.toLowerCase();
    if (!state.pressedKeys.has(key)) return;
    const midiNote = state.pressedKeys.get(key);
    state.pressedKeys.delete(key);
    stopMidiNote(midiNote, 'Keyboard');
    event.stopImmediatePropagation();
    event.preventDefault();
  }

  function keyMap() {
    return {
      a: 'C',
      s: 'D',
      d: 'E',
      f: 'F',
      g: 'G',
      h: 'A',
      j: 'B',
      k: 'C'
    };
  }

  async function enableMidi() {
    if (!navigator.requestMIDIAccess) {
      log('Web MIDI is not supported by this browser.');
      return;
    }

    try {
      state.midiAccess = await navigator.requestMIDIAccess();
      state.midiAccess.onstatechange = refreshMidiInputs;
      refreshMidiInputs();
      log('MIDI enabled.');
    } catch (error) {
      log('MIDI access failed: ' + error.message);
    }
  }

  function refreshMidiInputs() {
    els.midiInput.innerHTML = '<option value="">All MIDI inputs</option>';
    for (const input of state.midiAccess.inputs.values()) {
      const option = document.createElement('option');
      option.value = input.id;
      option.textContent = input.name || input.id;
      els.midiInput.appendChild(option);
      input.onmidimessage = handleMidiMessage;
    }
    els.midiInput.value = state.selectedInputId;
    log('MIDI inputs found: ' + state.midiAccess.inputs.size);
  }

  function selectMidiInput(inputId) {
    state.selectedInputId = inputId;
    log(inputId ? 'Selected MIDI input: ' + inputId : 'Listening to all MIDI inputs.');
  }

  function handleMidiMessage(event) {
    if (state.selectedInputId && event.currentTarget.id !== state.selectedInputId) return;

    const [status, note, velocity] = event.data;
    const command = status & 0xf0;

    if (command === 0x90 && velocity > 0) {
      playMidiNote(note, 'MIDI');
    } else if (command === 0x80 || command === 0x90) {
      stopMidiNote(note, 'MIDI');
    } else if (command === 0xb0 || command === 0xe0) {
      getEngine().handleMidiMessage(status, note, velocity);
      log(`MIDI ${command === 0xb0 ? 'CC' : 'bend'}: ${note} value ${velocity}`);
    }
  }

  function setMasterVolume(db) {
    const engine = getEngine();
    if (engine && typeof engine.setMasterVolume === 'function') {
      engine.setMasterVolume(db);
      log('Master volume: ' + db + ' dB');
    }
  }

  function setTrackVolume(db) {
    const engine = getEngine();
    if (engine && engine.setTrackVolume(state.activeTrack, db)) {
      const value = document.getElementById(`valu-${state.activeTrack}`);
      if (value) value.textContent = Number(db).toFixed(1);
      log(`Track ${state.activeTrack + 1} volume: ${db} dB`);
    }
  }

  function openInstrumentChooser() {
    els.instrumentChooser.classList.add('is-open');
    setModalScrollLock();
  }

  function closeInstrumentChooser() {
    els.instrumentChooser.classList.remove('is-open');
    setModalScrollLock();
  }

  function openTracksPage() {
    els.tracksPage.classList.add('is-open');
    els.toggleTracksPage.textContent = 'Hide Tracks / Sounds';
    setModalScrollLock();
  }

  function closeTracksPage() {
    els.tracksPage.classList.remove('is-open');
    els.toggleTracksPage.textContent = 'Show Tracks / Sounds';
    setModalScrollLock();
  }

  function toggleTracksPage() {
    if (els.tracksPage.classList.contains('is-open')) {
      closeTracksPage();
    } else {
      openTracksPage();
    }
  }

  function exportTemplate() {
    try {
      const payload = {
        format: 'midi2sound-template-v1',
        exportedAt: new Date().toISOString(),
        engine: 'ultrasound.js',
        tracks: getEngine().exportTemplate()
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'midi2sound-template.json';
      link.click();
      URL.revokeObjectURL(url);
      log('Exported current template JSON.');
    } catch (error) {
      log('Export error: ' + error.message);
    }
  }

  async function importTemplateFromFile(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;

    try {
      const data = JSON.parse(await file.text());
      const tracks = Array.isArray(data) ? data : data.tracks;
      getEngine().importTemplate(tracks);
      renderTrackOptions();
      annotateGeneratedTracks();
      if (getEngine().getTracks().length > 0) {
        selectTrack(0);
        log('Imported template JSON.');
      } else {
        renderTrackOptions();
        annotateGeneratedTracks();
        log('Imported empty template JSON.');
      }
    } catch (error) {
      log('Import error: ' + error.message);
    }
  }

  function getEngine() {
    return window.UltraSoundEngine || null;
  }

  function annotateGeneratedTracks() {
    const engine = getEngine();
    if (!engine) return;

    engine.getTracks().forEach(track => {
      const trackElement = document.getElementById(`track-${track.index}`);
      if (!trackElement) return;

      const synthName = track.tone === 'Player' ? 'Looper' : track.tone || 'empty';
      const oldTitle = trackElement.querySelector('.demo-track-title');
      if (oldTitle) oldTitle.remove();

      const synthLabel = trackElement.querySelector('.trackosc > .target > .labelfx2');
      if (synthLabel) {
        synthLabel.innerHTML = `<span class="channel">${track.index + 1}</span> ${synthName}`;
      }

      const value = document.getElementById(`valu-${track.index}`);
      if (value && !value.textContent.trim()) {
        const displayValue = typeof track.volume === 'number' ? track.volume : 0;
        value.textContent = Number(displayValue).toFixed(1);
      }
    });
  }

  function setModalScrollLock() {
    const locked = els.tracksPage.classList.contains('is-open') ||
      els.instrumentChooser.classList.contains('is-open');
    document.documentElement.classList.toggle('demo-modal-open', locked);
    document.body.classList.toggle('demo-modal-open', locked);
  }

  function isTypingTarget(target) {
    return target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
  }

  function log(message) {
    const stamp = new Date().toLocaleTimeString();
    els.log.textContent = `[${stamp}] ${message}\n` + els.log.textContent;
  }
})();
