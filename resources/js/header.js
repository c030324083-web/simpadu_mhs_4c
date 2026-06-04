document.addEventListener("DOMContentLoaded", function() {
    const headerContainer = document.getElementById("header");

    if (headerContainer) {
        // Fetch komponen header secara asynchronous
        // Pastikan path sudah sesuai dengan struktur folder kamu
        fetch("{{ route('header') }}")
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
    const dropdown = document.getElementById("dropdownMenu");
    const arrow = document.getElementById("arrowIcon");
    
    // TARGETKAN SEARCH BAR DI KOMPONEN HEADER
    const searchBar = document.getElementById("headerSearchBar");

    // Ambil data user dari localStorage
    const name = localStorage.getItem("name") || "User";
    const semester = localStorage.getItem("semester") || "?"; // <-- AMBIL DATA SEMESTER
    
    const initial = name.split(" ").map(n => n[0]).join("").toUpperCase();

    // 1. Mengisi Judul Halaman
    if (pageTitle) pageTitle.innerText = title;

    // 2. LOGIKA GREETING & SEMESTER DINAMIS
    if (welcomeText) {
        if (page === "dashboard") {
            // Jika halaman dashboard -> "Selamat datang, Andi Pratama"
            welcomeText.innerText = `${greeting}, ${name}`;
        } 
        else if (role === "mhs" && (page === "presensi" || page === "jadwal" || title.includes("Presensi") || title.includes("Jadwal"))) {
            // Jika halaman Presensi atau Jadwal dan yang login Mahasiswa -> "Semua Jadwal Perkuliahan Semester 4"
            welcomeText.innerText = `${greeting} Semester ${semester}`;
        } 
        else {
            // Halaman lainnya -> Tampilkan normal sesuai HTML
            welcomeText.innerText = greeting;
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

    if (!avatarBox || !dropdown) return;

    avatarBox.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("hidden");
        if (arrow) arrow.classList.toggle("rotate-180");
    });

    document.addEventListener("click", (e) => {
        if (!avatarBox.contains(e.target)) {
            dropdown.classList.add("hidden");
            if (arrow) arrow.classList.remove("rotate-180");
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