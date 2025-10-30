# PawMatch Demo Accounts

This document contains instructions for creating demo accounts to showcase the platform.

## Creating Demo Accounts

Since Supabase requires proper authentication, you need to create these accounts through the Supabase Auth interface:

### 1. Maria Azzopardi - Registered Breeder (Golden Retrievers)
- **Email:** maria.azzopardi@maltabreeders.mt
- **Password:** Demo123!
- **Role:** Registered Breeder
- **Location:** Valletta, Malta
- **WhatsApp:** +35679123456
- **Bio:** Professional Golden Retriever breeder with 15+ years experience. Registered with the Malta Kennel Club.

### 2. John Camilleri - Independent Breeder (Maltese Dogs)
- **Email:** john.camilleri@goldenpawsmalta.com
- **Password:** Demo123!
- **Role:** Independent Breeder
- **Location:** Sliema, Malta
- **WhatsApp:** +35679234567
- **Bio:** Hobby breeder specializing in traditional Maltese dogs. Small-scale, family-run operation.

### 3. Sophie Vella - Registered Breeder (Poodles)
- **Email:** sophie.vella@malteseheaven.mt
- **Password:** Demo123!
- **Role:** Registered Breeder
- **Location:** Mdina, Malta
- **WhatsApp:** +35679345678
- **Bio:** Specializing in Standard and Miniature Poodles. Champion bloodlines and health-tested parents.

### 4. Animal Welfare Malta - Shelter
- **Email:** info@adoptdontshop.mt
- **Password:** Demo123!
- **Role:** Shelter / Rescue
- **Location:** Marsa, Malta
- **WhatsApp:** +35621224196
- **Bio:** Official animal welfare organization in Malta. Find your perfect rescue companion!

## Setup Instructions

### Method 1: Sign Up Through the App
1. Go to the sign-up page
2. Use the emails listed above
3. Use password: Demo123!
4. Complete the onboarding flow with the information provided above

### Method 2: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Authentication → Users
3. Click "Add User" for each demo account
4. Use the emails and passwords listed above
5. After creating users, run this SQL in the SQL Editor:

```sql
-- Update user profiles with demo data
-- Replace the UUIDs with the actual user IDs from auth.users

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
```

## Features to Demo

### For Breeders (Maria, John, Sophie):
1. **Heat Tracking**: Add female pets and track their heat cycles
2. **Litter Management**: Create litters and manage waitlists
3. **Video Calls**: Share WhatsApp number for buyer video calls
4. **Messaging**: Connect with potential buyers
5. **Privacy Controls**: Toggle what information is visible

### For Shelter (Animal Welfare Malta):
1. **Rescue Listings**: Post adoptable pets
2. **Public Contact**: Share phone and email openly
3. **Messaging**: Communicate with adopters
4. **Multiple Locations**: Support for various shelter sites

### For All Users:
1. **Profile Management**: Edit details, set privacy preferences
2. **Role Switching**: Demonstrate switching between breeder/buyer/shelter roles
3. **WhatsApp Discovery**: Find contacts by WhatsApp number
4. **Notifications**: In-app notification center
5. **International Support**: Support for 20+ countries

## Privacy Features

Each user can control:
- **Show Location**: Toggle city/region visibility
- **Show WhatsApp**: Share WhatsApp number with connections
- **Show Email**: Make email publicly visible
- **Profile Visibility**: Public, Friends Only, or Private (coming soon)

## Testing Scenarios

1. **New User Onboarding**: Create a new account and complete the multi-step onboarding
2. **Breeder-Buyer Connection**: Message between Maria (breeder) and a buyer account
3. **WhatsApp Discovery**: Search for John by his WhatsApp number
4. **Privacy Toggle**: Change visibility settings and see how profile appears to others
5. **Role Switching**: Switch from buyer to breeder to see different dashboards
