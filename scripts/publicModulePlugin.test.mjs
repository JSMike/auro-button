import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { publicModulePlugin } from "./publicModulePlugin.mjs";

test("generated manifest uses the published typed class export", () => {
  const manifest = JSON.parse(
    readFileSync(new URL("../custom-elements.json", import.meta.url), "utf8"),
  );
  const module = manifest.modules.find((module) =>
    module.declarations?.some(
      (declaration) => declaration.tagName === "auro-button",
    ),
  );
  assert.equal(module.path, "class");
  for (const entry of manifest.modules) {
    for (const exp of entry.exports ?? []) {
      if (exp.declaration?.name === "AuroButton") {
        assert.equal(exp.declaration.module ?? entry.path, "class");
      }
    }
  }
  const pkg = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  assert.equal(
    pkg.exports[`./${module.path}`].types,
    "./dist/types/index.d.ts",
  );
});

test("published element and references use the exported class entry point", () => {
  const customElementsManifest = {
    modules: [
      {
        path: "src/auro-button.js",
        declarations: [{ name: "AuroButton", tagName: "auro-button" }],
        exports: [
          {
            kind: "js",
            declaration: { name: "AuroButton", module: "src/auro-button.js" },
          },
        ],
      },
      {
        path: "src/registered.js",
        exports: [
          {
            kind: "custom-element-definition",
            name: "auro-button",
            declaration: { name: "AuroButton", module: "src/auro-button.js" },
          },
        ],
        declarations: [
          {
            superclass: {
              name: "Other",
              module: "src/auro-button.js",
              package: "other",
            },
          },
        ],
      },
    ],
  };

  publicModulePlugin().packageLinkPhase({ customElementsManifest });
  const [element, registration] = customElementsManifest.modules;
  assert.equal(element.path, "class");
  assert.equal(element.exports[0].declaration.module, "class");
  assert.equal(registration.exports[0].declaration.module, "class");
  assert.equal(element.declarations[0].tagName, "auro-button");
  assert.equal(
    registration.declarations[0].superclass.module,
    "src/auro-button.js",
  );
});
