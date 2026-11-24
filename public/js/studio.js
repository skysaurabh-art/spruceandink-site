/* Spruce & Ink design studio: realistic 3D preview + print-layout editor.
   three.js r160 (ES module). Units for product geometry are inches. */
import * as THREE from "three";
import { RoomEnvironment } from "./RoomEnvironment.js";

const root = document.getElementById("studio");
const $ = (id) => document.getElementById(id);
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- pricing + Stripe ---------------- */
const SALE = 0.25; /* 25% off everything. Set to 0 to end the sale. */
const LINK = {
  tumbler20: "https://buy.stripe.com/fZueV63nP2bE3cvcwDfQI00",
  tumbler30: "https://buy.stripe.com/5kQ5kw8I9g2u8wP2W3fQI0h",
  tumbler40: "https://buy.stripe.com/14AcMY4rTdUmbJ168ffQI01",
  bottle17: "https://buy.stripe.com/00wdR2f6x9E614n68ffQI02",
  bottle25: "https://buy.stripe.com/3cIcMY8I98A24gz54bfQI0i",
  mug11: "https://buy.stripe.com/bJe7sE4rTg2u8wPgMTfQI03",
  mug15: "https://buy.stripe.com/dRmcMYaQh9E614ngMTfQI0j",
  glass: "https://buy.stripe.com/aFaaEQ3nP03w4gzeELfQI04",
  block46: "https://buy.stripe.com/14AbIU1fH2bE28r1RZfQI0k",
  block57: "https://buy.stripe.com/00w7sEgaB03w00jaovfQI05",
  block810: "https://buy.stripe.com/4gMbIU1fH7vYeVd407fQI0l",
  ornament: "https://buy.stripe.com/aFa3co7E52bEeVdgMTfQI06",
  coasters4: "https://buy.stripe.com/4gM00caQh6rU28rcwDfQI07",
  coasters6: "https://buy.stripe.com/4gM00ce2tbMedR99krfQI0m",
  panel68: "https://buy.stripe.com/aFa6oAcYpg2uaEXcwDfQI08",
  panel810: "https://buy.stripe.com/aFa9AM7E59E67sL68ffQI0n",
  tee: "https://buy.stripe.com/9B600c5vX9E69ATgMTfQI09",
  hoodie: "https://buy.stripe.com/9B66oA1fHg2u7sL0NVfQI0a",
  tote: "https://buy.stripe.com/fZu00c5vX8A29AT68ffQI0b",
  apron: "https://buy.stripe.com/28E7sEaQhcQieVdbszfQI0c",
  keychain: "https://buy.stripe.com/9B65kw6A15nQ14n7cjfQI0d",
  magnet: "https://buy.stripe.com/aFa00c5vX2bE7sLaovfQI0e",
  phone: "https://buy.stripe.com/00w8wI6A1aIadR9dAHfQI0f",
  plate82: "https://buy.stripe.com/6oU6oAf6xg2u5kD0NVfQI0g",
  plate103: "https://buy.stripe.com/6oU14gbUldUmcN5gMTfQI0o"
};

/* ---------------- finishes ---------------- */
const F = {
  black: { label: "Black", type: "powder", c: "#1c1f25", dark: true },
  white: { label: "White", type: "powder", c: "#eceef1" },
  navy: { label: "Navy", type: "powder", c: "#1f2d4f", dark: true },
  blush: { label: "Blush", type: "powder", c: "#efbcc7" },
  sage: { label: "Sage", type: "powder", c: "#a7c0a1" },
  steel: { label: "Stainless", type: "steel", c: "#d9dde2" },
  gwhite: { label: "White", type: "ceramic", c: "#f6f6f3" },
  gblack: { label: "Black", type: "ceramic", c: "#1b1c1f", dark: true },
  glass: { label: "Clear glass", type: "glass", c: "#ffffff" },
  clear: { label: "Clear", type: "acrylic", c: "#ffffff" },
  frosted: { label: "Frosted", type: "acrylic", frost: true, c: "#ffffff" },
  wood: { label: "Wood", type: "wood", c: "#c89a63" },
  ceramic: { label: "White ceramic", type: "ceramic", c: "#f5f5f2" },
  slate: { label: "Slate", type: "slate", c: "#3a3e44", dark: true },
  pwhite: { label: "White", type: "plastic", c: "#f2f2f0" },
  pblack: { label: "Black", type: "plastic", c: "#1c1d20", dark: true },
  fwhite: { label: "White", type: "fabric", c: "#f1f1ee" },
  fblack: { label: "Black", type: "fabric", c: "#202125", dark: true },
  heather: { label: "Heather grey", type: "fabric", c: "#a2a6ac" },
  fnavy: { label: "Navy", type: "fabric", c: "#1f2a44", dark: true },
  fsage: { label: "Sage", type: "fabric", c: "#9db697" },
  fred: { label: "Red", type: "fabric", c: "#a3212b", dark: true },
  natural: { label: "Natural", type: "fabric", c: "#e4d8bf" },
  mwhite: { label: "Gloss white", type: "ceramic", c: "#f7f7f5" }
};
const CAN = ["black", "white", "navy", "blush", "sage", "steel"];

/* ---------------- product catalogue ---------------- */
const P = {
  tumbler: {
    cat: "drink", label: "Tumbler", kind: "lathe", fin: CAN, def: "black", covers: ["wrap", "front", "frontback"],
    sizes: [
      { id: "20oz", label: "20oz skinny", price: 30, link: "tumbler20", g: {
        body: [[0, 0], [1.22, 0], [1.3, 0.04], [1.34, 0.14], [1.355, 0.32], [1.455, 7.5], [1.47, 7.6], [0, 7.6]], zone: [0.75, 6.95], rim: [7.22, 7.6],
        lid: [[1.42, 7.5], [1.49, 7.58], [1.49, 7.92], [1.44, 8.02], [0.3, 8.06], [0, 8.06]], straw: { x: 0.45, y0: 7.2, y1: 10.1, r: 0.12 }, panel: 0.36 } },
      { id: "30oz", label: "30oz", price: 33, link: "tumbler30", g: {
        body: [[0, 0], [1.36, 0], [1.43, 0.05], [1.47, 0.25], [1.93, 7.7], [1.95, 7.85], [0, 7.85]], zone: [0.8, 7.1], rim: [7.45, 7.85],
        lid: [[1.9, 7.75], [1.99, 7.84], [1.99, 8.15], [1.92, 8.27], [0.35, 8.3], [0, 8.3]], straw: { x: 0.6, y0: 7.5, y1: 10.7, r: 0.14 }, panel: 0.33 } },
      { id: "40oz", label: "40oz with handle", price: 35, link: "tumbler40", g: {
        body: [[0, 0], [1.2, 0], [1.28, 0.06], [1.31, 0.25], [1.32, 1.9], [1.45, 2.2], [1.8, 2.5], [1.93, 2.75], [1.96, 3.0], [2.02, 9.3], [2.04, 9.42], [0, 9.42]], zone: [3.15, 8.85], rim: [9.05, 9.42],
        lid: [[1.98, 9.3], [2.09, 9.42], [2.09, 10.0], [2.0, 10.15], [0.4, 10.2], [0, 10.2]], straw: { x: 0.7, y0: 9.6, y1: 12.4, r: 0.15 },
        handle: { pts: [[1.98, 8.55], [2.75, 8.5], [3.2, 7.9], [3.28, 6.0], [3.2, 4.3], [2.75, 3.75], [1.97, 3.7]], r: 0.27 }, gap: 0.085, panel: 0.32 } }
    ]
  },
  bottle: {
    cat: "drink", label: "Water bottle", kind: "lathe", fin: CAN, def: "white", covers: ["wrap", "front", "frontback"],
    sizes: [
      { id: "17oz", label: "17oz", price: 30, link: "bottle17", g: {
        body: [[0, 0], [1.24, 0], [1.33, 0.06], [1.37, 0.22], [1.38, 0.45], [1.38, 6.15], [1.33, 6.6], [1.15, 7.15], [0.9, 7.55], [0.74, 7.8], [0.72, 8.15], [0, 8.15]], zone: [0.75, 5.9],
        lid: [[0.74, 8.0], [0.79, 8.08], [0.79, 9.2], [0.74, 9.3], [0, 9.32]], lidSteel: true, panel: 0.36 } },
      { id: "25oz", label: "25oz", price: 33, link: "bottle25", g: {
        body: [[0, 0], [1.4, 0], [1.5, 0.06], [1.54, 0.22], [1.55, 0.45], [1.55, 7.2], [1.5, 7.7], [1.3, 8.3], [1.0, 8.75], [0.8, 9.0], [0.78, 9.4], [0, 9.4]], zone: [0.8, 6.9],
        lid: [[0.8, 9.25], [0.85, 9.33], [0.85, 10.5], [0.8, 10.6], [0, 10.62]], lidSteel: true, panel: 0.34 } }
    ]
  },
  mug: {
    cat: "drink", label: "Mug", kind: "lathe", fin: ["gwhite", "gblack"], def: "gwhite", covers: ["wrap", "front", "frontback"],
    sizes: [
      { id: "11oz", label: "11oz", price: 20, link: "mug11", g: {
        body: [[0, 0], [1.4, 0], [1.52, 0.05], [1.58, 0.2], [1.6, 0.4], [1.62, 3.75], [1.6, 3.83], [1.53, 3.83], [1.5, 3.72], [1.47, 0.45], [1.3, 0.3], [0, 0.28]], zone: [0.45, 3.45],
        handle: { pts: [[1.58, 3.2], [2.3, 3.15], [2.62, 2.6], [2.55, 1.5], [2.25, 0.95], [1.58, 0.85]], r: 0.2 }, gap: 0.1, panel: 0.3 } },
      { id: "15oz", label: "15oz", price: 23, link: "mug15", g: {
        body: [[0, 0], [1.6, 0], [1.72, 0.05], [1.78, 0.2], [1.8, 0.4], [1.82, 4.45], [1.8, 4.53], [1.72, 4.53], [1.69, 4.42], [1.66, 0.45], [1.48, 0.3], [0, 0.28]], zone: [0.5, 4.1],
        handle: { pts: [[1.78, 3.8], [2.55, 3.75], [2.9, 3.1], [2.82, 1.8], [2.5, 1.1], [1.78, 1.0]], r: 0.22 }, gap: 0.1, panel: 0.3 } }
    ]
  },
  glass: {
    cat: "drink", label: "Wine glass", kind: "lathe", fin: ["glass"], def: "glass", covers: ["wrap", "front", "frontback"],
    sizes: [
      { id: "15oz", label: "15oz stemless", price: 20, link: "glass", g: {
        body: [[0, 0], [0.95, 0], [1.08, 0.08], [1.2, 0.4], [1.55, 1.2], [1.78, 2.2], [1.8, 3.0], [1.68, 4.0], [1.55, 4.6], [1.5, 4.62], [1.62, 4.0], [1.73, 3.0], [1.71, 2.2], [1.48, 1.2], [1.1, 0.5], [0, 0.42]], zone: [1.25, 3.55], panel: 0.34 } }
    ]
  },
  block: {
    cat: "photo", label: "Acrylic photo block", kind: "slab", fin: ["clear"], def: "clear", orient: true, covers: ["full", "center"], back: true, thick: 0.75, r: 0.06,
    sizes: [{ id: "4x6", label: "4×6 in", price: 25, link: "block46", d: [6, 4] }, { id: "5x7", label: "5×7 in", price: 30, link: "block57", d: [7, 5] }, { id: "8x10", label: "8×10 in", price: 40, link: "block810", d: [10, 8] }]
  },
  ornament: {
    cat: "photo", label: "Photo ornament", kind: "slab", fin: ["wood", "clear", "pwhite"], def: "wood", covers: ["full", "center"], thick: 0.2, ribbon: true, sway: true,
    sizes: [{ id: "3in", label: "3.3 in", price: 15, link: "ornament", d: [3.3, 3.3] }], shapes: [{ id: "round", label: "Round" }, { id: "heart", label: "Heart" }]
  },
  coasters: {
    cat: "photo", label: "Coasters", kind: "slab", fin: ["ceramic", "slate"], def: "ceramic", covers: ["full", "center"], thick: 0.25, r: 0.22, flat: true,
    sizes: [{ id: "set4", label: "Set of 4", price: 30, link: "coasters4", d: [4, 4], n: 4 }, { id: "set6", label: "Set of 6", price: 42, link: "coasters6", d: [4, 4], n: 6 }],
    shapes: [{ id: "square", label: "Square" }, { id: "round", label: "Round" }]
  },
  panel: {
    cat: "photo", label: "Photo panel", kind: "slab", fin: ["slate", "wood", "glass"], def: "slate", orient: true, covers: ["full", "center"], thick: 0.3, r: 0.05, easel: true, lean: 0.14,
    sizes: [{ id: "6x8", label: "6×8 in", price: 30, link: "panel68", d: [8, 6] }, { id: "8x10", label: "8×10 in", price: 38, link: "panel810", d: [10, 8] }]
  },
  tee: {
    cat: "wear", label: "T-shirt", kind: "cloth", fin: ["fwhite", "fblack", "heather", "fnavy", "fsage", "fred"], def: "fwhite", wear: true, covers: ["front", "chest", "back", "frontback"],
    sizes: [{ id: "std", label: "Unisex tee", price: 25, link: "tee" }], shape: "tee", print: [-6, -6.5, 12, 13.5]
  },
  hoodie: {
    cat: "wear", label: "Hoodie", kind: "cloth", fin: ["fblack", "heather", "fnavy", "fsage", "fwhite"], def: "heather", wear: true, covers: ["front", "chest", "back", "frontback"],
    sizes: [{ id: "std", label: "Pullover hoodie", price: 45, link: "hoodie" }], shape: "hoodie", print: [-5.8, -3.6, 11.6, 11]
  },
  tote: {
    cat: "wear", label: "Tote bag", kind: "cloth", fin: ["natural", "fblack"], def: "natural", covers: ["front", "both"],
    sizes: [{ id: "std", label: "15×16 in", price: 20, link: "tote" }], shape: "tote", print: [-5.5, -6, 11, 11]
  },
  apron: {
    cat: "wear", label: "Apron", kind: "cloth", fin: ["fblack", "natural", "fnavy"], def: "fblack", covers: ["front", "chest"],
    sizes: [{ id: "adult", label: "Adult", price: 25, link: "apron" }], shape: "apron", print: [-4.3, 3, 8.6, 9.6]
  },
  keychain: {
    cat: "mini", label: "Acrylic keychain", kind: "slab", fin: ["clear", "frosted"], def: "clear", covers: ["full", "center"], back: true, thick: 0.12, ring: true, sway: true,
    sizes: [{ id: "2in", label: "2 in", price: 12, link: "keychain", d: [2, 2] }], shapes: [{ id: "circle", label: "Circle" }, { id: "heart", label: "Heart" }, { id: "tag", label: "Dog tag" }]
  },
  magnet: {
    cat: "mini", label: "Fridge magnet", kind: "slab", fin: ["mwhite"], def: "mwhite", covers: ["full", "center"], thick: 0.1, r: 0.2, magnet: true, sway: true,
    sizes: [{ id: "std", label: "3.5×2.4 in", price: 8, link: "magnet", d: [3.5, 2.4] }], shapes: [{ id: "rect", label: "Rectangle" }, { id: "round", label: "Round" }]
  },
  phone: {
    cat: "mini", label: "Phone case", kind: "slab", fin: ["pblack", "pwhite", "clear"], def: "pblack", covers: ["full", "center"], phone: true, sway: true,
    sizes: [{ id: "std", label: "Hard case", price: 25, link: "phone" }]
  },
  plate: {
    cat: "mini", label: "Desk name plate", kind: "slab", fin: ["clear", "pwhite", "pblack"], def: "clear", covers: ["center"], thick: 0.22, r: 0.12, base: true,
    sizes: [{ id: "8x2", label: "8×2.5 in", price: 25, link: "plate82", d: [8, 2.6] }, { id: "10x3", label: "10×3 in", price: 30, link: "plate103", d: [10, 3] }]
  }
};
const CAT_DEFAULT = { drink: "tumbler", photo: "block", wear: "tee", mini: "keychain" };
const COVER_LABEL = {
  wrap: "Full wrap", front: "Front only", frontback: "Front + name on back", full: "Edge to edge", center: "Centred design",
  chest: "Left chest", back: "Back only", both: "Both sides"
};
const WEAR_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

