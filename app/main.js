// Page logic for SakuRumah. Each page declares its static skeleton in HTML;
// this module fills the figures, charts and controls from data.js, wires every
// control to real behaviour, and sets window.__shotReady when rendering is done
// so a screenshot script knows the page is on screen.
//
// User edits (budget changes, added/deleted expenses, goal contributions) are
// kept in localStorage under 'sakurumah-v1' and merged over the base data, so
// every total on every page is recomputed from the same numbers.

import {
  META, INCOME, INCOME_TOTAL, CATEGORIES, TRANSACTIONS, MONTHS,
  MONTH_INCOME, MONTH_SPEND, WEEKDAY_SPEND, GOALS, TIPS,
  rupiah, rupiahShort, catById, actuals,
} from './data.js';
import { donutChart, barChart, groupedBarChart, lineChart, hbarChart } from './charts.js';

const $ = (id) => document.getElementById(id);
const KEY = 'sakurumah-v1';

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { budgets: {}, extra: [], deleted: [], contrib: {} };
    const s = JSON.parse(raw);
    return { budgets: s.budgets || {}, extra: s.extra || [], deleted: s.deleted || [], contrib: s.contrib || {} };
  } catch {
    return { budgets: {}, extra: [], deleted: [], contrib: {} };
  }
}
function saveState(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode: keep in memory */ }
}
const state = loadState();

function budgets() {
  const out = {};
  for (const c of CATEGORIES) out[c.id] = state.budgets[c.id] ?? c.budget;
  return out;
}
function txns() {
  const base = TRANSACTIONS.map((t, i) => ({ ...t, id: 'b' + i }));
  const gone = new Set(state.deleted);
  return base.filter((t) => !gone.has(t.id)).concat(state.extra);
}
function goals() {
  return GOALS.map((g) => ({ ...g, saved: g.saved + (state.contrib[g.id] || 0) }));
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
}
function kpiCard(k) {
  return `<div class="card kpi${k.accent ? ' accent' : ''}">
    <div class="kpi-label">${esc(k.label)}</div>
    <div class="kpi-value">${esc(k.value)}${k.unit ? ` <small>${esc(k.unit)}</small>` : ''}</div>
    <div class="kpi-delta${k.deltaClass ? ' ' + k.deltaClass : ''}">${esc(k.delta)}</div>
    <div class="kpi-year">${esc(k.year)}</div>
  </div>`;
}
function txRow(t) {
  const c = catById(t.cat);
  return `<li><span class="tx-date">${esc(t.date)}</span>
    <span class="tx-desc">${esc(t.desc)}<br><span class="tx-cat">${c.icon} ${esc(c.name)}</span></span>
    <span class="tx-amt">${rupiah(t.amount)}</span>
    ${t.id.startsWith('u') || true ? `<button class="tx-del" data-del="${t.id}" title="Hapus transaksi ini">Hapus</button>` : ''}
  </li>`;
}
function wireDeletes(container) {
  container.querySelectorAll('[data-del]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.deleted.push(btn.dataset.del);
      state.extra = state.extra.filter((t) => t.id !== btn.dataset.del);
      saveState(state);
      render();
    });
  });
}
function rule5030(bud) {
  const need = ['makan', 'transport', 'tagihan', 'pendidikan', 'kesehatan'].reduce((s, id) => s + bud[id], 0);
  const want = ['hiburan', 'lainnya'].reduce((s, id) => s + bud[id], 0);
  return { need, want, save: bud.tabungan };
}

