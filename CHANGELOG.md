# Changelog — Mythos Readiness Questionnaire

## v1.3.2 (2026-07-09) — Support du statut `deprecated`
Implémentation du mécanisme de dépréciation préparé en v1.3. **Aucune question n'est dépréciée à ce jour** ; le questionnaire validé (47 questions) est inchangé.

### Application
- `app.js` : filtrage des questions portant `"status": "deprecated"` au chargement (`loadData`) — point de passage unique couvrant automatiquement rendu, scoring, export CSV, prompt d'ingest LLM et set d'ids connus de l'import (les réponses importées d'une question dépréciée comptent dans les réponses ignorées, sans code additionnel)

### Contrat de dépréciation (champs réservés, à poser dans `questions.json` le moment venu)
- `"status": "deprecated"` — la question disparaît de toute la chaîne ; l'absence du champ vaut `active`
- `"deprecated_in": "1.x"` — version du questionnaire qui retire la question
- `"superseded_by": "Qxx"` — optionnel, question remplaçante
- Les ids restent immuables et ne sont jamais réutilisés (règle v1.3) ; le bloc `meta.versioning` sera enrichi atomiquement dans le commit de la première dépréciation

## v1.3.1 (2026-07-09) — Import tolérant aux versions
Durcissement de l'import d'évaluations (.csv / .enc) pour opérationnaliser la rétrocompatibilité formalisée en v1.3.

### Application
- `app.js` : `parseAndImportCSV` valide désormais chaque id contre le questionnaire courant — les réponses aux ids inconnus / retirés sont ignorées (plus de pollution du stockage local) et comptées
- `app.js` : message de fin d'import enrichi — nombre de réponses importées, questions restant à compléter (ex. nouvelles questions de la version courante), réponses ignorées
- `i18n.js` : libellés `import_remaining` / `import_skipped` (FR + EN) ; texte d'intro de l'import explicitant l'acceptation des exports de versions antérieures ; `footer_version` → v1.3 ; `scored_of` → 47

## v1.3 (2026-07-09) — Questions réseau (CSA AI-Storm Networks) & versioning
Trois questions issues de la guidance réseau CSA/Cisco « Preparing Your Networks for the AI Storm », et formalisation du versioning pour la rétrocompatibilité des réponses.

### Ajouts
- **Q45** (T2 · 2.3) — Parc d'équipements réseau & sécurité : patchabilité day-of-release, refresh EoL, HA sans downtime, intégration VulnOps
- **Q46** (T3 · 3.2) — Segmentation opérée comme processus continu : barrières inline en série, segmentation by-design des nouvelles apps, SDN, échelle d'isolation OT (déconnexion / diode / NGFW dual-vendor). Complète Q24 (état) par la dimension opératoire — Q24 inchangée pour préserver la comparabilité des réponses.
- **Q47** (T3 · 3.2) — Durcissement du plan de management réseau & sécurité comme surface d'attaque à part entière : interfaces de management injoignables depuis Internet / DMZ, audit des scripts d'automatisation (secrets + revue LLM), WAF devant toute application exposée. Consolide les quick wins tactiques du papier CSA (« a security boundary is worthless if it becomes the entry point »). Le MFA / PAM des accès admin reste évalué en Q21 / Q22.

### Modifications
- **Q25** — note de cadrage enrichie : le filtrage egress doit inclure le DNS, pas seulement les IP (barème inchangé, comparabilité des réponses préservée)

### Schéma (`questions.json`)
- Champ **`introduced_in`** sur chaque question (existantes = `1.0`, nouvelles = `1.3`)
- `meta.versioning` : ids immuables et jamais réutilisés ; ordre d'affichage = position dans le tableau ; import de réponses keyé par id (un export d'une version antérieure se réimporte proprement, les questions ajoutées depuis restent vides)
- `meta.version` → `1.3` · `total_questions` → 47

### Distribution
T1 : 6 · T2 : 12 · T3 : 17 · T4 : 5 · T5 : 7 — total **47**

## v1.2 (2026-06-21) — Note de cadrage en champ dédié
Séparation de la note de cadrage : champ `note` distinct (FR + EN) à côté de `q`, au lieu d'être replié dans l'énoncé.

### Schéma (`questions.json`)
- `fr` / `en` : ajout d'un champ **`note`** (chaîne, vide si absente) ; `q` redevient l'énoncé seul
- `meta.version` → `1.2`

### Application
- `app.js` : rendu de la note de cadrage sous l'énoncé (classe `.q-cadrage`, distincte de la note utilisateur `.q-note`) ; note conservée dans le contexte du prompt de scoring IA
- `styles.css` : style `.q-cadrage` (sous-texte atténué, filet vert Wavestone)

## questions.json — v1.1 (2026-06-21)
Refonte du questionnaire : 44 questions (FR + EN), modèle de maturité à niveau unique (0–3).

### Ajouts
- **ITDR** — résilience des identités / détection & réponse aux menaces sur l'identité (T3.1)
- **Sauvegardes immuables & reprise testée** (T3.2)

### Modifications majeures
- Refonte au gabarit : énoncé court + note de cadrage repliée + 4 niveaux
- Question de crise scindée : exercice 0-day chaîné vs sauvegardes immuables
- Q27 recentrée sur l'egress (whitelist stricte) ; virtual patching déplacé
- EASM (composant, non source de vérité unique) et VOC clarifiés
- Déduplication des références ; corrections de terminologie (FR + EN)
- Cascades alignées sur le plan d'action du deck

### Distribution
T1 : 6 · T2 : 11 · T3 : 15 · T4 : 5 · T5 : 7 — total **44**
