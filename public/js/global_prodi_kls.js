/**
 * ==============================================================================
 * File: js/global_prodi_kelas.js
 * Logika Global untuk Interaksi Dropdown Prodi -> Kelas
 * ==============================================================================
 */

const GlobalProdiKelas = {
    // 1. Data relasi disimpan terpusat di sini
    dataRelasi: {
        "D3 Teknik Informatika": ["TI-4A", "TI-4B", "TI-4C", "TI-4D"],
        "D4 Animasi": [],
        "D3 Akuntansi": [],
        "D3 Manajemen Bisnis": [],
        "D3 Administrasi Bisnis": []
    },

    // 2. Fungsi inisiasi yang bisa dipanggil dari menu mana saja
    init: function(prodiElementId, kelasElementId) {
        const filterProdi = document.getElementById(prodiElementId);
        const filterKelas = document.getElementById(kelasElementId);

        if (!filterProdi || !filterKelas) return;

        filterProdi.addEventListener('change', () => {
            const prodiTerpilih = filterProdi.value;
            filterKelas.innerHTML = ""; // Bersihkan opsi sebelumnya

            if (prodiTerpilih === "semua" || !prodiTerpilih) {
                filterKelas.innerHTML = `<option value="semua">Semua Kelas</option>`;
                filterKelas.disabled = true;
            } else {
                const listKelas = this.dataRelasi[prodiTerpilih] || [];
                
                if (listKelas.length === 0) {
                    filterKelas.innerHTML = `<option value="">Tidak ada data kelas</option>`;
                    filterKelas.disabled = true; 
                } else {
                    filterKelas.innerHTML = `<option value="semua">Semua Kelas</option>`;
                    listKelas.forEach(kelas => {
                        filterKelas.innerHTML += `<option value="${kelas}">${kelas}</option>`;
                    });
                    filterKelas.disabled = false; 
                }
            }

            // [PENTING]: Beri tahu sistem bahwa nilai Kelas telah berubah secara paksa
            // Agar GlobalFilterSort langsung merender ulang tabelnya
            filterKelas.dispatchEvent(new Event('change'));
        });
    }
};