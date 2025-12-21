# Rite of Discovery — Designer/Animator Brief (EN)

This brief is the production guide for visual assets and motion for the point‑and‑click game “Rite of Discovery.” It
complements the design document in `docs/rite-of-discovery.md` and focuses on concrete deliverables, formats, sizes,
naming, and workflow — so art can be produced independently and plugged into the game with minimal back‑and‑forth.

Link back to the main design doc (systems, scenes, 12+ extension):

- docs/rite-of-discovery.md

Key principles for all content

- Center niceness and morality: the player should never learn it’s okay to be unkind or manipulative. Humor is gentle;
  curiosity is rewarded; respect is the norm.
- Tone by audience: MVP (ages 7–9, with a Gentle Mode toggle) and the 12+ extension (“Thinking Tools”) keep a cozy,
  witty, kind voice. No scolding.
- Accessibility: clear hotspot affordances; sufficient contrast; reduced‑motion fallbacks.
- Performance: stick to budgets; prefer vector or AVIF; keep loops subtle and small.

Designer tasks & workflow (at a glance)

- Intake & alignment
  - Read `docs/rite-of-discovery.md` (main design) and `docs/rite-of-discovery-stories.md` (stories tracker).
  - Confirm audience tone (MVP 7–9 or 12+ case), accessibility needs, and the Definition of Done (below).
- Concept pass (per scene/case)
  - Produce 1 mood thumbnail (values/composition) and a quick palette swatch.
  - Identify 3–6 hotspots/props as separate layers; flag any motion opportunities and their stills.
- Production pass
  - Render background(s) in AVIF+WEBP sizes; export props as individual SVGs (clean paths, no embedded rasters).
  - Name and place files per spec; keep within budgets; attach an annotated PNG with hotspot rect suggestions.
- Review & iterate
  - Hand off via PR with checklist; review a short screencap of in‑game integration; iterate ≤2 cycles when possible.
- Finalization
  - Confirm accessibility (contrast, focus affordances, reduced motion stills), codecs, sizes, and naming.
  - Tick status in `docs/rite-of-discovery-stories.md` for the corresponding scene/case.

## 1) Art direction and style

- Visual style: warm, cozy, slightly whimsical. Soft lighting, rounded shapes, no uncanny realism.
- Composition: key information within the inner 90% of the frame (5% safe margin on all sides).
- Palette cues (suggested, not mandatory):
    - Family scenes: warm ambers and soft neutrals; bedtime hues for night interiors.
    - “Thinking Tools” cases: add accent tints by topic (probability → cool blues; rhetoric → purples;
      incentives/framing → gold/orange).

Mood boards (public‑domain/free references)

- Cozy home interiors & warm light: https://www.pexels.com/search/cozy%20interior/ (curated sample)
- Concept‑y “thinking” palettes (cool blues/purples): https://www.pexels.com/search/abstract%20gradient/
  (These are only for inspiration; do not copy proprietary designs.)

## 2) File formats, sizes, naming, delivery

- Backgrounds: AVIF (preferred), WEBP fallback; sizes 2560×1440 and 1920×1080. Names: `ep<LETTER>_scene<NUM>_bg.avif`.
- Foreground props/hotspots: SVG (preferred) or transparent PNG at 2×. Names: `ep<LETTER>_scene<NUM>_<prop>.svg`.
- UI overlays (cards, charts): SVG preferred. Names: `ui_<scope>_<name>.svg`.
- Badges/collectibles: SVG, 256×256 PNG fallback. Names: `badge_<id>.svg`, `collect_<id>.svg`.
- Animation loops: Lottie JSON (optional) or very light PNG sequence ≤ 200KB/loop. All loops must have reduced‑motion
  stills.
- Delivery path (repo): `public/games/rod/assets/{epA|epB|epC|epD|shared}/`.
- Budgets (target, post‑brotli): ≤ 800KB per episode aggregate; ≤ 30KB per prop SVG; ≤ 200KB per loop.

Definition of Done (DoD) — assets

