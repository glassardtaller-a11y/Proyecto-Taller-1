-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Platforms Table
create table platforms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  is_active boolean default true,
  monthly_price numeric,
  yearly_price numeric,
  logo_url text,
  created_at timestamptz default now()
);

-- Customers Table
create table customers (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text,
  email text,
  created_at timestamptz default now()
);

-- Sales Table
create type plan_type as enum ('MONTHLY', 'YEARLY', 'CUSTOM_RANGE');

create table sales (
  id uuid primary key default uuid_generate_v4(),
  platform_id uuid references platforms(id) not null,
  customer_id uuid references customers(id) not null,
  sale_date date not null default current_date,
  payment_method text,
  plan plan_type not null,
  start_date date,
  end_date date,
  next_charge_date date,
  price numeric not null,
  status text default 'ACTIVE',
  created_at timestamptz default now()
);

-- Reminders Table
create table reminders (
  id uuid primary key default uuid_generate_v4(),
  sale_id uuid references sales(id) not null,
  due_at date not null,
  kind text default 'PAYMENT_DUE',
  is_sent boolean default false,
  sent_at timestamptz
);

-- RLS (Row Level Security) - basic setup for now, open access as per simple requirements but good practice to enable
alter table platforms enable row level security;
alter table customers enable row level security;
alter table sales enable row level security;
alter table reminders enable row level security;

create policy "Enable all access for now" on platforms for all using (true);
create policy "Enable all access for now" on customers for all using (true);
create policy "Enable all access for now" on sales for all using (true);
create policy "Enable all access for now" on reminders for all using (true);
