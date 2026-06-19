// app.js — Mythos Readiness Assessment · main logic
// Loads questions.json, renders questionnaire + live dashboard, handles persistence.

const STORAGE_KEY = "mythos_readiness_v1";
const CONFIG_KEY = "mythos_llm_config_v1";
const MAX_INGEST_CHARS = 24000;
const DEBUG_TEXT_LIMIT = 16000;
const API_TIMEOUT_MS = 90000;
const INGEST_OUTPUT_TOKENS = 16000;

// ─── State ──────────────────────────────────────────────────────────────────
let DATA = null;
let SCORES = {};
let NOTES  = {};
let CONFIG = defaultConfig();
let INGEST_RESULT = null;
let INGEST_STATUS = "";
let INGEST_FILE = null;
let INGEST_BUSY = false;
let INGEST_PROGRESS = 0;
let API_DEBUG = null;
let ACTIVE_PANEL = "dash";
let radarChart = null;
let EXPORT_PASSPHRASE = null;
let COMPLETENESS_CALLBACK = null;
let IMPORT_FILE = null;

// ─── Boot ────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  loadStorage();
  loadConfig();
  loadWeights();
  setupPdfWorker();
  buildNav();
  renderAll();
});

async function loadData() {
  try {
    const resp = await fetch("./assets/data/questions.json");
    DATA = await resp.json();
  } catch (e) {
    document.getElementById("main").innerHTML =
      `<div style="padding:2rem;color:#E24B4A">
        <strong>Error:</strong> Could not load questions.json.
        Serve this page via a local server (e.g. <code>python3 -m http.server</code>).
      </div>`;
    throw e;
  }
}

// ─── Storage ─────────────────────────────────────────────────────────────────
function loadStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      SCORES = saved.scores || {};
      NOTES  = saved.notes  || {};
    }
  } catch (e) { /* ignore */ }
}

function saveStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ scores: SCORES, notes: NOTES }));
  } catch (e) { /* ignore */ }
}

function defaultConfig() {
  return {
    provider: "openai",
    apiKey: "",
    model: "gpt-5.5",
    endpoint: "",
    deployment: "",
    apiVersion: "2024-02-15-preview"
  };
}

function loadConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    CONFIG = raw ? { ...defaultConfig(), ...JSON.parse(raw) } : defaultConfig();
  } catch (e) {
    CONFIG = defaultConfig();
  }
}

async function saveConfig() {
  const provider = document.getElementById("config-provider")?.value || "openai";
  CONFIG = {
    provider,
    apiKey: document.getElementById("config-api-key")?.value.trim() || "",
    model: document.getElementById("config-model")?.value.trim() || defaultModelFor(provider),
    endpoint: document.getElementById("config-endpoint")?.value.trim().replace(/\/+$/, "") || "",
    deployment: document.getElementById("config-deployment")?.value.trim() || "",
    apiVersion: document.getElementById("config-api-version")?.value.trim() || "2024-02-15-preview"
  };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(CONFIG));
  const msg = document.getElementById("config-save-status");
  const btn = document.getElementById("config-save-btn");
  if (msg) msg.textContent = t("config_testing");
  if (btn) btn.disabled = true;

  try {
    assertConfigReady();
    await validateConfig();
    if (msg) {
      msg.textContent = t("config_valid");
      msg.className = "status-inline status-ok";
    }
  } catch (err) {
    if (msg) {
      msg.textContent = `${t("config_invalid")} ${err.message || err}`;
      msg.className = "status-inline status-error";
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

function defaultModelFor(provider) {
  return {
    openai: "gpt-5.5",
    azure: "gpt-5.5",
    claude: "claude-opus-4-8",
    mistral: "mistral-small-latest"
  }[provider] || "gpt-5.5";
}

function modelOptionsFor(provider) {
  return {
    openai: [
      ["gpt-5.5", "GPT-5.5"],
      ["gpt-5.4", "GPT-5.4"],
      ["gpt-5.4-mini", "GPT-5.4 mini"],
      ["gpt-5.4-nano", "GPT-5.4 nano"],
      ["gpt-4o", "GPT-4o"],
      ["gpt-4o-mini", "GPT-4o mini"]
    ],
    azure: [
      ["gpt-5.5", "GPT-5.5 deployment"],
      ["gpt-5.4", "GPT-5.4 deployment"],
      ["gpt-4o", "GPT-4o deployment"],
      ["gpt-4o-mini", "GPT-4o mini deployment"]
    ],
    claude: [
      ["claude-opus-4-8", "Claude Opus 4.8"],
      ["claude-sonnet-4-6", "Claude Sonnet 4.6"],
      ["claude-sonnet-4-5-20250929", "Claude Sonnet 4.5"],
      ["claude-haiku-4-5", "Claude Haiku 4.5"],
      ["claude-3-5-sonnet-latest", "Claude 3.5 Sonnet latest"],
      ["claude-3-5-haiku-latest", "Claude 3.5 Haiku latest"]
    ],
    mistral: [
      ["mistral-large-latest", "Mistral Large latest"],
      ["mistral-small-latest", "Mistral Small latest"],
      ["ministral-8b-latest", "Ministral 8B latest"],
      ["open-mistral-nemo", "Open Mistral Nemo"]
    ]
  }[provider] || [];
}

function setupPdfWorker() {
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }
}

// ─── Navigation ──────────────────────────────────────────────────────────────
function buildNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = "";
  nav.appendChild(makeNavPill("dash", t("nav_dashboard"), ""));
  nav.appendChild(makeNavPill("ingest", t("nav_ingest"), ""));
  nav.appendChild(makeNavPill("config", t("nav_config"), ""));
  DATA.pillars.forEach(p => {
    const axLabel = axisName(p.axis, DATA.axes);
    nav.appendChild(makeNavPill(p.id.toLowerCase(), p.id + " · " + pillarName(p), axLabel));
  });
}

function makeNavPill(id, label, sub) {
  const btn = document.createElement("button");
  btn.className = "nav-pill" + (ACTIVE_PANEL === id ? " active" : "");
  btn.setAttribute("aria-label", label);
  btn.innerHTML = `<span>${esc(label)}</span>` + (sub ? `<span class="nav-sub">${esc(sub)}</span>` : "");
  btn.addEventListener("click", () => showPanel(id));
  return btn;
}

function showPanel(id) {
  ACTIVE_PANEL = id;
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  const panel = document.getElementById("panel-" + id);
  if (panel) panel.classList.add("active");
  document.querySelectorAll(".nav-pill").forEach(b => b.classList.remove("active"));
  buildNav();
  if (id === "dash") renderDashboard();
  else if (id === "ingest") renderIngest();
  else if (id === "config") renderConfig();
  else renderPillar(id.toUpperCase());
}

// ─── renderAll ───────────────────────────────────────────────────────────────
function renderAll() {
  buildNav();
  updateLangBtn();
  if (ACTIVE_PANEL === "dash") {
    renderDashboard();
  } else if (ACTIVE_PANEL === "ingest") {
    renderIngest();
  } else if (ACTIVE_PANEL === "config") {
    renderConfig();
  } else {
    renderPillar(ACTIVE_PANEL.toUpperCase());
  }
}

function updateLangBtn() {
  const btn = document.getElementById("btn-lang");
  if (btn) btn.textContent = t("nav_lang");
}

