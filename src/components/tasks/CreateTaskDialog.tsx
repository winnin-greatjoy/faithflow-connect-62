
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tasksApi } from '@/services/calendarApi';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CreateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ open, onOpenChange, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [form, setForm] = useState({
        title: '',
        due_date: new Date().toISOString().split('T')[0],
        priority: 'medium' as 'low' | 'medium' | 'high'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title) return;

        setLoading(true);
        try {
            const { error } = await tasksApi.createTask({
                title: form.title,
                due_date: form.due_date,
                priority: form.priority,
                is_completed: false
            });

            if (error) throw error;

            toast({ title: 'Task created', description: 'Your personal task has been added.' });
            onOpenChange(false);
            setForm({ title: '', due_date: new Date().toISOString().split('T')[0], priority: 'medium' });
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
                    <DialogTitle>Create Personal Task</DialogTitle>
                    <DialogDescription>Add a new task to your personal calendar.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Task Title</Label>
                        <Input
                            id="title"
                            placeholder="What needs to be done?"
                            value={form.title}
                            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
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
                                onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={form.priority}
                                onValueChange={(v: any) => setForm(prev => ({ ...prev, priority: v }))}
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !form.title}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
