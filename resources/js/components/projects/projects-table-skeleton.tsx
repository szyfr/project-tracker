import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const COLUMNS = [
    'Client',
    'Project',
    'Status',
    'Priority',
    'Start date',
    'Due date',
    'Actions',
];

type ProjectsTableSkeletonProps = {
    rows?: number;
};

export function ProjectsTableSkeleton({
    rows = 5,
}: ProjectsTableSkeletonProps) {
    return (
        <div
            className="overflow-x-auto rounded-xl border"
            aria-busy="true"
            aria-live="polite"
            aria-label="Loading projects"
        >
            <Table>
                <TableHeader>
                    <TableRow>
                        {COLUMNS.map((column) => (
                            <TableHead
                                key={column}
                                className={
                                    column === 'Actions' ? 'text-right' : ''
                                }
                            >
                                {column}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {Array.from({ length: rows }).map((_, row) => (
                        <TableRow key={row}>
                            <TableCell>
                                <Skeleton className="h-4 w-28" />
                            </TableCell>

                            <TableCell className="max-w-md">
                                <Skeleton className="h-4 w-40" />

                                <Skeleton className="mt-2 h-3 w-56" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-4 w-24" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-4 w-24" />
                            </TableCell>

                            <TableCell>
                                <div className="flex justify-end gap-1">
                                    <Skeleton className="size-8 rounded-md" />

                                    <Skeleton className="size-8 rounded-md" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
