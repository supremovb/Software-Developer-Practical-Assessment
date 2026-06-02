<?php

namespace Database\Seeders;

use App\Jobs\GenerateSummaryJob;
use App\Models\Comment;
use App\Models\Issue;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 5 seeded issues spanning all priorities, categories, and statuses
        $issues = [
            [
                'title'       => 'Login page throws 500 after latest deployment',
                'description' => 'Since the v2.4.1 release deployed this morning, users attempting to log in are receiving a 500 Internal Server Error. The error does not appear in staging. The login page is completely inaccessible for all users.',
                'priority'    => 'high',
                'category'    => 'auth',
                'status'      => 'open',
            ],
            [
                'title'       => 'Incorrect invoice totals for enterprise accounts',
                'description' => 'Several enterprise customers have reported that their monthly invoices are showing incorrect totals. The discrepancy appears to be related to prorated charges when upgrading mid-cycle. Affected accounts include TechCorp and GlobalOps.',
                'priority'    => 'high',
                'category'    => 'billing',
                'status'      => 'in_progress',
            ],
            [
                'title'       => 'Dashboard load time exceeds 8 seconds for large datasets',
                'description' => 'Users with more than 10,000 records in their account are experiencing dashboard load times of 8–15 seconds. The issue appears to be an unindexed query in the reporting module. No errors are thrown, just severe latency.',
                'priority'    => 'medium',
                'category'    => 'performance',
                'status'      => 'open',
            ],
            [
                'title'       => 'CSV export truncates rows beyond 1000 entries',
                'description' => 'When a user exports data to CSV from the admin panel, any result set larger than 1000 rows is silently truncated. The user receives no warning, and the exported file appears valid. This is causing data integrity concerns for reporting.',
                'priority'    => 'medium',
                'category'    => 'bug',
                'status'      => 'open',
            ],
            [
                'title'       => 'Add bulk status update feature to issue list view',
                'description' => 'The support team has requested the ability to select multiple issues and update their status in a single action. Currently each issue must be updated individually, which is time-consuming when managing large volumes of tickets.',
                'priority'    => 'low',
                'category'    => 'feature',
                'status'      => 'resolved',
            ],
        ];

        foreach ($issues as $data) {
            $data['summary_status'] = 'pending';
            $data['needs_attention'] = $data['priority'] === 'high';
            $issue = Issue::create($data);
            GenerateSummaryJob::dispatch($issue);

            // Seed comments for the first 4 issues
            if ($issue->id <= 4) {
                Comment::create([
                    'issue_id'    => $issue->id,
                    'author_name' => 'Alice Chen',
                    'body'        => 'I can reproduce this consistently on my end. Assigned to the backend team.',
                ]);
                Comment::create([
                    'issue_id'    => $issue->id,
                    'author_name' => 'Bob Martinez',
                    'body'        => 'Investigating now. Will post an update within the hour.',
                ]);
            }
        }

        // Extra comment on issue 1 (critical auth issue)
        Comment::create([
            'issue_id'    => 1,
            'author_name' => 'Carol Singh',
            'body'        => 'Root cause identified — a missing environment variable for the JWT secret after the deploy. Hotfix in progress.',
        ]);

        // Extra comment on issue 2 (billing issue)
        Comment::create([
            'issue_id'    => 2,
            'author_name' => 'David Park',
            'body'        => 'Confirmed the calculation bug in the proration logic. Fix will be included in tonight\'s release.',
        ]);
    }
}

