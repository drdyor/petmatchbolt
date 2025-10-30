# PawMatch - Role-Based Features Guide

This document details the unique features and capabilities for each user role in PawMatch.

## 🏠 Breeder Dashboards

### Registered Breeder & Independent Breeder

**Core Features:**
- **Heat Cycle Tracking**: Visual heat rings showing cycle progress, days until next heat
- **Female Pet Management**: Add, edit, and track breeding females
- **Litter Management**: Create litters, track puppies/kittens, manage waitlists
- **Waitlist System**: Buyers can join waitlists for specific litters
- **Heat Notifications**: Automatic reminders when pets enter heat
- **Video Calls**: WhatsApp integration for buyer video tours
- **Privacy Controls**: Toggle visibility of location, WhatsApp, email

**Dashboard Sections:**
1. Active Heat Cycles (with visual progress rings)
2. Recent Activity Feed
3. Upcoming Heat Predictions
4. Litter Management
5. Waitlist Overview
6. Quick Actions (messages, add female, new litter)

**Unique to Registered Breeders:**
- Enhanced credibility badge
- Multiple breeding program support
- Extended pedigree tracking (coming soon)

**Unique to Independent Breeders:**
- Simplified interface for occasional litters
- Focus on single-breed operations

---

## 🛒 Buyer Dashboard

**Core Features:**
- **Pet Discovery**: Browse available pets with advanced filters
- **Saved Searches**: Auto-match notifications when new pets match preferences
- **Waitlist Management**: Track your waitlist positions
- **Breeder Communication**: Direct messaging with breeders
- **Favorite Pets**: Save pets you're interested in
- **Filter Options**:
  - Energy Level (Relaxed, Mid-Energy, High Energy)
  - Age Preference (Puppy, 3-6 years, 7+ years)
  - Size (XS-Small, Medium, Large-XL)
  - Activities (Outdoor Play, Indoor Play, Trails, Swimming, etc.)
  - Gender preference

**Dashboard Sections:**
1. Active Searches & Matches
2. Waitlist Status
3. Saved Pets
4. Recent Messages
5. Recommended Matches

---

## 🏥 Shelter Dashboard

**Core Features:**
- **Rescue Animal Inventory**: Comprehensive pet management
- **Adoption Tracking**: Monitor adoption status and inquiries
- **Statistics Dashboard**:
  - Total pets in shelter
  - Available for adoption
  - Successfully adopted
  - Current inquiries
- **Public Contact Information**: Share phone, email, location openly
- **Inquiry Management**: Track and respond to adoption requests
- **Pet Status Updates**: Available, Pending, Adopted

**Dashboard Sections:**
1. Key Statistics (4 metric cards)
2. Rescue Animals Grid (with photos, details, status)
3. Quick Actions (messages, contact info)
4. Adoption Tips & Guidelines
5. Recent Activity

**Special Features:**
- Multi-location support for shelter branches
- Bulk pet management tools
- Adoption fee tracking
- Foster program support (coming soon)

---

## 🩺 Veterinarian Dashboard

**Core Features:**
- **Appointment Management**:
  - Today's appointments
  - Weekly schedule
  - Appointment types: Checkup, Vaccination, Surgery, Emergency
  - Status tracking: Scheduled, Completed, Cancelled
- **Vaccination Tracking**:
  - Automatic due date calculations
  - Reminder system for breeders
  - Vaccination history per pet
- **Breeder Relationships**: Register breeders as clients
- **Patient Records**: Comprehensive pet health records
- **Notification System**: Send vaccination reminders to breeders

**Dashboard Sections:**
1. Statistics (Today, This Week, Registered Breeders, Vaccines Due)
2. Upcoming Appointments Calendar
3. Vaccination Reminders (next 7 days)
4. Quick Actions
5. Recent Activity Log

**Special Features:**
- Clinic profile management
- Multi-vet support
- Automated reminder sending
- Health history tracking
- Appointment notes and follow-ups

**Notification Flow:**
1. Vet adds vaccination record with due date
2. System monitors approaching due dates
3. Vet can send reminder to breeder
4. Breeder receives in-app notification
5. Breeder can book appointment directly

---

## 🔄 Role Switching

All users can switch roles through their Profile → Account Settings:

**How It Works:**
1. Navigate to Profile page
2. Scroll to "Account Settings"
3. Click "Switch Role"
4. Select new role from available options
5. System redirects to appropriate dashboard

**Use Cases:**
- Breeder who also adopts pets (switch to buyer)
- Shelter volunteer who breeds at home
- Vet who also breeds (dual role)

---

## 💬 Universal Features (All Roles)

### Messaging System
- Direct messages between users
- WhatsApp discovery (find users by phone number)
- Invite non-users via WhatsApp
- Conversation history
- Real-time messaging

### Notifications
- In-app notification center
- Bell icon with unread count
- Notification types:
  - Heat cycle reminders
  - Waitlist updates
  - New messages
  - Vaccination reminders
  - Saved search matches
  - Appointment confirmations

### Privacy Controls
- Profile visibility: Public, Friends Only, Private
- Toggles for:
  - Show Location
  - Show WhatsApp Number
  - Show Email
- Real-time privacy updates
- No save button needed

### Profile Management
- Name, location, country
- WhatsApp number (for video calls)
- Profile photo
- Bio/description
- Contact preferences

---

## 🌍 International Support

**Supported Countries:**
- Malta (with specific location dropdown)
- 20+ countries including:
  - Italy, United Kingdom, Germany, France
  - Spain, Netherlands, Belgium, Austria
  - And more...

**Features:**
- Auto-detection of international breeders
- Location-based search and filtering
- Multi-currency support (coming soon)
- Language localization (coming soon)

---

## 🔐 Security Features

### Row Level Security (RLS)
- All tables protected with RLS policies
- Users can only access their own data
- Public profiles respect privacy settings
- Secure message conversations

### Authentication
- Email/password authentication via Supabase
- Secure session management
- Password reset flow
- Email verification

### Privacy First
- GDPR compliant design
- User control over data visibility
- Secure WhatsApp integration
- No public email exposure by default

---

## 📱 Mobile Responsive

All dashboards are fully responsive:
- Touch-optimized buttons (larger targets)
- Mobile navigation drawer
- Responsive grid layouts
- Mobile-first design approach
- Smooth animations and transitions

---

## 🎯 Coming Soon

### Phase 2 Features:
- Payment processing for deposits
- Contract generation and e-signatures
- Extended pedigree management
- Health guarantee tracking
- Review and rating system
- Foster program for shelters
- Breeder verification system
- Advanced search AI matching

### Phase 3 Features:
- Mobile apps (iOS/Android)
- Video messaging
- Group conversations
- Event calendar (shows, meet-ups)
- Breeder education portal
- Multi-language support
