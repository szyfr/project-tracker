import { CircleCheck, CirclePause, ClipboardList, Loader } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProjectPriority, ProjectStatus } from '@/types/project';

const statusIcons: Record<ProjectStatus, LucideIcon> = {
    Planning: ClipboardList,
    'In Progress': Loader,
    'On Hold': CirclePause,
    Completed: CircleCheck,
};

const statusIconStyles: Record<ProjectStatus, string> = {
    Planning: 'text-muted-foreground',
    'In Progress': 'text-muted-foreground',
    'On Hold': 'text-muted-foreground',
    Completed: 'fill-emerald-600 text-background dark:fill-emerald-500',
};

const priorityStyles: Record<ProjectPriority, string> = {
    Low: 'text-muted-foreground',
    Medium: 'text-amber-700 dark:text-amber-300',
    High: 'text-red-700 dark:text-red-300',
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
    const Icon = statusIcons[status];

    return (
        <Badge variant="outline">
            <Icon className={cn(statusIconStyles[status])} />
            {status}
        </Badge>
    );
}

export function PriorityBadge({ priority }: { priority: ProjectPriority }) {
    return (
        <span className={cn('text-sm font-medium', priorityStyles[priority])}>
            {priority}
        </span>
    );
}
