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

    const API_URL = "/api/web/mahasiswa"; 
    const BEARER_TOKEN = localStorage.getItem("token") || sessionStorage.getItem("token") || "";

    const tbody = document.getElementById("tableBody");
    const selectProdi = document.getElementById("filterProdi");
    const selectKelas = document.getElementById("filterKelas");
    const selectSort = document.getElementById("sortSelect");

    // Variabel untuk melacak halaman saat ini
    let currentPage = 1;

    // =========================================================
    // BAGIAN 1: AMBIL DATA DARI BACKEND (FETCH API)
    // =========================================================
    async function fetchMahasiswaData() {
        try {
            const params = new URLSearchParams();
            
            // Sertakan halaman saat ini ke dalam request API
            params.append("page", currentPage);

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
                renderPagination(result.data); // Render tombol selanjutnya/sebelumnya
            } else {
                renderTable([]); 
                document.getElementById("paginationContainer").classList.add("hidden");
            }
        } catch (error) {
            console.error("Terjadi kesalahan:", error);
            renderTable([]);
            document.getElementById("paginationContainer").classList.add("hidden");
        }
    }

    // =========================================================
    // BAGIAN 2: RENDER TABEL HTML
    // =========================================================
    function renderTable(data) {
        if (!tbody) return;
        tbody.innerHTML = ""; 

        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="py-20 text-center">
                        <div class="flex flex-col items-center justify-center animate-fade-in">
                            <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                                <i data-lucide="folder-open" class="w-10 h-10 text-slate-400 stroke-[1.5]"></i>
                            </div>
                            <h3 class="text-[17px] font-bold text-slate-700 mb-2 m-0 tracking-tight">Data Tidak Ditemukan</h3>
                            <p class="text-[14.5px] text-slate-500 m-0 max-w-md mx-auto leading-relaxed">
                                Data mahasiswa untuk kriteria saat ini belum tersedia pada sistem database terintegrasi.
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
            const badgeClass = isAktif 
                ? "bg-[#DCFCE7] text-[#16A34A]" 
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
    // BAGIAN 3: RENDER PAGINATION (TOMBOL NEXT/PREV)
    // =========================================================
    function renderPagination(metaData) {
        const container = document.getElementById("paginationContainer");
        const pageInfo = document.getElementById("pageInfo");
        const pageButtons = document.getElementById("pageButtons");

        // Sembunyikan jika tidak ada data
        if (!metaData || metaData.total === 0) {
            container.classList.add("hidden");
            return;
        }

        container.classList.remove("hidden");
        
        // Update teks (Misal: "Menampilkan 1 - 10 dari 50 data")
        const from = metaData.from || 0;
        const to = metaData.to || 0;
        const total = metaData.total || 0;
        pageInfo.innerHTML = `Menampilkan <span class="font-semibold text-slate-800">${from} - ${to}</span> dari <strong class="text-slate-800">${total}</strong> data`;

        let buttonsHTML = "";

        // Tombol Sebelumnya
        if (metaData.current_page > 1) {
            buttonsHTML += `<button onclick="changePage(${metaData.current_page - 1})" class="px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50 transition cursor-pointer">Sebelumnya</button>`;
        } else {
            buttonsHTML += `<button disabled class="px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-400 bg-slate-50 cursor-not-allowed">Sebelumnya</button>`;
        }

        // Indikator halaman saat ini
        buttonsHTML += `<span class="px-4 py-1.5 text-sm font-semibold text-blue-600 bg-blue-50 rounded">${metaData.current_page}</span>`;

        // Tombol Selanjutnya
        if (metaData.current_page < metaData.last_page) {
            buttonsHTML += `<button onclick="changePage(${metaData.current_page + 1})" class="px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50 transition cursor-pointer">Selanjutnya</button>`;
        } else {
            buttonsHTML += `<button disabled class="px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-400 bg-slate-50 cursor-not-allowed">Selanjutnya</button>`;
        }

        pageButtons.innerHTML = buttonsHTML;
    }

    // Fungsi klik tombol pindah halaman
    window.changePage = function(pageNumber) {
        currentPage = pageNumber;
        fetchMahasiswaData(); // Load data baru dari API
    };

    // =========================================================
    // BAGIAN 4: EVENT LISTENER UNTUK FILTER & SORT
    // =========================================================
    function resetAndFetch() {
        currentPage = 1; // Jika filter diubah, kembali ke halaman 1
        fetchMahasiswaData();
    }

    if (typeof GlobalProdiKelas !== 'undefined') {
        GlobalProdiKelas.init('filterProdi', 'filterKelas');
    }

    if (selectProdi) selectProdi.addEventListener("change", resetAndFetch);
    if (selectKelas) selectKelas.addEventListener("change", resetAndFetch);
    if (selectSort) selectSort.addEventListener("change", resetAndFetch);
    
    // Panggilan pertama saat halaman selesai dimuat
    fetchMahasiswaData();

    // =========================================================
    // BAGIAN 5: LOGIKA POP-UP HAPUS DATA
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