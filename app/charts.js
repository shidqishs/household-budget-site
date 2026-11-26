// Hand-rolled SVG charts for SakuRumah. No libraries, no network.
// Each function returns an SVG string sized to its container.

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
}
function fmtNum(n) {
  return Math.round(n).toLocaleString('id-ID');
}

export function donutChart({ rows, colors, centre }) {
  const total = rows.reduce((s, r) => s + r[1], 0) || 1;
  const cx = 110, cy = 110, r = 82, hole = 58;
  let angle = -Math.PI / 2;
  const parts = [];
  rows.forEach(([label, value], i) => {
    const frac = value / total;
    const a0 = angle, a1 = angle + frac * Math.PI * 2;
    angle = a1;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const ix0 = cx + hole * Math.cos(a0), iy0 = cy + hole * Math.sin(a0);
    const ix1 = cx + hole * Math.cos(a1), iy1 = cy + hole * Math.sin(a1);
    parts.push(`<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${ix1.toFixed(1)} ${iy1.toFixed(1)} A ${hole} ${hole} 0 ${large} 0 ${ix0.toFixed(1)} ${iy0.toFixed(1)} Z" fill="${colors[i % colors.length]}"><title>${esc(label)}: Rp${fmtNum(value)}</title></path>`);
  });
  return `<svg viewBox="0 0 220 220" width="100%" role="img" aria-label="Donat pengeluaran per kategori">${parts.join('')}
  <text x="110" y="104" text-anchor="middle" font-size="15" font-weight="700" fill="#1c2b28">${esc(centre)}</text>
  <text x="110" y="124" text-anchor="middle" font-size="11" fill="#5f6f6b">total November</text></svg>`;
}

export function barChart({ labels, values, color, unit = '', decimals = 0, highlightLast = false }) {
  const w = 560, h = 220, padL = 46, padB = 26, padT = 14;
  const max = Math.max(...values) * 1.12 || 1;
  const bw = (w - padL - 14) / values.length;
  const bars = values.map((v, i) => {
    const bh = ((h - padT - padB) * v) / max;
    const x = padL + i * bw + bw * 0.18;
    const y = h - padB - bh;
    const fill = highlightLast && i === values.length - 1 ? '#b45309' : color;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(bw * 0.64).toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="${fill}"><title>${esc(labels[i])}: ${v.toLocaleString('id-ID')}</title></rect>
    <text x="${(x + bw * 0.32).toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="middle" font-size="11" fill="#1c2b28">${v.toLocaleString('id-ID', { maximumFractionDigits: decimals })}</text>
    <text x="${(x + bw * 0.32).toFixed(1)}" y="${h - 8}" text-anchor="middle" font-size="12" fill="#5f6f6b">${esc(labels[i])}</text>`;
  }).join('');
  const grid = [0.25, 0.5, 0.75, 1].map((f) => {
    const y = h - padB - (h - padT - padB) * f;
    return `<line x1="${padL}" y1="${y}" x2="${w - 10}" y2="${y}" stroke="#e7edeb" stroke-width="1"/>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Grafik batang">${grid}${bars}</svg>`;
}

export function groupedBarChart({ labels, seriesA, seriesB, labelA, labelB, colorA, colorB }) {
  const w = 560, h = 230, padL = 52, padB = 26, padT = 16;
  const max = Math.max(...seriesA, ...seriesB) * 1.12 || 1;
  const gw = (w - padL - 14) / labels.length;
  const bw = gw * 0.3;
  const bars = labels.map((lab, i) => {
    const x = padL + i * gw;
    const hA = ((h - padT - padB) * seriesA[i]) / max;
    const hB = ((h - padT - padB) * seriesB[i]) / max;
    return `<rect x="${(x + gw * 0.14).toFixed(1)}" y="${(h - padB - hA).toFixed(1)}" width="${bw.toFixed(1)}" height="${hA.toFixed(1)}" rx="3" fill="${colorA}"><title>${esc(lab)} ${esc(labelA)}: Rp${fmtNum(seriesA[i])}</title></rect>
    <rect x="${(x + gw * 0.14 + bw + 3).toFixed(1)}" y="${(h - padB - hB).toFixed(1)}" width="${bw.toFixed(1)}" height="${hB.toFixed(1)}" rx="3" fill="${colorB}"><title>${esc(lab)} ${esc(labelB)}: Rp${fmtNum(seriesB[i])}</title></rect>
    <text x="${(x + gw * 0.5).toFixed(1)}" y="${h - 8}" text-anchor="middle" font-size="12" fill="#5f6f6b">${esc(lab)}</text>`;
  }).join('');
  const grid = [0.25, 0.5, 0.75, 1].map((f) => {
    const y = h - padB - (h - padT - padB) * f;
    return `<line x1="${padL}" y1="${y}" x2="${w - 10}" y2="${y}" stroke="#e7edeb" stroke-width="1"/>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Perbandingan pemasukan dan pengeluaran">${grid}${bars}</svg>`;
}

export function lineChart({ labels, values, color, unit = '', decimals = 0 }) {
  const w = 560, h = 220, padL = 52, padB = 26, padT = 16;
  const min = Math.min(...values, 0), max = Math.max(...values);
  const span = (max - min) || 1;
  const px = (i) => padL + (i * (w - padL - 16)) / (values.length - 1);
  const py = (v) => h - padB - ((v - min) / span) * (h - padT - padB);
  const pts = values.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
  const area = `${padL},${h - padB} ${pts} ${px(values.length - 1).toFixed(1)},${h - padB}`;
  const dots = values.map((v, i) =>
    `<circle cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="4" fill="${color}"><title>${esc(labels[i])}: ${v.toLocaleString('id-ID')}${unit}</title></circle>`).join('');
  const labs = labels.map((l, i) =>
    `<text x="${px(i).toFixed(1)}" y="${h - 8}" text-anchor="middle" font-size="12" fill="#5f6f6b">${esc(l)}</text>`).join('');
  const grid = [0.25, 0.5, 0.75, 1].map((f) => {
    const y = h - padB - (h - padT - padB) * f;
    return `<line x1="${padL}" y1="${y}" x2="${w - 10}" y2="${y}" stroke="#e7edeb" stroke-width="1"/>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Grafik garis">${grid}
  <polygon points="${area}" fill="${color}" opacity="0.12"/>
  <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${dots}${labs}</svg>`;
}

export function hbarChart({ rows, color, unit = '', decimals = 0 }) {
  const w = 560, rowH = 34, padL = 130, padT = 6, padB = 6;
  const h = rows.length * rowH + padT + padB;
  const max = Math.max(...rows.map((r) => r[1])) || 1;
  const bars = rows.map(([label, value], i) => {
    const y = padT + i * rowH;
    const bw = ((w - padL - 70) * value) / max;
    return `<text x="${padL - 8}" y="${y + 19}" text-anchor="end" font-size="12.5" fill="#1c2b28">${esc(label)}</text>
    <rect x="${padL}" y="${y + 6}" width="${bw.toFixed(1)}" height="18" rx="3" fill="${color}"><title>${esc(label)}: ${value.toLocaleString('id-ID')}${unit}</title></rect>
    <text x="${padL + bw + 7}" y="${y + 20}" font-size="12" fill="#1c2b28">${value.toLocaleString('id-ID', { maximumFractionDigits: decimals })}${unit}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Grafik batang horizontal">${bars}</svg>`;
}
