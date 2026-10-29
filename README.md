# NAoya-style Hub

Clean-room UI recreation based on the layout and interaction pattern of the provided reference website.

Open `index.html` in a browser or run:
`python3 -m http.server 8000`

Then visit `http://localhost:8000`.

Customize the text in `index.html`, colors/layout in `style.css`, and behavior in `script.js`.


Gallery v8: the Gallery tab uses a vanilla JavaScript 3D depth carousel with drag/swipe, keyboard arrows, navigation buttons, auto-advance, dots, and click-to-preview.

## Dark Glitch Hover v11
Keeps the existing dark Naoya Hub design and replaces purple hover glow on interactive UI with a CSS-only cyan/red glitch effect. No Persona 1 restyle was applied.

## v12 — Video-inspired glass UI
Dark atmospheric background + translucent glass dashboard cards inspired by the supplied screen recording. Existing Discord status, Facebook link, Depth Carousel, full Notepad, AFK rolling counter, Elastic Sliders, audio player and glitch hover are retained.


## v13 — Video background + refined glitch
- Uses `assets/video/hu-tao-background.mp4` as a fullscreen looping background.
- Source video was converted to browser-friendly H.264 1080p/30fps for smoother web playback.
- Hover glitch now uses short RGB split/slice/scan bursts instead of constant shaking.
- Existing Discord, Facebook, Depth Carousel, Elastic Slider, AFK Counter and Notepad features remain unchanged.

Performance v14: background video is optimized to 720p/24fps, fullscreen CSS video filters are removed, glass blur is reduced, and the background video pauses while the tab is hidden.


V15: Added a draggable/clickable profile-sidebar handle. On desktop it collapses to a compact icon rail; on tablet/mobile it tucks the profile drawer away. Main page content is constrained and centered for better focus.

## v16 mobile/performance pass
- Mobile/data-saver/low-memory devices use the Hu Tao poster instead of decoding the background video.
- Desktop keeps the animated background.
- Heavy backdrop blur is reduced to 0–2px on content cards.
- Touch devices disable glitch hover animation.
- Gallery carousel autoplay runs only while Gallery/Artwork is actually visible, and is disabled on touch/mobile.
- Discord presence polling reduced to every 45 seconds.
- Mobile UI now uses a compact profile header, collapsible profile/BGM area, centered content, and fixed bottom navigation dock.


## v17 light-mode optimization
- Rebalanced light mode so the Hu Tao background remains visible instead of being washed out by white overlays.
- Replaced flat white surfaces with cool translucent gray glass using no additional backdrop blur.
- Improved typography, border, nested-card and social-link contrast.
- Reworked light-mode navigation/hover to use neutral surfaces plus the existing cyan/red glitch accent instead of purple wash.
- Added dedicated light-mode styling for the v16 mobile bottom navigation, topbar and compact profile/BGM header.
- Kept the v16 performance rules: no extra continuous animations or expensive blur passes.

Discord Avatar v18: the loader/profile avatar now syncs from the existing Lanyard Discord presence response for user 869568513864519690. The local avatar remains as fallback if Discord data is unavailable.


Game Project link update: the Limbus Feel the Don card opens https://feed-the-don.vercel.app/ in a new tab. The game itself is not bundled into this Naoya Hub package.

Game Project v20: the live URL stays on the left side of the Limbus Feel the Don card while the PLAY button is pinned to the far-right corner of the same action row. No game source is embedded.

## v21 — Interactive companions

Open the **✦ PET** button in the top bar to choose Don Quixote or Naoya Plush.
- Click/tap the character for a random Vietnamese line.
- Drag with a mouse or finger to place the character. Dragging pauses roaming; turn **Tự đi dạo** on to resume.
- After 25 seconds without activity the character rests; after 60 seconds it sleeps. Interacting with the page wakes it.
- Character, visibility, roaming preference and dragged position are saved on this browser when local storage is available.
- **Về góc màn hình** resets its position; **Chơi cùng Don** opens the existing game in another tab.
- Mobile uses a smaller character above the navigation dock. Reduced-motion preferences disable breathing/hopping and automatic roaming. Hidden browser tabs pause roaming.
- The source pictures are still images: movement uses CSS translation/rotation, not a frame-by-frame walk sprite.

Files added: `companion.js`, `companion.css`, `assets/companions/don.png`, `assets/companions/plush.png`. Only two imports were added to `index.html`. Existing music, notes, gallery and AFK logic were left intact.

To install this update into an existing checkout, copy those four new files/folders and the updated `index.html`. Keep your existing Git repository. Or use the whole extracted folder as your static website source. No build step or added npm packages are required. Deploy via your existing Vercel workflow. This archive itself has not been deployed.

To customize: edit `characters` near the top of `companion.js` for labels, image paths and dialogue. CSS controls display sizes (116px desktop / 88px mobile). Idle thresholds are 25000 and 60000 milliseconds in `tick()`.

Artwork: the two user-supplied images were processed with the built-in ImageGen tool to create transparent-background assets. Generation can make small visual differences from the originals. Edit instructions: remove only the white background (and floor shadow for the plush); preserve character identity, silhouette, colors, face, pose, clothing and linework/fabric texture; no new elements or text; one full character centered with a small transparent margin.
