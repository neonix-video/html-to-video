const params = new URLSearchParams(location.search);
const width = Number(params.get("width"));
const height = Number(params.get("height"));
const background = params.get("background") || "#081018";

if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
  throw new Error("Invalid composition dimensions");
}

const sceneSource = await fetch(`/src/scene.html?t=${Date.now()}`).then((response) => {
  if (!response.ok) throw new Error(`Unable to load src/scene.html (${response.status})`);
  return response.text();
});

const parsedScene = new DOMParser().parseFromString(sceneSource, "text/html");
document.body.className = "neonix-stage";
document.body.innerHTML = parsedScene.body?.innerHTML || "";

const sceneStyles = [...(parsedScene.head?.querySelectorAll("style") ?? [])]
  .map((style) => style.textContent ?? "")
  .join("\\n");
if (sceneStyles.trim()) {
  const stylesheet = document.createElement("style");
  stylesheet.dataset.neonixBundle = "";
  stylesheet.textContent = sceneStyles;
  document.head.append(stylesheet);
}

const studioStyles = document.createElement("style");
studioStyles.textContent = `
  :root, html { width: 100%; height: 100%; overflow: hidden; background: ${background}; }
  body.neonix-stage {
    position: absolute !important; top: 0 !important; left: 0 !important;
    width: ${width}px !important; height: ${height}px !important;
    min-width: ${width}px !important; min-height: ${height}px !important;
    margin: 0 !important; overflow: hidden !important;
    transform-origin: 0 0; background: ${background};
  }
`;
document.head.append(studioStyles);

function fitStage() {
  const scale = Math.min(innerWidth / width, innerHeight / height);
  const left = Math.max(0, (innerWidth - width * scale) / 2);
  const top = Math.max(0, (innerHeight - height * scale) / 2);
  document.body.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
}

addEventListener("resize", fitStage);
fitStage();
