import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProjectPriority, ProjectStatus } from '@/types/project';

const statusStyles: Record<ProjectStatus, string> = {
    Planning:
        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    'In Progress':
        'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    'On Hold':
        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    Completed:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
};

const priorityStyles: Record<ProjectPriority, string> = {
    Low: 'text-muted-foreground',
    Medium: 'text-amber-700 dark:text-amber-300',
    High: 'text-red-700 dark:text-red-300',
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
    return (
        <Badge className={cn('border-transparent', statusStyles[status])}>
            {status}
        </Badge>
    );
}

export function PriorityBadge({ priority }: { priority: ProjectPriority }) {
    return (
        <Badge variant="outline" className={cn(priorityStyles[priority])}>
            {priority}
        </Badge>
    );
}
