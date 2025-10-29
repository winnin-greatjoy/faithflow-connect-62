-- Seed default ministries (Men's, Women's, Youth, Children's)
-- First, get the main branch or first branch
DO $$
DECLARE
  main_branch_id UUID;
BEGIN
  -- Get main branch or first branch
  SELECT id INTO main_branch_id
  FROM church_branches
  WHERE is_main = true
  LIMIT 1;
  
  IF main_branch_id IS NULL THEN
    SELECT id INTO main_branch_id
    FROM church_branches
    ORDER BY created_at
    LIMIT 1;
  END IF;

  -- Only insert if we have a branch
  IF main_branch_id IS NOT NULL THEN
    -- Insert default ministries if they don't exist
    INSERT INTO ministries (name, description, branch_id)
    SELECT 'Men''s Ministry', 'Ministry for adult men in the church', main_branch_id
    WHERE NOT EXISTS (SELECT 1 FROM ministries WHERE LOWER(name) LIKE '%men%' AND name NOT LIKE '%women%' AND branch_id = main_branch_id);

    INSERT INTO ministries (name, description, branch_id)
    SELECT 'Women''s Ministry', 'Ministry for adult women in the church', main_branch_id
    WHERE NOT EXISTS (SELECT 1 FROM ministries WHERE LOWER(name) LIKE '%women%' AND branch_id = main_branch_id);

    INSERT INTO ministries (name, description, branch_id)
    SELECT 'Youth Ministry', 'Ministry for teenagers and young adults', main_branch_id
    WHERE NOT EXISTS (SELECT 1 FROM ministries WHERE LOWER(name) LIKE '%youth%' AND branch_id = main_branch_id);

    INSERT INTO ministries (name, description, branch_id)
    SELECT 'Children''s Ministry', 'Ministry for children and kids programs', main_branch_id
    WHERE NOT EXISTS (SELECT 1 FROM ministries WHERE LOWER(name) LIKE '%children%' AND branch_id = main_branch_id);
  END IF;
END $$;

-- Seed default departments with unique roles
DO $$
DECLARE
  main_branch_id UUID;
BEGIN
  -- Get main branch or first branch
  SELECT id INTO main_branch_id
  FROM church_branches
  WHERE is_main = true
  LIMIT 1;
  
  IF main_branch_id IS NULL THEN
    SELECT id INTO main_branch_id
    FROM church_branches
    ORDER BY created_at
    LIMIT 1;
  END IF;

  -- Only insert if we have a branch
  IF main_branch_id IS NOT NULL THEN
    -- Insert default departments if they don't exist (case-insensitive check)
    INSERT INTO departments (name, description, branch_id)
    SELECT 'Choir', 'Worship and music ministry for church services', main_branch_id
    WHERE NOT EXISTS (SELECT 1 FROM departments WHERE LOWER(name) = 'choir' AND branch_id = main_branch_id);

    INSERT INTO departments (name, description, branch_id)
    SELECT 'Ushering', 'Welcoming and seating congregation members', main_branch_id
    WHERE NOT EXISTS (SELECT 1 FROM departments WHERE LOWER(name) = 'ushering' AND branch_id = main_branch_id);

    INSERT INTO departments (name, description, branch_id)
    SELECT 'Media', 'Audio-visual and multimedia production', main_branch_id
    WHERE NOT EXISTS (SELECT 1 FROM departments WHERE LOWER(name) = 'media' AND branch_id = main_branch_id);

    INSERT INTO departments (name, description, branch_id)
    SELECT 'Finance', 'Financial management and stewardship', main_branch_id
    WHERE NOT EXISTS (SELECT 1 FROM departments WHERE LOWER(name) = 'finance' AND branch_id = main_branch_id);

    INSERT INTO departments (name, description, branch_id)
    SELECT 'Prayer Team', 'Intercessory prayer and spiritual warfare', main_branch_id
    WHERE NOT EXISTS (SELECT 1 FROM departments WHERE LOWER(name) = 'prayer team' AND branch_id = main_branch_id);

    INSERT INTO departments (name, description, branch_id)
    SELECT 'Evangelism', 'Outreach and soul winning ministry', main_branch_id
    WHERE NOT EXISTS (SELECT 1 FROM departments WHERE LOWER(name) = 'evangelism' AND branch_id = main_branch_id);

    INSERT INTO departments (name, description, branch_id)
    SELECT 'Technical', 'Sound system and technical support', main_branch_id
    WHERE NOT EXISTS (SELECT 1 FROM departments WHERE LOWER(name) = 'technical' AND branch_id = main_branch_id);
  END IF;
END $$;