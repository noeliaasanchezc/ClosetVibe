const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const homeView = document.querySelector('#home-view');
const wardrobeView = document.querySelector('#armario');
const lookView = document.querySelector('#crear-look');
const favoritesView = document.querySelector('#favoritos');
const recommendationView = document.querySelector('#recomendacion');
const wardrobeGrid = document.querySelector('#wardrobe-grid');
const wardrobeCount = document.querySelector('#wardrobe-count');
const wardrobeEmpty = document.querySelector('#wardrobe-empty');
const emptyTitle = document.querySelector('#empty-title');
const emptyDescription = document.querySelector('#empty-description');
const itemDialog = document.querySelector('#item-dialog');
const itemForm = document.querySelector('#item-form');
const imageInput = document.querySelector('#item-image');
const imagePreview = document.querySelector('#image-preview');
const imagePlaceholder = document.querySelector('#image-placeholder');
const formMessage = document.querySelector('#form-message');
const saveItemButton = document.querySelector('#save-item');
const storageKey = 'closetvibe-items-v1';
const savedLooksKey = 'closetvibe-looks-v1';

function getItemAlt(item) {
  return [item.name || 'Prenda', item.category, item.color].filter(Boolean).join(' · ');
}

function showToast(message, isError = false) {
  const region = document.querySelector('#toast-region');
  const toast = document.createElement('div');
  toast.className = `toast${isError ? ' is-error' : ''}`;
  const mark = document.createElement('span');
  mark.className = 'toast-mark';
  mark.textContent = isError ? '!' : '✓';
  mark.setAttribute('aria-hidden', 'true');
  const text = document.createElement('span');
  text.textContent = message;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'toast-close';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Cerrar notificación');
  let timer;
  const dismiss = () => { clearTimeout(timer); toast.remove(); };
  const startTimer = () => { clearTimeout(timer); timer = setTimeout(dismiss, 5500); };
  close.addEventListener('click', dismiss);
  toast.addEventListener('mouseenter', () => clearTimeout(timer));
  toast.addEventListener('mouseleave', startTimer);
  toast.addEventListener('focusin', () => clearTimeout(timer));
  toast.addEventListener('focusout', startTimer);
  toast.append(mark, text, close);
  region.append(toast);
  const limit = window.matchMedia('(max-width: 600px)').matches ? 2 : 3;
  while (region.children.length > limit) region.firstElementChild.remove();
  startTimer();
}

function confirmAction(title, description, action) {
  const dialog = document.querySelector('#confirm-dialog');
  if (dialog.open) return Promise.resolve(false);
  const trigger = document.activeElement;
  document.querySelector('#confirm-title').textContent = title;
  document.querySelector('#confirm-description').textContent = description;
  document.querySelector('#confirm-accept').textContent = action;
  dialog.returnValue = 'cancel';
  return new Promise(resolve => {
    dialog.addEventListener('close', () => {
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
      resolve(dialog.returnValue === 'accept');
    }, { once: true });
    dialog.showModal();
    document.querySelector('#confirm-cancel').focus();
  });
}

try {
  localStorage.removeItem('closetvibe-mirror-photo-v1');
} catch (error) {
  console.warn('No se pudo retirar la foto local del antiguo espejo.', error);
}

const outfitSlots = [
  { id: 'top', label: 'Parte superior', category: 'Camisetas', icon: '↟' },
  { id: 'bottom', label: 'Parte inferior', category: 'Pantalones', categories: ['Pantalones', 'Faldas'], icon: '↡' },
  { id: 'dress', label: 'Vestido', category: 'Vestidos', icon: '✳' },
  { id: 'jacket', label: 'Chaqueta', category: 'Chaquetas', icon: '⌁' },
  { id: 'shoes', label: 'Calzado', category: 'Calzado', icon: '⌑' },
  { id: 'bag', label: 'Bolso', category: 'Bolsos', icon: '▱' },
  { id: 'accessories', label: 'Accesorios', category: 'Accesorios', icon: '✧' }
];

