<?php

namespace App\Http\Controllers;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Http\Requests\IndexProjectRequest;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Render the project list page, or return a filtered page of projects as JSON.
     */
    public function index(IndexProjectRequest $request): Response|JsonResponse
    {
        if (! $request->expectsJson()) {
            return Inertia::render('projects/index');
        }

        $projects = Project::query()
            ->matchingName($request->searchTerm())
            ->withStatus($request->enum('status', ProjectStatus::class))
            ->withPriority($request->enum('priority', ProjectPriority::class))
            ->orderBy('id')
            ->paginate($request->perPage())
            ->withQueryString();

        return response()->json([
            'data' => ProjectResource::collection($projects->items()),
            'status_counts' => $this->statusCounts(),
            'meta' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
                'from' => $projects->firstItem(),
                'to' => $projects->lastItem(),
            ],
        ]);
    }

    /**
     * Count every project by status, including statuses nothing is using yet.
     *
     * @return array<string, int>
     */
    private function statusCounts(): array
    {
        $counts = Project::query()
            ->toBase()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return collect(ProjectStatus::cases())
            ->mapWithKeys(fn (ProjectStatus $status): array => [
                $status->value => (int) $counts->get($status->value, 0),
            ])
            ->all();
    }

    /**
     * Return a single project.
     */
    public function show(Project $project): JsonResponse
    {
        return response()->json(new ProjectResource($project));
    }

    /**
     * Store a newly created project.
     */
    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = Project::create($request->validated());

        return response()->json(new ProjectResource($project), HttpResponse::HTTP_CREATED);
    }

    /**
     * Update an existing project.
     */
    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $project->update($request->validated());

        return response()->json(new ProjectResource($project));
    }

    /**
     * Delete an existing project.
     */
    public function destroy(Project $project): HttpResponse
    {
        $project->delete();

        return response()->noContent();
    }
}
