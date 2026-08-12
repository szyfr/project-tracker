import { Skeleton } from '@/components/ui/skeleton';

export function ProjectFiltersBarSkeleton() {
    return (
        <div
            className="flex flex-wrap items-center gap-2"
            aria-hidden="true"
            data-slot="filters-skeleton"
        >
            <Skeleton className="h-9 min-w-56 flex-1" />

            <Skeleton className="h-9 w-40" />
        </div>
    );
}
