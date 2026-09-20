#!/usr/bin/env node

import { createServer } from "vite";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const studioRoot = path.join(packageRoot, "studio");
const studioPrefix = "/__neonix_studio";

function usage() {
  console.log(`Usage: neonix-studio [options]

Options:
  --host <host>              Bind host (default: 127.0.0.1)
  --port <number>            Port (default: 5173)
  --no-open                  Do not open the browser
  --help                     Show this help`);
}

function parseArgs(argv) {
  const options = { host: "127.0.0.1", port: 5173, open: true };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") return { help: true };
    if (argument === "--no-open") {
      options.open = false;
      continue;
    }
    if (argument === "--host" || argument === "--port") {
      const value = argv[++index];
      if (!value) throw new Error(`${argument} requires a value`);
      if (argument === "--host") options.host = value;
      else options.port = Number(value);
      continue;
    }
    throw new Error(`Unknown option: ${argument}`);
  }
  if (!Number.isInteger(options.port) || options.port <= 0 || options.port > 65535) {
    throw new Error("port must be an integer between 1 and 65535");
  }
  return { options };
}

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
  }[extension] ?? "application/octet-stream";
}

function studioAssetPlugin() {
  return {
    name: "neonix-studio-assets",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const requestUrl = request.url ?? "/";
        let pathname;
        try {
          pathname = new URL(requestUrl, "http://neonix.local").pathname;
        } catch {
          next();
          return;
        }
        if (!pathname.startsWith(studioPrefix)) {
          next();
          return;
        }

        const requestedPath = pathname.slice(studioPrefix.length);
        const relativePath = requestedPath === "" || requestedPath === "/" ? "/index.html" : requestedPath;
        const candidate = path.resolve(studioRoot, `.${relativePath}`);
        if (candidate !== studioRoot && !candidate.startsWith(`${studioRoot}${path.sep}`)) {
          next();
          return;
        }

        try {
          if (!(await stat(candidate)).isFile()) {
            next();
            return;
          }
          response.statusCode = 200;
          response.setHeader("Content-Type", contentType(candidate));
          response.end(await readFile(candidate));
        } catch {
          next();
        }
      });
    },
  };
}

function sceneReloadPlugin() {
  const reloadFiles = ["/src/scene.html"];
  return {
    name: "neonix-studio-scene-reload",
    handleHotUpdate({ file, server }) {
      const normalizedFile = file.replaceAll("\\", "/");
      if (reloadFiles.some((entry) => normalizedFile.endsWith(entry))) {
        server.ws.send({ type: "full-reload" });
        return [];
      }
      return undefined;
    },
  };
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    usage();
    return;
  }

  const projectRoot = process.cwd();
  try {
    await stat(path.join(projectRoot, "src", "scene.html"));
  } catch {
    throw new Error("src/scene.html was not found in the current directory");
  }

  const server = await createServer({
    root: projectRoot,
    configFile: false,
    plugins: [studioAssetPlugin(), sceneReloadPlugin()],
    server: {
      host: parsed.options.host,
      port: parsed.options.port,
      open: parsed.options.open ? `${studioPrefix}/` : false,
    },
  });

  await server.listen();
  server.printUrls();
  console.log(`  ➜  Studio:   ${studioPrefix}/`);

  const close = async () => {
    await server.close();
    process.exit(0);
  };
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
}

main().catch((error) => {
  console.error(`\nneonix-studio: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
