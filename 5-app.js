import { evaluateHandoff, classifyExternalText } from "./policy.js";
import { decodeProposal } from "./model-adapter.js";

const $ = (selector) => document.querySelector(selector);
const analyzeButton = $("#analyze");
const ledger = $("#ledger");
let sequence = 0;

function proposalFromFixture() {
  const dataTypes = JSON.parse($("#data-scope").value);
  return {
    recipient: $("#recipient").value,
    dataTypes,
    action: $("#action").value,
  };
}

function readableProposal(proposal) {
  const recipient = proposal.recipient === "finance-agent" ? "finance-agent" : "an external recipient";
  const data = proposal.dataTypes.join(" and ");
  return `${proposal.action[0].toUpperCase()}${proposal.action.slice(1)} ${data} to ${recipient}`;
}

function appendLedger(entry, status) {
  sequence += 1;
  const empty = ledger.querySelector(".ledger-empty");
  if (empty) empty.remove();
  const row = document.createElement("div");
  row.className = "ledger-item";
  const time = document.createElement("time");
  time.textContent = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
  const text = document.createElement("strong");
  text.textContent = `#${String(sequence).padStart(3, "0")} ${entry}`;
  const state = document.createElement("span");
  state.className = `ledger-state ${status === "allowed" ? "state-allowed" : ""}`;
  state.textContent = status === "allowed" ? "SCOPE MATCH · SIMULATION" : status === "blocked" ? "INVALID DATA · BLOCKED" : "HELD FOR APPROVAL";
  row.append(time, text, state);
  ledger.prepend(row);
}

analyzeButton.addEventListener("click", () => {
  const external = classifyExternalText($("#task").value);
  const proposal = proposalFromFixture();
  const grant = { recipient: "finance-agent", dataTypes: ["invoice-total"], actions: ["summarize"] };
  const result = evaluateHandoff({ grant, proposal });
  const inScope = result.status === "allowed";
  const held = result.status !== "allowed";

  $("#decision-content").classList.add("hidden");
  $("#decision-result").classList.remove("hidden");
  $("#decision-badge").className = `badge ${inScope ? "allowed" : "blocked"}`;
  $("#decision-badge").textContent = inScope ? "SCOPE MATCH" : "HELD";
  $("#status-icon").textContent = inScope ? "✓" : "!";
  $("#status-icon").classList.toggle("status-allowed", inScope);
  $("#status-title").textContent = inScope ? "Within the explicit grant" : result.status === "blocked" ? "Invalid data blocked" : "Owner approval required";
  $("#reason").textContent = inScope
    ? "Recipient, data and action match this synthetic grant. Scope match only; no handoff was executed."
    : result.reasons.join(" ");
  $("#proposed-action").textContent = readableProposal(proposal);
  const proposedData = new Set(proposal.dataTypes.map((value) => value.trim().toLowerCase()));
  const grantedData = new Set(grant.dataTypes.map((value) => value.trim().toLowerCase()));
  const recipientMatches = proposal.recipient.trim().toLowerCase() === grant.recipient;
  const dataMatches = [...proposedData].every((value) => grantedData.has(value));
  const actionMatches = proposal.action.trim().toLowerCase() === grant.actions[0];
  const tags = [
    ["#tag-recipient", recipientMatches ? proposal.recipient : proposal.recipient === "external-recipient" ? "external recipient" : proposal.recipient, recipientMatches],
    ["#tag-data", proposal.dataTypes.join(" and "), dataMatches],
    ["#tag-action", proposal.action, actionMatches],
  ];
  for (const [selector, text, matches] of tags) {
    const tag = $(selector);
    tag.textContent = text;
    tag.className = `scope-tag ${matches ? "tag-match" : "tag-mismatch"}`;
  }

  const trace = [
    ...result.trace,
    external.containsBehavioralInstruction ? "external-instruction-marked-untrusted" : "external-text-treated-as-data",
    "no-external-action-executed",
  ];
  const container = $("#trace-items");
  container.replaceChildren();
  for (const item of trace) {
    const line = document.createElement("div");
    line.className = "trace-line";
    const dot = document.createElement("i");
    if (inScope && item !== "no-external-action-executed") dot.className = "trace-safe";
    const label = document.createElement("span");
    label.textContent = item;
    line.append(dot, label);
    container.append(line);
  }
  appendLedger(readableProposal(proposal), result.status);
});

$("#validate-model").addEventListener("click", () => {
  const result = decodeProposal($("#model-output").value);
  const output = $("#model-result");
  output.className = `model-result ${result.ok ? "model-valid" : "model-invalid"}`;
  if (!result.ok) {
    output.textContent = `Rejected (${result.error}). Invalid model output cannot populate a proposal or grant authority.`;
    return;
  }

  const proposal = result.proposal;
  const recipient = $("#recipient");
  if (![...recipient.options].some((option) => option.value === proposal.recipient)) {
    recipient.add(new Option(proposal.recipient, proposal.recipient));
  }
  recipient.value = proposal.recipient;

  const dataScope = $("#data-scope");
  const encodedData = JSON.stringify(proposal.dataTypes);
  if (![...dataScope.options].some((option) => option.value === encodedData)) {
    dataScope.add(new Option(proposal.dataTypes.join(" + "), encodedData));
  }
  dataScope.value = encodedData;

  const action = $("#action");
  if (![...action.options].some((option) => option.value === proposal.action)) {
    action.add(new Option(proposal.action, proposal.action));
  }
  action.value = proposal.action;
  output.textContent = `Valid proposal loaded: ${proposal.action} to ${proposal.recipient} for ${proposal.dataTypes.join(", ")}. It is still only a proposal; run the independent scope check. No handoff was executed.`;
});
