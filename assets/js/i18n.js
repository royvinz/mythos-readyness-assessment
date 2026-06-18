// i18n.js — UI chrome bilingual dictionary
// Covers all static labels; question content comes from questions.json

const I18N = {
  fr: {
    // Nav
    nav_dashboard: "Tableau de bord",
    nav_ingest:    "Ingest plan",
    nav_config:    "Configuration",
    nav_reset:     "Réinitialiser",
    nav_lang:      "EN",

    // Axes
    axis_A: "Adapter la fonction cyber",
    axis_B: "AI4Cyber",
    axis_C: "Cyber4AI",

    // Dashboard section titles
    dash_global_score:   "Score global",
    dash_questions:      "Questions notées",
    dash_progress:       "Progression",
    dash_priority:       "Pilier prioritaire",
    dash_pillar_scores:  "Score par pilier",
    dash_radar:          "Radar de maturité",
    dash_subtopics:      "Détail par sous-thème",
    dash_actions:        "Exporter",
    dash_export_csv:     "Exporter CSV",
    dash_print:          "Imprimer / PDF",

    // Dashboard empty state
    dash_empty: "Complétez les piliers T1–T5 pour voir vos résultats en temps réel.",

    // Score levels
    level_0: "Absent",
    level_1: "Ad hoc",
    level_2: "Défini",
    level_3: "Opéré",

    // Level full names (for button tooltips)
    level_0_full: "Absent — non adressé",
    level_1_full: "Ad hoc / pilote",
    level_2_full: "Défini & en place",
    level_3_full: "Opéré, mesuré & en amélioration",

    // Maturity bands
    mat_absent:   "Absent",
    mat_adhoc:    "Ad hoc",
    mat_defined:  "Défini",
    mat_operated: "Opéré",

    // Question card
    q_descriptors: "Voir les descripteurs 0–3",
    q_hide_desc:   "Masquer les descripteurs",
    q_note_label:  "Note / preuve (facultatif)",
    q_note_ph:     "Entrez vos observations…",
    q_not_scored:  "Non noté",
    q_scored:      "noté",
    q_of:          "/",

    // Sub-theme header
    sub_progress: "notées",

    // Reset modal
    reset_title:   "Réinitialiser l'évaluation ?",
    reset_body:    "Tous les scores et notes seront effacés. Cette action est irréversible.",
    reset_confirm: "Oui, réinitialiser",
    reset_cancel:  "Annuler",

    // Refs labels
    refs_other: "Autres référentiels",

    // CSV headers
    csv_id:      "ID",
    csv_pillar:  "Pilier",
    csv_axis:    "Axe",
    csv_sub:     "Sous-thème",
    csv_q:       "Question",
    csv_score:   "Score",
    csv_level:   "Niveau",
    csv_note:    "Note",

    // Cascade chip label
    cascade_label: "Cascade",

    // Priority label
    priority_label: "Pilier prioritaire",
    priority_none:  "—",

    // Footer
    footer_refs:    "Référentiels : CSA AI Vulnerability Storm v0.9 · NIST CSF 2.0 · MITRE ATLAS · OWASP LLM & Agentic Top 10 · CISA BOD 26-04",
    footer_version: "v1.0 · Wavestone · 2026",

    // Scored counter suffix
    scored_of: "notées sur 40",

    // Export modal
    export_title:       "Export des données",
    export_notice:      "Laissez vide pour un CSV en clair. Avec phrase secrète : chiffrement AES-256-GCM (PBKDF2 · 200 000 itérations). Conservez la phrase secrète — sans elle le fichier est irrécupérable.",
    export_pp_label:    "Phrase secrète (optionnel)",
    export_pp_ph:       "Laisser vide → CSV non chiffré…",
    export_plain_btn:   "Exporter CSV",
    export_enc_btn:     "Exporter chiffré (AES-256)",
    export_encrypting:  "Chiffrement…",
    export_cancel:      "Annuler",

    // Configuration
    config_title: "Configuration LLM",
    config_intro: "La clé API est stockée localement dans ce navigateur. Sur GitHub Pages, elle est utilisée côté client pour appeler le fournisseur choisi.",
    config_provider: "Fournisseur",
    config_api_key: "Clé API",
    config_model: "Modèle",
    config_custom_model: "Modèle personnalisé",
    config_endpoint: "Endpoint Azure",
    config_deployment: "Déploiement Azure",
    config_api_version: "Version API Azure",
    config_save: "Enregistrer et tester",
    config_saved: "Configuration enregistrée localement.",
    config_testing: "Test de la clé et du modèle…",
    config_valid: "Configuration valide. Test API réussi.",
    config_invalid: "Configuration enregistrée, mais test API en échec :",
    config_invalid_shape: "La réponse de test n'a pas le format attendu.",
    config_missing: "Configurez d'abord une clé API et un modèle.",
    api_network_failed: "Appel API impossible :",

    // Ingest plan
    ingest_title: "Ingest plan",
    ingest_intro: "Importez un plan existant client au format XLSX, PPTX ou PDF. Le LLM identifie les mesures déjà prévues, les manques et peut préremplir le questionnaire.",
    ingest_file_label: "Fichier à analyser",
    ingest_run: "Analyser avec le LLM",
    ingest_apply: "Préremplir le questionnaire",
    ingest_summary: "Synthèse",
    ingest_planned: "Ce qui est prévu",
    ingest_missing: "Ce qui n'est pas prévu",
    ingest_prefill: "Questions proposées",
    ingest_no_result: "Aucun résultat d'analyse pour le moment.",
    ingest_reading: "Lecture du fichier…",
    ingest_calling: "Analyse LLM en cours…",
    ingest_done: "Analyse terminée.",
    ingest_applied: "Questionnaire prérempli à partir de l'analyse.",
    ingest_error: "Erreur d'analyse : ",
    ingest_empty_file: "Le fichier ne contient pas de texte exploitable.",
    ingest_supported: "Formats acceptés : .xlsx, .pptx, .pdf",
    ingest_confidence: "Confiance",
    ingest_evidence: "Preuve",
    ingest_debug_title: "Debug API — appel et retour",
    ingest_debug_empty: "Aucun appel API d'ingestion pour le moment.",
  },

  en: {
    // Nav
    nav_dashboard: "Dashboard",
    nav_ingest:    "Ingest plan",
    nav_config:    "Configuration",
    nav_reset:     "Reset",
    nav_lang:      "FR",

    // Axes
    axis_A: "Adapt the cyber function",
    axis_B: "AI4Cyber",
    axis_C: "Cyber4AI",

    // Dashboard section titles
    dash_global_score:   "Global score",
    dash_questions:      "Questions scored",
    dash_progress:       "Progress",
    dash_priority:       "Priority pillar",
    dash_pillar_scores:  "Score by pillar",
    dash_radar:          "Maturity radar",
    dash_subtopics:      "Sub-theme detail",
    dash_actions:        "Export",
    dash_export_csv:     "Export CSV",
    dash_print:          "Print / PDF",

    // Dashboard empty state
    dash_empty: "Complete pillars T1–T5 to see your results in real time.",

    // Score levels
    level_0: "Absent",
    level_1: "Ad hoc",
    level_2: "Defined",
    level_3: "Operated",

    // Level full names
    level_0_full: "Absent — not addressed",
    level_1_full: "Ad hoc / pilot",
    level_2_full: "Defined & in place",
    level_3_full: "Operated, measured & improving",

    // Maturity bands
    mat_absent:   "Absent",
    mat_adhoc:    "Ad hoc",
    mat_defined:  "Defined",
    mat_operated: "Operated",

    // Question card
    q_descriptors: "Show level descriptors 0–3",
    q_hide_desc:   "Hide descriptors",
    q_note_label:  "Note / evidence (optional)",
    q_note_ph:     "Enter your observations…",
    q_not_scored:  "Not scored",
    q_scored:      "scored",
    q_of:          "/",

    // Sub-theme header
    sub_progress: "scored",

    // Reset modal
    reset_title:   "Reset assessment?",
    reset_body:    "All scores and notes will be deleted. This action cannot be undone.",
    reset_confirm: "Yes, reset",
    reset_cancel:  "Cancel",

    // Refs labels
    refs_other: "Other frameworks",

    // CSV headers
    csv_id:      "ID",
    csv_pillar:  "Pillar",
    csv_axis:    "Axis",
    csv_sub:     "Sub-theme",
    csv_q:       "Question",
    csv_score:   "Score",
    csv_level:   "Level",
    csv_note:    "Note",

    // Cascade chip label
    cascade_label: "Cascade",

    // Priority label
    priority_label: "Priority pillar",
    priority_none:  "—",

    // Footer
    footer_refs:    "References: CSA AI Vulnerability Storm v0.9 · NIST CSF 2.0 · MITRE ATLAS · OWASP LLM & Agentic Top 10 · CISA BOD 26-04",
    footer_version: "v1.0 · Wavestone · 2026",

    // Scored counter suffix
    scored_of: "scored out of 40",

    // Export modal
    export_title:       "Export data",
    export_notice:      "Leave empty for a plain CSV. With passphrase: AES-256-GCM encryption (PBKDF2 · 200,000 iterations). Keep the passphrase — without it the file cannot be recovered.",
    export_pp_label:    "Passphrase (optional)",
    export_pp_ph:       "Leave empty → unencrypted CSV…",
    export_plain_btn:   "Export CSV",
    export_enc_btn:     "Export encrypted (AES-256)",
    export_encrypting:  "Encrypting…",
    export_cancel:      "Cancel",

    // Configuration
    config_title: "LLM configuration",
    config_intro: "The API key is stored locally in this browser. On GitHub Pages, it is used client-side to call the selected provider.",
    config_provider: "Provider",
    config_api_key: "API key",
    config_model: "Model",
    config_custom_model: "Custom model",
    config_endpoint: "Azure endpoint",
    config_deployment: "Azure deployment",
    config_api_version: "Azure API version",
    config_save: "Save and test",
    config_saved: "Configuration saved locally.",
    config_testing: "Testing API key and model…",
    config_valid: "Configuration valid. API test succeeded.",
    config_invalid: "Configuration saved, but API test failed:",
    config_invalid_shape: "The test response did not match the expected format.",
    config_missing: "Configure an API key and model first.",
    api_network_failed: "API call failed:",

    // Ingest plan
    ingest_title: "Ingest plan",
    ingest_intro: "Upload an existing client plan as XLSX, PPTX or PDF. The LLM identifies planned measures, gaps and can pre-fill the questionnaire.",
    ingest_file_label: "File to analyze",
    ingest_run: "Analyze with LLM",
    ingest_apply: "Pre-fill questionnaire",
    ingest_summary: "Summary",
    ingest_planned: "What is planned",
    ingest_missing: "What is not planned",
    ingest_prefill: "Suggested answers",
    ingest_no_result: "No analysis result yet.",
    ingest_reading: "Reading file…",
    ingest_calling: "LLM analysis in progress…",
    ingest_done: "Analysis complete.",
    ingest_applied: "Questionnaire pre-filled from the analysis.",
    ingest_error: "Analysis error: ",
    ingest_empty_file: "The file does not contain usable text.",
    ingest_supported: "Accepted formats: .xlsx, .pptx, .pdf",
    ingest_confidence: "Confidence",
    ingest_evidence: "Evidence",
    ingest_debug_title: "API debug — request and response",
    ingest_debug_empty: "No ingestion API call yet.",
  }
};

// Active language state
let LANG = "fr";

function t(key) {
  return (I18N[LANG] && I18N[LANG][key]) || (I18N["en"][key]) || key;
}

function toggleLang() {
  LANG = LANG === "fr" ? "en" : "fr";
  document.documentElement.setAttribute("lang", LANG);
  if (typeof renderAll === "function") renderAll();
}

function pillarName(pillar) {
  return LANG === "fr" ? pillar.name_fr : pillar.name_en;
}

function subName(pillar, subCode) {
  const sub = pillar.subs[subCode];
  if (!sub) return subCode;
  return LANG === "fr" ? sub.fr : sub.en;
}

function axisName(axisCode, axes) {
  const ax = axes[axisCode];
  if (!ax) return axisCode;
  return LANG === "fr" ? ax.fr : ax.en;
}

function maturityLabel(score) {
  if (score === null || score === undefined) return "—";
  if (score < 0.75) return t("mat_absent");
  if (score < 1.50) return t("mat_adhoc");
  if (score < 2.50) return t("mat_defined");
  return t("mat_operated");
}

function levelName(n) {
  return t(`level_${n}`);
}
