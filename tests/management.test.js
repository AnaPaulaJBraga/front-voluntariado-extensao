import { test } from "node:test";
import assert from "node:assert/strict";
import { canManageVacancy, validateEntity, getErrorMessage } from "../src/utils/management.js";

test("only admins and editors from the owning entity can manage a vacancy", () => {
  const vacancy = { entity: { id: 10 } };
  for (const position of ["admin", "editor"]) {
    assert.equal(canManageVacancy({ entity: { id: 10 }, position }, vacancy), true);
    assert.equal(canManageVacancy({ entity: { id: 11 }, position }, vacancy), false);
  }
  assert.equal(canManageVacancy({ entity: { id: 10 }, position: "member" }, vacancy), false);
  assert.equal(canManageVacancy(null, vacancy), false);
});

test("entity validation matches the limits and slug rules of the API", () => {
  const valid = { name: "Entidade", slug: "entidade-1", sector: "Social", description: "Descrição", city: "São Paulo", uf: "SP" };
  assert.deepEqual(validateEntity(valid), {});
  for (const [field, value] of [["name", "ab"], ["slug", "slug com espaço"], ["sector", "a"], ["description", "a".repeat(2001)], ["city", "a"], ["uf", "SPX"]]) {
    assert.ok(Object.keys(validateEntity({ ...valid, [field]: value })).length > 0);
  }
  assert.deepEqual(validateEntity({ ...valid, name: "a".repeat(100), description: "a".repeat(2000) }), {});
});

test("API validation errors are readable instead of rendering objects", () => {
  assert.equal(getErrorMessage({ response: { data: { detail: [{ msg: "Campo inválido" }] } } }), "Campo inválido");
});