- Backgrounds delivered in 2560×1440 and 1920×1080 AVIF (+ WEBP fallback) with safe area respected.
- Props exported as individual SVGs, visually grouped by scene/case; IDs/classes removed unless needed for theming.
- Optional loops include a still poster for `prefers-reduced-motion` and remain readable when static.
- Annotated PNG shows hotspot regions and z‑order hints; palette notes included if relevant.
- Files are named and placed under `public/games/rod/assets/...` exactly per spec; size budgets met.

## 3) MVP (ages 7–9) — scenes and assets

Scene naming follows the design doc: S1 Night Before, S2 Tooth Tradition, S3 Proof Moment, Epilogue. Each scene lists
required assets; extras are optional.

Episode MVP backgrounds (choose 1–2 per scene)

- S1 Night Before: `epA_scene1_bg.avif` — living room at night (tree, stockings, cozy lighting).
- S2 Tooth Tradition: `epB_scene1_bg.avif` — kid’s bedroom (pillow, nightstand, keepsake box). Optional daylight
  variant.
- S3 Proof Moment: `epC_scene1_bg.avif` — store aisle/receipt area OR attic/storage room.
- Epilogue: `epX_epilogue_bg.avif` — warm family space suitable for a short conversation.

Foreground props (separate layers)

- S1: gift tag pieces `epA_scene1_gift_tag_pieces_[1..5].svg`, `epA_scene1_tape.svg`, `epA_scene1_wrapping_roll.svg`,
  `epA_scene1_cookie_plate.svg`.
- S2: `epB_keepsake_box_lid.svg`, `epB_note.svg` (A/B copy variant), `epB_floorboard.svg`, `epB_drawer_handle.svg`.
- S3: `epC_receipt.svg`, `epC_phone_speaker.svg`, `epC_costume_bag.svg`.
- Epilogue: `epX_helper_badge.svg` (award sticker).

New Game+ — Mentor Mini (Sibling Helper)

- Purpose: A short, replayable vignette unlocked by the Helper Badge where the player, now a “helper,” kindly guides a
  younger sibling. Echoes S1–S3 without revealing secrets.
- Backgrounds:
  - `epMM_bg.avif` (cozy shared space; living room or bedroom variant permitted)
- Props & UI overlays:
  - Tag Echo (S1): reuse `epA_scene1_gift_tag_pieces_[1..3].svg` (or lighter variants)
  - Note Echo (S2): reuse `epB_note.svg` (paired) for “spot the similarity”
  - Talk Echo (S3): `ui_moment_cards_[1..3].svg` (cards like “after snack,” “story time,” “weekend morning”)
  - Mentor tips overlay: `ui_mentor_tips.svg`
- Collectible:
  - `collect_mentor_sticker.svg` (Codex sticker)
- Budgets:
  - Keep within existing MVP budgets; shared assets preferred. New overlays ≤ 30KB/SVG.

Per‑scene task checklist (Mentor Mini)

- Deliver: `epMM_bg.avif`; `ui_mentor_tips.svg`; `ui_moment_cards_[1..3].svg`; and confirm reuse of S1/S2 props (or
  provide lighter variants if needed).
- Notes: Large click targets (≥44px). Provide an annotated PNG indicating where mentor tips appear and the card layout.
- Guardrails: No trickery, no spoilers; privacy‑respecting copy; provide reduced‑motion stills for any subtle effects.

Collectibles & badges

- S1 collectible `collect_ornament.svg`; S2 `collect_tooth_charm.svg`; S3 `collect_ribbon.svg`.
- Badges by outcome (SVG): `badge_confidence.svg`, `badge_curious.svg`, `badge_detective.svg`.

Optional micro‑animation ideas (with reduced‑motion stills)

- Candle flicker (S1), nightlight pulse (S2), dust motes (S3 attic), soft vignette/light rays.

Niceness/morality guardrails (MVP)

- Expression: smiles, warm eye lines, candid humor; never mock or shame.
- Copy hints: avoid “gotcha”; emphasize family tradition, trust, and the rite‑of‑passage framing.

Per‑scene task checklist (MVP)

- S1 Night Before
  - Deliver: living‑room night background; gift‑tag shards (3–5), tape, wrapping roll, cookie plate.
  - Notes: leave negative space for UI; provide subtle light gradient layer for depth.
