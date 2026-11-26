// Scenario picker: a styled listbox in front of the hidden <select id="scenario"> that microverse.js reads.
const sel = document.getElementById('scenario'), btn = document.getElementById('pickerBtn'),
  list = document.getElementById('pickerList'), val = document.getElementById('pickerVal');
const GROUPS = { L1: 'L1 · Program revision', L2: 'L2 · Reviser tuning', ctrl: 'Control' };
const parse = t => {
  const m = t.match(/^(L\d)(?: \(([^)]+)\))? · (.*)$/);
  return m ? { rung: m[1], tag: m[2], text: m[3] } : { rung: 'ctrl', text: t.replace(/^Control · /, '') };
};
const label = p => `<span class="rung r-${p.rung}">${p.rung === 'ctrl' ? 'base' : p.rung}</span><span class="pt">${p.text}${p.tag ? ` <small>${p.tag}</small>` : ''}</span>`;
let items = [], act = -1;

function build() {
  const opts = [...sel.options].map((o, i) => ({ i, value: o.value, p: parse(o.textContent) }));
  let html = '';
  for (const g of Object.keys(GROUPS)) {
    const inG = opts.filter(o => o.p.rung === g);
    if (!inG.length) continue;
    html += `<li class="grp" role="presentation">${GROUPS[g]}</li>`;
    html += inG.map(o => `<li role="option" id="opt-${o.i}" data-v="${o.value}" aria-selected="${o.value === sel.value}">${label(o.p)}</li>`).join('');
  }
  list.innerHTML = html;
  items = [...list.querySelectorAll('[role=option]')];
  const cur = sel.options[sel.selectedIndex];
  if (cur) val.innerHTML = label(parse(cur.textContent));
}
function setAct(k) {
  items.forEach(x => x.classList.remove('act'));
  act = k;
  if (!items[k]) return;
  items[k].classList.add('act');
  items[k].scrollIntoView({ block: 'nearest' });
  list.setAttribute('aria-activedescendant', items[k].id);
}
function open() { build(); list.hidden = false; btn.setAttribute('aria-expanded', 'true'); setAct(items.findIndex(x => x.dataset.v === sel.value)); list.focus(); }
function close(focus = true) { list.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (focus) btn.focus(); }
function choose(v) { if (v !== sel.value) { sel.value = v; sel.dispatchEvent(new Event('change')); } build(); close(); }

btn.addEventListener('click', () => (list.hidden ? open() : close()));
btn.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); } });
list.addEventListener('click', e => { const o = e.target.closest('[role=option]'); if (o) choose(o.dataset.v); });
list.addEventListener('keydown', e => {
  const k = { ArrowDown: Math.min(items.length - 1, act + 1), ArrowUp: Math.max(0, act - 1), Home: 0, End: items.length - 1 }[e.key];
  if (k !== undefined) { e.preventDefault(); setAct(k); }
  else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (items[act]) choose(items[act].dataset.v); }
  else if (e.key === 'Escape') close();
  else if (e.key === 'Tab') close(false);
});
document.addEventListener('pointerdown', e => { if (!list.hidden && !e.target.closest('#picker')) close(false); });
sel.addEventListener('change', build);
build();
