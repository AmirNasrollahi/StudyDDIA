// ============================================================
// RENDER ENGINE — موتور رندر صفحه
// همه داده‌ها از آرایه سراسری CHAPTERS خوانده می‌شود
// (تعریف در js/chapters.js + فایل‌های js/chapters/chapter-N.js)
// ============================================================

let activeCh = 1;
let currentView = 'book'; // 'book' or 'chapter'

const catLabels = { sd: 'System Design', cp: 'مفهومی', sc: 'سناریویی' };
const catClass  = { sd: 'badge-sd', cp: 'badge-cp', sc: 'badge-sc' };
const diffLabels = { easy: 'آسان', medium: 'متوسط', hard: 'سخت' };

function renderNav() {
  const inner = document.getElementById('navInner');
  const sel   = document.getElementById('chSelect');
  inner.innerHTML = '';
  sel.innerHTML = '';

  // Book link (always first)
  const bookLink = document.createElement('a');
  bookLink.className = 'nav-link' + (currentView === 'book' ? ' active' : '');
  bookLink.textContent = '📖 کتاب';
  bookLink.onclick = showBook;
  inner.appendChild(bookLink);

  CHAPTERS.forEach(ch => {
    // Desktop link
    const a = document.createElement('a');
    a.className = 'nav-link' + (ch.id === activeCh && currentView === 'chapter' ? ' active' : '') + (ch.questions.length === 0 ? ' coming' : '');
    a.textContent = `فصل ${ch.id}`;
    if (ch.questions.length === 0) a.textContent += ' 🔒';
    a.dataset.ch = ch.id;
    a.onclick = () => { if (ch.questions.length > 0) switchChapter(ch.id); };
    inner.appendChild(a);

    // Mobile option
    const opt = document.createElement('option');
    opt.value = ch.id;
    opt.textContent = `فصل ${ch.id} — ${ch.title}`;
    if (ch.questions.length === 0) opt.textContent += ' 🔒';
    if (ch.id === activeCh && currentView === 'chapter') opt.selected = true;
    sel.appendChild(opt);
  });
}

function renderChapterGrid() {
  const grid = document.getElementById('chGrid');
  grid.innerHTML = '';
  CHAPTERS.forEach(ch => {
    const a = document.createElement('a');
    a.className = (ch.id === activeCh ? ' active' : '') + (ch.questions.length === 0 ? ' coming' : '');
    a.innerHTML = `<span class="ch-num">${String(ch.id).padStart(2,'0')}</span> ${ch.title}${ch.questions.length === 0 ? ' 🔒' : ''}`;
    a.onclick = () => { if (ch.questions.length > 0) switchChapter(ch.id); };
    grid.appendChild(a);
  });
  document.getElementById('chCount').textContent = `${CHAPTERS.length} فصل`;
}

