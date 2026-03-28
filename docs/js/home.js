const loader = document.getElementById('loader-wrapper');
const showLoaderTimeout = setTimeout(() => { loader.style.display = 'flex'; }, 100);
window.addEventListener('load', () => { loader.classList.add('loader-hidden'); setTimeout(() => loader.style.display = 'none', 300); AOS.init({duration: 600, once: true, easing: 'ease-out-quart'}); clearTimeout(showLoaderTimeout); });
(function () { const SKIN_PATH = "./skin/s2.png"; const canvas = document.getElementById('mc-head'); const SIZE = 82; canvas.width = SIZE; canvas.height = SIZE; const renderer = new THREE.WebGLRenderer({canvas, antialias: false, alpha: true}); renderer.setPixelRatio(window.devicePixelRatio); renderer.setClearColor(0x000000, 0); renderer.setSize(SIZE, SIZE); const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100); camera.position.set(0, 0, 4.2); scene.add(new THREE.AmbientLight(0xffffff, 0.85)); const dir = new THREE.DirectionalLight(0xffffff, 0.5); dir.position.set(3, 5, 3); scene.add(dir); function buildFace(img, sx, sy, sw, sh) { const c = document.createElement('canvas'); c.width = sw; c.height = sh; const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh); const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; return new THREE.MeshLambertMaterial({map: t, transparent: true}); } function buildHead(img, scale, ox) { const mats = [buildFace(img, ox + 16, 8, 8, 8), buildFace(img, ox + 0, 8, 8, 8), buildFace(img, ox + 8, 0, 8, 8), buildFace(img, ox + 16, 0, 8, 8), buildFace(img, ox + 8, 8, 8, 8), buildFace(img, ox + 24, 8, 8, 8), ]; return new THREE.Mesh(new THREE.BoxGeometry(scale, scale, scale), mats); } const img = new Image(); img.crossOrigin = "anonymous"; img.onload = function () { const group = new THREE.Group(); group.add(buildHead(img, 1, 0)); if (img.height === 64) group.add(buildHead(img, 1.12, 32)); group.rotation.x = 0.18; scene.add(group); (function animate(time) { requestAnimationFrame(animate); group.rotation.y = time * 0.00085; renderer.render(scene, camera); })(); }; img.src = SKIN_PATH; })();
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [{ label: 'year', seconds: 31536000 }, { label: 'month', seconds: 2592000 }, { label: 'day', seconds: 86400 }, { label: 'hour', seconds: 3600 }, { label: 'minute', seconds: 60 }, { label: 'second', seconds: 1 } ];
    for(const i of intervals) {
        const count = Math.floor(seconds / i.seconds);
        if(count > 0) return count + ' ' + i.label +(count > 1 ? 's' : '');

    }
    return 'just now';
}
async function loadLatestCommit() {
    try {
        const res = await fetch('/api/github_commits');
        if(!res.ok) throw new Error('فشل جلب الكوميتات');

        const commits = await res.json();
        const latest = commits.find(c => { const msg = c.commit.message.split("\n")[0].toLowerCase(); return !msg.startsWith("auto"); });

        if(!latest) throw new Error("No valid commits");

        const message = latest.commit.message;
        const date = new Date(latest.commit.author.date);

        document.getElementById("commit-msg").textContent = message;
        document.getElementById("commit-auth").textContent = latest.author ? latest.author.login: latest.commit.author.name;

        document.getElementById("commit-time").textContent = date.toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });

        const timeAgoElem = document.querySelector(".time_ago");
        if(timeAgoElem) timeAgoElem.textContent = timeAgo(date);

    }
    catch(err) {
        console.error(err);
        document.getElementById("commit-msg").textContent = "Failed to load commit";
    }
}

loadLatestCommit();

function initContribGraph(containerId) {
    const container = document.getElementById(containerId);
    if(!container) return;

    container.innerHTML = ` <div class="contrib-section"> <div class="contrib-header"> <span class="contrib-header-label">contributions</span> <span class="contrib-header-count" id="contrib-total">—</span> <span class="contrib-header-sublabel">in the last year</span> </div> <div class="contrib-graph" id="contrib-graph"> <div class="contrib-loading">loading</div> </div> </div> <div class="contrib-tooltip" id="contrib-tooltip"> <span class="contrib-tooltip-count" id="contrib-t-count">0</span> <span id="contrib-t-text"> contributions</span><br> <span class="contrib-tooltip-date" id="contrib-t-date"></span> </div> `;

    fetch('/api/contributions') .then(r => r.json()) .then(data => buildContribGraph(data)) .catch(() => { document.getElementById('contrib-graph').innerHTML = '<div class="contrib-loading" style="color:#ff6b6b">failed to load contributions</div>'; });
}

