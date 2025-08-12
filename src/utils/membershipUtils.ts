
import { Member, MembershipLevel, Gender } from '@/types/membership';

export const getMembershipLevelDisplay = (level: MembershipLevel, subLevel?: string, role?: string): string => {
  if (level === 'baptized') {
    if (subLevel === 'leader' && role) {
      return `Baptized - ${role.replace('_', ' ').toUpperCase()}`;
    }
    return `Baptized - ${subLevel?.toUpperCase()}`;
  }
  return level.charAt(0).toUpperCase() + level.slice(1);
};

export const getMembershipStatusColor = (level: MembershipLevel, status: string) => {
  if (status === 'suspended') return 'bg-red-100 text-red-800';
  if (status === 'inactive') return 'bg-gray-100 text-gray-800';
  
  switch (level) {
    case 'baptized': return 'bg-green-100 text-green-800';
    case 'convert': return 'bg-blue-100 text-blue-800';
    case 'visitor': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const getAutoMinistry = (dateOfBirth: string, gender: Gender): string => {
  const age = calculateAge(dateOfBirth);
  
  if (age >= 13 && age <= 30) {
    return 'Youth & Young Adults Ministry';
  } else if (gender === 'male' && age >= 18) {
    return "Men's Ministry";
  } else if (gender === 'female' && age >= 18) {
    return "Women's Ministry";
  }
  return 'Children Ministry';
};

export const canAssignToDepartment = (member: Member): boolean => {
  return member.membershipLevel === 'baptized' && 
         member.discipleshipClass1 && 
         member.discipleshipClass2 && 
         member.discipleshipClass3;
};

export const formatMemberAddress = (member: Member): string => {
  return `${member.street}, ${member.area}, ${member.community}${member.publicLandmark ? ` (${member.publicLandmark})` : ''}`;
};

export const getDiscipleshipProgress = (member: Member): { completed: number; total: number; percentage: number } => {
  const classes = [member.discipleshipClass1, member.discipleshipClass2, member.discipleshipClass3];
  const completed = classes.filter(Boolean).length;
  const total = 3;
  const percentage = Math.round((completed / total) * 100);
  
  return { completed, total, percentage };
};
