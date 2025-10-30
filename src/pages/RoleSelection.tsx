import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Building2, Dog, Home, User, Stethoscope } from 'lucide-react';

const roles = [
  {
    id: 'breeder_registered',
    title: 'Registered Breeder',
    description: 'Professional kennel with multiple breeding programs',
    icon: Building2,
    color: 'bg-blue-500',
  },
  {
    id: 'breeder_independent',
    title: 'Independent Breeder',
    description: 'Hobby breeder in Malta with occasional litters',
    icon: Dog,
    color: 'bg-green-500',
  },
  {
    id: 'shelter',
    title: 'Shelter / Rescue',
    description: 'Animal shelter or rescue organization',
    icon: Home,
    color: 'bg-amber-500',
  },
  {
    id: 'buyer',
    title: 'Pet Seeker',
    description: 'Looking for a pet to adopt or purchase',
    icon: User,
    color: 'bg-orange-500',
  },
  {
    id: 'vet',
    title: 'Veterinarian',
    description: 'Veterinary professional',
    icon: Stethoscope,
    color: 'bg-red-500',
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleRoleSelect = async (roleId: string) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: roleId })
        .eq('id', user.id);

      if (error) throw error;

      navigate('/onboarding', { state: { role: roleId }, replace: true });
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to save role. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to PawMatch</h1>
          <p className="text-lg text-gray-600">Choose your role to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              disabled={saving}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className={`${role.color} w-14 h-14 rounded-full flex items-center justify-center mb-4`}>
                <role.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{role.title}</h3>
              <p className="text-sm text-gray-600">{role.description}</p>
            </button>
          ))}
        </div>

        {saving && (
          <div className="text-center mt-8">
            <p className="text-gray-600">Saving your selection...</p>
          </div>
        )}
      </div>
    </div>
  );
}
