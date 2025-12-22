# Rite of Discovery — Stories & Scenarios Tracker

Purpose

- Single source of truth to describe, review, and evolve all stories/scenarios for Rite of Discovery.
- Usable by newcomers and domain experts to fact‑check details, add/remove beats, and steer tone and direction.
- Cross‑links to the main design (`docs/rite-of-discovery-design.md`) and the Designer Brief (
  `docs/rite-of-discovery-designer-brief.md`).

How to use this document

- Start with the Index below to see status at a glance; each item links to a detailed entry.
- When creating or updating a story, copy the “Story Template” and fill it out clearly with novice‑friendly language.
- Keep kindness, accessibility, and age‑appropriate tone front‑and‑center.
- Use the Review Checklist to prepare for check‑ins with educators/parents/experts.

Related docs

- Main design: docs/rite-of-discovery-design.md
- Asset brief: docs/rite-of-discovery-designer-brief.md

Status key

- Idea → Draft → Ready for Art → Integrated → Polished

Index

- MVP (ages 7–9)
  - [ROD_INTRO Title Card](#rod_intro-title-card) — Status: Integrated — Owner: Narrative
    - [S1 Night Before](#s1-night-before) — Status: Ready for Art — Owner: Narrative
    - [S2 Tooth Tradition](#s2-tooth-tradition) — Status: Ready for Art — Owner: Narrative
    - [S3 Proof Moment](#s3-proof-moment) — Status: Ready for Art — Owner: Narrative
    - [Epilogue — Rite of Passage](#epilogue-rite-of-passage) — Status: Draft — Owner: Narrative
    - [MM1 Mentor Mini — Sibling Helper](#mm1-mentor-mini-sibling-helper) — Status: Draft — Owner: Narrative
  - [ROD_OUTRO Wrap & Replay Hooks](#rod_outro-wrap--replay-hooks) — Status: Integrated — Owner: Narrative
- 12+ “Thinking Tools” (replayable cases)
    - [C1 The Mystery Coupon](#c1-the-mystery-coupon) — Status: Draft — Owner: Narrative
    - [C2 The Echo Thread](#c2-the-echo-thread) — Status: Draft — Owner: Narrative
    - [C3 The Coin‑Flip Streak](#c3-the-coin-flip-streak) — Status: Draft — Owner: Narrative
    - [C4 The Miracle Patch](#c4-the-miracle-patch) — Status: Draft — Owner: Narrative
    - [C5 The Amazing Poster](#c5-the-amazing-poster) — Status: Draft — Owner: Narrative
- 15+ Extensions — MythWays (Track A) and Origins (Track B)
- [A1 River of Two Lands](#a1-river-of-two-lands) — Status: Draft — Owner: Narrative
- [A2 Meeting of Winds](#a2-meeting-of-winds) — Status: Draft — Owner: Narrative
- [A3 Paths of Exchange](#a3-paths-of-exchange) — Status: Draft — Owner: Narrative
- [O1 Island Shuffle](#o1-island-shuffle) — Status: Draft — Owner: Narrative
- [O2 Patterns in Pollen](#o2-patterns-in-pollen) — Status: Draft — Owner: Narrative
- [O3 Tails, Songs, and Signals](#o3-tails-songs-and-signals) — Status: Draft — Owner: Narrative
- [MM1‑R Mentor Mini — Reflection Variant (12+)](#mm1-r-mentor-mini-reflection-variant-12) — Status: Draft — Owner:
  Narrative

Overview: Flow & Narrative

First run flow: ROD_INTRO (first visit only) → S1 Night Before → S2 Tooth Tradition → S3 Proof Moment → Epilogue →
ROD_OUTRO (first completion only).

A gentle title card invites the player in. The first scene teaches interaction by reassembling a gift tag and noticing a
familiar hand. The second celebrates close looking as the player toggles matching letters between two notes. The third
offers a choice of how to confirm the truth—overhearing a plan or finding a receipt—always with kind framing. The
Epilogue reframes the discovery as a rite of passage and awards a Helper Badge. The first time, the Outro presents calm
replay options: try the other branch, toggle Gentle Mode, or replay from the start. Subsequent runs skip the intro/outro
by default but keep them discoverable via links. Choices are saved as small flags to support NG+ (Mentor Mini) later.

Story Template

- ID/Name:
- Audience/Tone: MVP 7–9 (Gentle/Standard) or 12+ (Thinking Tools)
- Goal (one line):
- Hooks (what pulls the player in):
- Core beats (bullets; keep it simple and kind):
- Choices & flags (what the player decides and what gets recorded):
- Kindness & accessibility guardrails:
- Assets needed (link to brief):
- Copy notes (gentle phrasing examples):
- Open questions/assumptions:
- Fact‑check notes (sources, real‑world parallels, or “avoid mentioning brand X”):
- Review checklist status: Content ✓ / Kindness ✓ / Accessibility ✓ / Art Ready ✓ / Integrated ✓

## ROD_INTRO Title Card

- Audience/Tone: MVP 7–9 (Gentle/Standard)
- Goal: Orient the player with a friendly premise before S1; reduce cold start.
- Beats:
  - Title, 2 short lines of premise; primary “Begin”, secondary “Skip intro”.
  - On action, set `intro.seen=true` and proceed to S1.
- Choices & flags: `intro.seen = true` (persisted in `rod:save:v1`).
- Guardrails: Reduced motion; clear heading; accessible buttons (≥44px); visible focus.
- Copy keys: `rod.intro.*` in `i18n/en.json`.
- Status: Integrated.

S1 Night Before

- ID/Name: S1 — Night Before (Living Room)
- Audience/Tone: MVP 7–9 (Gentle/Standard)
- Goal: Introduce curiosity and teach basic interaction.
- Hooks:
    - Cozy living room at night; gift with a torn tag; plate with a cookie.
- Core beats:
    - Player explores hotspots and reassembles a torn gift tag (3–5 pieces) like a small jigsaw.
    - The matched handwriting hints that a trusted grown‑up is a “helper.”
    - The player can either keep the suspicion private or ask a gentle question.
- Choices & flags:
    - s1.askParent = true/false (asked a question now or saved it for later).
- Kindness & accessibility guardrails:
    - No mockery; warm expressions; clear focus indicators; puzzle is winnable without timers.
- Assets needed:
    - Background: `epA_scene1_bg.avif`. Props: `epA_scene1_gift_tag_pieces_[1..5].svg`, `epA_scene1_tape.svg`,
      `epA_scene1_wrapping_roll.svg`, `epA_scene1_cookie_plate.svg`.
- Copy notes:
    - Gentle mode uses “helpers” and “family magic.” Avoid absolute statements.
- Open questions:
    - Do we show a faint light ray or candle flicker? Ensure a still alternate for reduced motion.
- Fact‑check notes:
    - Avoid brand names on wrapping; generic ornament patterns only.
- Review checklist: Content ✓ Kindness ✓ Accessibility ✓ Art Ready ✓ Integrated —

## ROD_OUTRO Wrap & Replay Hooks

- Audience/Tone: MVP 7–9 (Gentle/Standard)
- Goal: Provide closure and clear next steps (replay/branch/NG+ gate) without forcing repetition.
- Beats:
  - Congratulatory line; recap of branch/items; Helper Badge reminder.
  - Actions: Replay from S1; try the other S3 branch; toggle Gentle Mode for next run; NG+ (Mentor Mini) placeholder.
  - Sets `outro.seen=true` on first view; remains available via link from Epilogue.
- Choices & flags: `outro.seen = true`; existing `ep.badgeHelper = true` is awarded on Epilogue.
- Guardrails: Accessible buttons (≥44px), visible focus, reduced motion.
- Copy keys: `rod.outro.*`.
- Status: Integrated.

S2 Tooth Tradition

- ID/Name: S2 — Tooth Tradition (Bedroom)
- Audience/Tone: MVP 7–9 (Gentle/Standard)
- Goal: Pattern recognition using keepsake notes.
- Hooks:
    - A special box and a familiar note near the pillow.
- Core beats:
    - Spot‑the‑difference mini‑puzzle comparing letters between two notes (click three matches).
    - A squeaky floorboard SFX and a drawer hint add cozy atmosphere.
- Choices & flags:
    - s2.keepNote = true/false (whether the note is kept in inventory).
- Kindness & accessibility guardrails:
    - Large click targets (≥44px), high contrast; captions on creak SFX; reduced animation available.
- Assets needed:
    - Background: `epB_scene1_bg.avif`. Props: `epB_keepsake_box_lid.svg`, `epB_note.svg` (variants A/B),
      `epB_floorboard.svg`, `epB_drawer_handle.svg`.
- Copy notes:
    - Emphasize traditions made by people who love you; no “gotcha.”
- Open questions:
    - Note variants A/B final lettering style; ensure readability.
- Fact‑check notes:
    - Letterform differences should be clear for early readers (rounded tails, distinct capitals).
- Review checklist: Content ✓ Kindness ✓ Accessibility ✓ Art Ready ✓ Integrated —

S3 Proof Moment

- ID/Name: S3 — Proof Moment (Store or Attic)
- Audience/Tone: MVP 7–9 (Gentle/Standard)
- Goal: Gently confirm that traditions are family‑made.
- Hooks:
    - A receipt, a costume bag, or a phone on speaker with muffled planning.
- Core beats:
    - Find or assemble a receipt; overhear cozy planning language without naming brands.
    - Leave room to choose when to talk about it.
- Choices & flags:
    - s3.confrontNow = true/false (talk now vs. later).
- Kindness & accessibility guardrails:
    - No accusatory language; ensure text alternatives/captions for audio hints.
- Assets needed:
    - Background: `epC_scene1_bg.avif`. Props: `epC_receipt.svg`, `epC_phone_speaker.svg`, `epC_costume_bag.svg`.
- Copy notes:
    - Use “we make the magic together” phrasing; keep it celebratory.
- Open questions:
    - Which variant (store vs. attic) ships first? Both share the same props.
- Fact‑check notes:
    - Receipt text should be generic; avoid real store names.
- Review checklist: Content ✓ Kindness ✓ Accessibility ✓ Art Ready ✓ Integrated —

Epilogue — Rite of Passage

- ID/Name: EP — Epilogue (Family Conversation)
- Audience/Tone: MVP 7–9 (Gentle/Standard)
- Goal: Frame discovery as a rite of passage; celebrate becoming a “helper.”
- Hooks:
    - Warm family area; a small badge (“Helper”) awarded at the end.
- Core beats:
    - Parents invite a conversation; player choices adjust tone (proud/celebratory vs. cozy/affirming).
    - Unlock a small badge collectible and optional credits.
- Choices & flags:
    - ep.badgeHelper = true (awarded at end).
- Kindness & accessibility guardrails:
    - Soft colors; positive affirmations; caption any ambient sounds; reduced motion confetti still available.
- Assets needed:
    - Background: `epX_epilogue_bg.avif`. Props: `epX_helper_badge.svg`.
- Copy notes:
    - “You figured it out! That’s your rite of discovery. Now you get to be on the helper team.”
- Open questions:
    - Optional small credits panel? Keep it minimal and readable.
- Fact‑check notes:
    - None required; ensure cultural neutrality in decorations.
- Review checklist: Content ✓ Kindness ✓ Accessibility ✓ Art Ready — Integrated —

MM1 Mentor Mini — Sibling Helper

- ID/Name: MM1 — Mentor Mini (Sibling Helper)
- Audience/Tone: MVP 7–9 (Gentle/Standard) — post‑Epilogue, unlocked via Helper Badge
- Goal: Help a younger sibling begin their own rite of discovery with kindness and privacy.
- Unlock/state requirements:
    - Requires `ep.badgeHelper = true`.
    - Initial route preference derives from S1–S3 flags; player can replay to see all routes.
- Hooks:
    - “You’re on the helper team now.” A cozy moment with your sibling asking for tips.
- Core beats:
    - Choose or receive one echo route (Tag/Note/Talk) based on prior flags.
    - Provide gentle guidance via short “Mentor Tips” cards; complete a tiny activity (2–3 interactions).
    - Celebrate sibling agency; add a small “Mentor” sticker to the Codex.
- Choices & flags:
    - mm.route = tagEcho | noteEcho | talkEcho
    - mm.mentorStyle = askFirst | observeTogether | planTiming (derived from S1–S3)
    - mentor.seenRoutes.{tagEcho|noteEcho|talkEcho} updated on completion
- Kindness & accessibility guardrails:
    - Never spoil or trick. Emphasize empathy, timing, and noticing together. Large targets, readable text, captions.
- Assets needed (link to brief):
    - Background: `epMM_bg.avif` (cozy shared space — living room/bedroom variant allowed)
    - Props (reused or light variants): `epA_scene1_gift_tag_pieces_[1..3].svg`, `epB_note.svg` (simple pair),
      `ui_moment_cards_[1..3].svg`
    - UI overlay: `ui_mentor_tips.svg`; Collectible: `collect_mentor_sticker.svg`
- Copy notes:
    - “We look together,” “We pick a good moment,” “We ask kind questions.”
- Open questions:
    - Use reduced motion only; confirm whether we need day/night variants for background.
- Fact‑check notes:
    - Keep brand‑agnostic assets; privacy‑respecting guidance phrasing.
- Review checklist: Content ✓ Kindness ✓ Accessibility ✓ Art Ready — Integrated —

C1 The Mystery Coupon

- ID/Name: C1 — The Mystery Coupon (Anchoring + Framing)
- Audience/Tone: 12+ (Thinking Tools)
- Goal: Learn to reframe total cost and avoid anchoring to a flashy discount.
- Hooks:
    - “90% OFF!!” flyer with fine print; comparison chatter.
- Core beats:
    - Assemble receipt shards to compute true cost; or run a tiny experiment with sample items.
    - A hidden price‑history collectible unlocks a fun epilogue panel.
- Choices & flags:
    - c1.route = assemble|experiment; c1.foundHistory = true/false.
- Kindness & accessibility guardrails:
    - Avoid shaming; celebrate smart choices; high contrast on small text; no real store brands.
- Assets needed:
    - 1–2 backgrounds; evidence props (receipt shards, flyer); badge `badge_price_detective.svg`.
- Copy notes:
    - “Big numbers can distract us; let’s check the whole picture.”
- Open questions:
    - Final look of the shards puzzle; ensure readable totals.
- Fact‑check notes:
    - Anchoring and price framing; keep math simple and visual.
- Review checklist: Content ✓ Kindness ✓ Accessibility — Art Ready — Integrated —

C2 The Echo Thread

- ID/Name: C2 — The Echo Thread (Confirmation Bias + Filter Bubbles)
- Audience/Tone: 12+ (Thinking Tools)
- Goal: Practice cross‑checking sources and avoiding fallacies in friendly debate.
- Hooks:
    - Group chat rumor about a toy.
- Core beats:
    - Build a collage of cross‑checked sources; or try a respectful mini‑debate without ad hominem.
    - Collect “Media Lenses” to unlock an optional journalist side scene.
- Choices & flags:
    - c2.route = collage|debate; c2.lenses >= 2 unlocks side scene.
- Kindness & accessibility guardrails:
    - Emphasize listening; avoid ridicule; captions/visuals for any audio clips.
- Assets needed:
    - Background(s); evidence cards; UI overlay for lenses; badge `badge_bias_buster.svg`.
- Copy notes:
    - “Let’s check more than one source.”
- Open questions:
    - Which lenses to include? Keep them generic: local, national, expert, community.
- Fact‑check notes:
    - Fallacy examples are generic; avoid real personalities/brands.
- Review checklist: Content ✓ Kindness ✓ Accessibility — Art Ready — Integrated —

C3 The Coin‑Flip Streak

- ID/Name: C3 — The Coin‑Flip Streak (Gambler’s Fallacy + Probability)
- Audience/Tone: 12+ (Thinking Tools)
- Goal: Show that streaks happen naturally; teach independence of flips.
- Hooks:
    - A “lucky coin” keeps winning.
- Core beats:
    - Simulate flips and view a histogram; or make a humorous zine that gently demystifies superstition.
    - Perfect analysis unlocks a couch co‑op mini‑game (optional).
- Choices & flags:
    - c3.route = simulate|zine; c3.perfect = true/false.
- Kindness & accessibility guardrails:
    - Never belittle belief; present evidence playfully; colorblind‑safe palette for charts.
- Assets needed:
    - Background(s); coin props; chart overlay; badge `badge_probability.svg`.
- Copy notes:
    - “Patterns can trick our eyes; randomness makes streaks too.”
- Open questions:
    - How many trials for a meaningful histogram without lag? Keep it snappy.
- Fact‑check notes:
    - Independence of events; streak frequency basics.
- Review checklist: Content ✓ Kindness ✓ Accessibility — Art Ready — Integrated —

C4 The Miracle Patch

- ID/Name: C4 — The Miracle Patch (Post Hoc + Placebo)
- Audience/Tone: 12+ (Thinking Tools)
- Goal: Separate correlation from causation in a friendly, team‑oriented setting.
- Hooks:
    - A sports patch claims to improve speed.
- Core beats:
    - Secret A/B test (swap patches) or assemble a timeline with alternate causes (sleep, practice, weather).
    - Team montage ending if you collect the coach’s clipboard.
- Choices & flags:
    - c4.route = abtest|timeline; c4.clipboard = true/false.
- Kindness & accessibility guardrails:
    - Frame outcomes as teamwork and habits; no calling people out.
- Assets needed:
    - Background(s); patch props; clipboard; timeline overlay; badge `badge_placebo_detective.svg`.
- Copy notes:
    - “Let’s test it in a fair way.”
- Open questions:
    - Final timeline pieces; ensure touch‑friendly controls.
- Fact‑check notes:
    - Placebo and post hoc pitfalls; avoid medical claims.
- Review checklist: Content ✓ Kindness ✓ Accessibility — Art Ready — Integrated —

C5 The Amazing Poster

- ID/Name: C5 — The Amazing Poster (Appeal to Authority + Ad Hominem)
- Audience/Tone: 12+ (Thinking Tools)
- Goal: Learn to check claims and keep arguments about ideas, not people.
- Hooks:
    - Competing posters; one quotes a “famous expert.”
- Core beats:
    - Vet credentials with a simple stamp game; or clean arguments by removing personal jabs.
    - Town Hall celebration if previous cases avoided fallacies.
- Choices & flags:
    - c5.route = credentials|clean; c5.cleanStreak = true/false.
- Kindness & accessibility guardrails:
    - Focus on ideas; remove ad hominem; make icons/text readable.
- Assets needed:
    - Background; posters; stamp UI; badge `badge_reasoned_debate.svg`.
- Copy notes:
    - “Strong ideas don’t need personal jabs.”
- Open questions:
    - Which credentials to show generically? Use icons (book, lab flask, community badge).
- Fact‑check notes:
    - Define ad hominem vs. healthy critique in tooltip copy.
- Review checklist: Content ✓ Kindness ✓ Accessibility — Art Ready — Integrated —

A1 River of Two Lands

- ID/Name: A1 — River of Two Lands (Egypt — Nile cycles)
- Audience/Tone: 15+ (MythWays — respectful, curious, witty)
- Goal: Explore how seasonal river cycles shape deity roles and community memory.
- Hooks:
    - Flood markers (nilometer), grain barges, festival calendar fragments.
- Core beats:
    - Sort evidence cards into “Seasonal cycles,” “Fertility,” and “Civic/record‑keeping.”
    - Compare parallel inscriptions to spot calendar cues and water‑level glyphs.
    - Discover a pre‑dynastic marker that reframes continuity vs. change; unlock Codex “Cycles Remembered.”
- Choices & flags:
    - a1.route = cycles|records; a1.codexCycles = true/false (found older marker).
- Kindness & accessibility guardrails:
    - Avoid sacred depictions; use abstract glyphs; add alt text and transliteration placeholders; high‑contrast labels.
- Assets needed (see brief §8 MythWays):
    - Background(s): riverside site or archive table.
    - Props: `collect_nilometer.svg`, inscription shards, ledger page, calendar token.
    - UI overlays: evidence sorter, inscription compare; Badge: `badge_fertility_cycles.svg`.
- Copy notes:
    - Use precise but novice‑friendly language: “festival days,” “river memory,” “markers.”
- Open questions:
    - Final glyph set; ensure cultural sensitivity review; choose color accents that avoid stereotypical palettes.
- Fact‑check notes:
    - Seasonal flood basics; nilometer concept; avoid specific temple claims; reference generic “festival records.”
- Review checklist: Content ✓ Kindness ✓ Accessibility — Art Ready — Integrated —

A2 Meeting of Winds

- ID/Name: A2 — Meeting of Winds (Norse/Inuit coastal communities)
- Audience/Tone: 15+ (MythWays — respectful, pragmatic, humble)
- Goal: Show maritime pragmatism and oral tradition mapping spirits to hazards.
- Hooks:
    - Weather bones, sail fragments, elder’s story about a storm crossing.
- Core beats:
    - Route A: Map navigational archetypes to coastal hazards via tokens on a sea map.
    - Route B: Assemble an oral history timeline that pairs conditions → practices (respectful tone).
    - Optional elder interview unlocks a “Resilience” epilogue snippet.
- Choices & flags:
    - a2.route = navigation|oral; a2.elderInterview = true/false.
- Kindness & accessibility guardrails:
    - No caricature; neutral iconography; captions/transcripts for any audio; alt paths if audio is off.
- Assets needed:
    - Background(s): coastal map table or community hall.
    - Props: `collect_weather_bone.svg`, sail patch, hazard markers.
    - UI overlays: map tokens/paths; Badge: `badge_resilience.svg`.
- Copy notes:
    - Emphasize practical wisdom and shared safety rather than mystification.
- Open questions:
    - Choose which hazards to depict generically (shoals, ice edge, sudden squalls) without real geography.
- Fact‑check notes:
    - Keep culture‑specific elements abstract; consult sensitivity notes; avoid mixing unrelated traditions.
- Review checklist: Content ✓ Kindness ✓ Accessibility — Art Ready — Integrated —

A3 Paths of Exchange

- ID/Name: A3 — Paths of Exchange (Syncretism under empire)
- Audience/Tone: 15+ (MythWays — comparative, empathetic)
- Goal: Explore syncretic bridges across adjacent cultures and imperial contexts.
- Hooks:
    - Bilingual inscription rubbing, coinage with shared epithets, merchant ledger excerpts.
- Core beats:
    - Route A: Build “Syncretic Bridges” by pairing role archetypes across cultures (e.g., Hermes/Mercury).
    - Route B: Assemble an administrative adoption timeline showing civic/pragmatic adoption.
    - Twist: A traveling merchant’s ledger reveals pragmatic cross‑worship → unlock “Concordia” ending.
- Choices & flags:
    - a3.route = bridges|administration; a3.ledgerFound = true/false; a3.ending = concordia|null.
- Kindness & accessibility guardrails:
    - Avoid value hierarchies; neutral wording; tooltip notes on “contested scholarship.”
- Assets needed:
    - Background(s): market ledger table or museum case.
    - Props: `collect_bilingual_inscription.svg`, coins, ledger page.
    - UI overlays: role archetypes sorter, timeline; Badge: `badge_concordia.svg`.
- Copy notes:
    - Prefer “shared roles”/“local protectors” phrasing; steer clear of confessional terms.
- Open questions:
    - Which archetypes to include to stay generic; icon set for roles (river, hearth, messenger, sky).
- Fact‑check notes:
    - Syncretism examples presented as analogies; no claims about worship practices; cite neutral museum‑style labels.
- Review checklist: Content ✓ Kindness ✓ Accessibility — Art Ready — Integrated —

O1 Island Shuffle

- ID/Name: O1 — Island Shuffle (Island biogeography)
- Audience/Tone: 15+ (Origins — curious, humble, playful)
- Goal: Explore dispersal, drift, and niche colonization vs. convergence across islands.
- Hooks:
    - Island chain map, driftwood seeds, lizard/bird photos.
- Core beats:
    - Route A: Simulate dispersal and colonization; adjust sliders for distance, current, habitat.
    - Route B: Compare traits across islands to illustrate convergent evolution.
    - Twist: Rare dispersal event card → Codex “Parallel Solutions.”
- Choices & flags:
    - o1.route = dispersal|convergence; o1.rareEvent = true/false; o1.codexParallel = true/false.
- Kindness & accessibility guardrails:
    - Clear separation of model vs. observation; colorblind‑safe palettes; keyboard accessible sliders.
- Assets needed (see brief §8 Origins):
    - Background(s): lab bench or map board.
    - Props: `collect_fossil_feather.svg`, seed pods, species tokens.
    - UI overlays: slider panel, island map; Badge: `badge_island_biogeography.svg`.
- Copy notes:
    - “Different islands can shape similar solutions — nature rhymes.”
- Open questions:
    - Slider ranges for meaningful yet snappy feedback; choose 2–3 traits.
- Fact‑check notes:
    - Keep examples generic; no species names; emphasize inference, not certainty.
- Review checklist: Content ✓ Kindness ✓ Accessibility — Art Ready — Integrated —

O2 Patterns in Pollen

- ID/Name: O2 — Patterns in Pollen (Coevolution)
- Audience/Tone: 15+ (Origins — observational, gentle)
- Goal: Show trait matching (pollinator vs. flower) and landscape/phenology constraints.
- Hooks:
    - UV flower images, pollinator morphologies, seasonal calendar.
- Core beats:
    - Route A: Match traits (tongue length vs. corolla depth) using an evidence board.
    - Route B: Align bloom times/landscape with pollinator availability.
    - Twist: Night‑blooming variant unlocks “Invisible Colors” epilogue.
- Choices & flags:
    - o2.route = traits|phenology; o2.nightBloom = true/false; o2.epilogue = invisible_colors|null.
- Kindness & accessibility guardrails:
    - Provide image alt text; avoid real species names; include textual descriptions for UV imagery.
- Assets needed:
    - Background(s): field notes board.
    - Props: `collect_uv_filter.svg`, trait cards, calendar strips.
    - UI overlays: evidence matcher; Badge: `badge_coevolution.svg`.
- Copy notes:
    - Emphasize partnership metaphors; avoid teleology.
- Open questions:
    - Which 3–4 traits feel intuitive to match for newcomers?
- Fact‑check notes:
    - Keep coevolution examples illustrative; no specific taxa; avoid lab claims.
- Review checklist: Content ✓ Kindness ✓ Accessibility — Art Ready — Integrated —

O3 Tails, Songs, and Signals

- ID/Name: O3 — Tails, Songs, and Signals (Sexual vs. natural selection)
- Audience/Tone: 15+ (Origins — balanced, model‑first)
- Goal: Explore tension between predation risk and mate choice dynamics via simple sliders and feedback.
- Hooks:
    - Spectrograms, tail length charts, predator density map.
- Core beats:
    - Route A: Increase predation pressure to see how conspicuous traits become costly.
    - Route B: Increase mate choice weight to see advantages of signals.
    - Twist: Balanced configuration unlocks a mock “Club Zine” co‑author credit.
- Choices & flags:
    - o3.route = predation|mate_choice; o3.balanceAchieved = true/false; o3.zineCredit = true/false.
- Kindness & accessibility guardrails:
    - Avoid sexualized language; keep framing scientific and age‑appropriate; include captions for audio; reduced‑motion
      friendly.
- Assets needed:
    - Background(s): lab console or gallery wall.
    - Props: `collect_signal_card.svg`, charts, map tokens.
    - UI overlays: sliders, spectrogram panel; Badge: `badge_selection_balance.svg`.
- Copy notes:
    - “Signals can help mates find each other, but they can also attract predators — balance matters.”
- Open questions:
    - Determine slider coupling for clear feedback without overwhelming users.
- Fact‑check notes:
    - Separate model sliders from real data examples; keep claims generic.
- Review checklist: Content ✓ Kindness ✓ Accessibility — Art Ready — Integrated —

MM1‑R Mentor Mini — Reflection Variant (12+)

- ID/Name: MM1‑R — Mentor Mini Reflection (12+)
- Audience/Tone: 12+ (Thinking Tools — reflective, witty, kind)
- Goal: Offer short reflection prompts connecting helping behavior to thinking tools (framing, evidence, timing).
- Hooks:
    - A small journal card unlocks after completing MM1; shows 2–3 reflective choices.
- Core beats:
    - Pick up to two prompts: “How would you frame advice kindly?”, “Which evidence helped most?”, “When is the right
      time?”
    - Choose from options that subtly map to framing/evidence/timing; unlock a codex note.
- Choices & flags:
    - mmr.promptsChosen: string[]; mmr.noteUnlocked = true/false
- Kindness & accessibility guardrails:
    - No lecturing; keep it optional; readable at a glance; keyboard/focus order clear.
- Assets needed:
    - UI overlay: `ui_reflection_cards_[framing|evidence|timing].svg`; Codex icon `badge_mentor_reflection.svg`
- Copy notes:
    - “Kind advice is also smart advice.”
- Open questions:
    - Do we gate MM1‑R behind seeing ≥2 routes in MM1? (Default: unlocked when MM1 is completed once.)
- Fact‑check notes:
    - Keep concepts generic; no jargon required.
- Review checklist: Content ✓ Kindness ✓ Accessibility ✓ Art Ready — Integrated —

Review Checklist (for any story)

- Content clarity: Intro hooks are clear; beats are easy to follow by novices.
- Kindness: No shaming; constructive resolutions; humor is gentle.
- Accessibility: Focus states, contrast, target size ≥ 44px; reduced‑motion path viable; captions where needed.
- Cultural/brand neutrality: No real brands/people; inclusive wording.
- Assets linked: Backgrounds/props named and placed per brief; budgets respected.
- Testability: Choices and flags are explicit; scenarios map to E2E checks in Playwright.

Changelog

- v1 (2025‑12‑21): Initial tracker with MVP S1–S3 + Epilogue and 12+ C1–C5 entries.
- v2 (2025‑12‑21): Added 15+ Tracks — MythWays A1–A3 and Origins O1–O3 with full draft entries; updated Index.
