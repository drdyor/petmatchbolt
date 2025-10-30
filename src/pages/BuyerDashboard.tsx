import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Heart, MessageCircle, Filter, X } from 'lucide-react';
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
  price: number;
  energy_level: string;
  size: string;
  owner: {
    first_name: string;
    location: string;
    distance?: number;
  };
}

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [breeds, setBreeds] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    species: 'all',
    breed: 'all',
    size: 'all',
    temperament: 'all',
    energyLevel: 'all',
    maxPrice: 10000,
  });

  useEffect(() => {
    loadPets();
    loadBreeds();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [pets, searchQuery, filters]);

  const loadBreeds = async () => {
    try {
      const { data, error } = await supabase
        .from('breeds')
        .select('*')
        .order('species')
        .order('full_name');

      if (error) throw error;
      setBreeds(data || []);
    } catch (error) {
      console.error('Error loading breeds:', error);
    }
  };

  const loadPets = async () => {
    try {
      const { data: petsData, error } = await supabase
        .from('pets')
        .select(`
          *,
          owner:users!pets_owner_id_fkey(first_name, location)
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate distances (simplified - using hardcoded Malta locations)
      const petsWithDistance = petsData?.map(pet => ({
        ...pet,
        owner: {
          ...pet.owner,
          distance: calculateDistance(pet.owner.location),
        },
      })) || [];

      // Sort by distance initially
      petsWithDistance.sort((a, b) => (a.owner.distance || 0) - (b.owner.distance || 0));

      setPets(petsWithDistance);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (location: string) => {
    // Simplified distance calculation for Malta
    const distances: { [key: string]: number } = {
      'Valletta': 0,
      'Sliema': 3,
      'St. Julians': 4,
      'Gzira': 3,
      'Msida': 2,
      'Birkirkara': 5,
      'Mosta': 8,
      'Mdina': 10,
      'Rabat': 11,
      'Marsa': 2,
    };
    return distances[location] || Math.floor(Math.random() * 15);
  };

  const applyFilters = () => {
    let filtered = [...pets];

    if (searchQuery) {
      filtered = filtered.filter(
        pet =>
          pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.species !== 'all') {
      filtered = filtered.filter(pet => pet.species === filters.species);
    }

    if (filters.breed !== 'all') {
      filtered = filtered.filter(pet => pet.breed === filters.breed);
    }

    if (filters.size !== 'all') {
      filtered = filtered.filter(pet => pet.size === filters.size);
    }

    if (filters.energyLevel !== 'all') {
      filtered = filtered.filter(pet => pet.energy_level === filters.energyLevel);
    }

    filtered = filtered.filter(pet => pet.price <= filters.maxPrice);

    setFilteredPets(filtered);
  };

  const availableBreeds = breeds.filter(b =>
    filters.species === 'all' || b.species === filters.species
  );
  return (
    <div className="min-h-screen bg-white">
      <Navigation userRole="buyer" />

      {/* Hero Search Section */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Find your perfect companion</h1>
          <p className="text-lg text-gray-600 mb-8">
            Discover pets from trusted breeders across Malta
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by breed or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-base border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-b border-gray-100 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Species <span className="text-orange-500">*</span>
                </label>
                <select
                  value={filters.species}
                  onChange={(e) => setFilters({ ...filters, species: e.target.value, breed: 'all' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                >
                  <option value="all">🐾 All Pets</option>
                  <option value="dog">🐕 Dogs</option>
                  <option value="cat">🐈 Cats</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                <select
                  value={filters.breed}
                  onChange={(e) => setFilters({ ...filters, breed: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={filters.species === 'all'}
                >
                  <option value="all">All Breeds</option>
                  {availableBreeds.map(breed => (
                    <option key={breed.id} value={breed.full_name}>{breed.full_name}</option>
                  ))}
                </select>
                {filters.species === 'all' && (
                  <p className="text-xs text-gray-500 mt-1">Select species first</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <select
                  value={filters.size}
                  onChange={(e) => setFilters({ ...filters, size: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Sizes</option>
                  <option value="teacup">Teacup</option>
                  <option value="toy">Toy</option>
                  <option value="miniature">Miniature</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="giant">Giant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Energy Level</label>
                <select
                  value={filters.energyLevel}
                  onChange={(e) => setFilters({ ...filters, energyLevel: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Levels</option>
                  <option value="low">Low Energy</option>
                  <option value="medium">Medium Energy</option>
                  <option value="high">High Energy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price: €{filters.maxPrice}
                </label>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="100"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Loading pets...</p>
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pets found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{filteredPets.length}</span> pets available
              </p>
              <span className="text-sm text-gray-500">Sorted by distance</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPets.map((pet) => (
                <div
                  key={pet.id}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                  onClick={() => alert(`View ${pet.name}'s details (coming soon)`)}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={pet.image_url}
                      alt={pet.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('Added to favorites!');
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                    >
                      <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
                    </button>
                    {pet.owner.distance !== undefined && (
                      <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-900 shadow-lg">
                        <MapPin className="w-4 h-4 inline mr-1 text-orange-500" />
                        {pet.owner.distance} km away
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{pet.name}</h3>
                        <p className="text-sm text-gray-600">{pet.breed}</p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-lg font-bold text-orange-600">€{pet.price}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                      {pet.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                        {pet.age < 1 ? `${Math.round(pet.age * 12)} months` : `${pet.age} years`}
                      </span>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium capitalize">
                        {pet.gender}
                      </span>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium capitalize">
                        {pet.size}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-600">{pet.owner.first_name} • {pet.owner.location}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/messages');
                        }}
                        className="p-2 hover:bg-orange-50 rounded-full transition-colors"
                      >
                        <MessageCircle className="w-5 h-5 text-orange-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
