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


// Wolf's boss kit, transcribed from the user's reference screenshots.
// It is data-only for now: Wolf is NOT spawned by buildWaveEnemies yet.
// Fields such as Track are preserved as future hooks instead of inventing mechanics.
export const wolfBoss = {
  key: 'wolf',
  name: 'Wolf',
  portrait: 'assets/images/characters/wolf.png',
  offenseLevel: 56,
  maxHp: 780,
  staggerThresholds: [585, 390, 195],
  battleEnabled: true,
};

export const wolfBattleSkills = {
  sever: {
    key: 'sever',
    name: 'Sever',
    base: 4,
    coinPower: 6,
    coins: 1,
    offenseLevel: 50,
    attackWeight: 1,
    type: 'Slash',
    art: 'assets/images/battle/wolf-skills/sever.png',
    effects: [
      { trigger: 'onHit', effect: 'hasteNextTurn', amount: 1 },
      { trigger: 'onHit', effect: 'poise', potency: 2, count: 4 },
    ],
  },

  indigoBlade: {
    key: 'indigoBlade',
    name: 'Indigo Blade',
    base: 4,
    coinPower: 5,
    coins: 2,
    offenseLevel: 56,
    attackWeight: 1,
    type: 'Slash',
    art: 'assets/images/battle/wolf-skills/indigo-blade.png',
    applyOnHit: [{ type: 'bleed', potency: 7, count: 2 }],
    onUse: {
      criticalDamagePerPoisePotencyPercent: 2,
      criticalDamagePerPoisePotencyMaxPercent: 50,
      criticalDamageBonusPercent: 100,
    },
    coinEffects: [
      {
        coin: 1,
        unbreakable: true,
        effects: [
          { trigger: 'onHit', effect: 'healSp', amount: 10 },
          { trigger: 'onHit', effect: 'bleedNextTurn', potency: 7 },
        ],
      },
      {
        coin: 2,
        coinPowerModifier: -2,
        effects: [
          { trigger: 'onHit', effect: 'bleedNextTurn', potency: 7 },
        ],
      },
    ],
  },

  azureRend: {
    key: 'azureRend',
    name: 'Azure Rend',
    base: 12,
    coinPower: 2,
    coins: 2,
    offenseLevel: 50,
    attackWeight: 1,
    type: 'Slash',
    art: 'assets/images/battle/wolf-skills/azure-rend.png',
    coinEffects: [
      {
        coin: 1,
        damageTarget: 'sp',
        note: 'Deals SP damage instead of HP damage.',
      },
      {
        coin: 2,
        coinPowerModifier: 1,
      },
    ],
  },

  shimmeringCleave: {
    key: 'shimmeringCleave',
    name: 'Shimmering Cleave',
    base: 7,
    coinPower: 5,
    coins: 2,
    offenseLevel: 50,
    attackWeight: 1,
    type: 'Slash',
    art: 'assets/images/battle/wolf-skills/shimmering-cleave.png',
    coinEffects: [
      {
        coin: 1,
        unbreakable: true,
        effects: [
          { trigger: 'onHit', effect: 'healSp', amount: 6 },
          { trigger: 'onHit', effect: 'damageUp', amount: 2 },
        ],
      },
      {
        coin: 2,
        coinPowerModifier: -3,
        effects: [
          { trigger: 'onHit', effect: 'poise', potency: 4 },
          { trigger: 'headsHit', effect: 'poiseCount', amount: 4 },
        ],
      },
    ],
  },

  mirageSlash: {
    key: 'mirageSlash',
    name: 'Mirage Slash',
    base: 14,
    coinPower: 3,
    coins: 1,
    offenseLevel: 50,
    attackWeight: 8,
    type: 'Slash',
    art: 'assets/images/battle/wolf-skills/mirage-slash.png',
    cannotBeStaggeredUntilSkillUsed: true,
    opponentClashPowerModifier: -4,
    onClashLose: { effect: 'selfStagger' },
    coinEffects: [
      {
        coin: 1,
        criticalDamageBonusPercent: 200,
      },
    ],
  },

  exhaust: {
    key: 'exhaust',
    name: 'Exhaust',
    base: 10,
    coinPower: 2,
    coins: 1,
    offenseLevel: 50,
    attackWeight: 1,
    type: 'Defense',
    art: 'assets/images/battle/wolf-skills/exhaust.png',
    defense: true,
    evade: true,
    unbreakable: true,
    onEvade: [
      { effect: 'healSp', amount: 3 },
      { effect: 'targetLoseSp', amount: 3 },
      { effect: 'useFollowUp', skill: 'Track' },
    ],
  },
};

