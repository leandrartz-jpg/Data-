const $ = (s) => document.querySelector(s);
const eur = (n) => n.toFixed(2).replace(".", ",") + " €";
const ALERGENOS = ["gluten", "lactosa", "huevo", "pescado"];
const CATS = { todo: "Todo", fresco: "Fruta y verdura", carne: "Carne y pescado", pan: "Pan", preparado: "Comida preparada" };

const state = { zona: "palma", cat: "todo", prep: 0, evitarCompra: new Set(), evitarEsc: new Set(), cesta: {} };

// ---------- inicio ----------
function init() {
  $("#zona").innerHTML = Object.entries(ZONAS)
    .map(([k, z]) => `<option value="${k}" ${z.activa ? "" : "disabled"}>${z.nombre}</option>`).join("");
  $("#zona").onchange = (e) => { state.zona = e.target.value; state.cesta = {}; render(); };
  $("#personas").oninput = render;
  $("#presu").oninput = render;

  $("#catChips").innerHTML = Object.entries(CATS).map(([k, v]) => `<span class="chip ${k === "todo" ? "on" : ""}" data-c="${k}">${v}</span>`).join("");
  $("#catChips").onclick = (e) => {
    const c = e.target.dataset.c; if (!c) return;
    state.cat = c;
    document.querySelectorAll("#catChips .chip").forEach((x) => x.classList.toggle("on", x.dataset.c === c));
    render();
  };

  const alergiaHtml = ALERGENOS.map((a) => `<span class="chip no" data-a="${a}">Sin ${a}</span>`).join("");
  $("#alergiaCompra").innerHTML = alergiaHtml;
  $("#alergiaEsc").innerHTML = alergiaHtml;
  $("#alergiaCompra").onclick = (e) => toggleAlergeno(e, state.evitarCompra, "#alergiaCompra");
  $("#alergiaEsc").onclick = (e) => toggleAlergeno(e, state.evitarEsc, "#alergiaEsc");

  $("#prepChips").onclick = (e) => {
    const v = e.target.dataset.v; if (v === undefined) return;
    state.prep = parseFloat(v);
    document.querySelectorAll("#prepChips .chip").forEach((x) => x.classList.toggle("on", x.dataset.v === v));
  };

  document.querySelectorAll(".tab").forEach((t) => (t.onclick = () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("on", x === t));
    $("#v-compra").classList.toggle("hide", t.dataset.v !== "compra");
    $("#v-colegio").classList.toggle("hide", t.dataset.v !== "colegio");
  }));

  $("#sugerir").onclick = sugerir;
  $("#vaciar").onclick = () => { state.cesta = {}; render(); };
  $("#genMenu").onclick = generarMenu;
  $("#pedir").onclick = reservar;
  render();
}

function toggleAlergeno(e, set, root) {
  const a = e.target.dataset.a; if (!a) return;
  set.has(a) ? set.delete(a) : set.add(a);
  document.querySelectorAll(root + " .chip").forEach((x) => x.classList.toggle("on", set.has(x.dataset.a)));
  render();
}

// ---------- datos ----------
const comerciosZona = () => COMERCIOS.filter((c) => c.zona === state.zona && !c.productos.every((p) => p.cat === "colegio"));
const todosProductos = () => COMERCIOS.flatMap((c) => c.productos.map((p) => ({ ...p, comercio: c })));
const productoPorId = (id) => todosProductos().find((p) => p.id === id);
const permitido = (p, evitar) => !(p.al || []).some((a) => evitar.has(a));

// ---------- render compra ----------
function render() {
  const presu = +$("#presu").value;
  $("#presuTxt").textContent = eur(presu) + " (" + eur(presu / Math.max(1, +$("#personas").value)) + " por persona)";

  $("#tiendas").innerHTML = comerciosZona().map((c) => {
    const prods = c.productos.filter((p) => (state.cat === "todo" || p.cat === state.cat) && permitido(p, state.evitarCompra));
    if (!prods.length) return "";
    return `<div class="card shop"><h3>${c.nombre}</h3><div class="meta">${c.tipo} · ${c.horario}</div>` +
      prods.map((p) => `
        <div class="prod">
          <div>${p.n}<small>${eur(p.p)} ${(p.al || []).map((a) => `<span class="tag">${a}</span>`).join("")}</small></div>
          <div class="qty"><button data-id="${p.id}" data-d="-1">−</button><span>${state.cesta[p.id] || 0}</span><button data-id="${p.id}" data-d="1">+</button></div>
        </div>`).join("") + `</div>`;
  }).join("") || `<div class="card">No hay comercios con esos filtros.</div>`;

  document.querySelectorAll(".qty button").forEach((b) => (b.onclick = () => {
    const id = b.dataset.id, n = Math.max(0, (state.cesta[id] || 0) + +b.dataset.d);
    n ? (state.cesta[id] = n) : delete state.cesta[id];
    render();
  }));
  actualizarTotal();
}

