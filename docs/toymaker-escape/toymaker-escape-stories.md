# Toymaker Escape — Stories & Scenarios Tracker

Purpose

- Single source to describe, review, and iterate episodic stories/puzzles. Novice‑friendly language with expert review
  fields and moral guardrails.

Related docs

- Design: docs/toymaker-escape/toymaker-escape-design.md
- Designer brief: docs/toymaker-escape/toymaker-escape-designer-brief.md

Status key

- Idea → Draft → Ready for Art → Integrated → Polished

Index

- Episodes
    - [E1 House, Part 1 — Workshop & Playroom](#e1-house-part-1--workshop--playroom) — Status: Draft — Owner: Narrative
    - [E2 House, Part 2 — Office & Secret Stair](#e2-house-part-2--office--secret-stair) — Status: Draft — Owner:
      Narrative
    - [E3 Apartment Mystery — The Commissioner Is… You](#e3-apartment-mystery--the-commissioner-is-you) — Status:
      Draft — Owner: Narrative

Story Template

- ID/Name:
- Goal (one line):
- Rooms:
- Hooks:
- Core beats:
- Puzzles (and variants for replay):
- Choices & flags:
- Kindness & accessibility guardrails:
- Assets needed (link to brief):
- Copy notes (tone hints):
- Open questions:
- Fact‑check notes:
- Review checklist: Content ✓ / Kindness ✓ / Accessibility ✓ / Art Ready ✓ / Integrated ✓

## E1 House, Part 1 — Workshop & Playroom

- Goal: Learn core interactions; collect first Key Fragment.
- Rooms: Workshop, Playroom hub, Locked Hall.
- Hooks: whimsical gears; color sorter; music box that hums a friendly motif (captioned).
- Core beats:
    - Explore Workshop: align gears OR tune music box to unlock a plate.
    - Enter Playroom: sort toys by color/shape to reveal hidden latch.
    - Obtain Key Fragment 1 and glimpse an unsigned note mentioning “a promise made.”
- Puzzles:
    - Gear alignment (variant seeds: gear tooth counts); Music box combo (variant seeds: 3‑note permutations).
    - Sorter (variants: shapes vs. colors).
- Choices & flags: `e1.path = gears|music`; `e1.helper = hints|noHints`.
- Guardrails: No time pressure; large targets; clear undo; reduced‑motion stills for gear turns.
- Assets: see brief E1.
- Copy notes: “Puzzles are kinder when we try things together.”
- Fact‑check: Neutral iconography; avoid brand shapes.

## E2 House, Part 2 — Office & Secret Stair

- Goal: Access office; discover who commissioned the house setup.
- Rooms: Office, Files Nook, Stairwell.
- Hooks: rotating cipher wheel; out‑of‑order folders; light‑and‑shadow safe.
- Core beats:
    - Decode a letter (correspondence cipher) OR open a shadow safe (lamp angles).
    - File letters in order to reveal Key Fragment 2.
    - Find a note that implies an external commissioner…
- Puzzles: cipher (variant keys), filing (rules change per seed), shadow safe (3 cards positions).
- Choices & flags: `e2.route = cipher|shadow`; `e2.trustNote = true|false`.
- Guardrails: Captions for audio; sliders accessible via keyboard; no jumpscares.
- Assets: see brief E2.
- Copy notes: “Evidence first, stories second.”

## E3 Apartment Mystery — The Commissioner Is… You

- Goal: Piece together your own arrangement with your partner; understand the playful consent and memory condition.
- Rooms: Entry, Living Room, Study, Kitchen.
- Hooks: plant schedule; memory wall; fridge letters; gentle ambient loop (captioned).
- Core beats:
    - Entry: find spare key and a consent card dated earlier.
    - Living: arrange photo tiles to reveal a message about cycles.
    - Study: read journal fragments clarifying the request to the toymaker.
    - Kitchen: solve fridge anagram; choose who to share the truth with first.
- Puzzles: environment locks with permutations; memory wall sequence; anagram permutations.
- Choices & flags: `e3.share = partner|journal`; `e3.keepGame = yes|no`.
- Guardrails: Gentle phrasing; explicit consent artifact; reduced‑motion.
- Assets: see brief E3.
- Copy notes: “When memories loop, we can make kindness loop too.”

Suggestions (Additional Scenarios)

- E4 Rooftop Observatory — star pattern lock; tie‑in with Systems: Space.
- E5 Harbor Workshop — tide clock and buoy sound matcher (captioned); tie‑in with Systems: Ocean.
- Short mysteries: Toy Fair Heist; Clockmaker’s Apprentice.
