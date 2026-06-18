// app.js — Mythos Readiness Assessment · main logic
// Loads questions.json, renders questionnaire + live dashboard, handles persistence.

const STORAGE_KEY = "mythos_readiness_v1";

// ─── State ──────────────────────────────────────────────────────────────────
let DATA = null;
let SCORES = {};
let NOTES  = {};
let ACTIVE_PANEL = "dash";
let radarChart = null;

// ─── Boot ────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  loadStorage();
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

// ─── Navigation ──────────────────────────────────────────────────────────────
function buildNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = "";
  nav.appendChild(makeNavPill("dash", t("nav_dashboard"), ""));
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
  else renderPillar(id.toUpperCase());
}

// ─── renderAll ───────────────────────────────────────────────────────────────
function renderAll() {
  buildNav();
  updateLangBtn();
  if (ACTIVE_PANEL === "dash") {
    renderDashboard();
  } else {
    renderPillar(ACTIVE_PANEL.toUpperCase());
  }
}

function updateLangBtn() {
  const btn = document.getElementById("btn-lang");
  if (btn) btn.textContent = t("nav_lang");
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
          `${stats.totalScored}<span style="font-size:16px;font-weight:400;color:var(--ws-muted)">/40</span>`,
          `${Math.round(stats.totalScored/40*100)}% ${LANG === "fr" ? "complété" : "complete"}`)}
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
        <button class="btn-export" onclick="window.print()">${t("dash_print")}</button>
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
  const pct = Math.round(stats.totalScored / 40 * 100);
  return `<div class="metric-card">
    <div class="metric-label">${t("dash_progress")}</div>
    <div class="metric-value">${pct}<span style="font-size:16px;font-weight:400">%</span></div>
    <div style="margin-top:8px">
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:var(--ws-purple)"></div></div>
    </div>
    <div class="metric-sub">${stats.totalScored} / 40</div>
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
  const lang  = q[LANG] || q.en;

  const csaBadge = buildCSABadge(q.refs.csa);
  const nistBadge = q.refs.nist && q.refs.nist !== "—"
    ? `<span class="badge badge-nist" title="NIST CSF 2.0">NIST ${esc(q.refs.nist.split(",")[0].trim())}</span>` : "";
  const atlasBadge = q.refs.atlas && q.refs.atlas !== "—"
    ? `<span class="badge badge-atlas" title="MITRE ATLAS">${esc(q.refs.atlas)}</span>` : "";
  const owaspBadge = q.refs.owasp && q.refs.owasp !== "—"
    ? `<span class="badge badge-owasp" title="OWASP">${esc(q.refs.owasp.split("/")[0].trim())}</span>` : "";
  const cascBadge = q.cascade && q.cascade !== "—"
    ? `<span class="badge badge-casc" title="${t("cascade_label")}">${esc(q.cascade)}</span>` : "";

  const scoreButtons = [0,1,2,3].map(n => {
    const sel = score === n ? ` sel-${n}` : "";
    return `<button class="score-btn${sel}"
      onclick="setScore('${esc(q.id)}',${n},'${esc(pillar.id)}')"
      aria-label="${esc(t("level_"+n+"_full"))}"
      aria-pressed="${score === n}">
      <span class="score-num">${n}</span>
      <span>${esc(t("level_"+n))}</span>
    </button>`;
  }).join("");

  const descHtml = `
    <div class="desc-row"><span class="desc-dot desc-dot-0"></span>
      <span class="desc-level color-l0">0 — ${t("level_0")}</span>
      <span class="desc-text">${esc(lang.l0)}</span></div>
    <div class="desc-row"><span class="desc-dot desc-dot-1"></span>
      <span class="desc-level color-l1">1 — ${t("level_1")}</span>
      <span class="desc-text">${esc(lang.l1)}</span></div>
    <div class="desc-row"><span class="desc-dot desc-dot-2"></span>
      <span class="desc-level color-l2">2 — ${t("level_2")}</span>
      <span class="desc-text">${esc(lang.l2)}</span></div>
    <div class="desc-row"><span class="desc-dot desc-dot-3"></span>
      <span class="desc-level color-l3">3 — ${t("level_3")}</span>
      <span class="desc-text">${esc(lang.l3)}</span></div>
    ${(q.refs.other && q.refs.other !== "—") ? `<div class="desc-other"><strong>${t("refs_other")} :</strong> ${esc(q.refs.other)}</div>` : ""}
  `;

  return `<div class="q-card" id="card-${esc(q.id)}">
    <div class="q-meta">
      <span class="q-id">${esc(q.id)}</span>
      ${csaBadge}${nistBadge}${atlasBadge}${owaspBadge}${cascBadge}
    </div>
    <div class="q-text">${esc(lang.q)}</div>
    <div class="score-row">${scoreButtons}</div>
    <button class="desc-toggle"
      onclick="toggleDesc('${esc(q.id)}')"
      id="desc-btn-${esc(q.id)}"
      aria-expanded="false">
      ${t("q_descriptors")}
    </button>
    <div class="desc-panel" id="desc-${esc(q.id)}">${descHtml}</div>
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
    const newCardEl = newCard.firstElementChild;
    const descPanel = card.querySelector(".desc-panel");
    card.replaceWith(newCardEl);
    if (descPanel && descPanel.classList.contains("open")) {
      const newDesc = document.getElementById("desc-" + qId);
      const newBtn  = document.getElementById("desc-btn-" + qId);
      if (newDesc) newDesc.classList.add("open");
      if (newBtn)  { newBtn.textContent = t("q_hide_desc"); newBtn.setAttribute("aria-expanded","true"); }
    }
  }

  updatePillarProgress(pillarId);
}

function toggleDesc(qId) {
  const panel = document.getElementById("desc-" + qId);
  const btn   = document.getElementById("desc-btn-" + qId);
  if (!panel || !btn) return;
  const open = panel.classList.toggle("open");
  btn.textContent = open ? t("q_hide_desc") : t("q_descriptors");
  btn.setAttribute("aria-expanded", open.toString());
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
  if (!DATA) return;
  const cols = [t("csv_id"),t("csv_pillar"),t("csv_axis"),t("csv_sub"),t("csv_q"),t("csv_score"),t("csv_level"),t("csv_note")];
  const rows = [cols];

  DATA.questions.forEach(q => {
    const pillar = DATA.pillars.find(p => p.id === q.pillar);
    const score  = SCORES[q.id] !== undefined ? SCORES[q.id] : "";
    const lvl    = score !== "" ? t("level_"+score) : "";
    const note   = NOTES[q.id]  || "";
    const subLbl = pillar ? subName(pillar, q.sub) : q.sub;
    const axLbl  = pillar ? axisName(pillar.axis, DATA.axes) : "";
    const qText  = (q[LANG] || q.en).q;
    rows.push([q.id, q.pillar, axLbl, subLbl, qText, score !== "" ? score : "", lvl, note]);
  });

  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = "mythos-readiness-assessment.csv";
  a.click();
  URL.revokeObjectURL(url);
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
    byPillar[p.id] = scored.length > 0
      ? scored.reduce((s, q) => s + SCORES[q.id], 0) / scored.length
      : null;

    Object.keys(p.subs).forEach(sc => {
      const subQs = qs.filter(q => q.sub === sc);
      const subScored = subQs.filter(q => SCORES[q.id] !== undefined && SCORES[q.id] !== null);
      scoredBySub[sc] = subScored.length;
      bySub[sc] = subScored.length > 0
        ? subScored.reduce((s, q) => s + SCORES[q.id], 0) / subScored.length
        : null;
    });
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
