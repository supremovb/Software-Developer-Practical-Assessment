<?php

namespace App\Services;

use App\Contracts\SummaryGeneratorInterface;
use App\Models\Issue;

/**
 * A deterministic, rules-based summary generator.
 *
 * Designed so that an LLM driver can be swapped in behind the same
 * SummaryGeneratorInterface without touching any other class.
 */
class RulesBasedSummaryGenerator implements SummaryGeneratorInterface
{
    private const KEYWORD_ACTIONS = [
        'crash'        => 'Collect the full stack trace and attach it to this issue before escalating.',
        'login'        => 'Verify authentication configuration and check for recent auth-service deployments.',
        'password'     => 'Guide the user through the password-reset flow and confirm email delivery.',
        'slow'         => 'Profile the relevant service and identify the top bottleneck by response time.',
        'error'        => 'Reproduce the error in a staging environment and capture detailed logs.',
        'billing'      => 'Review the account billing records and reconcile any discrepancies.',
        'payment'      => 'Check the payment-gateway logs and confirm transaction status with the provider.',
        'down'         => 'Verify service health in the monitoring dashboard and initiate an incident if needed.',
        'outage'       => 'Escalate to the on-call engineer and update the status page immediately.',
        'permission'   => 'Audit the affected user\'s role assignments and correct any misconfiguration.',
        'data'         => 'Validate data integrity in the database and run a consistency check.',
        'performance'  => 'Identify the slowest queries or endpoints using profiling tools and optimise.',
        'timeout'      => 'Increase the timeout threshold if safe, then trace the root cause of latency.',
        'security'     => 'Isolate the affected system, assess the scope of exposure, and notify stakeholders.',
        'install'      => 'Re-run the installation steps from the documentation and check for dependency conflicts.',
        'update'       => 'Apply the pending updates in a staging environment first and verify stability.',
        'deploy'       => 'Review the latest deployment logs for errors and roll back if necessary.',
        'import'       => 'Validate the import file format and retry with a smaller batch to isolate the issue.',
        'export'       => 'Check the export service logs and confirm the output file is complete.',
        'notification' => 'Inspect the notification service configuration and verify the recipient list.',
    ];

    private const CATEGORY_SUMMARIES = [
        'billing'     => 'This is a billing-related issue that may affect payment processing or invoice accuracy.',
        'auth'        => 'This issue involves authentication or authorisation and may impact user access.',
        'performance' => 'This is a performance issue that may be degrading the user experience.',
        'security'    => 'This issue has security implications and should be treated with urgency.',
        'bug'         => 'A defect has been reported that causes unexpected behaviour in the system.',
        'feature'     => 'A new feature or enhancement has been requested by the user.',
        'deployment'  => 'This issue relates to a recent or upcoming deployment.',
        'data'        => 'This issue concerns data integrity, migration, or storage.',
    ];

    public function generate(Issue $issue): array
    {
        $summary    = $this->buildSummary($issue);
        $nextAction = $this->buildNextAction($issue);

        return [
            'summary'              => $summary,
            'suggested_next_action' => $nextAction,
        ];
    }

    private function buildSummary(Issue $issue): string
    {
        $categoryKey = strtolower(trim($issue->category));

        if (array_key_exists($categoryKey, self::CATEGORY_SUMMARIES)) {
            $base = self::CATEGORY_SUMMARIES[$categoryKey];
        } else {
            $base = sprintf(
                'A %s-priority issue in the "%s" category has been submitted.',
                $issue->priority,
                $issue->category
            );
        }

        $prioritySuffix = match ($issue->priority) {
            'high'   => ' Immediate attention is required.',
            'medium' => ' This should be addressed in the current sprint.',
            'low'    => ' This can be scheduled for a future iteration.',
            default  => '',
        };

        return $base . $prioritySuffix;
    }

    private function buildNextAction(Issue $issue): string
    {
        $text = strtolower($issue->title . ' ' . $issue->description);

        foreach (self::KEYWORD_ACTIONS as $keyword => $action) {
            if (str_contains($text, $keyword)) {
                return $action;
            }
        }

        $categoryKey = strtolower(trim($issue->category));

        return match ($categoryKey) {
            'billing'     => 'Review the associated billing records and contact the user with a resolution.',
            'auth'        => 'Check the authentication logs and reset credentials if required.',
            'performance' => 'Run a performance profile and identify the top resource consumer.',
            'security'    => 'Escalate to the security team and begin an impact assessment.',
            'bug'         => 'Reproduce the defect in isolation, write a failing test, then fix.',
            'feature'     => 'Review the feature request with the product owner and add to the backlog.',
            'deployment'  => 'Review the deployment pipeline and revert if a regression is confirmed.',
            'data'        => 'Run a data integrity check and restore from backup if corruption is found.',
            default       => 'Assign the issue to the appropriate team and schedule a follow-up within 24 hours.',
        };
    }
}
