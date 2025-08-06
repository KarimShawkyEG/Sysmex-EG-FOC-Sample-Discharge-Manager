-- Create user_credentials table for login system
CREATE TABLE public.user_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for user_credentials access
CREATE POLICY "Users can view their own credentials" 
ON public.user_credentials 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own credentials" 
ON public.user_credentials 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Enable realtime for all tables (using correct case-sensitive names)
ALTER TABLE public."Invoice_Log" REPLICA IDENTITY FULL;
ALTER TABLE public.client_list REPLICA IDENTITY FULL;
ALTER TABLE public.product_list REPLICA IDENTITY FULL;
ALTER TABLE public.seller_list REPLICA IDENTITY FULL;
ALTER TABLE public.user_credentials REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public."Invoice_Log";
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_list;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_list;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seller_list;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_credentials;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on user_credentials
CREATE TRIGGER update_user_credentials_updated_at
  BEFORE UPDATE ON public.user_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default admin user (password: admin123)
INSERT INTO public.user_credentials (username, password_hash, full_name, role) 
VALUES ('admin', '$2a$10$rOzJqF6vYlCgQhF2qF6vYOqF6vYlCgQhF2qF6vYlCgQhF2qF6vYO', 'Administrator', 'admin');