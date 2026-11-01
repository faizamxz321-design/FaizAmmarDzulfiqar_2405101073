/* ==========================================================
   StokKu — Sistem Pengelolaan Stok Barang (frontend UTS)
   Data disimpan di localStorage browser sebagai simulasi
   database. Struktur data mengikuti rancangan tabel:
   users, categories, items, stock_transactions.
   ========================================================== */
'use strict';

/* ---------- Utilitas ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rupiah = n => new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0}).format(n || 0);
const angka  = n => new Intl.NumberFormat('id-ID').format(n || 0);
const fmtTgl = iso => new Date(iso).toLocaleString('id-ID', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'});
const fmtTglPendek = iso => new Date(iso).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'});
const pad = n => String(n).padStart(2, '0');
const toLocalInput = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const toDateInput  = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const nextId = list => list.reduce((m, x) => Math.max(m, x.id), 0) + 1;

/* ---------- Penyimpanan data ---------- */
const KEY = 'stokku_db_v1';
const SESSION_KEY = 'stokku_session';
let db;

function seedData() {
  const now = new Date();
  const daysAgo = (d, h = 9) => { const x = new Date(now); x.setDate(x.getDate() - d); x.setHours(h, 0, 0, 0); return x.toISOString(); };
  const categories = [
    {id:1, nama:'Makanan Instan', deskripsi:'Mi, bubur, dan makanan siap saji', status:1},
    {id:2, nama:'Minuman', deskripsi:'Air mineral, teh, kopi, dan minuman kemasan', status:1},
    {id:3, nama:'Kebutuhan Dapur', deskripsi:'Beras, minyak, gula, dan bumbu', status:1},
    {id:4, nama:'Perlengkapan Mandi', deskripsi:'Sabun, sampo, pasta gigi', status:1},
    {id:5, nama:'Alat Tulis', deskripsi:'Buku, pulpen, dan kebutuhan sekolah', status:1}
  ];
  const items = [
    {id:1,  kode:'BRG-001', nama:'Mi Instan Goreng',       idKategori:1, hargaBeli:2700,  hargaJual:3500,  stok:0, stokMin:40, status:1},
    {id:2,  kode:'BRG-002', nama:'Bubur Instan Ayam',      idKategori:1, hargaBeli:3800,  hargaJual:5000,  stok:0, stokMin:12, status:1},
    {id:3,  kode:'BRG-003', nama:'Air Mineral 600 ml',     idKategori:2, hargaBeli:2200,  hargaJual:3000,  stok:0, stokMin:48, status:1},
    {id:4,  kode:'BRG-004', nama:'Teh Botol 450 ml',       idKategori:2, hargaBeli:4000,  hargaJual:5500,  stok:0, stokMin:24, status:1},
    {id:5,  kode:'BRG-005', nama:'Kopi Sachet Hitam',      idKategori:2, hargaBeli:1200,  hargaJual:2000,  stok:0, stokMin:30, status:1},
    {id:6,  kode:'BRG-006', nama:'Beras Premium 5 kg',     idKategori:3, hargaBeli:68000, hargaJual:74000, stok:0, stokMin:10, status:1},
    {id:7,  kode:'BRG-007', nama:'Minyak Goreng 1 L',      idKategori:3, hargaBeli:16500, hargaJual:18500, stok:0, stokMin:15, status:1},
    {id:8,  kode:'BRG-008', nama:'Gula Pasir 1 kg',        idKategori:3, hargaBeli:15000, hargaJual:17000, stok:0, stokMin:12, status:1},
    {id:9,  kode:'BRG-009', nama:'Sabun Mandi Batang',     idKategori:4, hargaBeli:2800,  hargaJual:4000,  stok:0, stokMin:20, status:1},
    {id:10, kode:'BRG-010', nama:'Sampo Sachet',           idKategori:4, hargaBeli:500,   hargaJual:1000,  stok:0, stokMin:60, status:1},
    {id:11, kode:'BRG-011', nama:'Buku Tulis 38 Lembar',   idKategori:5, hargaBeli:3500,  hargaJual:5000,  stok:0, stokMin:25, status:1},
    {id:12, kode:'BRG-012', nama:'Pulpen Hitam',           idKategori:5, hargaBeli:2000,  hargaJual:3000,  stok:0, stokMin:30, status:1}
  ];
  // [idBarang, jenis, jumlah, hariLalu, jam, keterangan]
  const t = [
    [1,'masuk',200,28,8,'Stok awal'],[2,'masuk',60,28,8,'Stok awal'],[3,'masuk',240,28,8,'Stok awal'],
    [4,'masuk',96,28,8,'Stok awal'],[5,'masuk',150,28,8,'Stok awal'],[6,'masuk',40,28,8,'Stok awal'],
    [7,'masuk',60,28,8,'Stok awal'],[8,'masuk',50,28,8,'Stok awal'],[9,'masuk',80,28,8,'Stok awal'],
    [10,'masuk',300,28,8,'Stok awal'],[11,'masuk',100,28,8,'Stok awal'],[12,'masuk',120,28,8,'Stok awal'],
    [1,'keluar',60,24,13,'Penjualan harian'],[3,'keluar',72,23,14,'Penjualan harian'],
    [6,'keluar',12,22,10,'Penjualan harian'],[7,'keluar',18,21,11,'Penjualan harian'],
    [1,'masuk',120,20,9,'Pembelian dari Distributor Sentosa'],[5,'keluar',50,19,15,'Penjualan harian'],
    [4,'keluar',36,18,12,'Penjualan harian'],[8,'keluar',14,17,10,'Penjualan harian'],
    [9,'keluar',25,16,13,'Penjualan harian'],[10,'keluar',120,15,14,'Penjualan harian'],
    [11,'keluar',30,14,9,'Penjualan ke sekolah'],[12,'keluar',45,14,9,'Penjualan ke sekolah'],
    [2,'keluar',20,12,16,'Penjualan harian'],[3,'masuk',120,11,9,'Pembelian dari Agen Air Segar'],
    [1,'keluar',95,10,13,'Penjualan harian'],[6,'keluar',20,9,10,'Penjualan harian'],
    [7,'keluar',22,8,11,'Penjualan harian'],[3,'keluar',150,7,14,'Penjualan harian'],
    [5,'keluar',70,6,15,'Penjualan harian'],[10,'keluar',110,5,12,'Penjualan harian'],
    [8,'keluar',18,4,10,'Penjualan harian'],[4,'keluar',40,3,13,'Penjualan harian'],
    [2,'keluar',22,3,14,'Penjualan harian'],[1,'keluar',90,2,11,'Penjualan harian'],
    [7,'masuk',30,2,9,'Pembelian dari Distributor Sentosa'],[9,'keluar',28,1,10,'Penjualan harian'],
    [12,'keluar',25,1,15,'Penjualan harian'],[6,'keluar',6,0,9,'Penjualan harian']
  ];
  const transactions = t.map((r, i) => ({
    id:i+1, idBarang:r[0], idUser:1, jenis:r[1], jumlah:r[2], tanggal:daysAgo(r[3], r[4]), keterangan:r[5]
  }));
  // hitung stok akhir dari transaksi
  transactions.forEach(tr => {
    const it = items.find(x => x.id === tr.idBarang);
    it.stok += tr.jenis === 'masuk' ? tr.jumlah : -tr.jumlah;
  });
  return {
    users: [{id:1, nama:'Faiz Ammar Dzulfiqar', username:'admin', password:'admin123'}],
    categories, items, transactions
  };
}

