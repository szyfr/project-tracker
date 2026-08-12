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
import { formatDate, summarizeDue } from '@/lib/project-dates';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';

type ProjectsTableProps = {
    projects: Project[];
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
};

/**
 * The desktop view of the project list. Below `md` the page renders
 * `ProjectsCardList` instead, which carries the same data without the scroll.
 */
export function ProjectsTable({
    projects,
    onEdit,
    onDelete,
}: ProjectsTableProps) {
    return (
        <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                        <TableHead>Project</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead className="w-24 text-right">
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {projects.map((project) => {
                        const due = summarizeDue(
                            project.due_date,
                            project.status,
                        );

                        return (
                            <TableRow key={project.id} className="group">
                                <TableCell className="max-w-md py-3">
                                    <div className="font-medium">
                                        {project.project_name}
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        {project.client_name}
                                    </div>

                                    {project.description && (
                                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground/80">
                                            {project.description}
                                        </p>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <StatusBadge status={project.status} />
                                </TableCell>

                                <TableCell>
                                    <PriorityBadge
                                        priority={project.priority}
                                    />
                                </TableCell>

                                <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                                    {formatDate(project.start_date)}
                                </TableCell>

                                <TableCell className="whitespace-nowrap">
                                    <div className="text-sm">
                                        {formatDate(project.due_date)}
                                    </div>

                                    {due && (
                                        <div
                                            className={cn(
                                                'text-xs',
                                                due.className,
                                            )}
                                        >
                                            {due.label}
                                        </div>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <div className="flex justify-end gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
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
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
