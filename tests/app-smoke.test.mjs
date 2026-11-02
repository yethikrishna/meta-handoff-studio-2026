import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("light theme and public fallback have no sign-up controls", async () => {
  for (const p of ["../index.html", "../public/index.html"]) {
    const x = await readFile(new URL(p, import.meta.url), "utf8");
    assert.match(x, /theme-color" content="#f4f6fa/);
    assert.match(x, /SIGN-IN DISABLED · SYNTHETIC MODE/);
    assert.match(x, /Sign-in is disabled in this public preview/);
    assert.doesNotMatch(x, /id="request-code"|id="verify-code"|id="account-email"|id="account-code"/);
    assert.doesNotMatch(x, /id="save-scenario"|id="saved-list"/);
    assert.match(x, /Private workspace/);
  }
  const a = await readFile(new URL("../styles.css", import.meta.url), "utf8");
  const b = await readFile(new URL("../public/styles.css", import.meta.url), "utf8");
  assert.equal(a, b);
  assert.match(a, /color-scheme:light/);
  assert.equal(await readFile(new URL("../src/account.js", import.meta.url), "utf8"), await readFile(new URL("../public/src/account.js", import.meta.url), "utf8"));
});
