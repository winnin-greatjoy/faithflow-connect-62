import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tasksApi } from '@/services/calendarApi';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  task?: any; // Passing task object if editing
}

export const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  task,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: task?.title || '',
    due_date: task?.due_date || new Date().toISOString().split('T')[0],
    priority: (task?.priority as 'low' | 'medium' | 'high') || 'medium',
  });

  // Reset form when task changes or dialog opens
  React.useEffect(() => {
    if (open) {
      setForm({
        title: task?.title || '',
        due_date: task?.due_date || new Date().toISOString().split('T')[0],
        priority: (task?.priority as 'low' | 'medium' | 'high') || 'medium',
      });
    }
  }, [open, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    setLoading(true);
    try {
      let error;
      if (task?.id) {
        const result = await tasksApi.updateTask(task.id, {
          title: form.title,
          due_date: form.due_date,
          priority: form.priority,
        });
        error = result.error;
      } else {
        const result = await tasksApi.createTask({
          title: form.title,
          due_date: form.due_date,
          priority: form.priority,
          is_completed: false,
        });
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: task?.id ? 'Task updated' : 'Task created',
        description: task?.id
          ? 'Your task has been updated.'
          : 'Your personal task has been added.',
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task?.id) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    setLoading(true);
    try {
      const { error } = await tasksApi.deleteTask(task.id);
      if (error) throw error;
      toast({ title: 'Task deleted', description: 'Your task has been removed.' });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task?.id ? 'Edit Task' : 'Create Personal Task'}</DialogTitle>
          <DialogDescription>
            {task?.id ? 'Update your task details.' : 'Add a new task to your personal calendar.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Due Date</Label>
              <Input
                id="date"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v: any) => setForm((prev) => ({ ...prev, priority: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center sm:justify-between">
            {task?.id ? (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Task
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading || !form.title}>
              {loading && !task?.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {task?.id ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