function loadDB() {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  const fresh = seedData(); localStorage.setItem(KEY, JSON.stringify(fresh)); return fresh;
}
function saveDB() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); }
  catch (e) { toast('Data tidak bisa disimpan di browser ini.', 'err'); }
}

/* ---------- Helper data ---------- */
const getItem = id => db.items.find(i => i.id === id);
const getCat  = id => db.categories.find(c => c.id === id);
const getUser = id => db.users.find(u => u.id === id);
const currentUser = () => getUser(Number(sessionStorage.getItem(SESSION_KEY)));
const isLow = it => it.stok <= it.stokMin;
const stockState = it => it.stok === 0 ? 'empty' : (isLow(it) ? 'low' : 'ok');
const stockLabel = it => ({empty:'Habis', low:'Menipis', ok:'Aman'})[stockState(it)];
const activeItems = () => db.items.filter(i => i.status === 1);
const activeCats  = () => db.categories.filter(c => c.status === 1);
const lowItems = () => activeItems().filter(isLow).sort((a, b) => (a.stok / (a.stokMin || 1)) - (b.stok / (b.stokMin || 1)));

/* ---------- Toast & dialog ---------- */
function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = 'toast ' + type; el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function confirmBox(msg, {title = 'Konfirmasi', yes = 'Lanjutkan'} = {}) {
  return new Promise(resolve => {
    const dlg = $('#confirmDlg');
    $('#confirmTitle').textContent = title;
    $('#confirmMsg').textContent = msg;
    $('#confirmYes').textContent = yes;
    const done = v => { dlg.close(); cleanup(); resolve(v); };
    const y = () => done(true), n = () => done(false);
    const cleanup = () => { $('#confirmYes').removeEventListener('click', y); $('#confirmNo').removeEventListener('click', n); dlg.removeEventListener('cancel', n); };
    $('#confirmYes').addEventListener('click', y);
    $('#confirmNo').addEventListener('click', n);
    dlg.addEventListener('cancel', n);
    dlg.showModal();
  });
}

let modalHandler = null;
function openModal(title, bodyHtml, onSubmit, submitText = 'Simpan') {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = bodyHtml;
  $('#modalSubmit').textContent = submitText;
  modalHandler = onSubmit;
  $('#modal').showModal();
  const first = $('#modalBody input:not([disabled]), #modalBody select');
  if (first) first.focus();
}
function closeModal() { $('#modal').close(); modalHandler = null; }

/* Validasi form sederhana: kembalikan true jika valid */
function setErr(input, msg) {
  const f = input.closest('.field');
  f.classList.toggle('invalid', !!msg);
  let e = f.querySelector('.err');
  if (msg) { if (!e) { e = document.createElement('small'); e.className = 'err'; f.appendChild(e); } e.textContent = msg; }
  else if (e) e.remove();
  return !msg;
}

/* ---------- Ikon ---------- */
const ICON = {
  dashboard:'<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>',
  box:'<path d="M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>',
  tag:'<path d="M20 12l-8 8-9-9V3h8zM7.5 7.5h.01"/>',
  in:'<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  out:'<path d="M12 15V3M7 8l5-5 5 5M4 21h16"/>',
  history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"/>',
  report:'<path d="M6 3h9l5 5v13H6zM14 3v6h6M9 14h8M9 18h8"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'
};
const icon = n => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;

/* ---------- Routing ---------- */
const ROUTES = {
  dashboard: {title:'Dashboard',          icon:'dashboard', render:pageDashboard},
  barang:    {title:'Data Barang',        icon:'box',       render:pageBarang},
  kategori:  {title:'Kategori',           icon:'tag',       render:pageKategori},
  masuk:     {title:'Stok Masuk',         icon:'in',        render:() => pageStok('masuk')},
  keluar:    {title:'Stok Keluar',        icon:'out',       render:() => pageStok('keluar')},
  riwayat:   {title:'Riwayat Transaksi',  icon:'history',   render:pageRiwayat},
  laporan:   {title:'Laporan',            icon:'report',    render:pageLaporan},
  profil:    {title:'Profil',             icon:'user',      render:pageProfil}
};

function buildNav() {
  const n = lowItems().length;
  const link = k => `<a href="#/${k}" data-route="${k}">${icon(ROUTES[k].icon)}<span>${ROUTES[k].title}</span>${k === 'dashboard' && n ? `<span class="nav-badge" title="Barang stok menipis">${n}</span>` : ''}</a>`;
  $('#nav').innerHTML =
    link('dashboard') + '<div class="nav-sep"></div>' +
    ['barang','kategori'].map(link).join('') + '<div class="nav-sep"></div>' +
    ['masuk','keluar','riwayat'].map(link).join('') + '<div class="nav-sep"></div>' +
    ['laporan','profil'].map(link).join('');
}

