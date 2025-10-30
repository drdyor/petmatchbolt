import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, PawPrint, LogOut, Plus } from 'lucide-react';

export default function Home() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-full">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">PawMatch</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to PawMatch</h2>
          <p className="text-gray-600">Signed in as: {user?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <PawPrint className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Discover Pets</h3>
            <p className="text-gray-600 mb-4">Browse available pets for breeding or adoption</p>
            <button className="text-orange-500 hover:text-orange-600 font-medium">
              Browse Now →
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Add Your Pet</h3>
            <p className="text-gray-600 mb-4">Register your pet and connect with seekers</p>
            <button className="text-orange-500 hover:text-orange-600 font-medium">
              Add Pet →
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Messages</h3>
            <p className="text-gray-600 mb-4">Connect with breeders and shelters</p>
            <button className="text-orange-500 hover:text-orange-600 font-medium">
              View Messages →
            </button>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Featured Pets</h3>
          <p className="mb-6">Discover the latest pets available in Malta</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="bg-white/20 h-32 rounded-lg mb-3 flex items-center justify-center">
                <PawPrint className="w-12 h-12 text-white/50" />
              </div>
              <h4 className="font-semibold mb-1">Golden Retriever</h4>
              <p className="text-sm text-white/80">2 years old • Valletta</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="bg-white/20 h-32 rounded-lg mb-3 flex items-center justify-center">
                <PawPrint className="w-12 h-12 text-white/50" />
              </div>
              <h4 className="font-semibold mb-1">Persian Cat</h4>
              <p className="text-sm text-white/80">1 year old • Sliema</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="bg-white/20 h-32 rounded-lg mb-3 flex items-center justify-center">
                <PawPrint className="w-12 h-12 text-white/50" />
              </div>
              <h4 className="font-semibold mb-1">Labrador Mix</h4>
              <p className="text-sm text-white/80">3 years old • St. Julian's</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
