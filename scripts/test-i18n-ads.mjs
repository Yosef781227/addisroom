import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
const require = createRequire(import.meta.url),
  cache = new Map();
let activeSponsor = null;
const mocks = {
  "@/lib/prisma": {
    prisma: {
      sponsorship: {
        findMany: async () => (activeSponsor ? [activeSponsor] : []),
      },
    },
  },
  "next/image": {
    default: ({ fill, sizes, ...props }) => React.createElement("img", props),
  },
};
function load(name) {
  if (mocks[name]) return mocks[name];
  if (!name.startsWith("@/")) return require(name);
  if (cache.has(name)) return cache.get(name).exports;
  const stem = path.resolve("src", name.slice(2));
  const file = fs.existsSync(stem + ".ts") ? stem + ".ts" : stem + ".tsx";
  let source = fs.readFileSync(file, "utf8");
  if (name === "@/lib/i18n") source += "\nexport const testCatalogue=messages;";
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const mod = { exports: {} };
  cache.set(name, mod);
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, {
    filename: file,
  })(load, mod, mod.exports);
  return mod.exports;
}
const i18n = load("@/lib/i18n");
assert.equal(i18n.LANGS.length, 6);
assert.equal(i18n.parseLang("unsupported"), "en");
for (const lang of ["ar", "fr", "ti"]) {
  assert.equal(i18n.parseLang(lang), lang);
  const table = i18n.testCatalogue[lang],
    english = i18n.testCatalogue.en;
  assert.deepEqual(
    Object.keys(table).sort(),
    Object.keys(english).sort(),
    `${lang} covers the shared interface catalogue`,
  );
  for (const key of Object.keys(english)) {
    assert.ok(table[key].trim(), `${lang}: ${key} is not empty`);
    const tokens = (s) => [...s.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort();
    assert.deepEqual(
      tokens(table[key]),
      tokens(english[key]),
      `${lang}: ${key} preserves interpolation`,
    );
  }
  assert.notEqual(i18n.propertyLabel(lang, "APARTMENT"), "Apartment");
}
assert.equal(i18n.languageDirection("ar"), "rtl");
assert.equal(i18n.languageDirection("fr"), "ltr");
assert.equal(i18n.languageDirection("ti"), "ltr");
const { BannerAd } = load("@/components/BannerAd");
assert.equal(
  await BannerAd({ lang: "en" }),
  null,
  "Other placements stay hidden without a sponsor",
);
for (const lang of ["en", "ar", "fr", "ti"]) {
  const empty = renderToStaticMarkup(
    await BannerAd({ lang, placement: "homepage" }),
  );
  assert.ok(empty.includes(i18n.t(lang, "ads.label")));
  assert.ok(empty.includes(i18n.t(lang, "ads.emptyTitle")));
  assert.ok(
    !empty.includes("<a "),
    "Reserved placement has no fake destination",
  );
}
activeSponsor = {
  headline: "Movers & home services",
  body: "A local partner.",
  linkUrl: "https://example.com/movers",
  imageUrl: "https://example.com/banner.jpg",
};
const active = renderToStaticMarkup(
  await BannerAd({ lang: "fr", placement: "homepage" }),
);
assert.ok(active.includes("Sponsorisé"));
assert.ok(active.includes("Movers &amp; home services"));
assert.ok(active.includes('rel="noopener noreferrer sponsored"'));
assert.ok(active.includes("https://example.com/banner.jpg"));
assert.ok(!active.includes(i18n.t("fr", "ads.emptyTitle")));
const { PromotionBanner } = load("@/components/PromotionBanner");
const preview = renderToStaticMarkup(
  React.createElement(PromotionBanner, {
    promotion: {
      ...activeSponsor,
      isSample: true,
      animated: false,
      theme: "dark",
      ctaLabel: "Explore services",
    },
    preview: true,
  }),
);
assert.ok(preview.includes('data-animated="false"'));
assert.ok(preview.includes('data-tone="dark"'));
assert.ok(preview.includes("Sample promotion"));
assert.ok(preview.includes("Explore services"));
assert.ok(
  !preview.includes("<a "),
  "Preview cannot navigate to the advertiser",
);

console.log(
  "PASS: six locales, complete Arabic/French/Tigrinya catalogues, interpolation, RTL, and homepage empty/active advertisement placements.",
);
