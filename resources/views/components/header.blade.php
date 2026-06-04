<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4 w-full">

    <div>
        <h1 id="pageTitle" class="text-[26px] font-bold text-gray-900 tracking-tight"></h1>
        <p id="welcomeText" class="text-gray-500 mt-0.5 text-[14px]"></p>
    </div>

    <div class="flex items-center space-x-5 justify-end">

    <div id="headerSearchBar" class="relative w-64 md:w-72 hidden sm:block">
        <input 
            type="text" 
            placeholder="Cari..." 
            class="appearance-none outline-none w-full bg-white text-gray-700 placeholder-gray-400 text-[14px] pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500"
        >
        <div class="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
        </div>
    </div>

        <div id="avatarBox" class="relative flex items-center space-x-1.5 cursor-pointer group">

            <div class="avatar w-10 h-10 bg-[#3b82f6] rounded-full flex items-center justify-center text-white text-[14px] font-medium shadow-sm transition-transform group-hover:scale-105">
                AD
            </div>

            <svg id="arrowIcon" class="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>

            <div id="dropdownMenu" class="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] p-4 hidden z-50 border border-gray-100">

                <div class="flex items-center gap-3 mb-3">
                    <div class="avatar w-10 h-10 bg-[#3b82f6] rounded-full flex items-center justify-center text-white font-semibold">
                        AD
                    </div>
                    <div class="font-semibold text-gray-800 user-name">
                        Nama User
                    </div>
                </div>

                <hr class="my-2 border-gray-100">

                <a href="#" class="block px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-sm transition-colors">
                    Data Mahasiswa
                </a>

                <a href="#" class="block px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-sm transition-colors">
                    Status Semester
                </a>

                <a href="#" class="block px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-sm transition-colors">
                    Riwayat Pembayaran
                </a>

                <hr class="my-2 border-gray-100">

                <a href="#" id="logoutBtn" class="block px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 text-sm transition-colors font-medium">
                    Keluar
                </a>

            </div>
            </div>

    </div>

</div>