function route() {
  if (!currentUser()) return showLogin();
  const key = (location.hash.replace(/^#\/?/, '') || 'dashboard');
  const r = ROUTES[key] || ROUTES.dashboard;
  const k = ROUTES[key] ? key : 'dashboard';
  buildNav();
  $$('#nav a').forEach(a => a.classList.toggle('active', a.dataset.route === k));
  $('#pageTitle').textContent = r.title;
  document.title = r.title + ' — StokKu';
  r.render();
  closeSidebar();
  window.scrollTo(0, 0);
}

/* ---------- Login / logout (FR-01) ---------- */
function showLogin() {
  $('#appShell').hidden = true; $('#loginScreen').hidden = false;
  document.title = 'Masuk — StokKu';
}
function showApp() {
  $('#loginScreen').hidden = true; $('#appShell').hidden = false;
  const u = currentUser();
  $('#whoName').textContent = u.nama;
  $('#whoAvatar').textContent = u.nama.charAt(0).toUpperCase();
  $('#todayLabel').textContent = new Date().toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
}

$('#loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const user = $('#loginUser').value.trim(), pass = $('#loginPass').value;
  const err = $('#loginError');
  if (!user || !pass) { err.textContent = 'Isi username dan kata sandi.'; err.hidden = false; return; }
  const u = db.users.find(x => x.username === user && x.password === pass);
  if (!u) { err.textContent = 'Username atau kata sandi salah.'; err.hidden = false; return; }
  err.hidden = true;
  sessionStorage.setItem(SESSION_KEY, u.id);
  $('#loginForm').reset();
  showApp();
  location.hash = '#/dashboard';
  route();
});
$('#logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  location.hash = '';
  showLogin();
  toast('Anda sudah keluar.');
});

/* ---------- Sidebar mobile ---------- */
function closeSidebar() { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('show'); }
$('#menuBtn').addEventListener('click', () => { $('#sidebar').classList.add('open'); $('#scrim').classList.add('show'); });
$('#scrim').addEventListener('click', closeSidebar);

/* ---------- Modal events ---------- */
$('#modalClose').addEventListener('click', closeModal);
$('#modalCancel').addEventListener('click', closeModal);
$('#modalForm').addEventListener('submit', e => { e.preventDefault(); if (modalHandler) modalHandler(e.target); });

/* =========================================================
   HALAMAN: DASHBOARD (FR-02, FR-12)
   ========================================================= */
function monthRange() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), 1);
}

function pageDashboard() {
  const items = activeItems();
  const low = lowItems();
  const start = monthRange();
  const bulanIni = db.transactions.filter(t => new Date(t.tanggal) >= start);
  const masuk = bulanIni.filter(t => t.jenis === 'masuk').reduce((s, t) => s + t.jumlah, 0);
  const keluar = bulanIni.filter(t => t.jenis === 'keluar').reduce((s, t) => s + t.jumlah, 0);
  const nilai = items.reduce((s, i) => s + i.stok * i.hargaBeli, 0);
  const recent = [...db.transactions].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 6);

  $('#view').innerHTML = `
    <div class="grid-stats">
      <div class="stat"><div class="label">Jenis barang aktif</div><div class="num">${angka(items.length)}</div><div class="sub">Nilai persediaan ${rupiah(nilai)}</div></div>
      <div class="stat warn"><div class="label">Stok menipis</div><div class="num">${angka(low.length)}</div><div class="sub">${low.length ? 'Perlu segera dipesan' : 'Semua stok aman'}</div></div>
      <div class="stat in"><div class="label">Barang masuk bulan ini</div><div class="num">${angka(masuk)}</div><div class="sub">unit diterima</div></div>
      <div class="stat out"><div class="label">Barang keluar bulan ini</div><div class="num">${angka(keluar)}</div><div class="sub">unit dikeluarkan</div></div>
    </div>

    <div class="grid-2">
      <section class="panel">
        <div class="panel-head">
          <h2>Pergerakan stok 7 hari terakhir</h2>
          <div class="legend"><span><i style="background:var(--good)"></i>Masuk</span><span><i style="background:var(--bad)"></i>Keluar</span></div>
        </div>
        ${chart7Hari()}
      </section>

      <section class="panel">
        <div class="panel-head"><h2>Perlu dipesan ulang</h2><a class="btn sm" href="#/masuk">Catat stok masuk</a></div>
        ${low.length ? `<ul class="alert-list">${low.slice(0, 6).map(i => `
          <li>
            <div><b>${esc(i.nama)}</b><small>${esc(getCat(i.idKategori)?.nama || '-')} · batas minimum ${angka(i.stokMin)}</small>
              <div class="meter"><i class="${i.stok === 0 ? 'zero' : ''}" style="width:${Math.min(100, i.stok / (i.stokMin || 1) * 100)}%"></i></div></div>
            <div><span class="badge ${stockState(i)}">${i.stok === 0 ? 'Habis' : angka(i.stok) + ' tersisa'}</span></div>
          </li>`).join('')}</ul>
          ${low.length > 6 ? `<p class="hint">dan ${low.length - 6} barang lainnya. <a href="#/barang">Lihat semua</a></p>` : ''}`
        : `<div class="empty"><b>Semua stok aman</b>Tidak ada barang di bawah batas minimum.</div>`}
      </section>
    </div>

    <section class="panel">
      <div class="panel-head"><h2>Transaksi terbaru</h2><a class="btn sm" href="#/riwayat">Lihat riwayat lengkap</a></div>
      ${tabelTransaksi(recent)}
    </section>`;
}

function chart7Hari() {
  const days = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i); days.push(d); }
  const data = days.map(d => {
    const next = new Date(d); next.setDate(next.getDate() + 1);
    const tr = db.transactions.filter(t => { const x = new Date(t.tanggal); return x >= d && x < next; });
    return {
      label: d.toLocaleDateString('id-ID', {weekday:'short', day:'numeric'}),
      in: tr.filter(t => t.jenis === 'masuk').reduce((s, t) => s + t.jumlah, 0),
      out: tr.filter(t => t.jenis === 'keluar').reduce((s, t) => s + t.jumlah, 0)
    };
  });
  const max = Math.max(10, ...data.flatMap(d => [d.in, d.out]));
  const W = 560, H = 230, L = 36, B = 28, T = 10, ch = H - B - T, cw = W - L - 8, g = cw / data.length, bw = Math.min(22, g / 3);
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik batang barang masuk dan keluar 7 hari terakhir">`;
  for (let i = 0; i <= 4; i++) {
    const y = T + ch - (ch * i / 4), v = Math.round(max * i / 4);
    s += `<line x1="${L}" x2="${W - 8}" y1="${y}" y2="${y}" stroke="#e3e6e4"/><text x="${L - 6}" y="${y + 4}" text-anchor="end">${v}</text>`;
  }
  data.forEach((d, i) => {
    const cx = L + g * i + g / 2;
    const hIn = ch * d.in / max, hOut = ch * d.out / max;
    s += `<rect x="${cx - bw - 1}" y="${T + ch - hIn}" width="${bw}" height="${hIn}" rx="3" fill="#1d7a3e"><title>${d.label}: masuk ${d.in}</title></rect>`;
    s += `<rect x="${cx + 1}" y="${T + ch - hOut}" width="${bw}" height="${hOut}" rx="3" fill="#b3372b"><title>${d.label}: keluar ${d.out}</title></rect>`;
    s += `<text x="${cx}" y="${H - 8}" text-anchor="middle">${d.label}</text>`;
  });
  return s + '</svg>';
}

