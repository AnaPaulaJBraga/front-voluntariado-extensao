import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { api } from "../src/services/api.js";

let events;
let storage;
beforeEach(() => {
  storage = new Map([["access_token", "test-token"], ["user", "{}"], ["activeContext", "{}"]]);
  events = [];
  globalThis.localStorage = { getItem: key => storage.get(key), removeItem: key => storage.delete(key) };
  globalThis.window = { dispatchEvent: event => events.push(event.type) };
  globalThis.fetch = async () => new Response(JSON.stringify({ detail: "Senha incorreta" }), { status: 401, headers: { "content-type": "application/json" } });
});

test("wrong deletion password preserves the authenticated session and sends password in JSON", async () => {
  let request;
  globalThis.fetch = async (_url, options) => {
    request = options;
    return new Response(JSON.stringify({ detail: "Senha incorreta" }), { status: 401, headers: { "content-type": "application/json" } });
  };
  await assert.rejects(api.delete("/user/me", { password: "wrong-password" }, true, { keepSessionOnUnauthorized: true }));
  assert.equal(request.headers.Authorization, "Bearer test-token");
  assert.deepEqual(JSON.parse(request.body), { password: "wrong-password" });
  assert.equal(storage.get("access_token"), "test-token");
  assert.deepEqual(events, []);
});

test("an expired session on ordinary authenticated calls clears authentication", async () => {
  await assert.rejects(api.get("/entities/me", true));
  assert.equal(storage.has("access_token"), false);
  assert.equal(storage.has("activeContext"), false);
  assert.ok(events.includes("session-expired"));
});

test("204 responses are accepted without trying to parse JSON", async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 });
  assert.equal((await api.delete("/vacancies/1/participants/me", null, true)).status, 204);
});
