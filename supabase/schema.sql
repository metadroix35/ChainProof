-- ChainProof Supabase Schema

-- Users table
CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE public.files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    file_hash TEXT UNIQUE NOT NULL,
    file_name TEXT,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proofs table
CREATE TABLE public.proofs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    file_hash TEXT REFERENCES public.files(file_hash) ON DELETE CASCADE,
    tx_hash TEXT UNIQUE,
    contract_address TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;

-- Policies for Users (Public Can Create/Read conditionally if needed, simplify for now)
CREATE POLICY "Users can insert their own wallet" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read their own data" ON public.users FOR SELECT USING (true);

-- Policies for Files
CREATE POLICY "Allow public inserts for files" ON public.files FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public reads for files" ON public.files FOR SELECT USING (true);

-- Policies for Proofs
CREATE POLICY "Allow public inserts for proofs" ON public.proofs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public reads for proofs" ON public.proofs FOR SELECT USING (true);
