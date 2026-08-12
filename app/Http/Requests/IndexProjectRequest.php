<?php

namespace App\Http\Requests;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexProjectRequest extends FormRequest
{
    /**
     * The number of projects returned when no page size is requested.
     */
    public const DEFAULT_PER_PAGE = 10;

    /**
     * The largest page size a client may ask for.
     */
    public const MAX_PER_PAGE = 100;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::enum(ProjectStatus::class)],
            'priority' => ['nullable', Rule::enum(ProjectPriority::class)],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_PER_PAGE],
        ];
    }

    /**
     * Get the custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.enum' => 'Status must be Planning, In Progress, On Hold, or Completed.',
            'priority.enum' => 'Priority must be Low, Medium, or High.',
        ];
    }

    /**
     * Get the requested page size, bounded to the supported range.
     */
    public function perPage(): int
    {
        return $this->integer('per_page') ?: self::DEFAULT_PER_PAGE;
    }

    /**
     * Get the trimmed search term, if one was given.
     */
    public function searchTerm(): ?string
    {
        $search = trim((string) $this->string('search'));

        return $search === '' ? null : $search;
    }
}
