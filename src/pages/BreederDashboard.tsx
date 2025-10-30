import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { PawPrint, Plus, Calendar, Bell, MessageCircle, Heart, AlertCircle } from 'lucide-react';
import HeatRing from '@/components/heat/HeatRing';
import Navigation from '@/components/layout/Navigation';
import { calculateHeatCycleData, getDaysUntil, formatDate } from '@/lib/heatCycleUtils';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  sex: string;
  photos: string[];
  heat_events: any[];
  latest_bleed?: string | null;
}

interface Litter {
  id: string;
  mother_pet_id: string;
  expected_whelping: string;
  status: string;
  waitlists: any[];
  pets: { name: string };
}

interface Stats {
  totalPets: number;
  activeListings: number;
  unreadMessages: number;
  upcomingFertile: number;
  pendingDeposits: number;
}

export default function BreederDashboard() {
  const { user } = useAuth();
  const [femalePets, setFemalePets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [upcomingLitters, setUpcomingLitters] = useState<Litter[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalPets: 0,
    activeListings: 0,
    unreadMessages: 0,
    upcomingFertile: 0,
    pendingDeposits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select(`
          *,
          heat_events(*)
        `)
        .eq('owner_id', user?.id)
        .eq('sex', 'F')
        .order('name');

      if (petsError) throw petsError;

      const femalesWithLatestEvent = petsData?.map((pet) => {
        const bleedEvents = pet.heat_events
          ?.filter((e: any) => e.event_type === 'bleed')
          .sort((a: any, b: any) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

        return {
          ...pet,
          latest_bleed: bleedEvents?.[0]?.event_date || null,
        };
      }) || [];

      setFemalePets(femalesWithLatestEvent);

      if (femalesWithLatestEvent.length > 0 && !selectedPetId) {
        setSelectedPetId(femalesWithLatestEvent[0].id);
      }

      const upcomingFertileCount = femalesWithLatestEvent.filter((pet: any) => {
        if (!pet.latest_bleed) return false;
        const cycleData = calculateHeatCycleData(new Date(pet.latest_bleed));
        return cycleData.daysUntilFertile !== null && cycleData.daysUntilFertile <= 7;
      }).length;

      const { data: littersData } = await supabase
        .from('litters')
        .select(`
          *,
          pets!litters_mother_pet_id_fkey(name),
          waitlists(*)
        `)
        .in('status', ['expected', 'born'])
        .order('expected_whelping');

      setUpcomingLitters(littersData || []);

      const { count: totalPetsCount } = await supabase
        .from('pets')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user?.id);

      const { count: activeListingsCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user?.id)
        .eq('status', 'live');

      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('id, participant_1, participant_2')
        .or(`participant_1.eq.${user?.id},participant_2.eq.${user?.id}`);

      let unreadCount = 0;
      if (conversationsData) {
        for (const conv of conversationsData) {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('read', false)
            .neq('sender_id', user?.id);
          unreadCount += count || 0;
        }
      }

      const { count: pendingDepositsCount } = await supabase
        .from('deposits')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalPets: totalPetsCount || 0,
        activeListings: activeListingsCount || 0,
        unreadMessages: unreadCount,
        upcomingFertile: upcomingFertileCount,
        pendingDeposits: pendingDepositsCount || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedPet = femalePets.find((p) => p.id === selectedPetId);
  const selectedPetCycleData = selectedPet?.latest_bleed
    ? calculateHeatCycleData(new Date(selectedPet.latest_bleed))
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation userRole="breeder_independent" />
        <div className="flex items-center justify-center h-[calc(100vh-57px)]">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const userRole = user?.user_metadata?.role || 'breeder_independent';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole={userRole} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPets}</p>
              </div>
              <PawPrint className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fertile Soon</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingFertile}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Deposits</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingDeposits}</p>
              </div>
              <Bell className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Heat Cycle Hub</h2>
            <button className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
              <Plus className="w-5 h-5" />
              Add Female
            </button>
          </div>

          {femalePets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <PawPrint className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No female pets added yet</p>
              <p className="text-sm mt-2">Add your first female to start tracking heat cycles</p>
            </div>
          ) : (
            <>
              <div className="flex gap-4 overflow-x-auto pb-4 mb-6">
                {femalePets.map((pet) => {
                  const lastBleed = pet.latest_bleed ? new Date(pet.latest_bleed) : null;
                  return (
                    <button
                      key={pet.id}
                      onClick={() => setSelectedPetId(pet.id)}
                      className={`flex-shrink-0 w-32 p-4 rounded-lg border-2 transition-all ${
                        selectedPetId === pet.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="mb-2">
                        {pet.photos && pet.photos.length > 0 ? (
                          <img
                            src={pet.photos[0]}
                            alt={pet.name}
                            className="w-16 h-16 mx-auto rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                            <PawPrint className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-sm text-center mb-2">{pet.name}</p>
                      <div className="flex justify-center">
                        <HeatRing lastBleedDate={lastBleed} size="small" showLabel={false} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedPet && selectedPetCycleData && (
                <div className="border-t pt-6">
                  <div className="flex items-start gap-8">
                    <div className="flex-shrink-0">
                      <HeatRing
                        lastBleedDate={selectedPet.latest_bleed ? new Date(selectedPet.latest_bleed) : null}
                        size="large"
                        showLabel={true}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedPet.name}</h3>
                      <p className="text-gray-600 mb-4">
                        {selectedPet.breed} • {selectedPet.species}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Cycle Day</p>
                          <p className="text-xl font-bold text-gray-900">
                            {selectedPetCycleData.currentDay > 0 ? `Day ${selectedPetCycleData.currentDay}` : 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Status</p>
                          <p className="text-xl font-bold capitalize text-gray-900">
                            {selectedPetCycleData.cycleStatus.replace('-', ' ')}
                          </p>
                        </div>
                      </div>

                      {selectedPetCycleData.isFertile && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 text-green-700">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-semibold">In Fertile Window!</span>
                          </div>
                          <p className="text-sm text-green-600 mt-1">
                            {selectedPetCycleData.daysLeftInFertile} day(s) remaining in optimal breeding window
                          </p>
                        </div>
                      )}

                      {selectedPetCycleData.daysUntilFertile && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 text-amber-700">
                            <Calendar className="w-5 h-5" />
                            <span className="font-semibold">Fertile Window Approaching</span>
                          </div>
                          <p className="text-sm text-amber-600 mt-1">
                            {selectedPetCycleData.daysUntilFertile} day(s) until fertile window begins
                          </p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                          Log Event
                        </button>
                        <button className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                          View Timeline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {upcomingLitters.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Litters</h2>
            <div className="space-y-4">
              {upcomingLitters.map((litter) => {
                const daysUntil = getDaysUntil(litter.expected_whelping);
                return (
                  <div key={litter.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{litter.pets?.name}'s Litter</h3>
                        <p className="text-sm text-gray-600">
                          Expected: {formatDate(litter.expected_whelping)} ({daysUntil} days)
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Waitlist</p>
                          <p className="font-semibold text-gray-900">{litter.waitlists?.length || 0} people</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            litter.status === 'expected'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {litter.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
