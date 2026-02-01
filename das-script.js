function renderTable() {
    calculateHierarchy(); 
    const tableBody = document.querySelector('.main-table tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    // ... (kode render table Anda tetap di sini) ...

    // Panggil fungsi dashboard di akhir render table
    if (typeof renderExecutiveMonitoring === 'function') {
        renderExecutiveMonitoring();
    }
}
// --- FUNGSI TAMPIL OTOMATIS SAAT HALAMAN DIMUAT ---
window.addEventListener('DOMContentLoaded', () => {
    // Beri sedikit delay agar script.js selesai memproses data awal
    setTimeout(() => {
        renderExecutiveMonitoring();
    }, 100);
});
// --- FUNGSI DAS2 ------------------------------------------------------
function renderExecutiveMonitoring() {
    const monthSelect = document.getElementById('SL_BULAN_DASH');
    if (monthSelect) currentMonth = monthSelect.value;

    const container = document.querySelector('.con3-content');
    if (!container) return;
    container.innerHTML = ""; 

    const dataBulanIni = appData[currentMonth] || [];

    // KUNCINYA: Iterasi data asli dari urutan pertama sampai terakhir
    for (let i = 0; i < dataBulanIni.length; i++) {
        const item = dataBulanIni[i];

        // Hanya buat kartu jika kita menemukan Level 2 (Program)
        if (String(item.level) === "2") {
            const l2 = item;
            
            // Cari kakek dan bapak (Level 0 & 1)
            const l1 = dataBulanIni.find(p => String(p.id) === String(l2.parentId));
            const l0 = l1 ? dataBulanIni.find(p => String(p.id) === String(l1.parentId)) : null;

            let htmlContentL3 = "";
            let hasValidChild = false;
            let tPagu = 0, tAcv = 0;

            // Cari Level 3 yang merupakan anak dari L2 ini
            const anakL3 = dataBulanIni.filter(l3 => String(l3.parentId) === String(l2.id));

            anakL3.forEach(l3 => {
                // Cari Level 4 yang merupakan anak dari L3 ini
                const cucuL4 = dataBulanIni.filter(l4 => String(l4.parentId) === String(l3.id));
                let htmlContentL4 = "";

                cucuL4.forEach(l4 => {
                    const p = parseFloat(l4.pagu) || 0;
                    const a = parseFloat(l4.acv) || 0;

                    if (p > 0) {
                        hasValidChild = true;
                        tPagu += p; tAcv += a;
                        const pct = (a / p) * 100;

                        htmlContentL4 += `
                            <div style="margin-bottom:6px; padding:6px 0; border-bottom:1px solid #f1f5f9;">
                                <div style="font-size:10px; font-weight:700; color:#334155;">${l4.program}</div>
                                <div style="display:flex; gap:12px; font-size:10px;">
                                    <div class="l4-item"><span class="l4-label">Pagu</span><span class="l4-value">${p.toLocaleString('id-ID')}</span></div>
                                    <div class="l4-item"><span class="l4-label">Real</span><span class="l4-value" style="color:#2563eb;">${a.toLocaleString('id-ID')}</span></div>
                                    <div class="l4-item"><span class="l4-label">Sisa</span><span class="l4-value" style="color:#dc2626;">${(p-a).toLocaleString('id-ID')}</span></div>
                                    <div class="l4-item"><span class="l4-label">%</span><span class="l4-value" style="color:#059669;">${pct.toFixed(1)}%</span></div>
                                </div>
                            </div>`;
                    }
                });

                if (htmlContentL4 !== "") {
                    htmlContentL3 += `
                        <div style="margin-top:8px; padding-left:10px; border-left:2px solid #e2e8f0; text-align:left;">
                            <div style="font-size:9px; font-weight:800; color:#64748b; text-transform:uppercase;">  ${l3.program}</div>
                            ${htmlContentL4}
                        </div>`;
                }
            });

            // Jika ada rincian yang valid, cetak kartunya
            if (hasValidChild) {
                const tPct = tPagu > 0 ? (tAcv / tPagu) * 100 : 0;
                const card = `
                    <div class="monitoring-card">
                        <div class="l2-header-row" style="border:none; align-items: center;">
                            <div class="l2-title-area">
                                <div style="font-size:10px; font-weight:800; color:#b45309;">${l0 ? l0.kode : '---'}</div>
                                <div style="font-size:9px; color:#94a3b8; font-weight:600; text-transform:uppercase; margin-bottom:2px;">${l1 ? l1.program : '---'}</div>
                                <div style="font-size:13px; font-weight:900; color:#1e293b; text-transform:uppercase;">${l2.program}</div>
                            </div>
                            <div class="l2-summary-aside">
                                <div class="l2-stat-item stat-pagu"><span class="l2-stat-label">Total Pagu</span><span class="l2-stat-value">${tPagu.toLocaleString('id-ID')}</span></div>
                                <div class="l2-stat-item stat-real"><span class="l2-stat-label">Realisasi</span><span class="l2-stat-value" style="color:#2563eb;">${tAcv.toLocaleString('id-ID')}</span></div>
                                <div class="l2-stat-item stat-sisa"><span class="l2-stat-label">Sisa</span><span class="l2-stat-value" style="color:#dc2626;">${(tPagu-tAcv).toLocaleString('id-ID')}</span></div>
                                <div class="l2-stat-item stat-pct"><span class="l2-stat-label">Capaian</span><span class="l2-stat-value pct-value">${tPct.toFixed(1)}%</span></div>
                            </div>
                        </div>
                        <div style="margin-top:5px; background:#fbfcfd; border-radius:12px; padding:10px; border:1px solid #f1f5f9;">
                            ${htmlContentL3}
                        </div>
                    </div>`;
                container.insertAdjacentHTML('beforeend', card);
            }
        }
    }
}
// --- 3. RENDER BULAN ----------------------------------------------------------
// Tambahkan di dalam initGlobalListeners() Anda yang sudah ada
function initGlobalListeners() {
    // ... bagian pencarian ...

    const monthSelect = document.querySelector('.month-selector select');
    if (monthSelect) {
        monthSelect.addEventListener('change', function() {
            currentMonth = this.value; 
            renderTable(); // Ini akan memicu calculateHierarchy & render laporannya
            
            // Tambahkan ini sebagai pengaman tambahan
            if (typeof renderExecutiveMonitoring === 'function') {
                renderExecutiveMonitoring();
            }
        });
    }
}
// --- 3. EXPORT PDF (SESUAI ID MASTERMAIN) ----------------------------------------------------------
function exportToPDF() {
    const element = document.querySelector('.con3-content');
    const selBulan = document.getElementById('SL_BULAN_DASH');
    const bulanPilihan = (selBulan ? selBulan.value : "Januari").toUpperCase();

    if (!element) return;

    const sekarang = new Date();
    const tgl = sekarang.getDate();
    const thn = sekarang.getFullYear();
    const daftarBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                         "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const bulanSekarang = daftarBulan[sekarang.getMonth()];

    const opt = {
        margin:       [10, 10, 10, 10], // Margin lebih tipis
        filename:     `LAPORAN_RPD_${bulanPilihan}_${thn}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true,
            letterRendering: true // Membuat teks lebih tajam meski kecil
        },
        // Ubah ke Portrait agar muat lebih banyak baris dalam satu halaman
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // --- HEADER LEBIH RINGKAS ---
    const headerPDF = document.createElement('div');
    headerPDF.className = "pdf-only-header";
    headerPDF.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 15px; font-family: 'Poppins', sans-serif;">
            <h3 style="margin: 0; font-weight: 900; font-size: 16px;">LAPORAN RENCANA PENARIKAN DANA (RPD)</h3>
            <p style="margin: 2px 0; font-size: 11px; color: #444;">
                DICETAK: ${tgl} ${bulanSekarang.toUpperCase()} ${thn} | PERIODE: ${bulanPilihan} ${thn}
            </p>
        </div>
    `;
    
    element.prepend(headerPDF);
    const btn = document.querySelector('.btn-export-pdf');
    const originalText = btn.innerText;
    btn.innerText = "Processing...";

    html2pdf().set(opt).from(element).save().then(() => {
        element.removeChild(headerPDF);
        btn.innerText = originalText;
    });
}
/**
 * FUNGSI LOGOUT GLOBAL
 */
// 1. Fungsi saat tombol KELUAR di klik
function logoutSession() {
    const modal = document.getElementById('LOGOUT_MODAL');
    modal.classList.add('active');
}

// 2. Fungsi saat klik BATAL
function closeLogoutModal() {
    const modal = document.getElementById('LOGOUT_MODAL');
    modal.classList.remove('active');
}

// 3. Fungsi saat klik YA, KELUAR
function confirmLogout() {
    // Hapus Kunci Akses
    localStorage.removeItem('isLoggedIn_2026');
    
    // Animasi Keluar
    document.querySelector('.modal-card').style.transform = "scale(0.9)";
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.5s ease";

    setTimeout(() => {
        window.location.replace("login.html");
    }, 500);
}
