const $ = id => document.getElementById(id);
let state = null, selected = null, detail = null, fetching = false;
const time = s => `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function toast(text) {
  $('toast').textContent = text;
  $('toast').style.display = 'block';
  setTimeout(() => { $('toast').style.display = 'none'; }, 4000);
}

async function get(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error((await r.json()).error);
  return r.json();
}

async function control(action, more = {}) {
  try {
    const r = await fetch('/api/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...more })
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    if (d.metrics) { state = d; render(); }
    return d;
  } catch (e) {
    toast(e.message);
    throw e;
  }
}

function drawWorld() {
  if (!state) return;
  const ctx = $('world').getContext('2d');
  ctx.fillStyle = '#e9edc9';
  ctx.fillRect(0, 0, 1000, 640);

  ctx.strokeStyle = 'rgba(43, 42, 30, 0.045)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1000; x += 40) {
    ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, 640); ctx.stroke();
  }
  for (let y = 0; y < 640; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(1000, y + 0.5); ctx.stroke();
  }

  for (const p of state.food) {
    if (p.amount < 0.02) continue;
    ctx.fillStyle = `rgba(201, 134, 28, ${Math.min(0.75, 0.2 + p.amount * 0.3)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.8 + Math.sqrt(p.amount) * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const o of state.obstacles) {
    ctx.fillStyle = '#e8e6df';
    ctx.strokeStyle = '#b4b1a6';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  if (state.challenge) {
    const zone = state.challenge.hazard || state.challenge.bloom;
    if (zone) {
      ctx.save();
      ctx.strokeStyle = state.challenge.hazard ? '#c53030' : '#2f855a';
      ctx.fillStyle = state.challenge.hazard ? 'rgba(197, 48, 48, 0.07)' : 'rgba(47, 133, 90, 0.08)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([7, 7]);
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, zone.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.font = '500 13px "Geist Mono", ui-monospace, monospace';
      ctx.fillText(state.challenge.hazard ? 'STRESS ZONE' : 'FERTILITY BAND', zone.x - zone.r + 14, zone.y);
      ctx.restore();
    }
  }

  for (const f of state.flies) {
    ctx.save();
    ctx.translate(f.x, f.y);
    if (f.id === selected) {
      ctx.strokeStyle = '#2b2a1e';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 17, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.rotate(f.heading);
    const hue = 15 + ((f.color * 190) % 210);
    ctx.fillStyle = `hsla(${hue}, 42%, 44%, 0.25)`;
    ctx.beginPath();
    ctx.ellipse(-3, -4.5, 7.5, 3.2, -0.32, 0, Math.PI * 2);
    ctx.ellipse(-3, 4.5, 7.5, 3.2, 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `hsl(${hue}, 58%, ${Math.max(26, Math.min(48, 28 + f.energy / 6))}%)`;
    ctx.beginPath();
    ctx.ellipse(0, 0, 6.2, 2.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2b2a1e';
    ctx.beginPath();
    ctx.arc(5, 0, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawChart() {
  const ctx = $('chart').getContext('2d'), h = state.history;
  ctx.clearRect(0, 0, 1000, 160);
  if (!h.length) return;
  const max = Math.max(10, ...h.map(p => p.population)), minT = h[0].tick, span = Math.max(1, h.at(-1).tick - minT);
  ctx.strokeStyle = 'rgba(43, 42, 30, 0.08)';
  ctx.fillStyle = '#5f5b45';
  ctx.font = '12px "Geist Mono", ui-monospace, monospace';
  for (let i = 0; i < 3; i++) {
    const y = 134 - i * 54;
    ctx.beginPath(); ctx.moveTo(38, y + 0.5); ctx.lineTo(996, y + 0.5); ctx.stroke();
    ctx.fillText(String(Math.round(max * i / 2)), 2, y + 4);
  }
  ctx.strokeStyle = '#94592c';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  h.forEach((p, i) => {
    const x = 38 + (p.tick - minT) / span * 954;
    const y = 134 - p.population / max * 108;
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  });
  ctx.stroke();
  $('spanTime').textContent = `${time(minT * 0.1)} — ${time(h.at(-1).seconds)}`;
}

function render() {
  const m = state.metrics, r = state.runtime;
  renderVitals();
  renderChallenges();
  $('connection').textContent = r.lastError ? 'Recovery notice' : 'Engine connected';
  $('time').textContent = time(m.seconds);
  $('population').textContent = m.population;
  $('births').textContent = `${m.births} / ${m.deaths}`;
  $('generation').textContent = state.telemetry?.deepestEver ?? m.generation;
  $('neurons').textContent = m.meanNodes.toFixed(1);
  $('mutations').textContent = m.structuralMutations;
  $('play').textContent = r.paused ? 'Run world' : 'Pause';
  $('worldStatus').textContent = m.status === 'extinct' ? 'Extinct · no reseeding' : m.status === 'capacity' ? 'Paused · at ceiling' : r.paused ? 'Paused' : 'Observing';
  $('actual').textContent = `${r.actualSpeed.toFixed(1)}× achieved`;
  $('speed').value = String(r.speed);
  $('autosave').textContent = r.savedAt ? `Recovery saved ${new Date(r.savedAt).toLocaleTimeString()}` : 'Automatic recovery every 15 seconds.';
  $('accounting').textContent = `Energy residual: ${m.accountingError.toExponential(2)} · Acquired weight magnitude: ${m.learnedMagnitude.toFixed(5)} · Learning ${state.config.learning ? 'on' : 'off'} · Mutation ${state.config.mutation ? 'on' : 'off'}.`;
  if (document.activeElement !== $('nutrient')) $('nutrient').value = state.config.nutrient;
  $('nutrientLabel').textContent = `${state.config.nutrient}×`;
  if (document.activeElement !== $('capacity')) $('capacity').value = state.config.capacity;
  $('agentSelect').replaceChildren(new Option('Choose a fly', ''), ...state.flies.map(f => new Option(`Fly ${f.id} · G${f.generation}`, f.id)));
  $('agentSelect').value = selected || '';
  $('events').replaceChildren(...[...state.events].reverse().slice(0, 20).map(e => {
    const div = document.createElement('div');
    div.className = `event ${e.kind}`;
    const t = document.createElement('time'); t.textContent = time(e.tick * 0.1);
    const s = document.createElement('span'); s.textContent = e.text;
    div.append(t, s);
    return div;
  }));
  drawWorld();
  drawChart();
}

function drawLineage() {
  const ctx = $('lineage').getContext('2d'), ls = state.lineage.slice(-120), pos = {};
  ctx.clearRect(0, 0, 1000, 180);
  if (!ls.length) return;
  const start = ls[0].born, span = Math.max(1, ls.at(-1).born - start);
  for (const l of ls) pos[l.id] = [16 + (l.born - start) / span * 964, 16 + ((l.id * 29) % 148)];
  for (const l of ls) {
    for (const parent of l.parents) {
      if (!pos[parent]) continue;
      ctx.strokeStyle = l.id === selected ? '#94592c' : 'rgba(43, 42, 30, 0.14)';
      ctx.lineWidth = l.id === selected ? 1.8 : 0.8;
      ctx.beginPath(); ctx.moveTo(...pos[parent]); ctx.lineTo(...pos[l.id]); ctx.stroke();
    }
  }
  for (const l of ls) {
    ctx.strokeStyle = l.id === selected ? '#94592c' : '#5f5b45';
    ctx.fillStyle = l.id === selected ? '#94592c' : '#2b2a1e';
    ctx.lineWidth = l.id === selected ? 2 : 1.2;
    ctx.beginPath();
    ctx.arc(...pos[l.id], l.id === selected ? 5 : 2.8, 0, Math.PI * 2);
    if (l.died === null) ctx.fill(); else ctx.stroke();
  }
}

async function inspect() {
  drawLineage();
  if (!selected) return;
  detail = await get(`/api/agent?id=${selected}`);
  const el = $('individual');
  el.replaceChildren();
  if (!detail.genome) {
    el.textContent = detail.archived
      ? `Fly ${selected} died at ${time(detail.archived.died * 0.1)}. Parents: ${detail.archived.parents.join(' + ') || 'founder'}.`
      : 'Individual not found.';
    $('brain').getContext('2d').clearRect(0, 0, 340, 185);
    return;
  }
  const f = detail;
  const title = document.createElement('div');
  title.className = 'fly-name';
  title.textContent = `Fly #${f.id} · generation ${f.generation}`;
  el.append(title);
  const grid = document.createElement('div');
  grid.className = 'trait-grid';
  const traits = [
    ['Parents', f.parents.join(' + ') || 'Founder'],
    ['Age', `${f.age.toFixed(1)}s`],
    ['Energy', f.energy.toFixed(1)],
    ['Offspring', f.offspring],
    ['Neurons / edges', `${f.genome.nodes.length} / ${f.genome.edges.length}`],
    ['Acquired change', f.brain.plastic.reduce((s, p) => s + Math.abs(p), 0).toFixed(4)],
    ['Inherited speed', f.genome.traits.speed.toFixed(1)],
    ['Learning rate', f.genome.traits.learningRate.toFixed(4)]
  ];
  for (const [label, value] of traits) {
    const d = document.createElement('div'), s = document.createElement('span'), v = document.createElement('strong');
    s.textContent = label; v.textContent = value; d.append(s, v); grid.append(d);
  }
  el.append(grid);
  drawBrain(f);
}

function drawBrain(f) {
  const c = $('brain').getContext('2d');
  c.fillStyle = '#fefae0';
  c.fillRect(0, 0, 340, 185);
  const groups = ['input', 'hidden', 'output'], pos = {};
  c.fillStyle = '#5f5b45';
  c.font = '11px "Geist Mono", ui-monospace, monospace';
  ['in', 'hidden', 'out'].forEach((lbl, k) => c.fillText(lbl, 16 + k * 145, 14));
  for (let k = 0; k < 3; k++) {
    const ns = f.genome.nodes.filter(n => n.kind === groups[k]);
    ns.forEach((n, i) => { pos[n.id] = [26 + k * 144, 24 + (i + 0.5) * 150 / Math.max(1, ns.length)]; });
  }
  for (let i = 0; i < f.genome.edges.length; i++) {
    const e = f.genome.edges[i], a = pos[e.from], b = pos[e.to];
    if (!a || !b) continue;
    c.strokeStyle = e.w + f.brain.plastic[i] > 0 ? 'rgba(47, 133, 90, 0.45)' : 'rgba(184, 74, 39, 0.45)';
    c.lineWidth = 0.85;
    c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.stroke();
  }
  for (const n of f.genome.nodes) {
    const p = pos[n.id];
    if (!p) continue;
    const act = Math.abs(f.brain.activity[n.id] || 0);
    c.fillStyle = act > 0.4 ? '#94592c' : '#2b2a1e';
    c.globalAlpha = 0.35 + Math.min(0.65, act * 0.65);
    c.beginPath(); c.arc(...p, 3, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
  }
}

async function refresh() {
  if (fetching) return;
  fetching = true;
  try {
    state = await get('/api/state');
    render();
    await inspect();
  } catch {
    $('connection').textContent = 'Engine unavailable';
  } finally {
    fetching = false;
  }
}

async function saves() {
  const names = await get('/api/saves');
  $('saves').replaceChildren(new Option('Select a checkpoint', ''), ...names.map(n => new Option(n.replace('checkpoint-', '').replace('.json', ''), n)));
}

$('play').onclick = () => control(state.runtime.paused ? 'run' : 'pause').catch(() => {});
$('step').onclick = () => control('step').catch(() => {});
$('speed').onchange = e => control('speed', { value: e.target.value === 'max' ? 'max' : Number(e.target.value) }).catch(() => {});
$('save').onclick = async () => { try { await control('save'); await saves(); toast('Checkpoint saved.'); } catch {} };
$('load').onclick = () => { if ($('saves').value) control('load', { name: $('saves').value }).then(() => { selected = null; toast('Checkpoint restored, world paused.'); }).catch(() => {}); };
$('nutrient').oninput = e => { $('nutrientLabel').textContent = `${e.target.value}×`; };
$('nutrient').onchange = e => control('environment', { nutrient: Number(e.target.value) }).catch(() => {});
$('applyCapacity').onclick = () => control('capacity', { value: Number($('capacity').value) }).catch(() => {});
$('openNew').onclick = () => $('newDialog').showModal();
$('cancelNew').onclick = () => $('newDialog').close();
$('newForm').onsubmit = async e => {
  e.preventDefault();
  try {
    await control('reset', { config: { seed: Number($('seed').value), founders: Number($('founders').value), learning: $('learning').checked, mutation: $('mutation').checked, seasonal: $('seasonal').checked, challenges: $('challengeProfile').value } });
    selected = null;
    $('newDialog').close();
    await saves();
    toast('New world created. Previous world saved.');
  } catch {}
};
$('import').onchange = async e => {
  try {
    const file = e.target.files[0]; if (!file) return;
    await control('import', { checkpoint: JSON.parse(await file.text()) });
    selected = null;
    toast('Imported world.');
  } catch (err) { toast(err.message); }
  e.target.value = '';
};
$('agentSelect').onchange = e => { selected = Number(e.target.value) || null; inspect(); };
$('world').onclick = e => {
  if (!state) return;
  const r = e.target.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 1000, y = (e.clientY - r.top) / r.height * 640;
  const f = [...state.flies].sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
  if (f && Math.hypot(f.x - x, f.y - y) < 35) { selected = f.id; inspect(); drawWorld(); }
};

refresh();
saves().catch(() => {});
setInterval(refresh, 2000);

if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const tools = [
    { name: 'read_ecosystem', description: 'Read measured ecosystem state and execution status.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true }, execute: async () => { await refresh(); return { metrics: state.metrics, runtime: state.runtime }; } },
    { name: 'control_ecosystem', description: 'Run, pause, step one second, or save a checkpoint in the current local ecosystem.', inputSchema: { type: 'object', properties: { action: { type: 'string', enum: ['run', 'pause', 'step', 'save'] } }, required: ['action'], additionalProperties: false }, execute: async input => { if (!['run', 'pause', 'step', 'save'].includes(input?.action)) throw new Error('Invalid action'); const result = await control(input.action); return result.metrics || result; } }
  ];
  for (const tool of tools) try { Promise.resolve(document.modelContext.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); } catch {}
  addEventListener('pagehide', () => lifecycle.abort(), { once: true });
}

function renderVitals() {
  const m = state.metrics, r = state.runtime, t = state.telemetry;
  $('seedLabel').textContent = `SEED ${state.config.seed}`;
  const notice = $('hostingNotice');
  notice.hidden = !r.hosted;
  notice.textContent = r.demo ? 'Public demo · Observation only. Export a world to retain your own copy.' : 'Public observatory · Owner-managed experiment.';
  for (const id of ['play', 'step', 'speed', 'save', 'openNew', 'load', 'import', 'nutrient', 'capacity', 'applyCapacity']) $(id).disabled = !!r.readOnly;
  const out = $('outcome');
  out.hidden = m.status !== 'extinct';
  out.replaceChildren();
  if (!out.hidden) {
    const title = document.createElement('strong'); title.textContent = 'This world has reached extinction.';
    const note = document.createElement('span'); note.textContent = `${m.births.toLocaleString()} births recorded. History remains archived with no reseeding.`;
    out.append(title, note);
  }
  const el = $('vitals'); el.replaceChildren();
  if (!t) { el.textContent = 'Detailed measurements become available after the server starts.'; return; }
  const grid = document.createElement('div'); grid.className = 'vital-grid';
  for (const [label, value] of [
    ['Sex A / Sex B', t.sexes.map(s => s.population).join(' / ')],
    ['Mating ready', t.sexes.map(s => s.eligible).join(' / ')],
    ['Energy deaths', t.recentDeaths.energy],
    ['Age deaths', t.recentDeaths.age]
  ]) {
    const box = document.createElement('div'), labelEl = document.createElement('span'), v = document.createElement('strong');
    labelEl.textContent = label; v.textContent = value; box.append(labelEl, v); grid.append(box);
  }
  const note = document.createElement('p');
  note.className = 'vital-note';
  note.textContent = t.reproductiveBottleneck ? 'Only one sex remains. Reproduction is impossible.' : m.population ? 'Eligibility also requires proximity and a positive mating output.' : 'No living population. Ancestry total is preserved.';
  el.append(grid, note);
}

function renderChallenges() {
  const c = state.challenge, panel = $('challengePanel');
  panel.hidden = !c;
  if (!c) return;
  $('challengeName').textContent = c.name.toUpperCase();
  $('challengeClock').textContent = `Cycle ${c.cycle} · ${Math.ceil(c.remaining)}s left`;
  $('challengeDescription').textContent = c.description;
  const track = $('phaseTrack'); track.replaceChildren();
  for (const [i, name] of ['First Light', 'The Drift', 'Lean Season', 'The Squall'].entries()) {
    const step = document.createElement('span');
    step.textContent = name;
    step.className = i === c.index ? 'active' : '';
    if (i === c.index) step.setAttribute('aria-current', 'step');
    track.append(step);
  }
  const results = $('phaseResults'); results.replaceChildren();
  const completed = (state.challengeHistory || []).filter(p => p.endTick).slice(-4);
  if (completed.length) {
    const table = document.createElement('table'), caption = document.createElement('caption');
    caption.textContent = 'Last completed phases'; table.append(caption);
    const head = document.createElement('tr');
    for (const label of ['Phase', 'Population', 'Births', 'Deaths']) { const th = document.createElement('th'); th.textContent = label; head.append(th); }
    const thead = document.createElement('thead'); thead.append(head); table.append(thead);
    const body = document.createElement('tbody');
    for (const phase of completed) {
      const tr = document.createElement('tr');
      for (const value of [phase.name, `${phase.startPopulation} → ${phase.endPopulation}`, phase.births, phase.deaths]) {
        const td = document.createElement('td'); td.textContent = value; tr.append(td);
      }
      body.append(tr);
    }
    table.append(body); results.append(table);
  }
}
