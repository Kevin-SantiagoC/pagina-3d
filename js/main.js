/* Velvet | escena 3D, tonos, pestañas y tienda */
const bgOf = (h, s) =>
  [28, 14, 4].map(
    (l) => "#" + new THREE.Color().setHSL(h / 360, s, l / 100).getHexString(),
  );
const SH = {};
let cur = "classic";
[
  ["classic", "Rojo Pasión", "#b3001e", 349, 0.95],
  ["vino", "Vino Intenso", "#5a0f3a", 328, 0.7],
  ["coral", "Coral Sol", "#ff5a4a", 5, 0.9],
  ["nude", "Nude Canela", "#b9776a", 12, 0.45],
  ["fucsia", "Rosa Fucsia", "#d81b7a", 330, 0.85],
  ["cacao", "Cacao Oscuro", "#4a1d12", 12, 0.6],
].forEach(
  ([k, n, c, h, s]) =>
    (SH[k] = { n, hex: c, c: parseInt(c.slice(1), 16), bg: bgOf(h, s) }),
);
const lin = (h) => new THREE.Color(h).convertSRGBToLinear();
const cv = document.getElementById("stage");
const R = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
R.setPixelRatio(Math.min(devicePixelRatio, 2));
R.outputEncoding = THREE.sRGBEncoding;
R.toneMapping = THREE.ACESFilmicToneMapping;
R.toneMappingExposure = 1;
const S = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
cam.position.z = 14;
// entorno de reflejos tipo estudio
const ec = document.createElement("canvas");
ec.width = 512;
ec.height = 256;
const g = ec.getContext("2d");
const gr = g.createLinearGradient(0, 0, 0, 256);
gr.addColorStop(0, "#fff");
gr.addColorStop(0.5, "#8a8a8a");
gr.addColorStop(1, "#222");
g.fillStyle = gr;
g.fillRect(0, 0, 512, 256);
g.fillStyle = "#fff";
[50, 190, 330, 450].forEach((x) => g.fillRect(x, 40, 30, 150));
const et = new THREE.CanvasTexture(ec);
et.encoding = THREE.sRGBEncoding;
et.mapping = THREE.EquirectangularReflectionMapping;
S.environment = new THREE.PMREMGenerator(R).fromEquirectangular(et).texture;
const dl = new THREE.DirectionalLight(0xffffff, 1.1);
dl.position.set(3, 4, 5);
S.add(dl, new THREE.AmbientLight(0xffffff, 0.35));

// labial procedural
const L = new THREE.Group();
const gold = new THREE.MeshStandardMaterial({
  color: 0xd4af37,
  metalness: 1,
  roughness: 0.22,
});
const blk = new THREE.MeshStandardMaterial({
  color: 0x111111,
  metalness: 0.8,
  roughness: 0.2,
});
const mat = new THREE.MeshPhysicalMaterial({
  color: lin(SH.classic.c),
  roughness: 0.45,
  clearcoat: 0.6,
  clearcoatRoughness: 0.2,
});
const cyl = (r, h, m, y) => {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 64), m);
  o.position.y = y;
  L.add(o);
};
cyl(0.64, 1.7, blk, -1.4);
cyl(0.67, 0.1, gold, -0.5);
cyl(0.55, 1.1, gold, 0.1);
const bg = new THREE.CylinderGeometry(0.46, 0.46, 1.7, 64, 1),
  p = bg.attributes.position;
for (let i = 0; i < p.count; i++)
  if (p.getY(i) > 0) p.setY(i, p.getY(i) + p.getX(i) * 0.5 + 0.2);
bg.computeVertexNormals();
const bullet = new THREE.Mesh(bg, mat);
bullet.position.y = 1.5;
L.add(bullet);
L.rotation.z = -0.42;
S.add(L);

// gotas de brillo flotantes
const F = [
  [-0.38, -0.3, 1.5, 0.55],
  [0.08, 0.32, -1, 0.3],
  [0.3, -0.12, 2, 0.6],
  [0.12, -0.36, 0, 0.35],
  [-0.15, 0.22, -2, 0.28],
  [-0.3, 0.3, 0, 0.45],
  [0.4, 0.28, -1, 0.22],
  [0.22, 0.4, -2, 0.2],
  [-0.08, -0.2, -3, 0.22],
  [0.45, 0, 1, 0.4],
  [-0.45, 0.05, -1, 0.3],
  [0.0, 0.1, -4, 0.24],
];
const D = F.map(([fx, fy, z, r]) => {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshPhysicalMaterial({
      color: lin(SH.classic.c),
      roughness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    }),
  );
  m.userData = { fx, fy, z, r, k: 0, s: 1, rx: 0, ry: 0 };
  S.add(m);
  return m;
});

let yOff = -0.1,
  vw = 1,
  vh = 1;
