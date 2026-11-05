import assert from "node:assert/strict";
import { test } from "node:test";

import { BOOKINGS_URLS } from "../src/lib/constants.ts";

// Microsoft Bookings only skips the visitor's signed-in Microsoft account when the
// link ends in "?anonymous"; any extra parameter (e.g. ismsaljsauthenabled) can
// make it book with that account instead of as a guest.
for (const [name, url] of Object.entries(BOOKINGS_URLS)) {
  test(`booking link "${name}" ends in ?anonymous`, () => {
    assert.ok(url.endsWith("?anonymous"), `${name}: ${url}`);
    assert.equal(new URL(url).search, "?anonymous");
  });
}
