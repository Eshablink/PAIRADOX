<!-- Pairadox · README -->
<div align="center">

# ✦ PAIRADOX

### *What if your AI met someone else's AI first?*

**A consent-first, multi-agent matchmaking experiment.**  
Turn participant-provided profile signals into transparent compatibility conversations — then explore the reasoning behind every match.

<br/>

[**↗ Launch Pairadox**](https://eshablink.github.io/PAIRADOX/) · [**Source code**](https://github.com/Eshablink/PAIRADOX) · [**Report an issue**](https://github.com/Eshablink/PAIRADOX/issues)

<br/>

![Status](https://img.shields.io/badge/status-live%20demo-9b87f5?style=for-the-badge)
![Tests](https://img.shields.io/badge/CI-passing-52c7a5?style=for-the-badge)
![Stack](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS-f0b6c8?style=for-the-badge)
![License](https://img.shields.io/badge/license-see%20repository-lightgrey?style=for-the-badge)

</div>

---

## ◌ The idea

Dating apps usually show you a profile and ask you to decide. **Pairadox flips the interaction:** each participant gets a profile-based agent, agents exchange structured messages about compatibility, and the app ranks matches with evidence you can inspect.

Not a magic “soulmate” score. Not a black-box LLM verdict. A small, explainable experiment in agent-mediated matchmaking.

> **The principle:** show the evidence, surface uncertainty, and never pretend missing information is a fact.

## ✨ Explore the experience

| Stage | What happens |
|---|---|
| **01 · Setup & ingestion** | Start with the labelled demo cohort or import consented participant data. |
| **02 · Profile analysis** | Review extracted interests, values, intent, lifestyle and location signals, with source evidence. |
| **03 · Agent deliberations** | Watch each pair exchange a deterministic, structured conversation. |
| **04 · Match rankings** | Compare compatibility scores, evidence coverage and each agent’s reasoning. |

## 🧠 How matching works

Each agent scores a potential match from its own perspective using a weighted set of dimensions:

| Dimension | Weight |
|---|---:|
| Shared interests | 30% |
| Values | 25% |
| Relationship intent | 20% |
| Lifestyle | 15% |
| Location | 10% |

The mutual score combines the two agents’ scores, giving extra weight to the lower score. A stated relationship-intent clash caps the mutual score at 55. Unknown dimensions stay neutral and reduce evidence coverage rather than being silently filled in.

**Important:** profile extraction uses keyword and regular-expression rules. Conversations use templates (8 messages per pair). The default scoring path does not call an LLM. This makes the demo inspectable, but it can miss paraphrases or misread ambiguous wording — treat scores as experimental signals, not dating advice.

## 🛡️ Consent, privacy & honest data

- **Consent required:** only add real people who have explicitly agreed to participate and have their profile information used for this experiment.
- **No profile scraping:** LinkedIn and Instagram URLs are stored as references; the app does not fetch either website or bypass login/access controls.
- **Participant-provided text:** analysis uses text the participant supplies from their profiles. Each extracted signal keeps its source and supporting sentence.
- **Uncertainty stays visible:** missing evidence is not invented. Participants can review and edit extracted items before matching.
- **Local demo storage:** imported cohort data is stored in that browser’s `localStorage`. This is not a secure multi-user database; avoid putting sensitive information into the demo.
- **No sensitive-trait inference:** the app does not infer age, gender, sexual orientation or traits from photos.

The built-in people are **synthetic demo profiles**, clearly labelled in the app. They are not real participants and must not be presented as such. For a real cohort, use the import flow below.

## 📦 Synthetic QA profile list

- [40-profile synthetic QA list](data/pairadox-40-synthetic-profiles.csv): entries contain fictional QA attributes from the supplied test document and are **not verified biographies**. Thakshil's candidate profile and associated research notes have been removed from the repository and experimental cohort.
- The app's **Load 41-profile experimental list** option loads 40 synthetic QA profiles plus the user's AI-drafted profile. Review the AI-drafted traits before treating them as facts.

## 🚀 Run Pairadox locally

No build step, framework install or API key required.

```bash
git clone https://github.com/Eshablink/PAIRADOX.git
cd PAIRADOX

# Open index.html directly, or serve the folder:
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Test the engine

Requires Node.js for the engine/cohort tests. The optional browser smoke test requires Python and Playwright.

```bash
node tests/engine.test.js
node tests/cohort.test.js

pip install playwright
playwright install chromium
python3 tests/ui_smoke.py
```

## 👥 Import a consented cohort

In **Setup & Ingestion**, choose **Import a real cohort (CSV)**. The importer accepts up to 25 distinct people and expects these headers:

```csv
name,linkedinUrl,instagramUrl,consent,linkedinText,instagramText
```

Each row must contain a valid LinkedIn URL, an Instagram profile URL, explicit consent (`yes`), and participant-provided text for both sources. Quote fields containing commas or line breaks. Duplicate names/URLs, missing consent and missing text are rejected.

**Only have links?** Ask participants to provide their LinkedIn headline/About text and Instagram bio plus a few captions. A URL alone is not evidence of a person’s interests. Importing replaces the demo cohort in that browser; it does not create a shared cohort for other visitors.

For 25 participants there are **300 unique pairs** (`25 × 24 ÷ 2`). Rankings and conversations are generated from the data entered in the current browser.

## 🧰 Built with

- **Frontend:** semantic HTML, CSS and vanilla JavaScript
- **Testing:** Node.js assertions and Playwright browser smoke test
- **Deployment:** GitHub Actions + GitHub Pages
- **Storage:** browser `localStorage` for the custom demo cohort

No backend or database is currently included. The optional Claude rewrite mentioned in the interface is cosmetic, available only in supported hosting contexts, and does not influence scores.

## 🧪 Quality checks

GitHub Actions runs the engine tests, cohort edge-case tests and browser smoke test; a separate workflow deploys the static app to GitHub Pages. Check the [latest workflow runs](https://github.com/Eshablink/PAIRADOX/actions) for the current result.

## 🎬 Demo walkthrough

For a short presentation, follow this order:

1. **Profiles first:** introduce the demo cohort and show source-backed profile signals.
2. **Agent dating:** run the conversations and open a message payload to explain the protocol.
3. **Rankings:** show score breakdowns, evidence coverage and uncertainty.
4. **Trust & limitations:** explain consent, participant-provided text, deterministic scoring and what is not automated.

Keep the demo clear that the included profiles are synthetic until a real, consented cohort has been imported.

## 🗺️ Current limitations

- Keyword extraction is simple and may miss context, synonyms or sarcasm.
- Thin profile text produces weak comparisons; scores depend on the information supplied.
- Agent dialogue is structured and deterministic, not autonomous free-form conversation.
- Data is browser-local; there is no account system, shared database or production security layer.
- This is a prototype for transparent compatibility exploration, not a validated predictor of relationship success.

---

<div align="center">

**PAIRADOX** · *Less swiping. More reasoning.*

Built as an experiment in explainable, agent-mediated matchmaking.

<sub>If you try it with real people, get explicit consent first and keep the evidence honest.</sub>

</div>
