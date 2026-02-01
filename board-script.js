/**
 * BOARD-SCRIPT.JS
 * Sistem Agregasi Executive Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
    renderExecutiveDashboard();
});

/**
 * FUNGSI UTAMA: RENDER EXECUTIVE DASHBOARD
 */
function renderExecutiveDashboard() {
    const savedData = localStorage.getItem('premiumAppData_2026');
    const appData = savedData ? JSON.parse(savedData) : null;

    if (!appData) return;

    let totalTahunan = { pagu: 0, real: 0 };
    let jenisBelanja = {
        pegawai: { pagu: 0, real: 0 }, 
        barang: { pagu: 0, real: 0 },  
        modal: { pagu: 0, real: 0 }    
    };
    let sumberDana = {
        rm: { pagu: 0, real: 0 },
        pnbp: { pagu: 0, real: 0 }
    };

    Object.keys(appData).forEach(bulan => {
        appData[bulan].forEach(row => {
            const valPagu = parseFloat(row.pagu) || 0;
            const valReal = parseFloat(row.acv) || 0;
            const kodeStr = String(row.kode || "");

            if (row.level === 0) {
                totalTahunan.pagu += valPagu;
                totalTahunan.real += valReal;
            }

            if (row.level === 3) {
                // Logika CON2 (Jenis Belanja)
                if (kodeStr.startsWith('51')) {
                    jenisBelanja.pegawai.pagu += valPagu;
                    jenisBelanja.pegawai.real += valReal;
                } else if (kodeStr.startsWith('52')) {
                    jenisBelanja.barang.pagu += valPagu;
                    jenisBelanja.barang.real += valReal;
                } else if (kodeStr.startsWith('53')) {
                    jenisBelanja.modal.pagu += valPagu;
                    jenisBelanja.modal.real += valReal;
                }

                // Logika DAS3 (Sumber Dana)
                const kodeUpper = kodeStr.toUpperCase();
                if (kodeUpper.includes('RM')) {
                    sumberDana.rm.pagu += valPagu;
                    sumberDana.rm.real += valReal;
                } else if (kodeUpper.includes('PNP') || kodeUpper.includes('PNBP')) {
                    sumberDana.pnbp.pagu += valPagu;
                    sumberDana.pnbp.real += valReal;
                }
            }
        });
    });

    updateUICon1(totalTahunan);
    updateUICon2(jenisBelanja); // Mengirim data pagu & real
    updateUIDas3(sumberDana);   // Mengirim data pagu & real
    renderChart(totalTahunan);
    renderMonthlyTrend(appData);
    initDas4(appData); 
}

// ------------------------------------ DAS4 LOGIC -----------------------------------------

/**
 * FUNGSI INTEGRASI DAS4: MONITORING BULANAN DENGAN FILTER KATEGORI
 */
function initDas4(appData) {
    const selectMonth = document.getElementById('SELECT_MONTH');
    const selectCategory = document.getElementById('SELECT_CATEGORY');
    
    if (!selectMonth || !selectCategory) return;

    const monthMapping = {
        "1": "Januari", "2": "Februari", "3": "Maret", "4": "April",
        "5": "Mei", "6": "Juni", "7": "Juli", "8": "Agustus",
        "9": "September", "10": "Oktober", "11": "November", "12": "Desember"
    };

    const updateTrigger = () => {
        const selectedMonthKey = monthMapping[selectMonth.value];
        const selectedCat = selectCategory.value; // PAGU atau CAPAIAN
        calculateAndRenderDas4(appData, selectedMonthKey, selectedCat);
    };

    // Listeners
    selectMonth.addEventListener('change', updateTrigger);
    selectCategory.addEventListener('change', updateTrigger);

    // Jalankan pertama kali
    updateTrigger();
}

function calculateAndRenderDas4(appData, monthKey, category) {
    const dataBulan = appData[monthKey] || [];
    
    // Header label di tabel agar user tidak bingung data apa yang sedang dilihat
    const labelTable = document.getElementById('LABEL_CATEGORY_TABLE');
    if(labelTable) labelTable.innerText = `MENAMPILKAN DATA: ${category}`;

    let stats = {
        pegawai: { rm: 0, pnbp: 0 },
        barang: { rm: 0, pnbp: 0 },
        modal: { rm: 0, pnbp: 0 }
    };

    dataBulan.forEach(row => {
        if (row.level === 3) {
            // Logika seleksi: ambil row.pagu jika dropdown "PAGU", ambil row.acv jika "CAPAIAN"
            const val = (category === "PAGU") ? (parseFloat(row.pagu) || 0) : (parseFloat(row.acv) || 0);
            
            const kodeStr = String(row.kode || "");
            const kodeUpper = kodeStr.toUpperCase();

            let jenis = null;
            if (kodeStr.startsWith('51')) jenis = 'pegawai';
            else if (kodeStr.startsWith('52')) jenis = 'barang';
            else if (kodeStr.startsWith('53')) jenis = 'modal';

            if (jenis) {
                if (kodeUpper.includes('RM')) {
                    stats[jenis].rm += val;
                } else if (kodeUpper.includes('PNP') || kodeUpper.includes('PNBP')) {
                    stats[jenis].pnbp += val;
                }
            }
        }
    });

    renderTableDas4(stats);
}

