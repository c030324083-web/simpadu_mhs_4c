/**
 * SIMPADU - Controller Logika Jadwal Perkuliahan
 * File: jadwal_kuliah.js
 */

document.addEventListener('DOMContentLoaded', () => {
    const bodyRole = document.body.getAttribute('data-role');

    if (bodyRole === 'admin') {
        initAdminJadwalTransitions();
    } else if (bodyRole === 'mhs') {
        initMhsJadwal();
    }
});

/**
 * =========================================================
 * LOGIKA MAHASISWA
 * =========================================================
 */
function initMhsJadwal() {
    const titleElement = document.getElementById('js-mhs-semester-title');
    const kelasMahasiswaLogin = "TI-4C"; // Simulasi kelas dari session

    if (titleElement) {
        titleElement.textContent = `Daftar Jadwal Kuliah Kelas ${kelasMahasiswaLogin}`;
    }
}

/**
 * =========================================================
 * LOGIKA ADMIN (Dengan Perbaikan Filter Bertingkat)
 * =========================================================
 */
function initAdminJadwalTransitions() {
    const viewDaftarKelas = document.getElementById('js-view-daftar-kelas');
    const viewJadwal = document.getElementById('js-view-jadwal');
    const btnBack = document.getElementById('js-btn-back');
    const jadwalTitle = document.getElementById('js-jadwal-title');
    const tbodyKelas = document.getElementById('js-table-kelas-tbody');
    
    // Elemen Filter & Sort
    const filterProdi = document.getElementById('js-filter-prodi');
    const filterKelas = document.getElementById('js-filter-kelas');
    const sortSelect = document.getElementById('js-sort-by');

    if (!viewDaftarKelas || !viewJadwal) return;

    // 1. DATA MASTER
    // Relasi dropdown Program Studi -> Kelas
    const dataRelasiKelas = {
        "D3 Teknik Informatika": ["TI-4A", "TI-4B", "TI-4C"],
        "D4 Animasi": ["AN-2A", "AN-2B"],
        "D3 Akuntansi": [] // Skenario Kosong: Prodi ini tidak punya kelas
    };

    // Data Dummy Tabel
    let dummyDataKelas = [
        { id: "TI01", kelas: "TI-4A", prodi: "D3 Teknik Informatika", mhs: "25" },
        { id: "TI02", kelas: "TI-4B", prodi: "D3 Teknik Informatika", mhs: "28" },
        { id: "TI03", kelas: "TI-4C", prodi: "D3 Teknik Informatika", mhs: "22" },
        { id: "AN01", kelas: "AN-2A", prodi: "D4 Animasi", mhs: "20" },
        { id: "AN02", kelas: "AN-2B", prodi: "D4 Animasi", mhs: "18" }
    ];

    // 2. FUNGSI RENDER TABEL
    function renderTableKelas(data) {
        if (!tbodyKelas) return;
        tbodyKelas.innerHTML = ""; 

        // Skenario jika data kosong (Termasuk jika filter tidak menemukan kecocokan)
        if (data.length === 0) {
            tbodyKelas.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-slate-500 text-[13px] font-medium">Tidak ada jadwal kelas yang sesuai.</td></tr>`;
            return;
        }

        data.forEach(item => {
            const tr = document.createElement("tr");
            tr.className = "clickable-row js-class-row border-b border-slate-50 hover:bg-slate-50 transition";
            tr.setAttribute("data-kelas", item.kelas);
            
            tr.innerHTML = `
                <td class="py-4 px-5 font-normal text-slate-800">${item.id}</td>
                <td class="py-4 px-5 font-normal text-slate-800">${item.kelas}</td>
                <td class="py-4 px-5 font-normal text-slate-800">${item.prodi}</td>
                <td class="py-4 px-5 font-normal text-slate-800">${item.mhs}</td>
            `;
            
            tr.addEventListener('click', function() {
                const namaKelas = this.getAttribute('data-kelas');
                if (jadwalTitle && namaKelas) jadwalTitle.textContent = `Daftar Jadwal Kuliah Kelas ${namaKelas}`;
                viewDaftarKelas.classList.replace('block', 'hidden');
                viewJadwal.classList.replace('hidden', 'block');
            });

            tbodyKelas.appendChild(tr);
        });
    }

    // 3. FUNGSI EKSEKUSI FILTER & SORTING
    function applyFilters() {
        let processedData = [...dummyDataKelas];

        // Filter Prodi
        if (filterProdi.value !== 'semua' && filterProdi.value !== '') {
            processedData = processedData.filter(item => item.prodi === filterProdi.value);
        }

        // Filter Kelas (Abaikan jika value-nya 'semua' atau kosong karena di-disable)
        if (filterKelas.value !== 'semua' && filterKelas.value !== '') {
            processedData = processedData.filter(item => item.kelas === filterKelas.value);
        }

        // Sorting
        const [key, dir] = sortSelect.value.split('-'); 
        if (key && dir) {
            processedData.sort((a, b) => {
                let valA = a[key] ? String(a[key]).toLowerCase() : "";
                let valB = b[key] ? String(b[key]).toLowerCase() : "";
                if (dir === 'asc') return valA.localeCompare(valB);
                if (dir === 'desc') return valB.localeCompare(valA);
                return 0;
            });
        }

        // Render ulang tabel dengan data yang sudah difilter/disortir
        renderTableKelas(processedData);
    }

    // 4. EVENT LISTENER: PERUBAHAN PROGRAM STUDI
    if (filterProdi && filterKelas) {
        filterProdi.addEventListener('change', () => {
            const prodiTerpilih = filterProdi.value;
            filterKelas.innerHTML = ""; // Bersihkan opsi sebelumnya

            if (prodiTerpilih === "semua" || !prodiTerpilih) {
                filterKelas.innerHTML = `<option value="semua">Semua Kelas</option>`;
                filterKelas.disabled = true;
                filterKelas.classList.add('bg-gray-50', 'text-gray-400');
            } else {
                const listKelas = dataRelasiKelas[prodiTerpilih] || [];
                
                if (listKelas.length === 0) {
                    // LOGIKA JIKA PRODI TIDAK ADA KELAS (Kosong)
                    filterKelas.innerHTML = `<option value="">Tidak ada kelas</option>`;
                    filterKelas.disabled = true; // Matikan Dropdown
                    filterKelas.classList.add('bg-gray-50', 'text-gray-400');
                } else {
                    // LOGIKA JIKA PRODI PUNYA KELAS
                    filterKelas.innerHTML = `<option value="semua">Semua Kelas</option>`;
                    listKelas.forEach(kelas => {
                        filterKelas.innerHTML += `<option value="${kelas}">${kelas}</option>`;
                    });
                    filterKelas.disabled = false; // Aktifkan Dropdown
                    filterKelas.classList.remove('bg-gray-50', 'text-gray-400');
                }
            }
            
            // Setelah opsi kelas diubah, paksa jalankan pembaruan tabel
            applyFilters();
        });

        // Event Listener untuk Filter Kelas & Sort By
        filterKelas.addEventListener('change', applyFilters);
        sortSelect.addEventListener('change', applyFilters);
    }

    // 5. RENDER PERTAMA KALI SAAT HALAMAN DIMUAT
    filterKelas.disabled = true; // Default saat load 'Semua Program Studi'
    filterKelas.classList.add('bg-gray-50', 'text-gray-400');
    applyFilters();

    // 6. LOGIKA KEMBALI KE DAFTAR KELAS
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            viewJadwal.classList.replace('block', 'hidden');
            viewDaftarKelas.classList.replace('hidden', 'block');
        });
    }
}