<?php

namespace App\Jobs;

use App\Contracts\SummaryGeneratorInterface;
use App\Models\Issue;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class GenerateSummaryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Seconds to wait before retrying after failure.
     *
     * @var array<int>
     */
    public array $backoff = [10, 60, 180];

    /**
     * Seconds the job may run before timing out.
     */
    public int $timeout = 60;

    public function __construct(public readonly Issue $issue) {}

    public function handle(SummaryGeneratorInterface $generator): void
    {
        // Reload to get the latest description in case an update raced ahead.
        $issue = $this->issue->fresh();

        if (!$issue) {
            return; // Issue was deleted; nothing to do.
        }

        $result = $generator->generate($issue);

        $issue->update([
            'summary'               => $result['summary'],
            'suggested_next_action' => $result['suggested_next_action'],
            'summary_status'        => 'ready',
        ]);
    }

    public function failed(Throwable $exception): void
    {
        $issue = $this->issue->fresh();

        if ($issue) {
            $issue->update(['summary_status' => 'failed']);
        }
    }
}
