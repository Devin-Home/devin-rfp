let days = [];
let expenses = [];
let images = [];
let spots = [];
let addingSpotCategory = null; // 'place' | 'meal' | null — which grid is showing its "add" form
let editingSpotId = null;      // spot id currently showing its edit form

let selectedDayId = null;   // day id currently shown in the itinerary panel
let editingDayId = null;    // day id currently showing its combined day/hotel edit form
let editingEvent = null;    // event id currently showing its edit form
let addingEventFor = null;  // day id currently showing "new event" form
let addingExpenseFor = null;   // event id currently showing "add expense" form
let addingMemoFor = null;      // event id currently showing "add/edit memo" form
let editingExpenseId = null;   // expense id currently showing its inline edit form (on an event row)
let editingTopExpenseId = null; // expense id currently being edited from the main expense form/table

let paymentFilter = 'all'; // 'all' | '카드' | '현금'
let breakdownOpen = true;

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
const CITY_LABEL = { bkk: '방콕', pty: '파타야' };
const TYPE_LABEL = { flight: '항공', activity: '일정', meal: '식사' };
const TYPE_CATEGORY = { meal: '식비', flight: '교통', activity: '액티비티' };
const EXPENSE_CATEGORIES = ['숙소', '교통', '식비', '액티비티', '쇼핑', '마사지', '기타'];
const ICONS = ['plane', 'temple', 'pawprint', 'van', 'anchor', 'droplet', 'sun', 'bag', 'suitcase'];
const ICON_LABEL = {
  plane: '✈️ 비행기', temple: '🛕 사원', pawprint: '🐾 액티비티', van: '🚐 이동',
  anchor: '⚓ 바다/투어', droplet: '💧 물놀이', sun: '☀️ 휴식', bag: '👜 쇼핑', suitcase: '🧳 여행',
};
const SPOT_CATEGORIES = ['방콕', '파타야'];

// Curated Pexels photos (family-provided, free-to-use) for the magazine redesign.
const TRAVEL_IMAGES = {
  hero: 'https://images.pexels.com/photos/34405900/pexels-photo-34405900.jpeg?auto=compress&cs=tinysrgb&w=1920',
  day1: 'https://images.pexels.com/photos/20889589/pexels-photo-20889589.jpeg?auto=compress&cs=tinysrgb&w=1200',
  day2: 'https://images.pexels.com/photos/36768902/pexels-photo-36768902.jpeg?auto=compress&cs=tinysrgb&w=1200',
  day3: 'https://images.pexels.com/photos/17704287/pexels-photo-17704287.jpeg?auto=compress&cs=tinysrgb&w=1200',
  day4: 'https://images.pexels.com/photos/15051535/pexels-photo-15051535.jpeg?auto=compress&cs=tinysrgb&w=1200',
  day5: 'https://images.pexels.com/photos/4577696/pexels-photo-4577696.jpeg?auto=compress&cs=tinysrgb&w=1200',
  day6: 'https://images.pexels.com/photos/2476632/pexels-photo-2476632.jpeg?auto=compress&cs=tinysrgb&w=1200',
  watArun: 'https://images.pexels.com/photos/35981272/pexels-photo-35981272.jpeg?auto=compress&cs=tinysrgb&w=900',
  grandPalace: 'https://images.pexels.com/photos/38791407/pexels-photo-38791407.jpeg?auto=compress&cs=tinysrgb&w=900',
  sanctuary: 'https://images.pexels.com/photos/4037038/pexels-photo-4037038.jpeg?auto=compress&cs=tinysrgb&w=900',
  bangkokCity: 'https://images.pexels.com/photos/34951439/pexels-photo-34951439.jpeg?auto=compress&cs=tinysrgb&w=900',
  food1: 'https://images.pexels.com/photos/30982066/pexels-photo-30982066.jpeg?auto=compress&cs=tinysrgb&w=800',
  food2: 'https://images.pexels.com/photos/36817184/pexels-photo-36817184.jpeg?auto=compress&cs=tinysrgb&w=800',
  food3: 'https://images.pexels.com/photos/28381598/pexels-photo-28381598.jpeg?auto=compress&cs=tinysrgb&w=800',
  food4: 'https://images.pexels.com/photos/31027042/pexels-photo-31027042.jpeg?auto=compress&cs=tinysrgb&w=800',
  stayBangkok: 'https://images.pexels.com/photos/37836001/pexels-photo-37836001.jpeg?auto=compress&cs=tinysrgb&w=1000',
  stayVilla: 'https://images.pexels.com/photos/4146874/pexels-photo-4146874.jpeg?auto=compress&cs=tinysrgb&w=1000',
  shop1: 'https://images.pexels.com/photos/28560920/pexels-photo-28560920.jpeg?auto=compress&cs=tinysrgb&w=900',
  shop2: 'https://images.pexels.com/photos/35979665/pexels-photo-35979665.jpeg?auto=compress&cs=tinysrgb&w=900',
  footer: 'https://images.pexels.com/photos/34951439/pexels-photo-34951439.jpeg?auto=compress&cs=tinysrgb&w=1920',
};
// One representative photo per day, for the day-story cards & route map highlights.
const DAY_PHOTOS = {
  1: TRAVEL_IMAGES.day1,
  2: TRAVEL_IMAGES.day2,
  3: TRAVEL_IMAGES.day3,
  4: TRAVEL_IMAGES.day4,
  5: TRAVEL_IMAGES.day5,
  6: TRAVEL_IMAGES.day6,
  7: TRAVEL_IMAGES.stayVilla,
  8: TRAVEL_IMAGES.bangkokCity,
  9: TRAVEL_IMAGES.shop1,
};
// Hotel-name → photo lookup, for the "머무는 곳" showcase row (hotels live on the day record, not in `spots`).
const HOTEL_PHOTOS = {
  '더 블레스 호텔 앤 레지던스': TRAVEL_IMAGES.stayBangkok,
  '호텔 제이 파타야': TRAVEL_IMAGES.stayVilla,
  '더 젬스 풀빌라': TRAVEL_IMAGES.stayVilla,
  '호텔 뤼 드 시암': TRAVEL_IMAGES.stayBangkok,
};
// Curated shopping spots pulled from the existing "가볼 곳" list, by name.
const SHOP_SPOT_NAMES = ['아이콘시암', '카오산 로드', '조드페어스 야시장'];

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function mapLink(q) {
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : '';
}

/* ---------------- Map modal (Google Maps Embed API) ---------------- */

let mapsApiKey = null;
async function loadConfig() {
  try {
    const cfg = await api.get('/api/config');
    mapsApiKey = (cfg && cfg.mapsApiKey) || null;
  } catch (e) { mapsApiKey = null; }
  // loadConfig() runs concurrently with loadSpots()/loadDays() in init(), so an earlier
  // render of the route map/day panel may have missed the key — re-render now that it's known.
  renderRouteMapEmbed();
  renderDayPanel();
}

