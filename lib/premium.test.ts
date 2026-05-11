import { test } from "node:test";
import assert from "node:assert/strict";
import { isPremium } from "./premium";

test("free plan is never premium", () => {
  assert.equal(isPremium({ plan: "free", currentPeriodEnd: null }), false);
});

test("premium plan with future period end is premium", () => {
  const future = new Date(Date.now() + 1000 * 60 * 60 * 24);
  assert.equal(isPremium({ plan: "premium", currentPeriodEnd: future }), true);
});

test("premium plan with past period end is not premium", () => {
  const past = new Date(Date.now() - 1000 * 60 * 60 * 24);
  assert.equal(isPremium({ plan: "premium", currentPeriodEnd: past }), false);
});

test("premium plan with null period end is not premium", () => {
  assert.equal(isPremium({ plan: "premium", currentPeriodEnd: null }), false);
});

test("null user is not premium", () => {
  assert.equal(isPremium(null), false);
});