- S2 Tooth Tradition
  - Deliver: bedroom background (night; optional day); keepsake box lid, note variants, floorboard, drawer handle.
  - Notes: ensure contrast on small props; label note variants A/B in filenames.
- S3 Proof Moment
  - Deliver: store/attic background; receipt, phone speaker, costume bag.
  - Notes: receipt designed for shatter/assemble mini‑puzzle; avoid text that implies a brand.
- Epilogue
  - Deliver: warm family space; helper badge SVG.
  - Notes: gentle, celebratory tone; consider a confetti still for reduced motion.

## 4) 12+ extension — “Thinking Tools” (fun & replayable)

Framing: “Junior Investigator Club” — short, witty cases with at least two routes plus a twist ending. Cases teach
thinking tools through play, not preaching.

Per‑case asset template (each case)

- Backgrounds (1–2): scene appropriate (chat lounge, store board, track field, town hall, etc.).
- Props (3–5): evidence cards, receipts, posters, coins, stopwatch, etc.
- UI overlays (1–2): simple charts/cards used in mini‑games.
- Badge (1): themed to the thinking tool (e.g., “Price Detective,” “Bias Buster”).
- Optional ambient loop (subtle) + reduced‑motion stills.

Case lineup (hooks, routes, twist) — all must center kindness and constructive resolution

1) The Mystery Coupon (Anchoring + Framing)

- Hooks: “90% OFF!!” flyer with caveats; parent comparing prices.
- Routes: (A) Reframe total cost by assembling receipt shards; (B) Try a mini‑experiment with sample items.
- Twist: Hidden price‑history collectible unlocks a playful “Price Detective” epilogue panel.
- Niceness: Player guides family to a smart choice without belittling anyone.

2) The Echo Thread (Confirmation Bias + Filter Bubbles)

- Hooks: Group chat rumor about a toy.
- Routes: (A) Cross‑check sources collage; (B) Respectful “debate” mini‑duel (avoid fallacy traps).
- Twist: With 2+ “Media Lenses,” unlock an NPC journalist side scene.
- Niceness: Emphasize listening and empathy; no dunking on friends.

3) The Coin‑Flip Streak (Gambler’s Fallacy + Probability)

- Hooks: “Lucky coin” keeps winning.
- Routes: (A) Simulate flips; histogram mini‑puzzle; (B) Create a fun zine that defangs superstition with humor.
- Twist: Perfect analysis unlocks a couch‑co‑op minigame.
- Niceness: Celebrate curiosity; avoid ridiculing beliefs.

4) The Miracle Patch (Post Hoc + Placebo)

- Hooks: Sports patch claims to improve speed.
- Routes: (A) AB test with swapped patches; (B) Timeline assembly showing alternate causes.
- Twist: With “Coach’s Clipboard,” unlock a team montage ending.
- Niceness: Frame outcomes as teamwork and good habits, not “calling out” anyone.

5) The Amazing Poster (Appeal to Authority + Ad Hominem)

- Hooks: Competing posters; one quotes a “famous expert.”
- Routes: (A) Credential vetting stamp‑game; (B) Clean arguments by removing personal jabs.
- Twist: If prior cases were cleared without fallacies, unlock a Town Hall celebration.
- Niceness: Focus on strengthening ideas, not attacking people.

Replay systems & medals

- Map with medals: Bronze (complete), Silver (no hints), Gold (twist solution). Codex tracks endings.
- Daily remix (optional): shuffled sources; different mistaken NPC; same moral tone.

Per‑case task checklist (12+)

- For each case, deliver:
  - 1–2 backgrounds; 3–5 prop/evidence SVGs; 1–2 UI overlays; 1 badge; optional ambient loop + still.
  - An annotated PNG indicating evidence placements and mini‑game UI affordances.
  - Ensure kindness guardrails: avoid ridicule; depict constructive resolution paths.
  - Link the PR to the case entry in `docs/rite-of-discovery-stories.md` and mark asset status.

## 8) 15+ extensions — MythWays (Track A) and Origins (Track B)

