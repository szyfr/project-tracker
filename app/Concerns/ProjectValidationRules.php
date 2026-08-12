<?php

namespace App\Concerns;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ProjectValidationRules
{
    /**
     * The earliest date a project may be scheduled for.
     */
    protected const EARLIEST_DATE = '1900-01-01';

    /**
     * The day before {@see self::EARLIEST_DATE}, for exclusive comparisons.
     */
    protected const DAY_BEFORE_EARLIEST_DATE = '1899-12-31';

    /**
     * The latest date a project may be scheduled for.
     */
    protected const LATEST_DATE = '2100-12-31';

    /**
     * Get the validation rules used when writing a project.
     *
     * Dates are bounded because `date` alone accepts values such as
     * `999999-12-31`, which the database silently truncates on write.
     * The lower bound on `due_date` is expressed as `after` so that its
     * message does not collide with the `after_or_equal:start_date` check.
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
            'start_date' => [
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:'.self::EARLIEST_DATE,
                'before_or_equal:'.self::LATEST_DATE,
            ],
            'due_date' => [
                'nullable',
                'date_format:Y-m-d',
                'after:'.self::DAY_BEFORE_EARLIEST_DATE,
                'before_or_equal:'.self::LATEST_DATE,
                'after_or_equal:start_date',
            ],
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
            'start_date.date_format' => 'Start date must be formatted as YYYY-MM-DD.',
            'due_date.date_format' => 'Due date must be formatted as YYYY-MM-DD.',
            'start_date.after_or_equal' => 'Start date must be on or after '.self::EARLIEST_DATE.'.',
            'due_date.after' => 'Due date must be on or after '.self::EARLIEST_DATE.'.',
            'start_date.before_or_equal' => 'Start date must be on or before '.self::LATEST_DATE.'.',
            'due_date.before_or_equal' => 'Due date must be on or before '.self::LATEST_DATE.'.',
        ];
    }
}