function openMapModal(query, title) {
  const modal = document.getElementById('mapModal');
  const frame = document.getElementById('mapModalFrame');
  const titleEl = document.getElementById('mapModalTitle');
  const extLink = document.getElementById('mapModalExternal');
  if (!modal || !frame || !mapsApiKey) return;
  frame.src = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(mapsApiKey)}&q=${encodeURIComponent(query)}`;
  if (titleEl) titleEl.textContent = title || query;
  if (extLink) extLink.href = mapLink(query);
  modal.classList.add('open');
}
function closeMapModal() {
  const modal = document.getElementById('mapModal');
  const frame = document.getElementById('mapModalFrame');
  if (modal) modal.classList.remove('open');
  if (frame) frame.src = ''; // stop the embed loading once hidden
}
document.getElementById('mapModalClose')?.addEventListener('click', closeMapModal);
document.getElementById('mapModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'mapModal') closeMapModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMapModal();
});
// Intercept clicks on any "지도" link and open the modal instead, but only once a
// Maps API key is configured — until then these links keep their old behavior
// (open Google Maps search in a new tab).
document.body.addEventListener('click', (e) => {
  const link = e.target.closest('.js-map-link');
  if (!link || !mapsApiKey) return;
  const query = link.dataset.mapQuery;
  if (!query) return;
  e.preventDefault();
  openMapModal(query, link.dataset.mapTitle || query);
});
function bahtStr(n) { return '฿' + Math.round(n).toLocaleString('en-US'); }
function fmtDateShort(date) {
  if (!date) return '날짜 미정';
  const dt = new Date(`${date}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return '날짜 미정';
  return `${date.slice(5).replace('-', '.')} ${WEEKDAY[dt.getDay()]}`;
}
function fmtDayEyebrow(day) {
  if (!day.date) return '날짜 미정';
  const dt = new Date(`${day.date}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return '날짜 미정';
  return `${day.date.slice(5).replace('-', '월 ')}일 (${WEEKDAY[dt.getDay()]}) · ${CITY_LABEL[day.city] || day.city}`;
}

/* ---------------- Toast ---------------- */
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(toastTimer);
  el.textContent = msg;
  el.classList.add('show');
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------------- Tabs ---------------- */
document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`view-${btn.dataset.view}`).classList.add('active');
  });
});

/* ---------------- Theme toggle ---------------- */
const themeToggle = document.getElementById('themeToggle');
function applyThemeLabel() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  themeToggle.textContent = isDark ? '밝게' : '어둡게';
  themeToggle.title = isDark ? '밝은 화면으로 전환' : '어두운 화면으로 전환';
}
if (themeToggle) {
  applyThemeLabel();
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    applyThemeLabel();
  });
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await api.post('/api/auth/logout');
  window.location.href = '/login.html';
});

/* ---------- Hero / closing banner CTAs ---------- */
document.getElementById('heroCtaBtn').addEventListener('click', () => {
  document.querySelector('.tab[data-view="itinerary"]').click();
  document.querySelector('.itin-layout').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
document.getElementById('ctaBannerBtn').addEventListener('click', () => {
  document.querySelector('.tab[data-view="gallery"]').click();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
document.getElementById('footerLinks')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.footer-link');
  if (!btn) return;
  document.querySelector(`.tab[data-view="${btn.dataset.view}"]`)?.click();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---------------- Thailand clock ---------------- */
function updateThailandClock() {
  const el = document.getElementById('thClock');
  if (!el) return;
  const now = new Date();
  const time = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  el.innerHTML = `태국 현지 <span class="clock-time">${time}</span>`;
}
updateThailandClock();
setInterval(updateThailandClock, 30000);

/* ---------------- Weather ---------------- */
async function loadWeather() {
  const el = document.getElementById('weatherItems');
  if (!el) return;
  try {
    const data = await api.get('/api/weather');
    const cities = (data && data.cities) || [];
    el.innerHTML = cities.map((c) => `<span class="weather-item">${c.icon} ${esc(c.label)} ${c.temp != null ? `${c.temp}°` : '-'} ${esc(c.condition)}</span>`).join('');
  } catch (e) {
    el.innerHTML = ''; // fail silently — just the clock keeps showing
  }
}

/* ---------------- D-day ---------------- */
function updateDday() {
  const el = document.getElementById('ddayNum');
  if (!el) return;
  const first = days.length ? days.slice().sort((a, b) => a.sort_order - b.sort_order)[0] : null;
  if (!first || !first.date) { el.textContent = ''; return; }
  const start = new Date(`${first.date}T00:00:00+07:00`);
  const diff = Math.ceil((start - new Date()) / 86400000);
  el.textContent = diff > 0 ? `D-${diff}` : diff === 0 ? 'D-DAY' : `D+${-diff}`;
}

/* ---------------- Spots & meals (user-editable "가볼 곳" / "맛집" lists) ---------------- */

async function loadSpots() {
  spots = await api.get('/api/spots');
  renderSpots();
  renderMeals();
  renderRouteMap();
  renderShowcase();
}

function spotFormHTML(category, spot) {
  const s = spot || { id: null, category, day: '', city: '', name: '', note: '', map_query: '', image: '' };
  return `
    <form class="inline-form spot-form" data-act="save-spot" data-id="${s.id || ''}">
      <div class="form-grid">
        <div class="form-row"><label class="form-label">분류</label>
          <select class="form-input" name="category">
            <option value="place" ${s.category !== 'meal' ? 'selected' : ''}>가볼 곳</option>
            <option value="meal" ${s.category === 'meal' ? 'selected' : ''}>맛집</option>
          </select>
        </div>
        <div class="form-row"><label class="form-label">일차</label><input class="form-input" type="number" min="1" name="day" value="${s.day ?? ''}" placeholder="예: 2"></div>
        <div class="form-row"><label class="form-label">도시</label>
          <select class="form-input" name="city">
            ${SPOT_CATEGORIES.map((c) => `<option ${s.city === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-row" style="grid-column: 1 / -1;"><label class="form-label">이름</label><input class="form-input" name="name" value="${esc(s.name)}" required placeholder="예: 왓아룬"></div>
        <div class="form-row" style="grid-column: 1 / -1;"><label class="form-label">설명</label><input class="form-input" name="note" value="${esc(s.note)}" placeholder="한 줄 설명"></div>
        <div class="form-row" style="grid-column: 1 / -1;"><label class="form-label">지도 검색어</label><input class="form-input" name="map_query" value="${esc(s.map_query || '')}" placeholder="예: Wat Arun Bangkok"></div>
        <div class="form-row" style="grid-column: 1 / -1;"><label class="form-label">사진 URL (선택)</label><input class="form-input" name="image" value="${esc(s.image || '')}" placeholder="https://... 이미지 주소"></div>
      </div>
      <div class="btn-bar">
        <button class="btn" type="button" data-act="cancel-spot">취소</button>
        <button class="btn btn-primary" type="submit">저장</button>
      </div>
    </form>`;
}

function spotFormAreaHTML(category) {
  if (addingSpotCategory === category) return spotFormHTML(category, null);
  if (editingSpotId != null) {
    const s = spots.find((sp) => sp.id === editingSpotId);
    if (s && s.category === category) return spotFormHTML(category, s);
  }
  return '';
}

function spotCardHTML(p) {
  return `
    <div class="spot-card${p.image ? ' has-photo' : ''}" data-tint="${p.tint}">
      ${p.image ? `<img class="spot-photo" src="${esc(p.image)}" alt="" loading="lazy" onerror="const c=this.closest('.spot-card'); if(c){c.classList.remove('has-photo'); const s=c.querySelector('.spot-scrim'); if(s) s.remove();} this.remove();">` : ''}
      ${p.image ? '<div class="spot-scrim"></div>' : ''}
      <div class="spot-card-actions">
        <button class="icon-btn sm" type="button" data-act="edit-spot" data-id="${p.id}" title="수정">✏️</button>
        <button class="icon-btn sm danger" type="button" data-act="del-spot" data-id="${p.id}" title="삭제">🗑</button>
      </div>
      <span class="spot-icon"><svg><use href="#i-${p.category === 'meal' ? 'meal' : 'temple'}"></use></svg></span>
      <span class="spot-eyebrow">${p.day ? `Day ${p.day} · ` : ''}${esc(p.city || '')}</span>
      <span class="spot-name">${esc(p.name)}</span>
      ${p.note ? `<span class="spot-note">${esc(p.note)}</span>` : ''}
      ${p.map_query ? `<a class="spot-maplink js-map-link" href="${mapLink(p.map_query)}" target="_blank" rel="noopener" data-map-query="${esc(p.map_query)}" data-map-title="${esc(p.name)}">📍 지도 보기</a>` : ''}
    </div>`;
}

function renderSpots() {
  const grid = document.getElementById('spotsGrid');
  if (!grid) return;
  const formArea = document.getElementById('spotFormArea');
  if (formArea) formArea.innerHTML = spotFormAreaHTML('place');
  const list = spots.filter((s) => s.category !== 'meal');
  grid.innerHTML = list.map(spotCardHTML).join('') || '<p class="empty-hint">아직 등록된 곳이 없습니다.</p>';
}

function renderMeals() {
  const grid = document.getElementById('mealsGrid');
  if (!grid) return;
  const formArea = document.getElementById('mealFormArea');
  if (formArea) formArea.innerHTML = spotFormAreaHTML('meal');
  const list = spots.filter((s) => s.category === 'meal');
  grid.innerHTML = list.map(spotCardHTML).join('') || '<p class="empty-hint">아직 등록된 맛집이 없습니다.</p>';
}

const viewSpotsEl = document.getElementById('view-spots');
if (viewSpotsEl) {
  viewSpotsEl.addEventListener('click', async (e) => {
    const addBtn = e.target.closest('#addSpotBtn, #addMealBtn');
    if (addBtn) {
      addingSpotCategory = addBtn.id === 'addMealBtn' ? 'meal' : 'place';
      editingSpotId = null;
      renderSpots();
      renderMeals();
      return;
    }
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    const id = btn.dataset.id ? Number(btn.dataset.id) : null;
    if (act === 'edit-spot') {
      editingSpotId = id;
      addingSpotCategory = null;
      renderSpots();
      renderMeals();
    } else if (act === 'cancel-spot') {
      editingSpotId = null;
      addingSpotCategory = null;
      renderSpots();
      renderMeals();
    } else if (act === 'del-spot') {
      if (confirm('이 항목을 삭제할까요?')) {
        await api.del(`/api/spots/${id}`);
        await loadSpots();
      }
    }
  });

  viewSpotsEl.addEventListener('submit', async (e) => {
    const form = e.target.closest('form[data-act="save-spot"]');
    if (!form) return;
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(form).entries());
    const id = form.dataset.id;
    if (id) await api.put(`/api/spots/${id}`, fd);
    else await api.post('/api/spots', fd);
    addingSpotCategory = null;
    editingSpotId = null;
    await loadSpots();
  });
}

/* ---------------- Itinerary ---------------- */

function findEventById(id) {
  for (const d of days) {
    const ev = (d.events || []).find((e) => e.id === Number(id));
    if (ev) return { day: d, event: ev };
  }
  return null;
}

function expenseItemAmountHTML(e) {
  return e.currency === 'krw'
    ? `₩${Number(e.amount_krw ?? Math.round(e.amount_thb * exchangeRate())).toLocaleString('ko-KR')}`
    : `฿${Number(e.amount_thb).toLocaleString('ko-KR')}`;
}

function eventExpenseEditFormHTML(e) {
  const isKrw = e.currency === 'krw';
  const amountVal = isKrw ? (e.amount_krw ?? '') : e.amount_thb;
  return `
    <form class="inline-form" data-act="save-event-expense-edit" data-id="${e.id}">
      <div class="form-grid">
        <div class="form-row"><label class="form-label">날짜</label><input class="form-input" type="date" name="date" value="${esc(e.date)}" required></div>
        <div class="form-row"><label class="form-label">분류</label>
          <select class="form-input" name="category">
            ${EXPENSE_CATEGORIES.map((c) => `<option ${c === e.category ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-row"><label class="form-label">결제수단</label>
          <select class="form-input" name="payment_method">
            <option ${e.payment_method === '카드' ? 'selected' : ''}>카드</option><option ${e.payment_method === '현금' ? 'selected' : ''}>현금</option>
          </select>
        </div>
        <div class="form-row"><label class="form-label">통화</label>
          <select class="form-input" name="currency">
            <option value="thb" ${!isKrw ? 'selected' : ''}>🇹🇭 바트</option>
            <option value="krw" ${isKrw ? 'selected' : ''}>🇰🇷 원화</option>
          </select>
        </div>
        <div class="form-row"><label class="form-label">금액</label><input class="form-input" type="number" step="${isKrw ? '1' : '0.01'}" inputmode="${isKrw ? 'numeric' : 'decimal'}" name="amount_input" value="${amountVal}" required></div>
        <div class="form-row"><label class="form-label">결제자</label><input class="form-input" name="payer" value="${esc(e.payer || '')}" placeholder="예: A가족"></div>
        <div class="form-row" style="grid-column:1/-1"><label class="form-label">내용</label><input class="form-input" name="description" value="${esc(e.description || '')}"></div>
      </div>
      <div class="btn-bar">
        <button class="btn btn-ghost" type="button" data-act="cancel-expense-edit">취소</button>
        <button class="btn btn-primary" type="submit">비용 저장</button>
      </div>
    </form>`;
}

function eventExpensesHTML(ev) {
  const linked = expenses.filter((e) => e.event_id === ev.id);
  if (!linked.length) return '';
  return `
    <div class="event-expenses">
      ${linked.map((e) => (editingExpenseId === e.id ? eventExpenseEditFormHTML(e) : `
        <div class="event-expense-item">
          <span>${esc(e.payment_method || '카드')}</span>
          <span class="desc">${esc(e.description || e.category)}</span>
          <span class="amount mono">${expenseItemAmountHTML(e)}</span>
          <button class="icon-btn sm" type="button" data-act="edit-expense-from-event" data-id="${e.id}" title="수정">✏️</button>
          <button class="icon-btn danger sm" type="button" data-act="del-expense-from-event" data-id="${e.id}" title="삭제">🗑</button>
        </div>`)).join('')}
    </div>`;
}

function memoBlockHTML(day, ev) {
  if (addingMemoFor === ev.id) return eventMemoFormHTML(day, ev);
  if (ev.memo) {
    return `<div class="memo"><span class="lbl">메모</span><span class="txt">${esc(ev.memo)}</span><button class="icon-btn sm" type="button" data-act="edit-event-memo" data-id="${ev.id}" title="메모 수정">✏️</button></div>`;
  }
  return `<button class="btn-xs" type="button" data-act="add-event-memo" data-id="${ev.id}">메모 추가</button>`;
}

function eventMemoFormHTML(day, ev) {
  return `
    <form class="inline-form" data-act="save-event-memo" data-day-id="${day.id}" data-id="${ev.id}">
      <div class="form-row"><label class="form-label">메모</label><input class="form-input" name="memo" value="${esc(ev.memo || '')}" placeholder="예: 동선 체크, 예약 여부, 특이사항"></div>
      <div class="btn-bar">
        <button class="btn btn-ghost" type="button" data-act="cancel-event-memo">취소</button>
        <button class="btn btn-primary" type="submit">메모 저장</button>
      </div>
    </form>`;
}

function eventExpenseFormHTML(day, ev) {
  const today = new Date().toISOString().slice(0, 10);
  const defaultCat = TYPE_CATEGORY[ev.type] || '기타';
  return `
    <form class="inline-form" data-act="save-event-expense" data-day-id="${day.id}" data-event-id="${ev.id}">
      <div class="form-grid">
        <div class="form-row"><label class="form-label">날짜</label><input class="form-input" type="date" name="date" value="${today}" required></div>
        <div class="form-row"><label class="form-label">분류</label>
          <select class="form-input" name="category">
            ${EXPENSE_CATEGORIES.map((c) => `<option ${c === defaultCat ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-row"><label class="form-label">결제수단</label>
          <select class="form-input" name="payment_method"><option>카드</option><option>현금</option></select>
        </div>
        <div class="form-row"><label class="form-label">통화</label>
          <select class="form-input" name="currency"><option value="thb" selected>🇹🇭 바트</option><option value="krw">🇰🇷 원화</option></select>
        </div>
        <div class="form-row"><label class="form-label">결제 금액</label><input class="form-input" type="number" step="0.01" name="amount_input" required></div>
        <div class="form-row"><label class="form-label">결제자</label><input class="form-input" name="payer" placeholder="예: A가족"></div>
        <div class="form-row" style="grid-column:1/-1"><label class="form-label">내용</label><input class="form-input" name="description" value="${esc(ev.name)}"></div>
      </div>
      <div class="btn-bar">
        <button class="btn btn-ghost" type="button" data-act="cancel-event-expense">취소</button>
        <button class="btn btn-primary" type="submit">비용 저장</button>
      </div>
    </form>`;
}

function eventRowHTML(day, ev) {
  if (editingEvent === ev.id) return eventFormHTML(day.id, ev);
  const linked = expenses.filter((e) => e.event_id === ev.id);
  const linkedTotal = linked.reduce((s, e) => s + e.amount_thb, 0);
  const dotIcon = ev.type === 'flight' ? 'plane' : ev.type === 'meal' ? 'meal' : 'temple';
  return `
    <div class="event-row" data-type="${esc(ev.type)}">
      <div class="event-time mono">${esc(ev.time)}</div>
      <div class="event-track"><span class="event-dot"><svg><use href="#i-${dotIcon}"></use></svg></span></div>
      <div class="event-body">
        <div class="event-head">
          <span class="event-name">${esc(ev.name)}</span>
          <span class="event-tag">${TYPE_LABEL[ev.type] || '일정'}</span>
        </div>
        ${ev.desc ? `<span class="event-desc">${esc(ev.desc)}</span>` : ''}
        ${ev.map_query ? `<a class="maplink js-map-link" href="${mapLink(ev.map_query)}" target="_blank" rel="noopener" data-map-query="${esc(ev.map_query)}" data-map-title="${esc(ev.name)}">지도에서 보기</a>` : ''}
        ${memoBlockHTML(day, ev)}
        <div class="event-actions">
          <button class="btn-xs" type="button" data-act="${addingExpenseFor === ev.id ? 'cancel-event-expense' : 'add-event-expense'}" data-id="${ev.id}">${addingExpenseFor === ev.id ? '취소' : '비용 추가'}</button>
          <button class="btn-xs" type="button" data-act="edit-event" data-id="${ev.id}">일정 수정</button>
          <button class="btn-xs" type="button" data-act="del-event" data-id="${ev.id}">삭제</button>
          ${linkedTotal ? `<span class="cost-badge">🇹🇭 ${bahtStr(linkedTotal)} 기록됨</span>` : ''}
        </div>
        ${eventExpensesHTML(ev)}
        ${addingExpenseFor === ev.id ? eventExpenseFormHTML(day, ev) : ''}
      </div>
    </div>`;
}

function eventFormHTML(dayId, ev) {
  const e = ev || { id: null, time: '', type: 'activity', name: '', desc: '', map_query: '' };
  return `
    <form class="inline-form" data-act="save-event" data-day-id="${dayId}" data-id="${e.id || ''}">
      <div class="form-grid">
        <div class="form-row"><label class="form-label">시간</label><input class="form-input" name="time" value="${esc(e.time)}" placeholder="14:00" inputmode="numeric" maxlength="5" data-autotime="1"></div>
        <div class="form-row"><label class="form-label">분류</label>
          <select class="form-input" name="type">
            <option value="flight" ${e.type === 'flight' ? 'selected' : ''}>항공</option>
            <option value="activity" ${e.type === 'activity' ? 'selected' : ''}>일정</option>
            <option value="meal" ${e.type === 'meal' ? 'selected' : ''}>식사</option>
          </select>
        </div>
        <div class="form-row" style="grid-column:span 2"><label class="form-label">일정 이름</label><input class="form-input" name="name" value="${esc(e.name)}" required></div>
        <div class="form-row" style="grid-column:1/-1"><label class="form-label">설명</label><input class="form-input" name="desc" value="${esc(e.desc)}"></div>
        <div class="form-row" style="grid-column:1/-1"><label class="form-label">지도 검색어</label><input class="form-input" name="map_query" value="${esc(e.map_query || '')}" placeholder="예: Wat Arun Bangkok"></div>
      </div>
      <div class="btn-bar">
        <button class="btn btn-ghost" type="button" data-act="cancel-event">취소</button>
        <button class="btn btn-primary" type="submit">${e.id ? '일정 저장' : '일정 추가'}</button>
      </div>
    </form>`;
}

function hotelCardHTML(day) {
  if (!day.hotel_name) return '';
  return `
    <div class="hotel-card">
      <svg class="deco" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--bl-400)" stroke-width="3"></circle><circle cx="60" cy="60" r="34" fill="var(--bl-200)"></circle></svg>
      <p class="kicker"><svg width="15" height="15"><use href="#i-hotel"></use></svg> 숙소 체크인</p>
      <p class="name">${esc(day.hotel_name)}</p>
      ${day.hotel_note ? `<p class="note">${esc(day.hotel_note)}</p>` : ''}
      ${day.hotel_addr ? `<p class="addr">${esc(day.hotel_addr)}</p>` : ''}
      ${(day.hotel_map_query || day.hotel_website) ? `<p class="links">
        ${day.hotel_map_query ? `<a class="js-map-link" href="${mapLink(day.hotel_map_query)}" target="_blank" rel="noopener" data-map-query="${esc(day.hotel_map_query)}" data-map-title="${esc(day.hotel_name)}">지도 열기</a>` : ''}
        ${day.hotel_website ? `<a href="${esc(day.hotel_website)}" target="_blank" rel="noopener">호텔 사이트</a>` : ''}
      </p>` : ''}
    </div>`;
}

function dayEditFormHTML(day) {
  return `
    <div class="day-edit-card">
      <p class="card-kicker">날짜 정보 수정</p>
      <form class="form-grid" data-act="save-day-combined" data-id="${day.id}">
        <div class="form-row"><label class="form-label">일차</label><input class="form-input" type="number" min="1" name="day_number" value="${day.day_number}"></div>
        <div class="form-row"><label class="form-label">날짜</label><input class="form-input" type="date" name="date" value="${esc(day.date)}"></div>
        <div class="form-row"><label class="form-label">도시</label>
          <select class="form-input" name="city">
            <option value="bkk" ${day.city === 'bkk' ? 'selected' : ''}>방콕</option>
            <option value="pty" ${day.city === 'pty' ? 'selected' : ''}>파타야</option>
          </select>
        </div>
        <div class="form-row"><label class="form-label">아이콘</label>
          <select class="form-input" name="icon">
            ${ICONS.map((ic) => `<option value="${ic}" ${day.icon === ic ? 'selected' : ''}>${ICON_LABEL[ic]}</option>`).join('')}
          </select>
        </div>
        <div class="form-row" style="grid-column:1/-1"><label class="form-label">제목</label><input class="form-input" name="title" value="${esc(day.title)}" required></div>
        <div class="form-row" style="grid-column:1/-1"><label class="form-label">숙소 이름</label><input class="form-input" name="hotel_name" value="${esc(day.hotel_name || '')}" placeholder="비워두면 표시되지 않습니다"></div>
        <div class="form-row" style="grid-column:1/-1"><label class="form-label">숙소 메모</label><input class="form-input" name="hotel_note" value="${esc(day.hotel_note || '')}"></div>
        <div class="form-row" style="grid-column:1/-1"><label class="form-label">숙소 주소</label><input class="form-input" name="hotel_addr" value="${esc(day.hotel_addr || '')}"></div>
        <div class="form-row"><label class="form-label">숙소 지도 검색어</label><input class="form-input" name="hotel_map_query" value="${esc(day.hotel_map_query || '')}"></div>
        <div class="form-row"><label class="form-label">숙소 홈페이지</label><input class="form-input" name="hotel_website" value="${esc(day.hotel_website || '')}"></div>
        <div class="btn-bar" style="grid-column:1/-1">
          <button class="btn btn-primary" type="submit">저장</button>
          <button class="btn btn-ghost" type="button" data-act="cancel-day-edit">취소</button>
        </div>
      </form>
    </div>`;
}

function dayPanelHeadHTML(day) {
  const icon = ICONS.includes(day.icon) ? day.icon : 'bag';
  return `
    <div class="day-panel-head">
      <span class="day-badge"><svg><use href="#i-${icon}"></use></svg></span>
      <p class="day-eyebrow">Day ${day.day_number} · ${fmtDayEyebrow(day)}</p>
      <span class="day-panel-actions">
        <button class="btn-xs" type="button" data-act="edit-day" data-id="${day.id}">날짜 정보 수정</button>
        <button class="btn-xs" type="button" data-act="add-event" data-id="${day.id}">＋ 일정 추가</button>
        <button class="btn-xs" type="button" data-act="del-day" data-id="${day.id}">날짜 삭제</button>
      </span>
    </div>
    <h2 class="day-title">${esc(day.title)}</h2>`;
}

function newEventCardHTML(day) {
  if (addingEventFor !== day.id) return '';
  return `<div class="new-event-card"><p class="card-kicker">Day ${day.day_number} 일정 추가</p>${eventFormHTML(day.id, null)}</div>`;
}

function renderDayStory() {
  const track = document.getElementById('dayStoryTrack');
  if (!track) return;
  track.innerHTML = days.map((d, i) => {
    const firstEv = (d.events || [])[0];
    const tag2 = d.hotel_name ? '숙소 이동' : (firstEv ? (TYPE_LABEL[firstEv.type] || '일정') : '자유일정');
    const photo = DAY_PHOTOS[d.day_number];
    return `
      <button type="button" class="day-story-card ${d.id === selectedDayId ? 'active' : ''}" data-bg="${(i % 3) + 1}" data-act="story-select" data-id="${d.id}">
        <span class="bg"></span>
        ${photo ? `<img class="day-photo" src="${photo}" alt="" loading="lazy" onerror="this.remove()">` : ''}
        <span class="content">
          <span class="tag-eyebrow">DAY ${d.day_number}</span>
          <span class="title">${esc(d.title)}</span>
          <span class="pills"><span class="pill">${esc(CITY_LABEL[d.city] || d.city)}</span><span class="pill">${esc(tag2)}</span></span>
        </span>
      </button>`;
  }).join('');
  renderRouteMap();
}

/* ---------------- Route map (illustrated day-by-day route + highlights) ---------------- */

function formatMinutes(min) {
  if (min == null) return '';
  if (min < 60) return `${min}분`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

// Fetches the total driving distance/time for an ordered stop list (via the cached
// /api/directions route) and fills it into the given element. Fails silently — the
// embedded map itself already works without this, it's just a nice-to-have summary.
async function loadRouteSummary(elId, queries) {
  const el = document.getElementById(elId);
  if (!el || !mapsApiKey || queries.length < 2) return;
  const origin = queries[0];
  const destination = queries[queries.length - 1];
  const waypoints = queries.slice(1, -1);
  try {
    const params = new URLSearchParams({ origin, destination });
    if (waypoints.length) params.set('waypoints', waypoints.join('|'));
    const data = await api.get(`/api/directions?${params.toString()}`);
    if (el.isConnected && data && data.distance_km != null) {
      el.textContent = `🚗 총 이동거리 약 ${data.distance_km}km · ${formatMinutes(data.duration_min)}`;
    }
  } catch (e) {
    // leave the summary blank
  }
}

/* ---------------- Google Maps JS API (interactive route map w/ numbered pins) ----------------
 * The Embed API (plain iframe, used elsewhere for single-place links) can't customize its
 * markers, so route maps use the JS API instead: we render our own map + DirectionsRenderer
 * and add a numbered marker per stop, matching the numbers in the stop list above it. */

let mapsJsPromise = null;
function loadGoogleMapsJs() {
  if (window.google && window.google.maps && window.google.maps.Map) return Promise.resolve();
  if (!mapsApiKey) return Promise.reject(new Error('no maps key'));
  if (!mapsJsPromise) {
    mapsJsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      // No `loading=async` here on purpose: that param defers populating window.google.maps
      // until you separately call google.maps.importLibrary(), so `new google.maps.Map(...)`
      // right after onload would fail. This classic (no loading= param) form guarantees
      // google.maps.* is fully ready by the time the script's onload fires.
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(mapsApiKey)}`;
      script.async = true;
      script.onload = () => {
        if (window.google && window.google.maps && window.google.maps.Map) resolve();
        else reject(new Error('Google Maps JS loaded but google.maps.Map is missing'));
      };
      script.onerror = () => { mapsJsPromise = null; reject(new Error('Google Maps JS 로드 실패')); };
      document.head.appendChild(script);
    });
  }
  return mapsJsPromise;
}

function showRouteMapError(container, message) {
  if (!container || !container.isConnected) return;
  container.innerHTML = `<p class="empty-hint">${esc(message)}</p>`;
}

// Renders an interactive map with the driving route + a numbered pin per stop (1, 2, 3...,
// matching the stop list) into the given container. On any failure, leaves a short message
// in the container instead of a silent blank box, so a broken key/restriction is visible.
async function renderNumberedRouteMap(containerId, stops) {
  const container = document.getElementById(containerId);
  if (!container || !mapsApiKey || stops.length < 2) return;

  // init() kicks off several loaders concurrently (loadDays/loadSpots/loadConfig), and
  // more than one of them can end up calling back into this same container once the
  // Maps key is known. Skip re-rendering (and re-billing the Directions API) when the
  // stop list hasn't actually changed since the last call.
  const signature = stops.map((s) => s.query).join('|');
  if (container.dataset.routeSignature === signature) return;
  container.dataset.routeSignature = signature;

  try {
    await loadGoogleMapsJs();
  } catch (e) {
    console.error('Google Maps JS load failed:', e.message);
    showRouteMapError(container, '지도를 불러오지 못했습니다. (Maps JavaScript API 설정을 확인해주세요)');
    return;
  }
  // Bail if the panel was re-rendered (container gone) or a newer call for this same
  // container has since taken over (stops changed again while we were loading).
  if (!container.isConnected || container.dataset.routeSignature !== signature) return;

  let map;
  try {
    map = new google.maps.Map(container, { center: { lat: 13.75, lng: 100.6 }, zoom: 10 });
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({ map, suppressMarkers: true });
    const waypoints = stops.slice(1, -1).map((s) => ({ location: s.query, stopover: true }));

    directionsService.route({
      origin: stops[0].query,
      destination: stops[stops.length - 1].query,
      waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (!container.isConnected || container.dataset.routeSignature !== signature) return;
      if (status !== google.maps.DirectionsStatus.OK) {
        console.error('Directions request failed:', status);
        showRouteMapError(container, `경로를 불러오지 못했습니다. (${status})`);
        return;
      }
      directionsRenderer.setDirections(result);

      const badgeColor = getComputedStyle(document.documentElement).getPropertyValue('--bl-700').trim() || '#3a6ea8';
      const legs = result.routes[0].legs;
      const points = [legs[0].start_location, ...legs.map((l) => l.end_location)];
      points.forEach((pos, i) => {
        new google.maps.Marker({
          position: pos,
          map,
          title: stops[i] ? stops[i].title : '',
          label: { text: String(i + 1), color: '#fff', fontWeight: '700', fontSize: '11px' },
          icon: {
            path: google.maps.SymbolPath.CIRCLE, scale: 13,
            fillColor: badgeColor, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2,
          },
        });
      });
    });
  } catch (e) {
    console.error('renderNumberedRouteMap failed:', e.message);
    showRouteMapError(container, '지도를 표시하는 중 오류가 발생했습니다.');
  }
}

function routeLocationFor(day) {
  if (day.hotel_map_query) return { query: day.hotel_map_query, title: day.hotel_name || day.title };
  const firstEv = (day.events || []).find((ev) => ev.map_query);
  if (firstEv) return { query: firstEv.map_query, title: firstEv.name };
  return null;
}

function renderRouteMap() {
  const pathEl = document.getElementById('routePath');
  const highlightsEl = document.getElementById('routeHighlights');
  if (!pathEl || !highlightsEl) return;

  let prevCity = null;
  pathEl.innerHTML = days.map((d) => {
    const cityMark = d.city !== prevCity ? `<span class="route-city-mark">${esc(CITY_LABEL[d.city] || d.city)}</span>` : '';
    prevCity = d.city;
    const loc = routeLocationFor(d);
    const tag = loc
      ? `<a class="route-node js-map-link" href="${mapLink(loc.query)}" target="_blank" rel="noopener" data-map-query="${esc(loc.query)}" data-map-title="${esc(loc.title)}">`
      : `<span class="route-node">`;
    const closeTag = loc ? '</a>' : '</span>';
    return `${cityMark}${tag}<span class="route-node-dot">${d.day_number}</span><span class="route-node-label">${esc(d.title)}</span>${closeTag}`;
  }).join('') || '<p class="empty-hint">등록된 일정이 없습니다.</p>';

  const highlights = spots.filter((s) => s.category !== 'meal').slice(0, 4);
  highlightsEl.innerHTML = highlights.map((s) => `
    <a class="route-highlight-item${s.map_query ? ' js-map-link' : ''}" href="${s.map_query ? mapLink(s.map_query) : '#'}" target="_blank" rel="noopener"
       ${s.map_query ? `data-map-query="${esc(s.map_query)}" data-map-title="${esc(s.name)}"` : ''}>
      <span class="route-highlight-thumb">${s.image ? `<img src="${esc(s.image)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML=''">` : ''}</span>
      <span class="route-highlight-info">
        <span class="route-highlight-name">${esc(s.name)}</span>
        <span class="route-highlight-sub">${s.day ? `Day ${s.day} · ` : ''}${esc(s.city || '')}</span>
      </span>
    </a>`).join('') || '<p class="empty-hint">가볼 곳을 추가하면 여기에 표시됩니다.</p>';

  renderRouteMapEmbed();
}

// Real Google Maps route connecting each day's stop, in order — the Embed API's
// "directions" mode when a Maps API key is configured, otherwise a plain
// multi-stop Google Maps link (works with no key, same fallback pattern as
// the rest of the app's map links).
function renderRouteMapEmbed() {
  const wrap = document.getElementById('routeMapEmbed');
  const canvas = document.getElementById('routeMapCanvas');
  const fallback = document.getElementById('routeMapFallback');
  const fallbackLink = document.getElementById('routeMapFallbackLink');
  if (!wrap || !canvas) return;

  const stops = days.map(routeLocationFor).filter(Boolean);
  if (stops.length < 2) {
    wrap.hidden = true;
    if (fallback) fallback.hidden = true;
    return;
  }

  if (!mapsApiKey) {
    wrap.hidden = true;
    if (fallback) {
      fallback.hidden = false;
      if (fallbackLink) fallbackLink.href = `https://www.google.com/maps/dir/${stops.map((s) => encodeURIComponent(s.query)).join('/')}`;
    }
    return;
  }

  wrap.hidden = false;
  if (fallback) fallback.hidden = true;
  renderNumberedRouteMap('routeMapCanvas', stops);
  loadRouteSummary('routeMapSummary', stops.map((s) => s.query));
}

/* ---------------- Food / Stay / Shop showcase rows ---------------- */

function showcaseCardHTML(item) {
  const inner = `
    ${item.image ? `<img src="${esc(item.image)}" alt="" loading="lazy" onerror="this.remove()">` : ''}
    <span class="scrim"></span>
    <span class="label"><span class="name">${esc(item.name)}</span>${item.sub ? `<span class="sub">${esc(item.sub)}</span>` : ''}</span>`;
  if (item.mapQuery) {
    return `<a class="showcase-card js-map-link" href="${mapLink(item.mapQuery)}" target="_blank" rel="noopener" data-map-query="${esc(item.mapQuery)}" data-map-title="${esc(item.name)}">${inner}</a>`;
  }
  return `<div class="showcase-card">${inner}</div>`;
}

function renderShowcase() {
  const foodEl = document.getElementById('showcaseFood');
  const stayEl = document.getElementById('showcaseStay');
  const shopEl = document.getElementById('showcaseShop');
  if (!foodEl || !stayEl || !shopEl) return;

  const food = spots.filter((s) => s.category === 'meal').slice(0, 3)
    .map((s) => ({ name: s.name, sub: s.day ? `Day ${s.day} · ${s.city || ''}` : (s.city || ''), image: s.image, mapQuery: s.map_query }));
  foodEl.innerHTML = food.map(showcaseCardHTML).join('') || '<p class="empty-hint">맛집을 추가하면 여기에 표시됩니다.</p>';

  const stays = days.filter((d) => d.hotel_name).map((d) => ({
    name: d.hotel_name, sub: `Day ${d.day_number} · ${CITY_LABEL[d.city] || d.city}`,
    image: HOTEL_PHOTOS[d.hotel_name], mapQuery: d.hotel_map_query,
  }));
  stayEl.innerHTML = stays.map(showcaseCardHTML).join('') || '<p class="empty-hint">숙소 정보가 없습니다.</p>';

  const shop = SHOP_SPOT_NAMES.map((n) => spots.find((s) => s.name === n)).filter(Boolean)
    .map((s) => ({ name: s.name, sub: s.day ? `Day ${s.day} · ${s.city || ''}` : (s.city || ''), image: s.image, mapQuery: s.map_query }));
  shopEl.innerHTML = shop.map(showcaseCardHTML).join('') || '<p class="empty-hint">쇼핑 장소를 추가하면 여기에 표시됩니다.</p>';
}

const dayStoryPrevBtn = document.getElementById('dayStoryPrev');
const dayStoryNextBtn = document.getElementById('dayStoryNext');
if (dayStoryPrevBtn) dayStoryPrevBtn.addEventListener('click', () => document.getElementById('dayStoryTrack').scrollBy({ left: -480, behavior: 'smooth' }));
if (dayStoryNextBtn) dayStoryNextBtn.addEventListener('click', () => document.getElementById('dayStoryTrack').scrollBy({ left: 480, behavior: 'smooth' }));

function renderDayRail() {
  const rail = document.getElementById('dayRail');
  rail.innerHTML = days.map((d) => `
    <button type="button" class="day-rail-btn ${d.id === selectedDayId ? 'active' : ''}" data-act="select-day" data-id="${d.id}">
      <span class="day-rail-mark">${d.day_number}</span>
      <span class="day-rail-info">
        <span class="day-rail-date">${fmtDateShort(d.date)}</span>
        <span class="day-rail-sub">${CITY_LABEL[d.city] || d.city} · ${(d.events || []).length}건</span>
      </span>
    </button>`).join('') + `<button type="button" class="day-rail-add" data-act="add-day">＋ 날짜 추가</button>`;
}

// Ordered stops for one day's own route: every event that has a location, in time
// order, plus the day's hotel (if any) tacked on at the end.
function dayRouteStops(day) {
  const stops = (day.events || []).filter((ev) => ev.map_query).map((ev) => ({ query: ev.map_query, title: ev.name }));
  if (day.hotel_map_query) stops.push({ query: day.hotel_map_query, title: day.hotel_name || '숙소' });
  return stops;
}

function dayRouteStopsListHTML(stops, day) {
  const items = stops.map((s, i) => {
    const leg = i > 0 ? `<li class="day-route-leg" id="dayRouteLeg${day.id}-${i - 1}">→</li>` : '';
    return `${leg}<li class="day-route-stop"><span class="day-route-stop-num">${i + 1}</span><span class="day-route-stop-name">${esc(s.title)}</span></li>`;
  }).join('');
  return `<ol class="day-route-stops">${items}</ol>`;
}

// Fetches both the per-leg (stop N → stop N+1) and total distance/time for one day's
// route, and fills them into the stop-list connectors and the summary badge. Same
// fail-silent behavior as loadRouteSummary — the embedded map still works without it.
async function loadDayRouteLegs(day, queries) {
  if (!mapsApiKey || queries.length < 2) return;
  const origin = queries[0];
  const destination = queries[queries.length - 1];
  const waypoints = queries.slice(1, -1);
  try {
    const params = new URLSearchParams({ origin, destination });
    if (waypoints.length) params.set('waypoints', waypoints.join('|'));
    const data = await api.get(`/api/directions?${params.toString()}`);
    if (Array.isArray(data && data.legs_detail)) {
      data.legs_detail.forEach((leg, i) => {
        const legEl = document.getElementById(`dayRouteLeg${day.id}-${i}`);
        if (legEl && legEl.isConnected && leg.distance_km != null) {
          legEl.textContent = `→ ${leg.distance_km}km · ${formatMinutes(leg.duration_min)}`;
        }
      });
    }
    const summaryEl = document.getElementById(`dayRouteSummary${day.id}`);
    if (summaryEl && summaryEl.isConnected && data && data.distance_km != null) {
      summaryEl.textContent = `🚗 총 이동거리 약 ${data.distance_km}km · ${formatMinutes(data.duration_min)}`;
    }
  } catch (e) {
    // leave the stop list / summary blank
  }
}

function dayRouteCardHTML(day) {
  const stops = dayRouteStops(day);
  if (stops.length < 2) return '';
  const queries = stops.map((s) => s.query);

  let body;
  if (mapsApiKey) {
    body = `
      <div class="day-route-embed"><div class="day-route-canvas" id="dayRouteCanvas${day.id}"></div></div>
      <p class="day-route-summary" id="dayRouteSummary${day.id}"></p>`;
  } else {
    const link = `https://www.google.com/maps/dir/${queries.map(encodeURIComponent).join('/')}`;
    body = `<p class="day-route-fallback">실제 지도로 보려면 Google Maps API 키 설정이 필요해요. <a href="${link}" target="_blank" rel="noopener">Google 지도에서 이 날의 동선 보기 ↗</a></p>`;
  }
  return `
    <div class="day-route-card">
      <p class="card-kicker">Day ${day.day_number} 동선</p>
      ${dayRouteStopsListHTML(stops, day)}
      ${body}
    </div>`;
}

function renderDayPanel() {
  const panel = document.getElementById('dayPanel');
  const day = days.find((d) => d.id === selectedDayId) || days[0];
  if (!day) { panel.innerHTML = '<p class="empty-hint">날짜가 없습니다. 왼쪽에서 날짜를 추가해보세요.</p>'; return; }
  const idx = days.findIndex((d) => d.id === day.id);
  const prevDay = days[(idx - 1 + days.length) % days.length];
  const nextDay = days[(idx + 1) % days.length];
  panel.innerHTML = `
    ${dayPanelHeadHTML(day)}
    ${editingDayId === day.id ? dayEditFormHTML(day) : ''}
    ${hotelCardHTML(day)}
    <div class="event-list">
      ${(day.events || []).map((ev) => eventRowHTML(day, ev)).join('') || '<p class="empty-hint">아직 등록된 일정이 없습니다.</p>'}
    </div>
    ${newEventCardHTML(day)}
    ${dayRouteCardHTML(day)}
    <div class="day-nav">
      <button class="btn btn-ghost" type="button" data-act="goto-day" data-id="${prevDay.id}">이전 날</button>
      <button class="btn btn-primary" type="button" data-act="goto-day" data-id="${nextDay.id}">다음 날</button>
    </div>`;

  const dayStops = dayRouteStops(day);
  if (mapsApiKey) renderNumberedRouteMap(`dayRouteCanvas${day.id}`, dayStops);
  loadDayRouteLegs(day, dayStops.map((s) => s.query));
}

async function loadDays() {
  days = await api.get('/api/days');
  if (!days.some((d) => d.id === selectedDayId)) {
    selectedDayId = days.length ? days[0].id : null;
  }
  renderDayRail();
  renderDayPanel();
  renderDayStory();
  renderShowcase();
  populateDaySelect();
  updateDday();
}

function formatTimeValue(digits) {
  if (digits.length <= 2) return digits;
  if (digits.length === 3) return `${digits.slice(0, 1)}:${digits.slice(1)}`;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

const itinView = document.getElementById('view-itinerary');

itinView.addEventListener('input', (e) => {
  if (!e.target.matches('[data-autotime]')) return;
  const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
  e.target.value = formatTimeValue(digits);
});

itinView.addEventListener('change', (e) => {
  if (e.target.matches('select[name="currency"]')) applyCurrencyStep(e.target);
});

function resetItinFormState() {
  editingDayId = null; addingEventFor = null; editingEvent = null; addingMemoFor = null;
  addingExpenseFor = null; editingExpenseId = null;
}

itinView.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const act = btn.dataset.act;
  const id = btn.dataset.id ? Number(btn.dataset.id) : null;

  if (act === 'select-day' || act === 'goto-day' || act === 'story-select') {
    selectedDayId = id;
    resetItinFormState();
    renderDayRail(); renderDayPanel(); renderDayStory();
    if (act === 'story-select') document.querySelector('.itin-layout').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (act === 'add-day') {
    const day = await api.post('/api/days', { title: '새 날짜', city: 'bkk', date: '' });
    await loadDays();
    selectedDayId = day.id; editingDayId = day.id;
    renderDayRail(); renderDayPanel(); renderDayStory();
    toast('날짜를 추가했습니다');
  } else if (act === 'edit-day') {
    editingDayId = editingDayId === id ? null : id;
    renderDayPanel();
  } else if (act === 'cancel-day-edit') {
    editingDayId = null; renderDayPanel();
  } else if (act === 'del-day') {
    if (days.length <= 1) { toast('마지막 날짜는 삭제할 수 없습니다'); return; }
    if (confirm('이 날짜와 안의 모든 일정을 삭제할까요?')) {
      await api.del(`/api/days/${id}`);
      await loadDays();
      await loadExpenses();
      toast('날짜를 삭제했습니다');
    }
  } else if (act === 'add-event') {
    addingEventFor = addingEventFor === id ? null : id;
    editingEvent = null;
    renderDayPanel();
  } else if (act === 'cancel-event') {
    addingEventFor = null; editingEvent = null; renderDayPanel();
  } else if (act === 'edit-event') {
    editingEvent = editingEvent === id ? null : id;
    addingEventFor = null;
    renderDayPanel();
  } else if (act === 'del-event') {
    if (confirm('이 항목을 삭제할까요?')) {
      await api.del(`/api/days/events/${id}`);
      await loadDays();
      await loadExpenses();
      toast('일정을 삭제했습니다');
    }
  } else if (act === 'add-event-expense' || act === 'cancel-event-expense') {
    addingExpenseFor = act === 'add-event-expense' ? id : null;
    renderDayPanel();
  } else if (act === 'edit-expense-from-event') {
    editingExpenseId = id; renderDayPanel();
  } else if (act === 'cancel-expense-edit') {
    editingExpenseId = null; renderDayPanel();
  } else if (act === 'del-expense-from-event') {
    if (confirm('이 지출 내역을 삭제할까요?')) {
      await api.del(`/api/expenses/${id}`);
      toast('비용을 삭제했습니다');
      await loadExpenses();
    }
  } else if (act === 'add-event-memo' || act === 'edit-event-memo') {
    addingMemoFor = id; renderDayPanel();
  } else if (act === 'cancel-event-memo') {
    addingMemoFor = null; renderDayPanel();
  }
});

itinView.addEventListener('submit', async (e) => {
  const form = e.target.closest('form[data-act]');
  if (!form) return;
  e.preventDefault();
  const act = form.dataset.act;
  const fd = Object.fromEntries(new FormData(form).entries());

  if (act === 'save-day-combined') {
    if (!fd.hotel_name || !fd.hotel_name.trim()) {
      fd.hotel_name = ''; fd.hotel_note = ''; fd.hotel_addr = ''; fd.hotel_map_query = ''; fd.hotel_website = '';
    }
    await api.put(`/api/days/${form.dataset.id}`, fd);
    editingDayId = null;
    await loadDays();
    toast('날짜 정보를 저장했습니다');
  } else if (act === 'save-event') {
    const dayId = form.dataset.dayId;
    const eventId = form.dataset.id;
    if (eventId) await api.put(`/api/days/events/${eventId}`, fd);
    else await api.post(`/api/days/${dayId}/events`, fd);
    editingEvent = null; addingEventFor = null;
    await loadDays();
    toast(eventId ? '일정을 저장했습니다' : '일정을 추가했습니다');
  } else if (act === 'save-event-memo') {
    await api.put(`/api/days/events/${form.dataset.id}`, { memo: fd.memo || '' });
    addingMemoFor = null;
    await loadDays();
    toast(fd.memo ? '메모를 저장했습니다' : '메모를 비웠습니다');
  } else if (act === 'save-event-expense') {
    await api.post('/api/expenses', { ...applyExpenseAmounts(fd), day_id: form.dataset.dayId, event_id: form.dataset.eventId });
    addingExpenseFor = null;
    await loadExpenses();
    toast('비용을 저장했습니다');
  } else if (act === 'save-event-expense-edit') {
    await api.put(`/api/expenses/${form.dataset.id}`, applyExpenseAmounts(fd));
    editingExpenseId = null;
    await loadExpenses();
    toast('비용을 수정했습니다');
  }
});

/* ---------------- Expenses ---------------- */

function exchangeRate() {
  return Number(localStorage.getItem('krwPerThb') || 41);
}
function krw(thb) {
  return Math.round(thb * exchangeRate()).toLocaleString('ko-KR');
}
function amountToThb(fd) {
  const raw = Number(fd.amount_input) || 0;
  return fd.currency === 'krw' ? +(raw / exchangeRate()).toFixed(2) : raw;
}
function applyExpenseAmounts(fd) {
  fd.amount_thb = amountToThb(fd);
  if (fd.currency === 'krw') fd.amount_krw = Number(fd.amount_input) || 0;
  return fd;
}
function filteredExpenses() {
  return paymentFilter === 'all' ? expenses : expenses.filter((e) => (e.payment_method || '카드') === paymentFilter);
}

const fxInput = document.getElementById('fxRate');
if (fxInput) {
  fxInput.value = exchangeRate();
  fxInput.addEventListener('change', () => {
    const v = Number(fxInput.value) || 41;
    localStorage.setItem('krwPerThb', v);
    renderExpenseHero(); renderExpenseTable(); updateConvertHint();
  });
}

const fxFetchBtn = document.getElementById('fxFetchBtn');
const fxUpdatedEl = document.getElementById('fxUpdated');
async function fetchTodayFx(interactive) {
  if (!fxInput) return;
  if (fxFetchBtn) { fxFetchBtn.disabled = true; fxFetchBtn.textContent = '조회 중...'; }
  try {
    const data = await api.get('/api/fx');
    if (data && data.rate) {
      const rounded = Math.round(data.rate * 100) / 100;
      fxInput.value = rounded;
      localStorage.setItem('krwPerThb', rounded);
      renderExpenseHero(); renderExpenseTable(); updateConvertHint();
      if (fxUpdatedEl) {
        const dateStr = new Date(data.updated_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
        fxUpdatedEl.textContent = data.stale
          ? `⚠️ ${dateStr} 기준 (재조회 실패, 이전 값 사용)`
          : `${dateStr} 환율 기준 · frankfurter.app`;
      }
      toast(`환율을 ${rounded}원으로 갱신했습니다`);
    }
  } catch (e) {
    if (fxUpdatedEl) fxUpdatedEl.textContent = '환율 조회 실패 — 직접 입력해주세요';
    if (interactive) toast('환율 조회에 실패했습니다. 직접 입력해주세요.');
  } finally {
    if (fxFetchBtn) { fxFetchBtn.disabled = false; fxFetchBtn.textContent = '오늘 환율 불러오기'; }
  }
}
if (fxFetchBtn) fxFetchBtn.addEventListener('click', () => fetchTodayFx(true));

document.getElementById('paymentFilter').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-filter]');
  if (!btn) return;
  paymentFilter = btn.dataset.filter;
  renderExpenseHero(); renderExpenseTable();
});

document.getElementById('breakdownToggleBtn').addEventListener('click', () => {
  breakdownOpen = !breakdownOpen;
  renderExpenseHero();
});

async function loadExpenses() {
  expenses = await api.get('/api/expenses');
  renderExpenseHero();
  renderExpenseTable();
  if (days.length) renderDayPanel();
}

function renderExpenseHero() {
  const list = filteredExpenses();
  const total = list.reduce((s, e) => s + e.amount_thb, 0);

  document.getElementById('expenseFilterLabel').textContent = `총 지출 · ${paymentFilter === 'all' ? '전체' : paymentFilter}`;
  document.getElementById('expenseTotalKrw').textContent = `🇰🇷 ${krw(total)}원`;
  document.getElementById('expenseTotalThb').textContent = `🇹🇭 ${bahtStr(total)}`;
  document.getElementById('expenseRowCount').textContent = `${list.length}건`;

  document.querySelectorAll('#paymentFilter .expense-filter-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.filter === paymentFilter);
  });

  const breakdownEl = document.getElementById('categoryBreakdown');
  document.getElementById('breakdownToggleBtn').textContent = breakdownOpen ? '분류 접기' : '분류 펼치기';
  if (!breakdownOpen) { breakdownEl.innerHTML = ''; return; }

  const byCat = {};
  list.forEach((e) => { byCat[e.category] = (byCat[e.category] || 0) + e.amount_thb; });
  const keys = Object.keys(byCat).sort((a, b) => byCat[b] - byCat[a]);
  const max = keys.length ? byCat[keys[0]] : 1;
  breakdownEl.innerHTML = keys.map((k) => `
    <div class="breakdown-row">
      <div class="head"><span class="lbl">${esc(k)}</span><span class="amt mono">${krw(byCat[k])}원</span></div>
      <div class="breakdown-bar"><span style="width:${Math.max(6, Math.round((byCat[k] / max) * 100))}%"></span></div>
    </div>`).join('');
}

function expenseLinkTag(e) {
  if (e.event_id) {
    const found = findEventById(e.event_id);
    if (found) return esc(`Day ${found.day.day_number} · ${found.event.name}`);
  }
  if (e.day_id) {
    const d = days.find((dd) => dd.id === e.day_id);
    if (d) return `Day ${d.day_number}`;
  }
  return '—';
}

function expenseAmountHTML(e) {
  if (e.currency === 'krw') {
    const amt = e.amount_krw != null ? e.amount_krw : Math.round(e.amount_thb * exchangeRate());
    return `<span class="krw mono">${Number(amt).toLocaleString('ko-KR')}원</span>`;
  }
  return `<span class="krw mono">${krw(e.amount_thb)}원</span><span class="thb mono">${bahtStr(e.amount_thb)}</span>`;
}

function renderExpenseTable() {
  const tbody = document.getElementById('expenseRows');
  const list = filteredExpenses();
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-hint">해당하는 지출 내역이 없습니다.</td></tr>';
    return;
  }
  tbody.innerHTML = list.map((e) => `
    <tr>
      <td class="mono" data-label="날짜">${esc(e.date)}</td>
      <td data-label="분류"><span class="cat-pill" data-category="${esc(e.category)}">${esc(e.category)}</span></td>
      <td data-label="결제수단">${esc(e.payment_method || '카드')}</td>
      <td data-label="내용">${esc(e.description)}</td>
      <td data-label="연결"><span class="link-pill">${expenseLinkTag(e)}</span></td>
      <td data-label="결제자">${esc(e.payer || '—')}</td>
      <td data-label="메모">${esc(e.memo || '—')}</td>
      <td class="amount" data-label="금액">${expenseAmountHTML(e)}</td>
      <td class="row-actions-cell" data-label="">
        <button class="row-link-btn" type="button" data-act="edit-expense" data-id="${e.id}">수정</button>
        <button class="row-link-btn" type="button" data-act="del-expense" data-id="${e.id}" style="color:var(--red)">삭제</button>
      </td>
    </tr>`).join('');
}

