-- Demo Data Seed Script
-- Run this manually in Supabase SQL Editor

-- First, we need to create auth users manually through the Supabase dashboard
-- or use the Admin API. For now, we'll just create the user records assuming
-- auth users exist.

-- Create demo profiles
-- NOTE: You must first create these users through Supabase Auth dashboard
-- Email: maria.azzopardi@maltabreeders.mt, Password: Demo123!
-- Email: john.camilleri@goldenpawsmalta.com, Password: Demo123!
-- Email: sophie.vella@malteseheaven.mt, Password: Demo123!
-- Email: info@adoptdontshop.mt, Password: Demo123!

-- Demo Pets for Maria Azzopardi (Golden Retrievers)
-- Demo Pets for John Camilleri (Maltese Dogs)
-- Demo Pets for Sophie Vella (Poodles)
-- Demo listings for Animal Welfare Malta

-- Example INSERT for when auth users are created:
/*
INSERT INTO users (id, email, name, role, location, country, whatsapp_number, is_international, onboarding_completed, profile_visibility, show_location, show_whatsapp, show_email)
SELECT
  id,
  email,
  CASE email
    WHEN 'maria.azzopardi@maltabreeders.mt' THEN 'Maria Azzopardi'
    WHEN 'john.camilleri@goldenpawsmalta.com' THEN 'John Camilleri'
    WHEN 'sophie.vella@malteseheaven.mt' THEN 'Sophie Vella'
    WHEN 'info@adoptdontshop.mt' THEN 'Animal Welfare Malta'
  END as name,
  CASE email
    WHEN 'maria.azzopardi@maltabreeders.mt' THEN 'breeder_registered'
    WHEN 'john.camilleri@goldenpawsmalta.com' THEN 'breeder_independent'
    WHEN 'sophie.vella@malteseheaven.mt' THEN 'breeder_registered'
    WHEN 'info@adoptdontshop.mt' THEN 'shelter'
  END as role,
  CASE email
    WHEN 'maria.azzopardi@maltabreeders.mt' THEN 'Valletta'
    WHEN 'john.camilleri@goldenpawsmalta.com' THEN 'Sliema'
    WHEN 'sophie.vella@malteseheaven.mt' THEN 'Mdina'
    WHEN 'info@adoptdontshop.mt' THEN 'Marsa'
  END as location,
  'Malta' as country,
  CASE email
    WHEN 'maria.azzopardi@maltabreeders.mt' THEN '+35679123456'
    WHEN 'john.camilleri@goldenpawsmalta.com' THEN '+35679234567'
    WHEN 'sophie.vella@malteseheaven.mt' THEN '+35679345678'
    WHEN 'info@adoptdontshop.mt' THEN '+35621224196'
  END as whatsapp_number,
  false as is_international,
  true as onboarding_completed,
  'public' as profile_visibility,
  true as show_location,
  true as show_whatsapp,
  CASE email
    WHEN 'info@adoptdontshop.mt' THEN true
    ELSE false
  END as show_email
FROM auth.users
WHERE email IN ('maria.azzopardi@maltabreeders.mt', 'john.camilleri@goldenpawsmalta.com', 'sophie.vella@malteseheaven.mt', 'info@adoptdontshop.mt')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  location = EXCLUDED.location,
  whatsapp_number = EXCLUDED.whatsapp_number,
  onboarding_completed = EXCLUDED.onboarding_completed;
*/
