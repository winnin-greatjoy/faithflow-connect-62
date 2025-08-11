
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Plus, Mail, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockMembers = [
  { id: 1, name: 'John Smith', email: 'john@email.com', phone: '+44 7123 456789', status: 'Active', ministry: 'Men\'s Ministry', lastAttendance: '2024-01-07' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', phone: '+44 7234 567890', status: 'Active', ministry: 'Women\'s Ministry', lastAttendance: '2024-01-07' },
  { id: 3, name: 'Mike Davis', email: 'mike@email.com', phone: '+44 7345 678901', status: 'New Visitor', ministry: 'None', lastAttendance: '2024-01-07' },
  { id: 4, name: 'Emma Wilson', email: 'emma@email.com', phone: '+44 7456 789012', status: 'Active', ministry: 'Youth Ministry', lastAttendance: '2024-01-03' },
  { id: 5, name: 'David Brown', email: 'david@email.com', phone: '+44 7567 890123', status: 'Inactive', ministry: 'Choir', lastAttendance: '2023-12-15' },
];

export const MemberManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'New Visitor': return 'bg-blue-100 text-blue-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddMember = () => {
    toast({
      title: "Add New Member",
      description: "Opening member registration form...",
    });
    console.log('Adding new member');
  };

  const handleSendMessage = () => {
    if (selectedMembers.length === 0) {
      toast({
        title: "No members selected",
        description: "Please select members to send a message.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Send Message",
      description: `Sending message to ${selectedMembers.length} member(s)...`,
    });
    console.log('Sending message to:', selectedMembers);
  };

  const handleExport = () => {
    toast({
      title: "Export Data",
      description: "Generating member list export...",
    });
    console.log('Exporting member data');
  };

  const handleViewMember = (memberId: number) => {
    toast({
      title: "View Member",
      description: `Opening profile for member ID: ${memberId}`,
    });
    console.log('Viewing member:', memberId);
  };

  const handleEditMember = (memberId: number) => {
    toast({
      title: "Edit Member",
      description: `Opening edit form for member ID: ${memberId}`,
    });
    console.log('Editing member:', memberId);
  };

  const handleDeleteMember = (memberId: number) => {
    toast({
      title: "Delete Member",
      description: `Are you sure you want to delete member ID: ${memberId}?`,
      variant: "destructive",
    });
    console.log('Deleting member:', memberId);
  };

  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && member.status === 'Active') ||
                         (statusFilter === 'new' && member.status === 'New Visitor') ||
                         (statusFilter === 'inactive' && member.status === 'Inactive');
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Member Management</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage your church members and their information.</p>
        </div>
        <Button onClick={handleAddMember} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Member
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Member Directory</CardTitle>
          <CardDescription className="text-sm">Search and filter your church members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search members by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="new">New Visitor</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm" onClick={handleSendMessage} className="w-full sm:w-auto">
                <Mail className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Members Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-4">
                      <input type="checkbox" className="rounded" />
                    </TableHead>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[200px] hidden sm:table-cell">Contact Info</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[120px] hidden md:table-cell">Ministry</TableHead>
                    <TableHead className="min-w-[120px] hidden lg:table-cell">Last Attendance</TableHead>
                    <TableHead className="min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={selectedMembers.includes(member.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers([...selectedMembers, member.id]);
                            } else {
                              setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-500 sm:hidden">{member.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="text-sm">
                          <div>{member.email}</div>
                          <div className="text-gray-500">{member.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{member.ministry}</TableCell>
                      <TableCell className="hidden lg:table-cell">{member.lastAttendance}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewMember(member.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditMember(member.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No members found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