Audience & tone (15+): respectful, curious, witty; zero edgelord energy. Kindness, cultural sensitivity, and scientific
humility are non‑negotiable.

Shared specifications (both tracks)

- Backgrounds: AVIF + WEBP at 2560×1440 and 1920×1080; safe area respected.
- Props: SVG (preferred); clean paths; no embedded rasters; ≤ 30KB target per SVG.
- UI overlays: SVG for cards, charts, sliders, phylogeny trees, evidence sorters.
- Badges & collectibles: SVG + 256×256 PNG fallback.
- Optional ambient loop: ≤ 200KB/loop with reduced‑motion stills.
- Delivery paths: `public/games/rod/assets/{mythways|origins|shared}/`.
- Budgets: ≤ 900KB per content pack (A1–A3 or O1–O3) aggregated after brotli.

Track A — MythWays (Mythologies & Pantheons)

- Core systems: evidence sorter (epithets/roles/contexts), map/path assembly, parallel‑inscription mini‑puzzle.
- Sensitivity guardrails: precise terminology; show intra‑cultural diversity; avoid caricature and inappropriate sacred
  depictions; add brief “notes on contested scholarship.”
- Per‑case asset template (A1–A3):
  - 1–2 backgrounds (field site, archive, map table)
  - 3–6 props (inscription shards, coins, ledger pages, markers)
  - 1–2 UI overlays (evidence sorter, inscription compare)
  - 1 badge + 1 collectible
  - Optional ambient loop (field ambience) + stills
- Per‑case task checklist (MythWays):
  - Deliver backgrounds, props, overlays, badge, collectible; attach annotated PNG (click zones, reading order).
  - Provide transliteration placeholders or abstract glyphs as needed; avoid real sacred text reproductions.
  - Add a short cultural sensitivity note block; cite generic references.
  - Link PR to `docs/rite-of-discovery-stories.md` entries A1–A3 and mark status.

Track B — Origins (Evolution & Nature)

- Core systems: trait sliders + fitness landscape mini‑games, phylogeny builder, spot‑the‑adaptation overlays.
- Scientific guardrails: separate models vs. observations; neutral tone; no medical/health claims; cite generic
  examples.
- Per‑case asset template (O1–O3):
  - 1–2 backgrounds (lab bench, field map, gallery board)
  - 3–6 props (specimens, charts, spectrograms, seeds)
  - 1–2 UI overlays (sliders, phylogeny canvas, album cards)
  - 1 badge + 1 collectible
  - Optional ambient loop (lab/field) + stills
- Per‑case task checklist (Origins):
  - Deliver backgrounds, props, overlays, badge, collectible; annotated PNG with affordances and alt‑text hints.
  - Ensure colorblind‑safe palettes for charts; label axes; provide textual summaries.
  - Add a short science humility note; avoid species/brand specifics.
  - Link PR to `docs/rite-of-discovery-stories.md` entries O1–O3 and mark status.

Definition of Done (15+ additions)

- All assets meet budgets and naming; hotspots/UI affordances annotated.
- Reduced‑motion stills for loops; overlays readable without animation.
- Sensitivity/Science note blocks present and checked.
- PR references the exact story entries (A1–A3, O1–O3) and toggles status.

## 5) Global UI assets (shared)

- Age/tone selector illustrations (optional): `ui_mode_gentle.svg`, `ui_mode_standard.svg`, `ui_mode_older.svg`.
- Episode cards: `ui_ep_card_A.svg`, `ui_ep_card_B.svg`, etc.
- Journal/Codex: `journal_frame.svg`, `journal_tab_icons_[entries|badges|settings].svg`.
- Dialogue portraits (optional): `char_parent.svg`, `char_kid.svg` (keep expressive but simple); optional alt
  expressions.

## 6) Motion & accessibility

- Loops ≤ 6s, low amplitude. Provide stills for `prefers-reduced-motion`.
- Focus rings and minimum target size ≥ 44px.
- Don’t rely on motion for meaning; always provide static affordances.

## 7) Hand‑off workflow (per episode/case)

Deliverables checklist

