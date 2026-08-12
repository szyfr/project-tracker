import { Pencil, Trash2 } from 'lucide-react';
import {
    PriorityBadge,
    StatusBadge,
} from '@/components/projects/project-badges';
import { Button } from '@/components/ui/button';
import { formatDate, summarizeDue } from '@/lib/project-dates';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';

type ProjectsCardListProps = {
    projects: Project[];
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
};

/**
 * The small-screen view of the project list, replacing the table below `md`.
 */
export function ProjectsCardList({
    projects,
    onEdit,
    onDelete,
}: ProjectsCardListProps) {
    return (
        <ul className="flex flex-col gap-3 md:hidden">
            {projects.map((project) => {
                const due = summarizeDue(project.due_date, project.status);

                return (
                    <li
                        key={project.id}
                        className="flex flex-col gap-3 rounded-xl border bg-card p-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-medium">
                                    {project.project_name}
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    {project.client_name}
                                </p>
                            </div>

                            <StatusBadge status={project.status} />
                        </div>

                        {project.description && (
                            <p className="line-clamp-2 text-sm text-muted-foreground/80">
                                {project.description}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <PriorityBadge priority={project.priority} />

                            <span>
                                {formatDate(project.start_date)} –{' '}
                                {formatDate(project.due_date)}
                            </span>

                            {due && (
                                <span className={cn('text-xs', due.className)}>
                                    {due.label}
                                </span>
                            )}
                        </div>

                        <div className="flex justify-end gap-1 border-t pt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(project)}
                            >
                                <Pencil />
                                Edit
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(project)}
                            >
                                <Trash2 className="text-destructive" />
                                Delete
                            </Button>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