// El catálogo es la única fuente de datos para nuevas visitas y migraciones.
const sampleItems = [
  {
    "id": "sample-1",
    "name": "Camiseta rosa estampada",
    "category": "Camisetas",
    "color": "Rosa",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Calor",
      "Entretiempo"
    ],
    "image": "assets/samples/3954.jpg"
  },
  {
    "id": "sample-2",
    "name": "Vaqueros azul oscuro",
    "category": "Pantalones",
    "color": "Denim azul oscuro",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Frío",
      "Entretiempo"
    ],
    "image": "assets/samples/26993.jpg"
  },
  {
    "id": "sample-3",
    "name": "Vestido largo estampado",
    "category": "Vestidos",
    "color": "Amarillo y marrón",
    "style": "Casual",
    "occasions": [
      "Viaje",
      "Cena"
    ],
    "weather": [
      "Calor",
      "Entretiempo"
    ],
    "image": "assets/samples/59897.jpg"
  },
  {
    "id": "sample-4",
    "name": "Blazer negro entallado",
    "category": "Chaquetas",
    "color": "Negro",
    "style": "Elegante",
    "occasions": [
      "Universidad",
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Frío",
      "Entretiempo"
    ],
    "image": "assets/samples/19342.jpg"
  },
  {
    "id": "sample-5",
    "name": "Zapatillas urbanas",
    "category": "Calzado",
    "color": "Turquesa, gris y blanco",
    "style": "Deportivo",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Calor",
      "Entretiempo"
    ],
    "image": "assets/samples/4147.jpg"
  },
  {
    "id": "sample-6",
    "name": "Bolso de diario",
    "category": "Bolsos",
    "color": "Marrón",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Calor",
      "Frío",
      "Lluvia",
      "Entretiempo"
    ],
    "image": "assets/samples/47359.jpg"
  },
  {
    "id": "sample-7",
    "name": "Camisa de manga corta",
    "category": "Camisetas",
    "color": "Morado",
    "style": "Elegante",
    "occasions": [
      "Universidad",
      "Cena"
    ],
    "weather": [
      "Calor",
      "Entretiempo"
    ],
    "image": "assets/samples/26960.jpg"
  },
  {
    "id": "sample-8",
    "name": "Pantalón fluido marrón",
    "category": "Pantalones",
    "color": "Marrón",
    "style": "Elegante",
    "occasions": [
      "Universidad",
      "Cena"
    ],
    "weather": [
      "Frío",
      "Entretiempo"
    ],
    "image": "assets/samples/57138.jpg"
  },
  {
    "id": "sample-9",
    "name": "Cárdigan crema",
    "category": "Chaquetas",
    "color": "Crema",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Frío",
      "Entretiempo"
    ],
    "image": "assets/samples/32388.jpg"
  },
  {
    "id": "sample-10",
    "name": "Pendientes dorados",
    "category": "Accesorios",
    "color": "Dorado",
    "style": "Fiesta",
    "occasions": [
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Calor",
      "Frío",
      "Lluvia",
      "Entretiempo"
    ],
    "image": "assets/samples/56214.jpg"
  },
  {
    "id": "sample-11",
    "name": "Botas marrones de invierno",
    "category": "Calzado",
    "color": "Marrón",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Frío"
    ],
    "image": "assets/samples/13360.jpg"
  },
  {
    "id": "sample-12",
    "name": "Bolso de noche plateado",
    "category": "Bolsos",
    "color": "Plateado",
    "style": "Fiesta",
    "occasions": [
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Calor",
      "Frío",
      "Lluvia",
      "Entretiempo"
    ],
    "image": "assets/samples/25143.jpg"
  }
];
// Las 24 muestras de la primera ampliación se conservan sin cambios.
const additionalSampleItems = [
  {
    "id": "sample-extra-01",
    "name": "Top negro esencial",
    "category": "Camisetas",
    "color": "Negro",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje",
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Calor",
      "Entretiempo"
    ],
    "image": "assets/samples/32597.jpg"
  },
  {
    "id": "sample-extra-02",
    "name": "Jersey de punto gris",
    "category": "Camisetas",
    "color": "Gris",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Frío",
      "Entretiempo"
    ],
    "image": "assets/samples/20091.jpg"
  },
  {
    "id": "sample-extra-03",
    "name": "Cárdigan negro",
    "category": "Chaquetas",
    "color": "Negro",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje",
      "Cena"
    ],
    "weather": [
      "Frío",
      "Entretiempo"
    ],
    "image": "assets/samples/32387.jpg"
  },
  {
    "id": "sample-extra-04",
    "name": "Sudadera rosa con capucha",
    "category": "Camisetas",
    "color": "Rosa",
    "style": "Deportivo",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Frío",
      "Entretiempo"
    ],
    "image": "assets/samples/12531.jpg"
  },
  {
    "id": "sample-extra-05",
    "name": "Jersey de rayas",
    "category": "Camisetas",
    "color": "Azul, verde y blanco",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Frío",
      "Entretiempo"
    ],
    "image": "assets/samples/20232.jpg"
  },
  {
    "id": "sample-extra-06",
    "name": "Pantalón negro elegante",
    "category": "Pantalones",
    "color": "Negro",
    "style": "Elegante",
    "occasions": [
      "Universidad",
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Frío",
      "Entretiempo"
    ],
    "image": "assets/samples/57136.jpg"
  },
  {
    "id": "sample-extra-07",
    "name": "Falda corta de cuadros",
    "category": "Faldas",
    "color": "Beige, marrón y negro",
    "style": "Elegante",
    "occasions": [
      "Universidad",
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Calor",
      "Entretiempo"
    ],
    "image": "assets/samples/32591.jpg"
  },
  {
    "id": "sample-extra-08",
    "name": "Falda vaquera",
    "category": "Faldas",
    "color": "Denim azul",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Calor",
      "Entretiempo"
    ],
    "image": "assets/samples/13514.jpg"
  },
  {
    "id": "sample-extra-09",
    "name": "Pantalón caqui recto",
    "category": "Pantalones",
    "color": "Caqui",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Calor",
      "Entretiempo",
      "Frío",
      "Lluvia"
    ],
    "image": "assets/samples/57137.jpg"
  },
  {
    "id": "sample-extra-10",
    "name": "Vestido negro de cena",
    "category": "Vestidos",
    "color": "Negro",
    "style": "Elegante",
    "occasions": [
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Calor",
      "Entretiempo"
    ],
    "image": "assets/samples/6873.jpg"
  },
  {
    "id": "sample-extra-11",
    "name": "Vestido corto gris",
    "category": "Vestidos",
    "color": "Gris",
    "style": "Elegante",
    "occasions": [
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Calor",
      "Entretiempo"
    ],
    "image": "assets/samples/10406.jpg"
  },
  {
    "id": "sample-extra-12",
    "name": "Trench claro",
    "category": "Chaquetas",
    "color": "Crema",
    "style": "Elegante",
    "occasions": [
      "Universidad",
      "Viaje",
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Lluvia",
      "Entretiempo"
    ],
    "image": "assets/samples/6889.jpg"
  },
  {
    "id": "sample-extra-13",
    "name": "Chaleco vaquero",
    "category": "Chaquetas",
    "color": "Denim azul claro",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Entretiempo"
    ],
    "image": "assets/samples/6887.jpg"
  },
  {
    "id": "sample-extra-14",
    "name": "Abrigo negro de doble botonadura",
    "category": "Chaquetas",
    "color": "Negro",
    "style": "Elegante",
    "occasions": [
      "Universidad",
      "Viaje",
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Frío"
    ],
    "image": "assets/samples/6880.jpg"
  },
  {
    "id": "sample-extra-15",
    "name": "Chaqueta deportiva rosa",
    "category": "Chaquetas",
    "color": "Rosa",
    "style": "Deportivo",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Frío",
      "Entretiempo"
    ],
    "image": "assets/samples/8785.jpg"
  },
  {
    "id": "sample-extra-16",
    "name": "Zapatillas blancas",
    "category": "Calzado",
    "color": "Blanco y azul",
    "style": "Deportivo",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Calor",
      "Entretiempo"
    ],
    "image": "assets/samples/3505.jpg"
  },
  {
    "id": "sample-extra-17",
    "name": "Botines negros",
    "category": "Calzado",
    "color": "Negro",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje",
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Frío",
      "Lluvia",
      "Entretiempo"
    ],
    "image": "assets/samples/23809.jpg"
  },
  {
    "id": "sample-extra-18",
    "name": "Tacones clásicos",
    "category": "Calzado",
    "color": "Negro",
    "style": "Elegante",
    "occasions": [
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Calor",
      "Entretiempo"
    ],
    "image": "assets/samples/54127.jpg"
  },
  {
    "id": "sample-extra-19",
    "name": "Sandalias negras con tachuelas",
    "category": "Calzado",
    "color": "Negro y dorado",
    "style": "Fiesta",
    "occasions": [
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Calor"
    ],
    "image": "assets/samples/59051.jpg"
  },
  {
    "id": "sample-extra-20",
    "name": "Sandalias planas",
    "category": "Calzado",
    "color": "Marrón y beige",
    "style": "Casual",
    "occasions": [
      "Viaje",
      "Universidad"
    ],
    "weather": [
      "Calor"
    ],
    "image": "assets/samples/53130.jpg"
  },
  {
    "id": "sample-extra-21",
    "name": "Bolso pequeño de fiesta",
    "category": "Bolsos",
    "color": "Negro y plateado",
    "style": "Fiesta",
    "occasions": [
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Calor",
      "Frío",
      "Lluvia",
      "Entretiempo"
    ],
    "image": "assets/samples/42879.jpg"
  },
  {
    "id": "sample-extra-22",
    "name": "Gafas de sol redondas",
    "category": "Accesorios",
    "color": "Dorado y verde oscuro",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Calor"
    ],
    "image": "assets/samples/sunglasses.jpg"
  },
  {
    "id": "sample-extra-23",
    "name": "Cinturón de piel trenzada",
    "category": "Accesorios",
    "color": "Marrón",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje",
      "Cena"
    ],
    "weather": [
      "Calor",
      "Frío",
      "Lluvia",
      "Entretiempo"
    ],
    "image": "assets/samples/48124.jpg"
  },
  {
    "id": "sample-extra-24",
    "name": "Collar de perlas con medallón",
    "category": "Accesorios",
    "color": "Blanco y plateado",
    "style": "Elegante",
    "occasions": [
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Calor",
      "Frío",
      "Lluvia",
      "Entretiempo"
    ],
    "image": "assets/samples/52223.jpg"
  }
];

