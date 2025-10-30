import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { MALTA_LOCATIONS, COUNTRIES } from '@/lib/constants';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    first_name: '',
    username: '',
    location: '',
    country: 'Malta',
    avatar_url: '',
  });

  useEffect(() => {
    loadUserRole();
  }, [user]);

  const loadUserRole = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user?.id)
        .maybeSingle();

      if (data?.role) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error loading role:', error);
    }
  };

  const isBreeder = userRole === 'breeder_registered' || userRole === 'breeder_independent';

  const handleNext = () => {
    if (currentStep === 1 && !formData.first_name) {
      alert('Please enter your first name');
      return;
    }
    if (currentStep === 2 && !formData.location) {
      alert('Please select your location');
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('public').getPublicUrl(filePath);
      setFormData({ ...formData, avatar_url: data.publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const updateData: any = {
        first_name: formData.first_name,
        username: formData.username || null,
        location: formData.location,
        country: formData.country,
        avatar_url: formData.avatar_url || null,
        is_international: formData.country !== 'Malta',
        onboarding_completed: true,
      };

      const { error } = await supabase
        .from('users')
        .update(updateData)
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
      <div className="max-w-lg w-full">
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What should we call you?</h2>
                <p className="text-gray-600 mb-6">Just your first name is fine!</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="e.g., Maria"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username (Optional)
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  placeholder="e.g., maria_breeder"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-sm text-gray-500 mt-1">Optional. Others can find you by username.</p>
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
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Add a profile photo</h2>
                <p className="text-gray-600 mb-6">Help others recognize you (optional)</p>
              </div>

              <div className="flex flex-col items-center">
                {formData.avatar_url ? (
                  <div className="relative">
                    <img
                      src={formData.avatar_url}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-orange-100"
                    />
                    <button
                      onClick={() => setFormData({ ...formData, avatar_url: '' })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                <label className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer font-medium">
                  {uploading ? 'Uploading...' : 'Choose Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>

                <p className="text-sm text-gray-500 mt-4 text-center">
                  You can skip this and add a photo later in your profile
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={saving || uploading}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Saving...' : currentStep === totalSteps ? 'Complete' : 'Continue'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            You can always update these details later in your profile
          </p>
        </div>
      </div>
    </div>
  );
}
