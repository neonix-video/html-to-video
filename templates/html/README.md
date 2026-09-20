# {{PROJECT_NAME}}

Neonix HTML video project using the `{{COMPOSITION_PRESET}}` composition preset.

## Commands

```bash
npm install
npm run studio
```

`npm run studio` starts the Neonix Studio package and opens a constrained iframe preview. The iframe stage reads the composition dimensions directly from `src/scene.html`, so it previews the scene as a video composition instead of as a responsive web page.

The single source of truth is `src/scene.html`. It contains the required
`meta[name="neonix-document"]` metadata and an inline
`style[data-neonix-bundle]`, matching the canonical Neonix compiler document.
Put local images, videos, audio and fonts in `assets/`. Text layers need an exact font asset when passed to the compiler; Studio can still preview with the browser font fallback.
