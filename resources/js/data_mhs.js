document.addEventListener("DOMContentLoaded", () => {

    // ==========================
    // Lucide Icons
    // ==========================
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // ==========================
    // Search Table
    // ==========================
    const searchInput = document.getElementById("search");

    if (searchInput) {
        searchInput.addEventListener("keyup", () => {
            const keyword = searchInput.value.toLowerCase();

            document.querySelectorAll("#tableBody tr")
                .forEach(row => {
                    row.style.display =
                        row.innerText.toLowerCase().includes(keyword)
                            ? ""
                            : "none";
                });
        });
    }

    // ==========================
    // Status Badge
    // ==========================
    document.querySelectorAll(".status").forEach(status => {

        const text = status.textContent.trim().toLowerCase();

        status.classList.remove(
            "aktif",
            "nonaktif",
            "cuti",
            "lulus",
            "drop-out",
            "mengundurkan-diri",
            "terminal"
        );

        status.classList.add(text.replace(/\s+/g, "-"));
    });

    // ==========================
    // Tombol Modal
    // ==========================
    const btnTambah = document.getElementById("btnTambah");
    const modal = document.getElementById("modalTambah");

    if (btnTambah && modal) {

        btnTambah.addEventListener("click", () => {
            modal.classList.add("show");
        });

        window.closeModal = function () {
            modal.classList.remove("show");
        };
    }

});

// ==========================
// Konfirmasi Hapus
// ==========================
function confirmDelete(form) {

    if (confirm("Yakin ingin menghapus data mahasiswa?")) {
        form.submit();
    }

}