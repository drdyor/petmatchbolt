import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Home, Plus, Edit2, Trash2, Heart, MessageCircle, Phone, Mail } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  description: string;
  image_url: string;
  status: string;
  adoption_fee: number;
}

export default function ShelterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPets: 0,
    available: 0,
    adopted: 0,
    inquiries: 0,
  });

  useEffect(() => {
    loadPets();
    loadStats();
  }, []);

  const loadPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data: allPets } = await supabase
        .from('pets')
        .select('status')
        .eq('owner_id', user?.id);

      const { data: messages } = await supabase
        .from('conversations')
        .select('id')
        .or(`participant_1.eq.${user?.id},participant_2.eq.${user?.id}`);

      const total = allPets?.length || 0;
      const available = allPets?.filter(p => p.status === 'available').length || 0;
      const adopted = allPets?.filter(p => p.status === 'sold').length || 0;

      setStats({
        totalPets: total,
        available,
        adopted,
        inquiries: messages?.length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole="shelter" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Shelter Dashboard</h1>
              <p className="text-gray-600">Manage your rescue animals and adoptions</p>
            </div>
            <button
              onClick={() => alert('Add pet functionality coming soon')}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add New Pet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Pets</h3>
                <Home className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPets}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Available</h3>
                <Heart className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.available}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Adopted</h3>
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.adopted}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Inquiries</h3>
                <MessageCircle className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.inquiries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Rescue Animals</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <p>Loading pets...</p>
            </div>
          ) : pets.length === 0 ? (
            <div className="p-12 text-center">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No pets yet</h3>
              <p className="text-gray-600 mb-6">Add your first rescue animal to get started</p>
              <button
                onClick={() => alert('Add pet functionality coming soon')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Pet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {pets.map((pet) => (
                <div key={pet.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  {pet.image_url && (
                    <img
                      src={pet.image_url}
                      alt={pet.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{pet.name}</h3>
                        <p className="text-sm text-gray-600">{pet.breed} • {pet.age} years</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        pet.status === 'available' ? 'bg-green-100 text-green-700' :
                        pet.status === 'sold' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {pet.status === 'sold' ? 'Adopted' : pet.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pet.description}</p>

                    {pet.adoption_fee > 0 && (
                      <p className="text-lg font-bold text-orange-600 mb-3">
                        €{pet.adoption_fee} adoption fee
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/messages')}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <MessageCircle className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">View Messages</p>
                  <p className="text-sm text-gray-600">Respond to adoption inquiries</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
                <Phone className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">Contact Information</p>
                  <p className="text-sm text-gray-600">+356 2122 4196</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">info@adoptdontshop.mt</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Adoption Tips</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-bold">1</span>
                </div>
                <p>Screen potential adopters carefully to ensure good matches</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-bold">2</span>
                </div>
                <p>Keep pet profiles updated with recent photos and health information</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-bold">3</span>
                </div>
                <p>Follow up with adopters after placement to ensure successful transitions</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <p>Maintain detailed records of vaccinations and medical history</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
