#!/usr/bin/env node

import { readdir, readFile, stat, writeFile, mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateRoot = path.join(packageRoot, "templates", "html");

const presets = {
  "16:9": { width: 1920, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
};

function usage() {
  console.log(`Usage: npx create-neonix [project-directory] [options]

Options:
  --template <name>          Template name (default: html)
  --composition <preset>     16:9, 9:16 or 1:1 (default: 16:9)
  --fps <number>             Composition frame rate (default: 30)
  --background <hex>         Composition background (default: #081018)
  --color-space <name>       Color space (default: srgb)
  --install                  Run npm install after scaffolding
  --package-manager <name>   npm, pnpm or yarn (default: npm)
  --force                    Allow a non-empty target directory
  --help                     Show this help`);
}

function parseArgs(argv) {
  const options = {
    template: "html",
    composition: "16:9",
    fps: 30,
    background: "#081018",
    colorSpace: "srgb",
    install: false,
    packageManager: "npm",
    force: false,
  };
  let projectDirectory;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") return { help: true };
    if (argument === "--force") {
      options.force = true;
      continue;
    }
    if (argument === "--install") {
      options.install = true;
      continue;
    }
    if (argument.startsWith("--")) {
      const [key, inlineValue] = argument.split("=", 2);
      const value = inlineValue ?? argv[++index];
      if (!value || value.startsWith("--")) throw new Error(`${key} requires a value`);
      if (key === "--template") options.template = value;
      else if (key === "--composition") options.composition = value;
      else if (key === "--fps") options.fps = Number(value);
      else if (key === "--background") options.background = value;
      else if (key === "--color-space") options.colorSpace = value;
      else if (key === "--package-manager") options.packageManager = value;
      else throw new Error(`Unknown option: ${key}`);
      continue;
    }
    if (projectDirectory) throw new Error(`Unexpected argument: ${argument}`);
    projectDirectory = argument;
  }

  return { projectDirectory: projectDirectory ?? "neonix-project", options };
}

function projectNameFromPath(projectDirectory) {
  const baseName = path.basename(path.resolve(projectDirectory));
  const projectName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/^[._]+/, "");
  if (!projectName) throw new Error("Project directory must produce a valid npm package name");
  return projectName;
}

async function directoryExists(directory) {
  try {
    return (await stat(directory)).isDirectory();
  } catch {
    return false;
  }
}

async function copyTemplate(source, target, replacements) {
  await mkdir(target, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetName = entry.name === "gitignore.template" ? ".gitignore" : entry.name;
    const targetPath = path.join(target, targetName);
    if (entry.isDirectory()) {
      await copyTemplate(sourcePath, targetPath, replacements);
      continue;
    }
    let content = await readFile(sourcePath, "utf8");
    for (const [token, replacement] of Object.entries(replacements)) content = content.split(token).join(replacement);
    await writeFile(targetPath, content, "utf8");
  }
}

function validateOptions(options) {
  if (options.template !== "html") throw new Error(`Unknown template: ${options.template}`);
  if (!presets[options.composition]) throw new Error(`Unknown composition: ${options.composition}`);
  if (!Number.isInteger(options.fps) || options.fps <= 0 || options.fps > 240) throw new Error("fps must be an integer between 1 and 240");
  if (!/^#[0-9a-f]{6}$/i.test(options.background)) throw new Error("background must be a six-digit hex color");
  if (options.colorSpace !== "srgb") throw new Error("Only srgb color space is currently supported");
  if (!["npm", "pnpm", "yarn"].includes(options.packageManager)) throw new Error("package-manager must be npm, pnpm or yarn");
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    usage();
    return;
  }

  validateOptions(parsed.options);
  const target = path.resolve(process.cwd(), parsed.projectDirectory);
  if (await directoryExists(target) && !parsed.options.force && (await readdir(target)).length > 0) {
    throw new Error(`Target directory is not empty: ${target}. Use --force to continue.`);
  }

  const projectName = projectNameFromPath(parsed.projectDirectory);
  const preset = presets[parsed.options.composition];
  const config = {
    kind: "neonix-html-project",
    schemaVersion: 1,
    composition: {
      width: preset.width,
      height: preset.height,
      fps: parsed.options.fps,
      background: parsed.options.background,
      colorSpace: parsed.options.colorSpace,
    },
  };
  await copyTemplate(templateRoot, target, {
    "{{PROJECT_NAME}}": projectName,
    "{{COMPOSITION_PRESET}}": parsed.options.composition,
    "{{CONFIG_JSON}}": JSON.stringify(config, null, 2),
  });

  if (parsed.options.install) {
    console.log(`\nInstalling dependencies with ${parsed.options.packageManager}...`);
    const result = spawnSync(parsed.options.packageManager, ["install"], { cwd: target, stdio: "inherit", shell: process.platform === "win32" });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }

  console.log(`\nCreated Neonix project: ${target}`);
  console.log(`\nNext steps:\n  cd ${path.relative(process.cwd(), target) || "."}\n  npm run dev\n\nComposition: ${parsed.options.composition} (${preset.width}x${preset.height} @ ${parsed.options.fps}fps)`);
  if (!parsed.options.install) console.log("\nRun npm install before starting the local CLI.");
}

main().catch((error) => {
  console.error(`\ncreate-neonix: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
