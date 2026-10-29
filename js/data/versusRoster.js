/** Local Versus roster. New characters can be added here without changing the selection UI. */
export const VERSUS_ROSTER = Object.freeze({
  don: Object.freeze({
    id: 'don', name: 'Don Quixote', drawKey: 'don', maxHp: 300,
    subtitle: 'LCB Sinner · Base Appearance',
    identity: Object.freeze({ id: 'don-lcb-base', name: 'LCB Sinner · Base Appearance' }),
    egos: Object.freeze([
      Object.freeze({ id: 'none', name: 'No E.G.O · Justice', description: 'U uses the normal Justice sweep.' }),
      Object.freeze({ id: 'la-sangre', name: 'La Sangre de Sancho', description: 'Build E.G.O by fighting. U manifests La Sangre de Sancho at 100%.' }),
    ]),
  }),
  heathcliff: Object.freeze({
    id: 'heathcliff', name: 'Heathcliff', drawKey: 'heathcliff', maxHp: 320,
    subtitle: 'LCB Sinner · Base Appearance',
    identity: Object.freeze({ id: 'heathcliff-lcb-base', name: 'LCB Sinner · Base Appearance' }),
    egos: Object.freeze([
      Object.freeze({ id: 'none', name: 'No E.G.O · Savage Swing', description: 'U uses Heathcliff’s standard heavy swing.' }),
      Object.freeze({ id: 'heathcliff-burst', name: 'E.G.O Burst', description: 'Build E.G.O by fighting. U manifests the E.G.O attack at 100%.' }),
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