function updateAmountLabel() {
  const cur = document.getElementById('x-cur').value;
  document.getElementById('x-amt-label').textContent = cur === 'krw' ? '결제 금액 (원)' : '결제 금액 (바트)';
}

function updateConvertHint() {
  const form = document.getElementById('expenseForm');
  const amt = parseFloat(form.amount_input.value);
  const hintEl = document.getElementById('convertHint');
  const rate = exchangeRate();
  if (isFinite(amt) && amt > 0) {
    hintEl.textContent = form.currency.value === 'krw'
      ? `${Number(amt).toLocaleString('ko-KR')}원 → ${bahtStr(amt / rate)} (환율 ${rate})`
      : `${bahtStr(amt)} → ${krw(amt)}원 (환율 ${rate})`;
  } else {
    hintEl.textContent = '통화를 고르고 금액을 입력하면 환산값이 표시됩니다';
  }
}

document.getElementById('x-cur').addEventListener('change', (e) => {
  applyCurrencyStep(e.target);
  updateAmountLabel();
  updateConvertHint();
});

function applyCurrencyStep(selectEl) {
  const form = selectEl.closest('form');
  const amountInput = form && form.querySelector('input[name="amount_input"]');
  if (!amountInput) return;
  const isKrw = selectEl.value === 'krw';
  amountInput.step = isKrw ? '1' : '0.01';
  amountInput.setAttribute('inputmode', isKrw ? 'numeric' : 'decimal');
}

