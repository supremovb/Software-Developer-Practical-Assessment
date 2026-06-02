<?php

use Illuminate\Support\Facades\Route;

// Catch-all: serve the React SPA for any web route.
// React Router handles client-side navigation.
Route::get('/{any?}', function () {
    return view('welcome');
})->where('any', '^(?!api).*');
