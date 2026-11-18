"use strict";
(self["webpackChunkoligomerry"] = self["webpackChunkoligomerry"] || []).push([["tinsel-glycan_js_js_music_js"],{

/***/ 410
/*!***************************************!*\
  !*** ../tinsel-glycan.js/js/music.js ***!
  \***************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   start: () => (/* binding */ start),
/* harmony export */   stop: () => (/* binding */ stop)
/* harmony export */ });
/* harmony import */ var tone__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tone */ 907);
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// A synthesised, sample-free christmassy loop for a tinsel full-page takeover - not anyone's
// carol: an original upbeat pad progression (F - Dm - Bb - C) under a dense, near-constant
// glockenspiel ostinato, a walking quarter-note bass, and sleigh bells jingling on every 8th -
// a brighter, busier "Santa's workshop" take than a slow carol: lots of bells, driving tempo,
// evoking the genre without quoting any existing Christmas song.
// The arrangement still varies every 8/16 bars (bell brightens, pad attack tightens) the same
// way neon-glycan.js/js/music.js's does.
//
// start()/stop() match the { start(), stop() } shape a theme-takeover controller's `loadMusic`
// descriptor field expects (see neon-glycan.js/js/music.js's own header for the full contract -
// this file follows it exactly, just with a different patch). Whatever wires this up reaches this
// module only via a dynamic import() on activation/deactivation, so this file (and Tone.js, ~100
// KB gzipped) stays out of every normal page's bundle, and out of tinsel-glycan.js's own main
// entry point (js/main.js) too - importing TinselSVGRenderer alone never pulls Tone.js in.

// Side-effect-only import: see neon-glycan.js/js/music.js's own comment on why this is how Tone's
// UMD build ends up attached to `window.Tone` inside a webpack bundle.
;
var Tone = window.Tone;
var BPM = 128;
var current = null; // { stopPatch(), button } while running, else null

function makeBellBus() {
  var verb = new Tone.Freeverb(0.4, 2200).toDestination();
  verb.wet.value = 0.25;
  return new Tone.Gain(0.9).connect(verb);
}