function buildContribGraph(calendar) {
    const graph = document.getElementById('contrib-graph');
    const {
        totalContributions, weeks
    }
    = calendar;

    document.getElementById('contrib-total').textContent = totalContributions.toLocaleString();

    const DAY_NAMES = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
    const MOBILE_WEEKS = 16;
    const isMobile = window.matchMedia('(max-width: 600px)').matches;

    const monthLabels = document.createElement('div');
    monthLabels.className = 'contrib-month-labels';

    let lastMonth = null;
    weeks.forEach(week => { const first = week.contributionDays[0]; if (!first) return; const month = new Date(first.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' }); const span = document.createElement('span'); span.className = 'contrib-month-label'; span.textContent = month !== lastMonth ? month : ''; lastMonth = month; monthLabels.appendChild(span); });

    const inner = document.createElement('div');
    inner.className = 'contrib-inner';

    const daysCol = document.createElement('div');
    daysCol.className = 'contrib-days-col';
    DAY_NAMES.forEach(name => { const d = document.createElement('div'); d.className = 'contrib-day-label'; d.textContent = name; daysCol.appendChild(d); });

    const colsWrap = document.createElement('div');
    colsWrap.className = 'contrib-cols';

    weeks.forEach((week, wi) => { const col = document.createElement('div'); const isOldWeek = wi < weeks.length - MOBILE_WEEKS; col.className = 'contrib-week' +(isOldWeek ? ' mobile-hidden' : ''); for(let di = 0; di < 7; di++) { const cell = document.createElement('div'); cell.className = 'contrib-cell'; const day = week.contributionDays.find(d => new Date(d.date + 'T00:00:00').getDay() === di); if(day) { cell.setAttribute('data-level', getContribLevel(day.contributionCount)); cell.setAttribute('data-count', day.contributionCount); cell.setAttribute('data-date', day.date); } else { cell.style.visibility = 'hidden'; } cell.style.animationDelay = `${(wi * 7 + di) * 3}ms`; col.appendChild(cell); } colsWrap.appendChild(col); });

    const footer = document.createElement('div');
    footer.className = 'contrib-footer';
    footer.innerHTML = ` <div class="contrib-legend"> Less <div class="contrib-legend-cells"> <div class="contrib-legend-cell" style="background:var(--border)"></div> <div class="contrib-legend-cell" style="background:#1f3010"></div> <div class="contrib-legend-cell" style="background:#2d4d14"></div> <div class="contrib-legend-cell" style="background:#4a7a1e"></div> <div class="contrib-legend-cell" style="background:var(--accent)"></div> </div> More </div> <a class="contrib-gh-link" href="https://github.com/0xdya" target="_blank">github.com/0xdya</a> `;

    graph.innerHTML = '';
    inner.appendChild(daysCol);
    inner.appendChild(colsWrap);
    graph.appendChild(monthLabels);
    graph.appendChild(inner);
    graph.appendChild(footer);

    setupContribTooltip(isMobile);
}

function getContribLevel(count) {
    if(count === 0) return 0;
    if(count <= 3) return 1;
    if(count <= 6) return 2;
    if(count <= 9) return 3;
    return 4;
}

function setupContribTooltip(isMobile) {
    const tooltip = document.getElementById('contrib-tooltip');
    const tCount = document.getElementById('contrib-t-count');
    const tText = document.getElementById('contrib-t-text');
    const tDate = document.getElementById('contrib-t-date');

    document.querySelectorAll('.contrib-cell[data-date]').forEach(cell => { const showTooltip = (count, date, x, y) => { tCount.textContent = count; tText.textContent = count === 1 ? ' contribution' : ' contributions'; tDate.textContent = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }); tooltip.style.display = 'block'; tooltip.style.left = Math.min(x + 12, window.innerWidth - 170) + 'px'; tooltip.style.top = (y - 48) + 'px'; }; if (isMobile) { cell.addEventListener('click', e => { showTooltip(parseInt(cell.getAttribute('data-count')), cell.getAttribute('data-date'), e.clientX, e.clientY ); setTimeout(() => { tooltip.style.display = 'none'; }, 2000); }); } else { cell.addEventListener('mouseenter', e => { showTooltip(parseInt(cell.getAttribute('data-count')), cell.getAttribute('data-date'), e.clientX, e.clientY ); }); cell.addEventListener('mousemove', e => { tooltip.style.left = Math.min(e.clientX + 12, window.innerWidth - 170) + 'px'; tooltip.style.top = (e.clientY - 48) + 'px'; }); cell.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; }); } });
}
initContribGraph('my-contributions')