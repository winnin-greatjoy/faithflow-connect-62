-- Allow users to update their own member record by matching email
CREATE POLICY "Users can update their own member record"
ON public.members
FOR UPDATE
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);