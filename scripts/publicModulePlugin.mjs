import { posix } from "node:path";

/** Point the element declaration at the public, typed class entry point. */
export function publicModulePlugin() {
  return {
    name: "auro-button-public-module",
    packageLinkPhase({ customElementsManifest }) {
      const source = "src/auro-button.js";
      const publicModule = "class";

      const visit = (value, ownerPath) => {
        if (!value || typeof value !== "object") return;
        const target = value.module?.startsWith(".")
          ? posix.normalize(posix.join(posix.dirname(ownerPath), value.module))
          : value.module;
        if (target === source && !value.package) {
          value.module = publicModule;
        }
        for (const child of Object.values(value)) visit(child, ownerPath);
      };

      for (const module of customElementsManifest.modules) {
        visit(module, module.path);
        if (module.path === source) module.path = publicModule;
      }
    },
  };
}
