<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * The email of the account every environment can sign in with.
     */
    public const string EMAIL = 'admin@example.com';

    /**
     * Seed the administrator account.
     *
     * The password comes from `ADMIN_PASSWORD` so deployed environments can set
     * their own; it falls back to `password` for local development.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => self::EMAIL],
            [
                'name' => 'Admin',
                'password' => Hash::make((string) config('app.admin_password')),
                'email_verified_at' => now(),
            ],
        );
    }
}
