// Utility: Smooth scroll
function smoothScrollTo(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-scroll-to]');
  if (t) {
    e.preventDefault();
    smoothScrollTo(t.getAttribute('data-scroll-to'));
  }
});

// Toast
const toastEl = document.getElementById('toast');
function toast(msg, timeout = 1800) {
  if (!toastEl) return alert(msg);
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => toastEl.classList.remove('show'), timeout);
}

// Countdown to party date (local time)
(function initCountdown() {
  const target = new Date('2025-10-04T16:00:00+09:00'); // Seoul time
  const dEl = document.getElementById('d');
  const hEl = document.getElementById('h');
  const mEl = document.getElementById('m');
  const sEl = document.getElementById('s');
  if (!dEl || !hEl || !mEl || !sEl) return;

  function update() {
    const now = new Date();
    let diff = Math.max(0, target.getTime() - now.getTime());
    const d = Math.floor(diff / (1000 * 60 * 60 * 24)); diff -= d * 86400000;
    const h = Math.floor(diff / (1000 * 60 * 60)); diff -= h * 3600000;
    const m = Math.floor(diff / (1000 * 60)); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    dEl.textContent = String(d).padStart(2, '0');
    hEl.textContent = String(h).padStart(2, '0');
    mEl.textContent = String(m).padStart(2, '0');
    sEl.textContent = String(s).padStart(2, '0');
  }
  update();
  setInterval(update, 1000);
})();

// Copy address
(function initCopyAddress() {
  const btn = document.getElementById('copy-address');
  const textEl = document.getElementById('address-text');
  if (!btn || !textEl) return;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(textEl.textContent.trim());
      toast('주소가 복사되었습니다!');
    } catch (e) {
      toast('복사에 실패했어요. 다시 시도해주세요.');
    }
  });
})();

// Add to calendar (ICS download)
(function initAddToCalendar() {
  const btn = document.getElementById('add-to-calendar');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const title = '우리 집들이 파티';
    const start = '20251004T070000Z'; // 16:00 KST = 07:00 UTC
    const end = '20251004T120000Z';   // 21:00 KST = 12:00 UTC
    const address = document.getElementById('address-text')?.textContent?.trim() || '';
    const desc = '즐거운 시간 함께해요!';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Housewarming//Invite//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      'DTSTART:' + start,
      'DTEND:' + end,
      'SUMMARY:' + title,
      'DESCRIPTION:' + desc,
      'LOCATION:' + address,
      'END:VEVENT',
      'END:VCALENDAR' 
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'housewarming.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('캘린더 파일을 다운로드했어요.');
  });
})();

// Simple carousel with swipe and dots
(function initCarousel() {
  const root = document.getElementById('carousel');
  if (!root) return;
  const slides = root.querySelector('.slides');
  const imgs = Array.from(slides.querySelectorAll('img'));
  const dots = root.querySelector('#dots');
  let index = 0; let x0 = null; let lock = false;

  function setIndex(i) {
    index = (i + imgs.length) % imgs.length;
    slides.style.transform = `translateX(${-index * 100}%)`;
    slides.style.transition = 'transform .35s ease';
    updateDots();
  }
  function updateDots() {
    dots.innerHTML = '';
    imgs.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `슬라이드 ${i + 1}`);
      if (i === index) b.setAttribute('aria-selected', 'true');
      b.addEventListener('click', () => setIndex(i));
      dots.appendChild(b);
    });
  }
  updateDots();
  setIndex(0);

  // Drag/Swipe
  function unify(e) { return e.changedTouches ? e.changedTouches[0] : e; }
  slides.addEventListener('touchstart', e => (x0 = unify(e).clientX), { passive: true });
  slides.addEventListener('mousedown', e => { x0 = unify(e).clientX; lock = true; });
  window.addEventListener('mouseup', () => lock = false);
  slides.addEventListener('touchend', e => move(unify(e).clientX));
  slides.addEventListener('mousemove', e => { if (lock && x0 != null) {/* visual drag optional */} });

  function move(x1) {
    if (x0 == null) return; const dx = x1 - x0; x0 = null; lock = false;
    const threshold = 40; // px
    if (dx > threshold) setIndex(index - 1);
    else if (dx < -threshold) setIndex(index + 1);
  }

  // Auto-advance
  setInterval(() => setIndex(index + 1), 5000);
})();

// RSVP form
(function initRSVP() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;
  const nameEl = form.querySelector('#name');
  const countEl = form.querySelector('#count');
  const noteEl = form.querySelector('#note');
  const attendEl = form.querySelector('#attend');

  function setError(name, msg) {
    const err = form.querySelector(`.error[data-for="${name}"]`);
    if (err) err.textContent = msg || '';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if (!nameEl.value.trim()) { setError('name', '이름을 입력해주세요'); valid = false; } else setError('name');
    const cnt = Number(countEl.value);
    if (!cnt || cnt < 1 || cnt > 10) { setError('count', '인원 수는 1~10 사이로 입력해주세요'); valid = false; } else setError('count');

    if (!valid) return;

    const payload = {
      name: nameEl.value.trim(),
      count: cnt,
      note: noteEl.value.trim(),
      attend: !!attendEl.checked,
      ts: new Date().toISOString(),
    };

    // For now, just show a toast and log to console. In real use, send to backend or Google Sheet.
    console.log('RSVP', payload);
    toast('RSVP가 제출되었습니다. 고마워요!');
    form.reset();
    countEl.value = 1; // default back
    attendEl.checked = true;
  });
})();