/* phone models: body size in inches + camera layout */
const PHONES = [
  ["Apple", [["iPhone 17 Pro Max", 3.07, 6.43, "plateau"], ["iPhone 17 Pro", 2.83, 5.91, "plateau"], ["iPhone Air", 2.94, 6.15, "air"], ["iPhone 17", 2.83, 5.96, "pill2"],
    ["iPhone 16 Pro Max", 3.06, 6.42, "tri3"], ["iPhone 16 Pro", 2.81, 5.89, "tri3"], ["iPhone 16 Plus", 3.07, 6.33, "pill2"], ["iPhone 16", 2.82, 5.81, "pill2"],
    ["iPhone 15 Pro Max", 3.02, 6.29, "tri3"], ["iPhone 15 Pro", 2.78, 5.77, "tri3"], ["iPhone 15", 2.82, 5.81, "diag2"], ["iPhone 14", 2.82, 5.78, "diag2"], ["iPhone 13", 2.82, 5.78, "diag2"]]],
  ["Samsung", [["Galaxy S26 Ultra", 3.07, 6.44, "samU"], ["Galaxy S26", 2.83, 5.91, "sam3"], ["Galaxy S25 Ultra", 3.06, 6.41, "samU"], ["Galaxy S25", 2.78, 5.78, "sam3"], ["Galaxy S24", 2.78, 5.79, "sam3"]]],
  ["Google", [["Pixel 10 Pro", 2.83, 6.02, "pixel3"], ["Pixel 10", 2.83, 6.02, "pixel2"], ["Pixel 9 Pro", 2.83, 6.02, "pixel3"], ["Pixel 9", 2.83, 6.02, "pixel2"], ["Pixel 8", 2.79, 5.93, "pixel2"]]],
  ["Other", [["Other model (tell us in notes)", 2.85, 5.95, "diag2"]]]
];
const PHONE_BY = {};
PHONES.forEach(([, list]) => list.forEach((m) => { PHONE_BY[m[0]] = { w: m[1], h: m[2], cam: m[3] }; }));

/* ---------------- state ---------------- */
const S = {
  product: "tumbler", size: "20oz", shape: "", model: "iPhone 17 Pro", orient: "land", finish: "black", wear: "M", cover: "wrap",
  design: "mountains", target: "img", editFace: "front", mode: "3d", repeat: false
};
let layers = [];
let spec = null;
let photo = null, photoCut = null, photoFile = null;

const cur = () => P[S.product];
const sizeObj = () => cur().sizes.find((s) => s.id === S.size) || cur().sizes[0];
const finish = () => F[S.finish] || F[cur().def];
const val = (n) => { const el = root.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ""; };
const setVal = (n, v) => { const el = root.querySelector('input[name="' + n + '"][value="' + v + '"]'); if (el) el.checked = true; return !!el; };

/* ---------------- shapes ---------------- */
function rrectShape(w, h, r, cx = 0, cy = 0) {
  const s = new THREE.Shape(), x = cx - w / 2, y = cy - h / 2;
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function rrectPath(x, y, w, h, r) { /* hole path (clockwise) */
  const p = new THREE.Path(); r = Math.min(r, w / 2, h / 2);
  p.moveTo(x + r, y); p.quadraticCurveTo(x, y, x, y + r); p.lineTo(x, y + h - r); p.quadraticCurveTo(x, y + h, x + r, y + h);
  p.lineTo(x + w - r, y + h); p.quadraticCurveTo(x + w, y + h, x + w, y + h - r); p.lineTo(x + w, y + r); p.quadraticCurveTo(x + w, y, x + w - r, y); p.lineTo(x + r, y);
  return p;
}
function circleShape(r) { const s = new THREE.Shape(); s.absarc(0, 0, r, 0, Math.PI * 2, false); return s; }
function holePath(x, y, r) { const h = new THREE.Path(); h.absarc(x, y, r, 0, Math.PI * 2, true); return h; }
function heartShape(w) {
  const k = w / 2, s = new THREE.Shape();
  s.moveTo(0, -k * 0.95);
  s.bezierCurveTo(-k * 0.2, -k * 0.7, -k * 1.0, -k * 0.2, -k * 1.0, k * 0.25);
  s.bezierCurveTo(-k * 1.0, k * 0.78, -k * 0.42, k * 1.02, 0, k * 0.6);
  s.bezierCurveTo(k * 0.42, k * 1.02, k * 1.0, k * 0.78, k * 1.0, k * 0.25);
  s.bezierCurveTo(k * 1.0, -k * 0.2, k * 0.2, -k * 0.7, 0, -k * 0.95);
  return s;
}
function slateShape(w, h, inset) {
  const s = new THREE.Shape(); let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const n = 72, per = 2 * (w + h), pts = [];
  for (let i = 0; i < n; i++) {
    const d = (i / n) * per; let x, y;
    if (d < w) { x = -w / 2 + d; y = -h / 2; } else if (d < w + h) { x = w / 2; y = -h / 2 + (d - w); }
    else if (d < 2 * w + h) { x = w / 2 - (d - w - h); y = h / 2; } else { x = -w / 2; y = h / 2 - (d - 2 * w - h); }
    const j = (rnd() - 0.5) * 0.3 - inset;
    if (Math.abs(Math.abs(y) - h / 2) < 1e-6) y += j * Math.sign(y); else x += j * Math.sign(x);
    pts.push([x, y]);
  }
  s.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach((p) => s.lineTo(p[0], p[1])); s.closePath();
  return s;
}
function pathShape(cmds) { const s = new THREE.Shape(); cmds.forEach((c) => s[c[0]](...c.slice(1))); return s; }
const CLOTH = {
  tee: [["moveTo", -3.6, 13], ["quadraticCurveTo", 0, 10.6, 3.6, 13], ["lineTo", 9.6, 12], ["lineTo", 14.6, 6.4], ["lineTo", 11.3, 3.6], ["lineTo", 9.9, 5.6], ["lineTo", 10.1, -15], ["lineTo", -10.1, -15], ["lineTo", -9.9, 5.6], ["lineTo", -11.3, 3.6], ["lineTo", -14.6, 6.4], ["lineTo", -9.6, 12], ["lineTo", -3.6, 13]],
  hoodie: [["moveTo", -3.6, 13], ["quadraticCurveTo", 0, 11.2, 3.6, 13], ["lineTo", 9.8, 11.6], ["quadraticCurveTo", 13.6, 8, 15.4, -10.2], ["lineTo", 12.3, -11.2], ["lineTo", 10.3, 1.5], ["lineTo", 10.6, -15], ["lineTo", -10.6, -15], ["lineTo", -10.3, 1.5], ["lineTo", -12.3, -11.2], ["lineTo", -15.4, -10.2], ["quadraticCurveTo", -13.6, 8, -9.8, 11.6], ["lineTo", -3.6, 13]],
  tote: null,
  apron: [["moveTo", -5, 14], ["lineTo", 5, 14], ["quadraticCurveTo", 6, 4, 11, 2], ["lineTo", 11, -16], ["lineTo", -11, -16], ["lineTo", -11, 2], ["quadraticCurveTo", -6, 4, -5, 14]]
};
const HOOD = [["moveTo", -6.2, 12.2], ["quadraticCurveTo", -6.8, 19.8, 0, 20.2], ["quadraticCurveTo", 6.8, 19.8, 6.2, 12.2], ["quadraticCurveTo", 0, 10.4, -6.2, 12.2]];
const POCKET = [["moveTo", -6.4, -5], ["lineTo", 6.4, -5], ["lineTo", 8, -12.5], ["lineTo", -8, -12.5], ["lineTo", -6.4, -5]];

/* camera layouts: offsets from the case's top-left corner (inches, y down) */
function camLayout(kind, cw) {
  switch (kind) {
    case "diag2": return { cut: [0.14, 0.14, 1.22, 1.22, 0.32], island: true, lens: [[0.45, 0.45, 0.24], [0.9, 0.9, 0.24]], flash: [0.92, 0.42] };
    case "pill2": return { cut: [0.16, 0.16, 0.8, 1.42, 0.4], island: true, lens: [[0.56, 0.56, 0.24], [0.56, 1.18, 0.24]], flash: [1.2, 0.56] };
    case "tri3": return { cut: [0.12, 0.12, 1.52, 1.52, 0.36], island: true, lens: [[0.5, 0.5, 0.28], [0.5, 1.24, 0.28], [1.16, 0.87, 0.28]], flash: [1.18, 0.4] };
    case "plateau": return { cut: [0.1, 0.1, cw - 0.2, 1.6, 0.36], island: true, lens: [[0.5, 0.52, 0.28], [0.5, 1.24, 0.28], [1.14, 0.88, 0.28]], flash: [cw - 0.55, 0.62] };
    case "air": return { cut: [0.12, 0.14, cw - 0.24, 0.9, 0.45], island: true, lens: [[0.62, 0.59, 0.27]], flash: [1.32, 0.59] };
    case "sam3": return { cut: [0.2, 0.2, 0.66, 2.0, 0.33], island: false, lens: [[0.53, 0.55, 0.25], [0.53, 1.2, 0.25], [0.53, 1.85, 0.25]], flash: [1.05, 0.55] };
    case "samU": return { cut: [0.2, 0.2, 1.22, 2.0, 0.33], island: false, lens: [[0.53, 0.55, 0.26], [0.53, 1.2, 0.26], [0.53, 1.85, 0.26], [1.08, 0.62, 0.17], [1.08, 1.15, 0.17]], flash: [1.08, 1.62] };
    case "pixel2": return { cut: [0.22, 0.7, cw - 0.44, 0.7, 0.35], island: true, lens: [[0.75, 1.05, 0.22], [1.25, 1.05, 0.22]], flash: [cw - 0.75, 1.05] };
    case "pixel3": return { cut: [0.22, 0.7, cw - 0.44, 0.7, 0.35], island: true, lens: [[0.72, 1.05, 0.22], [1.2, 1.05, 0.22], [1.68, 1.05, 0.22]], flash: [cw - 0.72, 1.05] };
    default: return camLayout("diag2", cw);
  }
}

/* returns { body shape, print shape, w, h } for flat items */
function slabShapes(p) {
  const sz = sizeObj(); let d = (sz.d || [2, 2]).slice();
  if (p.orient && S.orient === "port") d = [d[1], d[0]];
  let w = d[0], h = d[1];
  if (p.phone) {
    const m = PHONE_BY[S.model] || PHONE_BY["iPhone 17 Pro"];
    w = m.w + 0.14; h = m.h + 0.14;
    const L = camLayout(m.cam, w), [cx, cy, cwid, chei, cr] = L.cut;
    const ps = rrectShape(w - 0.14, h - 0.14, 0.4);
    ps.holes.push(rrectPath(-w / 2 + cx - 0.06, h / 2 - cy - chei - 0.06, cwid + 0.12, chei + 0.12, cr + 0.06));
    return { body: rrectShape(w, h, 0.47), print: ps, w, h, cam: L };
  }
  const shp = S.shape;
  if (S.product === "keychain") {
    if (shp === "heart") { const b = heartShape(2.2); b.holes.push(holePath(0, 0.46, 0.1)); const pr = heartShape(2.08); pr.holes.push(holePath(0, 0.46, 0.2)); return { body: b, print: pr, w: 2.2, h: 2.1, hole: [0, 0.46] }; }
    if (shp === "tag") { const b = rrectShape(1.3, 2.2, 0.32); b.holes.push(holePath(0, 0.85, 0.1)); const pr = rrectShape(1.22, 2.12, 0.28); pr.holes.push(holePath(0, 0.85, 0.2)); return { body: b, print: pr, w: 1.3, h: 2.2, hole: [0, 0.85] }; }
    const b = circleShape(1); b.holes.push(holePath(0, 0.8, 0.11)); const pr = circleShape(0.95); pr.holes.push(holePath(0, 0.8, 0.2)); return { body: b, print: pr, w: 2, h: 2, hole: [0, 0.8] };
  }
  if (S.product === "ornament") {
    if (shp === "heart") { const b = heartShape(3.5); b.holes.push(holePath(0, 0.75, 0.1)); const pr = heartShape(3.36); pr.holes.push(holePath(0, 0.75, 0.2)); return { body: b, print: pr, w: 3.5, h: 3.4, hole: [0, 0.75] }; }
    const b = circleShape(1.65); b.holes.push(holePath(0, 1.38, 0.1)); const pr = circleShape(1.56); pr.holes.push(holePath(0, 1.38, 0.2)); return { body: b, print: pr, w: 3.3, h: 3.3, hole: [0, 1.38] };
  }
  if ((S.product === "coasters" || S.product === "magnet") && shp === "round") {
    const r = S.product === "magnet" ? 1.5 : 2; return { body: circleShape(r), print: circleShape(r - 0.03), w: r * 2, h: r * 2 };
  }
  if (finish().type === "slate") return { body: slateShape(w, h, 0), print: slateShape(w, h, 0.1), w, h };
  const bleed = p.covers.indexOf("full") >= 0;
  return { body: rrectShape(w, h, p.r || 0.05), print: bleed ? rrectShape(w - 0.04, h - 0.04, Math.max(0.02, (p.r || 0.05) - 0.02)) : rrectShape(w - 0.5, h - 0.4, 0.05), w, h, inset: !bleed };
}

/* ---------------- textures ---------------- */
const texCache = {};
function canvasTex(key, size, draw, srgb = true, rep = 1) {
  if (texCache[key]) return texCache[key];
  const c = document.createElement("canvas"); c.width = c.height = size; draw(c.getContext("2d"), size);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.userData.canvas = c;
  return (texCache[key] = t);
}
const woodTex = () => canvasTex("wood", 512, (x) => {
  x.fillStyle = "#c89a63"; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 110; i++) {
    const y0 = Math.random() * 512, a = 3 + Math.random() * 9, f = 0.004 + Math.random() * 0.01;
    x.strokeStyle = `rgba(${110 + Math.random() * 40 | 0},${70 + Math.random() * 25 | 0},35,${0.12 + Math.random() * 0.25})`;
    x.lineWidth = 0.6 + Math.random() * 2.4; x.beginPath();
    for (let px = 0; px <= 512; px += 8) { const py = y0 + Math.sin(px * f + i) * a; px ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.stroke();
  }
}, true, 0.22);
const slateTex = () => canvasTex("slate", 512, (x) => {
  x.fillStyle = "#383c42"; x.fillRect(0, 0, 512, 512);
  for (let j = 0; j < 12000; j++) { const g = 48 + Math.random() * 44 | 0; x.fillStyle = `rgba(${g},${g + 3},${g + 8},0.5)`; x.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 3, 1 + Math.random() * 2); }
  for (let k = 0; k < 50; k++) { x.strokeStyle = "rgba(92,98,106,0.35)"; x.lineWidth = 1; x.beginPath(); const yy = Math.random() * 512; x.moveTo(0, yy); x.lineTo(512, yy + (Math.random() - 0.5) * 40); x.stroke(); }
}, true, 0.25);
const speckleTex = () => canvasTex("speckle", 256, (x) => {
  const d = x.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) { const v = 200 + Math.random() * 55; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0);
}, false, 6);
const brushedTex = () => canvasTex("brushed", 256, (x) => {
  x.fillStyle = "#b0b0b0"; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { const v = 140 + Math.random() * 110 | 0; x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(0, Math.random() * 256, 256, 0.6 + Math.random()); }
}, false, 3);
const weaveTex = () => canvasTex("weave", 128, (x, n) => {
  /* normal map of a simple plain weave */
  const d = x.createImageData(n, n);
  for (let yy = 0; yy < n; yy++) for (let xx = 0; xx < n; xx++) {
    const cell = 8, u = xx % cell, v = yy % cell, alt = ((xx / cell | 0) + (yy / cell | 0)) % 2;
    const nx = alt ? Math.sin((u / cell) * Math.PI * 2) * 0.5 : 0, ny = alt ? 0 : Math.sin((v / cell) * Math.PI * 2) * 0.5;
    const i = (yy * n + xx) * 4;
    d.data[i] = (nx * 0.5 + 0.5) * 255; d.data[i + 1] = (ny * 0.5 + 0.5) * 255; d.data[i + 2] = 255; d.data[i + 3] = 255;
  }
  x.putImageData(d, 0, 0);
}, false, 40);

