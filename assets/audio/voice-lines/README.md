# Voice-line assets

## Imported Don Quixote voice pack

The user-supplied `LCB Sinner-20261029T151211Z-1-001.zip` voice archive is imported without renaming into:

`assets/audio/voice-lines/don-lcb/`

The source filenames are preserved. `don-lcb/voice-manifest.json` maps each source file to its display label and catalog key. The runtime catalogue is `js/data/voiceLines.js`; it distinguishes:

- **Combat attacks:** `battle_s2_10301_1.wav` is assigned to K / Gallop (Skill 2); the three `battle_s3_...wav` clips rotate on U / Justice (Skill 3).
- **Combat events:** battle entry, subsequent round, victory, defeat, and non-final enemy kills.
- **Lobby ambient:** morning/noon/night greetings, smalltalk variants, and neglect.
- **Context-specific lines:** selection, formation, ally dead, break, end command, obtain/get, choice success/failure, and enemy break are catalogued for future matching systems. They are not played by an unrelated event just to force them into the current mode.

The supplied archive contains no `battle_s1` voice clip, so J / Joust keeps its existing local mapping rather than assigning a semantically unrelated file.

## Add more voice lines

1. Copy clips into `assets/audio/voice-lines/<character-id>/`.
2. Add the relative path to `js/data/voiceLines.js` under the right `attacks`, `events`, or `ambient` bucket.
3. Add a `voiceLine` record to `assets/data/limbus-library/catalog.json` if you want the clip indexed in the content browser/data tools.

The game does not scan folders automatically; paths are registered explicitly so missing files can be tested.
