import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Calendar,
  Paperclip,
  MessageSquare,
  User,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { CommitteeTask } from '@/types/committee';
import { supabase } from '@/integrations/supabase/client';

interface CommitteeTaskBoardProps {
  committeeId: string | number;
  userRole: string;
  canEdit: boolean;
}

export const CommitteeTaskBoard = ({ committeeId, userRole, canEdit }: CommitteeTaskBoardProps) => {
  const [tasks, setTasks] = useState<CommitteeTask[]>([]);
  const [loading, setLoading] = useState(false);
  const idMapRef = useRef(new Map<number, string>());
  const { toast } = useToast();
  const [membersList, setMembersList] = useState<Array<{ id: string; name: string }>>([]);

  const toLocalId = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h) + 1;
  };

  const reload = async () => {
    setLoading(true);
    let query = supabase
      .from('committee_tasks')
      .select(
        'id, title, description, status, assignee_id, assignee_name, due_date, priority, tags, attachments, checklist, comments, created_at, updated_at'
      )
      .order('created_at', { ascending: false });

    // Filter by committee if a UUID string is provided; otherwise load all
    const cid: any = committeeId as any;
    if (typeof cid === 'string' && cid.length >= 32) {
      query = query.eq('committee_id', cid);
    }

    const { data } = await query;

    const mapped: CommitteeTask[] = (data || []).map((row: any) => {
      const localId = toLocalId(row.id);
      idMapRef.current.set(localId, row.id);
      return {
        id: localId,
        title: row.title,
        description: row.description || '',
        status: row.status,
        assigneeId: 0,
        assigneeName: row.assignee_name || 'Unassigned',
        dueDate: row.due_date || new Date().toISOString(),
        priority: row.priority,
        tags: (row.tags as string[]) || [],
        attachments: (row.attachments as string[]) || [],
        checklist: (row.checklist as { id: number; text: string; completed: boolean }[]) || [],
        comments:
          (row.comments as { id: number; authorName: string; text: string; timestamp: string }[]) ||
          [],
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      };
    });
    setTasks(mapped);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, [committeeId]);

  // Load members for assignee selector (restrict to committee members if committeeId is UUID)
  useEffect(() => {
    (async () => {
      const cid: any = committeeId as any;
      if (typeof cid === 'string' && cid.length >= 32) {
        const { data } = await supabase
          .from('committee_members')
          .select('member:members(id, full_name)')
          .eq('committee_id', cid)
          .order('joined_at', { ascending: false });
        const list = (data || [])
          .map((row: any) => row.member)
          .filter((m: any) => !!m)
          .map((m: any) => ({ id: m.id, name: m.full_name }));
        setMembersList(list);
      } else {
        const { data } = await supabase.from('members').select('id, full_name').order('full_name');
        setMembersList((data || []).map((m: any) => ({ id: m.id, name: m.full_name })));
      }
    })();
  }, [committeeId]);

  const handleAddTask = async (status: CommitteeTask['status']) => {
    const due = new Date();
    due.setDate(due.getDate() + 7);
    await supabase.from('committee_tasks').insert({
      committee_id: String(committeeId),
      title: 'New Task',
      description: '',
      status,
      assignee_id: null,
      assignee_name: null,
      due_date: due.toISOString().slice(0, 10),
      priority: 'medium',
      tags: [],
      attachments: [],
      checklist: [],
      comments: [],
    });
    await reload();
    toast({ title: 'Task created', description: 'A new task was added to the board.' });
  };

  const getTasksByStatus = (status: CommitteeTask['status']) => {
    return tasks.filter((task) => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getCompletionPercentage = (checklist: { completed: boolean }[]) => {
    if (checklist.length === 0) return 0;
    const completed = checklist.filter((item) => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  const updateTaskStatus = async (localId: number, status: CommitteeTask['status']) => {
    const dbId = idMapRef.current.get(localId);
    if (!dbId) return;
    await supabase.from('committee_tasks').update({ status }).eq('id', dbId);
    await reload();
    toast({ title: 'Task updated', description: `Status changed to ${status.replace('_', ' ')}` });
  };

  const deleteTask = async (localId: number) => {
    const dbId = idMapRef.current.get(localId);
    if (!dbId) return;
    if (!confirm('Delete this task?')) return;
    await supabase.from('committee_tasks').delete().eq('id', dbId);
    await reload();
    toast({ title: 'Task deleted' });
  };

  const cyclePriority = async (localId: number) => {
    const t = tasks.find((t) => t.id === localId);
    if (!t) return;
    const seq: Array<CommitteeTask['priority']> = ['low', 'medium', 'high'];
    const next = seq[(seq.indexOf(t.priority) + 1) % seq.length];
    const dbId = idMapRef.current.get(localId);
    if (!dbId) return;
    await supabase.from('committee_tasks').update({ priority: next }).eq('id', dbId);
    await reload();
    toast({ title: 'Priority changed', description: `Now ${next}` });
  };

  const updateTaskFields = async (
    localId: number,
    patch: Partial<{
      title: string;
      description: string;
      due_date: string | null;
      assignee_name: string | null;
      assignee_id: string | null;
      status: CommitteeTask['status'];
      priority: CommitteeTask['priority'];
    }>
  ) => {
    const dbId = idMapRef.current.get(localId);
    if (!dbId) return;
    await supabase
      .from('committee_tasks')
      .update(patch as any)
      .eq('id', dbId);
    await reload();
    toast({ title: 'Task updated' });
  };

  const TaskCard = ({ task }: { task: CommitteeTask }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [assigneeId, setAssigneeId] = useState<string | 'unassigned'>(
      idMapRef.current.get(task.id) && tasks.find((t) => t.id === task.id)?.assigneeId
        ? 'unassigned'
        : 'unassigned'
    );
    const [dueDate, setDueDate] = useState(() =>
      task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''
    );
    const [isSaving, setIsSaving] = useState(false);
    return (
      <Card
        className="mb-4 hover:shadow-md transition-shadow cursor-pointer"
        draggable={canEdit}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', String(task.id));
        }}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              {isEditing ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 text-sm"
                />
              ) : (
                <h4 className="font-medium text-sm leading-tight pr-2">{task.title}</h4>
              )}
              <Badge
                variant="outline"
                className={`text-xs ${getPriorityColor(task.priority)}`}
                onClick={canEdit ? () => cyclePriority(task.id) : undefined}
              >
                {task.priority}
              </Badge>
            </div>

            {/* Description */}
            {isEditing ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs"
              />
            ) : (
              task.description && (
                <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
              )
            )}

            {isEditing && (
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-16">Due</span>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-16">Assignee</span>
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {membersList.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Progress bar for checklist */}
            {task.checklist.length > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{getCompletionPercentage(task.checklist)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${getCompletionPercentage(task.checklist)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>{task.assigneeName}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {task.attachments.length > 0 && (
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Paperclip className="h-3 w-3" />
                    <span>{task.attachments.length}</span>
                  </div>
                )}

                {task.comments.length > 0 && (
                  <div className="flex items-center space-x-1 text-gray-500">
                    <MessageSquare className="h-3 w-3" />
                    <span>{task.comments.length}</span>
                  </div>
                )}

                <div
                  className={`flex items-center space-x-1 ${isOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-500'}`}
                >
                  {isOverdue(task.dueDate) && task.status !== 'done' && (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                {canEdit && (
                  <div className="flex items-center space-x-1 ml-2">
                    {!isEditing && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </Button>
                    )}
                    {isEditing && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2"
                          disabled={isSaving}
                          onClick={async () => {
                            try {
                              setIsSaving(true);
                              const patch: any = { title, description };
                              patch.due_date = dueDate || null;
                              if (assigneeId && assigneeId !== 'unassigned') {
                                const m = membersList.find((x) => x.id === assigneeId);
                                patch.assignee_id = assigneeId;
                                patch.assignee_name = m?.name || null;
                              } else {
                                patch.assignee_id = null;
                                patch.assignee_name = null;
                              }
                              await updateTaskFields(task.id, patch);
                              setIsEditing(false);
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                        >
                          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2"
                          onClick={() => {
                            setIsEditing(false);
                            setTitle(task.title);
                            setDescription(task.description);
                            setAssigneeId('unassigned');
                            setDueDate(
                              task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''
                            );
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {task.status === 'backlog' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2"
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                      >
                        Start
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2"
                          onClick={() => updateTaskStatus(task.id, 'backlog')}
                        >
                          Backlog
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2"
                          onClick={() => updateTaskStatus(task.id, 'done')}
                        >
                          Done
                        </Button>
                      </>
                    )}
                    {task.status === 'done' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2"
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                      >
                        Reopen
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-red-600"
                      onClick={() => deleteTask(task.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const StatusColumn = ({
    status,
    title,
    tasks,
  }: {
    status: CommitteeTask['status'];
    title: string;
    tasks: CommitteeTask[];
  }) => (
    <div
      className="flex-1 min-w-80"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const idStr = e.dataTransfer.getData('text/plain');
        const localId = parseInt(idStr, 10);
        if (!isNaN(localId)) updateTaskStatus(localId, status);
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 flex items-center">
          {title}
          <Badge variant="secondary" className="ml-2">
            {tasks.length}
          </Badge>
        </h3>
        {canEdit && status === 'backlog' && (
          <Button size="sm" variant="outline" onClick={() => handleAddTask(status)}>
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-sm">No {title.toLowerCase()} tasks</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Task Board</h2>
        {canEdit && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex space-x-6 overflow-x-auto pb-4">
        <StatusColumn status="backlog" title="Backlog" tasks={getTasksByStatus('backlog')} />
        <StatusColumn
          status="in_progress"
          title="In Progress"
          tasks={getTasksByStatus('in_progress')}
        />
        <StatusColumn status="done" title="Done" tasks={getTasksByStatus('done')} />
      </div>
    </div>
  );
};
