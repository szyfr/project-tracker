<?php

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Support\Facades\Hash;

test('it seeds a verified admin account', function () {
    $this->seed(AdminUserSeeder::class);

    $admin = User::query()->where('email', AdminUserSeeder::EMAIL)->sole();

    expect($admin->name)->toBe('Admin')
        ->and($admin->email_verified_at)->not->toBeNull()
        ->and(Hash::check('password', $admin->password))->toBeTrue();
});

test('it does not duplicate the admin account when seeded twice', function () {
    $this->seed(AdminUserSeeder::class);
    $this->seed(AdminUserSeeder::class);

    expect(User::query()->where('email', AdminUserSeeder::EMAIL)->count())->toBe(1);
});

test('the seeded admin can sign in', function () {
    $this->seed(AdminUserSeeder::class);

    $this->post(route('login'), [
        'email' => AdminUserSeeder::EMAIL,
        'password' => 'password',
    ])->assertRedirect(route('projects.index'));

    $this->assertAuthenticated();
});
