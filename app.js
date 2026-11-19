const $ = (s) => document.querySelector(s);
const eur = (n) => n.toFixed(2).replace(".", ",") + " €";
const ALERGENOS = ["gluten", "lactosa", "huevo", "pescado"];
const CATS = { todo: "Todo", fresco: "Fruta y verdura", carne: "Carne y pescado", pan: "Pan", despensa: "Despensa", preparado: "Comida preparada" };

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
    $("#v-recetas").classList.toggle("hide", t.dataset.v !== "recetas");
    $("#v-plan").classList.toggle("hide", t.dataset.v !== "plan");
    $("#v-compra").classList.toggle("hide", t.dataset.v !== "compra");
    $("#v-colegio").classList.toggle("hide", t.dataset.v !== "colegio");
  }));

  $("#sugerir").onclick = sugerir;
  $("#vaciar").onclick = () => { state.cesta = {}; render(); };
  $("#genMenu").onclick = generarMenu;
  $("#genPlan").onclick = generarPlan;
  $("#pedir").onclick = reservar;
  $("#recFiltros").onclick = (e) => {
    const f = e.target.dataset.f; if (!f) return;
    state.filtro = f;
    document.querySelectorAll("#recFiltros .chip").forEach((x) => x.classList.toggle("on", x.dataset.f === f));
    renderRecetas();
  };
  $("#modal").onclick = (e) => { if (e.target.id === "modal") $("#modal").classList.add("hide"); };
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
  renderRecetas();
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


// ---------- recetas ----------
const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };

function resolverIng(ing) {
  const [nombre, k, f] = ing;
  const prods = comerciosZona().flatMap((c) => c.productos.map((p) => ({ ...p, comercio: c })))
    .filter((p) => p.n.toLowerCase().includes(k) && permitido(p, state.evitarCompra)).sort((a, b) => a.p - b.p);
  return { nombre, f, prod: prods[0] || null };
}
function costeReceta(r) {
  const ings = r.ing.map(resolverIng);
  const total = ings.reduce((s, i) => s + (i.prod ? i.prod.p * i.f : 0), 0);
  return { ings, total, porRacion: total / r.raciones, completa: ings.every((i) => i.prod) };
}

function renderRecetas() {
  const filtro = state.filtro || "todo";
  const lista = RECETAS.map((r) => ({ r, c: costeReceta(r) })).filter(({ r, c }) => c.completa &&
    (filtro === "todo" || (filtro === "barato" ? c.porRacion < 3 : r.tags.includes(filtro))));
  $("#recetasGrid").innerHTML = lista.map(({ r, c }) => `
    <div class="rc" data-id="${r.id}"><div class="em">${r.e}</div><div class="bd">
      <h4>${r.t}</h4><div class="pr">${eur(c.porRacion)} <small>/ración</small></div>
      <small>⏱ ${r.min} min · ${r.dif}</small></div></div>`).join("") || `<div class="card">Sin recetas con esos filtros.</div>`;
  document.querySelectorAll(".rc").forEach((el) => (el.onclick = () => abrirReceta(el.dataset.id)));
  const racha = store.get("racha", 0), ahorro = store.get("ahorro", 0);
  $("#racha").textContent = `🔥 ${racha} ${racha === 1 ? "día" : "días"}`;
  $("#ahorro").textContent = eur(ahorro);
}

function abrirReceta(id) {
  const r = RECETAS.find((x) => x.id === id), c = costeReceta(r);
  const hecho = r.hecho.map((h) => productoPorId(h)).find((p) => p && p.comercio.zona === state.zona);
  $("#sheet").innerHTML = `
    <h2>${r.e} ${r.t}</h2><small style="color:var(--gris)">⏱ ${r.min} min · ${r.dif} · ${r.raciones} raciones</small>
    <div class="cmp">
      <div class="win"><b>👩‍🍳 Cocinarla</b><br>${eur(c.porRacion)}/ración<br><small>${eur(c.total)} en total</small></div>
      <div>${hecho ? `<b>🍽 Ya hecha</b><br>${eur(hecho.p)}/ración<br><small>${hecho.comercio.nombre}</small>` : `<b>🛵 A domicilio</b><br>~${eur(PRECIO_DELIVERY_REF / 2)}/ración<br><small>estimación</small>`}</div>
    </div>
    <b>Ingredientes</b>
    <ul class="lista">${c.ings.map((i) => `<li>${i.nombre} <small style="color:var(--gris)">· ${i.prod ? i.prod.comercio.nombre : "—"}</small></li>`).join("")}</ul>
    <b>Preparación</b><ol>${r.pasos.map((p) => `<li>${p}</li>`).join("")}</ol>
    <button class="btn" id="aCesta" style="width:100%;margin-bottom:8px">🧺 Añadir ingredientes a la cesta</button>
    ${hecho ? `<button class="btn sec" id="aHecho" style="width:100%;margin-bottom:8px">🍽 Mejor la pido hecha (${eur(hecho.p)})</button>` : ""}
    <button class="btn sec" id="cocine" style="width:100%">✅ La he cocinado (sumar a mi racha)</button>`;
  $("#modal").classList.remove("hide");
  $("#aCesta").onclick = () => { c.ings.forEach((i) => { if (i.prod) state.cesta[i.prod.id] = Math.max(state.cesta[i.prod.id] || 0, 1); }); $("#modal").classList.add("hide"); render(); };
  if (hecho) $("#aHecho").onclick = () => { state.cesta[hecho.id] = (state.cesta[hecho.id] || 0) + r.raciones; $("#modal").classList.add("hide"); render(); };
  $("#cocine").onclick = () => {
    store.set("racha", store.get("racha", 0) + 1);
    store.set("ahorro", store.get("ahorro", 0) + Math.max(0, PRECIO_DELIVERY_REF / 2 * r.raciones - c.total));
    $("#modal").classList.add("hide"); renderRecetas();
  };
}

