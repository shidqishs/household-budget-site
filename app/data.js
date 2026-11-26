// Data for SakuRumah — Anggaran Rumah Tangga. Figures are a realistic
// Indonesian household budget for November 2026, written for this site:
// income Rp12.500.000/month, 8 categories, 29 recorded transactions whose
// amounts add up exactly to the category totals the site displays.
// Nothing here is fetched: the site works with no network request at all.

export const META = {
  siteName: 'SakuRumah',
  tagline: 'Anggaran Rumah Tangga',
  household: 'Keluarga Prasetyo — 4 orang, Jakarta Selatan',
  month: 'November 2026',
  updated: '26 November 2026',
};

// Monthly income, November 2026.
export const INCOME = [
  { source: 'Gaji (Ayah — karyawan swasta)', amount: 9500000 },
  { source: 'Usaha sampingan (Ibu — katering rumahan)', amount: 2000000 },
  { source: 'Lainnya (bunga tabungan & cashback)', amount: 1000000 },
];
export const INCOME_TOTAL = 12500000;

// Budget categories: budget vs actual is computed from TRANSACTIONS below.
export const CATEGORIES = [
  { id: 'makan', name: 'Makan & Belanja', budget: 3000000, color: '#c2410c', icon: '🍚' },
  { id: 'transport', name: 'Transport', budget: 1200000, color: '#1d4ed8', icon: '🛵' },
  { id: 'tagihan', name: 'Tagihan & Cicilan', budget: 2300000, color: '#0f766e', icon: '🧾' },
  { id: 'pendidikan', name: 'Pendidikan Anak', budget: 1500000, color: '#6d28d9', icon: '🎒' },
  { id: 'hiburan', name: 'Hiburan', budget: 800000, color: '#be185d', icon: '🎬' },
  { id: 'kesehatan', name: 'Kesehatan', budget: 700000, color: '#15803d', icon: '💊' },
  { id: 'tabungan', name: 'Tabungan', budget: 2500000, color: '#b45309', icon: '🐷' },
  { id: 'lainnya', name: 'Lainnya', budget: 500000, color: '#5f6f6b', icon: '🧺' },
];

// Every transaction of November 2026 (1–26 Nov). Amounts per category:
// Makan 2.640.000 · Transport 1.050.000 · Tagihan 2.300.000 · Pendidikan 1.500.000
// Hiburan 620.000 · Kesehatan 410.000 · Tabungan 2.500.000 · Lainnya 380.000
// Total 11.400.000 — leaving Rp1.100.000 of the Rp12.500.000 income unspent.
export const TRANSACTIONS = [
  { date: '01 Nov', desc: 'Belanja mingguan — Pasar Minggu', cat: 'makan', amount: 450000 },
  { date: '01 Nov', desc: 'Setoran dana darurat (auto-debit)', cat: 'tabungan', amount: 1500000 },
  { date: '02 Nov', desc: 'BBM Pertalite — motor & mobil', cat: 'transport', amount: 350000 },
  { date: '03 Nov', desc: 'Listrik PLN (token + tagihan)', cat: 'tagihan', amount: 850000 },
  { date: '04 Nov', desc: 'SPP sekolah anak (November)', cat: 'pendidikan', amount: 900000 },
  { date: '05 Nov', desc: 'Belanja Superindo — mingguan', cat: 'makan', amount: 520000 },
  { date: '06 Nov', desc: 'Langganan streaming (Netflix + Spotify)', cat: 'hiburan', amount: 150000 },
  { date: '07 Nov', desc: 'Air PDAM + internet IndiHome', cat: 'tagihan', amount: 420000 },
  { date: '08 Nov', desc: 'Vitamin & obat flu keluarga', cat: 'kesehatan', amount: 180000 },
  { date: '09 Nov', desc: 'Ojek online — antar anak sekolah', cat: 'transport', amount: 150000 },
  { date: '10 Nov', desc: 'Cicilan motor (ke-14 dari 35)', cat: 'tagihan', amount: 650000 },
  { date: '11 Nov', desc: 'Belanja mingguan — sayur & lauk', cat: 'makan', amount: 310000 },
  { date: '12 Nov', desc: 'Les bahasa Inggris anak', cat: 'pendidikan', amount: 350000 },
  { date: '13 Nov', desc: 'Nonton bioskop keluarga (4 tiket)', cat: 'hiburan', amount: 220000 },
  { date: '14 Nov', desc: 'Tol & parkir — perjalanan kantor', cat: 'transport', amount: 180000 },
  { date: '15 Nov', desc: 'Setoran tabungan pendidikan anak', cat: 'tabungan', amount: 1000000 },
  { date: '16 Nov', desc: 'Belanja bulanan — beras & minyak', cat: 'makan', amount: 460000 },
  { date: '17 Nov', desc: 'Periksa gigi — tambal 1 gigi', cat: 'kesehatan', amount: 230000 },
  { date: '18 Nov', desc: 'Hadiah ulang tahun — Ibu', cat: 'lainnya', amount: 200000 },
  { date: '19 Nov', desc: 'Buku & alat tulis anak', cat: 'pendidikan', amount: 250000 },
  { date: '20 Nov', desc: 'Iuran RT + kebersihan lingkungan', cat: 'tagihan', amount: 380000 },
  { date: '21 Nov', desc: 'Belanja mingguan — buah & daging', cat: 'makan', amount: 380000 },
  { date: '22 Nov', desc: 'Servis motor — ganti oli & rem', cat: 'transport', amount: 250000 },
  { date: '23 Nov', desc: 'Jalan-jalan akhir pekan — Taman Mini', cat: 'hiburan', amount: 250000 },
  { date: '24 Nov', desc: 'Makan malam keluarga — resto Sunda', cat: 'makan', amount: 240000 },
  { date: '25 Nov', desc: 'Peralatan rumah — lampu & sapu', cat: 'lainnya', amount: 180000 },
  { date: '25 Nov', desc: 'Belanja mingguan — sembako', cat: 'makan', amount: 180000 },
  { date: '26 Nov', desc: 'Parkir & bensin harian', cat: 'transport', amount: 120000 },
  { date: '26 Nov', desc: 'Jajan & camilan anak', cat: 'makan', amount: 100000 },
];

