<?php

namespace App\Providers;

use App\Contracts\SummaryGeneratorInterface;
use App\Services\LLMSummaryGenerator;
use App\Services\RulesBasedSummaryGenerator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(RulesBasedSummaryGenerator::class);

        /**
         * Bind the SummaryGeneratorInterface to LLMSummaryGenerator.
         *
         * LLMSummaryGenerator automatically falls back to the rules-based engine
         * when OPENAI_API_KEY is absent or the LLM API is unavailable, so the
         * application runs fully locally without any API key.
         */
        $this->app->singleton(SummaryGeneratorInterface::class, function ($app) {
            return new LLMSummaryGenerator(
                fallback:   $app->make(RulesBasedSummaryGenerator::class),
                apiKey:     config('services.openrouter.key', ''),
                model:      config('services.openrouter.model', 'meta-llama/llama-3.1-8b-instruct:free'),
                baseUrl:    config('services.openrouter.base_url', 'https://openrouter.ai/api/v1/chat/completions'),
                siteUrl:    config('services.openrouter.site_url', ''),
                siteTitle:  config('services.openrouter.site_title', 'Issue Tracker'),
            );
        });
    }

    public function boot(): void
    {
        //
    }
}
