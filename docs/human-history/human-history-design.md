# Human History — Point-and-Click (Design Doc)

Purpose

- Explore the timeline of human history across continents and eras, centering community, cooperation, and social safety.
- Debunk lone-hero myths by showing networks of people, constraints, and shared efforts that make change possible.

Audience & Tone

- Ages 10–15 baseline (readable at 9+); curiosity-first; respectful of cultures; no sensationalism; kindness-forward.
- Moral lens: community care, interdependence, and humility. Avoid glorifying conquest/violence.

MVP Goals

- 12–18 minutes slice (3 scenes + wrap) for one Era Pack; replayable routes and a Codex of “Many Hands” entries.
- Extension-ready structure: multiple Era Packs (3 scenes each) per region/time and an optional Deeper Context toggle.

Core Premise & Narrative Framing

- Player is a traveling “Story Weaver” who visits different places/times. Each scene reveals how tools, ideas, and care
  practices emerge through networks of people. The wrap highlights social safety and mutual aid as historical constants.

Era Packs (examples; all replayable)

- Dawn & Making (Global prehistory)
    - H1 Stone & Sharing: collaborative tool making; resource-sharing choices.
    - H2 Fire & Safety: fire as community tech; roles and norms that keep it safe.
    - H3 Migration Maps: paths and cooperation for long journeys; wayfinding cards.
- Rivers & Writing (Mesopotamia, Nile, Indus, Yellow River)
    - H4 Water & Work: irrigation coordination; calendars; stewardship.
    - H5 Marks & Memory: proto-writing; clay tokens; counting as a shared language.
    - H6 Markets & Fairness: norms, weights/measures; community trust.
- Knowledge & Care (Classical to Early Medieval across regions)
    - H7 Houses of Learning: libraries, translation circles; many hands.
    - H8 Care Networks: midwives, apprentices, healers; exchange of knowledge.
    - H9 Roads & Messengers: routes enabling exchange; safety norms.
- Making & Movements (Early modern to industrial + global South perspectives)
    - H10 Tools & Guilds: craft standards; collective know-how.
    - H11 Printing & Voices: pamphlets/newspapers; community discourse.
    - H12 Mutual Aid & Strikes: organizing for safety and rights.

Gameplay & UX

- Hotspots (keyboard accessible, 44px+) reveal artifacts/people. Mini-puzzles: assemble, match, route, weigh.
- Dialogue choices bias the lens (e.g., “single inventor” vs “collective builders”) and unlock Codex contrasts.
- No fail states; different learnings. Calm UI; captions and reduced-motion stills for any animation.

Replayability Systems

- Per-scene alternate routes; daily shuffle of artifact cards; medals: Bronze (complete), Silver (no hints), Gold
  (Many-Hands bonus found).
- Codex: “Many Hands” entries describe the unseen helpers/factors behind breakthroughs.

Stack & Architecture

- Next.js 16; route `/games/human-history` (client page dynamic import when scaffolded).
- Scene registry pattern shared with Systems Discovery; local save `history:save:v1`.
- Optional `showDeeperContext` flag exposes more nuanced captions.

Data Model (sketch)

- `PackId = DAWN | RIVERS | KNOWLEDGE | MAKING` (extensible)
- `SceneId = H1..H12` grouped by pack; plus `WRAP` per pack.
- Save:
  `{ pack, scene, flags:{ lens:'collective'|'hero', hints:boolean }, codex:{manyHands:string[]}, medals:{[sceneId]: 'bronze'|'silver'|'gold'} }`

Acceptance Criteria (first Era Pack)

- Play through 3 scenes + wrap with accessible hotspots; Codex updates; medals compute; Deeper Context toggles captions.

Implementation Tasks (summary)

- Docs (this file, brief EN+FR, stories tracker EN). Add to README links; add action-plan items.
- Scaffolding (optional later): package, manifest entry (upcoming), route/page stub.
- Content: H1–H3 or H4–H6 scenes with artifacts, puzzles, and Codex entries.

Moral & Sensitivity Guardrails

- Cultural respect, avoid stereotypes, attribute knowledge broadly, include women and marginalized groups.
- Do not present oppression/violence as puzzles; speak calmly about harm and emphasize care responses.

Suggestions — Additional Era Packs

- Oceans & Exchanges (Indian Ocean, Pacific)
- Cities & Commons (pre-colonial Americas, Africa, Asia)
- Repair & Recovery (post-disaster community responses across eras)