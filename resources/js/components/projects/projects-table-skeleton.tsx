import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const COLUMNS = ['Project', 'Status', 'Priority', 'Start', 'Due', ''];

type ProjectsTableSkeletonProps = {
    rows?: number;
};

export function ProjectsTableSkeleton({
    rows = 5,
}: ProjectsTableSkeletonProps) {
    const placeholders = Array.from({ length: rows });

    return (
        <div aria-busy="true" aria-live="polite" aria-label="Loading projects">
            <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                            {COLUMNS.map((column, index) => (
                                <TableHead key={column || index}>
                                    {column}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {placeholders.map((_, row) => (
                            <TableRow key={row}>
                                <TableCell className="max-w-md py-3">
                                    <Skeleton className="h-4 w-40" />

                                    <Skeleton className="mt-2 h-3 w-28" />
                                </TableCell>

                                <TableCell>
                                    <Skeleton className="h-5 w-24 rounded-full" />
                                </TableCell>

                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>

                                <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>

                                <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>

                                <TableCell />
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
                {placeholders.map((_, row) => (
                    <div
                        key={row}
                        className="flex flex-col gap-3 rounded-xl border bg-card p-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-4 w-40" />

                                <Skeleton className="h-3 w-24" />
                            </div>

                            <Skeleton className="h-5 w-24 rounded-full" />
                        </div>

                        <Skeleton className="h-3 w-full" />

                        <Skeleton className="h-3 w-48" />
                    </div>
                ))}
            </div>
        </div>
    );
}
