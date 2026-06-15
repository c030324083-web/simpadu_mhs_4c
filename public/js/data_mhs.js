/**
 * =========================================================================================
 * SIMPADU - Front-End UI Interactions
 * File: data_mhs.js
 * =========================================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // =========================================================
    // BAGIAN A.1: AKTIFKAN CASCADING DROPDOWN (PRODI -> KELAS)
    // =========================================================
    // Memanggil file global_prodi_kelas.js (Pastikan file ini sudah di-load di HTML)
    if (typeof GlobalProdiKelas !== 'undefined') {
        GlobalProdiKelas.init('filterProdi', 'filterKelas');
    }

    // =========================================================
    // BAGIAN A.2: RENDER DATA DUMMY, FILTER, & SORTING
    // =========================================================
    
    // [BE-NOTE]: Data ini dummy. Tambahkan properti 'kelas' agar filter kelas bekerja.
    let dummyData = [
        {
            nim: "C030324011",
            nama: "Aufa Qonita Salsabila",
            prodi: "D3 Teknik Informatika",
            kelas: "TI-4C", // Ditambahkan untuk filter kelas
            semester: "4",
            status: "Aktif"
        },
        {
            nim: "C030324005",
            nama: "Budi Santoso",
            prodi: "D3 Teknik Informatika",
            kelas: "TI-4A", // Ditambahkan untuk filter kelas
            semester: "4",
            status: "Aktif"
        },
        {
            nim: "C030324022",
            nama: "Zahra Larasati",
            prodi: "D4 Animasi",
            kelas: "AN-2A", // Ditambahkan untuk filter kelas
            semester: "2",
            status: "Aktif"
        }
    ];

    const tbody = document.getElementById("tableBody");

    // 1. Fungsi Utama: Render Tabel HTML
    function renderTable(data) {
        if (!tbody) return;
        tbody.innerHTML = ""; 

        // ================================================================
        // [LOGIKA BARU]: Tampilan UI Jika Data Kosong (Empty State)
        // ================================================================
        if (data.length === 0) {
            let namaProdiTeks = "tersebut";
            const filterProdi = document.getElementById("filterProdi");
            
            // Cek jika filter Prodi ada dan bukan memilih "Semua"
            if (filterProdi && filterProdi.value !== "semua" && filterProdi.value !== "") {
                namaProdiTeks = filterProdi.options[filterProdi.selectedIndex].text;
            }

            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="py-20 text-center">
                        <div class="flex flex-col items-center justify-center animate-fade-in">
                            <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                                <i data-lucide="folder-open" class="w-10 h-10 text-slate-400 stroke-[1.5]"></i>
                            </div>
                            <h3 class="text-[17px] font-bold text-slate-700 mb-2 m-0 tracking-tight">Data Belum Tersedia</h3>
                            <p class="text-[14.5px] text-slate-500 m-0 max-w-md mx-auto leading-relaxed">
                                Program studi <strong class="text-slate-800">${namaProdiTeks}</strong> saat ini belum memiliki data pembagian kelas maupun data mahasiswa.
                            </p>
                        </div>
                    </td>
                </tr>
            `;
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }
        // ================================================================

        data.forEach((mhs) => {
            const tr = document.createElement("tr");
            tr.className = "border-b border-slate-50 hover:bg-slate-50 transition";
            
            // Class button aksi kembali 100% tanpa tambahan class Tailwind
            tr.innerHTML = `
                <td class="py-4 px-5 font-normal text-slate-800">${mhs.nim}</td>
                <td class="py-4 px-5 font-normal text-slate-800">${mhs.nama}</td>
                <td class="py-4 px-5 font-normal text-slate-800">${mhs.prodi}</td>
                <td class="py-4 px-5 font-normal text-slate-800 text-center">${mhs.semester}</td>
                <td class="py-4 px-5 text-center">
                    <span class="bg-[#DCFCE7] text-[#22C55E] px-3 py-1 rounded-full text-[11px] font-semibold w-fit">
                        ${mhs.status}
                    </span>
                </td>
                <td class="py-4 px-5 text-center">
                    <div class="aksi">
                        <button type="button" title="Detail" onclick="goToDetail('${mhs.nim}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button type="button" title="Edit" onclick="goToEdit('${mhs.nim}')">
                            <i data-lucide="edit"></i>
                        </button>
                        <button type="button" title="Hapus" onclick="openDeleteModal('${mhs.nim}')">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // 2. Hubungkan Data Dummy dengan Global Filter & Sort
    let tableManager = null;
    if (typeof GlobalFilterSort !== 'undefined') {
        tableManager = GlobalFilterSort.init({
            data: dummyData,
            filters: [
                { id: 'filterProdi', key: 'prodi' }, 
                { id: 'filterKelas', key: 'kelas' } // [BARU]: Menambahkan filter kelas ke mesin pencari
            ],
            sortId: 'sortSelect', 
            onRender: function(processedData) {
                renderTable(processedData);
            }
        });
    } else {
        console.warn("GlobalFilterSort tidak ditemukan!");
        renderTable(dummyData);
    }

    // =========================================================
    // BAGIAN B: LOGIKA POP-UP HAPUS DATA MAHASISWA
    // =========================================================
    let nimToDelete = null;

    window.openDeleteModal = function(nim) {
        nimToDelete = nim;
        const modal = document.getElementById("deleteModal");
        if (modal) {
            modal.classList.add("active");
        }
    };

    window.closeDeleteModal = function() {
        nimToDelete = null;
        const modal = document.getElementById("deleteModal");
        if (modal) {
            modal.classList.remove("active");
        }
    };

    window.hapusMahasiswa = function(nim) {
        window.openDeleteModal(nim);
    };

    const btnConfirmDelete = document.getElementById("btnConfirmDelete");
    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener("click", () => {
            if (nimToDelete) {
                console.log("Melakukan hapus ke Backend untuk NIM:", nimToDelete);
                
                // Menghapus data dari array dummy
                dummyData = dummyData.filter(mhs => mhs.nim !== nimToDelete);
                
                // Refresh Tabel
                if (tableManager) {
                    tableManager.updateData(dummyData);
                } else {
                    renderTable(dummyData);
                }
                closeDeleteModal();
            }
        });
    }

    // =========================================================
    // BAGIAN C: LOGIKA BUTTON LAINNYA
    // =========================================================
    const btnUpdate = document.getElementById("btnUpdate");
    if (btnUpdate) {
        btnUpdate.addEventListener("click", (e) => {
            e.preventDefault(); 
            alert("Simulasi UI: Menyimpan perubahan data mahasiswa...");
            goBack(); 
        });
    }

    const btnSimpanTop = document.getElementById("btnSimpanTop");
    if (btnSimpanTop) {
        btnSimpanTop.addEventListener("click", (e) => {
            e.preventDefault();
            alert("Simulasi UI: Menyimpan perubahan data mahasiswa (Tombol Atas)...");
            goBack(); 
        });
    }
});

/* =====================================================================
   FUNGSI TRANSISI HALAMAN
   ===================================================================== */
window.goToDetail = function(nim) {
    window.location.href = `detail_mahasiswa.html?nim=${nim}`; 
};

window.goToEdit = function(nim) {
    window.location.href = `edit_mahasiswa.html?nim=${nim}`;
};

window.goBack = function() {
    const userRole = document.body.getAttribute('data-role');
    if (userRole === 'mhs') {
        window.history.back(); 
    } else {
        window.location.href = "data_mahasiswa.html";
    }
};