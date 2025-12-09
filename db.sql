-- Create table
CREATE TABLE companions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL,
    color VARCHAR(50),
    style VARCHAR(100),
    bookmarked BOOLEAN DEFAULT FALSE,
    audience VARCHAR(255),
    voice VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE companions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own records"
ON companions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own records"
ON companions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records"
ON companions
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access"
ON companions
TO service_role
USING (true)
WITH CHECK (true);


CREATE POLICY "Users can update their own records"
ON companions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


create table public.profiles (
  id uuid not null,
  updated_at timestamp with time zone null,
  username text null,
  full_name text null,
  avatar_url text null,
  website text null,
  customer_id text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_customer_id_key unique (customer_id),
  constraint profiles_username_key unique (username),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint username_length check ((char_length(username) >= 3))
) TABLESPACE pg_default;

create index IF not exists idx_users_customer_id on public.profiles using btree (customer_id) TABLESPACE pg_default;


create table public.subscriptions (
  id uuid not null default gen_random_uuid (),
  customer_id text not null,
  subscription_id integer not null,
  product_id bigint not null,
  variant_id bigint not null,
  status text not null,
  cancelled boolean null default false,
  renews_at timestamp with time zone null,
  ends_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint subscriptions_pkey primary key (id),
  constraint subscriptions_customer_id_key unique (customer_id),
  constraint subscriptions_customer_id_fkey foreign KEY (customer_id) references profiles (customer_id) on update CASCADE on delete CASCADE,
  constraint subscriptions_variant_id_fkey foreign KEY (variant_id) references products (variant_id) on update CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_renews_at on public.subscriptions using btree (renews_at) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_customer_id on public.subscriptions using btree (customer_id) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_status on public.subscriptions using btree (status) TABLESPACE pg_default;

create trigger update_subscriptions_updated_at BEFORE
update on subscriptions for EACH row
execute FUNCTION update_updated_at_column ();


create table public.products (
  variant_id bigint not null,
  product_id bigint not null,
  name text not null,
  price integer not null,
  constraint products_pkey primary key (variant_id)
) TABLESPACE pg_default;

create index IF not exists idx_products_product_id on public.products using btree (product_id) TABLESPACE pg_default;


-- Create chat_messages table to store conversation history
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  companion_id UUID NOT NULL REFERENCES public.companions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_companion_id ON public.chat_messages(companion_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own chat messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages" ON public.chat_messages
  FOR DELETE USING (auth.uid() = user_id);