function resize() {
  const w = innerWidth,
    h = innerHeight;
  R.setSize(w, h, false);
  cam.aspect = w / h;
  cam.updateProjectionMatrix();
  vh = 2 * Math.tan(THREE.MathUtils.degToRad(15)) * 14;
  vw = vh * cam.aspect;
  // Ajusta tamaño y posición del labial según la pantalla (celular vertical, horizontal, tablet, escritorio)
  const portrait = cam.aspect < 0.9;
  const short = h < 520 && w > h;
  const base = 1.12 * Math.min(1, cam.aspect * 1.1);
  // En vertical el labial no debe invadir el titular ni las tarjetas
  L.scale.setScalar(
    (portrait ? Math.min(base, h < 700 ? 0.5 : 0.62) : base) *
      (short ? 0.8 : 1),
  );
  yOff = portrait ? -0.45 : -0.1;
}
addEventListener("resize", resize);
resize();

let m = { x: 0, y: 0, px: 0, py: 0 },
  cm = { x: 0, y: 0 },
  spin = 0,
  busy = false;
// Mouse y también toques en pantalla táctil
["pointermove", "pointerdown"].forEach((ev) =>
  addEventListener(ev, (e) => {
    m.x = e.clientX / innerWidth - 0.5;
    m.y = e.clientY / innerHeight - 0.5;
  }),
);

const cards = [...document.querySelectorAll(".card")];
cards.forEach((c) =>
  c.addEventListener("click", () => {
    if (busy) return;
    cards.forEach((x) => x.classList.remove("active"));
    c.classList.add("active");
    flavor(c.dataset.flavor);
  }),
);
const step = () => {
  const o = cards.find((c) => !c.classList.contains("active"));
  o && o.click();
};
const keys = Object.keys(SH);
prev.onclick = () =>
  flavor(keys[(keys.indexOf(cur) + keys.length - 1) % keys.length]);
next.onclick = () => flavor(keys[(keys.indexOf(cur) + 1) % keys.length]);

function flavor(k) {
  if (busy || k === cur) return;
  cur = k;
  cards.forEach((x) => x.classList.toggle("active", x.dataset.flavor === k));
  busy = true;
  const sh = SH[k];
  gsap.to(document.body, {
    "--bg-inner": sh.bg[0],
    "--bg-mid": sh.bg[1],
    "--bg-outer": sh.bg[2],
    duration: 1.5,
    ease: "power2.inOut",
  });
  const o = { v: 0, b: 0 };
  gsap.to(o, {
    v: 360,
    b: 12,
    duration: 0.6,
    ease: "power2.in",
    onUpdate: () => {
      spin = o.v;
      cv.style.filter = `blur(${o.b}px)`;
    },
    onComplete: () => {
      mat.color.copy(lin(sh.c));
      gsap.to(o, {
        v: 720,
        b: 0,
        duration: 1.5,
        ease: "back.out(0.7)",
        onUpdate: () => {
          spin = o.v;
          cv.style.filter = `blur(${o.b}px)`;
        },
        onComplete: () => {
          spin = 0;
          cv.style.filter = "none";
        },
      });
    },
  });
  let n = 0;
  D.forEach((d) => {
    const u = d.userData;
    gsap
      .timeline()
      .to(u, {
        k: 1,
        s: 0.1,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => d.material.color.copy(lin(sh.c)),
      })
      .to(u, { duration: 0.3 })
      .to(u, {
        fx: (Math.random() - 0.5) * 0.9,
        fy: (Math.random() - 0.5) * 0.8,
        k: 0,
        s: 1,
        duration: 0.9,
        ease: "back.out(1.5)",
        onComplete: () => {
          if (++n === D.length) busy = false;
        },
      });
  });
}

