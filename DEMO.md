# Handoff Studio demo notes

## Positioning
A local prototype for checking whether a proposed agent handoff fits a declared grant. It does not authenticate grants, send data, or persist an audit ledger. Its optional model endpoint calls Meta Llama 3.2 1B Instruct via a server-side Cloudflare Workers AI binding and only returns a validated proposal. The grant and request are synthetic fixtures. The external-text flag is a display heuristic only; all external text remains untrusted.

## Three-minute walkthrough
1. (0:00–0:25) Point out the synthetic requester, bounded request, and explicit fixture grant: finance-agent, invoice-total only, summarize. The gate evaluates supplied values; it does not authenticate their source.
2. (0:25–1:05) Keep the default proposed handoff to an external recipient with invoice and bank details, send. Run the scope check. Explain that the proposal falls outside recipient, data, and action scope; it is held for owner approval. Show the per-field match/mismatch badges, trace, and session-local row.
3. (1:05–1:35) Select finance-agent, invoice-total only, summarize, then rerun. Explain this is a synthetic scope match only, not a message send. The policy gate compares the proposal to the explicit fixture grant independently.
4. (1:35–1:55) Change action to send. Rerun and show it is held even though recipient and data still match.
5. (1:55–2:35) Enter synthetic text in the Meta prompt box and request a proposal from Meta Llama 3.2 1B Instruct through the server-side Workers AI binding. Show the returned proposal; validate it and run the independent scope check. Note that this is only a proposal, not permission or a handoff.
6. (2:35–3:00) Close with the limits: synthetic grant only, non-durable session ledger, no external action, and the direct Workers AI endpoint has returned one exact synthetic JSON response, but the Worker itself is not deployed and varied-prompt model quality is not established. Playground and one API spot check are not a broad quality claim. See `EVAL.md`.

## Judging-proof points to build next
- Add an evaluation set with legitimate-but-out-of-scope, explicit approval match/mismatch, external prompt-injection variants, malformed model output, and ambiguous grants.
- Capture reproducible model prompts, unmodified outputs, latency, and parser outcomes across varied scenarios without using private data.
- Deploy and test the server-side binding, then capture latency and fail-closed behavior across a varied synthetic evaluation set. Never place a long-lived API token in browser JavaScript.
- Replace the synthetic gate with authenticated, provenance-carrying grant records and a durable append-only audit backend before claiming a production policy engine.
