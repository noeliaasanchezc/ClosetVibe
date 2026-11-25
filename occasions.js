// Opciones compartidas y ampliación conservadora de las ocasiones de las muestras.
const closetOccasions = [
  { name: 'Universidad', image: 'assets/samples/20091.jpg', tag: 'CÓMODA Y TÚ' },
  { name: 'Cena', image: 'assets/samples/10406.jpg', tag: 'UN TOQUE ESPECIAL' },
  { name: 'Fiesta', image: 'assets/samples/6873.jpg', tag: 'HOY BRILLAS TÚ' },
  { name: 'Viaje', image: 'assets/samples/12531.jpg', tag: 'LISTA PARA IR' },
  { name: 'Trabajo / entrevista', image: 'assets/samples/extra-25.jpg', tag: 'CON CONFIANZA' },
  { name: 'Comida o brunch', image: 'assets/samples/extra-31.jpg', tag: 'PLANES SIN PRISA' },
  { name: 'Boda / evento formal', image: 'assets/samples/extra-34.jpg', tag: 'UN DÍA ESPECIAL' },
  { name: 'Deporte', image: 'assets/samples/3505.jpg', tag: 'A TU RITMO' },
  { name: 'Día de playa', image: 'assets/samples/53130.jpg', tag: 'SOL Y CALMA' },
  { name: 'Campo / naturaleza', image: 'assets/samples/sample-complete-033.jpg', tag: 'RESPIRA Y EXPLORA' }
];
const sampleOccasionAdditions = {
  'sample-1': [5,8], 'sample-2': [5], 'sample-3': [5,8], 'sample-4': [4,5,6],
  'sample-5': [5,7], 'sample-6': [4,5,8], 'sample-7': [4,5,8], 'sample-8': [4,5],
  'sample-9': [5], 'sample-10': [5,6], 'sample-11': [5], 'sample-12': [6],
  'sample-extra-01': [4,5,8], 'sample-extra-02': [5], 'sample-extra-03': [4,5],
  'sample-extra-04': [7], 'sample-extra-05': [5], 'sample-extra-06': [4,5],
  'sample-extra-07': [5], 'sample-extra-08': [5,8], 'sample-extra-09': [5],
  'sample-extra-10': [6], 'sample-extra-11': [4,5,6], 'sample-extra-12': [4,5,6],
  'sample-extra-13': [5], 'sample-extra-14': [4,6], 'sample-extra-15': [7],
  'sample-extra-16': [5,7], 'sample-extra-17': [5], 'sample-extra-18': [6],
  'sample-extra-19': [5], 'sample-extra-20': [5,8], 'sample-extra-21': [6],
  'sample-extra-22': [5,8], 'sample-extra-23': [4,5], 'sample-extra-24': [5,6],
  'sample-extra-25': [4,5], 'sample-extra-26': [5,8], 'sample-extra-27': [4,5],
  'sample-extra-28': [4,5,8], 'sample-extra-29': [4,5,8], 'sample-extra-30': [5],
  'sample-extra-31': [4,5], 'sample-extra-32': [5], 'sample-extra-33': [4,5],
  'sample-extra-34': [5,6], 'sample-extra-35': [5,6], 'sample-extra-36': [4,5]
};

function expandedSampleOccasions(item) {
  return [...new Set([...(item.occasions || []), ...(sampleOccasionAdditions[item.id] || []).map(index => closetOccasions[index].name)])];
}

function migrateSampleOccasions(items, catalog) {
  const key = 'closetvibe-sample-occasions-v1';
  try {
    if (localStorage.getItem(key) === 'done') return items;
    const known = new Map(catalog.map(item => [item.id, item]));
    const updated = items.map(item => {
      const sample = known.get(item.id);
      // Una colisión de ID no convierte una prenda personal en una muestra.
      if (!sample || item.name !== sample.name || item.category !== sample.category || item.image !== sample.image) return item;
      const occasions = expandedSampleOccasions(item);
      return JSON.stringify(occasions) === JSON.stringify(item.occasions) ? item : { ...item, occasions };
    });
    if (updated.some((item, index) => item !== items[index]) && !saveItems(updated)) return items;
    try { localStorage.setItem(key, 'done'); } catch (error) { console.warn('No se pudo marcar la actualización de ocasiones.', error); }
    return updated;
  } catch (error) {
    console.warn('No se pudieron ampliar las ocasiones de muestra.', error);
    return items;
  }
}

