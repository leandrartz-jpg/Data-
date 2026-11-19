# Comercio Local

Prototipo de app para comprar en pequeño comercio según tu presupuesto semanal,
con opción de comida preparada y un modo "menú escolar" (alérgenos + coste por alumno).

Zonas de ejemplo: Palma, Calvià, Madrid (Bali próximamente).

## Probar
Abre `index.html` en el navegador (o `python3 -m http.server` y entra en localhost:8000).

## Estructura
- `data.js`  datos de ejemplo (ficticios)
- `app.js`   lógica: presupuesto, sugerencia de cesta, menú escolar
- `index.html` interfaz

Nota: los datos son de demostración; no hay pagos ni servidor todavía.

## Pestañas
- 🔥 Recetas: coste por ración, cocinar vs precocinado, racha y ahorro
- 📅 Plan: semana automática por presupuesto, utensilios y súper elegido
- 🧺 Compra: catálogo por tienda y cesta
- 🎒 Colegio: menú semanal con alérgenos y coste por alumno
- 🏪 Soy comercio: cada tienda sube sus productos y precios (se guardan en el navegador en esta demo)

## Datos
Los precios de producto son de ejemplo. Entre cadenas se escalan con el índice de precios OCU 2026 (ocu.org).
Eroski y Agromart pendientes: sin datos fiables. Fuente abierta candidata: Open Prices (Open Food Facts, ODbL).
