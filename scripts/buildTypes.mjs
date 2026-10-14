import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

// TypeScript cannot infer Lit instance properties from the static property descriptors.
// Use the same public property metadata as the manifest, retaining emitted method signatures.
const manifest = JSON.parse(readFileSync("custom-elements.json", "utf8"));
for (const [name, file] of [
  ["AuroButton", "dist/types/auro-button.d.ts"],
  ["AuroElement", "dist/types/layoutElement/auroElement.d.ts"],
]) {
  const declaration = manifest.modules
    .flatMap((module) => module.declarations ?? [])
    .find((declaration) => declaration.name === name);
  if (!declaration) throw new Error(`Missing manifest declaration: ${name}`);
  const text = readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const classNode = source.statements.find(
    (node) => ts.isClassDeclaration(node) && node.name?.text === name,
  );
  if (!classNode) throw new Error(`Missing emitted class: ${name}`);
  const edits = [];
  const additions = [];
  for (const member of declaration.members ?? []) {
    if (
      member.kind !== "field" ||
      member.static ||
      !member.type?.text ||
      member.privacy === "private" ||
      member.privacy === "protected"
    )
      continue;
    // Native title is always a string even without an attribute; unset custom properties may
    // be undefined. This also keeps HTMLElement inheritance valid for declaration consumers.
    const type =
      member.type.text +
      (member.default === "undefined" && member.name !== "title"
        ? " | undefined"
        : "");
    const typeSource = ts.createSourceFile(
      "type.ts",
      `type Value = ${type};`,
      ts.ScriptTarget.Latest,
    );
    if (typeSource.parseDiagnostics.length)
      throw new Error(`Invalid type for ${name}.${member.name}`);
    const emitted = classNode.members.find(
      (node) =>
        ts.isPropertyDeclaration(node) &&
        !node.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword,
        ) &&
        node.name.getText(source) === member.name,
    );
    if (emitted?.type) {
      edits.push({
        start: emitted.type.getStart(source),
        end: emitted.type.end,
        text: type,
      });
    } else {
      additions.push(
        `    ${member.readonly ? "readonly " : ""}${member.name}: ${type};`,
      );
    }
  }
  edits.push({
    start: classNode.end - 1,
    end: classNode.end - 1,
    text: `${additions.join("\n")}\n`,
  });
  let updated = text;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    updated =
      updated.slice(0, edit.start) + edit.text + updated.slice(edit.end);
  }
  writeFileSync(file, updated);
}

// The CLI emits JSX augmentations with source imports and a circular class re-export.
// Keep those augmentations, but connect them to the shipped declarations. The root module
// registers the element and has no runtime exports, so its class export must be type-only.
const jsxPath = "dist/index.d.ts";
const jsx = readFileSync(jsxPath, "utf8")
  .replaceAll('from "src/', 'from "./types/')
  .replace(
    'export { AuroButton } from "./index.js";',
    'export type { AuroButton } from "./types/index.js";',
  );
writeFileSync(jsxPath, jsx);