function startEditExpense(id) {
  const e = expenses.find((x) => x.id === id);
  if (!e) return;
  editingTopExpenseId = id;
  const form = document.getElementById('expenseForm');
  form.date.value = e.date;
  form.category.value = e.category;
  form.payment_method.value = e.payment_method || '카드';
  form.currency.value = e.currency || 'thb';
  form.amount_input.value = e.currency === 'krw' ? (e.amount_krw ?? Math.round(e.amount_thb * exchangeRate())) : e.amount_thb;
  form.description.value = e.description || '';
  form.payer.value = e.payer || '';
  form.memo.value = e.memo || '';
  applyCurrencyStep(form.currency);
  updateAmountLabel();
  updateConvertHint();
  document.getElementById('expenseFormTitle').textContent = '비용 수정';
  document.getElementById('expenseSubmitBtn').textContent = '수정 저장';
  document.getElementById('expenseCancelEditBtn').hidden = false;
  document.querySelector('.expense-form-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function cancelExpenseEdit(keep) {
  editingTopExpenseId = null;
  const form = document.getElementById('expenseForm');
  form.reset();
  form.date.value = (keep && keep.date) || new Date().toISOString().slice(0, 10);
  form.category.value = (keep && keep.category) || '식비';
  form.payment_method.value = (keep && keep.payment_method) || '카드';
  form.currency.value = (keep && keep.currency) || 'thb';
  form.payer.value = (keep && keep.payer) || '';
  applyCurrencyStep(form.currency);
  updateAmountLabel();
  updateConvertHint();
  document.getElementById('expenseFormTitle').textContent = '비용 추가';
  document.getElementById('expenseSubmitBtn').textContent = '비용 추가';
  document.getElementById('expenseCancelEditBtn').hidden = true;
}
document.getElementById('expenseCancelEditBtn').addEventListener('click', () => cancelExpenseEdit());

document.getElementById('expenseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const fd = Object.fromEntries(new FormData(form).entries());
  if (!(fd.description || '').trim()) { toast('내용을 입력하세요'); return; }
  if (!(Number(fd.amount_input) > 0)) { toast('금액을 입력하세요'); return; }
  const payload = applyExpenseAmounts({ ...fd });
  const wasEditing = editingTopExpenseId;
  if (wasEditing) await api.put(`/api/expenses/${wasEditing}`, payload);
  else await api.post('/api/expenses', payload);
  toast(wasEditing ? '비용을 수정했습니다' : '비용을 추가했습니다');
  cancelExpenseEdit(wasEditing ? null : { date: fd.date, category: fd.category, payment_method: fd.payment_method, currency: fd.currency, payer: fd.payer });
  await loadExpenses();
});
document.getElementById('expenseForm').addEventListener('input', updateConvertHint);

