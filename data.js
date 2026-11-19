// DATOS DE EJEMPLO (ficticios). En la versión real los comercios los suben ellos mismos.
// cat: fresco | carne | pan | despensa | preparado | colegio
const ZONAS = {
  palma:  { nombre: "Palma", activa: true },
  calvia: { nombre: "Calvià", activa: true },
  madrid: { nombre: "Madrid", activa: true },
  bali:   { nombre: "Bali (próximamente)", activa: false },
};

const COMERCIOS = [
  { id: 1, zona: "palma", nombre: "Fruteria Can Toni", tipo: "Frutas y verduras", horario: "8:00–14:00",
    productos: [
      { id: "p1", n: "Tomate de ramellet (kg)", p: 3.2, cat: "fresco" },
      { id: "p2", n: "Patata (kg)", p: 1.3, cat: "fresco" },
      { id: "p3", n: "Naranjas (kg)", p: 1.6, cat: "fresco" },
      { id: "p4", n: "Verdura de temporada (kg)", p: 2.4, cat: "fresco" },
    ] },
  { id: 2, zona: "palma", nombre: "Carnicería Es Mercat", tipo: "Carne y embutido", horario: "8:30–14:00",
    productos: [
      { id: "p5", n: "Pollo troceado (kg)", p: 6.5, cat: "carne" },
      { id: "p6", n: "Carne picada mixta (kg)", p: 8.9, cat: "carne" },
      { id: "p7", n: "Sobrasada (200 g)", p: 4.2, cat: "carne" },
    ] },
  { id: 3, zona: "palma", nombre: "Forn Sa Plaça", tipo: "Panadería", horario: "7:00–15:00",
    productos: [
      { id: "p8", n: "Pan payés", p: 2.1, cat: "pan" },
      { id: "p9", n: "Ensaimada pequeña", p: 1.8, cat: "pan" },
    ] },
  { id: 4, zona: "palma", nombre: "Cuina de Casa Marga", tipo: "Comida preparada", horario: "12:00–15:30",
    productos: [
      { id: "p10", n: "Arroz brut (ración)", p: 7.5, cat: "preparado", al: ["gluten-no"] },
      { id: "p11", n: "Tumbet (ración)", p: 5.9, cat: "preparado", al: [] },
      { id: "p12", n: "Lentejas estofadas (ración)", p: 5.2, cat: "preparado", al: [] },
      { id: "p13", n: "Croquetas caseras (6 ud)", p: 6.0, cat: "preparado", al: ["gluten", "lactosa", "huevo"] },
    ] },
  { id: 5, zona: "palma", nombre: "Menú Escolar Es Pinar", tipo: "Catering escolar", horario: "Pedido semanal",
    productos: [
      { id: "c1", n: "Crema de verduras", p: 1.1, cat: "colegio", curso: 1, al: [] },
      { id: "c2", n: "Macarrones con tomate", p: 1.2, cat: "colegio", curso: 1, al: ["gluten"] },
      { id: "c3", n: "Lentejas con verduras", p: 1.2, cat: "colegio", curso: 1, al: [] },
      { id: "c4", n: "Arroz a la cubana", p: 1.3, cat: "colegio", curso: 1, al: ["huevo"] },
      { id: "c5", n: "Pollo al horno con patata", p: 2.0, cat: "colegio", curso: 2, al: [] },
      { id: "c6", n: "Merluza a la plancha", p: 2.4, cat: "colegio", curso: 2, al: ["pescado"] },
      { id: "c7", n: "Tortilla de patata y ensalada", p: 1.7, cat: "colegio", curso: 2, al: ["huevo"] },
      { id: "c8", n: "Albóndigas en salsa", p: 2.1, cat: "colegio", curso: 2, al: ["gluten", "huevo"] },
      { id: "c9", n: "Fruta de temporada", p: 0.6, cat: "colegio", curso: 3, al: [] },
      { id: "c10", n: "Yogur natural", p: 0.5, cat: "colegio", curso: 3, al: ["lactosa"] },
    ] },

  { id: 6, zona: "calvia", nombre: "Verdures Es Camp (Calvià Vila)", tipo: "Frutas y verduras", horario: "8:00–13:30",
    productos: [
      { id: "p14", n: "Tomate (kg)", p: 3.0, cat: "fresco" },
      { id: "p15", n: "Calabacín (kg)", p: 2.2, cat: "fresco" },
      { id: "p16", n: "Fruta de temporada (kg)", p: 2.3, cat: "fresco" },
    ] },
  { id: 7, zona: "calvia", nombre: "Peixateria Santa Ponça", tipo: "Pescado", horario: "8:00–13:30",
    productos: [
      { id: "p17", n: "Dorada (kg)", p: 11.5, cat: "carne" },
      { id: "p18", n: "Calamar (kg)", p: 13.0, cat: "carne" },
    ] },
  { id: 8, zona: "calvia", nombre: "Forn Peguera", tipo: "Panadería", horario: "7:00–14:00",
    productos: [
      { id: "p19", n: "Pan de payés", p: 2.0, cat: "pan" },
      { id: "p20", n: "Coca de verduras", p: 2.5, cat: "pan" },
    ] },
  { id: 9, zona: "calvia", nombre: "Cuina Illa Plats", tipo: "Comida preparada", horario: "12:00–15:00",
    productos: [
      { id: "p21", n: "Paella de verduras (ración)", p: 6.9, cat: "preparado", al: [] },
      { id: "p22", n: "Pollo asado con patatas (ración)", p: 6.4, cat: "preparado", al: [] },
      { id: "p23", n: "Lasaña casera (ración)", p: 6.2, cat: "preparado", al: ["gluten", "lactosa", "huevo"] },
    ] },

  { id: 10, zona: "madrid", nombre: "Frutería Lavapiés", tipo: "Frutas y verduras", horario: "9:00–20:00",
    productos: [
      { id: "p24", n: "Tomate (kg)", p: 2.9, cat: "fresco" },
      { id: "p25", n: "Patata (kg)", p: 1.2, cat: "fresco" },
      { id: "p26", n: "Manzana (kg)", p: 2.0, cat: "fresco" },
    ] },
  { id: 11, zona: "madrid", nombre: "Carnicería La Latina", tipo: "Carne", horario: "9:00–14:30",
    productos: [
      { id: "p27", n: "Pollo entero (kg)", p: 5.8, cat: "carne" },
      { id: "p28", n: "Ternera para guisar (kg)", p: 12.5, cat: "carne" },
    ] },
  { id: 12, zona: "madrid", nombre: "Panadería Malasaña", tipo: "Panadería", horario: "7:30–15:00",
    productos: [{ id: "p29", n: "Barra de pan", p: 1.1, cat: "pan" }] },
  { id: 13, zona: "madrid", nombre: "Casa Lola Comida Casera", tipo: "Comida preparada", horario: "13:00–16:00",
    productos: [
      { id: "p30", n: "Cocido madrileño (ración)", p: 8.5, cat: "preparado", al: [] },
      { id: "p31", n: "Callos (ración)", p: 7.9, cat: "preparado", al: [] },
      { id: "p32", n: "Tortilla de patata (ración)", p: 4.0, cat: "preparado", al: ["huevo"] },
    ] },
  { id: 14, zona: "madrid", nombre: "Menú Escolar Retiro", tipo: "Catering escolar", horario: "Pedido semanal",
    productos: [
      { id: "m1", n: "Sopa de pollo", p: 1.0, cat: "colegio", curso: 1, al: ["gluten"] },
      { id: "m2", n: "Garbanzos con espinacas", p: 1.2, cat: "colegio", curso: 1, al: [] },
      { id: "m3", n: "Pollo con arroz", p: 2.0, cat: "colegio", curso: 2, al: [] },
      { id: "m4", n: "Pescado al horno con verduras", p: 2.4, cat: "colegio", curso: 2, al: ["pescado"] },
      { id: "m5", n: "Fruta", p: 0.6, cat: "colegio", curso: 3, al: [] },
    ] },
];
