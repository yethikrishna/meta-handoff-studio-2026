# Handoff Studio (working name)

A new, event-period prototype for verifiable, permission-aware delegation. This project is being created as fresh hackathon work beginning 2026-10-27. It does not reuse code from the existing Mesh or Nool repositories.

## Why
Agents can turn a request into a multi-step plan, but a model-generated plan should not create its own authority. Handoff Studio makes scope explicit, blocks disclosures/actions outside it, and records a session-local decision trace for each simulated proposal.

## Current status
- Fresh prototype scaffold built for this hackathon. The source repository is public for this entry only: https://github.com/yethikrishna/meta-handoff-studio-2026 .
- Cloudflare Workers AI server-side integration is implemented with an AI binding and a fixed model ID: **Meta Llama 3.2 1B Instruct (`@cf/meta/llama-3.2-1b-instruct`)**. The browser sends a synthetic prompt to the Worker; no API token is in client code. The Worker validates the model response with the strict decoder and returns only a proposal. The policy gate still independently checks scope; no handoff is executed.
- In Cloudflare AI Playground, Llama 3.2 1B Instruct returned `OK` to an exact-word prompt and returned the expected JSON proposal to a synthetic exact-JSON prompt, with Developer Stack MCP tools unavailable. A direct Workers AI API call using the scoped Cloudflare token returned HTTP 200 and the exact expected synthetic JSON. This validates the model endpoint and token, not a deployed Worker. Worker behavior is covered locally with mock-binding tests; model quality on varied prompts is unverified.
- Deterministic policy and mock-binding Worker tests run locally. Grant and approval records remain synthetic and unauthenticated; the UI is a simulation, not a production authorization system.

## Deployment
Install dependencies, run `npm test`, then run `npm run dev` in a Cloudflare account with Workers AI available. Wrangler configuration binds `AI` and static assets. `npm run deploy` deploys the Worker and static assets. No API token is placed in the app; local/production deployments rely on Cloudflare's binding.

## Run
Open `index.html` in a browser. The policy engine and fixtures run locally without network or credentials.

## Safety boundary
The UI only proposes and checks simulated handoffs. It does not send messages, access real personal data, or execute external side effects. The server-side model endpoint only proposes a scope tuple and fails closed on invalid output. Pasted model output is untrusted data. A model can suggest an action but cannot grant permission. Grant and approval objects are synthetic inputs in this demo; the pure gate does not authenticate their source. The ledger shown in the browser session is not durable storage.

## Demo guide
See `DEMO.md` for a short walkthrough and `EVAL.md` for the current small test log and limitations.