// ─── Configuration ───────────────────────────────────────────────────────────
function renderConfig() {
  const panel = document.getElementById("panel-config");
  if (!panel) return;

  panel.innerHTML = `
    <section class="tool-panel">
      <div class="tool-heading">
        <span class="tool-eyebrow">${esc(t("nav_config"))}</span>
        <h1>${esc(t("config_title"))}</h1>
        <p>${esc(t("config_intro"))}</p>
      </div>

      <div class="config-grid">
        <label class="field">
          <span>${esc(t("config_provider"))}</span>
          <select id="config-provider" class="field-control" onchange="onProviderChange()">
            ${providerOption("openai", "OpenAI")}
            ${providerOption("azure", "Azure OpenAI")}
            ${providerOption("claude", "Claude")}
            ${providerOption("mistral", "Mistral")}
          </select>
        </label>

        <label class="field">
          <span>${esc(t("config_api_key"))}</span>
          <input id="config-api-key" class="field-control" type="password" autocomplete="off" value="${esc(CONFIG.apiKey)}">
        </label>

        <label class="field">
          <span>${esc(t("config_model"))}</span>
          <select id="config-model-select" class="field-control" onchange="onModelSelectChange()">
            ${modelOptions(CONFIG.provider, CONFIG.model)}
          </select>
        </label>

        <label class="field custom-model-field">
          <span>${esc(t("config_custom_model"))}</span>
          <input id="config-model" class="field-control" type="text" value="${esc(CONFIG.model || defaultModelFor(CONFIG.provider))}">
        </label>

        <label class="field azure-field">
          <span>${esc(t("config_endpoint"))}</span>
          <input id="config-endpoint" class="field-control" type="url" placeholder="https://resource.openai.azure.com" value="${esc(CONFIG.endpoint)}">
        </label>

        <label class="field azure-field">
          <span>${esc(t("config_deployment"))}</span>
          <input id="config-deployment" class="field-control" type="text" value="${esc(CONFIG.deployment)}">
        </label>

        <label class="field azure-field">
          <span>${esc(t("config_api_version"))}</span>
          <input id="config-api-version" class="field-control" type="text" value="${esc(CONFIG.apiVersion)}">
        </label>
      </div>

      <div class="tool-actions">
        <button id="config-save-btn" class="btn-export primary" onclick="saveConfig()">${esc(t("config_save"))}</button>
        <span id="config-save-status" class="status-inline">${esc(t("config_saved"))}</span>
      </div>
    </section>
  `;
  refreshProviderFields();
  refreshModelFields();
  // Append weighting section
  const wSection = document.createElement('div');
  wSection.innerHTML = renderWeightingSection();
  panel.appendChild(wSection.firstElementChild);
}

function providerOption(value, label) {
  return `<option value="${esc(value)}"${CONFIG.provider === value ? " selected" : ""}>${esc(label)}</option>`;
}

function modelOptions(provider, selectedModel) {
  const options = modelOptionsFor(provider);
  const values = new Set(options.map(([value]) => value));
  const selected = selectedModel || defaultModelFor(provider);
  const customSelected = selected && !values.has(selected);
  return options.map(([value, label]) =>
    `<option value="${esc(value)}"${selected === value ? " selected" : ""}>${esc(label)}</option>`
  ).join("") + `<option value="custom"${customSelected ? " selected" : ""}>${esc(t("config_custom_model"))}</option>`;
}

function onProviderChange() {
  const provider = document.getElementById("config-provider")?.value || "openai";
  const model = document.getElementById("config-model");
  const select = document.getElementById("config-model-select");
  const nextDefault = defaultModelFor(provider);
  if (model && select) {
    model.value = nextDefault;
    select.innerHTML = modelOptions(provider, nextDefault);
  }
  refreshProviderFields();
  refreshModelFields();
}

function onModelSelectChange() {
  const select = document.getElementById("config-model-select");
  const model = document.getElementById("config-model");
  if (select && model && select.value !== "custom") model.value = select.value;
  refreshModelFields();
}

function refreshProviderFields() {
  const provider = document.getElementById("config-provider")?.value || CONFIG.provider;
  document.querySelectorAll(".azure-field").forEach(el => {
    el.classList.toggle("hidden", provider !== "azure");
  });
}

function refreshModelFields() {
  const select = document.getElementById("config-model-select");
  const custom = document.querySelector(".custom-model-field");
  if (custom) custom.classList.toggle("hidden", select?.value !== "custom");
}

// ─── Ingest plan ─────────────────────────────────────────────────────────────
function renderIngest() {
  const panel = document.getElementById("panel-ingest");
  if (!panel) return;

  panel.innerHTML = `
    ${renderImportSection()}
    <section class="tool-panel">
      <div class="tool-heading">
        <span class="tool-eyebrow">${esc(t("nav_ingest"))}</span>
        <h1>${esc(t("ingest_title"))}</h1>
        <p>${esc(t("ingest_intro"))}</p>
      </div>

      <div class="ingest-upload">
        <label class="field">
          <span>${esc(t("ingest_file_label"))}</span>
          <input id="ingest-file" class="field-control file-control" type="file" onchange="setIngestFile(this.files[0])" accept=".xlsx,.pptx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation">
          <small id="ingest-selected-file" class="selected-file">${esc(selectedIngestFileLabel())}</small>
        </label>
        <div class="tool-actions">
          <button class="btn-export primary" onclick="runIngest()" ${INGEST_BUSY ? "disabled" : ""}>${esc(INGEST_BUSY ? t("ingest_running") : t("ingest_run"))}</button>
          <span class="status-inline">${esc(INGEST_STATUS || t("ingest_supported"))}</span>
        </div>
        ${renderIngestProgress()}
      </div>

      <div id="ingest-result">
        ${renderIngestResult()}
      </div>

      ${renderApiDebug()}
    </section>
  `;
}

function renderIngestProgress() {
  if (!INGEST_BUSY && INGEST_PROGRESS === 0) return "";
  return `<div class="ingest-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${INGEST_PROGRESS}">
    <div class="ingest-progress-top">
      <span>${esc(t("ingest_progress"))}</span>
      <strong>${INGEST_PROGRESS}%</strong>
    </div>
    <div class="bar-track"><div class="bar-fill" style="width:${INGEST_PROGRESS}%;background:var(--ws-purple)"></div></div>
  </div>`;
}

function setIngestFile(file) {
  INGEST_FILE = file || null;
  INGEST_STATUS = INGEST_FILE ? t("ingest_file_ready") : t("ingest_supported");
  INGEST_PROGRESS = 0;
  const label = document.getElementById("ingest-selected-file");
  if (label) label.textContent = selectedIngestFileLabel();
  const status = document.querySelector("#panel-ingest .status-inline");
  if (status) status.textContent = INGEST_STATUS;
}

function selectedIngestFileLabel() {
  if (!INGEST_FILE) return t("ingest_no_file");
  const size = INGEST_FILE.size ? ` · ${Math.ceil(INGEST_FILE.size / 1024)} KB` : "";
  return `${INGEST_FILE.name}${size}`;
}

