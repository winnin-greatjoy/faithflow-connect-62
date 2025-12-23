import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import registrationsApi, { EventRegistration } from '@/services/registrationsApi';
import { Loader2, Download, UserMinus, UserCheck, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface RegistrationsManagementDialogProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
  capacity?: number;
}

export const RegistrationsManagementDialog: React.FC<RegistrationsManagementDialogProps> = ({
  eventId,
  eventTitle,
  isOpen,
  onClose,
  capacity,
}) => {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await registrationsApi.getEventRegistrations(eventId);
      if (error) throw error;
      setRegistrations(data || []);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to load registrations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRegistrations();
    }
  }, [isOpen, eventId]);

  const handleUpdateStatus = async (regId: string, status: 'confirmed' | 'cancelled') => {
    setActionLoading(regId);
    try {
      const { error } = await registrationsApi.updateRegistrationStatus(regId, status);
      if (error) throw error;

      setRegistrations((prev) => prev.map((r) => (r.id === regId ? { ...r, status } : r)));

      toast({
        title: 'Success',
        description: `Registration ${status === 'confirmed' ? 'confirmed' : 'cancelled'}`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (regId: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) return;

    setActionLoading(regId);
    try {
      const { error } = await registrationsApi.deleteRegistration(regId);
      if (error) throw error;

      setRegistrations((prev) => prev.filter((r) => r.id !== regId));

      toast({
        title: 'Deleted',
        description: 'Registration removed successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete registration',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) return;

    const headers = ['Name', 'Email', 'Phone', 'Status', 'Registered At'];
    const rows = registrations.map((r) => [
      r.name,
      r.email,
      r.phone || 'N/A',
      r.status,
      format(new Date(r.registered_at), 'yyyy-MM-dd HH:mm'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `registrations_${eventTitle.replace(/\s+/g, '_').toLowerCase()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmedCount = registrations.filter((r) => r.status === 'confirmed').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-bold">Manage Registrations</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">{eventTitle}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {confirmedCount} / {capacity || '∞'} Confirmed
              </div>
              {capacity && (
                <div className="w-32 h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.min((confirmedCount / capacity) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={registrations.length === 0}
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={fetchRegistrations}>
              Refresh
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 pt-2">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
              <p className="text-gray-500">No registrations found for this event</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell>
                      <div className="font-medium">{reg.name}</div>
                      {reg.member_id && (
                        <Badge variant="secondary" className="text-[10px] h-4">
                          Member
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{reg.email}</div>
                      {reg.phone && <div className="text-xs text-gray-500">{reg.phone}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={reg.status === 'confirmed' ? 'default' : 'secondary'}>
                        {reg.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          reg.payment_status === 'paid'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }
                      >
                        {reg.payment_status || 'not_required'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      GHS {(reg.amount_paid || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(reg.registered_at), 'MMM d, p')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {reg.status === 'confirmed' ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-orange-500"
                            onClick={() => handleUpdateStatus(reg.id, 'cancelled')}
                            disabled={!!actionLoading}
                            title="Cancel Registration"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-500"
                            onClick={() => handleUpdateStatus(reg.id, 'confirmed')}
                            disabled={!!actionLoading}
                            title="Confirm Registration"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDelete(reg.id)}
                          disabled={!!actionLoading}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