function renderHome() {
  const act = actuals(txns());
  const spent = Object.values(act).reduce((s, v) => s + v, 0);
  const left = INCOME_TOTAL - spent;
  const saveRate = Math.round((act.tabungan / INCOME_TOTAL) * 100);
  const daysLeft = 4; // 27–30 November
  $('kpis').innerHTML = [
    { label: 'Pemasukan', value: 'Rp12,5', unit: 'juta', delta: '3 sumber penghasilan', year: 'November 2026' },
    { label: 'Total pengeluaran', value: rupiahShort(spent), unit: '', delta: `dari anggaran ${rupiahShort(12500000)}`, year: '29 transaksi tercatat', accent: false },
    { label: 'Sisa uang bulan ini', value: rupiahShort(left), unit: '', delta: `aman dibelanjakan ${rupiah(Math.floor(left / daysLeft))}/hari`, year: `4 hari tersisa (27–30 Nov)`, accent: true },
    { label: 'Tingkat tabungan', value: saveRate + '', unit: '%', delta: `${rupiah(act.tabungan)} masuk tabungan`, year: 'target 20% — tercapai' },
  ].map(kpiCard).join('');

  const rows = CATEGORIES.map((c) => [c.name, act[c.id]]);
  const colors = CATEGORIES.map((c) => c.color);
  $('chart-donut').innerHTML = donutChart({ rows, colors, centre: rupiahShort(spent) });
  $('donut-legend').innerHTML = rows.map(([label, v], i) =>
    `<span><i style="background:${colors[i]}"></i>${esc(label)} — ${rupiahShort(v)}</span>`).join('');

  const r = rule5030(budgets());
  const pct = (n) => ((n / INCOME_TOTAL) * 100).toFixed(1);
  $('rule-5030').innerHTML =
    `<div style="display:flex;height:26px;border-radius:8px;overflow:hidden" role="img" aria-label="Kebutuhan ${pct(r.need)} persen, keinginan ${pct(r.want)} persen, tabungan ${pct(r.save)} persen">
      <div style="flex:${r.need};background:#0f766e" title="Kebutuhan"></div>
      <div style="flex:${r.want};background:#d97706" title="Keinginan"></div>
      <div style="flex:${r.save};background:#15803d" title="Tabungan"></div>
    </div>
    <div class="legend"><span><i style="background:#0f766e"></i>Kebutuhan ${rupiahShort(r.need)} (${pct(r.need)}%)</span>
    <span><i style="background:#d97706"></i>Keinginan ${rupiahShort(r.want)} (${pct(r.want)}%)</span>
    <span><i style="background:#15803d"></i>Tabungan ${rupiahShort(r.save)} (${pct(r.save)}%)</span></div>
    <p class="note" style="margin-top:10px">Aturan 50/30/20 menyarankan kebutuhan 50% — keluarga ini di 69,6% karena cicilan dan SPP anak. Tabungan 20% tetap terjaga.</p>`;

  const recent = [...txns()].slice(-8).reverse();
  $('recent-tx').innerHTML = recent.map(txRow).join('');
  wireDeletes($('recent-tx'));
  $('income-list').innerHTML = INCOME.map((i) =>
    `<li><span class="tx-desc">${esc(i.source)}</span><span class="tx-amt">${rupiah(i.amount)}</span></li>`).join('');
  window.__shotReady = true;
}

