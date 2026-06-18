# Mythos Readiness — Where Do You Stand?

**Post-Mythos era · CISO readiness diagnostic · 40 questions across 5 pillars**

> *A Wavestone instrument for CISO and ExCom audiences, anchored on the CSA "AI Vulnerability Storm" framework (v0.9, April 2026).*

🌐 **Live →** [royvinz.github.io/mythos-readyness-assessment](https://royvinz.github.io/mythos-readyness-assessment/)

---

## What is this?

This is a **structured maturity self-assessment** designed for CISOs and security leadership who need to answer one question fast: *is our cyber program ready for the AI-acceleration era — or still calibrated for a world where attackers move at human speed?*

The April 2026 inflection point — frontier AI models capable of discovering and exploiting vulnerabilities in autonomous, black-box conditions at machine speed — collapses the assumptions behind most enterprise security programs. Patch windows, detection timelines, and escalation models built on human-speed threat actors no longer hold. This instrument measures where your program stands against that reality.

The 40 questions are mapped to the **CSA "AI Vulnerability Storm" Priority Actions (PA1–PA11)** and cross-referenced against NIST CSF 2.0, MITRE ATLAS, OWASP LLM & Agentic Top 10, and CISA BOD 26-04.

---

## The Wavestone three-axis model

The instrument is structured around three strategic axes that reflect how a CISO must respond to the AI-acceleration era:

| Axis | Scope | Pillars |
|------|-------|---------|
| **A — Adapt the cyber function** | Re-architect your program for AI-speed threats | T1 · T2 · T3 |
| **B — AI4Cyber** | Use AI to defend at machine speed | T4 |
| **C — Cyber4AI** | Secure and govern your own AI systems | T5 |

---

## The 5 pillars

### T1 — Govern the Acceleration *(6 questions)*
Axis A · Codes cascade G.x

Does your governance infrastructure support a program operating at AI-speed? T1 probes whether the risk model has been re-baselined (not just updated), whether the board has received a Mythos-specific briefing, whether security has standing authority to trade availability for security without ad hoc escalation, and whether the operating model can stand up new capabilities in days rather than the next budget cycle.

**Sub-themes:**
- **1.1 — Risk model & board mandate** (Q1–Q3): Re-baselined risk appetite, board briefing, operational authority
- **1.2 — Acceleration operating model & people** (Q4–Q6): Agile redeployment, P0 cadence, staffed capacity and burnout safeguards

---

### T2 — Exposure & Vulnerability Management *(10 questions)*
Axis A · Codes cascade N1.x

The most operationally loaded pillar. AI-powered scanners and exploit generators mean that vulnerabilities, once public, are weaponized in hours — not weeks. T2 tests whether your attack surface intelligence is continuous and external-in, whether crown jewels are explicitly mapped, whether the software supply chain (OSS, dependencies, vendors) is governed, and whether patching has moved from calendar-driven to risk-tiered.

**Sub-themes:**
- **2.1 — Attack surface, crown jewels, supply chain & OSS** (Q7–Q10): EASM, crown-jewels mapping, OSS dependency inventory, SLSA/provenance
- **2.2 — Remediation Tower & VulnOps** (Q11–Q13): End-to-end remediation ownership, CTEM + LLM triage, 24/7 VulnOps cell
- **2.3 — Continuous patching** (Q14–Q16): CT/CR pipeline, risk-tiered timelines (KEV/EPSS/SSVC), vendor patch-SLA + SBOM clauses

---

### T3 — Fundamentals vs AI-driven Attacks *(12 questions)*
Axis A · Codes cascade N2.x

The largest pillar. AI-driven attackers combine high-speed exploitation with AI-optimized social engineering, automated credential harvesting, and adaptive evasion. T3 tests the controls that contain blast radius and limit dwell time: containment pre-authorization, UEBA tuned for AI-emulated behavior, non-human identity governance, segmentation, egress controls, and hardened IR playbooks tested against zero-day scenarios. It also covers the emerging counter-autonomy layer — deception at machine scale.

**Sub-themes:**
- **3.1 — Detection & automated response** (Q17–Q20): Pre-authorized containment, UEBA/behavioral detection, exfiltration monitoring, sector ISAC/CERT integration
- **3.2 — Hardening & blast-radius** (Q21–Q26): Phishing-resistant MFA, PAM/JIT, NHI governance, network segmentation, egress default-deny, IR playbooks with 0-day crisis exercise
- **3.3 — Counter-autonomy & deception** (Q27–Q28): Tarpits and canaries for human attackers, agent decoys and tripwires for autonomous attackers

---

### T4 — AI4Defense *(5 questions)*
Axis B · Codes cascade N3.x

Are you using AI to match the attacker's speed? T4 probes whether AI agents are turned inward on your own code (agentic security review), whether continuous AI-powered red-teaming runs against your estate, and whether the SOC has deployed AI triage/copilots — with a critical secondary question: when you mandate AI adoption in defensive workflows, do you validate that it actually delivers?

**Sub-themes:**
- **4.1 — AI on your code** (Q29–Q30): Agentic security review of code, continuous agentic pentest
- **4.2 — Accelerate & trust the defense team** (Q31–Q33): AI triage/copilots in SOC, mandatory AI adoption, validation of AI defensive effectiveness

---

### T5 — Cyber4AI: Secure & Govern Your Own AI *(7 questions)*
Axis C · Codes cascade N3.x / G.x

The fastest-growing risk surface. T5 covers governance of your own AI adoption (explicit stance, agentic coding tool guardrails, EU AI Act / ISO 42001 obligations), the security of your production and defensive agents (runtime guardrails, scoped permissions, RAG/memory integrity), and your ability to maintain a governed inventory of all AI systems — including Shadow AI and agentic supply-chain provenance.

**Sub-themes:**
- **5.1 — Govern your AI use** (Q34–Q36): AI-use policy, agentic coding tool controls, regulatory obligations
- **5.2 — Defend the agents** (Q37–Q38): Runtime guardrails, agent harness security (tool scoping, RAG integrity, memory isolation)
- **5.3 — Inventory, Shadow AI & agentic supply chain** (Q39–Q40): Governed AI inventory, MCP/agentic supply-chain integrity

---

## The maturity scale (0–3)

Each question is scored on a four-level behavioral scale:

| Score | Level | Meaning |
|-------|-------|---------|
| **0** | Absent | Not addressed; not aware; no capability in place |
| **1** | Ad hoc / pilot | Informal, manual, partial; depends on individuals |
| **2** | Defined & in place | Documented process, deployed across main scope |
| **3** | Operated, measured & improving | Continuous, automated where relevant, exercised, KPIs tracked |

A blank score means "not assessed" and is **excluded from averages**. Partial results are valid — you do not need to complete all 40 questions to read meaningful output.

**Maturity band thresholds:**

| Average score | Band |
|---------------|------|
| < 0.75 | Absent |
| 0.75 – 1.49 | Ad hoc |
| 1.50 – 2.49 | Defined |
| ≥ 2.50 | Operated |

---

## Framework references

### Primary (severity-weighted in the instrument)

| Framework | Use in this instrument | Link |
|-----------|----------------------|------|
| **CSA "AI Vulnerability Storm"** v0.9 · April 2026 | Anchor document: 11 Priority Actions (PA1–PA11), risk register, "10 Questions". PA1–PA6 + PA11 = CRITICAL; PA7–PA10 = HIGH | [cloudsecurityalliance.org/research](https://cloudsecurityalliance.org/research) |
| **NIST CSF 2.0** | Security functions mapped per question (GV · ID · PR · DE · RS · RC) | [nist.gov/cyberframework](https://www.nist.gov/cyberframework) |
| **MITRE ATLAS** | Adversarial techniques against AI/ML systems (AML.Txxxx) — Cyber4AI angle | [atlas.mitre.org](https://atlas.mitre.org/) |
| **OWASP LLM Top 10 2025** | Applicative LLM risks (LLMxx) | [genai.owasp.org/llm-top-10](https://genai.owasp.org/llm-top-10/) |
| **OWASP Agentic Top 10 2026** | Risks of agentic systems (ASIxx) | [genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/) |
| **CISA BOD 26-04** | Risk-based patch prioritization (exposure · KEV · automatable · impact); forensic triage; timelines | [cisa.gov/news-events/directives/bod-26-04](https://www.cisa.gov/news-events/directives/bod-26-04-prioritizing-security-updates-based-risk) |

### Secondary (cited per question in "Other refs")

| Framework | Link |
|-----------|------|
| NIST AI RMF | [nist.gov/itl/ai-risk-management-framework](https://www.nist.gov/itl/ai-risk-management-framework) |
| Google SAIF | [saif.google](https://saif.google/) |
| SLSA (supply-chain integrity) | [slsa.dev](https://slsa.dev/) |
| CISA SSVC | [cisa.gov/stakeholder-specific-vulnerability-categorization-ssvc](https://www.cisa.gov/stakeholder-specific-vulnerability-categorization-ssvc) |
| CISA KEV Catalog | [cisa.gov/known-exploited-vulnerabilities-catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) |
| FIRST EPSS | [first.org/epss](https://www.first.org/epss/) |
| ISO/IEC 42001 | [iso.org/standard/42001](https://www.iso.org/standard/42001) |
| OWASP NHI Top 10 | [owasp.org/www-project-non-human-identities-top-10](https://owasp.org/www-project-non-human-identities-top-10/) |
| OWASP MCP guide (GenAI Security Project) | [genai.owasp.org/initiatives/agentic-security-initiative](https://genai.owasp.org/initiatives/agentic-security-initiative/) |
| MITRE Engage (deception) | [engage.mitre.org](https://engage.mitre.org/) |
| NIST SP 800-207 (Zero Trust) | [csrc.nist.gov/pubs/sp/800/207/final](https://csrc.nist.gov/pubs/sp/800/207/final) |
| NIST SP 800-218 (SSDF) | [csrc.nist.gov/pubs/sp/800/218/final](https://csrc.nist.gov/pubs/sp/800/218/final) |
| EU AI Act | [artificialintelligenceact.eu](https://artificialintelligenceact.eu/) |

---

## How to use

### Online
Open [royvinz.github.io/mythos-readyness-assessment](https://royvinz.github.io/mythos-readyness-assessment/) directly.

### Local
```bash
git clone https://github.com/royvinz/mythos-readyness-assessment.git
cd mythos-readyness-assessment
python3 -m http.server 8080
# Open http://localhost:8080
```
> The app **must be served** (not opened as a `file://` URL) because it loads `questions.json` via `fetch`.

### Usage workflow
1. Navigate to a pillar tab (T1–T5) and read each question in the context of your organization.
2. Select a score 0–3 using the behavioral descriptors. Scores persist automatically in your browser (`localStorage`).
3. Use the optional **note / evidence** field to record supporting observations.
4. The **Dashboard** updates in real time as you score questions — no need to complete all 40.
5. Use **Configuration** to select an LLM provider/model and store an API key locally in your browser. Saving the configuration also runs a small API validity test.
6. Use **Ingest plan** to upload an existing XLSX, PPTX or PDF client plan. The LLM maps the plan to the 40 questions, highlights what is already planned and what is missing, and can pre-fill scores and evidence notes. A collapsed debug panel shows the last API request/response with sensitive headers masked.
7. Use **Export CSV** to produce a structured output for reporting or archival.
8. Use **Print / PDF** for a printable ExCom-ready summary.

> LLM calls are made client-side because this is a static GitHub Pages app. API keys are stored in browser `localStorage`; use a dedicated key and apply the provider-side restrictions appropriate for your environment.

---

## Scoring integrity rules

- **No invented statistics.** Every claim in this instrument is sourced from the frameworks listed above.
- **No Gartner, IBM, or McKinsey references.** Sources are limited to primary standards bodies (CSA, NIST, MITRE, OWASP, CISA) and Wavestone's own benchmark data.
- **CSA severity fidelity.** PA1–PA6 and PA11 are CRITICAL; PA7–PA10 are HIGH. Badge coloring reflects this.
- **Partial scoring is valid.** Unanswered questions are excluded from averages. You do not need a complete scorecard to get meaningful output.

---

## Repository structure

```
mythos-readyness-assessment/
├── index.html                  # Single-page application shell
├── assets/
│   ├── css/styles.css          # Wavestone design system
│   ├── js/app.js               # Scoring, dashboard, export, LLM ingest, persistence
│   ├── js/i18n.js              # Bilingual UI chrome (FR default / EN toggle)
│   └── data/questions.json     # Source of truth — 40 questions, all refs, descriptors
└── README.md
```

---

## Version

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | June 2026 | Initial release · 40 questions · T1=6 · T2=10 · T3=12 · T4=5 · T5=7 |

---

*Wavestone — Internal use / Usage interne · Not for redistribution*