// Segunda ampliación: solo se anexan los IDs nuevos que todavía no existan.
const newSampleItems = [
  {
    "id": "sample-extra-25",
    "name": "Camisa azul clara",
    "category": "Camisetas",
    "color": "Azul claro",
    "style": "Elegante",
    "occasions": [
      "Universidad",
      "Cena"
    ],
    "weather": [
      "Entretiempo"
    ],
    "image": "assets/samples/extra-25.jpg"
  },
  {
    "id": "sample-extra-26",
    "name": "Top blanco básico",
    "category": "Camisetas",
    "color": "Blanco",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Calor"
    ],
    "image": "assets/samples/extra-26.jpg"
  },
  {
    "id": "sample-extra-27",
    "name": "Jersey gris de punto",
    "category": "Camisetas",
    "color": "Gris",
    "style": "Casual",
    "occasions": [
      "Universidad"
    ],
    "weather": [
      "Frío"
    ],
    "image": "assets/samples/extra-27.jpg"
  },
  {
    "id": "sample-extra-28",
    "name": "Pantalón blanco fluido",
    "category": "Pantalones",
    "color": "Blanco",
    "style": "Elegante",
    "occasions": [
      "Cena",
      "Viaje"
    ],
    "weather": [
      "Calor",
      "Entretiempo"
    ],
    "image": "assets/samples/extra-28.jpg"
  },
  {
    "id": "sample-extra-29",
    "name": "Falda negra midi",
    "category": "Faldas",
    "color": "Negro",
    "style": "Elegante",
    "occasions": [
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Calor",
      "Entretiempo"
    ],
    "image": "assets/samples/extra-29.jpg"
  },
  {
    "id": "sample-extra-30",
    "name": "Cazadora de cuero negra",
    "category": "Chaquetas",
    "color": "Negro",
    "style": "Fiesta",
    "occasions": [
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Frío",
      "Entretiempo"
    ],
    "image": "assets/samples/extra-30.jpg"
  },
  {
    "id": "sample-extra-31",
    "name": "Chaqueta corta rosa empolvado",
    "category": "Chaquetas",
    "color": "Rosa empolvado",
    "style": "Elegante",
    "occasions": [
      "Universidad",
      "Cena"
    ],
    "weather": [
      "Entretiempo"
    ],
    "image": "assets/samples/extra-31.jpg"
  },
  {
    "id": "sample-extra-32",
    "name": "Zapatillas beige",
    "category": "Calzado",
    "color": "Beige",
    "style": "Casual",
    "occasions": [
      "Universidad",
      "Viaje"
    ],
    "weather": [
      "Entretiempo"
    ],
    "image": "assets/samples/extra-32.jpg"
  },
  {
    "id": "sample-extra-33",
    "name": "Mocasines negros",
    "category": "Calzado",
    "color": "Negro",
    "style": "Elegante",
    "occasions": [
      "Universidad",
      "Cena"
    ],
    "weather": [
      "Entretiempo"
    ],
    "image": "assets/samples/extra-33.jpg"
  },
  {
    "id": "sample-extra-34",
    "name": "Sandalias doradas",
    "category": "Calzado",
    "color": "Dorado",
    "style": "Elegante",
    "occasions": [
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Calor"
    ],
    "image": "assets/samples/extra-34.jpg"
  },
  {
    "id": "sample-extra-35",
    "name": "Bolso rojo pequeño",
    "category": "Bolsos",
    "color": "Rojo y negro",
    "style": "Fiesta",
    "occasions": [
      "Cena",
      "Fiesta"
    ],
    "weather": [
      "Calor",
      "Frío",
      "Lluvia",
      "Entretiempo"
    ],
    "image": "assets/samples/extra-35.jpg"
  },
  {
    "id": "sample-extra-36",
    "name": "Pañuelo estampado",
    "category": "Accesorios",
    "color": "Crema y negro",
    "style": "Elegante",
    "occasions": [
      "Universidad",
      "Viaje",
      "Cena"
    ],
    "weather": [
      "Frío",
      "Entretiempo"
    ],
    "image": "assets/samples/extra-36.jpg"
  }
];
const newSamplesMigrationKey = 'closetvibe-samples-extra-25-36-v1';
const allSampleItems = [...sampleItems, ...additionalSampleItems, ...newSampleItems, ...completeSampleItems];
allSampleItems.forEach(item => { item.occasions = expandedSampleOccasions(item); });

function migrateWardrobeSamples(items) {
  try {
    if (localStorage.getItem(newSamplesMigrationKey) === 'done') return items;
    const existingIds = new Set(items.map(item => item.id));
    const missing = newSampleItems.filter(item => !existingIds.has(item.id));
    const updated = missing.length ? [...items, ...missing.map(item => ({ ...item }))] : items;
    // No se marcan como migrados si falla el guardado; una recarga puede reintentar.
    if (missing.length && !saveItems(updated)) return items;
    try {
      localStorage.setItem(newSamplesMigrationKey, 'done');
    } catch (error) {
      // Los datos ya están guardados. Mantén la interfaz alineada con ellos;
      // el siguiente intento comprobará los IDs antes de marcar la migración.
      console.warn('No se pudo marcar la ampliación como completada.', error);
    }
    return updated;
  } catch (error) {
    console.warn('No se pudo completar la ampliación de prendas de muestra.', error);
    return items;
  }
}

function getRestoredWardrobeItems(items) {
  const ids = new Set(items.map(item => item.id));
  const missing = allSampleItems.filter(item => !ids.has(item.id));
  return missing.length ? [...items, ...missing.map(item => ({ ...item }))] : items;
}

function loadItems() {
  const initialItems = [...sampleItems, ...additionalSampleItems];
  try {
    const storedItems = localStorage.getItem(storageKey);
    if (storedItems !== null) {
      const parsedItems = JSON.parse(storedItems);
      return Array.isArray(parsedItems) ? parsedItems : initialItems;
    }
    localStorage.setItem(storageKey, JSON.stringify(initialItems));
  } catch (error) {
    console.warn('No se pudo leer el armario guardado.', error);
  }
  return initialItems;
}

let wardrobeItems = migrateSampleOccasions(migrateCompleteSamples(migrateWardrobeSamples(loadItems())), allSampleItems);
let activeFilter = 'Todas';
let previewUrl = null;
let selectedOccasion = 'Universidad';
let outfit = Object.fromEntries(outfitSlots.map((slot) => [slot.id, null]));
let favoriteLooks = loadFavoriteLooks();
let currentRecommendation = null;
let recommendationSequence = 0;

function saveItems(items) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
    return true;
  } catch (error) {
    console.warn('No se pudo guardar el armario.', error);
    return false;
  }
}

function categoryMatches(item, filter) {
  if (filter === 'Todas') return true;
  if (filter === 'complementos') return item.category === 'Bolsos' || item.category === 'Accesorios';
  return item.category === filter;
}

const wardrobeCategoryLabels = [
  ['Camisetas', 'Camisetas'],
  ['Pantalones', 'Pantalones'],
  ['Faldas', 'Faldas'],
  ['Vestidos', 'Vestidos'],
  ['Chaquetas', 'Chaquetas'],
  ['Calzado', 'Calzado'],
  ['Bolsos', 'Bolsos'],
  ['Accesorios', 'Accesorios']
];

const wardrobeColorFamilies = [
  { name: 'Negro', match: /negro|black/ },
  { name: 'Blanco', match: /blanco|white/ },
  { name: 'Azul', match: /azul|denim|navy/ },
  { name: 'Rosa', match: /rosa|coral|rojo|burdeos/ },
  { name: 'Lila', match: /lila|lilac|morado|violeta/ },
  { name: 'Crema', match: /crema|beige|camel|natural|arena/ },
  { name: 'Marrón', match: /marr[oó]n|chocolate|cuero/ },
  { name: 'Dorado', match: /dorado|gold|amarillo/ },
  { name: 'Verde', match: /verde|oliva/ },
  { name: 'Gris', match: /gris|silver|plateado/ }
];

function getWardrobeColorFamily(color = '') {
  const normalized = color.toLocaleLowerCase('es');
  return wardrobeColorFamilies.find((family) => family.match.test(normalized))?.name || 'Otros';
}

function renderWardrobeOverview() {
  document.querySelector('#wardrobe-summary-total').textContent = wardrobeItems.length;
  const categoryCounts = wardrobeCategoryLabels.map(([category, label]) => ({
    category,
    label,
    count: wardrobeItems.filter((item) => item.category === category).length
  }));
  const mostUsed = categoryCounts.reduce((best, entry) => entry.count > best.count ? entry : best, { label: '—', count: 0 });
  document.querySelector('#wardrobe-summary-category').textContent = mostUsed.count ? mostUsed.label : '—';

  const colorCounts = new Map();
  wardrobeItems.forEach((item) => {
    const color = getWardrobeColorFamily(item.color);
    colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
  });
  const dominantColor = [...colorCounts.entries()].sort((first, second) => second[1] - first[1])[0]?.[0] || '—';
  document.querySelector('#wardrobe-summary-color').textContent = dominantColor;

  const chart = document.querySelector('#wardrobe-category-bars');
  const total = wardrobeItems.length || 1;
  chart.replaceChildren(...categoryCounts.filter((entry) => entry.count > 0).map((entry) => {
    const row = document.createElement('div');
    row.className = 'wardrobe-category-row';
    const label = document.createElement('span');
    label.className = 'wardrobe-category-label';
    label.textContent = entry.label;
    const track = document.createElement('span');
    track.className = 'wardrobe-category-track';
    const fill = document.createElement('span');
    fill.className = 'wardrobe-category-fill';
    fill.style.width = `${Math.max(4, entry.count / total * 100)}%`;
    track.append(fill);
    const count = document.createElement('span');
    count.className = 'wardrobe-category-value';
    count.textContent = entry.count;
    row.append(label, track, count);
    return row;
  }));
}

function getOutfitSlot(item) {
  return outfitSlots.find((slot) => slot.category === item.category || slot.categories?.includes(item.category));
}