function renderIngestResult() {
  if (!INGEST_RESULT) {
    return `<div class="empty-state">${esc(t("ingest_no_result"))}</div>`;
  }

  const answers = Array.isArray(INGEST_RESULT.answers) ? INGEST_RESULT.answers : [];
  const planned = Array.isArray(INGEST_RESULT.planned) ? INGEST_RESULT.planned : [];
  const missing = Array.isArray(INGEST_RESULT.missing) ? INGEST_RESULT.missing : [];

  return `
    <div class="result-grid">
      <section class="result-card result-card-wide">
        <h2>${esc(t("ingest_summary"))}</h2>
        <p>${esc(INGEST_RESULT.summary || "")}</p>
      </section>

      <section class="result-card">
        <h2>${esc(t("ingest_planned"))}</h2>
        ${renderResultList(planned)}
      </section>

      <section class="result-card">
        <h2>${esc(t("ingest_missing"))}</h2>
        ${renderResultList(missing)}
      </section>

      <section class="result-card result-card-wide">
        <div class="result-title-row">
          <h2>${esc(t("ingest_prefill"))}</h2>
          <button class="btn-export primary" onclick="applyIngestResult()">${esc(t("ingest_apply"))}</button>
        </div>
        <div class="answer-table">
          ${answers.map(renderAnswerRow).join("") || `<div class="empty-state">${esc(t("ingest_no_result"))}</div>`}
        </div>
      </section>
    </div>
  `;
}