1. Background(s) AVIF (+WEBP) at 2560×1440 and 1920×1080.
2. Props SVGs named per spec; hotspot props separate.
3. Badge and collectible SVGs.
4. Optional micro‑animations (JSON or notes) with reduced‑motion stills.
5. One annotated PNG mock with hotspot rectangles (%‑based positions suggested) and notes.
6. Palette notes (if any).

Review loop

- We import assets under `public/games/rod/assets/...`, wire hotspots, and share a short video/gif. We aim for 1–2
  iteration cycles per episode/case.

PR checklist (paste into PR description)

- [ ] Backgrounds (2560×1440 + 1920×1080) AVIF + WEBP
- [ ] Props SVGs (clean paths; separate layers for hotspots)
- [ ] Badge(s) and collectible(s)
- [ ] Optional loops + reduced‑motion stills
- [ ] Annotated PNG with hotspot rectangles and notes
- [ ] File names and locations per spec; budgets verified
- [ ] Linked to `docs/rite-of-discovery-stories.md` case/scene and marked status

— — —

# Rite of Discovery — Cahier pour le/la designer/animateur·rice (FR)

Ce cahier est le guide de production des visuels et de l’animation pour le jeu point‑and‑click “Rite of Discovery”. Il
complète le document de conception `docs/rite-of-discovery.md` et détaille les livrables (formats, tailles, nommage) et
le flux de livraison.

Lien vers le document de conception (systèmes, scènes, extension 12+) :

- docs/rite-of-discovery.md

Principes clés pour tout le contenu

- Gentillesse et moralité au centre : le/la joueur·se ne doit jamais apprendre qu’il est acceptable d’être méchant·e.
  L’humour est doux, la curiosité est récompensée, le respect est la norme.
- Ton par audience : MVP (7–9 ans, avec mode “Doux”) et extension 12+ (“Outils de Pensée”) gardent une voix chaleureuse,
  malicieuse et bienveillante.
- Accessibilité : affordances claires, contraste suffisant, alternatives sans animation.
- Performance : respecter les budgets; privilégier le vectoriel/AVIF; boucles subtiles.

Tâches & flux de travail (vue d’ensemble)

- Cadrage
  - Lire `docs/rite-of-discovery.md` (doc principal) et `docs/rite-of-discovery-stories.md` (suivi des histoires).
  - Confirmer l’audience/le ton (MVP 7–9 ou 12+), les besoins d’accessibilité, et la Définition de Fini (ci‑dessous).
- Concept
  - 1 vignette d’ambiance (valeurs/compo) + nuancier rapide.
  - Lister 3–6 hotspots/props séparés; signaler les opportunités d’animation et leurs statiques.
- Production
  - Rendre les arrières‑plans AVIF+WEBP; exporter les props en SVG (chemins propres; sans rasters intégrés).
  - Nommer/placer selon la spec; respecter les budgets; PNG annoté avec zones cliquables.
- Revue & itérations
  - Remise via PR avec checklist; revue d’une capture d’intégration; viser ≤2 cycles.
- Finalisation
  - Valider accessibilité (contraste, focus, motion réduite), codecs, tailles, nommage.
  - Mettre à jour le statut dans `docs/rite-of-discovery-stories.md`.

## 1) Direction artistique

- Style : chaleureux, cosy, légèrement fantaisiste. Éclairage doux, formes arrondies.
- Composition : informations clés dans les 90% centraux (marge de sécurité 5%).
- Indices de palette (indicatifs) :
    - Scènes familiales : ambres chauds, neutres doux; teintes nocturnes pour l’intérieur.
    - Cas “Outils de Pensée” : teintes d’accent par thème (probabilité → bleus; rhétorique → violets;
      incitations/cadrage → or/orange).

Mood boards (références libres)

- Intérieurs cosy & lumière chaude : https://www.pexels.com/search/cozy%20interior/
- Dégradés abstraits/“pensée” : https://www.pexels.com/search/abstract%20gradient/
  (Inspirations uniquement.)

## 2) Formats, tailles, nommage, livraison

