<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', 'login')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::resource('projects', ProjectController::class)->except(['create', 'edit']);
});

require __DIR__.'/settings.php';
