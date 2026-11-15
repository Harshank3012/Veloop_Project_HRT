# VELOOP Badge Position Stability Update

## What changed
- Added a fixed-size hero badge artboard for every rank tier.
- Anchored the artwork to the same bottom baseline with `object-position: center bottom`.
- Applied matching desktop, tablet and mobile dimensions.
- Prevented hover transforms from shifting the hero badge artwork.
- Kept the halo, pedestal artwork, badge colors and original PNG assets unchanged.

## Files changed
- `src/components/LevelDashboard/RankEmblem.module.css`
- `src/components/LevelDashboard/LevelDashboard.module.css`

## Assets
All rank emblem PNG files are preserved byte-for-byte.

## Build
Run `npm ci` and `npm run build` from this project root before deploying.
