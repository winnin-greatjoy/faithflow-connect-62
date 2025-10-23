// Example: Integrating API services with dashboard components
import React, { useState, useEffect } from 'react';
import { choirApi } from '@/services/departments/choirApi';
import { prayerTeamApi } from '@/services/departments/prayerTeamApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { ChoirMember, PrayerRequest } from '@/types/api';

export const DepartmentApiExample: React.FC = () => {
  const [choirMembers, setChoirMembers] = useState<ChoirMember[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load choir members
      const choirResult = await choirApi.getChoirMembers({
        sort: { field: 'member.full_name', direction: 'asc' },
        pagination: { page: 1, limit: 10 }
      });

      if (choirResult.error) {
        toast({
          title: 'Error',
          description: `Failed to load choir members: ${choirResult.error.message}`,
          variant: 'destructive'
        });
      } else {
        setChoirMembers(choirResult.data);
      }

      // Load prayer requests
      const prayerResult = await prayerTeamApi.getPrayerRequests({
        filters: { status: 'new' },
        sort: { field: 'date_received', direction: 'desc' },
        pagination: { page: 1, limit: 10 }
      });

      if (prayerResult.error) {
        toast({
          title: 'Error',
          description: `Failed to load prayer requests: ${prayerResult.error.message}`,
          variant: 'destructive'
        });
      } else {
        setPrayerRequests(prayerResult.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddChoirMember = async () => {
    try {
      const result = await choirApi.addChoirMember({
        member_id: 'new-member-id', // Would come from member selection
        voice_part: 'soprano',
        years_experience: 3
      });

      if (result.error) {
        toast({
          title: 'Error',
          description: `Failed to add choir member: ${result.error.message}`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Success',
          description: 'Choir member added successfully'
        });
        // Reload members
        loadData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add choir member',
        variant: 'destructive'
      });
    }
  };

  const handleCreatePrayerRequest = async () => {
    try {
      const result = await prayerTeamApi.createPrayerRequest({
        title: 'Healing for family member',
        description: 'Please pray for complete healing and strength during treatment.',
        category: 'health',
        urgency: 'high',
        anonymous: false
      });

      if (result.error) {
        toast({
          title: 'Error',
          description: `Failed to create prayer request: ${result.error.message}`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Success',
          description: 'Prayer request created successfully'
        });
        // Reload prayer requests
        loadData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create prayer request',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">API Integration Example</h1>
        <div className="space-x-2">
          <Button onClick={handleAddChoirMember}>
            Add Choir Member
          </Button>
          <Button onClick={handleCreatePrayerRequest}>
            Create Prayer Request
          </Button>
        </div>
      </div>

      {/* Choir Members Section */}
      <Card>
        <CardHeader>
          <CardTitle>Choir Members ({choirMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {choirMembers.map(member => (
              <div key={member.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">{member.member.full_name}</div>
                  <div className="text-sm text-gray-600">
                    {member.voice_part} • {member.years_experience} years experience
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Attendance: {member.attendance_rate}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prayer Requests Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Prayer Requests ({prayerRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {prayerRequests.map(request => (
              <div key={request.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">{request.title}</div>
                  <div className="text-sm text-gray-600">
                    {request.category} • {request.urgency} priority
                  </div>
                </div>
                <div className="text-sm">
                  Status: <span className="capitalize">{request.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Example: Using API services in a hook
export const useDepartmentData = (departmentId: string) => {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDepartmentData = async () => {
      try {
        setLoading(true);

        // Load members based on department
        let membersResult;
        switch (departmentId) {
          case 'choir':
            membersResult = await choirApi.getChoirMembers();
            break;
          case 'prayer-team':
            membersResult = await prayerTeamApi.getPrayerMembers();
            break;
          // Add other departments...
          default:
            membersResult = { data: [], error: null };
        }

        // Load stats based on department
        let statsResult;
        switch (departmentId) {
          case 'choir':
            statsResult = await choirApi.getChoirStats();
            break;
          case 'prayer-team':
            statsResult = await prayerTeamApi.getPrayerStats();
            break;
          // Add other departments...
          default:
            statsResult = { data: null, error: null };
        }

        if (membersResult.error) {
          setError(membersResult.error.message);
        } else {
          setMembers(membersResult.data);
        }

        if (statsResult.error) {
          setError(statsResult.error.message);
        } else {
          setStats(statsResult.data);
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadDepartmentData();
  }, [departmentId]);

  return { members, stats, loading, error, refetch: () => loadDepartmentData() };
};
