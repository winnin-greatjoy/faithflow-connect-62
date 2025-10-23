-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'pastor', 'leader', 'worker', 'member');
CREATE TYPE public.membership_level AS ENUM ('baptized', 'convert', 'visitor');
CREATE TYPE public.baptized_sub_level AS ENUM ('leader', 'worker', 'disciple');
CREATE TYPE public.leader_role AS ENUM ('pastor', 'assistant_pastor', 'department_head', 'ministry_head');
CREATE TYPE public.marital_status AS ENUM ('single', 'married', 'widowed', 'divorced');
CREATE TYPE public.gender AS ENUM ('male', 'female');
CREATE TYPE public.member_status AS ENUM ('active', 'inactive', 'suspended', 'transferred');
CREATE TYPE public.follow_up_status AS ENUM ('pending', 'called', 'visited', 'completed');
CREATE TYPE public.first_timer_status AS ENUM ('new', 'contacted', 'followed_up', 'converted');
CREATE TYPE public.assignment_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.assignment_type AS ENUM ('assignment', 'transfer', 'suspension');

-- Create church_branches table
CREATE TABLE public.church_branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  pastor_name TEXT,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  profile_photo TEXT,
  phone TEXT,
  branch_id UUID REFERENCES public.church_branches(id),
  role app_role DEFAULT 'member',
  is_baptized BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table for proper role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  branch_id UUID REFERENCES public.church_branches(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create members table
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  profile_photo TEXT,
  date_of_birth DATE NOT NULL,
  gender gender NOT NULL,
  marital_status marital_status NOT NULL,
  spouse_name TEXT,
  number_of_children INTEGER DEFAULT 0,
  email TEXT,
  phone TEXT NOT NULL,
  community TEXT NOT NULL,
  area TEXT NOT NULL,
  street TEXT NOT NULL,
  public_landmark TEXT,
  branch_id UUID REFERENCES public.church_branches(id) NOT NULL,
  date_joined DATE NOT NULL,
  membership_level membership_level NOT NULL,
  baptized_sub_level baptized_sub_level,
  leader_role leader_role,
  baptism_date DATE,
  baptism_officiator TEXT,
  spiritual_mentor TEXT,
  discipleship_class_1 BOOLEAN DEFAULT false,
  discipleship_class_2 BOOLEAN DEFAULT false,
  discipleship_class_3 BOOLEAN DEFAULT false,
  assigned_department TEXT,
  status member_status DEFAULT 'active',
  ministry TEXT,
  prayer_needs TEXT,
  pastoral_notes TEXT,
  last_attendance DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create children table
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  date_of_birth DATE,
  gender gender,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create first_timers table
CREATE TABLE public.first_timers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  community TEXT NOT NULL,
  area TEXT NOT NULL,
  street TEXT NOT NULL,
  public_landmark TEXT,
  phone TEXT,
  email TEXT,
  service_date DATE NOT NULL,
  first_visit DATE NOT NULL,
  invited_by TEXT,
  follow_up_status follow_up_status DEFAULT 'pending',
  status first_timer_status DEFAULT 'new',
  branch_id UUID REFERENCES public.church_branches(id) NOT NULL,
  follow_up_notes TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  head_id UUID REFERENCES public.members(id),
  branch_id UUID REFERENCES public.church_branches(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, branch_id)
);

-- Create department_assignments table
CREATE TABLE public.department_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) NOT NULL,
  assigned_date DATE NOT NULL,
  approved_by UUID REFERENCES auth.users(id),
  approved_date DATE,
  status assignment_status DEFAULT 'pending',
  type assignment_type NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  branch_id UUID REFERENCES public.church_branches(id) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  branch_id UUID REFERENCES public.church_branches(id) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create finance_records table
CREATE TABLE public.finance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  member_id UUID REFERENCES public.members(id),
  branch_id UUID REFERENCES public.church_branches(id) NOT NULL,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Create function to check branch access