function createItemCard(item) {
  const card = document.createElement('article');
  card.className = 'closet-card';

  const image = document.createElement('img');
  image.className = 'closet-card-image';
  image.src = item.image;
  image.alt = getItemAlt(item);
  image.loading = 'lazy';

  const removeButton = document.createElement('button');
  removeButton.className = 'remove-item-button';
  removeButton.type = 'button';
  removeButton.setAttribute('aria-label', `Eliminar ${item.name}`);
  removeButton.textContent = '×';
  removeButton.addEventListener('click', () => removeItem(item.id));

  const details = document.createElement('div');
  details.className = 'closet-card-details';

  const category = document.createElement('span');
  category.className = 'closet-card-category';
  category.textContent = item.category;

  const name = document.createElement('h3');
  name.className = 'closet-card-name';
  name.textContent = item.name;

  const color = document.createElement('p');
  color.className = 'closet-card-color';
  color.textContent = item.color;

  details.append(category, name, color);
  card.append(image, removeButton, details);
  return card;
}

function renderItems() {
  const visibleItems = wardrobeItems.filter((item) => categoryMatches(item, activeFilter));
  wardrobeGrid.replaceChildren(...visibleItems.map(createItemCard));
  wardrobeCount.textContent = `${wardrobeItems.length} ${wardrobeItems.length === 1 ? 'prenda guardada' : 'prendas guardadas'}`;
  wardrobeEmpty.hidden = visibleItems.length > 0;
  renderWardrobeOverview();

  if (wardrobeItems.length === 0) {
    emptyTitle.textContent = 'Aún no hay prendas';
    emptyDescription.textContent = `Sube una foto de tu ropa o restablece las ${allSampleItems.length} prendas de ejemplo para probar combinaciones.`;
    document.querySelector('#empty-add-item').textContent = 'Añadir mi primera prenda ＋';
  } else {
    emptyTitle.textContent = 'No hay prendas en esta categoría';
    emptyDescription.textContent = 'Prueba otra categoría o añade una nueva prenda.';
    document.querySelector('#empty-add-item').textContent = 'Añadir una prenda ＋';
  }
}

async function removeItem(id) {
  const item = wardrobeItems.find(item => item.id === id);
  if (!item || !await confirmAction('¿Eliminar esta prenda?', 'Se eliminará «' + item.name + '» de Mi armario y del conjunto actual. Tus looks favoritos guardados se conservarán.', 'Eliminar prenda')) return;
  const updatedItems = wardrobeItems.filter((item) => item.id !== id);
  if (!saveItems(updatedItems)) {
    wardrobeCount.textContent = 'No se pudo guardar el cambio. Libera espacio en el navegador e inténtalo de nuevo.';
    showToast('No se pudo eliminar la prenda. Inténtalo de nuevo.', true);
    return;
  }
  wardrobeItems = updatedItems;
  const removedFromRecommendation = currentRecommendation?.items.some((item) => item.id === id) || false;
  if (removedFromRecommendation) currentRecommendation = null;
  let removedFromOutfit = false;
  Object.keys(outfit).forEach((slotId) => {
    if (outfit[slotId]?.id === id) {
      outfit[slotId] = null;
      removedFromOutfit = true;
    }
  });
  if (removedFromOutfit) {
    const message = document.querySelector('#look-message');
    message.classList.remove('is-error');
    message.textContent = 'La prenda eliminada del armario también se quitó del conjunto.';
  }
  renderItems();
  renderLookBuilder();
  showToast('Prenda eliminada del armario.');
  document.querySelector('#open-item-dialog').focus({ preventScroll: true });
  if (removedFromRecommendation) {
    document.querySelector('#recommendation-message').textContent = 'El armario cambió. Genera otra propuesta para usar solo prendas disponibles.';
    renderRecommendationView();
  }
}

function closeMobileMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
  mainNav.classList.remove('is-open');
}

function showRoute(hash, shouldScroll = true) {
  const destination = hash.replace(/^#/, '') || 'inicio';
  const wardrobeIsVisible = destination === 'armario';
  const lookIsVisible = destination === 'crear-look';
  const favoritesAreVisible = destination === 'favoritos';
  const recommendationIsVisible = destination === 'recomendacion';
  const plannerIsVisible = destination === 'planificador-semanal';
  const plannerView = document.querySelector('#planificador-semanal');
  homeView.hidden = wardrobeIsVisible || lookIsVisible || favoritesAreVisible || recommendationIsVisible || plannerIsVisible;
  wardrobeView.hidden = !wardrobeIsVisible;
  lookView.hidden = !lookIsVisible;
  favoritesView.hidden = !favoritesAreVisible;
  recommendationView.hidden = !recommendationIsVisible;
  plannerView.hidden = !plannerIsVisible;

  document.querySelectorAll('.nav-link').forEach((link) => {
    const isActive = link.getAttribute('href') === `#${destination}`;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  if (lookIsVisible) renderLookBuilder();
  if (favoritesAreVisible) renderFavorites();
  if (recommendationIsVisible) renderRecommendationView();
  if (plannerIsVisible && typeof renderWeeklyPlanner === 'function') renderWeeklyPlanner();
  if (!shouldScroll) return;
  const scrollTarget = plannerIsVisible ? plannerView : wardrobeIsVisible ? wardrobeView : lookIsVisible ? lookView : favoritesAreVisible ? favoritesView : recommendationIsVisible ? recommendationView : document.getElementById(destination) || homeView;
  requestAnimationFrame(() => scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

function navigateTo(hash) {
  if (window.location.hash !== hash) window.history.pushState({}, '', hash);
  showRoute(hash);
  closeMobileMenu();
}

menuToggle.addEventListener('click', () => {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isExpanded));
  menuToggle.setAttribute('aria-label', isExpanded ? 'Abrir menú' : 'Cerrar menú');
  mainNav.classList.toggle('is-open', !isExpanded);
});

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const hash = link.getAttribute('href');
  if (!document.getElementById(hash.slice(1))) return;
  event.preventDefault();
  if (link.dataset.planOccasion) {
    selectedOccasion = link.dataset.planOccasion;
    document.querySelector('#recommendation-occasion').value = selectedOccasion;
  }
  navigateTo(hash);
});

window.addEventListener('popstate', () => showRoute(window.location.hash));

document.querySelectorAll('.filter-button').forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('.filter-button').forEach((filterButton) => {
      const isSelected = filterButton === button;
      filterButton.classList.toggle('is-selected', isSelected);
      filterButton.setAttribute('aria-pressed', String(isSelected));
    });
    renderItems();
  });
});

function renderOutfitSlots() {
  const container = document.querySelector('#outfit-slots');
  const cards = outfitSlots.map((slot) => {
    const item = outfit[slot.id];
    const card = document.createElement('article');
    card.className = `outfit-slot${item ? ' is-filled' : ''}`;
    card.dataset.slot = slot.id;

    if (item) {
      const image = document.createElement('img');
      image.className = 'outfit-slot-image';
      image.src = item.image;
      image.alt = getItemAlt(item);

      const details = document.createElement('div');
      details.className = 'outfit-slot-details';

      const slotLabel = document.createElement('span');
      slotLabel.className = 'outfit-slot-label';
      slotLabel.textContent = slot.label;

      const itemName = document.createElement('strong');
      itemName.className = 'outfit-slot-name';
      itemName.textContent = item.name;

      const removeButton = document.createElement('button');
      removeButton.className = 'outfit-remove-button';
      removeButton.type = 'button';
      removeButton.setAttribute('aria-label', `Quitar ${item.name} del conjunto`);
      removeButton.textContent = '×';
      removeButton.addEventListener('click', () => {
        outfit[slot.id] = null;
        const message = document.querySelector('#look-message');
        message.classList.remove('is-error');
        message.textContent = `${item.name} ya no está en el conjunto.`;
        renderLookBuilder();
      });

      details.append(slotLabel, itemName);
      card.append(image, removeButton, details);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'outfit-slot-placeholder';

      const icon = document.createElement('span');
      icon.className = 'outfit-slot-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = slot.icon;

      const emptyLabel = document.createElement('span');
      emptyLabel.className = 'outfit-slot-label';
      emptyLabel.textContent = slot.label;

      const prompt = document.createElement('small');
      prompt.textContent = 'Añadir prenda';

      placeholder.append(icon, emptyLabel, prompt);
      card.append(placeholder);
    }
    return card;
  });
  container.replaceChildren(...cards);
}

