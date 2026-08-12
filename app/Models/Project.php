<?php

namespace App\Models;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $client_name
 * @property string $project_name
 * @property string|null $description
 * @property ProjectStatus $status
 * @property ProjectPriority $priority
 * @property Carbon|null $start_date
 * @property Carbon|null $due_date
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['client_name', 'project_name', 'description', 'status', 'priority', 'start_date', 'due_date'])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ProjectStatus::class,
            'priority' => ProjectPriority::class,
            'start_date' => 'date',
            'due_date' => 'date',
        ];
    }

    /**
     * Limit the query to projects whose client or project name contains the term.
     *
     * @param  Builder<Project>  $query
     */
    #[Scope]
    protected function matchingName(Builder $query, ?string $search): void
    {
        $query->when($search !== null, function (Builder $query) use ($search): void {
            $query->where(function (Builder $query) use ($search): void {
                $query->where('client_name', 'like', '%'.$search.'%')
                    ->orWhere('project_name', 'like', '%'.$search.'%');
            });
        });
    }

    /**
     * Limit the query to projects with the given status.
     *
     * @param  Builder<Project>  $query
     */
    #[Scope]
    protected function withStatus(Builder $query, ?ProjectStatus $status): void
    {
        $query->when($status !== null, fn (Builder $query) => $query->where('status', $status));
    }

    /**
     * Limit the query to projects with the given priority.
     *
     * @param  Builder<Project>  $query
     */
    #[Scope]
    protected function withPriority(Builder $query, ?ProjectPriority $priority): void
    {
        $query->when($priority !== null, fn (Builder $query) => $query->where('priority', $priority));
    }
}