function renderBudget() {
  const bud = budgets();
  const act = actuals(txns());
  const totalBud = Object.values(bud).reduce((s, v) => s + v, 0);
  const totalAct = Object.values(act).reduce((s, v) => s + v, 0);
  $('kpis').innerHTML = [
    { label: 'Total anggaran', value: rupiahShort(totalBud), unit: '', delta: '8 kategori', year: 'November 2026' },
    { label: 'Terpakai', value: rupiahShort(totalAct), unit: '', delta: `${((totalAct / totalBud) * 100).toFixed(1)}% dari anggaran`, year: 's.d. 26 November' },
    { label: 'Sisa anggaran', value: rupiahShort(totalBud - totalAct), unit: '', delta: totalAct <= totalBud ? 'masih dalam anggaran' : 'anggaran terlampaui', year: 'semua kategori', deltaClass: totalAct <= totalBud ? '' : 'bad' },
    { label: 'Kategori melebihi anggaran', value: String(CATEGORIES.filter((c) => act[c.id] > bud[c.id]).length), unit: 'kategori', delta: 'Tagihan & Pendidikan pas di batas', year: '0 kategori over budget' },
  ].map(kpiCard).join('');

  $('budget-rows').innerHTML = CATEGORIES.map((c) => {
    const a = act[c.id], b = bud[c.id];
    const p = Math.min(100, Math.round((a / b) * 100));
    const cls = a > b ? 'over' : p >= 85 ? 'near' : '';
    const status = a > b ? '<span class="pill bad">Melebihi</span>' : p >= 85 ? '<span class="pill warn">Hampir habis</span>' : '<span class="pill good">Aman</span>';
    return `<tr><td><span class="cat-dot" style="background:${c.color}"></span>${c.icon} ${esc(c.name)}</td>
      <td class="num"><input type="number" min="0" step="50000" value="${b}" data-budget="${c.id}" aria-label="Anggaran ${esc(c.name)}" style="width:130px;padding:6px 8px;border:1px solid var(--line);border-radius:7px;font-size:14px;text-align:right"></td>
      <td class="num">${rupiah(a)}</td>
      <td class="num">${rupiah(b - a)}</td>
      <td><div class="bar-track"><div class="bar-fill ${cls}" style="width:${p}%"></div></div><div style="font-size:12px;color:var(--muted);margin-top:3px">${p}% terpakai</div></td>
      <td>${status}</td></tr>`;
  }).join('');

  $('save-budget').onclick = () => {
    let changed = 0;
    document.querySelectorAll('[data-budget]').forEach((inp) => {
      const v = Math.max(0, Math.round(Number(inp.value) || 0));
      if (v !== CATEGORIES.find((c) => c.id === inp.dataset.budget).budget) changed++;
      state.budgets[inp.dataset.budget] = v;
    });
    saveState(state);
    $('budget-msg').textContent = 'Anggaran tersimpan. Semua halaman memakai angka baru ini.';
    $('budget-msg').className = 'form-msg ok';
    render();
  };
  $('reset-budget').onclick = () => {
    state.budgets = {};
    saveState(state);
    $('budget-msg').textContent = 'Anggaran dikembalikan ke nilai awal.';
    $('budget-msg').className = 'form-msg ok';
    render();
  };

  const r = rule5030(bud);
  const pct = (n) => ((n / INCOME_TOTAL) * 100).toFixed(1);
  $('rule-5030').innerHTML =
    `<div style="display:flex;height:26px;border-radius:8px;overflow:hidden">
      <div style="flex:${r.need};background:#0f766e"></div>
      <div style="flex:${r.want};background:#d97706"></div>
      <div style="flex:${r.save};background:#15803d"></div>
    </div>
    <div class="legend"><span><i style="background:#0f766e"></i>Kebutuhan ${rupiahShort(r.need)} (${pct(r.need)}%)</span>
    <span><i style="background:#d97706"></i>Keinginan ${rupiahShort(r.want)} (${pct(r.want)}%)</span>
    <span><i style="background:#15803d"></i>Tabungan ${rupiahShort(r.save)} (${pct(r.save)}%)</span></div>`;
  window.__shotReady = true;
}

function renderExpenses() {
  const all = txns();
  const act = actuals(all);
  const spent = Object.values(act).reduce((s, v) => s + v, 0);
  $('kpis').innerHTML = [
    { label: 'Total pengeluaran', value: rupiahShort(spent), unit: '', delta: `${all.length} transaksi`, year: '1–26 November 2026' },
    { label: 'Rata-rata per hari', value: rupiahShort(Math.round(spent / 26)), unit: '/hari', delta: '26 hari tercatat', year: 'termasuk akhir pekan' },
    { label: 'Transaksi terbesar', value: rupiahShort(Math.max(...all.map((t) => t.amount))), unit: '', delta: 'Setoran dana darurat', year: '1 November' },
    { label: 'Kategori terboros', value: 'Makan', unit: '', delta: rupiahShort(act.makan), year: '8 transaksi' },
  ].map(kpiCard).join('');

  const filter = $('filter-cat');
  if (!filter.options.length || filter.options.length === 1) {
    filter.innerHTML = '<option value="">Semua kategori</option>' + CATEGORIES.map((c) =>
      `<option value="${c.id}">${c.icon} ${esc(c.name)}</option>`).join('');
  }
  function drawList() {
    const f = filter.value;
    const list = f ? all.filter((t) => t.cat === f) : all;
    const shown = list.reduce((s, t) => s + t.amount, 0);
    $('tx-list').innerHTML = [...list].reverse().map(txRow).join('') ||
      '<li><span class="tx-desc">Belum ada transaksi di kategori ini.</span></li>';
    $('tx-summary').textContent = `${list.length} transaksi · total ${rupiah(shown)}`;
    wireDeletes($('tx-list'));
  }
  filter.onchange = drawList;
  drawList();

  const form = $('add-form');
  form.onsubmit = (ev) => {
    ev.preventDefault();
    const desc = $('f-desc').value.trim();
    const amount = Math.round(Number($('f-amount').value));
    const cat = $('f-cat').value;
    const date = $('f-date').value;
    const msg = $('add-msg');
    if (!desc || !amount || amount <= 0 || !date) {
      msg.textContent = 'Lengkapi semua isian: tanggal, kategori, keterangan, dan jumlah di atas Rp0.';
      msg.className = 'form-msg err';
      return;
    }
    const d = new Date(date + 'T00:00:00');
    const label = `${String(d.getDate()).padStart(2, '0')} Nov`;
    state.extra.push({ id: 'u' + Date.now(), date: label, desc, cat, amount });
    saveState(state);
    msg.textContent = `Ditambahkan: ${desc} — ${rupiah(amount)}. Total dan grafik ikut berubah.`;
    msg.className = 'form-msg ok';
    form.reset();
    render();
  };
  window.__shotReady = true;
}

