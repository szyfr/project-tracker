import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    ApiError,
    createProject,
    fetchProject,
    updateProject,
} from '@/lib/projects-api';
import { PROJECT_PRIORITIES, PROJECT_STATUSES } from '@/types/project';
import type {
    Project,
    ProjectErrors,
    ProjectPayload,
    ProjectPriority,
    ProjectStatus,
} from '@/types/project';

/** Kept in step with the date bounds in `ProjectValidationRules`. */
const EARLIEST_DATE = '1900-01-01';
const LATEST_DATE = '2100-12-31';

const emptyPayload: ProjectPayload = {
    client_name: '',
    project_name: '',
    description: '',
    status: 'Planning',
    priority: 'Medium',
    start_date: '',
    due_date: '',
};

function toPayload(project: Project | null): ProjectPayload {
    if (!project) {
        return emptyPayload;
    }

    return {
        client_name: project.client_name,
        project_name: project.project_name,
        description: project.description ?? '',
        status: project.status,
        priority: project.priority,
        start_date: project.start_date ?? '',
        due_date: project.due_date ?? '',
    };
}

type ProjectFormDialogProps = {
    project: Project | null;
    onOpenChange: (open: boolean) => void;
    onSaved: () => void;
};

/**
 * Mount this dialog only while it is open so the form state always starts
 * from the project being edited.
 */
export function ProjectFormDialog({
    project,
    onOpenChange,
    onSaved,
}: ProjectFormDialogProps) {
    const [data, setData] = useState<ProjectPayload>(toPayload(project));
    const [errors, setErrors] = useState<ProjectErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(project !== null);

    useEffect(() => {
        if (!project) {
            return;
        }

        let cancelled = false;

        fetchProject(project.id)
            .then((fresh) => {
                if (!cancelled) {
                    setData(toPayload(fresh));
                }
            })
            .catch((exception) => {
                if (!cancelled) {
                    setFormError(
                        exception instanceof ApiError
                            ? exception.message
                            : 'Unable to load the project.',
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [project]);

    function update<K extends keyof ProjectPayload>(
        field: K,
        value: ProjectPayload[K],
    ): void {
        setData((current) => ({ ...current, [field]: value }));
    }

    async function submit(event: React.FormEvent): Promise<void> {
        event.preventDefault();
        setProcessing(true);
        setErrors({});
        setFormError(null);

        try {
            if (project) {
                await updateProject(project.id, data);
            } else {
                await createProject(data);
            }

            toast.success(project ? 'Project updated.' : 'Project created.');
            onOpenChange(false);
            onSaved();
        } catch (exception) {
            if (exception instanceof ApiError && exception.status === 422) {
                setErrors(exception.errors);
                setFormError(exception.message);
            } else {
                setFormError(
                    exception instanceof ApiError
                        ? exception.message
                        : 'Unable to save the project.',
                );
            }
        } finally {
            setProcessing(false);
        }
    }

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {project ? 'Edit project' : 'New project'}
                    </DialogTitle>

                    <DialogDescription>
                        {project
                            ? `Update the details for ${project.project_name}.`
                            : 'Add a project to the tracker.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4" noValidate>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="client_name">Client name</Label>

                            <Input
                                id="client_name"
                                name="client_name"
                                value={data.client_name}
                                onChange={(event) =>
                                    update('client_name', event.target.value)
                                }
                                aria-invalid={Boolean(errors.client_name)}
                                autoComplete="organization"
                            />

                            <InputError message={errors.client_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="project_name">Project name</Label>

                            <Input
                                id="project_name"
                                name="project_name"
                                value={data.project_name}
                                onChange={(event) =>
                                    update('project_name', event.target.value)
                                }
                                aria-invalid={Boolean(errors.project_name)}
                            />

                            <InputError message={errors.project_name} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>

                        <Textarea
                            id="description"
                            name="description"
                            value={data.description}
                            onChange={(event) =>
                                update('description', event.target.value)
                            }
                            aria-invalid={Boolean(errors.description)}
                            rows={3}
                        />

                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>

                            <Select
                                value={data.status}
                                onValueChange={(value) =>
                                    update('status', value as ProjectStatus)
                                }
                            >
                                <SelectTrigger
                                    id="status"
                                    className="w-full"
                                    aria-invalid={Boolean(errors.status)}
                                >
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    {PROJECT_STATUSES.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <InputError message={errors.status} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>

                            <Select
                                value={data.priority}
                                onValueChange={(value) =>
                                    update('priority', value as ProjectPriority)
                                }
                            >
                                <SelectTrigger
                                    id="priority"
                                    className="w-full"
                                    aria-invalid={Boolean(errors.priority)}
                                >
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    {PROJECT_PRIORITIES.map((priority) => (
                                        <SelectItem
                                            key={priority}
                                            value={priority}
                                        >
                                            {priority}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <InputError message={errors.priority} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="start_date">Start date</Label>

                            <Input
                                id="start_date"
                                name="start_date"
                                type="date"
                                min={EARLIEST_DATE}
                                max={LATEST_DATE}
                                value={data.start_date}
                                onChange={(event) =>
                                    update('start_date', event.target.value)
                                }
                                aria-invalid={Boolean(errors.start_date)}
                            />

                            <InputError message={errors.start_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="due_date">Due date</Label>

                            <Input
                                id="due_date"
                                name="due_date"
                                type="date"
                                min={data.start_date || EARLIEST_DATE}
                                max={LATEST_DATE}
                                value={data.due_date}
                                onChange={(event) =>
                                    update('due_date', event.target.value)
                                }
                                aria-invalid={Boolean(errors.due_date)}
                            />

                            <InputError message={errors.due_date} />
                        </div>
                    </div>

                    {formError && (
                        <p role="alert" className="text-sm text-destructive">
                            {formError}
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

                        <Button type="submit" disabled={processing || loading}>
                            {project ? 'Save changes' : 'Create project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