function total() { return Object.entries(state.cesta).reduce((s, [id, q]) => s + productoPorId(id).p * q, 0); }

function actualizarTotal() {
  const t = total(), presu = +$("#presu").value, pct = Math.min(100, (t / presu) * 100);
  $("#total").textContent = eur(t);
  $("#barra").classList.toggle("over", t > presu);
  $("#barra > div").style.width = pct + "%";
  $("#restante").textContent = t > presu ? `Te pasas ${eur(t - presu)}` : `Te quedan ${eur(presu - t)}`;
}

// ---------- sugerencia de cesta ----------
function sugerir() {
  const presu = +$("#presu").value, personas = Math.max(1, +$("#personas").value);
  const prep = state.prep;
  const reparto = { fresco: 0.35, carne: 0.28, pan: 0.12, despensa: 0 };
  const resto = 1 - prep;
  const plan = { fresco: 0.35 * resto / 0.75, carne: 0.28 * resto / 0.75, pan: 0.12 * resto / 0.75, preparado: prep };
  state.cesta = {};
  for (const [cat, share] of Object.entries(plan)) {
    let budget = presu * share;
    const prods = comerciosZona().flatMap((c) => c.productos).filter((p) => p.cat === cat && permitido(p, state.evitarCompra)).sort((a, b) => a.p - b.p);
    if (!prods.length || budget <= 0) continue;
    const maxQ = cat === "preparado" ? personas * 3 : 4;
    let i = 0, guard = 0;
    while (guard++ < 200) {
      const p = prods[i % prods.length];
      if (p.p > budget || (state.cesta[p.id] || 0) >= maxQ) { if (prods.every((x) => x.p > budget || (state.cesta[x.id] || 0) >= maxQ)) break; i++; continue; }
      state.cesta[p.id] = (state.cesta[p.id] || 0) + 1;
      budget -= p.p; i++;
    }
  }
  render();
}

// ---------- reserva ----------
function reservar() {
  const items = Object.entries(state.cesta);
  if (!items.length) return alert("Añade algo a tu cesta primero.");
  const porTienda = {};
  items.forEach(([id, q]) => { const p = productoPorId(id); (porTienda[p.comercio.nombre] ||= []).push(`${q} × ${p.n}`); });
  const txt = Object.entries(porTienda).map(([t, l]) => `${t}:\n  - ${l.join("\n  - ")}`).join("\n\n");
  alert(`Reserva (demo, sin pago real)\n\n${txt}\n\nTotal: ${eur(total())}\n\nRecogida en cada comercio en su horario.`);
}

// ---------- menú escolar ----------
function generarMenu() {
  const prov = COMERCIOS.filter((c) => c.zona === state.zona && c.productos.some((p) => p.cat === "colegio"));
  if (!prov.length) { $("#menuOut").innerHTML = "No hay proveedor escolar de ejemplo en esta zona."; return; }
  const platos = prov.flatMap((c) => c.productos.filter((p) => p.cat === "colegio" && permitido(p, state.evitarEsc)).map((p) => ({ ...p, proveedor: c.nombre })));
  const pick = (curso, i) => { const l = platos.filter((p) => p.curso === curso); return l.length ? l[i % l.length] : null; };
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const presu = +$("#presuEsc").value, alumnos = Math.max(1, +$("#alumnos").value);
  let semana = 0;
  const filas = dias.map((d, i) => {
    const m = [pick(1, i), pick(2, i), pick(3, i)];
    const coste = m.reduce((s, p) => s + (p ? p.p : 0), 0);
    semana += coste;
    const alerg = [...new Set(m.flatMap((p) => (p ? p.al : [])))];
    return `<div class="dia"><b>${d}</b><div>${m.map((p) => p ? `${p.n}` : "<em>sin opción</em>").join(" · ")}<br>
      <small style="color:var(--gris)">${eur(coste)}/alumno · ${m[1] ? m[1].proveedor : ""}</small><br>
      ${alerg.length ? alerg.map((a) => `<span class="tag">${a}</span>`).join("") : `<span class="tag" style="background:#e7f3ec;color:#2f7d4f">sin alérgenos principales</span>`}</div></div>`;
  }).join("");
  const dia = semana / 5, dentro = dia <= presu;
  $("#menuOut").innerHTML = `<h3 style="margin-top:0">Menú semanal</h3>${filas}
    <div style="margin-top:12px"><b>Coste medio:</b> ${eur(dia)} por alumno/día
    ${dentro ? `<span style="color:var(--verde)">✔ dentro del presupuesto (${eur(presu)})</span>` : `<span style="color:var(--rojo)">✘ supera el presupuesto (${eur(presu)})</span>`}<br>
    <b>Semana para ${alumnos} alumnos:</b> ${eur(semana * alumnos)} · <b>Mes (4 sem.):</b> ${eur(semana * alumnos * 4)}</div>`;
}

init();
