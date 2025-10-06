
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  Calendar, 
  Paperclip, 
  MessageSquare, 
  User,
  Clock,
  AlertCircle
} from 'lucide-react';
import { mockCommitteeTasks } from '@/data/mockCommitteeData';
import { CommitteeTask } from '@/types/committee';

interface CommitteeTaskBoardProps {
  committeeId: number;
  userRole: string;
  canEdit: boolean;
}

export const CommitteeTaskBoard = ({ committeeId, userRole, canEdit }: CommitteeTaskBoardProps) => {
  const [tasks] = useState<CommitteeTask[]>(mockCommitteeTasks);

  const getTasksByStatus = (status: CommitteeTask['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getCompletionPercentage = (checklist: { completed: boolean }[]) => {
    if (checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  const TaskCard = ({ task }: { task: CommitteeTask }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-tight pr-2">{task.title}</h4>
            <Badge 
              variant="outline" 
              className={`text-xs ${getPriorityColor(task.priority)}`}
            >
              {task.priority}
            </Badge>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
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
              
              <div className={`flex items-center space-x-1 ${isOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-500'}`}>
                {isOverdue(task.dueDate) && task.status !== 'done' && (
                  <AlertCircle className="h-3 w-3" />
                )}
                <Calendar className="h-3 w-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const StatusColumn = ({ status, title, tasks }: { 
    status: CommitteeTask['status'], 
    title: string, 
    tasks: CommitteeTask[] 
  }) => (
    <div className="flex-1 min-w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 flex items-center">
          {title}
          <Badge variant="secondary" className="ml-2">{tasks.length}</Badge>
        </h3>
        {canEdit && status === 'backlog' && (
          <Button size="sm" variant="outline">
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {tasks.map(task => (
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
        <StatusColumn 
          status="backlog" 
          title="Backlog" 
          tasks={getTasksByStatus('backlog')} 
        />
        <StatusColumn 
          status="in_progress" 
          title="In Progress" 
          tasks={getTasksByStatus('in_progress')} 
        />
        <StatusColumn 
          status="done" 
          title="Done" 
          tasks={getTasksByStatus('done')} 
        />
      </div>
    </div>
  );
};
