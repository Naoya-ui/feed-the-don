/** Local Versus roster. New characters can be added here without changing the selection UI. */
export const VERSUS_ROSTER = Object.freeze({
  don: Object.freeze({
    id: 'don',
    name: 'Don Quixote',
    shortName: 'DON',
    drawKey: 'don',
    maxHp: 300,
    gridIndex: 14,
    avatar: 'assets/images/battle/don/base/idle.png',
    portrait: 'assets/images/battle/don/base/idle.png',
    fullBody: 'assets/images/battle/don/base/idle.png',
    subtitle: 'LCB Sinner · Base Appearance',
    identity: Object.freeze({ id: 'don-lcb-base', name: 'LCB Sinner · Base Appearance' }),
    egos: Object.freeze([
      Object.freeze({
        id: 'la-sangre',
        name: 'La Sangre de Sancho',
        description: 'Build E.G.O by fighting. Press I to manifest La Sangre de Sancho at 100%.',
        icon: 'assets/images/battle/skill-icons/don/skill4-alt.png',
        preview: 'assets/images/ego/don/la-sangre-preview.gif',
      }),
    ]),
  }),
  heathcliff: Object.freeze({
    id: 'heathcliff',
    name: 'Heathcliff',
    shortName: 'HEATH',
    drawKey: 'heathcliff',
    maxHp: 320,
    gridIndex: 17,
    avatar: 'assets/images/battle/heathcliff/idle.png',
    portrait: 'assets/images/battle/heathcliff/idle.png',
    fullBody: 'assets/images/battle/heathcliff/idle.png',
    flipP2: false,
    subtitle: 'LCB Sinner · Base Appearance',
    identity: Object.freeze({ id: 'heathcliff-lcb-base', name: 'LCB Sinner · Base Appearance' }),
    egos: Object.freeze([
      Object.freeze({
        id: 'bodysack',
        name: 'Bodysack · Base Form',
        description: 'Base-form Heathcliff E.G.O move · Bodysack',
        icon: 'assets/images/ego/heathcliff/bodysack/20701_awaken_profile.png',
        preview: 'assets/images/ego/heathcliff/bodysack/20701_cg.png',
        moveClip: 'assets/images/ego/heathcliff/bodysack-preview.gif',
      }),
      Object.freeze({
        id: 'heathcliff-burst',
        name: 'E.G.O Burst',
        description: 'Build E.G.O by fighting. Press I to activate the E.G.O form at 100%.',
        icon: 'assets/images/battle/skill-icons/heathcliff/skill4.png',
      }),
    ]),
  }),
});

export function getVersusCharacter(characterId) {
  return VERSUS_ROSTER[String(characterId)] || VERSUS_ROSTER.don;
}

export function getVersusEgo(characterId, egoId) {
  const character = getVersusCharacter(characterId);
  return character.egos.find((ego) => ego.id === egoId) || character.egos[0];
}
