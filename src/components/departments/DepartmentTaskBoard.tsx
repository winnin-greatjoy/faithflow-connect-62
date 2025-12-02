import React, { useEffect, useState } from 'react';
import { TaskWorkspaceDialog } from './tasks/TaskWorkspaceDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, GripVertical, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'backlog' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_name: string | null;
  due_date: string | null;
  tags: string[];
  checklist: any[] | null;
  comments: any[] | null;
}

interface Props {
  departmentId: string | number;
  canEdit?: boolean;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const statusColumns = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
] as const;

export const DepartmentTaskBoard: React.FC<Props> = ({ departmentId, canEdit = false }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignee_name: '',
    due_date: '',
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const { toast } = useToast();

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('department_tasks')
        .select('*')
        .eq('department_id', String(departmentId))
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data as any) || []);
    } catch (error: any) {
      toast({
        title: 'Error loading tasks',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [departmentId]);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a task title',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('department_tasks').insert({
        department_id: String(departmentId),
        title: newTask.title,
        description: newTask.description || null,
        priority: newTask.priority,
        assignee_name: newTask.assignee_name || null,
        due_date: newTask.due_date || null,
        status: 'backlog',
      } as any);

      if (error) throw error;

      toast({ title: 'Task created', description: 'New task added successfully' });
      setIsAddTaskOpen(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        assignee_name: '',
        due_date: '',
      });
      loadTasks();
    } catch (error: any) {
      toast({
        title: 'Error creating task',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { error } = await supabase
        .from('department_tasks')
        .update({ status: newStatus } as any)
        .eq('id', taskId);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
      );

      toast({ title: 'Task updated', description: 'Task status changed successfully' });
    } catch (error: any) {
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const tasksByStatus = (status: Task['status']) => tasks.filter((task) => task.status === status);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tasks</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-20 bg-muted rounded"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Department Tasks</h3>
        {canEdit && (
          <Button onClick={() => setIsAddTaskOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusColumns.map((column) => (
          <Card key={column.value}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                {column.label}
                <Badge variant="secondary">{tasksByStatus(column.value).length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasksByStatus(column.value).length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No tasks in {column.label.toLowerCase()}
                </div>
              ) : (
                tasksByStatus(column.value).map((task) => (
                  <Card
                    key={task.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsWorkspaceOpen(true);
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </Badge>

                        {task.assignee_name && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{task.assignee_name}</span>
                          </div>
                        )}

                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(task.due_date), 'MMM dd')}</span>
                          </div>
                        )}
                      </div>

                      {canEdit && (
                        <Select
                          value={task.status}
                          onValueChange={(value) =>
                            updateTaskStatus(task.id, value as Task['status'])
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusColumns.map((col) => (
                              <SelectItem key={col.value} value={col.value}>
                                {col.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, priority: value as 'low' | 'medium' | 'high' })
                  }
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assignee</label>
              <Input
                value={newTask.assignee_name}
                onChange={(e) => setNewTask({ ...newTask, assignee_name: e.target.value })}
                placeholder="Assign to member"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TaskWorkspaceDialog
        task={selectedTask}
        isOpen={isWorkspaceOpen}
        onClose={() => {
          setIsWorkspaceOpen(false);
          setSelectedTask(null);
        }}
        onUpdate={loadTasks}
      />
    </div>
  );
};

export default DepartmentTaskBoard;
