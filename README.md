# create-neonix

Scaffold an offline-first Neonix HTML video project.

## Usage

```bash
npx create-neonix@latest my-video
cd my-video
npm install
npm run studio
```

Options:

```bash
npx create-neonix@latest my-video --composition 9:16
npx create-neonix@latest my-video --composition 1:1 --fps 60
npx create-neonix@latest my-video --install
```

The generated project contains one self-contained `src/scene.html`, a
Vite-powered studio preview. The HTML includes the required
`meta[name="neonix-document"]` schema v2 metadata and inline
`style[data-neonix-bundle]`, so it can be passed directly to the canonical
Neonix HTML compiler. There is no separate `neonix.config.json` file.

The studio renders the source inside a fixed composition iframe for 16:9,
9:16 or 1:1. The HTML metadata is the single source of truth for composition.


This package is intentionally independent from the private Neonix application repository. Publish it from this directory as `create-neonix` when the public CLI/compiler packages are available.