// Builds the pad/bell/bass patch and its slowly-evolving arrangement, and returns a function that
// tears all of it down. Cost: ~9 Web Audio nodes plus one Transport section callback firing once a
// bar - negligible CPU, nothing allocated per note (notes reuse the same synth instances
// throughout).
function buildPatch() {
  Tone.Transport.bpm.value = BPM;
  Tone.Transport.swing = 0.07;
  Tone.Transport.swingSubdivision = '8n';
  var bellBus = makeBellBus();
  var pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: 'triangle'
    },
    envelope: {
      attack: 0.05,
      decay: 0.15,
      sustain: 0.4,
      release: 0.3
    }
  }).toDestination();
  pad.volume.value = -15;

  // The lead voice of this patch now, not a background twinkle - brighter FM
  // settings and a near-constant ostinato (see bellMotif) for a "workshop full
  // of bells" texture rather than an occasional accent.
  var bell = new Tone.FMSynth({
    harmonicity: 4,
    modulationIndex: 8,
    envelope: {
      attack: 0.002,
      decay: 0.5,
      sustain: 0.05,
      release: 0.45
    },
    modulationEnvelope: {
      attack: 0.002,
      decay: 0.25,
      sustain: 0,
      release: 0.25
    }
  }).connect(bellBus);
  bell.volume.value = -7;
  var bass = new Tone.MonoSynth({
    oscillator: {
      type: 'sine'
    },
    envelope: {
      attack: 0.01,
      decay: 0.12,
      sustain: 0.4,
      release: 0.2
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.15,
      sustain: 0.4,
      baseFrequency: 220,
      octaves: 2
    }
  }).toDestination();
  bass.volume.value = -9;
  var sleighFilter = new Tone.Filter(6500, 'bandpass').connect(bellBus);
  var sleigh = new Tone.NoiseSynth({
    noise: {
      type: 'white'
    },
    envelope: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0
    }
  }).connect(sleighFilter);
  sleigh.volume.value = -16;

  // F - Dm - Bb - C, one chord per bar, 4-bar loop - a warm, generic major-key turnaround.
  var chords = [['F3', 'A3', 'C4'], ['D3', 'F3', 'A3'], ['A#2', 'D3', 'F3'], ['C3', 'E3', 'G3']];

  // A quarter-note walk (root-third-fifth-third) under each chord instead of one
  // held note a bar - the main source of the brisker, more driving feel.
  var bassWalks = [['F2', 'A2', 'C3', 'A2'], ['D2', 'F2', 'A2', 'F2'], ['A#1', 'D2', 'F2', 'D2'], ['C2', 'E2', 'G2', 'E2']];

  // A dense, almost unbroken 4-bar glockenspiel ostinato over that progression - not
  // a transcription of any existing carol, just constant 8th-note chord-tone/passing-tone
  // movement so there's always a bell ringing somewhere, "lots of bells" as asked for.
  var bellMotif = ['F5', 'A5', 'C6', 'A5', 'F5', 'A5', 'C6', 'D6', 'D5', 'F5', 'A5', 'F5', 'D5', 'F5', 'A5', 'C6', 'A#4', 'D5', 'F5', 'D5', 'A#4', 'D5', 'F5', 'G5', 'C5', 'E5', 'G5', 'E5', 'C5', 'E5', 'G5', 'A5'];
  var barInChord = 0;
  var padLoop = new Tone.Loop(time => {
    pad.triggerAttackRelease(chords[barInChord % chords.length], '2n', time);
  }, '2n').start(0);
  var bellStep = 0;
  var bellLoop = new Tone.Loop(time => {
    var note = bellMotif[bellStep % bellMotif.length];
    if (note) bell.triggerAttackRelease(note, '8n', time);
    bellStep++;
  }, '8n').start(0);
  var bassStep = 0;
  var bassLoop = new Tone.Loop(time => {
    var walk = bassWalks[barInChord % bassWalks.length];
    bass.triggerAttackRelease(walk[bassStep % walk.length], '4n', time);
    bassStep++;
  }, '4n').start(0);

  // Sleigh bells jingling on every 8th now, not just the off-beats - a constant
  // shimmer under the glockenspiel, with a light accent on the beat.
  var sleighStep = 0;
  var sleighLoop = new Tone.Loop(time => {
    var onBeat = sleighStep % 2 === 0;
    sleigh.triggerAttackRelease('32n', time, onBeat ? 1 : 0.65);
    sleighStep++;
  }, '8n').start(0);
  var bar = 0;
  var sectionEvent = Tone.Transport.scheduleRepeat(() => {
    bar += 1;
    barInChord = bar % chords.length;
    if (bar % 8 === 0) {
      var lift = bar % 16 === 0;
      pad.set({
        envelope: {
          attack: lift ? 0.02 : 0.05
        }
      });
      bell.volume.value = lift ? -4 : -7;
    }
  }, '1m');
  var nodes = [bellBus, pad, bell, bass, sleighFilter, sleigh, padLoop, bellLoop, bassLoop, sleighLoop];
  Tone.Transport.start();
  return function stopPatch() {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.clear(sectionEvent);
    for (var n of nodes) n.dispose();
  };
}

// A small fixed mute button, matching neon-glycan.js/js/music.js's own - see that file's comment
// for why muting is a volume change only (the Transport keeps running) and why state resets on
// every start().
function addMuteButton() {
  var button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Mute music';
  Object.assign(button.style, {
    position: 'fixed',
    right: '1em',
    bottom: '1em',
    zIndex: 2147483647,
    padding: '0.5em 0.9em',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #2f5c3b)',
    background: 'var(--surface-color, #16331f)',
    color: 'var(--text-color, #f1e4c3)',
    font: '0.8rem sans-serif',
    cursor: 'pointer'
  });
  var muted = false;
  button.addEventListener('click', () => {
    muted = !muted;
    Tone.Destination.mute = muted;
    button.textContent = muted ? 'Unmute music' : 'Mute music';
  });
  document.body.appendChild(button);
  return button;
}
function start() {
  return _start.apply(this, arguments);
}
function _start() {
  _start = _asyncToGenerator(function* () {
    if (current) return;
    // Unlocks the AudioContext - browsers suspend it until a user gesture resumes it. See
    // neon-glycan.js/js/music.js's own comment: whatever dynamically import()s this module must do
    // so synchronously inside the activating gesture's call stack for this to still count.
    yield Tone.start();
    var stopPatch = buildPatch();
    var button = addMuteButton();
    current = {
      stopPatch,
      button
    };
  });
  return _start.apply(this, arguments);
}
function stop() {
  if (!current) return;
  current.stopPatch();
  current.button.remove();
  current = null;
}

/***/ }

}]);