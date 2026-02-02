// ==========================================
// 1. STATE DATA & INITIALIZATION
// ==========================================
let appData = JSON.parse(localStorage.getItem('appData')) || {
    "Januari": [], "Februari": [], "Maret": [], "April": [], "Mei": [], "Juni": [],
    "Juli": [], "Agustus": [], "September": [], "Oktober": [], "November": [], "Desember": []
};
let currentMonth = "Januari";

document.addEventListener('DOMContentLoaded', () => {
    // Load data dari LocalStorage saat pertama buka
    const saved = localStorage.getItem('premiumAppData_2026');
    if (saved) {
        try {
            appData = JSON.parse(saved);
        } catch (e) {
            console.error("Data korup, memulai ulang.");
        }
    }
    initGlobalListeners();
    renderTable();
});

// ==========================================
// 2. LOGIKA CON2 (MENU AKSI)
// ==========================================

function initGlobalListeners() {
    // Pencarian Live
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const filter = this.value.toLowerCase();
            const rows = document.querySelectorAll('.main-table tbody tr');
            rows.forEach(row => {
                row.style.display = row.innerText.toLowerCase().includes(filter) ? '' : 'none';
            });
        });
    }

    // Ganti Bulan
    const monthSelect = document.querySelector('.month-selector select');
    if (monthSelect) {
        monthSelect.addEventListener('change', function() {
            currentMonth = this.value;
            renderTable();
        });
    }
}

// FUNGSI SAVE (YANG ANDA TANYAKAN)
function saveToLocalStorage() {
    localStorage.setItem('premiumAppData_2026', JSON.stringify(appData));
    alert("💾 Berhasil! Data Januari - Desember telah disimpan.");
}

