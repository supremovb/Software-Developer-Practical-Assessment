<?php

namespace App\Services;

use App\Contracts\SummaryGeneratorInterface;
use App\Models\Issue;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * LLM-backed summary generator (Path A).
 *
 * Works with any OpenAI-compatible API (OpenAI, OpenRouter, etc.).
 * Falls back gracefully to RulesBasedSummaryGenerator when no key is set
 * or when the LLM API is unavailable — keeping the app fully runnable locally.
 *
 * OpenRouter usage: set OPENROUTER_API_KEY in .env. Free models are available
 * at https://openrouter.ai/models?q=free (look for models ending in ":free").
 */
class LLMSummaryGenerator implements SummaryGeneratorInterface
{
    public function __construct(
        private readonly RulesBasedSummaryGenerator $fallback,
        private readonly string $apiKey = '',
        private readonly string $model = 'meta-llama/llama-3.1-8b-instruct:free',
        private readonly string $baseUrl = 'https://openrouter.ai/api/v1/chat/completions',
        private readonly string $siteUrl = '',
        private readonly string $siteTitle = 'Issue Tracker',
    ) {}

    public function generate(Issue $issue): array
    {
        if (empty($this->apiKey)) {
            Log::info('[SummaryGenerator] No API key — using rules-based fallback', ['issue_id' => $issue->id]);
            return $this->fallback->generate($issue);
        }

        Log::info('[SummaryGenerator] Calling LLM', [
            'issue_id' => $issue->id,
            'model'    => $this->model,
            'url'      => $this->baseUrl,
        ]);

        try {
            $prompt = $this->buildPrompt($issue);

            $headers = [
                'Content-Type' => 'application/json',
            ];

            if (!empty($this->siteUrl)) {
                $headers['HTTP-Referer'] = $this->siteUrl;
            }

            if (!empty($this->siteTitle)) {
                $headers['X-Title'] = $this->siteTitle;
            }

            $response = Http::withToken($this->apiKey)
                ->withHeaders($headers)
                ->timeout(30)
                ->post($this->baseUrl, [
                    'model'       => $this->model,
                    'temperature' => 0.3,
                    'messages'    => [
                        [
                            'role'    => 'system',
                            'content' => 'You are a concise support-operations assistant. Respond ONLY with valid JSON.',
                        ],
                        [
                            'role'    => 'user',
                            'content' => $prompt,
                        ],
                    ],
                ]);

            if ($response->failed()) {
                Log::warning('[SummaryGenerator] LLM request failed — using rules-based fallback', [
                    'issue_id' => $issue->id,
                    'status'   => $response->status(),
                    'body'     => $response->body(),
                ]);
                return $this->fallback->generate($issue);
            }

            $content = $response->json('choices.0.message.content', '');
            $decoded = json_decode($content, true);

            if (
                !is_array($decoded)
                || empty($decoded['summary'])
                || empty($decoded['suggested_next_action'])
            ) {
                Log::warning('[SummaryGenerator] LLM returned invalid JSON — using rules-based fallback', [
                    'issue_id' => $issue->id,
                    'content'  => $content,
                ]);
                return $this->fallback->generate($issue);
            }

            Log::info('[SummaryGenerator] LLM success', ['issue_id' => $issue->id]);

            return [
                'summary'               => trim($decoded['summary']),
                'suggested_next_action' => trim($decoded['suggested_next_action']),
            ];
        } catch (ConnectionException $e) {
            Log::warning('[SummaryGenerator] LLM connection error — using rules-based fallback', [
                'issue_id' => $issue->id,
                'error'    => $e->getMessage(),
            ]);
            return $this->fallback->generate($issue);
        }
    }

    private function buildPrompt(Issue $issue): string
    {
        return <<<PROMPT
You are given a support issue. Return ONLY a JSON object with two keys:
- "summary": 1-2 sentences describing the issue.
- "suggested_next_action": one concrete, actionable next step for the support team.

Issue:
Title: {$issue->title}
Category: {$issue->category}
Priority: {$issue->priority}
Status: {$issue->status}
Description: {$issue->description}
PROMPT;
    }
}