function tabelTransaksi(list) {
  if (!list.length) return `<div class="empty"><b>Belum ada transaksi</b>Catat stok masuk atau keluar untuk mulai.</div>`;
  return `<div class="table-wrap"><table>
    <thead><tr><th>Tanggal</th><th>Barang</th><th>Jenis</th><th class="num">Jumlah</th><th>Admin</th><th>Keterangan</th></tr></thead>
    <tbody>${list.map(t => {
      const it = getItem(t.idBarang);
      return `<tr>
        <td>${fmtTgl(t.tanggal)}</td>
        <td>${esc(it?.nama || '(barang dihapus)')}</td>
        <td><span class="badge ${t.jenis === 'masuk' ? 'in' : 'out'}">${t.jenis === 'masuk' ? 'Masuk' : 'Keluar'}</span></td>
        <td class="num ${t.jenis === 'masuk' ? 'plus' : 'minus'}">${t.jenis === 'masuk' ? '+' : '−'}${angka(t.jumlah)}</td>
        <td>${esc(getUser(t.idUser)?.nama || '-')}</td>
        <td class="wrap">${esc(t.keterangan || '-')}</td></tr>`;
    }).join('')}</tbody></table></div>`;
}

/* =========================================================
   HALAMAN: DATA BARANG (FR-03 s.d. FR-06)
   ========================================================= */
const uiBarang = {q:'', kat:'', status:'1', stok:'', sort:'kode', dir:1};

function pageBarang() {
  const u = uiBarang;
  $('#view').innerHTML = `
    <section class="panel">
      <div class="toolbar">
        <div class="grow"><input type="search" id="bq" placeholder="Cari nama atau kode barang…" value="${esc(u.q)}" aria-label="Cari barang"></div>
        <select id="bkat" aria-label="Filter kategori"><option value="">Semua kategori</option>
          ${db.categories.map(c => `<option value="${c.id}" ${String(u.kat) === String(c.id) ? 'selected' : ''}>${esc(c.nama)}</option>`).join('')}</select>
        <select id="bstok" aria-label="Filter kondisi stok">
          <option value="">Semua kondisi stok</option>
          <option value="low" ${u.stok === 'low' ? 'selected' : ''}>Stok menipis / habis</option>
          <option value="ok" ${u.stok === 'ok' ? 'selected' : ''}>Stok aman</option></select>
        <select id="bstatus" aria-label="Filter status">
          <option value="1" ${u.status === '1' ? 'selected' : ''}>Aktif</option>
          <option value="0" ${u.status === '0' ? 'selected' : ''}>Nonaktif</option>
          <option value="" ${u.status === '' ? 'selected' : ''}>Semua status</option></select>
        <button class="btn primary" id="addItem" type="button">+ Tambah barang</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th data-sort="kode">Kode</th><th data-sort="nama">Nama barang</th><th data-sort="kategori">Kategori</th>
            <th class="num" data-sort="hargaBeli">Harga beli</th><th class="num" data-sort="hargaJual">Harga jual</th>
            <th class="num" data-sort="stok">Stok</th><th class="num">Min.</th><th>Kondisi</th><th></th>
          </tr></thead>
          <tbody id="barangBody"></tbody>
        </table>
      </div>
      <p class="hint" id="barangCount"></p>
    </section>`;

  $('#bq').addEventListener('input', e => { u.q = e.target.value; drawBarang(); });
  $('#bkat').addEventListener('change', e => { u.kat = e.target.value; drawBarang(); });
  $('#bstok').addEventListener('change', e => { u.stok = e.target.value; drawBarang(); });
  $('#bstatus').addEventListener('change', e => { u.status = e.target.value; drawBarang(); });
  $('#addItem').addEventListener('click', () => formBarang());
  $$('th[data-sort]').forEach(th => th.addEventListener('click', () => {
    u.dir = (u.sort === th.dataset.sort) ? -u.dir : 1; u.sort = th.dataset.sort; drawBarang();
  }));
  $('#barangBody').addEventListener('click', onBarangAction);
  drawBarang();
}

function drawBarang() {
  const u = uiBarang, q = u.q.trim().toLowerCase();
  let list = db.items.filter(i =>
    (!q || i.nama.toLowerCase().includes(q) || i.kode.toLowerCase().includes(q)) &&
    (!u.kat || String(i.idKategori) === String(u.kat)) &&
    (u.status === '' || String(i.status) === u.status) &&
    (!u.stok || (u.stok === 'low' ? isLow(i) : !isLow(i))));
  const val = i => u.sort === 'kategori' ? (getCat(i.idKategori)?.nama || '') : i[u.sort];
  list.sort((a, b) => { const x = val(a), y = val(b); return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y), 'id')) * u.dir; });

  $$('th[data-sort]').forEach(th => th.textContent = th.textContent.replace(/ [▲▼]$/, '') + (th.dataset.sort === u.sort ? (u.dir > 0 ? ' ▲' : ' ▼') : ''));

  $('#barangBody').innerHTML = list.length ? list.map(i => `
    <tr class="${i.status ? (i.stok === 0 ? 'empty-row' : isLow(i) ? 'low' : '') : 'off'}">
      <td>${esc(i.kode)}</td>
      <td><b>${esc(i.nama)}</b></td>
      <td>${esc(getCat(i.idKategori)?.nama || '-')}</td>
      <td class="num">${rupiah(i.hargaBeli)}</td>
      <td class="num">${rupiah(i.hargaJual)}</td>
      <td class="num"><b>${angka(i.stok)}</b></td>
      <td class="num">${angka(i.stokMin)}</td>
      <td>${i.status ? `<span class="badge ${stockState(i)}">${stockLabel(i)}</span>` : '<span class="badge off">Nonaktif</span>'}</td>
      <td class="actions">
        <button class="btn sm" data-act="edit" data-id="${i.id}" type="button">Ubah</button>
        <button class="btn sm" data-act="toggle" data-id="${i.id}" type="button">${i.status ? 'Nonaktifkan' : 'Aktifkan'}</button>
      </td></tr>`).join('')
    : `<tr><td colspan="9"><div class="empty"><b>Barang tidak ditemukan</b>Ubah kata kunci atau filter, atau tambah barang baru.</div></td></tr>`;
  $('#barangCount').textContent = `Menampilkan ${list.length} dari ${db.items.length} barang.`;
}

