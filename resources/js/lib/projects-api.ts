import ProjectController from '@/actions/App/Http/Controllers/ProjectController';
import type { Project, ProjectErrors, ProjectPayload } from '@/types/project';

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly errors: ProjectErrors = {},
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

type ValidationResponse = {
    message?: string;
    errors?: Record<string, string[]>;
};

function csrfToken(): string {
    const cookie = document.cookie
        .split('; ')
        .find((entry) => entry.startsWith('XSRF-TOKEN='));

    return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}

function firstMessagePerField(errors: Record<string, string[]>): ProjectErrors {
    return Object.fromEntries(
        Object.entries(errors).map(([field, messages]) => [field, messages[0]]),
    );
}

async function request<T>(
    url: string,
    method: string,
    body?: unknown,
): Promise<T> {
    let response: Response;

    try {
        response = await fetch(url, {
            method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': csrfToken(),
            },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        throw new ApiError(
            'Unable to reach the server. Check your connection and try again.',
            0,
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const payload = await response.json().catch(() => null);

    if (response.ok) {
        return payload as T;
    }

    if (response.status === 422) {
        const validation = (payload ?? {}) as ValidationResponse;

        throw new ApiError(
            'Please fix the highlighted fields.',
            422,
            firstMessagePerField(validation.errors ?? {}),
        );
    }

    if (response.status === 404) {
        throw new ApiError('That project no longer exists.', 404);
    }

    throw new ApiError(
        'Something went wrong on the server. Please try again.',
        response.status,
    );
}

export function fetchProjects(): Promise<Project[]> {
    return request<Project[]>(ProjectController.index.url(), 'get');
}

export function fetchProject(id: number): Promise<Project> {
    return request<Project>(ProjectController.show.url(id), 'get');
}

export function createProject(payload: ProjectPayload): Promise<Project> {
    return request<Project>(ProjectController.store.url(), 'post', payload);
}

export function updateProject(
    id: number,
    payload: ProjectPayload,
): Promise<Project> {
    return request<Project>(ProjectController.update.url(id), 'put', payload);
}

export function deleteProject(id: number): Promise<void> {
    return request<void>(ProjectController.destroy.url(id), 'delete');
}
