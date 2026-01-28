function muatData() {
    const key = 'premiumAppData_2026';
    const saved = localStorage.getItem(key) || localStorage.getItem('appData');
    if (!saved) return [];

    try {
        const parsed = JSON.parse(saved);
        const selBulan = document.getElementById('SL_BULAN_DASH');
        const bulan = selBulan ? selBulan.value : "Januari";
        return parsed[bulan] || [];
    } catch (e) {
        return [];
    }
}
function renderExecutiveDashboard() {
    const listRed = document.getElementById('LIST_RED');
    const listYellow = document.getElementById('LIST_YELLOW');
    const listGreen = document.getElementById('LIST_GREEN');

    if (!listRed) return;

    // Reset isi kolom
    listRed.innerHTML = ""; listYellow.innerHTML = ""; listGreen.innerHTML = "";

    const dataBulanIni = muatData();
    let tPagu = 0; let tAcv = 0;

    dataBulanIni.forEach((item) => {
        // --- FUNGSI PEMBERSIH ANGKA TOTAL ---
        const toNum = (v) => {
            if (!v) return 0;
            if (typeof v === 'number') return v;
            // Hapus titik, hapus spasi, hapus Rp, ganti koma ke titik
            let clean = v.toString().replace(/Rp/g, '').replace(/\./g, '').replace(/,/g, '.').trim();
            return parseFloat(clean) || 0;
        };

        const pagu = toNum(item.pagu);
        const acv = toNum(item.acv) || toNum(item.realisasi);
        const nama = item.program || item.nama || "Tanpa Nama";
        const level = item.level ?? 0;

        // Hitung Persentase
        const pct = pagu > 0 ? (acv / pagu) * 100 : 0;
        
        // Akumulasi Statistik Atas (Level 0)
        if (level === 0) {
            tPagu += pagu; 
            tAcv += acv;
        }

        // --- RENDER KARTU (TANPA FILTER IF PAGU > 0) ---
        // Kita keluarkan semua data agar tidak ada yang hilang
        const cardHTML = `
            <div class="k-card" style="border-left: 5px solid ${pct < 95 ? '#e74c3c' : pct < 100 ? '#f39c12' : '#27ae60'}">
                <div class="k-info">
                    <span class="k-name">${nama}</span>
                    <div style="font-size: 10px; color: #8e9aaf; margin-top:5px;">
                        Pagu: Rp ${pagu.toLocaleString('id-ID')}
                    </div>
                </div>
                <div style="text-align: right;">
                    <span class="k-pct" style="color: ${pct < 95 ? '#e74c3c' : pct < 100 ? '#f39c12' : '#27ae60'}">
                        ${pct.toFixed(1)}%
                    </span>
                    <div style="font-size: 9px; color: #bbb;">Real: ${acv.toLocaleString('id-ID')}</div>
                </div>
            </div>
        `;

        // Masukkan ke kolom berdasarkan persentase
        if (pct < 95) {
            listRed.innerHTML += cardHTML;
        } else if (pct < 100) {
            listYellow.innerHTML += cardHTML;
        } else {
            listGreen.innerHTML += cardHTML;
        }
    });

    updateTopStats(tPagu, tAcv);
}
//------------------------------
function updateTopStats(p, a) {
    const pct = p > 0 ? (a / p) * 100 : 0;
    const fmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

    if (document.getElementById('VIEW_PAGU_TOTAL')) document.getElementById('VIEW_PAGU_TOTAL').innerText = fmt.format(p);
    if (document.getElementById('VIEW_ACV_TOTAL')) document.getElementById('VIEW_ACV_TOTAL').innerText = fmt.format(a);
    if (document.getElementById('VIEW_PCT_TOTAL')) document.getElementById('VIEW_PCT_TOTAL').innerText = pct.toFixed(2) + "%";
}

// Jalankan fungsi
document.addEventListener('DOMContentLoaded', renderExecutiveDashboard);
window.onload = renderExecutiveDashboard; // Jalankan lagi saat semua aset siap