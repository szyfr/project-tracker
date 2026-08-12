import type { ProjectStatus } from '@/types/project';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const SOON_THRESHOLD_DAYS = 7;

/**
 * Parse a `Y-m-d` value as a local date, so a project due "today" never reads
 * as yesterday for viewers behind UTC.
 */
function toLocalDate(date: string): Date {
    return new Date(`${date}T00:00:00`);
}

function startOfToday(): Date {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysUntil(date: string): number {
    return Math.round(
        (toLocalDate(date).getTime() - startOfToday().getTime()) / MS_PER_DAY,
    );
}

export function formatDate(date: string | null): string {
    if (!date) {
        return '—';
    }

    return toLocalDate(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatShortDate(date: string | null): string {
    if (!date) {
        return '—';
    }

    return toLocalDate(date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
}

export type DueSummary = {
    label: string;
    className: string;
};

/**
 * Describe how urgent a due date is, relative to today. Completed projects are
 * never urgent, however far past their due date they are.
 */
export function summarizeDue(
    due: string | null,
    status: ProjectStatus,
): DueSummary | null {
    if (!due || status === 'Completed') {
        return null;
    }

    const days = daysUntil(due);

    if (days < 0) {
        const overdueBy = Math.abs(days);

        return {
            label: `${overdueBy} ${overdueBy === 1 ? 'day' : 'days'} overdue`,
            className: 'text-destructive',
        };
    }

    if (days === 0) {
        return {
            label: 'Due today',
            className: 'text-amber-700 dark:text-amber-300',
        };
    }

    if (days === 1) {
        return {
            label: 'Due tomorrow',
            className: 'text-amber-700 dark:text-amber-300',
        };
    }

    if (days <= SOON_THRESHOLD_DAYS) {
        return {
            label: `Due in ${days} days`,
            className: 'text-amber-700 dark:text-amber-300',
        };
    }

    return { label: `In ${days} days`, className: 'text-muted-foreground' };
}