document.getElementById('expenseRows').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.act === 'edit-expense') {
    startEditExpense(id);
  } else if (btn.dataset.act === 'del-expense') {
    if (confirm('이 지출 내역을 삭제할까요?')) {
      await api.del(`/api/expenses/${id}`);
      if (editingTopExpenseId === id) cancelExpenseEdit();
      toast('비용을 삭제했습니다');
      await loadExpenses();
    }
  }
});

/* ---------------- Gallery ---------------- */

function populateDaySelect() {
  const sel = document.getElementById('imageDaySelect');
  const current = sel.value;
  sel.innerHTML = '<option value="">선택 안함</option>' +
    days.map((d) => `<option value="${d.id}">Day ${d.day_number} · ${esc(d.title)}</option>`).join('');
  sel.value = current;
}

async function loadImages() {
  images = await api.get('/api/images');
  renderGallery();
}

function galleryItemHTML(img) {
  const day = img.day_id ? days.find((d) => d.id === img.day_id) : null;
  return `
    <figure>
      <button type="button" class="photo-btn" data-act="view-image" data-src="/uploads/${esc(img.filename)}">
        <img src="/uploads/${esc(img.filename)}" alt="${esc(img.caption || '')}">
      </button>
      <figcaption>
        <span class="cap">${esc(img.caption || '')}</span>
        <span class="day">${day ? `Day ${day.day_number}` : '날짜 없음'}</span>
        <button class="row-link-btn" type="button" data-act="del-image" data-id="${img.id}">삭제</button>
      </figcaption>
    </figure>`;
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  const empty = document.getElementById('photoEmpty');
  if (!images.length) { grid.innerHTML = ''; empty.hidden = false; return; }
  empty.hidden = true;
  grid.innerHTML = images.map(galleryItemHTML).join('');
}

