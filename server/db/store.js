const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const FILE = path.join(dataDir, 'trip.json');

function emptyState() {
  return {
    nextIds: { days: 1, events: 1, expenses: 1, images: 1 },
    days: [],
    expenses: [],
    images: [],
  };
}

function load() {
  if (!fs.existsSync(FILE)) return emptyState();
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch (e) {
    console.error('trip.json is corrupt, starting fresh:', e.message);
    return emptyState();
  }
}

let state = load();

function persist() {
  // Write to a temp file then rename, so a crash mid-write can't corrupt trip.json.
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, FILE);
}

function nextId(kind) {
  const id = state.nextIds[kind];
  state.nextIds[kind] += 1;
  return id;
}

/* ---------------- Days & events ---------------- */

function getDays() {
  return state.days.slice().sort((a, b) => a.sort_order - b.sort_order);
}

function getDay(id) {
  return state.days.find((d) => d.id === Number(id));
}

function createDay(fields) {
  const maxOrder = state.days.reduce((m, d) => Math.max(m, d.sort_order), -1);
  const maxNum = state.days.reduce((m, d) => Math.max(m, d.day_number), 0);
  const day = {
    id: nextId('days'),
    day_number: fields.day_number || maxNum + 1,
    date: fields.date || '',
    title: fields.title || '새 일정',
    city: fields.city || 'bkk',
    icon: fields.icon || 'bag',
    hotel_name: fields.hotel_name || null,
    hotel_addr: fields.hotel_addr || null,
    hotel_note: fields.hotel_note || null,
    hotel_map_query: fields.hotel_map_query || null,
    hotel_website: fields.hotel_website || null,
    sort_order: maxOrder + 1,
    events: [],
  };
  state.days.push(day);
  persist();
  return day;
}

function updateDay(id, fields) {
  const day = getDay(id);
  if (!day) return null;
  const editable = ['day_number', 'date', 'title', 'city', 'icon', 'hotel_name', 'hotel_addr', 'hotel_note', 'hotel_map_query', 'hotel_website'];
  editable.forEach((k) => {
    if (fields[k] !== undefined) day[k] = fields[k];
  });
  persist();
  return day;
}

function deleteDay(id) {
  const idx = state.days.findIndex((d) => d.id === Number(id));
  if (idx === -1) return false;
  state.days.splice(idx, 1);
  state.expenses.forEach((e) => { if (e.day_id === Number(id)) e.day_id = null; });
  state.images.forEach((i) => { if (i.day_id === Number(id)) i.day_id = null; });
  persist();
  return true;
}

function sortEvents(day) {
  day.events.sort((a, b) => (a.time || '').localeCompare(b.time || '') || a.sort_order - b.sort_order);
  return day;
}

function createEvent(dayId, fields) {
  const day = getDay(dayId);
  if (!day) return null;
  const maxOrder = day.events.reduce((m, e) => Math.max(m, e.sort_order), -1);
  const event = {
    id: nextId('events'),
    time: fields.time || '',
    type: fields.type || 'activity',
    name: fields.name || '새 항목',
    desc: fields.desc || '',
    map_query: fields.map_query || null,
    link_url: fields.link_url || null,
    link_label: fields.link_label || null,
    sort_order: maxOrder + 1,
  };
  day.events.push(event);
  persist();
  return sortEvents(day);
}

function findEventDay(eventId) {
  return state.days.find((d) => d.events.some((e) => e.id === Number(eventId)));
}

function updateEvent(eventId, fields) {
  const day = findEventDay(eventId);
  if (!day) return null;
  const event = day.events.find((e) => e.id === Number(eventId));
  const editable = ['time', 'type', 'name', 'desc', 'map_query', 'link_url', 'link_label'];
  editable.forEach((k) => {
    if (fields[k] !== undefined) event[k] = fields[k];
  });
  persist();
  return sortEvents(day);
}

function deleteEvent(eventId) {
  const day = findEventDay(eventId);
  if (!day) return null;
  day.events = day.events.filter((e) => e.id !== Number(eventId));
  persist();
  return sortEvents(day);
}

