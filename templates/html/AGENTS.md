# Neonix HTML Project

This project targets the Neonix HTML compiler and Protocol V2 video runtime.

## Workflow

1. Keep exactly one `meta[name="neonix-document"]` with `kind: "neonix-html-document"` and `schemaVersion: 2`.
2. Keep all authoring CSS inside `style[data-neonix-bundle]` in `src/scene.html`.
3. Use only the HTML tags and CSS properties listed below.
4. Use standard `id` values for stable layer identity; do not use `data-atomic-id`.
5. Keep composition dimensions fixed and author coordinates in composition space.
6. Run `npm run studio` after source changes to inspect the composition preview.

The compiler fails closed with diagnostics for unsupported tags, properties and values. Do not rely on browser interaction, scrolling, responsive layout, DOM state, external stylesheets or inline `style="..."` attributes.

## Project layout

- Author the complete document in `src/scene.html`.
- Keep images, videos, audio and fonts in `assets/`.
- The HTML metadata is the single source of truth for width, height, fps, background and color space.

## Supported HTML tags

Document structure:

```text
html  head  meta  title  style  body
```

Composition containers:

```text
div  main  section  article  header  footer  nav  aside  figure  figcaption
```

Text:

```text
h1  h2  h3  h4  h5  h6  span  p  strong  b  em  i  small  br
blockquote  pre  code
```

Media:

```text
img  video  audio
```

SVG:

```text
svg  g  path  rect  circle  ellipse  line  polyline  polygon
```

Text tags produce semantic text layers. `strong`/`b` use bold weight; `em`/`i` use italic style; `br` produces a hard break. `img`, `video` and `audio` require their corresponding asset metadata when compiling.

## Supported CSS properties

Custom properties beginning with `--` and `var()` are also supported.

Position, box model and sizing:

```css
position  position-anchor  anchor-name  inset  left  right  top  bottom
width  height  min-width  max-width  min-height  max-height  aspect-ratio
margin  margin-top  margin-right  margin-bottom  margin-left
padding  padding-top  padding-right  padding-bottom  padding-left  box-sizing
```

Background, color and typography:

```css
background  background-color  background-image  background-position
background-size  background-repeat  background-origin  background-clip
color  opacity
font-size  font-family  font-weight  font-style  font-stretch  line-height
letter-spacing  word-spacing  white-space  text-align  direction  writing-mode
text-decoration  text-overflow  text-rendering
```

Display and decoration:

```css
display  visibility  z-index  overflow
border  border-width  border-style  border-color
border-top  border-right  border-bottom  border-left
border-top-width  border-right-width  border-bottom-width  border-left-width
border-top-style  border-right-style  border-bottom-style  border-left-style
border-top-color  border-right-color  border-bottom-color  border-left-color
border-radius
outline  outline-width  outline-style  outline-color  outline-offset
text-shadow  box-shadow
```

Transforms, SVG paint and media:

```css
transform  transform-origin  perspective  perspective-origin
transform-style  backface-visibility
fill  fill-opacity  fill-rule  stroke  stroke-width  stroke-opacity
stroke-linejoin  stroke-linecap  stroke-dasharray  stroke-dashoffset  paint-order
object-fit  object-position  image-rendering
```

Flex and grid:

```css
flex-direction  flex-wrap  justify-content  justify-items  align-items
align-self  align-content  place-items  gap  row-gap  column-gap
flex  flex-basis  flex-grow  flex-shrink  order
grid-template-columns  grid-template-rows  grid-column  grid-column-start
grid-column-end  grid-row  grid-row-start  grid-row-end
```

Animation:

```css
animation  animation-name  animation-duration  animation-delay
animation-iteration-count  animation-direction  animation-fill-mode
animation-play-state  animation-timing-function
```

Effects, compositing, clipping, masking and motion paths:

```css
filter  backdrop-filter  mix-blend-mode  isolation  clip-path
mask-image  mask-position  mask-size  mask-repeat  mask-mode  mask-composite
offset-path  offset-distance  offset-rotate  offset-anchor
```

## Important compiler constraints

- `display` supports `none`, `block`, `contents`, `flex` and `grid`.
- `position` supports `static`, `relative` and `absolute`; `fixed` and `sticky` are not part of the video contract.
- `overflow` supports `visible` and `hidden`.
- Responsive queries, browser interaction, scroll state, forms, scripts, canvas, tables and arbitrary browser layout are unsupported.
- Text compilation requires exact font binaries supplied through the compiler font asset catalog; browser fallback is only for Studio preview.
- Unsupported features must produce diagnostics instead of being silently approximated.
