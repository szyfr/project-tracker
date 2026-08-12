import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, fetchProjects } from '@/lib/projects-api';
import type { PaginationMeta, Project, ProjectQuery } from '@/types/project';

type UseProjects = {
    projects: Project[];
    meta: PaginationMeta | null;
    loading: boolean;
    error: string | null;
    reload: () => void;
};

type LoadedProjects = {
    key: string;
    projects: Project[];
    meta: PaginationMeta | null;
    error: string | null;
};

/**
 * Load the page of projects described by the query, keeping the previously
 * loaded page on screen until the next one arrives.
 */
export function useProjects(query: ProjectQuery): UseProjects {
    const [loaded, setLoaded] = useState<LoadedProjects | null>(null);
    const [reloadCount, setReloadCount] = useState(0);
    const latestRequest = useRef(0);

    const { search, status, priority, page } = query;
    const requestKey = JSON.stringify([
        search,
        status,
        priority,
        page,
        reloadCount,
    ]);

    useEffect(() => {
        const requestId = ++latestRequest.current;

        void fetchProjects({ search, status, priority, page })
            .then((loadedPage) => {
                if (requestId !== latestRequest.current) {
                    return;
                }

                setLoaded({
                    key: requestKey,
                    projects: loadedPage.data,
                    meta: loadedPage.meta,
                    error: null,
                });
            })
            .catch((exception: unknown) => {
                if (requestId !== latestRequest.current) {
                    return;
                }

                setLoaded({
                    key: requestKey,
                    projects: [],
                    meta: null,
                    error:
                        exception instanceof ApiError
                            ? exception.message
                            : 'Unable to load projects.',
                });
            });
    }, [requestKey, search, status, priority, page]);

    const reload = useCallback(() => setReloadCount((count) => count + 1), []);

    const settled = loaded?.key === requestKey;

    return {
        projects: loaded?.projects ?? [],
        meta: loaded?.meta ?? null,
        loading: !settled,
        error: settled ? loaded.error : null,
        reload,
    };
}