// function exportToPDF() {
//     if (typeof html2pdf === 'undefined') {
//         alert("Library PDF belum dimuat. Pastikan ada koneksi internet.");
//         return;
//     }
//     const element = document.getElementById('CON3');
//     const opt = {
//         margin: 10,
//         filename: `Laporan_${currentMonth}.pdf`,
//         jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
//     };
//     html2pdf().set(opt).from(element).save();
// }
function exportToPDF() {
    if (typeof html2pdf === 'undefined') {
        alert("Library PDF belum dimuat. Pastikan ada koneksi internet.");
        return;
    }

    const date = new Date();
    const listBulan = ["JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI", 
                       "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"];
    const bulanSekarang = listBulan[date.getMonth()];
    const tahunSekarang = date.getFullYear();

    const originalElement = document.getElementById('CON3');
    const tableClone = originalElement.cloneNode(true);

    // Bersihkan elemen aksi (tombol dan kolom aksi)
    const actions = tableClone.querySelectorAll('.action-btn, .btn-action, button, .action-col, th:last-child, td:last-child');
    actions.forEach(el => el.remove());

    const pdfWrapper = document.createElement('div');
    pdfWrapper.style.width = "1000px"; 
    pdfWrapper.style.padding = "20px";
    pdfWrapper.style.backgroundColor = "#fff";

    const headerHtml = `
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px solid #000; padding-bottom: 10px;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 900; color: #000; text-transform: uppercase;">
                REALISASI RPD BULAN ${bulanSekarang} TAHUN ${tahunSekarang}
            </h1>
        </div>
    `;

    const footerHtml = `
        <div style="margin-top: 40px; display: flex; justify-content: flex-end; page-break-inside: avoid;">
            <div style="text-align: center; width: 300px;">
                <p style="font-size: 11px; margin-bottom: 1px;">
                    PALANGKA RAYA, ${date.getDate()} ${bulanSekarang} ${tahunSekarang}
                </p>
                  <p style="font-size: 11px; margin-bottom: 110px;">
                  Analis Anggaran Ahli Pertama</p>
                <p style="font-size: 12px; font-weight: 800; text-decoration: underline; margin: 0; text-transform: uppercase;">
                    Taufik Hidayat,s.ab
                </p>
                <p style="font-size: 11px; margin: 0;">NIP : 199604092025041002</p>
            </div>
        </div>
    `;

    pdfWrapper.innerHTML = headerHtml;
    pdfWrapper.appendChild(tableClone);
    pdfWrapper.innerHTML += footerHtml;

    // --- STYLING HEADER KOLOM (RATA TENGAH) ---
    const ths = pdfWrapper.querySelectorAll('th');
    ths.forEach(th => {
        th.style.backgroundColor = "#e5e5e5"; 
        th.style.color = "#000";
        th.style.fontWeight = "900"; 
        th.style.textTransform = "uppercase"; 
        th.style.textAlign = "center"; // JUDUL RATA TENGAH
        th.style.verticalAlign = "middle";
        th.style.padding = "12px 5px";
        th.style.border = "1px solid #000";
        th.style.fontSize = "10px";

        // Pastikan teks judul seragam
        let txt = th.innerText.toLowerCase();
        if(txt.includes('kode')) th.innerText = 'KODE';
        if(txt.includes('program')) th.innerText = 'PROGRAM / KEGIATAN';
        if(txt.includes('pagu')) th.innerText = 'PAGU ANGGARAN';
        if(txt.includes('capaian')) th.innerText = 'CAPAIAN';
    });

    // --- STYLING ISI DATA ---
    const rows = pdfWrapper.querySelectorAll('tr');
    rows.forEach((row, index) => {
        row.style.pageBreakInside = "avoid";
        const cells = row.cells;
        // Skip header (index 0) agar tidak merusak rata tengah judul
        if (index > 0 && cells.length >= 2) { 
            cells[0].style.textAlign = "left";  // Data Kode tetap kiri
            cells[0].style.whiteSpace = "nowrap"; 
            cells[1].style.textAlign = "left";  // Data Program tetap kiri
            
            for(let i=2; i < cells.length; i++) {
                cells[i].style.textAlign = "right"; // Data Angka tetap kanan
            }
        }
    });

    const allTds = pdfWrapper.querySelectorAll('td');
    allTds.forEach(td => {
        td.style.border = "1px solid #000";
        td.style.padding = "6px 5px";
        td.style.fontSize = "9px";
    });

    const opt = {
        margin: [10, 10, 15, 10],
        filename: `LAPORAN_RPD_${bulanSekarang}_${tahunSekarang}.pdf`,
        html2canvas: { scale: 2.5, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: 'css', avoid: 'tr' }
    };

    html2pdf().set(opt).from(pdfWrapper).save();
}
//---------------------------------DELETE--------------------------------
function deleteAllWorksheet() {
    if (confirm(`Hapus SEMUA baris di bulan ${currentMonth}?`)) {
        appData[currentMonth] = [];
        renderTable();
    }
}

function copyCurrentMonth() {
    const modal = document.getElementById('modalOverlay');
    const container = document.getElementById('inputContainer');
    const modalBox = modal.querySelector('.modal-content');
    const btnConfirm = document.getElementById('btnConfirm');

    // 1. Setup Modal
    container.innerHTML = `
        <div class="copy-info-text">
            Salin seluruh baris data dari bulan <span class="highlight-month">${currentMonth}</span> 
            ke bulan tujuan di bawah ini:
        </div>
    `; 
    modalBox.className = 'modal-content modal-theme-info';
    document.getElementById('modalTitle').innerText = '📋 Duplikasi Data';
    
    // Sembunyikan tombol simpan default
    btnConfirm.style.display = 'none';

    // 2. Buat Grid Bulan Tujuan
    const grid = document.createElement('div');
    grid.className = 'copy-grid';

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    months.forEach(m => {
        const card = document.createElement('div');
        const isSource = (m === currentMonth);
        card.className = `copy-card ${isSource ? 'current-source' : ''}`;
        card.innerText = m;
        
        if (!isSource) {
            card.onclick = () => {
                // Proses Copy Data secara Deep Clone
                appData[m] = JSON.parse(JSON.stringify(appData[currentMonth]));
                
                closeModal();
                // showToast(`Sukses! Data ${currentMonth} disalin ke ${m}`, "success");
                
                // Kembalikan display tombol simpan
                btnConfirm.style.display = 'block';
            };
        }
        
        grid.appendChild(card);
    });

    container.appendChild(grid);
    modal.style.display = 'flex';
}

