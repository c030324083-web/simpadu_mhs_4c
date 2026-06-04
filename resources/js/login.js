/* ================= SHOW PASSWORD ================= */
document.addEventListener("DOMContentLoaded", function () {
    const eyeIcon = document.querySelector(".eye-icon");
    const passwordInput = document.querySelector("#password");

    if (eyeIcon && passwordInput) {
        eyeIcon.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                eyeIcon.classList.remove("fa-eye-slash");
                eyeIcon.classList.add("fa-eye");
            } else {
                passwordInput.type = "password";
                eyeIcon.classList.remove("fa-eye");
                eyeIcon.classList.add("fa-eye-slash");
            }
        });
    }
});

/* ================= LOGIN LOGIC ================= */
//const loginForm = document.getElementById("loginForm");
//const loginBtn = document.getElementById("loginBtn");
//const errorMsg = document.getElementById("errorMsg");
//const successMsg = document.getElementById("successMsg");
//
//loginForm.addEventListener("submit", async (e) => {
//    e.preventDefault();
//
//    // Reset pesan
//    errorMsg.innerHTML = "";
//    successMsg.innerHTML = "";
//
//    const email = document.getElementById("email").value;
//    const password = document.getElementById("password").value;
//
//    /* VALIDASI */
//    if (email === "" || password === "") {
//        errorMsg.innerHTML = "Email dan password wajib diisi";
//        return;
//    }
//
//    /* LOADING STATE */
//    loginBtn.disabled = true;
//    loginBtn.innerHTML = "Loading...";
//
//    try {
//        /* API LOGIN - GANTI DENGAN URL BACKEND YANG SESUAI */
//        const response = await fetch("https://api-login.com/login", {
//            method: "POST",
//            headers: {
//                "Content-Type": "application/json"
//            },
//            body: JSON.stringify({ email, password })
//        });
//
//        const data = await response.json();
//
//        /* SUCCESS */
//        if (data.success) {
//            successMsg.innerHTML = "Login berhasil";
//
//            /* SIMPAN TOKEN, ROLE, DAN NAMA USER */
//            localStorage.setItem("token", data.token);
//            localStorage.setItem("role", data.role);
//            // Menyesuaikan dengan header.js agar nama user muncul
//            localStorage.setItem("name", data.name); 
//
//            /* ROLE REDIRECT */
//            setTimeout(() => {
//                if (data.role === "admin") {
//                    window.location.href = "../pages/dashboard_admin.html";
//                } else if (data.role === "mhs") {
//                    window.location.href = "../pages/Mahasiswa/dashboard_mhs.html";
//                } else {
//                    window.location.href = "dashboard.html";
//                }
//            }, 1000);
//        } 
//        /* ERROR DARI SERVER */
//        else {
//            errorMsg.innerHTML = data.message || "Login gagal";
//        }
//    } 
//    /* ERROR KONEKSI */
//    catch (error) {
//        console.error(error);
//        errorMsg.innerHTML = "Server tidak dapat dihubungi";
//    } 
//    /* FINALLY */
//    finally {
//        loginBtn.disabled = false;
//        loginBtn.innerHTML = "Masuk ke Sistem";
//    }
//});

/* ================= CHECK TOKEN (PROTEKSI HALAMAN) ================= */
// Jika sudah login, jangan biarkan user kembali ke halaman login
const token = localStorage.getItem("token");
if (token) {
    console.log("User sudah login, diarahkan ke dashboard...");
    // Opsional: Redirect otomatis jika user langsung mengetik alamat login.html
    // window.location.href = "../pages/dashboard_admin.html";
}