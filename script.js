// 1. Database Karyawan & Jatah Cuti PT YKK AP
let dbKaryawan = JSON.parse(localStorage.getItem('db_karyawan_ykk')) || {
    "1001": { nama: "Muhamad Fatah", tahunan: 12, besar: 30 },
    "1002": { nama: "Budi Santoso", tahunan: 10, besar: 0 },
    "1003": { nama: "Siti Aminah", tahunan: 12, besar: 30 },
    "1004": { nama: "Andi Wijaya", tahunan: 5, besar: 0 },
    "1005": { nama: "Rina Permata", tahunan: 8, besar: 30 }
};

let dataCuti = JSON.parse(localStorage.getItem('db_cuti_ykk_v3')) || [];

// 2. Fungsi Update Tampilan Jatah Cuti
function updateDataKaryawan() {
    const nik = document.getElementById('nik_karyawan').value;
    const namaInput = document.getElementById('nama_karyawan');
    const infoJatah = document.getElementById('info-jatah');
    
    if (dbKaryawan[nik]) {
        namaInput.value = dbKaryawan[nik].nama;
        document.getElementById('view-tahunan').innerText = dbKaryawan[nik].tahunan;
        document.getElementById('view-besar').innerText = dbKaryawan[nik].besar;
        infoJatah.style.display = "block";
    } else {
        namaInput.value = "";
        infoJatah.style.display = "none";
    }
}

// 3. Elemen Halaman & Navigasi
const loginPage = document.getElementById('login-page');
const karyawanPage = document.getElementById('karyawan-page');
const adminPage = document.getElementById('admin-page');

document.getElementById('btnLogin').addEventListener('click', function() {
    const user = document.getElementById('username').value.toLowerCase();
    if (user === 'admin') { showPage('admin'); renderAdmin(); } 
    else if (user === 'user') { showPage('karyawan'); renderKaryawan(); }
    else { alert("Username salah!"); }
});

document.querySelectorAll('.btn-logout').forEach(btn => {
    btn.addEventListener('click', () => { location.reload(); });
});

function showPage(role) {
    [loginPage, karyawanPage, adminPage].forEach(p => p.classList.remove('active'));
    if (role === 'admin') adminPage.classList.add('active');
    if (role === 'karyawan') karyawanPage.classList.add('active');
}

// 4. Hitung Hari
function hitungHari(tgl1, tgl2) {
    const d1 = new Date(tgl1);
    const d2 = new Date(tgl2);
    if (d2 < d1) return 0;
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// 5. Fungsi Ajukan Cuti (Updated Radio Button Logic)
document.getElementById('btnAjukan').addEventListener('click', function() {
    const nik = document.getElementById('nik_karyawan').value;
    const tglMulai = document.getElementById('tgl_mulai').value;
    const tglSelesai = document.getElementById('tgl_selesai').value;
    const alasan = document.getElementById('alasan').value;
    
    // CARA BARU AMBIL NILAI RADIO BUTTON
    const jenisCutiElement = document.querySelector('input[name="jenis_cuti"]:checked');
    const jenis = jenisCutiElement ? jenisCutiElement.value : null;

    if (!dbKaryawan[nik] || !tglMulai || !tglSelesai || !alasan) {
        alert("Harap lengkapi semua data!"); return;
    }

    const durasi = hitungHari(tglMulai, tglSelesai);
    if (durasi <= 0) { alert("Tanggal selesai tidak valid!"); return; }

    const jatahTersedia = jenis === "Tahunan" ? dbKaryawan[nik].tahunan : dbKaryawan[nik].besar;

    if (durasi > jatahTersedia) {
        alert(`Gagal! Sisa jatah cuti ${jenis} Anda tidak cukup (Sisa: ${jatahTersedia} Hari).`);
        return;
    }

    const pengajuanBaru = {
        id: Date.now(),
        nik: nik,
        nama: dbKaryawan[nik].nama,
        jenis: jenis,
        mulai: tglMulai,
        selesai: tglSelesai,
        durasi: durasi,
        alasan: alasan,
        status: 'Pending'
    };

    dataCuti.push(pengajuanBaru);
    saveData();
    alert("Berhasil! Pengajuan telah dikirim.");
    
    renderKaryawan();
    // Reset Alasan & Tanggal
    document.getElementById('alasan').value = "";
    document.getElementById('tgl_mulai').value = "";
    document.getElementById('tgl_selesai').value = "";
});

// 6. Render Tables
function renderKaryawan() {
    const tabel = document.getElementById('tabel-karyawan');
    tabel.innerHTML = "";
    dataCuti.forEach(item => {
        tabel.innerHTML += `<tr>
            <td>${item.nama}</td>
            <td>${item.jenis}</td>
            <td>${item.durasi} Hari</td>
            <td class="status-${item.status.toLowerCase()}">${item.status}</td>
        </tr>`;
    });
}

function renderAdmin() {
    const tabel = document.getElementById('tabel-admin');
    tabel.innerHTML = "";
    dataCuti.forEach(item => {
        if (item.status === 'Pending') {
            tabel.innerHTML += `<tr>
                <td>${item.nama}</td>
                <td>${item.jenis}</td>
                <td>${item.durasi} Hari</td>
                <td>
                    <button onclick="updateStatus(${item.id}, 'Setuju')" style="background:green; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Setuju</button>
                    <button onclick="updateStatus(${item.id}, 'Tolak')" style="background:red; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Tolak</button>
                </td>
            </tr>`;
        }
    });
}

// 7. Update Status & Potong Jatah
function updateStatus(id, statusBaru) {
    dataCuti = dataCuti.map(item => {
        if (item.id === id) {
            item.status = statusBaru;
            if (statusBaru === 'Setuju') {
                if (item.jenis === 'Tahunan') dbKaryawan[item.nik].tahunan -= item.durasi;
                else dbKaryawan[item.nik].besar -= item.durasi;
            }
        }
        return item;
    });
    saveData();
    renderAdmin();
    alert("Status Diperbarui!");
}

function saveData() {
    localStorage.setItem('db_cuti_ykk_v3', JSON.stringify(dataCuti));
    localStorage.setItem('db_karyawan_ykk', JSON.stringify(dbKaryawan));
}

function renderAdmin() {
    const tabel = document.getElementById('tabel-admin');
    tabel.innerHTML = "";
    
    // Filter hanya data yang statusnya 'Pending'
    const dataPending = dataCuti.filter(item => item.status === 'Pending');

    if (dataPending.length === 0) {
        tabel.innerHTML = `<tr><td colspan="4" class="empty-state">Tidak ada pengajuan cuti masuk.</td></tr>`;
        return;
    }

    dataPending.forEach(item => {
        tabel.innerHTML += `
            <tr>
                <td>
                    <div style="font-weight: bold;">${item.nama}</div>
                    <div style="font-size: 11px; color: #888;">NIK: ${item.nik}</div>
                </td>
                <td>
                    <div style="font-size: 13px;">${item.jenis}</div>
                    <div style="font-size: 11px; color: #666;">${item.mulai} s/d ${item.selesai}</div>
                </td>
                <td style="font-weight: bold; color: #0056b3;">${item.durasi} Hari</td>
                <td>
                    <div class="btn-group">
                        <button class="btn-action-acc" onclick="updateStatus(${item.id}, 'Setuju')">
                            <span>✔</span> Setuju
                        </button>
                        <button class="btn-action-rej" onclick="updateStatus(${item.id}, 'Tolak')">
                            <span>✖</span> Tolak
                        </button>
                    </div>
                </td>
            </tr>`;
    });
}