-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE,
  whatsapp_number TEXT,
  university TEXT,
  state TEXT,
  role TEXT NOT NULL DEFAULT 'novice' CHECK (role IN ('novice', 'apprentice', 'pro', 'mentor', 'admin')),
  level INTEGER NOT NULL DEFAULT 1,
  xp_points INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  wallet_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_earned DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  bvn_verified BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url TEXT,
  fiverr_username TEXT,
  upwork_profile_url TEXT,
  referral_code TEXT UNIQUE DEFAULT substring(md5(random()::text), 1, 8),
  referred_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Skill tracks
CREATE TABLE public.tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('copywriting', 'design', 'video', 'data_entry', 'affiliate', 'social_media')),
  description TEXT NOT NULL,
  full_description TEXT,
  duration_days INTEGER NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  thumbnail_url TEXT,
  preview_video_url TEXT,
  avg_earning_naira DECIMAL(10,2) DEFAULT 0,
  enrolled_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily tasks within tracks
CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  submission_type TEXT NOT NULL DEFAULT 'text' CHECK (submission_type IN ('text', 'file', 'link', 'image')),
  grading_rubric JSONB NOT NULL DEFAULT '{}',
  max_score INTEGER NOT NULL DEFAULT 100,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  naira_reward DECIMAL(8,2) DEFAULT 0,
  resources JSONB DEFAULT '[]',
  is_peer_reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(track_id, day_number)
);

-- User track enrollments
CREATE TABLE public.enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'dropped')),
  current_day INTEGER NOT NULL DEFAULT 1,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, track_id)
);

-- User task submissions
CREATE TABLE public.user_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES public.tracks(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'graded', 'approved', 'rejected')),
  submission_content TEXT,
  submission_url TEXT,
  ai_score DECIMAL(5,2),
  ai_feedback JSONB,
  peer_reviews JSONB DEFAULT '[]',
  final_score DECIMAL(5,2),
  attempts INTEGER NOT NULL DEFAULT 0,
  xp_awarded INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- Gig marketplace
CREATE TABLE public.gigs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget_naira DECIMAL(10,2) NOT NULL,
  platform_fee_naira DECIMAL(10,2) NOT NULL DEFAULT 0,
  deadline_hours INTEGER NOT NULL DEFAULT 48,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'submitted', 'in_review', 'approved', 'disputed', 'paid', 'cancelled')),
  assigned_to UUID REFERENCES public.profiles(id),
  requirements TEXT NOT NULL,
  deliverables TEXT NOT NULL,
  min_level TEXT DEFAULT 'novice',
  min_score DECIMAL(5,2) DEFAULT 0,
  escrow_reference TEXT,
  escrow_held BOOLEAN DEFAULT FALSE,
  dispute_reason TEXT,
  arbiter_ruling TEXT,
  client_rating INTEGER CHECK (client_rating BETWEEN 1 AND 5),
  client_review TEXT,
  assigned_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gig applications
CREATE TABLE public.gig_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  gig_id UUID REFERENCES public.gigs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pitch TEXT NOT NULL,
  proposed_timeline_hours INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(gig_id, user_id)
);

-- Wallet transactions
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gig_earning', 'withdrawal', 'subscription', 'bonus', 'refund', 'escrow_hold', 'escrow_release', 'platform_fee')),
  amount_naira DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  reference TEXT UNIQUE NOT NULL,
  paystack_reference TEXT,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Withdrawal requests
CREATE TABLE public.withdrawals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount_naira DECIMAL(12,2) NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  paystack_transfer_code TEXT,
  failure_reason TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Leaderboard snapshots (weekly)
CREATE TABLE public.leaderboard_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  total_earned_naira DECIMAL(12,2) DEFAULT 0,
  gigs_completed INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  xp_gained INTEGER DEFAULT 0,
  rank INTEGER,
  university TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('task', 'gig', 'payment', 'streak', 'level_up', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- B2B clients (companies that post bulk gigs)
CREATE TABLE public.b2b_clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  industry TEXT,
  monthly_budget_naira DECIMAL(12,2),
  contract_type TEXT CHECK (contract_type IN ('one_off', 'monthly_retainer', 'project_based')),
  is_verified BOOLEAN DEFAULT FALSE,
  total_paid_naira DECIMAL(12,2) DEFAULT 0,
  gigs_posted INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles are publicly viewable for leaderboard" ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Tracks are publicly viewable" ON public.tracks FOR SELECT USING (is_published = true);

CREATE POLICY "Tasks viewable by enrolled users" ON public.tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.enrollments WHERE user_id = auth.uid() AND track_id = tasks.track_id)
);

CREATE POLICY "Users manage own enrollments" ON public.enrollments FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own task submissions" ON public.user_tasks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Open gigs are publicly viewable" ON public.gigs FOR SELECT USING (status = 'open' OR client_id = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Users view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own withdrawals" ON public.withdrawals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Useful indexes
CREATE INDEX idx_user_tasks_user_id ON public.user_tasks(user_id);
CREATE INDEX idx_user_tasks_task_id ON public.user_tasks(task_id);
CREATE INDEX idx_gigs_status ON public.gigs(status);
CREATE INDEX idx_gigs_category ON public.gigs(category);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, is_read);

-- Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
