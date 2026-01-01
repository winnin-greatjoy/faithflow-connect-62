import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MemberTraining, TrainingType, TrainingStatus } from '@/types/schema';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const MemberTrainingView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TrainingType | 'all'>('all');

  const {
    data: trainingRecords,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['member-training', searchTerm, filterType],
    queryFn: async () => {
      let query = supabase
        .from('member_training')
        .select(
          `
          *,
          member:members (
            id,
            full_name,
            branch:church_branches (name)
          )
        `
        )
        .order('updated_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('training_type', filterType as any);
      }

      const { data, error } = await query;
      if (error) throw error;

      let filtered = data as unknown as (MemberTraining & {
        member: { full_name: string; branch?: { name: string } };
      })[];

      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        filtered = filtered.filter((r) => r.member.full_name.toLowerCase().includes(lower));
      }

      return filtered;
    },
  });

  const handleStatusChange = async (id: string, newStatus: TrainingStatus) => {
    const { error } = await supabase
      .from('member_training')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Training status updated');
      refetch();
    }
  };

  const getStatusColor = (status: TrainingStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 hover:bg-green-600';
      case 'in_progress':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search member..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Training</SelectItem>
            <SelectItem value="discipleship_1">Discipleship 1</SelectItem>
            <SelectItem value="discipleship_2">Discipleship 2</SelectItem>
            <SelectItem value="discipleship_3">Discipleship 3</SelectItem>
            <SelectItem value="leadership">Leadership</SelectItem>
            <SelectItem value="pastoral">Pastoral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Training Module</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completion Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : (
              trainingRecords?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.member.full_name}</TableCell>
                  <TableCell>{record.member.branch?.name}</TableCell>
                  <TableCell className="capitalize">
                    {record.training_type.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.completed_at ? new Date(record.completed_at).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={record.status}
                      onValueChange={(v: TrainingStatus) => handleStatusChange(record.id, v)}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!isLoading && (!trainingRecords || trainingRecords.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No training records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