CREATE OR REPLACE FUNCTION public.has_branch_access(p_branch_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
    user_branch_id UUID;
BEGIN
    -- Super admins have access to all branches
    SELECT role, branch_id INTO user_role, user_branch_id
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN user_role = 'super_admin' OR 
           user_role = 'admin' OR
           (user_role = 'pastor' AND user_branch_id = p_branch_id) OR
           (user_role = 'leader' AND user_branch_id = p_branch_id);
END;
$$;

-- Create function to check if user is baptized
CREATE OR REPLACE FUNCTION public.is_user_baptized()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT is_baptized FROM public.profiles WHERE id = auth.uid();
$$;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for members updated_at
CREATE TRIGGER update_members_updated_at
BEFORE UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for first_timers updated_at
CREATE TRIGGER update_first_timers_updated_at
BEFORE UPDATE ON public.first_timers
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for departments updated_at
CREATE TRIGGER update_departments_updated_at
BEFORE UPDATE ON public.departments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for department_assignments updated_at
CREATE TRIGGER update_department_assignments_updated_at
BEFORE UPDATE ON public.department_assignments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for events updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for finance_records updated_at
CREATE TRIGGER update_finance_records_updated_at
BEFORE UPDATE ON public.finance_records
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role, is_baptized)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'member'),
    COALESCE((NEW.raw_user_meta_data->>'is_baptized')::boolean, false)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.church_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.first_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for church_branches
CREATE POLICY "Branches are viewable by authenticated users"
ON public.church_branches FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage branches"
ON public.church_branches FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for members
CREATE POLICY "Baptized users can view members in their branch"
ON public.members FOR SELECT
TO authenticated
USING (
  public.is_user_baptized() AND 
  public.has_branch_access(branch_id)
);

CREATE POLICY "Leaders can manage members in their branch"
ON public.members FOR ALL
TO authenticated
USING (
  (public.has_role(auth.uid(), 'super_admin') OR 
   public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'pastor') OR 
   public.has_role(auth.uid(), 'leader')) AND
  public.has_branch_access(branch_id)
)
WITH CHECK (
  (public.has_role(auth.uid(), 'super_admin') OR 
   public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'pastor') OR 
   public.has_role(auth.uid(), 'leader')) AND
  public.has_branch_access(branch_id)
);

-- RLS Policies for children
CREATE POLICY "Users can view children of viewable members"
ON public.children FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members
    WHERE id = member_id
    AND public.is_user_baptized()
    AND public.has_branch_access(branch_id)
  )
);

CREATE POLICY "Leaders can manage children"
ON public.children FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'pastor') OR 
  public.has_role(auth.uid(), 'leader')
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'pastor') OR 
  public.has_role(auth.uid(), 'leader')
);

-- RLS Policies for first_timers
CREATE POLICY "Baptized users can view first timers in their branch"
ON public.first_timers FOR SELECT
TO authenticated
USING (
  public.is_user_baptized() AND 
  public.has_branch_access(branch_id)
);

CREATE POLICY "Leaders can manage first timers in their branch"
ON public.first_timers FOR ALL
TO authenticated
USING (
  (public.has_role(auth.uid(), 'super_admin') OR 
   public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'pastor') OR 
   public.has_role(auth.uid(), 'leader')) AND
  public.has_branch_access(branch_id)
)
WITH CHECK (
  (public.has_role(auth.uid(), 'super_admin') OR 
   public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'pastor') OR 
   public.has_role(auth.uid(), 'leader')) AND
  public.has_branch_access(branch_id)
);

-- RLS Policies for departments
CREATE POLICY "Users can view departments in their branch"
ON public.departments FOR SELECT
TO authenticated
USING (public.has_branch_access(branch_id));

CREATE POLICY "Admins can manage departments"
ON public.departments FOR ALL
TO authenticated
USING (
  (public.has_role(auth.uid(), 'super_admin') OR 
   public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'pastor')) AND
  public.has_branch_access(branch_id)
)
WITH CHECK (
  (public.has_role(auth.uid(), 'super_admin') OR 
   public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'pastor')) AND
  public.has_branch_access(branch_id)
);

-- RLS Policies for department_assignments
CREATE POLICY "Users can view assignments in their branch"
ON public.department_assignments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members
    WHERE id = member_id
    AND public.has_branch_access(branch_id)
  )
);

CREATE POLICY "Leaders can manage assignments"
ON public.department_assignments FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'pastor') OR 
  public.has_role(auth.uid(), 'leader')
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'pastor') OR 
  public.has_role(auth.uid(), 'leader')
);

