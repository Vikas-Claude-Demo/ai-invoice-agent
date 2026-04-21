-- =============================================
-- AI Invoice Processing Agent - Supabase Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'ap_clerk' check (role in ('admin', 'manager', 'ap_clerk')),
  created_at timestamptz default now()
);

-- Vendors
create table public.vendors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  gstin text,
  bank_name text,
  bank_account text,
  bank_ifsc text,
  created_at timestamptz default now()
);

-- Purchase Orders
create table public.purchase_orders (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references public.vendors(id),
  po_number text not null unique,
  po_date date,
  expected_delivery date,
  line_items jsonb default '[]',
  total_amount numeric(12,2),
  status text default 'open' check (status in ('open', 'received', 'closed', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- GRNs (Goods Receipt Notes)
create table public.grns (
  id uuid primary key default uuid_generate_v4(),
  po_id uuid references public.purchase_orders(id),
  grn_number text not null unique,
  received_date date,
  items_received jsonb default '[]',
  status text default 'received' check (status in ('received', 'partial', 'matched')),
  notes text,
  created_at timestamptz default now()
);

-- Invoices
create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references public.vendors(id),
  invoice_number text,
  invoice_date date,
  po_number text,
  total numeric(12,2),
  source text not null check (source in ('email', 'upload')),
  status text not null default 'received' check (
    status in ('received','processing','extracted','matched','exception','approved','posted','rejected')
  ),
  raw_file_url text,
  original_filename text,
  extracted_data jsonb,
  gmail_message_id text unique,
  sender_email text,
  email_subject text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Line Items
create table public.line_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references public.invoices(id) on delete cascade,
  description text,
  qty numeric(10,3),
  rate numeric(12,2),
  amount numeric(12,2),
  tax numeric(12,2) default 0,
  created_at timestamptz default now()
);

-- Invoice Matches
create table public.invoice_matches (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references public.invoices(id) on delete cascade,
  grn_id uuid references public.grns(id),
  po_id uuid references public.purchase_orders(id),
  match_score numeric(4,3),
  match_status text check (match_status in ('auto_matched','partial','unmatched','exception')),
  created_at timestamptz default now()
);

-- Exceptions
create table public.exceptions (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references public.invoices(id) on delete cascade,
  reason text not null,
  assigned_to uuid references public.users(id),
  resolved_by uuid references public.users(id),
  resolution_notes text,
  status text default 'open' check (status in ('open','resolved','rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notifications
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  message text not null,
  type text not null,
  invoice_id uuid references public.invoices(id) on delete cascade,
  read boolean default false,
  created_at timestamptz default now()
);

-- ERP Entries (AP Ledger)
create table public.erp_entries (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references public.invoices(id) on delete cascade,
  journal_entry jsonb not null,
  status text default 'posted' check (status in ('posted','reversed')),
  posted_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Audit Logs
create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references public.invoices(id),
  action text not null,
  performed_by uuid references public.users(id),
  details jsonb,
  created_at timestamptz default now()
);

-- =============================================
-- Auto-update updated_at triggers
-- =============================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger invoices_updated_at before update on public.invoices
  for each row execute function update_updated_at();

create trigger exceptions_updated_at before update on public.exceptions
  for each row execute function update_updated_at();

-- =============================================
-- Auto-create user profile on signup
-- =============================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'ap_clerk')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================
-- Row Level Security
-- =============================================

alter table public.users enable row level security;
alter table public.vendors enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.grns enable row level security;
alter table public.invoices enable row level security;
alter table public.line_items enable row level security;
alter table public.invoice_matches enable row level security;
alter table public.exceptions enable row level security;
alter table public.notifications enable row level security;
alter table public.erp_entries enable row level security;
alter table public.audit_logs enable row level security;

-- Authenticated users can read all business data
create policy "authenticated_read" on public.vendors for select to authenticated using (true);
create policy "authenticated_read" on public.purchase_orders for select to authenticated using (true);
create policy "authenticated_read" on public.grns for select to authenticated using (true);
create policy "authenticated_read" on public.invoices for select to authenticated using (true);
create policy "authenticated_read" on public.line_items for select to authenticated using (true);
create policy "authenticated_read" on public.invoice_matches for select to authenticated using (true);
create policy "authenticated_read" on public.exceptions for select to authenticated using (true);
create policy "authenticated_read" on public.erp_entries for select to authenticated using (true);
create policy "authenticated_read" on public.audit_logs for select to authenticated using (true);

-- Users can only see their own notifications
create policy "own_notifications" on public.notifications for all to authenticated using (user_id = auth.uid());

-- Service role can do everything (used by backend)
create policy "service_all" on public.vendors for all to service_role using (true);
create policy "service_all" on public.purchase_orders for all to service_role using (true);
create policy "service_all" on public.grns for all to service_role using (true);
create policy "service_all" on public.invoices for all to service_role using (true);
create policy "service_all" on public.line_items for all to service_role using (true);
create policy "service_all" on public.invoice_matches for all to service_role using (true);
create policy "service_all" on public.exceptions for all to service_role using (true);
create policy "service_all" on public.notifications for all to service_role using (true);
create policy "service_all" on public.erp_entries for all to service_role using (true);
create policy "service_all" on public.audit_logs for all to service_role using (true);
create policy "service_all" on public.users for all to service_role using (true);

-- =============================================
-- Storage bucket for invoices
-- =============================================

insert into storage.buckets (id, name, public) values ('invoices', 'invoices', true)
on conflict do nothing;

create policy "invoice_files_public_read" on storage.objects for select using (bucket_id = 'invoices');
create policy "invoice_files_service_write" on storage.objects for insert to service_role with check (bucket_id = 'invoices');