async function onBarangAction(e) {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const it = getItem(Number(b.dataset.id));
  if (b.dataset.act === 'edit') return formBarang(it);
  if (b.dataset.act === 'toggle') {
    if (it.status) {
      const ok = await confirmBox(`"${it.nama}" tidak akan tampil di daftar aktif dan tidak bisa dipilih untuk transaksi. Riwayat tetap tersimpan.`, {title:'Nonaktifkan barang?', yes:'Nonaktifkan'});
      if (!ok) return;
    }
    it.status = it.status ? 0 : 1; saveDB();
    toast(it.status ? 'Barang diaktifkan.' : 'Barang dinonaktifkan.', 'ok');
    buildNav(); drawBarang();
  }
}

function formBarang(it) {
  const edit = !!it;
  const cats = (edit ? db.categories.filter(c => c.status === 1 || c.id === it.idKategori) : activeCats());
  if (!cats.length) return toast('Tambah kategori aktif terlebih dahulu.', 'err');
  const nextKode = 'BRG-' + String(nextId(db.items)).padStart(3, '0');
  openModal(edit ? 'Ubah barang' : 'Tambah barang', `
    <div class="row2">
      <label class="field"><span>Kode barang</span><input name="kode" value="${esc(edit ? it.kode : nextKode)}" maxlength="30" required></label>
      <label class="field"><span>Kategori</span><select name="kat" required>
        ${cats.map(c => `<option value="${c.id}" ${edit && it.idKategori === c.id ? 'selected' : ''}>${esc(c.nama)}</option>`).join('')}</select></label>
    </div>
    <label class="field"><span>Nama barang</span><input name="nama" value="${esc(edit ? it.nama : '')}" maxlength="150" required></label>
    <div class="row2">
      <label class="field"><span>Harga beli (Rp)</span><input name="hb" type="number" min="0" step="100" value="${edit ? it.hargaBeli : ''}" required></label>
      <label class="field"><span>Harga jual (Rp)</span><input name="hj" type="number" min="0" step="100" value="${edit ? it.hargaJual : ''}" required></label>
    </div>
    <div class="row2">
      <label class="field"><span>${edit ? 'Stok saat ini' : 'Stok awal'}</span>
        <input name="stok" type="number" min="0" step="1" value="${edit ? it.stok : 0}" ${edit ? 'disabled' : ''} required>
        ${edit ? '<small>Ubah stok lewat menu Stok Masuk atau Stok Keluar agar tercatat.</small>' : ''}</label>
      <label class="field"><span>Stok minimum</span><input name="min" type="number" min="0" step="1" value="${edit ? it.stokMin : 10}" required>
        <small>Peringatan muncul saat stok sama dengan atau di bawah angka ini.</small></label>
    </div>`,
  form => {
    const f = form.elements;
    const kode = f.kode.value.trim(), nama = f.nama.value.trim();
    let ok = true;
    ok = setErr(f.kode, !kode ? 'Kode wajib diisi.' : db.items.some(x => x.kode.toLowerCase() === kode.toLowerCase() && (!edit || x.id !== it.id)) ? 'Kode sudah dipakai barang lain.' : '') && ok;
    ok = setErr(f.nama, !nama ? 'Nama barang wajib diisi.' : '') && ok;
    ok = setErr(f.hb, f.hb.value === '' || +f.hb.value < 0 ? 'Isi harga beli (0 atau lebih).' : '') && ok;
    ok = setErr(f.hj, f.hj.value === '' || +f.hj.value < 0 ? 'Isi harga jual (0 atau lebih).' : '') && ok;
    if (!edit) ok = setErr(f.stok, f.stok.value === '' || +f.stok.value < 0 || !Number.isInteger(+f.stok.value) ? 'Stok awal harus bilangan bulat 0 atau lebih.' : '') && ok;
    ok = setErr(f.min, f.min.value === '' || +f.min.value < 0 || !Number.isInteger(+f.min.value) ? 'Stok minimum harus bilangan bulat 0 atau lebih.' : '') && ok;
    if (!ok) return;

    if (edit) {
      Object.assign(it, {kode, nama, idKategori:+f.kat.value, hargaBeli:+f.hb.value, hargaJual:+f.hj.value, stokMin:+f.min.value});
      toast('Perubahan barang disimpan.', 'ok');
    } else {
      const baru = {id:nextId(db.items), kode, nama, idKategori:+f.kat.value, hargaBeli:+f.hb.value, hargaJual:+f.hj.value, stok:+f.stok.value, stokMin:+f.min.value, status:1};
      db.items.push(baru);
      if (baru.stok > 0) db.transactions.push({id:nextId(db.transactions), idBarang:baru.id, idUser:currentUser().id, jenis:'masuk', jumlah:baru.stok, tanggal:new Date().toISOString(), keterangan:'Stok awal'});
      toast('Barang baru ditambahkan.', 'ok');
    }
    saveDB(); closeModal(); buildNav(); drawBarang();
  }, edit ? 'Simpan perubahan' : 'Tambah barang');
}

/* =========================================================
   HALAMAN: KATEGORI (FR-07)
   ========================================================= */
