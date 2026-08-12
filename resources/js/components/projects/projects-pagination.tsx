import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaginationMeta } from '@/types/project';

type ProjectsPaginationProps = {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
};

export function ProjectsPagination({
    meta,
    onPageChange,
}: ProjectsPaginationProps) {
    const from = meta.from ?? 0;
    const to = meta.to ?? 0;

    return (
        <nav
            className="flex flex-wrap items-center justify-between gap-3"
            aria-label="Project pages"
        >
            <p className="text-sm text-muted-foreground">
                Showing {from}–{to} of {meta.total}{' '}
                {meta.total === 1 ? 'project' : 'projects'}
            </p>

            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                    Page {meta.current_page} of {meta.last_page}
                </span>

                <Button
                    variant="outline"
                    size="icon"
                    disabled={meta.current_page <= 1}
                    onClick={() => onPageChange(meta.current_page - 1)}
                    aria-label="Previous page"
                >
                    <ChevronLeft />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => onPageChange(meta.current_page + 1)}
                    aria-label="Next page"
                >
                    <ChevronRight />
                </Button>
            </div>
        </nav>
    );
}
