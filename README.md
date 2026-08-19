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
  operator-rigged.glb   the operator (Mixamo rig, rifle included)

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

`public/scene/operator-rigged.glb` (11.5 MB) is the operator on a **Rigify**
skeleton (`DEF-*`). `bonemap.json` maps the 16 control points the scene's proxy
rig drives onto it.

> **The model must be exported in rest / T-pose.** `operator-scene` poses the
> character at runtime: it rebuilds its proxy rig from the real rig's
> measurements, solves IK on the proxy, and retargets the result as *rotation
> deltas from the rest pose*. Give it a rig whose bind pose is already a
> shooting stance and the stance is applied twice — the mesh collapses. The
> giveaway is an asymmetric rest: this rig's hands sit at x = ±0.6162, mirrored.
> `bonemap.mixamo.json` is a ready-made map for the Mixamo re-rig; it binds all
> 16 roles but needs a rest-pose export before it can be used.

A bonemap may also carry three optional keys:

| key | effect |
|---|---|
| `spread` | intermediate spine bones that share the chest's bend |
| `sides` | `"direct"` binds proxy L/R straight to the named bones instead of guessing sides from bone X positions — the guess misreads a rig exported already posed |
| `weapon` | names the weapon and muzzle nodes the model already carries, so the scene hides its procedural block-out rifle and does not load a separate weapon file |

Swapping in a different rig means replacing the GLB and rewriting `bones` — no
code change, as long as the 16 roles can be named and the export is in rest pose.

The rifle is the scene's procedural block-out unless `czbren2.glb` is present
in `public/scene/`, or the model brings its own via the `weapon` key.

If the GLB fails to load, `attachRigged()` bails and the scene falls back to its
procedural proxy rig, a fully jointed IK-solved character built in code.

`vercel.json` deliberately excludes `/scene/` from the SPA rewrite so a missing
asset 404s instead of being served `index.html`.

## Blog images

LinkedIn's media URLs are signed and expire, so hot-linking them left every
tile blank. The images in `public/blog/` were fetched once — LinkedIn serves
`og:image` with a fresh signature to crawler user agents — and are now served
locally, so the tiles no longer depend on a signature.

Post dates come from each post's own id (LinkedIn encodes the creation
timestamp in the high bits), which corrected a set of dates that were a year
behind. To add a post: append the URL, re-run the fetch, and drop the image in.

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