function renderResultList(items) {
  if (!items.length) return `<div class="empty-state">${esc(t("ingest_no_result"))}</div>`;
  return `<ul class="result-list">${items.slice(0, 12).map(item => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function renderAnswerRow(answer) {
  const q = DATA.questions.find(item => item.id === answer.id);
  const title = q ? q.en.q : answer.id;
  const score = Number.isInteger(answer.score) ? answer.score : "—";
  const confidence = answer.confidence ? `${Math.round(Number(answer.confidence) * 100)}%` : "—";

  return `<article class="answer-row">
    <div>
      <strong>${esc(answer.id || "—")} · ${esc(title)}</strong>
      <p>${esc(answer.rationale || "")}</p>
      ${answer.evidence ? `<small>${esc(t("ingest_evidence"))}: ${esc(answer.evidence)}</small>` : ""}
    </div>
    <div class="answer-score">
      <span class="metric-band ${Number.isInteger(answer.score) ? bandClass(answer.score) : ""}">${esc(score)}</span>
      <small>${esc(t("ingest_confidence"))}: ${esc(confidence)}</small>
    </div>
  </article>`;
}

function renderApiDebug() {
  const payload = API_DEBUG
    ? JSON.stringify(API_DEBUG, null, 2)
    : t("ingest_debug_empty");
  return `<details class="api-debug">
    <summary>${esc(t("ingest_debug_title"))}</summary>
    <pre>${esc(payload)}</pre>
  </details>`;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function renderDashboard() {
  const panel = document.getElementById("panel-dash");
  if (!panel || !DATA) return;

  const stats = computeStats();

  panel.innerHTML = `
    <div class="dash-metrics">
      ${metricCard(t("dash_global_score"),
          stats.global !== null ? stats.global.toFixed(1) : "—",
          stats.global !== null ? `<span class="metric-band ${bandClass(stats.global)}">${maturityLabel(stats.global)}</span>` : "")}
      ${metricCard(t("dash_questions"),
          `${stats.totalScored}<span style="font-size:16px;font-weight:400;color:var(--ws-muted)">/${DATA.questions.length}</span>`,
          `${Math.round(stats.totalScored/DATA.questions.length*100)}% ${LANG === "fr" ? "complété" : "complete"}`)}
      ${progressCard(stats)}
      ${priorityCard(stats)}
    </div>

    <div class="dash-section">
      <div class="dash-section-title">${t("dash_pillar_scores")}</div>
      <div id="pillar-bars">${renderPillarBars(stats)}</div>
    </div>

    <div class="dash-section">
      <div class="dash-section-title">${t("dash_radar")}</div>
      <div class="radar-wrap"><canvas id="radarChart" role="img" aria-label="${t("dash_radar")}"></canvas></div>
    </div>

    <div class="dash-section">
      <div class="dash-section-title">${t("dash_subtopics")}</div>
      ${renderSubDetail(stats)}
    </div>

    <div class="dash-section">
      <div class="dash-section-title">${t("dash_actions")}</div>
      <div class="dash-actions">
        <button class="btn-export primary" onclick="exportCSV()">${t("dash_export_csv")}</button>
        <button class="btn-export" onclick="handlePrint()">${t("dash_print")}</button>
      </div>
    </div>
  `;

  renderRadar(stats);
}

function metricCard(label, value, sub) {
  return `<div class="metric-card">
    <div class="metric-label">${esc(label)}</div>
    <div class="metric-value">${value}</div>
    ${sub ? `<div class="metric-sub">${sub}</div>` : ""}
  </div>`;
}

function progressCard(stats) {
  const pct = Math.round(stats.totalScored / DATA.questions.length * 100);
  return `<div class="metric-card">
    <div class="metric-label">${t("dash_progress")}</div>
    <div class="metric-value">${pct}<span style="font-size:16px;font-weight:400">%</span></div>
    <div style="margin-top:8px">
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:var(--ws-purple)"></div></div>
    </div>
    <div class="metric-sub">${stats.totalScored} / ${DATA.questions.length}</div>
  </div>`;
}

function priorityCard(stats) {
  let worstPillar = "—";
  let worstScore = Infinity;
  DATA.pillars.forEach(p => {
    const s = stats.byPillar[p.id];
    if (s !== null && s < worstScore) { worstScore = s; worstPillar = p.id + " · " + pillarName(p); }
  });
  return `<div class="metric-card">
    <div class="metric-label">${t("dash_priority")}</div>
    <div class="metric-value" style="font-size:18px">${worstPillar === "—" ? "—" : esc(worstPillar.split(" · ")[0])}</div>
    <div class="metric-sub">${worstPillar === "—" ? "" : esc(worstPillar.split(" · ").slice(1).join(" · "))}</div>
  </div>`;
}

function renderPillarBars(stats) {
  return DATA.pillars.map(p => {
    const s = stats.byPillar[p.id];
    const scored = stats.scoredByPillar[p.id];
    const total  = DATA.questions.filter(q => q.pillar === p.id).length;
    const pct = s !== null ? (s / 3 * 100) : 0;
    const color = s !== null ? levelColor(s) : "var(--ws-line)";
    return `<div class="pillar-bar-row">
      <div class="pillar-bar-label">${esc(p.id)} · ${esc(pillarName(p))}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <div class="pillar-bar-score">${s !== null ? s.toFixed(1) : "—"}</div>
      <div class="pillar-bar-count">${scored}/${total}</div>
    </div>`;
  }).join("");
}

function renderSubDetail(stats) {
  return DATA.pillars.map(p => {
    const rows = Object.keys(p.subs).map(sc => {
      const s = stats.bySub[sc];
      const scored = stats.scoredBySub[sc];
      const total  = DATA.questions.filter(q => q.sub === sc).length;
      const pct = s !== null ? (s / 3 * 100) : 0;
      const color = s !== null ? levelColor(s) : "var(--ws-line)";
      return `<div class="sub-row">
        <div class="sub-row-label">${esc(subName(p, sc))}</div>
        <div class="bar-track" style="width:120px"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
        <div class="sub-row-score">${s !== null ? s.toFixed(1) : "—"}</div>
        <div class="sub-row-count">${scored}/${total}</div>
      </div>`;
    }).join("");
    return `<div class="sub-group">
      <div class="sub-group-pillar">${esc(p.id)} — ${esc(pillarName(p))}</div>
      ${rows}
    </div>`;
  }).join("");
}

function renderRadar(stats) {
  const el = document.getElementById("radarChart");
  if (!el) return;
  if (radarChart) { radarChart.destroy(); radarChart = null; }
  const labels = DATA.pillars.map(p => p.id);
  const values = DATA.pillars.map(p => {
    const s = stats.byPillar[p.id];
    return s !== null ? s : 0;
  });
  radarChart = new Chart(el, {
    type: "radar",
    data: {
      labels,
      datasets: [{
        label: t("dash_radar"),
        data: values,
        backgroundColor: "rgba(69,29,199,.15)",
        borderColor: "#451DC7",
        borderWidth: 2,
        pointBackgroundColor: "#451DC7",
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          min: 0, max: 3,
          ticks: { stepSize: 1, font: { size: 11 } },
          pointLabels: { font: { size: 12, weight: "600" }, color: "#1A1530" },
          grid: { color: "#E7E5F0" },
          angleLines: { color: "#E7E5F0" },
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

// ─── Questionnaire ────────────────────────────────────────────────────────────
function renderPillar(pillarId) {
  const panel = document.getElementById("panel-" + pillarId.toLowerCase());
  if (!panel || !DATA) return;
  const pillar = DATA.pillars.find(p => p.id === pillarId);
  if (!pillar) return;
  const qs = DATA.questions.filter(q => q.pillar === pillarId);
  const scoredCount = qs.filter(q => SCORES[q.id] !== undefined && SCORES[q.id] !== null).length;
  const pct = Math.round(scoredCount / qs.length * 100);
  const axLabel = axisName(pillar.axis, DATA.axes);

  let html = `<div class="pillar-header">
    <div class="pillar-axis-tag">Axe ${pillar.axis} — ${esc(axLabel)}</div>
    <div class="pillar-title">${esc(pillarId)} — ${esc(pillarName(pillar))}</div>
    <div class="pillar-progress-bar">
      <div class="pillar-progress-fill" style="width:${pct}%"></div>
    </div>
    <div class="pillar-progress-label">${scoredCount} / ${qs.length} ${t("sub_progress")}</div>
  </div>`;

  Object.keys(pillar.subs).forEach(sc => {
    const subQs = qs.filter(q => q.sub === sc);
    const subScored = subQs.filter(q => SCORES[q.id] !== undefined && SCORES[q.id] !== null).length;
    html += `<div class="sub-section">
      <div class="sub-header">
        <div class="sub-title">${esc(sc)} — ${esc(subName(pillar, sc))}</div>
        <div class="sub-counter">${subScored} ${t("q_of")} ${subQs.length} ${t("sub_progress")}</div>
      </div>
      ${subQs.map(q => renderQuestionCard(q, pillar)).join("")}
    </div>`;
  });

  panel.innerHTML = html;
}

function renderQuestionCard(q, pillar) {
  const score = SCORES[q.id] !== undefined ? SCORES[q.id] : null;
  const note  = NOTES[q.id] || "";
  const lang  = LANG === "fr" ? q.fr : q.en;

  const csaBadge = buildCSABadge(q.refs.csa);
  const nistBadge = q.refs.nist && q.refs.nist !== "—"
    ? `<span class="badge badge-nist" title="NIST CSF 2.0">NIST ${esc(q.refs.nist.split(",")[0].trim())}</span>` : "";
  const atlasBadge = q.refs.atlas && q.refs.atlas !== "—"
    ? `<span class="badge badge-atlas" title="MITRE ATLAS">${esc(q.refs.atlas)}</span>` : "";
  const owaspBadge = q.refs.owasp && q.refs.owasp !== "—"
    ? `<span class="badge badge-owasp" title="OWASP">${esc(q.refs.owasp.split("/")[0].trim())}</span>` : "";
  const cascBadge = q.cascade && q.cascade !== "—"
    ? `<span class="badge badge-casc" title="${t("cascade_label")}">${esc(q.cascade)}</span>` : "";

  const descs = [lang.l0, lang.l1, lang.l2, lang.l3];
  const scoreCards = [0,1,2,3].map(n => {
    const sel = score === n ? ` sel-${n}` : "";
    return `<button class="score-card${sel}"
      onclick="setScore('${esc(q.id)}',${n},'${esc(pillar.id)}')"
      aria-label="${esc(t("level_"+n+"_full"))}"
      aria-pressed="${score === n}">
      <span class="score-card-num">${n}</span>
      <span class="score-card-text">${esc(descs[n])}</span>
    </button>`;
  }).join("");

  const otherRef = (q.refs.other && q.refs.other !== "—")
    ? `<div class="q-refs-other"><strong>${t("refs_other")} :</strong> ${esc(q.refs.other)}</div>`
    : "";

  return `<div class="q-card" id="card-${esc(q.id)}">
    <div class="q-meta">
      <span class="q-id">${esc(q.id)}</span>
      ${csaBadge}${nistBadge}${atlasBadge}${owaspBadge}${cascBadge}
    </div>
    <div class="q-text">${esc(lang.q)}</div>
    ${otherRef}
    <div class="score-cards-grid">${scoreCards}</div>
    <div class="q-note">
      <label class="q-note-label" for="note-${esc(q.id)}">${t("q_note_label")}</label>
      <textarea class="q-note-input"
        id="note-${esc(q.id)}"
        placeholder="${t("q_note_ph")}"
        rows="2"
        oninput="setNote('${esc(q.id)}',this.value)"
        aria-label="${t("q_note_label")}">${esc(note)}</textarea>
    </div>
  </div>`;
}

function buildCSABadge(csaRef) {
  if (!csaRef || csaRef === "—") return "";
  const highPAs = [7,8,9,10];
  let cls = "badge-csa-critical";
  const match = csaRef.match(/PA(\d+)/);
  if (match) {
    const n = parseInt(match[1]);
    if (highPAs.includes(n)) cls = "badge-csa-high";
  }
  const label = csaRef.split("·")[0].trim();
  return `<span class="badge ${cls}" title="CSA AI Vulnerability Storm">${esc(label)}</span>`;
}

// ─── Interactions ────────────────────────────────────────────────────────────
function setScore(qId, score, pillarId) {
  if (SCORES[qId] === score) {
    delete SCORES[qId];
  } else {
    SCORES[qId] = score;
  }
  saveStorage();

  const q = DATA.questions.find(q => q.id === qId);
  if (!q) return;
  const pillar = DATA.pillars.find(p => p.id === pillarId);
  if (!pillar) return;

  const card = document.getElementById("card-" + qId);
  if (card) {
    const newCard = document.createElement("div");
    newCard.innerHTML = renderQuestionCard(q, pillar);
    card.replaceWith(newCard.firstElementChild);
  }

  updatePillarProgress(pillarId);
}

function setNote(qId, value) {
  if (value.trim()) {
    NOTES[qId] = value;
  } else {
    delete NOTES[qId];
  }
  saveStorage();
}

function updatePillarProgress(pillarId) {
  const pillar = DATA.pillars.find(p => p.id === pillarId);
  if (!pillar) return;
  const qs = DATA.questions.filter(q => q.pillar === pillarId);
  const scored = qs.filter(q => SCORES[q.id] !== undefined && SCORES[q.id] !== null).length;
  const pct = Math.round(scored / qs.length * 100);

  const fill  = document.querySelector(`#panel-${pillarId.toLowerCase()} .pillar-progress-fill`);
  const label = document.querySelector(`#panel-${pillarId.toLowerCase()} .pillar-progress-label`);
  if (fill)  fill.style.width = pct + "%";
  if (label) label.textContent = `${scored} / ${qs.length} ${t("sub_progress")}`;

  Object.keys(pillar.subs).forEach(sc => {
    const subQs = qs.filter(q => q.sub === sc);
    const subScored = subQs.filter(q => SCORES[q.id] !== undefined && SCORES[q.id] !== null).length;
    const subSections = document.querySelectorAll(`#panel-${pillarId.toLowerCase()} .sub-section`);
    subSections.forEach(ss => {
      const titleEl = ss.querySelector(".sub-title");
      if (titleEl && titleEl.textContent.startsWith(sc)) {
        const counter = ss.querySelector(".sub-counter");
        if (counter) counter.textContent = `${subScored} ${t("q_of")} ${subQs.length} ${t("sub_progress")}`;
      }
    });
  });
}

