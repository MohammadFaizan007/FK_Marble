import assert from "node:assert/strict";
import test from "node:test";
import { catalogueTermHi } from "../src/i18n/copy";
import { fillMissingHindi, translateToHindi } from "../src/lib/translate-hi";

test("known catalogue terms translate without a network call", async () => {
  let called = false;
  const hindi = await translateToHindi("ceramic", async () => {
    called = true;
    return "unused";
  });

  assert.equal(hindi, "सिरेमिक");
  assert.equal(called, false);
  assert.equal(catalogueTermHi("Confirm on enquiry"), "पूछताछ पर पुष्टि करें");
});

test("new English text uses the Hindi translation", async () => {
  const hindi = await translateToHindi("Floor and wall tiles", async () => "फर्श और दीवार की टाइलें");
  assert.equal(hindi, "फर्श और दीवार की टाइलें");
});

test("a blank Hindi field is filled and an existing Hindi field stays", async () => {
  const filled = await fillMissingHindi(
    { name: "Marble", nameHi: null, description: "Already written", descriptionHi: "पहले से लिखा" },
    [
      ["name", "nameHi"],
      ["description", "descriptionHi"],
    ],
  );

  assert.equal(filled.nameHi, "संगमरमर");
  assert.equal(filled.descriptionHi, "पहले से लिखा");
});