function makeMat(f, extra = {}) {
  const col = new THREE.Color(f.c || "#ffffff");
  switch (f.type) {
    case "powder": return new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.62, roughnessMap: speckleTex(), metalness: 0, clearcoat: 0.18, clearcoatRoughness: 0.45, ...extra });
    case "steel": return new THREE.MeshPhysicalMaterial({ color: col, metalness: 1, roughness: 0.3, roughnessMap: brushedTex(), anisotropy: 0.7, ...extra });
    case "ceramic": return new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.04, side: THREE.DoubleSide, ...extra });
    case "glass": return new THREE.MeshPhysicalMaterial({ color: col, metalness: 0, roughness: 0.03, transmission: 1, thickness: 0.15, ior: 1.5, side: THREE.DoubleSide, ...extra });
    case "acrylic": return new THREE.MeshPhysicalMaterial({ color: col, metalness: 0, roughness: f.frost ? 0.42 : 0.02, transmission: 1, thickness: extra.thickness || 0.2, ior: 1.49, ...extra });
    case "wood": return new THREE.MeshPhysicalMaterial({ map: woodTex(), roughness: 0.62, clearcoat: 0.15, ...extra });
    case "slate": return new THREE.MeshPhysicalMaterial({ map: slateTex(), bumpMap: slateTex(), bumpScale: 1.5, roughness: 0.82, ...extra });
    case "plastic": return new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.3, ...extra });
    case "fabric": return new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.96, sheen: f.dark ? 0.25 : 0.5, sheenRoughness: 0.8, sheenColor: col.clone().lerp(new THREE.Color("#ffffff"), 0.35), normalMap: weaveTex(), normalScale: new THREE.Vector2(0.35, 0.35), side: THREE.DoubleSide, ...extra });
    default: return new THREE.MeshStandardMaterial({ color: col, ...extra });
  }
}
const std = (c, r, m = 0) => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(c), roughness: r, metalness: m, clearcoat: m ? 0 : 0.3 });

/* ---------------- design faces (print canvases) ---------------- */
function makeFace() {
  const cv = document.createElement("canvas"); cv.width = 2048; cv.height = 2048;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, ctx: cv.getContext("2d"), tex };
}
const faces = { front: makeFace(), back: makeFace() };

const FONT = {
  bold: (s) => `800 ${s}px "Bricolage Grotesque", "Arial Black", system-ui, sans-serif`,
  script: (s) => `700 ${s}px "Dancing Script", "Brush Script MT", cursive`,
  classic: (s) => `700 ${s}px "Playfair Display", Georgia, "Times New Roman", serif`,
  type: (s) => `500 ${s}px "IBM Plex Mono", "Courier New", monospace`
};
const INK_NAMES = { "#ffffff": "White", "#14181f": "Black", "#c9a24b": "Gold tone", "#1e6b4f": "Spruce", "#e6007e": "Pink" };
const DESIGN_NAMES = { photo: "Customer photo or logo", mountains: "Mountains", flowers: "Wildflowers", sunset: "Retro sunset", monogram: "Monogram", name: "Text only" };

function inkColour() {
  const v = val("to-ink");
  if (v === "custom") return $("to-ink-custom").value;
  if (v && v !== "auto") return v;
  const f = finish();
  if (S.design === "photo" && photo && spec && spec.fullCover) return "#ffffff";
  if (f.type === "glass" || f.type === "acrylic") return "#14181f";
  return f.dark ? "#ffffff" : "#14181f";
}
const text1 = () => $("to-name").value.trim();
const text2 = () => $("to-name2").value.trim();