function pageKategori() {
  $('#view').innerHTML = `
    <section class="panel">
      <div class="toolbar"><div class="grow"></div><button class="btn primary" id="addCat" type="button">+ Tambah kategori</button></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Nama kategori</th><th>Deskripsi</th><th class="num">Jumlah barang</th><th>Status</th><th></th></tr></thead>
        <tbody id="catBody"></tbody></table></div>
    </section>`;
  $('#addCat').addEventListener('click', () => formKategori());
  $('#catBody').addEventListener('click', async e => {
    const b = e.target.closest('button[data-act]'); if (!b) return;
    const c = getCat(Number(b.dataset.id));
    if (b.dataset.act === 'edit') return formKategori(c);
    if (c.status) {
      const n = db.items.filter(i => i.idKategori === c.id && i.status).length;
      const ok = await confirmBox(n ? `${n} barang aktif masih memakai kategori "${c.nama}". Barang tetap tampil, tetapi kategori ini tidak bisa dipilih untuk barang baru.` : `Kategori "${c.nama}" tidak akan bisa dipilih lagi.`, {title:'Nonaktifkan kategori?', yes:'Nonaktifkan'});
      if (!ok) return;
    }
    c.status = c.status ? 0 : 1; saveDB(); toast(c.status ? 'Kategori diaktifkan.' : 'Kategori dinonaktifkan.', 'ok'); drawKategori();
  });
  drawKategori();
}
function drawKategori() {
  $('#catBody').innerHTML = db.categories.length ? db.categories.map(c => {
    const n = db.items.filter(i => i.idKategori === c.id).length;
    return `<tr class="${c.status ? '' : 'off'}"><td><b>${esc(c.nama)}</b></td><td class="wrap">${esc(c.deskripsi || '-')}</td>
      <td class="num">${n}</td><td><span class="badge ${c.status ? 'ok' : 'off'}">${c.status ? 'Aktif' : 'Nonaktif'}</span></td>
      <td class="actions"><button class="btn sm" data-act="edit" data-id="${c.id}" type="button">Ubah</button>
      <button class="btn sm" data-act="toggle" data-id="${c.id}" type="button">${c.status ? 'Nonaktifkan' : 'Aktifkan'}</button></td></tr>`;
  }).join('') : `<tr><td colspan="5"><div class="empty"><b>Belum ada kategori</b>Tambah kategori untuk mengelompokkan barang.</div></td></tr>`;
}
function formKategori(c) {
  const edit = !!c;
  openModal(edit ? 'Ubah kategori' : 'Tambah kategori', `
    <label class="field"><span>Nama kategori</span><input name="nama" value="${esc(edit ? c.nama : '')}" maxlength="100" required></label>
    <label class="field"><span>Deskripsi (opsional)</span><textarea name="desk">${esc(edit ? c.deskripsi : '')}</textarea></label>`,
  form => {
    const f = form.elements, nama = f.nama.value.trim();
    const dup = db.categories.some(x => x.nama.toLowerCase() === nama.toLowerCase() && (!edit || x.id !== c.id));
    if (!setErr(f.nama, !nama ? 'Nama kategori wajib diisi.' : dup ? 'Nama kategori sudah ada.' : '')) return;
    if (edit) { c.nama = nama; c.deskripsi = f.desk.value.trim(); }
    else db.categories.push({id:nextId(db.categories), nama, deskripsi:f.desk.value.trim(), status:1});
    saveDB(); closeModal(); toast(edit ? 'Kategori diperbarui.' : 'Kategori ditambahkan.', 'ok'); drawKategori();
  });
}

/* =========================================================
   HALAMAN: STOK MASUK / KELUAR (FR-08, FR-09, FR-10)
   ========================================================= */
function pageStok(jenis) {
  const masuk = jenis === 'masuk';
  const items = activeItems().sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
  $('#view').innerHTML = `
    <div class="split">
      <section class="panel">
        <div class="panel-head"><h2>${masuk ? 'Catat barang masuk' : 'Catat barang keluar'}</h2></div>
        <form id="stokForm" novalidate>
          <label class="field"><span>Barang</span>
            <select name="item" required><option value="">Pilih barang…</option>
              ${items.map(i => `<option value="${i.id}">${esc(i.nama)} (${esc(i.kode)})</option>`).join('')}</select></label>
          <p class="hint" id="stokInfo" style="margin-top:-.4rem;margin-bottom:1rem"></p>
          <label class="field"><span>Jumlah</span><input name="jml" type="number" min="1" step="1" required></label>
          <label class="field"><span>Tanggal dan jam</span><input name="tgl" type="datetime-local" value="${toLocalInput(new Date())}" required></label>
          <label class="field"><span>${masuk ? 'Sumber / keterangan' : 'Tujuan / keterangan'}</span>
            <textarea name="ket" placeholder="${masuk ? 'Contoh: Pembelian dari Distributor Sentosa' : 'Contoh: Penjualan harian'}"></textarea></label>
          <button class="btn primary block" type="submit">${masuk ? 'Simpan stok masuk' : 'Simpan stok keluar'}</button>
        </form>
      </section>
      <section class="panel">
        <div class="panel-head"><h2>${masuk ? 'Penerimaan terakhir' : 'Pengeluaran terakhir'}</h2></div>
        <div id="stokRecent"></div>
      </section>
    </div>`;

  const form = $('#stokForm');
  const info = () => {
    const it = getItem(+form.elements.item.value);
    $('#stokInfo').innerHTML = it ? `Stok saat ini: <b>${angka(it.stok)}</b> · batas minimum ${angka(it.stokMin)}` : '';
  };
  const recent = () => {
    const list = db.transactions.filter(t => t.jenis === jenis).sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 8);
    $('#stokRecent').innerHTML = tabelTransaksi(list);
  };
  form.elements.item.addEventListener('change', info);
  recent();

  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = form.elements, it = getItem(+f.item.value), jml = Number(f.jml.value);
    let ok = true;
    ok = setErr(f.item, !it ? 'Pilih barang terlebih dahulu.' : '') && ok;
    ok = setErr(f.jml, !Number.isInteger(jml) || jml <= 0 ? 'Jumlah harus bilangan bulat lebih dari 0.'
        : (!masuk && it && jml > it.stok) ? `Stok tidak cukup. Stok ${it.nama} hanya ${angka(it.stok)}.` : '') && ok;
    ok = setErr(f.tgl, !f.tgl.value ? 'Isi tanggal transaksi.' : '') && ok;
    if (!ok) return;

    it.stok += masuk ? jml : -jml;
    db.transactions.push({id:nextId(db.transactions), idBarang:it.id, idUser:currentUser().id, jenis, jumlah:jml,
      tanggal:new Date(f.tgl.value).toISOString(), keterangan:f.ket.value.trim()});
    saveDB();
    toast(`${masuk ? 'Stok masuk' : 'Stok keluar'} disimpan: ${it.nama} ${masuk ? '+' : '−'}${angka(jml)}.`, 'ok');
    if (!masuk && isLow(it)) toast(it.stok === 0 ? `${it.nama} sekarang habis.` : `${it.nama} mencapai batas minimum (${angka(it.stok)} tersisa).`);
    buildNav();
    f.jml.value = ''; f.ket.value = ''; f.tgl.value = toLocalInput(new Date());
    info(); recent();
  });
}

