# Setting Up Demo Users - Quick Start Guide

## Automatic Demo User Creation

We've created an Edge Function that automatically creates all demo users with one API call!

### Step 1: Call the Demo User Creation Function

From your terminal or using a tool like Postman/Insomnia, make a POST request:

```bash
curl -X POST "https://[YOUR-PROJECT-REF].supabase.co/functions/v1/create-demo-users" \
  -H "Content-Type: application/json"
```

Replace `[YOUR-PROJECT-REF]` with your actual Supabase project reference (found in your project URL).

This will create:
1. **Maria Azzopardi** - Registered Breeder (Valletta)
2. **John Camilleri** - Independent Breeder (Sliema)
3. **Sophie Vella** - Registered Breeder (Mdina)
4. **Animal Welfare Malta** - Shelter (Marsa)
5. **Dr. Joseph Borg** - Veterinarian (St. Julians)

### Step 2: Login Credentials

All demo accounts use the same password: **Demo123!**

**Demo Account Emails:**
- `maria.azzopardi@maltabreeders.mt`
- `john.camilleri@goldenpawsmalta.com`
- `sophie.vella@malteseheaven.mt`
- `info@adoptdontshop.mt`
- `dr.borg@vetcaremalta.com`

### Step 3: Test the Platform

1. **Sign in as a Breeder** (Maria, John, or Sophie):
   - View Heat Tracking dashboard
   - Add female pets
   - Track heat cycles
   - Manage litters and waitlists
   - Message potential buyers

2. **Sign in as Shelter** (Animal Welfare Malta):
   - Comprehensive shelter dashboard
   - Manage rescue animals
   - Track adoptions and inquiries
   - Post available pets
   - Communicate with adopters

3. **Sign in as Vet** (Dr. Joseph Borg):
   - View appointment calendar
   - Manage patient records
   - Track vaccinations
   - Send vaccination reminders to breeders
   - Monitor upcoming appointments

4. **Test Interactions**:
   - Switch between accounts
   - Message between users
   - Find users by WhatsApp number
   - Adjust privacy settings
   - Experience role-specific features

## Manual Setup (Alternative Method)

If the automatic method doesn't work, you can create users manually:

### Via Supabase Dashboard

1. Go to Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter email and password (Demo123!)
4. Confirm email automatically
5. Repeat for each demo user

### Via SQL (After Auth Users Exist)

After creating the auth users, run this SQL to complete their profiles:

```sql
-- Update profiles for demo users
UPDATE users SET
  name = 'Maria Azzopardi',
  role = 'breeder_registered',
  location = 'Valletta',
  country = 'Malta',
  whatsapp_number = '+35679123456',
  is_international = false,
  onboarding_completed = true,
  profile_visibility = 'public',
  show_location = true,
  show_whatsapp = true,
  show_email = false
WHERE email = 'maria.azzopardi@maltabreeders.mt';

UPDATE users SET
  name = 'John Camilleri',
  role = 'breeder_independent',
  location = 'Sliema',
  country = 'Malta',
  whatsapp_number = '+35679234567',
  is_international = false,
  onboarding_completed = true,
  profile_visibility = 'public',
  show_location = true,
  show_whatsapp = true,
  show_email = false
WHERE email = 'john.camilleri@goldenpawsmalta.com';

UPDATE users SET
  name = 'Sophie Vella',
  role = 'breeder_registered',
  location = 'Mdina',
  country = 'Malta',
  whatsapp_number = '+35679345678',
  is_international = false,
  onboarding_completed = true,
  profile_visibility = 'public',
  show_location = true,
  show_whatsapp = true,
  show_email = true
WHERE email = 'sophie.vella@malteseheaven.mt';

UPDATE users SET
  name = 'Animal Welfare Malta',
  role = 'shelter',
  location = 'Marsa',
  country = 'Malta',
  whatsapp_number = '+35621224196',
  is_international = false,
  onboarding_completed = true,
  profile_visibility = 'public',
  show_location = true,
  show_whatsapp = true,
  show_email = true
WHERE email = 'info@adoptdontshop.mt';

UPDATE users SET
  name = 'Dr. Joseph Borg',
  role = 'vet',
  location = 'St. Julians',
  country = 'Malta',
  whatsapp_number = '+35679456789',
  is_international = false,
  onboarding_completed = true,
  profile_visibility = 'public',
  show_location = true,
  show_whatsapp = true,
  show_email = true
WHERE email = 'dr.borg@vetcaremalta.com';

-- Create vet clinic for Dr. Borg
INSERT INTO vet_clinics (vet_user_id, clinic_name, address, phone, email)
SELECT id, 'VetCare Malta', 'St. Julians, Malta', '+35679456789', 'dr.borg@vetcaremalta.com'
FROM users WHERE email = 'dr.borg@vetcaremalta.com'
ON CONFLICT DO NOTHING;
```

