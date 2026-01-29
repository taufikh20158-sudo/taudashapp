// --- FUNGSI AMBIL DATA BERDASARKAN BULAN (UNTUK KARTU) ---
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

// --- FUNGSI UTAMA RENDER DASHBOARD ---
function renderExecutiveDashboard() {
    const listRed = document.getElementById('LIST_RED');
    const listYellow = document.getElementById('LIST_YELLOW');
    const listGreen = document.getElementById('LIST_GREEN');

    if (!listRed) return;

    // 1. AMBIL DATA DARI LOCAL STORAGE
    const key = 'premiumAppData_2026';
    const saved = localStorage.getItem(key) || localStorage.getItem('appData');
    
    let tPaguTahun = 0;
    let tAcvTahun = 0;

    if (saved) {
        const allData = JSON.parse(saved);
        // Hitung akumulasi 12 bulan untuk CON1
        for (let bulan in allData) {
            if (Array.isArray(allData[bulan])) {
                allData[bulan].forEach(item => {
                    if (item.level == 0) {
                        tPaguTahun += (parseFloat(item.pagu) || 0);
                        tAcvTahun += (parseFloat(item.acv) || parseFloat(item.realisasi) || 0);
                    }
                });
            }
        }
    }

    // Update Tampilan Atas (CON1)
    updateTopStats(tPaguTahun, tAcvTahun);

    // 2. RENDER KARTU KANBAN (CON3)
    listRed.innerHTML = ""; listYellow.innerHTML = ""; listGreen.innerHTML = "";
    const dataBulanIni = muatData(); 

    dataBulanIni.forEach((item) => {
        if (!item.program && !item.nama) return;

        // Logika Level Terendah: Skip jika item ini punya anak
        const punyaAnak = dataBulanIni.some(child => String(child.parentId) === String(item.id));
        if (punyaAnak) return;

        // Cari Nama Parent (Program Utama)
        let namaParent = "PROGRAM";
        if (item.parentId) {
            let pRow = dataBulanIni.find(p => String(p.id) === String(item.parentId));
            if (pRow) {
                // Jika parent bukan level 0, cari kakeknya (level 0)
                if (pRow.level != 0 && pRow.parentId) {
                    let root = dataBulanIni.find(r => String(r.id) === String(pRow.parentId));
                    namaParent = root ? root.program : pRow.program;
                } else {
                    namaParent = pRow.program;
                }
            }
        } else {
            namaParent = "MANDIRI";
        }

        const pagu = parseFloat(item.pagu) || 0;
        const acv = parseFloat(item.acv) || parseFloat(item.realisasi) || 0;
        const pct = pagu > 0 ? (acv / pagu) * 100 : 0;

        const cardHTML = `
            <div class="k-card" style="border-left: 5px solid ${pct < 95 ? '#e74c3c' : pct < 100 ? '#f39c12' : '#27ae60'}; margin-bottom:15px;">
                <div class="k-info">
                    <div style="font-size: 8px; font-weight: 800; color: #8da2b5; text-transform: uppercase; margin-bottom: 4px;">
                        📂 ${namaParent}
                    </div>
                    <span class="k-name" style="font-size: 13px; font-weight: 700;">${item.program || item.nama}</span>
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

        if (pct < 95) listRed.innerHTML += cardHTML;
        else if (pct < 100) listYellow.innerHTML += cardHTML;
        else listGreen.innerHTML += cardHTML;
    });
}

// --- FUNGSI UPDATE STATISTIK TAHUNAN ---
function updateTopStats(p, a) {
    const pct = p > 0 ? (a / p) * 100 : 0;
    const fmt = (v) => "Rp " + Math.floor(v).toLocaleString('id-ID');

    if (document.getElementById('VIEW_PAGU_TOTAL')) document.getElementById('VIEW_PAGU_TOTAL').innerText = fmt(p);
    if (document.getElementById('VIEW_ACV_TOTAL')) document.getElementById('VIEW_ACV_TOTAL').innerText = fmt(a);
    if (document.getElementById('VIEW_PCT_TOTAL')) document.getElementById('VIEW_PCT_TOTAL').innerText = pct.toFixed(2) + "%";
}

// --- JALANKAN SAAT START ---
document.addEventListener('DOMContentLoaded', renderExecutiveDashboard);
