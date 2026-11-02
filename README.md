# Handoff Studio

Handoff Studio is a prototype for checking whether a proposed agent handoff fits an explicitly declared permission scope. Its core idea is simple: a model can suggest what to do, but it cannot grant authority.

## Current verified state (2026-11-02)

- Light-theme browser prototype with synthetic invoice scenarios, deterministic scope checks, and an optional Meta Llama proposal endpoint using a server-side Cloudflare Workers AI binding.
- Worker code and local mock tests cover email-code sign-in, server-side hashed sessions, HttpOnly cookies, and per-user synthetic scenario storage. These are not enabled in the public fallback.
- Local tests: 33/33 passing, including mock-D1 isolation checks. This is not a live sign-up, deployment, or user-validation claim.
- Wrangler dry-run succeeds with a free D1 database and account-defined rate-limit namespace. Deployment is not configured or verified.
- The public fallback has no sign-up controls. Arbitrary-recipient transactional email is not available through Cloudflare Workers Free. A free email provider would still need an owner-authorized account and verified sender-domain DNS setup.

## Run locally

Install dependencies with `npm ci`, then `npm test`. `npm run dev` starts the Cloudflare Worker preview. The static UI also opens from `index.html`, but account and model APIs require the Worker bindings.

## Public fallback limits

The current fallback deliberately has no email/sign-in inputs or save button. It demonstrates synthetic scope checking only. The Worker still contains local-tested auth and D1 storage code, but auth is inactive because no email binding or session secret is configured. D1-backed account isolation has only been tested against mock bindings locally.

## Truthful demo limits

The grant and incoming text are synthetic fixtures; their source is not authenticated. The policy gate only compares supplied values, and its verdict never sends a message or performs a handoff. The optional model endpoint proposes a tuple that must still be checked. The session ledger shown in the demo is local to the browser and not a durable audit log. Email sign-up, D1 persistence, and live deployment are not yet available.

See `DEMO.md` for the current three-minute narration and `EVAL.md` for the limited synthetic test scope.
