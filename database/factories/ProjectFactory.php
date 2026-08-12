<?php

namespace Database\Factories;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-2 months', '+1 month');

        return [
            'client_name' => fake()->company(),
            'project_name' => Str::title(rtrim(fake()->sentence(3), '.')),
            'description' => fake()->sentence(),
            'status' => fake()->randomElement(ProjectStatus::cases()),
            'priority' => fake()->randomElement(ProjectPriority::cases()),
            'start_date' => $startDate,
            'due_date' => fake()->dateTimeBetween($startDate, '+3 months'),
        ];
    }

    /**
     * Indicate that the project has no scheduled dates.
     */
    public function withoutDates(): static
    {
        return $this->state(fn (array $attributes) => [
            'start_date' => null,
            'due_date' => null,
        ]);
    }
}
