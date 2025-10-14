<?php

use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

// Serve React app for all routes
Route::get('/{path?}', function () {
    return view('app');
})->where('path', '.*');

// Add Sanctum CSRF cookie route
Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);
