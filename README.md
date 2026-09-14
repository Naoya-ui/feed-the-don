# Raise Don Quixote — HTML Edition

This is a browser remake of the uploaded Ren'Py prototype.

## Run

Open `index.html` directly, or for the most consistent browser behavior run a small local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Included systems

- Visual-novel dialogue and choices
- Name input
- Don Quixote expression changes
- Backpack/inventory tutorial
- Potion item and inventory UI
- World map, location/time tracking, unlocks
- Background music and volume control
- Local browser save/load via `localStorage`
- Responsive desktop/mobile layout
- Keyboard shortcuts: Enter/Space advance, number keys choose, `I` inventory, `M` map

## Source-project issues handled in this remake

The Ren'Py source currently has incomplete/broken progression around the map/forest section (including a missing `forest_main` label and quest gates that are never set). The HTML version keeps the existing story text but makes the current demo playable: Town can be visited after it is unlocked, Forest becomes available after the Bus tutorial step, and Forest ends with a neutral “current demo content ends here” message rather than inventing new story.

The uploaded custom font file is intentionally not redistributed in this remake.
