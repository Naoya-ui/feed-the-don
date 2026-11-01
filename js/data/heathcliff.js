/** Heathcliff runtime data. Keep asset paths and animation timing here so new Identity/E.G.O content can be added without rewriting the renderer. */
const ROOT = 'assets/images/battle/heathcliff/';
const frames = (prefix, count) =>
  Array.from({ length: count }, (_, index) => `${ROOT}${prefix}_${index + 1}.png`);

export const heathcliffSprites = Object.freeze({
  idle: `${ROOT}idle.png`,
  moving: `${ROOT}moving.png`,
  guard: `${ROOT}guard.png`,
  hurt: `${ROOT}hurt.png`,
  evade: `${ROOT}evade.png`,
  dead: `${ROOT}hurt.png`,
  egoCharge: `${ROOT}ego-charge.png`,
  egoCutin: `${ROOT}ego-cutin.png`,
  egoSigil: `${ROOT}ego-sigil.png`,
});

const heathcliffSkill3Frames = Object.freeze({
  frames: frames('skill3', 16),
  animationFrames: 54,
  effectFrames: [
    { src: `${ROOT}skill3_2_e.png`, at: 0.08 },
    { src: `${ROOT}skill3_4_e.png`, at: 0.22 },
    { src: `${ROOT}skill3_5_e.png`, at: 0.36 },
    { src: `${ROOT}skill3_8_e.png`, at: 0.5 },
    { src: `${ROOT}skill3_11_e.png`, at: 0.66 },
    { src: `${ROOT}skill3_14_e.png`, at: 0.82 },
    { src: `${ROOT}skill3_15_e.png`, at: 0.94 },
  ],
});

export const heathcliffAnimations = Object.freeze({
  skill1: Object.freeze({
    frames: frames('skill1', 4),
    animationFrames: 24,
    effectFrames: [
      { src: `${ROOT}skill1_2_e.png`, at: 0.25 },
      { src: `${ROOT}skill1_3_e.png`, at: 0.72 },
    ],
  }),
  skill2: Object.freeze({
    frames: frames('skill2', 4),
    animationFrames: 35,
    effectFrames: [
      { src: `${ROOT}skill2_2_e.png`, at: 0.22 },
      { src: `${ROOT}skill2_3_e.png`, at: 0.58 },
      { src: `${ROOT}skill2_4_e.png`, at: 0.82 },
    ],
  }),
  // The base-form Bodysack GIF is the move-specific cinematic. Keep separate keys so
  // its combat timing and presentation can evolve independently of ordinary Skill 3.
  skill3: heathcliffSkill3Frames,
  bodysack: heathcliffSkill3Frames,
  ego: heathcliffSkill3Frames,
});

export const HEATHCLIFF_EGO_CONFIG = Object.freeze({
  maxGauge: 100,
  // Meter gained when his attack connects or is guarded, plus meter from received hits.
  onHit: 18,
  onBlock: 11,
  whenHit: 13,
  whenBlocked: 8,
  // E.G.O is only spent by the battle AI when the gauge is full and the opponent is in range.
  activationRange: 360,
});

export function clampEgoGauge(value, max = HEATHCLIFF_EGO_CONFIG.maxGauge) {
  const numeric = Number(value);
  return Math.max(0, Math.min(max, Number.isFinite(numeric) ? numeric : 0));
}

export function gainHeathcliffEgo(fighter, amount) {
  if (!fighter || fighter.drawKey !== 'heathcliff') return 0;
  fighter.egoMeter = clampEgoGauge((fighter.egoMeter || 0) + Math.max(0, Number(amount) || 0));
  return fighter.egoMeter;
}

/** A hit/block is a concrete combat event. Evades do not build the gauge. */
export function chargeHeathcliffEgoFromEvent(event) {
  if (!event || event.evaded) return [];
  const changed = [];
  const attacker = event.attacker;
  const target = event.target;
  if (attacker?.drawKey === 'heathcliff') {
    changed.push({
      fighter: attacker,
      value: gainHeathcliffEgo(
        attacker,
        event.blocked ? HEATHCLIFF_EGO_CONFIG.onBlock : HEATHCLIFF_EGO_CONFIG.onHit
      ),
    });
  }
  if (target?.drawKey === 'heathcliff') {
    changed.push({
      fighter: target,
      value: gainHeathcliffEgo(
        target,
        event.blocked ? HEATHCLIFF_EGO_CONFIG.whenBlocked : HEATHCLIFF_EGO_CONFIG.whenHit
      ),
    });
  }
  return changed;
}