/* preset artwork rendered once per ink colour, then treated like a photo layer */
const presetCache = {};
function presetCanvas(d, ink) {
  const key = d + ink + (d === "monogram" ? (text1()[0] || "S") + val("to-font") : "");
  if (presetCache[key]) return presetCache[key];
  const dims = { mountains: [1600, 1000], flowers: [1600, 900], sunset: [1200, 900], monogram: [1000, 1000] }[d];
  const c = document.createElement("canvas"); c.width = dims[0]; c.height = dims[1];
  const x = c.getContext("2d"), w = c.width, h = c.height, s = Math.min(w, h);
  x.lineJoin = "round"; x.lineCap = "round";
  if (d === "mountains") {
    const lw = s * 0.022; x.strokeStyle = ink; x.fillStyle = ink; x.lineWidth = lw;
    x.beginPath(); x.arc(w * 0.68, h * 0.28, s * 0.12, 0, Math.PI * 2); x.stroke();
    const pk = [[0, 0.64], [0.1, 0.42], [0.2, 0.58], [0.33, 0.3], [0.46, 0.6], [0.58, 0.38], [0.72, 0.62], [0.84, 0.4], [1, 0.62]];
    x.beginPath(); pk.forEach((p, i) => { const px = w * p[0], py = h * p[1]; i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke();
    const base = h * 0.84, n = 15;
    for (let i = 0; i < n; i++) { const tx = w * (i + 0.5) / n, th = h * (0.17 + ((i * 37) % 7) * 0.018), tw = th * 0.5; x.beginPath(); x.moveTo(tx, base - th); x.lineTo(tx + tw / 2, base); x.lineTo(tx - tw / 2, base); x.closePath(); x.fill(); }
    x.beginPath(); x.moveTo(w * 0.02, base + lw); x.lineTo(w * 0.98, base + lw); x.stroke();
  } else if (d === "flowers") {
    const cols = ["#e6007e", "#ffd400", "#00a3e0", "#ff5a36", "#f39ac0"], n = 11;
    for (let i = 0; i < n; i++) {
      const fx = w * (i + 0.5) / n, top = h * (0.12 + ((i * 29) % 5) * 0.09), r = s * (0.07 + ((i * 17) % 3) * 0.014);
      x.strokeStyle = "#3f8f5f"; x.lineWidth = s * 0.012; x.beginPath(); x.moveTo(fx, h); x.quadraticCurveTo(fx + r, h * 0.6, fx, top); x.stroke();
      x.fillStyle = "#55a873"; x.beginPath(); x.ellipse(fx + r * 0.7, h * 0.74, r * 0.6, r * 0.22, -0.6, 0, Math.PI * 2); x.fill();
      x.fillStyle = cols[i % cols.length];
      for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; x.beginPath(); x.arc(fx + Math.cos(a) * r * 0.7, top + Math.sin(a) * r * 0.7, r * 0.55, 0, Math.PI * 2); x.fill(); }
      x.fillStyle = "#ffffff"; x.beginPath(); x.arc(fx, top, r * 0.35, 0, Math.PI * 2); x.fill();
    }
  } else if (d === "sunset") {
    const cx = w / 2, cy = h * 0.66, r = s * 0.46;
    x.save(); x.beginPath(); x.arc(cx, cy, r, Math.PI, 0); x.closePath(); x.clip();
    ["#ffd400", "#ffb000", "#ff7a2e", "#ff5a36", "#e6007e"].forEach((c2, i) => { x.fillStyle = c2; x.fillRect(cx - r, cy - r + (i * r) / 5, r * 2, r / 5 - (i ? s * 0.012 * i : 0)); });
    x.restore(); x.strokeStyle = ink; x.lineWidth = s * 0.02;
    for (let j = 0; j < 3; j++) { const yy = cy + s * 0.06 + j * s * 0.08, ww = r * (1.3 - j * 0.3); x.beginPath(); x.moveTo(cx - ww, yy); x.lineTo(cx + ww, yy); x.stroke(); }
  } else if (d === "monogram") {
    const cx = w / 2, cy = h / 2, r = s * 0.45; x.strokeStyle = ink; x.fillStyle = ink;
    x.lineWidth = s * 0.02; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.stroke();
    x.lineWidth = s * 0.008; x.beginPath(); x.arc(cx, cy, r * 0.9, 0, Math.PI * 2); x.stroke();
    for (let side = -1; side <= 1; side += 2) for (let k = 0; k < 5; k++) { const a = Math.PI / 2 + side * (0.5 + k * 0.22); x.beginPath(); x.ellipse(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78, s * 0.035, s * 0.014, a + side * 0.9, 0, Math.PI * 2); x.fill(); }
    x.textAlign = "center"; x.textBaseline = "middle"; x.font = (FONT[val("to-font")] || FONT.bold)(Math.round(r * 1.05));
    x.fillText((text1()[0] || "S").toUpperCase(), cx, cy + r * 0.05);
  }
  return (presetCache[key] = c);
}
function imgSource() {
  if (S.design === "photo") return photo ? ($("to-cutout").checked && photoCut ? photoCut : photo) : null;
  if (S.design === "name") return null;
  return presetCanvas(S.design, inkColour());
}
const srcAspect = () => { const s = imgSource(); return s ? s.width / s.height : 4 / 3; };

/* ---------------- spec of the printable area ---------------- */
let slabInfo = null;
function computeSpec() {
  const p = cur(), sz = sizeObj();
  const sp = { kind: p.kind, wrap: false, faces: ["front"], gap: null, outline: null, fullCover: false, panel: 0.9, mirror: false };
  if (p.kind === "lathe") {
    const g = sz.g, n = 24; let rs = 0;
    for (let i = 0; i <= n; i++) rs += radiusAt(g.body, g.zone[0] + ((g.zone[1] - g.zone[0]) * i) / n) + 0.012;
    sp.W = (2 * Math.PI * rs) / (n + 1); sp.H = g.zone[1] - g.zone[0];
    sp.wrap = true; sp.panel = g.panel; sp.gap = g.gap ? [0.75, g.gap] : null;
    sp.fullCover = S.cover === "wrap";
  } else if (p.kind === "slab") {
    slabInfo = slabShapes(p);
    const pts = slabInfo.print.extractPoints(32);
    let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    pts.shape.forEach((v) => { minx = Math.min(minx, v.x); maxx = Math.max(maxx, v.x); miny = Math.min(miny, v.y); maxy = Math.max(maxy, v.y); });
    sp.rect = [minx, miny, maxx - minx, maxy - miny]; sp.W = sp.rect[2]; sp.H = sp.rect[3];
    const norm = (v) => [(v.x - minx) / sp.W, 1 - (v.y - miny) / sp.H];
    sp.outline = { outer: pts.shape.map(norm), holes: pts.holes.map((h) => h.map(norm)) };
    sp.fullCover = S.cover === "full";
  } else {
    sp.rect = p.print; sp.W = p.print[2]; sp.H = p.print[3];
    if (S.cover === "back" || S.cover === "frontback" || S.cover === "both") sp.faces = ["front", "back"];
    sp.mirror = S.cover === "both";
  }
  return sp;
}
function radiusAt(body, y) {
  for (let i = 1; i < body.length; i++) {
    const a = body[i - 1], b = body[i];
    if (b[1] < a[1]) break;
    if (y >= a[1] && y <= b[1] && b[1] > a[1]) return a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]);
  }
  return body[1][0];
}
function sizeFaces() {
  const W = spec.W >= spec.H ? 2048 : Math.round((2048 * spec.W) / spec.H), H = spec.W >= spec.H ? Math.round((2048 * spec.H) / spec.W) : 2048;
  Object.values(faces).forEach((f) => { if (f.cv.width !== W || f.cv.height !== H) { f.cv.width = W; f.cv.height = H; f.tex.dispose(); f.tex = new THREE.CanvasTexture(f.cv); f.tex.colorSpace = THREE.SRGBColorSpace; f.tex.anisotropy = 8; } });
}

/* ---------------- layout (where the photo and text sit) ---------------- */
function boxContainS(box, aspect, W, H) { return Math.min(box.w * W, box.h * H * aspect) / W; }
function coverS(aspect, W, H) { return Math.max(W, H * aspect) / W; }
function resetLayout() {
  const W = faces.front.cv.width, H = faces.front.cv.height, a = srcAspect(), p = cur(), c = S.cover, t = text1() || text2();
  layers = []; S.repeat = false; if ($("ed-repeat")) $("ed-repeat").checked = false;
  const hasImg = S.design !== "name";
  const img = (face, x, y, s) => layers.push({ type: "img", face, x, y, s, s0: s, rot: 0 });
  const txt = (face, x, y, h, maxW, shadow) => layers.push({ type: "text", face, x, y, h, h0: h, maxW, shadow: !!shadow });
  if (p.kind === "lathe") {
    const pw = spec.panel;
    if (!hasImg) { txt("front", 0.5, 0.5, 0.26, c === "wrap" ? 0.9 : pw * 1.05); }
    else if (c === "wrap" && S.design !== "photo") { S.repeat = true; img("front", 0.5, t ? 0.4 : 0.5, boxContainS({ w: 1, h: t ? 0.68 : 0.9 }, a, W, H)); if (t) txt("front", 0.5, 0.86, 0.13, pw * 1.1); }
    else if (c === "wrap") { img("front", 0.5, 0.5, coverS(a, W, H)); if (t) txt("front", 0.5, 0.84, 0.13, pw * 1.1, true); }
    else if (c === "front") { img("front", 0.5, t ? 0.39 : 0.5, boxContainS({ w: pw, h: t ? 0.66 : 0.9 }, a, W, H)); if (t) txt("front", 0.5, 0.85, 0.14, pw * 1.05); }
    else { img("front", 0.5, 0.5, boxContainS({ w: pw, h: 0.9 }, a, W, H)); if (t) txt("front", 0.0, 0.48, 0.17, pw * 1.1); }
  } else if (p.kind === "slab") {
    const plate = S.product === "plate";
    if (!hasImg) txt("front", 0.5, 0.5, plate ? 0.5 : 0.22, 0.86);
    else if (plate) { img("front", 0.16, 0.5, boxContainS({ w: 0.26, h: 0.86 }, a, W, H)); if (t) txt("front", 0.62, 0.5, 0.42, 0.66); }
    else if (c === "full") { img("front", 0.5, 0.5, coverS(a, W, H)); if (t) txt("front", 0.5, 0.84, 0.12, 0.8, S.design === "photo"); }
    else { img("front", 0.5, t ? 0.42 : 0.5, boxContainS({ w: 0.78, h: t ? 0.6 : 0.78 }, a, W, H)); if (t) txt("front", 0.5, 0.84, 0.11, 0.8); }
  } else {
    const big = (face) => { if (hasImg) img(face, 0.5, t ? 0.4 : 0.48, boxContainS({ w: 0.92, h: t ? 0.68 : 0.88 }, a, W, H)); if (t) txt(face, 0.5, hasImg ? 0.86 : 0.45, hasImg ? 0.1 : 0.16, 0.92); };
    if (c === "front" || c === "both") big("front");
    else if (c === "back") big("back");
    else if (c === "chest") { if (hasImg) img("front", 0.76, 0.14, boxContainS({ w: 0.3, h: 0.22 }, a, W, H)); if (t) txt("front", 0.76, hasImg ? 0.3 : 0.16, 0.05, 0.36); }
    else { if (hasImg) img("front", 0.5, 0.45, boxContainS({ w: 0.92, h: 0.88 }, a, W, H)); if (t) txt("back", 0.5, 0.3, 0.15, 0.92); else if (!hasImg) txt("front", 0.5, 0.45, 0.16, 0.92); }
  }
  if ($("ed-repeat")) $("ed-repeat").checked = S.repeat;
  if (!layers.some((l) => l.type === S.target)) S.target = layers[0] ? layers[0].type : "img";
  const sel = layers.find((l) => l.type === S.target);
  S.editFace = sel ? sel.face : "front";
}

/* ---------------- drawing the print faces ---------------- */
function drawFaces() {
  ["front", "back"].forEach((fn) => {
    const f = faces[fn], c = f.ctx, W = f.cv.width, H = f.cv.height;
    c.clearRect(0, 0, W, H);
    if (spec.faces.indexOf(fn) < 0) { f.tex.needsUpdate = true; return; }
    layers.forEach((L) => {
      if (!(L.face === fn || (spec.mirror && L.face === "front"))) return;
      if (L.type === "img") drawImg(c, L, W, H); else drawTxt(c, L, W, H);
    });
    if (spec.gap) {
      const [u, hw] = spec.gap;
      c.save(); c.globalCompositeOperation = "destination-out"; c.fillRect((u - hw) * W, 0, hw * 2 * W, H); c.restore();
    }
    f.tex.needsUpdate = true;
  });
}
function xsFor(cx, w, W) {
  if (!spec.wrap) return [cx];
  if (S.repeat && w > 4) { const xs = []; let x0 = cx - Math.ceil((cx + w / 2) / w) * w; for (let x = x0; x < W + w; x += w) xs.push(x); return xs; }
  return [cx - W, cx, cx + W];
}
function drawImg(c, L, W, H) {
  const src = imgSource(), a = src ? src.width / src.height : 4 / 3;
  const w = L.s * W, h = w / a, cx = L.x * W, cy = L.y * H;
  L.box = { cx, cy, w: L.rot % 180 ? h : w, h: L.rot % 180 ? w : h };
  xsFor(cx, w, W).forEach((x) => {
    c.save(); c.translate(x, cy); c.rotate((L.rot * Math.PI) / 180);
    if (src) {
      if (S.design === "photo" && !$("to-cutout").checked && !spec.fullCover && !spec.wrap) { roundClip(c, -w / 2, -h / 2, w, h, Math.min(w, h) * 0.035); c.clip(); }
      c.drawImage(src, -w / 2, -h / 2, w, h);
    } else {
      const ink = inkColour(), s = Math.min(w, h);
      c.strokeStyle = ink; c.fillStyle = ink; c.globalAlpha = 0.65; c.lineWidth = Math.max(3, s * 0.016); c.setLineDash([s * 0.05, s * 0.035]);
      roundClip(c, -w / 2, -h / 2, w, h, s * 0.05); c.stroke(); c.setLineDash([]);
      c.textAlign = "center"; c.textBaseline = "middle"; c.font = `600 ${Math.round(s * 0.11)}px system-ui, sans-serif`; c.fillText("Your photo", 0, 0);
    }
    c.restore();
  });
}
function roundClip(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
}
function drawTxt(c, L, W, H) {
  const t1 = text1() || (S.design === "name" && !text2() ? "Your name" : ""), t2 = text2(), font = FONT[val("to-font")] || FONT.bold, ink = inkColour();
  let s1 = L.h * H; const maxW = L.maxW * W;
  c.font = font(s1); let w1 = t1 ? c.measureText(t1).width : 0;
  if (w1 > maxW) { s1 *= maxW / w1; c.font = font(s1); w1 = c.measureText(t1).width; }
  let s2 = s1 * (t1 ? 0.42 : 1); c.font = font(s2); let w2 = t2 ? c.measureText(t2).width : 0;
  if (w2 > maxW) { s2 *= maxW / w2; c.font = font(s2); w2 = c.measureText(t2).width; }
  const cx = L.x * W, cy = L.y * H, y1 = t2 && t1 ? cy - s2 * 0.55 : cy, y2 = t1 ? y1 + s1 * 0.62 + s2 * 0.62 : cy;
  L.box = { cx, cy: t1 && t2 ? (y1 - s1 / 2 + y2 + s2 / 2) / 2 : cy, w: Math.max(w1, w2) + 8, h: (t1 ? s1 : 0) + (t2 ? s2 * 1.2 : 0) + 8 };
  (spec.wrap ? [cx - W, cx, cx + W] : [cx]).forEach((x) => {
    c.save(); c.fillStyle = ink; c.textAlign = "center"; c.textBaseline = "middle";
    if (L.shadow) { c.shadowColor = "rgba(0,0,0,0.55)"; c.shadowBlur = s1 * 0.15; c.shadowOffsetY = s1 * 0.03; }
    if (t1) { c.font = font(s1); c.fillText(t1, x, y1); }
    if (t2) { c.font = font(s2); c.fillText(t2, x, y2); }
    c.restore();
  });
}

