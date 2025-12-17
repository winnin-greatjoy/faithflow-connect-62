CREATE TABLE IF NOT EXISTS public.finance_remittances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.church_branches(id) ON DELETE CASCADE,
  district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL,
  week_start date NOT NULL,
  week_end date NOT NULL,
  offerings numeric NOT NULL DEFAULT 0,
  tithes numeric NOT NULL DEFAULT 0,
  total_due numeric NOT NULL DEFAULT 0,
  proof_path text,
  status text NOT NULL DEFAULT 'pending',
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at timestamptz,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT finance_remittances_week_unique UNIQUE (branch_id, week_start)
);

CREATE TABLE IF NOT EXISTS public.finance_fund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.church_branches(id) ON DELETE CASCADE,
  district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  purpose text NOT NULL,
  attachment_path text,
  status text NOT NULL DEFAULT 'pending',
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_at timestamptz,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_remittances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_fund_requests ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_finance_remittances_updated_at ON public.finance_remittances;
CREATE TRIGGER update_finance_remittances_updated_at
BEFORE UPDATE ON public.finance_remittances
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_finance_fund_requests_updated_at ON public.finance_fund_requests;
CREATE TRIGGER update_finance_fund_requests_updated_at
BEFORE UPDATE ON public.finance_fund_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP POLICY IF EXISTS finance_remittances_select ON public.finance_remittances;
CREATE POLICY finance_remittances_select ON public.finance_remittances
FOR SELECT
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  public.has_branch_access(branch_id) OR
  EXISTS (
    SELECT 1
    FROM public.districts d
    JOIN public.church_branches cb ON cb.district_id = d.id
    WHERE cb.id = finance_remittances.branch_id
    AND d.head_admin_id = auth.uid()
  )
);

DROP POLICY IF EXISTS finance_remittances_insert ON public.finance_remittances;
CREATE POLICY finance_remittances_insert ON public.finance_remittances
FOR INSERT
WITH CHECK (
  public.has_branch_access(branch_id) AND
  NOT public.has_role(auth.uid(), 'super_admin'::public.app_role) AND
  NOT public.has_role(auth.uid(), 'district_admin'::public.app_role)
);

DROP POLICY IF EXISTS finance_remittances_update ON public.finance_remittances;
CREATE POLICY finance_remittances_update ON public.finance_remittances
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  EXISTS (
    SELECT 1
    FROM public.districts d
    JOIN public.church_branches cb ON cb.district_id = d.id
    WHERE cb.id = finance_remittances.branch_id
    AND d.head_admin_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  EXISTS (
    SELECT 1
    FROM public.districts d
    JOIN public.church_branches cb ON cb.district_id = d.id
    WHERE cb.id = finance_remittances.branch_id
    AND d.head_admin_id = auth.uid()
  )
);

DROP POLICY IF EXISTS finance_fund_requests_select ON public.finance_fund_requests;
CREATE POLICY finance_fund_requests_select ON public.finance_fund_requests
FOR SELECT
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  public.has_branch_access(branch_id) OR
  EXISTS (
    SELECT 1
    FROM public.districts d
    JOIN public.church_branches cb ON cb.district_id = d.id
    WHERE cb.id = finance_fund_requests.branch_id
    AND d.head_admin_id = auth.uid()
  )
);

DROP POLICY IF EXISTS finance_fund_requests_insert ON public.finance_fund_requests;
CREATE POLICY finance_fund_requests_insert ON public.finance_fund_requests
FOR INSERT
WITH CHECK (
  public.has_branch_access(branch_id) AND
  NOT public.has_role(auth.uid(), 'super_admin'::public.app_role) AND
  NOT public.has_role(auth.uid(), 'district_admin'::public.app_role)
);

DROP POLICY IF EXISTS finance_fund_requests_update ON public.finance_fund_requests;
CREATE POLICY finance_fund_requests_update ON public.finance_fund_requests
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  EXISTS (
    SELECT 1
    FROM public.districts d
    JOIN public.church_branches cb ON cb.district_id = d.id
    WHERE cb.id = finance_fund_requests.branch_id
    AND d.head_admin_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  EXISTS (
    SELECT 1
    FROM public.districts d
    JOIN public.church_branches cb ON cb.district_id = d.id
    WHERE cb.id = finance_fund_requests.branch_id
    AND d.head_admin_id = auth.uid()
  )
);
