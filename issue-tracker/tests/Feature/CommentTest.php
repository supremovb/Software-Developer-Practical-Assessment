<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Issue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // 4. Adding a comment to an existing issue
    // -------------------------------------------------------------------------
    public function test_can_add_comment_to_existing_issue(): void
    {
        $issue = Issue::factory()->create();

        $response = $this->postJson("/api/v1/issues/{$issue->id}/comments", [
            'author_name' => 'Jane Doe',
            'body'        => 'Looking into this now.',
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['author_name' => 'Jane Doe'])
            ->assertJsonFragment(['body' => 'Looking into this now.']);

        $this->assertDatabaseHas('comments', [
            'issue_id'    => $issue->id,
            'author_name' => 'Jane Doe',
        ]);
    }

    // -------------------------------------------------------------------------
    // Reject comment with empty body
    // -------------------------------------------------------------------------
    public function test_comment_with_empty_body_returns_422(): void
    {
        $issue = Issue::factory()->create();

        $response = $this->postJson("/api/v1/issues/{$issue->id}/comments", [
            'author_name' => 'Jane Doe',
            'body'        => '   ',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.body.0', fn ($v) => str_contains($v, 'required'));
    }

    // -------------------------------------------------------------------------
    // Reject comment with missing author_name
    // -------------------------------------------------------------------------
    public function test_comment_without_author_name_returns_422(): void
    {
        $issue = Issue::factory()->create();

        $response = $this->postJson("/api/v1/issues/{$issue->id}/comments", [
            'body' => 'Valid body, no author.',
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure(['errors' => ['author_name']]);
    }

    // -------------------------------------------------------------------------
    // Adding comment to non-existent issue returns 404
    // -------------------------------------------------------------------------
    public function test_adding_comment_to_missing_issue_returns_404(): void
    {
        $response = $this->postJson('/api/v1/issues/9999/comments', [
            'author_name' => 'Ghost',
            'body'        => 'This issue does not exist.',
        ]);

        $response->assertStatus(404);
    }
}
