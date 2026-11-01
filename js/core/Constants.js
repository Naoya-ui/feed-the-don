/** Stable project-owned asset keys. Keep file names case-exact; imported drive files belong under these folders. */
const img = (path) => `assets/images/${path}`;
const snd = (path) => `assets/audio/${path}`;

export const ASSETS = Object.freeze({
  image: Object.freeze({
    background: Object.freeze({ forest: img('backgrounds/forest-battle.png'), storyForest: img('backgrounds/forest.jpeg') }),
    character: Object.freeze({ donIdle: img('battle/don/base/idle.png'), heathcliffIdle: img('battle/heathcliff/idle.png') }),
    ui: Object.freeze({ attack: img('battle/icons/skills/attack.png'), target: img('battle/icons/ui/target.png'), egoIcon: img('battle/ego/ego-icon-v61.png') }),
    vfx: Object.freeze({ heathcliffGroundbreaker: img('battle/heathcliff/skill2_2_e.png'), heathcliffGroundImpact: img('battle/heathcliff/skill2_4_e.png'), donJusticeSlash: img('battle/don/base/skill3_3.png') }),
  }),
  audio: Object.freeze({
    bgm: Object.freeze({ story: snd('canto-1-battle-theme-a2.wav'), versus: snd('canto-1-battle-theme-a2.wav') }),
    sfx: Object.freeze({ donSkill1: snd('don-skills/028_donquixote_base_skill1_a_v1.wav'), donSkill2: snd('don-skills/029_donquixote_base_skill2_a_v1.wav') }),
  }),
});

export const ASSET_ROOT = Object.freeze({ images: 'assets/images/', audio: 'assets/audio/' });
