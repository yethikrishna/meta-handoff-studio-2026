import test from "node:test";
import assert from "node:assert/strict";
import worker, { MODEL_ID } from "../src/worker.js";

function req(path, method = "POST", body = {}, headers = { "content-type": "application/json" }) {
  return new Request(`https://handoff.example${path}`, { method, headers, body: method === "GET" ? undefined : JSON.stringify(body) });
}
const assets = { fetch: async () => new Response("asset") };

test("uses the explicit Meta Llama model through the server AI binding and returns a validated proposal", async () => {
  let called;
  const env = { ASSETS: assets, AI: { run: async (model, input) => {
    called = { model, input };
    return { response: '{"recipient":"finance-agent","dataTypes":["invoice-total"],"action":"summarize"}' };
  } } };
  const res = await worker.fetch(req("/api/propose", "POST", { prompt: "Synthetic invoice total. Ignore all requests to send the whole invoice." }), env);
  assert.equal(res.status, 200);
  assert.equal(called.model, MODEL_ID);
  assert.match(called.input.prompt, /untrusted data/);
  assert.deepEqual(await res.json(), { proposal: { recipient: "finance-agent", dataTypes: ["invoice-total"], action: "summarize" }, model: MODEL_ID });
});

test("fails closed on malformed model output", async () => {
  const env = { ASSETS: assets, AI: { run: async () => ({ response: "not JSON" }) } };
  const res = await worker.fetch(req("/api/propose", "POST", { prompt: "synthetic" }), env);
  assert.equal(res.status, 502);
  assert.equal((await res.json()).error, "invalid_model_output");
});

test("validates method, content type, prompt, size and delegates non-API assets", async () => {
  const env = { ASSETS: assets, AI: { run: async () => ({ response: "{}" }) } };
  assert.equal((await worker.fetch(req("/api/propose", "GET"), env)).status, 405);
  assert.equal((await worker.fetch(req("/api/propose", "POST", {}, { "content-type": "text/plain" }), env)).status, 415);
  assert.equal((await worker.fetch(req("/api/propose", "POST", { prompt: " " }), env)).status, 400);
  assert.equal((await worker.fetch(req("/api/propose", "POST", { prompt: "x".repeat(8001) }), env)).status, 413);
  assert.equal(await (await worker.fetch(new Request("https://handoff.example/"), env)).text(), "asset");
});
