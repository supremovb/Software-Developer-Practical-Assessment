<?php

namespace Tests\Feature;

use App\Jobs\GenerateSummaryJob;
use App\Models\Comment;
use App\Models\Issue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class IssueTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // 1. Successful issue create
    // -------------------------------------------------------------------------
    public function test_can_create_an_issue(): void
    {
        Queue::fake();

        $payload = [
            'title'       => 'Payment gateway times out',
            'description' => 'Users are unable to complete checkout; the payment gateway returns a timeout after 30 s.',
            'priority'    => 'high',
            'category'    => 'billing',
        ];

        $response = $this->postJson('/api/v1/issues', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment(['title' => 'Payment gateway times out'])
            ->assertJsonFragment(['summary_status' => 'pending'])
            ->assertJsonFragment(['needs_attention' => true]);

        $this->assertDatabaseHas('issues', ['title' => 'Payment gateway times out']);
    }

    // -------------------------------------------------------------------------
    // 2. Validation failure — missing required fields
    // -------------------------------------------------------------------------
    public function test_creating_issue_without_required_fields_returns_422(): void
    {
        $response = $this->postJson('/api/v1/issues', [
            'title' => 'Missing description and priority',
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure(['message', 'errors'])
            ->assertJsonPath('errors.description.0', fn ($v) => str_contains($v, 'required'))
            ->assertJsonPath('errors.priority.0', fn ($v) => str_contains($v, 'required'));
    }

    // -------------------------------------------------------------------------
    // 2b. Validation failure — invalid enum values
    // -------------------------------------------------------------------------
    public function test_invalid_priority_value_returns_422(): void
    {
        $response = $this->postJson('/api/v1/issues', [
            'title'       => 'Bad priority',
            'description' => 'A description.',
            'priority'    => 'critical',
            'category'    => 'bug',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.priority.0', fn ($v) => str_contains($v, 'priority'));
    }

    // -------------------------------------------------------------------------
    // 3. List filtering with at least two combined filters
    // -------------------------------------------------------------------------
    public function test_list_filters_by_status_and_priority_combined(): void
    {
        Issue::factory()->create(['status' => 'open', 'priority' => 'high', 'category' => 'bug']);
        Issue::factory()->create(['status' => 'open', 'priority' => 'low',  'category' => 'feature']);
        Issue::factory()->create(['status' => 'resolved', 'priority' => 'high', 'category' => 'bug']);

        $response = $this->getJson('/api/v1/issues?status=open&priority=high');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertNotEmpty($data);

        foreach ($data as $issue) {
            $this->assertEquals('open', $issue['status']);
            $this->assertEquals('high', $issue['priority']);
        }
    }

    // -------------------------------------------------------------------------
    // 5. Single-issue view loads comments without N+1
    // -------------------------------------------------------------------------
    public function test_single_issue_view_loads_comments_without_n_plus_1(): void
    {
        $issue = Issue::factory()->create();
        Comment::factory()->count(5)->create(['issue_id' => $issue->id]);

        DB::enableQueryLog();

        $response = $this->getJson("/api/v1/issues/{$issue->id}");

        $queries = DB::getQueryLog();
        DB::disableQueryLog();

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['id', 'comments']]);

        // Exactly 2 queries: one for the issue, one for its comments (eager load).
        $this->assertLessThanOrEqual(2, count($queries), 'Expected at most 2 queries (no N+1).');
    }

    // -------------------------------------------------------------------------
    // 6. Creating an issue dispatches the summary job
    // -------------------------------------------------------------------------
    public function test_creating_issue_dispatches_generate_summary_job(): void
    {
        Queue::fake();

        $this->postJson('/api/v1/issues', [
            'title'       => 'Job dispatch test',
            'description' => 'This creation should dispatch a GenerateSummaryJob.',
            'priority'    => 'medium',
            'category'    => 'bug',
        ]);

        Queue::assertPushed(GenerateSummaryJob::class);
    }

    // -------------------------------------------------------------------------
    // Updating status alone should NOT re-trigger the summary job
    // -------------------------------------------------------------------------
    public function test_updating_status_alone_does_not_re_dispatch_summary_job(): void
    {
        Queue::fake();

        $issue = Issue::factory()->withSummary()->create();

        $this->patchJson("/api/v1/issues/{$issue->id}", ['status' => 'resolved']);

        Queue::assertNotPushed(GenerateSummaryJob::class);
    }

    // -------------------------------------------------------------------------
    // Updating description SHOULD re-trigger the summary job
    // -------------------------------------------------------------------------
    public function test_updating_description_re_dispatches_summary_job(): void
    {
        Queue::fake();

        $issue = Issue::factory()->withSummary()->create();

        $this->patchJson("/api/v1/issues/{$issue->id}", [
            'description' => 'A completely new description that should trigger re-generation.',
        ]);

        Queue::assertPushed(GenerateSummaryJob::class);
    }

    // -------------------------------------------------------------------------
    // needs_attention flag is set for high-priority issues
    // -------------------------------------------------------------------------
    public function test_high_priority_issue_sets_needs_attention(): void
    {
        Queue::fake();

        $response = $this->postJson('/api/v1/issues', [
            'title'       => 'Critical outage',
            'description' => 'Production is down.',
            'priority'    => 'high',
            'category'    => 'deployment',
        ]);

        $response->assertJsonFragment(['needs_attention' => true]);
    }

    // -------------------------------------------------------------------------
    // Whitespace-only strings are rejected
    // -------------------------------------------------------------------------
    public function test_whitespace_only_title_is_rejected(): void
    {
        $response = $this->postJson('/api/v1/issues', [
            'title'       => '   ',
            'description' => 'Valid description.',
            'priority'    => 'low',
            'category'    => 'bug',
        ]);

        $response->assertStatus(422);
    }

    // -------------------------------------------------------------------------
    // needs_attention is cleared when a high-priority issue is resolved
    // -------------------------------------------------------------------------
    public function test_resolving_high_priority_issue_clears_needs_attention(): void
    {
        Queue::fake();

        $issue = Issue::factory()->create(['priority' => 'high', 'status' => 'open']);
        $this->assertTrue($issue->needs_attention);

        $response = $this->patchJson("/api/v1/issues/{$issue->id}", ['status' => 'resolved']);

        $response->assertStatus(200)
            ->assertJsonFragment(['needs_attention' => false]);

        $this->assertDatabaseHas('issues', ['id' => $issue->id, 'needs_attention' => false]);
    }
}

