# Neonix HTML Project

## Workflow

1. Read `RULE.md` and `neonix-capabilities.json` before editing.
2. Keep `neonix.config.json` valid and treat its composition as the source of truth.
3. Use only supported HTML tags and CSS properties.
4. Run `npm run validate` after source changes.
5. Run `npm run compile` before handing off the project.
6. Fix compiler diagnostics instead of silently removing declarations.

## Project layout

- Author HTML in `src/scene.html`.
- Author CSS in `src/scene.css`.
- Keep images, videos, audio and fonts in `assets/`.

## Composition

This project uses the `{{COMPOSITION_PRESET}}` composition preset. CSS coordinates are authored in composition space, not browser viewport space.
