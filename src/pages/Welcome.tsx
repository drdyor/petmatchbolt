import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="bg-orange-500 p-6 rounded-full">
            <Heart className="w-16 h-16 text-white" fill="white" />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-gray-900 mb-4">PawMatch</h1>
        <p className="text-xl text-gray-700 mb-12">
          Malta's Premier Pet Breeding & Adoption Platform
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/sign-up')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl transition-colors"
          >
            Get Started
          </button>

          <button
            onClick={() => navigate('/sign-in')}
            className="w-full bg-white hover:bg-gray-50 text-orange-500 font-semibold py-4 rounded-xl border-2 border-orange-500 transition-colors"
          >
            Sign In
          </button>
        </div>

        <p className="mt-8 text-sm text-gray-600">
          Connect with breeders, shelters, and find your perfect companion
        </p>
      </div>
    </div>
  );
}
