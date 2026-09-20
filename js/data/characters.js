export const characters = {
  donQuixote: {
    id: 'don', name: 'Don Quixote', maxHp: 203, staggerThresholds: [120, 50],
  },
};

export const assets = {
  backgrounds: {
    black: null,
    don_room: 'assets/images/backgrounds/don-room.png',
    bus: 'assets/images/backgrounds/bus.png',
    town: 'assets/images/backgrounds/town.png',
    forest: 'assets/images/backgrounds/forest.jpeg',
    shop: 'assets/images/backgrounds/shop.png',
  },
  characters: {
    idle: 'assets/images/characters/idle.png?v=vnclassic31',
    happy: 'assets/images/characters/happy.png?v=vnclassic31',
    superHappy: 'assets/images/characters/super-happy.png?v=vnclassic31',
    cry: 'assets/images/characters/cry.png?v=vnclassic31',
    lilMad: 'assets/images/characters/lil-mad.png?v=vnclassic31',
    angry: 'assets/images/characters/angry.png?v=vnclassic31',
    lilAngry: 'assets/images/characters/lil-angry.png?v=vnclassic31',
    sad: 'assets/images/characters/sad.png?v=vnclassic31',
    sup: 'assets/images/characters/sup.png?v=vnclassic31',
    superMad: 'assets/images/characters/super-mad.png?v=vnclassic31',
  },
};

export const battleDonSprites = {
  idle: 'assets/images/battle/don/base/idle.png',
  idleStatic: 'assets/images/battle/don/base/idle.png',
  guard: 'assets/images/battle/don/base/gud.png',
  hurt: 'assets/images/battle/don/base/hurt.png',
  evade: 'assets/images/battle/don/base/evade.png',
  moving: 'assets/images/battle/don/moving.png',
  neutral: 'assets/images/battle/don/base/idle.png',
  dead: 'assets/images/battle/don/dead.png',
};

export const battleDonAnimations = {
  joust: { frames: ['assets/images/battle/don/base/skill1_1.png','assets/images/battle/don/base/skill1_2.png','assets/images/battle/don/base/skill1_3.png'], duration: 1500, hitTimes: [0.66], css: 'skill1' },
  gallop: { frames: ['assets/images/battle/don/base/skill2_1.png','assets/images/battle/don/base/skill2_2.png','assets/images/battle/don/base/skill2_3.png'], duration: 1500, hitTimes: [0.68], css: 'skill2' },
  justice: { frames: Array.from({ length: 12 }, (_, i) => `assets/images/battle/don/base/skill3_${i + 1}.png`), duration: 2600, hitTimes: [0.34, 0.62, 0.86], css: 'skill3' },
};

export const battleUiIcons = {
  sins: {
    Lust: 'assets/images/battle/icons/sins/lust.png',
    Envy: 'assets/images/battle/icons/sins/envy.png',
    Gluttony: 'assets/images/battle/icons/sins/gluttony.png',
  },
  attack: 'assets/images/battle/icons/skills/attack.png',
  defense: 'assets/images/battle/icons/skills/defense.png',
  evade: 'assets/images/battle/icons/skills/evade.png',
  sanity: 'assets/images/battle/icons/skills/sanity.png',
  target: 'assets/images/battle/icons/ui/target.png',
};

export const itemDB = {
  Potion: { desc: 'Heals 45 SP.', icon: 'assets/images/items/potion.webp' },
  Lunacy: { desc: 'A gamble flower.', icon: 'assets/images/items/lunacy.webp' },
  Coin: { desc: 'A shiny gold coin.', icon: 'assets/images/items/coin.png' },
};
