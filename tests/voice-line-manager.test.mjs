import assert from 'node:assert/strict';
import { VoiceLineManager } from '../js/utils/VoiceLineManager.js';

class FakeAudio {
  static instances = [];
  constructor(src) {
    this.src = src;
    this.preload = '';
    this.volume = 1;
    this.playbackRate = 1;
    this.currentTime = 0;
    this.handlers = {};
    this.played = false;
    this.paused = false;
    FakeAudio.instances.push(this);
  }
  cloneNode() { return new FakeAudio(this.src); }
  addEventListener(type, fn) { (this.handlers[type] ||= []).push(fn); }
  play() { this.played = true; this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
}

const catalog = {
  don: {
    attacks: {
      joust: ['assets/audio/don-skills/joust.wav'],
      justice: ['assets/audio/don-skills/justice-a.wav', 'assets/audio/don-skills/justice-b.wav'],
    },
    events: { victory: ['assets/audio/voice-lines/don/victory.wav'], hurt: [] },
    ambient: { smalltalk: ['assets/audio/voice-lines/don/smalltalk-a.wav', 'assets/audio/voice-lines/don/smalltalk-b.wav'] },
  },
};
const manager = new VoiceLineManager({ catalog, volumeProvider: () => 0.5, audioFactory: (src) => new FakeAudio(src) });
assert.equal(manager.playAttack('don', 'joust'), true);
assert.equal(FakeAudio.instances.at(-1).src, 'assets/audio/don-skills/joust.wav');
assert.equal(FakeAudio.instances.at(-1).volume, 0.5);
assert.equal(manager.playAttack('don', 'justice'), true);
assert.equal(FakeAudio.instances.at(-1).src, 'assets/audio/don-skills/justice-a.wav');
assert.equal(manager.playAttack('don', 'justice'), true);
assert.equal(FakeAudio.instances.at(-1).src, 'assets/audio/don-skills/justice-b.wav', 'multi-line attacks rotate without replaying the same line immediately');
assert.equal(manager.playEvent('don', 'victory'), true);
assert.equal(FakeAudio.instances.at(-1).src, 'assets/audio/voice-lines/don/victory.wav');
assert.equal(manager.playEvent('don', 'hurt'), false, 'empty event buckets are a safe no-op until clips are imported');
assert.equal(manager.playAmbient('don', 'smalltalk'), true, 'ambient/lobby voice lines are playable');
assert.equal(FakeAudio.instances.at(-1).src, 'assets/audio/voice-lines/don/smalltalk-a.wav');
assert.equal(manager.playAmbient('don', 'smalltalk'), true);
assert.equal(FakeAudio.instances.at(-1).src, 'assets/audio/voice-lines/don/smalltalk-b.wav', 'ambient variants rotate');
manager.setEnabled(false);
assert.equal(manager.playAttack('don', 'joust'), false, 'manager respects the enable switch');
manager.stopAll();
console.log('PASS voice-line-manager: attacks, events, ambient lines, rotating variants, volume and safe empty buckets');
