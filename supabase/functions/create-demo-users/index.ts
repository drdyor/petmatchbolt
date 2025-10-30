import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: string;
  location: string;
  country: string;
  whatsapp_number: string;
  clinic_name?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const demoUsers: DemoUser[] = [
      {
        email: 'maria.azzopardi@maltabreeders.mt',
        password: 'Demo123!',
        name: 'Maria Azzopardi',
        role: 'breeder_registered',
        location: 'Valletta',
        country: 'Malta',
        whatsapp_number: '+35679123456',
      },
      {
        email: 'john.camilleri@goldenpawsmalta.com',
        password: 'Demo123!',
        name: 'John Camilleri',
        role: 'breeder_independent',
        location: 'Sliema',
        country: 'Malta',
        whatsapp_number: '+35679234567',
      },
      {
        email: 'sophie.vella@malteseheaven.mt',
        password: 'Demo123!',
        name: 'Sophie Vella',
        role: 'breeder_registered',
        location: 'Mdina',
        country: 'Malta',
        whatsapp_number: '+35679345678',
      },
      {
        email: 'info@adoptdontshop.mt',
        password: 'Demo123!',
        name: 'Animal Welfare Malta',
        role: 'shelter',
        location: 'Marsa',
        country: 'Malta',
        whatsapp_number: '+35621224196',
      },
      {
        email: 'dr.borg@vetcaremalta.com',
        password: 'Demo123!',
        name: 'Dr. Joseph Borg',
        role: 'vet',
        location: 'St. Julians',
        country: 'Malta',
        whatsapp_number: '+35679456789',
        clinic_name: 'VetCare Malta',
      },
    ];

    const createdUsers = [];

    for (const user of demoUsers) {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError);
        continue;
      }

      // Create user profile
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        location: user.location,
        country: user.country,
        whatsapp_number: user.whatsapp_number,
        is_international: false,
        onboarding_completed: true,
        profile_visibility: 'public',
        show_location: true,
        show_whatsapp: true,
        show_email: user.role === 'shelter' || user.role === 'vet',
      });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError);
        continue;
      }

      // If vet, create clinic
      if (user.role === 'vet' && user.clinic_name) {
        await supabase.from('vet_clinics').insert({
          vet_user_id: authData.user.id,
          clinic_name: user.clinic_name,
          address: `${user.location}, Malta`,
          phone: user.whatsapp_number,
          email: user.email,
        });
      }

      createdUsers.push({ email: user.email, id: authData.user.id });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created ${createdUsers.length} demo users`,
        users: createdUsers 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});