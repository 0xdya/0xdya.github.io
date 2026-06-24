
(function () {
  const GITHUB_PATH = 'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z';

  const ICONS = {
    external: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    github: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="${GITHUB_PATH}"/></svg>`,
    comments: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    download: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    npm: '<svg width="12" height="12" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><polygon fill="#C12127" points="0 256 0 0 256 0 256 256"/><polygon fill="#FFFFFF" points="48 48 208 48 208 208 176 208 176 80 128 80 128 208 48 208"/></svg>',
    jsdelivr: '<img src="https://www.jsdelivr.com/icon_256x256.png" width="12" height="12">'
  };

  const PROJECTS = [
    {
      cat: 'tools',
      name: 'TimeAr<span class="badge"> "tool"</span>',
      active: true,
      desc: 'اول مكتبة عربية لعرض كم مضى من الزمن عبر ادخال التاريخ والوقت، مثلا تضع <span dir="ltr">2026-04-16</span> فيعرض <span class="time-ar">2026-04-16T12:00</span>',
      descDir: 'rtl',
      buttons: [
        { icon: 'external', href: 'https://d1wiki.vercel.app/time-ar/', label: 'wiki', primary: true },
        { icon: 'npm', href: 'https://www.npmjs.com/package/time-ar', label: 'npm', primary: true },
        { icon: 'jsdelivr', href: 'https://www.jsdelivr.com/package/npm/time-ar', label: 'jsDelivr', primary: true },
        { icon: 'github', href: 'https://github.com/0xdya/timeAr', label: 'source' },
        { icon: 'comments', href: 'https://d1wiki.vercel.app/time-ar/community', label: 'community' }
      ]
    },
    {
      cat: 'tools',
      name: 'HNT.sh <span class="badge"> "tool"</span>',
      active: true,
      desc: 'اداة مفيدة لمستخدمين هايبرلاند يتيح لهم اضافة الاضاءة اليلية والتحكم فيها<br>+ HNT هو اختصار ل: <br> Hyprland Nightlight Toggle',
      descDir: 'rtl',
      buttons: [
        { icon: 'external', href: 'https://d1wiki.vercel.app/HNT/', label: 'wiki', primary: true },
        { icon: 'github', href: 'https://github.com/0xdya/HNT', label: 'source' },
        { icon: 'comments', href: 'project.html?slug=HNT', label: 'comments' }
      ]
    },
    {
      cat: 'tools',
      name: 'fastpush <span class="badge"> "tool"</span>',
      active: true,
      desc: 'اداة تختصر عليك رفع مشروعك من vscode او cursor او حتى zed الى قيتهاب بسطر واحد',
      descDir: 'rtl',
      buttons: [
        { icon: 'external', href: 'https://d1wiki.vercel.app/fastpush/', label: 'wiki', primary: true },
        { icon: 'github', href: 'https://github.com/0xdya/fastpush/', label: 'source' },
        { icon: 'comments', href: 'project.html?slug=fastpush', label: 'comments' }
      ]
    },
    {
      cat: 'tools',
      name: 'last3night <span class="badge"> "app"</span>',
      active: true,
      desc: 'تطبيق حساب الثلث الأخير',
      descDir: 'rtl',
      buttons: [
        { icon: 'download', href: 'https://github.com/0xdya/last3night/releases/tag/apk', label: 'APK', primary: true },
        { icon: 'github', href: 'https://github.com/0xdya/last3night/', label: 'source' },
        { icon: 'comments', href: 'project.html?slug=last3night', label: 'comments' }
      ]
    },
    {
      cat: 'web',
      name: 'D1 Shop <span class="badge"> "web"</span>',
      active: true,
      desc: ' personal store for selling social media showcase pages & website management services.',
      buttons: [
        { icon: 'external', href: 'https://d1shop.web.app', label: 'open', primary: true },
        { icon: 'comments', href: 'project.html?slug=d1shop', label: 'comments' }
      ]
    },
    {
      cat: 'web',
      name: 'Dya Quran <span class="badge"> "web"</span>',
      active: true,
      desc: '14 famous reciters, all surahs, no-ads. download individual surahs or all 114 in one zip.',
      buttons: [
        { icon: 'external', href: 'https://dya-quran.web.app', label: 'open', primary: true },
        { icon: 'comments', href: 'project.html?slug=dya-quran', label: 'comments' }
      ]
    },
    {
      cat: 'web',
      name: 'kitsuba <span class="badge"> "web"</span>',
      active: false,
      desc: 'this is my old portfolio — the one I’m not exactly proud of.<br>I’m only showing it here as proof that, yes, I’ve evolved ._. 👍️',
      buttons: [
        { icon: 'external', href: 'https://d76.vercel.app/', label: 'open', primary: true },
        { icon: 'github', href: 'https://github.com/0xdya/kitsuba/', label: 'source' },
        { icon: 'comments', href: 'project.html?slug=kitsuba', label: 'comments' }
      ]
    },
    {
      cat: 'web',
      name: 'd1 wiki <span class="badge"> "web"</span>',
      active: true,
      desc: 'my own place where i share wikis for my tools.',
      buttons: [
        { icon: 'external', href: 'https://0xdya.github.io/d1wiki/', label: 'open', primary: true },
        { icon: 'github', href: 'https://github.com/0xdya/d1wiki/', label: 'source' },
        { icon: 'comments', href: 'project.html?slug=d1wiki', label: 'comments' }
      ]
    },
    {
      cat: 'web',
      name: 'D1 BAC <span class="badge"> "web"</span>',
      active: true,
      desc: 'open-source — lessons, summaries and everything BAC for all subjects and streams.',
      buttons: [
        { icon: 'external', href: 'https://d1bac.vercel.app', label: 'open', primary: true },
        { icon: 'github', href: 'https://github.com/0xdya/d1bac', label: 'source' },
        { icon: 'comments', href: 'project.html?slug=d1bac', label: 'comments' }
      ]
    },
    {
      cat: 'web',
      name: 'Level Up <span class="badge"> "web"</span>',
      active: true,
      desc: 'site for a game store owner to showcase games he sells (PC, PS2, PS3, PS4, PSP…)',
      buttons: [
        { icon: 'external', href: 'https://lvup.vercel.app', label: 'open', primary: true },
        { icon: 'github', href: 'https://github.com/0xdya/lu', label: 'source' },
        { icon: 'comments', href: 'project.html?slug=lu', label: 'comments' }
      ]
    },
    {
      cat: 'web',
      name: 'D1 Master "alpha version"<span class="badge"> "web"</span>',
      active: false,
      desc: 'open-source project aimed at front-end and UI developers in general. <br>(still in beta test)',
      buttons: [
        { icon: 'external', href: 'https://d1master.web.app/', label: 'open', primary: true },
        { icon: 'github', href: 'https://github.com/0xdya/d1master_beta', label: 'source (private repo)' },
        { icon: 'comments', href: 'project.html?slug=d1master_beta', label: 'comments' }
      ]
    },
    {
      cat: 'web',
      name: 'D1 Security <span class="badge"> "web"</span>',
      active: true,
      desc: 'scan your device for web vulnerabilities and learn how to protect yourself.',
      buttons: [
        { icon: 'external', href: 'https://0xdya.github.io/d1scan_beta', label: 'open', primary: true },
        { icon: 'github', href: 'https://github.com/0xdya/d1scan_beta', label: 'source' },
        { icon: 'comments', href: 'project.html?slug=d1scan_beta', label: 'comments' }
      ]
    },
    {
      cat: 'web',
      name: 'Abi Hamid Al-Ghazali HS <span class="badge"> "web"</span>',
      active: false,
      desc: 'old website i built for the high school i studied at.',
      buttons: [
        { icon: 'external', href: 'https://el-ghazali.web.app', label: 'open', primary: true },
        { icon: 'comments', href: 'project.html?slug=abihamed', label: 'comments' }
      ]
    }
  ];

  const BOOKS = [
    { href: 'https://noor-book.com/vzl9bwy', img: '../img/المنهاج.png', alt: 'المنهاج', fallback: '📗', label: 'المنهاج المبين في مسالك المتقين' },
    { href: 'https://noor-book.com/idfxt3r', img: '../img/الرسالة.png', alt: 'الرسالة', fallback: '📘', label: 'الرسالة المجبرة' }
  ];

  const PAINT_COUNT = 18;

  function renderBtn(btn) {
    const cls = btn.primary ? 'btn primary' : 'btn';
    return `<a class="${cls}" href="${btn.href}" target="_blank">${ICONS[btn.icon]}${btn.label}</a>`;
  }

  function renderCard(project) {
    const dot = project.active ? 'on' : 'off';
    const descDir = project.descDir ? ` dir="${project.descDir}"` : '';
    return `<div class="card" data-cat="${project.cat}">
      <div class="card-top">
        <div class="card-name">
          <div class="dot ${dot}"></div>${project.name}
        </div>
      </div>
      <p class="card-desc"${descDir}>${project.desc}</p>
      <div class="btns">${project.buttons.map(renderBtn).join('')}</div>
    </div>`;
  }

  function renderBook(book) {
    return `<a href="${book.href}" class="book">
      <div class="book-cover">
        <img src="${book.img}" alt="${book.alt}" onerror="this.parentElement.innerHTML='${book.fallback}'">
      </div>
      <span class="book-label">${book.label}</span>
    </a>`;
  }

  function renderPaint(n) {
    return `<div class="paint-item"><img src="./draw/${n}.webp" loading="lazy" alt=""><div class="caption">#${n}</div></div>`;
  }

  document.getElementById('cards').innerHTML = PROJECTS.map(renderCard).join('');
  document.getElementById('books-row').innerHTML = BOOKS.map(renderBook).join('');
  document.getElementById('paint-grid').innerHTML = Array.from({ length: PAINT_COUNT }, (_, i) => renderPaint(i + 1)).join('');

  const body = document.getElementById('body');
  const tabs = document.querySelectorAll('.tab');
  const cards = document.querySelectorAll('#cards .card');
  const secBooks = document.getElementById('sec-books');
  const secPaint = document.getElementById('sec-paint');
  const empty = document.getElementById('empty');
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const closeModal = document.getElementById('closeModal');
  const assistantPopup = document.querySelector('.assistant-popup');
  const skinBtnClose = document.querySelector('.skin_btn_close');

  const validFilters = ['all', 'web', 'tools', 'books', 'paint'];


const skinBtn = document.querySelector('.skin_btn');
let openCount = parseInt(localStorage.getItem('popup_open_count')) || 0;
let isHidden = localStorage.getItem('popup_hidden') === 'true';

setTimeout(() => {
  let openCount = parseInt(localStorage.getItem('popup_open_count')) || 0;
  let isHidden = localStorage.getItem('popup_hidden') === 'true';

  if (isHidden) {
    openCount++; 
    
    if (openCount >= 5) {
      localStorage.setItem('popup_hidden', 'false');
      localStorage.setItem('popup_open_count', '0');
      body.classList.add('popup-open');
    } else {
      localStorage.setItem('popup_open_count', openCount);
      if (assistantPopup) assistantPopup.remove();
    }
  } else {
    body.classList.add('popup-open');
  }
}, 10000);

function hidePopupAndStartCount() {
  body.classList.remove('popup-open');
  assistantPopup.remove();
  localStorage.setItem('popup_hidden', 'true');
  localStorage.setItem('popup_open_count', '0'); 
}

skinBtnClose.addEventListener('click', hidePopupAndStartCount);

if (skinBtn) {
  skinBtn.addEventListener('click', hidePopupAndStartCount);
}

// window.addEventListener('click', function (e) {
//   if (!e.target.closest('.assistant-popup') && !e.target.closest('img')) {
//      if (body.classList.contains('popup-open')) {
//       hidePopupAndStartCount();
//     }
//   }
// });

  function animateIn(elements, delay = 0) {
    elements.forEach((el, i) => {
      el.style.transition = 'opacity .35s ease, transform .35s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';

      requestAnimationFrame(() => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay + i * 55);
      });
    });
  }

  function applyFilter(f) {
    if (!validFilters.includes(f)) f = 'tools';

    const visibleCards = [];

    cards.forEach(c => {
      c.classList.add('hidden');
      c.style.opacity = '0';
      c.style.transform = 'translateY(16px)';
    });
    secBooks.classList.add('hidden');
    secPaint.classList.add('hidden');

    setTimeout(() => {
      cards.forEach(c => {
        if (f === 'all' || c.dataset.cat === f) {
          c.classList.remove('hidden');
          visibleCards.push(c);
        }
      });

      const showBooks = f === 'all' || f === 'books';
      const showPaint = f === 'all' || f === 'paint';

      if (showBooks) secBooks.classList.remove('hidden');
      if (showPaint) secPaint.classList.remove('hidden');

      const visible = visibleCards.length + (showBooks ? 1 : 0) + (showPaint ? 1 : 0);
      empty.classList.toggle('show', visible === 0);

      animateIn(visibleCards, 0);

      if (showBooks) animateIn([secBooks], visibleCards.length * 55 + 20);
      if (showPaint) animateIn([secPaint], (visibleCards.length + (showBooks ? 1 : 0)) * 55 + 20);
    }, 30);

    tabs.forEach(t => t.classList.toggle('active', t.dataset.f === f));
    history.replaceState(null, '', f === 'all' ? location.pathname : '#' + f);
  }

  tabs.forEach(t => t.addEventListener('click', () => applyFilter(t.dataset.f)));

  const hash = location.hash.slice(1);
  applyFilter(hash || 'tools');
})();