// Almacenamiento independiente: las acciones del planificador no escriben en prendas ni favoritos.
const weeklyPlanKey = 'closetvibe-weekly-plan-v1';
const plannerDays = [
  { id: 'monday', name: 'Lunes' }, { id: 'tuesday', name: 'Martes' },
  { id: 'wednesday', name: 'Miércoles' }, { id: 'thursday', name: 'Jueves' },
  { id: 'friday', name: 'Viernes' }, { id: 'saturday', name: 'Sábado' },
  { id: 'sunday', name: 'Domingo' }
];
const plannerDialog = document.querySelector('#planner-dialog');
const plannerForm = document.querySelector('#planner-form');
let weeklyPlan = loadWeeklyPlan();
let editingPlannerDay = null;
let plannerTrigger = null;
let plannerChoices = [];

function loadWeeklyPlan() {
  try {
    const stored = JSON.parse(localStorage.getItem(weeklyPlanKey) || '{}');
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
    return Object.fromEntries(plannerDays.flatMap(day => {
      const entry = stored[day.id];
      if (!entry || !entry.look || typeof entry.look !== 'object' || !Array.isArray(entry.look.items)) return [];
      return [[day.id, { look: entry.look, note: typeof entry.note === 'string' ? entry.note.slice(0, 120) : '' }]];
    }));
  } catch (error) {
    console.warn('No se pudo leer la planificación semanal.', error);
    return {};
  }
}

function persistWeeklyPlan(updated) {
  try {
    localStorage.setItem(weeklyPlanKey, JSON.stringify(updated));
    weeklyPlan = updated;
    return true;
  } catch (error) {
    console.warn('No se pudo guardar la planificación semanal.', error);
    return false;
  }
}

function snapshotPlannerLook(look) {
  // Conserva el look planificado aunque después se elimine el favorito original.
  return {
    id: look.id, name: look.name || `Look de ${look.occasion || 'cada día'}`,
    occasion: look.occasion || 'Sin ocasión',
    items: (Array.isArray(look.items) ? look.items : []).map(item => ({
      id: item.id, name: item.name || 'Prenda', category: item.category || '',
      color: item.color || '', image: getFavoriteItemImage(item)
    }))
  };
}

function createPlannerGallery(look) {
  const gallery = document.createElement('div');
  gallery.className = 'planner-gallery';
  (Array.isArray(look.items) ? look.items : []).forEach(item => {
    const figure = document.createElement('figure');
    const image = document.createElement('img');
    image.src = getFavoriteItemImage(item);
    image.alt = getItemAlt(item);
    image.loading = 'lazy';
    const caption = document.createElement('figcaption');
    caption.textContent = item.name || 'Prenda';
    figure.append(image, caption);
    gallery.append(figure);
  });
  return gallery;
}

function renderWeeklyPlanner() {
  const count = Object.keys(weeklyPlan).length;
  document.querySelector('#planner-summary').textContent = `${count} de 7 días planificados · Una semana a tu manera`;
  document.querySelector('#planner-empty').hidden = favoriteLooks.length > 0;
  document.querySelector('#planner-clear').disabled = count === 0;
  const cards = plannerDays.map((day, index) => {
    const entry = weeklyPlan[day.id];
    const card = document.createElement('article');
    card.className = `planner-day${entry ? ' is-planned' : ''}`;
    card.addEventListener('click', event => {
      if (!event.target.closest('button, a')) openPlannerDay(day);
    });
    const heading = document.createElement('div');
    heading.className = 'planner-day-heading';
    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    number.setAttribute('aria-hidden', 'true');
    const title = document.createElement('h3');
    title.textContent = day.name;
    heading.append(title, number);
    card.append(heading);
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = entry ? 'secondary-button planner-edit' : 'planner-day-empty';
    edit.dataset.day = day.id;
    edit.setAttribute('aria-label', `${entry ? 'Editar planificación del' : 'Planificar el'} ${day.name.toLocaleLowerCase('es')}`);
    edit.addEventListener('click', () => openPlannerDay(day));
    if (entry) {
      const lookName = document.createElement('p');
      lookName.className = 'planner-look-name';
      lookName.textContent = entry.look.name;
      const occasion = document.createElement('span');
      occasion.className = 'planner-occasion';
      occasion.textContent = entry.look.occasion || 'Sin ocasión';
      const note = document.createElement('p');
      note.className = `planner-note${entry.note ? '' : ' is-empty'}`;
      note.textContent = entry.note || 'Sin nota · Deja que el día te sorprenda.';
      edit.textContent = 'Editar';
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'planner-remove secondary-button';
      remove.textContent = 'Eliminar';
      remove.setAttribute('aria-label', `Eliminar planificación del ${day.name.toLocaleLowerCase('es')}`);
      remove.addEventListener('click', () => removePlannerDay(day));
      const actions = document.createElement('div');
      actions.className = 'planner-day-actions';
      actions.append(edit, remove);
      card.append(createPlannerGallery(entry.look), lookName, occasion, note, actions);
    } else {
      const mark = document.createElement('span');
      mark.className = 'planner-empty-mark';
      mark.textContent = '＋';
      mark.setAttribute('aria-hidden', 'true');
      const label = document.createElement('strong');
      label.textContent = 'Un día por vestir';
      const hint = document.createElement('span');
      hint.textContent = favoriteLooks.length ? 'Elige un look favorito para este día' : 'Crea y guarda tu primer look';
      edit.append(mark, label, hint);
      card.append(edit);
    }
    return card;
  });
  document.querySelector('#planner-grid').replaceChildren(...cards);
}