/* ---------------- 3D ---------------- */
const cvs = $("to-canvas");
let renderer = null;
try { renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch (e) { renderer = null; }
if (!renderer) { cvs.hidden = true; $("to-views").hidden = true; $("to-fallback").hidden = false; }
let scene, camera, group, ground, contact, key;
if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(renderer), 0.04).texture;
  camera = new THREE.PerspectiveCamera(26, 4 / 5, 0.1, 500);
  key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(-4, 9, 6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
  scene.add(key); scene.add(key.target);
  /* photo-studio backdrop: a soft floor that fades into the background, so glass and acrylic have something to show through */
  const BG = new THREE.Color("#eceff3");
  scene.background = BG; scene.fog = new THREE.Fog(BG, 40, 120);
  ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: "#e9ecf0", roughness: 1, metalness: 0 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const sc = document.createElement("canvas"); sc.width = sc.height = 128;
  const sx = sc.getContext("2d"), gr = sx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(0,0,0,0.42)"); gr.addColorStop(0.5, "rgba(0,0,0,0.12)"); gr.addColorStop(1, "rgba(0,0,0,0)");
  sx.fillStyle = gr; sx.fillRect(0, 0, 128, 128);
  contact = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  contact.rotation.x = -Math.PI / 2; contact.position.y = 0.003; scene.add(contact);
  group = new THREE.Group(); scene.add(group);
}
function printMat(face, fabric) {
  const t = faces[face].tex;
  /* alpha-tested (not transparent) so the print also shows through clear acrylic and glass */
  const base = { map: t, alphaTest: 0.04, alphaToCoverage: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide };
  if (fabric) return new THREE.MeshPhysicalMaterial({ ...base, roughness: 0.9, normalMap: weaveTex(), normalScale: new THREE.Vector2(0.3, 0.3) });
  return new THREE.MeshPhysicalMaterial({ ...base, roughness: 0.38, clearcoat: 0.35, clearcoatRoughness: 0.25 });
}
const v2 = (a) => a.map((p) => new THREE.Vector2(p[0], p[1]));
function tube(pts, r, mat) {
  const curve = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(q[0], q[1], q[2] || 0)));
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, r, 20, false), mat); m.castShadow = true; return m;
}
function planeGeo(shape, rect, z, flipU) {
  const g = new THREE.ShapeGeometry(shape, 64), pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) { const u = (pos.getX(i) - rect[0]) / rect[2]; uv.setXY(i, flipU ? 1 - u : u, (pos.getY(i) - rect[1]) / rect[3]); }
  g.translate(0, 0, z); return g;
}
const wrinkle = (x, y) => Math.max(0.02, 0.14 + 0.1 * Math.sin(x * 0.45 + 1.1) * Math.cos(y * 0.18) + 0.07 * Math.sin(x * 0.15 - y * 0.33 + 0.6) + 0.04 * Math.sin(x * 1.1 + y * 0.5));

let builtKey = "", mode = "spin";
function build() {
  if (!renderer) return;
  const p = cur(), sz = sizeObj(), f = finish();
  const k = [S.product, S.size, S.shape, S.model, S.orient, S.finish, S.cover].join("|");
  if (k === builtKey) return;
  builtKey = k;
  group.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  while (group.children.length) group.remove(group.children[0]);
  const obj = new THREE.Group(); group.add(obj);
  let elev = 0.12;
  const shadowAll = (o) => o.traverse((m) => { if (m.isMesh && !m.material.transparent) { m.castShadow = true; m.receiveShadow = true; } });

  if (p.kind === "lathe") {
    const g = sz.g, body = new THREE.Mesh(new THREE.LatheGeometry(v2(g.body), 160), makeMat(f));
    obj.add(body);
    const zp = []; const n = 32;
    for (let i = 0; i <= n; i++) { const y = g.zone[0] + ((g.zone[1] - g.zone[0]) * i) / n; zp.push(new THREE.Vector2(radiusAt(g.body, y) + 0.012, y)); }
    const pr = new THREE.Mesh(new THREE.LatheGeometry(zp, 160, Math.PI, Math.PI * 2), printMat("front")); pr.renderOrder = 2; obj.add(pr);
    if (g.rim && f.type !== "steel") {
      const rp = []; for (let i = 0; i <= 6; i++) { const y = g.rim[0] + ((g.rim[1] - g.rim[0]) * i) / 6; rp.push(new THREE.Vector2(radiusAt(g.body, y) + 0.006, y)); }
      obj.add(new THREE.Mesh(new THREE.LatheGeometry(rp, 160), makeMat(F.steel)));
    }
    if (g.lid) obj.add(new THREE.Mesh(new THREE.LatheGeometry(v2(g.lid), 160), g.lidSteel ? makeMat(F.steel) : std("#1e2024", 0.36)));
    if (g.straw) {
      const s = g.straw, st = new THREE.Mesh(new THREE.CylinderGeometry(s.r, s.r, s.y1 - s.y0, 32, 1, true),
        new THREE.MeshPhysicalMaterial({ color: "#eef3f7", roughness: 0.08, transmission: 0.92, thickness: 0.05, ior: 1.45, side: THREE.DoubleSide }));
      st.position.set(s.x, (s.y0 + s.y1) / 2, -0.15); st.rotation.z = -0.06; obj.add(st);
    }
    if (g.handle) obj.add(tube(g.handle.pts, g.handle.r, body.material));
    shadowAll(obj);
  }

  if (p.kind === "slab") {
    const info = slabInfo || slabShapes(p), t = p.phone ? 0.38 : p.thick, bev = Math.min(0.05, t * 0.25);
    const bodyMat = makeMat(f, { thickness: t });
    const eg = new THREE.ExtrudeGeometry(info.body, { depth: t - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 64 });
    eg.translate(0, 0, -(t - 2 * bev) / 2);
    const rect = spec.rect;
    const piece = new THREE.Group(), count = sz.n || 1, cols = count === 6 ? 3 : 2;
    for (let q = 0; q < count; q++) {
      const tile = new THREE.Group(), bm = new THREE.Mesh(eg, bodyMat);
      const zf = p.back ? -t / 2 + 0.004 : t / 2 + 0.006;
      const pm = new THREE.Mesh(planeGeo(info.print, rect, zf), printMat("front"));
      if (f.type === "acrylic" || f.type === "glass") { bm.renderOrder = p.back ? 2 : 1; pm.renderOrder = p.back ? 1 : 3; }
      tile.add(bm); tile.add(pm);
      if (p.flat) {
        const cork = new THREE.Mesh(new THREE.ExtrudeGeometry(info.body, { depth: 0.06, bevelEnabled: false, curveSegments: 48 }), std("#a87a4f", 0.95)); cork.scale.set(0.98, 0.98, 1);
        cork.position.z = -t / 2 - 0.06; tile.add(cork);
        tile.rotation.x = -Math.PI / 2;
        const col = q % cols, row = Math.floor(q / cols), gapx = info.w + 0.25, gapz = info.h + 0.25;
        tile.position.set((col - (cols - 1) / 2) * gapx, t / 2 + 0.07, (row - 0.5) * gapz);
      }
      if (p.magnet) { const mg = new THREE.Mesh(new THREE.ExtrudeGeometry(info.body, { depth: 0.04, bevelEnabled: false }), std("#2a2a2a", 0.85)); mg.scale.set(0.97, 0.97, 1); mg.position.z = -t / 2 - 0.04; tile.add(mg); }
      piece.add(tile);
    }
    if (info.cam) {
      const L = info.cam, w = info.w, h = info.h, [cx, cy, cw, ch, cr] = L.cut;
      const x0 = -w / 2 + cx, y0 = h / 2 - cy;
      const back = new THREE.Mesh(new THREE.ExtrudeGeometry(rrectShape(cw, ch, cr, x0 + cw / 2, y0 - ch / 2), { depth: 0.02, bevelEnabled: false }), std("#2b2d31", 0.5, 0.2));
      back.position.z = t / 2 - 0.08; piece.add(back);
      if (L.island) {
        const isl = new THREE.Mesh(new THREE.ExtrudeGeometry(rrectShape(cw - 0.1, ch - 0.1, Math.max(0.05, cr - 0.05), x0 + cw / 2, y0 - ch / 2), { depth: 0.07, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 }),
          new THREE.MeshPhysicalMaterial({ color: f.type === "plastic" && !f.dark ? "#d8dadd" : "#24262a", roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05 }));
        isl.position.z = t / 2 - 0.06; piece.add(isl);
      }
      L.lens.forEach(([lx, ly, lr]) => {
        const glass = new THREE.Mesh(new THREE.CylinderGeometry(lr * 0.78, lr * 0.78, 0.1, 48), new THREE.MeshPhysicalMaterial({ color: "#07080a", roughness: 0.05, metalness: 0.2, clearcoat: 1 }));
        glass.rotation.x = Math.PI / 2; glass.position.set(-w / 2 + lx, h / 2 - ly, t / 2 + 0.06); piece.add(glass);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(lr * 0.86, lr * 0.12, 16, 48), makeMat(F.steel)); ring.position.set(-w / 2 + lx, h / 2 - ly, t / 2 + 0.1); piece.add(ring);
      });
      const fl = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 24), std("#f3efe2", 0.3)); fl.rotation.x = Math.PI / 2; fl.position.set(-w / 2 + L.flash[0], h / 2 - L.flash[1], t / 2 + 0.03); piece.add(fl);
    }
    if (p.ring && info.hole) { const rg = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.035, 16, 64), makeMat(F.steel)); rg.rotation.y = Math.PI / 2; rg.position.set(info.hole[0], info.hole[1] + 0.36, 0); piece.add(rg); }
    if (p.ribbon && info.hole) { const rb = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.06, 16, 64), std("#b3122e", 0.6)); rb.rotation.y = Math.PI / 2; rb.position.set(info.hole[0], info.hole[1] + 0.45, 0); piece.add(rb); }
    if (p.flat) { elev = 0.85; obj.add(piece); }
    else {
      const holder = new THREE.Group(); holder.add(piece);
      if (p.lean) holder.rotation.x = -p.lean;
      const lift = p.base ? 0.55 : p.easel ? 0.15 : p.ring || p.ribbon ? 0.9 : 0.05;
      const bb = new THREE.Box3().setFromObject(piece);
      holder.position.y = -bb.min.y + lift - (p.ring || p.ribbon ? 0 : 0);
      obj.add(holder);
      if (p.base) { const base = new THREE.Mesh(new THREE.BoxGeometry(info.w + 0.8, 0.8, 1.4), makeMat(F.wood)); base.position.y = 0.4; obj.add(base); }
      if (p.easel) [-1, 1].forEach((s) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.6, 0.12), std("#1b1c1f", 0.5)); leg.position.set(s * info.w * 0.28, 0.75, -0.75); leg.rotation.x = 0.5; obj.add(leg);
        const lip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.55), std("#1b1c1f", 0.5)); lip.position.set(s * info.w * 0.28, 0.09, 0.05); obj.add(lip);
      });
    }
    shadowAll(obj);
  }

  if (p.kind === "cloth") {
    const shape = p.shape === "tote" ? rrectShape(15, 16, 0.3) : pathShape(CLOTH[p.shape]);
    const pts = shape.extractPoints(64).shape;
    let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    pts.forEach((v) => { minx = Math.min(minx, v.x); maxx = Math.max(maxx, v.x); miny = Math.min(miny, v.y); maxy = Math.max(maxy, v.y); });
    const bw = maxx - minx, bh = maxy - miny, depth = 0.45;
    const ac = document.createElement("canvas"); ac.width = 512; ac.height = Math.round((512 * bh) / bw);
    const ax = ac.getContext("2d"); ax.fillStyle = "#000"; ax.fillRect(0, 0, ac.width, ac.height); ax.fillStyle = "#fff"; ax.beginPath();
    pts.forEach((v, i) => { const px = ((v.x - minx) / bw) * ac.width, py = (1 - (v.y - miny) / bh) * ac.height; i ? ax.lineTo(px, py) : ax.moveTo(px, py); }); ax.closePath(); ax.fill();
    const alpha = new THREE.CanvasTexture(ac);
    const fab = makeMat(f, { alphaMap: alpha, alphaTest: 0.5 });
    const surf = (sign) => {
      const g = new THREE.PlaneGeometry(bw, bh, 90, 110); g.translate(minx + bw / 2, miny + bh / 2, 0);
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i); pos.setZ(i, sign > 0 ? wrinkle(x, y) : -depth - wrinkle(x * 0.9 + 3, y)); }
      g.computeVertexNormals(); return g;
    };
    obj.add(new THREE.Mesh(surf(1), fab)); obj.add(new THREE.Mesh(surf(-1), fab));
    const edge = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 32 }), makeMat(f)); edge.position.z = -depth; obj.add(edge);
    const pr = p.print;
    const printSurf = (sign, face) => {
      const g = new THREE.PlaneGeometry(pr[2], pr[3], 48, 48); g.translate(pr[0] + pr[2] / 2, pr[1] + pr[3] / 2, 0);
      const pos = g.attributes.position, uv = g.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        pos.setZ(i, sign > 0 ? wrinkle(x, y) + 0.035 : -depth - wrinkle(x * 0.9 + 3, y) - 0.035);
        if (sign < 0) uv.setX(i, 1 - uv.getX(i));
      }
      g.computeVertexNormals(); const m = new THREE.Mesh(g, printMat(face, true)); m.renderOrder = 2; return m;
    };
    obj.add(printSurf(1, "front")); obj.add(printSurf(-1, "back"));
    if (p.shape === "hoodie") {
      const hg = new THREE.Mesh(new THREE.ExtrudeGeometry(pathShape(HOOD), { depth: 0.3, bevelEnabled: true, bevelThickness: 0.35, bevelSize: 0.3, bevelSegments: 5 }), makeMat(f)); hg.position.z = -0.6; obj.add(hg);
      const pk = new THREE.Mesh(new THREE.ExtrudeGeometry(pathShape(POCKET), { depth: 0.05, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.12, bevelSegments: 4 }), makeMat(f)); pk.position.z = 0.42; obj.add(pk);
      [-1.2, 1.2].forEach((x) => obj.add(tube([[x, 12.4, 0.4], [x * 1.05, 8.5, 0.55], [x * 1.1, 5.8, 0.5]], 0.12, std("#f2f2f0", 0.85))));
    }
    if (p.shape === "tote") {
      obj.add(tube([[-3.6, 7.8, 0.3], [-3.9, 12.8, 0.35], [0, 15.6, 0.35], [3.9, 12.8, 0.35], [3.6, 7.8, 0.3]], 0.4, makeMat(f)));
      obj.add(tube([[-3.6, 7.8, -0.75], [-4.1, 12.4, -0.8], [0, 15.2, -0.8], [4.1, 12.4, -0.8], [3.6, 7.8, -0.75]], 0.4, makeMat(f)));
    }
    if (p.shape === "apron") {
      obj.add(tube([[-4.5, 13.8, 0.2], [-5.2, 18.5, 0.1], [0, 21, 0], [5.2, 18.5, 0.1], [4.5, 13.8, 0.2]], 0.3, makeMat(f)));
      [-1, 1].forEach((s) => obj.add(tube([[s * 10.8, 1.6, 0.2], [s * 14, 0.2, 0.3], [s * 16, -4, 0.2], [s * 15.4, -9, 0.1]], 0.3, makeMat(f))));
    }
    const bb = new THREE.Box3().setFromObject(obj); obj.position.y = -bb.min.y + 0.3;
    obj.traverse((m) => { if (m.isMesh) { m.castShadow = true; } });
  }

  /* frame the camera */
  group.rotation.y = 0;
  group.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(group), size = new THREE.Vector3(), ctr = new THREE.Vector3();
  box.getSize(size); box.getCenter(ctr);
  let reach = 0; const v = new THREE.Vector3();
  group.traverse((o) => { if (!o.geometry) return; const a = o.geometry.attributes.position; for (let j = 0; j < a.count; j += 3) { v.fromBufferAttribute(a, j).applyMatrix4(o.matrixWorld); reach = Math.max(reach, Math.hypot(v.x, v.z)); } });
  const vf = (camera.fov * Math.PI) / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
  const spinning = p.kind === "lathe";
  const halfW = spinning ? reach : size.x / 2;
  let dist = elev > 0.5 ? (reach / Math.tan(Math.min(vf, hf) / 2)) * 0.92
    : Math.max(size.y / 2 / Math.tan(vf / 2), halfW / Math.tan(hf / 2)) * 1.16 + (spinning ? reach : size.z / 2);
  camera.position.set(0, ctr.y + dist * elev, dist);
  camera.lookAt(0, ctr.y * (elev > 0.5 ? 1 : 0.97), 0);
  scene.fog.near = dist * 1.6; scene.fog.far = dist * 4.5;
  const ext = Math.max(size.x, size.y, size.z);
  key.position.set(-ext * 0.35, ext * 2.2, ext * 0.7); key.target.position.set(0, ctr.y * 0.5, 0);
  const sc = key.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 0.1; sc.far = ext * 5; sc.updateProjectionMatrix();
  const cs = Math.min(spinning ? reach : size.x / 2, 14) * 2.8; contact.scale.set(cs, cs * (spinning ? 1 : 0.45), 1);
  contact.visible = !(p.ring || p.ribbon);
  mode = spinning ? "spin" : "sway";
}

