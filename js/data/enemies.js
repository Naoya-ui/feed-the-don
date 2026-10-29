export const enemySprites = {
  club: { idle:'assets/images/battle/enemies/club-idle.png', attack:'assets/images/battle/enemies/club-attack-a.png', windup:'assets/images/battle/enemies/club-attack-b.png', hurt:'assets/images/battle/enemies/club-attack-b.png', dead:'assets/images/battle/enemies/club-dead.png' },
  knife: { idle:'assets/images/battle/enemies/knife-idle.png', attack:'assets/images/battle/enemies/knife-attack.png', windup:'assets/images/battle/enemies/knife-idle-alt.png', hurt:'assets/images/battle/enemies/knife-attack.png', dead:'assets/images/battle/enemies/knife-idle.png' },
  leader: { idle:'assets/images/battle/enemies/leader-idle.png', attack:'assets/images/battle/enemies/leader-attack-a.png', windup:'assets/images/battle/enemies/leader-attack-b.png', hurt:'assets/images/battle/enemies/leader-attack-a.png', dead:'assets/images/battle/enemies/leader-dead.png' },
  elite: { idle:'assets/images/battle/enemies/elite-idle.png', attack:'assets/images/battle/enemies/elite-attack-a.png', windup:'assets/images/battle/enemies/elite-attack-b.png', hurt:'assets/images/battle/enemies/elite-hurt.png', dead:'assets/images/battle/enemies/elite-dead.png' },
  wolf: {
    idle:'assets/images/battle/wolf/idle.png',
    windup:'assets/images/battle/wolf/idle.png',
    attack:'assets/images/battle/wolf/sever.png',
    sever:'assets/images/battle/wolf/sever.png',
    indigoBlade:'assets/images/battle/wolf/indigo-blade.png',
    azureRend:'assets/images/battle/wolf/azure-rend.png',
    shimmeringCleave:'assets/images/battle/wolf/shimmering-cleave.png',
    mirageSlash:'assets/images/battle/wolf/mirage-slash.png',
    exhaust:'assets/images/battle/wolf/exhaust.png',
    hurt:'assets/images/battle/wolf/hurt.png',
    dead:'assets/images/battle/wolf/hurt.png',
  },
};

export const enemyBattleSkills = {
  club: [
    { key:'clumsyChop', name:'Clumsy Chop', base:3, coinPower:3, coins:1, type:'Blunt', art:'assets/images/battle/enemy-skills/clumsy-chop.png' },
    { key:'weakBlow', name:'Weak Blow', base:4, coinPower:1, coins:1, type:'Blunt', art:'assets/images/battle/enemy-skills/weak-blow.png' },
  ],
  knife: [
    { key:'clunkyStab', name:'Clunky Stab', base:2, coinPower:5, coins:1, type:'Pierce', art:'assets/images/battle/enemy-skills/clunky-stab.png', applyOnHit:[{ type:'bleed', potency:3, count:2 }] },
    { key:'weakBlow', name:'Weak Blow', base:4, coinPower:1, coins:1, type:'Blunt', art:'assets/images/battle/enemy-skills/weak-blow.png' },
  ],
  leader: [
    { key:'clumsyChop', name:'Clumsy Chop', base:3, coinPower:3, coins:1, type:'Blunt', art:'assets/images/battle/enemy-skills/clumsy-chop.png' },
    { key:'clunkyStab', name:'Clunky Stab', base:2, coinPower:5, coins:1, type:'Pierce', art:'assets/images/battle/enemy-skills/clunky-stab.png', applyOnHit:[{ type:'bleed', potency:3, count:2 }] },
    { key:'weakBlow', name:'Weak Blow', base:4, coinPower:1, coins:1, type:'Blunt', art:'assets/images/battle/enemy-skills/weak-blow.png' },
  ],
  elite: [
    { key:'hit', name:'Hit', base:3, coinPower:2, coins:3, type:'Blunt', art:'assets/images/battle/enemy-skills/hit.png', applyOnHit:[{ type:'bleed', potency:2, count:2 }] },
    { key:'heavyStrike', name:'Heavy Strike', base:4, coinPower:6, coins:1, type:'Blunt', art:'assets/images/battle/enemy-skills/heavy-strike.png' },
    { key:'block', name:'Block', base:4, coinPower:2, coins:1, type:'Defense', defense:true, art:'assets/images/battle/enemy-skills/block.png' },
  ],
};


// Custom encounter rules. Numeric data is consumed by WolfBossSystem/EnemyAI.
export const wolfBoss = {
  key: 'wolf', name: 'The Wandering Wolf',
  portrait: 'assets/images/characters/wolf.png',
  level: 35, offenseLevel: 38, defenseLevel: 35,
  maxHp: 1200, staggerThresholds: [840, 480, 180], speed: [4, 7],
  resistances: {
    physical: { Slash: 0.5, Pierce: 1, Blunt: 2 },
    sin: { Wrath: 1, Lust: 1, Sloth: 0.5, Gluttony: 1, Gloom: 0.5, Pride: 2, Envy: 2 },
  },
  exhaust: { cap: 5, trigger: 3, offenseDown: 3, decay: 1 },
  staggerTurns: 2,
  panic: { threshold: -45, basePenalty: 2 },
  battleEnabled: true,
};