-- RLS Policies for events
CREATE POLICY "Users can view events in their branch"
ON public.events FOR SELECT
TO authenticated
USING (public.has_branch_access(branch_id));

CREATE POLICY "Leaders can manage events"
ON public.events FOR ALL
TO authenticated
USING (
  (public.has_role(auth.uid(), 'super_admin') OR 
   public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'pastor') OR 
   public.has_role(auth.uid(), 'leader')) AND
  public.has_branch_access(branch_id)
)
WITH CHECK (
  (public.has_role(auth.uid(), 'super_admin') OR 
   public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'pastor') OR 
   public.has_role(auth.uid(), 'leader')) AND
  public.has_branch_access(branch_id)
);

-- RLS Policies for attendance
CREATE POLICY "Users can view attendance in their branch"
ON public.attendance FOR SELECT
TO authenticated
USING (public.has_branch_access(branch_id));

CREATE POLICY "Leaders can manage attendance"
ON public.attendance FOR ALL
TO authenticated
USING (
  (public.has_role(auth.uid(), 'super_admin') OR 
   public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'pastor') OR 
   public.has_role(auth.uid(), 'leader')) AND
  public.has_branch_access(branch_id)
)
WITH CHECK (
  (public.has_role(auth.uid(), 'super_admin') OR 
   public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'pastor') OR 
   public.has_role(auth.uid(), 'leader')) AND
  public.has_branch_access(branch_id)
);

-- RLS Policies for finance_records
CREATE POLICY "Admins can view finance records in their branch"
ON public.finance_records FOR SELECT
TO authenticated
USING (
  (public.has_role(auth.uid(), 'super_admin') OR 
   public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'pastor')) AND
  public.has_branch_access(branch_id)
);

CREATE POLICY "Admins can manage finance records"
ON public.finance_records FOR ALL
TO authenticated
USING (
  (public.has_role(auth.uid(), 'super_admin') OR 
   public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'pastor')) AND
  public.has_branch_access(branch_id)
)
WITH CHECK (
  (public.has_role(auth.uid(), 'super_admin') OR 
   public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'pastor')) AND
  public.has_branch_access(branch_id)
);

-- Insert default main branch
INSERT INTO public.church_branches (name, slug, address, phone, pastor_name, is_main)
VALUES ('Beccle St Branch (Main)', 'beccle-st', 'Beccle Street, London', '+44 20 1234 5678', 'Pastor John Williams', true);

-- Create a function to help create users with profiles
CREATE OR REPLACE FUNCTION public.create_user_with_profile(
  email TEXT,
  password TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  is_baptized BOOLEAN,
  branch_slug TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  branch_id UUID;
  user_meta_data JSONB;
  full_name TEXT;
BEGIN
  -- Get branch ID
  SELECT id INTO branch_id FROM public.church_branches WHERE slug = branch_slug LIMIT 1;
  
  -- Create auth user
  user_id := extensions.uuid_generate_v4();
  full_name := first_name || ' ' || last_name;
  
  -- Prepare user_meta_data
  user_meta_data := jsonb_build_object(
    'first_name', first_name,
    'last_name', last_name,
    'avatar_url', '',
    'full_name', full_name,
    'role', role,
    'is_baptized', is_baptized,
    'branch_slug', branch_slug
  );

  -- Insert into auth.users (using raw SQL to bypass RLS)
  EXECUTE format('
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      %L, %L, %L, %L, %L, %L,
      NOW(), NOW(), NOW(),
      %L::jsonb, %L::jsonb, NOW(), NOW()
    )',
    '00000000-0000-0000-0000-000000000000', -- instance_id
    user_id,                                -- id
    'authenticated',                        -- aud
    'authenticated',                        -- role
    email,                                  -- email
    crypt(password, gen_salt('bf')),        -- encrypted_password
    '{"provider":"email","providers":["email"]}',  -- raw_app_meta_data
    user_meta_data::text                    -- raw_user_meta_data
  );

  -- Insert profile
  INSERT INTO public.profiles (
    id, first_name, last_name, branch_id, role, is_baptized
  ) VALUES (
    user_id, first_name, last_name, branch_id, role, is_baptized
  );

  RETURN user_id;
END;
$$;