-- Self-service fields + RLS for member transfer requests

ALTER TABLE public.member_transfers
  ADD COLUMN IF NOT EXISTS requested_by UUID,
  ADD COLUMN IF NOT EXISTS notes TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'member_transfers_requested_by_fkey'
  ) THEN
    ALTER TABLE public.member_transfers
      ADD CONSTRAINT member_transfers_requested_by_fkey
      FOREIGN KEY (requested_by)
      REFERENCES auth.users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.member_transfers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to submit transfer requests with their own user id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'member_transfers'
      AND policyname = 'member_transfers_insert_own'
  ) THEN
    CREATE POLICY member_transfers_insert_own
      ON public.member_transfers
      FOR INSERT
      WITH CHECK (
        auth.uid() IS NOT NULL
        AND requested_by = auth.uid()
      );
  END IF;
END $$;

-- Allow authenticated users to read their own transfer requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'member_transfers'
      AND policyname = 'member_transfers_select_own'
  ) THEN
    CREATE POLICY member_transfers_select_own
      ON public.member_transfers
      FOR SELECT
      USING (
        auth.uid() IS NOT NULL
        AND requested_by = auth.uid()
      );
  END IF;
END $$;
