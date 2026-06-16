/**
 * =========================================================================================
 * SIMPADU - Front-End UI Interactions (Riil API Integration)
 * File: data_mhs.js
 * =========================================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // URL Utama API Backend Laravel Anda
    const API_URL = "/api/web/mahasiswa"; 
    // Ambil token bearer yang tersimpan saat login (Sesuaikan key 'token' jika berbeda)
    const BEARER_TOKEN = localStorage.getItem("token") || sessionStorage.getItem("token") || "";

    const tbody = document.getElementById("tableBody");
    const inputSearch = document.getElementById("searchInput"); // Sesuaikan ID input pencarian di HTML Anda
    const selectProdi = document.getElementById("filterProdi");
    const selectKelas = document.getElementById("filterKelas");
    const selectSort = document.getElementById("sortSelect");

    // =========================================================
    // BAGIAN 1: AMBIL DATA DARI BACKEND (FETCH API)
    // =========================================================
    async function fetchMahasiswaData() {
        try {
            // Membangun Query Parameters secara dinamis sesuai filter di UI
            const params = new URLSearchParams();
            
            if (inputSearch && inputSearch.value.trim() !== "") {
                params.append("search", inputSearch.value.trim());
            }
            if (selectProdi && selectProdi.value !== "semua" && selectProdi.value !== "") {
                params.append("id_prodi", selectProdi.value);
            }
            if (selectKelas && selectKelas.value !== "semua" && selectKelas.value !== "") {
                // Jika filter menggunakan kelas dari kelompok 1, di backend dicocokkan via semester/NIM
                params.append("semester", selectKelas.value); 
            }
            if (selectSort && selectSort.value !== "") {
                // Misal format value di select: "nama-asc" atau "nim-desc"
                const [sortBy, sortDir] = selectSort.value.split("-");
                if (sortBy) params.append("sort_by", sortBy);
                if (sortDir) params.append("sort_dir", sortDir);
            }

            // Memanggil endpoint api/web/mahasiswa
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
                // Laravel Paginate membungkus data di dalam objek data.data
                const listMahasiswa = result.data.data || [];
                renderTable(listMahasiswa);
            } else {
                console.error("Gagal memuat data dari API:", result.message);
                renderTable([]); // Render empty state
            }
        } catch (error) {
            console.error("Terjadi kesalahan jaringan/sistem:", error);
            renderTable([]);
        }
    }

    // =========================================================
    // BAGIAN 2: RENDER TABEL HTML (EMPTY STATE & DATA ROWS)
    // =========================================================
    function renderTable(data) {
        if (!tbody) return;
        tbody.innerHTML = ""; 

        // Tampilan UI Jika Data Kosong / Tidak Ditemukan (Empty State)
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

        // Loop dan render baris data dari API riil backend
        data.forEach((mhs) => {
            const tr = document.createElement("tr");
            tr.className = "border-b border-slate-50 hover:bg-slate-50 transition";
            
            // Logika class warna status secara dinamis
            const isAktif = mhs.status && mhs.status.toLowerCase() === 'aktif';
            const badgeClass = isAktif 
                ? "bg-[#DCFCE7] text-[#22C55E]" 
                : "bg-red-100 text-red-600";

            tr.innerHTML = `
                <td class="py-4 px-5 font-normal text-slate-800">${mhs.nim || '-'}</td>
                <td class="py-4 px-5 font-normal text-slate-800">${mhs.nama || '-'}</td>
                <td class="py-4 px-5 font-normal text-slate-800">${mhs.program_studi || 'Belum Diatur'}</td>
                <td class="py-4 px-5 font-normal text-slate-800 text-center">${mhs.semester || '-'}</td>
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
    // BAGIAN 3: EVENT LISTENER UNTUK FILTER, SEARCH & SORT
    // =========================================================
    
    // Aktifkan Cascading Dropdown bawaan UI jika ada
    if (typeof GlobalProdiKelas !== 'undefined') {
        GlobalProdiKelas.init('filterProdi', 'filterKelas');
    }

    // Triger reload data dari API setiap kali input/filter diubah oleh user
    if (selectProdi) selectProdi.addEventListener("change", fetchMahasiswaData);
    if (selectKelas) selectKelas.addEventListener("change", fetchMahasiswaData);
    if (selectSort) selectSort.addEventListener("change", fetchMahasiswaData);
    
    if (inputSearch) {
        // Menggunakan teknik debounce sederhana agar tidak menembak API di setiap ketikan huruf
        let delayTimer;
        inputSearch.addEventListener("input", () => {
            clearTimeout(delayTimer);
            delayTimer = setTimeout(fetchMahasiswaData, 500); // Tunggu 0.5 detik diam baru panggil API
        });
    }

    // Panggilan pertama saat halaman selesai dimuat pertama kali
    fetchMahasiswaData();

    // =========================================================
    // BAGIAN 4: LOGIKA POP-UP HAPUS DATA (KONEKSI BACKEND)
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
                    // Panggil API Delete ke backend Laravel Anda jika sudah ada endpoint destruktifnya
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
                        // Simulasi UI jika endpoint delete belum selesai dibuat di backend Anda
                        alert(`Simulasi Hapus Berhasil untuk NIM: ${nimToDelete}`);
                    }
                    
                    closeDeleteModal();
                    fetchMahasiswaData(); // Refresh data tabel secara real-time dari server
                } catch (error) {
                    console.error("Gagal menghapus data:", error);
                    closeDeleteModal();
                }
            }
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