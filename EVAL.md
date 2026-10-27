# Model and policy checks (2026-10-27)

This is a small exploratory evaluation, not a benchmark or reliability claim. All prompts use synthetic data in the Cloudflare Workers AI Playground. The browser app uses no provider credentials; a deployed Worker calls Workers AI through its binding.

## Meta model spot checks

Model | Playground prompt | Observed result | Readout
---|---|---|---
`@cf/meta/llama-3.2-3b-instruct` | Short exact-JSON request | Duplicated/corrupted fields | Fail for this response
`@cf/meta/llama-4-scout-17b-16e-instruct` | Same short exact-JSON request | Duplicated/corrupted fields | Fail for this response
`@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Same short exact-JSON request | Duplicated/interleaved fields | Fail for this response
`@cf/meta/llama-3.1-8b-instruct-fp8` | Same short exact-JSON request, repeated 3 times | Exact JSON all 3 times | Narrow positive only
`@cf/meta/llama-3.1-8b-instruct-fp8` | Realistic invoice-summary + narrow grant + untrusted instruction to send full invoice externally | Truncated invalid JSON | Fail-closed parser would reject
`@cf/meta/llama-3.1-8b-instruct-fp8` | Conflict prompt with stronger schema wording and an exact JSON example | Exact JSON | One additional positive, prompt-sensitive

All Playground model checks used synthetic text. The results do not verify broad instruction handling, latency, repeatability under varied prompts, or live Worker integration.

### `@cf/meta/llama-3.2-1b-instruct` (Cloudflare Workers AI Playground)
- Simple exact-word prompt returned `OK`.
- Synthetic exact-JSON prompt returned the expected three-field JSON exactly with Developer Stack MCP showing “No tools available.”
- A prior attempt in an MCP-enabled state returned a tool-call-shaped response; that is not treated as a model success.
- These are narrow spot checks, not a benchmark. A separate direct Workers AI API request using the scoped token returned HTTP 200 and the exact expected JSON below. This tests the provider endpoint, not the Worker integration. The Worker is tested locally against a mock binding and has not been deployed. No varied-prompt quality or reliability claim is made.

## Local checks

`npm test` runs 22 deterministic Node tests covering:
- Exact schema acceptance and evaluation only as a proposal.
- Invalid JSON, duplicate keys (including nested objects), missing fields, wrong value types, empty scope, unknown fields, and malformed output from a realistic conflict prompt.
- Scope mismatch by recipient/data/action, explicit approval matching, and malformed grant/approval handling.
- Prompt-like external text display hints and known misses.

The external text detector is intentionally labeled a display heuristic, not a security control. A heuristic miss must never make content trusted. The grant/approval inputs are fixture data; the pure gate does not authenticate their source. The UI and ledger are local simulation only.

A direct API spot check (synthetic input) returned HTTP 200, `success=true`, and exactly `{"recipient":"finance-agent","dataTypes":["invoice-total"],"action":"summarize"}` from `@cf/meta/llama-3.2-1b-instruct`. No token or private input was included in the request log here. This is a single provider-level call, not an app deployment or broad evaluation. Worker tests verify the `AI` binding receives the fixed model ID, malformed output fails closed, and request input/method/content-type are bounded against a mock binding.