/* ---------------- rotation + render loop ---------------- */
let rot = 0, vel = 0, auto = !reduce, target = null, dragging = false, lastX = 0, dirty = true, clock = 0;
const viewBtns = [...root.querySelectorAll(".to-view")];
const setPressed = (v) => viewBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === v)));
setPressed(auto ? "spin" : "front");
function turnTo(v) {
  setPressed(v);
  if (v === "spin") { auto = true; target = null; return; }
  auto = false; vel = 0;
  const base = Math.round(rot / (Math.PI * 2)) * Math.PI * 2;
  target = v === "back" ? (rot >= base ? base + Math.PI : base - Math.PI) : base;
  if (reduce) { rot = target; target = null; }
  dirty = true;
}
viewBtns.forEach((b) => b.addEventListener("click", () => turnTo(b.dataset.view)));
cvs.addEventListener("pointerdown", (e) => { dragging = true; lastX = e.clientX; auto = false; target = null; vel = 0; setPressed(""); try { cvs.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } });
cvs.addEventListener("pointermove", (e) => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; rot += dx * 0.012; vel = dx * 0.012; dirty = true; });
cvs.addEventListener("pointerup", () => { dragging = false; });
cvs.addEventListener("pointercancel", () => { dragging = false; });
let visible = true;
if (window.IntersectionObserver) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe($("to-stage"));
function frame() {
  requestAnimationFrame(frame);
  if (!renderer || !visible || S.mode !== "3d") return;
  if (auto) { clock += 0.016; if (mode === "spin") rot += 0.006; else rot = Math.sin(clock * 0.7) * 0.45; dirty = true; }
  else if (target !== null) { rot += (target - rot) * 0.12; if (Math.abs(target - rot) < 0.002) { rot = target; target = null; } dirty = true; }
  else if (!dragging && Math.abs(vel) > 0.0005) { rot += vel; vel *= 0.92; dirty = true; }
  if (!dirty) return;
  group.rotation.y = rot; renderer.render(scene, camera); dirty = false;
}
function resize() {
  if (!renderer) return;
  const w = cvs.clientWidth, h = cvs.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  builtKey = ""; build(); dirty = true;
}
if (window.ResizeObserver) new ResizeObserver(resize).observe(cvs); else window.addEventListener("resize", resize);

/* ---------------- layout editor ---------------- */
const ed = $("to-edit"), ex = ed.getContext("2d");
let fit = { x: 0, y: 0, s: 1 };
function edFaceUsed() { return spec.faces.length > 1; }
function surfaceFill(c, x, y, w, h) {
  const f = finish();
  if (f.type === "acrylic" || f.type === "glass") {
    const n = 16; for (let yy = 0; yy < h; yy += n) for (let xx = 0; xx < w; xx += n) { c.fillStyle = ((xx + yy) / n) % 2 ? "#e9edf2" : "#f7f9fb"; c.fillRect(x + xx, y + yy, Math.min(n, w - xx), Math.min(n, h - yy)); }
  } else if (f.type === "wood" || f.type === "slate") {
    c.save(); c.fillStyle = c.createPattern((f.type === "wood" ? woodTex() : slateTex()).userData.canvas, "repeat"); c.fillRect(x, y, w, h); c.restore();
  } else { c.fillStyle = f.c; c.fillRect(x, y, w, h); }
}
function drawEditor() {
  if (S.mode !== "edit") return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2), cw = Math.round(ed.clientWidth * dpr), ch = Math.round(ed.clientHeight * dpr);
  if (!cw || !ch) return;
  if (ed.width !== cw || ed.height !== ch) { ed.width = cw; ed.height = ch; }
  const face = faces[S.editFace], W = face.cv.width, H = face.cv.height, pad = 24 * dpr;
  const s = Math.min((cw - pad * 2) / W, (ch - pad * 2 - 30 * dpr) / H);
  fit = { x: (cw - W * s) / 2, y: (ch - H * s) / 2 + 10 * dpr, s };
  ex.clearRect(0, 0, cw, ch);
  ex.fillStyle = getComputedStyle(root).getPropertyValue("--soft") || "#f2f3f6"; ex.fillRect(0, 0, cw, ch);
  const X = fit.x, Y = fit.y, Wd = W * s, Hd = H * s;
  ex.save(); ex.shadowColor = "rgba(0,0,0,0.18)"; ex.shadowBlur = 18 * dpr; ex.shadowOffsetY = 6 * dpr; surfaceFill(ex, X, Y, Wd, Hd); ex.restore();
  surfaceFill(ex, X, Y, Wd, Hd);
  ex.drawImage(face.cv, X, Y, Wd, Hd);
  /* non-printable areas */
  if (spec.outline) {
    const o = spec.outline, P2 = (q) => [X + q[0] * Wd, Y + q[1] * Hd];
    ex.save(); ex.beginPath(); ex.rect(0, 0, cw, ch);
    o.outer.forEach((q, i) => { const [a, b] = P2(q); i ? ex.lineTo(a, b) : ex.moveTo(a, b); }); ex.closePath();
    ex.fillStyle = "rgba(20,24,31,0.55)"; ex.fill("evenodd");
    o.holes.forEach((hl) => { ex.beginPath(); hl.forEach((q, i) => { const [a, b] = P2(q); i ? ex.lineTo(a, b) : ex.moveTo(a, b); }); ex.closePath(); ex.fill(); });
    ex.restore();
  }
  if (spec.gap) {
    const [u, hw] = spec.gap; ex.save(); ex.fillStyle = "rgba(20,24,31,0.5)"; ex.fillRect(X + (u - hw) * Wd, Y, hw * 2 * Wd, Hd);
    ex.fillStyle = "#ffffff"; ex.font = `600 ${11 * dpr}px system-ui, sans-serif`; ex.textAlign = "center"; ex.fillText("HANDLE", X + u * Wd, Y + Hd / 2); ex.restore();
  }
  /* safe line */
  ex.save(); ex.setLineDash([6 * dpr, 5 * dpr]); ex.strokeStyle = "rgba(230,0,126,0.75)"; ex.lineWidth = 1.5 * dpr;
  const m = Math.min(Wd, Hd) * 0.04;
  if (spec.wrap) { ex.beginPath(); ex.moveTo(X, Y + m); ex.lineTo(X + Wd, Y + m); ex.moveTo(X, Y + Hd - m); ex.lineTo(X + Wd, Y + Hd - m); ex.stroke(); }
  else ex.strokeRect(X + m, Y + m, Wd - 2 * m, Hd - 2 * m);
  ex.restore();
  /* wrap labels */
  ex.save(); ex.fillStyle = "#6b7280"; ex.font = `600 ${11 * dpr}px system-ui, sans-serif`; ex.textAlign = "center";
  if (spec.wrap) { ex.fillText("FRONT", X + Wd / 2, Y - 8 * dpr); ex.fillText("BACK", X + 18 * dpr, Y - 8 * dpr); ex.fillText("BACK", X + Wd - 18 * dpr, Y - 8 * dpr);
    ex.strokeStyle = "rgba(107,114,128,0.5)"; ex.setLineDash([2 * dpr, 4 * dpr]); ex.beginPath(); ex.moveTo(X + Wd / 2, Y); ex.lineTo(X + Wd / 2, Y + Hd); ex.stroke(); }
  else if (edFaceUsed()) ex.fillText(S.editFace === "front" ? "FRONT" : "BACK", X + Wd / 2, Y - 8 * dpr);
  ex.restore();
  /* selection */
  const L = layers.find((l) => l.type === S.target && (l.face === S.editFace || (spec.mirror && l.face === "front")));
  if (L && L.box) {
    const b = L.box; ex.save(); ex.strokeStyle = "#e6007e"; ex.lineWidth = 2 * dpr; ex.setLineDash([5 * dpr, 4 * dpr]);
    ex.strokeRect(X + (b.cx - b.w / 2) * s, Y + (b.cy - b.h / 2) * s, b.w * s, b.h * s);
    ex.setLineDash([]); ex.fillStyle = "#e6007e"; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, c2]) => { ex.fillRect(X + (b.cx + (a * b.w) / 2) * s - 4 * dpr, Y + (b.cy + (c2 * b.h) / 2) * s - 4 * dpr, 8 * dpr, 8 * dpr); });
    ex.restore();
  }
}
const edPointers = new Map(); let edDrag = null;
function toFace(e) { const r = ed.getBoundingClientRect(), dpr = ed.width / r.width; return [((e.clientX - r.left) * dpr - fit.x) / fit.s, ((e.clientY - r.top) * dpr - fit.y) / fit.s]; }
function hit(px, py) {
  const W = faces[S.editFace].cv.width;
  const inside = (L) => { if (!L.box) return false; const b = L.box; return [0, -W, W].some((o) => Math.abs(px - (b.cx + (spec.wrap ? o : 0))) <= b.w / 2 && Math.abs(py - b.cy) <= b.h / 2); };
  const onFace = layers.filter((l) => l.face === S.editFace || (spec.mirror && l.face === "front"));
  return onFace.find((l) => l.type === "text" && inside(l)) || onFace.find((l) => l.type === "img" && inside(l)) || onFace.find((l) => l.type === S.target) || onFace[0];
}
ed.addEventListener("pointerdown", (e) => {
  ed.setPointerCapture(e.pointerId); edPointers.set(e.pointerId, toFace(e));
  if (edPointers.size === 1) {
    const [px, py] = toFace(e), L = hit(px, py);
    if (L) { S.target = L.type; syncEditBar(); edDrag = { L, px, py, x: L.x, y: L.y }; }
  } else if (edPointers.size === 2 && edDrag) {
    const [a, b] = [...edPointers.values()]; edDrag.d0 = Math.hypot(a[0] - b[0], a[1] - b[1]); edDrag.k0 = edDrag.L.type === "img" ? edDrag.L.s : edDrag.L.h;
  }
});
ed.addEventListener("pointermove", (e) => {
  if (!edPointers.has(e.pointerId) || !edDrag) return;
  edPointers.set(e.pointerId, toFace(e));
  const face = faces[S.editFace], W = face.cv.width, H = face.cv.height, L = edDrag.L;
  if (edPointers.size >= 2 && edDrag.d0) {
    const [a, b] = [...edPointers.values()], k = Math.hypot(a[0] - b[0], a[1] - b[1]) / edDrag.d0;
    if (L.type === "img") L.s = Math.max(0.03, edDrag.k0 * k); else L.h = Math.max(0.02, edDrag.k0 * k);
  } else {
    const [px, py] = toFace(e);
    L.x = edDrag.x + (px - edDrag.px) / W; L.y = edDrag.y + (py - edDrag.py) / H;
    if (spec.wrap) L.x = ((L.x % 1) + 1) % 1;
    const snap = 0.012; if (Math.abs(L.x - 0.5) < snap) L.x = 0.5; if (Math.abs(L.y - 0.5) < snap) L.y = 0.5;
  }
  scheduleArt();
});
const edUp = (e) => { edPointers.delete(e.pointerId); if (!edPointers.size) edDrag = null; else if (edDrag) edDrag.d0 = 0; };
ed.addEventListener("pointerup", edUp); ed.addEventListener("pointercancel", edUp);
ed.addEventListener("wheel", (e) => {
  e.preventDefault(); const L = selLayer(); if (!L) return; const k = Math.exp(-e.deltaY * 0.0015);
  if (L.type === "img") L.s = Math.max(0.03, L.s * k); else L.h = Math.max(0.02, L.h * k); scheduleArt();
}, { passive: false });

