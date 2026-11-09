# VELOOP Level Page — Premium Gaming Redesign

## What changed
- Reworked the Level page visual system with a dark indigo/purple fantasy-gaming palette, layered ambient lighting, glass-style panels, refined typography, and stronger section hierarchy.
- Updated the hero rank showcase to use the actual tier emblem artwork and dynamic current level/rank values.
- Updated the current-level identity panel to use the same rank artwork.
- Cleaned the seven rank artwork files to remove the roadmap caption strip and excess connector fragments from the exported crops.
- Enlarged and aligned roadmap emblems, rank names, status pills, and level ranges.
- Added distinct current/completed/locked treatments, hover feedback, glow, and restrained entrance animations.
- Updated navigation styling to match the gaming theme.
- Kept XP calculation, localStorage keys, level progression, rewards, badge unlocks, missions, XP Catcher, and routes intact.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

This archive intentionally excludes `node_modules`; install dependencies on the target machine with `npm install`.

## Rank collection refinement
- Expanded the desktop rank roadmap into a seven-rank collectible gallery, with four-column tablet and two-column mobile layouts.
- Added rank-specific metallic accent frames, inset crest borders, a moving light sweep on hover, and stronger dimensional shadows.
- Gave the active rank a restrained breathing glow and a brighter double-edge treatment; completed ranks use a subtle achievement tint, while locked ranks remain visibly subdued.
- Preserved the existing roadmap selection interaction and all progression/storage logic.
