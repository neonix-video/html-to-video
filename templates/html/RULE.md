# Neonix Authoring Rules

This project targets the Neonix HTML compiler and Protocol V2 video runtime.

- The composition metadata in `src/scene.html` is mandatory.
- Keep exactly one `meta[name="neonix-document"]` with schema version 2.
- Keep authoring CSS inside `style[data-neonix-bundle]` in the same HTML document.
- Unsupported HTML tags and CSS declarations must fail compilation.
- Do not rely on browser interaction, scrolling, responsive layout or DOM state.
- Use explicit dimensions and composition-space coordinates.
- Keep assets local under `assets/` or declare them in the project asset manifest.
- Run `npm run studio` after source changes to check the fixed composition preview.

The complete compiler contract is provided by the installed `@neonix/html-compiler` package.