# Handoff Studio demo notes

## Positioning
A local prototype for checking whether a proposed agent handoff fits a declared grant. It does not authenticate grants, call a model API, send data, or persist an audit ledger. The grant and request are synthetic fixtures. The external-text flag is a display heuristic only; all external text remains untrusted.

## 90-second walkthrough
1. Point out the synthetic requester, bounded request, and explicit fixture grant: finance-agent, invoice-total only, summarize. The gate evaluates supplied values; it does not authenticate their source.
2. Keep the default proposed handoff to an external recipient with invoice and bank details, send. Run the scope check. Explain that the proposal falls outside recipient, data, and action scope; it is held for owner approval. Show the per-field match/mismatch badges, trace, and session-local row.
3. Select finance-agent, invoice-total only, summarize, then rerun. Explain this is a synthetic scope match only, not a message send. The policy gate compares the proposal to the explicit fixture grant independently.
4. Change action to send. Rerun and show it is held even though recipient and data still match.
5. Optionally open the offline Meta-response validator and paste the exact JSON fixture. Explain valid JSON only populates proposed fields; it does not authorize anything. Then paste malformed/repeated output and show fail-closed rejection.
6. Close with model status: Cloudflare Playground Meta Llama 3.1 8B Instruct FP8 returned exact JSON on three identical easy synthetic tests, but a realistic conflict prompt was invalid and a more scaffolded conflict prompt was exact. Broader task quality and API integration remain unverified. See `EVAL.md`. API integration needs an owner-approved token before any token is created.

## Judging-proof points to build next
- Add an evaluation set with legitimate-but-out-of-scope, explicit approval match/mismatch, external prompt-injection variants, malformed model output, and ambiguous grants.
- Capture reproducible model prompts, unmodified outputs, latency, and parser outcomes across varied scenarios without using private data.
- If token authority is approved, add a server-side adapter only; never place a long-lived API token in browser JavaScript. Confirm free quota and disable/limit external actions.
- Replace the synthetic gate with authenticated, provenance-carrying grant records and a durable append-only audit backend before claiming a production policy engine.
