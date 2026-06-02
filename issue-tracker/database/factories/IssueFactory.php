<?php

namespace Database\Factories;

use App\Models\Issue;
use Illuminate\Database\Eloquent\Factories\Factory;

class IssueFactory extends Factory
{
    protected $model = Issue::class;

    public function definition(): array
    {
        $priority = $this->faker->randomElement(['low', 'medium', 'high']);

        return [
            'title'                 => $this->faker->sentence(6, true),
            'description'           => $this->faker->paragraph(3),
            'priority'              => $priority,
            'category'              => $this->faker->randomElement(['billing', 'auth', 'performance', 'bug', 'feature', 'deployment', 'data', 'security']),
            'status'                => $this->faker->randomElement(['open', 'in_progress', 'resolved']),
            'summary'               => null,
            'suggested_next_action' => null,
            'summary_status'        => 'pending',
            'needs_attention'       => $priority === 'high',
        ];
    }

    public function highPriority(): static
    {
        return $this->state(['priority' => 'high', 'needs_attention' => true]);
    }

    public function withSummary(): static
    {
        return $this->state([
            'summary'               => $this->faker->sentence(12),
            'suggested_next_action' => $this->faker->sentence(8),
            'summary_status'        => 'ready',
        ]);
    }
}
