import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Globe, Edit2, Save, X, Building2, Dog, Home as HomeIcon, Stethoscope } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import { MALTA_LOCATIONS, COUNTRIES } from '@/lib/constants';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  location: string;
  country: string;
  whatsapp_number: string;
  avatar_url: string;
  is_international: boolean;
}

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    country: 'Malta',
    whatsapp_number: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          name: data.name || '',
          location: data.location || '',
          country: data.country || 'Malta',
          whatsapp_number: data.whatsapp_number || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
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
        })
        .eq('id', user?.id);

      if (error) throw error;

      await loadProfile();
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', user?.id);

      if (error) throw error;

      await loadProfile();
      setShowRoleModal(false);

      if (newRole === 'breeder_registered' || newRole === 'breeder_independent') {
        navigate('/breeder');
      } else if (newRole === 'buyer') {
        navigate('/buyer');
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Failed to change role. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'breeder_registered':
        return { icon: Building2, label: 'Registered Breeder', color: 'text-blue-600' };
      case 'breeder_independent':
        return { icon: Dog, label: 'Independent Breeder', color: 'text-green-600' };
      case 'shelter':
        return { icon: HomeIcon, label: 'Shelter / Rescue', color: 'text-amber-600' };
      case 'buyer':
        return { icon: User, label: 'Pet Seeker', color: 'text-orange-600' };
      case 'vet':
        return { icon: Stethoscope, label: 'Veterinarian', color: 'text-red-600' };
      default:
        return { icon: User, label: 'User', color: 'text-gray-600' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation userRole={profile?.role} />
        <div className="flex items-center justify-center h-[calc(100vh-57px)]">
          <div className="text-gray-500">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-57px)]">
          <div className="text-gray-500">Profile not found</div>
        </div>
      </div>
    );
  }

  const roleInfo = getRoleInfo(profile.role);
  const RoleIcon = roleInfo.icon;
  const isBreeder = profile.role === 'breeder_registered' || profile.role === 'breeder_independent';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole={profile.role} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-32" />

          <div className="px-6 pb-6">
            <div className="flex items-start -mt-16 mb-6">
              <div className="relative">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="ml-6 mt-16 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                    <div className={`flex items-center gap-2 mt-1 ${roleInfo.color}`}>
                      <RoleIcon className="w-5 h-5" />
                      <span className="font-medium">{roleInfo.label}</span>
                    </div>
                  </div>

                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            name: profile.name || '',
                            location: profile.location || '',
                            country: profile.country || 'Malta',
                            whatsapp_number: profile.whatsapp_number || '',
                            avatar_url: profile.avatar_url || '',
                          });
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {editing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      Location {formData.country === 'Malta' ? '(Malta)' : ''}
                    </label>
                    {formData.country === 'Malta' ? (
                      <select
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select location</option>
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
                        placeholder="Enter city/region"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    )}
                  </div>

                  {isBreeder && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Number (for video calls)
                      </label>
                      <input
                        type="tel"
                        value={formData.whatsapp_number}
                        onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                        placeholder="+356XXXXXXXX"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Include country code (e.g., +356 for Malta)
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
                    <input
                      type="url"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{profile.location || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Country</p>
                        <p className="font-medium">{profile.country || 'Not set'}</p>
                      </div>
                    </div>

                    {isBreeder && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">WhatsApp</p>
                          <p className="font-medium">
                            {profile.whatsapp_number || 'Not set'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Switch Role
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Switch Role</h3>
            <p className="text-gray-600 mb-6">
              Choose a new role for your account. This will change your dashboard and available features.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { id: 'breeder_registered', label: 'Registered Breeder', icon: Building2, color: 'blue' },
                { id: 'breeder_independent', label: 'Independent Breeder', icon: Dog, color: 'green' },
                { id: 'shelter', label: 'Shelter / Rescue', icon: HomeIcon, color: 'amber' },
                { id: 'buyer', label: 'Pet Seeker', icon: User, color: 'orange' },
                { id: 'vet', label: 'Veterinarian', icon: Stethoscope, color: 'red' },
              ].map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleChange(role.id)}
                    disabled={saving || profile.role === role.id}
                    className={`p-4 border-2 rounded-lg text-left hover:border-${role.color}-500 transition-colors disabled:opacity-50 ${
                      profile.role === role.id ? `border-${role.color}-500 bg-${role.color}-50` : 'border-gray-200'
                    }`}
                  >
                    <Icon className={`w-8 h-8 text-${role.color}-500 mb-2`} />
                    <h4 className="font-semibold text-gray-900">{role.label}</h4>
                    {profile.role === role.id && (
                      <span className="text-xs text-gray-500">Current role</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
