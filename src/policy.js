/**
 * Pure, deterministic scope gate for a proposed handoff.
 * Model-generated content is treated only as a proposal. The gate does not
 * consult the model and cannot be overridden by a model result.
 */
export const POLICY_VERSION = "0.1.0";

const setOf = (values = []) => new Set(values.map((x) => String(x).trim().toLowerCase()));

/**
 * Decide whether a proposed disclosure/action fits a specific grant.
 * @param {{grant:{recipient:string, dataTypes:string[], actions:string[]}, proposal:{recipient:string,dataTypes:string[],action:string}, approval?:{recipient:string,dataTypes:string[],action:string}}} input
 * The caller must verify that grant/approval records came from authenticated sources.
 * This pure function only evaluates the supplied fixture/data; it does not authenticate it.
 * @returns {{status:'allowed'|'needs_approval'|'blocked', reasons:string[], trace:string[]}}
 */
export function evaluateHandoff({ grant, proposal, approval = null }) {
  const trace = [`policy:${POLICY_VERSION}`, "proposal-is-not-authority"];
  const proposalValid = proposal && typeof proposal.recipient === "string" && proposal.recipient.trim() &&
    Array.isArray(proposal.dataTypes) && proposal.dataTypes.length > 0 &&
    proposal.dataTypes.every((x) => typeof x === "string" && x.trim()) &&
    typeof proposal.action === "string" && proposal.action.trim();
  if (!proposalValid) {
    trace.push("invalid-proposal-blocked");
    return { status: "blocked", reasons: ["Proposal is missing a valid recipient, non-empty data scope, or action."], trace };
  }
  const grantValid = grant && typeof grant.recipient === "string" && grant.recipient.trim() &&
    Array.isArray(grant.dataTypes) && grant.dataTypes.length > 0 &&
    grant.dataTypes.every((x) => typeof x === "string" && x.trim()) &&
    Array.isArray(grant.actions) && grant.actions.length > 0 &&
    grant.actions.every((x) => typeof x === "string" && x.trim());
  if (!grantValid) {
    trace.push("invalid-grant-blocked");
    return { status: "blocked", reasons: ["Grant data is missing a valid recipient, non-empty data scope, or action list."], trace };
  }
  const approvalProvided = approval != null;
  const approvalValid = !approvalProvided || (typeof approval.recipient === "string" && approval.recipient.trim() &&
    Array.isArray(approval.dataTypes) && approval.dataTypes.length > 0 &&
    approval.dataTypes.every((x) => typeof x === "string" && x.trim()) &&
    typeof approval.action === "string" && approval.action.trim());
  const reasons = [];
  const grantedRecipient = String(grant?.recipient ?? "").trim().toLowerCase();
  const proposedRecipient = String(proposal?.recipient ?? "").trim().toLowerCase();
  const grantedData = setOf(grant?.dataTypes);
  const proposedData = setOf(proposal?.dataTypes);
  const grantedActions = setOf(grant?.actions);
  const proposedAction = String(proposal?.action ?? "").trim().toLowerCase();

  if (!grantedRecipient || proposedRecipient !== grantedRecipient) {
    reasons.push("Recipient is outside the explicit grant.");
  }
  const outsideData = [...proposedData].filter((data) => !grantedData.has(data));
  if (outsideData.length) reasons.push(`Data outside grant: ${outsideData.join(", ")}.`);
  if (!grantedActions.has(proposedAction)) reasons.push("Action is outside the explicit grant.");

  if (reasons.length === 0) {
    if (approvalProvided && !approvalValid) {
      trace.push("scope-match", "standing-grant-suffices", "approval-not-needed");
      return { status: "allowed", reasons: ["Recipient, data and action match the explicit grant; the separate approval record was malformed and not used."], trace };
    }
    trace.push("scope-match");
    return { status: "allowed", reasons: ["Recipient, data and action match the grant."], trace };
  }

  if (!approvalValid) {
    trace.push("invalid-approval-blocked");
    return { status: "blocked", reasons: [...reasons, "Approval data is incomplete or malformed."], trace };
  }

  const approvalMatches = approval &&
    String(approval.recipient ?? "").trim().toLowerCase() === proposedRecipient &&
    String(approval.action ?? "").trim().toLowerCase() === proposedAction &&
    [...proposedData].every((data) => setOf(approval.dataTypes).has(data));

  if (approvalMatches) {
    trace.push("explicit-owner-approval-matches-proposal");
    return { status: "allowed", reasons: ["The proposal matches the recorded, specific owner approval."], trace };
  }

  trace.push("scope-mismatch");
  if (approval) {
    trace.push("approval-does-not-match-proposal");
    return { status: "blocked", reasons: [...reasons, "The recorded approval does not cover this exact recipient, data and action."], trace };
  }
  trace.push("owner-approval-required");
  return { status: "needs_approval", reasons, trace };
}

/** Preserve untrusted text as evidence, never as executable authority. */
export function classifyExternalText(text) {
  const lower = String(text ?? "").toLowerCase();
  // This is a display hint, not a security classifier. All external text is
  // untrusted regardless of whether this intentionally small heuristic fires.
  const patterns = [
    /ignore\s+(all\s+|any\s+)?(previous|prior|above|earlier)\s+(rules?|instructions?|polic(y|ies))/,
    /\b(send|forward|share|upload|export)\b.{0,100}\b(to|into|with)\b/,
    /\b(reveal|disclose|exfiltrate|leak)\b/,
    /\b(bypass|override|disable)\b.{0,50}\b(policy|approval|security|restriction|rule|check)/,
    /\b(do not|don't|never) tell (the )?(user|owner|admin)/,
    /\b(system prompt|developer message|hidden instruction)\b/,
  ];
  const containsInstruction = patterns.some((pattern) => pattern.test(lower));
  return {
    source: "external-content",
    trust: "untrusted-data",
    classifier: "display-heuristic-not-security-control",
    containsBehavioralInstruction: containsInstruction,
    action: "do-not-follow-as-authority",
  };
}
