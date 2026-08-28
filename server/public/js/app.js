let days = [];
let expenses = [];
let images = [];
let editingDay = null;   // day id currently showing its edit form
let editingHotel = null; // day id currently showing hotel edit form
let editingEvent = null; // event id currently showing its edit form
let addingEventFor = null; // day id currently showing "new event" form

const CITY_LABEL = { bkk: '방콕', pty: '파타야' };
const TYPE_LABEL = { activity: '활동', meal: '식사', flight: '항공' };

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function mapLink(q) {
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : '';
}
function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  if (Number.isNaN(dt.getTime())) return d;
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d} (${days[dt.getDay()]})`;
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

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await api.post('/api/auth/logout');
  window.location.href = '/login.html';
});

/* ---------------- Itinerary ---------------- */

function eventRowHTML(day, ev) {
  if (editingEvent === ev.id) return eventFormHTML(day.id, ev);
  return `
    <div class="event-row type-${esc(ev.type)}">
      <div class="time mono">${esc(ev.time)}</div>
      <div class="body">
        <div class="name">${esc(ev.name)}</div>
        ${ev.desc ? `<div class="desc">${esc(ev.desc)}</div>` : ''}
        ${ev.map_query ? `<a class="maplink" href="${mapLink(ev.map_query)}" target="_blank" rel="noopener">📍 지도</a>` : ''}
      </div>
      <div class="row-actions">
        <button class="icon-btn" data-act="edit-event" data-id="${ev.id}" title="수정">✏️</button>
        <button class="icon-btn danger" data-act="del-event" data-id="${ev.id}" title="삭제">🗑</button>
      </div>
    </div>`;
}

function eventFormHTML(dayId, ev) {
  const e = ev || { id: null, time: '', type: 'activity', name: '', desc: '', map_query: '' };
  return `
    <form class="inline-form" data-act="save-event" data-day-id="${dayId}" data-id="${e.id || ''}">
      <div class="form-grid">
        <div class="form-row"><label class="form-label">시간</label><input class="form-input" name="time" value="${esc(e.time)}" placeholder="09:00"></div>
        <div class="form-row"><label class="form-label">종류</label>
          <select class="form-input" name="type">
            <option value="activity" ${e.type === 'activity' ? 'selected' : ''}>활동</option>
            <option value="meal" ${e.type === 'meal' ? 'selected' : ''}>식사</option>
            <option value="flight" ${e.type === 'flight' ? 'selected' : ''}>항공</option>
          </select>
        </div>
        <div class="form-row" style="grid-column: span 2;"><label class="form-label">이름</label><input class="form-input" name="name" value="${esc(e.name)}" required></div>
        <div class="form-row" style="grid-column: 1 / -1;"><label class="form-label">설명</label><input class="form-input" name="desc" value="${esc(e.desc)}"></div>
        <div class="form-row" style="grid-column: 1 / -1;"><label class="form-label">지도 검색어 (선택)</label><input class="form-input" name="map_query" value="${esc(e.map_query || '')}" placeholder="예: Wat Arun Bangkok"></div>
      </div>
      <div class="btn-bar">
        <button class="btn" type="button" data-act="cancel-event">취소</button>
        <button class="btn btn-primary" type="submit">저장</button>
      </div>
    </form>`;
}

function hotelBoxHTML(day) {
  if (editingHotel === day.id) {
    return `
      <form class="inline-form" data-act="save-hotel" data-id="${day.id}">
        <div class="form-grid">
          <div class="form-row" style="grid-column: 1 / -1;"><label class="form-label">숙소명</label><input class="form-input" name="hotel_name" value="${esc(day.hotel_name || '')}"></div>
          <div class="form-row" style="grid-column: 1 / -1;"><label class="form-label">주소</label><input class="form-input" name="hotel_addr" value="${esc(day.hotel_addr || '')}"></div>
          <div class="form-row" style="grid-column: 1 / -1;"><label class="form-label">메모</label><input class="form-input" name="hotel_note" value="${esc(day.hotel_note || '')}"></div>
          <div class="form-row"><label class="form-label">지도 검색어</label><input class="form-input" name="hotel_map_query" value="${esc(day.hotel_map_query || '')}"></div>
          <div class="form-row"><label class="form-label">홈페이지</label><input class="form-input" name="hotel_website" value="${esc(day.hotel_website || '')}"></div>
        </div>
        <div class="btn-bar">
          <button class="btn" type="button" data-act="cancel-hotel">취소</button>
          <button class="btn btn-primary" type="submit">저장</button>
        </div>
      </form>`;
  }
  if (!day.hotel_name) {
    return `<button class="btn btn-sm" data-act="edit-hotel" data-id="${day.id}" style="margin-top:10px;">+ 숙소 정보 추가</button>`;
  }
  return `
    <div class="hotel-box">
      <div class="name">🏨 ${esc(day.hotel_name)}</div>
      ${day.hotel_addr ? `<div class="addr">${esc(day.hotel_addr)}</div>` : ''}
      ${day.hotel_note ? `<div style="margin-top:4px;">${esc(day.hotel_note)}</div>` : ''}
      <div class="btn-bar" style="justify-content:flex-start; margin-top:8px;">
        ${day.hotel_map_query ? `<a class="btn btn-sm" href="${mapLink(day.hotel_map_query)}" target="_blank" rel="noopener">📍 지도</a>` : ''}
        ${day.hotel_website ? `<a class="btn btn-sm" href="${esc(day.hotel_website)}" target="_blank" rel="noopener">🔗 홈페이지</a>` : ''}
        <button class="btn btn-sm" data-act="edit-hotel" data-id="${day.id}">✏️ 수정</button>
      </div>
    </div>`;
}

function dayHeadHTML(day) {
  if (editingDay === day.id) {
    return `
      <form class="inline-form" data-act="save-day" data-id="${day.id}" style="flex:1;">
        <div class="form-grid">
          <div class="form-row"><label class="form-label">일차</label><input class="form-input" type="number" name="day_number" value="${day.day_number}"></div>
          <div class="form-row"><label class="form-label">날짜</label><input class="form-input" type="date" name="date" value="${esc(day.date)}"></div>
          <div class="form-row"><label class="form-label">도시</label>
            <select class="form-input" name="city">
              <option value="bkk" ${day.city === 'bkk' ? 'selected' : ''}>방콕</option>
              <option value="pty" ${day.city === 'pty' ? 'selected' : ''}>파타야</option>
            </select>
          </div>
          <div class="form-row" style="grid-column: span 2;"><label class="form-label">제목</label><input class="form-input" name="title" value="${esc(day.title)}" required></div>
        </div>
        <div class="btn-bar">
          <button class="btn" type="button" data-act="cancel-day">취소</button>
          <button class="btn btn-primary" type="submit">저장</button>
        </div>
      </form>`;
  }
  return `
    <div class="badge ${day.city === 'pty' ? 'pty' : ''}">${day.day_number}</div>
    <div class="meta">
      <div class="date mono">${fmtDate(day.date)} · ${CITY_LABEL[day.city] || day.city}</div>
      <div class="title">${esc(day.title)}</div>
    </div>
    <div class="row-actions">
      <button class="icon-btn" data-act="edit-day" data-id="${day.id}" title="수정">✏️</button>
      <button class="icon-btn danger" data-act="del-day" data-id="${day.id}" title="삭제">🗑</button>
    </div>`;
}

function dayCardHTML(day) {
  return `
    <div class="day-card" data-day-id="${day.id}">
      <div class="day-card-head">${dayHeadHTML(day)}</div>
      <div class="day-card-body">
        ${(day.events || []).map((ev) => eventRowHTML(day, ev)).join('') || '<p class="empty-hint">아직 등록된 일정이 없습니다.</p>'}
        ${addingEventFor === day.id ? eventFormHTML(day.id, null) : `<button class="btn btn-sm" data-act="add-event" data-id="${day.id}" style="margin-top:10px;">+ 항목 추가</button>`}
        ${hotelBoxHTML(day)}
      </div>
    </div>`;
}

function renderDays() {
  const container = document.getElementById('daysContainer');
  container.innerHTML = days.length
    ? days.map(dayCardHTML).join('')
    : '<p class="empty-hint">아직 일정이 없습니다. 아래 버튼으로 첫 날짜를 추가해보세요.</p>';
}

async function loadDays() {
  days = await api.get('/api/days');
  renderDays();
  populateDaySelect();
}

document.getElementById('daysContainer').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const act = btn.dataset.act;
  const id = btn.dataset.id ? Number(btn.dataset.id) : null;

  if (act === 'edit-day') { editingDay = id; renderDays(); }
  else if (act === 'cancel-day') { editingDay = null; renderDays(); }
  else if (act === 'del-day') {
    if (confirm('이 날짜와 안의 모든 일정을 삭제할까요?')) { await api.del(`/api/days/${id}`); await loadDays(); }
  } else if (act === 'edit-hotel') { editingHotel = id; renderDays(); }
  else if (act === 'cancel-hotel') { editingHotel = null; renderDays(); }
  else if (act === 'edit-event') { editingEvent = id; addingEventFor = null; renderDays(); }
  else if (act === 'cancel-event') { editingEvent = null; renderDays(); }
  else if (act === 'del-event') {
    if (confirm('이 항목을 삭제할까요?')) {
      const day = days.find((d) => d.events.some((ev) => ev.id === id));
      const updated = await api.del(`/api/days/events/${id}`);
      if (day) Object.assign(day, updated);
      renderDays();
    }
  } else if (act === 'add-event') { addingEventFor = id; editingEvent = null; renderDays(); }
});

document.getElementById('daysContainer').addEventListener('submit', async (e) => {
  const form = e.target.closest('form[data-act]');
  if (!form) return;
  e.preventDefault();
  const act = form.dataset.act;
  const fd = Object.fromEntries(new FormData(form).entries());

  if (act === 'save-day') {
    const updated = await api.put(`/api/days/${form.dataset.id}`, fd);
    const idx = days.findIndex((d) => d.id === updated.id);
    if (idx >= 0) days[idx] = updated;
    editingDay = null;
    renderDays();
  } else if (act === 'save-hotel') {
    const updated = await api.put(`/api/days/${form.dataset.id}`, fd);
    const idx = days.findIndex((d) => d.id === updated.id);
    if (idx >= 0) days[idx] = updated;
    editingHotel = null;
    renderDays();
  } else if (act === 'save-event') {
    const dayId = form.dataset.dayId;
    const eventId = form.dataset.id;
    const updated = eventId
      ? await api.put(`/api/days/events/${eventId}`, fd)
      : await api.post(`/api/days/${dayId}/events`, fd);
    const idx = days.findIndex((d) => d.id === updated.id);
    if (idx >= 0) days[idx] = updated;
    editingEvent = null;
    addingEventFor = null;
    renderDays();
  }
});

document.getElementById('addDayBtn').addEventListener('click', async () => {
  const day = await api.post('/api/days', { title: '새 날짜', city: 'bkk', date: '' });
  days.push(day);
  editingDay = day.id;
  renderDays();
  populateDaySelect();
});

/* ---------------- Expenses ---------------- */

let paymentFilter = 'all'; // 'all' | '카드' | '현금'

function exchangeRate() {
  return Number(localStorage.getItem('krwPerThb') || 41);
}
function krw(thb) {
  return Math.round(thb * exchangeRate()).toLocaleString('ko-KR');
}

const fxInput = document.getElementById('fxRate');
if (fxInput) {
  fxInput.value = exchangeRate();
  fxInput.addEventListener('change', () => {
    const v = Number(fxInput.value) || 41;
    localStorage.setItem('krwPerThb', v);
    renderSummary();
    renderExpenses();
  });
}

const paymentFilterEl = document.getElementById('paymentFilter');
if (paymentFilterEl) {
  paymentFilterEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    paymentFilter = btn.dataset.filter;
    document.querySelectorAll('#paymentFilter .seg').forEach((b) => b.classList.toggle('active', b === btn));
    renderSummary();
    renderExpenses();
  });
}

function filteredExpenses() {
  return paymentFilter === 'all' ? expenses : expenses.filter((e) => (e.payment_method || '카드') === paymentFilter);
}

async function loadExpenses() {
  expenses = await api.get('/api/expenses');
  renderExpenses();
  renderSummary();
}

function renderSummary() {
  const list = filteredExpenses();
  const total = list.reduce((s, e) => s + e.amount_thb, 0);
  const byPayer = {};
  list.forEach((e) => { if (e.payer) byPayer[e.payer] = (byPayer[e.payer] || 0) + e.amount_thb; });
  const strip = document.getElementById('summaryStrip');
  const moneyCard = (thb, label) => `
    <div class="summary-card">
      <div class="num mono">${krw(thb)}원</div>
      <div class="lbl">${label} · ฿${thb.toLocaleString('ko-KR')}</div>
    </div>`;
  const cards = [
    moneyCard(total, paymentFilter === 'all' ? '전체 지출' : `${paymentFilter} 지출`),
    ...Object.entries(byPayer).map(([p, v]) => moneyCard(v, `${esc(p)} 결제`)),
  ];
  strip.innerHTML = cards.join('');
}

function renderExpenses() {
  const tbody = document.getElementById('expenseRows');
  const list = filteredExpenses();
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-hint">해당하는 지출 내역이 없습니다.</td></tr>';
    return;
  }
  tbody.innerHTML = list.map((e) => `
    <tr>
      <td class="mono">${esc(e.date)}</td>
      <td><span class="cat-pill">${esc(e.category)}</span></td>
      <td><span class="pm-pill">${esc(e.payment_method || '카드')}</span></td>
      <td>${esc(e.description)}</td>
      <td>${esc(e.payer)}</td>
      <td>${esc(e.memo || '')}</td>
      <td class="amount"><span class="amount-krw">${krw(e.amount_thb)}원</span><span class="amount-thb">฿${Number(e.amount_thb).toLocaleString('ko-KR')}</span></td>
      <td><button class="icon-btn danger" data-id="${e.id}" data-act="del-expense">🗑</button></td>
    </tr>`).join('');
}

document.getElementById('expenseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(e.target).entries());
  await api.post('/api/expenses', fd);
  e.target.reset();
  await loadExpenses();
});

document.getElementById('expenseRows').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-act="del-expense"]');
  if (!btn) return;
  if (confirm('이 지출 내역을 삭제할까요?')) {
    await api.del(`/api/expenses/${btn.dataset.id}`);
    await loadExpenses();
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
  return `
    <div class="gallery-item">
      <img src="/uploads/${esc(img.filename)}" alt="${esc(img.caption || '')}" data-act="view-image" data-src="/uploads/${esc(img.filename)}">
      <button class="icon-btn danger del" data-act="del-image" data-id="${img.id}">🗑</button>
      ${img.caption ? `<div class="cap">${esc(img.caption)}</div>` : ''}
    </div>`;
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!images.length) {
    grid.innerHTML = '<p class="empty-hint">아직 업로드된 사진이 없습니다.</p>';
    return;
  }

  const byDay = new Map(); // day_id (or 'none') -> images[]
  images.forEach((img) => {
    const key = img.day_id || 'none';
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(img);
  });
  byDay.forEach((list) => list.sort((a, b) => a.uploaded_at.localeCompare(b.uploaded_at)));

  const sortedDays = days.slice().sort((a, b) => a.sort_order - b.sort_order);
  const sections = [];

  sortedDays.forEach((day) => {
    const list = byDay.get(day.id);
    if (!list || !list.length) return;
    sections.push(`
      <div class="day-group-head">
        <span class="n mono">Day ${day.day_number}</span>
        <span class="t">${esc(day.title)}</span>
        <span class="c">${list.length}장</span>
      </div>
      <div class="gallery-grid">${list.map(galleryItemHTML).join('')}</div>`);
  });

  const unassigned = byDay.get('none');
  if (unassigned && unassigned.length) {
    sections.push(`
      <div class="day-group-head">
        <span class="n mono">—</span>
        <span class="t">날짜 미지정</span>
        <span class="c">${unassigned.length}장</span>
      </div>
      <div class="gallery-grid">${unassigned.map(galleryItemHTML).join('')}</div>`);
  }

  grid.innerHTML = sections.join('');
}

document.getElementById('imageForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const file = form.file.files[0];
  if (!file) return;
  const { filename } = await api.uploadFile(file);
  await api.post('/api/images', { filename, caption: form.caption.value, day_id: form.day_id.value || null });
  form.reset();
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
    document.getElementById('expenseForm').date.value = new Date().toISOString().slice(0, 10);
    await loadDays(); // gallery grouping needs `days` populated first
    await Promise.all([loadExpenses(), loadImages()]);
  } catch (err) {
    console.error('init failed:', err);
    const container = document.getElementById('daysContainer');
    if (container) {
      container.innerHTML = `<p class="empty-hint">불러오는 중 오류가 발생했습니다: ${esc(err.message || String(err))}<br>새로고침해도 안 되면 화면을 캡처해서 알려주세요.</p>`;
    }
  }
})();
