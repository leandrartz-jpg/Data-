// Recetas: ingredientes con palabra clave (k) para encontrar el producto en tu zona
// f = fracción del producto que se usa por receta (para calcular coste por ración)
const RECETAS = [
  { id: "r1", ut: ["fuego"], hs: "sp6", e: "🍝", t: "Pasta cremosa de tomate y queso", min: 15, raciones: 2, dif: "Fácil", tags: ["rapido", "barato"],
    ing: [["Pasta", "pasta", 0.5], ["Tomate", "tomate", 0.3], ["Queso rallado", "queso", 0.3], ["Aceite", "aceite", 0.03]],
    pasos: ["Hierve la pasta 9 min.", "Sofríe el tomate troceado con aceite 8 min.", "Mezcla con la pasta y cubre de queso."],
    hecho: ["p23"] },
  { id: "r2", ut: ["fuego"], e: "🌯", t: "Burritos de pollo y aguacate", min: 20, raciones: 2, dif: "Fácil", tags: ["rapido"],
    ing: [["Tortillas", "tortillas", 0.5], ["Pechuga de pollo", "pollo", 1], ["Aguacate", "aguacate", 1], ["Tomate", "tomate", 0.2]],
    pasos: ["Dora el pollo en tiras 6 min.", "Chafa el aguacate con sal.", "Rellena las tortillas y enrolla."], hecho: [] },
  { id: "r3", ut: ["fuego"], hs: "sp4", e: "🍳", t: "Tortilla de patata jugosa", min: 30, raciones: 3, dif: "Media", tags: ["barato", "vegetariano"],
    ing: [["Patatas", "patata", 0.6], ["Huevos", "huevos", 0.5], ["Cebolla", "cebolla", 0.2], ["Aceite", "aceite", 0.1]],
    pasos: ["Fríe la patata y la cebolla a fuego bajo 15 min.", "Mézclalas con el huevo batido.", "Cuaja la tortilla 3 min por lado."],
    hecho: ["p32"] },
  { id: "r4", ut: [], e: "🥗", t: "Bowl de garbanzos y verduras", min: 10, raciones: 2, dif: "Muy fácil", tags: ["rapido", "barato", "vegano"],
    ing: [["Garbanzos", "garbanzos", 1], ["Tomate", "tomate", 0.3], ["Cebolla", "cebolla", 0.1], ["Aguacate", "aguacate", 1], ["Aceite", "aceite", 0.03]],
    pasos: ["Escurre los garbanzos.", "Corta tomate, cebolla y aguacate.", "Mezcla y aliña con aceite y sal."], hecho: [] },
  { id: "r5", ut: ["fuego"], hs: "sp2", e: "🍚", t: "Arroz con atún y tomate", min: 20, raciones: 3, dif: "Fácil", tags: ["barato", "rapido"],
    ing: [["Arroz", "arroz", 0.3], ["Atún", "atun", 2], ["Tomate", "tomate", 0.3], ["Cebolla", "cebolla", 0.15]],
    pasos: ["Sofríe cebolla y tomate.", "Añade el arroz y agua (el doble de volumen).", "Cuece 15 min y añade el atún."], hecho: ["p10"] },
  { id: "r6", ut: ["fuego"], e: "🍔", t: "Hamburguesas caseras con patatas", min: 25, raciones: 2, dif: "Fácil", tags: [],
    ing: [["Carne picada", "picada", 1], ["Pan", "pan", 0.6], ["Patatas", "patata", 0.5], ["Queso rallado", "queso", 0.2]],
    pasos: ["Forma 2 hamburguesas y plánchalas 4 min por lado.", "Fríe o hornea las patatas en bastones.", "Monta con pan y queso."], hecho: [] },
  { id: "r7", ut: ["horno"], hs: "sp3", e: "🍗", t: "Pollo al horno con patatas", min: 45, raciones: 3, dif: "Fácil", tags: ["barato"],
    ing: [["Pechuga de pollo", "pollo", 2], ["Patatas", "patata", 0.7], ["Cebolla", "cebolla", 0.2], ["Aceite", "aceite", 0.05]],
    pasos: ["Corta patata y cebolla en rodajas.", "Pon el pollo encima con aceite y sal.", "Hornea 40 min a 200 °C."], hecho: ["p22", "p11"] },
  { id: "r8", ut: [], e: "🍊", t: "Desayuno rápido: tostada y naranja", min: 5, raciones: 1, dif: "Muy fácil", tags: ["rapido", "barato", "vegano"],
    ing: [["Pan", "pan", 0.3], ["Naranjas", "naranja", 0.3], ["Aceite", "aceite", 0.01], ["Tomate", "tomate", 0.1]],
    pasos: ["Tuesta el pan.", "Unta tomate rallado y aceite.", "Exprime una naranja."], hecho: [] },
  { id: "r9", ut: ["microondas"], e: "☕", t: "Tortilla en taza (microondas)", min: 5, raciones: 1, dif: "Muy fácil", tags: ["rapido", "barato", "vegetariano"],
    ing: [["Huevos", "huevos", 0.17], ["Queso rallado", "queso", 0.1], ["Tomate", "tomate", 0.1]],
    pasos: ["Bate 2 huevos en una taza con sal.", "Añade queso y tomate picado.", "Microondas 1 min 30 s."], hecho: [] },
  { id: "r10", ut: [], e: "🌮", t: "Wrap de atún y aguacate (sin cocinar)", min: 5, raciones: 1, dif: "Muy fácil", tags: ["rapido", "barato"],
    ing: [["Tortillas", "tortillas", 0.25], ["Atún", "atun", 1], ["Aguacate", "aguacate", 0.5], ["Tomate", "tomate", 0.1]],
    pasos: ["Chafa el aguacate sobre la tortilla.", "Añade atún y tomate.", "Enrolla y listo."], hecho: [] },
];

// Referencia orientativa de lo que cuesta pedir algo parecido a domicilio (estimación, a validar)
const PRECIO_DELIVERY_REF = 13;
