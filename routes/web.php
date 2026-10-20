<?php

use App\Http\Controllers\AdminLinkController;
use App\Http\Controllers\LinkController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Middleware\LimitLinkCreation;
use Illuminate\Support\Facades\Route;

Route::get('/', [LinkController::class, 'create'])->name('link.create');
Route::post('/', [LinkController::class, 'store'])->middleware(LimitLinkCreation::class)->name('link.store');

Route::middleware('auth')->group(function () {
    Route::get('/links', [AdminLinkController::class, 'index'])->name('links.index');
    Route::delete('/links/{link}', [AdminLinkController::class, 'destroy'])->name('links.destroy');
    Route::get('/settings/security', [SecurityController::class, 'show'])->name('settings.security');
});

// Codes are 8 characters, which keeps the catch-all clear of /login, /links and the Fortify routes
Route::get('/{link}', [LinkController::class, 'show'])->where('link', '[A-Za-z0-9]{8}')->name('link.show');
