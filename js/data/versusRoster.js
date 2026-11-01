/** Local Versus roster. New characters can be added here without changing the selection UI. */
export const VERSUS_ROSTER = Object.freeze({
  don: Object.freeze({
    id: 'don', name: 'Don Quixote', shortName: 'DON', drawKey: 'don', maxHp: 300, gridIndex: 14,
    avatar: 'assets/images/characters/idle.png?v=vnclassic31', portrait: 'assets/images/characters/idle.png?v=vnclassic31', fullBody: 'assets/images/characters/idle.png?v=vnclassic31', subtitle: 'LCB Sinner · Base Appearance',
    identity: Object.freeze({ id: 'don-lcb-base', name: 'LCB Sinner · Base Appearance' }),
    egos: Object.freeze([
      Object.freeze({ id: 'none', name: 'No E.G.O · Justice', description: 'U is the normal Skill 3; I is reserved for an equipped E.G.O form.' }),
      Object.freeze({ id: 'la-sangre', name: 'La Sangre de Sancho', description: 'Build E.G.O by fighting. Press I to manifest La Sangre de Sancho at 100%.', preview: 'assets/images/ego/don/la-sangre-preview.gif' }),
    ]),
  }),
  heathcliff: Object.freeze({
    id: 'heathcliff', name: 'Heathcliff', shortName: 'HEATH', drawKey: 'heathcliff', maxHp: 320, gridIndex: 17,
    avatar: 'assets/images/characters/heathcliff.png', portrait: 'assets/images/characters/heathcliff.png', fullBody: 'assets/images/characters/heathcliff.png', flipP2: false, subtitle: 'LCB Sinner · Base Appearance',
    identity: Object.freeze({ id: 'heathcliff-lcb-base', name: 'LCB Sinner · Base Appearance' }),
    egos: Object.freeze([
      Object.freeze({ id: 'none', name: 'No E.G.O · Savage Swing', description: 'U is Groundbreaker; I activates an equipped E.G.O form.' }),
      Object.freeze({ id: 'bodysack', name: 'Bodysack', description: 'Heathcliff E.G.O · Bodysack', preview: 'assets/images/ego/heathcliff/bodysack-preview.gif' }),
      Object.freeze({ id: 'heathcliff-burst', name: 'E.G.O Burst', description: 'Build E.G.O by fighting. Press I to activate the E.G.O form at 100%.' }),
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
