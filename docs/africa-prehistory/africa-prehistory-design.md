# Africa Prehistory — Paths of Many (Design Doc)

Overview

- A point‑and‑click discovery game about Africa’s prehistory and early histories, centering communities and social
  safety nets, trade/exchange, and knowledge transmission. It contrasts diverse regions and paths of development without
  treating the continent as a monolith. Tone: curious, respectful, engaging; truthful about harms without graphic
  depiction.

Goals (MVP)

- Teach how cooperation, environment, and exchange shaped daily life and innovation across regions.
- Show that change is collective: many hands, shared practices, and structures matter.
- Provide replayable puzzles and reflective choices with moral guardrails.

Packs (themed, modular; 3 scenes + wrap)

- Sahara & Sahel Pathways (SS) — Oases networks, pastoral routes, early metallurgy.
- Forests & Rivers — Congo/Niger (FR) — River travel, trade, forest knowledge, games.
- Rift & Horn — Great Rift/Horn of Africa (RH) — Highland terraces, monsoon ports, scripts.
- Great Lakes & Highlands (GL) — Cattle cultures, ironworking, banana/enset gardens, courtyards.
- Coasts & Crossings — Atlantic/Indian (CC) — Navigation, currents, dhow/canoe hubs, cultural blends.

Replayability

- Medals Bronze/Silver/Gold; remix seeds change clue placements and codes.
- “Community Web” meter reflects cooperation/safety choices within a pack.

Gameplay & UX

- Hotspots with keyboard/focus; 44px min targets; captions for SFX; reduced‑motion stills.
- Mini‑puzzles: assemble, sequence, route‑plan, ledger balance, map‑match.
- Dialogue choices change flavor and flags; no fail traps.

Stack & Architecture

- Next.js 16 + React 19; route `/games/africa-prehistory` (Upcoming until playables land).
- Scene registry per pack; localStorage save `afp:save:v1` with remix seed and medal tallies.

Data model (sketch)

- `PackId = SS|FR|RH|GL|CC`
- `SceneId` per pack, e.g., SS1, SS2, SS3, SS‑W
- Save:
  `{ pack, scene, flags: { [pack]: { [key]: value } }, seed:number, medals:{[packOrScene]:'bronze'|'silver'|'gold'}, codex:{entries:string[]} }`

Acceptance Criteria (MVP docs + stubs)

- Five packs documented; at least one pack (SS) fully storyboarded for MVP vertical.
- Community Web meter spec and accessibility considered (reduced‑motion, captions).
- Stories tracker entries complete with flags, guardrails, assets lists.

Sensitivity & moral guardrails

- Non‑monolithic: region‑specific terms and examples; avoid homogenizing language.
- Truthful about violence/oppression; non‑graphic, contextualized; focus on community resilience and structures.
- Avoid caricature; schematic/abstract visuals; neutral color palettes; captions include context notes.

Scenarios (high‑level)

Sahara & Sahel Pathways (SS)

- SS1 Oasis Caravan Circle — Goal: water rules, rest, and news exchange keep everyone safe.
    - Puzzle: bucket‑chain and water ledger; fairness flags `ss1.splitPolicy`.
- SS2 Copper to Iron — Goal: smelting knowledge spreads via traveling smiths and apprentices.
    - Puzzle: furnace assembly steps; temperature balance; flag `ss2.method`.
- SS3 Wayfinding Across Dunes — Goal: stars, winds, and dunes; teams plan dawn/dusk marches.
    - Puzzle: route‑plan under heat constraints; flag `ss3.route`.
- Wrap: award `collect_ss_badge.svg`; reflection on shared rules.

Forests & Rivers — Congo/Niger (FR)

- FR1 River Canoe Post — Goal: exchange station for salt, fish, beads, stories.
- FR2 Forest Knowledge — Goal: edible/medicinal plants and safe paths.
- FR3 Mancala & Math — Goal: games encode counting and planning.
- Wrap: `collect_fr_badge.svg`.

Rift & Horn (RH)

- RH1 Highland Terraces — Goal: soil/water care via terraces.
- RH2 Port Monsoons — Goal: seasonal sailing calendars and harbor care.
- RH3 Scripts & Scrolls — Goal: scripts as knowledge webs.
- Wrap: `collect_rh_badge.svg`.

Great Lakes & Highlands (GL)

- GL1 Cattle & Commons — Goal: pastoral rules, care, and sharing.
- GL2 Iron & Gardens — Goal: iron tools and enset/banana gardens.
- GL3 Courtyard Justice — Goal: mediation and social safety.
- Wrap: `collect_gl_badge.svg`.

Coasts & Crossings — Atlantic/Indian (CC)

- CC1 Currents & Canoes — Goal: navigation, outrigger craft.
- CC2 Dhows & Markets — Goal: Indian Ocean hubs, cultural blends.
- CC3 Tides & Safety — Goal: coastal watch and fire codes.
- Wrap: `collect_cc_badge.svg`.

Implementation Tasks (summary)

- Docs (this pass): design, EN+FR brief, stories tracker with detailed entries.
- Eng (MVP later): scene registry + save; Community Web meter; one pack playable slice (SS).
- QA: Playwright smoke for SS wrap path; RTL for meter reducer.

Suggestions — additional stories & functionality

- Stories: rock art mapping; beadwork routes; lake fisheries cooperatives; island crossings; desert gardens.
- Functionality: timeline overlay linking to Human History; per‑scene sources modal; “Deeper Context” toggles; content
  notes.