function renderTableDas4(stats) {
    const tableRows = document.querySelectorAll('.das4-table tbody tr');
    const mapping = ['pegawai', 'barang', 'modal'];

    mapping.forEach((key, index) => {
        const cells = tableRows[index].querySelectorAll('td');
        const rmVal = stats[key].rm;
        const pnbpVal = stats[key].pnbp;
        const total = rmVal + pnbpVal;

        cells[1].innerText = formatCurrency(rmVal);   
        cells[2].innerText = formatCurrency(pnbpVal); 
        cells[3].innerText = formatCurrency(total);   
    });
}
// ------------------------------------ HELPERS -----------------------------------------

function updateUICon1(data) {
    const sisa = data.pagu - data.real;
    const persen = data.pagu > 0 ? (data.real / data.pagu) * 100 : 0;
    document.getElementById('ANNUAL_PAGU').innerText = formatCurrency(data.pagu);
    document.getElementById('ANNUAL_REALIZATION').innerText = formatCurrency(data.real);
    document.getElementById('ANNUAL_REMAINING').innerText = formatCurrency(sisa);
    document.getElementById('ANNUAL_PERCENT').innerText = persen.toFixed(1) + "%";
}

function updateUICon2(data) {
    applyDataToCard('PEGAWAI', data.pegawai);
    applyDataToCard('BARANG', data.barang);
    applyDataToCard('MODAL', data.modal);
}

function updateUIDas3(data) {
    applyDataToCard('RM', data.rm);
    applyDataToCard('PNBP', data.pnbp);
}

function applyDataToCard(prefix, dataObj) {
    const persen = dataObj.pagu > 0 ? (dataObj.real / dataObj.pagu) * 100 : 0;
    const sisa = dataObj.pagu - dataObj.real;

    const elPct = document.getElementById(`PCT_${prefix}`);
    const elVal = document.getElementById(`VAL_${prefix}`);
    const elBar = document.getElementById(`BAR_${prefix}`);
    const elPagu = document.getElementById(`PAGU_${prefix}`);
    const elReal = document.getElementById(`REAL_${prefix}`);
    const elSisa = document.getElementById(`SISA_${prefix}`);

    if (elPct) elPct.innerText = persen.toFixed(1) + "%";
    if (elVal) elVal.innerText = formatCurrency(dataObj.real);
    if (elBar) elBar.style.width = Math.min(persen, 100) + "%";
    if (elPagu) elPagu.innerText = formatCurrency(dataObj.pagu);
    if (elReal) elReal.innerText = formatCurrency(dataObj.real);
    if (elSisa) elSisa.innerText = formatCurrency(sisa);
}

function formatCurrency(num) {
    return "Rp " + new Intl.NumberFormat('id-ID').format(num);
}

// ------------------------------------ CHARTS -----------------------------------------

let annualChart;
function renderChart(data) {
    const canvas = document.getElementById('annualBarChart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if (annualChart) annualChart.destroy();
    annualChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Anggaran Tahunan'],
            datasets: [
                { label: 'Pagu Total', data: [data.pagu], backgroundColor: '#2c3e50', borderRadius: 10, barThickness: 50 },
                { label: 'Realisasi', data: [data.real], backgroundColor: '#d4af37', borderRadius: 10, barThickness: 50 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'bottom' } },
            scales: { 
                y: { beginAtZero: true, ticks: { callback: (v) => (v / 1000000).toFixed(0) + 'jt' } } 
            }
        }
    });
}

let trendChart;
function renderMonthlyTrend(appData) {
    const canvas = document.getElementById('monthlyTrendChart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const monthlyValues = months.map(m => {
        const dataBulan = appData[m] || [];
        return dataBulan.filter(row => row.level === 0).reduce((sum, row) => sum + (parseFloat(row.acv) || 0), 0);
    });
    if (trendChart) trendChart.destroy();
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months.map(m => m.substring(0, 3)),
            datasets: [{ label: 'Realisasi', data: monthlyValues, borderColor: '#d4af37', backgroundColor: 'rgba(212, 175, 55, 0.1)', fill: true, tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}
