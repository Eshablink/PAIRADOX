# Pairadox: agent-mediated matchmaking demo

Each participant is represented by an agent. Agents read only the profile text their person supplied (LinkedIn + public Instagram), exchange structured messages with every other agent, and produce ranked matches with explainable scores.

**Status (verified in the sandbox that built this; re-run on your machine):**
- Engine tests pass: `node tests/engine.test.js` (6 synthetic people, 15 pairs) and `node tests/cohort.test.js` (missing evidence, edit/removal re-extraction, no duplicate or self pairs, rankings for every participant, 25-person cohort = 300 pairs).
- A real-browser smoke test (Playwright + Chromium, 1440x900) passes (it also checks the rankings score-band filter, the consent guard on the add form, and reports mobile horizontal overflow; 5px at 390px wide, so mobile is not polished): Pairadox title, no Kindred text, steps 3-4 locked until profiles are confirmed, full run, rankings render, and removing a profile item locks rankings again. Only console error: Google Fonts failed to load because the sandbox had no internet.
- Not verified: phone/other browsers, real font rendering, the optional Claude rewrite (only its fallback was exercised), GitHub push, deployment. No repository existed in the sandbox; none was created, so no history was touched. No deployment URL exists yet.
- The six built-in people are **synthetic** and labelled as such. No real participants are included.

## What is real and what is not

| Thing | Reality |
|---|---|
| Participants | Synthetic demo cohort, or people you add with consent |
| LinkedIn / Instagram URLs | Stored and shown, **never fetched**. Analysis uses only text the participant pastes |
| Profile extraction | Keyword/regex rules, not a model |
| Agent conversations | Deterministic template protocol, 8 messages per pair |
| Model-generated output | None by default. Optional "Claude-written" rewrite, only on claude.ai-hosted page, cosmetic, untested here |
| Scores | Deterministic, no model in the path |

The UI labels these on every step (provenance strip under the heading).

## Run it

No build step, no keys.

```bash
open index.html            # or: python3 -m http.server 8000
node tests/engine.test.js  # engine assertions
node tests/cohort.test.js  # edge cases + 25-person cohort
pip install playwright && playwright install chromium && python3 tests/ui_smoke.py  # optional browser smoke test
```

## Deploy

`.github/workflows/ci.yml` runs the tests and `.github/workflows/pages.yml` publishes `index.html` to GitHub Pages (enable Pages with source "GitHub Actions" first). Neither workflow has been run; no repository has been created or pushed from this project.

```bash
git init && git add . && git commit -m "Pairadox demo"
gh repo create pairadox --public --source=. --push # --public --source=. --push   # or create the repo in the GitHub UI
```

Then either enable **GitHub Pages** (Settings > Pages > main / root), or `npx vercel --prod` / drag the folder into Netlify. Put the resulting URL in your submission only after you have opened it and clicked through.

## Design

Visual reference: the Stitch export "Nocturne & Nectar" (dark plum surfaces, blush/gold/lavender accents, Playfair Display + Plus Jakarta Sans). Applied as CSS tokens, a shared sticky nav, and layouts for all four stages (hero card + three-column evidence grid on Profile Analysis; controls bar + agent cards + chat + summary sidebar on Agent Deliberations; ranked cards with score-band filters on Match Rankings); the four stages (Setup & Ingestion, Profile Analysis, Agent Deliberations, Match Rankings) are driven by real application state. The Stitch mock persona photos, sample cohort data, and claims such as "autonomous agents", attunement indices, playback controls, and "Request Introduction" were deliberately not used, because the app has no such capabilities. Google Fonts load from the network; with no connection, serif/sans fallbacks are used.

## Stack

Static HTML + CSS + vanilla JavaScript in one file (`index.html`). The engine sits between `// ==ENGINE START==` and `// ==ENGINE END==` so Node can test it without a browser. No backend, database, or API keys. Participant data stays in the browser (`localStorage` key `pairadox.custom.v1`, only for participants you add; the old `kindred.custom.v1` key is read once for migration).

## Profile ingestion

- Inputs per participant: LinkedIn URL, Instagram URL, and **pasted text** from their own profiles (LinkedIn headline and About; Instagram bio and captions).
- **URLs are stored but never fetched.** LinkedIn and Instagram restrict automated access (login walls, anti-bot, rate limits) and this project does not circumvent them. Optional extension: a server-side adapter that uses an authorised API or a participant-granted data export and feeds the same `analyze()` function.
- `analyze()` is a rule-based extractor: lexicons for 25 interest categories and 10 values, plus regexes for relationship intent, location, stated preferences and boundaries.
- Every extracted item keeps its source (LinkedIn/Instagram) and the sentence it came from. Items in "looking for" sentences are treated as partner wishes, not the person's own interests.
- Values found by keyword only (no "I value…" wording) are marked weak and count 0.6 instead of 1.
- Missing data stays missing and is listed under **Uncertainties**. Age, gender, orientation and photos are not read or inferred.
- Participants can delete any item or edit the source text before agents run; the profile page must be confirmed before conversations and rankings unlock.

## Agents and scoring

- `Agent` holds its own profile. It learns about the other side only from message payloads (`disclose()` / `receive()`).
- Per pair: 8 messages (introduction, logistics, values, verdict, alternating sender). Message text is template-generated from extracted facts; there is no LLM in the scoring path, so the dialogue is a transparent protocol, not free-form chat. Optional: on the claude.ai-hosted page only (it uses the `sample` capability), a button rewrites one finished chat in Claude's voice. Rewrites are labelled `Claude-written`, rejected if they change a number, and never affect scores. On GitHub Pages or any other host the button is hidden and everything stays deterministic. The Claude rewrite path has NOT been tested by me (no provider in my sandbox); only its fallback path was.
- Each agent scores from its own side: interests 30%, values 25%, intent 20%, lifestyle 15%, location 10%. Unknown dimension = neutral 50 and lowers evidence coverage. Stated intent clash caps the mutual score at 55.
- Mutual score = 0.6 x average + 0.4 x the lower agent score. Each ranking card shows both agents' per-dimension reasons.
- Limits: keyword matching misses paraphrase and can over-read (e.g. "travelling for work" counts as travel); two profiles with thin text compare poorly; no gender/orientation filtering.

## Three-minute demo script

| Time | Action | Say |
|---|---|---|
| 0:00 | Open the site (Participants tab) | Six synthetic people are preloaded; nothing to set up. |
| 0:20 | Click **Add a consenting participant**, point at the consent checkbox and the "URLs are not fetched" note, close it | Consent is required; we never scrape, participants paste their own text. |
| 0:40 | **Profiles** tab: open Asha | Every interest has its source and quote; Tara shows blanks and uncertainties instead of guesses. Remove one chip to show correction. |
| 1:20 | **Confirm**, then **Start conversations** (Live speed) | Agents exchange structured payloads; open one payload. |
| 2:00 | **Rankings**, Asha | Score breakdown, both agents' reasons, hatched bars for unknowns. |
| 2:30 | Switch to Meera, point at Kabir | Intent clash is capped; matrix shows all pairs. |
| 2:50 | Open "How this works" | Stack, ingestion, what is not real. |

The **Autoplay demo** button runs steps 2 to 4 automatically (about 40 seconds) if you want a safe take.

## Files

- `index.html`: app + engine
- `tests/engine.test.js`: Node assertions (extraction honesty, 8 messages per pair, intent cap, payload-only knowledge)
- `tests/cohort.test.js`: missing evidence, edit/removal, duplicate pairs, per-participant rankings, 25-person cohort
- `tests/ui_smoke.py`: Playwright smoke test of the full flow