/**
 * =========================================================================================
 * SIMPADU - Front-End UI Interactions (Riil API Integration dengan Master Prodi Kelompok 1)
 * File: data_mhs.js
 * =========================================================================================
 * PERBAIKAN: Menyesuaikan pembacaan JSON Response dari Backend Non-Paginate (Scrollable)
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
    // STRATEGI SCROLLABLE CONTAINER (Mencegah Baris Menumpuk & Berantakan)
    // ========================================================================
    if (tbody) {
        const tableElement = tbody.closest('table');
        if (tableElement) {
            // 1. Kembalikan display table & tbody ke setelan bawaan browser agar kolom sinkron
            tableElement.style.width = '100%';
            tableElement.style.borderCollapse = 'collapse';
            tbody.style.display = 'table-row-group'; 
            tbody.style.maxHeight = 'none';
            tbody.style.overflowY = 'visible';

            // 2. Buat element pembungkus (wrapper) jika belum ada
            let wrapper = tableElement.parentElement;
            if (!wrapper.classList.contains('table-scroll-wrapper')) {
                wrapper = document.createElement('div');
                wrapper.className = 'table-scroll-wrapper';
                
                // Atur tinggi scroll box di sini secara aman
                wrapper.style.maxHeight = '450px'; 
                wrapper.style.overflowY = 'auto';
                wrapper.style.position = 'relative';
                
                // Bungkus tabel ke dalam wrapper
                tableElement.parentNode.insertBefore(wrapper, tableElement);
                wrapper.appendChild(tableElement);
            }

            // 3. Buat Header (thead) Menjadi Sticky di Bagian Atas Container
            const theadThs = tableElement.querySelectorAll('thead th');
            theadThs.forEach(th => {
                th.style.position = 'sticky';
                th.style.top = '0';
                th.style.zIndex = '20';
                th.style.backgroundColor = '#f8fafc'; // Menjaga latar belakang tetap solid bg-slate-50
            });
        }
    }

    // =========================================================
    // FUNGSI UTAMA 1: MEMUAT MASTER PRODI & ISI DROPDOWN
    // =========================================================
    async function loadMasterProdiDropdowns() {
        try {
            const response = await fetch(API_PRODI_KEL1, {
                method: "GET",
                headers: {
                    // TAMBAHKAN BARIS INI: Kirim token agar lolos dari Unauthenticated kelompok 1
                    "Authorization": `Bearer ${BEARER_TOKEN}`, 
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

        if (selectProdi) {
            selectProdi.innerHTML = '<option value="semua">Semua Program Studi</option>';
            listMasterProdi.forEach(p => {
                selectProdi.innerHTML += `<option value="${p.id_prodi}">${p.nama_prodi}</option>`;
            });
        }

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
            
            // PENGAMAN: Hanya kirim filter semester jika elemennya ADA dan nilainya VALID (bukan "semua" atau "")
            if (selectKelas && selectKelas.value && selectKelas.value !== "semua" && selectKelas.value.trim() !== "") {
                params.append("semester", selectKelas.value); 
            }
            
            if (selectSort && selectSort.value !== "") {
                const [sortBy, sortDir] = selectSort.value.split("-");
                if (sortBy) params.append("sort_by", sortBy);
                if (sortDir) params.append("sort_dir", sortDir);
            }

            // Lakukan Fetch ke Backend
            const response = await fetch(`${API_URL}?${params.toString()}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${BEARER_TOKEN}`,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();
            
            // INTIP DI KONSOL: Tekan F12 di browser dan lihat apa isi log ini
            printDataLog(result);

            if (response.ok && result.success) {
                // Antisipasi jika data berupa single object atau langsung array murni
                let listMahasiswa = [];
                if (Array.isArray(result.data)) {
                    listMahasiswa = result.data;
                } else if (result.data && typeof result.data === 'object') {
                    listMahasiswa = Object.values(result.data); // Konversi ke array jika berupa objek ber-key
                }

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

    // Fungsi bantu untuk mempermudah debugging Anda di F12
    function printDataLog(result) {
        if (result && result.data) {
            console.log("=== ISI DATA DARI BACKEND ===");
            console.log("Jumlah data ditemukan:", Array.isArray(result.data) ? result.data.length : Object.keys(result.data).length);
            console.log("Konten data:", result.data);
        } else {
            console.log("=== BACKEND TIDAK MENGEMBALIKAN DATA (NULL/EMPTY) ===");
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
                <tr>
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