function openPlannerDay(day) {
  const current = weeklyPlan[day.id];
  if (!favoriteLooks.length && !current) {
    showToast('Primero crea un look y guárdalo en Favoritos.');
    document.querySelector('#planner-empty a').focus();
    return;
  }
  plannerTrigger = document.activeElement;
  editingPlannerDay = day;
  plannerChoices = [...favoriteLooks];
  if (current && !plannerChoices.some(look => look.id === current.look.id)) plannerChoices.unshift(current.look);
  document.querySelector('#planner-dialog-title').textContent = `${current ? 'Editar' : 'Planificar'} el ${day.name.toLocaleLowerCase('es')}`;
  const select = document.querySelector('#planner-look');
  select.replaceChildren(...plannerChoices.map((look, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${look.name || 'Look favorito'} · ${look.occasion || 'Sin ocasión'}`;
    if (current?.look.id === look.id) option.selected = true;
    return option;
  }));
  document.querySelector('#planner-note').value = current?.note || '';
  document.querySelector('#planner-form-message').textContent = '';
  renderPlannerPreview();
  plannerDialog.showModal();
  select.focus();
}

function renderPlannerPreview() {
  const look = plannerChoices[Number(document.querySelector('#planner-look').value)];
  document.querySelector('#planner-preview').replaceChildren(...(look ? [createPlannerGallery(look)] : []));
}

function focusPlannerDay(day) {
  document.querySelector(`#planner-grid [data-day="${day.id}"]`)?.focus({ preventScroll: true });
}

async function removePlannerDay(day) {
  if (!weeklyPlan[day.id] || !await confirmAction(`¿Dejar el ${day.name.toLocaleLowerCase('es')} libre?`, 'Se eliminará solo la planificación de este día. Tu look favorito y tus prendas se conservarán.', 'Eliminar planificación')) return;
  const updated = { ...weeklyPlan };
  delete updated[day.id];
  if (!persistWeeklyPlan(updated)) return showToast('No se pudo eliminar la planificación. Inténtalo de nuevo.', true);
  renderWeeklyPlanner();
  focusPlannerDay(day);
  showToast(`Planificación del ${day.name.toLocaleLowerCase('es')} eliminada.`);
}

plannerForm.addEventListener('submit', event => {
  event.preventDefault();
  const look = plannerChoices[Number(document.querySelector('#planner-look').value)];
  if (!look || !editingPlannerDay) return;
  const day = editingPlannerDay;
  const wasPlanned = Boolean(weeklyPlan[day.id]);
  const updated = { ...weeklyPlan, [day.id]: { look: snapshotPlannerLook(look), note: document.querySelector('#planner-note').value.trim().slice(0, 120) } };
  if (!persistWeeklyPlan(updated)) {
    document.querySelector('#planner-form-message').textContent = 'No hay espacio suficiente para guardar. Tu planificación anterior se conserva.';
    showToast('No se pudo guardar la planificación. Comprueba el espacio disponible.', true);
    return;
  }
  plannerDialog.close();
  renderWeeklyPlanner();
  focusPlannerDay(day);
  showToast(`${day.name}: planificación ${wasPlanned ? 'actualizada' : 'guardada'}.`);
});
document.querySelector('#planner-look').addEventListener('change', renderPlannerPreview);
document.querySelector('#planner-close').addEventListener('click', () => plannerDialog.close());
document.querySelector('#planner-cancel').addEventListener('click', () => plannerDialog.close());
plannerDialog.addEventListener('close', () => {
  if (plannerTrigger?.isConnected) plannerTrigger.focus({ preventScroll: true });
  editingPlannerDay = null;
  plannerChoices = [];
});
document.querySelector('#planner-clear').addEventListener('click', async () => {
  if (!Object.keys(weeklyPlan).length || !await confirmAction('¿Limpiar tu semana?', 'Se eliminarán las planificaciones de los siete días. Tus favoritos y las prendas de tu armario se conservarán.', 'Limpiar semana')) return;
  if (!persistWeeklyPlan({})) return showToast('No se pudo limpiar la semana. Inténtalo de nuevo.', true);
  renderWeeklyPlanner();
  document.querySelector('#planner-download').focus();
  showToast('Semana despejada. Lista para nuevos planes.');
});

function drawPlannerText(context, value, x, y, width, maxLines, lineHeight) {
  const words = String(value).split(/\s+/);
  let line = '', lineIndex = 0;
  for (let i = 0; i < words.length; i++) {
    const next = line ? `${line} ${words[i]}` : words[i];
    if (context.measureText(next).width > width && line) {
      if (lineIndex === maxLines - 1) {
        context.fillText(shortenCanvasText(context, [line, ...words.slice(i)].join(' '), width), x, y + lineIndex * lineHeight);
        return;
      }
      context.fillText(shortenCanvasText(context, line, width), x, y + lineIndex * lineHeight);
      lineIndex++;
      line = words[i];
    } else line = next;
  }
  context.fillText(shortenCanvasText(context, line, width), x, y + lineIndex * lineHeight);
}

async function downloadWeeklyPlan() {
  const button = document.querySelector('#planner-download');
  const original = button.innerHTML;
  button.disabled = true;
  button.textContent = 'Preparando semana…';
  try {
    // Captura coherente aunque la usuaria siga editando durante la descarga.
    const plan = JSON.parse(JSON.stringify(weeklyPlan));
    const images = await Promise.all(plannerDays.map(day => Promise.all((plan[day.id]?.look.items || []).map(item => loadCanvasImage(getFavoriteItemImage(item))))));
    const canvas = document.createElement('canvas');
    canvas.width = 1800;
    canvas.height = 2250;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas no disponible');
    const gradient = context.createLinearGradient(0, 0, 1800, 2250);
    gradient.addColorStop(0, '#fbf9f6');
    gradient.addColorStop(1, '#eee5ef');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1800, 2250);
    context.fillStyle = '#bd8589';
    context.fillRect(0, 0, 1800, 12);
    context.fillStyle = '#282321';
    context.font = '600 45px Georgia, serif';
    context.fillText('ClosetVibe', 80, 95);
    context.font = 'italic 64px Georgia, serif';
    context.fillText('Mi semana de looks', 80, 190);
    context.font = '22px "Segoe UI", sans-serif';
    context.fillStyle = '#716965';
    context.fillText('Siete días para vestirte de ti.', 83, 239);
    const tileWidth = 800, tileHeight = 440, gap = 40;
    plannerDays.forEach((day, index) => {
      const x = 80 + (index % 2) * (tileWidth + gap);
      const y = 295 + Math.floor(index / 2) * (tileHeight + gap);
      const entry = plan[day.id];
      context.fillStyle = '#fffdfa';
      context.fillRect(x, y, tileWidth, tileHeight);
      context.fillStyle = '#d9a7a9';
      context.fillRect(x, y, 5, tileHeight);
      context.fillStyle = '#282321';
      context.font = '500 35px Georgia, serif';
      context.fillText(day.name, x + 28, y + 50);
      if (!entry) {
        context.fillStyle = '#817975';
        context.font = 'italic 29px Georgia, serif';
        context.fillText('Un día por vestir', x + 28, y + 210);
        context.font = '20px "Segoe UI", sans-serif';
        context.fillText('Sin look planificado', x + 28, y + 247);
        return;
      }
      const count = entry.look.items.length;
      const columns = Math.min(4, Math.max(1, count));
      const rows = Math.ceil(count / columns) || 1;
      const imageWidth = (tileWidth - 64 - (columns - 1) * 12) / columns;
      const imageHeight = Math.min(185, (200 - (rows - 1) * 8) / rows);
      images[index].forEach((image, itemIndex) => {
        const imageX = x + 28 + (itemIndex % columns) * (imageWidth + 12);
        const imageY = y + 75 + Math.floor(itemIndex / columns) * (imageHeight + 8);
        context.fillStyle = '#f4ede6';
        context.fillRect(imageX, imageY, imageWidth, imageHeight);
        if (image) drawCoverImage(context, image, imageX, imageY, imageWidth, imageHeight);
        else {
          context.fillStyle = '#716965';
          context.font = '16px "Segoe UI", sans-serif';
          drawPlannerText(context, entry.look.items[itemIndex].name || 'Imagen no disponible', imageX + 8, imageY + 30, imageWidth - 16, 2, 20);
        }
      });
      context.fillStyle = '#875359';
      context.font = '600 22px "Segoe UI", sans-serif';
      context.fillText(shortenCanvasText(context, entry.look.occasion || 'Sin ocasión', tileWidth - 56), x + 28, y + 305);
      context.fillStyle = '#282321';
      context.font = '23px Georgia, serif';
      context.fillText(shortenCanvasText(context, entry.look.name || 'Look favorito', tileWidth - 56), x + 28, y + 341);
      context.fillStyle = '#716965';
      context.font = '20px "Segoe UI", sans-serif';
      drawPlannerText(context, entry.note || 'Sin nota', x + 28, y + 375, tileWidth - 56, 2, 27);
    });
    context.fillStyle = '#875359';
    context.font = 'italic 31px Georgia, serif';
    context.fillText('Tu estilo, a tu manera.', 930, 2040);
    const blob = await new Promise((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('No se pudo crear el PNG')), 'image/png'));
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ClosetVibe-mi-semana-de-looks.png';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Tu semana está lista. Descarga iniciada.');
  } catch (error) {
    console.warn('No se pudo descargar la semana.', error);
    showToast('No se pudo descargar la semana. Inténtalo de nuevo.', true);
  } finally {
    button.innerHTML = original;
    button.disabled = false;
  }
}
document.querySelector('#planner-download').addEventListener('click', downloadWeeklyPlan);
renderWeeklyPlanner();
