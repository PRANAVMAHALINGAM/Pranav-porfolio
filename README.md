# Pranav Mahalingam — portfolio (v2)

Vite + React portfolio, redesigned around the **tactical HUD** concept from the
Claude Design project *Tactical HUD portfolio redesign* (`Portfolio.dc.html`).
All content from v1 carries over — nothing was dropped.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

## What the home page is

`/` is a single scrolling HUD rather than a stack of marketing sections:

1. A terminal **boot gate** types out a status log, then waits for any key
   (or 7 seconds) before deploying. It runs once per session — returning to `/`
   from another route skips straight past it.
2. Deploying dispatches `operator:deploy`, which tells `<operator-scene>` to
   assemble a playable third-person operator in a dark hangar —
   **WASD** move, **mouse** aim, **click** fire, **R** reload.
3. The scene broadcasts `operator:hud` each frame; `HudLayer` turns that into
   the ammo counter, magazine strip, crosshair recoil punch and hit markers.
4. Scrolling past the hero fades the hero furniture out and slides the site
   header in, and each section announces itself once in the objective feed.

Seven sections follow: Operator Profile, Mission Log (roles + training),
Loadout (projects), Stat Sheet, Commendations (awards), Field Service
(volunteering) and Comms.

## Layout

```
public/scene/
  operator-scene.js     WebGL custom element (vendored — excluded from lint)
  bonemap.json          proxy-rig → Rigify bone mapping
  operator-rigged.glb   ← not in the repo, see below
  czbren2.glb           ← not in the repo, see below

src/
  data/                 all copy lives here, not in components
    profileData.js        identity, bio, spec sheet, counters, socials
    careerData.js         experience, education, awards, volunteering
    skillsData.js         stat-sheet meters and the stack chips
    projectsData.js       project slots (shared by home, index and detail)
    linkedinPosts.js      blog transmissions
  components/
    hud/                  BootGate, HudLayer, OperatorScene
    Header, Footer, InnerHero, ScrollToTop
  hooks/                  useClock, useHeroFade
  pages/                  Home + the seven router pages
  index.css               design tokens and shared primitives
  styles/hud.css          home-only HUD chrome
  styles/pages.css        sub-page layouts
```

Editing content means editing `src/data/` — the components read from it.
`sectionCopy` in `profileData.js` holds the plain-English gloss for every HUD
callsign ("Commendations / Awards"), used by both the home sections and the
matching routes. A project only renders a SOURCE link when it has a `repo`, and
falls back to a hatched placeholder when it has no `image`.

## Missing 3D assets

`operator-rigged.glb` (~12 MB) and `czbren2.glb` (~2 MB) live in the Claude
Design project but could not be pulled through the design API, which truncates
file reads at 256 KiB. Download both and drop them in `public/scene/`.

Until then the scene still runs: `attachRigged()` bails when the GLB fails to
load and you get the procedural proxy rig — a fully jointed, IK-solved
character built in code. The weapon falls back the same way. The only symptom
is a couple of loader errors in the console, which disappear once the files are
in place.

`vercel.json` deliberately excludes `/scene/` from the SPA rewrite so a missing
asset 404s instead of being served `index.html`.

## Theming

Every accent tint is `color-mix`ed off a single `--accent` token in
`src/index.css`, so changing that one value re-themes the whole site. Pass a
matching `accent` prop to `<OperatorScene>` to carry it into the 3D scene.

## Accessibility and small screens

- Below 860px the hero collapses to a stacked column and the pointer-driven HUD
  furniture (crosshair, ammo panel, control hint) comes off; the nav becomes a
  drop panel.
- `@media (hover: none)` drops the crosshair and fire HUD on touch devices.
- `prefers-reduced-motion` neutralises the scanline drift, grain, blips and
  card tilts.
- The system cursor is only hidden once a pointer has actually moved, so
  keyboard and touch visitors never lose it.

## Known lint noise

`npm run lint` reports `'motion' is defined but never used` on the pages that
use `framer-motion`. The ESLint config has no `eslint-plugin-react`, so
`no-unused-vars` does not count `<motion.div>` as a reference. This predates v2
(the same errors are on `main`) and is fixed by adding `eslint-plugin-react`
and enabling `react/jsx-uses-vars`.