export const wolfSkillRotation = [
  'sever',
  'indigoBlade',
  'azureRend',
  'shimmeringCleave',
  'mirageSlash',
  'exhaust',
];

export const enemySkillText = {
  clumsyChop:'A rough club swing with modest power. It is easy to read, but a missed Clash still hurts.',
  clunkyStab:'A messy Pierce attack. It can apply Bleed on hit.',
  weakBlow:'A slow, low-coin attack used by weaker bandits to fill the chain.',
  hit:'A 3-coin combo from the elite bandit. It can apply Bleed on hit.',
  heavyStrike:'A single crushing blow with high coin power.',
  block:'A guarded stance used by the elite bandit.',
  sever:'Wolf\'s single-coin slash. On hit, the source reference grants Haste next turn and builds Poise.',
  indigoBlade:'A two-coin slash. The source reference improves Critical damage with Poise and inflicts heavy Bleed on hit.',
  azureRend:'A two-coin technique whose first coin damages SP instead of HP.',
  shimmeringCleave:'A two-coin slash that restores SP and builds Damage Up / Poise in the source reference.',
  mirageSlash:'A dangerous single-coin slash. The opponent clashes at reduced power; Wolf becomes Staggered if this skill loses the Clash.',
  exhaust:'An unbreakable Evade skill. The source reference restores SP, drains target SP, then uses Track after a successful evade.',
};

export const enemySkillEffects = {
  clumsyChop:[{ tag:'[On Hit]', text:'Deal Blunt damage.' }],
  clunkyStab:[{ tag:'[On Hit]', text:'Inflict Bleed 3/2.' }],
  weakBlow:[{ tag:'[On Hit]', text:'Deal light Blunt damage.' }],
  hit:[{ tag:'[On Hit]', text:'Multi-coin combo. Inflict Bleed 2/2.' }],
  heavyStrike:[{ tag:'[On Hit]', text:'A heavy Blunt strike with strong clash payoff.' }],
  block:[{ tag:'[Defense]', text:'Reduce incoming pressure if not redirected.' }],
  sever:[{ tag:'[On Hit]', text:'Gain 1 Haste next turn; gain 2 Poise and +4 Poise Count.' }],
  indigoBlade:[{ tag:'[On Hit]', text:'Coin I heals 10 SP and inflicts 7 Bleed next turn; Coin II also inflicts 7 Bleed next turn.' }],
  azureRend:[{ tag:'[Coin I]', text:'Deals SP damage instead of HP damage.' }, { tag:'[Coin II]', text:'Coin Power +1.' }],
  shimmeringCleave:[{ tag:'[Coin I]', text:'Unbreakable. Heal 6 SP and gain 2 Damage Up.' }, { tag:'[Coin II]', text:'Coin Power -3. Gain 4 Poise; Heads Hit adds 4 Poise Count.' }],
  mirageSlash:[{ tag:'[Clash]', text:'Opponent has -4 Clash Power. On Clash Lose, Wolf becomes Staggered.' }, { tag:'[Coin I]', text:'+200% Critical Hit damage.' }],
  exhaust:[{ tag:'[On Evade]', text:'Heal 3 SP, target loses 3 SP, then use Track. Track remains a future hook.' }],
};