/* =========================================================
   HALAMAN: RIWAYAT (FR-11)
   ========================================================= */
const uiRiwayat = {q:'', jenis:'', dari:'', sampai:''};
function pageRiwayat() {
  const u = uiRiwayat;
  $('#view').innerHTML = `
    <section class="panel">
      <div class="toolbar">
        <div class="grow"><input type="search" id="rq" placeholder="Cari barang atau keterangan…" value="${esc(u.q)}" aria-label="Cari transaksi"></div>
        <select id="rj" aria-label="Jenis transaksi">
          <option value="">Semua jenis</option>
          <option value="masuk" ${u.jenis === 'masuk' ? 'selected' : ''}>Masuk</option>
          <option value="keluar" ${u.jenis === 'keluar' ? 'selected' : ''}>Keluar</option></select>
        <label>Dari <input type="date" id="rd" value="${u.dari}"></label>
        <label>Sampai <input type="date" id="rs" value="${u.sampai}"></label>
      </div>
      <div id="riwayatBody"></div>
      <p class="hint" id="riwayatCount"></p>
    </section>`;
  const draw = () => {
    const q = u.q.trim().toLowerCase();
    const list = db.transactions.filter(t => {
      const it = getItem(t.idBarang);
      const d = toDateInput(new Date(t.tanggal));
      return (!q || (it?.nama || '').toLowerCase().includes(q) || (it?.kode || '').toLowerCase().includes(q) || (t.keterangan || '').toLowerCase().includes(q)) &&
        (!u.jenis || t.jenis === u.jenis) && (!u.dari || d >= u.dari) && (!u.sampai || d <= u.sampai);
    }).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    $('#riwayatBody').innerHTML = tabelTransaksi(list);
    $('#riwayatCount').textContent = `${list.length} transaksi ditemukan.`;
  };
  $('#rq').addEventListener('input', e => { u.q = e.target.value; draw(); });
  $('#rj').addEventListener('change', e => { u.jenis = e.target.value; draw(); });
  $('#rd').addEventListener('change', e => { u.dari = e.target.value; draw(); });
  $('#rs').addEventListener('change', e => { u.sampai = e.target.value; draw(); });
  draw();
}

/* =========================================================
   HALAMAN: LAPORAN (FR-13)
   ========================================================= */
const uiLaporan = {dari:'', sampai:'', kat:''};
function pageLaporan() {
  const u = uiLaporan;
  if (!u.dari) { const d = new Date(); d.setDate(1); u.dari = toDateInput(d); }
  if (!u.sampai) u.sampai = toDateInput(new Date());
  $('#view').innerHTML = `
    <section class="panel">
      <div class="toolbar no-print">
        <label>Dari <input type="date" id="ld" value="${u.dari}"></label>
        <label>Sampai <input type="date" id="ls" value="${u.sampai}"></label>
        <select id="lk" aria-label="Kategori"><option value="">Semua kategori</option>
          ${db.categories.map(c => `<option value="${c.id}" ${String(u.kat) === String(c.id) ? 'selected' : ''}>${esc(c.nama)}</option>`).join('')}</select>
        <span class="grow"></span>
        <button class="btn" id="lcsv" type="button">Unduh CSV</button>
        <button class="btn primary" id="lprint" type="button">Cetak laporan</button>
      </div>
      <div id="laporanBody"></div>
    </section>`;
  const draw = () => $('#laporanBody').innerHTML = laporanHtml();
  $('#ld').addEventListener('change', e => { u.dari = e.target.value; draw(); });
  $('#ls').addEventListener('change', e => { u.sampai = e.target.value; draw(); });
  $('#lk').addEventListener('change', e => { u.kat = e.target.value; draw(); });
  $('#lprint').addEventListener('click', () => window.print());
  $('#lcsv').addEventListener('click', downloadCSV);
  draw();
}

function laporanRows() {
  const u = uiLaporan;
  const dari = u.dari ? new Date(u.dari + 'T00:00:00') : new Date(0);
  const sampai = u.sampai ? new Date(u.sampai + 'T23:59:59.999') : new Date(8.64e15);
  return db.items.filter(i => !u.kat || String(i.idKategori) === String(u.kat)).map(i => {
    const tr = db.transactions.filter(t => t.idBarang === i.id);
    const sesudah = tr.filter(t => new Date(t.tanggal) > sampai).reduce((s, t) => s + (t.jenis === 'masuk' ? t.jumlah : -t.jumlah), 0);
    const periode = tr.filter(t => { const d = new Date(t.tanggal); return d >= dari && d <= sampai; });
    const masuk = periode.filter(t => t.jenis === 'masuk').reduce((s, t) => s + t.jumlah, 0);
    const keluar = periode.filter(t => t.jenis === 'keluar').reduce((s, t) => s + t.jumlah, 0);
    const akhir = i.stok - sesudah, awal = akhir - masuk + keluar;
    return {i, awal, masuk, keluar, akhir, nilai:akhir * i.hargaBeli};
  }).filter(r => r.i.status || r.masuk || r.keluar || r.akhir);
}

