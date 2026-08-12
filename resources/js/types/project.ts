export const PROJECT_STATUSES = [
    'Planning',
    'In Progress',
    'On Hold',
    'Completed',
] as const;

export const PROJECT_PRIORITIES = ['Low', 'Medium', 'High'] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];

export type Project = {
    id: number;
    client_name: string;
    project_name: string;
    description: string | null;
    status: ProjectStatus;
    priority: ProjectPriority;
    start_date: string | null;
    due_date: string | null;
};

export type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

export type ProjectPage = {
    data: Project[];
    meta: PaginationMeta;
};

export type ProjectQuery = {
    search: string;
    status: ProjectStatus | null;
    priority: ProjectPriority | null;
    page: number;
};

export type ProjectPayload = {
    client_name: string;
    project_name: string;
    description: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    start_date: string;
    due_date: string;
};

export type ProjectErrors = Partial<Record<keyof ProjectPayload, string>>;
