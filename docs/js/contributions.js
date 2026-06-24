let contribCalendarData = null;
let contribResizeTimer = null;
let contribResizeObserver = null;

function initContribGraph(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="contrib-section">
      <div class="contrib-graph" id="contrib-graph">
        <div class="contrib-loading">loading</div>
      </div>
      <div class="contrib-header">⤶
        <span class="chip-value" id="contrib-total">3,650</span>
        <span class="contrib-header-sublabel">كوميت في آخر سنة</span>
        <img height="16px" width="16px" src="https://varlock-pixel-art.dmno.workers.dev/effects/fire.gif">
      </div>
    </div>
    <div class="contrib-tooltip" id="contrib-tooltip">
      <span class="contrib-tooltip-count" id="contrib-t-count">0</span>
      <span id="contrib-t-text"> contributions</span><br>
      <span class="contrib-tooltip-date" id="contrib-t-date"></span>
    </div>
  `;

  fetch('/api/contributions')
    .then(r => r.json())
    .then(data => {
      contribCalendarData = data;
      const graph = document.getElementById('contrib-graph');

      const schedule = () => {
        if (contribResizeTimer) clearTimeout(contribResizeTimer);
        contribResizeTimer = setTimeout(() => {
          const w = graph.getBoundingClientRect().width;
          if (w >= 10) buildContribGraph(contribCalendarData, w);
        }, 120);
      };

      if (contribResizeObserver) contribResizeObserver.disconnect();
      contribResizeObserver = new ResizeObserver(schedule);
      contribResizeObserver.observe(graph);
      schedule();
    })
    .catch(() => {
      const graph = document.getElementById('contrib-graph');
      if (graph) graph.innerHTML =
        '<div class="contrib-loading" style="color:#ff6b6b">فشل احضار جدول المساهمات</div>';
    });
}

function buildContribGraph(calendar, graphWidth) {
  const graph = document.getElementById('contrib-graph');
  if (!calendar || !calendar.weeks) return;
  const { totalContributions, weeks } = calendar;

  const totalEl = document.getElementById('contrib-total');
  if (totalEl) totalEl.textContent = totalContributions.toLocaleString();

  const isMobile = window.matchMedia('(max-width: 500px)').matches;

  const GAP = 2;
  const DAY_COL_W = isMobile ? 14 : 22;
  const PADDING = isMobile ? 12 : 32;
  const MONTH_ROW_H = 16;
  const innerW = Math.max(40, graphWidth - PADDING * 2 - DAY_COL_W - GAP);

  const minCell = isMobile ? 7 : 11;
  const maxWeeks = Math.floor((innerW + GAP) / (minCell + GAP));
  const visibleWeeks = weeks.slice(-maxWeeks);

  const nWeeks = Math.max(1, visibleWeeks.length);
  const rawCell = (innerW - GAP * (nWeeks - 1)) / nWeeks;
  const cellSize = Math.max(2, Math.min(14, Math.floor(rawCell)));
  const step = cellSize + GAP;

  const svgW = DAY_COL_W + GAP + nWeeks * step - GAP;
  const svgH = MONTH_ROW_H + 7 * step - GAP;

  const style = getComputedStyle(document.documentElement);
  const COLORS = [
    style.getPropertyValue('--contrib-0').trim() || 'rgba(255,255,255,0.09)',
    style.getPropertyValue('--contrib-1').trim() || '#2e1065',
    style.getPropertyValue('--contrib-2').trim() || '#4c1d95',
    style.getPropertyValue('--contrib-3').trim() || '#7c3aed',
    style.getPropertyValue('--contrib-4').trim() || '#a78bfa',
  ];

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', svgW);
  svg.setAttribute('height', svgH);
  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  svg.style.cssText = 'display:block; overflow:visible;';

  const DAY_NAMES = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  let lastMonth = null;

  visibleWeeks.forEach((week, wi) => {
    const firstDay = week.contributionDays.find(d =>
      new Date(d.date + 'T00:00:00').getDate() === 1
    );
    if (!firstDay) return;
    const month = new Date(firstDay.date + 'T00:00:00')
      .toLocaleDateString('en-US', { month: 'short' });
    if (month === lastMonth) return;
    lastMonth = month;

    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', DAY_COL_W + GAP + wi * step);
    t.setAttribute('y', MONTH_ROW_H - 3);
    t.setAttribute('font-size', '8');
    t.setAttribute('font-family', 'JetBrains Mono, monospace');
    t.setAttribute('fill', style.getPropertyValue('--dim').trim() || '#555');
    t.textContent = month;
    svg.appendChild(t);
  });

  DAY_NAMES.forEach((name, di) => {
    if (!name) return;
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', DAY_COL_W - 3);
    t.setAttribute('y', MONTH_ROW_H + di * step + cellSize * 0.75);
    t.setAttribute('font-size', Math.max(5, Math.min(10, cellSize * 0.65)));
    t.setAttribute('font-family', 'JetBrains Mono, monospace');
    t.setAttribute('fill', style.getPropertyValue('--dim').trim() || '#555');
    t.setAttribute('text-anchor', 'end');
    t.textContent = name;
    svg.appendChild(t);
  });

  const cellData = [];

  visibleWeeks.forEach((week, wi) => {
    for (let di = 0; di < 7; di++) {
      const day = week.contributionDays.find(
        d => new Date(d.date + 'T00:00:00').getDay() === di
      );

      const x = DAY_COL_W + GAP + wi * step;
      const y = MONTH_ROW_H + di * step;
      const r = Math.max(1, Math.floor(cellSize / 5));

      const rect = document.createElementNS(NS, 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', cellSize);
      rect.setAttribute('height', cellSize);
      rect.setAttribute('rx', r);
      rect.setAttribute('ry', r);

      if (day) {
        const level = getContribLevel(day.contributionCount);
        rect.setAttribute('fill', COLORS[level]);
        rect.setAttribute('data-count', day.contributionCount);
        rect.setAttribute('data-date', day.date);
        rect.style.cursor = 'pointer';
        cellData.push({ el: rect, count: day.contributionCount, date: day.date, x, y });
      } else {
        rect.setAttribute('fill', 'transparent');
      }

      svg.appendChild(rect);
    }
  });

  // Footer
  const footer = document.createElement('div');
  footer.className = 'contrib-footer';
  footer.innerHTML = `
    <div class="contrib-legend">
      أقل
      <div class="contrib-legend-cells">
        ${COLORS.map(c => `<div class="contrib-legend-cell" style="background:${c}"></div>`).join('')}
      </div>
      أكثر
    </div>
  <!--  <a class="contrib-gh-link" href="https://github.com/0xdya" target="_blank">github.com/0xdya</a>  -->
    `;

  graph.innerHTML = '';
  graph.style.padding = `${PADDING}px ${PADDING}px ${Math.round(PADDING * 0.75)}px`;
  graph.appendChild(svg);
  graph.appendChild(footer);

  setupContribTooltip(svg, cellData, isMobile);
}

function getContribLevel(count) {
  if (count === 0) return 0;
  if (count <= 12) return 1;
  if (count <= 35) return 2;
  if (count <= 50) return 3;
  return 4;
}

function setupContribTooltip(svg, cellData, isMobile) {
  const tooltip = document.getElementById('contrib-tooltip');
  const tCount = document.getElementById('contrib-t-count');
  const tText = document.getElementById('contrib-t-text');
  const tDate = document.getElementById('contrib-t-date');

  const showTooltip = (count, date, x, y) => {
    tCount.textContent = count;
    tText.textContent = count === 1 ? ' contribution' : ' contributions';
    tDate.textContent = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
    tooltip.style.display = 'block';
    tooltip.style.left = Math.min(x + 12, window.innerWidth - 175) + 'px';
    tooltip.style.top = (y - 52) + 'px';
  };

  if (isMobile) {
    svg.addEventListener('click', e => {
      const rect = e.target.closest('rect[data-date]');
      if (!rect) return;
      showTooltip(
        parseInt(rect.getAttribute('data-count')),
        rect.getAttribute('data-date'),
        e.clientX, e.clientY
      );
      setTimeout(() => { tooltip.style.display = 'none'; }, 2200);
    });
  } else {
    svg.addEventListener('mousemove', e => {
      const rect = e.target.closest('rect[data-date]');
      if (!rect) { tooltip.style.display = 'none'; return; }
      showTooltip(
        parseInt(rect.getAttribute('data-count')),
        rect.getAttribute('data-date'),
        e.clientX, e.clientY
      );
      tooltip.style.left = Math.min(e.clientX + 12, window.innerWidth - 175) + 'px';
      tooltip.style.top = (e.clientY - 52) + 'px';
    });
    svg.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  }
}

initContribGraph('my-contributions');