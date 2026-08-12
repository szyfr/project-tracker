import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DeleteProjectDialog } from '@/components/projects/delete-project-dialog';
import {
    ANY_VALUE,
    ProjectFiltersBar,
} from '@/components/projects/project-filters';
import type { ProjectFilters } from '@/components/projects/project-filters';
import { ProjectFiltersBarSkeleton } from '@/components/projects/project-filters-skeleton';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { ProjectsPagination } from '@/components/projects/projects-pagination';
import { ProjectsTable } from '@/components/projects/projects-table';
import { ProjectsTableSkeleton } from '@/components/projects/projects-table-skeleton';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/use-projects';
import { index } from '@/routes/projects';
import type { Project, ProjectPriority, ProjectStatus } from '@/types/project';

const SEARCH_DEBOUNCE_MS = 300;

const EMPTY_FILTERS: ProjectFilters = {
    search: '',
    status: ANY_VALUE,
    priority: ANY_VALUE,
};

export default function Projects() {
    const [filters, setFilters] = useState<ProjectFilters>(EMPTY_FILTERS);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Project | null>(null);
    const [deleting, setDeleting] = useState<Project | null>(null);

    useEffect(() => {
        const timeout = setTimeout(
            () => setDebouncedSearch(filters.search.trim()),
            SEARCH_DEBOUNCE_MS,
        );

        return () => clearTimeout(timeout);
    }, [filters.search]);

    const query = useMemo(
        () => ({
            search: debouncedSearch,
            status:
                filters.status === ANY_VALUE
                    ? null
                    : (filters.status as ProjectStatus),
            priority:
                filters.priority === ANY_VALUE
                    ? null
                    : (filters.priority as ProjectPriority),
            page,
        }),
        [debouncedSearch, filters.status, filters.priority, page],
    );

    const { projects, meta, loading, error, reload } = useProjects(query);

    const filtered =
        query.search !== '' || query.status !== null || query.priority !== null;

    /**
     * Step back a page when the deleted project was the last one on it, so the
     * table never lands on a page that no longer exists.
     */
    function handleDeleted(): void {
        if (projects.length === 1 && page > 1) {
            setPage(page - 1);

            return;
        }

        reload();
    }

    function changeFilters(next: ProjectFilters): void {
        setFilters(next);
        setPage(1);
    }

    function openCreateForm(): void {
        setEditing(null);
        setFormOpen(true);
    }

    function openEditForm(project: Project): void {
        setEditing(project);
        setFormOpen(true);
    }

    const initialLoading = loading && meta === null;
    const showFilters = meta !== null && (meta.total > 0 || filtered);

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

            {initialLoading && (
                <>
                    <ProjectFiltersBarSkeleton />

                    <ProjectsTableSkeleton />
                </>
            )}

            {!initialLoading && error && (
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

            {!initialLoading && !error && (
                <>
                    {showFilters && (
                        <ProjectFiltersBar
                            filters={filters}
                            onChange={changeFilters}
                        />
                    )}

                    {loading && (
                        <ProjectsTableSkeleton
                            rows={Math.max(projects.length, 1)}
                        />
                    )}

                    {!loading && meta !== null && meta.total === 0 && (
                        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
                            {filtered ? (
                                <div>
                                    <p className="font-medium">
                                        No matching projects
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        Try a different search or clear the
                                        filters.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <p className="font-medium">
                                            No projects yet
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            Create your first project to start
                                            tracking it.
                                        </p>
                                    </div>

                                    <Button onClick={openCreateForm}>
                                        <Plus />
                                        New project
                                    </Button>
                                </>
                            )}
                        </div>
                    )}

                    {!loading && meta !== null && meta.total > 0 && (
                        <>
                            <ProjectsTable
                                projects={projects}
                                onEdit={openEditForm}
                                onDelete={setDeleting}
                            />

                            <ProjectsPagination
                                meta={meta}
                                onPageChange={setPage}
                            />
                        </>
                    )}
                </>
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
                onDeleted={handleDeleted}
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
