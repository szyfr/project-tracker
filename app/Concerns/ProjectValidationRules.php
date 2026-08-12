<?php

namespace App\Concerns;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ProjectValidationRules
{
    /**
     * Get the validation rules used when writing a project.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function projectRules(): array
    {
        return [
            'client_name' => ['required', 'string', 'max:255'],
            'project_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', Rule::enum(ProjectStatus::class)],
            'priority' => ['required', Rule::enum(ProjectPriority::class)],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }

    /**
     * Get the messages for rules that need a clearer explanation.
     *
     * @return array<string, string>
     */
    protected function projectMessages(): array
    {
        return [
            'status.enum' => 'Status must be Planning, In Progress, On Hold, or Completed.',
            'priority.enum' => 'Priority must be Low, Medium, or High.',
            'due_date.after_or_equal' => 'Due date cannot be earlier than the start date.',
        ];
    }
}
