let contribCalendarData = null;
let contribResizeTimer = null;

function initContribGraph(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
  
    container.innerHTML = `
      <div class="contrib-section">
      
      <div class="contrib-graph" id="contrib-graph">
      <div class="contrib-loading">loading</div>
      </div>
      <div class="contrib-header">╰┈➤
      <span class="chip-value" id="contrib-total">3,372</span>
        <span class="contrib-header-sublabel">commits in last year</span><img height="16px" width="16px" src="https://varlock-pixel-art.dmno.workers.dev/effects/fire.gif">   
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
        const ro = new ResizeObserver(() => schedule());
        ro.observe(graph);
        schedule();
      })
      .catch(() => {
        contribCalendarData = null;
        const graph = document.getElementById('contrib-graph');
        if (graph) graph.innerHTML =
          '<div class="contrib-loading" style="color:#ff6b6b">failed to load contributions</div>';
      });
  }
  
  function buildContribGraph(calendar, graphWidth) {
    const graph = document.getElementById('contrib-graph');
    if (!calendar || !calendar.weeks) return;
    const { totalContributions, weeks } = calendar;
  
    const totalEl = document.getElementById('contrib-total');
    if (totalEl) totalEl.textContent = totalContributions.toLocaleString();
  
    const DAY_NAMES = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
    const isMobile = typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 500px)').matches
      : window.innerWidth <= 500;
  
    const visibleWeeks = weeks;
    const nWeeks = Math.max(1, visibleWeeks.length);
  
    const PADDING = isMobile ? 12 : 32;
    const DAY_COL_W = isMobile ? 14 : 22;
    const GAP = 2;
    const innerW = Math.max(40, graphWidth - PADDING * 2 - DAY_COL_W - GAP);
    const rawCell = (innerW - GAP * (nWeeks - 1)) / nWeeks;
    const cellSize = Math.max(2, Math.min(14, Math.floor(rawCell)));
  
    const monthLabels = document.createElement('div');
    monthLabels.className = 'contrib-month-labels';
    monthLabels.style.cssText = `padding-left:${DAY_COL_W + GAP + 2}px; margin-bottom:6px; display:flex; gap:0; min-width:0; overflow-x:auto; overflow-y:hidden; white-space:nowrap;`;
  
    let lastMonth = null;
    visibleWeeks.forEach(week => {
      const first = week.contributionDays[0];
      if (!first) return;
      const month = new Date(first.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' });
      const span = document.createElement('span');
      span.className = 'contrib-month-label';
      span.style.cssText = `width:${cellSize + GAP + 4}px; flex-shrink:0; text-align:center; font-size:${Math.min(12, cellSize * 0.8)}px; white-space:nowrap;`;
      span.textContent = month !== lastMonth ? month : '';
      lastMonth = month;
      monthLabels.appendChild(span);
    });
  
    const inner = document.createElement('div');
    inner.className = 'contrib-inner';
    inner.style.cssText = `display:flex; gap:${GAP}px; align-items:flex-start;`;
  
    const daysCol = document.createElement('div');
    daysCol.className = 'contrib-days-col';
    daysCol.style.cssText = `display:flex; flex-direction:column; gap:${GAP}px; width:${DAY_COL_W}px; flex-shrink:0;`;
    DAY_NAMES.forEach(name => {
      const d = document.createElement('div');
      d.className = 'contrib-day-label';
      const labelPx = Math.max(5, Math.min(10, cellSize * 0.65));
      d.style.cssText = `height:${cellSize}px; line-height:${cellSize}px; font-size:${labelPx}px;`;
      d.textContent = name;
      daysCol.appendChild(d);
    });
  
    const colsWrap = document.createElement('div');
    colsWrap.className = 'contrib-cols';
    colsWrap.style.cssText = `display:flex; gap:${GAP}px; flex-shrink:0;`;
  
    visibleWeeks.forEach((week, wi) => {
      const col = document.createElement('div');
      col.className = 'contrib-week';
      col.style.cssText = `display:flex; flex-direction:column; gap:${GAP}px; width:${cellSize}px; flex-shrink:0;`;
  
      for (let di = 0; di < 7; di++) {
        const cell = document.createElement('div');
        cell.className = 'contrib-cell';
        cell.style.cssText = `width:${cellSize}px; height:${cellSize}px; border-radius:${Math.max(1, Math.floor(cellSize / 5))}px;`;
  
        const day = week.contributionDays.find(
          d => new Date(d.date + 'T00:00:00').getDay() === di
        );
  
        if (day) {
          cell.setAttribute('data-level', getContribLevel(day.contributionCount));
          cell.setAttribute('data-count', day.contributionCount);
          cell.setAttribute('data-date', day.date);
        } else {
          cell.style.visibility = 'hidden';
        }
  
        cell.style.animationDelay = `${(wi * 7 + di) * 3}ms`;
        col.appendChild(cell);
      }
  
      colsWrap.appendChild(col);
    });
  
    const footer = document.createElement('div');
    footer.className = 'contrib-footer';
    footer.innerHTML = `
      <div class="contrib-legend">
        Less
        <div class="contrib-legend-cells">
          <div class="contrib-legend-cell" style="background:var(--contrib-0)"></div>
          <div class="contrib-legend-cell" style="background:var(--contrib-1)"></div>
          <div class="contrib-legend-cell" style="background:var(--contrib-2)"></div>
          <div class="contrib-legend-cell" style="background:var(--contrib-3)"></div>
          <div class="contrib-legend-cell" style="background:var(--contrib-4)"></div>
        </div>
        More
      </div>
      <a class="contrib-gh-link" href="https://github.com/0xdya" target="_blank">github.com/0xdya</a>
    `;
  
    graph.innerHTML = '';
    graph.style.padding = `${PADDING}px ${PADDING}px ${Math.round(PADDING * 0.75)}px`;
    inner.appendChild(daysCol);
    inner.appendChild(colsWrap);

    const chartWrap = document.createElement('div');
    chartWrap.className = 'contrib-chart-wrap';
    chartWrap.appendChild(monthLabels);
    chartWrap.appendChild(inner);
    graph.appendChild(chartWrap);
    graph.appendChild(footer);
  
    setupContribTooltip(isMobile);
  }
  
  function getContribLevel(count) {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 3;
    return 4;
  }
  
  function setupContribTooltip(isMobile) {
    const tooltip = document.getElementById('contrib-tooltip');
    const tCount = document.getElementById('contrib-t-count');
    const tText = document.getElementById('contrib-t-text');
    const tDate = document.getElementById('contrib-t-date');
  
    document.querySelectorAll('.contrib-cell[data-date]').forEach(cell => {
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
        cell.addEventListener('click', e => {
          showTooltip(parseInt(cell.getAttribute('data-count')), cell.getAttribute('data-date'), e.clientX, e.clientY);
          setTimeout(() => { tooltip.style.display = 'none'; }, 2200);
        });
      } else {
        cell.addEventListener('mouseenter', e => {
          showTooltip(parseInt(cell.getAttribute('data-count')), cell.getAttribute('data-date'), e.clientX, e.clientY);
        });
        cell.addEventListener('mousemove', e => {
          tooltip.style.left = Math.min(e.clientX + 12, window.innerWidth - 175) + 'px';
          tooltip.style.top = (e.clientY - 52) + 'px';
        });
        cell.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
      }
    });
  }
initContribGraph('my-contributions')