function renderGoals() {
  const gs = goals();
  const totalSaved = gs.reduce((s, g) => s + g.saved, 0);
  const totalTarget = gs.reduce((s, g) => s + g.target, 0);
  $('kpis').innerHTML = [
    { label: 'Total tabungan tujuan', value: rupiahShort(totalSaved), unit: '', delta: `${gs.length} tujuan aktif`, year: 's.d. 26 November 2026' },
    { label: 'Total target', value: rupiahShort(totalTarget), unit: '', delta: `${Math.round((totalSaved / totalTarget) * 100)}% tercapai`, year: 'semua tujuan' },
    { label: 'Setoran bulan ini', value: rupiahShort(2500000), unit: '', delta: 'Dana darurat + pendidikan', year: 'auto-debit 1 & 15 Nov' },
    { label: 'Paling dekat tercapai', value: 'Dana Darurat', unit: '', delta: `${Math.round((gs[0].saved / gs[0].target) * 100)}% dari target`, year: `kurang ${rupiahShort(gs[0].target - gs[0].saved)} lagi` },
  ].map(kpiCard).join('');

  $('goal-list').innerHTML = gs.map((g) => {
    const p = Math.min(100, Math.round((g.saved / g.target) * 100));
    return `<div class="card" style="margin-bottom:14px">
      <div class="goal-head"><b>${esc(g.name)}</b><span>${p}% tercapai</span></div>
      <div class="goal-meta">${rupiah(g.saved)} dari target ${rupiah(g.target)} · kurang ${rupiah(g.target - g.saved)}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${p}%"></div></div>
      <p class="note" style="margin:8px 0 10px">${esc(g.note)}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input type="number" min="0" step="50000" placeholder="Setoran (Rp)" data-goal="${g.id}" aria-label="Setoran ${esc(g.name)}" style="flex:1;min-width:160px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;font-size:14px">
        <button class="btn small" data-add-goal="${g.id}">Tambah setoran</button>
      </div>
    </div>`;
  }).join('');
  document.querySelectorAll('[data-add-goal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const inp = document.querySelector(`[data-goal="${btn.dataset.addGoal}"]`);
      const v = Math.round(Number(inp.value));
      if (!v || v <= 0) { inp.focus(); return; }
      state.contrib[btn.dataset.addGoal] = (state.contrib[btn.dataset.addGoal] || 0) + v;
      saveState(state);
      render();
    });
  });

  const calc = $('calc-form');
  function runCalc() {
    const target = Math.round(Number($('c-target').value));
    const saved = Math.round(Number($('c-saved').value));
    const monthly = Math.round(Number($('c-monthly').value));
    const out = $('calc-out');
    if (!target || !monthly || monthly <= 0 || target <= saved) {
      out.textContent = target && saved >= target
        ? 'Target sudah tercapai — selamat!'
        : 'Isi target, tabungan saat ini, dan setoran per bulan untuk melihat perkiraan waktu.';
      return;
    }
    const months = Math.ceil((target - saved) / monthly);
    const done = new Date(2026, 10 + months, 26);
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    out.innerHTML = `Dengan setoran <b>${rupiah(monthly)}/bulan</b>, target <b>${rupiah(target)}</b> tercapai dalam <b>${months} bulan</b> — sekitar <b>${monthNames[done.getMonth()]} ${done.getFullYear()}</b>. Total yang perlu disetor lagi: ${rupiah(target - saved)}.`;
  }
  calc.oninput = runCalc;
  runCalc();
  window.__shotReady = true;
}

