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
public/blog/            post images, pulled once from LinkedIn (see below)
public/scene/
  operator-scene.js     WebGL custom element (vendored — excluded from lint)
  bonemap.json          proxy-rig → Rigify bone mapping
  operator-rigged.glb   the operator (Rigify rig, rest pose)
  czbren2.glb           the CZ Bren, extracted from the posed export

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
matching routes.

Projects are filtered by whether they have a public repo: the home loadout
shows only `openSourceProjects`, while `/projects` shows everything via
`projectsByRepoFirst`, which leads with the ones you can go read. A project
falls back to a hatched placeholder when it has no `image`.

## The 3D model

`public/scene/operator-rigged.glb` (11.2 MB) is the operator exported from
Blender **already posed** — rifle shouldered, hands on the grips, the CZ Bren
parented to `mixamorig:RightHand` with a `MUZZLE` marker on it.

**The pose is the art. The scene never rewrites a bone.** An earlier version
rebuilt a proxy skeleton, solved IK to put the hands on the weapon and
retargeted the result every frame. That needs a rig exported in T-pose — give it
a posed one and the stance gets applied twice and the mesh collapses — and even
on the right rig the stance took constant tuning. It is gone.

What is left only ever adds small offsets on top of the exported pose:

| channel | what moves |
|---|---|
| aim | root yaw, plus a little chest yaw and pitch |
| walk | root bob, a shallow thigh and knee swing |
| breathe | a slow sine on the chest |
| recoil | a kick on the weapon node, in the weapon's own axes |

Because the baked pose is always the rest those offsets are measured from,
nothing here can deform the character. `bonemap.json` names the eight bones the
scene may nudge and the weapon and muzzle nodes; everything else in the skeleton
is left exactly as exported. The scene also self-calibrates on load: it stands
the model on the floor from its own bounding box, derives the barrel direction
from the muzzle marker, and records the angle between the barrel and the body so
aiming points the muzzle at the cursor rather than the sternum.

Swapping in a different operator means replacing the GLB and, if the bone names
differ, editing `bones`. Pose it however you like — posed is what this wants.

If the GLB fails to load the hangar still renders; the character simply never
appears.

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
