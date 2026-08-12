import { statusAccents } from '@/components/projects/project-badges';
import { cn } from '@/lib/utils';
import { PROJECT_STATUSES } from '@/types/project';
import type { ProjectStatus, ProjectStatusCounts } from '@/types/project';

const TILE_CLASSES =
    'group flex flex-col gap-1 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none data-[active=true]:bg-accent';

type ProjectStatusTilesProps = {
    counts: ProjectStatusCounts;
    active: ProjectStatus | null;
    onSelect: (status: ProjectStatus | null) => void;
};

/**
 * The portfolio breakdown, doubling as the status filter: each tile toggles the
 * status it counts, and the leading tile clears the filter.
 */
export function ProjectStatusTiles({
    counts,
    active,
    onSelect,
}: ProjectStatusTilesProps) {
    const total = PROJECT_STATUSES.reduce(
        (sum, status) => sum + counts[status],
        0,
    );

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <button
                type="button"
                data-active={active === null}
                aria-pressed={active === null}
                className={cn(
                    TILE_CLASSES,
                    'data-[active=true]:border-foreground/30',
                )}
                onClick={() => onSelect(null)}
            >
                <span className="text-sm text-muted-foreground">
                    All projects
                </span>

                <span className="text-2xl font-semibold tracking-tight tabular-nums">
                    {total}
                </span>
            </button>

            {PROJECT_STATUSES.map((status) => {
                const isActive = active === status;

                return (
                    <button
                        key={status}
                        type="button"
                        data-active={isActive}
                        aria-pressed={isActive}
                        className={cn(TILE_CLASSES, statusAccents[status].tile)}
                        onClick={() => onSelect(isActive ? null : status)}
                    >
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <span
                                className={cn(
                                    'size-1.5 rounded-full',
                                    statusAccents[status].dot,
                                )}
                            />
                            {status}
                        </span>

                        <span className="text-2xl font-semibold tracking-tight tabular-nums">
                            {counts[status]}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