function renderLookWardrobe() {
  const container = document.querySelector('#look-item-grid');
  const emptyMessage = document.querySelector('#look-empty-wardrobe');
  const countLabel = document.querySelector('#look-wardrobe-count');
  countLabel.textContent = `${wardrobeItems.length} ${wardrobeItems.length === 1 ? 'prenda disponible' : 'prendas disponibles'}`;
  emptyMessage.hidden = wardrobeItems.length > 0;

  const cards = wardrobeItems.map((item) => {
    const slot = getOutfitSlot(item);
    const isSelected = slot && outfit[slot.id]?.id === item.id;
    const button = document.createElement('button');
    button.className = `look-item-card${isSelected ? ' is-in-outfit' : ''}`;
    button.type = 'button';
    button.setAttribute('aria-pressed', String(Boolean(isSelected)));
    button.setAttribute('aria-label', `${isSelected ? 'Quitar' : 'Añadir'} ${item.name}, ${item.category}, ${item.color}`);

    const image = document.createElement('img');
    image.src = item.image;
    image.alt = getItemAlt(item);
    image.loading = 'lazy';

    const details = document.createElement('span');
    details.className = 'look-item-details';

    const name = document.createElement('strong');
    name.textContent = item.name;

    const category = document.createElement('small');
    category.textContent = `${item.category} · ${item.color}`;

    const affordance = document.createElement('span');
    affordance.className = 'look-item-affordance';
    affordance.setAttribute('aria-hidden', 'true');
    affordance.textContent = isSelected ? '✓' : '+';

    details.append(name, category);
    button.append(image, details, affordance);
    button.addEventListener('click', () => {
      const message = document.querySelector('#look-message');
      message.classList.remove('is-error');
      if (!slot) {
        message.textContent = 'Esta prenda no tiene un espacio disponible en el conjunto.';
        return;
      }
      outfit[slot.id] = isSelected ? null : item;
      message.textContent = isSelected
        ? `${item.name} ya no está en el conjunto.`
        : `${item.name} añadida en ${slot.label.toLowerCase()}.`;
      renderLookBuilder();
    });
    return button;
  });
  container.replaceChildren(...cards);
}

