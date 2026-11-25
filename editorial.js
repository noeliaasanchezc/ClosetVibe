// Una composición fotográfica independiente del almacenamiento y del constructor.
const editorialDialog = document.querySelector('#editorial-dialog');
let editorialLook = [];
let editorialOccasion = '';
const editorialMedia = window.matchMedia('(max-width: 600px)');

function editorialColors(value = '') {
  const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const colors = [
    [/negro|black/, '#303038'], [/blanco|white|perla/, '#eeeae2'], [/denim|azul|blue/, '#547a9c'],
    [/rosa|pink/, '#d49da9'], [/rojo|burdeos/, '#a75260'], [/lila|morado|violeta/, '#ad98bc'],
    [/crema|cream/, '#e1d5b9'], [/beige|champan|arena|natural/, '#d2bea0'],
    [/marron|cuero|chocolate/, '#93694f'], [/verde|oliva|caqui/, '#7a8b70'],
    [/gris|plateado|silver/, '#a4a8ae'], [/dorado|amarillo/, '#c5a66a'],
    [/turquesa|teal/, '#6fa6a6'], [/naranja|coral/, '#cb9177']
  ].flatMap(([pattern, color]) => { const match = normalized.match(pattern); return match ? [{ index: match.index, color }] : []; }).sort((a, b) => a.index - b.index);
  return normalized.match(/^#[0-9a-f]{6}$/i) ? [normalized] : colors.length ? colors.map(entry => entry.color) : ['#b8a5bd'];
}

function editorialLayout(entries, mobile = false) {
  const hasDress = entries.some(entry => entry.slot.id === 'dress');
  let positions;
  if (mobile) {
    positions = {
      top: [.30, .04, .39, .30, -3], jacket: [.59, .37, .36, .30, 4],
      bottom: [.15, .40, .39, .34, -3], shoes: [.54, .77, .40, .18, -3],
      bag: [.025, .77, .30, .20, 4], accessories: [.035, .075, .22, .20, -5],
      dress: [.27, .04, .44, .70, -2]
    };
    if (hasDress) {
      positions.top = [.025, .30, .22, .25, -4];
      positions.bottom = [.025, .56, .22, .24, 3];
      positions.jacket = [.73, .16, .24, .31, 4];
      positions.bag = [.71, .53, .26, .23, 4];
      positions.shoes = [.38, .80, .43, .18, -3];
    }
  } else {
    positions = {
      top: [.30, .045, .27, .39, -3], jacket: [.65, .055, .27, .43, 4],
      bottom: [.30, .49, .28, .45, -2], shoes: [.66, .66, .28, .27, -4],
      bag: [.045, .48, .21, .32, 4], accessories: [.065, .08, .18, .25, -5],
      dress: [.33, .04, .31, .87, -2]
    };
    if (hasDress) {
      positions.top = [.045, .035, .22, .32, -4];
      positions.bottom = [.045, .41, .22, .37, 3];
      positions.jacket = [.72, .035, .23, .38, 4];
      positions.bag = [.72, .47, .22, .30, 3];
      positions.shoes = [.34, .75, .27, .22, -3];
      positions.accessories = [.055, .12, .18, .23, -5];
      if (entries.some(entry => entry.slot.id === 'top')) positions.accessories = [.07, .80, .18, .17, -3];
      if (entries.some(entry => entry.slot.id === 'shoes')) positions.dress = [.33, .03, .31, .68, -2];
    }
  }
  if (entries.length === 1) positions[entries[0].slot.id] = mobile ? [.20, .07, .60, .83, -2] : [.31, .06, .38, .85, -2];
  if (!hasDress && !entries.some(entry => entry.slot.id === 'top') && entries.some(entry => entry.slot.id === 'jacket')) positions.jacket = positions.top;
  return positions;
}

function editorialStyleLine(entries) {
  const styles = [...new Set(entries.map(entry => entry.item.style).filter(Boolean))];
  return styles.length === 1 ? `Inspiración ${styles[0].toLocaleLowerCase('es')}, a tu manera.` : 'Texturas, tonos y detalles que cuentan tu estilo.';
}

function placeEditorialItems() {
  const layout = editorialLayout(editorialLook, editorialMedia.matches);
  document.querySelectorAll('.editorial-item').forEach(card => {
    const [x, y, width, height, rotation] = layout[card.dataset.slot];
    Object.entries({ '--x': `${x * 100}%`, '--y': `${y * 100}%`, '--w': `${width * 100}%`, '--h': `${height * 100}%`, '--rotation': `${rotation}deg` }).forEach(([key, value]) => card.style.setProperty(key, value));
  });
}

function selectEditorialItem(slotId) {
  const entry = editorialLook.find(entry => entry.slot.id === slotId);
  if (!entry) return;
  document.querySelectorAll('.editorial-item').forEach(card => {
    const selected = card.dataset.slot === slotId;
    card.classList.toggle('is-selected', selected);
    card.setAttribute('aria-pressed', String(selected));
  });
  const name = document.createElement('strong');
  name.textContent = entry.item.name;
  const meta = document.createElement('span');
  meta.textContent = [entry.item.category, entry.item.color, entry.item.style].filter(Boolean).join(' · ');
  document.querySelector('#editorial-details').replaceChildren(name, meta);
}

function openEditorialPreview() {
  const entries = outfitSlots.filter(slot => outfit[slot.id]).map(slot => ({ slot, item: { ...outfit[slot.id] } }));
  if (!entries.length) return showToast('Añade prendas al conjunto para abrir la vista editorial.');
  editorialLook = entries;
  editorialOccasion = selectedOccasion;
  const stage = document.querySelector('#editorial-stage');
  stage.replaceChildren(...entries.map(({ slot, item }) => {
    const card = document.createElement('button');
    card.className = 'editorial-item';
    card.type = 'button';
    card.dataset.slot = slot.id;
    card.setAttribute('aria-label', `Ver detalles de ${getItemAlt(item)}`);
    card.setAttribute('aria-pressed', 'false');
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = getItemAlt(item);
    const label = document.createElement('span');
    label.className = 'editorial-item-label';
    label.textContent = item.name;
    card.append(image, label);
    card.addEventListener('click', () => selectEditorialItem(slot.id));
    return card;
  }));
  const palette = document.querySelector('#editorial-palette');
  palette.replaceChildren(...entries.map(({ item }) => {
    const swatch = document.createElement('span');
    const colors = editorialColors(item.color);
    swatch.className = 'editorial-swatch';
    swatch.style.background = colors.length === 1 ? colors[0] : `linear-gradient(120deg, ${colors.join(', ')})`;
    swatch.title = item.color || 'Tono suave';
    swatch.setAttribute('role', 'img');
    swatch.setAttribute('aria-label', `${item.name}: ${item.color || 'tono suave'}`);
    return swatch;
  }));
  document.querySelector('#editorial-occasion').textContent = editorialOccasion;
  document.querySelector('#editorial-style').textContent = editorialStyleLine(entries);
  document.querySelector('#editorial-feedback').textContent = '';
  placeEditorialItems();
  selectEditorialItem(entries[0].slot.id);
  editorialDialog.showModal();
  editorialDialog.scrollTop = 0;
  document.querySelector('#editorial-close').focus();
}

document.querySelector('#open-editorial').addEventListener('click', openEditorialPreview);
document.querySelector('#editorial-close').addEventListener('click', () => editorialDialog.close());
document.querySelector('#editorial-done').addEventListener('click', () => editorialDialog.close());
editorialDialog.addEventListener('close', () => document.querySelector('#open-editorial').focus({ preventScroll: true }));
editorialMedia.addEventListener('change', () => { if (editorialDialog.open) placeEditorialItems(); });

async function downloadEditorialLook() {
  if (!editorialLook.length) return;
  const button = document.querySelector('#editorial-download');
  const original = button.innerHTML;
  const entries = editorialLook.map(entry => ({ slot: entry.slot, item: { ...entry.item } }));
  const occasion = editorialOccasion;
  button.disabled = true;
  button.textContent = 'Preparando look…';
  const feedback = document.querySelector('#editorial-feedback');
  feedback.textContent = 'Preparando tu composición…';
  try {
    const images = await Promise.all(entries.map(entry => loadCanvasImage(entry.item.image)));
    const canvas = document.createElement('canvas');
    canvas.width = 1800;
    canvas.height = 1640;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas no disponible');
    const gradient = context.createLinearGradient(0, 0, 1800, 1640);
    gradient.addColorStop(0, '#fbf7ee');
    gradient.addColorStop(.5, '#f6ecec');
    gradient.addColorStop(1, '#eee8f3');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1800, 1640);
    context.fillStyle = '#282321';
    context.font = '600 43px Georgia, serif';
    context.fillText('ClosetVibe', 80, 91);
    context.font = 'italic 66px Georgia, serif';
    context.fillText('Tu look en un vistazo', 80, 190);
    context.fillStyle = '#716965';
    context.font = '24px "Segoe UI", sans-serif';
    context.fillText(editorialStyleLine(entries), 83, 241);
    context.fillStyle = '#725970';
    context.font = '600 24px "Segoe UI", sans-serif';
    context.fillText(shortenCanvasText(context, occasion, 1000), 83, 294);
    entries.forEach(({ item }, index) => {
      const colors = editorialColors(item.color);
      const fill = context.createLinearGradient(1260 + index * 52, 260, 1300 + index * 52, 295);
      colors.forEach((color, colorIndex) => fill.addColorStop(colors.length === 1 ? 0 : colorIndex / (colors.length - 1), color));
      context.fillStyle = fill;
      context.beginPath();
      context.arc(1280 + index * 52, 278, 17, 0, Math.PI * 2);
      context.fill();
    });
    const layout = editorialLayout(entries);
    entries.forEach(({ slot, item }, index) => {
      const [x, y, width, height, rotation] = layout[slot.id];
      const w = width * 1640, h = height * 1120;
      context.save();
      context.translate(80 + (x + width / 2) * 1640, 335 + (y + height / 2) * 1120);
      context.rotate(rotation * Math.PI / 180);
      context.shadowColor = '#49364120';
      context.shadowBlur = 25;
      context.shadowOffsetY = 12;
      context.fillStyle = '#fffdfa';
      context.beginPath();
      context.roundRect(-w / 2, -h / 2, w, h, 10);
      context.fill();
      context.shadowColor = 'transparent';
      if (images[index]) drawCoverImage(context, images[index], -w / 2 + 16, -h / 2 + 16, w - 32, h - 76);
      else {
        context.fillStyle = '#716965';
        context.font = '18px "Segoe UI", sans-serif';
        context.fillText('Imagen no disponible', -w / 2 + 16, 0, w - 32);
      }
      context.fillStyle = '#625956';
      context.font = '21px "Segoe UI", sans-serif';
      context.fillText(shortenCanvasText(context, item.name, w - 32), -w / 2 + 16, h / 2 - 24);
      context.restore();
    });
    context.fillStyle = '#875359';
    context.font = 'italic 30px Georgia, serif';
    context.fillText('Tu estilo, a tu manera.', 80, 1555);
    const blob = await new Promise((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('No se pudo crear el PNG')), 'image/png'));
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ClosetVibe-look-editorial.png';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    feedback.textContent = 'Look preparado. Descarga iniciada.';
    showToast('Look editorial preparado. Descarga iniciada.');
  } catch (error) {
    console.warn('No se pudo descargar el look editorial.', error);
    feedback.textContent = 'No se pudo descargar el look. Inténtalo de nuevo.';
    showToast(feedback.textContent, true);
  } finally {
    button.disabled = false;
    button.innerHTML = original;
  }
}
document.querySelector('#editorial-download').addEventListener('click', downloadEditorialLook);
