-- Make your account an admin (run once after admin-migration.sql)
-- Replace the email with the one you used to sign up on BuildAfrica.

update public.profiles
set role = 'admin'
where email = 'YOUR_EMAIL@example.com';
