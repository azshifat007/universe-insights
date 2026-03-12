
CREATE TABLE public.notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'Announcement',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Anyone can read active notices
CREATE POLICY "Anyone can read active notices"
ON public.notices FOR SELECT TO public
USING (is_active = true);

-- Admins can read all notices
CREATE POLICY "Admins can read all notices"
ON public.notices FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert notices
CREATE POLICY "Admins can insert notices"
ON public.notices FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update notices
CREATE POLICY "Admins can update notices"
ON public.notices FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete notices
CREATE POLICY "Admins can delete notices"
ON public.notices FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
