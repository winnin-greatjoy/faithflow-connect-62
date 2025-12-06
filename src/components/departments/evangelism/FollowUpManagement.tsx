import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { AddFollowUpDialog } from './AddFollowUpDialog';

interface FollowUp {
  id: number;
  contactName: string;
  contactInfo: string;
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'not-interested';
  assignedTo: string;
  lastContact: string;
  notes: string;
}

const mockFollowUps: FollowUp[] = [
  {
    id: 1,
    contactName: 'John Anderson',
    contactInfo: '555-1001',
    status: 'interested',
    assignedTo: 'Paul Smith',
    lastContact: '2024-01-24',
    notes: 'Very receptive, wants to attend service this Sunday',
  },
  {
    id: 2,
    contactName: 'Mary Thompson',
    contactInfo: '555-1002',
    status: 'contacted',
    assignedTo: 'Grace Johnson',
    lastContact: '2024-01-23',
    notes: 'Has questions about salvation, scheduled follow-up',
  },
  {
    id: 3,
    contactName: 'David Wilson',
    contactInfo: '555-1003',
    status: 'new',
    assignedTo: 'Mark Wilson',
    lastContact: '2024-01-22',
    notes: 'Met at block party, expressed interest in Bible study',
  },
  {
    id: 4,
    contactName: 'Lisa Brown',
    contactInfo: '555-1004',
    status: 'converted',
    assignedTo: 'Sarah Davis',
    lastContact: '2024-01-20',
    notes: 'Accepted Christ! Connected with discipleship program',
  },
  {
    id: 5,
    contactName: 'Robert Davis',
    contactInfo: '555-1005',
    status: 'not-interested',
    assignedTo: 'Paul Smith',
    lastContact: '2024-01-19',
    notes: 'Not interested at this time, but respectful conversation',
  },
];

export const FollowUpManagement: React.FC = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>(mockFollowUps);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'interested':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'new':
        return 'bg-gray-100 text-gray-800';
      case 'not-interested':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFollowUps = followUps.filter((contact) => {
    const matchesSearch =
      contact.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.contactInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddContact = (newContact: any) => {
    setFollowUps([newContact, ...followUps]);
  };

  const handleDelete = (id: number) => {
    setFollowUps(followUps.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-medium">Follow-up Contacts</h3>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="interested">Interested</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="not-interested">Not Interested</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contact Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFollowUps.map((contact) => (
                  <tr key={contact.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {contact.contactName}
                        </div>
                        <div className="text-sm text-gray-500">{contact.contactInfo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(contact.status)}>
                        {contact.status.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.assignedTo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.lastContact}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {contact.notes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(contact.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddFollowUpDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleAddContact}
      />
    </div>
  );
};
