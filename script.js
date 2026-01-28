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

function exportToPDF() {
    if (typeof html2pdf === 'undefined') {
        alert("Library PDF belum dimuat. Pastikan ada koneksi internet.");
        return;
    }
    const element = document.getElementById('CON3');
    const opt = {
        margin: 10,
        filename: `Laporan_${currentMonth}.pdf`,
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
}

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
                showToast(`Sukses! Data ${currentMonth} disalin ke ${m}`, "success");
                
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
    if (parent.level >= 3) return alert("Maksimal 3 Sub!");
    appData[currentMonth].splice(index + 1, 0, {
        id: "ID-" + Date.now(), kode: "Sub", program: "Nama Kegiatan",
        pagu: 0, acv: 0, level: parent.level + 1, parentId: parent.id
    });
    renderTable();
}

function calculateHierarchy() {
    let data = appData[currentMonth];
    data.forEach(item => {
        const hasChildren = data.some(child => child.parentId === item.id);
        if (hasChildren) { item.pagu = 0; item.acv = 0; }
    });
    for (let l = 3; l > 0; l--) {
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
}

function renderTable() {
    calculateHierarchy();
    const tableBody = document.querySelector('.main-table tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    appData[currentMonth].forEach((data, index) => {
        const tr = document.createElement('tr');
        const lvl = data.level || 0;
     
        
        // Render Baris dengan struktur Badge Timbul & Tombol yang Aktif
        tr.innerHTML = `
            <td class="level-${lvl}">${lvl > 0 ? '↳ ' : ''}${data.kode}</td>
            <td class="level-${lvl}"><div class="text-detail">${data.program}</div></td>
            
            <td style="text-align: center;">
                <div class="value-badge badge-pagu">
                    ${Number(data.pagu).toLocaleString('id-ID')}
                </div>
            </td>
            
            <td style="text-align: center;">
                <div class="value-badge badge-acv">
                    ${Number(data.acv).toLocaleString('id-ID')}
                </div>
            </td>
            
            <td>
                <div class="action-group">
                    <button class="btn-action-tbl" onclick="editProgram(${index})">⚙️</button>
                    <button class="btn-action-tbl" onclick="editPagu(${index})">💰</button>
                    <button class="btn-action-tbl" onclick="editAcv(${index})">📈</button>
                    <button class="btn-action-tbl" onclick="moveRow(${index})">🔼</button>
                    <button class="btn-action-tbl btn-del-color" onclick="deleteRow(${index})">🗑️</button>
                    <button class="btn-action-tbl btn-sub-color" onclick="addSubRow(${index})">➕</button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
    localStorage.setItem('appData', JSON.stringify(appData));
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
    const data = appData[currentMonth];
    if (index > 0 && data[index].level === data[index-1].level && data[index].parentId === data[index-1].parentId) {
        [data[index], data[index-1]] = [data[index-1], data[index]];
        renderTable();
    }
}

function updateDashboard() {
    const main = appData[currentMonth].filter(i => i.level === 0);
    let p = 0, a = 0;
    main.forEach(r => { p += r.pagu; a += r.acv; });

    const vals = document.querySelectorAll('.das-value');
    if(vals.length >= 3) {
        vals[0].innerText = "Rp " + p.toLocaleString('id-ID');
        vals[1].innerText = "Rp " + a.toLocaleString('id-ID');
        
        const persentase = p > 0 ? (a / p) * 100 : 0;
        vals[2].innerText = persentase.toFixed(1) + "%";

        // LOGIKA INDIKATOR DAS4
        const indicatorBox = document.querySelector('.indicator-box');
        const statusText = document.querySelector('.status-text');
        
        if (indicatorBox && statusText) {
            // Reset Class
            indicatorBox.classList.remove('status-red', 'status-yellow', 'status-green');

            if (persentase === 100) {
                // 100% = Hijau
                indicatorBox.classList.add('status-green');
                statusText.innerText = "Sempurna (100%)";
            } 
            else if ((persentase >= 96 && persentase <= 99) || (persentase >= 101 && persentase <= 104)) {
                // 96-99% & 101-104% = Kuning
                indicatorBox.classList.add('status-yellow');
                statusText.innerText = "Mendekati Target";
            } 
            else {
                // 0-95% & 105% ke atas = Merah
                indicatorBox.classList.add('status-red');
                statusText.innerText = persentase > 104 ? "Melebihi Kapasitas" : "Dibawah Target";
            }
        }
    }
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
                showToast("Baris berhasil dihapus", "warning");
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
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    const icon = type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toast);

    // Hilang otomatis setelah 3 detik
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = '0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// --- UPDATE FUNGSI SUB-ROW & EDIT ---
function addSubRow(index) {
    const parent = appData[currentMonth][index];
    if (parent.level >= 3) {
        showToast("Batas Maksimal! Hanya diijinkan hingga 3 Sub-Baris.", "warning");
        return;
    }
    appData[currentMonth].splice(index + 1, 0, {
        id: "ID-" + Date.now(), kode: "Sub", program: "Nama Kegiatan",
        pagu: 0, acv: 0, level: parent.level + 1, parentId: parent.id
    });
    renderTable();
    showToast("Sub-baris baru berhasil ditambahkan", "success");
}

function editPagu(index) {
    const item = appData[currentMonth][index];
    const hasChildren = appData[currentMonth].some(c => c.parentId === item.id);
    
    if (hasChildren) {
        showToast("Induk Otomatis! Nilai dihitung dari akumulasi sub-baris.", "info");
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
        showToast("Capaian Terkunci! Induk akan mengikuti total sub-kegiatan.", "info");
        return;
    }

    openCustomModal('📈 Update Capaian', [
        { id: 'val', type: 'number', label: 'Nilai Realisasi (Rp)', value: item.acv }
    ], 'modal-theme-acv', (res) => {
        appData[currentMonth][index].acv = parseFloat(res.val) || 0;
        renderTable();
        showToast("Capaian diperbarui", "success");
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

// Membuka Modal
function logoutSession() {
    const modal = document.getElementById('logoutModal');
    modal.classList.add('active');
}

// Menutup Modal
function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    modal.classList.remove('active');
}

// Eksekusi Keluar
function confirmLogout() {
    document.body.style.opacity = "0";
    setTimeout(() => {
        window.location.href = "login.html";
    }, 500);
}
