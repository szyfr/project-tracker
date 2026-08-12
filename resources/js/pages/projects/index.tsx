import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { DeleteProjectDialog } from '@/components/projects/delete-project-dialog';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { ProjectsTable } from '@/components/projects/projects-table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/hooks/use-projects';
import { index } from '@/routes/projects';
import type { Project } from '@/types/project';

export default function Projects() {
    const { projects, loading, error, reload } = useProjects();
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Project | null>(null);
    const [deleting, setDeleting] = useState<Project | null>(null);

    function openCreateForm(): void {
        setEditing(null);
        setFormOpen(true);
    }

    function openEditForm(project: Project): void {
        setEditing(project);
        setFormOpen(true);
    }

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title="Projects" />

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Projects
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Track client work, progress, and priorities.
                    </p>
                </div>

                <Button onClick={openCreateForm}>
                    <Plus />
                    New project
                </Button>
            </div>

            {loading && (
                <div className="space-y-2" aria-busy="true">
                    <Skeleton className="h-10 w-full" />

                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} className="h-14 w-full" />
                    ))}
                </div>
            )}

            {!loading && error && (
                <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-6">
                    <div>
                        <p className="font-medium">Could not load projects</p>

                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>

                    <Button variant="outline" onClick={reload}>
                        Try again
                    </Button>
                </div>
            )}

            {!loading && !error && projects.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
                    <div>
                        <p className="font-medium">No projects yet</p>

                        <p className="text-sm text-muted-foreground">
                            Create your first project to start tracking it.
                        </p>
                    </div>

                    <Button onClick={openCreateForm}>
                        <Plus />
                        New project
                    </Button>
                </div>
            )}

            {!loading && !error && projects.length > 0 && (
                <ProjectsTable
                    projects={projects}
                    onEdit={openEditForm}
                    onDelete={setDeleting}
                />
            )}

            {formOpen && (
                <ProjectFormDialog
                    project={editing}
                    onOpenChange={setFormOpen}
                    onSaved={reload}
                />
            )}

            <DeleteProjectDialog
                project={deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                onDeleted={reload}
            />
        </div>
    );
}

Projects.layout = {
    breadcrumbs: [
        {
            title: 'Projects',
            href: index(),
        },
    ],
};
