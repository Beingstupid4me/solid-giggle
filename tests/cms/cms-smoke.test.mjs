import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.CMS_TEST_BASE_URL ?? "http://localhost:3000";

async function fetchHtml(path) {
  const response = await fetch(new URL(path, baseUrl));
  const html = await response.text();

  return { response, html };
}

function expectPage(response, html, expectedText) {
  assert.equal(response.status, 200, `Expected 200 for ${response.url}, got ${response.status}`);
  assert.match(html, /<!doctype html>/i);
  assert.match(html, expectedText);
}

test("cms admin page renders", async () => {
  const { response, html } = await fetchHtml("/cms-admin");
  expectPage(response, html, /CMS Admin/i);
  assert.match(html, /Not connected/i);
});

test("about page renders", async () => {
  const { response, html } = await fetchHtml("/about");
  expectPage(response, html, /About/i);
  assert.match(html, /who we are|our story|team/i);
});

test("services page renders", async () => {
  const { response, html } = await fetchHtml("/services");
  expectPage(response, html, /Services/i);
  assert.match(html, /medical|care|service/i);
});

test("carehub page renders", async () => {
  const { response, html } = await fetchHtml("/carehub");
  expectPage(response, html, /CareHub/i);
  assert.match(html, /society|community|resident/i);
});

test("blog post page renders", async () => {
  const { response, html } = await fetchHtml("/blog/managing-seasonal-allergies");
  expectPage(response, html, /Seasonal Allergies/i);
  assert.match(html, /Managing Seasonal Allergies/i);
});
