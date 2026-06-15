document.addEventListener("DOMContentLoaded", function() {
    const headerContainer = document.getElementById("header");

    if (headerContainer) {
        // Fetch komponen header secara asynchronous
        // Pastikan path sudah sesuai dengan struktur folder kamu
        fetch("../../components/header.html")
            .then(res => res.text())
            .then(data => {
                // 1. Suntikkan HTML komponen ke kontainer
                headerContainer.innerHTML = data;

                // 2. Jalankan fungsi pengaturan konten & interaksi
                initHeaderContent();
                initAvatarDropdown();
                initLogout();

                // 3. Render ulang icon dari library Lucide
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            })
            .catch(err => console.error("Gagal memuat komponen header:", err));
    }
});

/* ================= SET DATA KONTEN HEADER ================= */
function initHeaderContent() {
    const page = document.body.getAttribute("data-page");
    const role = document.body.getAttribute("data-role");
    const title = document.body.getAttribute("data-page-title") || "";
    const greeting = document.body.getAttribute("data-greeting") || "";
    
    // AMBIL PENGATURAN SEARCH BAR DARI HTML
    const showSearch = document.body.getAttribute("data-search"); 

    const pageTitle = document.getElementById("pageTitle");
    const welcomeText = document.getElementById("welcomeText");
    const academicYearText = document.getElementById("academicYear"); // <-- Target elemen baru untuk Tahun Akademik
    const dropdown = document.getElementById("dropdownMenu");
    const arrow = document.getElementById("arrowIcon");
    
    // TARGETKAN SEARCH BAR DI KOMPONEN HEADER
    const searchBar = document.getElementById("headerSearchBar");

    // Ambil data user dari localStorage
    const name = localStorage.getItem("name") || "User";
    const semester = localStorage.getItem("semester") || "?"; // <-- Mengambil data semester
    
    const initial = name.split(" ").map(n => n[0]).join("").toUpperCase();

    // 1. Mengisi Judul Halaman
    if (pageTitle) pageTitle.innerText = title;

    // 2. LOGIKA GREETING & TAHUN AKADEMIK (Dipisahkan berdasarkan halaman)
    if (welcomeText) {
        if (page === "dashboard") {
            // Jika halaman dashboard -> "Selamat datang, Andi Pratama" atau "Selamat datang, Admin Poliban"
            welcomeText.innerText = `${greeting}, ${name}`;
            
            // --- LOGIKA MUNCULKAN TAHUN AKADEMIK HANYA DI DASHBOARD MHS & ADMIN ---
            if (academicYearText) {
                academicYearText.classList.remove("hidden"); // Munculkan elemen (hapus class hidden)
                academicYearText.innerText = "Memuat Tahun Akademik..."; // Teks loading transisi awal
                
                // [BE-NOTE]: Integrasikan Fetch API Kelompok 1 di sini untuk mengambil data dinamis dari database
                setTimeout(() => {
                    // Simulasi response data dari API Kelompok 1
                    const apiTahunAkademik = "2025/2026"; 
                    academicYearText.innerText = `Tahun Akademik ${apiTahunAkademik}`;
                }, 400); 
            }
        } 
        else if (page === "jadwal" && role === "mhs") {
            // Khusus halaman Jadwal, tambahkan teks Semester
            // Output: "Semua Jadwal Perkuliahan Semester 4"
            welcomeText.innerText = `${greeting} ${semester}`;
            
            // Sembunyikan Tahun Akademik jika bukan halaman dashboard
            if (academicYearText) academicYearText.classList.add("hidden");
        } 
        else {
            // Halaman lainnya (termasuk PRESENSI) -> Tampilkan normal sesuai tulisan di HTML
            // Output: "Presensi Matakuliah" dll.
            welcomeText.innerText = greeting;
            
            // Sembunyikan Tahun Akademik jika bukan halaman dashboard
            if (academicYearText) academicYearText.classList.add("hidden");
        }
    }

    // 3. LOGIKA TAMPIL/SEMBUNYI SEARCH BAR
    if (searchBar) {
        // Jika di HTML tertulis data-search="false", maka sembunyikan!
        if (showSearch === "false") {
            searchBar.style.display = "none";
        } else {
            // Defaultnya tampil (menggunakan flex sesuai desain umum tailwind)
            searchBar.style.display = "flex"; 
        }
    }

    // 4. Mengisi Inisial Avatar
    document.querySelectorAll(".avatar").forEach(el => {
        el.innerText = initial;
    });

    // 5. Mengisi Nama User di dalam Dropdown
    document.querySelectorAll(".user-name").forEach(el => {
        el.innerText = name;
    });

    // 6. Khusus Role Admin: Hapus Dropdown & Panah Arrow
    if (role === "admin") {
        if (dropdown) dropdown.remove();
        if (arrow) arrow.remove();
    }
}

/* ================= INTERAKSI DROPDOWN PROFILE ================= */
function initAvatarDropdown() {
    const role = document.body.getAttribute("data-role");
    if (role === "admin") return; 

    const avatarBox = document.getElementById("avatarBox");
    const dropdown = document.getElementById("dropdownMenu");
    const arrow = document.getElementById("arrowIcon");
    
    // MENARGETKAN OVERLAY BLUR YANG ADA DI header.html
    const overlay = document.getElementById("dropdownOverlay");

    if (!avatarBox || !dropdown) return;

    // Aksi saat avatar diklik
    avatarBox.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("hidden");
        if (arrow) arrow.classList.toggle("rotate-180");
        
        // Memunculkan / menyembunyikan overlay blur
        if (overlay) overlay.classList.toggle("hidden");
    });

    // Aksi saat klik sembarang tempat (di luar avatar/dropdown)
    document.addEventListener("click", (e) => {
        // Menutup jika klik di luar box avatar, ATAU jika user sengaja mengklik overlay blur-nya
        if (!avatarBox.contains(e.target) || e.target === overlay) {
            dropdown.classList.add("hidden");
            if (arrow) arrow.classList.remove("rotate-180");
            
            // Menyembunyikan overlay blur kembali
            if (overlay) overlay.classList.add("hidden");
        }
    });
}

/* ================= LOGIKA LOGOUT ================= */
function initLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "../login.html"; 
    });
}