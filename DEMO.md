# Handoff Studio: synthetic demo narration (draft)

Target runtime is about 3 minutes at a measured, natural pace. Record only against the final verified preview; this draft describes the local UI with sign-in controls removed. The product examples are entirely synthetic.

**0:00-0:25 | What this is**
Handoff Studio is a prototype for checking whether a proposed AI-agent handoff fits a declared permission scope. The demo uses synthetic data and does not send or execute a handoff. I will walk through an overbroad proposal, a matching scope fixture, untrusted text, and the deliberately disabled private workspace.

**0:25-0:55 | Held proposal**
The request asks for an invoice total. The synthetic grant allows the finance agent to summarize only that total. The proposed action would send the full invoice and bank details to an outside recipient. The deterministic check compares recipient, data scope, and action. They fall outside the fixture, so the result is held for owner approval. Nothing is sent. A model suggestion cannot grant itself permission.

**0:55-1:23 | Scope match**
I change the proposal to the matching recipient, invoice total only, and summarize. The gate reports a scope match. The trace shows that the proposal is not authority, and that no external action was executed. This means only that the supplied values match this synthetic fixture. It does not authenticate a real grant or authorize a real handoff.

**1:23-1:47 | Untrusted text**
The request also contains an instruction to send the full document outside. The app treats that text as untrusted. The visible pattern detector is just a display hint, not the safety boundary. The policy decision comes from comparing the declared scope, not from the heuristic.

**1:47-2:12 | Proposal model**
The model endpoint can propose a structured recipient, data scope, and action through a server-side Workers AI binding. Its output is parsed strictly and remains untrusted. The deterministic gate checks it independently. The model cannot create the grant or execute a handoff. Do not enter real personal, financial, or confidential data into this demo.

**2:12-2:38 | Why sign-in is disabled**
The public fallback does not show a sign-in field, send-code button, or save control. No email is requested or sent. The Worker contains experimental email-code and D1-backed account code, but no usable free public mail route is configured. Locally, 33 automated tests pass, including mock account-isolation checks. Those tests do not establish a live sign-in or real-user isolation.

**2:38-3:00 | Close**
The product is an early prototype using synthetic examples. It has no live-user accounts and no external handoff action. The next step for a real account service is a verified free email sender domain and then live integration and isolation checks.

## Verified demo limits

The sample grant and request are synthetic; their source is not authenticated. The policy function checks supplied values and never sends a handoff. Local mock tests cover account/session and isolation behavior, but not live email, live D1, or real-user behavior. The public fallback has sign-in disabled.