## Dashboard Features by Role

### Breeder Dashboard
- Heat cycle tracking with visual rings
- Female pet management
- Litter creation and management
- Waitlist handling
- Buyer messaging
- Video call integration via WhatsApp

### Buyer Dashboard
- Pet browsing and search
- Saved searches with auto-matching
- Waitlist registration
- Breeder messaging
- Filter by preferences

### Shelter Dashboard
- Rescue animal inventory
- Adoption status tracking
- Inquiry management
- Statistics (total pets, available, adopted)
- Quick action buttons
- Adoption tips and guidelines

### Vet Dashboard
- Appointment calendar (today, this week)
- Patient records
- Vaccination tracking
- Automatic reminders for upcoming vaccinations
- Breeder relationship management
- Quick stats and metrics

## Testing Vet Features

### Creating Breeder-Vet Relationships:

```sql
-- Link Maria to Dr. Borg
INSERT INTO breeder_vet_relationships (breeder_id, vet_user_id, clinic_id)
SELECT
  (SELECT id FROM users WHERE email = 'maria.azzopardi@maltabreeders.mt'),
  (SELECT id FROM users WHERE email = 'dr.borg@vetcaremalta.com'),
  (SELECT id FROM vet_clinics WHERE vet_user_id = (SELECT id FROM users WHERE email = 'dr.borg@vetcaremalta.com'))
ON CONFLICT DO NOTHING;
```

### Creating Sample Appointments:

```sql
-- Create appointment for tomorrow
INSERT INTO vet_appointments (pet_id, vet_user_id, breeder_id, appointment_date, appointment_type, status, notes)
SELECT
  (SELECT id FROM pets WHERE owner_id = (SELECT id FROM users WHERE email = 'maria.azzopardi@maltabreeders.mt') LIMIT 1),
  (SELECT id FROM users WHERE email = 'dr.borg@vetcaremalta.com'),
  (SELECT id FROM users WHERE email = 'maria.azzopardi@maltabreeders.mt'),
  NOW() + INTERVAL '1 day',
  'checkup',
  'scheduled',
  'Regular wellness check'
WHERE EXISTS (SELECT 1 FROM pets WHERE owner_id = (SELECT id FROM users WHERE email = 'maria.azzopardi@maltabreeders.mt'));
```

### Creating Sample Vaccinations:

```sql
-- Create vaccination record with upcoming due date
INSERT INTO vaccinations (pet_id, vet_user_id, breeder_id, vaccine_name, date_administered, next_due_date, notes)
SELECT
  (SELECT id FROM pets WHERE owner_id = (SELECT id FROM users WHERE email = 'maria.azzopardi@maltabreeders.mt') LIMIT 1),
  (SELECT id FROM users WHERE email = 'dr.borg@vetcaremalta.com'),
  (SELECT id FROM users WHERE email = 'maria.azzopardi@maltabreeders.mt'),
  'Rabies Booster',
  NOW() - INTERVAL '11 months',
  NOW() + INTERVAL '5 days',
  'Annual rabies vaccination due soon'
WHERE EXISTS (SELECT 1 FROM pets WHERE owner_id = (SELECT id FROM users WHERE email = 'maria.azzopardi@maltabreeders.mt'));
```

## Troubleshooting

### Users Can't Sign In
- Verify email is confirmed in Supabase Auth dashboard
- Check that onboarding_completed is set to true
- Ensure password is exactly: Demo123!

### Wrong Dashboard Shows
- Check the user's role in the users table
- Verify navigation routing in App.tsx
- Try signing out and back in

### No Data Shows
- Run the sample data SQL scripts above
- Check that pets exist for breeders
- Verify relationships are created for vet features

## Support

For issues or questions:
1. Check Supabase logs for errors
2. Verify all migrations ran successfully
3. Check browser console for client-side errors
4. Ensure environment variables are set correctly
