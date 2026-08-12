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

test('it stores blank optional fields as null', function () {
    $this->postJson(route('projects.store'), projectPayload([
        'description' => '',
        'start_date' => '',
        'due_date' => '',
    ]))
        ->assertCreated()
        ->assertJsonPath('description', null)
        ->assertJsonPath('start_date', null)
        ->assertJsonPath('due_date', null);
});

test('it accepts values at the length limits', function () {
    $this->postJson(route('projects.store'), projectPayload([
        'client_name' => str_repeat('a', 255),
        'project_name' => str_repeat('b', 255),
        'description' => str_repeat('c', 2000),
    ]))->assertCreated();

    expect(Project::query()->first()->description)->toHaveLength(2000);
});

test('it rejects values beyond the length limits', function (string $field, int $limit) {
    $this->postJson(route('projects.store'), projectPayload([
        $field => str_repeat('a', $limit + 1),
    ]))
        ->assertStatus(422)
        ->assertJsonValidationErrors($field);
})->with([
    'client name' => ['client_name', 255],
    'project name' => ['project_name', 255],
    'description' => ['description', 2000],
]);

test('it accepts dates at the supported bounds', function () {
    $this->postJson(route('projects.store'), projectPayload([
        'start_date' => '1900-01-01',
        'due_date' => '2100-12-31',
    ]))->assertCreated()->assertJsonPath('due_date', '2100-12-31');
});

test('it rejects malformed and out of range dates', function (array $payload, string $field) {
    $this->postJson(route('projects.store'), projectPayload($payload))
        ->assertStatus(422)
        ->assertJsonValidationErrors($field);
})->with([
    'unparseable start date' => [['start_date' => 'not-a-date'], 'start_date'],
    'non ISO start date' => [['start_date' => '12/08/2026'], 'start_date'],
    'relative due date' => [['due_date' => 'tomorrow'], 'due_date'],
    'start date before 1900' => [['start_date' => '1899-12-31', 'due_date' => null], 'start_date'],
    'due date before 1900' => [['start_date' => null, 'due_date' => '1899-12-31'], 'due_date'],
    'start date after 2100' => [['start_date' => '2101-01-01', 'due_date' => null], 'start_date'],
    'due date after 2100' => [['start_date' => null, 'due_date' => '2101-01-01'], 'due_date'],
]);

test('it does not silently truncate an out of range date', function () {
    $this->postJson(route('projects.store'), projectPayload(['due_date' => '999999-12-31']))
        ->assertStatus(422)
        ->assertJsonValidationErrors('due_date');

    expect(Project::query()->count())->toBe(0);
});

test('it explains an out of range date separately from the start date check', function () {
    $this->postJson(route('projects.store'), projectPayload([
        'start_date' => null,
        'due_date' => '1899-12-31',
    ]))
        ->assertStatus(422)
        ->assertJsonPath('errors.due_date.0', 'Due date must be on or after 1900-01-01.');
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