function laporanHtml() {
  const u = uiLaporan, rows = laporanRows();
  if (u.dari && u.sampai && u.dari > u.sampai) return `<div class="empty"><b>Periode tidak valid</b>Tanggal awal harus sebelum tanggal akhir.</div>`;
  const tot = rows.reduce((s, r) => ({masuk:s.masuk + r.masuk, keluar:s.keluar + r.keluar, nilai:s.nilai + r.nilai, akhir:s.akhir + r.akhir}), {masuk:0, keluar:0, nilai:0, akhir:0});
  const katNama = u.kat ? getCat(+u.kat)?.nama : 'Semua kategori';
  return `
    <div class="print-title"><h2>Laporan Stok — StokKu</h2><p>Periode ${fmtTglPendek(u.dari)} s.d. ${fmtTglPendek(u.sampai)} · ${esc(katNama)}</p></div>
    <div class="report-sum">
      <div><small>Jenis barang</small><b>${rows.length}</b></div>
      <div><small>Total masuk</small><b class="plus">+${angka(tot.masuk)}</b></div>
      <div><small>Total keluar</small><b class="minus">−${angka(tot.keluar)}</b></div>
      <div><small>Nilai persediaan akhir</small><b>${rupiah(tot.nilai)}</b></div>
    </div>
    ${rows.length ? `<div class="table-wrap"><table>
      <thead><tr><th>Kode</th><th>Barang</th><th>Kategori</th><th class="num">Stok awal</th><th class="num">Masuk</th><th class="num">Keluar</th><th class="num">Stok akhir</th><th class="num">Nilai (harga beli)</th></tr></thead>
      <tbody>${rows.map(r => `<tr>
        <td>${esc(r.i.kode)}</td><td>${esc(r.i.nama)}${r.i.status ? '' : ' <span class="badge off">Nonaktif</span>'}</td><td>${esc(getCat(r.i.idKategori)?.nama || '-')}</td>
        <td class="num">${angka(r.awal)}</td><td class="num plus">${r.masuk ? '+' + angka(r.masuk) : '0'}</td><td class="num minus">${r.keluar ? '−' + angka(r.keluar) : '0'}</td>
        <td class="num"><b>${angka(r.akhir)}</b></td><td class="num">${rupiah(r.nilai)}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td colspan="4">Total</td><td class="num">+${angka(tot.masuk)}</td><td class="num">−${angka(tot.keluar)}</td><td class="num">${angka(tot.akhir)}</td><td class="num">${rupiah(tot.nilai)}</td></tr></tfoot>
    </table></div>` : `<div class="empty"><b>Tidak ada data</b>Tidak ada barang atau transaksi pada filter ini.</div>`}`;
}

function downloadCSV() {
  const rows = laporanRows();
  const head = ['Kode','Barang','Kategori','Stok awal','Masuk','Keluar','Stok akhir','Nilai (harga beli)'];
  const q = v => '"' + String(v).replace(/"/g, '""') + '"';
  const csv = [head.map(q).join(',')].concat(rows.map(r => [r.i.kode, r.i.nama, getCat(r.i.idKategori)?.nama || '', r.awal, r.masuk, r.keluar, r.akhir, r.nilai].map(q).join(','))).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], {type:'text/csv;charset=utf-8'}));
  a.download = `laporan-stok_${uiLaporan.dari}_${uiLaporan.sampai}.csv`;
  a.click(); URL.revokeObjectURL(a.href);
  toast('Laporan CSV diunduh.', 'ok');
}

/* =========================================================
   HALAMAN: PROFIL (FR-14)
   ========================================================= */
function pageProfil() {
  const u = currentUser();
  $('#view').innerHTML = `
    <div class="grid-2" style="grid-template-columns:1fr 1fr">
      <section class="panel">
        <div class="panel-head"><h2>Data akun</h2></div>
        <form id="profilForm" novalidate>
          <label class="field"><span>Nama lengkap</span><input name="nama" value="${esc(u.nama)}" maxlength="100" required></label>
          <label class="field"><span>Username</span><input name="user" value="${esc(u.username)}" maxlength="50" required></label>
          <button class="btn primary" type="submit">Simpan profil</button>
        </form>
      </section>
      <section class="panel">
        <div class="panel-head"><h2>Ubah kata sandi</h2></div>
        <form id="passForm" novalidate>
          <label class="field"><span>Kata sandi saat ini</span><input name="lama" type="password" autocomplete="current-password" required></label>
          <label class="field"><span>Kata sandi baru</span><input name="baru" type="password" autocomplete="new-password" required><small>Minimal 6 karakter.</small></label>
          <label class="field"><span>Ulangi kata sandi baru</span><input name="ulang" type="password" autocomplete="new-password" required></label>
          <button class="btn primary" type="submit">Ubah kata sandi</button>
        </form>
      </section>
    </div>
    <section class="panel">
      <div class="panel-head"><h2>Data demo</h2></div>
      <p class="hint" style="margin-top:0">Data disimpan di browser ini. Anda bisa mengembalikannya ke data contoh awal kapan saja.</p>
      <button class="btn danger" id="resetData" type="button">Kembalikan ke data contoh</button>
    </section>`;

  $('#profilForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target.elements, nama = f.nama.value.trim(), user = f.user.value.trim();
    let ok = setErr(f.nama, !nama ? 'Nama wajib diisi.' : '');
    ok = setErr(f.user, !user ? 'Username wajib diisi.' : /\s/.test(user) ? 'Username tidak boleh memakai spasi.' : db.users.some(x => x.username === user && x.id !== u.id) ? 'Username sudah dipakai.' : '') && ok;
    if (!ok) return;
    u.nama = nama; u.username = user; saveDB(); showApp(); toast('Profil diperbarui.', 'ok');
  });
  $('#passForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target.elements;
    let ok = setErr(f.lama, f.lama.value !== u.password ? 'Kata sandi saat ini salah.' : '');
    ok = setErr(f.baru, f.baru.value.length < 6 ? 'Kata sandi baru minimal 6 karakter.' : '') && ok;
    ok = setErr(f.ulang, f.ulang.value !== f.baru.value ? 'Pengulangan kata sandi tidak sama.' : '') && ok;
    if (!ok) return;
    u.password = f.baru.value; saveDB(); e.target.reset(); toast('Kata sandi diubah.', 'ok');
  });
  $('#resetData').addEventListener('click', async () => {
    if (!await confirmBox('Semua perubahan Anda akan hilang dan diganti data contoh.', {title:'Kembalikan data contoh?', yes:'Kembalikan'})) return;
    db = seedData(); saveDB(); showApp(); toast('Data contoh dipulihkan.', 'ok'); route();
  });
}

/* ---------- Mulai ---------- */
db = loadDB();
window.addEventListener('hashchange', route);
if (currentUser()) { showApp(); route(); } else showLogin();
