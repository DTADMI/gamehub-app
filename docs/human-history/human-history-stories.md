# Human History — Many Hands Make History (Stories & Scenarios Tracker)

Purpose

- Track all scenarios and their review status; ensure focus on communities, mutual aid, and structures behind change.
- Enable expert review and iteration; novice‑friendly and transparent.

Related docs

- Design Doc: docs/human-history/human-history-design.md
- Designer Brief (EN+FR): docs/human-history/human-history-designer-brief.md

Status key

- Draft, Review, Ready for Art, In Art, Ready for Eng, In Dev, QA, Shipped

Packs overview (each 3 scenes + wrap)

- Origins of Cooperation (origins) — O1–O3 + Wrap
- River Civilizations Across Continents (rivers) — R1–R3 + Wrap
- Trade & Ideas on the Move (trade) — T1–T3 + Wrap
- Everyday Safety & Care (safety) — S1–S3 + Wrap
- Modern Social Nets (modern) — M1–M3 + Wrap

Index
| ID | Title | Pack | Status | Owner |
|---|---|---|---|---|
| O1 | Savannah Signals | origins | Draft | Narrative |
| O2 | Shore Exchange | origins | Draft | Narrative |
| O3 | Painted Memory | origins | Draft | Narrative |
| OR-W | Origins Wrap | origins | Draft | Narrative |
| R1 | Nile Granary | rivers | Draft | Narrative |
| R2 | Indus Town Plan | rivers | Draft | Narrative |
| R3 | Yellow River Dykes | rivers | Draft | Narrative |
| R-W | Rivers Wrap | rivers | Draft | Narrative |
| T1 | Indian Ocean Dhows | trade | Draft | Narrative |
| T2 | Silk Roads Caravanserai | trade | Draft | Narrative |
| T3 | Trans‑Saharan Caravans | trade | Draft | Narrative |
| T-W | Trade Wrap | trade | Draft | Narrative |
| S1 | Fire Codes & Watch | safety | Draft | Narrative |
| S2 | Well & Qanat Coop | safety | Draft | Narrative |
| S3 | Guild Mutual Aid | safety | Draft | Narrative |
| S-W | Safety Wrap | safety | Draft | Narrative |
| M1 | Public Health Drives | modern | Draft | Narrative |
| M2 | Labor Safety Standards | modern | Draft | Narrative |
| M3 | Disaster Mutual Aid | modern | Draft | Narrative |
| M-W | Modern Wrap | modern | Draft | Narrative |

Story template

- Goal
- Age framing
- Hook
- Core beats (3–6)
- Puzzles/Interactions
- Choices/Flags
- Kindness/Accessibility guardrails
- Assets
- Copy notes
- Open questions
- Fact‑check notes
- Review checklist

Detailed entries

O1 Savannah Signals (origins)

- Goal: Show early cooperative safety (watch signals, shared roles) among foragers in East Africa.
- Age: 9–12, 15+ “Deeper Context” toggles for anthropology notes.
- Hook: Night fires flicker across the plain; the camp weaves signals for safety and gathering.
- Beats: watch posts volunteer; choose smoke pattern; coordinate water run; share food.
- Puzzles: sequence smoke/fire patterns; plan path avoiding hazards.
- Flags: `o1.signalPattern`, `o1.role = watcher|runner|cook`.
- Guardrails: no graphic harm; acknowledge predators/environmental risk abstractly.
- Assets: `bg_origins_o1.avif`, `prop_origins_o1_fire_signals.svg`, `ui_origins_meter.svg`.
- Copy: explain many hands maintain safety net; no hero.
- Open: phrasing for signals; alt text.
- Fact‑check: anthropological sources on signaling and roles.
- Review: beats scoped; assets listed; captions prepared.

O2 Shore Exchange (origins)

