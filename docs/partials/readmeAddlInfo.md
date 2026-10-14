<!-- AURO-GENERATED-CONTENT This file is to be used for any additional content that should be included in the README.md which is specific to this component. -->

## Custom Elements Manifest and types

The published `custom-elements.json` describes `auro-button` and references the typed
`@aurodesignsystem/auro-button/class` entry point. `npm run build` generates both the
manifest and class declarations. After building, run `npm run test:manifest` to check
the manifest's public module path and compile a TypeScript consumer of the class.

## Responsive support

`<auro-button>` is responsive by default. The button will assume 100% of the width of its container for views less than [auro_breakpoint--sm](https://alaskaairlines.github.io/WebCoreStyleSheets/#responsive-mixin-auro_breakpoint--sm).

Beyond that breakpoint `<auro-button>` will assume the width of the content or a min-width of `8.75rem`, which ever is greater.

If the desired appearance of the `<auro-button>` is to be placed in the reverse direction of natural content, then the attributes of `responsive` and `reverse` are needed on the `<auro-button>` element.