function renderLookBuilder() {
  if (!lookView) return;
  renderOutfitSlots();
  renderLookWardrobe();
  document.querySelector('#outfit-occasion-label').textContent = selectedOccasion;
  document.querySelectorAll('.look-occasion').forEach(button => {
    const selected = button.dataset.occasion === selectedOccasion;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelector('#outfit-empty-hint').hidden = Object.values(outfit).some(Boolean);
  document.querySelector('#choose-first-item').textContent = wardrobeItems.length ? 'Elegir mi primera prenda ↓' : 'Preparar mi armario ↗';
}

function loadFavoriteLooks() {
  try {
    const storedLooks = JSON.parse(localStorage.getItem(savedLooksKey) || '[]');
    return Array.isArray(storedLooks) ? storedLooks : [];
  } catch (error) {
    console.warn('No se pudieron leer los looks favoritos.', error);
    return [];
  }
}

function getFavoriteItemImage(item) {
  return item.image || wardrobeItems.find((wardrobeItem) => wardrobeItem.id === item.id)?.image || '';
}

function makeFavoriteCard(look) {
  const card = document.createElement('article');
  card.className = 'favorite-card';

  const heading = document.createElement('div');
  heading.className = 'favorite-card-heading';

  const occasion = document.createElement('span');
  occasion.className = 'favorite-occasion';
  occasion.textContent = look.occasion || 'Universidad';

  const date = document.createElement('time');
  date.className = 'favorite-date';
  const savedDate = new Date(look.createdAt);
  date.dateTime = Number.isNaN(savedDate.valueOf()) ? '' : savedDate.toISOString();
  date.textContent = Number.isNaN(savedDate.valueOf())
    ? 'Fecha no disponible'
    : new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(savedDate);
  heading.append(occasion, date);

  const gallery = document.createElement('div');
  gallery.className = 'favorite-look-images';
  (Array.isArray(look.items) ? look.items : []).forEach((item) => {
    const figure = document.createElement('figure');
    figure.className = 'favorite-look-item';
    const imageSource = getFavoriteItemImage(item);

    if (imageSource) {
      const image = document.createElement('img');
      image.src = imageSource;
      image.alt = getItemAlt(item);
      image.loading = 'lazy';
      figure.append(image);
    } else {
      const placeholder = document.createElement('span');
      placeholder.className = 'favorite-image-placeholder';
      placeholder.textContent = '✳';
      placeholder.setAttribute('aria-hidden', 'true');
      figure.append(placeholder);
    }

    const caption = document.createElement('figcaption');
    caption.textContent = item.name || item.category || 'Prenda';
    figure.append(caption);
    gallery.append(figure);
  });

  const summary = document.createElement('div');
  summary.className = 'favorite-card-summary';
  const count = document.createElement('span');
  const itemCount = Array.isArray(look.items) ? look.items.length : 0;
  count.textContent = `${itemCount} ${itemCount === 1 ? 'prenda' : 'prendas'}`;
  summary.append(count);

  const actions = document.createElement('div');
  actions.className = 'favorite-card-actions';
  const deleteButton = document.createElement('button');
  deleteButton.className = 'secondary-button favorite-delete-button';
  deleteButton.type = 'button';
  deleteButton.textContent = 'Eliminar';
  deleteButton.setAttribute('aria-label', `Eliminar look de ${look.occasion || 'Universidad'}`);
  deleteButton.addEventListener('click', () => deleteFavoriteLook(look.id));

  const downloadButton = document.createElement('button');
  downloadButton.className = 'primary-button favorite-download-button';
  downloadButton.type = 'button';
  downloadButton.innerHTML = 'Descargar look <span aria-hidden="true">↓</span>';
  downloadButton.addEventListener('click', () => downloadFavoriteLook(look, downloadButton));
  actions.append(deleteButton, downloadButton);

  card.append(heading, gallery, summary, actions);
  return card;
}

function renderFavorites() {
  const grid = document.querySelector('#favorites-grid');
  const emptyState = document.querySelector('#favorites-empty');
  document.querySelector('#favorites-count').textContent = `${favoriteLooks.length} ${favoriteLooks.length === 1 ? 'look guardado' : 'looks guardados'}`;
  emptyState.hidden = favoriteLooks.length > 0;
  grid.hidden = favoriteLooks.length === 0;
  grid.replaceChildren(...favoriteLooks.map(makeFavoriteCard));
}

function loadFavoriteLooks() {
  try {
    const storedLooks = JSON.parse(localStorage.getItem(savedLooksKey) || '[]');
    return Array.isArray(storedLooks) ? storedLooks : [];
  } catch (error) {
    console.warn('No se pudieron leer los looks favoritos.', error);
    return [];
  }
}

function getFavoriteItemImage(item) {
  return item.image || wardrobeItems.find((wardrobeItem) => wardrobeItem.id === item.id)?.image || '';
}

const recommendationStyleAffinity = {
  Universidad: ['Casual', 'Deportivo'],
  Cena: ['Elegante', 'Fiesta'],
  Fiesta: ['Fiesta', 'Elegante'],
  Viaje: ['Casual', 'Deportivo'],
  ...Object.fromEntries(Object.entries(newOccasionRules).map(([name, rule]) => [name, rule.styles]))
};

function getRecommendationScore(item, preferences, role) {
  let score = item.style === preferences.style ? 6 : 0;
  if (recommendationStyleAffinity[preferences.occasion]?.includes(item.style)) score += 2;
  if (item.occasions?.length) score += item.occasions.includes(preferences.occasion) ? 4 : -1;
  if (item.weather?.length) score += item.weather.includes(preferences.weather) ? 5 : -2;
  if (preferences.color && item.color?.toLocaleLowerCase('es').includes(preferences.color.toLocaleLowerCase('es'))) score += 5;
  if (preferences.weather === 'Calor' && ['Camisetas', 'Vestidos'].includes(item.category)) score += 2;
  if (preferences.weather === 'Frío' && item.category === 'Chaquetas') score += 4;
  if (preferences.weather === 'Lluvia' && ['Chaquetas', 'Calzado'].includes(item.category)) score += 3;
  if (preferences.weather === 'Entretiempo' && item.category === 'Chaquetas') score += 2;
  if (role === 'main' && ['Cena', 'Fiesta'].includes(preferences.occasion) && item.category === 'Vestidos') score += 2;
  if (role === 'main' && preferences.occasion === 'Viaje' && item.category === 'Camisetas') score += 1;
  return score + climateRecommendationScore(item, preferences, role);
}

function chooseRecommendationItem(candidates, preferences, role, offset = 0) {
  const compatible = candidates.filter((item) =>
    recommendationItemIsSafe(item, preferences) &&
    (!item.occasions?.length || item.occasions.includes(preferences.occasion)) &&
    (!item.weather?.length || item.weather.includes(preferences.weather)));
  if (compatible.length === 0) return null;
  const ranked = compatible
    .map((item, index) => ({ item, index, score: getRecommendationScore(item, preferences, role) }))
    .sort((first, second) => second.score - first.score || first.index - second.index);
  const bestScore = ranked[0].score;
  const alternatives = ranked.filter((entry) => entry.score >= bestScore - 2).slice(0, 3);
  const variation = (recommendationSequence + offset) % alternatives.length;
  return alternatives[variation].item;
}

function createRecommendation(preferences) {
  if (newOccasionRules[preferences.occasion]) return createOccasionRecommendation(preferences);
  const mainCandidates = wardrobeItems.filter((item) => ['Camisetas', 'Vestidos'].includes(item.category));
  const main = chooseRecommendationItem(mainCandidates, preferences, 'main');
  if (!main) return null;

  const chosenItems = [main];
  const addFromCategory = (category, role, offset) => {
    const item = chooseRecommendationItem(wardrobeItems.filter((candidate) => candidate.category === category), preferences, role, offset);
    if (item) chosenItems.push(item);
  };

  if (main.category !== 'Vestidos') {
    const bottom = chooseRecommendationItem(wardrobeItems.filter((item) => ['Pantalones', 'Faldas'].includes(item.category)), preferences, 'bottom', 1);
    if (bottom) chosenItems.push(bottom);
  }
  if (['Frío', 'Lluvia', 'Entretiempo'].includes(preferences.weather)) addFromCategory('Chaquetas', 'outerwear', 2);
  addFromCategory('Calzado', 'shoes', 3);

  const accessories = wardrobeItems.filter((item) => ['Bolsos', 'Accesorios'].includes(item.category));
  const accessory = chooseRecommendationItem(accessories, preferences, 'accessory', 4);
  if (accessory) chosenItems.push(accessory);

  return { ...preferences, items: chosenItems, createdAt: new Date().toISOString() };
}

function getRecommendationReason(recommendation) {
  if (newOccasionRules[recommendation.occasion]) {
    return recommendation.partial
      ? 'Un punto de partida con las prendas compatibles que ya tienes. Puedes completar la propuesta a tu ritmo.'
      : 'Una combinación elegida según tus planes y el clima, con prendas de tu armario.';
  }
  const reasons = {
    Calor: 'Las prendas ligeras te acompañan con comodidad.',
    Frío: recommendation.items.some((item) => item.category === 'Chaquetas')
      ? 'Incluye una chaqueta para sumar una capa abrigada.'
      : 'Una base cómoda para los días frescos.',
    Lluvia: recommendation.items.some((item) => item.category === 'Chaquetas')
      ? 'La chaqueta añade una capa práctica para un día lluvioso.'
      : 'Una combinación sencilla para moverte con comodidad.',
    Entretiempo: 'Una mezcla versátil para temperaturas cambiantes.'
  };
  const matchedColor = recommendation.color && recommendation.items.some((item) => item.color?.toLocaleLowerCase('es').includes(recommendation.color.toLocaleLowerCase('es')));
  const colorNote = matchedColor ? ` Además, incorpora tu preferencia por el ${recommendation.color.toLowerCase()}.` : '';
  return `${reasons[recommendation.weather]} Va con tus planes de ${recommendation.occasion.toLowerCase()} y el estilo ${recommendation.style.toLowerCase()}.${colorNote}`;
}

function renderRecommendationItems(items) {
  const container = document.querySelector('#recommendation-items');
  container.replaceChildren(...items.map((item) => {
    const card = document.createElement('article');
    card.className = 'recommendation-item-card';
    const image = document.createElement('img');
    image.src = getFavoriteItemImage(item);
    image.alt = getItemAlt(item);
    image.loading = 'lazy';
    const details = document.createElement('div');
    details.className = 'recommendation-item-details';
    const name = document.createElement('strong');
    name.textContent = item.name || item.category;
    const meta = document.createElement('span');
    meta.textContent = [item.category, item.color].filter(Boolean).join(' · ');
    details.append(name, meta);
    card.append(image, details);
    return card;
  }));
}

function renderRecommendationView() {
  const empty = document.querySelector('#recommendation-empty');
  const insufficient = !wardrobeItems.some(item => item.category === 'Vestidos') &&
    (!wardrobeItems.some(item => item.category === 'Camisetas') || !wardrobeItems.some(item => ['Pantalones', 'Faldas'].includes(item.category)));
  empty.hidden = Boolean(currentRecommendation) || (wardrobeItems.length > 0 && !insufficient);
  document.querySelector('#recommendation-empty-title').textContent = wardrobeItems.length ? 'Completa tu armario para empezar' : 'Tu próxima idea empieza en el armario';
  document.querySelector('#recommendation-empty-description').textContent = 'Añade una parte superior y una prenda inferior, o un vestido, además de calzado. También puedes restablecer las prendas de ejemplo en Mi armario.';
  document.querySelector('#recommendation-generate').disabled = wardrobeItems.length === 0;
  const result = document.querySelector('#recommendation-result');
  result.hidden = !currentRecommendation;
  if (!currentRecommendation) return;

  const { occasion, weather, style, items } = currentRecommendation;
  document.querySelector('#recommendation-items').classList.toggle('is-partial', Boolean(currentRecommendation.partial));
  document.querySelector('#recommendation-name').textContent = getRecommendationName(occasion, style);
  document.querySelector('#recommendation-reason').textContent = getRecommendationReason(currentRecommendation);
  document.querySelector('#recommendation-occasion-tag').textContent = occasion;
  document.querySelector('#recommendation-weather-tag').textContent = weather;
  document.querySelector('#recommendation-style-tag').textContent = style;
  renderRecommendationItems(items);
}

function getRecommendationName(occasion, style) {
  const labels = {
    Universidad: 'Para un día de ideas nuevas',
    Cena: 'Un toque especial para la noche',
    Fiesta: 'Lista para celebrar',
    Viaje: 'Comodidad para el camino',
    ...Object.fromEntries(Object.entries(newOccasionRules).map(([name, rule]) => [name, rule.title]))
  };
  return `${labels[occasion] || 'Una propuesta para hoy'} · ${style}`;
}

function readRecommendationPreferences() {
  const form = document.querySelector('#recommendation-form');
  return {
    occasion: form.elements.occasion.value,
    weather: form.elements.weather.value,
    style: form.elements.style.value,
    color: form.elements.color.value
  };
}

function generateRecommendation() {
  const message = document.querySelector('#recommendation-message');
  document.querySelector('#recommendation-complete-link')?.remove();
  recommendationSequence += 1;
  const recommendation = createRecommendation(readRecommendationPreferences());
  if (!recommendation || recommendation.items.length === 0) {
    currentRecommendation = null;
    renderRecommendationView();
    message.textContent = recommendation?.missing?.length
      ? `Para estos planes podrías añadir ${recommendation.missing.join(', ')}.`
      : 'No hay partes superiores ni vestidos compatibles con esta ocasión y clima. Prueba otras preferencias o añade prendas en Mi armario.';
    document.querySelector('#recommendation-empty').hidden = false;
    document.querySelector('#recommendation-empty-title').textContent = 'Faltan prendas para estos planes';
    document.querySelector('#recommendation-empty-description').textContent = 'Prueba otro clima u ocasión, o añade prendas que encajen con tus planes. Tu ropa guardada seguirá disponible.';
    return;
  }
  currentRecommendation = recommendation;
  const missing = recommendation.missing ? [...recommendation.missing] : [];
  if (!recommendation.missing) {
    if (recommendation.weather === 'Frío' || recommendation.weather === 'Lluvia') {
      if (!recommendation.items.some((item) => item.category === 'Chaquetas')) missing.push('chaqueta');
    }
    if (recommendation.items[0].category !== 'Vestidos' && !recommendation.items.some((item) => ['Pantalones', 'Faldas'].includes(item.category))) missing.push('prendas inferiores');
    if (!recommendation.items.some((item) => item.category === 'Calzado')) missing.push('calzado');
    if (!recommendation.items.some((item) => ['Bolsos', 'Accesorios'].includes(item.category))) missing.push('bolso o accesorios');
  }
  document.querySelector('#recommendation-complete-link')?.remove();
  if (missing.length) {
    const link = document.createElement('a');
    link.id = 'recommendation-complete-link';
    link.className = 'text-link';
    link.href = '#armario';
    link.textContent = 'Completar mi armario ↗';
    message.after(link);
  }
  message.textContent = missing.length ? `Propuesta parcial con tu armario. Para completarla, añade ${missing.join(', ')}.` : 'Propuesta creada con prendas disponibles en tu armario.';
  renderRecommendationView();
}

document.querySelector('#recommendation-form').addEventListener('submit', (event) => {
  event.preventDefault();
  generateRecommendation();
});

document.querySelector('#recommendation-another').addEventListener('click', generateRecommendation);

document.querySelector('#recommendation-edit').addEventListener('click', () => {
  if (!currentRecommendation) return;
  outfit = Object.fromEntries(outfitSlots.map((slot) => [slot.id, null]));
  currentRecommendation.items.forEach((item) => {
    const slot = getOutfitSlot(item);
    if (slot) outfit[slot.id] = item;
  });
  selectedOccasion = currentRecommendation.occasion;
  navigateTo('#crear-look');
});

document.querySelector('#recommendation-save').addEventListener('click', async (event) => {
  if (!currentRecommendation) return;
  const button = event.currentTarget;
  const feedback = document.querySelector('#recommendation-feedback');
  button.disabled = true;
  try {
    const savedItems = await Promise.all(currentRecommendation.items.map(async (item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      color: item.color,
      style: item.style,
      image: await createFavoriteThumbnail(item.image)
    })));
    const savedLook = {
      id: `look-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: getRecommendationName(currentRecommendation.occasion, currentRecommendation.style),
      occasion: currentRecommendation.occasion,
      weather: currentRecommendation.weather,
      style: currentRecommendation.style,
      color: currentRecommendation.color,
      createdAt: new Date().toISOString(),
      items: savedItems
    };
    const updatedLooks = [savedLook, ...favoriteLooks];
    localStorage.setItem(savedLooksKey, JSON.stringify(updatedLooks));
    favoriteLooks = updatedLooks;
    renderFavorites();
    feedback.textContent = 'Tu propuesta ya está guardada en Favoritos.';
    showToast('Propuesta guardada en Favoritos.');
  } catch (error) {
    console.warn('No se pudo guardar la recomendación.', error);
    feedback.textContent = 'No se pudo guardar la propuesta. Comprueba el espacio disponible.';
    showToast('No se pudo guardar la propuesta. Comprueba el espacio disponible.', true);
  } finally {
    button.disabled = false;
  }
});

document.querySelector('#recommendation-download').addEventListener('click', (event) => {
  if (!currentRecommendation) return;
  const button = event.currentTarget;
  downloadFavoriteLook({
    ...currentRecommendation,
    id: `recommendation-${Date.now()}`,
    name: getRecommendationName(currentRecommendation.occasion, currentRecommendation.style)
  }, button);
});

async function deleteFavoriteLook(id) {
  const look = favoriteLooks.find(look => look.id === id);
  if (!look || !await confirmAction('¿Eliminar este favorito?', 'Se eliminará «' + (look.name || 'Look de ' + look.occasion) + '» de Favoritos. Las prendas de tu armario se conservarán.', 'Eliminar favorito')) return;
  const updatedLooks = favoriteLooks.filter((look) => look.id !== id);
  try {
    localStorage.setItem(savedLooksKey, JSON.stringify(updatedLooks));
    favoriteLooks = updatedLooks;
    renderFavorites();
    showToast('Look eliminado de Favoritos.');
    document.querySelector('#favorites-title').setAttribute('tabindex', '-1');
    document.querySelector('#favorites-title').focus({ preventScroll: true });
  } catch (error) {
    showToast('No se pudo eliminar el favorito. Inténtalo de nuevo.', true);
    console.warn('No se pudo eliminar el look favorito.', error);
    document.querySelector('#favorites-count').textContent = 'No se pudo guardar el cambio. Inténtalo de nuevo.';
  }
}

async function createFavoriteThumbnail(source) {
  if (!source.startsWith('data:image/')) return source;
  const image = new Image();
  image.src = source;
  await image.decode();
  const maxDimension = 360;
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) return source;
  context.fillStyle = '#fbf9f6';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.7);
}

function loadCanvasImage(source) {
  return new Promise((resolve) => {
    if (!source) {
      resolve(null);
      return;
    }
    const image = new Image();
    if (/^https?:/i.test(source)) image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

function drawCoverImage(context, image, x, y, width, height) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawnWidth = image.naturalWidth * scale;
  const drawnHeight = image.naturalHeight * scale;
  context.drawImage(image, x + (width - drawnWidth) / 2, y + (height - drawnHeight) / 2, drawnWidth, drawnHeight);
}

function shortenCanvasText(context, text, maxWidth) {
  let shortened = text;
  while (shortened.length > 0 && context.measureText(`${shortened}…`).width > maxWidth) {
    shortened = shortened.slice(0, -1);
  }
  return shortened.length < text.length ? `${shortened}…` : text;
}

async function downloadFavoriteLook(look, button) {
  const originalText = button.firstChild.textContent;
  button.disabled = true;
  button.firstChild.textContent = 'Preparando imagen ';

  try {
    const items = Array.isArray(look.items) ? look.items : [];
    const images = await Promise.all(items.map((item) => loadCanvasImage(getFavoriteItemImage(item))));
    const columns = Math.min(3, Math.max(1, items.length));
    const rows = Math.ceil(items.length / 3);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 430 + rows * 365 + 80;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas no disponible');

    const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    background.addColorStop(0, '#fbf9f6');
    background.addColorStop(1, '#f4eee9');
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#bd8589';
    context.fillRect(0, 0, canvas.width, 10);
    context.globalAlpha = 0.5;
    context.fillStyle = '#ded6e5';
    context.beginPath();
    context.arc(1095, 115, 100, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;

    context.fillStyle = '#282321';
    context.font = '600 44px Georgia, serif';
    context.fillText('ClosetVibe', 72, 103);
    context.fillStyle = '#817975';
    context.font = '600 13px "Segoe UI", sans-serif';
    context.fillText('UN LOOK PARA', 74, 154);
    context.fillStyle = '#bd8589';
    context.font = 'italic 62px Georgia, serif';
    context.fillText(shortenCanvasText(context, look.occasion || 'Universidad', 720), 72, 225);
    context.fillStyle = '#817975';
    context.font = '15px "Segoe UI", sans-serif';
    context.fillText(`${items.length} ${items.length === 1 ? 'prenda' : 'prendas'} · ${new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(look.createdAt))}`, 76, 263);
    context.strokeStyle = 'rgba(40, 35, 33, 0.15)';
    context.beginPath();
    context.moveTo(72, 296);
    context.lineTo(canvas.width - 72, 296);
    context.stroke();

    const padding = 72;
    const gap = 22;
    const tileWidth = (canvas.width - padding * 2 - gap * 2) / 3;
    const tileHeight = 336;
    const imageHeight = 260;
    const startY = 330;
    items.forEach((item, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const x = padding + column * (tileWidth + gap);
      const y = startY + row * (tileHeight + gap);
      context.fillStyle = '#fffdfa';
      context.fillRect(x, y, tileWidth, tileHeight);
      context.fillStyle = '#eee5df';
      context.fillRect(x, y, tileWidth, imageHeight);
      if (images[index]) drawCoverImage(context, images[index], x, y, tileWidth, imageHeight);
      else {
        context.fillStyle = '#ded6e5';
        context.fillRect(x, y, tileWidth, imageHeight);
        context.fillStyle = '#665c69';
        context.font = '24px Georgia, serif';
        context.fillText('Imagen no disponible', x + 18, y + imageHeight / 2);
      }
      context.fillStyle = '#282321';
      context.font = '500 19px Georgia, serif';
      context.fillText(shortenCanvasText(context, item.name || 'Prenda', tileWidth - 32), x + 16, y + imageHeight + 31);
      context.fillStyle = '#817975';
      context.font = '12px "Segoe UI", sans-serif';
      context.fillText(shortenCanvasText(context, `${item.category || ''}${item.color ? ` · ${item.color}` : ''}`, tileWidth - 32), x + 16, y + imageHeight + 56);
    });

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error('No se pudo crear el PNG')), 'image/png');
    });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `ClosetVibe-look-${(look.occasion || 'favorito').toLowerCase()}.png`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    button.title = 'El PNG del look se ha descargado.';
    showToast('Imagen preparada. Descarga iniciada.');
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch (error) {
    console.error('No se pudo descargar el look.', error);
    button.title = 'No se pudo generar la imagen. Inténtalo de nuevo.';
    showToast('No se pudo descargar la imagen. Inténtalo de nuevo.', true);
  } finally {
    button.disabled = false;
    button.firstChild.textContent = originalText;
  }
}

document.querySelectorAll('.look-occasion').forEach((button) => {
  button.addEventListener('click', () => {
    selectedOccasion = button.dataset.occasion;
    document.querySelectorAll('.look-occasion').forEach((occasionButton) => {
      const isSelected = occasionButton === button;
      occasionButton.classList.toggle('is-selected', isSelected);
      occasionButton.setAttribute('aria-pressed', String(isSelected));
    });
    const message = document.querySelector('#look-message');
    message.classList.remove('is-error');
    message.textContent = `Ocasión: ${selectedOccasion}.`;
    document.querySelector('#outfit-occasion-label').textContent = selectedOccasion;
  });
});

document.querySelector('#clear-outfit').addEventListener('click', () => {
  outfit = Object.fromEntries(outfitSlots.map((slot) => [slot.id, null]));
  const message = document.querySelector('#look-message');
  message.classList.remove('is-error');
  message.textContent = 'Conjunto limpio. Tienes un lienzo nuevo para combinar.';
  renderLookBuilder();
});

document.querySelector('#save-look').addEventListener('click', async (event) => {
  const selectedItems = outfitSlots.map((slot) => outfit[slot.id]).filter(Boolean);
  const message = document.querySelector('#look-message');

  if (selectedItems.length === 0) {
    message.textContent = 'Tu look empieza con una prenda que te encante. Elige una para guardarlo.';
    message.classList.add('is-error');
    return;
  }

  const button = event.currentTarget;
  button.disabled = true;
  button.firstChild.textContent = 'Guardando look ';

  try {
    const storedLooks = JSON.parse(localStorage.getItem(savedLooksKey) || '[]');
    const savedLooks = Array.isArray(storedLooks) ? storedLooks : [];
    const favoriteItems = await Promise.all(selectedItems.map(async (item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      color: item.color,
      style: item.style,
      image: await createFavoriteThumbnail(item.image)
    })));
    savedLooks.unshift({
      id: `look-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: `Look de ${selectedOccasion}`,
      occasion: selectedOccasion,
      createdAt: new Date().toISOString(),
      items: favoriteItems
    });
    localStorage.setItem(savedLooksKey, JSON.stringify(savedLooks));
    favoriteLooks = savedLooks;
    renderFavorites();
    message.textContent = `Tu look para ${selectedOccasion.toLowerCase()} ya está guardado en Favoritos.`;
    message.classList.remove('is-error');
    showToast('Look guardado en Favoritos.');
  } catch (error) {
    showToast('No se pudo guardar el look. Comprueba el espacio disponible.', true);
    console.warn('No se pudo guardar el look.', error);
    message.textContent = 'No se pudo guardar este look. Comprueba el espacio disponible en el navegador.';
    message.classList.add('is-error');
  } finally {
    button.disabled = false;
    button.firstChild.textContent = 'Guardar look ';
  }
});

