-- Create payments table
create table if not exists public.payments (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    amount decimal(10,2) not null,
    status text not null,
    payment_date timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.payments enable row level security;

-- Create policy to allow users to view their own payments
create policy "Users can view their own payments"
    on public.payments for select
    using (auth.uid() = user_id);

-- Create policy to allow users to insert their own payments
create policy "Users can insert their own payments"
    on public.payments for insert
    with check (auth.uid() = user_id); 