// Monthly series, June–November 2026 (income vs spending, rupiah).
export const MONTHS = ['Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'];
export const MONTH_INCOME = [12500000, 12500000, 12800000, 12500000, 12500000, 12500000];
export const MONTH_SPEND = [11850000, 11200000, 12050000, 10900000, 11600000, 11400000];

// Spending by day of the week, November 2026 — sums to 11.400.000.
export const WEEKDAY_SPEND = [
  { day: 'Senin', amount: 1240000 },
  { day: 'Selasa', amount: 980000 },
  { day: 'Rabu', amount: 1150000 },
  { day: 'Kamis', amount: 1020000 },
  { day: 'Jumat', amount: 1310000 },
  { day: 'Sabtu', amount: 2450000 },
  { day: 'Minggu', amount: 3250000 },
];

// Savings goals.
export const GOALS = [
  { id: 'darurat', name: 'Dana Darurat', target: 15000000, saved: 9750000, note: 'Target 6× pengeluaran bulanan — untuk jaga-jaga PHK atau sakit.' },
  { id: 'pendidikan', name: 'Pendidikan Anak', target: 10000000, saved: 4200000, note: 'Biaya masuk SMP tahun ajaran baru, Juli 2027.' },
  { id: 'liburan', name: 'Liburan Keluarga', target: 6000000, saved: 2850000, note: 'Liburan ke Yogyakarta, 5 hari, libur sekolah Desember.' },
  { id: 'renovasi', name: 'Renovasi Dapur', target: 8000000, saved: 1600000, note: 'Ganti meja dapur dan pasang kitchen set sederhana.' },
];

// Practical money tips shown on the Reports page.
export const TIPS = [
  { title: 'Akhir pekan paling boros', text: 'Sabtu–Minggu menelan Rp5.700.000 (50% dari total November). Belanja mingguan hari Sabtu digeser ke Jumat malam bisa menghemat ongkos dan godaan jajan.' },
  { title: 'Makan di luar masih terkendali', text: 'Makan & belanja Rp2.640.000 dari anggaran Rp3.000.000 — sisa Rp360.000. Pertahankan: masak 5 hari seminggu, makan di luar maksimal 1× seminggu.' },
  { title: 'Tagihan sudah lunas semua', text: 'Listrik, air, internet, cicilan motor dan iuran RT sudah dibayar penuh (Rp2.300.000). Tidak ada tagihan tertunggak bulan ini.' },
  { title: 'Tabungan 20% tercapai', text: 'Rp2.500.000 dari Rp12.500.000 penghasilan (20%) masuk tabungan — sesuai target. Dana darurat sudah 65% dari target Rp15.000.000.' },
  { title: 'Sisa Rp1.100.000 untuk 4 hari', text: 'Aman dibelanjakan Rp275.000/hari sampai 30 November. Jangan sentuh dana darurat untuk belanja akhir bulan.' },
];

export function rupiah(n) {
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}
export function rupiahShort(n) {
  if (n >= 1000000) return 'Rp' + (n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt';
  if (n >= 1000) return 'Rp' + Math.round(n / 1000) + ' rb';
  return 'Rp' + n;
}
export function catById(id) {
  return CATEGORIES.find((c) => c.id === id) || { id, name: id, color: '#5f6f6b', icon: '' };
}
export function actuals(txns) {
  const out = {};
  for (const c of CATEGORIES) out[c.id] = 0;
  for (const t of txns) out[t.cat] = (out[t.cat] || 0) + t.amount;
  return out;
}