document.querySelector('#open-item-dialog').addEventListener('click', () => itemDialog.showModal());
document.querySelector('#empty-add-item').addEventListener('click', () => itemDialog.showModal());
document.querySelector('#choose-first-item').addEventListener('click', () => {
  if (!wardrobeItems.length) return navigateTo('#armario');
  const firstItem = document.querySelector('.look-item-card');
  firstItem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  firstItem?.focus({ preventScroll: true });
});
document.querySelector('#restore-samples').addEventListener('click', async () => {
  if (!await confirmAction('¿Restablecer las prendas de ejemplo?', `Se añadirán únicamente las prendas de ejemplo que falten, hasta completar las ${allSampleItems.length}. Tus prendas manuales, tus favoritos y las muestras que ya tienes se conservarán.`, 'Restablecer prendas')) return;
  const updated = getRestoredWardrobeItems(wardrobeItems);
  const restoredCount = updated.length - wardrobeItems.length;
  if (!restoredCount) return showToast(`Ya tienes las ${allSampleItems.length} prendas de ejemplo.`);
  if (!saveItems(updated)) return showToast('No se pudieron restablecer las prendas. Comprueba el espacio disponible.', true);
  wardrobeItems = updated;
  currentRecommendation = null;
  document.querySelector('#recommendation-message').textContent = '';
  document.querySelector('#recommendation-complete-link')?.remove();
  renderItems();
  renderLookBuilder();
  renderRecommendationView();
  showToast(`${restoredCount} ${restoredCount === 1 ? 'prenda de ejemplo restablecida' : 'prendas de ejemplo restablecidas'}.`);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMobileMenu();
    menuToggle.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMobileMenu();
});
document.querySelector('#close-item-dialog').addEventListener('click', () => itemDialog.close());
document.querySelector('#cancel-item-dialog').addEventListener('click', () => itemDialog.close());