- Goal: Show cooperative exchange and kin links along shores.
- Hook: Low‑tide reveals a meeting beach; groups trade shells, stories, and routes.
- Beats: gather fair bundles; greet with ritual; map currents; share safe camp spots.
- Puzzles: bundle‑balancing; current map matching.
- Flags: `o2.bundleFairness`, `o2.mapRoute`.
- Guardrails: abstract trade; avoid caricature; include context captions.
- Assets: `bg_origins_o2.avif`, `prop_origins_o2_shell_tokens.svg`.
- Fact‑check: coastal exchange evidence.

O3 Painted Memory (origins)

- Goal: Knowledge transmission via art and song.
- Hook: Cave wall beckons; you layer safe‑path marks and seasonal notes.
- Beats: choose pigments; recall landmarks; teach newcomers.
- Puzzle: memory wall ordering; rhythm echo call‑and‑response.
- Flags: `o3.memoryOrder`, `o3.teach = signs|song`.
- Guardrails: respectful, schematic art.
- Assets: `bg_origins_o3.avif`, `prop_origins_o3_ochre_pigment.svg`.

OR-W Wrap — Origins

- Goal: Reflect on cooperation web; award badge.
- Puzzle: place strands in Community Web.
- Output: `collect_origins_badge.svg`.

R1 Nile Granary (rivers)

- Goal: Community grain storage and flood planning.
- Hook: Nilometer rises; decide storage split.
- Beats: measure; allocate; guard; share.
- Puzzle: allocation logic; flood graph reading.
- Flags: `r1.splitPolicy`.
- Sensitivity: acknowledge inequality risks; emphasize communal rules.

R2 Indus Town Plan (rivers)

- Goal: Sanitation and grid planning.
- Puzzle: pipe/grid assembly; waste flow sorting.
- Flags: `r2.gridLayout`, `r2.sanitationFocus`.

R3 Yellow River Dykes (rivers)

- Goal: Collective labor to manage floods.
- Puzzle: dyke module placement vs. silt; maintenance schedule.
- Sensitivity: discuss displacement risks factually; non‑graphic.

T1 Indian Ocean Dhows (trade)

- Goal: Monsoon navigation and shared wayfinding.
- Puzzle: star chart + monsoon calendar alignment.
- Flags: `t1.routeChoice`.

T2 Silk Roads Caravanserai (trade)

- Goal: Waystations as community safety nets.
- Puzzle: provision balance; shared languages mini.

T3 Trans‑Saharan Caravans (trade)

- Goal: Salt/gold routes and mutual aid.
- Puzzle: water planning; caravan trust web.
- Sensitivity: note enslavement/violence historically; provide context in captions; no graphic imagery.

S1 Fire Codes & Watch (safety)

- Goal: Bucket brigades, firebreaks, night watch.
- Puzzle: layout safe zones; schedule watch shifts fairly.

S2 Well & Qanat Coop (safety)

- Goal: Water access governance.
- Puzzle: flow balance; maintenance rota.

S3 Guild Mutual Aid (safety)

- Goal: Work safety and sick funds.
- Puzzle: dues vs. payouts; safety checklist.

M1 Public Health Drives (modern)

- Goal: Vaccination campaigns and outreach.
- Puzzle: routing; myth‑busting with kindness.
- Sensitivity: portray real disease impact factually; neutral visuals; captions.

M2 Labor Safety Standards (modern)

- Goal: Standards emerge from many voices.
- Puzzle: identify hazards; policy drafting; vote.

M3 Disaster Mutual Aid (modern)

- Goal: Community response networks.
- Puzzle: map needs; resource matching; radios with captions.

Modern Wrap

- Badge award and reflection: many hands make history.

Universal Review Checklist

- Beats and puzzle logic clear; flags defined and stored.
- Accessibility: captions provided; reduced‑motion stills defined.
- Sensitivity: context captions added where harm/violence discussed; abstracted visuals.
- Assets list complete; copy notes drafted; fact‑check sources linked.

Changelog

- v1: Initial packs and detailed entries added.
