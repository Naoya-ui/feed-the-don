export const donBattleSkills = {
  joust: {
    key:'joust', name:'Joust', affinity:'Lust', css:'lust', type:'Pierce',
    art:'assets/images/battle/skills/joust-icon.png', badge:'assets/images/battle/skills/joust-badge.png',
    base:4, coinPower:7, coins:1,
    effect:'[Clash Win] Gain 2 Haste next turn.',
    keywords:['Haste','Clash Win'], expression:'lilAngry', animation:'lc-anim-joust',
  },
  gallop: {
    key:'gallop', name:'Galloping Tilt', affinity:'Envy', css:'envy', type:'Pierce',
    art:'assets/images/battle/skills/gallop-icon.png', badge:'assets/images/battle/skills/gallop-badge.png',
    base:4, coinPower:12, coins:1,
    effect:'[Clash Win] Gain 2 Attack Power Up next turn. [Heads Hit] Inflict 2 Bleed.',
    keywords:['Attack Power Up','Bleed'], expression:'sup', animation:'lc-anim-gallop',
  },
  justice: {
    key:'justice', name:'For Justice!', affinity:'Gluttony', css:'gluttony', type:'Pierce',
    art:'assets/images/battle/skills/justice-icon.png', badge:'assets/images/battle/skills/justice-badge.png',
    base:3, coinPower:3, coins:3,
    effect:'3 Coins. At 10+ Speed, Coin Power +2. Hits build Bleed.',
    keywords:['Bleed','Multi-Coin'], expression:'angry', animation:'lc-anim-justice',
  },
  laSangre: {
    key:'laSangre', name:'La Sangre de Sancho', affinity:'Lust', css:'ego', type:'Pierce',
    art:'assets/images/battle/ego/cutin-portrait.png', badge:'assets/images/battle/ego/skill-info.png',
    base:12, coinPower:11, coins:1,
    effect:'E.G.O Skill. 1 Coin. On use, lose 20 SP. [Heads Hit] Inflict 4 Bleed.',
    keywords:['Bleed','E.G.O','Heads Hit'], expression:'superMad', animation:'lc-anim-ego', ego:true,
  },
  evade: {
    key:'evade', name:'Evade', affinity:'Lust', css:'defense', type:'Defense',
    art:'assets/images/battle/skills/evade-icon.png', badge:'assets/images/battle/skills/evade-badge.png',
    base:2, coinPower:10, coins:1, defense:true,
    effect:'Defense skill. Win the defensive roll to avoid the incoming attack.',
    keywords:['Defense','Evade'], expression:'happy', animation:'lc-anim-evade',
  },
};

export const keywordDescriptions = {
  Bleed:'Deals fixed damage based on Potency whenever the affected unit rolls Coins. Count is consumed by Coin rolls.',
  Haste:'Raises Speed on the next turn, helping Don act earlier and redirect slower enemy actions.',
  'Attack Power Up':"Raises Don's attack skill power for the next turn.",
  'Multi-Coin':'This skill attacks with multiple Coins. Winning a Clash preserves more Coins for the follow-up attack.',
  'Clash Win':'Activates after Don wins the Clash.',
  'Heads Hit':'Activates only on a Heads result for that Coin.',
  'E.G.O':'A manifested E.G.O attack. It unlocks after Turn 5 in the Wolf fight and costs SP when used.',
  Defense:'A defensive action that competes against the incoming enemy action instead of dealing normal damage.',
  Evade:'If the defensive roll wins, Don avoids the incoming hit and takes no damage from that action.',
};
