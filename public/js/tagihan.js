document.addEventListener("DOMContentLoaded", function () {
    // ==========================================
    // 1. DEKLARASI SELEKTOR DOM (HTML Elements)
    // ==========================================
    const checkboxTagihan = document.getElementById('checkbox-tagihan');
    const badgeBelumBayar = document.getElementById('badge-belum-bayar');
    const btnBayarTagihan = document.getElementById('btn-bayar-tagihan');
    
    const modalInstruksi = document.getElementById('modal-instruksi');
    const btnTutupInstruksi = document.getElementById('btn-tutup-instruksi');
    
    const modalDetail = document.getElementById('modal-detail');
    const btnTutupDetail = document.getElementById('btn-tutup-detail');
    
    const containerTagihanAktif = document.getElementById('tagihan-aktif-container');
    const containerTagihanKosong = document.getElementById('tagihan-kosong-container');
    const riwayatList = document.getElementById('riwayat-list');
    
    // Ini adalah tombol simulasi bayar (Developer Button)
    const btnDevLunas = document.getElementById('dev-simulasi-lunas');

    // ==========================================
    // 2. DATA SIMULASI (NOTE UNTUK BE)
    // ==========================================
    // Ganti "beasiswa" dengan "reguler" untuk memunculkan checkbox & form tagihan.
    const statusMahasiswa = "beasiswa"; 
    
    // Ganti [] dengan isi data (misal [1]) jika ingin menguji ada tagihan.
    const dataTagihan = [1]; 

    // ==========================================
    // 3. LOGIKA: CEK BEASISWA / TIDAK ADA TAGIHAN
    // ==========================================
    function cekStatusTagihan() {
        if (dataTagihan.length === 0 || statusMahasiswa === "beasiswa") {
            if (containerTagihanAktif && containerTagihanKosong) {
                // Sembunyikan tagihan aktif
                containerTagihanAktif.classList.add('hidden');
                containerTagihanAktif.classList.remove('block');
                
                // Sembunyikan tombol bayar utamanya
                if (btnBayarTagihan && btnBayarTagihan.parentElement) {
                    btnBayarTagihan.parentElement.classList.add('hidden');
                }

                // Tampilkan container kosong
                containerTagihanKosong.classList.remove('hidden');
                containerTagihanKosong.classList.add('flex');

                // Ubah teks khusus jika statusnya "beasiswa"
                if (statusMahasiswa === "beasiswa") {
                    const judulKosong = containerTagihanKosong.querySelector('h4');
                    const deskripsiKosong = containerTagihanKosong.querySelector('p');
                    
                    if (judulKosong) judulKosong.innerText = "Status: Penerima Beasiswa";
                    if (deskripsiKosong) deskripsiKosong.innerHTML = "Yeay, Anda adalah penerima beasiswa.<br>Tidak ada tagihan perkuliahan yang harus dibayarkan.";
                }
            }
        } else {
            // Tampilkan tagihan normal jika ada tagihan dan bukan beasiswa
            if (containerTagihanAktif && containerTagihanKosong) {
                containerTagihanAktif.classList.remove('hidden');
                containerTagihanAktif.classList.add('block');
                
                containerTagihanKosong.classList.add('hidden');
                containerTagihanKosong.classList.remove('flex');

                if (btnBayarTagihan && btnBayarTagihan.parentElement) {
                    btnBayarTagihan.parentElement.classList.remove('hidden');
                }
            }
        }
    }
    cekStatusTagihan(); // Jalankan saat load

    // ==========================================
    // 4. LOGIKA: CHECKBOX TAGIHAN AKTIF
    // ==========================================
    if (checkboxTagihan && btnBayarTagihan) {
        checkboxTagihan.addEventListener('change', function () {
            if (this.checked) {
                // Jika dicentang, aktifkan tombol
                btnBayarTagihan.removeAttribute('disabled');
                btnBayarTagihan.className = "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-md transition-all duration-200 cursor-pointer";
            } else {
                // Jika tidak dicentang, matikan tombol
                btnBayarTagihan.setAttribute('disabled', 'true');
                btnBayarTagihan.className = "w-full bg-gray-200 text-gray-400 font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all duration-200 cursor-not-allowed";
            }
        });
    }

    // ==========================================
    // 5. LOGIKA: MODAL INSTRUKSI PEMBAYARAN
    // ==========================================
    if (btnBayarTagihan) {
        btnBayarTagihan.addEventListener('click', function () {
            if (!this.hasAttribute('disabled') && modalInstruksi) {
                modalInstruksi.classList.remove('hidden');
            }
        });
    }

    if (btnTutupInstruksi && modalInstruksi) {
        btnTutupInstruksi.addEventListener('click', function () {
            modalInstruksi.classList.add('hidden');
            // Menghilangkan checkbox dan memunculkan badge "Belum Bayar"
            if (checkboxTagihan) checkboxTagihan.classList.add('hidden');
            if (badgeBelumBayar) badgeBelumBayar.classList.remove('hidden');
        });
    }

    // ==========================================
    // 6. LOGIKA: MODAL DETAIL TRANSAKSI
    // ==========================================
    document.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('btn-detail-trigger')) {
            if (modalDetail) {
                modalDetail.classList.remove('hidden');
            }
        }
    });

    if (btnTutupDetail && modalDetail) {
        btnTutupDetail.addEventListener('click', function () {
            modalDetail.classList.add('hidden');
        });
    }

    // Menutup Modal dengan klik di luar area modal (Backdrop)
    window.addEventListener('click', function (e) {
        if (e.target === modalInstruksi) modalInstruksi.classList.add('hidden');
        if (e.target === modalDetail) modalDetail.classList.add('hidden');
    });

    // ==========================================
    // 7. LOGIKA: SIMULASI BAYAR (DEV BUTTON)
    // ==========================================
    if (btnDevLunas) {
        btnDevLunas.addEventListener('click', function () {
            // Sembunyikan card tagihan aktif, munculkan tampilan lunas (kosong)
            if (containerTagihanAktif && containerTagihanKosong) {
                containerTagihanAktif.classList.add('hidden');
                containerTagihanAktif.classList.remove('block');
                
                containerTagihanKosong.classList.remove('hidden');
                containerTagihanKosong.classList.add('flex');
                
                // Pastikan teks menjadi "Tidak ada tagihan" (bukan teks beasiswa)
                const judulKosong = containerTagihanKosong.querySelector('h4');
                const deskripsiKosong = containerTagihanKosong.querySelector('p');
                if (judulKosong) judulKosong.innerText = "Tidak ada tagihan perkuliahan";
                if (deskripsiKosong) deskripsiKosong.innerHTML = "Yeay, saat ini Anda belum memiliki tagihan perkuliahan<br>yang harus dibayarkan";

                if (btnBayarTagihan && btnBayarTagihan.parentElement) {
                    btnBayarTagihan.parentElement.classList.add('hidden');
                }
            }

            // Tambahkan 1 list riwayat "Berhasil"
            if (riwayatList) {
                const templateRiwayatBaru = `
                    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all modal-enter border-l-4 border-l-green-500">
                        <div class="flex justify-between items-center pb-3 border-b border-gray-100 mb-3">
                            <h4 class="font-bold text-[13px] text-gray-900">PAY/20260/0000995</h4>
                            <span class="bg-[#DCFCE7] text-[#166534] text-[10px] font-semibold px-2.5 py-1 rounded-full">Baru Berhasil</span>
                        </div>
                        <div class="flex justify-between items-end">
                            <div>
                                <p class="text-[11px] text-gray-400 mb-0.5">Tanggal Pembayaran</p>
                                <p class="text-[12px] font-bold text-gray-900">26 Juni 2026, 02:06:07</p>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="text-left">
                                    <p class="text-[11px] text-gray-400 mb-0.5">Total Pembayaran</p>
                                    <p class="text-[12px] font-bold text-gray-900">Rp2.901.500</p>
                                </div>
                                <button class="btn-detail-trigger bg-[#2563EB] hover:bg-blue-700 text-white text-[11px] font-medium py-1.5 px-4 rounded-md transition-colors cursor-pointer shadow-sm">Detail</button>
                            </div>
                        </div>
                    </div>
                `;
                riwayatList.insertAdjacentHTML('afterbegin', templateRiwayatBaru);
            }

            // Hilangkan tombol simulasi ini setelah diklik
            this.style.display = 'none';
        });
    }
});