// ─── Ingest logic ────────────────────────────────────────────────────────────
async function runIngest() {
  const file = INGEST_FILE || document.getElementById("ingest-file")?.files?.[0];
  if (!file) {
    INGEST_STATUS = t("ingest_select_file");
    renderIngest();
    return;
  }
  INGEST_FILE = file;

  try {
    INGEST_BUSY = true;
    INGEST_PROGRESS = 5;
    API_DEBUG = null;
    INGEST_STATUS = t("ingest_reading");
    renderIngest();
    const text = await extractFileText(file);
    if (!text.trim()) throw new Error(t("ingest_empty_file"));

    INGEST_PROGRESS = 35;
    assertConfigReady();
    INGEST_STATUS = t("ingest_calling");
    renderIngest();

    const prompt = buildIngestPrompt(text);
    INGEST_PROGRESS = 55;
    const responseText = await callLLM(prompt, { maxTokens: INGEST_OUTPUT_TOKENS });
    INGEST_PROGRESS = 85;
    INGEST_STATUS = t("ingest_parsing");
    renderIngest();
    INGEST_RESULT = normalizeIngestResult(parseLLMJson(responseText));
    INGEST_PROGRESS = 100;
    INGEST_STATUS = t("ingest_done");
    renderIngest();
  } catch (err) {
    INGEST_PROGRESS = 0;
    INGEST_STATUS = t("ingest_error") + (err.message || err);
    renderIngest();
  } finally {
    INGEST_BUSY = false;
    renderIngest();
  }
}

async function extractFileText(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx")) return extractXlsxText(file);
  if (name.endsWith(".pptx")) return extractPptxText(file);
  if (name.endsWith(".pdf")) return extractPdfText(file);
  throw new Error(t("ingest_supported"));
}

async function extractXlsxText(file) {
  if (!window.XLSX) throw new Error("SheetJS is not loaded.");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  return workbook.SheetNames.map(name => {
    const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[name], { blankrows: false });
    return `# ${name}\n${csv}`;
  }).join("\n\n").slice(0, MAX_INGEST_CHARS);
}

async function extractPptxText(file) {
  if (!window.JSZip) throw new Error("JSZip is not loaded.");
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slideNames = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const slides = [];
  for (const name of slideNames) {
    const xml = await zip.files[name].async("text");
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const textNodes = Array.from(doc.getElementsByTagName("a:t"));
    const text = textNodes.map(node => node.textContent).filter(Boolean).join(" ");
    slides.push(`# ${name.replace("ppt/slides/", "").replace(".xml", "")}\n${text}`);
  }
  return slides.join("\n\n").slice(0, MAX_INGEST_CHARS);
}

async function extractPdfText(file) {
  if (!window.pdfjsLib) throw new Error("PDF.js is not loaded.");
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(`# Page ${i}\n${content.items.map(item => item.str).join(" ")}`);
  }
  return pages.join("\n\n").slice(0, MAX_INGEST_CHARS);
}

function assertConfigReady() {
  if (!CONFIG.apiKey || !CONFIG.model) throw new Error(t("config_missing"));
  if (CONFIG.provider === "azure" && (!CONFIG.endpoint || !CONFIG.deployment)) {
    throw new Error(t("config_missing"));
  }
}

async function validateConfig() {
  const responseText = await callLLM(
    'Return exactly this JSON object and nothing else: {"ok":true}',
    { debug: false, maxTokens: 64 }
  );
  const parsed = parseLLMJson(responseText);
  if (parsed.ok !== true) throw new Error(t("config_invalid_shape"));
}

function buildIngestPrompt(planText) {
  const questions = DATA.questions.map(q => ({
    id: q.id,
    pillar: q.pillar,
    sub: q.sub,
    question: q.en.q,
    levels: { 0: q.en.l0, 1: q.en.l1, 2: q.en.l2, 3: q.en.l3 }
  }));

  return `You are a cybersecurity readiness assessor. Analyze the client plan and map it to the Mythos Readiness questionnaire.

Return JSON only, no markdown. Schema:
{
  "summary": "short executive summary",
  "planned": ["concrete measures clearly planned"],
  "missing": ["important expected measures not found"],
  "answers": [
    {
      "id": "Q1",
      "score": 0,
      "confidence": 0.0,
      "evidence": "short quote or reference from the plan",
      "rationale": "why this score fits"
    }
  ]
}

Rules:
- Score each question from 0 to 3 using the level descriptors.
- Only score a question when the plan contains evidence. If evidence is weak, use a low confidence.
- Keep evidence short.
- Include all questions in answers if possible.

Questionnaire:
${JSON.stringify(questions)}

Client plan text:
${planText}`;
}

async function callLLM(prompt, options = {}) {
  const provider = CONFIG.provider;
  if (provider === "openai") return callOpenAI(prompt, options);
  if (provider === "azure") return callAzureOpenAI(prompt, options);
  if (provider === "claude") return callClaude(prompt, options);
  if (provider === "mistral") return callMistral(prompt, options);
  throw new Error(`Unsupported provider: ${provider}`);
}

async function callOpenAI(prompt, options = {}) {
  const data = await postJson("https://api.openai.com/v1/chat/completions", {
    headers: { Authorization: `Bearer ${CONFIG.apiKey}` },
    body: {
      model: CONFIG.model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return strict JSON only." },
        { role: "user", content: prompt }
      ]
    },
    debug: debugOptions(options)
  });
  return data.choices?.[0]?.message?.content || "";
}

async function callAzureOpenAI(prompt, options = {}) {
  const url = `${CONFIG.endpoint}/openai/deployments/${encodeURIComponent(CONFIG.deployment)}/chat/completions?api-version=${encodeURIComponent(CONFIG.apiVersion)}`;
  const data = await postJson(url, {
    headers: { "api-key": CONFIG.apiKey },
    body: {
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return strict JSON only." },
        { role: "user", content: prompt }
      ]
    },
    debug: debugOptions(options)
  });
  return data.choices?.[0]?.message?.content || "";
}

