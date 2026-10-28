// Figtion · Copy to app — serializes the current selection to JSON; paste it into Figtion with ⌘V.
figma.showUI(__html__, { width: 300, height: 190 });

const plain = v => (typeof v === 'symbol' ? undefined : v);
const paints = list => {
  if (!list || typeof list === 'symbol') return [];
  return list.map(p => ({
    type: p.type, visible: p.visible !== false, opacity: p.opacity,
    color: p.color ? { r: p.color.r, g: p.color.g, b: p.color.b } : undefined,
    gradientStops: p.gradientStops ? p.gradientStops.map(s => ({ position: s.position, color: { r: s.color.r, g: s.color.g, b: s.color.b, a: s.color.a } })) : undefined,
    gradientTransform: p.gradientTransform, imageScaleMode: p.scaleMode, imageTransform: p.imageTransform
  }));
};
const hasImage = n => Array.isArray(n.fills) && n.fills.some(f => f.type === 'IMAGE' && f.visible !== false);
const VECTORS = { VECTOR: 1, BOOLEAN_OPERATION: 1, LINE: 1, POLYGON: 1 };
// types the app can build from properties; anything else (FigJam stickies, connectors, tables, widgets, embeds…) is sent as a picture
const NATIVE = { FRAME: 1, GROUP: 1, TEXT: 1, RECTANGLE: 1, ELLIPSE: 1, VECTOR: 1, STAR: 1, LINE: 1, BOOLEAN_OPERATION: 1, POLYGON: 1, COMPONENT: 1, COMPONENT_SET: 1, INSTANCE: 1, SECTION: 1 };
const b64 = bytes => 'data:image/png;base64,' + figma.base64Encode(bytes);

async function ser(n, depth) {
  const o = {
    type: n.type, name: n.name, visible: n.visible,
    opacity: plain(n.opacity), rotation: plain(n.rotation),
    absolute: n.absoluteBoundingBox ? { x: n.absoluteBoundingBox.x, y: n.absoluteBoundingBox.y, width: n.absoluteBoundingBox.width, height: n.absoluteBoundingBox.height } : undefined,
    width: n.width, height: n.height,
    fills: paints(plain(n.fills)), strokes: paints(plain(n.strokes)), strokeWeight: plain(n.strokeWeight),
    cornerRadius: plain(n.cornerRadius),
    rectangleCornerRadii: n.rectangleCornerRadii,
    dashPattern: plain(n.dashPattern),
    strokeTopWeight: plain(n.strokeTopWeight), strokeBottomWeight: plain(n.strokeBottomWeight), strokeLeftWeight: plain(n.strokeLeftWeight), strokeRightWeight: plain(n.strokeRightWeight),
    blendMode: plain(n.blendMode), strokeAlign: plain(n.strokeAlign), strokeJoin: plain(n.strokeJoin), strokeCap: plain(n.strokeCap),
    clipsContent: n.clipsContent,
    isMask: plain(n.isMask) || undefined,
    effects: (plain(n.effects) || []).map(e => ({ type: e.type, visible: e.visible, radius: e.radius, offset: e.offset, color: e.color, spread: e.spread }))
  };
  if (n.type === 'STAR') { o.pointCount = n.pointCount; o.innerRadius = n.innerRadius; }
  if (n.type === 'TEXT') {
    o.characters = n.characters; o.fontSize = plain(n.fontSize);
    o.fontName = plain(n.fontName) || n.getRangeFontName(0, 1);
    o.fontWeight = plain(n.fontWeight) || n.getRangeFontWeight(0, 1);
    o.textAlignHorizontal = n.textAlignHorizontal; o.textAlignVertical = n.textAlignVertical;
    o.lineHeight = plain(n.lineHeight) || n.getRangeLineHeight(0, 1);
    o.letterSpacing = plain(n.letterSpacing) || n.getRangeLetterSpacing(0, 1);
    o.textCase = plain(n.textCase); o.textAutoResize = n.textAutoResize; o.textDecoration = plain(n.textDecoration);
    if (!o.fills.length) o.fills = paints(n.getRangeFills(0, 1));
    return o;
  }
  try {
    if (VECTORS[n.type]) o.svg = await n.exportAsync({ format: 'SVG_STRING' });
    else if (!NATIVE[n.type] && n.type !== 'SLICE') o.png = b64(await n.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } }));
    else if (hasImage(n) && !n.children) o.png = b64(await n.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } }));
    else if (hasImage(n) && n.children) {   // a frame / group with a picture fill: send the picture itself, the children follow separately
      const ip = n.fills.find(f => f.type === 'IMAGE' && f.visible !== false);
      const img = ip && ip.imageHash && figma.getImageByHash(ip.imageHash);
      if (img) o.imageUrl = b64(await img.getBytesAsync());
    }
  } catch (e) { /* leave the plain shape */ }
  if (n.children && !o.svg && !o.png && depth < 60) {
    o.children = [];
    for (const c of n.children) o.children.push(await ser(c, depth + 1));
  }
  return o;
}

async function run() {
  const sel = figma.currentPage.selection;
  if (!sel.length) { figma.ui.postMessage({ type: 'empty' }); return; }
  const nodes = [];
  for (const n of sel) nodes.push(await ser(n, 0));
  figma.ui.postMessage({ type: 'data', count: sel.length, json: JSON.stringify({ format: 'figtion-figma', version: 1, nodes }) });
}
figma.on('selectionchange', run);
figma.ui.onmessage = m => { if (m.type === 'refresh') run(); if (m.type === 'close') figma.closePlugin(); };
run();