- Arrières‑plans : AVIF (privilégié), WEBP; 2560×1440 et 1920×1080. `ep<LETTRE>_scene<NUM>_bg.avif`.
- Props/éléments interactifs : SVG (privilégié) ou PNG transparent 2×. `ep<LETTRE>_scene<NUM>_<prop>.svg`.
- Overlays UI : SVG. `ui_<scope>_<nom>.svg`.
- Badges/collector : SVG, PNG 256×256 en secours. `badge_<id>.svg`, `collect_<id>.svg`.
- Boucles d’animation : Lottie JSON (optionnel) ou séquence PNG ≤ 200KB. Statiques pour “réduction des animations”.
- Dossier : `public/games/rod/assets/{epA|epB|epC|epD|shared}/`.
- Budgets (cibles) : ≤ 800KB par épisode; ≤ 30KB par SVG; ≤ 200KB par boucle.

Nouvelle Partie+ — Mini Mentor (Aider le/la petit·e frère/soeur)

- Objectif : Vignette courte et rejouable, déverrouillée par le badge d’Aide/"Helper", où l’aîné·e guide gentiment
  son/sa cadet·te. Évoque S1–S3 sans dévoiler de secrets.
- Arrières‑plans :
  - `epMM_bg.avif` (espace familial cosy; salon ou chambre)
- Props & overlays UI :
  - Écho Étiquette (S1) : réutiliser `epA_scene1_gift_tag_pieces_[1..3].svg` (ou variantes allégées)
  - Écho Note (S2) : réutiliser `epB_note.svg` (paire) pour « repérer la ressemblance »
  - Écho Discussion (S3) : `ui_moment_cards_[1..3].svg` (cartes « après le goûter », « histoire du soir », « matin du
    week‑end »)
  - Overlay « conseils mentor » : `ui_mentor_tips.svg`
- Collectible :
  - `collect_mentor_sticker.svg` (autocollant/Codex)
- Budgets :
  - Rester dans les budgets MVP; privilégier la réutilisation. Nouveaux overlays ≤ 30KB/SVG.

Checklist (Mini Mentor)

- Livrer : `epMM_bg.avif`; `ui_mentor_tips.svg`; `ui_moment_cards_[1..3].svg`; confirmer la réutilisation des props
  S1/S2 (ou fournir des variantes plus légères si besoin).
- Notes : Grandes cibles (≥44px). PNG annoté indiquant l’emplacement des « conseils mentor » et la disposition des
  cartes.
- Garde‑fous : Pas d’astuce ni de spoiler; respect de la vie privée; statiques prévues pour motion réduite.

## 8) Extensions 15+ — MythWays (Panthéons) et Origins (Nature)

Audience & ton (15+) : respectueux, curieux, espiègle; zéro moquerie. Gentillesse, sensibilité culturelle et humilité
scientifique sont obligatoires.

Spécifications communes (deux pistes)

- Arrières‑plans : AVIF + WEBP, 2560×1440 et 1920×1080; zone sûre respectée.
- Props : SVG (chemins propres; sans rasters intégrés); ≤ 30KB par SVG.
- Overlays UI : SVG (cartes, graphiques, curseurs, phylogénie, tri d’indices).
- Badges & collectibles : SVG + PNG 256×256 secours.
- Boucles ambiance (option) : ≤ 200KB avec statiques pour motion réduite.
- Dossiers : `public/games/rod/assets/{mythways|origins|shared}/`.
- Budgets : ≤ 900KB par pack (A1–A3 ou O1–O3) après brotli.

Piste A — MythWays (Mythologies & panthéons)

- Systèmes : tri d’indices (épithètes/rôles/contexte), carte/chemins, puzzle d’inscriptions parallèles.
- Garde‑fous culturels : terminologie précise; diversité intra‑culturelle; éviter caricatures et représentations sacrées
  inappropriées; ajouter des « notes sur débats académiques ».
- Gabarit de livrables (A1–A3) :
  - 1–2 arrières‑plans (terrain, archives, table de cartes)
  - 3–6 props (fragments d’inscription, monnaies, pages de registre, marqueurs)
  - 1–2 overlays UI (tri d’indices, comparaison d’inscriptions)
  - 1 badge + 1 collectible
  - Boucle d’ambiance optionnelle + statiques
