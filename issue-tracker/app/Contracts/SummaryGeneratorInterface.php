<?php

namespace App\Contracts;

use App\Models\Issue;

interface SummaryGeneratorInterface
{
    /**
     * Generate a 1-2 sentence summary and a single concrete next action for the issue.
     *
     * Returns ['summary' => string, 'suggested_next_action' => string]
     * or throws a \RuntimeException on unrecoverable failure.
     */
    public function generate(Issue $issue): array;
}