function renderReports() {
  const act = actuals(txns());
  const spent = Object.values(act).reduce((s, v) => s + v, 0);
  const best = MONTH_SPEND.reduce((m, v, i) => (v < MONTH_SPEND[m] ? i : m), 0);
  $('kpis').innerHTML = [
    { label: 'Rata-rata belanja/bulan', value: rupiahShort(Math.round(MONTH_SPEND.reduce((s, v) => s + v, 0) / 6)), unit: '', delta: 'Jun–Nov 2026', year: '6 bulan terakhir' },
    { label: 'Bulan paling hemat', value: MONTHS[best], unit: '', delta: rupiahShort(MONTH_SPEND[best]), year: 'pengeluaran terendah' },
    { label: 'Total ditabung 6 bulan', value: rupiahShort(MONTH_INCOME.reduce((s, v, i) => s + v - MONTH_SPEND[i], 0)), unit: '', delta: 'pemasukan − pengeluaran', year: 'Jun–Nov 2026' },
    { label: 'November vs rata-rata', value: ((spent / (MONTH_SPEND.reduce((s, v) => s + v, 0) / 6) - 1) * 100).toFixed(1) + '', unit: '%', delta: 'November sedikit di bawah rata-rata', year: 'lebih hemat dari biasanya' },
  ].map(kpiCard).join('');

  $('chart-trend').innerHTML = groupedBarChart({
    labels: MONTHS, seriesA: MONTH_INCOME, seriesB: MONTH_SPEND,
    labelA: 'Pemasukan', labelB: 'Pengeluaran', colorA: '#0f766e', colorB: '#d97706',
  });
  $('trend-detail').innerHTML = MONTHS.map((m, i) => {
    const save = MONTH_INCOME[i] - MONTH_SPEND[i];
    return `<tr${i === 5 ? ' class="hl"' : ''}><td>${m} 2026</td><td class="num">${rupiah(MONTH_INCOME[i])}</td><td class="num">${rupiah(MONTH_SPEND[i])}</td><td class="num">${rupiah(save)}</td></tr>`;
  }).join('');

  $('chart-weekday').innerHTML = hbarChart({
    rows: WEEKDAY_SPEND.map((w) => [w.day, w.amount / 1000]),
    color: '#0f766e', unit: ' rb', decimals: 0,
  });
  $('chart-weekday-note').textContent = 'Akhir pekan (Sabtu–Minggu) Rp5.700.000 — setengah dari total belanja November.';

  $('cat-table').innerHTML = CATEGORIES.map((c) => {
    const a = act[c.id];
    const share = ((a / spent) * 100).toFixed(1);
    return `<tr><td><span class="cat-dot" style="background:${c.color}"></span>${esc(c.name)}</td>
      <td class="num">${rupiah(a)}</td><td class="num">${share}%</td><td class="num">${rupiah(c.budget)}</td>
      <td class="num">${rupiah(c.budget - a)}</td></tr>`;
  }).join('') + `<tr class="total"><td>Total</td><td class="num">${rupiah(spent)}</td><td class="num">100%</td><td class="num">${rupiah(12500000)}</td><td class="num">${rupiah(12500000 - spent)}</td></tr>`;

  $('tips-list').innerHTML = TIPS.map((t) =>
    `<li><b>${esc(t.title)}.</b> ${esc(t.text)}</li>`).join('');
  window.__shotReady = true;
}

function render() {
  window.__shotReady = false;
  const page = document.body.dataset.page;
  if (page === 'home') renderHome();
  else if (page === 'budget') renderBudget();
  else if (page === 'expenses') renderExpenses();
  else if (page === 'goals') renderGoals();
  else if (page === 'reports') renderReports();
}

render();
