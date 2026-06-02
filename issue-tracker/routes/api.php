<?php

use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\IssueController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::apiResource('issues', IssueController::class)->only(['index', 'store', 'show', 'update']);
    Route::post('issues/{issue}/comments', [CommentController::class, 'store']);
});