// Los tipos afinan las categorías existentes sin reescribir prendas guardadas.
function garmentKind(item) {
  if (item.kind) return item.kind;
  const name = (item.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const matches = [
    [/bikini|banador/, 'swimwear'], [/camisa.*playa|kimono/, 'beach-shirt'],
    [/chancla/, 'flip-flops'], [/impermeable|chubasquero/, 'raincoat'],
    [/acolchad|plumifer/, 'puffer'], [/abrigo/, 'coat'], [/blazer|americana/, 'blazer'],
    [/biker|cuero/, 'biker'], [/chaqueta deportiv/, 'sports-jacket'], [/cardigan/, 'cardigan'],
    [/jersey/, 'knit'], [/sudadera/, 'sweatshirt'], [/legging|malla|jogger|chandal/, 'leggings'],
    [/vaquero/, item.category === 'Faldas' ? 'skirt' : item.category === 'Camisetas' ? 'shirt' : 'jeans'],
    [/cargo/, 'cargo'], [/pantalon.*(?:elegante|vestir|fluido)/, 'tailored-pants'],
    [/falda/, 'skirt'], [/mono/, 'jumpsuit'], [/vestido.*(?:verano|estampado)/, 'summer-dress'],
    [/vestido/, item.style === 'Casual' ? 'summer-dress' : 'party-dress'],
    [/camisa(?!ta)/, 'shirt'], [/top.*deportiv|camiseta.*deportiv/, 'sport-top'], [/camiseta|top/, 'tshirt'],
    [/botin/, 'ankle-boots'], [/bota/, 'boots'], [/sandalia.*(?:tacon|dorad)/, 'heel-sandals'],
    [/sandalia.*plana/, 'flat-sandals'], [/tacon|salon/, 'pumps'],
    [/zapatilla/, item.style === 'Deportivo' ? 'gym-shoes' : 'sneakers'],
    [/mocasin/, 'loafers'], [/bailarina/, 'flats'], [/mochila/, 'backpack'],
    [/bolso.*(?:rafia|playa)/, 'beach-bag'], [/bolso.*(?:pequeno|fiesta|noche)|clutch/, 'clutch'],
    [/bolso|tote/, 'tote'], [/gafas/, 'sunglasses'], [/gorro/, 'beanie'], [/gorra/, 'cap'],
    [/bufanda|panuelo/, 'scarf'], [/guantes/, 'gloves'], [/pendiente/, 'earrings'],
    [/collar/, 'necklace'], [/pulsera/, 'bracelet'], [/anillo/, 'ring'], [/cinturon/, 'belt']
  ];
  return matches.find(([pattern]) => pattern.test(name))?.[1] || '';
}

function recommendationItemIsSafe(item, preferences) {
  const kind = garmentKind(item);
  if (preferences.weather === 'Calor' && ['boots','ankle-boots','coat','puffer','scarf','beanie','gloves','knit'].includes(kind)) return false;
  if (preferences.occasion === 'Día de playa' && preferences.weather !== 'Frío' && ['boots','ankle-boots','coat','puffer','scarf','beanie','gloves'].includes(kind)) return false;
  if (['Trabajo / entrevista','Universidad','Boda / evento formal'].includes(preferences.occasion) && ['swimwear','flip-flops','beach-shirt'].includes(kind)) return false;
  if (['Deporte','Campo / naturaleza'].includes(preferences.occasion) && ['pumps','heel-sandals','party-dress','formal-dress','jumpsuit'].includes(kind)) return false;
  return true;
}

function climateRecommendationScore(item, preferences, role) {
  const kind = garmentKind(item);
  if (preferences.occasion === 'Día de playa' && kind === 'flip-flops') return 13;
  if (preferences.occasion === 'Boda / evento formal' && role === 'main' && ['formal-dress','jumpsuit'].includes(kind)) return 8;
  if (preferences.occasion === 'Trabajo / entrevista' && role === 'main' && kind === 'shirt' && /formal|blanca/i.test(item.name)) return 6;
  if (['Universidad','Viaje'].includes(preferences.occasion) && preferences.weather !== 'Frío') {
    if (role === 'shoes' && ['sneakers','gym-shoes'].includes(kind)) return 8;
    if (role === 'bottom' && ['jeans','cargo'].includes(kind)) return 5;
    if (role === 'bag' && kind === 'backpack') return 4;
    if (role === 'bag' && kind === 'tote') return 2;
  }
  if (preferences.weather === 'Frío') {
    if (role === 'outerwear' && ['coat','puffer','raincoat'].includes(kind)) return 12;
    if (role === 'main' && ['knit','sweatshirt'].includes(kind)) return 10;
    if (role === 'shoes' && ['boots','ankle-boots'].includes(kind)) return 8;
    if (role === 'accessory' && kind === 'scarf') return 8;
  }
  if (preferences.weather === 'Lluvia' && role === 'outerwear' && kind === 'raincoat') return 14;
  if (preferences.weather === 'Calor') {
    if (['summer-dress','swimwear','flat-sandals','flip-flops'].includes(kind)) return 5;
    if (kind === 'tailored-pants' && /fluido/i.test(item.name)) return 4;
  }
  if (preferences.occasion === 'Deporte' && role === 'shoes' && kind === 'gym-shoes' && /gimnasio/i.test(item.name)) return 8;
  return 0;
}

const isKind = (...kinds) => item => kinds.includes(garmentKind(item));
const everydayMain = item => item.category === 'Camisetas' && ['tshirt','shirt','knit','sweatshirt'].includes(garmentKind(item));
const everydayBottom = item => ['Pantalones','Faldas'].includes(item.category) && !['leggings','swimwear'].includes(garmentKind(item));
const dailyBag = isKind('tote','crossbody','backpack');
const jewelry = isKind('earrings','party-earrings','necklace','bracelet','ring');
const eveningMain = item => ['Camisetas','Vestidos'].includes(item.category) && (['Elegante','Fiesta'].includes(item.style) || item.category === 'Camisetas' && /top/i.test(item.name)) && !['swimwear','sport-top','knit','sweatshirt'].includes(garmentKind(item));
const warmOuterwear = item => item.category === 'Chaquetas' && !['beach-shirt','sports-jacket'].includes(garmentKind(item));

const newOccasionRules = {
  Universidad: {
    styles: ['Casual','Deportivo'], title: 'Comodidad para tus clases',
    roles: [['main','una camiseta, camisa o jersey',everydayMain],['bottom','vaqueros, pantalón casual o falda',everydayBottom],['shoes','zapatillas, mocasines o bailarinas',isKind('sneakers','gym-shoes','loafers','flats','boots','ankle-boots','flat-sandals')],['bag','una mochila o un bolso de diario',dailyBag]]
  },
  Cena: {
    styles: ['Elegante','Fiesta'], title: 'Un conjunto para una cena especial',
    roles: [['main','un vestido, mono, camisa o top arreglado',eveningMain],['bottom','una falda o un pantalón elegante',item=>everydayBottom(item)&&['Elegante','Fiesta'].includes(item.style)],['shoes','calzado elegante',isKind('pumps','heel-sandals','loafers','flats')],['bag','un bolso',item=>item.category==='Bolsos'&&!['backpack','beach-bag'].includes(garmentKind(item))],['jewelry','unas joyas',jewelry]]
  },
  Fiesta: {
    styles: ['Fiesta','Elegante'], title: 'Lista para celebrar',
    roles: [['main','un vestido, mono o top de fiesta',eveningMain],['bottom','una falda o un pantalón elegante',item=>everydayBottom(item)&&['Elegante','Fiesta'].includes(item.style)],['shoes','tacones o sandalias de tacón',isKind('pumps','heel-sandals')],['bag','un bolso pequeño o de mano',isKind('clutch')],['jewelry','unos pendientes o un collar',jewelry]]
  },
  Viaje: {
    styles: ['Casual','Deportivo'], title: 'Comodidad para el camino',
    roles: [['main','una camiseta, camisa, jersey o sudadera',everydayMain],['bottom','vaqueros o un pantalón cómodo',item=>['Pantalones'].includes(item.category)&&['jeans','cargo','leggings','tailored-pants'].includes(garmentKind(item))],['shoes','zapatillas o calzado cómodo',isKind('sneakers','gym-shoes','loafers','boots','ankle-boots','flat-sandals')],['bag','una mochila o bolso de diario',dailyBag]]
  },
  'Trabajo / entrevista': {
    styles: ['Elegante','Casual'], title: 'Confianza para tus próximos pasos',
    roles: [['main','una camisa formal',item=>item.category==='Camisetas'&&garmentKind(item)==='shirt'],['bottom','un pantalón de vestir',item=>item.category==='Pantalones'&&garmentKind(item)==='tailored-pants'&&item.style==='Elegante'],['outerwear','un blazer',isKind('blazer')],['shoes','mocasines o bailarinas',isKind('loafers','flats')],['bag','un bolso de diario estructurado',isKind('tote','crossbody')]]
  },
  'Comida o brunch': {
    styles: ['Casual','Elegante'], title: 'Un look para disfrutar sin prisa',
    roles: [['main','una camisa, camiseta o vestido casual',item=>everydayMain(item)||garmentKind(item)==='summer-dress'],['bottom','vaqueros, falda o pantalón fluido',everydayBottom],['shoes','zapatillas, bailarinas o sandalias planas',isKind('sneakers','gym-shoes','flats','loafers','flat-sandals','boots','ankle-boots')],['bag','un bolso para el día',dailyBag]]
  },
  'Boda / evento formal': {
    styles: ['Elegante','Fiesta'], title: 'Para una celebración especial',
    roles: [['main','un vestido o mono elegante',item=>item.category==='Vestidos'&&['Elegante','Fiesta'].includes(item.style)&&!['summer-dress','swimwear'].includes(garmentKind(item))],['shoes','zapatos de salón o sandalias de tacón',isKind('pumps','heel-sandals')],['bag','un bolso de mano o clutch',isKind('clutch')],['jewelry','un collar o unos pendientes',jewelry]]
  },
  Deporte: {
    styles: ['Deportivo'], title: 'Comodidad para moverte a tu ritmo',
    roles: [['main','un top deportivo o una sudadera',item=>item.category==='Camisetas'&&item.style==='Deportivo'&&['sport-top','sweatshirt','tshirt'].includes(garmentKind(item))],['bottom','unos leggings o pantalón deportivo',item=>item.category==='Pantalones'&&garmentKind(item)==='leggings'&&item.style==='Deportivo'],['outerwear','una chaqueta deportiva con cremallera',isKind('sports-jacket')],['shoes','zapatillas deportivas de gimnasio',isKind('gym-shoes')]]
  },
  'Día de playa': {
    styles: ['Casual','Deportivo'], title: 'Un conjunto para disfrutar del mar',
    roles: [['main','un bikini o bañador',isKind('swimwear')],['beach-layer','una camisa ligera o kimono de playa',isKind('beach-shirt')],['shoes','chanclas o sandalias planas',isKind('flip-flops','flat-sandals')],['bag','un bolso de rafia o de playa',isKind('beach-bag')],['sunwear','gafas de sol',isKind('sunglasses')]]
  },
  'Campo / naturaleza': {
    styles: ['Casual','Deportivo'], title: 'Lista para respirar al aire libre',
    roles: [['main','una camiseta, jersey o sudadera',item=>everydayMain(item)&&garmentKind(item)!=='shirt'],['bottom','vaqueros o un pantalón cargo',isKind('jeans','cargo')],['outerwear','una chaqueta impermeable',isKind('raincoat')],['shoes','botas planas o zapatillas',isKind('boots','ankle-boots','sneakers','gym-shoes')],['bag','una mochila',isKind('backpack')]]
  }
};

function createOccasionRecommendation(preferences) {
  const rule = newOccasionRules[preferences.occasion];
  const items = [], missing = [];
  function pick(role,label,accepts,offset,required=true) {
    const item=chooseRecommendationItem(wardrobeItems.filter(candidate=>accepts(candidate)&&!items.some(selected=>selected.id===candidate.id)),preferences,role,offset);
    if(item) items.push(item); else if(required) missing.push(label);
  }
  rule.roles.forEach(([role,label,accepts],index)=>{
    if(role==='bottom'&&items.some(item=>item.category==='Vestidos'))return;
    if(role==='outerwear'&&preferences.weather==='Calor')return;
    // Para el frío se usa una capa realmente abrigada en las ocasiones generales.
    if(role==='outerwear'&&preferences.weather==='Frío'&&!['Deporte','Campo / naturaleza'].includes(preferences.occasion))return;
    pick(role,label,accepts,index);
  });
  if(!items.some(item=>item.category==='Chaquetas')&&['Frío','Lluvia','Entretiempo'].includes(preferences.weather)){
    if(!['Deporte','Campo / naturaleza','Día de playa'].includes(preferences.occasion)||preferences.occasion==='Día de playa'&&preferences.weather==='Frío'){
      const accepts=preferences.weather==='Lluvia'?isKind('raincoat'):preferences.weather==='Frío'?isKind('coat','puffer','raincoat'):warmOuterwear;
      pick('outerwear',preferences.weather==='Lluvia'?'una chaqueta impermeable':'una capa exterior adecuada al clima',accepts,6);
    }
  }
  if(preferences.weather==='Frío'&&!items.some(item=>item.category==='Accesorios'))pick('accessory','una bufanda',isKind('scarf','beanie','gloves'),7,false);
  if(preferences.weather==='Calor'&&!items.some(item=>item.category==='Accesorios')&&['Universidad','Viaje','Comida o brunch','Campo / naturaleza'].includes(preferences.occasion))pick('accessory','gafas de sol',isKind('sunglasses','cap'),8,false);
  return {...preferences,items,missing,partial:missing.length>0,createdAt:new Date().toISOString()};
}
