const prefix = "/__neonix_studio";
const compositionMeta = document.querySelector("#composition-meta");
const previewViewport = document.querySelector("#preview-viewport");
const stageShell = document.querySelector("#stage-shell");
const sceneFrame = document.querySelector("#scene-frame");
const inspectorReadout = document.querySelector("#inspector-readout");
const diagnosticsList = document.querySelector("#diagnostics-list");
const inspectOutline = document.querySelector("#inspect-outline");
const inspectLabel = document.querySelector("#inspect-label");
const state = { zoom: "fit", inspect: false };

const sceneSource = await fetch(`/src/scene.html?t=${Date.now()}`).then(async (response) => {
  if (!response.ok) throw new Error(`Unable to load src/scene.html (${response.status})`);
  return response.text();
});
const sceneDocument = new DOMParser().parseFromString(sceneSource, "text/html");
const metadataElement = sceneDocument.querySelector('meta[name="neonix-document"]');
if (!metadataElement) throw new Error('src/scene.html must contain meta[name="neonix-document"]');

let metadata;
try {
  metadata = JSON.parse(metadataElement.getAttribute("content") ?? "");
} catch {
  throw new Error("src/scene.html contains invalid Neonix document metadata");
}

if (metadata?.kind !== "neonix-html-document" || metadata?.schemaVersion !== 2) {
  throw new Error("src/scene.html must use neonix-html-document schema version 2");
}

const composition = metadata.composition;
if (!composition || !Number.isInteger(composition.width) || !Number.isInteger(composition.height) || composition.width <= 0 || composition.height <= 0) {
  throw new Error("src/scene.html metadata must define positive composition width and height");
}

document.title = `${composition.width}x${composition.height} · Neonix Studio`;
metadata.textContent = `${composition.width}×${composition.height} · ${composition.fps} fps · ${composition.background}`;
stageShell.style.aspectRatio = `${composition.width} / ${composition.height}`;
stageShell.style.background = composition.background;

for (const marker of document.querySelectorAll("[data-ruler-x]")) {
  marker.textContent = Math.round((composition.width * Number(marker.dataset.rulerX)) / 100);
}
for (const marker of document.querySelectorAll("[data-ruler-y]")) {
  marker.textContent = Math.round((composition.height * Number(marker.dataset.rulerY)) / 100);
}

const frameUrl = `${prefix}/frame.html?width=${composition.width}&height=${composition.height}&background=${encodeURIComponent(composition.background)}`;
sceneFrame.src = frameUrl;

function updateZoom(mode) {
  state.zoom = mode;
  for (const button of document.querySelectorAll("[data-zoom]")) button.classList.toggle("is-active", button.dataset.zoom === mode);
  if (mode === "100") {
    stageShell.style.width = `${composition.width}px`;
    stageShell.style.height = `${composition.height}px`;
    stageShell.style.aspectRatio = "auto";
  } else {
    stageShell.style.width = "";
    stageShell.style.height = "";
    stageShell.style.aspectRatio = `${composition.width} / ${composition.height}`;
  }
  requestAnimationFrame(() => sceneFrame.contentWindow?.dispatchEvent(new Event("resize")));
}

function setOverlay(id, visible) {
  document.querySelector(`#${id}`).hidden = !visible;
}

for (const button of document.querySelectorAll("[data-zoom]")) button.addEventListener("click", () => updateZoom(button.dataset.zoom));
document.querySelector("#toggle-grid").addEventListener("change", (event) => setOverlay("stage-grid", event.target.checked));
document.querySelector("#toggle-safe").addEventListener("change", (event) => setOverlay("stage-safe", event.target.checked));
document.querySelector("#toggle-ruler").addEventListener("change", (event) => {
  setOverlay("stage-ruler-x", event.target.checked);
  setOverlay("stage-ruler-y", event.target.checked);
});
document.querySelector("#toggle-inspect").addEventListener("change", (event) => {
  state.inspect = event.target.checked;
  if (!state.inspect) clearInspection();
});