const selLayer = () => layers.find((l) => l.type === S.target && (l.face === S.editFace || spec.mirror)) || layers.find((l) => l.type === S.target);
function syncEditBar() {
  const tBtns = [...$("ed-target").querySelectorAll("button")];
  tBtns.forEach((b) => { const has = layers.some((l) => l.type === b.dataset.t); b.disabled = !has; b.setAttribute("aria-pressed", String(b.dataset.t === S.target)); });
  const L = selLayer();
  if (L) { S.editFace = spec.mirror ? S.editFace : L.face; $("ed-scale").value = Math.round(((L.type === "img" ? L.s / L.s0 : L.h / L.h0) || 1) * 100); }
  $("ed-face").hidden = !edFaceUsed() || spec.mirror;
  [...$("ed-face").querySelectorAll("button")].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.f === S.editFace)));
  $("ed-repeat-wrap").hidden = !(spec.wrap && S.target === "img" && layers.some((l) => l.type === "img"));
  [...root.querySelectorAll('.ed-btns [data-act="fill"], .ed-btns [data-act="fit"], .ed-btns [data-act="rotate"]')].forEach((b) => { b.hidden = S.target !== "img"; });
}
$("ed-target").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b || b.disabled) return; S.target = b.dataset.t; const L = selLayer(); if (L && !spec.mirror) S.editFace = L.face; syncEditBar(); drawEditor(); });
$("ed-face").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; S.editFace = b.dataset.f; const L = layers.find((l) => l.face === S.editFace); if (L) S.target = L.type; syncEditBar(); drawEditor(); });
$("ed-scale").addEventListener("input", () => { const L = selLayer(); if (!L) return; const k = +$("ed-scale").value / 100; if (L.type === "img") L.s = L.s0 * k; else L.h = L.h0 * k; scheduleArt(); });
$("ed-repeat").addEventListener("change", () => { S.repeat = $("ed-repeat").checked; scheduleArt(); });
root.querySelector(".ed-btns").addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  const L = selLayer(), act = b.dataset.act, W = faces.front.cv.width, H = faces.front.cv.height, a = srcAspect();
  if (act === "reset") { resetLayout(); }
  else if (!L) return;
  else if (act === "fill" && L.type === "img") { L.s = (L.rot % 180 ? Math.max(W * a, H) : Math.max(W, H * a)) / W; L.x = 0.5; L.y = 0.5; }
  else if (act === "fit" && L.type === "img") {
    const bw = (spec.wrap && S.cover !== "wrap" ? spec.panel : 0.94) * W, bh = 0.94 * H;
    L.s = (L.rot % 180 ? Math.min(bh, bw * a) : Math.min(bw, bh * a)) / W; L.x = 0.5; L.y = 0.5;
  }
  else if (act === "rotate" && L.type === "img") { L.rot = (L.rot + 90) % 360; }
  else if (act === "center") { L.x = 0.5; if (L.type === "img") L.y = 0.5; }
  syncEditBar(); scheduleArt();
});
function setMode(m) {
  S.mode = m;
  [...root.querySelectorAll(".vt")].forEach((b) => b.setAttribute("aria-selected", String(b.dataset.mode === m)));
  cvs.hidden = m !== "3d" || !renderer; ed.hidden = m !== "edit";
  $("to-views").hidden = m !== "3d" || !renderer; $("edit-bar").hidden = m !== "edit";
  $("to-stage").classList.toggle("editing", m === "edit");
  if (m === "edit") { syncEditBar(); requestAnimationFrame(drawEditor); } else { dirty = true; }
}
[...root.querySelectorAll(".vt")].forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
$("to-edit-cta").addEventListener("click", () => { setMode("edit"); $("to-stage").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); });
if (window.ResizeObserver) new ResizeObserver(() => drawEditor()).observe(ed);

let artQueued = false;
function scheduleArt() { if (artQueued) return; artQueued = true; requestAnimationFrame(() => { artQueued = false; drawFaces(); drawEditor(); dirty = true; resWarn(); refreshThumb(); }); }

/* ---------------- options UI ---------------- */
function chip(name, value, label, swatch) {
  const l = document.createElement("label"); l.className = "opt";
  const i = document.createElement("input"); i.type = "radio"; i.name = name; i.value = value;
  const s = document.createElement("span");
  if (swatch) { const sw = document.createElement("i"); sw.className = "sw"; sw.style.background = swatch; s.appendChild(sw); }
  s.appendChild(document.createTextNode(label)); l.appendChild(i); l.appendChild(s); return l;
}
function renderProducts() {
  const box = $("to-products"); box.innerHTML = "";
  Object.keys(P).forEach((k) => { if (P[k].cat === S.cat) box.appendChild(chip("to-product", k, P[k].label)); });
  setVal("to-product", S.product);
}
function money(n) { return "$" + (Math.abs(n - Math.round(n)) < 0.005 ? String(Math.round(n)) : n.toFixed(2)); }
function renderOptions() {
  const p = cur();
  const sizes = $("to-sizes"); sizes.innerHTML = "";
  p.sizes.forEach((s) => sizes.appendChild(chip("to-size", s.id, s.label + " · " + money(s.price * (1 - SALE)))));
  if (!p.sizes.some((s) => s.id === S.size)) S.size = p.sizes[0].id;
  setVal("to-size", S.size);
  $("to-sizes-label").textContent = p.phone ? "Case type" : p.sizes.length > 1 ? "Size" : "Size and price";
  $("to-model-ctl").hidden = !p.phone;
  const shapes = $("to-shapes"); shapes.innerHTML = "";
  $("to-shapes-ctl").hidden = !p.shapes;
  if (p.shapes) { p.shapes.forEach((s) => shapes.appendChild(chip("to-shape", s.id, s.label))); if (!p.shapes.some((s) => s.id === S.shape)) S.shape = p.shapes[0].id; setVal("to-shape", S.shape); } else S.shape = "";
  $("to-orient-ctl").hidden = !p.orient; setVal("to-orient", S.orient);
  const fins = $("to-finishes"); fins.innerHTML = "";
  p.fin.forEach((id) => { const f = F[id]; fins.appendChild(chip("to-colour", id, f.label, f.type === "acrylic" || f.type === "glass" ? "linear-gradient(135deg,#ffffff,#dbe5ef)" : f.type === "wood" ? "#c89a63" : f.type === "slate" ? "#3a3e44" : f.type === "steel" ? "linear-gradient(135deg,#f1f3f5,#9aa1a9)" : f.c)); });
  if (p.fin.indexOf(S.finish) < 0) S.finish = p.def;
  setVal("to-colour", S.finish);
  $("to-finish-label").textContent = p.fin.some((id) => ["glass", "acrylic", "wood", "slate", "ceramic"].indexOf(F[id].type) >= 0 && id !== "gwhite" && id !== "gblack" && id !== "mwhite") ? "Material" : "Colour";
  $("to-wear-ctl").hidden = !p.wear;
  const wear = $("to-wear"); wear.innerHTML = ""; WEAR_SIZES.forEach((s) => wear.appendChild(chip("to-wsize", s, s))); setVal("to-wsize", S.wear);
  const covers = $("to-covers"); covers.innerHTML = "";
  p.covers.forEach((c) => covers.appendChild(chip("to-cover", c, coverLabel(c))));
  if (p.covers.indexOf(S.cover) < 0) S.cover = p.covers[0];
  setVal("to-cover", S.cover);
  $("to-cover-ctl").hidden = p.covers.length < 2;
  $("to-cover-label").textContent = p.kind === "cloth" ? "Print placement" : "Print coverage";
}
function coverLabel(c) {
  const p = cur();
  if (c === "wrap" && sizeObj().g && sizeObj().g.gap) return "Wrap around (avoids handle)";
  if (c === "full" && p.phone) return "Full case";
  return COVER_LABEL[c];
}
(function fillModels() {
  const sel = $("to-model");
  PHONES.forEach(([brand, list]) => { const og = document.createElement("optgroup"); og.label = brand; list.forEach((m) => { const o = document.createElement("option"); o.value = m[0]; o.textContent = m[0]; og.appendChild(o); }); sel.appendChild(og); });
  sel.value = S.model;
})();

/* ---------------- update pipeline ---------------- */
function caption() {
  const p = cur(), sz = sizeObj();
  const bits = [p.phone ? S.model : (p.sizes.length > 1 || p.kind !== "cloth" ? sz.label : ""), p.label, finish().label, p.wear ? "Size " + S.wear : "", coverLabel(S.cover)].filter(Boolean);
  return bits.join(" · ");
}
function fullUpdate(reset) {
  spec = computeSpec(); sizeFaces();
  if (reset) resetLayout();
  build(); drawFaces();
  $("to-cap").textContent = caption();
  dirty = true; syncEditBar(); drawEditor(); resWarn(); refreshThumb(); refreshPrice();
}
function resWarn() {
  const w = $("to-res-warn"), L = layers.find((l) => l.type === "img");
  if (!(S.design === "photo" && photo && L)) { w.hidden = true; return; }
  const inches = L.s * spec.W, dpi = photo.natW / inches;
  if (dpi < 110) { w.textContent = `This photo is ${photo.natW}×${photo.natH} px, which is small for this size and may print soft. A larger original will look sharper.`; w.hidden = false; } else w.hidden = true;
}
root.addEventListener("change", (e) => {
  const t = e.target, n = t.name;
  if (!n) return;
  if (n === "to-cat") { S.cat = t.value; S.product = CAT_DEFAULT[S.cat]; renderProducts(); renderOptions(); fullUpdate(true); return; }
  if (n === "to-product") { S.product = t.value; renderOptions(); fullUpdate(true); return; }
  if (n === "to-size") { S.size = t.value; fullUpdate(true); return; }
  if (n === "to-shape") { S.shape = t.value; fullUpdate(true); return; }
  if (n === "to-orient") { S.orient = t.value; fullUpdate(true); return; }
  if (n === "to-colour") { S.finish = t.value; fullUpdate(false); return; }
  if (n === "to-wsize") { S.wear = t.value; $("to-cap").textContent = caption(); refreshThumb(); return; }
  if (n === "to-cover") { S.cover = t.value; fullUpdate(true); if (S.cover === "back") turnTo("back"); else if (S.mode === "3d") turnTo("front"); return; }
  if (n === "to-design") { S.design = t.value; fullUpdate(true); return; }
  if (n === "to-font" || n === "to-ink") { scheduleArt(); return; }
});
$("to-model").addEventListener("change", () => { S.model = $("to-model").value; $("to-model-help").hidden = S.model.indexOf("Other") !== 0; fullUpdate(true); });
$("to-ink-custom").addEventListener("input", () => { setVal("to-ink", "custom"); scheduleArt(); });
let textHadLayer = true;
["to-name", "to-name2"].forEach((id) => $(id).addEventListener("input", () => {
  const hasText = !!(text1() || text2()), hasLayer = layers.some((l) => l.type === "text");
  if (hasText !== hasLayer && S.design !== "name") { const keep = layers.find((l) => l.type === "img"); resetLayout(); const ni = layers.find((l) => l.type === "img"); if (keep && ni) Object.assign(ni, { x: keep.x, y: keep.y, s: keep.s, rot: keep.rot }); }
  scheduleArt(); textHadLayer = hasText;
}));

