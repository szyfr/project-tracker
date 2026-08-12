import { Pencil, Trash2 } from 'lucide-react';
import {
    PriorityBadge,
    StatusBadge,
} from '@/components/projects/project-badges';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Project } from '@/types/project';

function formatDate(date: string | null): string {
    if (!date) {
        return '—';
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

type ProjectsTableProps = {
    projects: Project[];
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
};

export function ProjectsTable({
    projects,
    onEdit,
    onDelete,
}: ProjectsTableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Start date</TableHead>
                        <TableHead>Due date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {projects.map((project) => (
                        <TableRow key={project.id}>
                            <TableCell className="font-medium whitespace-nowrap">
                                {project.client_name}
                            </TableCell>

                            <TableCell className="max-w-md">
                                <div className="font-medium">
                                    {project.project_name}
                                </div>

                                {project.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {project.description}
                                    </p>
                                )}
                            </TableCell>

                            <TableCell>
                                <StatusBadge status={project.status} />
                            </TableCell>

                            <TableCell>
                                <PriorityBadge priority={project.priority} />
                            </TableCell>

                            <TableCell className="whitespace-nowrap">
                                {formatDate(project.start_date)}
                            </TableCell>

                            <TableCell className="whitespace-nowrap">
                                {formatDate(project.due_date)}
                            </TableCell>

                            <TableCell>
                                <div className="flex justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(project)}
                                        aria-label={`Edit ${project.project_name}`}
                                    >
                                        <Pencil />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(project)}
                                        aria-label={`Delete ${project.project_name}`}
                                    >
                                        <Trash2 className="text-destructive" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
