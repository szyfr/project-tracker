<?php

use App\Models\Project;
use Database\Seeders\ProjectSeeder;

function projectPayload(array $overrides = []): array
{
    return array_merge([
        'client_name' => 'Acme Corporation',
        'project_name' => 'Corporate Website Redesign',
        'description' => "Redesign and modernize the company's corporate website.",
        'status' => 'Planning',
        'priority' => 'High',
        'start_date' => '2026-08-12',
        'due_date' => '2026-09-30',
    ], $overrides);
}

test('it lists every project', function () {
    $this->seed(ProjectSeeder::class);

    $response = $this->getJson(route('projects.index'));

    $response->assertOk()->assertJsonCount(12);
    $response->assertJsonPath('0', [
        'id' => 1,
        'client_name' => 'Acme Corporation',
        'project_name' => 'Corporate Website Redesign',
        'description' => "Redesign and modernize the company's corporate website.",
        'status' => 'In Progress',
        'priority' => 'High',
        'start_date' => '2026-06-01',
        'due_date' => '2026-07-15',
    ]);
});

test('it lists an empty array when there are no projects', function () {
    $this->getJson(route('projects.index'))->assertOk()->assertExactJson([]);
});

test('it returns a single project', function () {
    $this->seed(ProjectSeeder::class);

    $this->getJson(route('projects.show', 1))
        ->assertOk()
        ->assertJsonPath('project_name', 'Corporate Website Redesign');
});

test('it returns 404 for a missing project', function () {
    $this->getJson(route('projects.show', 999))
        ->assertNotFound()
        ->assertJsonPath('message', 'Resource not found.');
});

test('it creates a project', function () {
    $response = $this->postJson(route('projects.store'), projectPayload());

    $response->assertCreated()->assertJsonPath('client_name', 'Acme Corporation');

    expect(Project::query()->count())->toBe(1);
    expect(Project::query()->first()->due_date->toDateString())->toBe('2026-09-30');
});

test('it creates a project without optional fields', function () {
    $this->postJson(route('projects.store'), projectPayload([
        'description' => null,
        'start_date' => null,
        'due_date' => null,
    ]))->assertCreated()->assertJsonPath('start_date', null);
});

test('it rejects invalid project data', function (array $payload, string $field) {
    $this->postJson(route('projects.store'), projectPayload($payload))
        ->assertStatus(422)
        ->assertJsonValidationErrors($field);
})->with([
    'missing client name' => [['client_name' => ''], 'client_name'],
    'missing project name' => [['project_name' => ''], 'project_name'],
    'missing status' => [['status' => ''], 'status'],
    'missing priority' => [['priority' => ''], 'priority'],
    'invalid status' => [['status' => 'Archived'], 'status'],
    'invalid priority' => [['priority' => 'Urgent'], 'priority'],
    'due date before start date' => [['start_date' => '2026-09-30', 'due_date' => '2026-08-12'], 'due_date'],
]);

test('it explains invalid enum values', function () {
    $this->postJson(route('projects.store'), projectPayload(['priority' => 'Urgent']))
        ->assertStatus(422)
        ->assertJsonPath('message', 'Priority must be Low, Medium, or High.')
        ->assertJsonPath('errors.priority.0', 'Priority must be Low, Medium, or High.');
});

test('it updates a project', function () {
    $project = Project::factory()->create();

    $this->putJson(route('projects.update', $project), projectPayload([
        'project_name' => 'Renamed Project',
        'status' => 'Completed',
    ]))->assertOk()->assertJsonPath('project_name', 'Renamed Project');

    expect($project->refresh()->project_name)->toBe('Renamed Project');
    expect($project->status->value)->toBe('Completed');
});

test('it rejects an invalid update', function () {
    $project = Project::factory()->create();

    $this->putJson(route('projects.update', $project), projectPayload(['status' => 'Archived']))
        ->assertStatus(422)
        ->assertJsonValidationErrors('status');
});

test('it returns 404 when updating a missing project', function () {
    $this->putJson(route('projects.update', 999), projectPayload())->assertNotFound();
});

test('it deletes a project', function () {
    $project = Project::factory()->create();

    $this->deleteJson(route('projects.destroy', $project))->assertNoContent();

    $this->getJson(route('projects.show', $project))->assertNotFound();
});

test('it returns 404 when deleting a missing project', function () {
    $this->deleteJson(route('projects.destroy', 999))->assertNotFound();
});