function clearInspection() {
  inspectOutline.hidden = true;
  inspectLabel.hidden = true;
  inspectorReadout.textContent = state.inspect ? "Hover an element inside the composition." : "Enable Inspect and hover an element.";
}

function describeElement(element) {
  const name = element.tagName.toLowerCase();
  const suffix = element.id ? `#${element.id}` : element.classList.length ? `.${element.classList[0]}` : "";
  return `${name}${suffix}`;
}

function bindInspector() {
  const frameDocument = sceneFrame.contentDocument;
  const frameBody = frameDocument?.body;
  if (!frameDocument || !frameBody || frameBody.dataset.inspectorBound) return;
  frameBody.dataset.inspectorBound = "true";

  frameDocument.addEventListener("mousemove", (event) => {
    if (!state.inspect) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target === frameBody || target === frameDocument.documentElement) {
      clearInspection();
      return;
    }
    const stageRect = frameBody.getBoundingClientRect();
    const frameRect = sceneFrame.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const scale = stageRect.width / composition.width;
    if (!scale) return;
    const x = (rect.left - stageRect.left) / scale;
    const y = (rect.top - stageRect.top) / scale;
    const elementWidth = rect.width / scale;
    const elementHeight = rect.height / scale;
    const visualLeft = rect.left - frameRect.left;
    const visualTop = rect.top - frameRect.top;
    inspectOutline.hidden = false;
    inspectOutline.style.left = `${visualLeft}px`;
    inspectOutline.style.top = `${visualTop}px`;
    inspectOutline.style.width = `${rect.width}px`;
    inspectOutline.style.height = `${rect.height}px`;
    inspectLabel.hidden = false;
    inspectLabel.style.left = `${Math.max(4, Math.min(visualLeft, stageShell.clientWidth - 244))}px`;
    inspectLabel.style.top = `${Math.max(4, visualTop - 28)}px`;
    inspectLabel.textContent = `${describeElement(target)} · ${Math.round(x)},${Math.round(y)} · ${Math.round(elementWidth)}×${Math.round(elementHeight)}`;
    inspectorReadout.textContent = `${describeElement(target)}  x:${Math.round(x)} y:${Math.round(y)}  w:${Math.round(elementWidth)} h:${Math.round(elementHeight)}`;
  });
  frameDocument.addEventListener("mouseleave", clearInspection);
}

sceneFrame.addEventListener("load", bindInspector);

function renderDiagnostics(css) {
  const checks = [
    { label: "Viewport units (vw/vh/vmin/vmax)", expression: /\b(?:\d*\.?\d+)(?:vw|vh|vmin|vmax)\b/i, advice: "Use composition px or % so values do not depend on the browser viewport." },
    { label: "position: fixed", expression: /position\s*:\s*fixed\b/i, advice: "Use absolute positioning inside the composition; fixed is tied to the iframe viewport." },
    { label: "@media query", expression: /@media\b/i, advice: "Responsive breakpoints are not part of a fixed video composition." },
    { label: "@container query", expression: /@container\b/i, advice: "Container queries are not part of a fixed video composition." },
  ];
  const warnings = checks.filter((check) => check.expression.test(css));
  diagnosticsList.replaceChildren();
  if (!warnings.length) {
    const item = document.createElement("li");
    item.className = "diagnostic-ok";
    item.textContent = "No viewport-dependent layout patterns found.";
    diagnosticsList.append(item);
    return;
  }
  for (const warning of warnings) {
    const item = document.createElement("li");
    item.className = "diagnostic-warning";
    item.textContent = `${warning.label}: ${warning.advice}`;
    diagnosticsList.append(item);
  }
}

const sourceCss = [...sceneDocument.querySelectorAll("style[data-neonix-bundle]")].map((style) => style.textContent ?? "").join("\\n");
renderDiagnostics(sourceCss);
