/**
 * ==============================================================================
 * File: js/global_filter_sort.js
 * Logika Global untuk Filter dan Sorting (Tanpa Mengubah UI HTML Sedikitpun)
 * ==============================================================================
 * [BE-NOTE]: 
 * Logika .filter() dan .sort() JS ini digunakan untuk Mockup UI (Interaksi Front-End).
 * Saat integrasi Back-End di Laravel Blade, file ini boleh tidak digunakan.
 * Backend cukup menambahkan atribut "onchange" pada <select> HTML asli
 * untuk langsung hit API dan me-reload data dari Server/Database.
 * ==============================================================================
 */

const GlobalFilterSort = {
    init: function(config) {
        
        const applyLogic = () => {
            let processedData = [...config.data];

            // 1. Terapkan Logika Semua Filter Dinamis yang Didaftarkan
            if (config.filters) {
                config.filters.forEach(filter => {
                    const el = document.getElementById(filter.id);
                    // Filter jika elemen ditemukan dan value-nya bukan 'semua'
                    if (el && el.value !== 'semua' && el.value !== '') {
                        processedData = processedData.filter(item => item[filter.key] === el.value);
                    }
                });
            }

            // 2. Terapkan Logika Sorting Dinamis
            if (config.sortId) {
                const sortEl = document.getElementById(config.sortId);
                if (sortEl && sortEl.value) {
                    // misal value = "nama-asc" akan dipecah menjadi key="nama", dir="asc"
                    const [key, dir] = sortEl.value.split('-'); 
                    
                    if (key && dir) {
                        processedData.sort((a, b) => {
                            let valA = a[key] ? String(a[key]).toLowerCase() : "";
                            let valB = b[key] ? String(b[key]).toLowerCase() : "";

                            if (dir === 'asc') return valA.localeCompare(valB);
                            if (dir === 'desc') return valB.localeCompare(valA);
                            return 0;
                        });
                    }
                }
            }

            // 3. Kirim kembali data yang sudah di-filter/sort untuk di-render oleh file pemanggil
            config.onRender(processedData);
        };

        // Pasang Event Listener ke Dropdown HTML asli yang ada di file UI
        if (config.filters) {
            config.filters.forEach(filter => {
                const el = document.getElementById(filter.id);
                if (el) el.addEventListener('change', applyLogic);
            });
        }
        
        if (config.sortId) {
            const sortEl = document.getElementById(config.sortId);
            if (sortEl) sortEl.addEventListener('change', applyLogic);
        }

        // Render data perdana saat file HTML selesai diload
        applyLogic();

        // Kembalikan fungsi untuk me-refresh data (misal setelah hapus/update item)
        return {
            updateData: function(newData) {
                config.data = newData;
                applyLogic();
            }
        };
    }
};