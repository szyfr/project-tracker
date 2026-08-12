<?php

use Inertia\Testing\AssertableInertia;

test('the projects page renders for browser requests', function () {
    $this->get(route('projects.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('projects/index'));
});
