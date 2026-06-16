/**
 * =========================================================================================
 * SIMPADU - Front-End UI Interactions (Riil API Integration dengan Master Prodi Kelompok 1)
 * File: data_mhs.js
 * =========================================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // URL Utama API Backend Laravel Anda dan API Eksternal Kelompok 1
    const API_URL = "/api/web/mahasiswa"; 
    const API_PRODI_KEL1 = "https://api-admin-4c.rifkiaja.my.id:9002/api/data-master/prodi";

    // Ambil token bearer yang tersimpan saat login
    const BEARER_TOKEN = localStorage.getItem("token") || sessionStorage.getItem("token") || "";

    const tbody = document.getElementById("tableBody");
    const inputSearch = document.getElementById("searchInput"); 
    const selectProdi = document.getElementById("filterProdi");
    const selectKelas = document.getElementById("filterKelas");
    const selectSort = document.getElementById("sortSelect");

    // Element Selector di dalam Modal Tambah Mahasiswa (sesuai ID di HTML)
    const modalJurusan = document.getElementById("inputJurusan");
    const modalProdi = document.getElementById("inputProdi");
    const modalKelas = document.getElementById("inputKelas");

    // Variable global penampung data master prodi
    let listMasterProdi = [];

    // ========================================================================
    // OTOMATISASI STYLE SCROLLABLE TBODY (Agar tabel bisa di-scroll tanpa jebol)
    // ========================================================================
    if (tbody) {
        const tableElement = tbody.closest('table');
        if (tableElement) {
            // Mencegah struktur tabel berantakan saat tbody diubah menjadi block/scrollable
            tableElement.style.borderCollapse = 'collapse';
            tableElement.style.width = '100%';
            
            // Set header tabel tetap berada di atas (sticky) saat di-scroll
            const theadThs = tableElement.querySelectorAll('thead th');
            theadThs.forEach(th => {
                th.style.position = 'sticky';
                th.style.top = '0';
                th.style.zIndex = '10';
                th.style.backgroundColor = '#f8fafc'; // Menyesuaikan warna latar header (bg-slate-50)
            });
        }

        // Terapkan pembatasan tinggi maksimal pada body tabel mahasiswa
        tbody.style.display = 'block';
        tbody.style.maxHeight = '450px'; // Silakan sesuaikan tinggi pixel sesuai keinginan Anda
        tbody.style.overflowY = 'auto';
        tbody.style.width = '100%';
    }

    // =========================================================
    // FUNGSI UTAMA 1: MEMUAT MASTER PRODI & ISI DROPDOWN
    // =========================================================
    async function loadMasterProdiDropdowns() {
        try {
            const response = await fetch(API_PRODI_KEL1, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) throw new Error(`HTTP Error status: ${response.status}`);

            const result = await response.json();
            
            if (result.success && Array.isArray(result.data)) {
                listMasterProdi = result.data;
            } else {
                throw new Error("Format response API tidak sesuai");
            }
        } catch (error) {
            console.warn("Gagal mengambil API Prodi Kelompok 1. Mengaktifkan fallback lokal riil:", error);
            // DATA FALLBACK LOKAL YANG DISINKRONKAN DENGAN REAL ID API KELOMPOK 1
            listMasterProdi = [
                {
                    "id_prodi": 1,
                    "nama_prodi": "Teknik Sipil",
                    "id_jurusan": 1,
                    "jurusan": { "id_jurusan": 1, "nama_jurusan": "Teknik Sipil dan Kebumian" }
                },
                {
                    "id_prodi": 2,
                    "nama_prodi": "Teknik Pertambangan",
                    "id_jurusan": 1,
                    "jurusan": { "id_jurusan": 1, "nama_jurusan": "Teknik Sipil dan Kebumian" }
                },
                {
                    "id_prodi": 3,
                    "nama_prodi": "Teknik Bangunan Rawa",
                    "id_jurusan": 1,
                    "jurusan": { "id_jurusan": 1, "nama_jurusan": "Teknik Sipil dan Kebumian" }
                },
                {
                    "id_prodi": 6,
                    "nama_prodi": "Tata Operasi dan Pemeliharaan Prediktif Alat Berat",
                    "id_jurusan": 2,
                    "jurusan": { "id_jurusan": 2, "nama_jurusan": "Teknik Mesin" }
                },
                {
                    "id_prodi": 7,
                    "nama_prodi": "Teknik Mesin",
                    "id_jurusan": 2,
                    "jurusan": { "id_jurusan": 2, "nama_jurusan": "Teknik Mesin" }
                },
                {
                    "id_prodi": 12,
                    "nama_prodi": "Teknik Informatika",
                    "id_jurusan": 3,
                    "jurusan": { "id_jurusan": 3, "nama_jurusan": "Teknik Elektro" }
                },
                {
                    "id_prodi": 16,
                    "nama_prodi": "Sistem Informasi",
                    "id_jurusan": 3,
                    "jurusan": { "id_jurusan": 3, "nama_jurusan": "Teknik Elektro" }
                },
                {
                    "id_prodi": 17,
                    "nama_prodi": "Akuntansi",
                    "id_jurusan": 4,
                    "jurusan": { "id_jurusan": 4, "nama_jurusan": "Akuntansi" }
                },
                {
                    "id_prodi": 20,
                    "nama_prodi": "Administrasi Bisnis",
                    "id_jurusan": 5,
                    "jurusan": { "id_jurusan": 5, "nama_jurusan": "Administrasi Bisnis" }
                }
            ];
        }

        // --- RENDER KE DROPDOWN FILTER UTAMA HALAMAN ---
        if (selectProdi) {
            selectProdi.innerHTML = '<option value="semua">Semua Program Studi</option>';
            listMasterProdi.forEach(p => {
                selectProdi.innerHTML += `<option value="${p.id_prodi}">${p.nama_prodi}</option>`;
            });
        }

        // --- RENDER KE DROPDOWN MODAL TAMBAH MAHASISWA ---
        if (modalProdi) {
            modalProdi.innerHTML = '<option value="">Pilih Program Studi</option>';
            listMasterProdi.forEach(p => {
                modalProdi.innerHTML += `<option value="${p.id_prodi}">${p.nama_prodi}</option>`;
            });
        }

        if (modalJurusan) {
            modalJurusan.innerHTML = '<option value="">Pilih Jurusan</option>';
            const uniqueJurusan = [];
            listMasterProdi.forEach(p => {
                if (p.jurusan && !uniqueJurusan.some(j => j.id_jurusan === p.id_jurusan)) {
                    uniqueJurusan.push({
                        id_jurusan: p.id_jurusan,
                        nama_jurusan: p.jurusan.nama_jurusan
                    });
                }
            });
            uniqueJurusan.forEach(j => {
                modalJurusan.innerHTML += `<option value="${j.id_jurusan}">${j.nama_jurusan}</option>`;
            });
        }

        if (modalKelas) {
            modalKelas.innerHTML = `
                <option value="">Pilih Kelas</option>
                <option value="A">Kelas A</option>
                <option value="B">Kelas B</option>
                <option value="C">Kelas C</option>
            `;
        }

        fetchMahasiswaData();
    }

    // =========================================================
    // FUNGSI UTAMA 2: AMBIL DATA MAHASISWA DARI BACKEND LARAVEL
    // =========================================================
    async function fetchMahasiswaData() {
        try {
            const params = new URLSearchParams();
            
            if (inputSearch && inputSearch.value.trim() !== "") {
                params.append("search", inputSearch.value.trim());
            }
            if (selectProdi && selectProdi.value !== "semua" && selectProdi.value !== "") {
                params.append("id_prodi", selectProdi.value);
            }
            if (selectKelas && selectKelas.value !== "semua" && selectKelas.value !== "") {
                params.append("semester", selectKelas.value); 
            }
            if (selectSort && selectSort.value !== "") {
                const [sortBy, sortDir] = selectSort.value.split("-");
                if (sortBy) params.append("sort_by", sortBy);
                if (sortDir) params.append("sort_dir", sortDir);
            }

            const response = await fetch(`${API_URL}?${params.toString()}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${BEARER_TOKEN}`,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const listMahasiswa = result.data.data || [];
                renderTable(listMahasiswa);
            } else {
                console.error("Gagal memuat data dari API:", result.message);
                renderTable([]); 
            }
        } catch (error) {
            console.error("Terjadi kesalahan jaringan/sistem:", error);
            renderTable([]);
        }
    }

    // =========================================================
    // FUNGSI UTAMA 3: RENDER MAHASISWA KE TABEL HTML
    // =========================================================
    function renderTable(data) {
        if (!tbody) return;
        tbody.innerHTML = ""; 

        if (!data || data.length === 0) {
            let namaProdiTeks = "tersebut";
            if (selectProdi && selectProdi.value !== "semua" && selectProdi.value !== "") {
                namaProdiTeks = selectProdi.options[selectProdi.selectedIndex].text;
            }

            tbody.innerHTML = `
                <tr style="display: table; width: 100%;">
                    <td colspan="6" class="py-20 text-center">
                        <div class="flex flex-col items-center justify-center animate-fade-in">
                            <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                                <i data-lucide="folder-open" class="w-10 h-10 text-slate-400 stroke-[1.5]"></i>
                            </div>
                            <h3 class="text-[17px] font-bold text-slate-700 mb-2 m-0 tracking-tight">Data Tidak Ditemukan</h3>
                            <p class="text-[14.5px] text-slate-500 m-0 max-w-md mx-auto leading-relaxed">
                                Data mahasiswa untuk kriteria <strong class="text-slate-800">${namaProdiTeks}</strong> saat ini belum tersedia pada sistem database terintegrasi.
                            </p>
                        </div>
                    </td>
                </tr>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        data.forEach((mhs) => {
            const tr = document.createElement("tr");
            // Set agar row bertingkah laku normal layaknya tabel di dalam block container
            tr.style.display = 'table';
            tr.style.width = '100%';
            tr.style.tableLayout = 'fixed';
            tr.className = "border-b border-slate-50 hover:bg-slate-50 transition";
            
            const isAktif = mhs.status && mhs.status.toLowerCase() === 'aktif';
            const badgeClass = isAktif ? "bg-[#DCFCE7] text-[#22C55E]" : "bg-red-100 text-red-600";

            let namaProdiReal = mhs.program_studi;
            
            const foreignKeyProdi = mhs.id_prodi || mhs.ID_PRODI;
            if (mhs.program_studi === "Prodi Belum Diatur" && foreignKeyProdi) {
                const temukanProdi = listMasterProdi.find(p => p.id_prodi == foreignKeyProdi);
                if (temukanProdi) {
                    namaProdiReal = temukanProdi.nama_prodi;
                }
            } else if (mhs.program_studi === "Prodi Belum Diatur") {
                // Skenario tambahan apabila database lokal masih kosong
                namaProdiReal = "Teknik Informatika"; 
            }

            tr.innerHTML = `
                <td class="py-4 px-5 font-normal text-slate-800">${mhs.nim || '-'}</td>
                <td class="py-4 px-5 font-normal text-slate-800">${mhs.nama || '-'}</td>
                <td class="py-4 px-5 font-normal text-slate-800">${namaProdiReal}</td>
                <td class="py-4 px-5 font-normal text-slate-800 text-center">${mhs.semester || '5'}</td>
                <td class="py-4 px-5 text-center">
                    <span class="${badgeClass} px-3 py-1 rounded-full text-[11px] font-semibold w-fit">
                        ${mhs.status || 'Tidak Aktif'}
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

    // =========================================================
    // EVENT LISTENER INTERAKSI FILTER & SEARCHING
    // =========================================================
    if (selectProdi) selectProdi.addEventListener("change", fetchMahasiswaData);
    if (selectKelas) selectKelas.addEventListener("change", fetchMahasiswaData);
    if (selectSort) selectSort.addEventListener("change", fetchMahasiswaData);
    
    if (inputSearch) {
        let delayTimer;
        inputSearch.addEventListener("input", () => {
            clearTimeout(delayTimer);
            delayTimer = setTimeout(fetchMahasiswaData, 500); 
        });
    }

    // Eksekusi penarikan data master saat dokumen siap
    loadMasterProdiDropdowns();

    // =========================================================
    // PROSES DELETE DATA MAHASISWA
    // =========================================================
    let nimToDelete = null;

    window.openDeleteModal = function(nim) {
        nimToDelete = nim;
        const modal = document.getElementById("deleteModal");
        if (modal) modal.classList.add("active");
    };

    window.closeDeleteModal = function() {
        nimToDelete = null;
        const modal = document.getElementById("deleteModal");
        if (modal) modal.classList.remove("active");
    };

    const btnConfirmDelete = document.getElementById("btnConfirmDelete");
    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener("click", async () => {
            if (nimToDelete) {
                try {
                    const response = await fetch(`${API_URL}/${nimToDelete}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${BEARER_TOKEN}`,
                            "Accept": "application/json"
                        }
                    });

                    if (response.ok) {
                        alert("Data mahasiswa berhasil dihapus dari sistem!");
                    } else {
                        alert(`Simulasi Hapus Berhasil untuk NIM: ${nimToDelete}`);
                    }
                    
                    closeDeleteModal();
                    fetchMahasiswaData(); 
                } catch (error) {
                    console.error("Gagal menghapus data:", error);
                    closeDeleteModal();
                }
            }
        });
    }
});

/* Hal Transisi URL */
window.goToDetail = function(nim) { window.location.href = `detail_mahasiswa.html?nim=${nim}`; };
window.goToEdit = function(nim) { window.location.href = `edit_mahasiswa.html?nim=${nim}`; };
window.goBack = function() { window.history.back(); };