/* ---------------- Expenses ---------------- */

function getExpenses() {
  return state.expenses.slice().sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
}

function getExpenseSummary() {
  const total = state.expenses.reduce((s, e) => s + e.amount_thb, 0);
  const byCategory = {};
  const byPayer = {};
  state.expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount_thb;
    if (e.payer) byPayer[e.payer] = (byPayer[e.payer] || 0) + e.amount_thb;
  });
  const toSorted = (obj, key) => Object.entries(obj)
    .map(([k, total]) => ({ [key]: k, total }))
    .sort((a, b) => b.total - a.total);
  return { total, byCategory: toSorted(byCategory, 'category'), byPayer: toSorted(byPayer, 'payer') };
}

function createExpense(fields) {
  const expense = {
    id: nextId('expenses'),
    date: fields.date || new Date().toISOString().slice(0, 10),
    day_id: fields.day_id || null,
    category: fields.category || '기타',
    description: fields.description || '',
    amount_thb: Number(fields.amount_thb) || 0,
    payer: fields.payer || '',
    memo: fields.memo || null,
    receipt_image: fields.receipt_image || null,
    created_at: new Date().toISOString(),
  };
  state.expenses.push(expense);
  persist();
  return expense;
}

function updateExpense(id, fields) {
  const expense = state.expenses.find((e) => e.id === Number(id));
  if (!expense) return null;
  const editable = ['date', 'day_id', 'category', 'description', 'payer', 'memo', 'receipt_image'];
  editable.forEach((k) => {
    if (fields[k] !== undefined) expense[k] = fields[k];
  });
  if (fields.amount_thb !== undefined) expense.amount_thb = Number(fields.amount_thb);
  persist();
  return expense;
}

function deleteExpense(id) {
  const idx = state.expenses.findIndex((e) => e.id === Number(id));
  if (idx === -1) return false;
  state.expenses.splice(idx, 1);
  persist();
  return true;
}

/* ---------------- Images ---------------- */

function getImages() {
  return state.images.slice().sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at) || b.id - a.id);
}

function createImage(fields) {
  const image = {
    id: nextId('images'),
    day_id: fields.day_id || null,
    filename: fields.filename,
    caption: fields.caption || null,
    uploaded_at: new Date().toISOString(),
  };
  state.images.push(image);
  persist();
  return image;
}

function deleteImage(id) {
  const idx = state.images.findIndex((i) => i.id === Number(id));
  if (idx === -1) return null;
  const [removed] = state.images.splice(idx, 1);
  persist();
  return removed;
}

/* ---------------- Seeding ---------------- */

function seedIfEmpty(seedDays) {
  if (state.days.length > 0) return;
  state = emptyState();
  seedDays.forEach((d, i) => {
    const day = {
      id: nextId('days'),
      day_number: d.day_number,
      date: d.date,
      title: d.title,
      city: d.city,
      icon: d.icon,
      hotel_name: d.hotel_name || null,
      hotel_addr: d.hotel_addr || null,
      hotel_note: d.hotel_note || null,
      hotel_map_query: d.hotel_map_query || null,
      hotel_website: d.hotel_website || null,
      sort_order: i,
      events: d.events.map((e, j) => ({
        id: nextId('events'),
        time: e.time,
        type: e.type,
        name: e.name,
        desc: e.desc || '',
        map_query: e.map_query || null,
        link_url: e.link_url || null,
        link_label: e.link_label || null,
        sort_order: j,
      })),
    };
    state.days.push(day);
  });
  persist();
  console.log('Seeded itinerary with', seedDays.length, 'days.');
}

module.exports = {
  getDays, getDay, createDay, updateDay, deleteDay,
  createEvent, updateEvent, deleteEvent,
  getExpenses, getExpenseSummary, createExpense, updateExpense, deleteExpense,
  getImages, createImage, deleteImage,
  seedIfEmpty,
};