const photoFileInput = document.getElementById('p-file');
const photoHintEl = document.getElementById('photoHint');
photoFileInput.addEventListener('change', () => {
  const f = photoFileInput.files && photoFileInput.files[0];
  photoHintEl.textContent = f ? `${f.name} 선택됨` : '파일을 고르고 캡션을 적은 뒤 업로드하세요';
});

document.getElementById('imageForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const file = form.file.files[0];
  if (!file) { toast('사진 파일을 선택하세요'); return; }
  const { filename } = await api.uploadFile(file);
  await api.post('/api/images', { filename, caption: form.caption.value, day_id: form.day_id.value || null });
  form.reset();
  photoHintEl.textContent = '파일을 고르고 캡션을 적은 뒤 업로드하세요';
  toast('사진을 올렸습니다');
  await loadImages();
});

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
document.getElementById('galleryGrid').addEventListener('click', async (e) => {
  const viewBtn = e.target.closest('[data-act="view-image"]');
  const delBtn = e.target.closest('[data-act="del-image"]');
  if (viewBtn) {
    lightboxImg.src = viewBtn.dataset.src;
    lightbox.classList.add('open');
  } else if (delBtn) {
    if (confirm('이 사진을 삭제할까요?')) {
      await api.del(`/api/images/${delBtn.dataset.id}`);
      toast('사진을 삭제했습니다');
      await loadImages();
    }
  }
});
lightbox.addEventListener('click', () => lightbox.classList.remove('open'));

/* ---------------- Init ---------------- */

(async function init() {
  try {
    const session = await api.get('/api/auth/session');
    if (!session.authed) { window.location.href = '/login.html'; return; }
  } catch (e) { return; }

  try {
    document.getElementById('x-date').value = new Date().toISOString().slice(0, 10);
    updateAmountLabel();
    updateConvertHint();
    await loadDays();
    await Promise.all([loadExpenses(), loadImages(), loadWeather(), loadSpots(), loadConfig()]);
    if (!localStorage.getItem('krwPerThb')) fetchTodayFx(false); // first-ever visit: seed a real rate instead of the 41 fallback
  } catch (err) {
    console.error('init failed:', err);
    const panel = document.getElementById('dayPanel');
    if (panel) {
      panel.innerHTML = `<p class="empty-hint">불러오는 중 오류가 발생했습니다: ${esc(err.message || String(err))}<br>새로고침해도 안 되면 화면을 캡처해서 알려주세요.</p>`;
    }
  }
})();
