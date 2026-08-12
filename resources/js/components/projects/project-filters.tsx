import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PROJECT_PRIORITIES, PROJECT_STATUSES } from '@/types/project';

export const ANY_VALUE = 'Any';

export type ProjectFilters = {
    search: string;
    status: string;
    priority: string;
};

type ProjectFiltersProps = {
    filters: ProjectFilters;
    onChange: (filters: ProjectFilters) => void;
};

export function ProjectFiltersBar({ filters, onChange }: ProjectFiltersProps) {
    return (
        <div className="flex flex-wrap items-end gap-3">
            <div className="grid min-w-56 flex-1 gap-2">
                <Label htmlFor="search">Search</Label>

                <div className="relative">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        id="search"
                        className="pl-9"
                        placeholder="Client or project name"
                        value={filters.search}
                        onChange={(event) =>
                            onChange({ ...filters, search: event.target.value })
                        }
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="status-filter">Status</Label>

                <Select
                    value={filters.status}
                    onValueChange={(status) => onChange({ ...filters, status })}
                >
                    <SelectTrigger id="status-filter" className="w-44">
                        <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value={ANY_VALUE}>Any status</SelectItem>

                        {PROJECT_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                                {status}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="priority-filter">Priority</Label>

                <Select
                    value={filters.priority}
                    onValueChange={(priority) =>
                        onChange({ ...filters, priority })
                    }
                >
                    <SelectTrigger id="priority-filter" className="w-44">
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
            </div>
        </div>
    );
}