export const wolfBattleSkills = {
  sever: {
    key: 'sever', name: 'Sever', affinity: 'Wrath', type: 'Slash',
    base: 4, coinPower: 5, coins: 1, attackWeight: 1,
    art: 'assets/images/battle/wolf-skills/sever.png',
  },
  indigoBlade: {
    key: 'indigoBlade', name: 'Indigo Blade', affinity: 'Gloom', type: 'Slash',
    base: 4, coinPower: 4, coins: 2, attackWeight: 1, onHitExhaust: 1,
    art: 'assets/images/battle/wolf-skills/indigo-blade.png',
  },
  azureRend: {
    key: 'azureRend', name: 'Azure Rend', affinity: 'Pride', type: 'Slash',
    base: 5, coinPower: 3, coins: 3, attackWeight: 1, onClashWinSp: 10,
    targetRule: 'slowest',
    art: 'assets/images/battle/wolf-skills/azure-rend.png',
  },
  shimmeringCleave: {
    key: 'shimmeringCleave', name: 'Shimmering Cleave', affinity: 'Envy', type: 'Slash',
    base: 4, coinPower: 6, coins: 1, attackWeight: 1, counter: true,
    missingHpCoinPowerScale: 5,
    art: 'assets/images/battle/wolf-skills/shimmering-cleave.png',
  },
  mirageSlash: {
    key: 'mirageSlash', name: 'Mirage Slash', affinity: 'Gloom', type: 'Pierce',
    base: 5, coinPower: 2, coins: 2, attackWeight: 3, onHitExhaust: 2,
    onClashLoseFragile: 1,
    art: 'assets/images/battle/wolf-skills/mirage-slash.png',
  },
};

// Turns 1–2 spread Exhaust; turn 3 pressures the slowest slot and arms a Counter.
export const wolfSkillRotation = ['sever', 'indigoBlade', 'azureRend', 'shimmeringCleave'];
export const wolfTurnPattern = [
  ['sever', 'sever', 'indigoBlade'],
  ['sever', 'sever', 'indigoBlade'],
  ['azureRend', 'azureRend', 'shimmeringCleave'],
];

export const enemySkillText = {
  clumsyChop:'A rough club swing with modest power. It is easy to read, but a missed Clash still hurts.',
  clunkyStab:'A messy Pierce attack. It can apply Bleed on hit.',
  weakBlow:'A slow, low-coin attack used by weaker bandits to fill the chain.',
  hit:'A 3-coin combo from the elite bandit. It can apply Bleed on hit.',
  heavyStrike:'A single crushing blow with high coin power.',
  block:'A guarded stance used by the elite bandit.',
  sever: 'A single-coin Wrath/Slash attack.',
  indigoBlade: 'A two-coin Gloom/Slash attack. Each hit inflicts 1 Exhaust.',
  azureRend: 'A three-coin Pride/Slash attack targeting the slowest action slot. Clash Win restores 10 SP.',
  shimmeringCleave: 'An Envy/Slash Counter. Retaliates once after Wolf takes a direct attack, if still able to act.',
  mirageSlash: 'Below 40% HP: selects up to 3 random action slots. Each unit is hit once per Coin. Unavailable during Panic.',

};

export const enemySkillEffects = {
  clumsyChop:[{ tag:'[On Hit]', text:'Deal Blunt damage.' }],
  clunkyStab:[{ tag:'[On Hit]', text:'Inflict Bleed 3/2.' }],
  weakBlow:[{ tag:'[On Hit]', text:'Deal light Blunt damage.' }],
  hit:[{ tag:'[On Hit]', text:'Multi-coin combo. Inflict Bleed 2/2.' }],
  heavyStrike:[{ tag:'[On Hit]', text:'A heavy Blunt strike with strong clash payoff.' }],
  block:[{ tag:'[Defense]', text:'Reduce incoming pressure if not redirected.' }],
  sever: [{ tag: '[Passive]', text: 'Lone Predator: +1 Clash Power while alone.' }],
  indigoBlade: [{ tag: '[On Hit]', text: 'Inflict 1 Exhaust per Coin. Each stack lowers Max Speed by 1 next turn.' }],
  azureRend: [{ tag: '[Target]', text: 'Slowest action slot.' }, { tag: '[Clash Win]', text: 'Recover 10 SP.' }],
  shimmeringCleave: [{ tag: '[Counter]', text: 'Retaliate once after a direct attack; disabled by Stagger.' }, { tag: '[Coin Power]', text: '+floor((1 - HP / Max HP) × 5).' }],
  mirageSlash: [{ tag: '[On Hit]', text: 'Inflict 2 Exhaust per Coin. Attack Weight 3; duplicate units are hit only once per Coin.' }, { tag: '[Clash Lose]', text: 'Gain 1 Fragile next turn.' }],

};
