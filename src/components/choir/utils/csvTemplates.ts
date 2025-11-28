/**
 * CSV Template Generator for Choir Members
 */

export interface MemberTemplateRow {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  maritalStatus: 'single' | 'married' | 'widowed' | 'divorced';
  voicePart: 'soprano' | 'alto' | 'tenor' | 'bass';
  yearsExperience: number;
}

/**
 * Generate and download choir member import template
 */
export const downloadMemberTemplate = () => {
  const headers = [
    'Full Name',
    'Email',
    'Phone',
    'Date of Birth',
    'Gender',
    'Marital Status',
    'Voice Part',
    'Years Experience',
  ];

  const exampleRow = [
    'John Doe',
    'john.doe@example.com',
    '+1234567890',
    '1990-01-15',
    'male',
    'single',
    'tenor',
    '5',
  ];

  const instructions = [
    '# INSTRUCTIONS:',
    '# - Fill in member details below',
    '# - Gender: male or female',
    '# - Marital Status: single, married, widowed, or divorced',
    '# - Voice Part: soprano, alto, tenor, or bass',
    '# - Date of Birth: YYYY-MM-DD format',
    '# - Delete this instruction section before importing',
    '',
  ];

  const csv = [...instructions, headers.join(','), exampleRow.join(',')].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `choir_members_import_template_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Parse CSV file and validate data
 */
export const parseMemberCSV = async (
  file: File
): Promise<{ data: MemberTemplateRow[]; errors: string[] }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((line) => !line.trim().startsWith('#') && line.trim());

      if (lines.length < 2) {
        resolve({ data: [], errors: ['File is empty or contains only headers'] });
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim());
      const data: MemberTemplateRow[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));

        if (values.length !== headers.length) {
          errors.push(`Row ${i}: Incorrect number of columns`);
          continue;
        }

        const [
          fullName,
          email,
          phone,
          dateOfBirth,
          gender,
          maritalStatus,
          voicePart,
          yearsExperience,
        ] = values;

        // Validation
        if (!fullName) {
          errors.push(`Row ${i}: Full Name is required`);
          continue;
        }

        if (!phone) {
          errors.push(`Row ${i}: Phone is required`);
          continue;
        }

        if (!dateOfBirth || !dateOfBirth.match(/^\d{4}-\d{2}-\d{2}$/)) {
          errors.push(`Row ${i}: Date of Birth must be in YYYY-MM-DD format`);
          continue;
        }

        if (!['male', 'female'].includes(gender?.toLowerCase())) {
          errors.push(`Row ${i}: Gender must be 'male' or 'female'`);
          continue;
        }

        if (!['single', 'married', 'widowed', 'divorced'].includes(maritalStatus?.toLowerCase())) {
          errors.push(`Row ${i}: Marital Status must be single, married, widowed, or divorced`);
          continue;
        }

        if (!['soprano', 'alto', 'tenor', 'bass'].includes(voicePart?.toLowerCase())) {
          errors.push(`Row ${i}: Voice Part must be soprano, alto, tenor, or bass`);
          continue;
        }

        const experience = parseInt(yearsExperience);
        if (isNaN(experience) || experience < 0) {
          errors.push(`Row ${i}: Years Experience must be a positive number`);
          continue;
        }

        data.push({
          fullName,
          email: email || '',
          phone,
          dateOfBirth,
          gender: gender.toLowerCase() as 'male' | 'female',
          maritalStatus: maritalStatus.toLowerCase() as
            | 'single'
            | 'married'
            | 'widowed'
            | 'divorced',
          voicePart: voicePart.toLowerCase() as 'soprano' | 'alto' | 'tenor' | 'bass',
          yearsExperience: experience,
        });
      }

      resolve({ data, errors });
    };

    reader.onerror = () => {
      resolve({ data: [], errors: ['Failed to read file'] });
    };

    reader.readAsText(file);
  });
};
