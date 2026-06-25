// 1. Inisialisasi Data dari LocalStorage
let dataCuti = JSON.parse(localStorage.getItem('db_cuti_ykk')) || [];

// 2. Elemen Halaman
const loginPage = document.getElementById('login-page');
const karyawanPage = document.getElementById('karyawan-page');
const adminPage = document.getElementById('admin-page');

// 3. Fungsi Login
document.getElementById('btnLogin').addEventListener('click', function() {
    const user = document.getElementById('username').value;
    
    if (user === 'admin') {
        showPage('admin');
        renderAdmin();
    } else if (user === 'user') {
        showPage('karyawan');
        renderKaryawan();
    } else {
        alert("Username salah! Gunakan 'admin' atau 'user'");
    }
});

// 4. Fungsi Logout
document.querySelectorAll('.btn-logout').forEach(btn => {
    btn.addEventListener('click', () => location.reload());
});

// 5. Fungsi Navigasi Halaman
function showPage(role) {
    loginPage.classList.remove('active');
    karyawanPage.classList.remove('active');
    adminPage.classList.remove('active');

    if (role === 'admin') adminPage.classList.add('active');
    if (role === 'karyawan') karyawanPage.classList.add('active');
}

// 6. Fungsi Karyawan: Ajukan Cuti
document.getElementById('btnAjukan').addEventListener('click', function() {
    const nama = document.getElementById('nama_karyawan').value;
    const tgl = document.getElementById('tgl_mulai').value;
    const alasan = document.getElementById('alasan').value;

    if (!nama || !tgl || !alasan) {
        alert("Harap isi semua kolom!");
        return;
    }

    const pengajuanBaru = {
        id: Date.now(),
        nama: nama,
        tgl: tgl,
        alasan: alasan,
        status: 'Pending'
    };

    dataCuti.push(pengajuanBaru);
    saveData();
    alert("Pengajuan Berhasil!");
    
    // Reset Form
    document.getElementById('nama_karyawan').value = "";
    document.getElementById('alasan').value = "";
    renderKaryawan();
});

// 7. Render Tabel Karyawan
function renderKaryawan() {
    const tabel = document.getElementById('tabel-karyawan');
    tabel.innerHTML = "";
    dataCuti.forEach(item => {
        tabel.innerHTML += `
            <tr>
                <td>${item.tgl}</td>
                <td>${item.alasan}</td>
                <td class="status-${item.status.toLowerCase()}">${item.status}</td>
            </tr>
        `;
    });
}

// 8. Render Tabel Admin
function renderAdmin() {
    const tabel = document.getElementById('tabel-admin');
    tabel.innerHTML = "";
    dataCuti.forEach(item => {
        if (item.status === 'Pending') {
            tabel.innerHTML += `
                <tr>
                    <td>${item.nama}</td>
                    <td>${item.tgl}</td>
                    <td>${item.alasan}</td>
                    <td>
                        <button class="btn-acc" onclick="updateStatus(${item.id}, 'Setuju')">Setuju</button>
                        <button class="btn-rej" onclick="updateStatus(${item.id}, 'Tolak')">Tolak</button>
                    </td>
                </tr>
            `;
        }
    });
}

// 9. Fungsi Update Status (Admin)
function updateStatus(id, statusBaru) {
    dataCuti = dataCuti.map(item => {
        if (item.id === id) item.status = statusBaru;
        return item;
    });
    saveData();
    renderAdmin();
    alert("Status Berhasil Diperbarui!");
}

// 10. Simpan ke LocalStorage
function saveData() {
    localStorage.setItem('db_cuti_ykk', JSON.stringify(dataCuti));
}