- Checklist par cas (MythWays) :
  - Livrer fonds, props, overlays, badge, collectible; PNG annoté (zones cliquables, ordre de lecture).
  - Fournir translittérations ou glyphes abstraits; éviter textes sacrés réels.
  - Ajouter un court encart de sensibilité culturelle; citer des références génériques.
  - Lier la PR aux entrées A1–A3 dans `docs/rite-of-discovery-stories.md` et mettre à jour le statut.

Piste B — Origins (Évolution & nature)

- Systèmes : curseurs de traits + paysages de fitness, constructeur de phylogénies, « trouver l’adaptation ».
- Garde‑fous scientifiques : distinguer modèles vs observations; ton neutre; pas de promesses médicales; exemples
  génériques.
- Gabarit de livrables (O1–O3) :
  - 1–2 arrières‑plans (paillasse, carte de terrain, panneau)
  - 3–6 props (spécimens, graphiques, spectrogrammes, graines)
  - 1–2 overlays UI (curseurs, phylogénie, album)
  - 1 badge + 1 collectible
  - Boucle d’ambiance optionnelle + statiques
- Checklist par cas (Origins) :
  - Livrer fonds, props, overlays, badge, collectible; PNG annoté avec affordances et indices d’alternatives textuelles.
  - Palettes sûres pour daltonisme; axes étiquetés; résumés textuels.
  - Ajouter un court encart d’humilité scientifique; éviter espèces/marques spécifiques.
  - Lier la PR aux entrées O1–O3 dans `docs/rite-of-discovery-stories.md` et mettre à jour le statut.

Définition de Fini (ajouts 15+)

- Budgets/nommage respectés; affordances UI annotées.
- Statiques pour motion réduite; overlays lisibles sans animation.
- Encart Sensibilité/Science présent et vérifié.
- PR référencie les entrées (A1–A3, O1–O3) et met à jour le statut.

Définition de Fini (DoD) — assets

- Arrières‑plans 2560×1440 et 1920×1080 en AVIF (+ WEBP) avec zone de sécurité respectée.
- Props en SVG individuels, regroupés visuellement par scène/cas; IDs/classes supprimés sauf besoin thématique.
- Boucles optionnelles avec image statique pour `prefers-reduced-motion` et lisibilité à l’arrêt.
- PNG annoté avec zones cliquables et indications de profondeur; notes de palette si utile.
- Fichiers nommés/placés sous `public/games/rod/assets/...` exactement; budgets respectés.

## 3) MVP (7–9 ans) — scènes et assets

Arrières‑plans (1–2 par scène) et props séparés selon le document principal (S1 Salon, S2 Chambre, S3 Preuve, Épilogue).

- Exemples de props : `epA_scene1_gift_tag_pieces_[1..5].svg`, `epB_note.svg`, `epC_receipt.svg`,
  `epX_helper_badge.svg`.
- Collectibles : `collect_ornament.svg`, `collect_tooth_charm.svg`, `collect_ribbon.svg`.
- Badges : `badge_confidence.svg`, `badge_curious.svg`, `badge_detective.svg`.
- Micro‑animations (optionnel) : bougie, veilleuse, poussière; alternatives statiques obligatoires.
- Garde‑fous de gentillesse : pas de moquerie; mise en valeur du rite de passage et de la confiance familiale.

Checklist par scène (MVP)

- S1 Veille
  - Livrables : salon de nuit; morceaux d’étiquette (3–5), scotch, rouleau, assiette de biscuits.
  - Notes : espace négatif pour l’UI; léger dégradé de lumière pour la profondeur.
- S2 Tradition de la Dent
  - Livrables : chambre (nuit; jour en option); couvercle de boîte, variantes de billet, latte du plancher, poignée.
  - Notes : contraste assuré sur petits props; variantes A/B dans les noms de fichiers.
- S3 Moment de Preuve
  - Livrables : magasin/grenier; reçu, haut‑parleur du téléphone, sac de costume.
  - Notes : reçu prévu pour puzzle d’assemblage; éviter des marques réelles.