/* ---------------- photo upload ---------------- */
const fileIn = $("to-file"), drop = $("to-drop"), fileLabel = $("to-file-label");
function loadFile(file) {
  if (!file) return;
  if (!/^image\//.test(file.type)) { fileLabel.innerHTML = "<strong>That isn't an image.</strong> Try a JPG or PNG."; return; }
  const url = URL.createObjectURL(file), im = new Image();
  im.onload = () => {
    const sc = Math.min(1, 2000 / Math.max(im.width, im.height)), c = document.createElement("canvas");
    c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
    c.natW = im.naturalWidth; c.natH = im.naturalHeight; c.full = im;
    photo = c; photoCut = null; photoFile = file;
    if ($("to-cutout").checked) makeCutout();
    fileLabel.innerHTML = ""; const s = document.createElement("strong"); s.textContent = file.name; fileLabel.appendChild(s); fileLabel.appendChild(document.createTextNode(" · tap to change"));
    $("to-file-row").hidden = false; S.design = "photo"; setVal("to-design", "photo"); S.target = "img";
    fullUpdate(true);
    if (window.matchMedia("(max-width: 880px)").matches) $("to-stage").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };
  im.onerror = () => { URL.revokeObjectURL(url); fileLabel.innerHTML = "<strong>We couldn't open that file.</strong> Try a JPG or PNG. iPhone photos: share as JPG."; };
  im.src = url;
}
function makeCutout() {
  if (!photo) return;
  const c = document.createElement("canvas"); c.width = photo.width; c.height = photo.height;
  const x = c.getContext("2d"); x.drawImage(photo, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height), a = d.data;
  for (let i = 0; i < a.length; i += 4) { const m = Math.min(a[i], a[i + 1], a[i + 2]); if (m > 238) a[i + 3] = 0; else if (m > 205) a[i + 3] = Math.round((a[i + 3] * (238 - m)) / 33); }
  x.putImageData(d, 0, 0); photoCut = c;
}
fileIn.addEventListener("change", () => loadFile(fileIn.files && fileIn.files[0]));
["dragenter", "dragover"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add("drag"); }));
["dragleave", "drop"].forEach((t) => drop.addEventListener(t, () => drop.classList.remove("drag")));
drop.addEventListener("drop", (e) => { e.preventDefault(); loadFile(e.dataTransfer.files && e.dataTransfer.files[0]); });
$("to-remove").addEventListener("click", () => {
  photo = photoCut = photoFile = null; fileIn.value = ""; $("to-cutout").checked = false;
  fileLabel.innerHTML = "<strong>Upload a photo or logo</strong> or drop it here"; $("to-file-row").hidden = true;
  if (S.design === "photo") { S.design = "mountains"; setVal("to-design", "mountains"); }
  fullUpdate(true);
});
$("to-cutout").addEventListener("change", () => { if ($("to-cutout").checked && !photoCut) makeCutout(); scheduleArt(); });

/* ---------------- snapshot + summary ---------------- */
function snapshot() {
  if (!renderer) return null;
  const both = spec.faces.length > 1 && layers.some((l) => l.face === "back") && !spec.mirror;
  const saved = group.rotation.y, shots = [];
  [0, Math.PI].slice(0, both ? 2 : 1).forEach((r) => { group.rotation.y = r; renderer.render(scene, camera); const c = document.createElement("canvas"); c.width = cvs.width; c.height = cvs.height; c.getContext("2d").drawImage(cvs, 0, 0); shots.push(c); });
  group.rotation.y = saved; dirty = true;
  const out = document.createElement("canvas"); out.width = cvs.width * shots.length; out.height = cvs.height;
  const x = out.getContext("2d"); x.fillStyle = "#f5f6fa"; x.fillRect(0, 0, out.width, out.height);
  shots.forEach((c, i) => x.drawImage(c, i * cvs.width, 0));
  return out;
}
function summary() {
  const t = [text1(), text2()].filter(Boolean).join(" / ");
  return caption() + " · " + DESIGN_NAMES[S.design] + (t ? ' · "' + t + '"' : "");
}
let thumbTimer = 0;
function refreshThumb() {
  clearTimeout(thumbTimer);
  thumbTimer = setTimeout(() => { const s = snapshot(); if (s) $("send-thumb").src = s.toDataURL("image/jpeg", 0.85); $("send-sum").textContent = summary(); }, 400);
}

/* ---------------- price + send ---------------- */
const form = $("send-form"), err = $("sf-error"), btn = $("sf-submit");
function priceInfo() {
  const sz = sizeObj(), reg = sz.price, now = Math.round(reg * (1 - SALE) * 100) / 100, q = Math.max(1, parseInt($("sf-qty").value, 10) || 1);
  let total = now * q; const bundle = S.product === "keychain" && q >= 3;
  if (bundle) total = Math.floor(q / 3) * 30 * (1 - SALE) + (q % 3) * now;
  return { reg, now, q, total: Math.round(total * 100) / 100, link: bundle ? "" : LINK[sz.link] || "", bundle };
}
const paying = () => { const pi = priceInfo(), r = form.querySelector('input[name="payment"]:checked'); return !!pi.link && r && r.value.indexOf("Pay now") === 0; };
function refreshPrice() {
  const pi = priceInfo();
  $("sf-now").textContent = money(pi.now); $("sf-was").textContent = money(pi.reg); $("sf-was").hidden = !SALE; root.querySelector(".price-tag").hidden = !SALE;
  $("sf-each").textContent = "each" + (pi.q > 1 ? " · " + pi.q + " for " + money(pi.total) : "") + " · free local delivery on $50+";
  const note = $("sf-pnote");
  if (pi.bundle) { note.textContent = "Bundle price applied: keychains are 3 for " + money(30 * (1 - SALE)) + ". We'll send your payment link with the proof."; note.hidden = false; } else note.hidden = true;
  $("sf-pay").hidden = !pi.link;
  btn.textContent = paying() ? "Send design and pay " + money(pi.total) : "Send my design";
}
$("sf-qty").addEventListener("input", refreshPrice);
form.addEventListener("change", (e) => { if (e.target.name === "payment") refreshPrice(); });
const blobOf = (canvas, type, q) => new Promise((res) => canvas.toBlob((b) => res(b), type, q));
function setFile(input, blob, name) { try { const dt = new DataTransfer(); dt.items.add(new File([blob], name, { type: blob.type })); input.files = dt.files; return true; } catch (e) { return false; } }
const slug = (s) => (s || "design").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "design";
form.addEventListener("submit", (e) => {
  e.preventDefault(); err.hidden = true;
  const nm = $("sf-name"), em = $("sf-email");
  if (!nm.value.trim()) { err.textContent = "Please add your name."; err.hidden = false; nm.focus(); return; }
  if (!em.value.trim() || !em.checkValidity()) { err.textContent = "Please add a valid email so we can send your proof."; err.hidden = false; em.focus(); return; }
  if (S.design === "photo" && !photo) { err.textContent = "You picked \"My photo\" but haven't uploaded one yet. Upload it in step 3, or pick one of our designs."; err.hidden = false; return; }
  const p = cur(), sz = sizeObj(), t = [text1(), text2()].filter(Boolean).join(" / ");
  const pi = priceInfo(), payNow = paying(), d0 = new Date();
  const ref = "SI-" + String(d0.getFullYear()).slice(2) + ("0" + (d0.getMonth() + 1)).slice(-2) + ("0" + d0.getDate()).slice(-2) + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  $("sf-ref").value = ref;
  $("sf-product").value = p.label;
  $("sf-variant").value = [p.phone ? S.model : sz.label, S.shape ? (p.shapes.find((s) => s.id === S.shape) || {}).label : "", p.orient ? (S.orient === "port" ? "Portrait" : "Landscape") : "", p.wear ? "Shirt size " + S.wear : ""].filter(Boolean).join(", ");
  $("sf-finish").value = finish().label;
  $("sf-cover").value = coverLabel(S.cover);
  $("sf-design").value = DESIGN_NAMES[S.design] + (photoFile && S.design === "photo" ? " (" + photoFile.name + ")" : "");
  $("sf-text").value = t || "(none)";
  $("sf-font").value = val("to-font");
  $("sf-ink").value = val("to-ink") === "auto" ? "Auto (" + (INK_NAMES[inkColour()] || inkColour()) + ")" : INK_NAMES[inkColour()] || inkColour();
  $("sf-pricefield").value = money(pi.now) + " each x " + pi.q + " = " + money(pi.total) + (SALE ? " (" + Math.round(SALE * 100) + "% off " + money(pi.reg) + ")" : "") + (payNow ? " - customer is paying by card on Stripe, check the payment for " + ref : " - send a payment link with the proof");
  $("sf-next").value = payNow ? pi.link + (pi.link.indexOf("?") < 0 ? "?" : "&") + "client_reference_id=" + ref + "&prefilled_email=" + encodeURIComponent(em.value.trim()) : "https://spruceandink.ca/?sent=1#studio";
  $("sf-subject").value = (payNow ? "PAYING BY CARD - " : "New design: ") + (p.phone ? S.model + " case" : sz.label + " " + p.label) + (text1() ? ' "' + text1() + '"' : "") + " from " + nm.value.trim() + " [" + ref + "]";
  btn.disabled = true; btn.textContent = "Sending…";
  const jobs = [], snap = snapshot();
  if (snap) jobs.push(blobOf(snap, "image/jpeg", 0.9).then((b) => b && setFile($("sf-file-preview"), b, "3d-preview-" + slug(p.label) + ".jpg")));
  const art = (fn, input) => { const c = faces[fn].cv; if (spec.faces.indexOf(fn) < 0 || (fn === "back" && spec.mirror)) return; const s2 = Math.min(1, 1600 / Math.max(c.width, c.height)), o = document.createElement("canvas"); o.width = Math.round(c.width * s2); o.height = Math.round(c.height * s2); o.getContext("2d").drawImage(c, 0, 0, o.width, o.height); jobs.push(blobOf(o, "image/png").then((b) => b && setFile(input, b, "artwork-" + fn + "-" + slug(p.label) + ".png"))); };
  art("front", $("sf-file-art")); art("back", $("sf-file-art2"));
  if (photoFile && S.design === "photo") {
    if (photoFile.size <= 4.5 * 1024 * 1024) setFile($("sf-file-photo"), photoFile, photoFile.name);
    else { const full = photo.full, s3 = Math.min(1, 3000 / Math.max(full.width, full.height)), oc = document.createElement("canvas"); oc.width = Math.round(full.width * s3); oc.height = Math.round(full.height * s3); oc.getContext("2d").drawImage(full, 0, 0, oc.width, oc.height); jobs.push(blobOf(oc, "image/jpeg", 0.9).then((b) => b && setFile($("sf-file-photo"), b, slug(photoFile.name.replace(/\.[^.]+$/, "")) + ".jpg"))); }
  }
  Promise.all(jobs).then(() => HTMLFormElement.prototype.submit.call(form), () => HTMLFormElement.prototype.submit.call(form));
});
window.addEventListener("pageshow", () => { btn.disabled = false; refreshPrice(); });

/* ---------------- banner, deep links, start ---------------- */
if (/[?&]sent=1/.test(location.search)) { $("sent-banner").hidden = false; try { history.replaceState(null, "", location.pathname + "#studio"); } catch (e) { /* ignore */ } }
$("sent-close").addEventListener("click", () => { $("sent-banner").hidden = true; });
const PRODUCT_ALIAS = { handle: ["tumbler", "40oz"] };
function pick(k, size) {
  const a = PRODUCT_ALIAS[k]; if (a) { k = a[0]; size = a[1]; }
  if (!P[k]) return;
  S.product = k; S.cat = P[k].cat; setVal("to-cat", S.cat); renderProducts();
  if (size) S.size = size;
  renderOptions(); fullUpdate(true);
}
document.querySelectorAll("[data-product]").forEach((a) => a.addEventListener("click", () => pick(a.getAttribute("data-product"))));

S.cat = "drink";
renderProducts(); renderOptions();
fullUpdate(true);
resize();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { Object.keys(presetCache).forEach((k) => delete presetCache[k]); scheduleArt(); });
requestAnimationFrame(frame);
window.__studio = {
  pick, setRot: (r) => { auto = false; target = null; vel = 0; rot = r; dirty = true; }, setMode, S, layers: () => layers,
  set: (o) => { Object.assign(S, o); renderOptions(); fullUpdate(true); }
};
