# @neonix/studio

Fixed-composition HTML preview for Neonix projects.

The package serves its Studio UI from `node_modules` and reads the project files from the current working directory:

- `src/scene.html`;
- `assets/`.

The HTML document contains the Neonix composition metadata and inline CSS. Studio provides native browser preview only; it does not compile HTML/CSS to Protocol V2 JSON.

```bash
npm run studio
```

The `neonix-studio` binary starts Vite, opens `/__neonix_studio/`, and constrains the scene to the composition dimensions embedded in `src/scene.html`.