# Changelog — Mythos Readiness Questionnaire

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
