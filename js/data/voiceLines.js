/**
 * Local voice-line catalogue for Don Quixote.
 *
 * All paths are relative to index.html. The LCB Sinner (10301) pack was imported
 * from a user-supplied archive; exact audio filenames are preserved under
 * assets/audio/voice-lines/don-lcb/.
 *
 * Only lines with a clear runtime context are auto-triggered. The other named
 * clips remain addressable in the catalogue for future story/selection systems.
 */
const DON_VOICE = 'assets/audio/voice-lines/don-lcb/';

export const VOICE_LINE_CATALOG = Object.freeze({
  don: Object.freeze({
    displayName: 'Don Quixote',
    identity: 'LCB Sinner (10301)',
    attacks: Object.freeze({
      // Joust / Skill 1 did not have a battle_s1 clip in the supplied archive.
      // Keep the existing local callout rather than mis-assigning another voice line.
      joust: Object.freeze(['assets/audio/don-skills/028_donquixote_base_skill1_a_v1.wav']),
      // K / Gallop is the LCB Sinner Skill 2 voice callout.
      gallop: Object.freeze([`${DON_VOICE}battle_s2_10301_1.wav`]),
      // U / Justice cycles the three supplied Skill 3 vocal cues.
      justice: Object.freeze([
        `${DON_VOICE}battle_s3_10301_1_1.wav`,
        `${DON_VOICE}battle_s3_10301_1_2.wav`,
        `${DON_VOICE}battle_s3_10301_1_3.wav`,
      ]),
      // Dedicated La Sangre E.G.O awakening callout from the supplied audio pack.
      laSangre: Object.freeze([
        'assets/audio/don-skills/la-sangre/battle_awaken_20301_1.wav',
      ]),
    }),
    events: Object.freeze({
      encounterStart: Object.freeze([`${DON_VOICE}battleentry_10301_1.wav`]),
      roundStart: Object.freeze([`${DON_VOICE}formation_10301_1.wav`]),
      // There is no generic damage reaction file in this pack, so don't play an
      // unrelated "broken" line on every hit, guard, or evade.
      hurt: Object.freeze([]),
      block: Object.freeze([]),
      evade: Object.freeze([]),
      victory: Object.freeze([
        `${DON_VOICE}battle_clear_10301_1.wav`,
        `${DON_VOICE}battle_clear_ex_10301_1.wav`,
      ]),
      defeat: Object.freeze([`${DON_VOICE}battle_defeat_10301_1.wav`]),
      kill: Object.freeze([`${DON_VOICE}battle_kill_10301_1.wav`]),
      broken: Object.freeze([`${DON_VOICE}battle_break_10301_1.wav`]),
      enemyBreak: Object.freeze([`${DON_VOICE}battle_enemy_break_10301_1.wav`]),
      allyDead: Object.freeze([`${DON_VOICE}battle_allydead_10301_1.wav`]),
      endCommand: Object.freeze([`${DON_VOICE}battle_endcommand_10301_1.wav`]),
      battleSelect: Object.freeze([`${DON_VOICE}battle_select_10301_1.wav`]),
      formation: Object.freeze([`${DON_VOICE}formation_10301_1.wav`]),
      get: Object.freeze([`${DON_VOICE}get_10301_1.wav`]),
      choiceSuccessPositive: Object.freeze([`${DON_VOICE}choice_success_p_10301_1.wav`]),
      choiceSuccessNeutral: Object.freeze([`${DON_VOICE}choice_success_n_10301_1.wav`]),
      choiceFailPositive: Object.freeze([`${DON_VOICE}choice_fail_p_10301_1.wav`]),
      choiceFailNeutral: Object.freeze([`${DON_VOICE}choice_fail_n_10301_1.wav`]),
    }),
    ambient: Object.freeze({
      lobbyMorning: Object.freeze([`${DON_VOICE}lobby_morning_10301_1.wav`]),
      lobbyNoon: Object.freeze([`${DON_VOICE}lobby_noon_10301_1.wav`]),
      lobbyNight: Object.freeze([`${DON_VOICE}lobby_night_10301_1.wav`]),
      smalltalk: Object.freeze([
        `${DON_VOICE}smalltalk_10301_1.wav`,
        `${DON_VOICE}smalltalk_10301_2.wav`,
        `${DON_VOICE}smalltalk_10301_3.wav`,
      ]),
      neglect: Object.freeze([`${DON_VOICE}neglect_10301_1.wav`]),
    }),
  }),
  club: Object.freeze({
    displayName: 'Backstreet Mob',
    attacks: Object.freeze({
      enemyLight: Object.freeze(['assets/audio/enemy/001_backstreet_mob_skill1_a_v1.wav']),
      enemyHeavy: Object.freeze([
        'assets/audio/enemy/002_backstreet_mob_skill2_a_v1.wav',
        'assets/audio/enemy/003_backstreet_mob_skill3_a_v1.wav',
      ]),
    }),
    events: Object.freeze({
      hurt: Object.freeze([]),
      block: Object.freeze([]),
      evade: Object.freeze([]),
    }),
  }),
  wolf: Object.freeze({
    displayName: 'Wolf Boss',
    attacks: Object.freeze({
      wolfSlash: Object.freeze(['assets/audio/enemy/004_backstreet_boss_skill2_a_v1.wav']),
      enemyHeavy: Object.freeze(['assets/audio/enemy/004_backstreet_boss_skill2_a_v1.wav']),
    }),
    events: Object.freeze({
      hurt: Object.freeze([]),
      block: Object.freeze([]),
      evade: Object.freeze([]),
    }),
  }),
  heathcliff: Object.freeze({
    displayName: 'Heathcliff',
    identity: 'LCB Sinner — Base Appearance',
    attacks: Object.freeze({
      skill1: Object.freeze([
        'assets/audio/heathcliff/040_heathclif_base_skill1_a_v1.wav',
        'assets/audio/heathcliff/heathcliff_1_1.wav',
      ]),
      skill2: Object.freeze([
        'assets/audio/heathcliff/041_heathclif_base_skill2_a_v1.wav',
        'assets/audio/heathcliff/heathcliff_2_1-1.wav',
        'assets/audio/heathcliff/heathcliff_2_2.wav',
      ]),
      bodysack: Object.freeze([
        'assets/audio/heathcliff/bodysack/battle_awaken_20701_1.wav',
        'assets/audio/heathcliff/bodysack/battle_awaken_20701_2.wav',
        'assets/audio/heathcliff/bodysack/battle_awaken_20701_3.wav',
        'assets/audio/heathcliff/bodysack/139_heathclif_base_ego-1_a_v1.wav',
        'assets/audio/heathcliff/bodysack/139_heathclif_base_ego-2_a_v1.wav',
      ]),
      ego: Object.freeze([
        'assets/audio/heathcliff/042_heathclif_base_skill3-1_a_v1.wav',
        'assets/audio/heathcliff/042_heathclif_base_skill3-2_a_v1.wav',
        'assets/audio/heathcliff/042_heathclif_base_skill3-3_a_v1.wav',
        'assets/audio/heathcliff/042_heathclif_base_skill3-4_a_v1.wav',
        'assets/audio/heathcliff/042_heathclif_base_skill3-5_a_v1.wav',
        'assets/audio/heathcliff/042_heathclif_base_skill3-6_a_v1.wav',
        'assets/audio/heathcliff/heathcliff_3_2.wav',
        'assets/audio/heathcliff/heathcliff_3_3.wav',
        'assets/audio/heathcliff/heathcliff_3_5.wav',
      ]),
    }),
    // These files are indexed for future use but not auto-played until their exact event is known.
    events: Object.freeze({
      referenceUnassigned: Object.freeze([]),
      hurt: Object.freeze([]),
      block: Object.freeze([]),
      evade: Object.freeze([]),
    }),
  }),
});
