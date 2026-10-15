# Pairadox API starter

This folder is the first backend slice for moving Pairadox beyond a static prototype.

## Local run

```bash
cd backend
python -m venv .venv
# activate the environment, then:
pip install -r requirements.txt
export OPENAI_API_KEY="your-server-side-key"
uvicorn app:app --reload
```

- `GET /health` is a health check.
- `POST /eligibility/filter` excludes pairs unless both people consent, opt in, and their explicitly entered age and gender preferences are mutually satisfied. Missing fields are excluded rather than guessed.
- `POST /agents/turn` calls an OpenAI-compatible chat completions endpoint from the server, validates a structured response, limits context/history, and rejects claims without evidence present in the supplied context.

## Security and integration status

- Never put `OPENAI_API_KEY` in the browser, static site, or committed files. Configure it as a deployment secret.
- The GitHub Pages frontend is **not connected to this API yet**. Deploy the backend separately over HTTPS and then wire the UI to it.
- This is an initial scaffold, not production-ready authentication or authorization. Before real participants use it, add authenticated identities, participant ownership checks, rate limiting, request logging without profile contents, deletion/export flows, database access policies, and integration tests.
- Do not send profiles to the LLM unless participants have explicitly consented to that processing.