// ==========================================
// 3. LOGIKA CON3 (HIERARKI - TERKUNCI)
// ==========================================

function addMainRow() {
    appData[currentMonth].push({
        id: "ID-" + Date.now(), kode: "01.00", program: "BARIS UTAMA",
        pagu: 0, acv: 0, level: 0, parentId: null
    });
    renderTable();
}

function addSubRow(index) {
    const parent = appData[currentMonth][index];
    // Izinkan sampai level 4
    if (parent.level >= 4) {
        // showToast("Batas Maksimal! Hanya diijinkan hingga Sub-Baris Level 4.", "warning");
        return;
    }
    appData[currentMonth].splice(index + 1, 0, {
        id: "ID-" + Date.now(), 
        kode: "Sub", 
        program: "Nama Kegiatan",
        pagu: 0, 
        acv: 0, 
        level: parent.level + 1, 
        parentId: parent.id
    });
    renderTable();
    // showToast("Sub-baris level " + (parent.level + 1) + " ditambahkan", "success");
}
function calculateHierarchy() {
    let data = appData[currentMonth];
    
    // 1. Reset Induk
    data.forEach(item => {
        const hasChildren = data.some(child => child.parentId === item.id);
        if (hasChildren) { item.pagu = 0; item.acv = 0; }
    });

    // 2. Akumulasi dari terdalam (4) ke Utama (0)
    for (let l = 4; l > 0; l--) {
        data.forEach(item => {
            if (item.level === l) {
                const parent = data.find(p => p.id === item.parentId);
                if (parent) {
                    parent.pagu += Number(item.pagu || 0);
                    parent.acv += Number(item.acv || 0);
                }
            }
        });
    }
    updateDashboard();
    localStorage.setItem('premiumAppData_2026', JSON.stringify(appData));
}

function updateDashboard() {
    const data = appData[currentMonth];
    const main = data.filter(i => i.level === 0);
    let p = 0, a = 0;
    main.forEach(r => { p += (Number(r.pagu) || 0); a += (Number(r.acv) || 0); });

    const sisa = p - a;
    const persentase = p > 0 ? (a / p) * 100 : 0;

    // PERBAIKAN: Gunakan ID agar tidak tertukar/tumpang tindih
    const elTarget = document.getElementById('VAL_TARGET');
    const elCapaian = document.getElementById('VAL_CAPAIAN');
    const elPersen = document.getElementById('VAL_PERSEN');
    const elSisa = document.getElementById('SISA_PAGU_VAL');

    if (elTarget) elTarget.innerText = "Rp " + p.toLocaleString('id-ID');
    if (elCapaian) elCapaian.innerText = "Rp " + a.toLocaleString('id-ID');
    if (elPersen) elPersen.innerText = persentase.toFixed(1) + "%";
    
    if (elSisa) {
        elSisa.innerText = "Rp " + sisa.toLocaleString('id-ID');
        elSisa.style.color = sisa < 0 ? "#ff4d4d" : "#ffd700";
    }

    // Indikator Status
    const indicatorBox = document.querySelector('.indicator-box');
    const statusText = document.querySelector('.status-text');
    if (indicatorBox && statusText) {
        indicatorBox.classList.remove('status-red', 'status-yellow', 'status-green');
        if (persentase >= 100) {
            indicatorBox.classList.add('status-green');
            statusText.innerText = "Tercapai";
        } else if (persentase >= 50) {
            indicatorBox.classList.add('status-yellow');
            statusText.innerText = "Mendekati";
        } else {
            indicatorBox.classList.add('status-red');
            statusText.innerText = "Kurang";
        }
    }
}
// Global State untuk menyimpan baris mana yang sedang di-hide
let hiddenParents = [];

