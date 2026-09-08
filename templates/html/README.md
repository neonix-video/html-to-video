# {{PROJECT_NAME}}

Neonix HTML/CSS video project using the `{{COMPOSITION_PRESET}}` composition preset.

## Commands

```bash
npm install
npm run dev
npm run validate
npm run compile
npm run deploy
```

The local compiler produces Protocol V2 JSON. The deploy command uploads source files and `neonix.config.json`; the Neonix API validates and compiles the source again before preview or export.

Project files live in `src/scene.html` and `src/scene.css`. Put local images, videos, audio and fonts in `assets/`.
