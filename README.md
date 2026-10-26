# Handoff Studio (working name)

A new, event-period prototype for verifiable, permission-aware delegation. This project is being created as fresh hackathon work beginning 2026-10-27. It does not reuse code from the existing Mesh or Nool repositories.

## Why
Agents can turn a request into a multi-step plan, but a model-generated plan should not create its own authority. Handoff Studio makes scope explicit, blocks disclosures/actions outside it, and records a session-local decision trace for each simulated proposal.

## Current status
- Fresh prototype scaffold, created 2026-10-27 IST; this public repository contains the source tree.
- Scenario and policy gate are synthetic fixtures only. No external action is executed.
- Meta model integration is intentionally not claimed yet. Exploratory Cloudflare Playground requests to Meta Llama 3.2 3B, Llama 4 Scout, and Llama 3.3 70B FP8 Fast returned duplicated/corrupted JSON in this exact-output check. Llama 3.1 8B Instruct FP8 returned exact JSON three times on one easy synthetic prompt, but a more realistic conflict prompt was malformed and another conflicting prompt was exact; live app integration remains unverified. The demo accepts a manually pasted response for offline validation; it does not call a model API. `model-adapter.js` rejects malformed JSON, duplicate keys, missing/extra fields, empty scope, and invalid schema. A valid proposal is still checked independently against the deterministic grant gate.
- The public source repository for this Meta hackathon entry is https://github.com/yethikrishna/meta-handoff-studio-2026. Public scope is limited to this entry; other projects remain private.

## Run
Open `index.html` in a browser. The policy engine and fixtures run locally without network or credentials.

## Safety boundary
The UI only proposes and checks simulated handoffs. It does not call a model API, send messages, access real personal data, or execute external side effects. Pasted model output is untrusted data. A model can suggest an action but cannot grant permission. Grant and approval objects are synthetic inputs in this demo; the pure gate does not authenticate their source. The ledger shown in the browser session is not durable storage.

## Demo guide
See `DEMO.md` for a short walkthrough and `EVAL.md` for the current small test log and limitations.
