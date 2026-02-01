function toggleDropdown() {
    const wrapper = document.querySelector('.dropdown-wrapper');
    wrapper.classList.toggle('active');
}

// Menutup dropdown jika user klik di luar menu
window.onclick = function(event) {
    if (!event.target.closest('.dropdown-wrapper')) {
        const dropdowns = document.getElementsByClassName("dropdown-wrapper");
        for (let i = 0; i < dropdowns.length; i++) {
            dropdowns[i].classList.remove('active');
        }
    }
}
//---------------------------FORM---------------------------------------------

function openForm(namaBagian) {
    // Sembunyikan semua form dulu, lalu tampilkan form MONTIB
    document.getElementById('FORM_MONTIB').style.display = (namaBagian === 'MONTIB') ? 'flex' : 'none';
    document.querySelector('.dropdown-wrapper').classList.remove('active');
}

function updateSubKegiatan() {
    const kegiatan = document.getElementById('sel_kegiatan').value;
    const sub = document.getElementById('sel_sub_kegiatan');
    sub.innerHTML = '<option value="">-- PILIH LOKASI --</option>';

    if (kegiatan === 'monitoring') {
        sub.innerHTML += '<option value="m_dalam">MONITORING DALAM KOTA</option>';
        sub.innerHTML += '<option value="m_luar">MONITORING LUAR KOTA</option>';
    } else if (kegiatan === 'penertiban') {
        sub.innerHTML += '<option value="p_dalam">PENERTIBAN DALAM KOTA</option>';
        sub.innerHTML += '<option value="p_luar">PENERTIBAN LUAR KOTA</option>';
    }
    updateKode(); // Reset kode saat kegiatan berubah
}

function updateKode() {
    const sub = document.getElementById('sel_sub_kegiatan').value;
    const kode = document.getElementById('sel_kode');
    kode.innerHTML = '<option value="">-- KODE --</option>';

    if (sub !== "") {
        kode.innerHTML += '<option value="521219">521219</option>';
        kode.innerHTML += '<option value="524113">524113</option>';
        
        // Tambahan khusus Penertiban Dalam Kota
        if (sub === 'p_dalam') {
            kode.innerHTML += '<option value="521213">521213</option>';
        }
    }
    showKeterangan(); // Reset keterangan
}

function showKeterangan() {
    const val = document.getElementById('sel_kode').value;
    const info = document.getElementById('kode_info');
    
    const dataKeterangan = {
        '521219': '521219 = Belanja Barang Non Operasional Lainnya',
        '524113': '524113 = Belanja Perjalanan Dinas Dalam Kota',
        '521213': '521213 = Belanja Honor Output Kegiatan'
    };

    info.innerText = dataKeterangan[val] || 'Pilih kode untuk melihat detail...';
}
// Update tombol di HTML untuk memanggil fungsi ini:
// Contoh: <button class="drop-item" onclick="openForm('TATA USAHA')">1. TATA USAHA ( TU )</button>
