<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/clear-cache-serve', function(){Artisan::call('optimize:clear');return 'Cache server berhasil dibersihkan!';});

Route::get('/', function () {
    return redirect('/pages/login.html');
});