import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Search, Bell, Heart, Plus, Filter, MapPin } from 'lucide-react';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { MALTA_LOCATIONS, SPECIES } from '@/lib/constants';
import { formatDate } from '@/lib/heatCycleUtils';

interface SavedSearch {
  id: string;
  name: string;
  criteria: any;
  notify_on_match: boolean;
  match_count?: number;
}

interface Listing {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  status: string;
  created_at: string;
  pets: {
    name: string;
    species: string;
    breed: string;
    photos: string[];
  };
  users: {
    name: string;
    role: string;
    is_international: boolean;
  };
}

interface Waitlist {
  id: string;
  position: number;
  status: string;
  litters: {
    id: string;
    expected_whelping: string;
    status: string;
    pets: {
      name: string;
    };
    deposits: Array<{
      status: string;
      amount: number;
    }>;
  };
}

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [waitlists, setWaitlists] = useState<Waitlist[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    species: '',
    breed: '',
    location: '',
    priceMax: '',
    includeInternational: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBuyerData();
    }
  }, [user]);

  const loadBuyerData = async () => {
    try {
      const { data: searchesData } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user?.id);

      setSavedSearches(searchesData || []);

      const { data: listingsData } = await supabase
        .from('listings')
        .select(`
          *,
          pets(name, species, breed, photos),
          users(name, role, is_international)
        `)
        .eq('status', 'live')
        .order('created_at', { ascending: false })
        .limit(20);

      setListings(listingsData || []);

      const { data: waitlistsData } = await supabase
        .from('waitlists')
        .select(`
          *,
          litters(
            id,
            expected_whelping,
            status,
            pets(name),
            deposits(status, amount)
          )
        `)
        .eq('user_id', user?.id)
        .order('joined_at', { ascending: false });

      setWaitlists(waitlistsData || []);
    } catch (error) {
      console.error('Error loading buyer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSavedSearch = async () => {
    if (!filters.species && !filters.breed && !filters.location) {
      alert('Please set at least one filter');
      return;
    }

    const searchName = `${filters.species || 'Any'} ${filters.breed || ''} ${filters.location ? `in ${filters.location}` : ''}`.trim();

    try {
      const { error } = await supabase.from('saved_searches').insert({
        user_id: user?.id,
        name: searchName,
        criteria: filters,
        notify_on_match: true,
      });

      if (error) throw error;
      setShowFilterModal(false);
      loadBuyerData();
    } catch (error) {
      console.error('Error creating saved search:', error);
    }
  };

  const deleteSavedSearch = async (searchId: string) => {
    try {
      const { error } = await supabase.from('saved_searches').delete().eq('id', searchId);

      if (error) throw error;
      loadBuyerData();
    } catch (error) {
      console.error('Error deleting saved search:', error);
    }
  };

  const filteredListings = listings.filter((listing) => {
    if (filters.species && listing.pets?.species !== filters.species) return false;
    if (filters.breed && listing.pets?.breed !== filters.breed) return false;
    if (filters.location && listing.location !== filters.location) return false;
    if (filters.priceMax && listing.price > parseInt(filters.priceMax) * 100) return false;
    if (!filters.includeInternational && listing.users?.is_international) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Discover Pets</h1>
          <NotificationCenter />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {waitlists.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Waitlists</h2>
            <div className="space-y-3">
              {waitlists.map((waitlist) => {
                const deposit = waitlist.litters?.deposits?.[0];
                return (
                  <div key={waitlist.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{waitlist.litters?.pets?.name}'s Litter</h3>
                        <p className="text-sm text-gray-600">
                          Expected: {formatDate(waitlist.litters?.expected_whelping)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Position</p>
                          <p className="text-2xl font-bold text-orange-500">#{waitlist.position}</p>
                        </div>
                        {deposit && (
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              deposit.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {deposit.status === 'paid' ? 'Deposit Paid' : 'Deposit Pending'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {savedSearches.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Saved Searches</h2>
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium"
              >
                <Plus className="w-5 h-5" />
                New Search
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savedSearches.map((search) => (
                <div key={search.id} className="border rounded-lg p-4 hover:border-orange-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-gray-400" />
                      <h3 className="font-semibold text-gray-900">{search.name}</h3>
                    </div>
                    {search.notify_on_match && <Bell className="w-4 h-4 text-orange-500" />}
                  </div>
                  <button
                    onClick={() => deleteSavedSearch(search.id)}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Available Pets</h2>
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No listings found matching your criteria</p>
              </div>
            ) : (
              filteredListings.map((listing) => (
                <div key={listing.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 relative">
                    {listing.pets?.photos && listing.pets.photos.length > 0 ? (
                      <img
                        src={listing.pets.photos[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    {listing.users?.is_international && (
                      <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        International
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{listing.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {listing.pets?.breed} • {listing.pets?.species}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-orange-500">
                        €{(listing.price / 100).toFixed(0)}
                      </span>
                      <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Filter & Save Search</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                <select
                  value={filters.species}
                  onChange={(e) => setFilters({ ...filters, species: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Any</option>
                  {SPECIES.map((species) => (
                    <option key={species} value={species}>
                      {species}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <input
                  type="text"
                  value={filters.breed}
                  onChange={(e) => setFilters({ ...filters, breed: e.target.value })}
                  placeholder="e.g., Golden Retriever"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Malta</option>
                  {MALTA_LOCATIONS.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (€)</label>
                <input
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                  placeholder="e.g., 1000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeInternational"
                  checked={filters.includeInternational}
                  onChange={(e) => setFilters({ ...filters, includeInternational: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                />
                <label htmlFor="includeInternational" className="text-sm text-gray-700">
                  Include international breeders
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createSavedSearch}
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Save Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