async function callClaude(prompt, options = {}) {
  const data = await postJson("https://api.anthropic.com/v1/messages", {
    headers: {
      "x-api-key": CONFIG.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: {
      model: CONFIG.model,
      max_tokens: options.maxTokens || INGEST_OUTPUT_TOKENS,
      messages: [{ role: "user", content: prompt }]
    },
    debug: debugOptions(options)
  });
  if (data.stop_reason === "max_tokens") {
    throw new Error(t("ingest_response_truncated"));
  }
  return (data.content || []).map(part => part.text || "").join("\n");
}

async function callMistral(prompt, options = {}) {
  const data = await postJson("https://api.mistral.ai/v1/chat/completions", {
    headers: { Authorization: `Bearer ${CONFIG.apiKey}` },
    body: {
      model: CONFIG.model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return strict JSON only." },
        { role: "user", content: prompt }
      ]
    },
    debug: debugOptions(options)
  });
  return data.choices?.[0]?.message?.content || "";
}

async function postJson(url, options) {
  const debug = options.debug;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };
  const requestBody = JSON.stringify(options.body);
  let response;
  let timeoutId = null;
  const controller = new AbortController();
  if (debug) {
    API_DEBUG = {
      at: new Date().toISOString(),
      provider: CONFIG.provider,
      model: CONFIG.model,
      url,
      status: "pending",
      ok: false,
      requestHeaders: sanitizeHeaders(headers),
      requestBody: truncateDebug(requestBody),
      responseBody: t("api_pending")
    };
    if (ACTIVE_PANEL === "ingest") renderIngest();
  }

  try {
    timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    response = await fetch(url, {
      method: "POST",
      headers,
      body: requestBody,
      signal: controller.signal
    });
  } catch (err) {
    const message = err.name === "AbortError"
      ? `${t("api_timeout")} ${Math.round(API_TIMEOUT_MS / 1000)}s`
      : `${t("api_network_failed")} ${err.message || err}`;
    if (debug) {
      API_DEBUG = {
        at: new Date().toISOString(),
        provider: CONFIG.provider,
        model: CONFIG.model,
        url,
        status: "network-error",
        ok: false,
        requestHeaders: sanitizeHeaders(headers),
        requestBody: truncateDebug(requestBody),
        responseBody: "",
        error: message
      };
      if (ACTIVE_PANEL === "ingest") renderIngest();
    }
    throw new Error(message);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
  const text = await response.text();

  if (debug) {
    API_DEBUG = {
      at: new Date().toISOString(),
      provider: CONFIG.provider,
      model: CONFIG.model,
      url,
      status: response.status,
      ok: response.ok,
      requestHeaders: sanitizeHeaders(headers),
      requestBody: truncateDebug(requestBody),
      responseBody: truncateDebug(text)
    };
    if (ACTIVE_PANEL === "ingest") renderIngest();
  }

  if (!response.ok) throw new Error(text || response.statusText);
  return JSON.parse(text);
}

function debugOptions(options) {
  return options.debug === false ? null : true;
}

function sanitizeHeaders(headers) {
  const out = {};
  Object.keys(headers || {}).forEach(key => {
    const lower = key.toLowerCase();
    out[key] = ["authorization", "api-key", "x-api-key"].includes(lower) ? "***" : headers[key];
  });
  return out;
}

function truncateDebug(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  if (text.length <= DEBUG_TEXT_LIMIT) return text;
  return text.slice(0, DEBUG_TEXT_LIMIT) + `\n… truncated ${text.length - DEBUG_TEXT_LIMIT} chars`;
}

function parseLLMJson(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end === -1) throw new Error(t("ingest_response_truncated"));
  if (start === -1 || end === -1) throw new Error(`${t("ingest_json_invalid")} ${t("ingest_no_json")}`);
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch (err) {
    throw new Error(`${t("ingest_json_invalid")} ${err.message || err}`);
  }
}

function normalizeIngestResult(result) {
  const knownIds = new Set(DATA.questions.map(q => q.id));
  const answers = Array.isArray(result.answers) ? result.answers : [];
  return {
    summary: String(result.summary || ""),
    planned: Array.isArray(result.planned) ? result.planned.map(String) : [],
    missing: Array.isArray(result.missing) ? result.missing.map(String) : [],
    answers: answers
      .filter(a => knownIds.has(a.id))
      .map(a => ({
        id: a.id,
        score: clampScore(a.score),
        confidence: Math.max(0, Math.min(1, Number(a.confidence) || 0)),
        evidence: String(a.evidence || ""),
        rationale: String(a.rationale || "")
      }))
      .filter(a => Number.isInteger(a.score))
  };
}

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(3, Math.round(n)));
}

function applyIngestResult() {
  if (!INGEST_RESULT || !Array.isArray(INGEST_RESULT.answers)) return;
  INGEST_RESULT.answers.forEach(answer => {
    if (!Number.isInteger(answer.score)) return;
    SCORES[answer.id] = answer.score;
    const note = [
      answer.evidence ? `${t("ingest_evidence")}: ${answer.evidence}` : "",
      answer.rationale || "",
      answer.confidence ? `${t("ingest_confidence")}: ${Math.round(answer.confidence * 100)}%` : ""
    ].filter(Boolean).join("\n");
    if (note) NOTES[answer.id] = note;
  });
  saveStorage();
  INGEST_STATUS = t("ingest_applied");
  renderIngest();
}

// ─── Reset ───────────────────────────────────────────────────────────────────
function openReset() {
  document.getElementById("modal-reset").classList.add("open");
}

function closeReset() {
  document.getElementById("modal-reset").classList.remove("open");
}

function confirmReset() {
  SCORES = {};
  NOTES  = {};
  saveStorage();
  closeReset();
  ACTIVE_PANEL = "dash";
  renderAll();
  showPanel("dash");
}

// ─── Export ──────────────────────────────────────────────────────────────────
function exportCSV() {
  const { complete, scored, total, pct } = getCompletion();
  if (!complete) {
    openCompletenessModal("export", scored, total, pct);
  } else {
    openExportModal();
  }
}

function generatePassphrase() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const b64 = btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  return b64.match(/.{1,6}/g).join("-");
}

function regenPassphrase() {
  EXPORT_PASSPHRASE = generatePassphrase();
  const el = document.getElementById("export-passphrase-code");
  if (el) el.textContent = EXPORT_PASSPHRASE;
  const btn = document.getElementById("btn-copy-passphrase");
  if (btn) { btn.textContent = "📋"; btn.title = t("export_copy_btn"); }
}

async function copyPassphrase() {
  if (!EXPORT_PASSPHRASE) return;
  try {
    await navigator.clipboard.writeText(EXPORT_PASSPHRASE);
    const btn = document.getElementById("btn-copy-passphrase");
    if (btn) { btn.textContent = "✅"; btn.title = t("export_copied"); }
    setTimeout(() => { const b = document.getElementById("btn-copy-passphrase"); if (b) { b.textContent = "📋"; b.title = t("export_copy_btn"); }}, 2000);
  } catch (e) { /* ignore */ }
}

