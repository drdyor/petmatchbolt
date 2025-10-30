import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get demo breeder IDs
    const { data: breeders } = await supabase
      .from('users')
      .select('id, first_name, location')
      .in('email', [
        'maria.azzopardi@maltabreeders.mt',
        'john.camilleri@goldenpawsmalta.com',
        'sophie.vella@malteseheaven.mt',
      ]);

    if (!breeders || breeders.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Demo breeders not found. Run create-demo-users first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pets = [
      // Maria's Golden Retrievers (Valletta)
      {
        owner_id: breeders.find(b => b.first_name === 'Maria')?.id,
        name: 'Luna',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 0.2,
        gender: 'female',
        description: 'Beautiful golden retriever puppy with champion bloodlines. Health tested parents, excellent temperament. Perfect family companion.',
        image_url: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800',
        status: 'available',
        price: 1200,
        health_status: 'healthy',
        vaccinated: true,
        energy_level: 'high',
        size: 'large'
      },
      {
        owner_id: breeders.find(b => b.first_name === 'Maria')?.id,
        name: 'Max',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 0.3,
        gender: 'male',
        description: 'Playful and affectionate golden retriever puppy. Great with kids and other pets. Ready for his forever home!',
        image_url: 'https://images.unsplash.com/photo-1612536720032-b48d17c36f75?w=800',
        status: 'available',
        price: 1200,
        health_status: 'healthy',
        vaccinated: true,
        energy_level: 'high',
        size: 'large'
      },
      // John's Maltese Dogs (Sliema)
      {
        owner_id: breeders.find(b => b.first_name === 'John')?.id,
        name: 'Bella',
        species: 'dog',
        breed: 'Maltese',
        age: 0.4,
        gender: 'female',
        description: 'Adorable Maltese puppy with silky white coat. Perfect lap dog, hypoallergenic. Great for apartments.',
        image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
        status: 'available',
        price: 800,
        health_status: 'healthy',
        vaccinated: true,
        energy_level: 'mid',
        size: 'small'
      },
      {
        owner_id: breeders.find(b => b.first_name === 'John')?.id,
        name: 'Charlie',
        species: 'dog',
        breed: 'Maltese',
        age: 0.5,
        gender: 'male',
        description: 'Sweet-natured Maltese boy looking for a loving family. Well socialized and playful.',
        image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
        status: 'available',
        price: 800,
        health_status: 'healthy',
        vaccinated: true,
        energy_level: 'mid',
        size: 'small'
      },
      // Sophie's Poodles (Mdina)
      {
        owner_id: breeders.find(b => b.first_name === 'Sophie')?.id,
        name: 'Coco',
        species: 'dog',
        breed: 'Standard Poodle',
        age: 0.3,
        gender: 'female',
        description: 'Elegant standard poodle puppy. Highly intelligent, easy to train. Hypoallergenic coat, perfect for families.',
        image_url: 'https://images.unsplash.com/photo-1616016023859-2beb7efa9f5e?w=800',
        status: 'available',
        price: 1000,
        health_status: 'healthy',
        vaccinated: true,
        energy_level: 'mid',
        size: 'large'
      },
      {
        owner_id: breeders.find(b => b.first_name === 'Sophie')?.id,
        name: 'Oscar',
        species: 'dog',
        breed: 'Miniature Poodle',
        age: 0.4,
        gender: 'male',
        description: 'Charming miniature poodle with lots of personality. Perfect size for any home, very affectionate.',
        image_url: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800',
        status: 'available',
        price: 900,
        health_status: 'healthy',
        vaccinated: true,
        energy_level: 'mid',
        size: 'medium'
      },
      {
        owner_id: breeders.find(b => b.first_name === 'Maria')?.id,
        name: 'Daisy',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 0.2,
        gender: 'female',
        description: 'Sweet golden girl with gorgeous coat. From health-tested parents. Will make wonderful family pet.',
        image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
        status: 'available',
        price: 1200,
        health_status: 'healthy',
        vaccinated: true,
        energy_level: 'high',
        size: 'large'
      },
      {
        owner_id: breeders.find(b => b.first_name === 'John')?.id,
        name: 'Milo',
        species: 'dog',
        breed: 'Maltese',
        age: 0.3,
        gender: 'male',
        description: 'Tiny bundle of joy! This little Maltese is ready to steal your heart. Perfect companion dog.',
        image_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
        status: 'available',
        price: 800,
        health_status: 'healthy',
        vaccinated: true,
        energy_level: 'mid',
        size: 'small'
      },
    ];

    // Insert pets
    const { data: insertedPets, error: petsError } = await supabase
      .from('pets')
      .insert(pets)
      .select();

    if (petsError) throw petsError;

    // Create listings for all pets
    const listings = insertedPets?.map(pet => ({
      pet_id: pet.id,
      seller_id: pet.owner_id,
      status: 'active',
      views: Math.floor(Math.random() * 50) + 10,
    }));

    const { error: listingsError } = await supabase
      .from('listings')
      .insert(listings);

    if (listingsError) throw listingsError;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${insertedPets?.length} demo pets`,
        pets: insertedPets?.length,
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