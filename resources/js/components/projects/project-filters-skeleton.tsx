import { Skeleton } from '@/components/ui/skeleton';

const LABEL_CLASSES = 'text-sm leading-none font-medium text-muted-foreground';

export function ProjectFiltersBarSkeleton() {
    return (
        <div
            className="flex flex-wrap items-end gap-3"
            aria-hidden="true"
            data-slot="filters-skeleton"
        >
            <div className="grid min-w-56 flex-1 gap-2">
                <span className={LABEL_CLASSES}>Search</span>

                <Skeleton className="h-9 w-full" />
            </div>

            <div className="grid gap-2">
                <span className={LABEL_CLASSES}>Status</span>

                <Skeleton className="h-9 w-44" />
            </div>

            <div className="grid gap-2">
                <span className={LABEL_CLASSES}>Priority</span>

                <Skeleton className="h-9 w-44" />
            </div>
        </div>
    );
}