function openExportModal() {
  EXPORT_PASSPHRASE = generatePassphrase();
  const codeEl = document.getElementById("export-passphrase-code");
  if (codeEl) codeEl.textContent = EXPORT_PASSPHRASE;
  const copyBtn = document.getElementById("btn-copy-passphrase");
  if (copyBtn) { copyBtn.textContent = "📋"; copyBtn.title = t("export_copy_btn"); }
  document.getElementById("modal-export-title").textContent    = t("export_title");
  document.getElementById("modal-export-notice").textContent   = t("export_notice");
  document.getElementById("modal-export-pp-label").textContent = t("export_pp_label");
  document.getElementById("modal-export-pp-warning").textContent = t("export_pp_warning");
  document.getElementById("modal-export-cancel").textContent   = t("export_cancel");
  document.getElementById("modal-export-confirm").textContent  = t("export_enc_btn");
  const plainBtn = document.getElementById("modal-export-plain");
  if (plainBtn) plainBtn.textContent = t("export_plain_btn");
  document.getElementById("modal-export").classList.add("open");
}

function closeExportModal() {
  document.getElementById("modal-export").classList.remove("open");
}

async function doExport() {
  if (!DATA || !EXPORT_PASSPHRASE) return;
  const confirmBtn = document.getElementById("modal-export-confirm");
  const orig = confirmBtn.textContent;
  confirmBtn.textContent = t("export_encrypting");
  confirmBtn.disabled = true;
  try {
    const encrypted = await encryptCSV(generateCSV(), EXPORT_PASSPHRASE);
    downloadFile(encrypted, "mythos-readiness-assessment.enc", "application/json;charset=utf-8;");
    closeExportModal();
  } catch (err) {
    alert("Encryption failed: " + err.message);
    confirmBtn.textContent = orig;
    confirmBtn.disabled = false;
  }
}

async function doExportPlain() {
  if (!DATA) return;
  downloadFile("\ufeff" + generateCSV(), "mythos-readiness-assessment.csv", "text/csv;charset=utf-8;");
  closeExportModal();
}

function generateCSV() {
  const cols = [t("csv_id"),t("csv_pillar"),t("csv_axis"),t("csv_sub"),t("csv_q"),t("csv_score"),t("csv_level"),t("csv_note")];
  const rows = [cols];
  DATA.questions.forEach(q => {
    const pillar = DATA.pillars.find(p => p.id === q.pillar);
    const score  = SCORES[q.id] !== undefined ? SCORES[q.id] : "";
    const lvl    = score !== "" ? t("level_" + score) : "";
    const note   = NOTES[q.id] || "";
    const subLbl = pillar ? subName(pillar, q.sub) : q.sub;
    const axLbl  = pillar ? axisName(pillar.axis, DATA.axes) : "";
    const qText  = LANG === "fr" ? q.fr.q : q.en.q;
    rows.push([q.id, q.pillar, axLbl, subLbl, qText, score !== "" ? score : "", lvl, note]);
  });
  return rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

async function encryptCSV(plaintext, passphrase) {
  const enc  = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 200000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false, ["encrypt"]
  );
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, key, enc.encode(plaintext)
  );

  const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  return JSON.stringify({
    _note: "Mythos Readiness encrypted export — AES-256-GCM / PBKDF2-SHA-256 · 200 000 iterations",
    format: "mythos-v1",
    alg: "AES-256-GCM",
    kdf: "PBKDF2-SHA-256",
    iterations: 200000,
    salt: b64(salt.buffer),
    iv:   b64(iv.buffer),
    ciphertext: b64(ciphertext)
  }, null, 2);
}

// ─── Completeness check ───────────────────────────────────────────────────────
function getCompletion() {
  if (!DATA) return { total: 0, scored: 0, pct: 0, complete: false };
  const total = DATA.questions.length;
  const scored = DATA.questions.filter(q => SCORES[q.id] !== undefined && SCORES[q.id] !== null).length;
  return { total, scored, pct: total > 0 ? Math.round(scored / total * 100) : 0, complete: scored === total };
}

function handlePrint() {
  const { complete, scored, total, pct } = getCompletion();
  if (!complete) {
    openCompletenessModal("pdf", scored, total, pct);
  } else {
    window.print();
  }
}

function openCompletenessModal(context, scored, total, pct) {
  COMPLETENESS_CALLBACK = context === "pdf" ? () => window.print() : () => openExportModal();
  const title = document.getElementById("modal-completeness-title");
  const body  = document.getElementById("modal-completeness-body");
  const confirm = document.getElementById("modal-completeness-confirm");
  const cancel  = document.getElementById("modal-completeness-cancel");
  if (title)   title.textContent   = t("completeness_title");
  if (body)    body.textContent    = t(context === "pdf" ? "completeness_body_pdf" : "completeness_body_export")
    .replace("{n}", scored).replace("{total}", total).replace("{pct}", pct);
  if (confirm) confirm.textContent = t(context === "pdf" ? "completeness_confirm_pdf" : "completeness_confirm_export");
  if (cancel)  cancel.textContent  = t("completeness_cancel");
  document.getElementById("modal-completeness").classList.add("open");
}

function closeCompletenessModal() {
  document.getElementById("modal-completeness").classList.remove("open");
  COMPLETENESS_CALLBACK = null;
}

function confirmCompleteness() {
  closeCompletenessModal();
  if (COMPLETENESS_CALLBACK) COMPLETENESS_CALLBACK();
}

// ─── Import assessment ────────────────────────────────────────────────────────
function renderImportSection() {
  return `<section class="import-section">
    <div class="tool-heading-sm">
      <span class="tool-eyebrow">${esc(t("import_title"))}</span>
      <p>${esc(t("import_intro"))}</p>
    </div>
    <div class="import-controls">
      <label class="field">
        <span>${esc(t("import_file_label"))}</span>
        <input id="import-file" class="field-control file-control" type="file"
          accept=".csv,.enc,text/csv,application/json"
          onchange="setImportFile(this.files[0])">
        <small id="import-selected-file" class="selected-file">${esc(IMPORT_FILE ? IMPORT_FILE.name : t("import_no_file"))}</small>
      </label>
      <div class="tool-actions">
        <button class="btn-export primary" onclick="importAssessment()">${esc(t("import_btn"))}</button>
        <span id="import-status" class="status-inline">${esc(t("import_supported"))}</span>
      </div>
    </div>
  </section>`;
}

function setImportFile(file) {
  IMPORT_FILE = file || null;
  const label = document.getElementById("import-selected-file");
  if (label) label.textContent = IMPORT_FILE ? IMPORT_FILE.name : t("import_no_file");
}

function importAssessment() {
  const file = IMPORT_FILE || document.getElementById("import-file")?.files?.[0];
  if (!file) {
    const s = document.getElementById("import-status");
    if (s) s.textContent = t("import_no_file");
    return;
  }
  IMPORT_FILE = file;
  const name = file.name.toLowerCase();
  if (name.endsWith(".enc")) {
    openImportPpModal();
  } else if (name.endsWith(".csv")) {
    loadAndImportCSV(file);
  } else {
    const s = document.getElementById("import-status");
    if (s) s.textContent = t("import_supported");
  }
}

function openImportPpModal() {
  document.getElementById("modal-import-pp-title").textContent = t("import_pp_title");
  document.getElementById("modal-import-pp-label").textContent = t("import_pp_label");
  const pp = document.getElementById("import-passphrase");
  if (pp) { pp.value = ""; pp.placeholder = t("import_pp_ph"); pp.type = "password"; }
  document.getElementById("modal-import-pp-confirm").textContent = t("import_confirm");
  document.getElementById("modal-import-pp-cancel").textContent  = t("import_cancel");
  document.getElementById("modal-import-pp").classList.add("open");
}

