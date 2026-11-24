# VELOOP Level Page — Manager Review Update

## What changed

- Reworked the Level Dashboard hero into a player identity panel with current rank, current level, total XP, and XP needed for the next level.
- Added a dedicated horizontal Level Journey containing all seven rank tiers: Bronze Explorer, Silver Adventurer, Gold Champion, Platinum Master, Diamond Elite, Legendary, and Transcendent.
- Reused the project's seven supplied rank emblem artworks and applied tier-specific colour treatments, glow, rank labels, and completed/current/locked states.
- The current rank is automatically brought into view and shows a live XP progress bar and remaining XP.
- Added horizontal scroll controls, touch-friendly scrolling, scroll snapping, keyboard focus styling, and responsive card sizing.
- Refined the dashboard hero, overview cards, spacing, borders, and mobile layout while retaining existing XP progression, reward display, XP Catcher, celebrations, and routes.

## Level configuration

The seven rank ranges follow the existing project configuration:

- Bronze Explorer: Levels 1–10
- Silver Adventurer: Levels 11–20
- Gold Champion: Levels 21–35
- Platinum Master: Levels 36–50
- Diamond Elite: Levels 51–75
- Legendary: Levels 76–100
- Transcendent: Level 101+

XP progression continues to use the existing `XP_PER_LEVEL` value (1,500 XP per level). No backend reward values or eligibility rules have been invented.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Verification note

The source changes are included. A fresh production build could not be completed in the packaging environment because dependency installation timed out and Vite was therefore unavailable. Run the commands above locally before deployment and check `/Lvl-Dashboard` at mobile, tablet, and desktop widths.
