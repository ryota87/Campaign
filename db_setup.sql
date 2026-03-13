-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    summary TEXT,
    start_date DATE,
    expiry_date DATE,
    discount_rate NUMERIC,
    discount_amount TEXT,
    max_amount TEXT,
    max_usage TEXT,
    source TEXT NOT NULL DEFAULT 'website',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own campaigns"
    ON public.campaigns FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns"
    ON public.campaigns FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
    ON public.campaigns FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
    ON public.campaigns FOR DELETE
    USING (auth.uid() = user_id);
