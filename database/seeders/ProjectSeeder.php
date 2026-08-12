<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Seed the projects table.
     */
    public function run(): void
    {
        foreach ($this->projects() as $attributes) {
            Project::findOrNew($attributes['id'])->forceFill($attributes)->save();
        }
    }

    /**
     * The projects that every environment starts with.
     *
     * @return array<int, array{id: int, client_name: string, project_name: string, description: string, status: string, priority: string, start_date: string, due_date: string}>
     */
    private function projects(): array
    {
        return [
            [
                'id' => 1,
                'client_name' => 'Acme Corporation',
                'project_name' => 'Corporate Website Redesign',
                'description' => "Redesign and modernize the company's corporate website.",
                'status' => 'In Progress',
                'priority' => 'High',
                'start_date' => '2026-06-01',
                'due_date' => '2026-07-15',
            ],
            [
                'id' => 2,
                'client_name' => 'GreenLeaf Cafe',
                'project_name' => 'Online Ordering System',
                'description' => 'Develop an online ordering platform for customers.',
                'status' => 'Planning',
                'priority' => 'Medium',
                'start_date' => '2026-06-10',
                'due_date' => '2026-08-01',
            ],
            [
                'id' => 3,
                'client_name' => 'Bright Realty',
                'project_name' => 'Property Listing Portal',
                'description' => 'Build a portal for managing property listings.',
                'status' => 'On Hold',
                'priority' => 'Medium',
                'start_date' => '2026-05-15',
                'due_date' => '2026-07-30',
            ],
            [
                'id' => 4,
                'client_name' => 'Nova Fitness',
                'project_name' => 'Mobile App MVP',
                'description' => 'Develop the first version of the fitness tracking app.',
                'status' => 'In Progress',
                'priority' => 'High',
                'start_date' => '2026-06-05',
                'due_date' => '2026-08-20',
            ],
            [
                'id' => 5,
                'client_name' => 'Blue Ocean Travel',
                'project_name' => 'Booking Platform Enhancement',
                'description' => 'Improve search and booking functionalities.',
                'status' => 'Completed',
                'priority' => 'Medium',
                'start_date' => '2026-04-01',
                'due_date' => '2026-05-30',
            ],
            [
                'id' => 6,
                'client_name' => 'TechVision Solutions',
                'project_name' => 'CRM Dashboard',
                'description' => 'Develop an internal CRM dashboard.',
                'status' => 'Planning',
                'priority' => 'High',
                'start_date' => '2026-06-15',
                'due_date' => '2026-08-15',
            ],
            [
                'id' => 7,
                'client_name' => 'Urban Living',
                'project_name' => 'Property Management System',
                'description' => 'Create a platform for managing rental properties.',
                'status' => 'In Progress',
                'priority' => 'Medium',
                'start_date' => '2026-05-20',
                'due_date' => '2026-08-10',
            ],
            [
                'id' => 8,
                'client_name' => 'Elite Events',
                'project_name' => 'Event Registration Portal',
                'description' => 'Develop a registration and ticketing portal.',
                'status' => 'Planning',
                'priority' => 'Low',
                'start_date' => '2026-06-20',
                'due_date' => '2026-09-01',
            ],
            [
                'id' => 9,
                'client_name' => 'HealthFirst Clinic',
                'project_name' => 'Patient Appointment System',
                'description' => 'Build an appointment scheduling application.',
                'status' => 'Completed',
                'priority' => 'High',
                'start_date' => '2026-03-01',
                'due_date' => '2026-05-01',
            ],
            [
                'id' => 10,
                'client_name' => 'MarketPro',
                'project_name' => 'Marketing Campaign Dashboard',
                'description' => 'Track and manage digital marketing campaigns.',
                'status' => 'In Progress',
                'priority' => 'Medium',
                'start_date' => '2026-06-01',
                'due_date' => '2026-07-31',
            ],
            [
                'id' => 11,
                'client_name' => 'Sunrise Education',
                'project_name' => 'Learning Management Portal',
                'description' => 'Develop a portal for students and instructors.',
                'status' => 'Planning',
                'priority' => 'High',
                'start_date' => '2026-07-01',
                'due_date' => '2026-09-30',
            ],
            [
                'id' => 12,
                'client_name' => 'FreshFarm',
                'project_name' => 'Inventory Management System',
                'description' => 'Track inventory across multiple locations.',
                'status' => 'On Hold',
                'priority' => 'Low',
                'start_date' => '2026-05-01',
                'due_date' => '2026-08-01',
            ],
        ];
    }
}
