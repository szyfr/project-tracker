import { useCallback, useEffect, useState } from 'react';
import { ApiError, fetchProjects } from '@/lib/projects-api';
import type { Project } from '@/types/project';

type UseProjects = {
    projects: Project[];
    loading: boolean;
    error: string | null;
    reload: () => void;
};

export function useProjects(): UseProjects {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(
        () =>
            fetchProjects()
                .then((loaded) => {
                    setProjects(loaded);
                    setError(null);
                })
                .catch((exception: unknown) => {
                    setError(
                        exception instanceof ApiError
                            ? exception.message
                            : 'Unable to load projects.',
                    );
                })
                .finally(() => setLoading(false)),
        [],
    );

    const reload = useCallback(() => {
        setLoading(true);

        void load();
    }, [load]);

    useEffect(() => {
        void load();
    }, [load]);

    return { projects, loading, error, reload };
}
