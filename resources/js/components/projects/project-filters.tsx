import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PROJECT_PRIORITIES } from '@/types/project';

export const ANY_VALUE = 'Any';

export type ProjectFilters = {
    search: string;
    status: string;
    priority: string;
};

type ProjectFiltersProps = {
    filters: ProjectFilters;
    filtered: boolean;
    onChange: (filters: ProjectFilters) => void;
    onClear: () => void;
};

/**
 * Search and priority controls. Status is filtered from the tiles above, so it
 * deliberately has no select of its own here.
 */
export function ProjectFiltersBar({
    filters,
    filtered,
    onChange,
    onClear,
}: ProjectFiltersProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-56 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                    id="search"
                    className="pl-9"
                    placeholder="Search client or project name"
                    aria-label="Search projects"
                    value={filters.search}
                    onChange={(event) =>
                        onChange({ ...filters, search: event.target.value })
                    }
                />
            </div>

            <Select
                value={filters.priority}
                onValueChange={(priority) => onChange({ ...filters, priority })}
            >
                <SelectTrigger
                    id="priority-filter"
                    className="w-40"
                    aria-label="Filter by priority"
                >
                    <SelectValue />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value={ANY_VALUE}>Any priority</SelectItem>

                    {PROJECT_PRIORITIES.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                            {priority}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {filtered && (
                <Button variant="ghost" onClick={onClear}>
                    <X />
                    Clear
                </Button>
            )}
        </div>
    );
}
