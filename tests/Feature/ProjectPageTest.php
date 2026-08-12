<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('the projects page renders for browser requests', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('projects.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('projects/index'));
});

test('guests are redirected to login from the projects page', function () {
    $this->get(route('projects.index'))
        ->assertRedirect(route('login'));
});

test('guest json requests to the projects api are unauthorized', function () {
    $this->getJson(route('projects.index'))
        ->assertUnauthorized();
});
