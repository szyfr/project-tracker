import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ApiError, deleteProject } from '@/lib/projects-api';
import type { Project } from '@/types/project';

type DeleteProjectDialogProps = {
    project: Project | null;
    onOpenChange: (open: boolean) => void;
    onDeleted: () => void;
};

export function DeleteProjectDialog({
    project,
    onOpenChange,
    onDeleted,
}: DeleteProjectDialogProps) {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function confirm(): Promise<void> {
        if (!project) {
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            await deleteProject(project.id);

            toast.success('Project deleted.');
            onOpenChange(false);
            onDeleted();
        } catch (exception) {
            setError(
                exception instanceof ApiError
                    ? exception.message
                    : 'Unable to delete the project.',
            );
        } finally {
            setProcessing(false);
        }
    }

    return (
        <Dialog
            open={project !== null}
            onOpenChange={(open) => {
                setError(null);
                onOpenChange(open);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete project</DialogTitle>

                    <DialogDescription>
                        {project && (
                            <>
                                This permanently deletes{' '}
                                <span className="font-medium text-foreground">
                                    {project.project_name}
                                </span>{' '}
                                for {project.client_name}. This cannot be
                                undone.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <p role="alert" className="text-sm text-destructive">
                        {error}
                    </p>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        variant="destructive"
                        onClick={confirm}
                        disabled={processing}
                    >
                        Delete project
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
