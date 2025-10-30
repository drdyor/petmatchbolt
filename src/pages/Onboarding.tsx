import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { MALTA_LOCATIONS, COUNTRIES } from '@/lib/constants';

interface OnboardingData {
  name: string;
  location: string;
  country: string;
  whatsapp_number: string;
  avatar_url: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    location: '',
    country: 'Malta',
    whatsapp_number: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (location.state?.role) {
      setUserRole(location.state.role);
    }
  }, [location.state]);

  const isBreeder = userRole === 'breeder_registered' || userRole === 'breeder_independent';
  const totalSteps = isBreeder ? 4 : 3;

  const handleNext = () => {
    if (currentStep === 1 && !formData.name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (currentStep === 2 && !formData.location) {
      alert('Please select your location');
      return;
    }
    if (currentStep === 3 && isBreeder && !formData.whatsapp_number.trim()) {
      alert('Please enter your WhatsApp number for video calls');
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const isInternational = formData.country !== 'Malta';

      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          location: formData.location,
          country: formData.country,
          whatsapp_number: formData.whatsapp_number,
          avatar_url: formData.avatar_url,
          is_international: isInternational,
          onboarding_completed: true,
        })
        .eq('id', user?.id);

      if (error) throw error;

      if (isBreeder) {
        navigate('/breeder', { replace: true });
      } else if (userRole === 'buyer') {
        navigate('/buyer', { replace: true });
      } else if (userRole === 'shelter') {
        navigate('/shelter', { replace: true });
      } else if (userRole === 'vet') {
        navigate('/vet', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to save your information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Welcome to PawMatch!</h1>
              <span className="text-sm font-medium text-gray-500">
                Step {currentStep} of {totalSteps}
              </span>
            </div>

            <div className="flex gap-2">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    idx < currentStep ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your name?</h2>
                <p className="text-gray-600 mb-6">Help others know who you are</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo (Optional)
                </label>
                <input
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-sm text-gray-500 mt-1">You can add this later</p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Where are you located?</h2>
                <p className="text-gray-600 mb-6">This helps connect you with local pets</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value, location: '' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.country === 'Malta' ? 'Location in Malta' : 'City / Region'}
                </label>
                {formData.country === 'Malta' ? (
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                  >
                    <option value="">Select your location</option>
                    {MALTA_LOCATIONS.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter your city or region"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                  />
                )}
              </div>

              {formData.country !== 'Malta' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <strong>International Breeder:</strong> You'll be marked as an international breeder,
                    making it easy for buyers to find you across borders.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && isBreeder && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Enable video calls</h2>
                <p className="text-gray-600 mb-6">
                  Connect with buyers through WhatsApp video calls
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  placeholder="+356XXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Include country code (e.g., +356 for Malta, +39 for Italy)
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Why WhatsApp?</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Buyers can request video calls directly from messages</li>
                  <li>• Show pets in real-time to interested buyers</li>
                  <li>• Build trust with face-to-face conversations</li>
                  <li>• Your number is only visible to users you're messaging with</li>
                </ul>
              </div>
            </div>
          )}

          {((currentStep === 3 && !isBreeder) || (currentStep === 4 && isBreeder)) && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
                <p className="text-gray-600 mb-6">
                  Your profile is ready. Let's start your PawMatch journey!
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-900">
                    {formData.location}, {formData.country}
                  </span>
                </div>
                {isBreeder && formData.whatsapp_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">WhatsApp:</span>
                    <span className="font-medium text-gray-900">{formData.whatsapp_number}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}

            {currentStep < totalSteps && (
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            )}

            {currentStep === totalSteps && (
              <button
                onClick={handleComplete}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Get Started'}
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          You can always update these details later in your profile
        </p>
      </div>
    </div>
  );
}
