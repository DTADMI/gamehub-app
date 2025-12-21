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

Collectibles & badges

- S1 collectible `collect_ornament.svg`; S2 `collect_tooth_charm.svg`; S3 `collect_ribbon.svg`.
- Badges by outcome (SVG): `badge_confidence.svg`, `badge_curious.svg`, `badge_detective.svg`.

Optional micro‑animation ideas (with reduced‑motion stills)

- Candle flicker (S1), nightlight pulse (S2), dust motes (S3 attic), soft vignette/light rays.

Niceness/morality guardrails (MVP)

- Expression: smiles, warm eye lines, candid humor; never mock or shame.
- Copy hints: avoid “gotcha”; emphasize family tradition, trust, and the rite‑of‑passage framing.

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

## 3) MVP (7–9 ans) — scènes et assets

Arrières‑plans (1–2 par scène) et props séparés selon le document principal (S1 Salon, S2 Chambre, S3 Preuve, Épilogue).

- Exemples de props : `epA_scene1_gift_tag_pieces_[1..5].svg`, `epB_note.svg`, `epC_receipt.svg`,
  `epX_helper_badge.svg`.
- Collectibles : `collect_ornament.svg`, `collect_tooth_charm.svg`, `collect_ribbon.svg`.
- Badges : `badge_confidence.svg`, `badge_curious.svg`, `badge_detective.svg`.
- Micro‑animations (optionnel) : bougie, veilleuse, poussière; alternatives statiques obligatoires.
- Garde‑fous de gentillesse : pas de moquerie; mise en valeur du rite de passage et de la confiance familiale.

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