// ---------- plan semanal automático ----------
// Coste real de comprar: los productos se venden enteros (se redondea hacia arriba)
function costeCompra(recetas, personas) {
  const uso = {}; // id producto -> fracción total usada
  recetas.forEach((r) => resolverCostes(r).forEach((i) => { if (i.prod) uso[i.prod.id] = (uso[i.prod.id] || 0) + i.f * (personas / r.raciones); }));
  let total = 0; const lineas = [];
  for (const [id, f] of Object.entries(uso)) {
    const p = productoPorId(id), u = Math.max(1, Math.ceil(f - 1e-9));
    total += p.p * u; lineas.push({ p, u, f });
  }
  return { total, lineas };
}
const resolverCostes = (r) => r.ing.map(resolverIng);

function generarPlan() {
  const presu = +$("#presu").value, n = +$("#diasPlan").value, piso = Math.max(1, +$("#piso").value);
  const personas = Math.max(1, +$("#personas").value);
  const pool = RECETAS.filter((r) => costeReceta(r).completa);
  if (pool.length < 2) { $("#planOut").innerHTML = '<div class="card">Faltan recetas en esta zona.</div>'; return; }
  let mejor = null;
  for (let it = 0; it < 4000; it++) {
    const sel = Array.from({ length: n }, () => pool[Math.floor(Math.random() * pool.length)]);
    const rep = n - new Set(sel.map((r) => r.id)).size;
    if (rep > Math.max(1, Math.floor(n / 3))) continue; // variedad mínima
    const c = costeCompra(sel, personas);
    const score = c.total + rep * 2;
    if (!mejor || score < mejor.score) mejor = { sel, c, score };
  }
  const separado = mejor.sel.reduce((s, r) => s + costeCompra([r], personas).total, 0);
  const ahorroReuso = Math.max(0, separado - mejor.c.total);
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const porTienda = {};
  mejor.c.lineas.forEach((l) => (porTienda[l.p.comercio.nombre] ||= []).push(l));
  const dentro = mejor.c.total <= presu;
  $("#planOut").innerHTML = `
    <div class="card hero"><div><b>${eur(mejor.c.total)}</b><br><small>compra de la semana</small></div>
      <div style="text-align:right"><b>${eur(mejor.c.total / piso)}</b><br><small>por persona (${piso})</small></div></div>
    <div class="card">
      ${mejor.sel.map((r, i) => `<div class="dia"><b>${dias[i]}</b><div>${r.e} ${r.t}<br><small style="color:var(--gris)">⏱ ${r.min} min</small></div></div>`).join("")}
      <p style="margin-bottom:0">${dentro ? `<span style="color:var(--verde)">✔ Dentro de tu presupuesto (${eur(presu)})</span>` : `<span style="color:var(--rojo)">✘ Supera tu presupuesto (${eur(presu)}); sube el presupuesto o baja las cenas.</span>`}<br>
      🌿 Al reutilizar ingredientes ahorras <b>${eur(ahorroReuso)}</b> frente a comprar cada receta por separado.</p>
    </div>
    <div class="card"><b>Lista de la compra por tienda</b>
      ${Object.entries(porTienda).map(([t, ls]) => `<div style="margin-top:8px"><u>${t}</u><ul class="lista">${ls.map((l) => `<li>${l.u} × ${l.p.n} <small style="color:var(--gris)">${eur(l.p.p * l.u)}</small></li>`).join("")}</ul></div>`).join("")}
      <button class="btn" id="planCesta" style="width:100%">🧺 Pasar todo a la cesta</button>
      <button class="btn sec" id="planOtra" style="width:100%;margin-top:8px">🔄 Otra combinación</button>
    </div>`;
  $("#planCesta").onclick = () => { state.cesta = {}; mejor.c.lineas.forEach((l) => (state.cesta[l.p.id] = l.u)); render(); document.querySelector('.tab[data-v="compra"]').click(); };
  $("#planOtra").onclick = generarPlan;
}

init();
