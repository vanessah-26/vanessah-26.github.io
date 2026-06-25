/**
 * main.js — Portfolio navigation
 * Run one of these from the portfolio/ folder:
 *   python3 -m http.server 8000
 *   npx serve .
 * Open http://localhost:8000
 */

const PROJECT_VIEWS = ['resonance', 'ikebana', 'scmac', 'asl'];

async function go(name, pushState = true) {
  /* ── Update URL hash ── */
  if (pushState) {
    const hash = name === 'about' ? '' : '#' + name;
    history.pushState({ view: name }, '', location.pathname + hash);
  }

  /* ── Deactivate all views ── */
  document.querySelectorAll('.r-view').forEach(v => v.classList.remove('on'));

  /* ── Update sidebar active state ── */
  document.querySelectorAll('.left-item').forEach(item =>
    item.classList.toggle('active', item.dataset.view === name)
  );

  /* ── Name colour: full black on About, dimmed on projects ── */
  const nameEl = document.querySelector('.left-name');
  if (nameEl) nameEl.style.color = name === 'about' ? '#111' : '#444';

  /* ── Scroll right pane back to top ── */
  const rightPane = document.querySelector('.right-pane');
  if (rightPane) rightPane.scrollTop = 0;

  /* ── For project views, lazy-load HTML fragment on first visit ── */
  if (PROJECT_VIEWS.includes(name)) {
    let viewEl = document.getElementById('view-' + name);

    if (!viewEl) {
      viewEl = document.createElement('div');
      viewEl.className = 'r-view';
      viewEl.id = 'view-' + name;
      rightPane.appendChild(viewEl);

      try {
        const resp = await fetch(`projects/${name}.html`, { cache: 'no-store' });
        if (!resp.ok) throw new Error(resp.status);
        viewEl.innerHTML = await resp.text();
      } catch (err) {
        viewEl.innerHTML =
          `<p style="color:#555;padding:40px 0">
             Could not load project — make sure you're running a local server.<br>
             <code style="font-size:12px;color:#666">python3 -m http.server 8000</code>
           </p>`;
      }
    }

    viewEl.classList.add('on');
  } else {
    /* ── Static views (About) ── */
    const viewEl = document.getElementById('view-' + name);
    if (viewEl) viewEl.classList.add('on');
  }
}

/* ── Handle browser back/forward ── */
window.addEventListener('popstate', e => {
  const name = (e.state && e.state.view) || 'about';
  go(name, false);
});

/* ── On load, read hash to determine initial view ── */
document.addEventListener('DOMContentLoaded', () => {
  const hash = location.hash.slice(1);
  const name = PROJECT_VIEWS.includes(hash) ? hash : 'about';
  go(name, false);
});
