-- Seed initial badges and weekly challenges

-- Badges
insert into public.badges (code, name, description) values
('first_streak', 'First Streak', 'Complete your first daily streak'),
('week_warrior', 'Week Warrior', 'Maintain a 7-day streak'),
('month_master', 'Month Master', 'Complete a 30-day streak'),
('journal_keeper', 'Journal Keeper', 'Write 10 journal entries'),
('social_butterfly', 'Social Butterfly', 'Post 5 times in the community'),
('helper', 'Helper', 'Receive 10 reactions on your posts'),
('early_bird', 'Early Bird', 'Join during the first week'),
('referral_champ', 'Referral Champ', 'Refer 5 friends'),
('quest_completer', 'Quest Completer', 'Complete 10 daily quests'),
('community_hero', 'Community Hero', 'Contribute to a community challenge')
on conflict (code) do nothing;

-- Weekly challenge template function
create or replace function create_weekly_challenge()
returns void as $$
declare
  week_start date;
  week_end date;
begin
  -- Calculate current week
  week_start := date_trunc('week', current_date)::date;
  week_end := week_start + interval '6 days';

  -- Only create if one doesn't exist for this week
  if not exists (
    select 1 from public.weekly_challenges
    where week_start = week_start
  ) then
    insert into public.weekly_challenges (week_start, week_end, title, description, xp_reward, target_value, metric)
    values
    (week_start, week_end, 'Weekly Journal Challenge', 'Write 5 journal entries this week', 50, 5, 'journal_entries'),
    (week_start, week_end, 'Community Contributor', 'Post 3 times in the community', 40, 3, 'posts'),
    (week_start, week_end, 'Social Engagement', 'React to 10 posts', 30, 10, 'reactions');
  end if;
end;
$$ language plpgsql;

-- Run weekly challenge creation
select create_weekly_challenge();

-- Create a community challenge
insert into public.community_challenges (title, description, target_value, starts_at, ends_at, reward_xp, is_active)
values
('1000 Journal Entries', 'Let''s write 1000 journal entries together!', 1000, current_date, current_date + interval '30 days', 100, true)
on conflict do nothing;
