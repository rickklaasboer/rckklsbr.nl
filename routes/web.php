<?php

use App\Http\Controllers\LinkController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LinkController::class, 'create'])->name('link.create');
Route::post('/', [LinkController::class, 'store'])->name('link.store');
Route::get('/{link}', [LinkController::class, 'show'])->name('link.show');