function clearImagePreview() {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  imagePreview.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  imagePreview.hidden = true;
  imagePlaceholder.hidden = false;
}

itemDialog.addEventListener('close', () => {
  itemForm.reset();
  formMessage.textContent = '';
  clearImagePreview();
});

itemDialog.addEventListener('click', (event) => {
  if (event.target === itemDialog) itemDialog.close();
});

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  clearImagePreview();
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    formMessage.textContent = 'Selecciona un archivo de imagen válido.';
    imageInput.value = '';
    return;
  }
  previewUrl = URL.createObjectURL(file);
  imagePreview.src = previewUrl;
  imagePreview.hidden = false;
  imagePlaceholder.hidden = true;
  formMessage.textContent = '';
});

// Reduce el peso con canvas conservando la proporción original de la imagen.
async function compressImage(file) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const maxDimension = 1200;
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas no disponible');
    context.fillStyle = '#fbf9f6';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

itemForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formMessage.textContent = '';
  saveItemButton.disabled = true;
  saveItemButton.firstChild.textContent = 'Guardando prenda ';

  try {
    const file = imageInput.files[0];
    const image = await compressImage(file);
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: itemForm.elements.name.value.trim(),
      category: itemForm.elements.category.value,
      color: itemForm.elements.color.value.trim(),
      style: itemForm.elements.style.value,
      image
    };
    const updatedItems = [newItem, ...wardrobeItems];

    if (!saveItems(updatedItems)) {
      formMessage.textContent = 'No hay espacio suficiente para guardar esta imagen. Prueba con una más pequeña.';
      return;
    }

    wardrobeItems = updatedItems;
    activeFilter = 'Todas';
    document.querySelectorAll('.filter-button').forEach((button) => {
      const isSelected = button.dataset.filter === 'Todas';
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
    });
    renderItems();
    itemDialog.close();
    renderLookBuilder();
    renderRecommendationView();
    showToast('Prenda añadida a tu armario.');
  } catch (error) {
    console.error('No se pudo procesar la imagen.', error);
    formMessage.textContent = 'No se pudo procesar esta imagen. Prueba con otro archivo.';
  } finally {
    saveItemButton.disabled = false;
    saveItemButton.firstChild.textContent = 'Guardar prenda ';
  }
});

renderItems();
showRoute(window.location.hash || '#inicio', false);