function frame(ms) {
  const t = ms * 0.001;
  cm.x += (m.x - cm.x) * 0.05;
  cm.y += (m.y - cm.y) * 0.05;
  L.rotation.y = cm.x * 0.9 + THREE.MathUtils.degToRad(spin);
  L.rotation.x = cm.y * 0.35;
  L.position.y = Math.sin(t * 1.05) * 0.22 + yOff;
  const px = m.x * vw,
    py = -m.y * vh;
  D.forEach((d, i) => {
    const u = d.userData;
    const bx = u.fx * vw * (1 - u.k),
      by = u.fy * vh * (1 - u.k);
    const dx = bx - px,
      dy = by - py,
      dist = Math.hypot(dx, dy) || 1;
    let tx = 0,
      ty = 0;
    if (dist < 2.4) {
      const f = (2.4 - dist) / 2.4;
      tx = (dx / dist) * f * 1.6;
      ty = (dy / dist) * f * 1.6;
    }
    u.rx += (tx - u.rx) * 0.1;
    u.ry += (ty - u.ry) * 0.1;
    d.position.set(
      bx + u.rx,
      by + u.ry + Math.sin(t * 0.9 + i * 0.7) * 0.15,
      u.z,
    );
    d.scale.setScalar(u.r * u.s * 0.5);
  });
  R.render(S, cam);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// pestañas
const $ = (id) => document.getElementById(id),
  PRICE = 29900,
  cart = {};
const money = (n) => "$" + n.toLocaleString("es-CO");
const toast = (t) => {
  const e = $("toast");
  e.textContent = t;
  e.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => e.classList.remove("show"), 2200);
};
const V = ["tonos", "ingredientes", "resenas", "tienda", "contacto"];
function show() {
  const h = location.hash.slice(1),
    v = V.includes(h) ? h : "inicio";
  document
    .querySelectorAll(".panel")
    .forEach((p) => p.classList.toggle("open", p.id === "p-" + v));
  document
    .querySelectorAll(".nav a")
    .forEach((a) => a.classList.toggle("active", a.dataset.v === v));
  // En celular el menú se desliza: mantener visible la pestaña activa
  const act = document.querySelector(".nav a.active");
  if (act) act.scrollIntoView({ inline: "center", block: "nearest" });
}
const go = (v) => {
  location.hash = v;
  show();
};
addEventListener("hashchange", show);
document.querySelectorAll(".nav a").forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    go(a.dataset.v);
  }),
);
$("shopBtn").onclick = () => go("tienda");
$("contactBtn").onclick = () => go("contacto");
addEventListener("keydown", (e) => e.key === "Escape" && go("inicio"));
$("gTonos").innerHTML = Object.entries(SH)
  .map(
    ([k, s]) =>
      `<div class="tile pick shade-${k}" data-k="${k}"><div class="dot"></div><b>${s.n}</b><span>Toca para verlo en el labial.</span></div>`,
  )
  .join("");
$("gTonos").onclick = (e) => {
  const t = e.target.closest(".tile");
  if (t) {
    go("inicio");
    flavor(t.dataset.k);
  }
};
$("gIng").innerHTML = [
  ["Manteca de karité", "Nutre y suaviza los labios durante horas."],
  ["Vitamina E", "Antioxidante que protege del resecamiento."],
  ["Aceite de jojoba", "Aporta flexibilidad y un acabado satinado."],
  ["Ácido hialurónico", "Efecto volumen y jugosidad inmediata."],
  ["Pigmentos minerales", "Color intenso sin pesadez ni transferencia."],
  ["Libre de crueldad", "Nunca probado en animales. Fórmula vegana."],
]
  .map(([a, b]) => `<div class="tile"><b>${a}</b><span>${b}</span></div>`)
  .join("");
$("gRes").innerHTML = [
  [
    "Valentina R.",
    "Cali",
    "El rojo es perfecto, dura todo el día y no reseca.",
  ],
  [
    "Camila G.",
    "Bogotá",
    "El acabado aterciopelado es lo mejor. Ya pedí otro tono.",
  ],
  ["Laura M.", "Medellín", "Cómodo, pigmentado y se ve hermoso en fotos."],
  ["Sofía P.", "Cali", "El empaque dorado es precioso, parece de lujo."],
]
  .map(
    ([n, c, t]) =>
      `<div class="tile"><div class="stars">★★★★★</div><span>“${t}”</span><b>${n} · ${c}</b></div>`,
  )
  .join("");
$("gTienda").innerHTML = Object.entries(SH)
  .map(
    ([k, s]) =>
      `<div class="tile shade-${k}"><div class="dot"></div><b>${s.n}</b><span>${money(PRICE)}</span><button data-k="${k}">Agregar</button></div>`,
  )
  .join("");
function upd() {
  const n = Object.values(cart).reduce((a, b) => a + b, 0);
  $("cartTxt").textContent = n
    ? `${n} producto${n > 1 ? "s" : ""} · ${money(n * PRICE)}`
    : "Carrito vacío";
  $("navTienda").textContent = n ? `Tienda (${n})` : "Tienda";
}
$("gTienda").onclick = (e) => {
  const k = e.target.dataset.k;
  if (!k) return;
  cart[k] = (cart[k] || 0) + 1;
  upd();
  toast(SH[k].n + " agregado");
};
$("buy").onclick = () => {
  if (!Object.keys(cart).length) return toast("Agrega un labial primero");
  for (const k in cart) delete cart[k];
  upd();
  toast("¡Gracias! Compra simulada (demo)");
};
$("send").onclick = () => {
  go("inicio");
  toast("¡Mensaje enviado! Te contactaremos pronto");
};
show();
// destellos
const sp = document.getElementById("sparks");
setInterval(() => {
  const e = document.createElement("div");
  e.className = "spark";
  const s = Math.random() * 14 + 6;
  const d = Math.random() * 6 + 4;
  e.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}%;opacity:${Math.random() * 0.4 + 0.2};animation:rise ${d}s linear forwards`;
  sp.appendChild(e);
  setTimeout(() => e.remove(), d * 1000);
}, 400);
