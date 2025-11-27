-- Fix search path security for assign_member_to_ministry function
CREATE OR REPLACE FUNCTION assign_member_to_ministry()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_age INTEGER;
  target_ministry_id UUID;
BEGIN
  -- Calculate age
  member_age := EXTRACT(YEAR FROM AGE(NEW.date_of_birth));
  
  -- Determine ministry based on age and gender
  IF member_age >= 13 AND member_age <= 30 THEN
    -- Youth & Young Adults Ministry
    SELECT id INTO target_ministry_id 
    FROM ministries 
    WHERE name ILIKE '%youth%' AND branch_id = NEW.branch_id
    LIMIT 1;
  ELSIF NEW.gender = 'male' AND member_age >= 18 THEN
    -- Men's Ministry
    SELECT id INTO target_ministry_id 
    FROM ministries 
    WHERE name ILIKE '%men%' AND branch_id = NEW.branch_id
    LIMIT 1;
  ELSIF NEW.gender = 'female' AND member_age >= 18 THEN
    -- Women's Ministry
    SELECT id INTO target_ministry_id 
    FROM ministries 
    WHERE name ILIKE '%women%' AND branch_id = NEW.branch_id
    LIMIT 1;
  ELSE
    -- Children's Ministry
    SELECT id INTO target_ministry_id 
    FROM ministries 
    WHERE name ILIKE '%children%' AND branch_id = NEW.branch_id
    LIMIT 1;
  END IF;
  
  -- Insert into ministry_members if ministry exists
  IF target_ministry_id IS NOT NULL THEN
    INSERT INTO ministry_members (member_id, ministry_id, role, status)
    VALUES (NEW.id, target_ministry_id, 'member', 'active')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;