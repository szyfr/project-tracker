import { cn } from '@/lib/utils';
import type { ProjectPriority, ProjectStatus } from '@/types/project';

/**
 * One accent colour per status, shared by the badges, the status tiles, and the
 * row markers so a status always reads the same way across the page.
 */
export const statusAccents: Record<
    ProjectStatus,
    { dot: string; badge: string; tile: string }
> = {
    Planning: {
        dot: 'bg-slate-400 dark:bg-slate-500',
        badge: 'border-slate-400/30 bg-slate-400/10 text-slate-700 dark:text-slate-300',
        tile: 'data-[active=true]:border-slate-400/60 data-[active=true]:bg-slate-400/10',
    },
    'In Progress': {
        dot: 'bg-blue-500',
        badge: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
        tile: 'data-[active=true]:border-blue-500/60 data-[active=true]:bg-blue-500/10',
    },
    'On Hold': {
        dot: 'bg-amber-500',
        badge: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        tile: 'data-[active=true]:border-amber-500/60 data-[active=true]:bg-amber-500/10',
    },
    Completed: {
        dot: 'bg-emerald-500',
        badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        tile: 'data-[active=true]:border-emerald-500/60 data-[active=true]:bg-emerald-500/10',
    },
};

const priorityAccents: Record<ProjectPriority, { dot: string; text: string }> =
    {
        Low: { dot: 'bg-muted-foreground/40', text: 'text-muted-foreground' },
        Medium: { dot: 'bg-amber-500', text: 'text-foreground' },
        High: { dot: 'bg-red-500', text: 'text-red-700 dark:text-red-300' },
    };

export function StatusBadge({ status }: { status: ProjectStatus }) {
    const accent = statusAccents[status];

    return (
        <span
            className={cn(
                'inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
                accent.badge,
            )}
        >
            <span className={cn('size-1.5 rounded-full', accent.dot)} />
            {status}
        </span>
    );
}

export function PriorityBadge({ priority }: { priority: ProjectPriority }) {
    const accent = priorityAccents[priority];

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 text-sm whitespace-nowrap',
                accent.text,
                priority === 'High' && 'font-medium',
            )}
        >
            <span className={cn('size-1.5 rounded-full', accent.dot)} />
            {priority}
        </span>
    );
}