function closeImportPpModal() {
  document.getElementById("modal-import-pp").classList.remove("open");
}

function toggleImportPassphrase() {
  const input = document.getElementById("import-passphrase");
  const btn   = document.getElementById("btn-import-pp-toggle");
  if (!input || !btn) return;
  const hidden = input.type === "password";
  input.type = hidden ? "text" : "password";
  btn.textContent = hidden ? "🔒" : "👁";
}

async function doImport() {
  const pp = (document.getElementById("import-passphrase")?.value || "").trim();
  if (!pp) return;
  closeImportPpModal();
  if (!IMPORT_FILE) return;
  const statusEl = document.getElementById("import-status");
  try {
    await decryptAndImport(IMPORT_FILE, pp);
    if (statusEl) statusEl.textContent = t("import_success");
  } catch (err) {
    if (statusEl) statusEl.textContent = t("import_wrong_pp");
  }
}

async function loadAndImportCSV(file) {
  const text = await file.text();
  const count = parseAndImportCSV(text);
  renderAll();
  const s = document.getElementById("import-status");
  if (s) s.textContent = t("import_success") + " (" + count + " questions)";
}

async function decryptAndImport(file, passphrase) {
  const enc = new TextEncoder();
  const text = await file.text();
  const obj = JSON.parse(text);
  const b64d = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const salt = b64d(obj.salt), iv = b64d(obj.iv), ct = b64d(obj.ciphertext);
  const km = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name:"PBKDF2", salt, iterations:200000, hash:"SHA-256" }, km,
    { name:"AES-GCM", length:256 }, false, ["decrypt"]
  );
  const plain = await crypto.subtle.decrypt({ name:"AES-GCM", iv }, key, ct);
  const count = parseAndImportCSV(new TextDecoder().decode(plain));
  renderAll();
  const s = document.getElementById("import-status");
  if (s) s.textContent = t("import_success") + " (" + count + " questions)";
}

function parseAndImportCSV(csvText) {
  const text = csvText.replace(/^\uFEFF/, "");
  const lines = text.split("\n").filter(l => l.trim());
  if (lines.length < 2) return 0;
  let count = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (!cols || cols.length < 6) continue;
    const id = cols[0], scoreStr = cols[5], note = cols[7] || "";
    if (!id || scoreStr === "") continue;
    const score = parseInt(scoreStr);
    if (!isNaN(score) && score >= 0 && score <= 3) { SCORES[id] = score; count++; }
    if (id && note) NOTES[id] = note;
  }
  saveStorage();
  return count;
}

function parseCSVLine(line) {
  const result = []; let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
    else if (c === ',' && !inQ) { result.push(cur); cur = ""; }
    else cur += c;
  }
  result.push(cur);
  return result;
}

// ─── Weighting ────────────────────────────────────────────────────────────────
const WEIGHTS_KEY = "mythos_weights_v1";
const WEIGHT_VALS = { low: 0.5, medium: 1.0, high: 1.5 };
let WEIGHTS = {};

function loadWeights() {
  try { const r = localStorage.getItem(WEIGHTS_KEY); WEIGHTS = r ? JSON.parse(r) : {}; }
  catch (e) { WEIGHTS = {}; }
}

function saveWeights() {
  try { localStorage.setItem(WEIGHTS_KEY, JSON.stringify(WEIGHTS)); } catch (e) {}
}

function getWeight(subCode) {
  return WEIGHT_VALS[WEIGHTS[subCode] || "medium"];
}

function setWeight(subCode, level) {
  WEIGHTS[subCode] = level;
  saveWeights();
  document.querySelectorAll(`.weight-btn[data-sub="${subCode}"]`).forEach(b => {
    b.classList.toggle("active", b.dataset.level === level);
  });
  if (ACTIVE_PANEL === "dash") renderDashboard();
}

function resetWeights() {
  WEIGHTS = {};
  saveWeights();
  renderConfig();
}

function renderWeightingSection() {
  if (!DATA) return "<div></div>";
  const rows = DATA.pillars.flatMap(p =>
    Object.entries(p.subs).map(([sc, sub]) => {
      const cur = WEIGHTS[sc] || "medium";
      const subLabel = LANG === "fr" ? sub.fr : sub.en;
      return `<div class="weight-row">
        <div class="weight-row-label">
          <span class="weight-row-pillar">${esc(p.id)}</span>
          <span class="weight-row-sub">${esc(sc)} — ${esc(subLabel)}</span>
        </div>
        <div class="weight-btns">
          ${["low","medium","high"].map(lv => `<button class="weight-btn${cur===lv?" active":""}" data-sub="${esc(sc)}" data-level="${lv}" onclick="setWeight('${esc(sc)}','${lv}')">${esc(t("weight_"+lv))}</button>`).join("")}
        </div>
      </div>`;
    })
  ).join("");
  return `<div class="weight-section">
    <h2>${esc(t("weight_title"))}</h2>
    <p>${esc(t("weight_intro"))}</p>
    <div class="weight-table">${rows}</div>
    <div class="tool-actions" style="margin-top:var(--gap-md)">
      <button class="btn-export" onclick="resetWeights()">${esc(t("weight_reset"))}</button>
    </div>
  </div>`;
}

// ─── Scoring calculations ─────────────────────────────────────────────────────
function computeStats() {
  const byPillar    = {};
  const scoredByPillar = {};
  const bySub       = {};
  const scoredBySub = {};

  DATA.pillars.forEach(p => {
    const qs = DATA.questions.filter(q => q.pillar === p.id);
    const scored = qs.filter(q => SCORES[q.id] !== undefined && SCORES[q.id] !== null);
    scoredByPillar[p.id] = scored.length;

    Object.keys(p.subs).forEach(sc => {
      const subQs = qs.filter(q => q.sub === sc);
      const subScored = subQs.filter(q => SCORES[q.id] !== undefined && SCORES[q.id] !== null);
      scoredBySub[sc] = subScored.length;
      bySub[sc] = subScored.length > 0
        ? subScored.reduce((s, q) => s + SCORES[q.id], 0) / subScored.length
        : null;
    });

    // Apply sub-theme weights for pillar score
    const scoredSubs = Object.keys(p.subs)
      .map(sc => ({ sc, s: bySub[sc], w: getWeight(sc) }))
      .filter(x => x.s !== null);
    byPillar[p.id] = scoredSubs.length > 0
      ? scoredSubs.reduce((sum, x) => sum + x.s * x.w, 0) /
        scoredSubs.reduce((sum, x) => sum + x.w, 0)
      : null;
  });

  const allScored = DATA.questions.filter(q => SCORES[q.id] !== undefined && SCORES[q.id] !== null);
  const global = allScored.length > 0
    ? allScored.reduce((s, q) => s + SCORES[q.id], 0) / allScored.length
    : null;

  return { global, totalScored: allScored.length, byPillar, scoredByPillar, bySub, scoredBySub };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function esc(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

function levelColor(score) {
  if (score < 0.75) return "var(--l0-color)";
  if (score < 1.50) return "var(--l1-color)";
  if (score < 2.50) return "var(--l2-color)";
  return "var(--l3-color)";
}

function bandClass(score) {
  if (score < 0.75) return "bg-l0";
  if (score < 1.50) return "bg-l1";
  if (score < 2.50) return "bg-l2";
  return "bg-l3";
}
