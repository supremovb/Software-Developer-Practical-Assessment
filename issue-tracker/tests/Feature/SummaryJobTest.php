<?php

namespace Tests\Feature;

use App\Contracts\SummaryGeneratorInterface;
use App\Jobs\GenerateSummaryJob;
use App\Models\Issue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SummaryJobTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // 7. Running the summary job populates summary, suggested_next_action,
    //    and summary_status = 'ready'
    // -------------------------------------------------------------------------
    public function test_summary_job_populates_issue_fields(): void
    {
        $issue = Issue::factory()->create([
            'title'          => 'Login crash on mobile',
            'description'    => 'Users on iOS 17 report a crash when attempting to log in.',
            'priority'       => 'high',
            'category'       => 'auth',
            'summary_status' => 'pending',
        ]);

        // Bind a simple fake generator so the test is deterministic and fast.
        $this->app->bind(SummaryGeneratorInterface::class, function () {
            return new class implements SummaryGeneratorInterface {
                public function generate(Issue $issue): array
                {
                    return [
                        'summary'               => 'A high-priority auth issue has been reported.',
                        'suggested_next_action' => 'Check auth logs immediately.',
                    ];
                }
            };
        });

        $job = new GenerateSummaryJob($issue);
        $job->handle($this->app->make(SummaryGeneratorInterface::class));

        $issue->refresh();

        $this->assertEquals('ready', $issue->summary_status);
        $this->assertEquals('A high-priority auth issue has been reported.', $issue->summary);
        $this->assertEquals('Check auth logs immediately.', $issue->suggested_next_action);
    }

    // -------------------------------------------------------------------------
    // Job marks issue as 'failed' when an exception is thrown
    // -------------------------------------------------------------------------
    public function test_summary_job_marks_failed_on_exception(): void
    {
        $issue = Issue::factory()->create(['summary_status' => 'pending']);

        $job = new GenerateSummaryJob($issue);
        $job->failed(new \RuntimeException('LLM unavailable'));

        $issue->refresh();

        $this->assertEquals('failed', $issue->summary_status);
    }

    // -------------------------------------------------------------------------
    // RulesBasedSummaryGenerator returns non-empty values
    // -------------------------------------------------------------------------
    public function test_rules_based_generator_returns_non_empty_output(): void
    {
        $generator = $this->app->make(\App\Services\RulesBasedSummaryGenerator::class);

        $issue = Issue::factory()->create([
            'title'       => 'Crash when submitting payment',
            'description' => 'The app crashes immediately after the user taps the submit button on the payment screen.',
            'priority'    => 'high',
            'category'    => 'billing',
        ]);

        $result = $generator->generate($issue);

        $this->assertNotEmpty($result['summary']);
        $this->assertNotEmpty($result['suggested_next_action']);
    }
}