function showBook() {
  currentView = 'book';
  document.getElementById('heroBadge').style.display = 'none';
  document.getElementById('heroTitle').textContent = 'Designing Data-Intensive Applications';
  document.getElementById('heroSub').textContent = 'The Big Ideas Behind Reliable, Scalable, and Maintainable Systems';
  document.getElementById('heroQuote').style.display = 'block';
  document.getElementById('heroQuote').innerHTML =
    '«There are no solutions; there are only trade-offs.»<cite>— Thomas Sowell</cite>';

  renderBookView();
  renderNav();
  renderChapterGrid();
  document.querySelectorAll('.ch-grid a').forEach(a => a.classList.remove('active'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderBookView() {
  const root = document.getElementById('chapterRoot');
  const avail = CHAPTERS.filter(c => c.questions.length > 0);
  const locked = CHAPTERS.filter(c => c.questions.length === 0);

  root.innerHTML = `
    <section>
      <div class="book-view">
        <div class="book-cover"><img src="ddia-cover.png" alt="Designing Data-Intensive Applications cover"></div>
        <h1>Designing Data-Intensive Applications</h1>
        <div class="authors">Martin Kleppmann · Chris Riccomini</div>
        <div class="edition">Second Edition · O'Reilly Media · 2026</div>
        <p class="book-sub">
          یک صفحه مطالعه و آمادگی مصاحبه — نمونه سوالات تشریحی، سناریوهای سیستم دیزاین و آمادگی مصاحبه سطح Mid-Level
        </p>

        <div class="book-ch-grid">
          ${CHAPTERS.map(ch => `
            <a onclick="${ch.questions.length > 0 ? `switchChapter(${ch.id})` : ''}"
               class="${ch.questions.length === 0 ? 'coming' : ''}">
              <span class="ch-num">${String(ch.id).padStart(2,'0')}</span>
              <span class="ch-title">${ch.title}${ch.questions.length === 0 ? ' 🔒' : ''}</span>
            </a>`).join('')}
        </div>
      </div>
    </section>`;
}

function switchChapter(id) {
  currentView = 'chapter';
  activeCh = id;
  const ch = CHAPTERS.find(c => c.id === id);
  if (!ch) return;

  // Update hero
  document.getElementById('heroBadge').style.display = 'inline-flex';
  document.getElementById('heroChNum').textContent = ch.id;
  document.getElementById('heroTitle').textContent = ch.title;
  document.getElementById('heroSub').textContent =
    ch.questions.length > 0
      ? 'مرور مفاهیم، نمونه سوالات تشریحی و آمادگی مصاحبه — سطح mid-level developer'
      : 'این فصل هنوز آماده نشده — به زودی اضافه می‌شود';
  document.getElementById('heroQuote').style.display = ch.quote ? 'block' : 'none';
  if (ch.quote) {
    document.getElementById('heroQuote').innerHTML = `«${ch.quote}»<cite>— ${ch.quoteAuthor}</cite>`;
  }

  // Render content
  renderChapterContent(ch);

  // Update nav
  renderNav();
  renderChapterGrid();
  document.querySelectorAll('.ch-grid a').forEach(a => {
    const idx = Array.from(a.parentNode.children).indexOf(a);
    a.classList.toggle('active', CHAPTERS[idx] && CHAPTERS[idx].id === id);
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderChapterContent(ch) {
  const root = document.getElementById('chapterRoot');

  if (ch.questions.length === 0) {
    // Empty placeholder
    root.innerHTML = `
      <section>
        <div class="empty-ch">
          <div class="big-icon">📖</div>
          <h3>${ch.title}</h3>
          <p>محتوای این فصل هنوز اضافه نشده.</p>
          <p style="margin-top:0.5rem;">برای افزودن، یک فایل <code>js/chapters/chapter-N.js</code> بسازید و آن را در index.html اضافه کنید.</p>
        </div>
      </section>`;
    return;
  }

  // ── Topics section ──
  let topicsHTML = '';
  if (ch.topics.length > 0) {
    topicsHTML = `
      <section>
        <div class="section-header">
          <div class="icon" style="background:rgba(168,85,247,0.12);">📚</div>
          <h2>سرفصل‌های ${ch.badge}</h2>
        </div>
        <p style="color:rgba(255,255,255,0.45); font-size:0.84rem; margin-bottom:1rem;">
          مفاهیم کلیدی پوشش داده شده در این فصل
        </p>
        <div class="topics-grid">
          ${ch.topics.map(t => `<div class="topic-chip">${t}</div>`).join('')}
        </div>
      </section>`;
  }

  // ── Questions section (all closed) ──
  const qHTML = ch.questions.map(q => `
    <div class="q-item">
      <div class="q-header" onclick="toggleQ(this)">
        <div class="q-num">${q.id}</div>
        <div class="q-title">${q.q}</div>
        <div class="q-toggle"><svg viewBox="0 0 12 12"><path d="M3 5l3 3 3-3"/></svg></div>
      </div>
      <div class="q-body">
        <div class="q-answer">${q.a}</div>
      </div>
    </div>`).join('');

  // ── Interview section (answers hidden) ──
  const categories = [...new Set(ch.interview.map(i => i.category))];
  const tabs = [
    { key: 'all', label: '🔀 همه' },
    ...categories.map(c => ({ key: c, label: catLabels[c] }))
  ];

  const ivPanels = tabs.map(tab => {
    const items = tab.key === 'all' ? ch.interview : ch.interview.filter(i => i.category === tab.key);
    return `
      <div class="interview-panel ${tab.key === 'all' ? 'active' : ''}" data-tab="${tab.key}">
        ${items.map(i => `
          <div class="iv-card">
            <div class="iv-card-header" onclick="toggleIV(this)">
              <div class="q-icon">?</div>
              <div class="q-text">
                <span class="badge ${catClass[i.category]}">${catLabels[i.category]}</span>
                ${i.q}
              </div>
              <div class="iv-toggle"><svg viewBox="0 0 12 12"><path d="M3 5l3 3 3-3"/></svg></div>
            </div>
            <div class="iv-body">
              <div class="iv-answer">${i.a}</div>
            </div>
          </div>`).join('')}
      </div>`;
  }).join('');

  root.innerHTML = `
    ${topicsHTML}

    <section>
      <div class="section-header">
        <div class="icon" style="background:rgba(249,115,22,0.12);">📝</div>
        <h2>نمونه سوالات ${ch.badge}</h2>
        <span class="count">${ch.questions.length} سوال</span>
      </div>
      <div class="q-list">${qHTML}</div>
    </section>

    <section id="interview-${ch.id}">
      <div class="section-header">
        <div class="icon" style="background:rgba(34,197,94,0.12);">🎤</div>
        <h2>بخش مصاحبه — سطح Mid-Level</h2>
        <span class="count">${ch.interview.length} سؤال</span>
      </div>
      <div class="interview-tabs">
        ${tabs.map(t => `<button class="${t.key === 'all' ? 'active' : ''}" onclick="switchIVTab(this, '${t.key}')">${t.label}</button>`).join('')}
      </div>
      ${ivPanels}
    </section>`;
}

// ===== INTERACTIVE HELPERS =====

// Question accordion toggle
function toggleQ(header) {
  const item = header.parentElement;
  const isOpen = item.classList.contains('open');
  // Close all others in same list
  item.closest('.q-list').querySelectorAll('.q-item.open').forEach(el => {
    if (el !== item) el.classList.remove('open');
  });
  item.classList.toggle('open');
  if (!isOpen) {
    setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 350);
  }
}

// Interview card toggle (answers hidden by default)
function toggleIV(header) {
  const card = header.parentElement;
  card.classList.toggle('open');
}

// Interview tab switching
function switchIVTab(btn, tabName) {
  const container = btn.closest('section');
  container.querySelectorAll('.interview-tabs button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  container.querySelectorAll('.interview-panel').forEach(p => {
    p.classList.toggle('active', p.dataset.tab === tabName);
  });
}

// ===== INIT =====
renderNav();
renderChapterGrid();
showBook();
