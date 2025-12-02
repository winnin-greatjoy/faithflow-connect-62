import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  User,
  Clock,
  CheckSquare,
  MessageSquare,
  Send,
  Trash2,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Comment {
  id: string;
  text: string;
  author_name: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'backlog' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_name: string | null;
  due_date: string | null;
  checklist: ChecklistItem[] | null;
  comments: Comment[] | null;
  tags: string[];
}

interface TaskWorkspaceDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const TaskWorkspaceDialog: React.FC<TaskWorkspaceDialogProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { toast } = useToast();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newComment, setNewComment] = useState('');
  const [assignee, setAssignee] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setChecklist(Array.isArray(task.checklist) ? task.checklist : []);
      setComments(Array.isArray(task.comments) ? task.comments : []);
      setAssignee(task.assignee_name || '');
    }
  }, [task]);

  const saveTaskUpdate = async (updates: Partial<Task>) => {
    if (!task) return;
    try {
      const { error } = await supabase
        .from('department_tasks')
        .update(updates as any)
        .eq('id', task.id);

      if (error) throw error;
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) return;
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: newChecklistItem,
      completed: false,
    };
    const updatedChecklist = [...checklist, newItem];
    setChecklist(updatedChecklist);
    setNewChecklistItem('');
    await saveTaskUpdate({ checklist: updatedChecklist });
  };

  const handleToggleChecklist = async (id: string) => {
    const updatedChecklist = checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updatedChecklist);
    await saveTaskUpdate({ checklist: updatedChecklist });
  };

  const handleDeleteChecklist = async (id: string) => {
    const updatedChecklist = checklist.filter((item) => item.id !== id);
    setChecklist(updatedChecklist);
    await saveTaskUpdate({ checklist: updatedChecklist });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let authorName = 'Unknown User';

    if (user) {
      const { data: member } = await supabase
        .from('members')
        .select('full_name')
        .eq('id', user.id)
        .single();
      if (member) authorName = member.full_name;
    }

    const comment: Comment = {
      id: crypto.randomUUID(),
      text: newComment,
      author_name: authorName,
      created_at: new Date().toISOString(),
    };

    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    setNewComment('');
    await saveTaskUpdate({ comments: updatedComments });
  };

  const handleUpdateAssignee = async () => {
    if (assignee !== task?.assignee_name) {
      await saveTaskUpdate({ assignee_name: assignee });
      toast({ title: 'Assignee updated' });
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex justify-between items-start gap-4">
            <div>
              <DialogTitle className="text-xl font-semibold">{task.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={task.status === 'done' ? 'default' : 'secondary'}>
                  {task.status.replace('_', ' ')}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    task.priority === 'high'
                      ? 'text-red-600 border-red-200 bg-red-50'
                      : task.priority === 'medium'
                        ? 'text-yellow-600 border-yellow-200 bg-yellow-50'
                        : 'text-blue-600 border-blue-200 bg-blue-50'
                  }
                >
                  {task.priority} Priority
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No due date'}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 p-6 overflow-y-auto border-r">
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-500 uppercase tracking-wider">
                  Description
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {task.description || 'No description provided.'}
                </p>
              </div>

              <Separator />

              {/* Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" /> Checklist
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {checklist.filter((i) => i.completed).length}/{checklist.length} completed
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-start gap-2 group">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => handleToggleChecklist(item.id)}
                        className="mt-0.5"
                      />
                      <span
                        className={`text-sm flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteChecklist(item.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add an item..."
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                    className="h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleAddChecklistItem}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Activity / Comments */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Activity
                </h3>

                <div className="space-y-4 mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {comment.author_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{comment.author_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No comments yet.</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button size="sm" onClick={handleAddComment}>
                    <Send className="mr-2 h-3 w-3" /> Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="p-6 bg-gray-50 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Assignee
              </h3>
              <div className="flex gap-2">
                <Input
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Assign to..."
                  className="h-9 bg-white"
                />
                <Button size="sm" variant="outline" onClick={handleUpdateAssignee}>
                  Save
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Details
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>Today</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Priority</dt>
                  <dd className="capitalize">{task.priority}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="capitalize">{task.status.replace('_', ' ')}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
