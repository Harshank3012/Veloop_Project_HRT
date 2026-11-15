# VELOOP Royal Level Roadmap Redesign

This update redesigns the separate `/Lvl-Dashboard/roadmap` page with a premium royal / gamified presentation.

## Updated
- Royal Ascension hero panel with level progress and XP-to-next-level indicator.
- Gold, bronze and violet ambient background layers.
- Premium stat panels for total XP, current level and current rank.
- Ornamental roadmap stage container and richer card frames.
- Enhanced hover, depth, glow and responsive spacing.
- Mobile layouts for the hero and stats.

## Deliberately unchanged
- All rank badge image files are byte-for-byte unchanged.
- `RankEmblem` component and its visual artwork are unchanged.
- Badge order, level ranges, rank states, XP calculations and flip-card interactions are unchanged.

Both app copies are updated:
- `src/`
- `Veloop_Project_demo/src/`

## Build and deploy
Run `npm install` and `npm run build` in the app folder selected as the Vercel Root Directory. Commit and push the update, then redeploy.
