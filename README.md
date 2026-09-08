# create-neonix

Scaffold an offline-first Neonix HTML/CSS video project.

## Usage

```bash
npx create-neonix@latest my-video
cd my-video
npm install
npm run dev
```

Options:

```bash
npx create-neonix@latest my-video --composition 9:16
npx create-neonix@latest my-video --composition 1:1 --fps 60
npx create-neonix@latest my-video --install
```

The generated project contains HTML, CSS and a required `neonix.config.json`. The config owns the composition contract; the compiler lowers the source into Protocol V2 JSON.

This package is intentionally independent from the private Neonix application repository. Publish it from this directory as `create-neonix` when the public CLI/compiler packages are available.