function toggleSubRows(parentId) {
    const sId = String(parentId);
    const idx = hiddenParents.indexOf(sId);
    
    if (idx > -1) {
        hiddenParents.splice(idx, 1); // Membuka (hapus dari list hide)
    } else {
        hiddenParents.push(sId); // Menutup (masukkan ke list hide)
    }
    renderTable(); 
}
function renderTable() {
    calculateHierarchy(); 
    const tableBody = document.querySelector('.main-table tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const dataBulanIni = appData[currentMonth] || [];

    // --- LOGIKA AUTO-HIDE AWAL ---
    // Jika hiddenParents kosong (awal load), masukkan semua ID yang punya level > 0
    if (hiddenParents.length === 0) {
        dataBulanIni.forEach(item => {
            const isParent = dataBulanIni.some(child => String(child.parentId) === String(item.id));
            if (isParent) {
                hiddenParents.push(String(item.id));
            }
        });
    }

    dataBulanIni.forEach((data, index) => {
        // --- LOGIKA FILTER: HANYA TAMPILKAN JIKA INDUKNYA TIDAK DI-HIDE ---
        let isHidden = false;
        let pId = data.parentId;
        
        while (pId) {
            if (hiddenParents.includes(String(pId))) { 
                isHidden = true; 
                break; 
            }
            const parentNode = dataBulanIni.find(i => String(i.id) === String(pId));
            pId = parentNode ? parentNode.parentId : null;
        }

        // Jika dia adalah sub-baris dan induknya tertutup, jangan dirender
        if (isHidden) return; 

        // Cek apakah baris ini punya anak (untuk fungsi klik)
        const isParent = dataBulanIni.some(child => String(child.parentId) === String(data.id));
        const isCollapsed = hiddenParents.includes(String(data.id));

        const tr = document.createElement('tr');
        const lvl = data.level || 0;
        
        // --- STRUKTUR BARIS ---
        tr.innerHTML = `
            <td class="level-${lvl}" 
                onclick="${isParent ? `toggleSubRows('${data.id}')` : ''}" 
                style="${isParent ? 'cursor:pointer; font-weight:800; color:#d4af37;' : ''}">
                ${data.kode}
            </td>
            
            <td class="level-${lvl}">
                <div class="text-detail" style="${lvl === 0 ? 'font-weight:800; color:#2c3e50; text-transform:uppercase;' : ''}">
                    ${data.program}
                </div>
            </td>
            
            <td style="text-align: center;"><div class="value-badge badge-pagu">${Number(data.pagu).toLocaleString('id-ID')}</div></td>
            <td style="text-align: center;"><div class="value-badge badge-acv">${Number(data.acv).toLocaleString('id-ID')}</div></td>
            
            <td>
                <div class="action-group">
                    <button class="btn-action-tbl" onclick="editProgram(${index})">⚙️</button>
                    <button class="btn-action-tbl" onclick="editPagu(${index})">💰</button>
                    <button class="btn-action-tbl" onclick="editAcv(${index})">📈</button>
                    <button class="btn-action-tbl" onclick="moveRow(${index})">🔼</button>
                    <button class="btn-action-tbl btn-del-color" onclick="deleteRow(${index})">🗑️</button>
                    <button class="btn-action-tbl btn-sub-color" onclick="addSubRow(${index})">➕</button>
                </div>
            </td>`;
        tableBody.appendChild(tr);
    });
}
// ==========================================
// 4. HELPER & MODAL
// ==========================================

function deleteRow(index) {
    const id = appData[currentMonth][index].id;
    appData[currentMonth] = appData[currentMonth].filter(i => i.id !== id && i.parentId !== id);
    renderTable();
}

function moveRow(index) {
    const dataBulanIni = appData[currentMonth];
    if (index <= 0) return; // Sudah di paling atas

    const currentRow = dataBulanIni[index];
    const currentLevel = currentRow.level;

    // 1. Identifikasi anggota "keluarga" (semua sub-baris di bawah baris ini)
    let familyIndices = [index];
    for (let i = index + 1; i < dataBulanIni.length; i++) {
        // Jika level baris berikutnya lebih besar, berarti itu anak/cucu
        if (dataBulanIni[i].level > currentLevel) {
            familyIndices.push(i);
        } else {
            // Jika bertemu level yang sama atau lebih kecil, paket keluarga selesai
            break;
        }
    }

    // 2. Cari baris "Kakak" (Baris dengan level yang sama di urutan atas)
    let targetIndex = -1;
    for (let i = index - 1; i >= 0; i--) {
        if (dataBulanIni[i].level === currentLevel) {
            targetIndex = i;
            break;
        }
        // Jika di tengah jalan bertemu level yang lebih rendah (induk), 
        // berarti tidak ada kakak setingkat di blok induk yang sama.
        if (dataBulanIni[i].level < currentLevel) {
            break;
        }
    }

    if (targetIndex === -1) {
        // showToast("Sudah berada di urutan teratas dalam kelompoknya", "info");
        return;
    }

    // 3. Eksekusi Pemindahan Paket Keluarga
    // Ambil paket keluarga dari posisi lama
    const movedFamily = dataBulanIni.splice(index, familyIndices.length);
    
    // Masukkan ke posisi target (di atas baris kakaknya)
    dataBulanIni.splice(targetIndex, 0, ...movedFamily);

    // 4. Simpan dan Segarkan Tampilan
    renderTable();
    
    // Simpan ke LocalStorage agar urutan permanen
    localStorage.setItem('premiumAppData_2026', JSON.stringify(appData));
    
    // showToast("Urutan berhasil dipindahkan", "success");
}

// Fungsi Edit Sederhana (Gunakan prompt jika modal belum siap)
// 1. Edit Program (Tema Biru)
function editProgram(index) {
    const item = appData[currentMonth][index];
    openCustomModal('⚙️ Pengaturan Baris', [
        { id: 'kode', label: 'Kode Kegiatan', value: item.kode },
        { id: 'nama', label: 'Nama Program/Kegiatan', value: item.program }
    ], 'modal-theme-info', (res) => {
        appData[currentMonth][index].kode = res.kode;
        appData[currentMonth][index].program = res.nama;
        renderTable();
    });
}

// 2. Edit Pagu (Tema Hijau)
function editPagu(index) {
    const item = appData[currentMonth][index];
    const hasChildren = appData[currentMonth].some(c => c.parentId === item.id);
    if (hasChildren) return alert("Induk otomatis dari sub-baris!");

    openCustomModal('💰 Update Pagu', [
        { id: 'val', type: 'number', label: 'Nilai Pagu (Rp)', value: item.pagu }
    ], 'modal-theme-pagu', (res) => {
        appData[currentMonth][index].pagu = parseFloat(res.val) || 0;
        renderTable();
    });
}

// 3. Edit Capaian (Tema Emas)
function editAcv(index) {
    const item = appData[currentMonth][index];
    const hasChildren = appData[currentMonth].some(c => c.parentId === item.id);
    if (hasChildren) return alert("Induk otomatis dari sub-baris!");

    openCustomModal('📈 Update Capaian', [
        { id: 'val', type: 'number', label: 'Nilai Realisasi (Rp)', value: item.acv }
    ], 'modal-theme-acv', (res) => {
        appData[currentMonth][index].acv = parseFloat(res.val) || 0;
        renderTable();
    });
}

// --- FUNGSI TAMPILAN PENGINGAT (CONFIRMATION) ---
// --- PERBAIKAN LOGIKA PENGINGAT ---
function openConfirm(title, message, icon, onConfirm) {
    const overlay = document.getElementById('confirmOverlay');
    const btnExecute = document.getElementById('btnExecute');
    
    document.getElementById('confirmTitle').innerText = title;
    document.getElementById('confirmMessage').innerText = message;
    document.getElementById('confirmIcon').innerText = icon;

    overlay.style.display = 'flex';

    // Penting: Hapus event listener lama agar tidak menumpuk
    const newBtnExecute = btnExecute.cloneNode(true);
    btnExecute.parentNode.replaceChild(newBtnExecute, btnExecute);

    // Jalankan aksi saat tombol "Ya" diklik
    newBtnExecute.onclick = () => {
        onConfirm();
        closeConfirm(); // Menutup setelah setuju
    };
}

function closeConfirm() {
    const overlay = document.getElementById('confirmOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// --- SIMPAN (CON2) ---
function saveToLocalStorage() {
    openConfirm(
        "Simpan Perubahan?", 
        "Simpan semua data ke memori browser?", 
        "💾", 
        () => {
            localStorage.setItem('premiumAppData_2026', JSON.stringify(appData));
            if (typeof showToast === "function") showToast("Data Berhasil Disimpan!", "success");
            // closeConfirm sudah dipanggil otomatis oleh fungsi openConfirm di atas
        }
    );
}

// --- HAPUS SEMUA (CON2) ---
function deleteAllWorksheet() {
    openConfirm(
        "Hapus Semua?", 
        `Kosongkan seluruh baris di bulan ${currentMonth}?`, 
        "🗑️", 
        () => {
            appData[currentMonth] = [];
            renderTable();
            if (typeof showToast === "function") showToast("Data dibersihkan", "info");
        }
    );
}

// --- PENERAPAN PADA HAPUS SATU BARIS (CON3) ---
function deleteRow(index) {
    const item = appData[currentMonth][index];
    
    openConfirm(
        "Hapus Baris?", 
        `Hapus "${item.program}" dan semua sub-kegiatan di bawahnya?`, 
        "⚠️", 
        () => {
            // 1. Ambil ID target
            const id = item.id;
            
            // 2. Langsung tutup modal di awal eksekusi
            closeConfirm(); 
            
            // 3. Update data
            appData[currentMonth] = appData[currentMonth].filter(i => i.id !== id && i.parentId !== id);
            
            // 4. Render ulang tabel
            renderTable();
            
            // 5. Berikan notifikasi toast
            if (typeof showToast === "function") {
                // showToast("Baris berhasil dihapus", "warning");
            }
        }
    );
}
function openCustomModal(title, fields, themeClass, onSave) {
    const modal = document.getElementById('modalOverlay');
    const container = document.getElementById('inputContainer');
    const modalBox = modal.querySelector('.modal-content');
    const btnConfirm = document.getElementById('btnConfirm');

    if (!modal || !container || !btnConfirm) return;

    // 1. Pastikan tombol Simpan terlihat
    btnConfirm.style.display = 'block';
    btnConfirm.innerText = "SIMPAN"; // Set teks tombol

    // 2. Bersihkan & Set Tema
    container.innerHTML = ''; 
    modalBox.className = 'modal-content ' + themeClass;
    document.getElementById('modalTitle').innerText = title;

    // 3. Render Input
    fields.forEach(f => {
        const div = document.createElement('div');
        div.className = 'input-group';
        div.style.marginBottom = "15px";

        const label = document.createElement('label');
        label.innerText = f.label;
        label.style.display = "block";
        label.style.fontSize = "11px";
        label.style.fontWeight = "800";
        label.style.color = "#8da2b5";
        label.style.marginBottom = "5px";

     // ... di dalam fields.forEach ...
const input = document.createElement('input');
input.type = 'text'; // Gunakan text agar bisa disisipi titik
input.id = 'inp_' + f.id;
input.className = 'modal-input-premium';

// Jika tipe data adalah number (Pagu/ACV), terapkan formatter
if (f.type === 'number') {
    // Set nilai awal dengan format titik
    input.value = formatRupiah(f.value.toString());

    input.addEventListener('input', function() {
        this.value = formatRupiah(this.value);
    });
} else {
    input.value = f.value ?? '';
}

        div.appendChild(label);
        div.appendChild(input);
        container.appendChild(div);
    });

    modal.style.display = 'flex';

    // 4. Fokus Otomatis
    setTimeout(() => { container.querySelector('input')?.focus(); }, 100);

    // 5. Logika Klik Simpan (OK)
  btnConfirm.onclick = () => {
    let results = {};
    fields.forEach(f => {
        let rawValue = document.getElementById('inp_' + f.id).value;
        
        // Jika field adalah angka, buang titiknya sebelum disimpan ke database
        if (f.type === 'number') {
            results[f.id] = parseFloat(rawValue.replace(/\./g, '')) || 0;
        } else {
            results[f.id] = rawValue;
        }
    });
    onSave(results);
    closeModal();
};
}

// Tambahkan fungsi closeModal jika belum ada di JS Anda
function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}
function openMonthSelector() {
    const modal = document.getElementById('modalOverlay');
    const container = document.getElementById('inputContainer');
    const modalBox = modal.querySelector('.modal-content');
    const btnConfirm = document.getElementById('btnConfirm');

    // 1. Setup Modal
    container.innerHTML = ''; 
    modalBox.className = 'modal-content modal-theme-info';
    document.getElementById('modalTitle').innerText = '📅 Pilih Bulan';
    
    // Sembunyikan tombol simpan karena kita pakai sistem klik langsung
    btnConfirm.style.display = 'none';

    // 2. Buat Grid Bulan
    const grid = document.createElement('div');
    grid.className = 'month-grid';

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    months.forEach(m => {
        const card = document.createElement('div');
        card.className = `month-card ${m === currentMonth ? 'active-month' : ''}`;
        card.innerText = m;
        
        card.onclick = () => {
            currentMonth = m;
            // Update Select di CON2 agar sinkron
            const monthSelect = document.querySelector('.month-selector select');
            if(monthSelect) monthSelect.value = m;
            
            renderTable();
            closeModal();
            showToast(`Pindah ke bulan ${m}`, "info");
            
            // Tampilkan kembali tombol simpan untuk modal lain nanti
            btnConfirm.style.display = 'block';
        };
        
        grid.appendChild(card);
    });

    container.appendChild(grid);
    modal.style.display = 'flex';
}
// Fungsi Inti Toast
function showToast(message, type = 'info') {
    
    // Hilang otomatis setelah 3 detik
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = '0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
function editPagu(index) {
    const item = appData[currentMonth][index];
    const hasChildren = appData[currentMonth].some(c => c.parentId === item.id);
    
    if (hasChildren) {
        // showToast("Induk Otomatis! Nilai dihitung dari akumulasi sub-baris.", "info");
        return;
    }

    openCustomModal('💰 Update Pagu', [
        { id: 'val', type: 'number', label: 'Nilai Pagu (Rp)', value: item.pagu }
    ], 'modal-theme-pagu', (res) => {
        appData[currentMonth][index].pagu = parseFloat(res.val) || 0;
        renderTable();
        showToast("Pagu diperbarui", "success");
    });
}

function editAcv(index) {
    const item = appData[currentMonth][index];
    const hasChildren = appData[currentMonth].some(c => c.parentId === item.id);
    
    if (hasChildren) {
        // showToast("Capaian Terkunci! Induk akan mengikuti total sub-kegiatan.", "info");
        return;
    }

    openCustomModal('📈 Update Capaian', [
        { id: 'val', type: 'number', label: 'Nilai Realisasi (Rp)', value: item.acv }
    ], 'modal-theme-acv', (res) => {
        appData[currentMonth][index].acv = parseFloat(res.val) || 0;
        renderTable();
        // showToast("Capaian diperbarui", "success");
    });
}

// Fungsi mengubah angka menjadi format Rupiah (tanpa Rp)
function formatRupiah(angka) {
    let number_string = angka.replace(/[^,\d]/g, '').toString(),
        split = number_string.split(','),
        sisa = split[0].length % 3,
        rupiah = split[0].substr(0, sisa),
        ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        let separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    return split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
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
function importDataJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validasi sederhana: pastikan data memiliki struktur bulan
            if (importedData["Januari"] || importedData["Desember"]) {
                if (confirm("⚠️ PERINGATAN: Mengimpor data akan menghapus data yang ada sekarang di perangkat ini. Lanjutkan?")) {
                    appData = importedData;
                    // Simpan ke LocalStorage agar permanen di perangkat baru
                    localStorage.setItem('premiumAppData_2026', JSON.stringify(appData));
                    
                    // Refresh tampilan
                    renderTable();
                    updateDashboard();
                    
                    alert("✅ Sukses! Data berhasil dipulihkan.");
                    location.reload(); // Reload halaman untuk sinkronisasi total
                }
            } else {
                alert("❌ Format file tidak valid!");
            }
        } catch (err) {
            alert("❌ Gagal membaca file: " + err.message);
        }
    };
    reader.readAsText(file);
}
