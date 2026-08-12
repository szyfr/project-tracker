import { Skeleton } from '@/components/ui/skeleton';
import { PROJECT_STATUSES } from '@/types/project';

const TILES = ['All projects', ...PROJECT_STATUSES];

export function ProjectStatusTilesSkeleton() {
    return (
        <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
            aria-hidden="true"
            data-slot="status-tiles-skeleton"
        >
            {TILES.map((tile) => (
                <div
                    key={tile}
                    className="flex flex-col gap-1 rounded-xl border bg-card p-4"
                >
                    <span className="text-sm text-muted-foreground">
                        {tile}
                    </span>

                    <Skeleton className="h-8 w-10" />
                </div>
            ))}
        </div>
    );
}
