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

    dash_empty: "Complétez les piliers T1–T5 pour voir vos résultats en temps réel.",

    level_0: "Absent",
    level_1: "Ad hoc",
    level_2: "Défini",
    level_3: "Opéré",

    level_0_full: "Absent — non adressé",
    level_1_full: "Ad hoc / pilote",
    level_2_full: "Défini & en place",
    level_3_full: "Opéré, mesuré & en amélioration",

    mat_absent:   "Absent",
    mat_adhoc:    "Ad hoc",
    mat_defined:  "Défini",
    mat_operated: "Opéré",

    q_descriptors: "Voir les descripteurs 0–3",
    q_hide_desc:   "Masquer les descripteurs",
    q_note_label:  "Note / preuve (facultatif)",
    q_note_ph:     "Entrez vos observations…",
    q_not_scored:  "Non noté",
    q_scored:      "noté",
    q_of:          "/",

    sub_progress: "notées",

    reset_title:   "Réinitialiser l'évaluation ?",
    reset_body:    "Tous les scores et notes seront effacés. Cette action est irréversible.",
    reset_confirm: "Oui, réinitialiser",
    reset_cancel:  "Annuler",

    refs_other: "Autres référentiels",

    csv_id:      "ID",
    csv_pillar:  "Pilier",
    csv_axis:    "Axe",
    csv_sub:     "Sous-thème",
    csv_q:       "Question",
    csv_score:   "Score",
    csv_level:   "Niveau",
    csv_note:    "Note",

    cascade_label: "Cascade",

    priority_label: "Pilier prioritaire",
    priority_none:  "—",

    footer_refs:    "Référentiels : CSA AI Vulnerability Storm v0.9 · NIST CSF 2.0 · MITRE ATLAS · OWASP LLM & Agentic Top 10 · CISA BOD 26-04",
    footer_version: "v1.1 · Wavestone · 2026",

    q_lang_notice: "📖 Questions et descripteurs affichés en anglais (langue source de l'instrument)",

    scored_of: "notées sur 42",

    export_title:       "Export des données",
    export_notice:      "Chiffrement AES-256-GCM (PBKDF2 · 200 000 itérations). Conservez la passphrase générée — sans elle le fichier est irrécupérable.",
    export_encrypting:  "Chiffrement…",
    export_cancel:      "Annuler",

    config_title: "Configuration LLM",
    config_intro: "La clé API est stockée localement dans ce navigateur. Sur GitHub Pages, elle est utilisée côté client pour appeler le fournisseur choisi.",
    config_provider: "Fournisseur",
    config_api_key: "Clé API",
    config_model: "Modèle",
    config_endpoint: "Endpoint Azure",
    config_deployment: "Déploiement Azure",
    config_api_version: "Version API Azure",
    config_save: "Enregistrer",
    config_saved: "Configuration enregistrée localement.",
    config_missing: "Configurez d'abord une clé API et un modèle.",

    // Score cards
    q_score_select: "Sélectionnez un niveau",

    // Export auto-generated passphrase
    export_pp_label:    "Passphrase générée automatiquement",
    export_copy_btn:    "Copier",
    export_regen_btn:   "Régénérer",
    export_pp_warning:  "⚠ Conservez cette passphrase — sans elle le fichier chiffré sera irrécupérable.",
    export_copied:      "Copié !",
    export_plain_btn:   "Exporter CSV (non chiffré)",
    export_enc_btn:     "Exporter chiffré (AES-256)",

    // Completeness check
    completeness_title:           "Évaluation incomplète",
    completeness_body_pdf:        "{n} / {total} questions notées ({pct} %). Le rapport PDF sera incomplet.",
    completeness_body_export:     "{n} / {total} questions notées ({pct} %). Exporter la progression à date ?",
    completeness_confirm_pdf:     "Générer quand même",
    completeness_confirm_export:  "Exporter quand même",
    completeness_cancel:          "Annuler",

    // Import section
    import_title:      "Importer une évaluation",
    import_intro:      "Chargez une évaluation exportée (.csv ou .enc) pour reprendre là où vous vous étiez arrêté.",
    import_file_label: "Fichier à importer",
    import_btn:        "Importer",
    import_pp_title:   "Passphrase requise",
    import_pp_label:   "Passphrase de déchiffrement",
    import_pp_ph:      "Entrez la passphrase…",
    import_confirm:    "Déchiffrer et importer",
    import_cancel:     "Annuler",
    import_success:    "Évaluation importée avec succès.",
    import_error:      "Erreur d'import : ",
    import_wrong_pp:   "Passphrase incorrecte ou fichier corrompu.",
    import_supported:  "Formats acceptés : .csv, .enc",
    import_no_file:    "Aucun fichier sélectionné",

    // Weighting
    weight_title:   "Pondération des sous-thèmes",
    weight_intro:   "Ajustez l'influence de chaque sous-thème sur les scores piliers (×0.5 / ×1.0 / ×1.5). Persisté localement.",
    weight_low:     "Faible",
    weight_medium:  "Normal",
    weight_high:    "Élevé",
    weight_reset:   "Réinitialiser",

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
  },

  en: {
    nav_dashboard: "Dashboard",
    nav_ingest:    "Ingest plan",
    nav_config:    "Configuration",
    nav_reset:     "Reset",
    nav_lang:      "FR",

    axis_A: "Adapt the cyber function",
    axis_B: "AI4Cyber",
    axis_C: "Cyber4AI",

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

    dash_empty: "Complete pillars T1–T5 to see your results in real time.",

    level_0: "Absent",
    level_1: "Ad hoc",
    level_2: "Defined",
    level_3: "Operated",

    level_0_full: "Absent — not addressed",
    level_1_full: "Ad hoc / pilot",
    level_2_full: "Defined & in place",
    level_3_full: "Operated, measured & improving",

    mat_absent:   "Absent",
    mat_adhoc:    "Ad hoc",
    mat_defined:  "Defined",
    mat_operated: "Operated",

    q_descriptors: "Show level descriptors 0–3",
    q_hide_desc:   "Hide descriptors",
    q_note_label:  "Note / evidence (optional)",
    q_note_ph:     "Enter your observations…",
    q_not_scored:  "Not scored",
    q_scored:      "scored",
    q_of:          "/",

    sub_progress: "scored",

    reset_title:   "Reset assessment?",
    reset_body:    "All scores and notes will be deleted. This action cannot be undone.",
    reset_confirm: "Yes, reset",
    reset_cancel:  "Cancel",

    refs_other: "Other frameworks",

    csv_id:      "ID",
    csv_pillar:  "Pillar",
    csv_axis:    "Axis",
    csv_sub:     "Sub-theme",
    csv_q:       "Question",
    csv_score:   "Score",
    csv_level:   "Level",
    csv_note:    "Note",

    cascade_label: "Cascade",

    priority_label: "Priority pillar",
    priority_none:  "—",

    footer_refs:    "References: CSA AI Vulnerability Storm v0.9 · NIST CSF 2.0 · MITRE ATLAS · OWASP LLM & Agentic Top 10 · CISA BOD 26-04",
    footer_version: "v1.1 · Wavestone · 2026",

    q_lang_notice: "📖 Questions and descriptors displayed in English (instrument source language)",

    scored_of: "scored out of 42",

    export_title:       "Export data",
    export_notice:      "AES-256-GCM encryption (PBKDF2 · 200,000 iterations). Save the generated passphrase — without it the file cannot be recovered.",
    export_encrypting:  "Encrypting…",
    export_cancel:      "Cancel",

    config_title: "LLM configuration",
    config_intro: "The API key is stored locally in this browser. On GitHub Pages, it is used client-side to call the selected provider.",
    config_provider: "Provider",
    config_api_key: "API key",
    config_model: "Model",
    config_endpoint: "Azure endpoint",
    config_deployment: "Azure deployment",
    config_api_version: "Azure API version",
    config_save: "Save",
    config_saved: "Configuration saved locally.",
    config_missing: "Configure an API key and model first.",

    // Score cards
    q_score_select: "Select a level",

    // Export auto-generated passphrase
    export_pp_label:    "Auto-generated passphrase",
    export_copy_btn:    "Copy",
    export_regen_btn:   "Regenerate",
    export_pp_warning:  "⚠ Save this passphrase — without it your encrypted file cannot be recovered.",
    export_copied:      "Copied!",
    export_plain_btn:   "Export CSV (plain)",
    export_enc_btn:     "Export encrypted (AES-256)",

    // Completeness check
    completeness_title:           "Assessment incomplete",
    completeness_body_pdf:        "{n} / {total} questions scored ({pct}%). The PDF report will be incomplete.",
    completeness_body_export:     "{n} / {total} questions scored ({pct}%). Export current progress?",
    completeness_confirm_pdf:     "Generate anyway",
    completeness_confirm_export:  "Export anyway",
    completeness_cancel:          "Cancel",

    // Import section
    import_title:      "Import an assessment",
    import_intro:      "Load a previously exported assessment (.csv or .enc) to resume where you left off.",
    import_file_label: "File to import",
    import_btn:        "Import",
    import_pp_title:   "Passphrase required",
    import_pp_label:   "Decryption passphrase",
    import_pp_ph:      "Enter the passphrase…",
    import_confirm:    "Decrypt and import",
    import_cancel:     "Cancel",
    import_success:    "Assessment imported successfully.",
    import_error:      "Import error: ",
    import_wrong_pp:   "Wrong passphrase or corrupted file.",
    import_supported:  "Accepted formats: .csv, .enc",
    import_no_file:    "No file selected",

    // Weighting
    weight_title:   "Sub-theme weighting",
    weight_intro:   "Adjust each sub-theme's influence on pillar scores (×0.5 / ×1.0 / ×1.5). Persisted locally.",
    weight_low:     "Low",
    weight_medium:  "Normal",
    weight_high:    "High",
    weight_reset:   "Reset",

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
  }
};

let LANG = "en";

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
