<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::resource('projects', ProjectController::class)->except(['create', 'edit']);

require __DIR__.'/settings.php';