- Épilogue
  - Livrables : espace familial chaleureux; badge d’“assistant”.
  - Notes : ton doux et célébratoire; prévoir une statique « confetti » pour motion réduite.

## 4) Extension 12+ — “Outils de Pensée” (ludique & rejouable)

Cadre : “Club des Jeunes Enquêteurs” — mini‑enquêtes courtes et enlevées, avec deux parcours et une “fin maline”.
Enseigner par le jeu.

Modèle d’assets par cas

- 1–2 arrières‑plans; 3–5 props; 1–2 overlays UI; 1 badge; ambiance optionnelle.

Cas (exemples résumés, tous centrés sur la bienveillance)

1) Le Bon de Réduction Mystérieux (Ancrage + Cadrage)

- Parcours : (A) Recomposer un reçu; (B) Mini‑expérimentation avec échantillons.
- Fin bonus : “Détective des Prix” via un collectible caché.

2) Le Fil Écho (Biais de Confirmation + Bulles de Filtres)

- Parcours : (A) Collage de sources croisées; (B) Joute de débat respectueuse.
- Fin bonus : scène avec un·e journaliste si 2+ “Lentilles Média”.

3) La Série à Pile (Pari du Joueur + Probabilités)

- Parcours : (A) Simulation de lancers + histogramme; (B) Zine humoristique contre la superstition.
- Fin bonus : mini‑jeu canapé à deux.

4) Le Patch Miracle (Post Hoc + Placebo)

- Parcours : (A) A/B test en secret; (B) Timeline multi‑causes.
- Fin bonus : montage d’équipe avec “Presse‑livret de Coach”.

5) L’Affiche Incroyable (Appel à l’Autorité + Ad Hominem)

- Parcours : (A) Tamponner les crédentials; (B) Nettoyer les attaques personnelles.
- Fin bonus : “Hôtel de Ville” si les cas précédents sont sans sophismes.

Système de rejouabilité

- Carte des cas avec médailles : Bronze (finir), Argent (sans aide), Or (fin “maline”). Codex des fins.
- Remix quotidien (optionnel) : sources mélangées, NPC différent.

Checklist par cas (12+)

- Pour chaque cas, livrer :
  - 1–2 arrières‑plans; 3–5 props/preuves; 1–2 overlays UI; 1 badge; ambiance optionnelle + statique.
  - Un PNG annoté indiquant l’emplacement des preuves et UI des mini‑jeux.
  - Respect des garde‑fous de bienveillance (pas de ridicule; résolution constructive).
  - Lier la PR à l’entrée correspondante dans `docs/rite-of-discovery-stories.md` et cocher le statut.

## 5) UI global (partagé)

- Sélecteur d’âge/ton (illustrations), cartes d’épisode, Journal/Codex, portraits simples.

## 6) Mouvement & accessibilité

- Boucles ≤ 6s, faible amplitude, versions statiques.
- Anneaux de focus visibles; cibles ≥ 44px; sens non dépendant de l’animation.

## 7) Livraison (par épisode/cas)

Checklist de livraison

1. Arrières‑plans AVIF (+WEBP) 2560×1440/1920×1080.
2. Props SVG nommés; props d’interaction séparés.
3. Badge et collectible SVG.
4. Micro‑animations (JSON ou notes) + statiques.
5. PNG annoté avec zones cliquables (% recommandé) + notes.
6. Notes de palette (si utiles).

Boucle de revue

- Intégration dans l’app, partage d’un court screencast; 1–2 itérations visées par épisode/cas.

Checklist PR (à coller dans la description)

- [ ] Arrières‑plans (2560×1440 + 1920×1080) AVIF + WEBP
- [ ] Props SVG (chemins propres; calques séparés pour hotspots)
- [ ] Badge(s) et collectible(s)
- [ ] Boucles optionnelles + statiques motion réduite
- [ ] PNG annoté (zones cliquables + notes)
- [ ] Noms et emplacements conformes; budgets vérifiés
- [ ] Lien vers `docs/rite-of-discovery-stories.md` et statut mis à jour