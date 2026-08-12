<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Render the project list page, or return every project as JSON.
     */
    public function index(Request $request): Response|JsonResponse
    {
        if (! $request->expectsJson()) {
            return Inertia::render('projects/index');
        }

        return response()->json(
            ProjectResource::collection(Project::query()->orderBy('id')->get())
        );
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
