# Limbus content and voice-line pipeline

This project now has two separate extension points:

1. `js/data/voiceLines.js` + `js/utils/VoiceLineManager.js` for character voice playback.
2. `assets/data/limbus-library/catalog.json` + `js/data/LimbusContentLibrary.js` for searchable character/Identity/E.G.O/skill/passive/enemy/stage/asset metadata.

The two Google Drive folder pages could not be enumerated in the current environment. The user separately supplied an `LCB Sinner` Don voice archive, which has now been imported locally with original filenames preserved. The rest of the Drive folders have not been imported, and their contents are not guessed.

## Add Don voice lines

1. Copy the supplied audio files into `assets/audio/voice-lines/don/` (or another descriptive subfolder).
2. Open `js/data/voiceLines.js`.
3. Add paths to `VOICE_LINE_CATALOG.don.attacks` for move callouts or `VOICE_LINE_CATALOG.don.events` for `encounterStart`, `roundStart`, `hurt`, `block`, `evade`, `victory`, `defeat`, or `taunt`.
4. The manager rotates through multiple clips in order and clones Audio elements on playback, so overlapping cues do not rewind each other. Attack lines fire when a move starts; reaction lines fire when the event buckets are populated.

The current project has the following live mapping:
- J / Joust keeps its pre-existing local mapping because the supplied archive contains no `battle_s1` clip.
- K / Gallop uses `battle_s2_10301_1.wav`.
- U / Justice cycles through the three `battle_s3_10301_1_*.wav` callouts.
- Round 1 uses `battleentry`; later rounds use `formation`; victory rotates `battle_clear` and `battle_clear_ex`; defeat uses `battle_defeat`; non-final kills use `battle_kill`.
- Clicking Story Mode plays a time-of-day lobby voice; returning from Story Mode plays a rotating smalltalk line.
- Selection, get/obtain, choice results, neglect, ally-dead, break, enemy-break, and command-end are registered in the catalogue but intentionally not auto-played until the corresponding mechanic exists.

## Add content records

Edit `assets/data/limbus-library/catalog.json` and append records under `records`.

Supported `type` values:

- `character`, `identity`, `ego`, `skill`, `passive`, `enemy`, `status`, `stage`, `asset`, `voiceLine`.

Every record needs a stable `id`, a `type`, and a display `name`. Optional fields such as `characterId`, `skillIds`, `assetPaths`, `tags`, `input`, `moveId`, `animationKey`, and `voiceLineKey` are free-form metadata. Keep asset paths relative to the project root.

Example:

```json
{
  "id": "identity.example-id",
  "type": "identity",
  "name": "Example Identity",
  "characterId": "example-character",
  "assetPaths": { "portrait": "assets/limbus-library/example/portrait.png" },
  "skillIds": ["skill.example.one"],
  "source": "local-import"
}
```

After the page loads, await `window.DonLimbusLibraryReady` before querying `window.DonLimbusLibrary`. The library exposes `get(id)`, `list(type)`, `search(query, { type, limit })`, `upsert(record)`, `remove(id)`, and `exportJSON()`. `upsert`/`remove` save a local browser override in localStorage; to make an edit part of the project for every user, commit it to the JSON catalogue.

## Import the shared Drive folders later

After the folder files are supplied locally, preserve exact filenames and IDs. Keep original media in a distinct asset subfolder, add records/voice paths explicitly, and avoid merging files solely because their display names look similar. Audio files, sprites, and data metadata remain separate so the same entry can reference several asset types.


## Imported audio inventory

The original 27 WAV files from the supplied `LCB Sinner` archive are stored at `assets/audio/voice-lines/don-lcb/`. All 27 are indexed in `assets/data/limbus-library/catalog.json` as `voiceLine` records. The test `tests/don-voice-pack.test.mjs` checks every expected filename and the live skill mappings.
